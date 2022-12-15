export const POSITIONS_BY_ROTATION = {
  1: { x: 280, y: 260 },
  2: { x: 280, y: 20 },
  3: { x: 155, y: 20 },
  4: { x: 30, y: 20 },
  5: { x: 30, y: 260 },
  6: { x: 155, y: 260 },
};

export class Player {
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

export class PlayerGroup {
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

export const setHtmlPosition = (playerElement, left, top) => {
  playerElement.style.top = top + "px";
  playerElement.style.left = left + "px";
};

export const updateHtmlRender = (player) => {
  player.htmlElement.setAttribute("data-label", player.label);
  player.htmlElement.innerText = player.rotationPosition;
  setHtmlPosition(player.htmlElement, player.position.x, player.position.y);

  if ([2, 3, 4].includes(player.rotationPosition)) {
    player.htmlElement.classList.add("attack");
  } else {
    player.htmlElement.classList.remove("attack");
  }

  if (player.isInvalid) {
    player.htmlElement.classList.add("invalid");
  } else {
    player.htmlElement.classList.remove("invalid");
  }
};

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
