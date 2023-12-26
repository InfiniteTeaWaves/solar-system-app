import * as UiElements from "./uiElements.js";
import * as Utilities from "./utilities.js";

export function addSceneEventListener(oScene) {
  addWindowResize(oScene);

  addSliderSunExposure(oScene);
  addSliderOrbitSpeed(oScene);
  addSliderAmbientLight(oScene);
  addSliderMaxFramerate();
  addCheckboxOrbit(oScene);
  addCheckboxSkybox(oScene);
  addCheckboxSize(oScene);
  addPauseOrbit();
  // UiElements.addOpenDialog();
}

function addSliderSunExposure(oScene) {
  const slider = document.getElementById("idSliderExposure");
  const numberBox = document.getElementById("idBoxExposure");
  numberBox.innerText = slider.value;
  slider.addEventListener("input", (event) => {
    numberBox.innerText = event.target.value;
    oScene.changeSunExposure(event.target.value);
  });
  oScene.changeSunExposure(slider.value);
}

function addSliderOrbitSpeed() {
  const slider = document.getElementById("idSliderOrbitSpeed");
  const numberBox = document.getElementById("idBoxOrbitSpeed");
  numberBox.innerText = slider.value;
  slider.addEventListener("input", (event) => {
    numberBox.innerText = event.target.value;
    UiElements.setOrbitSpeed(Number(event.target.value));
  });
  UiElements.setOrbitSpeed(Number(slider.value));
}

function addSliderAmbientLight(oScene) {
  const slider = document.getElementById("idSliderAmbient");
  const numberBox = document.getElementById("idBoxAmbient");
  numberBox.innerText = slider.value;
  slider.addEventListener("input", (event) => {
    numberBox.innerText = event.target.value;
    oScene.changeAmbientLight(event.target.value);
  });
  oScene.changeAmbientLight(slider.value);
}

function addSliderMaxFramerate() {
  const slider = document.getElementById("idSliderFramerate");
  const numberBox = document.getElementById("idBoxFramerate");
  slider.addEventListener("input", (event) => {
    UiElements.setMaxFramerate(Number(event.target.value));
  });
  UiElements.setMaxFramerate(Number(slider.value));
}

function addCheckboxOrbit(oScene) {
  var checkboxOrbit = document.getElementById("idCheckboxOrbit");
  checkboxOrbit.checked = true;
  checkboxOrbit.addEventListener("change", function () {
    if (this.checked) {
      oScene.showOrbit(true);
    } else {
      oScene.showOrbit(false);
    }
  });
}

function addCheckboxSkybox(oScene) {
  var checkboxOrbit = document.getElementById("idCheckboxSkybox");
  checkboxOrbit.checked = true;
  checkboxOrbit.addEventListener("change", function () {
    if (this.checked) {
      oScene.showSkybox(true);
    } else {
      oScene.showSkybox(false);
    }
  });
}

function addCheckboxSize(oScene) {
  var checkboxOrbit = document.getElementById("idCheckboxSize");
  checkboxOrbit.checked = false;
  checkboxOrbit.addEventListener("change", function () {
    if (this.checked) {
      oScene.correctSize(true);
    } else {
      oScene.correctSize(false);
    }
  });
}

function addPauseOrbit() {
  const button = document.getElementById("idPause");

  button.addEventListener("click", (event) => {
    UiElements.setPaused();
    UiElements.changePauseIcon();
  });
}

function addWindowResize(oScene) {
  window.addEventListener(
    "resize",
    function onWindowResize() {
      oScene.resizeWindow();
    },
    false
  );
}
