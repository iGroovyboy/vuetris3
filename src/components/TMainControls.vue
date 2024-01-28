<template>
  <div class="buttons">
    <button
      class="btn"
      v-show="!isOn || (!isOn && !isPause)"
      @click="$emit('play')"
      v-text="playBtnText"
    />
    <button
      class="btn"
      v-show="isOn && isPause"
      @click="$emit('resume')"
      v-text="resumeBtnText"
    />
    <button
      class="btn"
      v-show="isOn && !isPause"
      @click="$emit('pause')"
      v-text="pauseBtnText"
    />
    <button
      class="btn"
      v-show="isOn"
      @click="$emit('stop')"
      v-text="stopBtnText"
    />
  </div>
</template>
<script setup lang="ts">
defineProps({
  isOn: Boolean,
  isPause: Boolean,
});

defineEmits(["play", "resume", "pause", "stop"]);

const playBtnText = "Play";
const pauseBtnText = "Pause";
const resumeBtnText = "Resume";
const stopBtnText = "Stop";
</script>
<style scoped>
.buttons {
  display: flex;
}

.btn {
  background-color: orange;
  border: 2px solid black;
  padding: 5px 20px;
  margin: 10px;
  font-size: 1rem;
  font-weight: 600;
  min-width: 110px;
}
</style>
