import "./styles.css";

const POSITIONS_BY_ROTATION = {
  1: { x: 280, y: 280 },
  2: { x: 280, y: 20 },
  3: { x: 155, y: 20 },
  4: { x: 30, y: 20 },
  5: { x: 30, y: 280 },
  6: { x: 155, y: 280 },
};

class Player {
  position = {
    x: 0,
    y: 0,
  };

  constructor(label, rotationPosition) {
    this.initialRotationPosition = rotationPosition;
    this.rotationPosition = rotationPosition;
    this.label = label;
    this.moving = false;
    this.rulesByRotation = {
      1: [() => this.mustBeBelowOf(2), () => this.mustBeRightOf(6)],
      2: [() => this.mustBeAboveOf(1), () => this.mustBeRightOf(3)],
      3: [
        () => this.mustBeLeftOf(2),
        () => this.mustBeRightOf(4),
        () => this.mustBeAboveOf(6),
      ],
      4: [() => this.mustBeAboveOf(5), () => this.mustBeLeftOf(3)],
      5: [() => this.mustBeBelowOf(4), () => this.mustBeLeftOf(6)],
      6: [
        () => this.mustBeLeftOf(1),
        () => this.mustBeRightOf(5),
        () => this.mustBeBelowOf(3),
      ],
    };
    this.resetInfiltrationPosition();
  }

  get isInvalid() {
    const rules = this.rulesByRotation[this.rotationPosition];
    return !rules.every((rule) => rule());
  }

  setHtmlElement(el) {
    this.htmlElement = el;
  }

  setGroup(group) {
    this.group = group;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  decreaseRotationByOne() {
    this.rotationPosition =
      this.rotationPosition > 1 ? this.rotationPosition - 1 : 6;

    const newPosition = POSITIONS_BY_ROTATION[this.rotationPosition];

    this.setPosition(newPosition.x, newPosition.y);
  }

  resetInfiltrationPosition() {
    const rotationPosition = POSITIONS_BY_ROTATION[this.rotationPosition];
    this.setPosition(rotationPosition.x, rotationPosition.y);
  }

  resetToInitialRotationPosition() {
    this.rotationPosition = this.initialRotationPosition;
    this.resetInfiltrationPosition();
  }

  mustBeAboveOf(rotationPosition) {
    const playerOnRotation =
      this.findPlayerByRotationPosition(rotationPosition);
    if (!playerOnRotation) return true;

    return this.position.y < playerOnRotation.position.y;
  }

  mustBeBelowOf(rotationPosition) {
    const playerOnRotation =
      this.findPlayerByRotationPosition(rotationPosition);
    if (!playerOnRotation) return true;

    return this.position.y > playerOnRotation.position.y;
  }

  mustBeLeftOf(rotationPosition) {
    const playerOnRotation =
      this.findPlayerByRotationPosition(rotationPosition);
    if (!playerOnRotation) return true;

    return this.position.x < playerOnRotation.position.x;
  }

  mustBeRightOf(rotationPosition) {
    const playerOnRotation =
      this.findPlayerByRotationPosition(rotationPosition);
    if (!playerOnRotation) return true;

    return this.position.x > playerOnRotation.position.x;
  }

  findPlayerByRotationPosition(rotationPosition) {
    return this.group.players.find(
      (player) => player.rotationPosition === rotationPosition
    );
  }
}

const setHtmlPosition = (playerElement, left, top) => {
  playerElement.style.top = top + "px";
  playerElement.style.left = left + "px";
};

const updateHtmlRender = (player) => {
  player.htmlElement.setAttribute("data-label", player.label);
  player.htmlElement.innerText = player.rotationPosition;
  setHtmlPosition(player.htmlElement, player.position.x, player.position.y);

  if (player.isInvalid) {
    player.htmlElement.classList.add("invalid");
  } else {
    player.htmlElement.classList.remove("invalid");
  }
};

class PlayerGroup {
  constructor(...players) {
    this.players = [...players];
    this.players.forEach((player) => player.setGroup(this));
  }

  rotateOnePositionEach() {
    this.players.forEach((player) => {
      player.decreaseRotationByOne();
      updateHtmlRender(player);
    });
  }

  resetPlayersInfiltrationPosition() {
    this.players.forEach((player) => {
      player.resetInfiltrationPosition();
      updateHtmlRender(player);
    });
  }

  resetPlayersInitialPosition() {
    this.players.forEach((player) => {
      player.resetToInitialRotationPosition();
      updateHtmlRender(player);
    });
  }
}

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

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    playerElement.ontouchmove = function (ev) {
      ev.preventDefault();
      const [target] = ev.targetTouches;

      console.log(target);

      const courtRect = court.getBoundingClientRect();

      console.log(courtRect);

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
];

panelControlActions.forEach(({ action, event, id }) => {
  const element = document.querySelector(id);

  element.addEventListener(event, action);
});

document.addEventListener("gesturestart", function (e) {
  e.preventDefault();
});
