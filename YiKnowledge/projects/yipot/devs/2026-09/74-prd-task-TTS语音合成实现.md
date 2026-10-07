---

doc_type: module
prd_task_id: "YP-09-S07"
title: "TTS 语音合成 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "18-prd-TTS语音合成.md"

type: task
---

# TTS 语音合成 — 开发方案

> 来源 PRD：[18-prd-TTS语音合成.md](../../prds/2026-09/18-prd-TTS语音合成.md)

## 架构概览

```
翻译窗口 用户点击朗读按钮
      │
      ▼
┌─────────────────────────────────────────────────┐
│              useVoice Hook (React)               │
│    speak(text, lang) → stop() → isSpeaking      │
│    │                                              │
│    │  1. 检查内存缓存 (text + lang + speed)       │
│    │  2. 命中 → 直接播放 AudioBuffer             │
│    │  3. 未命中 → 调用 TTS Service               │
│    ▼                                              │
└──────────────────────────┬──────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
┌──────────┐    ┌──────────────┐    ┌─────────────────┐
│ 系统 TTS │    │ 云端 TTS      │    │ Azure TTS        │
│ (离线)   │    │ 百度/腾讯     │    │ (100+ 语言)      │
│          │    │              │    │                  │
│ macOS:   │    │ POST API     │    │ REST API +       │
│ AVSpeech │    │ {text,lang}  │    │ SSML markup      │
│ Synthes. │    │              │    │                  │
│          │    │ → AudioBlob  │    │ → AudioBlob      │
│ Windows: │    │              │    │                  │
│ SAPI5    │    │              │    │                  │
└────┬─────┘    └──────┬───────┘    └────────┬────────┘
     │                 │                     │
     └─────────────────┼─────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│            Web Audio API Playback                │
│    AudioContext.decodeAudioData → play()         │
│    │                                              │
│    ┌──────────────────────────────────────┐      │
│    │  LRU 内存缓存 (max 50 条)            │      │
│    │  Key: hash(text, lang, speed)        │      │
│    │  Value: ArrayBuffer                  │      │
│    │  TTL: 会话生命周期                    │      │
│    └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src/hooks/useVoice.jsx` + TTS 服务插件目录

### useVoice Hook

```javascript
// hooks/useVoice.jsx
import { useState, useRef, useCallback } from "react";

const TTS_CACHE = new Map();  // LRU cache
const MAX_CACHE = 50;

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioCtx = useRef(null);

  const getCacheKey = (text, lang, speed) => 
    `${text.slice(0, 50)}_${lang}_${speed}`;

  const speak = useCallback(async (text, lang = "en", speed = 1.0) => {
    // 1. 文本截断
    const truncated = text.slice(0, 500);
    
    // 2. 检查缓存
    const cacheKey = getCacheKey(truncated, lang, speed);
    if (TTS_CACHE.has(cacheKey)) {
      playAudio(TTS_CACHE.get(cacheKey));
      return;
    }

    // 3. TTS 服务降级链
    const services = getAvailableTtsServices();  // 用户配置的顺序
    for (const service of services) {
      try {
        const audioBuffer = await service.synthesize(truncated, lang, speed);
        TTS_CACHE.set(cacheKey, audioBuffer);
        evictCache();
        playAudio(audioBuffer);
        return;
      } catch (e) {
        continue;  // 降级到下一个服务
      }
    }
    
    // 4. 最终降级：系统 TTS
    const systemTts = await getSystemTts();
    const audioBuffer = await systemTts.synthesize(truncated, lang, speed);
    playAudio(audioBuffer);
  }, []);

  const playAudio = (buffer) => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
    }
    audioCtx.current.decodeAudioData(buffer.slice(0))
      .then(source => {
        const node = audioCtx.current.createBufferSource();
        node.buffer = source;
        node.connect(audioCtx.current.destination);
        node.onended = () => setIsSpeaking(false);
        node.start();
        setIsSpeaking(true);
      });
  };

  const stop = useCallback(() => {
    if (audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const evictCache = () => {
    if (TTS_CACHE.size > MAX_CACHE) {
      const firstKey = TTS_CACHE.keys().next().value;
      TTS_CACHE.delete(firstKey);
    }
  };

  return { speak, stop, isSpeaking };
}
```

### TTS 服务插件接口

```typescript
// services/tts/types.ts
interface TtsService {
  name: string;                          // "system" | "azure" | "baidu" | "tencent"
  synthesize(text: string, lang: string, speed: number): Promise<ArrayBuffer>;
  isAvailable(): boolean;
  getSupportedLanguages(): string[];
}
```

### 系统 TTS（离线优先）

```javascript
// services/tts/system.jsx — macOS 使用 Web Speech API
export async function systemTtsSynthesize(text, lang, speed) {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = mapLangToBcp47(lang);   // "en" → "en-US", "zh" → "zh-CN"
    utterance.rate = speed;                   // 0.5 ~ 2.0
    
    // macOS/Windows SpeechSynthesis 输出 → AudioBuffer
    // 通过 OfflineAudioContext 捕获
    utterance.onend = () => resolve(audioBuffer);
    utterance.onerror = (e) => reject(e);
    speechSynthesis.speak(utterance);
  });
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| TTS 降级策略 | Azure → 百度 → 腾讯 → 系统 TTS | 仅使用单一服务 | 确保朗读功能始终可用，即使云端服务不可达 | 降级链增加首次播放延迟 |
| 缓存策略 | LRU 内存缓存 (50 条) | IndexedDB 持久化 | 同会话中重复朗读频繁，内存缓存 O(1) 命中 | 刷新页面后缓存丢失 |
| 缓存键 | hash(text, lang, speed) | 仅 hash(text) | 同一文本不同语言/语速需独立缓存 | 缓存键稍长 |
| 文本截断 | 500 字符 | 不截断 | Web Speech API 超长文本易超时，500 字符覆盖 95% 翻译结果 | 超长译文后半段不朗读 |
| 音频播放 | Web Audio API (AudioContext) | HTMLAudioElement | AudioContext 精确控制播放/停止，`<audio>` 无法立即中断 | 需手动管理 AudioContext 生命周期 |
| 停止响应 | AudioContext.close() | pause() | close() 立即释放硬件资源，pause() 仍占用音频设备 | 下次播放需重建 AudioContext |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 音频缓存命中率 | ≥80% | LRU 内存缓存，缓存键覆盖 text+lang+speed | 同文本二次朗读 0ms 延迟 |
| 朗读停止延迟 | ≤100ms | AudioContext.close() 立即释放 | 点击停止按钮即时静音 |
| 首次合成延迟 | ≤2s（云端）/ ≤500ms（系统） | 并发请求云端服务 + 超时控制 | 用户感知延迟在可接受范围 |
| 缓存淘汰 | 内存 <5MB | LRU + MAX_CACHE=50 自动淘汰 | 稳定内存占用 |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-服务 | 当前 TTS 服务不可用 | 自动降级到下一服务（降级链） | Azure→百度→腾讯→系统 | 无感知，但延迟增加 |
| L1-服务 | 系统 TTS 无对应语言 | 提示"系统不支持该语言朗读" | Toast 提示 + 禁用朗读按钮 | 可见提示 |
| L2-音频 | AudioContext 解码失败 | 重试 1 次 + 清除缓存 | 自动重试 | 无感知 |
| L2-音频 | 播放中切换语言 | 停止当前播放 → 重新合成 | 调用 stop() → speak() | 短暂停顿 |
| L3-输入 | 文本为空/全空格 | 跳过朗读，静默返回 | 无操作 | 无感知 |
| L3-输入 | 文本超出 500 字符 | 自动截断至 500 字符 | 仅朗读前 500 字符 | 长文本后半段不朗读 |

---

**关联文档**：
- 测试方案：[18-prd-test-TTS语音合成](../../tests/2026-09/18-prd-test-TTS语音合成.md)


## 跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 系统 TTS 引擎 | AVSpeechSynthesizer (Core Speech, 40+ 语言内置) | SAPI 5 + WinRT Speech (Win10+ 内置语音包) | speech-dispatcher + espeak-ng (需安装: apt install espeak-ng) |
| 离线语音质量 | 高质量 (Apple Neural TTS) | 离线基础 (Microsoft David/Zira)，在线高质量 (Microsoft Neural) | 机械感 (espeak-ng)，可用 mbrola 改善 |
| 中文语音 | Ting-Ting (zh-CN 女声, 内置) | Huihui (zh-CN 女声, 需联网下载) | 需手动安装中文语音包 |
| Web Speech API | Safari 内置 (SpeechSynthesis) | Edge/Chrome 内置 | WebKitGTK (speech-dispatcher 后端) |
| speechSynthesis.getVoices() | 异步加载 (onvoiceschanged 事件触发) | 同左 | 同左 |
| AudioContext 采样率 | 44100 Hz (标准) | 48000 Hz (标准) | 取决于 PulseAudio/PipeWire (44100 或 48000) |
| AudioContext 自动播放策略 | Safari 严格 (需用户手势，否则 suspend) | Chrome 首次交互后自动允许 | WebKitGTK 取决于版本 (>= 2.38 默认允许) |
| 语速范围 | 0.5x - 2.0x (utterance.rate) | 同左 | 同左 |
| 多语音并发 | 不支持 (SpeechSynthesis 单队列) | 同左 | 同左 |
| 音频格式支持 | PCM / MP3 / AAC | PCM / MP3 | PCM / OGG |

### Web Speech API 就绪状态

```javascript
// 跨平台 voice 就绪检测
function ensureVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices());
      };
    }
  });
}
// 所有平台的 speechSynthesis.getVoices() 在首次调用时异步加载
// onvoiceschanged 事件在所有平台行为一致
```