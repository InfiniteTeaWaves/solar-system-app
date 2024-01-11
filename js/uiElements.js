var maxFramerate = 60; // default value
var isPaused = false;
var orbitSpeed = 1;
var framerate = 0;

export async function loadUiElements() {
  const aPromise = [loadFooter(), loadSidebar(), loadDialog()];
  await Promise.all(aPromise);
  // addOpenDialog();
  addToggleDialog();
}

export function hideBusyIndicator() {
  const busyIndicator = document.getElementById("busy-indicator");
  busyIndicator.style.display = "none";
}

//footer
async function loadFooter() {
  try {
    const response = await fetch("../html/footer.html");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const html = await response.text();
    document.querySelector("#footer_container").innerHTML = html;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

//Sidebar
async function loadSidebar() {
  try {
    const response = await fetch("../html/sidebar.html");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const html = await response.text();
    addToggleSidebar();

    document.querySelector("#sidebar_container").innerHTML = html;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

//toggle sidebar
function addToggleSidebar() {
  document.getElementById("sidebar-toggle").addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    const sidebarImg = document.getElementById("idToggleButtonImage");
    if (sidebar.style.display === "none") {
      sidebar.style.display = "block";
      sidebarImg.src = "assets/menuClose.svg";
    } else {
      sidebar.style.display = "none";
      sidebarImg.src = "assets/menuOpen.svg";
    }
  });
}

//Dialog
async function loadDialog() {
  try {
    const response = await fetch("../html/dialog.html");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const html = await response.text();
    document.querySelector("#dialog_container").innerHTML = html;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

function addToggleDialog() {
  var dialog = document.getElementById("dialog");
  var dialogContent = document.querySelector(".dialog-content");
  var dialogToggles = document.querySelectorAll(".dialog-toggle");

  dialogToggles.forEach(function (button) {
    button.addEventListener("click", async function () {
      var file = this.getAttribute("data-dialog-file");

      // Fetch the dialog content from the relevant file
      const response = await fetch(`../html/${file}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const html = await response.text();

      // Replace the dialog content with the new content
      dialogContent.innerHTML = html;

      //addClose
      var closeButtons = document.querySelectorAll(".close-dialog-button");
      closeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          dialog.style.display = "none";
        });
      });

      // Show the dialog
      dialog.style.display = "block";
    });
  });

  // Escape key event listener
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
      dialog.style.display = "none";
    }
  });
}

//Pause Icon
export function changePauseIcon() {
  const button = document.getElementById("idPause");
  if (this.getPaused()) {
    button.textContent = "Continue";
  } else {
    button.textContent = "Pause";
  }
}

export function getMaxFramerate() {
  return maxFramerate;
}

export function setMaxFramerate(value) {
  maxFramerate = value;
}

export function getPaused() {
  return isPaused;
}

export function setPaused() {
  isPaused = !isPaused;
}

export function getOrbitSpeed() {
  return orbitSpeed;
}

export function setOrbitSpeed(value) {
  orbitSpeed = value;
}
