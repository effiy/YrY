<template>
  <div class="showcase-page">
    <el-page-header @back="$router.back()" title="Showcase" content="Directives" />

    <el-alert
      type="info" :closable="false" show-icon class="sc-alert"
      title="Custom directives add reusable behavior to any element. All directives are in src/directives/modules/."
    />

    <!-- v-copy -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="primary">v-copy</el-tag> One-click copy to clipboard</h3></template>
      <p class="sc-desc">Click any element with <code>v-copy</code> to copy its text content or a specified value.</p>
      <div class="sc-demo">
        <el-input v-model="copyText" placeholder="Type something..." style="width:300px" />
        <el-button v-copy="copyText" type="success" style="margin-left:12px">
          <el-icon><DocumentCopy /></el-icon> Copy to Clipboard
        </el-button>
      </div>
    </el-card>

    <!-- v-debounce -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="success">v-debounce</el-tag> Debounced click handlers</h3></template>
      <p class="sc-desc">Prevents rapid repeated clicks. The counter only increments after 500ms of inactivity.</p>
      <div class="sc-demo">
        <el-button v-debounce="handleDebounce" type="primary">Debounced Click (500ms)</el-button>
        <span class="sc-counter">Clicks: <strong>{{ debounceCount }}</strong></span>
      </div>
    </el-card>

    <!-- v-throttle -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="warning">v-throttle</el-tag> Throttled event handling</h3></template>
      <p class="sc-desc">Limits execution to once per interval. Rapid clicks are throttled to once per second.</p>
      <div class="sc-demo">
        <el-button v-throttle="handleThrottle" type="warning">Throttled Click (1s)</el-button>
        <span class="sc-counter">Clicks: <strong>{{ throttleCount }}</strong></span>
      </div>
    </el-card>

    <!-- v-longpress -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="danger">v-longpress</el-tag> Long-press trigger</h3></template>
      <p class="sc-desc">Press and hold for 1.5 seconds to trigger. Useful for context menus and delete confirmations.</p>
      <div class="sc-demo">
        <el-button v-longpress="handleLongpress" type="danger">Press & Hold (1.5s)</el-button>
        <span class="sc-counter">Triggers: <strong>{{ longpressCount }}</strong></span>
      </div>
    </el-card>

    <!-- v-watermark -->
    <el-card class="sc-section">
      <template #header><h3><el-tag>v-watermark</el-tag> Watermark overlay</h3></template>
      <p class="sc-desc">Adds a semi-transparent text watermark to any container element.</p>
      <div v-watermark="{ text: 'YiVad Internal', font: '20px sans-serif', color: '#409EFF' }" class="sc-watermark-demo">
        <p>This area is protected by a watermark overlay.</p>
      </div>
    </el-card>

    <!-- v-auth -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="info">v-auth</el-tag> Permission-based visibility</h3></template>
      <p class="sc-desc">Shows/hides elements based on button permissions. Requires auth store with loaded permissions.</p>
      <div class="sc-demo">
        <el-button type="primary">Always visible</el-button>
        <el-button v-auth="'admin:delete'" type="danger">admin:delete only</el-button>
      </div>
    </el-card>

    <!-- v-draggable -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="success">v-draggable</el-tag> Drag-and-drop reorder</h3></template>
      <p class="sc-desc">Enables drag-and-drop reordering on list elements.</p>
      <div style="display:flex;flex-direction:column;gap:4px;width:100%">
        <div v-for="(item, idx) in dragList" :key="item" class="drag-demo-item">
          <el-icon><Rank /></el-icon> {{ item }}
        </div>
        <el-button size="small" text @click="shuffleDrag" style="margin-top:4px">Shuffle Order</el-button>
      </div>
    </el-card>

    <!-- v-sticky + v-lazyLoad reference -->
    <el-card class="sc-section">
      <template #header><h3><el-tag>v-sticky</el-tag> + <el-tag type="warning">v-lazyLoad</el-tag> More directives</h3></template>
      <p class="sc-desc"><strong>v-sticky:</strong> Keeps elements fixed within scroll containers. <strong>v-lazyLoad:</strong> Defers rendering until elements enter the viewport. Both are available in <code>src/directives/modules/</code>.</p>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="directivesShowcase">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { DocumentCopy, Rank } from "@element-plus/icons-vue";

const copyText = ref("Hello from YiVad!");
const debounceCount = ref(0);
const throttleCount = ref(0);
const longpressCount = ref(0);
const dragList = ref(["Task Alpha", "Task Beta", "Task Gamma", "Task Delta"]);

function handleDebounce() { debounceCount.value++; ElMessage.success(`Debounced #${debounceCount.value}`); }
function handleThrottle() { throttleCount.value++; ElMessage(`Throttled #${throttleCount.value}`); }
function handleLongpress() { longpressCount.value++; ElMessage.warning(`Long-press #${longpressCount.value}`); }
function shuffleDrag() { dragList.value = [...dragList.value].sort(() => Math.random() - 0.5); }
</script>

<style scoped lang="scss">
@use "./showcase.scss";

.sc-counter { font-size: 14px; color: var(--el-text-color-regular); }
.sc-watermark-demo {
  width: 100%; min-height: 160px;
  display: flex; align-items: center; justify-content: center;
  background: var(--el-fill-color-lighter); border-radius: 8px;
  border: 1px dashed var(--el-border-color);
  p { color: var(--el-text-color-secondary); font-size: 14px; }
}
.drag-demo-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter); border-radius: 4px;
  font-size: 13px; cursor: grab;
  &:hover { background: var(--el-fill-color-light); }
}
</style>