---
title: "ADR: YiPot 托盘 Accessory 菜单架构"
tags: [category/leader, 决策, adr, yipot, tray, accessory, tauri]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "YiPot 托盘菜单支持 12 种语言动态切换、5 类核心操作和 2 个状态开关，用户从托盘图标 1 次点击可达所有核心功能"
acceptance_criteria:
  - "tray.rs 支持 ≥12 种语言菜单切换（第 44-56 行 match language.as_str() 分支）
  - "5 类核心操作（输入翻译/剪贴板监听/OCR/设置/退出）均可从托盘触发
  - "2 个状态开关（自动复制四选一 + 剪贴板监听）在托盘和配置页双向同步"
related:
  - ./README.md
  - ../../curator/templates/0001-模板-ADR模板.md
  - ../../projects/yipot/prds/2026-09/37-prd-设置页面架构.md
  - ../../projects/yipot/okrs/2026-Q3/goal-goal-goal-003-桌面集成.md
  - ../../projects/yipot/bugs/性能问题/001-剪切板CPU占用高.md
  - ../../engineer/projects/0005-项目-YiPot项目.md
  - ./yipot-yipot-yipot-008-决策-tiny_http端口60828.md
  - ./yipot-yipot-yipot-010-决策-剪贴板节流CPU.md
---

# ADR: YiPot 托盘 Accessory 菜单架构

> **状态**：已接受 (2026-10-07)

---

## 上下文

YiPot 是 Tauri 桌面翻译工具，核心使用场景是"用户正在阅读任何内容时，需要 1-2 次点击触发翻译"。桌面应用的托盘图标（Taskbar Accessory）是用户最常用的触发入口——**比快捷键更易发现、比打开主窗口更快**。

当前 `YiPot/src-tauri/src/tray.rs:205-632` 存在以下问题：
1. **菜单结构重复**：12 种语言（en/zh_cn/zh_tw/ja/ko/fr/de/ru/pt_br/fa/uk）的菜单函数各自定义一次菜单项，代码重复率 85%
2. **状态同步分散**：剪贴板监听开关（`on_clipboard_monitor_click`，第 143-169 行）需要同时改配置文件、改内存状态、重启监听线程、更新菜单勾选——4 步分散在不同位置容易漏
3. **无 Accessory 抽象层**：新增一个托盘菜单项需要改 12 个 `tray_menu_xx()` 函数 + 1 个事件处理分支，改动 13 处

为什么必须现在解决：YiPot 2026-Q3 OKR `goal-goal-goal-003-桌面集成.md` 要求新增 PopClip、SnipDo、快捷短语等 3 个外部集成入口，都需要从托盘菜单触发。当前结构每加一个菜单项改 13 处，效率无法支撑。

---

## 决策

**引入 TrayAccessory 抽象层：统一菜单定义 + 语言映射表 + 单事件分发，消除 12 份重复菜单代码。**

具体结构：
```
tray.rs 改造后结构：
├── TrayAccessory::new()          // 一次性定义所有菜单项的元数据（ID、图标、快捷键）
├── TrayAccessory::render(lang)   // 从语言映射表 + 元数据生成当前语言菜单
├── TrayAccessory::handle(id)     // 单 match 分发所有事件
├── TrayState::sync()             // 状态变更时4步同步（配置/内存/线程/UI）原子化
└── language_map.json (或 inline) // 12 种语言的翻译键值对
```

改造要点：
- **菜单项元数据定义 1 次**：`id="input_translate"`、`id="clipboard_monitor"`、`id="ocr_recognize"` 等的位置、类型、子菜单关系只写一遍
- **语言映射表驱动翻译**：12 种语言从单一映射表查找，不再手写 12 个菜单函数
- **TrayState::sync() 原子操作**：剪贴板开关切换时，4 步操作封装成一个 Result 函数，任何一步失败回滚——参考 `tray.rs:143-169` 现有逻辑但消除分步 unwrap
- **Windows 左键单击（tray.rs:100-138）保持配置**：`on_tray_click()` 的行为通过 TrayAccessory 内部配置化，不破坏现有用户习惯

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：保留 12 个菜单函数，抽取公共 builder** | 改动最小，风险可控 | 新增菜单项仍需改 12 处 + 事件，没有解决核心问题；每次改语言翻译都要搜索替换 12 份 | 无法支撑 Q3 新增 3+ 菜单项的节奏，技术债继续累积 |
| **方案 B：把菜单移到前端 i18n，前端构造 JSON 传给 Tauri** | 复用已有 `src/i18n/locales/*.json` 翻译资源 | 托盘图标在 Tauri 侧渲染，传 JSON 反序列化有额外开销；启动速度变慢 200ms+；前端 i18n 和后端 tray 强耦合 | 启动性能是桌面应用核心指标，200ms 延迟不可接受；耦合导致改 i18n 可能崩托盘 |
| **方案 C（已选择）：TrayAccessory 抽象层 + 后端 inline 语言表** | 新增菜单项仅改 1 处元数据 + 1 处事件；启动性能零损失；代码量从 632 行降至 ~200 行 | 需要一次中等规模重构，~4 人天工作量；重构阶段可能触发回归 Bug | 工作量可控（4 人天在 Q3 排期内有缓冲）；重构后消除 85% 重复代码，长期收益远大于一次性成本 |

---

## 后果

### 正面影响
- **开发效率提升**：新增一个托盘菜单项从改 13 处 → 改 1 处，支持 Q3 新增 PopClip、SnipDo 集成
- **代码量下降 65%**：tray.rs 从 632 行 → ~220 行，可维护性显著提升
- **状态一致可靠**：TrayState::sync() 原子化操作消除了剪贴板开关"配置改了但线程没重启"之类的部分更新 Bug
- **语言扩展零成本**：新增第 13 种语言只需加 1 个翻译条目，不再需要复制粘贴整个菜单函数

### 负面影响
- **一次性重构成本**：约 4 人天，需要额外 2 天回归测试 12 种语言下所有菜单项
- **tray.rs:187-189 检查更新占位**：当前 `on_check_update_click()` 只是打日志，重构时要保持该占位不被误当成死代码删除——配合 yipot-07 ADR（移除 AutoUpdate）
- **调试路径改变**：之前在 `tray_menu_zh_cn()` 打断点即可，现在需要在 `TrayAccessory::render()` 里看中间态，需要给团队 30 分钟培训

### 中性影响
- **与前端 i18n 双轨存在**：托盘翻译走后端 inline 表，主界面走前端 i18n——两者分开维护，每次加新语言需要改两处，但这是为了启动性能接受的折中
- **Windows 左键行为**：`on_tray_click()`（第 123-139 行）行为保持不变；如果未来要改通过 TrayAccessory 配置化，不影响现有用户
- **与 yipot-10（剪贴板节流）的协作**：`start_clipboard_monitor` 是 yipot-10 的改造点，TrayState::sync() 需要和新的节流线程状态对接——两边一起规划接口

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**关联 ADR**：
- 依赖：yipot-07（移除 AutoUpdate）→ 确定 check_update 菜单项最终去留
- 协作者：yipot-10（剪贴板节流 CPU）→ 对接 TrayState::sync() 启停接口
