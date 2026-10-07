---
doc_type: prd
title: "YP-09-S21: 百度/腾讯 OCR 服务集成"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S21
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, OCR, 百度, 腾讯]
category: 项目/桌面应用/需求
---

# YP-09-S21: 百度/腾讯 OCR 服务集成

> 需求编号：YP-09-S21 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 百度 OCR (3 个服务)

| 服务 | 目录 | 特点 |
|------|------|------|
| 百度通用 | `recognize/baidu/` | 中文识别率高 |
| 百度精准 | `recognize/baidu_accurate/` | 含文字位置坐标 |
| 百度图片 | `recognize/baidu_img/` | 多图片格式 |

## 腾讯 OCR (3 个服务)

| 服务 | 目录 | 特点 |
|------|------|------|
| 腾讯通用 | `recognize/tencent/` | 通用识别 |
| 腾讯精准 | `recognize/tencent_accurate/` | 高精度 |
| 腾讯图片 | `recognize/tencent_img/` | 图片识别 |

## 验收标准

- [ ] 百度精准返回文字 + 位置坐标
- [ ] 腾讯 OCR 多语言支持
- [ ] 各服务独立可启用/禁用

## 量化验收标准

| 指标 | 百度通用 | 百度精准 | 腾讯通用 | 腾讯精准 |
|------|----------|----------|----------|----------|
| 中文识别准确率 | >= 95% | >= 97% | >= 95% | >= 97% |
| 英文识别准确率 | >= 93% | >= 95% | >= 93% | >= 95% |
| API 响应时间 (P50) | < 800ms | < 1200ms | < 800ms | < 1200ms |
| API 响应时间 (P95) | < 2000ms | < 3000ms | < 2000ms | < 3000ms |
| 图片识别 API 调用成功率 | >= 99.5% | — | >= 99.5% | — |
| 位置坐标精度 (IoU) | — | >= 0.9 | — | >= 0.9 |

**验收规则**：
- 每个服务独立验收，不可互相掩盖缺陷
- 百度精准返回的位置坐标需提供 bounding box 四元组 `(x, y, width, height)`
- 图片服务需支持至少 PNG/JPG/WEBP/BMP 四种格式，单张图片 <= 4MB
- 腾讯多语言覆盖至少 15 种语言，含中日韩英法德西葡俄阿

## 边界条件与异常处理

| 场景 | 输入 | 预期行为 | 恢复策略 |
|------|------|----------|----------|
| API Key 未配置 | 空字符串 | 服务标记为不可用，UI 灰显 | 用户填入 Key 后自动激活 |
| API Key 过期 | 已过期 Key | 返回认证错误 `401/403`，提示 "密钥已过期" | 引导用户更新 Key |
| 配额耗尽 (429) | 超出每日调用量 | 返回配额错误，显示 "今日配额已用尽" | 次日自动恢复，显示剩余配额 |
| 空白图片 | 纯色/空白图片 | 返回空结果而非报错 | 提示 "未检测到文字" |
| 超大图片 | > 10MB 图片 | 拒绝请求，提示 "图片过大，请压缩后重试" | 自动压缩到 4MB 以下 |
| 网络超时 | 10s 无响应 | AbortController 取消，显示 "网络连接超时" | 自动重试 1 次（间隔 2s） |
| 百度精准无文字区域 | 风景/纯色图片 | 返回空数组 `[]`，不报错 | 降级到通用 OCR |
| 腾讯服务并发限制 | 同时 5 个请求 | 超出请求排队等待 | 队列长度 <= 10，超限拒绝 |
| 特殊字符/Emoji | 文本含特殊字符 | 正常返回，不截断，不替换 | — |

## 非功能需求

### 性能
- **并发支持**：同服务最多 3 个并发请求（百度 API 限制），不同服务间不互相阻塞
- **冷启动**：首次加载 API SDK/端点信息 < 200ms
- **内存**：单次 OCR 请求额外内存开销 < 5MB

### 安全
- API Key 存储于 Tauri Store（文件系统，非明文 Web Storage），使用 `tauri-plugin-store` 加密
- 传输层强制 HTTPS，证书校验不可绕过
- 日志中脱敏 API Key（仅显示前 4 位 + 后 4 位）

### 可观测性
- 每次 API 调用记录：服务名、耗时、状态码、图片大小
- 错误率 > 5% 时触发监控告警（预留接口）

## 模块交互

```
UI Layer                     Rust Layer                    External API
─────────                    ──────────                    ────────────
Translate/OCR Window         clipboard.rs (截图/选文)
       │                           │
       ▼                           ▼
ServiceSelector.jsx         recognize command
       │                           │
       ▼                           ▼
  Promise.allSettled ────→ [baidu.rs] ────→ api.baidu.com
  (并行调度)          ├──→ [baidu_accurate.rs] → aip.baidubce.com
                      ├──→ [tencent.rs] ───→ ocr.tencentcloudapi.com
                      └──→ [tencent_accurate.rs] → ocr.tencentcloudapi.com
       │                           │
       ▼                           ▼
  ResultAggregator.jsx     error.rs (统一错误类型)
```

**上游依赖**：
- `clipboard.rs`：提供截图/选文的原始图片数据
- `screenshot.rs`：截图流程中生成待 OCR 的图片

**下游消费者**：
- `翻译窗口 (Translate)`：OCR 结果传入翻译管道
- `收藏模块 (Collection)`：识别文字可保存到生词本

**配置依赖**：
- `tauri-plugin-store`：读写各服务 API Key、启用状态
- `设置页面 > Recognize 配置`：服务开关和 Key 管理界面

## 参考

- [33-prd-讯飞合合火山OCR](./33-prd-讯飞合合火山OCR.md) — 其他 OCR 服务
- [34-prd-并行调度策略](./34-prd-并行调度策略.md) — 多 OCR 服务并行调度
- [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md) — Rust 层截图和 OCR 实现
- [36-prd-OCR窗口交互](./36-prd-OCR窗口交互.md) — OCR 结果的 UI 展示