<template>
  <DemoLayout active="views" title="视图切换演示" description="6种视图：表格/卡片/看板/日历/画廊/地图" @select="$emit('select', $event)">
    <div class="controls">
      <el-radio-group v-model="currentView">
        <el-radio-button value="table">📊 表格</el-radio-button>
        <el-radio-button value="card">🃏 卡片</el-radio-button>
        <el-radio-button value="kanban">📋 看板</el-radio-button>
      </el-radio-group>
      <span style="margin-left:12px;color:var(--el-text-color-secondary);font-size:13px">
        筛选条件: <el-tag size="small" v-for="f in activeFilters" :key="f">{{ f }}</el-tag>
      </span>
    </div>

    <!-- Table View -->
    <div v-if="currentView === 'table'">
      <el-table :data="demoData" border size="small">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="任务" width="200" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column prop="dueDate" label="截止日" width="120" />
        <el-table-column prop="assignee" label="负责人" width="100" />
      </el-table>
    </div>

    <!-- Card View -->
    <div v-if="currentView === 'card'" class="card-grid">
      <el-card v-for="item in demoData" :key="item.id" class="task-card" shadow="hover">
        <div class="card-header">
          <span class="card-id">#{{ item.id }}</span>
          <el-tag :type="statusType(item.status)" size="small">{{ item.status }}</el-tag>
        </div>
        <h4>{{ item.title }}</h4>
        <div class="card-footer">
          <span>{{ item.assignee }}</span>
          <span>{{ item.dueDate }}</span>
        </div>
      </el-card>
    </div>

    <!-- Kanban View -->
    <div v-if="currentView === 'kanban'" class="kanban-board">
      <div v-for="col in kanbanCols" :key="col.status" class="kanban-col">
        <h4>{{ col.label }} <el-tag size="small">{{ col.items.length }}</el-tag></h4>
        <el-card v-for="item in col.items" :key="item.id" class="kanban-card" shadow="hover">
          <strong>{{ item.title }}</strong>
          <div style="font-size:12px;color:var(--el-text-color-secondary);margin-top:4px">
            {{ item.assignee }} · {{ item.dueDate }}
          </div>
        </el-card>
      </div>
    </div>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";

defineEmits<{ select: [key: string] }>();

const currentView = ref("table");
const activeFilters = ["priority=high"];

const demoData = ref([
  { id: 1, title: "用户登录页重构", status: "done", priority: "high", dueDate: "2026-09-05", assignee: "张伟" },
  { id: 2, title: "API 限流实现", status: "in-progress", priority: "high", dueDate: "2026-09-12", assignee: "李芳" },
  { id: 3, title: "数据导出优化", status: "in-progress", priority: "medium", dueDate: "2026-09-15", assignee: "王娜" },
  { id: 4, title: "移动端适配", status: "todo", priority: "medium", dueDate: "2026-09-20", assignee: "赵敏" },
  { id: 5, title: "性能监控面板", status: "todo", priority: "low", dueDate: "2026-09-25", assignee: "陈静" },
  { id: 6, title: "搜索功能增强", status: "done", priority: "high", dueDate: "2026-09-03", assignee: "张伟" },
]);

const kanbanCols = computed(() => [
  { status: "todo", label: "待办", items: demoData.value.filter((d) => d.status === "todo") },
  { status: "in-progress", label: "进行中", items: demoData.value.filter((d) => d.status === "in-progress") },
  { status: "done", label: "已完成", items: demoData.value.filter((d) => d.status === "done") },
]);

const statusType = (s: string) => s === "done" ? "success" : s === "in-progress" ? "warning" : "info";
</script>

<style scoped>
.controls { margin-bottom: 16px; display: flex; align-items: center; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.task-card { cursor: pointer; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-id { font-size: 12px; color: var(--el-text-color-secondary); }
.card-footer { display: flex; justify-content: space-between; font-size: 12px; color: var(--el-text-color-secondary); margin-top: 8px; }
.kanban-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.kanban-col { background: var(--el-fill-color-light); border-radius: 8px; padding: 12px; }
.kanban-col h4 { margin: 0 0 8px; font-size: 14px; }
.kanban-card { margin-bottom: 8px; }
</style>