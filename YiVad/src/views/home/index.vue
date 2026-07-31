<template>
  <div class="home card">
    <div class="home__hero">
      <img class="home-bg" src="@/assets/images/welcome.png" alt="welcome" />
    </div>
    <router-link to="/knowledge" class="home-entry">
      <div class="home-entry__icon">Y</div>
      <div class="home-entry__text">
        <div class="home-entry__title">YiKnowledge</div>
        <div class="home-entry__sub">行业 / 教训 / 方法论 / 人脉 / 产品 / 资源 / 技术 / 工作</div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts" name="home"></script>

<style scoped lang="scss">
@use "./index.scss" as *;
.home-entry {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 2;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  color: inherit;
  text-decoration: none;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  transition: all 0.18s ease;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 6px 18px rgb(0 0 0 / 10%);
    transform: translateY(-1px);
  }
  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border-radius: 8px;
  }
  &__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }
  &__sub {
    max-width: 260px;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

@media (width <= 768px) {
  .home-entry {
    right: 16px;
    bottom: 16px;
    padding: 10px 12px;
    &__sub {
      display: none;
    }
  }
}
</style>
