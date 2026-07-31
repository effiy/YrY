<script setup lang="ts" name="claudeEmbed">
</script>

<template>
  <div class="iframe-container">
    <iframe src="https://claude.ai" frameborder="0" class="full-iframe" />
  </div>
</template>

<style scoped lang="scss">
.iframe-container {
  width: 100%;
  height: calc(100vh - 100px);
}
.full-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
