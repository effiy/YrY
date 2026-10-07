---
type: okr-goal
id: yipot-001
title: "跨平台翻译引擎 — 多接口并行与全平台覆盖"
status: completed
period: "2026 Q3"
owner: Pot-App 社区
project: YiPot
project_id: yipot
progress: 100
updated: 2026-09-23
kr1: "多接口并行翻译架构 — 21 个翻译服务插件化，Promise.allSettled 并行调度，单服务失败不影响其他"
kr1_completion: 100
kr2: "三大翻译模式 — 划词翻译/输入翻译/剪切板监听，覆盖全部使用场景"
kr2_completion: 100
kr3: "AI 翻译集成 — OpenAI/Ollama/ChatGLM/Gemini 四大 LLM 翻译支持自定义 prompt"
kr3_completion: 100
kr4: "跨平台一致性 — Windows/macOS/Linux 三平台翻译体验一致"
kr4_completion: 100
kr5: "语言检测 — 自动检测源语言 + 手动切换，覆盖 200+ 语言对"
kr5_completion: 100
metric1_id: "yipot-m01"
metric1_desc: "翻译响应时间 (划词翻译)"
metric1_current: "<1s"
metric1_target: "<2s"
metric2_id: "yipot-m02"
metric2_desc: "并行翻译服务数"
metric2_current: "21"
metric2_target: "≥10"
metric3_id: "yipot-m03"
metric3_desc: "支持平台数"
metric3_current: "3"
metric3_target: "3"
related_prds:
  - projects/yipot/prds/2026-09/01-prd-划词翻译核心.md
  - projects/yipot/prds/2026-09/05-prd-翻译服务接口全景.md
  - projects/yipot/prds/2026-09/12-prd-百度翻译服务.md
  - projects/yipot/prds/2026-09/13-prd-AI翻译服务.md
  - projects/yipot/prds/2026-09/14-prd-剪切板监听.md
---

# 跨平台翻译引擎 — 多接口并行与全平台覆盖

> Q3 核心产品目标。构建插件化多接口翻译引擎，实现划词/输入/剪切板三种翻译模式，集成传统翻译 API 与 AI/LLM 翻译，覆盖 Windows/macOS/Linux 三大平台。**全部 5 个 KR 达成，21 个翻译服务已集成。**

---

## 背景

Pot 作为桌面翻译工具，核心价值在于"随时随地翻译"。用户场景多样——阅读外文网页时需要划词翻译、写作时需要输入翻译、批量阅读时需要剪切板监听。传统机器翻译和 AI 翻译各有优势，用户需要同时对比多个结果。

技术挑战：
- 翻译服务 API 各异（签名算法、认证方式、返回格式）
- 并行调用需要隔离故障
- AI 翻译需要灵活的自定义能力
- 三大平台的剪切板和窗口机制不同

## KR 达成情况

### KR1: 多接口并行翻译架构 ✓

21 个翻译服务全部插件化，统一的 `TranslateService` 接口。`Promise.allSettled` 并行调度确保单个服务故障不影响其他结果展示。

### KR2: 三大翻译模式 ✓

- **划词翻译**: 选中文本 → 快捷键 → Rust 读取选中文本 → 翻译窗口弹出
- **输入翻译**: 快捷键打开翻译窗口 → 手动输入 → Enter 翻译
- **剪切板监听**: 开启监听 → 复制任意文本 → 自动翻译

### KR3: AI 翻译集成 ✓

OpenAI（兼容 API）、Ollama（本地离线）、ChatGLM（国内 LLM）、Gemini Pro，均支持自定义 prompt 模板和模型选择。

### KR4: 跨平台一致性 ✓

macOS: screencapture + Accessibility 权限 + Vision OCR
Windows: 自绘截图窗口 + GDI + Windows.Media.OCR
Linux: X11/Wayland 兼容 + Tesseract.js 备选

### KR5: 语言检测 ✓

`lang_detect.rs` (Rust) + `lang_detect.js` (前端 franc) 双层检测，200+ 语言对支持。

---

## 风险分析

| 风险 | 概率 | 影响 | 缓解措施 | 状态 |
|------|------|------|---------|------|
| 翻译API服务中断（免费接口限流/关停） | 中 | 高 | 21个服务并行，单服务故障不影响其他；本地Ollama翻译降级 | 已缓解 |
| 单个API签名算法变更 | 中 | 低 | 插件独立部署，变更仅影响单服务，不影响整体架构 | 已缓解 |
| AI翻译服务不可用（Ollama未启动） | 中 | 中 | 前端检测连接状态，未连接时自动降级到传统翻译服务 | 已缓解 |
| 剪切板监听跨平台差异（macOS安全限制严格） | 中 | 中 | 100ms轮询间隔为经验最优值，macOS需辅助功能权限 | 已缓解 |
| 并行请求过多导致客户端限流 | 低 | 中 | `Promise.allSettled` 天然并发控制，用户可手动关闭慢速服务 | 持续关注 |

## 目标依赖关系

```
yipot-001 (翻译引擎)
  ├── 无前置依赖（独立的核心产品模块）
  └── 被依赖: yipot-003 (桌面集成的划词/剪切板触发翻译)
      └── 被依赖: yipot-004 (主题系统的翻译窗口样式)

yipot-001 是 YiPot 的核心价值模块，所有其他目标直接或间接依赖其翻译能力。
窗口管理(yipot-003)需 translate/input/screenshot 三种窗口支持；
国际化(yipot-004)需翻译窗口适配 RTL 布局和 22 种语言文本。
```

## 经验教训

| 编号 | 经验 | 来源 | 影响 |
|------|------|------|------|
| L1 | 翻译API字段命名不统一，`from`/`source`/`sl` 各有差异，需要每个插件做字段映射 | 翻译核心 | 建议后续定义内部标准字段，在插件层统一转换 |
| L2 | 剪切板轮询比监听更可靠，但100ms间隔在Windows下CPU占用约2-3%，macOS下约1% | 剪切板监听 | 100ms为三平台经验最优值，变更前需跨平台基准测试 |
| L3 | AI翻译prompt模板对翻译质量影响巨大，系统角色prompt（"你是专业翻译"）比简单prompt（"翻译"）质量提升明显 | AI翻译 | 加入预设prompt模板库，允许社区贡献优化 |
| L4 | 21个服务中约5个（百度、DeepL、彩云等）使用量占90%，长尾服务维护成本高但社区需求存在 | 翻译服务全景 | 考虑服务分级：核心(必过CI)/社区(宽松标准)，降低核心维护负担 |
| L5 | `lang_detect.js`(franc)对短文本（<10字符）识别率仅60-70%，Rust `lang_detect.rs` 对短文本也有类似问题 | 语言检测 | 短文本场景应允许用户手动指定源语言，自动检测仅作为辅助 |