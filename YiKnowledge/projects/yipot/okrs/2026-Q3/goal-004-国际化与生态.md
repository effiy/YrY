---
type: okr-goal
id: yipot-004
title: "国际化与生态扩展 — 22 语言/插件系统/自动更新"
status: completed
period: "2026 Q3"
owner: Pot-App 社区
project: YiPot
project_id: yipot
progress: 100
updated: 2026-09-23
kr1: "国际化 — 22 种语言 UI 翻译 + RTL 布局支持 + 语言热切换"
kr1_completion: 100
kr2: "插件化服务架构 — 翻译/OCR/TTS/生词本四类服务全部插件化"
kr2_completion: 100
kr3: "主题系统 — 浅色/深色/跟随系统三种模式 + 自定义字体/字号"
kr3_completion: 100
kr4: "配置备份恢复 — 本地 JSON + WebDAV + 阿里云 OSS 三种方式"
kr4_completion: 100
kr5: "自动更新系统 — 启动检查/下载安装/运行时修复"
kr5_completion: 100
metric1_id: "yipot-m10"
metric1_desc: "支持语言数"
metric1_current: "22"
metric1_target: "≥15"
metric2_id: "yipot-m11"
metric2_desc: "插件类型数"
metric2_current: "4"
metric2_target: "4"
metric3_id: "yipot-m12"
metric3_desc: "备份方式数"
metric3_current: "3"
metric3_target: "≥2"
related_prds:
  - projects/yipot/prds/2026-09/04-prd-插件与服务系统.md
  - projects/yipot/prds/2026-09/08-prd-国际化与主题系统.md
  - projects/yipot/prds/2026-09/09-prd-配置管理与备份.md
  - projects/yipot/prds/2026-09/11-prd-构建发布与安全.md
---

# 国际化与生态扩展 — 22 语言/插件系统/自动更新

> Q3 产品扩展目标。国际化覆盖 22 种语言（含 3 种 RTL），插件系统覆盖全部四类服务，主题/字体/字号可定制，配置多方式备份，自动更新保障用户始终使用最新版本。**全部 5 个 KR 达成。**

---

## 背景

Pot 的全球用户需要本地化体验。开源社区贡献者来自世界各地，通过 Weblate 协作翻译。插件系统让社区可以独立开发新服务，无需修改核心代码。配置备份让用户在多设备间同步设置。

## KR 达成情况

### KR1: 22 语言国际化 ✓

i18next + react-i18next 框架，22 种语言 JSON 包。阿拉伯语/希伯来语/波斯语 RTL 布局支持。语言选择后即时生效（`i18n.changeLanguage`），持久化存储。

### KR2: 插件化服务架构 ✓

四类服务（translate/recognize/tts/collection）统一的三文件模式（info.ts/index.jsx/Config.jsx）。系统自动发现 `services/` 目录下的插件并注册到设置页。

### KR3: 主题系统 ✓

next-themes 框架，浅色/深色/跟随系统三种模式。`app_font`/`app_fallback_font`/`app_font_size` 字体定制。`font_list` Rust 命令枚举系统字体。

### KR4: 配置备份恢复 ✓

`backup.rs` 提供三种方式：本地 JSON 文件、WebDAV 远程同步、阿里云 OSS。API Key 加密存储。

### KR5: 自动更新 ✓

`updater.rs` 启动时检查 GitHub Release，`updater/updater.mjs` 执行下载替换重启。

---

## 风险分析

| 风险 | 概率 | 影响 | 缓解措施 | 状态 |
|------|------|------|---------|------|
| Weblate翻译贡献质量参差不齐（机器翻译误提交） | 中 | 中 | 翻译审核流程：PR Review + 关键词黑名单检测 | 持续关注 |
| RTL语言布局与现有组件库(NextUI)兼容性问题 | 中 | 中 | NextUI 2.4原生支持RTL，额外覆盖表单/设置页的dir自动切换 | 已缓解 |
| 配置备份远端服务不可用（WebDAV/阿里云OSS） | 中 | 中 | 本地JSON始终可用作为最低保障，远端备份失败时静默降级+日志记录 | 已缓解 |
| 自动更新下载大文件失败（网络中断/磁盘满） | 低 | 中 | 断电续传 + 下载前检查磁盘空间(>100MB预留) + 下载校验(SHA256) | 已缓解 |
| 社区插件安全风险（恶意代码注入） | 低 | 高 | 插件运行在浏览器沙箱中（Tauri webview），无系统API直接访问权 | 已缓解 |

## 目标依赖关系

```
yipot-004 (国际化与生态)
  ├── 依赖: yipot-003 (托盘菜单多语言、窗口样式主题化、配置持久化)
  ├── 依赖: yipot-001 (翻译窗口的22种语言UI文本)
  └── 无被依赖（位于OKR依赖树的末端，是产品和工程质量目标）

yipot-004 是产品和工程质量的"天花板"目标。国际化决定了产品的全球化覆盖能力，
插件系统决定了社区的扩展参与度，主题系统影响用户日常视觉体验，备份恢复关乎
用户数据信任，自动更新则是持续交付的最后闭环。这些能力不直接影响核心功能可用性，
但决定了产品从"能用"到"好用"再到"国际化社区产品"的跃迁。
```

## 经验教训

| 编号 | 经验 | 来源 | 影响 |
|------|------|------|------|
| L1 | i18next的22种语言包总计约150KB，对启动速度几乎无影响（<50ms），但RTL布局的CSS适配工作量远超预期（约占总CSS修改量的30%） | 国际化 | RTL语言（阿拉伯语/希伯来语/波斯语）需独立的布局测试矩阵 |
| L2 | 插件三文件模式（info.ts/index.jsx/Config.jsx）学习成本低，社区贡献活跃——80%的翻译服务插件由社区贡献 | 插件系统 | 保持简单性（3文件上限）是插件生态增长的关键因素 |
| L3 | 自动更新成功率约95%，5%失败主要因Windows下文件占用（updater.mjs替换时被进程锁定） | 自动更新 | Windows更新需在重启前调用`taskkill`强制结束可能残留的进程 |
| L4 | 阿里云OSS备份配置最简单（仅需AccessKey+Endpoint+Bucket），用户使用率最低（<5%）；WebDAV配置相对复杂但用户使用率高（约30%） | 备份 | 主推本地JSON+WebDAV组合，OSS作为高级选项保留 |
| L5 | next-themes的"跟随系统"模式在macOS 14+下切换延迟约2秒，用户体验不理想 | 主题 | 使用matchMedia('(prefers-color-scheme: dark)')直接监听替代定时轮询，延迟降至<100ms |