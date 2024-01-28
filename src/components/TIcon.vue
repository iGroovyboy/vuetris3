<template>
  <i v-html="image" />
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
});

const importAllImages = import.meta.glob("../assets/*.svg", {
  as: "raw",
  eager: true,
});

const image = computed(() => {
  const importImage = importAllImages[`../assets/${props?.icon}.svg`];
  if (importImage) {
    return importImage;
  }

  return null;
});
</script>

<style scoped>
i {
  width: 2rem;
  height: 2rem;
}
</style>
