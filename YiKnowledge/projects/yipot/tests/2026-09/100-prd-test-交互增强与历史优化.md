---

doc_type: test
prd_test_id: "PO-09-100"
title: "PO-09-100: 交互增强与历史优化 — 搜索 + 统计 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate: 0.25
source_task: "99-prd-task-交互增强与历史优化.md"
source_prds: ["54-prd-交互增强与历史优化"]
tags: [test, history, search, sqlite, cross-platform]

type: test
---

# PO-09-100: 交互增强与历史优化 — 测试方案

> **版本**：v2.0 · **人天**：0.25d · **状态**：已完成

---

## 1. 测试范围

| 维度 | 说明 |
|------|------|
| 组件 | `window/Config/pages/History/index.jsx` |
| 数据 | SQLite `history.db` |
| 平台 | Windows 10+ / macOS 11+ / Linux |

---

## 2. 功能测试

### TC-01：搜索功能

| # | 场景 | 期望 |
|---|------|------|
| 1.1 | 输入 "error" | 表格仅显示匹配行 |
| 1.2 | 输入 "你好"（中文） | 匹配 result 字段 |
| 1.3 | 清空搜索框 | 恢复全部记录 |
| 1.4 | 搜索无匹配 | 显示 emptyContent |
| 1.5 | 搜索时分页 | total 基于过滤结果，page 重置为 1 |
| 1.6 | 切换页码后修改搜索词 | page 重置为 1 |

### TC-02：统计卡片

| # | 场景 | 期望 |
|---|------|------|
| 2.1 | 有 100 条记录 | 显示 "100 records / M unique / ~K avg chars" |
| 2.2 | 0 条记录 | 显示 "0 records / 0 unique / ~0 avg chars" |
| 2.3 | 清除全部后 | 统计归零 |
| 2.4 | 翻译后返回 | 统计自动更新（组件重新挂载） |

### TC-03：分页

| # | 场景 | 期望 |
|---|------|------|
| 3.1 | 20 条数据 | 1 页 |
| 3.2 | 21 条数据 | 2 页 |
| 3.3 | 点击第 2 页 | 显示第 21-40 条 |
| 3.4 | 搜索后分页重算 | total 更新为搜索结果数 |

---

## 3. 边界与异常测试

### TC-10：SQLite 异常

| # | 场景 | 期望 |
|---|------|------|
| 10.1 | `history.db` 不存在 | `init()` 创建表（已有逻辑） |
| 10.2 | 表结构不兼容 | `catch` 分支执行 `CREATE TABLE` |
| 10.3 | 搜索时 DB 锁 | 静默失败，不影响 UI |

### TC-11：特殊输入

| # | 输入 | 期望 |
|---|------|------|
| 11.1 | SQL 注入尝试 `' OR '1'='1` | 参数化查询安全（`$1`）, 作为普通文本搜索 |
| 11.2 | 超长搜索词（1000 字符） | LIKE 正常匹配 |
| 11.3 | 空搜索词触发搜索 | 恢复全部记录 |
| 11.4 | 搜索词含 `%` 或 `_` | LIKE 通配符生效（SQLite 行为） |

### TC-12：质量反馈

| # | 场景 | 期望 |
|---|------|------|
| 12.1 | 翻译结果有内容，点击 👍 | Toast "Thanks for your feedback!" |
| 12.2 | 翻译结果为空，点击 👍 | 按钮 disabled |
| 12.3 | YiAi 不可达时点击 | 静默失败（catch 空），不阻断 UI |
| 12.4 | 连续快速点击 | 防抖（依赖用户行为，非代码限制） |

---

## 4. 跨平台测试

| 平台 | 搜索功能 | 统计显示 | 分页 | 图标渲染 |
|------|---------|---------|------|---------|
| Windows 10+ | ✅ | ✅ | ✅ | HiOutlineSearch |
| macOS 11+ | ✅ | ✅ | ✅ | HiOutlineSearch |
| Linux (X11) | ✅ | ✅ | ✅ | HiOutlineSearch |
| Linux (Wayland) | ✅ | ✅ | ✅ | HiOutlineSearch |

---

## 5. 回归测试

| # | 验证内容 |
|---|---------|
| R1 | 历史表格正常渲染（原有功能） |
| R2 | 编辑 Modal 正常打开 |
| R3 | Clear 按钮正常清除 |
| R4 | 集合导出功能正常 |
| R5 | 插件图标正常显示 |
| R6 | `pnpm tauri build` 三平台构建成功 |

---

## 6. 测试命令

```bash
cd YiPot && pnpm tauri dev
# 手动测试：Settings → History
# 1. 输入搜索词验证过滤
# 2. 查看统计卡片
# 3. 点击 👍/👎 验证反馈
# 4. Clear 后验证全部重置
```