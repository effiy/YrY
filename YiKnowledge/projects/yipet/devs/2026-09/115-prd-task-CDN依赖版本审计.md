---

doc_type: task
prd_task_id: "YP-09-115"
title: "YP-09-115: CDN 依赖版本审计 — 技术实施计划"
status: planned
priority: P1
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "115-基础设施-CDN依赖版本审计.md"
tags: [cdn, dependencies, security, planned]

type: task
---

# YP-09-115: CDN 依赖版本审计 — 技术实施计划

> **版本**：v1.0 · **人天**：2.0d · **状态**：planned

---

## 1. 实施步骤

### Phase 1: 审计 (0.5d)

```bash
# 全量扫描 public/cdn/vendor/ 目录
ls -la public/cdn/vendor/

# 检查每个库的版本号和最后发布时间
# 输出: vendor-audit.json
```

### Phase 2: 更新 (1.0d)

| 优先级 | 库 | 操作 |
|--------|-----|------|
| P0 | GSAP TweenMax | 替换为 GSAP 3.x，`global: 'gsap'` |
| P1 | Font Awesome | 4.7 → 6.6 CSS |
| P1 | Swiper | 7.0 → 11.1 |
| P2 | Bootstrap | 5.2 → 5.3 |
| P2 | Animate.css | 3.5 → 4.1 |

### Phase 3: catalog.ts 更新

```typescript
// 示例: GSAP 迁移
{ key: 'gsap', path: 'vendor/gsap@3.12.7/gsap.min.js', type: 'js', global: 'gsap', desc: 'GSAP 3.12' },
// 保留旧 key 兼容
{ key: 'gsap-legacy', path: 'vendor/gsap/TweenMax.min.js', type: 'js', global: 'TweenMax', desc: 'GSAP TweenMax (deprecated)' },
```

### Phase 4: 兼容测试 (0.5d)

```javascript
// 在任意页面控制台
await YiPet.load('gsap')       // 新版 GSAP
await YiPet.load('vue')         // Vue 3.5
await YiPet.load('mermaid')     // Mermaid
YiPet.list()                    // 验证所有 key
```

## 2. 验证

```bash
npm run typecheck && npm test && npm run build
```