import "./style.css";
import SpaceScene from "./js/classes/Scene.js";
import * as Utilities from "./js/utilities.js";
import * as sceneEvents from "./js/sceneEvents.js";
import * as UiElements from "./js/uiElements.js";

let init = true;
let lastRenderTime = 0;
const oScene = new SpaceScene();

Promise.all([UiElements.loadUiElements()]).then(() => {
  Promise.all([oScene.createScene()]).then(() => {
    UiElements.hideBusyIndicator();
    sceneEvents.addSceneEventListener(oScene);
    animate();
  });
});

function animate(time) {
  requestAnimationFrame(animate);

  if (time == undefined) {
    time = 0;
  }

  if (init) {
    oScene.initScene();
    init = false;
  }

  oScene.updateControls();
  if (!Utilities.capFPS(lastRenderTime, time, UiElements.getMaxFramerate())) {
    return;
  }
  oScene.updateLoop(time);

  lastRenderTime = time;
  Utilities.updateFramerate(time);
}
