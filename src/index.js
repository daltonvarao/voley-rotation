import { isMobile, Player, PlayerGroup, updateHtmlRender } from "./classes";
import "./styles.css";

const levantador = new Player("levantador", 1);
const ponteiro1 = new Player("ponteiro1", 2);
const central1 = new Player("central1", 3);
const oposto = new Player("oposto", 4);
const ponteiro2 = new Player("ponteiro2", 5);
const central2 = new Player("central2", 6);

const playerGroup = new PlayerGroup(
  levantador,
  ponteiro1,
  central1,
  oposto,
  ponteiro2,
  central2
);

const court = document.querySelector("#court");
const configForm = document.querySelector("#config-form");

for (const player of playerGroup.players) {
  const playerElement = document.createElement("div");
  playerElement.draggable = true;
  playerElement.classList.add("player");

  playerElement.ondragend = function (ev) {
    ev.preventDefault();

    const x =
      playerElement.offsetLeft + ev.offsetX - playerElement.offsetWidth / 2;
    const y =
      playerElement.offsetTop + ev.offsetY - playerElement.offsetHeight / 2;

    player.setPosition(x, y);
    playerElement.style.opacity = 1;
    updateHtmlRender(player);
  };

  playerElement.ondragstart = function (ev) {
    playerElement.style.opacity = 0.3;
  };

  playerElement.ondblclick = function (ev) {
    player.resetInfiltrationPosition();
    updateHtmlRender(player);
  };

  document.body.ondragover = function (ev) {
    ev.preventDefault();
  };

  if (isMobile) {
    playerElement.ontouchmove = function (ev) {
      ev.preventDefault();
      const [target] = ev.targetTouches;

      const courtRect = court.getBoundingClientRect();
      const x = target.pageX - courtRect.left - playerElement.offsetWidth / 2;
      const y = target.pageY - courtRect.top - playerElement.offsetHeight / 2;

      player.setPosition(x, y);
      playerElement.style.opacity = 1;
      updateHtmlRender(player);
    };
  }

  player.setHtmlElement(playerElement);
  updateHtmlRender(player);
  court.appendChild(playerElement);

  mountConfigForm(player);
}

function mountConfigForm(player) {
  const configPlayerRow = document.createElement("div");
  configPlayerRow.classList.add("config-row");

  const configPlayerItem = document.createElement("div");
  configPlayerItem.classList.add("player", "config");
  configPlayerItem.innerText = player.rotationPosition;

  const configNameInput = document.createElement("input");
  configNameInput.classList.add("config-input");
  configNameInput.value = player.label;

  configNameInput.onchange = function (ev) {
    player.label = ev.target.value;
    updateHtmlRender(player);
  };

  configPlayerRow.appendChild(configPlayerItem);
  configPlayerRow.appendChild(configNameInput);
  configForm.appendChild(configPlayerRow);
}

const panelControlActions = [
  {
    id: "#rotate-players",
    action: () => playerGroup.rotateOnePositionEach(),
    event: "click",
  },
  {
    id: "#reset-infiltration",
    action: () => playerGroup.resetPlayersInfiltrationPosition(),
    event: "click",
  },
  {
    id: "#initial-rotation",
    action: () => playerGroup.resetPlayersInitialPosition(),
    event: "click",
  },
  {
    id: "#close-modal",
    action: () => closeModal(),
    event: "click",
  },
  {
    id: "#show-config-modal",
    action: () => showModal(),
    event: "click",
  },
];

function closeModal() {
  const modal = document.querySelector("#modal");
  modal.style.display = "none";
}

function showModal() {
  const modal = document.querySelector("#modal");
  modal.style.display = "flex";
}

panelControlActions.forEach(({ action, event, id }) => {
  const element = document.querySelector(id);

  element.addEventListener(event, action);
});

// remove bounce effect on ios
document.addEventListener("gesturestart", function (e) {
  e.preventDefault();
});
