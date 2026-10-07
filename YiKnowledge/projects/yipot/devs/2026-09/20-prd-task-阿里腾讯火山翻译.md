---

doc_type: module
prd_task_id: "YP-09-S19"
title: "阿里/腾讯/火山翻译 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "30-prd-阿里腾讯火山翻译.md"

type: task
---

# 阿里/腾讯/火山翻译 — 开发方案

## 源码

`YiPot/src/services/translate/alibaba/`
`YiPot/src/services/translate/tencent/`
`YiPot/src/services/translate/volcengine/`

## 阿里翻译

```javascript
// HMAC-SHA1 签名
import CryptoJS from "crypto-js";

function sign(params, secret) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${encodeURIComponent(params[k])}`).join("&");
  return CryptoJS.HmacSHA1(`POST&/&${encodeURIComponent(sorted)}`, secret + "&").toString(CryptoJS.enc.Base64);
}
```

## 腾讯翻译

```javascript
// TC3-HMAC-SHA256 签名
// SecretId + SecretKey → 临时签名 → Authorization header
const endpoint = "tmt.tencentcloudapi.com";
const headers = { "X-TC-Action": "TextTranslate", "Authorization": sign(...) };
```

## 设计决策

### 阿里翻译

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 签名算法 | HMAC-SHA1 (阿里云通用签名 V1) | HMAC-SHA256 (V3 签名) | 阿里翻译 API 要求 V1 签名格式，V3 仅在部分新服务中支持 | SHA1 安全性低于 SHA256，但阿里云服务端仅支持 V1 |
| 签名参数排序 | Object.keys(params).sort() → 字典序拼接 | 固定顺序硬编码 | 阿里云规范要求参数名按字典序排列 | 每次请求前需排序 |
| 语言代码 | 使用阿里语言代码 (zh/en/ja/ko/fr/de/es/pt/ru/ar/th/vi) | 内部通用语言代码 | 阿里翻译有独立的语言代码体系，必须映射 | 需要维护映射表 |
| 区域选择 | cn-hangzhou (默认) | cn-shanghai 等 | Hangzhou 是阿里翻译服务的主区域，延迟最低 | 海外用户可能延迟较高 |

### 腾讯翻译

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 签名版本 | TC3-HMAC-SHA256 (API 3.0) | API 2.0 (HMAC-SHA1) | 腾讯云推荐 3.0 签名，安全性更强，是新服务的默认标准 | 比 V1 签名多一次日期服务请求 (获取 UTC 时间) |
| 服务端点 | tmt.tencentcloudapi.com | 旧版 tmt.api.qcloud.com | API 3.0 统一端点格式 | 仅支持 3.0 规范的 API |
| Action 参数 | TextTranslate (X-TC-Action header) | — | 腾讯云 API 强制使用 X-TC-Action 指定操作 | — |
| SignedHeaders | content-type;host;x-tc-action | 仅 host | 腾讯云要求签名包含 content-type 和 x-tc-action | — |

### 火山翻译

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 签名算法 | HMAC-SHA256 (火山引擎 V4 签名) | HMAC-SHA1 | 火山引擎强制要求 V4 签名 (AWS 签名兼容) | V4 签名实现较复杂，~40 行 |
| 时间戳格式 | X-Date: UTC RFC 1123 格式 | ISO 8601 | 火山引擎要求 RFC 1123 (如 "Mon, 23 Sep 2026 10:30:00 GMT") | 需要手动格式化 Date → RFC 1123 |
| SignedHeaders | x-date;host;x-content-sha256 | — | 火山引擎签名要求包含 x-content-sha256 | 需要计算请求体 SHA256 |
| 服务名称 | translate (Service 参数) | — | 火山翻译固定的服务名称 | — |

## 认证流程详解

### 阿里翻译 — HMAC-SHA1 签名 (阿里云通用签名 V1)

```
认证方式: Access Key ID + Access Key Secret HMAC-SHA1 签名
端点: https://mt.cn-hangzhou.aliyuncs.com/
Action: Translate (阿里机器翻译 API)

签名流程:
  1. 构建请求参数:
     {
       Format: "JSON",
       Version: "2018-10-12",
       AccessKeyId: "{AccessKeyId}",
       SignatureMethod: "HMAC-SHA1",
       SignatureVersion: "1.0",
       SignatureNonce: "{UUID}",     // 随机数防重放
       Timestamp: "{ISO8601}",        // UTC 时间戳
       Action: "Translate",
       SourceLanguage: "zh",
       TargetLanguage: "en",
       SourceText: "你好世界",
       Scene: "general"               // 通用翻译场景
     }

  2. 参数排序与编码:
     1) 按参数名 ASCII 字典序排序
     2) 对每个键值对: encodeURIComponent(key) + "=" + encodeURIComponent(value)
     3) 用 "&" 连接: k1=v1&k2=v2&...

  3. 生成待签名字符串:
     StringToSign = "POST" + "&" + encodeURIComponent("/") + "&" + encodeURIComponent(sortedParams)
     
  4. 计算签名:
     sign = HMAC-SHA1(SecretKey + "&", StringToSign)
     signature = Base64(sign)

  5. 将签名添加到请求参数:
     params.Signature = signature
     POST https://mt.cn-hangzhou.aliyuncs.com/
     Content-Type: application/x-www-form-urlencoded
     Body: sortedParams&Signature={signature}

密钥获取:
  阿里云控制台 → RAM 访问控制 → 创建 AccessKey
  AccessKey ID 用于标识身份，AccessKey Secret 用于生成签名

安全性:
  - HMAC-SHA1 仅用于签名，不加密请求体
  - SignatureNonce + Timestamp 防止重放攻击 (阿里云 15 分钟内相同 SignatureNonce 拒绝)
  - HTTPS 传输保证密钥不泄露
```

### 腾讯翻译 — TC3-HMAC-SHA256 签名 (API 3.0)

```
认证方式: SecretId + SecretKey TC3-HMAC-SHA256 签名
端点: https://tmt.tencentcloudapi.com/
Action: TextTranslate (X-TC-Action: TextTranslate)

签名流程 (四步):
  Step 1 — 构建规范请求 (CanonicalRequest):
    HTTPMethod = "POST"
    CanonicalURI = "/"
    CanonicalQueryString = ""                    // GET 参数 (POST 为空)
    CanonicalHeaders = "content-type:application/json; charset=utf-8\n"
                     + "host:tmt.tencentcloudapi.com\n"
                     + "x-tc-action:texttranslate\n"
    SignedHeaders = "content-type;host;x-tc-action"
    HashedRequestPayload = SHA256(JSON请求体)    // 小写十六进制
    CanonicalRequest = HTTPMethod + "\n"
                     + CanonicalURI + "\n"
                     + CanonicalQueryString + "\n"
                     + CanonicalHeaders + "\n"
                     + SignedHeaders + "\n"
                     + HashedRequestPayload

  Step 2 — 构建待签名字符串:
    Algorithm = "TC3-HMAC-SHA256"
    RequestTimestamp = "{Unix秒级时间戳}"        // X-TC-Timestamp
    Date = "{UTC日期 YYYY-MM-DD}"
    Service = "tmt"
    CredentialScope = Date + "/" + Service + "/tc3_request"
    HashedCanonicalRequest = SHA256(CanonicalRequest)
    StringToSign = Algorithm + "\n"
                 + RequestTimestamp + "\n"
                 + CredentialScope + "\n"
                 + HashedCanonicalRequest

  Step 3 — 计算签名 (多层 HMAC):
    kDate = HMAC_SHA256("TC3" + SecretKey, Date)
    kService = HMAC_SHA256(kDate, Service)
    kSigning = HMAC_SHA256(kService, "tc3_request")
    Signature = Hex(HMAC_SHA256(kSigning, StringToSign))

  Step 4 — 构建 Authorization Header:
    Authorization = "TC3-HMAC-SHA256 "
                  + "Credential=" + SecretId + "/2026-09-23/tmt/tc3_request, "
                  + "SignedHeaders=content-type;host;x-tc-action, "
                  + "Signature=" + Signature

请求示例:
  POST https://tmt.tencentcloudapi.com/
  Headers:
    Content-Type: application/json; charset=utf-8
    Host: tmt.tencentcloudapi.com
    X-TC-Action: TextTranslate
    X-TC-Version: 2018-03-21
    X-TC-Timestamp: 1695456000
    X-TC-Region: ap-guangzhou
    Authorization: TC3-HMAC-SHA256 Credential=.../2026-09-23/tmt/tc3_request, ...
  Body:
    {
      "SourceText": "你好世界",
      "Source": "zh",
      "Target": "en",
      "ProjectId": 0
    }

密钥获取:
  腾讯云控制台 → 访问管理 → API 密钥管理 → 创建密钥
  SecretId 用于标识身份，SecretKey 用于生成签名

安全特点:
  - TC3-HMAC-SHA256 是腾讯云推荐的最新签名版本，比 V1 安全性更高
  - 多层 HMAC 派生 (kSecret → kDate → kService → kSigning) 限制密钥泄露范围
  - 签名包含请求体哈希，防止请求篡改
```

### 火山翻译 — HMAC-SHA256 签名 (火山引擎 V4)

```
认证方式: Access Key + Secret Key HMAC-SHA256 签名 (AWS V4 兼容)
端点: https://translate.volcengineapi.com/
Action: TranslateText (火山翻译文本翻译)

签名流程:
  1. 请求基本信息:
     Host: translate.volcengineapi.com
     X-Date: "{UTC RFC 1123 格式}"         // 如 "Mon, 23 Sep 2026 10:30:00 GMT"
     X-Content-Sha256: SHA256(请求体)      // 小写十六进制

  2. 构建签名:
     // 使用火山引擎 V4 签名 (兼容 AWS Signature V4)
     StringToSign = [X-Date] + "\n"
                  + [X-Content-Sha256] + "\n"
                  + [请求体内容]
     Signature = HMAC-SHA256(SecretKey, StringToSign) → Base64

  3. 构建 Authorization Header:
     Authorization = "HMAC-SHA256 "
                   + "Credential=" + AccessKey + "/20260923/cn-north-1/translate/request, "
                   + "SignedHeaders=x-date;host;x-content-sha256, "
                   + "Signature=" + Signature

请求示例:
  POST https://translate.volcengineapi.com/
  Headers:
    Content-Type: application/json
    Host: translate.volcengineapi.com
    X-Date: Mon, 23 Sep 2026 10:30:00 GMT
    X-Content-Sha256: abc123...
    Authorization: HMAC-SHA256 Credential=AKxxx/20260923/cn-north-1/translate/request, ...
  Body:
    {
      "TargetLanguage": "en",
      "TextList": ["你好世界"]
    }

密钥获取:
  火山引擎控制台 → 访问控制 → 密钥管理 → 新建密钥
  Access Key 用于标识身份，Secret Key 用于生成签名

特点:
  - 请求体 SHA256 参与签名 → 任何请求体修改都会导致签名不匹配
  - X-Date 有效窗口通常 5 分钟 (服务端时间偏差容忍)
  - 区域参数 (cn-north-1) 参与签名 Credential Scope
```

## 错误处理与恢复

### 阿里翻译

| 错误类型 | 错误码/信号 | 处理策略 | 用户感知 |
|---------|-----------|---------|---------|
| Access Key ID 无效 | Code: "InvalidAccessKeyId.NotFound" | 标记 unauthorized | "阿里云 AccessKey ID 无效" |
| 签名不匹配 | Code: "SignatureDoesNotMatch" | 重新规范参数排序 → 重试 1 次 | "签名验证失败，正在重试" |
| 签名已过期 | Code: "SignatureExpired" | 刷新 Timestamp → 重试 1 次 | — (自动修复) |
| 不支持的语言对 | Code: "UnsupportedLanguagePair" | 灰显阿里翻译选项 | "阿里翻译不支持该语言组合" |
| 计费未开通 | Code: "UnsupportedOperation" | 提示开通阿里翻译服务 | "未开通阿里机器翻译服务" |
| 翻译内容过长 | Code: "TextTranslateError" | 截断至 5,000 字符 | "文本过长，已自动截断" |
| 服务器内部错误 | Code: "InternalError" | 自动重试 1 次 (2s 退避) | "阿里翻译服务异常，正在重试" |
| 请求超频 (流控) | Code: "Throttling.User" | 退避 3s → 重试 1 次 | "请求频繁，请稍后重试" |
| 网络超时 | fetch timeout | 标记 timeout → 自动重试 1 次 | "阿里云连接超时" |

### 腾讯翻译

| 错误类型 | 错误码/信号 | 处理策略 | 用户感知 |
|---------|-----------|---------|---------|
| 签名错误 | AuthFailure.SignatureFailure | 重新计算签名 → 重试 1 次 | "签名验证失败，正在重试" |
| SecretId 不存在 | AuthFailure.SecretIdNotFound | 标记 unauthorized | "腾讯云 SecretId 无效" |
| token 过期 | AuthFailure.TokenFailure | 提示刷新临时凭证 | "临时凭证已过期" |
| 不支持的操作 | UnsupportedOperation | 标记 bad_request | "不支持的操作类型" |
| 超出字符限制 | LimitExceeded | 截断至 5,000 字符 | "文本过长，已自动截断" |
| 欠费停止服务 | ResourceUnavailable.InArrears | 标记 quota_exhausted | "腾讯云账户欠费" |
| 未开通服务 | ResourceUnavailable.NotExists | 提示开通服务 | "未开通腾讯机器翻译服务" |
| 请求频率超限 | RequestLimitExceeded | 退避 3s → 重试 1 次 | "请求频繁，请稍后" |
| 内部错误 | InternalError | 自动重试 1 次 (2s 退避) | "腾讯云服务异常，正在重试" |
| 翻译失败 | FailedOperation | 返回空结果 + 降级 | "腾讯翻译失败" (自动降级) |
| 网络超时 | fetch timeout | 标记 timeout → 自动重试 1 次 | "腾讯云连接超时" |

### 火山翻译

| 错误类型 | 错误码/信号 | 处理策略 | 用户感知 |
|---------|-----------|---------|---------|
| Access Key 无效 | error_code: "InvalidAccessKeyId" | 标记 unauthorized | "火山引擎 Access Key 无效" |
| 签名错误 | error_code: "SignatureDoesNotMatch" | 检查 X-Date 时间偏差 → 重试 | "签名验证失败，正在重试" |
| 请求过期 | error_code: "RequestExpired" | 刷新 X-Date → 重试 (时间偏差 > 5min) | — (自动修复) |
| 未开通服务 | error_code: "ServiceNotActivated" | 提示开通火山翻译服务 | "未开通火山翻译服务" |
| QPS 超限 | error_code: "RequestLimitExceeded" | 退避 3s → 重试 1 次 | "请求频繁，请稍后" |
| 内部错误 | error_code: "InternalError" | 自动重试 1 次 (2s 退避) | "火山引擎服务异常，正在重试" |
| 翻译文本过长 | error_code: "InvalidParameter.TextTooLong" | 截断至 5,000 字符 | "文本过长，已自动截断" |
| 不支持的语言 | error_code: "UnsupportedLanguage" | 灰显火山翻译选项 | "火山翻译不支持该语言组合" |
| 网络超时 | fetch timeout | 标记 timeout → 自动重试 1 次 | "火山引擎连接超时" |

## 性能优化

| 服务 | 优化点 | 手段 | 预期收益 |
|------|--------|------|---------|
| 阿里 | 签名缓存 | Key 固定时签名参数可部分预计算 (除 Timestamp/SignatureNonce 外) | 签名计算 < 5ms |
| 阿里 | 连接复用 | HTTP Keep-Alive (同一端点复用 TCP 连接) | 后续请求延迟 -50ms |
| 阿里 | 缓存 | LRU Cache TTL 10min | 命中时延 < 5ms |
| 腾讯 | 签名时间戳 | 缓存 X-TC-Timestamp (秒级更新，同一秒内复用) | 签名计算免查系统时间 |
| 腾讯 | 请求聚合 | 避免频繁短文本翻译 (短文本用缓存) | 减少 API 调用量 ~20% |
| 腾讯 | 缓存 | LRU Cache TTL 10min | 命中时延 < 5ms |
| 火山 | X-Date 缓存 | UTC 时间秒级缓存，同一秒内不重新生成 | 避免频繁 Date 格式化 |
| 火山 | SHA256 预计算 | 请求体固定结构时预计算 X-Content-Sha256 | 签名计算 < 3ms |
| 火山 | 缓存 | LRU Cache TTL 10min | 命中时延 < 5ms |

## 三服务通用语言代码映射

```
阿里语言代码:
  内部 → 阿里: zh → zh, en → en, ja → ja, ko → ko
  fr → fr, de → de, es → es, pt → pt, ru → ru
  ar → ar, th → th, vi → vi, it → it

腾讯语言代码:
  内部 → 腾讯: zh → zh, en → en, ja → ja, ko → ko
  fr → fr, de → de, es → es, pt → pt, ru → ru
  ar → ar, th → th, vi → vi, it → it, tr → tr
  注意: SourceLanguage 为 "auto" 时腾讯自动检测 → 当前仅支持指定源语言，无 auto 模式

火山语言代码:
  内部 → 火山: zh → zh, en → en, ja → ja, ko → ko
  fr → fr, de → de, es → es, pt → pt, ru → ru
  ar → ar, th → th, vi → vi, it → it, tr → tr
  ms → ms, id → id, tl → fil

不支持的语言 → 翻译时不包含在该服务的语言列表中
```

## 关联文档

| 文档 | 关系 | 路径 |
|------|------|------|
| 阿里/腾讯/火山翻译 PRD | 来源需求 | [30-prd-阿里腾讯火山翻译.md](../../prds/2026-09/30-prd-阿里腾讯火山翻译.md) |
| 翻译核心架构 | 父模块 | [01-prd-task-翻译核心架构.md](./01-prd-task-翻译核心架构.md) |
| 翻译服务插件实现 | 插件规范 | [04-prd-task-翻译服务插件实现.md](./04-prd-task-翻译服务插件实现.md) |
| DeepL 翻译开发方案 | 同级翻译源 | [15-prd-task-DeepL翻译.md](./15-prd-task-DeepL翻译.md) |
| Google 翻译开发方案 | 同级翻译源 | [16-prd-task-Google翻译.md](./16-prd-task-Google翻译.md) |
| 有道翻译开发方案 | 同级翻译源 | [19-prd-task-有道翻译.md](./19-prd-task-有道翻译.md) |
| 阿里云机器翻译 API 文档 | 外部参考 | https://help.aliyun.com/document_detail/158269.html |
| 腾讯云机器翻译 API 文档 | 外部参考 | https://cloud.tencent.com/document/api/551/15619 |
| 火山引擎翻译 API 文档 | 外部参考 | https://www.volcengine.com/docs/4640/65067 |