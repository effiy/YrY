<script setup lang="ts">
defineProps<{
  tags: { name: string; count: number }[];
  pairs: { item1: string; item2: string; count: number }[];
  title: string;
  colorFn?: (name: string) => string;
}>();

const emit = defineEmits<{
  (e: "selectTag", name: string): void;
}>();

function fontSize(count: number, maxCount: number): number {
  if (maxCount <= 0) return 10;
  const ratio = count / maxCount;
  return 10 + ratio * 14; // 10px to 24px
}
</script>

<template>
  <div class="tag-cloud-wrap">
    <!-- Weighted Tag Chips -->
    <div class="tc-header">
      <span class="tc-title">{{ title }}</span>
      <span class="tc-hint">click to filter</span>
    </div>
    <div class="tc-cloud">
      <span
        v-for="t in tags.slice(0, 20)"
        :key="t.name"
        class="tc-chip"
        :style="{
          fontSize: fontSize(t.count, tags[0]?.count ?? 1) + 'px',
          color: colorFn ? colorFn(t.name) : '#5470c6',
        }"
        @click="emit('selectTag', t.name)"
        :title="`${t.name}: ${t.count} files`"
      >
        {{ t.name }}
        <span class="tc-chip-count">{{ t.count }}</span>
      </span>
    </div>

    <!-- Co-occurring Pairs -->
    <div class="tc-pairs" v-if="pairs.length > 0">
      <div class="tc-pairs-title">Top Co-occurring Pairs</div>
      <table class="tc-pairs-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Pair</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in pairs.slice(0, 10)" :key="i">
            <td class="num">{{ i + 1 }}</td>
            <td>
              <span class="tc-pair-tag" @click="emit('selectTag', p.item1)">{{ p.item1 }}</span>
              <span class="tc-pair-sep">+</span>
              <span class="tc-pair-tag" @click="emit('selectTag', p.item2)">{{ p.item2 }}</span>
            </td>
            <td class="num">{{ p.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tag-cloud-wrap {
  padding: 4px 0;
}

.tc-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.tc-title {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}

.tc-hint {
  font-size: 10px;
  color: #909399;
}

.tc-cloud {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  padding: 6px 0;
}

.tc-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  cursor: pointer;
  font-weight: 500;
  padding: 1px 4px;
  border-radius: 4px;
  transition: all 0.12s;
  line-height: 1.3;

  &:hover {
    background: var(--el-color-primary-light-9);
    transform: scale(1.08);
  }
}

.tc-chip-count {
  font-size: 0.6em;
  color: #909399;
  font-weight: 400;
}

.tc-pairs {
  margin-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
}

.tc-pairs-title {
  font-size: 11px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.tc-pairs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;

  th, td {
    padding: 3px 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: #909399;
    font-weight: 500;
    font-size: 10px;
    background: var(--el-fill-color-light);
  }

  td { color: #303133; }

  tr {
    transition: background 0.1s;
    &:hover { background: var(--el-fill-color-light); }
  }

  .num { text-align: right; font-variant-numeric: tabular-nums; }
}

.tc-pair-tag {
  display: inline-block;
  padding: 0 5px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  line-height: 18px;
  color: #5470c6;
  background: #ecf2fc;
  transition: all 0.12s;

  &:hover {
    color: #fff;
    background: #5470c6;
  }
}

.tc-pair-sep {
  color: #909399;
  margin: 0 4px;
  font-size: 10px;
}
</style>
