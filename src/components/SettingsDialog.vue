<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 300px; background-color: #1a1a1a; color: #00ff00;">
      <q-card-section class="text-h6 text-center text-weight-bold q-py-md" style="border-bottom: 1px solid #00ff0030;">
        Settings
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Game Speed</div>
        <q-btn-toggle
          v-model="speed"
          @update:model-value="updateSettings"
          push
          glossy
          toggle-color="primary"
          :options="[
            {label: 'Turtle', value: 'Turtle'},
            {label: 'Rabbit', value: 'Rabbit'},
            {label: 'Cheetah', value: 'Cheetah'}
          ]"
          class="full-width"
        />
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Controls</div>
        <q-btn-toggle
          v-model="controls"
          @update:model-value="updateSettings"
          push
          glossy
          toggle-color="primary"
          :options="[
            {label: 'D-Pad', value: 'd-pad'},
            {label: 'Swipe', value: 'swipe'}
          ]"
          class="full-width"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md" style="border-top: 1px solid #00ff0030;">
        <q-btn color="primary" flat label="Done" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useGameStore } from 'src/stores/gameStore';

defineEmits([
  ...useDialogPluginComponent.emits,
]);

const { dialog, onDialogHide, onDialogOK } = useDialogPluginComponent();
const gameStore = useGameStore();

const speed = ref(gameStore.settings.speed);
const controls = ref(gameStore.settings.controls);

const updateSettings = () => {
  gameStore.setSettings({
    speed: speed.value,
    controls: controls.value,
  });
};

function onOKClick() {
  updateSettings();
  onDialogOK();
}
</script>

<style scoped>
.q-btn-toggle :deep(.q-btn) {
  background: #2b2b2b;
  color: #00ff00;
  flex-grow: 1;
}
.q-btn-toggle :deep(.q-btn.q-btn--active) {
  background: #00ff00 !important;
  color: #1a1a1a !important;
}
</style>
