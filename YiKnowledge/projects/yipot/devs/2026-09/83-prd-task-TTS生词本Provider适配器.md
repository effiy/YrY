---

doc_type: module
prd_task_id: "YP-09-53-3"
title: "YiAi TTS + 生词本 Provider 适配器 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_backend: 0.3
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiAi TTS + 生词本 Provider 适配器 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `YiAi/src/services/translation/providers/lingva_tts.py` | Lingva TTS（HTTP GET 音频） | 30 |
| `YiAi/src/services/translation/providers/anki.py` | Anki 生词本（AnkiConnect 本地 API） | 50 |
| `YiAi/src/services/translation/providers/eudic.py` | 欧路词典生词本（在线 API） | 35 |
| `YiAi/src/services/translation/tts_service.py` | TTS 服务编排 | 40 |
| `YiAi/src/services/translation/collection_service.py` | 生词本服务编排 | 40 |

---

## 一、TTS — Lingva 语音合成

### 实现

```python
class LingvaTTSProvider(BaseTTSProvider):
    name = "lingva"

    async def _tts(self, text: str, language: str, **config) -> dict:
        request_path = config.get("request_path", "https://lingva.pot-app.com")
        resp = await get_shared_client().get(
            f"{request_path}/api/v1/audio/{language}/{text}"
        )
        data = resp.json()
        return {"audio": data.get("audio", ""), "format": "mp3"}
```

**接口**：`GET /api/v1/audio/{lang}/{text}` → `{audio: "<base64>"}`

**语言支持**：Lingva 实例配置决定支持的语言列表（通常 30+ 语言）。

**与 YiPot 前端的差异**：
- JS 版本使用 `@tauri-apps/api/http fetch()` → Python 使用 `httpx.AsyncClient.get()`
- 音频数据直接作为 base64 字符串返回，无需额外处理

---

## 二、生词本 — Anki (AnkiConnect)

### 实现

```python
class AnkiProvider(BaseCollectionProvider):
    name = "anki"

    async def _collect(self, source: str, target: str, **config) -> None:
        port = config.get("port", 8765)
        base_url = f"http://127.0.0.1:{port}"

        async def anki_connect(action: str, params: dict | None = None):
            body = {"action": action, "version": 6, "params": params or {}}
            resp = await client.post(base_url, json=body, timeout=10.0)
            data = resp.json()
            if data.get("error"):
                raise RuntimeError(f"AnkiConnect error: {data['error']}")
            return data.get("result")

        # 1. 创建牌组
        await anki_connect("createDeck", {"deck": "Pot"})

        # 2. 创建笔记模板
        await anki_connect("createModel", {
            "modelName": "Pot Card",
            "inOrderFields": ["Front", "Back"],
            "isCloze": False,
            "cardTemplates": [{
                "Name": "Pot Card",
                "Front": "{{Front}}",
                "Back": "{{FrontSide}}<hr id=answer>{{Back}}",
            }],
        })

        # 3. 添加卡片
        await anki_connect("addNote", {
            "note": {
                "deckName": "Pot",
                "modelName": "Pot Card",
                "fields": {"Front": source, "Back": target},
            },
        })
```

**关键点**：AnkiConnect 是本地 HTTP API（`127.0.0.1:{port}`），需要 Anki 桌面端安装 [AnkiConnect 插件](https://ankiweb.net/shared/info/2055492159) 并运行。

**操作序列**：`createDeck` → `createModel`（幂等，已存在则忽略） → `addNote`

---

## 三、生词本 — 欧路词典 (Eudic)

### 实现

```python
class EudicProvider(BaseCollectionProvider):
    name = "eudic"

    async def _collect(self, source: str, target: str, **config) -> None:
        token = config.get("token", "")
        body = {"word": source, "translation": target, "token": token}
        resp = await get_shared_client().post(
            "https://api.eudic.net/v1/word/save", json=body, timeout=10.0
        )
        data = resp.json()
        if data.get("code") != 0:
            raise RuntimeError(f"Eudic API error: {data.get('message')}")
```

**接口**：`POST https://api.eudic.net/v1/word/save` → `{code: 0, ...}`

**与 Anki 的对比**：

| 特性 | Anki | Eudic |
|------|------|-------|
| 部署方式 | 本地 AnkiConnect API | 在线 API |
| 网络要求 | 本地（无网络） | 需要网络 |
| 认证 | 无（本地信任） | Token 认证 |
| 卡片模板 | 可自定义 | 固定格式 |
| 音频支持 | 支持（AnkiConnect audio） | 不支持 |

---

## 四、实施进度

| 编号 | Provider | 类型 | 源 JS 文件 | 状态 |
|------|----------|------|-----------|------|
| T-01 | Lingva | TTS | `services/tts/lingva/index.jsx` | ✅ |
| C-01 | Anki | 生词本 | `services/collection/anki/index.jsx` | ✅ |
| C-02 | Eudic | 生词本 | `services/collection/eudic/index.jsx` | ✅ |