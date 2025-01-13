const lastScoreEl = document.querySelector('.lastscore');
const levelScoreEl = document.querySelector('.levelScore');
const lifeEl = document.querySelector('.life');
const timerEl = document.querySelector('.timer');
const speedEl = document.querySelector('.speed');
const scoreEl = document.querySelector('.score');
const levelEl = document.querySelector('.level');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  let unitsize = 20;
  canvas.width = Math.round(window.innerWidth / unitsize) * unitsize;
  canvas.height = Math.round((window.innerHeight * 0.9) / unitsize) * unitsize;
}

resizeCanvas();

const gameWidth = canvas.width;
const gameHeight = canvas.height;

let popSound = new Audio('audio/pop.mp3');
let levelUpSound = new Audio('audio/level.mp3');
let snakeColor = 'indigo';
let snakeHeadColor = 'orangered';
let snakeBorder = 'violet';
let foodColor = 'indigo';

let foodX, foodY;
let running = true;
let canChangeDirection = true;
let fps = 5;
let speed = fps;
let unitsize = 20;
let xVelocity = unitsize;
let yVelocity = 0;
let snake = [];
let score = 0;
let life = 1;
let lastScore = 0;
let level = 1;
let status = true;
let seconds = 0;
let levelScore = 100;

window.addEventListener('keydown', changeDirection);
window.addEventListener('resize', resizeCanvas);

init();

function init() {
  running = true;
  lastScoreEl.textContent = lastScore;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  speedEl.textContent = speed;
  lifeEl.textContent = life;
  levelScoreEl.textContent = levelScore;
  startTimer();
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

function drawGrid() {
  ctx.strokeStyle = '#14171a';
  for (let x = 0; x <= gameWidth; x += unitsize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gameHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= gameHeight; y += unitsize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(gameWidth, y);
    ctx.stroke();
  }
}

function clearBoard() {
  ctx.clearRect(0, 0, gameWidth, gameHeight);
  drawGrid();
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

  /*
  for(let i = 98; i > 0; i--){
    snake.push({x:unitsize*i, y:0})
  }
  */

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
    /*
      case keyPressed == SPACE:
        running = !running;
        nextTick();
        console.log(running);
        break;
        case keyPressed == ESC:
          createSnake();
          break;
          */
    default:
      break;
  }
  canChangeDirection = false;
}

function checkGameOver() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      resetGame();
      return;
    }
  }
}

function scoreUp() {
  score += 1;
  lastScore += 1;
  scoreEl.textContent = score;
  lastScoreEl.textContent = lastScore;
  if (lastScore >= levelScore) {
    snakeHeadColor = randomColor();
    createSnake();
    levelUp();
  }
}

function levelUp() {
  level += 1;
  levelScore += 10;
  life += 2;
  levelUpSound.play();
  lastScore = 0;
  lastScoreEl.textContent = lastScore;

  fps += 1;
  speed = fps;
  levelEl.textContent = level;
  levelScoreEl.textContent = levelScore;
  speedEl.textContent = speed;
  lifeEl.textContent = life;
}

function resetGame() {
  life -= 1;
  lifeEl.textContent = life;

  lastScore = 0;
  lastScoreEl.textContent = lastScore;

  if (life == 0) {
    score = 0;
    level = 1;
    life = 3;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    lifeEl.textContent = life;
    createSnake();
  } else {
    createSnake();
  }
}

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
    timerEl.innerHTML = `${minutes}:${remainingSeconds}`;
  }, 1000);
}
