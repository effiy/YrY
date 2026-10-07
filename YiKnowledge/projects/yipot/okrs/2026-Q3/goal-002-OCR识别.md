---
type: okr-goal
id: yipot-002
title: "OCR 文字识别 — 多接口识别与系统原生集成"
status: completed
period: "2026 Q3"
owner: Pot-App 社区
project: YiPot
project_id: yipot
progress: 100
updated: 2026-09-23
kr1: "OCR 服务插件化 — 15 个 OCR 服务统一接口，云服务 + 本地离线双轨"
kr1_completion: 100
kr2: "系统 OCR 集成 — macOS Vision Framework + Windows.Media.OCR，离线可用"
kr2_completion: 100
kr3: "截图 → OCR → 翻译全链路 — 一键截图翻译，< 4s 完成"
kr3_completion: 100
kr4: "多类型识别 — 文字/二维码/公式三大识别类型"
kr4_completion: 100
metric1_id: "yipot-m04"
metric1_desc: "OCR 识别响应时间"
metric1_current: "<2s"
metric1_target: "<3s"
metric2_id: "yipot-m05"
metric2_desc: "OCR 服务数"
metric2_current: "15"
metric2_target: "≥8"
metric3_id: "yipot-m06"
metric3_desc: "离线 OCR 可用平台"
metric3_current: "2 (macOS/Windows)"
metric3_target: "≥1"
related_prds:
  - projects/yipot/prds/2026-09/02-prd-OCR与截图识别.md
  - projects/yipot/prds/2026-09/06-prd-OCR服务接口全景.md
  - projects/yipot/prds/2026-09/16-prd-截图与选区.md
---

# OCR 文字识别 — 多接口识别与系统原生集成

> Q3 核心产品目标。构建插件化多接口 OCR 引擎，集成云服务 + 系统原生 OCR + Tesseract.js 三重保障，实现截图→识别→翻译全链路自动化。**全部 4 个 KR 达成，15 个 OCR 服务已集成。**

---

## 背景

用户在阅读图片/PDF/不可选文本时需要提取文字。云 OCR 服务识别率高但需要网络和 API Key，系统原生 OCR 离线可用但仅限特定平台。Pot 需要同时提供两种选择，并在截图→OCR→翻译的全链路上实现一键完成。

## KR 达成情况

### KR1: OCR 服务插件化 ✓

15 个 OCR 服务：百度(3)、腾讯(3)、科大讯飞(2)、火山(2)、合合信息、系统 OCR、Tesseract.js、二维码(jsQR)、LaTeX 公式(2)。

### KR2: 系统 OCR 集成 ✓

- macOS: Vision Framework → `VNRecognizeTextRequest`
- Windows: `Windows.Media.OCR.OcrEngine`
- Linux: Tesseract.js 备选（系统 OCR 不可用）

### KR3: 截图→OCR→翻译全链路 ✓

macOS: `screencapture -i` 系统截图 → OCR → 翻译
Win/Linux: 自绘全屏截图窗口 → Canvas 选区 → OCR → 翻译

### KR4: 多类型识别 ✓

文字识别、二维码解码 (jsQR)、LaTeX 公式识别，三类识别统一入口。

---

## 风险分析

| 风险 | 概率 | 影响 | 缓解措施 | 状态 |
|------|------|------|---------|------|
| macOS Vision OCR 版本升级导致API兼容性变更 | 低 | 高 | 锁定VNRecognizeTextRequest调用方式，WWDC后优先回归测试 | 持续关注 |
| Windows.Media.OCR语言包未安装 | 中 | 中 | 启动时检测语言包状态，未安装时引导用户手动安装+自动回退Tesseract | 已缓解 |
| Tesseract.js WASM首次加载慢(5-10s) | 中 | 中 | 后台预加载 + CDN加速 + 前端加载进度提示 | 已缓解 |
| 截图→OCR→翻译全链路超时（>4s目标） | 中 | 中 | 云OCR+本地OCR并行，取最快返回；大图自动压缩到1920px宽 | 已缓解 |
| 二维码/公式识别OCR服务覆盖不足 | 低 | 低 | jsQR(pure JS)和LaTeX专用服务(SimpleTex/Pix2Text)独立于通用OCR | 已缓解 |

## 目标依赖关系

```
yipot-002 (OCR识别)
  ├── 无前置依赖（独立的识别模块）
  └── 被依赖: yipot-003 (截图翻译流程需OCR步骤)
      └── 被依赖: yipot-004 (OCR服务的插件化架构与翻译服务共享同一套插件发现机制)

yipot-002 是截图翻译能力的基础，在 yipot-003 的"截图→OCR→翻译"全链路中
位于中间环节。系统OCR(macOS Vision/Windows.Media)为桌面集成提供离线识别能力，
15个云OCR服务则提供更高精度的在线识别选项。多类型识别（文字/二维码/公式）
扩展了OCR的应用场景，使其不局限于翻译预处理。
```

## 经验教训

| 编号 | 经验 | 来源 | 影响 |
|------|------|------|------|
| L1 | macOS Vision Framework 中文识别率>95%，远优于Windows.Media.OCR（中文约80%），平台差异显著 | 系统OCR | 跨平台测试需覆盖各平台原生OCR，不能假设质量一致 |
| L2 | 截图区域大小对OCR耗时影响呈线性关系，4K屏幕全屏截图可达10s+云OCR处理时间 | 截图翻译 | 实现选区OCR优先，全屏场景自动压缩到1920px宽再发送 |
| L3 | Tesseract.js对中英文混排文本识别效果差（准确率<60%），仅适合纯英文或纯中文场景 | Tesseract离线 | Tesseract定位为"最后备选"，不推荐作为主要OCR引擎 |
| L4 | 云OCR服务图片base64上传有大小限制（百度10MB、腾讯5MB、合合3MB），不同服务差异大 | OCR服务 | 实现统一的图片预处理层：压缩+格式转换+分辨率限制，在插件调用前统一处理 |