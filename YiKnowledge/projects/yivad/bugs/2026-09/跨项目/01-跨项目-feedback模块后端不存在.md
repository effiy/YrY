---
title: "feedbackService 调用不存在的后端模块 — 跨项目 RPC 契约缺失"
key: yivad-feedback-backend-module-missing-20260923
tags:
- bug-fix
- cross-project
- rpc-contract
- feedback
- data-service
category: projects/yivad/bugs/跨项目
created: "2026-09-23"
updated: "2026-09-23"
source: internal
type: bug
status: resolved
severity: medium
priority: p2
project: YiVad
reporter: Claude
environment: all
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23) — 改用 data_service 通用接口
frequency: always
---

## Description

`YiVad/src/api/modules/feedbackService.ts` 调用 `services.ai.feedback_service` 模块的 `submit_feedback`、`get_session_feedback`、`get_feedback_stats` 三个 RPC 方法。但 YiAi 后端的 `services/ai/feedback_service.py` **不存在**。

## Impact

- AI Chat 中的 👍/👎 反馈按钮 UI 正常显示，但提交时 RPC 调用在服务端失败
- 用户评价数据从未被持久化——反馈功能形同虚设
- 所有 `submitFeedback()` 调用都会触发 catch 块的错误提示

## Cause

跨项目 RPC 契约断裂——前端调用的模块名称在后端没有对应的实现文件。YiAi 中唯一与 feedback 相关的代码是 `services/translation/translate_service.py` 的 `translation_feedback` 方法（翻译质量的 feedback），与 AI Chat 消息反馈完全无关。

这是**典型的前后端脱节模式**：
- 前端开发了 UI + API 调用层
- 后端未同步实现对应的 service 模块
- 在 auth disabled 模式下，调用不存在的模块返回的 HTTP/RPC 错误被静默捕获

## Solution

将反馈数据直接通过通用 `data_service` 持久化到 MongoDB `feedback` 集合：

```diff
- import http from "@/api/index";
+ import { queryDocuments, createDocument } from "./dataService";

- return http.post("", {
-   module_name: "services.ai.feedback_service",
-   method_name: "submit_feedback",
-   parameters: payload
- });
+ return createDocument("feedback", { ...payload, createdAt: Date.now() });
```

此方案与 YiAi 的通用数据层模式一致（bug 模块同样通过 `data_service` 读写），无需额外后端开发。

## Files Changed

| File | Change |
|------|--------|
| `src/api/modules/feedbackService.ts` | RPC 调用 `services.ai.feedback_service` → `data_service.createDocument`/`queryDocuments` |
| `反馈数据` | 现在实际持久化到 MongoDB `feedback` 集合 ✓ |

## Verification

- vue-tsc: 0 errors
- 逻辑验证: `submitFeedback()` 调用 `createDocument("feedback", ...)` — 与 bug/issue/rss 模块使用相同的可靠数据层

## Prevention

**规则**: 新增 API 模块前，确认后端对应 RPC 方法存在。可以使用以下检查：

```bash
# 在前端 API 模块的 module_name 中提取模块路径，在后端搜索对应实现
grep -rn "def method_name" YiAi/src/services/
```

**CI 检查建议**: 添加跨项目 RPC 契约的静态校验脚本，在 CI 中检测前端调用的 `module_name` + `method_name` 组合是否在 YiAi 中有对应实现。