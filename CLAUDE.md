# CLAUDE.md

> 基础信念是 why。领域语言见 [README.md](./README.md#领域语言)。管线规则见 [rules/](rules/)，角色契约见 [agents/](agents/)。

## 基础信念

**信模型** — 模型有能力判断。上下文中的模型能做出合理决策。检查清单不能替代思考。

**惜注意** — 上下文有限且退化。不必要的信息挤掉必要的信息。

**验现实** — 现实是唯一裁判。没验证等于没做。"应该没问题"不可证伪。

公理冲突时优先级：**验现实 > 信模型 > 惜注意**。

## 铁律

| 铁律 | 源于 | 含义 |
|------|------|------|
| **验先于称** | 验现实 | 未运行验证命令不得声称完成/通过/修复 |
| **溯先于修** | 验现实 | 未找到根因不得提出修复方案 |
| **清先于进** | 信模型 | 模块 P0 未清零不得进入下一模块 |

<!-- rui:project-start -->
## 项目约束

### 项目不可妥协底线

- **认证不可绕过** — 涉及 auth/token/session，任何绕过路径为 P0
- **密钥不落盘** — Token/密钥/凭据禁止出现在源码或配置文件
- **输入必校验** — 用户输入必须经过验证/转义，XSS/注入为 P0
<!-- rui:project-end -->

## 引导

- 管线规则：[rules/code-pipeline.md](rules/code-pipeline.md) — 分支隔离 · Gate A/B · 逐模块清零 · 支撑技术
- 交付收口：[rules/delivery-gate.md](rules/delivery-gate.md) — 三步 hook
- 文档生成：[rules/doc-generation.md](rules/doc-generation.md) — 六约束
- 共享契约：[agents/AGENT.md](agents/AGENT.md) — 角色拓扑 · 行为纪律 · 设计原则 · 执行准则
- 领域语言：[README.md](README.md#领域语言)
- 系统全景：[README.md](README.md)
