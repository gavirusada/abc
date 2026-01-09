<template>
  <div class="virtual-controls-grid">
    <div class="grid-row">
      <div class="grid-item"></div>
      <div class="grid-item">
        <q-btn
          class="control-btn"
          unelevated
          icon="keyboard_arrow_up"
          @click="onDirectionChange('up')"
        />
      </div>
      <div class="grid-item"></div>
    </div>
    <div class="grid-row">
      <div class="grid-item">
        <q-btn
          class="control-btn"
          unelevated
          icon="keyboard_arrow_left"
          @click="onDirectionChange('left')"
        />
      </div>
      <div class="grid-item"></div>
      <div class="grid-item">
        <q-btn
          class="control-btn"
          unelevated
          icon="keyboard_arrow_right"
          @click="onDirectionChange('right')"
        />
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-item"></div>
      <div class="grid-item">
        <q-btn
          class="control-btn"
          unelevated
          icon="keyboard_arrow_down"
          @click="onDirectionChange('down')"
        />
      </div>
      <div class="grid-item"></div>
    </div>
  </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const emit = defineEmits(['change-direction']);

const onDirectionChange = async (direction) => {
  emit('change-direction', direction);

  try {
    // Use a light impact for subtle feedback
    await Haptics.impact({ style: ImpactStyle.Light });
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    // Haptics not available or failed
    console.log('Haptics not available on this device.');
  }
};
</script>

<style scoped>
.virtual-controls-grid {
  display: flex;
  flex-direction: column;
  width: 180px;
  height: 180px;
  opacity: 0.7;
}

.grid-row {
  display: flex;
  flex: 1;
}

.grid-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn {
  width: 95%;
  height: 95%;
  background-color: rgba(0, 255, 13, 0.2);
  color: #00ff00;
  border-radius: 10px;
  border: 1px solid #00ff0080;
}

.control-btn:active {
  background-color: rgba(0, 255, 13, 0.5);
}
</style>
