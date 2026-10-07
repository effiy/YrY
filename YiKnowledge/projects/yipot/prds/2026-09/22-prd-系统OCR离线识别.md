---
doc_type: prd
title: "YP-09-S11: 系统 OCR 离线识别"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S11
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, OCR, 系统OCR, 离线]
category: 项目/桌面应用/需求
---

# YP-09-S11: 系统 OCR 离线识别

> 需求编号：YP-09-S11 · 优先级：P0 · 人天：1.0d · 状态：已完成

## 背景

云 OCR 服务需要网络和 API Key，在离线或无账号场景下不可用。系统原生 OCR 无需网络、无需配置，即开即用。

## 需求

### macOS — Vision Framework

```rust
// system_ocr.rs
#[cfg(target_os = "macos")]
fn macos_ocr(image: CGImage, language: String) -> Result<String, String> {
    // VNRecognizeTextRequest → 识别文字
}
```

支持语言：中/英/日/韩/法/德/西/意/葡

### Windows — Windows.Media.OCR

```rust
#[cfg(target_os = "windows")]
fn windows_ocr(image: &[u8], language: String) -> Result<String, String> {
    // OcrEngine → 识别文字
}
```

支持语言：系统已安装的语言包

## 验收标准

- [ ] macOS 离线 OCR 中英文识别正确
- [ ] Windows 离线 OCR 可用
- [ ] 无需配置 API Key
- [ ] 识别速度 < 1s

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| macOS Vision 框架不可用 | 异常 | 降级到 Tesseract | — |
| Windows OCR 未安装对应语言包 | 异常 | 提示"请在设置中安装 {lang} 语言包" | 链接到系统语言设置 |
| 图片质量极差 | 边界 | 识别置信度低，结果标注警告 | 建议使用云 OCR |
| 识别结果完全空 | 异常 | 显示"系统 OCR 未能识别到文字" | 降级到 Tesseract |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | macOS Vision OCR | ≤ 500ms (1920x1080) | 50 次计时取 P95 |
| 性能 | Windows OCR | ≤ 1s (1920x1080) | 50 次计时取 P95 |
| 隐私 | 完全离线 | 数据不离开本机 | 离线验证 + 抓包确认 |
| 兼容性 | macOS 最低版本 | 10.15 (Vision Framework) | 系统要求检查 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | macOS Vision Framework | Rust FFI (objc) | CGImage → VNRecognizeTextRequest |
| 依赖 | Windows.Media.OCR | Rust FFI (winrt) | image bytes → OcrEngine |
| 被依赖 | OCR 服务选择器 | 插件接口 | `recognize(image) → {text, confidence}` |

---

## 相关文档

- 开发方案: [22-prd-task-系统OCR离线识别](../../devs/2026-09/22-prd-task-系统OCR离线识别.md)
- 测试方案: [22-prd-test-系统OCR离线识别](../../tests/2026-09/22-prd-test-系统OCR离线识别.md)
- OCR 服务接口全景: [06-prd-OCR服务接口全景](./06-prd-OCR服务接口全景.md)
- Rust 截图 OCR 模块: [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md)