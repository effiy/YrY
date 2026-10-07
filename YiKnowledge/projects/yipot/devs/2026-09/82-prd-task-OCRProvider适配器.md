---

doc_type: module
prd_task_id: "YP-09-53-2"
title: "YiAi OCR Provider 适配器 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 0.5
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiAi OCR Provider 适配器 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiAi/src/services/translation/providers/baidu_ocr.py` | 百度 OCR（OAuth token 获取 + 通用文字识别） | 50 |
| `YiAi/src/services/translation/providers/tencent_ocr.py` | 腾讯云 OCR（TC3-HMAC-SHA256 签名） | 75 |
| `YiAi/src/services/translation/providers/volcengine_ocr.py` | 火山 OCR（`X-Access-Key-Id` + `X-Secret-Key`） | 40 |
| `YiAi/src/services/translation/providers/iflytek_ocr.py` | 讯飞 OCR（app_id + JSON-RPC 风格 Body） | 65 |

---

## 一、架构设计

### 1.1 OCR 基类

```python
class BaseRecognizeProvider(ABC):
    name: str = "base"
    label: str = "Base OCR"

    @abstractmethod
    async def _recognize(self, image_base64: str, language: str, **config) -> str: ...

    async def recognize(self, image_base64: str, language: str, **config) -> str:
        return (await self._recognize(image_base64, language, **config)).strip()
```

与翻译 Provider 的设计一致：`_recognize` 是子类需要实现的抽象方法，`recognize` 是带统一后处理的模板方法。

---

## 二、关键 Provider 实现

### 2.1 百度 OCR — OAuth Token 获取

```python
class BaiduOCRProvider(BaseRecognizeProvider):
    name = "baidu_ocr"

    async def _recognize(self, image_base64, language, **config) -> str:
        client_id = config.get("client_id", "")
        client_secret = config.get("client_secret", "")

        # 第一步：获取 access_token
        token_resp = await get_shared_client().post(
            "https://aip.baidubce.com/oauth/2.0/token",
            params={"grant_type": "client_credentials",
                    "client_id": client_id,
                    "client_secret": client_secret},
        )
        access_token = token_resp.json()["access_token"]

        # 第二步：调用 OCR API
        resp = await get_shared_client().post(
            "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic",
            params={"access_token": access_token},
            data={"language_type": language, "image": image_base64},
        )
        data = resp.json()
        words = data.get("words_result", [])
        return "\n".join(w["words"] for w in words)
```

**关键点**：百度 OCR 需要两步调用——先获取 OAuth token，再用 token 调用 OCR。Token 有有效期，但为简化每次请求都获取新 token。

### 2.2 腾讯云 OCR — TC3 签名

与翻译 Provider 的 TC3-HMAC-SHA256 签名流程一致，区别在于：
- endpoint: `ocr.tencentcloudapi.com`（而非 `tmt.tencentcloudapi.com`）
- service: `ocr`（而非 `tmt`）
- action: `GeneralBasicOCR`（而非 `TextTranslate`）
- version: `2018-11-19`（而非 `2018-03-21`）

```python
payload = json.dumps({"ImageBase64": image_base64, "LanguageType": language})
# ... 同样的 4 步签名流程 ...
headers = {
    "X-TC-Action": "GeneralBasicOCR",
    "X-TC-Version": "2018-11-19",
    ...
}
```

### 2.3 火山 OCR — 简单头部认证

```python
body = {"image_base64": image_base64, "language": language}
headers = {
    "X-Access-Key-Id": access_key,
    "X-Secret-Key": secret_key,
}
resp = await client.post("https://visual.volcengineapi.com/", json=body)
data = resp.json()
lines = data.get("data", {}).get("line_texts", [])
return "\n".join(lines)
```

### 2.4 讯飞 OCR — 结构化 JSON Body

```python
body = {
    "header": {"app_id": app_id},
    "parameter": {"ocr": {"language": language, "result": {
        "encoding": "utf8", "compress": "raw", "format": "json"
    }}},
    "payload": {"image": {"encoding": "jpg", "image": image_base64, "status": 3}},
}
# 解析嵌套响应
data = resp.json()
payload_data = json.loads(data["payload"]["result"])  # 二次 JSON 解析
for block in payload_data.get("block", []):
    for line in block.get("line", []):
        for word in line.get("word", []):
            result += word.get("content", "")
```

**关键点**：讯飞 OCR 的响应中 `payload.result` 是 JSON 字符串，需要二次解析。

---

## 三、与桌面系统 OCR 的关系

| OCR 类型 | 执行位置 | 网络要求 | 提供商 |
|---------|---------|---------|--------|
| 系统 OCR | Rust 本地 | 离线 | Windows OCR / macOS Vision / Tesseract |
| 在线 OCR | Python YiAi | 需要网络 | Baidu / Tencent / Volcengine / Iflytek |

桌面系统 OCR 不受本次改造影响，始终在 Rust 层本地执行。在线 OCR 通过 YiAi RPC 调用，未来可在 YiVad/YiPet 中复用。

---

## 四、实施进度

| 编号 | Provider | 源 JS 文件 | 认证方式 | 状态 |
|------|----------|-----------|---------|------|
| R-01 | Baidu OCR | `services/recognize/baidu/index.jsx` | OAuth Token | ✅ |
| R-02 | Tencent OCR | `services/recognize/tencent/index.jsx` | TC3-HMAC-SHA256 | ✅ |
| R-03 | Volcengine OCR | `services/recognize/volcengine/index.jsx` | Access Key 头部 | ✅ |
| R-04 | Iflytek OCR | `services/recognize/iflytek/index.jsx` | app_id + JSON Body | ✅ |