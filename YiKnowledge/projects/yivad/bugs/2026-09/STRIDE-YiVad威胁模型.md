---
title: STRIDE-YiVad威胁模型
tags:
  - perfbaseline
  - stride
  - threat
  - security
  - yivad
  - threat-model
  - risk
  - mongodb
category: projects/yivad/bugs/2026-09
created: 2026-10-07
updated: 2026-10-07
source: internal
type: baseline / analysis
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - sre
  - engineer
  - security
benefit: 对齐 YiVad 项目页 /#/project 直连 MongoDB 六类 STRIDE 风险，重点解决无 schema 校验、前端无限轮询、description 超长泄露三类 P0/P1 威胁，引用 04-构建-MongoDB 模式设计贯穿。
acceptance_criteria:
  - STRIDE 6 行矩阵明确：/#/project 直接展示 5 项目名（S）、MongoDB 无 schema（T）、description 超长泄露（I）、前端无限轮询（D）、提权无（E）、抵赖给出占位说明
  - 引用 MongoDB 模式设计 04-prd-项目管理系统 对应至少 3 条缓解，且每个 P0 给出明确修复路径
  - 缓解路线图 30/60/90 天覆盖 schema 校验、轮询退避、字段级脱敏三项可上线交付物
related:
  - ../../prds/2026-09/04-prd-项目管理系统.md
  - ../../prds/2026-09/08-prd-性能监控与优化.md
  - ../../prds/2026-09/07-prd-错误边界与全局异常处理.md
  - ../../../yiai/prds/2026-09/06-prd-数据层.md
  - ../../tests/2026-09/基线-项目页渲染性能.md
  - ../功能缺陷/01-bug-无限轮询竞态.md
---

## 一、STRIDE 威胁矩阵（6 行 × 4 列）

| STRIDE 类别 | 威胁场景 | 影响 | 可能性 | 缓解措施 |
| --- | --- | --- | --- | --- |
| **S 仿冒 (Spoofing)** | 路由 `/#/project` 直接展示 5 个项目名：前端 `localStorage.getItem('yivad_last_ids')` 读到后跳过 RPC 鉴权直接渲染 name + logo + description；攻击者构造 `localStorage['yivad_last_ids']='["p0","p0","p0","p0","p0"]'` 即可把 "已归档 / 标记内部的项目名" 伪装成展示，绕过 `owner` 权限。 | 中：内部/客户项目名泄露 + UI 仿冒可钓鱼 "点击登录领权益"。 | 高：v0.6.0 当前实现就是 `localStorage` 直读展示，04-prd-项目管理系统未覆盖该分支。 | (1) localStorage 缓存值增加 HMAC 校验（与登录态 token 派生 key 绑定），校验失败走正常 RPC 并清缓存；(2) `/#/project` 首次加载强制做一次轻量鉴权 `GET /rpc/projects/me`，非 owner 的归档项目名一律 mask 为 ****；(3) 04-prd 模式设计：缓存层统一 `TTL + 签名` 双约束，禁止前端 raw JSON 直渲染。 |
| **T 篡改 (Tampering)** | MongoDB 无 schema 校验：`projects` 集合写入使用 `collection.insertOne(doc)` 未走任何 schema；前端 `POST /rpc/projects/update` 的 body 允许任意字段，攻击者构造 `{"_id":"...", "$set": {"owner": "hacker", "tags": ["public"]}}` 可把私有项目改为公共。 | 高：项目所有权被篡改，内部项目直接公开，合规严重事故。 | 高：04-prd 数据层章节写了 "TODO schema"，实际未落地。 | (1) 所有写入（insertOne/updateOne/findOneAndReplace）强制走 Zod / Mongoose schema：允许字段白名单、枚举校验、owner 不可被 $set 覆盖；(2) 04-prd MongoDB 模式设计落地：`projects.owner` 字段设为 immutable（MongoDB Schema Validation level=strict）；(3) 写操作接入 audit_logs，对接 yiai 09-prd 审计日志标准。 |
| **R 抵赖 (Repudiation)** | 抵赖场景弱：项目操作在企业内单租户环境，管理员后台均可追踪；但 "导入/导出项目 zip" 接口无哈希留痕，用户称 "我没导出过客户名单" 时无可验证证据。 | 低：单租户环境内部可通过 OS 日志追溯，但企业版必须补。 | 中：每月 2~3 次工单需要管理员手动排查。 | (1) 导出接口 zip 追加 `manifest.json` + 导出人 HMAC 签名（和 JWT sub 绑定），zip 尾记录 sha256；(2) 导入前校验签名，不匹配拒绝；(3) 管理员后台 "导出/导入历史" 子页。 |
| **I 信息泄露 (Information Disclosure)** | RPC 返回 `projects.description` 字段原文超长：`GET /rpc/projects/list?limit=5` 在非 owner 场景下依然返回完整 `description`（内部项目含 "预算/HR/客户合同编号"）；前端虽然只显示 140 字截断，但 DevTools Network 面板完整可见。 | 高：敏感商业信息直接泄漏给团队成员只读权限账号。 | 高：当前代码无字段投影，默认整文档返回。 | (1) 引用 MongoDB 模式设计 04-prd：对 `role=viewer` 自动在 projection 中把 `description` 置为 `$substrCP: ['$description', 0, 140]`，并过滤 `tags.internal*`；(2) 敏感字段分类打标 `projects.security_classification`，默认 = internal；(3) 101-prd 竞态条件修复：字段级权限校验在 RPC 层（非前端）做。 |
| **D 拒绝服务 (Denial of Service)** | 前端无限轮询：`useProjectPolling(every 1s)` 遇到 RPC 5xx 时没有指数退避 → 失败 → 立即重试 → 失败；5 个页面同时开 → 每秒 5×N 请求 → RPC 线程池占满 → 连带 YiAi/YiPot 级联慢。对应 bugs/功能缺陷/01-bug-无限轮询竞态。 | 中：RPC 级联占用不丢数据但可用性下降，压测显示 100 个活跃页面可打满单机 4 核。 | 高：01-bug-无限轮询竞态 已重开 3 次。 | (1) 轮询策略：指数退避 `min(1s, 2s, 4s, 8s, 16s cap)` + 失败 5 次进入 "手动刷新" 模式；(2) 服务端接入 yiai 105-prd 熔断器：单 IP 轮询 QPS > 30 直接 429；(3) 切换为 SSE / WebSocket push 模式长连接代替轮询（60 天交付）。 |
| **E 提权 (Elevation of Privilege)** | **无**：YiVad 为单租户前端 + 同源 RPC，不涉及多角色 RBAC 越级（admin/maintainer/viewer 角色定义已足够封闭）。若后续接入跨组织共享再重评。 | 无 | 无 | **无**（版本保留：多租户 + 跨组织共享功能落地时必须重审 E 类）。 |

## 二、风险等级总表 P0 / P1 / P2

| 风险 ID | STRIDE 类别 | 摘要 | 影响 | 可能性 | 综合等级 | 对应设计/缺陷 |
| --- | --- | --- | --- | --- | --- | --- |
| YIVAD-STRIDE-001 | T 篡改 | MongoDB 无 schema，owner 可被 $set 覆盖 | 高 | 高 | **P0** | 04-prd 模式设计 TODO |
| YIVAD-STRIDE-002 | I 信息泄露 | description 全量返回，viewer 可读敏感字段 | 高 | 高 | **P0** | 06-prd 数据层 字段投影 |
| YIVAD-STRIDE-003 | D DoS | 前端无限轮询 1s 无退避 → RPC 占满 | 中 | 高 | **P1** | 01-bug-无限轮询竞态 |
| YIVAD-STRIDE-004 | S 仿冒 | localStorage 直读展示项目名，可伪造归档项目 | 中 | 高 | **P1** | 04-prd 鉴权分支缺失 |
| YIVAD-STRIDE-005 | R 抵赖 | 导入/导出 zip 无签名留痕 | 低 | 中 | **P2** | 企业版合规增强 |
| YIVAD-STRIDE-006 | E 提权 | 无（多租户上线再评） | 无 | 无 | — | — |

## 三、缓解路线图 30 / 60 / 90 天

| 阶段 | 交付物 | 对应风险 | 验收标准 |
| --- | --- | --- | --- |
| **30 天 (T+0 ~ T+30)** | ① 04-prd MongoDB Schema Validation level=strict 落地 + Zod 写入层双校验；② viewer role 字段投影：description 截断 140 字；③ 轮询指数退避 1→2→4→8→16s cap | 001, 002, 003 | ① 1000 条 fuzzing schema 绕过样本 0 通过；② viewer 抓包 Network 中 description 长度 ≤ 140；③ 100 页面 5xx 复现场景 RPC QPS ≤ 基线 1/4。 |
| **60 天 (T+31 ~ T+60)** | ④ localStorage 缓存 HMAC 签名 + 非 owner 归档项目 mask；⑤ SSE push 模式替换 80% 轮询场景；⑥ 导出 zip HMAC 签名 + 管理员历史 | 004, 003, 005 | ④ 构造伪存储样本 50 条 0 通过；⑤ 全量用户轮询请求量下降 ≥ 75%；⑥ 导出记录 100% 可查。 |
| **90 天 (T+61 ~ T+90)** | ⑦ yiai 09-prd 审计日志全量接入 YiVad 写操作；⑧ STRIDE 威胁回归用例进 Playwright 套件；⑨ MongoDB 模式设计 04-prd 文档闭环，字段级权限 100% 覆盖 | 001, 全, 002 | ⑦ 写操作审计覆盖率 100%；⑧ P0 用例 CI 失败率 = 0；⑨ schema 覆盖率 dashboard 100 分。 |
