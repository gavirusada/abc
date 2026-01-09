/**
 * @file src/utils/bluetoothService.js
 * @description Mock Bluetooth LE Service for Neo-Nokia Snake.
 * This file provides a mock structure for handling Bluetooth Low Energy (BLE)
 * functionality using @capacitor-community/bluetooth-le. It includes logic
 * for initializing, scanning, connecting, and communicating with other devices.
 *
 * NOTE: This is a scaffold. The actual Bluetooth LE implementation requires
 * handling permissions, platform-specific quirks, and robust error handling.
 */

import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { useGameStore } from 'src/stores/gameStore';

// TODO: Define a unique service and characteristic UUID for your game
const GAME_SERVICE_UUID = 'YOUR_UNIQUE_GAME_SERVICE_UUID_HERE';
const GAME_CHARACTERISTIC_UUID = 'YOUR_UNIQUE_GAME_CHARACTERISTIC_UUID_HERE';

const gameStore = useGameStore();

// Helper to convert strings to ArrayBuffer for sending data
const stringToData = (str) => {
  const buffer = new ArrayBuffer(str.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i);
  }
  return buffer;
};

// Helper to convert received ArrayBuffer back to a string
const dataToString = (buffer) => {
  return new TextDecoder().decode(buffer);
};

export const bluetoothService = {
  async requestPermissions() {
    try {
      const result = await BluetoothLe.requestPermissions();
      if (result.coarseLocation !== 'granted') {
        // Handle case where permissions were not granted
        console.error('Bluetooth permissions not granted');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  },

  async initialize() {
    try {
      await BluetoothLe.initialize();
      // TODO: Request permissions on mobile platforms
      // On web, this happens when calling requestDevice()
      console.log('Bluetooth LE Initialized');
    } catch (error) {
      console.error('Bluetooth LE Initialization failed:', error);
      gameStore.setConnectionStatus('error');
    }
  },

  async startScan() {
    try {
      gameStore.setConnectionStatus('scanning');
      gameStore.clearDevices();

      // On web, scanning is done via requestDevice
      if (Capacitor.getPlatform() === 'web') {
        const device = await BluetoothLe.requestDevice({
          // services: [GAME_SERVICE_UUID], // Filter by service
        });
        gameStore.addAvailableDevice({ id: device.deviceId, name: device.name || 'Unknown' });
        // In a real scenario, you might stop scanning here and try to connect
      } else {
        // On native, you can scan for multiple devices
        await BluetoothLe.requestLEScan({}, (result) => {
          if (result.device) {
            gameStore.addAvailableDevice({
              id: result.device.deviceId,
              name: result.device.name || 'Unknown Device',
            });
          }
        });

        // Stop scanning after a certain time
        setTimeout(async () => {
          await this.stopScan();
        }, 10000); // Scan for 10 seconds
      }
    } catch (error) {
      console.error('BLE Scan failed:', error);
      gameStore.setConnectionStatus('disconnected');
    }
  },

  async stopScan() {
    try {
      await BluetoothLe.stopLEScan();
      gameStore.setConnectionStatus('disconnected');
      console.log('BLE Scan stopped');
    } catch (error) {
      console.error('Failed to stop BLE scan:', error);
    }
  },

  async connect(deviceId) {
    try {
      gameStore.setConnectionStatus('connecting');
      await BluetoothLe.connect({ deviceId });
      // TODO: Discover services and characteristics
      gameStore.setConnectedDevice({ id: deviceId });
      console.log(`Connected to device: ${deviceId}`);

      // Start listening for notifications from the other player
      await this.startNotifications(deviceId);
    } catch (error) {
      console.error(`Failed to connect to ${deviceId}:`, error);
      gameStore.setConnectionStatus('disconnected');
    }
  },

  async disconnect(deviceId) {
    try {
      await BluetoothLe.disconnect({ deviceId });
      gameStore.setConnectionStatus('disconnected');
      gameStore.setConnectedDevice(null);
      console.log(`Disconnected from device: ${deviceId}`);
    } catch (error) {
      console.error(`Failed to disconnect from ${deviceId}:`, error);
    }
  },

  async sendData(deviceId, data) {
    try {
      const payload = stringToData(JSON.stringify(data));
      await BluetoothLe.write({
        deviceId,
        service: GAME_SERVICE_UUID,
        characteristic: GAME_CHARACTERISTIC_UUID,
        value: payload,
      });
    } catch (error) {
      console.error('Failed to send data:', error);
    }
  },

  async startNotifications(deviceId) {
    try {
      await BluetoothLe.startNotifications(
        {
          deviceId,
          service: GAME_SERVICE_UUID,
          characteristic: GAME_CHARACTERISTIC_UUID,
        },
        (value) => {
          const receivedData = JSON.parse(dataToString(value));
          // In a real app, you'd want to validate this data
          gameStore.setOpponentData(receivedData);
        }
      );
    } catch (error) {
      console.error('Failed to start notifications:', error);
    }
  },

  // --- Host Specific Logic ---
  async createHostService() {
    // NOTE: Peripheral mode (acting as a server/host) is not supported by the
    // core Web Bluetooth API and has limited support in Capacitor plugins.
    // This is a placeholder for a more complex setup, potentially involving a native-only implementation.
    console.warn('Host mode (peripheral) is not widely supported. This is a mock function.');
    // In a real scenario, you'd advertise the GAME_SERVICE_UUID.
    gameStore.setBluetoothRole('host');
    // For a 1v1 game, the "host" might just be the first person to initiate.
    // Both could scan, and the one with the alphabetically lower device name connects to the other.
  },
};
