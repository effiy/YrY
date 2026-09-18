<template>
  <div class="not-container">
    <img :src="imgSrc" class="not-img" :alt="String(code)" />
    <div class="not-detail">
      <h2>{{ code }}</h2>
      <h4>{{ description }}</h4>
      <el-button type="primary" @click="router.back">Go Back</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="ErrorPage">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const code = computed(() => (route.meta.errorCode as number) || 404);
const description = computed(() => (route.meta.errorDescription as string) || "Sorry, the page you visited does not exist~");

const imgSrc = computed(() => {
  try {
    return new URL(`@/assets/images/${code.value}.png`, import.meta.url).href;
  } catch {
    return "";
  }
});
</script>

<style scoped lang="scss">
.not-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  .not-img {
    margin-right: 120px;
  }
  .not-detail {
    display: flex;
    flex-direction: column;
    h2,
    h4 {
      padding: 0;
      margin: 0;
    }
    h2 {
      font-size: 60px;
      color: var(--el-text-color-primary);
    }
    h4 {
      margin: 30px 0 20px;
      font-size: 19px;
      font-weight: normal;
      color: var(--el-text-color-regular);
    }
    .el-button {
      width: 100px;
    }
  }
}
</style>