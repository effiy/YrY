---

doc_type: test
title: "OCR Provider 适配器 — 测试方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["82-prd-task-OCRProvider适配器"]

type: test
---

# OCR Provider 适配器 — 测试方案

> 来源模块：[82-prd-task-OCRProvider适配器](../../devs/2026-09/82-prd-task-OCRProvider适配器.md)
> 父测试方案：[95-prd-test-YiAi后端集成](./95-prd-test-YiAi后端集成.md)

---

## 测试范围

覆盖 4 个 OCR Provider（Baidu、Tencent、Volcengine、Iflytek）的 RPC 调用、认证流程、并行执行和错误隔离。

| Provider | 认证方式 | 关键验证点 |
|----------|---------|-----------|
| Baidu OCR | OAuth 2.0 Token | 两步调用（token → OCR） |
| Tencent OCR | TC3-HMAC-SHA256 | 4 步签名流程 |
| Volcengine OCR | X-Access-Key-Id Header | 简单头部认证 |
| Iflytek OCR | app_id + JSON Body | 嵌套 JSON 响应解析 |

---

## 测试环境

| 依赖 | 说明 |
|------|------|
| YiAi 运行中 | `cd YiAi && python main.py` (:10086) |
| 有效 API 凭证 | Baidu: client_id + client_secret, Tencent: secret_id + secret_key, Volcengine: access_key + secret_key, Iflytek: app_id + api_key |
| 测试图片 | 包含中英文文字的 base64 编码图片（建议 800×600 以内） |

---

## TC-OC-001: Baidu OCR 基本识别

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `recognize` → `providers: ["baidu_ocr"]`, `language: "zh"` | HTTP 200 |
| 2 | 传入包含中文文字的 base64 图片 | — |
| 3 | 检查 `data[0].text` | 包含识别出的中文，多行以 `\n` 分隔 |
| 4 | 检查 `data[0].provider` | `"baidu_ocr"` |
| 5 | 检查 `data[0].error` | `null` 或无此字段 |

## TC-OC-002: Baidu OCR Token 获取流程

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 检查第一次 HTTP 请求 URL | `POST https://aip.baidubce.com/oauth/2.0/token` |
| 2 | 检查请求参数 | `grant_type=client_credentials, client_id, client_secret` |
| 3 | 检查响应 `access_token` | 非空字符串 |
| 4 | 检查第二次 HTTP 请求 URL | `POST https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic` |
| 5 | 检查第二次请求参数 | `access_token=<token>, language_type, image=<base64>` |

## TC-OC-003: Baidu OCR Token 过期处理

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 使用过期/无效的 client_secret | — |
| 2 | Token 获取返回错误 | Provider 抛出异常 |
| 3 | 检查 RPC 响应 | `data[0].error` 非空，不 crash |

## TC-OC-004: Tencent OCR TC3 签名

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置有效的 `secret_id` 和 `secret_key` | — |
| 2 | 调用 OCR 识别 | — |
| 3 | 检查 `Authorization` Header | 以 `TC3-HMAC-SHA256` 开头 |
| 4 | 检查 `X-TC-Action` Header | `GeneralBasicOCR` |
| 5 | 检查 `X-TC-Version` Header | `2018-11-19` |
| 6 | 检查 `X-TC-Region` Header | `ap-beijing` |

## TC-OC-005: Tencent OCR 签名错误

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 使用错误的 `secret_key` | — |
| 2 | 检查 HTTP 响应 | 腾讯云返回认证失败 |
| 3 | Provider 抛出异常 | `data[0].error` 包含错误信息 |

## TC-OC-006: Volcengine OCR 基本识别

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `recognize` → `providers: ["volcengine_ocr"]` | HTTP 200 |
| 2 | 检查请求 Headers | `X-Access-Key-Id`, `X-Secret-Key` 存在 |
| 3 | 检查请求 Body | `image_base64`, `language` 字段 |
| 4 | 检查 `data[0].text` | 识别的文字（`line_texts` 以 `\n` 拼接） |

## TC-OC-007: Iflytek OCR 响应解析

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `recognize` → `providers: ["iflytek_ocr"]` | HTTP 200 |
| 2 | 检查请求 Body | `header.app_id`, `parameter.ocr.language`, `payload.image` |
| 3 | 检查响应解析 | `payload.result` 二次 JSON 解析 |
| 4 | 检查 `data[0].text` | 从 `block[].line[].word[].content` 拼接 |

## TC-OC-008: 并行 OCR 多引擎

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `providers: ["baidu_ocr", "tencent_ocr"]` | — |
| 2 | 检查 `data` 数组长度 | `2` |
| 3 | `data[0]` 和 `data[1]` 各有 `text` | 非空字符串 |
| 4 | 两个结果可能略有差异 | 不同 OCR 引擎的识别精度不同 |
| 5 | 检查并发执行 | 两次 HTTP 请求同时发起（`asyncio.gather`） |

## TC-OC-009: OCR Provider 失败隔离

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `providers: ["baidu_ocr", "invalid_ocr"]` | — |
| 2 | `data[0]` (baidu_ocr) | 正常结果，`text` 非空 |
| 3 | `data[1]` (invalid) | `error` 非空，`text: ""` |
| 4 | 整体 RPC 响应 | `code: 0`（不因单个失败而整体失败） |

## TC-OC-010: 凭证缺失错误处理

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | Baidu OCR 不传 `client_id` | `ValueError: "Baidu OCR requires client_id and client_secret"` |
| 2 | Tencent OCR 不传 `secret_key` | `ValueError: "Tencent OCR requires secret_id and secret_key"` |
| 3 | Volcengine OCR 不传凭证 | `ValueError` 包含 "access_key" |
| 4 | Iflytek OCR 不传 `app_id` | `ValueError: "Iflytek OCR requires app_id and api_key"` |

## TC-OC-011: 空图片处理

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 传入空 base64 字符串 | Provider 调用第三方 API |
| 2 | 第三方 API 返回错误 | Provider 抛出异常 |
| 3 | RPC 响应 | `data[0].error` 非空 |