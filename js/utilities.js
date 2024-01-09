import * as THREE from "https://cdn.skypack.dev/three@0.137";
import { MapControls } from "https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls";
import * as UiElements from "./uiElements.js";

export async function fetchPlanetData() {
  const response = await fetch("./data/planetsData.json");
  const data = await response.json();
  return data;
}

export function createCamera() {
  var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.set(-800, 400, 0);
  return camera;
}

export function createControls(camera, canvas) {
  const maxLength = 600;
  var controls = new MapControls(camera, canvas);
  controls.target.set(0, 0, 0);
  // controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 800;
  controls.maxPolarAngle = Math.PI / 2;
  controls.keys = {
    LEFT: "ArrowLeft",
    UP: "ArrowUp",
    RIGHT: "ArrowRight",
    BOTTOM: "ArrowDown",
  };
  controls.keyPanSpeed = 50;
  controls.listenToKeyEvents(window);

  controls.addEventListener("change", () => {
    var X = controls.target.x;
    var Y = controls.target.y;
    var Z = controls.target.z;

    var length = Math.sqrt(X * X + Y * Y + Z * Z);

    if (length > maxLength) {
      controls.target.x = (X / length) * maxLength;
      controls.target.y = (Y / length) * maxLength;
      controls.target.z = (Z / length) * maxLength;
    }
  });

  return controls;
}

export function capFPS(lastRenderTime, time, maxFramerate) {
  const delta = time - lastRenderTime;
  const minInterval = 1000 / maxFramerate;

  if (delta < minInterval) {
    return false;
  } else {
    return true;
  }
}

export function calculateDistance(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

export function objectFinder(aArray, sName, sSuffix = "") {
  return aArray.find(({ name }) => name === sName + sSuffix);
}

export function mapRange(value, A, B, a, b) {
  return a + ((value - A) * (b - a)) / (B - A);
}

var lastFpsUpdateTime = 0;
var frameCount = 0;
var fps = 0;

export function updateFramerate(time) {
  frameCount++;
  var timeSinceLastUpdate = time - lastFpsUpdateTime;
  if (timeSinceLastUpdate > 1000) {
    var numberbox = document.getElementById("idBoxFramerate");
    fps = (frameCount / timeSinceLastUpdate) * 1000;
    frameCount = 0;
    lastFpsUpdateTime = time;
    numberbox.innerText = fps.toFixed(0);
  }
}
