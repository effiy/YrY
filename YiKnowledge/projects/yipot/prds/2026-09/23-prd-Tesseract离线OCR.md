---
doc_type: prd
title: "YP-09-S12: Tesseract.js 离线 OCR"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S12
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, OCR, Tesseract, 离线]
category: 项目/桌面应用/需求
---

# YP-09-S12: Tesseract.js 离线 OCR

> 需求编号：YP-09-S12 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 背景

Linux 平台没有系统级 OCR API，需要 Tesseract.js 作为离线备选。同时 Tesseract.js 支持 100+ 语言，可作为系统 OCR 的补充。

## 需求

- 基于 Tesseract.js WASM 版本
- 支持 100+ 语言包按需下载
- 前端运行，无需 Rust FFI
- 首次使用自动下载语言包

## 技术方案

```javascript
import Tesseract from "tesseract.js";

const { data: { text } } = await Tesseract.recognize(imageBase64, "eng+chi_sim");
```

## 验收标准

- [ ] 中英文混合识别正确
- [ ] 语言包自动下载
- [ ] 识别结果可二次翻译

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 语言包下载失败 | 异常 | 提示"语言包下载失败，请检查网络" | 允许手动导入 .traineddata |
| 语言包文件损坏 | 异常 | 提示"语言包文件损坏，正在重新下载" | 自动重试 |
| 识别处理超时 | 异常 | 30s 超时，提示"Tesseract 识别超时" | 建议使用系统 OCR |
| 中英混合文本 | 边界 | 同时加载 eng+chi_sim 语言包 | 正确识别中英混合 |
| WASM 初始化失败 | 异常 | 提示"Tesseract 初始化失败" | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 中英文混合识别 | ≤ 5s | 50 次计时取 P95 |
| 存储 | 语言包大小 | eng ~12MB, chi_sim ~12MB | 磁盘检查 |
| 存储 | WASM 文件大小 | ~2MB | 构建产物检查 |
| 可用性 | Web Worker 非阻塞 | 主线程不阻塞 | Performance 面板 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | Tesseract.js (WASM) | Web Worker | `recognize(image, lang) → {text, confidence}` |
| 依赖 | tesseract.js-core | WASM 下载 | .wasm 文件 |
| 依赖 | 语言包 CDN | HTTP 下载 | .traineddata |
| 被依赖 | OCR 服务选择器 | 插件接口 | `recognize(image, lang) → OCRResult` |

---

## 相关文档

- 开发方案: [23-prd-task-Tesseract离线OCR](../../devs/2026-09/23-prd-task-Tesseract离线OCR.md)
- 测试方案: [23-prd-test-Tesseract离线OCR](../../tests/2026-09/23-prd-test-Tesseract离线OCR.md)
- OCR 服务接口全景: [06-prd-OCR服务接口全景](./06-prd-OCR服务接口全景.md)