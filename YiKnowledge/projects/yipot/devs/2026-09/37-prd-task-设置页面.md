---

doc_type: module
prd_task_id: "YP-09-S26"
title: "设置页面 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "37-prd-设置页面架构.md"

type: task
---

# 设置页面 — 开发方案

## 架构

```
Config/
├── index.jsx → SideBar + React Router <Outlet>
├── routes/index.jsx → 10 条子路由定义
└── pages/ → 10 个独立页面组件
```

## 路由设计

```javascript
const routes = [
  { path: "/", element: <General /> },
  { path: "/translate", element: <Translate /> },
  { path: "/recognize", element: <Recognize /> },
  { path: "/tts", element: <Tts /> },
  { path: "/collection", element: <Collection /> },
  { path: "/hotkey", element: <Hotkey /> },
  { path: "/backup", element: <Backup /> },
  { path: "/history", element: <History /> },
  { path: "/about", element: <About /> },
];
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 导航模式 | SideBar + 子路由 | 10+ 页面，侧边栏最清晰 |
| 配置即时生效 | onChange → useConfig.set | 无需保存按钮 |
| 服务配置 | 嵌套路由 (SelectModal/ConfigModal) | 三层：列表→选择→配置 |
| 快捷键冲突检测 | 全局监听 + 冲突列表展示 | 避免静默覆盖系统快捷键 |
| 配置持久化 | Tauri `fs` 写入 JSON + 内存缓存 | 读写分离，异步刷盘 |
| 主题跟随系统 | `prefers-color-scheme` 媒体查询 | 无需手动切换 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| 配置懒加载 | React Router 路由级 `React.lazy()` | 首次进入设置页加载时间减半 |
| 侧边栏预渲染 | 当前页 prefetch 相邻页 chunk | 切换页面瞬时渲染 |
| 配置变更节流 | `onChange` 300ms debounce | 避免频繁写磁盘 |
| 大配置 JSON 增量写入 | 仅写入变更字段，非全量覆盖 | 写入时间从 O(n) 降至 O(1) |
| 字体列表缓存 | 系统字体列表仅在首次打开字体设置时获取 | 避免重复系统调用 |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| 配置文件损坏 (JSON 解析失败) | `CFG-PARSE` | 回退到默认配置，备份损坏文件为 `.corrupted` | "配置文件已重置为默认" |
| 配置文件写入权限不足 | `CFG-PERM` | 提示用户检查目录权限 | "无法保存设置，请检查权限" |
| 快捷键冲突 | `CFG-HOTKEY` | 展示冲突列表，红色高亮 | "「{key}」已被「{功能}」占用" |
| 字体不可用 | `CFG-FONT` | 回退到系统默认字体 | 静默降级，设置页显示灰色提示 |
| 备份文件过大（> 10MB） | `CFG-SIZE` | 拒绝导入，提示用户 | "备份文件过大，请检查文件" |
| 服务配置密码为空 | `CFG-AUTH` | 不覆盖已有密码 | "密码未修改" tooltip |
| 路由不存在 | `CFG-404` | 重定向到 General 首页 | 无用户提示，路由自动修正 |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) | 上游 PRD | 功能需求定义 |
| [37-prd-test-设置页面](../tests/2026-09/37-prd-test-设置页面.md) | 下游测试 | 测试用例与验证方案 |
| [27-prd-安全加密存储](../prds/2026-09/27-prd-安全加密存储.md) | 安全 | API Key 等敏感配置加密存储 |
| [36-prd-task-生词本导出](./36-prd-task-生词本导出.md) | 配置 | Anki 牌组/字段映射配置 |
| `src/config/routes/` | 源码 | 设置页面路由定义 |
| `src/config/pages/` | 源码 | 10 个独立设置页面 |