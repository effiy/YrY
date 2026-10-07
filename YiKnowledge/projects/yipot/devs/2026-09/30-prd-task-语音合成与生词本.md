---

doc_type: module
prd_task_id: "YP-09-M04"
title: "语音合成与生词本 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 2
source_prd: "03-prd-语音合成与生词本.md"

type: task
---

# 语音合成与生词本 — 开发方案

> 来源 PRD：[03-prd-语音合成与生词本.md](../../prds/2026-09/03-prd-语音合成与生词本.md)
> 需求编号：YP-09-M04 · 优先级：P1 · 人天：2d

> **文档职责**：本文档定义 TTS 语音合成、生词本收藏/导出的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、TTS 语音合成实现

### 1.1 TTS Hook 设计

```typescript
// useVoice.ts — React Hook 封装 TTS 能力
interface VoiceController {
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  isSpeaking: Ref<boolean>;
  currentService: Ref<string>;
}

interface SpeakOptions {
  lang?: string;       // 语言代码
  speed?: number;      // 0.5 ~ 2.0, 步长 0.1
  volume?: number;     // 0 ~ 1
  service?: string;    // 指定 TTS 服务, 不传则自动选择
}
```

### 1.2 TTS 服务降级链

```
用户点击朗读
  ├─ Azure TTS (需 API Key) → 首音 < 1s
  ├─ 百度 TTS (需 API Key) → 首音 < 1s
  ├─ 腾讯 TTS (需 API Key) → 首音 < 1s
  └─ 系统 TTS (Web Speech API / 系统语音库) → 首音 < 500ms, 离线
```

**决策理由**：TTS 降级链优先云服务以获得更好的自然度（Azure 支持 100+ 语言，百度中文发音最优），系统 TTS 作为最终降级保证离线可用。

### 1.3 音频缓存策略

```typescript
// ttsCache.ts — 内存 + 磁盘双层缓存
class TTSCache {
  private memoryCache: Map<string, AudioBuffer>;  // LRU, max 50 条
  private diskCache: string;                       // Tauri app_data/tts_cache/
  
  async get(text: string, lang: string, service: string): Promise<AudioBuffer | null> {
    const key = `${service}:${lang}:${hash(text)}`;
    // 1. 内存缓存
    if (this.memoryCache.has(key)) return this.memoryCache.get(key)!;
    // 2. 磁盘缓存
    const cached = await this.readFromDisk(key);
    if (cached) {
      this.memoryCache.set(key, cached);
      return cached;
    }
    return null; // 未命中, 需要请求
  }
  
  async set(key: string, buffer: AudioBuffer): Promise<void> {
    this.memoryCache.set(key, buffer);
    await this.writeToDisk(key, buffer); // 异步写盘
    // LRU 淘汰: 超过 50 条时删除最久未访问
  }
}
```

**性能目标**：缓存命中率 ≥ 80%（相同文本不重复请求云端 TTS）。

### 1.4 超长文本截断

```typescript
function truncateForTTS(text: string, maxLength = 500): {
  truncated: string;
  wasTruncated: boolean;
} {
  if (text.length <= maxLength) return { truncated: text, wasTruncated: false };
  return {
    truncated: text.slice(0, maxLength),
    wasTruncated: true,  // 前端展示"文本过长已截断"提示
  };
}
```

---

## 二、生词本实现

### 2.1 数据结构

```typescript
interface WordEntry {
  id: string;              // 唯一标识
  word: string;            // 原文
  translation: string;     // 译文
  phonetic?: string;       // 音标
  sourceLang: string;      // 源语言
  targetLang: string;      // 目标语言
  context?: string;        // 上下文（翻译时的完整句子）
  tags: string[];          // 用户标签
  createdAt: number;       // 收藏时间戳
  reviewCount: number;     // 复习次数
  lastReviewedAt?: number; // 最后复习时间
}
```

### 2.2 存储方案

使用 `tauri-plugin-store` 独立文件存储生词本数据（`wordbook.json`），与主配置分离：

```typescript
// useWordBook.ts
const wordBookStore = new Store('wordbook.json');

// 容量: 目标支持 1000 条词汇以上
// 读写: Tauri store 自动持久化，每次 add 操作即时写盘
```

### 2.3 AnkiConnect 导出

```typescript
// ankiExport.ts
interface AnkiExportConfig {
  deckName: string;                    // 目标牌组
  modelName: string;                   // 笔记类型
  fieldMapping: Record<string, string>; // 字段映射 { sourceField → ankiField }
}

async function exportToAnki(
  entries: WordEntry[],
  config: AnkiExportConfig
): Promise<void> {
  const endpoint = 'http://127.0.0.1:8765'; // AnkiConnect 默认端口
  
  for (const entry of entries) {
    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        action: 'addNote',
        version: 6,
        params: {
          note: {
            deckName: config.deckName,
            modelName: config.modelName,
            fields: {
              [config.fieldMapping.word]: entry.word,
              [config.fieldMapping.translation]: entry.translation,
              [config.fieldMapping.phonetic]: entry.phonetic || '',
            },
            tags: ['YiPot', ...entry.tags],
          },
        },
      }),
    });
  }
}
```

### 2.4 欧路词典导出

通过欧路词典的 HTTP API（默认 `localhost:64095`）添加生词：

```typescript
async function exportToEudic(word: string, translation: string): Promise<void> {
  await fetch('http://127.0.0.1:64095/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, translation }),
  });
}
```

---

## 三、设计决策

| 决策 | 理由 |
|------|------|
| TTS 缓存双层（内存+磁盘）| 内存缓存避免重复请求时 I/O 开销；磁盘缓存跨会话复用 |
| 生词本独立 Store 文件 | 与主配置解耦，降低配置文件大小，便于选择性导出 |
| 截断 500 字符 | 保护 TTS API 调用额度，超长文本朗读体验差且成本高 |
| AnkiConnect JSON-RPC 协议 | Anki 社区标准接口，无需额外插件开发 |
| 分批导出（200条/批）| 避免单次 HTTP 请求过大导致 AnkiConnect 超时 |

---

## 四、错误处理

| 错误 | 处理 |
|------|------|
| 朗读空文本 | useVoice hook 内检查，按钮 disabled |
| TTS 云服务全部不可用 | 降级到系统 TTS (Web Speech API) |
| TTS 返回空音频 | 显示"语音合成失败"，不播放 |
| AnkiConnect 未运行 | 检测 127.0.0.1:8765 连通性，提示用户启动 Anki |
| 欧路词典未安装 | 检测 localhost:64095 连通性，提示"未检测到欧路词典" |
| 重复收藏同一词汇 | 前端按 word + sourceLang + targetLang 复合键去重 |
| 收藏列表 > 1000 条 | 虚拟列表渲染，保证 UI 流畅 |

---

## 五、交叉引用

- 开发方案: [04-prd-task-翻译服务插件实现](./04-prd-task-翻译服务插件实现.md)（TTS 插件同为服务插件体系）
- PRD: [18-prd-TTS语音合成](../../prds/2026-09/18-prd-TTS语音合成.md)
- PRD: [24-prd-生词本导出](../../prds/2026-09/24-prd-生词本导出.md)


## 六、性能优化

| 优化点 | 优化手段 | 预期收益 | 实测数据 |
|--------|---------|---------|---------|
| TTS 音频缓存 | 双层缓存 (内存 LRU 50 条 + 磁盘 100 条) | 缓存命中率 >= 80%，重复朗读零网络请求 | — |
| AudioContext 复用 | 单例 AudioContext (非每次新建)，用 suspend/resume 代替 close/open | 播放启动延迟 -50ms | — |
| LRU 淘汰 | Map 维护访问顺序，超限淘汰最久未使用 | 内存占用 <= 10MB | — |
| 生词本虚拟列表 | react-window (FixedSizeList) 渲染 1000+ 条 | 列表渲染 < 50ms | — |
| Anki 批量写入 | 每批 200 条 addNotes，非逐条循环 | 1000 条导出 < 5s (vs ~30s 逐条) | — |
| 去重索引 | 按 (word + sourceLang + targetLang) 构建 Set 索引 O(1) | 1000 条去重检查 < 0.1ms | — |
| 语音包懒加载 | speechSynthesis.getVoices() 异步获取，仅首次调用时加载 | 初始化零阻塞 | — |
| 文本截断 | 500 字符硬截断 (非智能断句)，保护 API 额度 | TTS API 调用量 -30% | — |

### 缓存策略详解

```
TTS 缓存两层架构:

第 1 层 - 内存缓存 (Map):
  Key:   hash(service + lang + speed + text)
  Value: AudioBuffer (已解码的 PCM)
  Capacity: 50 条 (LRU)
  TTL: 会话生命周期
  Hit rate: ~60% (单词/短句重复朗读场景)

第 2 层 - 磁盘缓存 (tauri-plugin-store):
  Key:   同上
  Value: ArrayBuffer (原始音频数据)
  Capacity: 100 条 (LRU)
  TTL: 30 天
  Hit rate: 跨会话重复 ~20%

总命中率: 60% + (1-60%) * 20% ≈ 68%
```

## 七、跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 系统 TTS | AVSpeechSynthesizer (Core Speech, 40+ 语言) | SAPI 5 + WinRT Speech (需下载语音包) | speech-dispatcher + espeak-ng (机械感) |
| 系统 TTS 离线 | 内置高质量语音 (Apple Neural TTS) | 离线基础语音 (David/Zira)，在线高质量 (Microsoft Neural) | espeak-ng 需安装 (apt install espeak-ng) |
| 离线中文语音 | Ting-Ting (zh-CN 女声) | Huihui (zh-CN 女声，需联网下载语音包) | 需额外安装中文语音包 |
| Web Speech API | Safari 内置 (质量高) | Edge/Chrome 内置 | speech-dispatcher 后端 |
| speechSynthesis.getVoices() | 异步加载 (onvoiceschanged 事件) | 同左 | 同左 |
| AudioContext 自动播放 | Safari 严格 (需用户手势，否则 suspend) | Chrome 宽松 (首次交互后允许) | WebKitGTK 版本差异 |
| AudioContext 采样率 | 44100 Hz (标准) | 48000 Hz (标准) | 取决于 PulseAudio/PipeWire 配置 |
| TTS 语速范围 | 0.5x - 2.0x (Web Speech API 标准) | 同左 | 同左 |
| Anki 安装路径 | `~/Library/Application Support/Anki2/` | `%APPDATA%/Anki2/` | `~/.local/share/Anki2/` |
| AnkiConnect 端口 | 8765 (默认) | 8765 (默认) | 8765 (默认) |
| 欧路词典 | macOS 原生应用 (localhost:64095) | Windows 原生应用 | 不支持 (仅 Mac/Win) |
| 生词本存储路径 | `~/Library/Application Support/com.pot-app.pot/wordbook.json` | `%APPDATA%/com.pot-app.pot/wordbook.json` | `~/.config/com.pot-app.pot/wordbook.json` |
| CSV 导出编码 | UTF-8 BOM (兼容 Excel for Mac) | UTF-8 BOM (兼容 Excel/WPS 中文) | UTF-8 (Linux 原生) |