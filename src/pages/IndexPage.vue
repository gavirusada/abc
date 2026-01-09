<template>
  <q-page class="flex column items-center justify-center" style="background-color: #000;">

    <!-- Intro / Main Menu -->
    <div v-if="gameStore.isIntro" class="intro-screen text-center">
      <h1 class="game-titlegsap">Neo-Nokia Snake</h1>
      <p class="game-subtitle gsap">Multiplayer Edition</p>

      <div class="input-group gsap">
        <q-input
          dark
          standout
          v-model="playerName"
          @update:model-value="gameStore.setPlayerName(playerName)"
          label="Enter Player Name"
          class="q-my-lg"
          input-class="text-center"
        />
      </div>

      <div class="button-group gsap">
        <q-btn
          class="action-btn q-mb-md"
          label="Single Player"
          @click="gameStore.startGame()"
          size="lg"
        />
        <q-btn
          class="action-btn"
          label="Multiplayer (1v1)"
          @click="gameStore.enterLobby()"
          size="lg"
          outline
        />
      </div>
      <q-btn flat round icon="settings" @click="showSettings" class="settings-btn gsap" />
    </div>

    <!-- Bluetooth Lobby -->
    <BluetoothLobby v-if="gameStore.isLobby" />

    <!-- Game Over Screen -->
    <div v-if="gameStore.isGameOver" class="game-over-screen text-center">
        <h2 class="game-over-title">Game Over</h2>
        <p class="score-display">Your Score: {{ gameStore.score }}</p>
        <p class="score-display">High Score: {{ gameStore.highScore }}</p>
        <q-btn
            class="action-btn q-mt-lg"
            label="Play Again"
            @click="gameStore.resetGame()"
            size="lg"
        />
    </div>


    <!-- Main Gameplay Area -->
    <div v-if="gameStore.isPlaying" class="game-area">
      <header class="game-header">
        <div class="score">Score: {{ gameStore.score }}</div>
        <div class="high-score">High Score: {{ gameStore.highScore }}</div>
        <q-btn flat round icon="settings" @click="showSettings" />
      </header>

      <GameCanvas ref="gameCanvas" @game-over="gameStore.gameOver()" class="game-canvas"/>

      <footer class="game-footer">
        <VirtualControls
          v-if="gameStore.settings.controls === 'd-pad'"
          @change-direction="onDirectionChange"
        />
      </footer>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useGameStore } from 'src/stores/gameStore';
import gsap from 'gsap';

import GameCanvas from 'src/components/GameCanvas.vue';
import VirtualControls from 'src/components/VirtualControls.vue';
import SettingsDialog from 'src/components/SettingsDialog.vue';
import BluetoothLobby from 'src/components/BluetoothLobby.vue';

const $q = useQuasar();
const gameStore = useGameStore();

const playerName = ref(gameStore.playerName);
const gameCanvas = ref(null);

const onDirectionChange = (direction) => {
  if (gameCanvas.value) {
    gameCanvas.value.changeDirection(direction);
  }
};

const showSettings = () => {
  $q.dialog({
    component: SettingsDialog,
  });
};

onMounted(() => {
  if (gameStore.isIntro) {
    // Cinematic intro animation
    gsap.from('.gsap', {
      duration: 0.8,
      opacity: 0,
      y: 50,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.2
    });
  }
});
</script>

<style scoped>
.intro-screen, .game-over-screen, .lobby-screen {
  color: #00ff00;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90%;
  max-width: 350px;
}

.game-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  margin-bottom: 0;
}

.game-subtitle {
  font-size: 1rem;
  color: #00ff00aa;
  margin-top: 0;
  margin-bottom: 2rem;
}

.game-over-title {
    font-size: 3rem;
    font-weight: 700;
    text-shadow: 0 0 10px #ff003d, 0 0 20px #ff003d;
    color: #ff003d;
}

.score-display {
    font-size: 1.5rem;
    color: #00ff00;
}

.action-btn {
  width: 100%;
  background: #00ff00;
  color: #000;
  font-weight: bold;
}
.action-btn.q-btn--outline {
    background: transparent;
    color: #00ff00;
}

.settings-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #00ff00;
}

.game-area {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 100vh;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  color: #00ff00;
  width: 100%;
  font-size: 1rem;
}

.game-canvas {
  flex-grow: 1;
  width: 100%;
}

.game-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  min-height: 200px;
}
</style>