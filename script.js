// === 遊戲設定與顏色主題 ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20; // 每一格的大小
const rows = 30;
const cols = 30;
const STANDARD_SPEED = 200; // 標準每幀時間(ms)
const FAST_SPEED = 100;     // 加速每幀時間(ms)
const BACKGROUND_COLOR = "#f0f0f0"; // 新增：穩定的遊戲背景色 (柔和灰白)

// === 龍顏色主題定義 ===
const DRAGON_THEMES = [
    // 1. 金紅那迦 (經典)
    { bodyStart: "#FFD700", bodyMid: "#B22222", head: "gold", eye: "white", eyePupil: "black", border: "darkred" },
    // 2. 翡翠綠那迦
    { bodyStart: "#00FF7F", bodyMid: "#006400", head: "#3CB371", eye: "white", eyePupil: "black", border: "#004d00" },
    // 3. 藍紫那迦 (泰國皇室/藍寶石)
    { bodyStart: "#8A2BE2", bodyMid: "#4B0082", head: "#9370DB", eye: "gold", eyePupil: "white", border: "#483D8B" },
    // 4. 青銅黃那迦 (泰國寺廟風格)
    { bodyStart: "#B8860B", bodyMid: "#DAA520", head: "#FFD700", eye: "#BDB76B", eyePupil: "black", border: "#8B4513" }
];


// === HTML元素 ===
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const gameOverDiv = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

// === 遊戲狀態變數 ===
let snake = []; 
let direction = "RIGHT"; 
let food = {}; 
let score = 0;
let gameInterval;
let speed = STANDARD_SPEED; 
let accelerating = false; 
let gameStarted = false; 
let currentThemeIndex = 0; // 當前的顏色索引

// === 獨立的繪製背景函式 (確保在所有繪製前執行) ===
function drawBackground() {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// === 初始化遊戲 (包含隨機顏色主題) ===
function initGame() {
  snake = [{ x: 10, y: 10 }];
  direction = "RIGHT";
  score = 0;
  speed = STANDARD_SPEED; 
  
  // 隨機選擇一個新的顏色主題
  currentThemeIndex = Math.floor(Math.random() * DRAGON_THEMES.length); 
  
  generateFood();
  updateScore();
  
  // 確保龍和食物在開始時繪製
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(); // 繪製背景
  drawMango();
  drawDragon();
}

// === 開始遊戲/重新開始的事件監聽器 ===
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  gameOverDiv.style.display = "none";
  initGame();
  gameStarted = true;
  gameInterval = setInterval(gameLoop, speed);
});

restartBtn.addEventListener("click", () => {
  gameOverDiv.style.display = "none";
  initGame();
  gameStarted = true; 
  gameInterval = setInterval(gameLoop, speed);
});

// === 隨機生成食物 ===
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));
  food = newFood;
}

// === 更新分數 ===
function updateScore() {
  scoreDisplay.textContent = "分數：" + score;
}

// === 繪製泰國那迦龍 (無翅膀，使用主題顏色) ===
function drawDragon() {
  const theme = DRAGON_THEMES[currentThemeIndex]; // 取得當前顏色主題

  snake.forEach((part, index) => {
    const x = part.x * boxSize;
    const y = part.y * boxSize;

    // 1. 那迦龍身體的顏色漸變
    const dragonColor = ctx.createLinearGradient(x, y, x + boxSize, y + boxSize);
    dragonColor.addColorStop(0, theme.bodyStart); 
    dragonColor.addColorStop(0.5, theme.bodyMid); 
    dragonColor.addColorStop(1, theme.bodyStart); 

    ctx.fillStyle = dragonColor;
    ctx.strokeStyle = theme.border; 
    ctx.lineWidth = 1.5;

    // 畫出圓潤的身體節
    ctx.beginPath();
    ctx.arc(x + boxSize / 2, y + boxSize / 2, boxSize / 2 - 1, 0, Math.PI * 2); 
    ctx.fill();
    ctx.stroke();

    // 2. 蛇頭：眼睛和頭冠 (無翅膀)
    if (index === 0) {
      // 眼睛
      ctx.fillStyle = theme.eye; 
      ctx.beginPath();
      ctx.arc(x + boxSize / 2 - 4, y + boxSize / 2 - 4, 2, 0, Math.PI * 2); // 左眼
      ctx.arc(x + boxSize / 2 + 4, y + boxSize / 2 - 4, 2, 0, Math.PI * 2); // 右眼
      ctx.fill();

      // 眼珠
      ctx.fillStyle = theme.eyePupil; 
      ctx.beginPath();
      ctx.arc(x + boxSize / 2 - 4, y + boxSize / 2 - 4, 1, 0, Math.PI * 2);
      ctx.arc(x + boxSize / 2 + 4, y + boxSize / 2 - 4, 1, 0, Math.PI * 2);
      ctx.fill();

      // 簡單的頭冠
      ctx.fillStyle = theme.head; 
      ctx.beginPath();
      ctx.moveTo(x + boxSize / 2, y);
      ctx.lineTo(x + boxSize / 2 - 7, y - 8);
      ctx.lineTo(x + boxSize / 2 + 7, y - 8);
      ctx.closePath();
      ctx.fill();
    }
  });
}

// === 繪製芒果食物 (黃色) ===
function drawMango() {
  const x = food.x * boxSize;
  const y = food.y * boxSize;

  // 芒果主體 (金黃色)
  ctx.fillStyle = "#FFD700"; // 金黃色
  ctx.strokeStyle = "#FFA500"; // 橘黃色邊框
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  // 使用曲線繪製芒果的橢圓形狀
  ctx.moveTo(x + boxSize * 0.2, y + boxSize * 0.5); 
  ctx.bezierCurveTo(
    x + boxSize * 0.1, y + boxSize * 0.1, 
    x + boxSize * 0.9, y + boxSize * 0.1, 
    x + boxSize * 0.8, y + boxSize * 0.5  
  );
  ctx.bezierCurveTo(
    x + boxSize * 1.1, y + boxSize * 0.9, 
    x - boxSize * 0.1, y + boxSize * 0.9, 
    x + boxSize * 0.2, y + boxSize * 0.5  
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 芒果蒂頭 (綠色短莖)
  ctx.fillStyle = "#3CB371"; 
  ctx.beginPath();
  ctx.moveTo(x + boxSize * 0.5, y + boxSize * 0.15);
  ctx.lineTo(x + boxSize * 0.4, y + boxSize * 0.05);
  ctx.lineTo(x + boxSize * 0.6, y + boxSize * 0.05);
  ctx.closePath();
  ctx.fill();
}


// === 遊戲主迴圈 (已加入背景繪製) ===
function gameLoop() {
  let newHead = { ...snake[0] };

  // 方向移動
  if (direction === "UP") newHead.y--;
  else if (direction === "DOWN") newHead.y++;
  else if (direction === "LEFT") newHead.x--;
  else if (direction === "RIGHT") newHead.x++;

  // 碰牆或撞自己
  if (
    newHead.x < 0 ||
    newHead.x >= cols ||
    newHead.y < 0 ||
    newHead.y >= rows ||
    snake.some((part) => part.x === newHead.x && part.y === newHead.y)
  ) {
    endGame();
    return;
  }

  // 吃到食物
  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    updateScore();
    generateFood();
  } else {
    snake.pop(); // 沒吃就刪掉尾巴
  }

  // 將新頭加到最前面
  snake.unshift(newHead);

  // 繪製順序：清空 -> 背景 -> 食物 -> 龍
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(); 
  drawMango(); 
  drawDragon();
}

// === 遊戲結束 ===
function endGame() {
  clearInterval(gameInterval);
  gameOverDiv.style.display = "block";
  startBtn.style.display = "none";
  gameStarted = false;
}


// === 鍵盤控制 (已修正防止視窗滾動和加速邏輯) ===
document.addEventListener("keydown", (e) => {
  if (!gameStarted) return; 

  let newDirection = direction;
  let speedChange = false;

  // 方向鍵控制與防止滾動
  if (e.key === "ArrowUp" && direction !== "DOWN") {
    newDirection = "UP";
    e.preventDefault(); 
  } else if (e.key === "ArrowDown" && direction !== "UP") {
    newDirection = "DOWN";
    e.preventDefault(); 
  } else if (e.key === "ArrowLeft" && direction !== "RIGHT") {
    newDirection = "LEFT";
    e.preventDefault(); 
  } else if (e.key === "ArrowRight" && direction !== "LEFT") {
    newDirection = "RIGHT";
    e.preventDefault(); 
  } 
  
  // 空白鍵加速控制
  else if (e.code === "Space") {
    e.preventDefault();
    if (!accelerating) {
        accelerating = true;
        speed = FAST_SPEED;
        speedChange = true;
    }
  }
  
  // 只有在方向改變時才更新方向 (防止蛇向後轉)
  if (newDirection !== direction) {
      direction = newDirection;
  }
  
  // 只有在速度改變時才重新設定計時器
  if (speedChange) {
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, speed);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    if (accelerating) {
        accelerating = false;
        speed = STANDARD_SPEED;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, speed); // 恢復到標準速度
    }
  }
});