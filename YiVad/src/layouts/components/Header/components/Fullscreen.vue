<template>
  <div class="fullscreen">
    <i :class="['iconfont', isFullscreen ? 'icon-suoxiao' : 'icon-fangda']" class="toolBar-icon" @click="handleFullScreen"></i>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { ElMessage } from "element-plus";
import screenfull from "screenfull";

const isFullscreen = ref(screenfull.isFullscreen);

const handleChange = () => {
  isFullscreen.value = screenfull.isFullscreen;
};

onMounted(() => {
  screenfull.on("change", handleChange);
});

onBeforeUnmount(() => {
  screenfull.off("change", handleChange);
});

const handleFullScreen = () => {
  if (!screenfull.isEnabled) ElMessage.warning("Your browser does not support fullscreen ❌");
  screenfull.toggle();
};
</script>
