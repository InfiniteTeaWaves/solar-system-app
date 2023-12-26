import * as THREE from "https://cdn.skypack.dev/three@0.137";
import { EffectComposer } from "https://cdn.skypack.dev/three-stdlib@2.8.5/postprocessing/EffectComposer";
import { RenderPass } from "https://cdn.skypack.dev/three-stdlib@2.8.5/postprocessing/RenderPass";
import { UnrealBloomPass } from "https://cdn.skypack.dev/three-stdlib@2.8.5/postprocessing/UnrealBloomPass";
export default class Renderer extends THREE.WebGL1Renderer {
  constructor(scene, camera, window) {
    super({
      alpha: true,
      antialias: true,
    });
    this.scene = scene;
    this.camera = camera;
    this.window = window;

    this._initialize();
    this._createBloomComposer();
  }

  _initialize() {
    this.setSize(window.innerWidth, window.innerHeight);
    this.toneMapping = THREE.ACESFilmicToneMapping;
    this.outputEncoding = THREE.sRGBEncoding;
    this.physicallyCorrectLights = true;
    this.shadowMap.enabled = true;
    this.shadowMap.type = THREE.PCFSoftShadowMap;
    this.setPixelRatio(window.devicePixelRatio);
    this.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.domElement);
  }

  _createBloomComposer() {
    var scene = this.scene;
    var camera = this.camera;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.5;
    bloomPass.strength = 1;
    bloomPass.radius = 0.01;

    const bloomComposer = new EffectComposer(this);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    this.bloomComposer = bloomComposer;
    this.bloomPass = bloomPass;
  }

  renderLoop() {
    var renderer = this;
    var bloomComposer = this.bloomComposer;
    var camera = this.camera;

    renderer.autoClear = false;
    renderer.clear();

    camera.layers.enable(0);
    camera.layers.enable(1);
    bloomComposer.render();
  }

  renderResize() {
    this.setSize(window.innerWidth, window.innerHeight);
    this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
  }
}
