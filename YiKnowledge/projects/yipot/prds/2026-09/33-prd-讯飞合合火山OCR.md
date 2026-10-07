---
doc_type: prd
title: "YP-09-S22: 讯飞/合合/火山 OCR 服务集成"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S22
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, OCR, 讯飞, 合合, 火山]
category: 项目/桌面应用/需求
---

# YP-09-S22: 讯飞/合合/火山 OCR 服务集成

> 需求编号：YP-09-S22 · 优先级：P2 · 人天：0.5d · 状态：已完成

## 科大讯飞 OCR

| 服务 | 目录 | 特点 |
|------|------|------|
| 讯飞通用 | `recognize/iflytek/` | 通用文字识别 |
| 合合信息 | `recognize/iflytek_intsig/` | 名片/证件结构化识别 |
| 讯飞 LaTeX | `recognize/iflytek_latex/` | 公式转 LaTeX |

## 火山 OCR

| 服务 | 目录 | 特点 |
|------|------|------|
| 火山通用 | `recognize/volcengine/` | 通用识别 |
| 火山多语言 | `recognize/volcengine_multi_lang/` | 100+ 语言 |

## 其他 OCR

| 服务 | 目录 | 特点 |
|------|------|------|
| Simple LaTeX | `recognize/simple_latex/` | 本地公式识别 |
| 二维码 | `recognize/qrcode/` | jsQR 本地解码 |

## 验收标准

- [ ] 合合信息返回结构化字段
- [ ] 讯飞 LaTeX 返回有效 LaTeX 代码
- [ ] 二维码 < 500ms 解码
- [ ] 火山多语言支持非中英文

## 量化验收标准

| 指标 | 讯飞通用 | 合合信息 | 讯飞 LaTeX | 火山通用 | 火山多语言 | Simple LaTeX | 二维码 |
|------|----------|----------|------------|----------|------------|--------------|--------|
| 中文识别率 | >= 95% | — | — | >= 95% | >= 93% | — | — |
| API 响应 (P50) | < 800ms | < 1500ms | < 2000ms | < 800ms | < 1200ms | < 500ms | < 500ms |
| API 响应 (P95) | < 2000ms | < 3500ms | < 4000ms | < 2000ms | < 3000ms | < 1000ms | < 800ms |
| 结构化字段准确率 | — | >= 90% | — | — | — | — | — |
| LaTeX 公式准确率 | — | — | >= 92% | — | — | >= 85% | — |
| 多语言覆盖 | — | — | — | — | 100+ 种 | — | — |
| 离线可用 | 否 | 否 | 否 | 否 | 否 | 是 | 是 |

**特殊验收**：
- 合合信息名片识别返回结构化字段：姓名、公司、职位、电话、邮箱、地址（至少 4 个字段有值）
- 讯飞 LaTeX 公式输出在 KaTeX/MathJax 渲染后无语法错误
- 火山多语言对日语、韩语、阿拉伯语的识别率 >= 90%
- Simple LaTeX 仅支持单行公式，复杂度限制：最多 20 个 token

## 边界条件与异常处理

| 场景 | 输入 | 预期行为 | 恢复策略 |
|------|------|----------|----------|
| 合合信息无结构化内容 | 普通文字图片 | 返回空结构化字段，fallback 到通用文字 | 降级到讯飞通用 OCR |
| 讯飞 LaTeX 非公式图片 | 纯文字截图 | 返回空或原始文字 | 提示 "未检测到公式" |
| 二维码模糊/破损 | 低分辨率 QR | 解码失败返回 null | 提示 "无法识别二维码" |
| 二维码非标准 | Data Matrix/PDF417 | 仅 QR Code 支持，其他格式跳过 | 明确提示支持的格式 |
| 火山多语言生僻语言 | 泰语/越南语 | 识别率可能 < 85% | 标注 "该语言识别精度有限" |
| Simple LaTeX 复杂公式 | 多行/矩阵公式 | 返回部分结果或空 | 降级到讯飞 LaTeX（网络请求） |
| 讯飞服务并发限制 | > 5 并发 | 排队，最多等待 30s | 超时自动取消 |
| 火山 TLS 版本不兼容 | Windows 7 (TLS 1.1) | 连接失败 | 提示升级系统/手动安装 TLS 1.2 补丁 |

## 非功能需求

### 性能
- 本地识别（Simple LaTeX、二维码）不阻塞主线程，使用 Web Worker 或 Tauri async command
- 合合信息图片预处理（压缩/格式转换）在 Rust 层完成，避免 JS 层大图片内存问题

### 安全
- API Key/Secret 与百度腾讯统一存储到 `tauri-plugin-store`
- 讯飞 APPID + APIKey + APISecret 三重凭证，不能明文日志

### 可观测性
- 合合信息结构化字段命中率监控（预留）
- LaTeX 公式渲染成功率统计

## 模块交互

```
UI Layer                         Rust Layer                      External API
─────────                        ──────────                      ────────────
OCR Window                        recognize command
     │                                  │
     ▼                                  ▼
ServiceSelector ─────→ [iflytek.rs] ──→ api.xfyun.cn
                   ├→ [iflytek_intsig.rs] → api.xfyun.cn (名片)
                   ├→ [iflytek_latex.rs] → api.xfyun.cn (公式)
                   ├→ [volcengine.rs] ──→ open.volcengineapi.com
                   ├→ [volcengine_multi.rs] → open.volcengineapi.com
                   ├→ simple_latex.js (本地 WASM/JS)
                   └→ jsQR (本地 JS 库)
```

**上游依赖**：
- `screenshot.rs`：截图图片数据
- `clipboard.rs`：剪贴板中的二维码图片

**下游消费者**：
- `LaTeXRenderer`：渲染公式为 SVG（基于 KaTeX）
- `Collection`：名片结构化信息存入联系人

**特殊说明**：
- 合合信息依赖讯飞平台（`iflytek_intsig`），共享讯飞 API 通道
- Simple LaTeX 和二维码为纯前端实现，不经过 Rust 层
- 火山多语言服务需要额外配置语言参数，需 `lang_detect.rs` 的自动检测结果

## 参考

- [32-prd-百度腾讯OCR](./32-prd-百度腾讯OCR.md) — 百度/腾讯 OCR
- [34-prd-并行调度策略](./34-prd-并行调度策略.md) — 多 OCR 服务并行调度
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — Rust 层截图和语言检测
- [36-prd-OCR窗口交互](./36-prd-OCR窗口交互.md) — OCR 结果展示 UI