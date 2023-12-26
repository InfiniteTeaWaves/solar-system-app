import "./style.css";
import SpaceScene from "./js/classes/Scene.js";
import * as Utilities from "./js/utilities.js";
import * as sceneEvents from "./js/sceneEvents.js";
import * as UiElements from "./js/uiElements.js";

await UiElements.loadUiElements();

const oScene = new SpaceScene();
await oScene.createScene();

UiElements.hideBusyIndicator();
sceneEvents.addSceneEventListener(oScene);

var init = true;
var lastRenderTime = 0;
var currentTime = 0;
var animationFrameID;

function animate(time) {
  animationFrameID = requestAnimationFrame(animate);

  if (time == undefined) {
    time = 0;
  }

  if (init) {
    oScene.initScene();
    init = false;
  }

  oScene.updateControls();

  oScene.updateLoop(time);

  if (!Utilities.capFPS(lastRenderTime, time, UiElements.getMaxFramerate())) {
    return;
  }

  Utilities.updateFramerate(time);

  lastRenderTime = time;
}

animate();
