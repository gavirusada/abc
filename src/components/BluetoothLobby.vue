<template>
  <div class="lobby-screen text-center">
    <h2 class="lobby-title">Multiplayer Lobby</h2>
    <p v-if="gameStore.bluetooth.status === 'disconnected'">Choose your role to begin.</p>
    <p v-if="gameStore.bluetooth.status === 'scanning'">Searching for opponents...</p>
    <p v-if="gameStore.bluetooth.status === 'connected'">Connected! Ready to play.</p>

    <div class="q-my-lg">
      <q-btn
        v-if="gameStore.bluetooth.status === 'disconnected'"
        class="action-btn q-mr-md"
        label="Host Game"
        @click="hostGame"
        size="md"
        outline
      />
      <q-btn
        v-if="gameStore.bluetooth.status === 'disconnected'"
        class="action-btn"
        label="Join Game"
        @click="joinGame"
        size="md"
        outline
      />
    </div>

    <!-- Device List -->
    <q-card v-if="gameStore.bluetooth.status === 'scanning'" flat bordered class="device-list">
      <q-card-section>
        <div class="text-h6">Available Devices</div>
      </q-card-section>
      <q-list separator>
        <q-item v-if="gameStore.bluetooth.availableDevices.length === 0" class="text-grey">
          <q-item-section>No devices found yet.</q-item-section>
        </q-item>
        <q-item
          v-for="device in gameStore.bluetooth.availableDevices"
          :key="device.id"
          clickable
          v-ripple
          @click="connectToDevice(device.id)"
        >
          <q-item-section>
            <q-item-label>{{ device.name }}</q-item-label>
            <q-item-label caption>{{ device.id }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
       <q-inner-loading :showing="gameStore.bluetooth.status === 'scanning'" label="Scanning..." />
    </q-card>

    <q-btn
      class="action-btn q-mt-xl"
      label="Back to Menu"
      @click="gameStore.resetGame()"
      size="md"
      flat
      color="grey"
    />

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGameStore } from 'src/stores/gameStore';
import { bluetoothService } from 'src/utils/bluetoothService';
import { useQuasar } from 'quasar';

const gameStore = useGameStore();
const $q = useQuasar();

const hostGame = async () => {
  $q.notify({ type: 'info', message: 'Starting host mode... (Mock)' });
  // In a real app, this would involve advertising a specific BLE service.
  // For this mock, we'll just start scanning as if we are waiting for a client.
  await bluetoothService.createHostService();
  await bluetoothService.startScan();
};

const joinGame = async () => {
  $q.notify({ type: 'info', message: 'Scanning for games...' });
  gameStore.setBluetoothRole('client');
  await bluetoothService.startScan();
};

const connectToDevice = async (deviceId) => {
  $q.notify({ type: 'info', message: `Connecting to ${deviceId}...` });
  await bluetoothService.connect(deviceId);
};

onMounted(async () => {
  // Initialize bluetooth when lobby is entered
  const permissionsGranted = await bluetoothService.requestPermissions();
  if (permissionsGranted) {
    await bluetoothService.initialize();
  } else {
    $q.notify({ type: 'negative', message: 'Bluetooth permissions are required for multiplayer.' });
    gameStore.resetGame(); // Go back to menu
  }
});
</script>

<style scoped>
.lobby-screen {
  color: #00ff00;
  width: 90%;
  max-width: 400px;
}
.lobby-title {
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  margin-bottom: 1rem;
}
.action-btn {
  color: #00ff00;
}
.device-list {
  background: #111;
  border-color: #00ff0030;
  color: #00ff00;
}
</style>
