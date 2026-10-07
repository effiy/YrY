---
doc_type: dev
title: "YiPet 运行时可靠性修复 — 开发方案"
tags:
- 开发方案
- 错误处理
- SSE
- Service Worker
category: 项目/浏览器扩展/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P2
project: YiPet
project_id: yipet
owner: Chengliang.Yi
prd_month: '202609'
dev_id: YP-09-100
prd_ref: YP-09-100
estimate: 0.25
review_status: 已评审
roles:
- engineer
---

# YiPet 运行时可靠性修复 — 开发方案

> 开发编号：YP-09-100 · 关联 PRD：YP-09-100 · 预估人天：0.25d

---

## 一、变更清单

| 文件 | 变更 | 说明 |
|------|------|------|
| `background/index.ts:110-115` | 新增 `.catch()` | SW 初始化失败时输出 console.error |
| `api/client.ts:189-190` | 修复 SSE 解析 | 支持 `data:` 无空格格式 |

---

## 二、实施步骤

### Step 1: SW 初始化错误处理

```ts
// background/index.ts
swStateMachine.init().then(() => { ... })
  .catch((err: unknown) => console.error('[YiPet] Service worker init failed:', err));
featureFlags.init().then(() => { ... })
  .catch((err: unknown) => console.error('[YiPet] Feature flags init failed:', err));
```

### Step 2: SSE 帧解析规范合规

```ts
// api/client.ts
if (t.startsWith('data:')) {
  dataStr += t[5] === ' ' ? t.slice(6) : t.slice(5);
  continue;
}
if (t.startsWith('event:') && t.slice(6).trim() === 'error') {
  return { done: true, error: 'Stream error' };
}
```

---

## 三、验证

```bash
npm run typecheck && npm run build   # 类型+构建
npm test                              # 138 passed
```

---

## 四、关联文件

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/100-需求-运行时可靠性修复.md` |
| 测试 | `../tests/2026-09/100-prd-test-运行时可靠性修复.md` |
| Bug SW | `../bugs/2026-09/Service-Worker/02-Service-Worker-init-缺catch.md` |
| Bug SSE | `../bugs/2026-09/接口/03-接口-SSE解析data缺少无空格支持.md` |