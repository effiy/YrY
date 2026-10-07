---
doc_type: test
title: "YiPot 前端健壮性修复（第四轮）— 测试方案"
tags: [测试方案, 前端, 错误处理, 状态管理, API]
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
test_id: YP-09-113
prd_ref: YP-09-67
dev_ref: YP-09-108
roles: [engineer]
---

# YiPot 前端健壮性修复（第四轮）— 测试方案

> 测试编号：YP-09-113 · 关联 PRD：YP-09-67 · 关联开发：YP-09-108

---

## 一、测试用例

### TC-01~07: lang_detect.js — 断网降级

| 项 | 内容 |
|-----|------|
| **前置条件** | 断开网络连接 |
| **步骤** | 逐一设置 `translate_detect_engine` 为 baidu/tencent/google/niutrans/yandex/bing/local |
| **预期** | 全部返回 `'en'`（降级默认值），无未处理异常，无 console 错误 |
| **验证** | 划词翻译功能正常，语言检测结果回退为英文 |

### TC-08: lang_detect.js — niutrans 时间戳

| 项 | 内容 |
|-----|------|
| **步骤** | 设置 `translate_detect_engine` 为 `niutrans` |
| **预期** | API 请求正常发送，时间戳格式正确（`String()` 而非 `new String()`） |

### TC-09: Translate/index.jsx — 插件重载

| 项 | 内容 |
|-----|------|
| **前置条件** | 翻译窗口已打开 |
| **步骤** | 1. 安装新 .potext 插件 2. 触发 `reload_plugin_list` 事件 |
| **预期** | 翻译窗口立即刷新插件列表，新插件出现在可用服务中 |
| **验证** | `pluginReloadUnlisten` 变量正确设置，监听器激活 |

### TC-10: Translate/index.jsx — 模糊关闭

| 项 | 内容 |
|-----|------|
| **步骤** | 1. `closeOnBlur` 设为 `true` 2. 点击翻译窗口外部 |
| **预期** | `blurUnlisten` 正常工作，窗口 100ms 后关闭 |
| **验证** | blurTimeout 正确取消/设置，无残留定时器 |

### TC-11: api/client.ts — get() 超时

| 项 | 内容 |
|-----|------|
| **前置条件** | YiAi 后端未运行 |
| **步骤** | 调用 `api.get('/health')` |
| **预期** | 30s 后返回 `{ ok: false, error: 'Request timed out' }` 而非无限挂起 |
| **验证** | `isYiAiAvailable()` 在超时后正确返回 `false` |

### TC-12: api/client.ts — post() 超时

| 项 | 内容 |
|-----|------|
| **步骤** | 调用 `api.rpc(...)` 到不可达后端 |
| **预期** | 与 rpc() 一致的超时错误响应 |

### TC-13: api/client.ts — signal 清理

| 项 | 内容 |
|-----|------|
| **步骤** | 快速连续调用 `api.get()` 并传入外部 AbortSignal 后立即 abort |
| **预期** | 无内存泄漏，事件监听器正确移除 |

---

## 二、回归测试

- 划词翻译：选中文本 → 翻译窗口正常弹出
- 截图 OCR：框选区域 → 识别 + 翻译正常
- 语言检测开关：切换检测引擎 → 功能正常
- 插件安装：安装 .potext → 翻译窗口自动刷新

---

## 三、关联文档

| 类型 | 文件 |
|------|------|
| PRD | `../prds/2026-09/67-prd-前端健壮性修复第四轮.md` |
| 开发方案 | `../devs/2026-09/108-prd-task-前端健壮性修复第四轮.md` |
| Bug 017 | `../bugs/功能缺陷/017-lang-detect-未处理promise拒绝.md` |
| Bug 018 | `../bugs/功能缺陷/018-translate-变量名冲突-插件监听器未注册.md` |
| Bug 019 | `../bugs/功能缺陷/019-api-client-get-post-缺超时.md` |