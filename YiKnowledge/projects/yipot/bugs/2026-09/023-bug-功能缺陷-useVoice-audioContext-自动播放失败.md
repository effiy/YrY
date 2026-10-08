---
title: "useVoice.jsx AudioContext 模块级创建违反自动播放策略 + 无错误处理"
tags: [bug, frontend, audio, webaudio, autoplay, error-handling]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: yipot
module: src/hooks/useVoice.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# useVoice.jsx AudioContext 模块级创建 + 无错误处理

---

## 一、现象

> TTS 语音播放在多数浏览器环境中无法出声。首次点击播放无反应，切换播放/停止时可能报 `InvalidStateError`。

## 二、根因

**4 个独立问题**：

| # | 代码 | 问题 |
|---|------|------|
| 1 | L2: `let audioContext = new AudioContext()` | 模块加载时创建，浏览器自动暂停（autoplay policy），不 resume 永远无法播放 |
| 2 | L3: `let source = null` | 模块级状态，多个 hook 实例共享，并发调用时状态错乱 |
| 3 | L14: `audioContext.decodeAudioData(..., callback)` | 仅传成功回调，无错误回调。音频数据损坏时静默失败 |
| 4 | L9: `source.stop()` | `source` 可能已由 `onended` 停止，再次 `stop()` 抛出 `InvalidStateError` |

## 三、修复

完整重写为 `useRef` + 懒初始化 + try/catch + 错误回调模式：

- `AudioContext` 通过 `useRef` 懒创建，`suspended` 状态自动 `resume()`
- `source` 用 `useRef` 隔离每个 hook 实例
- `decodeAudioData` 同时传成功和错误回调
- `source.stop()`/`disconnect()` 包裹 try/catch

## 四、验证

- [x] `pnpm build` 通过
- [ ] TTS 首次点击正常播放
- [ ] 快速切换播放/停止无 InvalidStateError
- [ ] 损坏音频数据输出 warn 日志