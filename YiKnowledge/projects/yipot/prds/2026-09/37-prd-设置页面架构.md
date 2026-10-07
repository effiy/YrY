---
doc_type: prd
title: "YP-09-S26: 设置页面架构"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S26
estimate_frontend: 2.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 设置, 配置, UI]
category: 项目/桌面应用/需求
---

# YP-09-S26: 设置页面架构

> 需求编号：YP-09-S26 · 优先级：P2 · 人天：2.0d · 状态：已完成

## 页面结构

```
Config/
├── index.jsx                    — SideBar + Router 主框架
├── routes/index.jsx             — React Router 子路由
├── components/SideBar/          — 左侧导航
└── pages/
    ├── General/                 — 语言/主题/字体/字号
    ├── Translate/               — 翻译服务列表管理
    ├── Recognize/               — OCR 服务列表管理
    ├── Service/
    │   ├── Translate/           — 单个翻译服务配置（含 ConfigModal/SelectModal）
    │   ├── Recognize/           — 单个 OCR 服务配置
    │   ├── Tts/                 — TTS 服务配置
    │   ├── Collection/          — 生词本配置
    │   └── SelectPluginModal/   — 插件选择弹窗
    ├── Hotkey/                  — 快捷键录制器
    ├── Backup/                  — 本地/WebDAV/阿里云备份
    ├── History/                 — 翻译历史记录
    └── About/                   — 版本/开源许可/链接
```

## 导航分组

| 分组 | 页面 | 说明 |
|------|------|------|
| 通用 | General | 语言/主题/字体/代理/端口 |
| 服务 | Translate/Recognize/TTS/Collection | 四类服务管理 |
| 工具 | Hotkey/Backup/History | 快捷键/备份/历史 |
| 关于 | About | 版本信息 |

## 验收标准

- [ ] 左侧导航正常切换
- [ ] 每页配置即时生效
- [ ] 配置持久化

## 量化验收标准

| 交互操作 | 目标 | 测量方法 |
|----------|------|----------|
| 侧边栏导航切换 | < 100ms | 点击到目标页面首帧渲染 |
| 配置修改生效 (UI) | 即时 | 保存按钮点击后立即反映 |
| 配置持久化到磁盘 | < 1s | 异步写入 `tauri-plugin-store` |
| 主题切换 (亮/暗) | < 200ms | 包含 CSS 变量重算 + 重绘 |
| 快捷键录制 | < 50ms 响应按键 | keydown 事件到 UI 更新 |
| 首次加载设置页 | < 500ms | 含读取配置文件 + 渲染 |
| 服务开关 toggle | < 100ms | 即时生效，异步持久化 |

## 边界条件与异常处理

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 配置文件损坏 | JSON 解析失败 | 使用默认配置覆盖，弹窗提示 | 自动备份旧文件为 `.pot.dat.bak` |
| 配置写入失败 | 磁盘满/权限不足 | 弹窗错误提示 "配置保存失败" | 保留内存中的修改，不丢失 |
| 快捷键冲突 | 录制已占用的快捷键 | 弹窗提示冲突，允许覆盖或重新录制 | 显示当前占用该快捷键的功能 |
| 导入配置版本不兼容 | JSON 缺少字段/类型错误 | 合并模式：仅导入可识别的字段 | 报告跳过的字段列表 |
| WebDAV 连接失败 | 保存备份时网络不通 | 本地保存 + 标记 "待同步" | 下次连接成功时自动上传 |
| 服务 Key 明文泄露风险 | 用户分享截图/日志 | 密码/Key 输入框使用 `type="password"` | 日志输出脱敏 |
| 字体未安装 | 用户选择未安装的字体 | 显示 "字体不可用" + fallback 系统字体 | — |
| 同时打开多个设置窗口 | Tauri 允许重复窗口 | 不允许重复创建设置窗口，已存在则聚焦 | `WebviewWindow::get_by_label("config")` |

## 非功能需求

### 性能
- 设置页面按路由懒加载（`React.lazy`），减少首屏体积
- `tauri-plugin-store` 读写操作加入 500ms 防抖（连续修改只触发一次持久化）
- 配置写入磁盘前做 diff 比较，相同值不触发写入

### 安全
- 所有服务 Key/Secret 字段在 DOM 中使用 `type="password"` 默认隐藏
- 导入的外部配置 JSON 在 Rust 层做 schema 校验，拒绝非预期字段
- 代理设置中的密码字段单独加密存储

### 可维护性
- 设置页面路由表集中管理（`routes/index.jsx`）
- 每类服务配置的 Schema 在 `services/{type}/info.ts` 中声明
- 新增服务自动出现在对应服务列表页（基于 `services/` 目录扫描）

## 模块交互

```
Config/index.jsx (主框架)
     │
     ├── SideBar (左侧导航)
     │   ├── 分组渲染: 通用 / 服务 / 工具 / 关于
     │   ├── 活跃状态: React Router activeClassName
     │   └── 依赖: routes/index.jsx (路由表)
     │
     ├── <Router> (右侧内容区)
     │   │
     │   ├── General (通用设置)
     │   │   ├── 语言/主题/字体/字号 → tauri-plugin-store
     │   │   └── 代理/端口 → 影响全局 fetch/node fetch
     │   │
     │   ├── Translate/Recognize/TTS/Collection (服务管理)
     │   │   ├── 服务列表: 基于 services/{type}/ 目录扫描
     │   │   ├── 排序: 拖拽调整服务优先级
     │   │   ├── 启用/禁用: toggle 开关
     │   │   └── 进入单个服务配置:
     │   │       └── Service/Translate/ (单服务配置)
     │   │           ├── ConfigModal: 编辑 API Key/参数
     │   │           ├── SelectModal: 从插件列表选择
     │   │           └── 依赖: info.ts (插件元信息)
     │   │
     │   ├── Hotkey (快捷键)
     │   │   ├── 录制器: keydown/keyup 事件捕获
     │   │   ├── 冲突检测: 全局已注册快捷键集合
     │   │   └── 依赖: tauri-plugin-global-shortcut
     │   │
     │   ├── Backup (备份)
     │   │   ├── 本地: 导出/导入 JSON
     │   │   ├── WebDAV: 连接测试 + 上传/下载
     │   │   └── 阿里云: AK/SK 配置 + OSS 操作
     │   │   └── 依赖: backup.rs
     │   │
     │   ├── History (历史)
     │   │   └── 翻译历史列表 + 搜索 + 清空
     │   │
     │   └── About (关于)
     │       └── 版本号、开源许可、GitHub 链接
     │
     └── 全局状态
         ├── Jotai configAtom (读写 tauri-plugin-store)
         ├── Jotai themeAtom (亮/暗/跟随系统)
         └── Jotai servicesAtom (各服务启用/禁用/排序)
```

**上游依赖**：
- `config.rs`：Rust 层配置读写 (`get/set/reload_store`)
- `tauri-plugin-store`：配置文件 `.pot.dat` 持久化
- `backup.rs`：WebDAV/阿里云备份操作
- `services/**/info.ts`：各插件的元信息（扫描服务列表）

**下游消费者**：
- 所有功能窗口（Translate/OCR/Screenshot）读取配置
- `config.rs` 的 `get()` 是全局配置读取入口
- Jotai atoms 是 UI 层的配置读取缓存

**配置 Schema**：
```typescript
interface Config {
  general: { language, theme, font, fontSize, proxy, port };
  services: {
    translate: ServiceConfig[];
    recognize: ServiceConfig[];
    tts: ServiceConfig[];
    collection: ServiceConfig[];
  };
  hotkeys: Record<string, string>;
  backup: { local, webdav: {...}, aliyun: {...} };
}
```

## 参考

- [43-prd-Rust配置备份错误处理](./43-prd-Rust配置备份错误处理.md) — Rust 层配置读写实现
- [39-prd-WebDAV阿里云备份](./39-prd-WebDAV阿里云备份.md) — WebDAV/阿里云备份细节
- [46-prd-ADR-插件架构](./46-prd-ADR-插件架构.md) — 插件目录约定（服务自动发现）
- [45-prd-ADR-Jotai选择](./45-prd-ADR-Jotai选择.md) — Jotai 状态管理方案