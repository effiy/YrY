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

<!--
  2026-10 Phase 2 P2-7 命名家族化：
  Skeleton/ 目录下已有 SkeletonCard / SkeletonList / SkeletonTable，本组件原
  DetailSkeleton.vue（散落在 components/ 根）迁入 Skeleton/ 并改名 SkeletonDetail
  保持家族一致，符合「语义化命名、禁用零散平铺」的 ADR 约定。

  旧组件名 DetailSkeleton 仍在 typings/components.d.ts 中残留，会在下次
  rsbuild dev/build 由 unplugin-vue-components 自动删除（只要无引用）。
-->
<script setup lang="ts" name="SkeletonDetail"></script>

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
  animation: skeleton-shimmer 1.5s infinite;
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
  animation: skeleton-shimmer 1.5s infinite;
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

// skeleton-shimmer keyframes come from global styles/skeleton.scss

@keyframes detail-skel-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
