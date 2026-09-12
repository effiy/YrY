<template>
  <div class="error-empty">
    <el-empty :image-size="imageSize" :description="description">
      <template v-if="$slots.default || actionText" #default>
        <slot>
          <el-button v-if="actionText" type="primary" @click="$emit('action')">
            {{ actionText }}
          </el-button>
        </slot>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string;
  imageSize?: number;
  actionText?: string;
}

withDefaults(defineProps<Props>(), {
  description: "暂无数据",
  imageSize: 120,
});

defineEmits<{
  action: [];
}>();
</script>

<style scoped>
.error-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: 200px;
}
</style>