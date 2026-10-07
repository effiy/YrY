---
doc_type: prd
title: "YP-09-S25: OCR 识别窗口交互"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S25
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, OCR, UI, 交互]
category: 项目/桌面应用/需求
---

# YP-09-S25: OCR 识别窗口交互

> 需求编号：YP-09-S25 · 优先级：P0 · 人天：1.0d · 状态：已完成

## 背景

OCR 识别结果需要展示原图 + 识别文字，并提供复制、翻译、重新识别等操作。

## 组件结构

```
Recognize/
├── index.jsx            — 主容器 + Tauri 事件监听
├── ImageArea/           — 截图预览区
├── TextArea/            — 识别文字展示（可编辑）
└── ControlArea/         — 复制/翻译/重新识别按钮
```

## 功能需求

- 左侧截图预览，右侧文字展示
- 文字可编辑（修正 OCR 错误）
- 一键复制全文
- 一键翻译识别结果
- 支持重新框选识别

## 验收标准

- [ ] 截图 + 文字双栏展示
- [ ] 复制按钮一键复制
- [ ] 翻译按钮触发二次翻译
- [ ] 重新识别按钮重新触发 OCR

## 量化验收标准

| 交互操作 | 目标延迟 | 测量方法 | 备注 |
|----------|----------|----------|------|
| 截图完成 → OCR 窗口弹出 | < 800ms | 从截图确认到窗口显示 + 首条结果 | 含图片压缩 + 首个服务响应 |
| OCR 窗口弹出 → 首条文字展示 | < 1500ms | 从窗口显示到第一个识别结果 | 含 API 网络请求 |
| 复制全文 | < 100ms | 点击到 `navigator.clipboard.writeText()` 完成 | 合并所有服务结果 |
| 一键翻译（OCR → 翻译） | < 500ms | 点击翻译到翻译窗口弹出 | 打开新窗口 + 传入文字 |
| 重新框选 | < 300ms | 点击到截图选区出现 | 关闭当前窗口 + 触发截图 |
| 文字编辑后实时保存 | 无感知 | contentEditable onChange → 更新状态 | 非持久化，窗口关闭即丢 |

## 边界条件与异常处理

| 场景 | 输入 | 预期行为 | 恢复策略 |
|------|------|----------|----------|
| 截图无文字 | 纯色/风景截图 | OCR 返回空，显示 "未检测到文字" | 提供 "重新截图" 按钮 |
| 截图模糊 | 低分辨率/过小截图 | OCR 结果置信度低，标注 "识别精度有限" | 建议用户重新截取高清区域 |
| 多服务结果不一致 | 百度识别 5 行，腾讯识别 4 行 | 展示所有结果，不做合并 | 用户自行判断 |
| 系统 OCR 不可用 | Linux 无系统 OCR | 仅展示在线 API 结果 | 系统 OCR 结果区显示 "不可用" |
| 图片过大 | > 10MB 截图 | Rust 层压缩到 <= 4MB 后上传 | 显示压缩提示 |
| 用户编辑后想还原 | 用户手动修改了 OCR 文字 | 提供 "还原原始识别" 按钮 | 保存原始结果快照 |
| 翻译窗口已存在 | OCR → 翻译时翻译窗口已打开 | 在已有窗口追加文字（不替换） | Tauri event 发送新文字 |
| 剪贴板图片非截图 | 用户粘贴外部图片 | 同样走 OCR 流程 | 标注图片来源 |

## 非功能需求

### 性能
- 截图原图在 Rust 层缓存（Base64 或临时文件），避免 JS 层大内存占用
- OCR 结果列表超过 3 个服务时使用虚拟滚动
- 图片预览使用 CSS `object-fit: contain` + `max-height` 而非 JS 缩放

### 可用性
- 截图预览支持缩放（鼠标滚轮，0.5x ~ 3x）
- 文字区域支持 Ctrl+A 全选 / 鼠标拖选
- 一键翻译时携带源语言信息（避免重复语言检测）

### 可观测性
- 记录 OCR 识别耗时（分阶段：截图压缩 / 网络传输 / API 处理）
- 系统 OCR vs 在线 API 使用比例统计

## 模块交互

```
Recognize/index.jsx (主容器)
     │
     ├── 事件监听
     │   ├── "ocr-result" (Rust → emit → JS 接收识别结果)
     │   ├── Esc → 关闭
     │   └── 窗口外 click → 关闭
     │
     ├── ImageArea (截图预览)
     │   ├── props: imageDataUrl (Base64)
     │   ├── 缩放: 鼠标滚轮 (0.5x ~ 3x)
     │   ├── 拖拽: 图片尺寸 > 容器时
     │   └── 依赖: screenshot.rs (截图来源)
     │
     ├── TextArea (识别文字展示)
     │   ├── props: results[] (来自 parallelDispatch)
     │   ├── contentEditable: 允许用户修正
     │   ├── 快照: 保存原始结果用于还原
     │   └── 依赖: parallelDispatch (并行调度)
     │
     └── ControlArea (操作按钮)
         ├── 复制全文 → clipboard.rs (copy_img / writeText)
         ├── 一键翻译 → emit "translate-from-ocr" + 打开翻译窗口
         ├── 重新框选 → emit "re-screenshot"
         ├── 还原原始 → 从快照恢复
         └── 系统 OCR toggle → 切换 system_ocr.rs / 在线 API
```

**上游依赖**：
- `screenshot.rs`：截图流程 → 图片数据
- `system_ocr.rs`：macOS/Windows 系统原生 OCR
- `parallelDispatch`：并发调用在线 OCR 服务
- `clipboard.rs`：剪贴板图片读取

**下游消费者**：
- `Translate/index.jsx`：OCR 结果一键翻译
- `Collection`：识别文字保存

**跨窗口交互**：
- 截图窗口 (Screenshot) → OCR 窗口：截图完成后打开 OCR 窗口
- OCR 窗口 → 翻译窗口：点击 "翻译" 后 `window.open` 或 Tauri event

## 参考

- [32-prd-百度腾讯OCR](./32-prd-百度腾讯OCR.md) — 百度/腾讯 OCR 服务
- [33-prd-讯飞合合火山OCR](./33-prd-讯飞合合火山OCR.md) — 讯飞/合合/火山 OCR 服务
- [34-prd-并行调度策略](./34-prd-并行调度策略.md) — 多 OCR 服务并行调度
- [35-prd-翻译窗口交互](./35-prd-翻译窗口交互.md) — 翻译窗口 ("一键翻译" 联动)
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — Rust 层截图和系统 OCR