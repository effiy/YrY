---
doc_type: test
title: "YiPot 前端体验修复（第五轮）— 测试方案"
tags: [测试方案, 前端, 音频, 截图, 生命周期]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-114
prd_ref: YP-09-68
dev_ref: YP-09-109
roles: [engineer]
---

# YiPot 前端体验修复（第五轮）— 测试方案

> 测试编号：YP-09-114 · 关联 PRD：YP-09-68

---

## 一、测试用例

### TC-01: TTS 首次播放

| 项 | 内容 |
|-----|------|
| **步骤** | 翻译结果窗口点击 TTS 播放按钮 |
| **预期** | 音频正常播放（非静默），AudioContext 从 suspended → running |

### TC-02: TTS 快速切换

| 项 | 内容 |
|-----|------|
| **步骤** | 快速连续点击 TTS 播放/停止 5 次 |
| **预期** | 无 `InvalidStateError`，无未处理异常 |

### TC-03: TTS 损坏数据

| 项 | 内容 |
|-----|------|
| **步骤** | 注入损坏的音频数据 |
| **预期** | `warn('Failed to decode audio data: ...')`，不崩溃 |

### TC-04: 截图初始化失败

| 项 | 内容 |
|-----|------|
| **前置条件** | 模拟 `currentMonitor()` 或 `screenshot` 失败 |
| **步骤** | 触发截图 OCR |
| **预期** | `warn('Screenshot init failed: ...')`，窗口自动关闭 |

### TC-05: 截图选区有效

| 项 | 内容 |
|-----|------|
| **步骤** | 正常截图 → 框选区域 → 释放鼠标 |
| **预期** | `cut_image` 正常调用，`success` 事件触发 |

### TC-06: 截图图片未加载

| 项 | 内容 |
|-----|------|
| **步骤** | 在图片加载完成前快速拖拽选区 |
| **预期** | 若 `imgRef.current` 为 null，`warn` + 窗口关闭 |

### TC-07: Recognize pin 切换

| 项 | 内容 |
|-----|------|
| **步骤** | OCR 窗口点击 Pin → 取消 Pin → 再 Pin |
| **预期** | blur 监听器正确注册/注销，窗口行为正常 |

### TC-08: Backup 阿里云登录轮询

| 项 | 内容 |
|-----|------|
| **步骤** | 打开阿里云登录二维码 → 切换到其他设置页 |
| **预期** | 定时器正确清理，无 `setState on unmounted` 警告 |

---

## 二、回归测试

- 划词翻译 → 翻译窗口正常
- 截图 OCR → 识别 + 翻译正常
- TTS 播放 → 语音正常
- 备份恢复 → WebDAV/本地/阿里云 正常
- 设置页面 → 所有 tab 正常切换

---

## 三、关联文档

| 类型 | 文件 |
|------|------|
| PRD | `../prds/2026-09/68-prd-前端体验修复第五轮.md` |
| 开发方案 | `../devs/2026-09/109-prd-task-前端体验修复第五轮.md` |
| Bug 020-023 | `../bugs/功能缺陷/020-023-*.md` |