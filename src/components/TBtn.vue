<template>
  <div class="area">
    <TIcon :icon="icon" :class="className" />
  </div>
</template>

<script setup lang="ts">
import TIcon from "@/components/TIcon.vue";

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: false,
  },
});
</script>

<style scoped>
.area {
  width: 5rem;
  height: 5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #14ff00;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.6);
  border-radius: 50%;

  margin: 1rem;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.left {
  transform: rotate(180deg);
}

.down {
  transform: rotate(90deg);
}
</style>
