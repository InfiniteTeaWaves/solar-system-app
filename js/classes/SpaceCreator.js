import * as THREE from "https://cdn.skypack.dev/three@0.137";
import { TDSLoader } from "https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/TDSLoader";

export default class SpaceObjectCreator {
  constructor(planets, other) {
    this.other = other;
    this.planets = planets;
    this.objects = [];
  }

  createSun() {
    const sunData = this.other.find(({ name }) => name === "Sun");

    const color = new THREE.Color("#FDB813");
    const geometry = new THREE.IcosahedronGeometry(sunData.size, 15);
    const material = new THREE.MeshBasicMaterial({ color: color });

    const oSun = new THREE.Mesh(geometry, material);
    oSun.position.set(sunData.position.X, sunData.position.Y, sunData.position.Z);
    oSun.name = sunData.name;
    this.objects.push(oSun);
    return oSun;
  }

  async createSpacestation() {
    const spacestationData = this.other.find(({ name }) => name === "Spacestation");

    const oSpaceStation = await this._createSpacestation(spacestationData);
    const oSpaceObjectBase = this.createBase(
      spacestationData.name,
      spacestationData.relPosition.X,
      spacestationData.relPosition.Y,
      spacestationData.relPosition.Z
    );

    this.addChildToParent(oSpaceStation, oSpaceObjectBase);
    this.objects.push(oSpaceStation);
    this.objects.push(oSpaceObjectBase);
    return oSpaceObjectBase;
  }

  async _createSpacestation(spacestationData) {
    const loader = new TDSLoader();
    const spacestation = await loader.loadAsync(spacestationData.textures.model);

    spacestation.name = spacestationData.name;
    spacestation.position.set(0, 0, -8);
    spacestation.rotation.set(spacestationData.rotation.X, spacestationData.rotation.Y, spacestationData.rotation.Z);
    spacestation.scale.set(spacestationData.size, spacestationData.size, spacestationData.size);

    return spacestation;
  }

  async createSaturnRing() {
    const ringData = this.other.find(({ name }) => name === "SaturnRing");
    // const saturnData = this.planets.find(({ name }) => name === "Saturn");

    const oSaturnRing = await this._createSaturnRing(ringData);
    const oSaturnRingBase = this.createBase(ringData.name, 0, 0, 0);

    this.addChildToParent(oSaturnRing, oSaturnRingBase);
    this.objects.push(oSaturnRing);
    this.objects.push(oSaturnRingBase);
    return oSaturnRingBase;
  }

  async _createSaturnRing(ringData) {
    var textureLoader = new THREE.TextureLoader();

    const map = await textureLoader.loadAsync(ringData.textures.map);
    const geometry = new THREE.RingGeometry(ringData.size, ringData.size * 1.8, 64);

    var pos = geometry.attributes.position;
    var v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < ringData.size * 1.1 ? 0 : 1, 1);
    }

    const material = new THREE.MeshBasicMaterial({
      map: map,
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    var saturnRing = new THREE.Mesh(geometry, material);

    saturnRing.rotation.x += (Math.PI / 2) * 1.2;
    saturnRing.name = ringData.name;

    return saturnRing;
  }

  async createMoonGroup() {
    const moonData = this.other.find(({ name }) => name === "Moon");

    const oMoon = await this._createMoon(moonData);
    const oMoonBase = this.createBase(
      moonData.name,
      moonData.relPosition.X,
      moonData.relPosition.Y,
      moonData.relPosition.Z
    );

    this.addChildToParent(oMoon, oMoonBase);
    this.objects.push(oMoon);
    this.objects.push(oMoonBase);
    return oMoonBase;
  }

  async _createMoon(moonData) {
    var textureLoader = new THREE.TextureLoader();
    const bump = moonData.textures.bump ? await textureLoader.loadAsync(moonData.textures.bump) : null;
    const map = await textureLoader.loadAsync(moonData.textures.map);
    const geometry = new THREE.SphereGeometry(moonData.size, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      toneMapped: true,
      bumpMap: bump,
      bumpScale: bump ? 0.3 : 0,
      map: map,
      clearcoat: 0.5,
    });

    const meshMoon = new THREE.Mesh(geometry, material);
    meshMoon.name = moonData.name;
    return meshMoon;
  }

  async createEarthClouds() {
    const earthCloudsData = this.other.find(({ name }) => name === "EarthClouds");
    const earthData = this.planets.find(({ name }) => name === "Earth");
    var textureLoader = new THREE.TextureLoader();
    const cloudRadius = earthData.size * 1.05;
    const map = await textureLoader.loadAsync(earthCloudsData.textures.map);
    const geometry = new THREE.SphereGeometry(cloudRadius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      map: map,
      side: THREE.DoubleSide,
      opacity: 0.8,
      transparent: true,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(geometry, material);
    cloudMesh.name = earthCloudsData.name;
    this.objects.push(cloudMesh);
    return cloudMesh;
  }

  async createSkybox() {
    const skyboxData = this.other.find(({ name }) => name === "Skybox");

    var textureLoader = new THREE.TextureLoader();
    const map = await textureLoader.loadAsync(skyboxData.textures.map);

    const starGeometry = new THREE.SphereGeometry(skyboxData.size, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: map,
      side: THREE.BackSide,
      transparent: true,
    });

    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    starMesh.name = skyboxData.name;

    this.objects.push(starMesh);
    return starMesh;
  }

  createPlanetOrbit(radius, name) {
    const innerRadius = radius - 1;
    const outerRadius = radius + 1;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 256);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });

    const circle = new THREE.Mesh(geometry, material);
    circle.name = name;
    circle.position.set(0, 0, 0);
    circle.rotation.x = Math.PI / 2;

    circle.layers.set(1); //non-bloom layer

    this.objects.push(circle);
    return circle;
  }

  async createPlanet(planetName) {
    const planetData = this.planets.find(({ name }) => name === planetName);

    const oPlanet = await this._createPlanet(planetData);
    const oSpaceObjectBase = this.createBase(planetData.name, 0, 0, 0);

    this.addChildToParent(oPlanet, oSpaceObjectBase);
    this.objects.push(oPlanet);
    this.objects.push(oSpaceObjectBase);
    return oSpaceObjectBase;
  }

  async _createPlanet(planetData) {
    var textureLoader = new THREE.TextureLoader();

    const bump = planetData.textures.bump ? await textureLoader.loadAsync(planetData.textures.bump) : null;

    const map = await textureLoader.loadAsync(planetData.textures.map);
    const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);

    const material = new THREE.MeshPhysicalMaterial({
      toneMapped: true,
      bumpMap: bump,
      bumpScale: bump ? 0.3 : 0,
      map: map,
      clearcoat: 0.5,
    });

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.name = planetData.name;
    return planetMesh;
  }

  createGroupCenter(planetName) {
    const planetData = this.planets.find(({ name }) => name === planetName);

    const oSpaceObjectBase = this.createBase(
      planetData.name + "Center",
      planetData.position.X,
      planetData.position.Y,
      planetData.position.Z
    );
    this.objects.push(oSpaceObjectBase);
    return oSpaceObjectBase;
  }

  createBase(sName, X, Y, Z) {
    const oBase = new THREE.Object3D();
    oBase.position.set(X, Y, Z);
    oBase.name = sName + "Base";

    return oBase;
  }

  addChildToParent(child, parent) {
    // child.position.copy(parent.position); //ggf schuld an position die off ist
    parent.add(child);
  }
}
