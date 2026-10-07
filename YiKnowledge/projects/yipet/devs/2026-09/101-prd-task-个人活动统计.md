---

doc_type: module
prd_id: "PE-09-101"
title: "PE-09-101-dev: 个人活动统计条 — 开发方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: task
---

# PE-09-101-dev: 个人活动统计条 — 开发方案

## 改动清单

### 1. 新增 `src/chat/components/StatsBar.vue`

**新建文件**，紧凑 4 格统计条组件：

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Collection, Document, Warning, Clock } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

interface StatItem { key: string; label: string; value: number; icon: any; color: string; }

const stats = computed<StatItem[]>(() => {
  const knowledgeCount = s.knowledgeTree?.reduce((sum, cat) => sum + (cat.files?.length || 0), 0) || 0;
  const today = new Date().toDateString();
  const todaySessions = s.sessions.filter((ses: any) => {
    const ts = ses.updatedAt || ses.createdAt;
    return ts && new Date(ts).toDateString() === today;
  }).length;
  return [
    { key: 'sessions', label: 'Sessions', value: s.sessions.length, icon: Collection, color: '#5470c6' },
    { key: 'knowledge', label: 'Knowledge', value: knowledgeCount, icon: Document, color: '#91cc75' },
    { key: 'bugs', label: 'Bugs', value: s.recentBugs?.length || 0, icon: Warning, color: '#ee6666' },
    { key: 'today', label: 'Today', value: todaySessions, icon: Clock, color: '#fac858' },
  ].filter(st => st.value > 0);
});
</script>
```

**设计原则**：
- 数据来自现有 Pinia store（`state.sessions`/`state.knowledgeTree`/`state.recentBugs`），无需新 API 调用
- 4 格布局对齐 YiVad Home stat cards 配色（蓝/绿/红/黄）
- 无数据时隐藏（`v-if="stats.length"`）
- 使用 `--yp-*` CSS 变量适配 YiPet 主题

### 2. 集成到 `ChatWindow.vue`

**文件**: `YiPet/src/chat/components/ChatWindow.vue`

- 导入 `StatsBar` 组件
- 在聊天头部（`.yipet-chat-hdr`）和消息区域之间插入 `<StatsBar />`

### 3. 数据流

```
StatsBar.vue
  → useChatStore().state
    ├─ sessions[] → session count + today count
    ├─ knowledgeTree[] → knowledge file count
    └─ recentBugs[] → bug count
  → computed stats[]
  → render 4 stat chips
```

所有数据已通过 YiAi RPC 加载到 store 中，StatsBar 是纯展示组件。

## 验证步骤

1. 打开 YiPet 聊天窗口（在任意页面上）
2. 确认有会话/知识/Bug 数据时显示统计条
3. 确认无数据时统计条不显示
4. 确认颜色方案与 YiPet 主题一致