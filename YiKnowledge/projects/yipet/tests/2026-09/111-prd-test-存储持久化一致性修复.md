---

doc_type: test
prd_test_id: "YP-09-111"
title: "YP-09-111: 存储持久化一致性修复 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "111-基础设施-存储持久化一致性修复.md"
tags: [storage, chrome-storage, persistence, testing]

type: test
---

# YP-09-111: 存储持久化一致性修复 — 测试方案

> **版本**：v1.0 · **PRD**：[111-基础设施-存储持久化一致性修复.md](../../prds/2026-09/111-基础设施-存储持久化一致性修复.md)

---

## 1. 测试策略

| 层级 | 方法 | 覆盖目标 |
|------|------|----------|
| 静态分析 | `vue-tsc --noEmit` | 零类型错误，修复的键名类型安全 |
| 单元测试 | Vitest 138 tests | 零回归 |
| 键名一致性 | 代码审查 + grep | 所有 `_persistSetting` 调用与 `_loadPersistedState` 读取键名一致 |
| 手工验证 | Chrome 扩展加载 | 设置恢复行为验证 |

## 2. 键名一致性验证

### TC-01: 全量键名审计

```bash
# 验证写入键名
grep -n "_persistSetting(" src/chat/stores/chat.ts

# 验证读取键名
grep -n "yipet:" src/chat/stores/chat.ts | grep -E "storage|get\(\["

# 确认: 每个 _persistSetting 调用键在 _loadPersistedState 中对应 yipet: 前缀版本
```

**预期结果**：

| _persistSetting 调用 | 对应读键 | 状态 |
|---------------------|---------|------|
| `_persistSetting('sidebarCollapsed', ...)` | `'yipet:sidebarCollapsed'` | ✅ |
| `_persistSetting('chatWindowState', ...)` | `'yipet:chatWindowState'` | ✅ |
| `_persistSetting('chatColorIndex', ...)` | `'yipet:chatColorIndex'` | ✅ |
| `_persistSetting('chatCustomColor', ...)` | `'yipet:chatCustomColor'` | ✅ |
| `_persistSetting('promptHistory', ...)` | `'yipet:promptHistory'` | ✅ |
| `persistSetting('sidebarWidth', ...)` (via useChatWindow) | `'yipet:sidebarWidth'` | ✅ |

### TC-02: promptHistory 存储格式

```
步骤:
  1. 在聊天中发送 3 条消息
  2. 打开 Chrome DevTools → Application → Storage → chrome.storage.local
  3. 查找 yipet:promptHistory

预期:
  - 值为数组 ["message1", "message2", "message3"]
  - 不是字符串 '["message1","message2","message3"]'
```

### TC-03: 侧边栏宽度持久化

```
前置: 打开聊天窗口
步骤:
  1. 拖拽侧边栏边缘将宽度修改为 500px
  2. 检查 chrome.storage.local → yipet:sidebarWidth
  3. chrome://extensions → 刷新 YiPet 扩展
  4. 任意页面打开聊天窗口

预期:
  - Step 2: yipet:sidebarWidth === 500
  - Step 4: 侧边栏宽度恢复 500px（非默认 320px）
```

### TC-04: 聊天窗口位置持久化

```
前置: 打开聊天窗口
步骤:
  1. 拖拽窗口标题栏将窗口移至 (x=300, y=200)
  2. 检查 chrome.storage.local → yipet:chatWindowState
  3. 刷新扩展 → 重新打开聊天

预期:
  - Step 2: yipet:chatWindowState.x ≈ 300, y ≈ 200
  - Step 3: 窗口在 (300, 200) 附近（非默认位置）
```

### TC-05: 颜色主题持久化

```
前置: 打开 Popup
步骤:
  1. 选择颜色 Ocean (index=5)
  2. 检查 chrome.storage.local → yipet:chatColorIndex
  3. 刷新扩展 → 打开聊天窗口

预期:
  - Step 2: yipet:chatColorIndex === 5
  - Step 3: 聊天窗口使用 Ocean 颜色主题
```

### TC-06: 侧边栏折叠状态持久化

```
步骤:
  1. 打开聊天，展开侧边栏
  2. 检查 chrome.storage.local → yipet:sidebarCollapsed
  3. 刷新扩展 → 重新打开聊天

预期:
  - Step 2: yipet:sidebarCollapsed === false
  - Step 3: 侧边栏保持展开
```

### TC-07: 提示词历史跨会话

```
步骤:
  1. 聊天中输入 "hello world" 并发送
  2. 输入 "how are you" 并发送
  3. 刷新扩展 → 打开聊天
  4. 在空输入框按 ArrowUp

预期:
  - Step 4: 输入框显示 "how are you"（最近一条历史）
  - 再次按 ArrowUp: 显示 "hello world"
```

### TC-08: ragContentSummary — 正常路径

```
前置: 开启 Knowledge Grounded，限定文件范围
步骤:
  1. 提问触发 RAG 检索
  2. 查看最新 pet 消息的检索摘要标签

预期: 显示 "filename.md +2" 格式
```

### TC-09: ragContentSummary — path 为 undefined 边界

```
Mock: state.ragSources = [{ score: 0.9 }, { score: 0.7 }]
// sources[0].path 不存在

预期: ragContentSummary = "unknown +1"
// 而非 "undefined +1"
```

## 3. 自动化验证

```
npm run typecheck    # TypeScript strict 模式
npm test             # Vitest 138 tests
npm run build        # Rsbuild 4 entries
```

## 4. 测试环境

| 配置 | 值 |
|------|-----|
| Chrome | 130+ |
| 测试框架 | Vitest 2 + jsdom 29 |
| 类型检查 | vue-tsc 2.x |

## 5. 测试结果

```
=== 自动化 ===
vue-tsc --noEmit  ✓ 零错误
vitest (16f/138t) ✓ 全通过
rsbuild build     ✓ 4 入口成功

=== 键名审计 ===
_persistSetting ↔ _loadPersistedState  ✓ 6/6 一致

=== 手工验证 ===
TC-03 侧边栏宽度   ✓
TC-04 窗口位置     ✓
TC-05 颜色主题     ✓
TC-06 侧边栏折叠   ✓
TC-07 提示词历史   ✓
TC-08 ragSummary   ✓
TC-09 ragSummary边界 ✓
```