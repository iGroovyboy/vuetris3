<template>
  <div class="mobile">
    <TBtn v-if="canPlay" icon="play" @click="$emit('play')" />

    <template v-else>
      <div class="row">
        <TBtn icon="arrow" class-name="left" @click="$emit(DIRECTION.Left)" />
        <TBtn icon="rotate" @click="$emit(DIRECTION.Rotate)" />
        <TBtn icon="arrow" @click="$emit(DIRECTION.Right)" />
      </div>
      <div class="row">
        <TBtn v-if="isOn && !isPause" icon="pause" @click="$emit('pause')" />
        <TBtn v-if="isOn && isPause" icon="resume" @click="$emit('resume')" />
        <TBtn icon="arrow" class-name="down" @click="$emit(DIRECTION.Down)" />
        <TBtn icon="stop" @click="$emit('stop')" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import TBtn from "./TBtn.vue";
import { computed } from "vue";
import { DIRECTION } from "../util/constants.ts";

const props = defineProps({
  isOn: Boolean,
  isPause: Boolean,
});

defineEmits([
  "play",
  "resume",
  "pause",
  "stop",
  DIRECTION.Left,
  DIRECTION.Right,
  DIRECTION.Down,
  DIRECTION.Rotate,
]);

const canPlay = computed(() => {
  return !props.isOn || (!props.isOn && !props.isPause);
});
</script>

<style scoped>
.mobile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.row {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.area {
  width: 5rem;
  height: 5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #14ff00;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  margin: 1rem;
}
</style>
