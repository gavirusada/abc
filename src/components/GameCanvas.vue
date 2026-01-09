<template>
  <div class="canvas-container" :class="{ 'shake': isShaking }">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from 'src/stores/gameStore';
import { useSwipe } from '@vueuse/core';
import { bluetoothService } from 'src/utils/bluetoothService';

const props = defineProps({
  gridSize: {
    type: Number,
    default: 20,
  },
});

const emit = defineEmits(['game-over']);

const canvasRef = ref(null);
const gameStore = useGameStore();

const speedSettings = {
  Turtle: 200, // ms per grid update
  Rabbit: 120,
  Cheetah: 70,
};

let ctx = null;
let animationFrameId = null;
let lastUpdateTime = 0;
let timeSinceLastUpdate = 0;

let snake, direction, particles;
const isShaking = ref(false);

const resetGameState = () => {
  const startX = gameStore.bluetooth.role === 'host' ? 5 : props.gridSize - 5;
  const startY = Math.floor(props.gridSize / 2);
  snake = {
    body: [{ x: startX, y: startY }],
    head: { x: startX, y: startY },
  };
  direction = { x: 0, y: -1 }; // Start moving up
  if (gameStore.bluetooth.role !== 'client') {
    placeApple();
  }
  particles = [];
};

const placeApple = () => {
  let newPosition;
  do {
    newPosition = {
      x: Math.floor(Math.random() * props.gridSize),
      y: Math.floor(Math.random() * props.gridSize),
    };
  } while (isPositionOnSnake(newPosition));
  // Update the central store so both players have the same apple
  gameStore.setApple(newPosition);
};

const isPositionOnSnake = (pos) => {
  return snake.body.some(segment => segment.x === pos.x && segment.y === pos.y);
};

const triggerScreenShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 500); // Shake duration
};

const createParticles = (x, y) => {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      alpha: 1,
      size: Math.random() * 3 + 1,
    });
  }
};

const gameLoop = (timestamp) => {
  const gameSpeed = speedSettings[gameStore.settings.speed];
  timeSinceLastUpdate += timestamp - lastUpdateTime;
  lastUpdateTime = timestamp;

  if (timeSinceLastUpdate > gameSpeed) {
    timeSinceLastUpdate = 0;
    updateGame();
  }

  drawGame();
  animationFrameId = requestAnimationFrame(gameLoop);
};

const updateGame = () => {
  const newHead = {
    x: snake.head.x + direction.x,
    y: snake.head.y + direction.y,
  };

  // Wall collision
  if (newHead.x < 0 || newHead.x >= props.gridSize || newHead.y < 0 || newHead.y >= props.gridSize) {
    triggerScreenShake();
    emit('game-over');
    return;
  }

  // Self collision
  if (isPositionOnSnake(newHead)) {
    triggerScreenShake();
    emit('game-over');
    return;
  }

  snake.body.unshift(newHead);
  snake.head = newHead;

  const apple = gameStore.apple;

  // Apple collision
  if (newHead.x === apple.x && newHead.y === apple.y) {
    gameStore.incrementScore();
    const cellSize = canvasRef.value.width / props.gridSize;
    createParticles(apple.x * cellSize + cellSize / 2, apple.y * cellSize + cellSize / 2);
    // Only host places the new apple to ensure sync
    if (gameStore.bluetooth.role !== 'client') {
       placeApple();
    }
  } else {
    snake.body.pop();
  }

  // Send data in multiplayer
  if (gameStore.bluetooth.status === 'connected') {
    const dataToSend = { snake: snake.body };
    // Host is responsible for sending apple position
    if (gameStore.bluetooth.role !== 'client') {
      dataToSend.apple = gameStore.apple;
    }
    bluetoothService.sendData(gameStore.bluetooth.connectedDevice.id, dataToSend);
  }
};

const drawGame = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const cellSize = canvas.width / props.gridSize;

  // Clear canvas
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw apple
  const apple = gameStore.apple;
  if (apple.x !== -1) {
    ctx.fillStyle = '#ff003d'; // Neon Red
    ctx.shadowColor = '#ff003d';
    ctx.shadowBlur = 15;
    ctx.fillRect(apple.x * cellSize, apple.y * cellSize, cellSize, cellSize);
    ctx.shadowBlur = 0;
  }

  // Draw Opponent's snake
  if (gameStore.bluetooth.status === 'connected') {
    ctx.fillStyle = '#00ffff'; // Neon Blue
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    gameStore.opponent.body.forEach(segment => {
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
    ctx.shadowBlur = 0;
  }

  // Draw player's snake
  ctx.fillStyle = '#00ff00'; // Neon Green
  ctx.shadowColor = '#00ff00';
  ctx.shadowBlur = 10;
  snake.body.forEach(segment => {
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
  });
  ctx.shadowBlur = 0;

  // Draw particles
  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    if (p.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1.0;
    }
  });
};

const changeDirection = (newDir) => {
  const goingUp = direction.y === -1;
  const goingDown = direction.y === 1;
  const goingLeft = direction.x === -1;
  const goingRight = direction.x === 1;

  if (newDir === 'up' && !goingDown) direction = { x: 0, y: -1 };
  if (newDir === 'down' && !goingUp) direction = { x: 0, y: 1 };
  if (newDir === 'left' && !goingRight) direction = { x: -1, y: 0 };
  if (newDir === 'right' && !goingLeft) direction = { x: 1, y: 0 };
};

// Expose changeDirection to be called from parent
defineExpose({ changeDirection });

// Swipe controls
useSwipe(canvasRef, {
  onSwipeEnd: (e, dir) => {
    if (gameStore.settings.controls !== 'swipe') return;
    switch (dir) {
      case 'up':
        changeDirection('up');
        break;
      case 'down':
        changeDirection('down');
        break;
      case 'left':
        changeDirection('left');
        break;
      case 'right':
        changeDirection('right');
        break;
    }
  },
});

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  canvasRef.value.width = size;
  canvasRef.value.height = size;
  resetGameState();
  lastUpdateTime = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});

// Watch for game state changes to restart the loop
watch(() => gameStore.isPlaying, (playing) => {
  if (playing) {
    resetGameState();
    lastUpdateTime = performance.now();
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  } else {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});
</script>

<style scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
canvas {
  background-color: #0a0a0a;
  border: 2px solid #00ff0030;
  border-radius: 5px;
}

.shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
