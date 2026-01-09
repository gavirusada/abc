import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    playerName: 'Player1',
    score: 0,
    highScore: 0,
    // intro, lobby, playing, game-over
    gameState: 'intro',
    settings: {
      // 'Turtle', 'Rabbit', 'Cheetah'
      speed: 'Rabbit',
      // 'd-pad', 'swipe'
      controls: 'd-pad',
    },
    bluetooth: {
      // 'disconnected', 'scanning', 'connecting', 'connected'
      status: 'disconnected',
      // 'host', 'client'
      role: null,
      availableDevices: [],
      connectedDevice: null,
    },
    opponent: {
      body: [],
    },
    apple: { x: -1, y: -1 },
  }),

  getters: {
    isIntro: (state) => state.gameState === 'intro',
    isPlaying: (state) => state.gameState === 'playing',
    isGameOver: (state) => state.gameState === 'game-over',
    isLobby: (state) => state.gameState === 'lobby',
    getSpeedMultiplier: (state) => {
      switch (state.settings.speed) {
        case 'Turtle':
          return 1;
        case 'Rabbit':
          return 1.5;
        case 'Cheetah':
          return 2.5;
        default:
          return 1;
      }
    },
  },

  actions: {
    setPlayerName(name) {
      if (name && name.trim().length > 0) {
        this.playerName = name.trim();
      }
    },
    setSettings({ speed, controls }) {
      if (speed) this.settings.speed = speed;
      if (controls) this.settings.controls = controls;
    },
    startGame() {
      this.score = 0;
      this.gameState = 'playing';
    },
    gameOver() {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        // Potentially save to local storage here
      }
      this.gameState = 'game-over';
    },
    incrementScore(points = 10) {
      this.score += points * this.getSpeedMultiplier;
    },
    resetGame() {
      this.gameState = 'intro';
      this.score = 0;
    },
    enterLobby() {
      this.gameState = 'lobby';
    },

    // --- Bluetooth Actions ---
    setBluetoothRole(role) {
      this.role = role;
      this.bluetooth.status = 'scanning';
    },
    addAvailableDevice(device) {
      // Ensure no duplicates
      if (!this.bluetooth.availableDevices.find((d) => d.id === device.id)) {
        this.bluetooth.availableDevices.push(device);
      }
    },
    setConnectionStatus(status) {
      this.bluetooth.status = status;
    },
    setConnectedDevice(device) {
      this.connectedDevice = device;
      this.bluetooth.status = 'connected';
    },
    clearDevices() {
      this.bluetooth.availableDevices = [];
    },
    setOpponentData(data) {
      if (data.snake) {
        this.opponent.body = data.snake;
      }
      if (data.apple) {
        this.setApple(data.apple);
      }
    },
    setApple(applePosition) {
      this.apple = applePosition;
    }
  },
});
