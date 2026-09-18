<template>
  <div class="detail-skel">
    <div class="detail-skel-header">
      <div class="detail-skel-line detail-skel-line--short" />
      <div class="detail-skel-line detail-skel-line--long" />
      <div class="detail-skel-row">
        <div class="detail-skel-tag" v-for="i in 3" :key="i" />
      </div>
    </div>
    <div class="detail-skel-body">
      <div class="detail-skel-main">
        <div class="detail-skel-card" v-for="i in 3" :key="i">
          <div class="detail-skel-line detail-skel-line--med" />
          <div class="detail-skel-line detail-skel-line--long" />
          <div class="detail-skel-line detail-skel-line--long" />
          <div class="detail-skel-line detail-skel-line--med" />
        </div>
      </div>
      <div class="detail-skel-sidebar">
        <div class="detail-skel-card" v-for="i in 3" :key="i">
          <div class="detail-skel-line detail-skel-line--med" />
          <div class="detail-skel-line detail-skel-line--short" />
          <div class="detail-skel-line detail-skel-line--short" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="DetailSkeleton"></script>

<style scoped lang="scss">
.detail-skel {
  animation: detail-skel-fade-in 0.3s ease;
}
.detail-skel-header {
  padding: 24px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.detail-skel-line {
  height: 14px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: detail-skel-shimmer 1.5s infinite;
  &--short {
    width: 30%;
  }
  &--med {
    width: 55%;
  }
  &--long {
    width: 80%;
  }
}
.detail-skel-tag {
  display: inline-block;
  width: 60px;
  height: 22px;
  margin-right: 8px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: detail-skel-shimmer 1.5s infinite;
}
.detail-skel-row {
  display: flex;
  gap: 8px;
}
.detail-skel-body {
  display: flex;
  gap: 20px;
}
.detail-skel-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}
.detail-skel-sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 12px;
  width: 280px;
}
.detail-skel-card {
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}

@keyframes detail-skel-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes detail-skel-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
