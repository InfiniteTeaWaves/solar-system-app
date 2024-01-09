import * as THREE from "https://cdn.skypack.dev/three@0.137";
import * as Utilities from "../utilities.js";
import SpaceRenderer from "./Renderer.js";
import SpaceObjectCreator from "./SpaceCreator.js";
import * as UiElements from "../uiElements.js";
import planetsData from "../../data/planetsData.json";

export default class Scene extends THREE.Scene {
  constructor() {
    super();

    this.camera = Utilities.createCamera();

    this.renderer = new SpaceRenderer(this, this.camera, window); //window

    this.controls = Utilities.createControls(this.camera, this.renderer.domElement);

    this._createLights();

    this._initParameters();
  }

  _initParameters() {
    this.orbitFactor = 0.03;
    this.otherFactor = 0.001;
    this.orbitPhase = {};
    this.otherRotationFactor = 0.01;
    this.rotationPhase = {};
    this.orbitAroundPlanet = {};
    this.previousTime = 0;
    this.deltaTime = 0;
  }

  async createScene() {
    const data = planetsData;

    this.planetData = data.planets;
    this.otherData = data.other;

    this.spaceCreator = new SpaceObjectCreator(this.planetData, this.otherData);
    await this._loadObjects();
  }

  async _loadObjects() {
    var aPromise = [...this._getPlanets(), ...this._getOther()];

    var aResponse = await Promise.all(aPromise);
    var aThreeObjects = [...this._getPlanetCenter(), ...aResponse, ...this._getOrbit()];
    this._addObjectsToScene(aThreeObjects);
  }

  _getPlanetCenter() {
    var oCreator = this.spaceCreator;
    var aPromise = [];
    var aPlanetData = this.planetData;

    for (const planetData of aPlanetData) {
      aPromise.push(oCreator.createGroupCenter(planetData.name));
    }

    return aPromise;
  }

  _getPlanets() {
    var oCreator = this.spaceCreator;
    var aPromise = [];
    var aPlanetData = this.planetData;

    for (const planetData of aPlanetData) {
      aPromise.push(oCreator.createPlanet(planetData.name));
    }

    return aPromise;
  }

  _getOrbit() {
    var oCreator = this.spaceCreator;
    var aOrbits = [];
    var aPlanetData = this.planetData;

    for (const planetData of aPlanetData) {
      const radius = Utilities.calculateDistance(planetData.position.X, planetData.position.Y, planetData.position.Z);
      aOrbits.push(oCreator.createPlanetOrbit(radius, planetData.name + "Orbit"));
    }

    return aOrbits;
  }

  _getOther() {
    var oCreator = this.spaceCreator;
    var aPromise = [];

    aPromise.push(oCreator.createSun());
    aPromise.push(oCreator.createSkybox());
    aPromise.push(oCreator.createSpacestation());
    aPromise.push(oCreator.createMoonGroup());
    aPromise.push(oCreator.createEarthClouds());
    aPromise.push(oCreator.createSaturnRing());

    return aPromise;
  }

  _createLights() {
    const pointLight = new THREE.PointLight(0xfffdee, 800, 3000, 1);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;

    const ambientLight = new THREE.AmbientLight(0x222222, 0.8);

    this.pointLight = pointLight;
    this.ambientLight = ambientLight;

    this.add(this.pointLight);
    this.add(this.ambientLight);
  }

  async _addObjectsToScene(aThreeObjects) {
    var aPlanetData = this.planetData;
    var aOtherData = this.otherData;

    for (const planetData of aPlanetData) {
      this._addPlanetsToScene(planetData, aThreeObjects);
      this._addOrbitToScene(planetData);
    }

    for (const otherData of aOtherData) {
      this._addOtherToScene(otherData, aThreeObjects);
    }
  }

  _addPlanetsToScene(planetData, aThreeObjects) {
    const oCreator = this.spaceCreator;

    const oCenterBase = Utilities.objectFinder(aThreeObjects, planetData.name, "CenterBase");

    const oPlanetBase = Utilities.objectFinder(aThreeObjects, planetData.name, "Base");

    oCreator.addChildToParent(oPlanetBase, oCenterBase);
    this.add(oCenterBase);
  }

  _addOrbitToScene(planetData) {
    const oCreator = this.spaceCreator;
    const oOrbit = Utilities.objectFinder(oCreator.objects, planetData.name, "Orbit");
    // oCreator.addChildToParent(oPlanetBase, oCenterBase);
    this.add(oOrbit);
  }

  _addOtherToScene(oOtherData, aThreeObjects) {
    var oOther = {};
    var oEarthBase = Utilities.objectFinder(aThreeObjects, "Earth", "CenterBase");

    switch (oOtherData.name) {
      case "Sun":
      case "Skybox":
        oOther = Utilities.objectFinder(aThreeObjects, oOtherData.name);
        this.add(oOther);
        break;
      case "SaturnRing":
        var oSaturnBase = Utilities.objectFinder(aThreeObjects, "Saturn", "Base");
        oOther = Utilities.objectFinder(aThreeObjects, oOtherData.name, "Base");
        oSaturnBase.add(oOther);
        break;
      case "Moon":
      case "Spacestation":
        var oEarthBase = Utilities.objectFinder(aThreeObjects, "Earth", "Base");
        oOther = Utilities.objectFinder(aThreeObjects, oOtherData.name, "Base");
        oEarthBase.add(oOther);
        break;
      case "EarthClouds":
        var oEarthBase = Utilities.objectFinder(aThreeObjects, "Earth", "Base");
        oOther = Utilities.objectFinder(aThreeObjects, oOtherData.name, "");
        oEarthBase.add(oOther);

        break;
    }
  }

  updateLoop(time) {
    this.deltaTime = time - this.previousTime;

    if (!UiElements.getPaused()) {
      for (const planetData of this.planetData) {
        this._moveCenter(planetData);
        this._rotatePlanet(planetData);
      }

      for (const otherData of this.otherData) {
        this._rotateOther(otherData);
      }
    }

    this.renderer.renderLoop();

    this.previousTime = time;
  }

  updateControls() {
    this.controls.update();
  }

  initScene() {
    for (const planetData of this.planetData) {
      this._setInit(planetData);
    }

    //set starting for moons
    // for (const otherData of this.otherData) {
    // this._addOtherToScene(otherData, aThreeObjects);
    // }
  }

  _setInit(planetData) {
    //set center position of each group
    const centerBase = Utilities.objectFinder(this.spaceCreator.objects, planetData.name, "CenterBase");
    if (centerBase) {
      centerBase.position.X = planetData.position.X;
      centerBase.position.Y = planetData.position.Y;
      centerBase.position.Z = planetData.position.Z;
    }

    //set initial planet angle
    const degToRad = (2 * Math.PI) / 360;
    const planet = Utilities.objectFinder(this.spaceCreator.objects, planetData.name);
    if (planet) {
      planet.rotation.x = planetData.angle.X * degToRad;
      planet.rotation.y = planetData.angle.Y * degToRad;
      planet.rotation.z = planetData.angle.Z * degToRad;
    }
  }

  _moveCenter(planetData) {
    let orbitSpeed = UiElements.getOrbitSpeed();

    if (this.orbitPhase[planetData.name] === undefined) {
      this.orbitPhase[planetData.name] = 0;
    }

    let phaseIncrement = -orbitSpeed * this.orbitFactor * this.deltaTime;
    this.orbitPhase[planetData.name] += phaseIncrement;

    var oCenter = Utilities.objectFinder(this.spaceCreator.objects, planetData.name, "CenterBase");
    var radius = Utilities.calculateDistance(planetData.position.X, planetData.position.Y, planetData.position.Z);

    if (oCenter) {
      oCenter.position.x = radius * Math.cos(this.orbitPhase[planetData.name] / radius);
      oCenter.position.z = radius * Math.sin(this.orbitPhase[planetData.name] / radius);
    }
  }

  _rotatePlanet(planetData) {
    var orbitSpeed = UiElements.getOrbitSpeed();
    var orbitFactor = this.orbitFactor;
    var rotationFactor = planetData.rotation;
    const degToRad = (2 * Math.PI) / 360;

    if (this.rotationPhase[planetData.name] === undefined) {
      this.rotationPhase[planetData.name] = 0;
    }

    const planet = Utilities.objectFinder(this.spaceCreator.objects, planetData.name);
    const radius = Utilities.calculateDistance(planetData.position.X, planetData.position.Y, planetData.position.Z);

    const phaseIncrement = -this.deltaTime * orbitSpeed * orbitFactor;
    this.rotationPhase[planetData.name] += phaseIncrement;
    const rotationPhase = this.rotationPhase[planetData.name];

    if (planet) {
      planet.rotation.x =
        rotationFactor.X !== 0 ? (rotationPhase / radius) * rotationFactor.X : planetData.angle.X * degToRad;
      planet.rotation.y =
        rotationFactor.Y !== 0 ? (rotationPhase / radius) * rotationFactor.Y : planetData.angle.Y * degToRad;
      planet.rotation.z =
        rotationFactor.Z !== 0 ? (rotationPhase / radius) * rotationFactor.Z : planetData.angle.Z * degToRad;
    }
  }

  _rotateOther(otherData) {
    const other = this._getOtherFinder(otherData);
    if (other) {
      this._rotateOtherAroundPlanet(other, otherData);
      this._selfRotationOther(other, otherData);
    }
  }

  _getOtherFinder(otherData) {
    switch (otherData.name) {
      case "SaturnRing":
      case "Moon":
      case "Spacestation":
        return Utilities.objectFinder(this.spaceCreator.objects, otherData.name, "Base");
      case "EarthClouds":
        return Utilities.objectFinder(this.spaceCreator.objects, otherData.name, "");
    }
  }

  _rotateOtherAroundPlanet(oOther, otherData) {
    if (otherData.relSpeed) {
      const relSpeed = otherData.relSpeed ?? 0;
      const radius = Utilities.calculateDistance(
        otherData.relPosition.X,
        otherData.relPosition.Y,
        otherData.relPosition.Z
      );

      if (this.orbitAroundPlanet[otherData.name] === undefined) {
        this.orbitAroundPlanet[otherData.name] = 0;
      }

      const phaseIncrement = -this.deltaTime * this.otherFactor * relSpeed;
      this.orbitAroundPlanet[otherData.name] += phaseIncrement;
      const orbitAroundPlanet = this.orbitAroundPlanet[otherData.name];

      // const argument = -time * this.otherFactor * relSpeed;
      oOther.position.x = radius * Math.cos(orbitAroundPlanet);
      oOther.position.z = radius * Math.sin(orbitAroundPlanet);
    }
  }

  _selfRotationOther(other, otherData) {
    const orbitSpeed = UiElements.getOrbitSpeed();
    const rotationFactor = otherData.rotation;
    const degToRad = (2 * Math.PI) / 360;

    if (this.rotationPhase[otherData.name] === undefined) {
      this.rotationPhase[otherData.name] = 0;
    }

    const phaseIncrement = -this.deltaTime * orbitSpeed * this.orbitFactor * this.otherRotationFactor;
    this.rotationPhase[otherData.name] += phaseIncrement;
    const rotationPhase = this.rotationPhase[otherData.name];

    if (otherData.rotation && otherData.angle) {
      // const argument = -time * orbitSpeed * rotationFactorOther;
      // if (other) {
      other.rotation.x = rotationFactor.X !== 0 ? rotationPhase * rotationFactor.X : otherData.angle.X * degToRad;
      other.rotation.y = rotationFactor.Y !== 0 ? rotationPhase * rotationFactor.Y : otherData.angle.Y * degToRad;
      other.rotation.z = rotationFactor.Z !== 0 ? rotationPhase * rotationFactor.Z : otherData.angle.Z * degToRad;
      // }
    }
  }

  showOrbit(bShowOrbit) {
    var oSpaceObjects = this.spaceCreator.objects;
    var aPlanetData = this.planetData;

    for (const planetData of aPlanetData) {
      const oOrbit = Utilities.objectFinder(oSpaceObjects, planetData.name, "Orbit");

      if (oOrbit) {
        if (bShowOrbit) {
          oOrbit.visible = true;
        } else {
          oOrbit.visible = false;
        }
      }
    }
  }

  showSkybox(bShowSkybox) {
    var oSpaceObjects = this.spaceCreator.objects;
    var oSkyBox = Utilities.objectFinder(oSpaceObjects, "Skybox", "");

    if (bShowSkybox) {
      oSkyBox.visible = true;
    } else {
      oSkyBox.visible = false;
    }
  }

  correctSize(bCorrectSize) {
    var oSpaceObjects = this.spaceCreator.objects;
    var aPlanetData = this.planetData;
    var aOtherData = this.otherData;
    var iSizeFactor = 0.07;

    for (const planetData of aPlanetData) {
      const oPlanet = Utilities.objectFinder(oSpaceObjects, planetData.name, "Base");

      if (oPlanet) {
        if (bCorrectSize) {
          oPlanet.scale.set(
            iSizeFactor * planetData.sizeCorrection,
            iSizeFactor * planetData.sizeCorrection,
            iSizeFactor * planetData.sizeCorrection
          );
        } else {
          oPlanet.scale.set(1, 1, 1);
        }
      }
    }

    var earthData = aPlanetData.find((planetData) => planetData.name === "Earth");

    for (const otherData of aOtherData) {
      var oOther;
      var iRelativeSize = otherData.size / earthData.size;

      if (otherData.name === "Sun") {
        oOther = Utilities.objectFinder(oSpaceObjects, otherData.name, "");
        if (bCorrectSize) {
          oOther.scale.set(
            (iSizeFactor * otherData.sizeCorrection) / iRelativeSize,
            (iSizeFactor * otherData.sizeCorrection) / iRelativeSize,
            (iSizeFactor * otherData.sizeCorrection) / iRelativeSize
          );
        } else {
          oOther.scale.set(1, 1, 1);
        }
      }

      oOther = Utilities.objectFinder(oSpaceObjects, otherData.name, "Base");
      if (otherData.name === "Moon") {
        if (bCorrectSize) {
          oOther.scale.set(
            otherData.sizeCorrection / iRelativeSize,
            otherData.sizeCorrection / iRelativeSize,
            otherData.sizeCorrection / iRelativeSize
          );
        } else {
          oOther.scale.set(1, 1, 1);
        }
      }

      if (otherData.name === "Spacestation") {
        oOther = Utilities.objectFinder(oSpaceObjects, otherData.name, "");
        if (bCorrectSize) {
          oOther.visible = false;
        } else {
          oOther.visible = true;
        }
      }
    }
  }

  changeAmbientLight(iFactor) {
    this.ambientLight.intensity = iFactor;
  }

  changeSunExposure(iFactor) {
    this.renderer.toneMappingExposure = Utilities.mapRange(iFactor, 0.5, 1.5, 0.7, 1.2);
  }

  resizeWindow() {
    var camera = this.camera;
    var renderer = this.renderer;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.renderResize();
  }
}
