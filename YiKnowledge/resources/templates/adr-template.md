---
title: 架构决策记录模板（ADR）
tags: [模板, ADR, 架构决策, 架构, 复盘]
category: resources/templates
created: 2026-07-30
updated: 2026-07-30
source: internal
type: template
status: stable
---

# 架构决策记录模板（ADR）

> 使用方法：每个不可逆或影响多团队的架构决策新建一份 ADR。编号递增，状态机：Proposed → Accepted → Deprecated / Superseded。复制到 `resources/templates/adr-{编号}-{短描述}.md`，如 `adr-007-use-rsbuild.md`。配套 qb-row「Architecture decision records」一键 prompt：list key changes, risks, and rollback plans from recent ADRs。

## 1. 基本信息

| 字段 | 内容 |
|------|------|
| ADR 编号 | （示例：ADR-007） |
| 标题 | （示例：YiVad 由 Vite 迁移至 Rsbuild） |
| 状态 | Proposed / Accepted / Deprecated / Superseded |
| 日期 | （示例：2026-07-28） |
| 决策者 | （示例：架构组 + 前端组长） |
| 评审人 | （示例：CTO、运维、QA） |
| 关联项目 | （示例：YiVad） |
| 关联 PR/Issue | （示例：#1234） |
| Supersedes | （示例：ADR-003） |
| Superseded by | （示例：—） |

## 2. 背景（Context）

陈述触发本决策的事实、约束、痛点。包含但不限于：
- 现状：__（如：Vite 8 升级后多次出 HMR 故障）
- 痛点量化：__（如：dev server 启动 90s，HMR 失败率 12%）
- 触发事件：__（如：某次发布被 Vite plugin 阻塞）
- 外部约束：__（如：Node 22 升级、RSBUILD_ENV_* 前缀要求）

## 3. 决策（Decision）

一句话陈述结论：__「我们选择 X，而非 Y / Z」。

列出该决策的关键 changes（要落地清单）：

| 序号 | Change | 影响范围 | 上线策略 |
|---|---|---|---|
| 1 | 构建器切到 Rsbuild 1 | 全前端 | 一次性切换 |
| 2 | env 前缀 VITE_ → RSBUILD_ENV_* | 所有 env 引用 | 渐进替换 |
| 3 | svg-sprite + views-glob 自定义插件 | 资源与路由 | 新增 |

## 4. 备选项（Options Considered）

| 备选 | 描述 | 优点 | 缺点 | 结论 |
|---|---|---|---|---|
| A. Rsbuild | Rspack-based，Vite 兼容 | 启动快、配置简洁 | 生态小 | ✅ 选中 |
| B. Webpack 5 | 主流稳定 | 生态成熟 | 配置重 | ❌ |
| C. 留在 Vite | 现状 | 无变更 | HMR 故障持续 | ❌ |

## 5. 评估维度

| 维度 | A. Rsbuild | B. Webpack | C. 留 Vite |
|---|---|---|---|
| 构建性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 配置复杂度 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 生态成熟度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 学习成本 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 长期方向 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 6. 风险（Risks）

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| 插件生态不足 | 中 | 中 | 自写 svg-sprite + views-glob |
| env 迁移遗漏 | 高 | 低 | lint 规则检查 VITE_ 前缀 |
| HMR 行为差异 | 中 | 中 | 保留 watchfiles 兜底方案 |

## 7. 回滚计划（Rollback Plan）

| 触发条件 | 回滚动作 | 责任人 | 预计恢复时长 |
|---|---|---|---|
| 构建产物体积增大 > 15% | 切回 Vite 分支 | 前端组长 | 30 min |
| dev server 启动仍 > 60s | 保留 Vite dev 分支 | 前端组长 | 1 h |
| 关键依赖缺失 | 临时 Vite fallback | 架构组 | 2 h |

> 回滚操作必须可在一小时内执行，且无需重新部署后端。

## 8. 实施计划

| 阶段 | 内容 | 完成日期 | 责任人 |
|---|---|---|---|
| Phase 1 | PoC：dev/build 跑通 | 2026-07-15 | 前端组 |
| Phase 2 | 全量迁移 + lint 规则 | 2026-07-28 | 前端组 |
| Phase 3 | 监控一周稳定性 | 2026-08-04 | 运维 |

## 9. 后续追踪指标

| 指标 | 上线前 | 目标 | 实际 |
|---|---|---|---|
| dev 启动时间 | 90s | < 30s | — |
| HMR 失败率 | 12% | < 3% | — |
| 构建产物体积 | 4.2 MB | ≤ 4.5 MB | — |

## 10. 参考

- [Vite → Rsbuild 迁移 memory]({链接})
- [Rsbuild 文档](https://rsbuild.dev)
