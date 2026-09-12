<template>
  <div class="tables-demo-home">
    <h2>列表组件体系 · 演示中心</h2>
    <p class="subtitle">覆盖虚拟滚动、列管理、批量操作、导出、行内编辑等全部功能体系</p>
    <div class="demo-cards">
      <el-card v-for="card in cards" :key="card.key" class="demo-card" shadow="hover" @click="$emit('select', card.key)">
        <div class="card-icon">{{ card.icon }}</div>
        <h3>{{ card.title }}</h3>
        <p>{{ card.desc }}</p>
        <el-tag size="small">{{ card.features }} 特性</el-tag>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ select: [key: string] }>();

const cards = [
  { key: "virtual-scroll", icon: "📜", title: "虚拟滚动", desc: "10万行数据流畅滚动，DOM节点<60，内存<15MB", features: "7" },
  { key: "columns", icon: "📊", title: "列管理", desc: "列显隐、排序、调整大小、冻结、持久化", features: "8" },
  { key: "batch", icon: "☑️", title: "批量操作", desc: "Shift多选、批量编辑/删除/标签/邮件，进度追踪", features: "8" },
  { key: "export", icon: "📥", title: "导出系统", desc: "CSV/Excel/JSON/PDF四格式，模板管理，服务端流式", features: "10" },
  { key: "inline-edit", icon: "✏️", title: "行内编辑", desc: "10种编辑器、双击触发、Tab导航、虚拟滚动兼容", features: "10" },
  { key: "views", icon: "🔄", title: "视图切换", desc: "表格/卡片/看板/日历/画廊/地图六种视图", features: "6" },
  { key: "conditional-format", icon: "🎨", title: "条件格式", desc: "高亮/色阶/数据条/图标集，规则优先级排序", features: "4" },
  { key: "tree-table", icon: "🌳", title: "树形表格", desc: "懒加载、拖拽排序、缩进引导线、子树全选", features: "5" },
  { key: "pivot", icon: "📈", title: "数据透视表", desc: "行列值配置、sum/avg聚合、下钻明细", features: "3" },
  { key: "full", icon: "🚀", title: "完整集成", desc: "全部功能同时启用，性能压力测试", features: "14" },
];
</script>

<style scoped>
.tables-demo-home { max-width: 900px; margin: 0 auto; }
.tables-demo-home h2 { font-size: 24px; margin-bottom: 8px; }
.subtitle { color: var(--el-text-color-secondary); margin-bottom: 24px; }
.demo-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.demo-card { cursor: pointer; transition: transform .15s; }
.demo-card:hover { transform: translateY(-2px); }
.card-icon { font-size: 28px; margin-bottom: 8px; }
.demo-card h3 { margin: 0 0 4px; font-size: 16px; }
.demo-card p { margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary); }
</style>