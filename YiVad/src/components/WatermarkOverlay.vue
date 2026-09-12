<template>
  <div
    v-if="isEnabled"
    ref="overlayRef"
    class="watermark-overlay"
    :style="overlayStyle"
    aria-hidden="true"
    role="presentation"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useWatermark } from "@/composables/useWatermark";

const { isEnabled, overlayStyle, setupTamperProtection } = useWatermark();
const overlayRef = ref<HTMLElement>();

onMounted(() => {
  if (overlayRef.value) {
    setupTamperProtection(overlayRef.value);
  }
});
</script>

<style scoped>
.watermark-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
}
</style>