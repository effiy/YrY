---

doc_type: test
title: "TTS 语音合成服务 — 测试方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["18-prd-TTS语音合成"]
source_modules: ["YP-09-S07"]

type: test
---

# TTS 语音合成服务 — 测试方案

> **文档职责**：专项验证多个 TTS 服务（系统 TTS、Azure TTS、百度 TTS、腾讯 TTS）的功能正确性和接口稳定性。与 [0006-prd-test-语音合成与生词本.md](./006-prd-test-语音合成与生词本.md) 互补——本文件聚焦 TTS 服务本身的接口测试，06 文件偏重用户交互 (朗读按钮、语速调节等)。

---

## 一、测试层级

```
TTS 语音合成服务
├── 系统 TTS
│   ├── macOS NSSpeechSynthesizer
│   ├── Windows SAPI
│   └── Linux speech-dispatcher
├── Azure TTS
│   ├── API Key 配置
│   ├── 多语音/多音色
│   └── SSML 支持
├── 百度 TTS
│   ├── API Key + Secret 配置
│   ├── 中/英/日/韩语言
│   └── 返回音频格式
├── 腾讯 TTS
│   ├── SecretId + SecretKey 认证
│   └── 中/英语言
└── useVoice Hook
    ├── speak(text, lang)
    ├── stop()
    └── isSpeaking 状态
```

---

## 二、核心测试用例

### 2.1 系统 TTS

| 编号 | 测试项 | 步骤 | 预期结果 | 优先级 |
|------|--------|------|---------|--------|
| TC-SYS-001 | macOS 系统 TTS 英文 | 系统 TTS → 朗读 "Hello World" en | 语音正确播放，英文发音 | P1 |
| TC-SYS-002 | macOS 系统 TTS 中文 | 系统 TTS → 朗读 "你好世界" zh | 中文语音正确播放 | P1 |
| TC-SYS-003 | Windows SAPI 朗读 | Windows → 系统 TTS → 朗读 | 使用 SAPI 引擎语音输出 | P1 |
| TC-SYS-004 | Linux speech-dispatcher | Linux → 系统 TTS → 朗读 | 通过 speech-dispatcher 输出 | P2 |
| TC-SYS-005 | 系统 TTS 离线可用 | 断网 → 系统 TTS → 朗读 | 语音播放正常 | P0 |
| TC-SYS-006 | 系统 TTS 语速调节 | 设置语速 0.5x/1.0x/2.0x → 朗读 | 语速明显变化 | P2 |
| TC-SYS-007 | 系统 TTS 音量调节 | 设置音量 0%/50%/100% → 朗读 | 音量明显变化 | P2 |

### 2.2 Azure TTS

| 编号 | 测试项 | 步骤 | 预期结果 | 优先级 |
|------|--------|------|---------|--------|
| TC-AZ-001 | Azure TTS 基本朗读 | 配置 Azure Key + Region → 朗读 | 语音播放 | P1 |
| TC-AZ-002 | Azure 多音色 | 切换音色 → 朗读 | 不同音色输出不同语音 | P2 |
| TC-AZ-003 | Azure 多语言 | 英语/中文/日语 → 朗读 | 各语言发音正确 | P1 |
| TC-AZ-004 | Azure API Key 无效 | 错误 Key → 朗读 | 显示"认证失败" | P1 |
| TC-AZ-005 | Azure Region 错误 | 错误 Region → 朗读 | 显示"无法连接到 Azure TTS" | P2 |
| TC-AZ-006 | Azure 音频格式 | 朗读 → 检查返回格式 | 支持 MP3/WAV 格式 | P3 |

### 2.3 百度 TTS

| 编号 | 测试项 | 步骤 | 预期结果 | 优先级 |
|------|--------|------|---------|--------|
| TC-BD-001 | 百度 TTS 中文 | 配置百度 AppId + Key → 中文朗读 | 语音播放 | P1 |
| TC-BD-002 | 百度 TTS 英语 | 配置 → 英文朗读 | 英语语音播放 | P2 |
| TC-BD-003 | 百度 TTS 日语 | 配置 → 日语朗读 | 日语语音播放 | P2 |
| TC-BD-004 | 百度 TTS 韩语 | 配置 → 韩语朗读 | 韩语语音播放 | P2 |
| TC-BD-005 | 百度 TTS 语速参数 | 参数 spd=3 → 朗读 | 快速语音 | P2 |
| TC-BD-006 | 百度 API 认证失败 | 错误 Key → 朗读 | 显示错误信息 | P1 |

### 2.4 腾讯 TTS

| 编号 | 测试项 | 步骤 | 预期结果 | 优先级 |
|------|--------|------|---------|--------|
| TC-TX-001 | 腾讯 TTS 中文 | 配置 SecretId + Key → 中文朗读 | 语音播放 | P1 |
| TC-TX-002 | 腾讯 TTS 英语 | 配置 → 英文朗读 | 英语语音播放 | P2 |
| TC-TX-003 | 腾讯 API 签名错误 | 错误 SecretKey → 朗读 | 显示"签名验证失败" | P1 |
| TC-TX-004 | 腾讯 不支持的语言 | 选腾讯 TTS → 朗读日语 | 提示"当前 TTS 不支持该语言"或降级 | P2 |

### 2.5 useVoice Hook

| 编号 | 测试项 | 步骤 | 预期结果 | 优先级 |
|------|--------|------|---------|--------|
| TC-HOOK-001 | speak() 基本调用 | `speak("Hello", "en")` | 语音播放 | P1 |
| TC-HOOK-002 | stop() 停止播放 | `speak(...)` → 立即 `stop()` | 语音立即停止 | P1 |
| TC-HOOK-003 | isSpeaking 状态 | 播放中 → 读取 `isSpeaking` | 返回 `true` | P2 |
| TC-HOOK-004 | isSpeaking 停止后 | stop() → 读取 `isSpeaking` | 返回 `false` | P2 |
| TC-HOOK-005 | speak() 自动终止前次 | speak("A") → 立即 speak("B") | A 被终止，B 开始播放 | P1 |
| TC-HOOK-006 | 空文本 speak | `speak("", "en")` | 不播放，无报错 | P2 |

---

## 三、边界与异常测试

### 边界值测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-EDGE-01 | 超长文本 (10000 字) | `speak(10000字文本, "zh")` | 分段朗读或提示长度限制 | P2 |
| TC-EDGE-02 | 纯数字文本 | `speak("12345", "en")` | 逐数字或整体读法 | P3 |
| TC-EDGE-03 | 含 XML/HTML 的文本 | `speak("<p>Hello</p>", "en")` | 纯文本朗读或 SSML 模式处理 | P2 |
| TC-EDGE-04 | 极端语速 0.1x | 语速设为 0.1 → 朗读 | 极慢但仍然可播放 | P3 |
| TC-EDGE-05 | 极端语速 5.0x | 语速设为 5.0 → 朗读 | 极快但仍可辨识 | P3 |
| TC-EDGE-06 | 混合语言文本 | `speak("Hello 世界", "auto")` | 按主语言选择 TTS 引擎 | P2 |
| TC-EDGE-07 | 特殊 Unicode 字符 | `speak("Emoji: 😀 🚀", "auto")` | 跳过或描述 emoji | P3 |
| TC-EDGE-08 | Azure 音色边界 | 配置不存在的音色名 | 使用默认音色或报错 | P2 |

### 异常场景测试

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-01 | 音频设备未连接 | 拔掉耳机/扬声器 → 朗读 | 朗读任务仍然执行 (静默播放) 或提示无设备 | 连接设备后正常 |
| TC-ERR-02 | 音频设备被独占 | 其他应用占用音频设备 → 朗读 | 排队等待或提示设备繁忙 | 释放设备后正常 |
| TC-ERR-03 | Azure TTS 访问令牌过期 | 使用过期 token → 朗读 | 自动刷新 token 或提示重新认证 | 新 token 后正常 |
| TC-ERR-04 | 百度 TTS API 每日限额用完 | 超出每日免费额度 | 显示"今日额度已用尽" | 次日自动恢复 |
| TC-ERR-05 | 腾讯 TTS 接口限流 | 高频请求 → 触发 QPS 限制 | 返回限流错误，稍后重试 | 等待后恢复 |
| TC-ERR-06 | TTS 服务切换中朗读 | 百度 → 切换 Azure → 立即朗读 | 使用新 TTS 服务播放 | — |
| TC-ERR-07 | 网络中断 (非系统 TTS) | 云 TTS 播放中断网 | 提示"网络连接中断" | 恢复网络后重试 |
| TC-ERR-08 | 音频数据损坏 | TTS 返回不完整或损坏的音频 | 不播放损坏音频，提示错误 | 重新请求成功 |

---

## 四、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试工具 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | 系统 TTS 首字节延迟 | speak() 到声音开始 | ≤ 200ms | > 500ms | 10 次采样 |
| TC-PERF-02 | Azure TTS 端到端延迟 | speak() 到声音开始 | ≤ 1s | > 3s | 网络正常环境 |
| TC-PERF-03 | 百度 TTS 端到端延迟 | speak() 到声音开始 | ≤ 800ms | > 2s | 网络正常环境 |
| TC-PERF-04 | 腾讯 TTS 端到端延迟 | speak() 到声音开始 | ≤ 800ms | > 2s | 网络正常环境 |
| TC-PERF-05 | stop() 响应时间 | stop() 到音频停止 | ≤ 50ms | > 200ms | 10 次采样 |
| TC-PERF-06 | TTS 音频缓存命中 (重复朗读) | 同文本第二次朗读 | ≤ 100ms | > 500ms | 缓存命中 |
| TC-PERF-07 | TTS 服务切换开销 | 切换 TTS 服务到首次可用 | ≤ 200ms | > 1s | 不含首次请求 |

---

## 五、安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | Azure API Key 加密存储 | 配置 Azure Key → 检查配置文件 | Key 不以明文存储 | P0 |
| TC-SEC-02 | 百度 Secret 加密存储 | 配置百度 Key → 检查配置文件 | Secret 不以明文存储 | P0 |
| TC-SEC-03 | 腾讯 SecretKey 加密存储 | 配置腾讯 Key → 检查配置文件 | SecretKey 不以明文存储 | P0 |
| TC-SEC-04 | TTS 请求使用 HTTPS | 抓包检查 Azure/百度/腾讯 TTS 请求 | 全部使用 HTTPS | P1 |
| TC-SEC-05 | TTS 音频缓存不持久化 | 朗读 → 检查磁盘临时文件 | 临时音频文件在播放后删除 | P2 |
| TC-SEC-06 | 朗读文本不记录日志 | 朗读含敏感词文本 → 检查日志 | 日志不含朗读文本 | P1 |
| TC-SEC-07 | 系统 TTS 本地处理 | 使用系统 TTS → Wireshark 抓包 | 无网络请求 (纯本地) | P1 |

---

## 六、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-01 | 系统 TTS 离线朗读 | 系统 TTS | 否 | P0 |
| REG-02 | Azure TTS 多语言朗读 | Azure TTS | 否 | P1 |
| REG-03 | 百度 TTS 中英日韩 | 百度 TTS | 否 | P1 |
| REG-04 | 腾讯 TTS 中英 | 腾讯 TTS | 否 | P2 |
| REG-05 | speak/stop/isSpeaking 状态 | useVoice Hook | 否 | P1 |
| REG-06 | TTS 服务切换正常 | 服务切换 | 否 | P2 |
| REG-07 | 语速/音量调节 | 播放参数 | 否 | P2 |
| REG-08 | API Key 加密存储 | 安全 | 否 | P0 |

---

## 七、参考文档

- [TTS 语音合成 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/18-prd-TTS语音合成.md)
- [语音合成与生词本测试](006-prd-test-语音合成与生词本.md) — 互补：用户交互层测试
- [翻译服务接口测试](004-prd-test-翻译服务接口.md)
- [安全加密存储测试](30-prd-test-安全加密存储.md)