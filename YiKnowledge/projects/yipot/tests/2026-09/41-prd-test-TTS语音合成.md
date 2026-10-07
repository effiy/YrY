---

doc_type: test
title: "TTS 语音合成 — 测试方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["18-prd-TTS语音合成"]
source_modules: ["18-prd-task-TTS语音合成"]

type: test
---

# TTS 语音合成 — 测试方案

## 核心功能测试

### 系统 TTS

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TTS-01 | 系统 TTS 朗读 | speak("Hello", "en") | 发声朗读 "Hello" |
| TC-TTS-02 | 停止播放 | 朗读中 → stop() | ≤ 100ms 静音，isSpeaking=false |
| TC-TTS-03 | 系统 TTS 离线可用 | 断网 → speak("你好", "zh") | 正常朗读 (不依赖网络) |
| TC-TTS-04 | macOS 多语言 | speak(日文, "ja") → speak(韩文, "ko") | 对应语言正确朗读 |
| TC-TTS-05 | 语速调节 | speed=0.5 / speed=1.0 / speed=2.0 | 语速明显变化 |
| TC-TTS-06 | 音量调节 | volume=0.3 / volume=1.0 | 音量明显变化 |

### Azure TTS

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TTS-10 | Azure TTS 朗读 | 配置有效 API Key → speak("Hello", "en") | 神经网络语音输出 |
| TC-TTS-11 | Azure 100+ 语言 | speak(小众语言) | 对应语言正确朗读 |
| TC-TTS-12 | Azure 降级 | API Key 失效 → speak() | 自动降级到系统 TTS |

### 百度/腾讯 TTS

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TTS-20 | 百度 TTS 朗读 | 配置有效凭据 → speak("你好", "zh") | 百度语音输出 |
| TC-TTS-21 | 腾讯 TTS 朗读 | 配置有效凭据 → speak("你好", "zh") | 腾讯语音输出 |

### useVoice Hook

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TTS-30 | speak 调用 | speak("text", "en") | isSpeaking=true |
| TC-TTS-31 | stop 中断 | 朗读中 → stop() | isSpeaking=false，音频停止 |
| TC-TTS-32 | 朗读中再次 speak | 朗读 A → 朗读 B (不同语言) | 停止 A，重新合成 B |
| TC-TTS-33 | 朗读按钮状态 | 翻译结果旁按钮 | 默认显示播放图标，朗读中显示停止图标 |

## 增强边界与异常测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-TTS-E01 | 超长文本 (> 500 字符) | speak(500+ 字符) | 自动截断至 500 字符后朗读 | P1 |
| TC-TTS-E02 | 空文本 | speak("", "en") | 忽略，不发起 TTS 请求 | P1 |
| TC-TTS-E03 | 纯特殊字符 | speak("!@#$%", "en") | 按字符朗读或无输出 | P3 |
| TC-TTS-E04 | Emoji 文本 | speak("Hello 😊", "en") | 朗读文字部分，跳过 Emoji | P3 |
| TC-TTS-E05 | 系统不支持的语言 | speak(冰岛语) | 提示"系统不支持该语言朗读" | P1 |
| TC-TTS-E06 | TTS 服务全部不可用 | 所有 API Key 失效 | 降级链: Azure→百度→系统，至少系统可用 | P1 |
| TC-TTS-E07 | 缓存命中 | 相同 text+lang+speed 再次 speak | 命中内存缓存，不重复请求 API | P1 |
| TC-TTS-E08 | 缓存逐出 | 缓存满 50 条 → 第 51 条 | LRU 逐出旧条目，新条目缓存 | P2 |
| TC-TTS-E09 | 朗读中关闭窗口 | 朗读中 → 关闭翻译窗口 | 音频停止，无后台残留 | P1 |
| TC-TTS-E10 | 连续快速点击 | 点击朗读按钮 5 次/秒 | 最后一次生效，不卡死 | P2 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-TTS-P01 | 系统 TTS 响应 | 调用到发声 | ≤ 200ms | > 500ms | 10 次测量 |
| TC-TTS-P02 | Azure TTS 响应 | 调用到发声 | ≤ 500ms | > 1000ms | 10 次测量 |
| TC-TTS-P03 | stop() 响应 | 点击停止到静音 | ≤ 100ms | > 300ms | 10 次测量 |
| TC-TTS-P04 | 缓存命中响应 | 缓存到发声 | ≤ 10ms | > 50ms | 50 次命中 |
| TC-TTS-P05 | 缓存命中率 | 日常使用 100 次 | ≥ 80% | < 60% | 缓存命中日志 |
| TC-TTS-P06 | 内存占用 | 50 条缓存 | ≤ 10MB | > 30MB | Memory Profiler |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-TTS-S01 | Azure API Key 不写日志 | 启用日志 → 朗读 | 日志不含 API Key 明文 | P1 |
| TC-TTS-S02 | TTS 音频不写磁盘 | 朗读敏感内容后检查 | 音频缓存仅内存，不落盘 | P2 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-TTS-01 | 系统 TTS 朗读 | 核心朗读 | 否 | P0 |
| REG-TTS-02 | 朗读停止 | stop | 否 | P0 |
| REG-TTS-03 | 语速/音量调节 | 参数 | 否 | P1 |
| REG-TTS-04 | Azure→系统降级链 | 降级 | 否 | P1 |
| REG-TTS-05 | TTS 缓存命中 | 缓存 | 否 | P1 |
| REG-TTS-06 | 超长文本截断 | 边界 | 否 | P1 |

## 参考文档

- [TTS 语音合成 PRD](../../prds/2026-09/18-prd-TTS语音合成.md)
- [语音合成与生词本 PRD](../../prds/2026-09/03-prd-语音合成与生词本.md)
- [生词本导出测试](46-prd-test-生词本导出.md)