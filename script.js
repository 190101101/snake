const lifeEl = document.querySelector('.life');
const timerEl = document.querySelector('.timer');
const speedEl = document.querySelector('.speed');
const scoreEl = document.querySelector('.score');
const levelEl = document.querySelector('.level');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1100;
canvas.height = 500;

const gameWidth = canvas.width;
const gameHeight = canvas.height;

const bgImage = new Image();
bgImage.src = 'images/11.png';

let popSound = new Audio('audio/pop.mp3');
let levelUpSound = new Audio('audio/level.mp3');
let snakeColor = 'indigo';
let snakeHeadColor = randomColor();
let snakeBorder = 'violet';
let foodColor = 'indigo';

let foodX, foodY;
let running = true;
let canChangeDirection = true;
let fps = 20;
let speed = fps;
let unitsize = 20;
let xVelocity = unitsize;
let yVelocity = 0;
let snake = [];
let score = 0;
let life = 0;
let lastScore = 0;
let level = 1;

window.addEventListener('keydown', changeDirection);

init();

function init() {
  running = true;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  speedEl.textContent = speed;
  createSnake();
  drawFood();
  createFood();
  nextTick();
}

function nextTick() {
  if (running) {
    setTimeout(() => {
      clearBoard();
      drawFood();
      drawSnake();
      moveSnake();
      checkGameOver();
      nextTick();
    }, 1000 / fps);
  }
}
function clearBoard() {
  ctx.drawImage(bgImage, 0, 0, gameWidth, gameHeight);
}

function randomNum(num) {
  return Math.round(Math.random() * num);
}

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function randomCoordinate(min, max) {
  const range = max - min;
  const adjustedMax = range - (range % unitsize);
  const randNum =
    Math.floor((Math.random() * adjustedMax) / unitsize) * unitsize;
  return min + randNum;
}

function drawFood() {
  ctx.fillStyle = randomColor;
  ctx.fillRect(foodX, foodY, unitsize, unitsize);
}

function createFood() {
  let foodOnSnake;

  do {
    foodOnSnake = false;
    foodX = randomCoordinate(0, gameWidth - unitsize);
    foodY = randomCoordinate(0, gameHeight - unitsize);

    for (let part of snake) {
      if (part.x === foodX && part.y === foodY) {
        foodOnSnake = true;
        break;
      }
    }
  } while (foodOnSnake);
}

function createSnake() {
  snake = [];
  snake = [
    { x: unitsize * 2, y: gameWidth / 2 },
    { x: unitsize * 1, y: gameWidth / 2 },
    { x: unitsize * 0, y: gameWidth / 2 },
  ];
  xVelocity = unitsize;
  yVelocity = 0;
}

function drawSnake() {
  ctx.strokeStyle = snakeBorder;

  snake.forEach((snakePart, index) => {
    ctx.fillStyle = index == 0 ? snakeHeadColor : snakeColor;
    ctx.fillRect(snakePart.x, snakePart.y, unitsize, unitsize);
    ctx.strokeRect(snakePart.x, snakePart.y, unitsize, unitsize);
  });
}

function moveSnake() {
  const head = {
    x: snake[0].x + xVelocity,
    y: snake[0].y + yVelocity,
  };

  snake.unshift(head);

  if (snake[0].x == foodX && snake[0].y == foodY) {
    popSound.play();
    scoreUp();
    createFood();
  } else {
    snake.pop();
  }

  if (head.x >= gameWidth) {
    head.x = 0;
  } else if (head.x < 0) {
    head.x = gameWidth - unitsize;
  }

  if (head.y >= gameHeight) {
    head.y = 0;
  } else if (head.y < 0) {
    head.y = gameHeight - unitsize;
  }

  canChangeDirection = true;
}

function changeDirection(e) {
  if (!canChangeDirection) return;

  const keyPressed = e.keyCode;

  const RIGHT = 39;
  const DOWN = 40;
  const LEFT = 37;
  const UP = 38;

  const SPACE = 32;
  const ESC = 27;

  const goingRight = xVelocity == unitsize;
  const goingDown = yVelocity == unitsize;
  const goingLeft = xVelocity == -unitsize;
  const goingUp = yVelocity == -unitsize;

  switch (true) {
    case keyPressed == RIGHT && !goingLeft:
      xVelocity = unitsize;
      yVelocity = 0;
      break;
    case keyPressed == DOWN && !goingUp:
      xVelocity = 0;
      yVelocity = unitsize;
      break;
    case keyPressed == LEFT && !goingRight:
      xVelocity = -unitsize;
      yVelocity = 0;
      break;
    case keyPressed == UP && !goingDown:
      xVelocity = 0;
      yVelocity = -unitsize;
      break;
    case keyPressed == SPACE:
      running = !running;
      nextTick();
      console.log(running);
      break;
    case keyPressed == ESC:
      createSnake();
      break;
    default:
      break;
  }
  canChangeDirection = false;
}

function checkGameOver() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      createSnake();
      resetGame();
      return;
    }
  }
}

function scoreUp() {
  score += 1;
  lastScore++;
  scoreEl.textContent = score;
  if (lastScore >= 36) {
    level += 1;
    levelUpSound.play();
    snakeHeadColor = randomColor();
    createSnake();
    lastScore = 0;
    // fps += 1;
    speed = fps;
    levelEl.textContent = level;
    speedEl.textContent = speed;
  }
}

function levelUp() {}

function resetGame() {
  score = 0;
  level = 1;
  lastScore = 0;
  scoreEl.textContent = score;
  levelEl.textContent = level;
}

let status = true;
let seconds = 0;

function startTimer() {
  const interval = setInterval(() => {
    if (!status) {
      clearInterval(interval);
      return;
    }

    seconds++;
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    console.log(remainingSeconds);
    timerEl.innerHTML = `${minutes}:${remainingSeconds}`;
  }, 1000);
}

startTimer();

// setTimeout(() => {
// status = false;
// }, 5000);
