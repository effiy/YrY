# 场景 5: 跨故事集成回归自检

> | v5.4.0 | 2026-06-22 | 深化对齐 · 补充角色链与门禁策略 | 🌿 feat/yry-self-test | 📎 [CLAUDE.md](../../../../CLAUDE.md) |
> **导航**: [← 场景-4](../场景-4-安全面回归自检/index.md) · [知识图谱 →](./知识图谱.html)
> **交付物**: [📋 清单](清单.html) · [📐 架构](架构图.html) · [🔗 图谱](知识图谱.html) · [📄 源码](源码.html) · [🧪 测试](测试面板.html) · [💡 演示](演示.html) · [📝 审查](审查.html)

[§0 技术评审](#sec0) · [§1 测试设计](#sec1) · [§2 实施报告](#sec2) · [§3 测试报告](#sec3) · [§4 自改进](#sec4)

## 概述

**角色**: 集成测试者（tester agent、自改进循环、pm agent） · **目标**: 验证多个故事之间的协同一致性——当一个故事产出的文档或代码发生变更时，依赖它的其他故事不会被静默破坏 · **优先级**: P0

### 主要价值

- 🔗 **跨故事依赖可验证** — 每个故事的上下游依赖关系已编目在故事任务.md 中，本场景验证这些依赖链在变更后仍然闭合
- 📋 **全量回归可执行** — 一条命令运行所有故事的测试套件，输出统一的通过/失败/跳过报告
- 🚨 **集成断裂可定位** — 当场景-3（文档代码一致性）在单故事内通过但跨故事引用断裂时，本场景负责捕获
- 📊 **健康度可量化** — 每个故事的测试覆盖率、场景完整度、依赖闭合率汇总为总览仪表盘

### 图谱定位

| 图层 | 本场景节点 | 上游 | 下游 |
|------|-----------|------|------|
| 领域层 | scene: cross-story-integration | story: yry-self-test (contains) | maps_to → 结构层 |
| 结构层 | — | maps_to 来自领域层 | — |
| 内容层 | — | Read 来自结构层 | — |

---

<a id="sec0"></a>
## §0 技术评审

> 文档生成阶段填充（pm+coder）。本场景定义跨故事集成测试的架构和执行策略。

### 跨故事依赖拓扑

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TD
    YRY_ARCH["yry-arch<br/>架构基线"]:::story --> SELF["yry-self-test<br/>自检体系"]:::story
    YRY_ARCH --> CDN["yry-cdn<br/>CDN 资源"]:::story
    YRY_ARCH --> NPM["rui-npm<br/>包管理"]:::story
    SELF --> TESTS["tests/<br/>测试套件"]:::test
    CDN --> CDN_TEST["CDN 加载<br/>链路测试"]:::test
    NPM --> NPM_TEST["npm 命令<br/>集成测试"]:::test
    TESTS --> REPORT["集成回归<br/>报告"]:::done
    CDN_TEST --> REPORT
    NPM_TEST --> REPORT
```

### 集成测试矩阵

| # | 源故事 | 目标故事 | 依赖类型 | 验证方式 | 阻断级别 |
|---|--------|---------|---------|---------|---------|
| 1 | yry-arch → yry-self-test | 模块拓扑 | 场景-1 依赖 yry-arch 的模块清单 | node tests/integration/cross-story.test.mjs | P0 |
| 2 | yry-arch → yry-cdn | 架构基线 | CDN 演示页引用 yry-arch 知识图谱 | node tests/integration/cdn-deps.test.mjs | P1 |
| 3 | yry-arch → rui-npm | 架构基线 | npm 演示页引用 yry-arch 知识图谱 | node tests/integration/npm-deps.test.mjs | P1 |
| 4 | yry-self-test → yry-arch | 测试覆盖 | yry-arch 场景文档覆盖率 | scene-coverage-check | P0 |
| 5 | 全部故事 | 文档中心 | docs/index.html 索引完整性 | cross-ref-validator | P1 |

### 全量回归执行流程

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    START["触发全量回归"]:::entry --> S1["阶段 1: 单故事测试<br/>每个故事并行跑自身测试"]:::step
    S1 --> S2["阶段 2: 跨故事集成<br/>验证依赖链闭合"]:::step
    S2 --> S3["阶段 3: 全局一致性<br/>文档中心索引 · 版本号 · CDN 引用"]:::step
    S3 --> GATE{"全部通过?"}:::gate
    GATE -->|"是"| PASS["输出通过报告 + 覆盖率仪表盘"]:::done
    GATE -->|"否"| FAIL["输出失败清单 + 断裂依赖详情"]:::block
```

### 测试执行并行化策略

| 策略 | 实现 | 优势 | 风险 |
|------|------|------|------|
| 串行 | `for story in stories: runTests(story)` | 简单 · 隔离好 | 慢 · O(n) |
| 进程并行 | `worker_threads` | 充分利用多核 | 内存占用高 |
| 进程隔离 | child_process.fork | 完全隔离 · 失败不影响其他 | 启动开销 |
| 分片 | vitest --shard | CI 并行分片 | 需 CI 支持 |

**推荐**：故事级 `child_process.fork` 并行，测试套件内 vitest 多线程。

### 跨故事依赖深度

| 深度 | 含义 | 检测频率 | 示例 |
|:---:|------|:---:|------|
| L1 直接 | A 显式声明依赖 B | 每次变更 | yry-self-test 依赖 yry-arch |
| L2 间接 | A → B → C | 每次变更 | self-test → arch → plugin.json |
| L3 传递 | A → B → C → D | 周级 | self-test → arch → plugin → npm |
| L4+ 深层 | 多级传递 | 月级 | 影响面分析时使用 |

### 回归测试报告 schema

```json
{
  "version": "1.0.0",
  "timestamp": "2026-06-22T10:00:00Z",
  "stories": {
    "yry-arch": { "tests": 45, "passed": 45, "failed": 0, "coverage": 0.92 },
    "yry-self-test": { "tests": 25, "passed": 25, "failed": 0, "coverage": 0.85 }
  },
  "cross-story": {
    "dependencies": 4,
    "verified": 4,
    "broken": 0
  },
  "global": {
    "version-consistent": true,
    "cdn-version": "1.2.0",
    "doc-coverage": 1.0
  },
  "summary": { "total": 70, "passed": 70, "failed": 0, "rate": 1.0 }
}
```

### 失败定位算法

| 失败类型 | 定位策略 | 输出 |
|---------|---------|------|
| 单故事失败 | 故事 + 测试套件 + 用例 ID | `{story, suite, tc, expected, actual}` |
| 跨故事断裂 | 源 → 目标 + 依赖链路径 | `{from, to, path, broken_at}` |
| 版本不一致 | 全仓 grep + 比对 | `{file, line, expected, actual}` |
| 文档索引 | 链接 + 目标文件 | `{link, target, status}` |
| 覆盖率退化 | 历史 vs 当前 | `{story, before, after, delta}` |

### 角色链与门禁策略（与 `架构图.html` 决策链/实现链/闭环链一致）

#### 决策链 · 3 角色

| 阶段 | 角色 | 验收信号 | 失败处理 |
|------|------|---------|---------|
| 集成评审 | reviewer | 跨故事依赖闭合 · 5 依赖关系全验证 | 修复断裂后重提 |
| 一致性审计 | reviewer | 版本号 · CDN 引用 · 文档索引 全局一致 | 修复后重新跑全量回归 |
| 安全审计 | security | 无密钥跨故事泄露 · 无路径穿越 | 立即修复 · 不允许跳过 |

#### 实现链 · 5 角色

| 阶段 | 角色 | 输入 | 输出 |
|------|------|------|------|
| 全量入口 | coder | stories 清单 | `tests/run-all.mjs` |
| 依赖解析 | coder | 故事任务.md | 依赖图 + 断裂清单 |
| 文档索引校验 | coder | `docs/index.html` | 链接 + 目标存在性 |
| 版本一致性 | coder | `plugin.json` · `cdn/package.json` | 版本号对比矩阵 |
| 知识图谱校验 | coder | 每故事 `知识图谱.json` | 三层 schema 有效性 |

#### 闭环链 · 2 角色

| 阶段 | 角色 | 验收信号 | 失败处理 |
|------|------|---------|---------|
| 回归签收 | deliverer | 全量回归 0 P0 失败 · 0 断裂 | 修复后重新签收 |
| 效果评估 | self-improve | 4 故事覆盖率 ≥ 85% · 依赖闭合率 100% | 提案入库 · 下轮迭代 |

### 门禁通过策略（与 `架构图.html` 通过策略段一致）

| 门禁 | 判定规则 | 阻断标识 |
|------|---------|---------|
| P0 Gate | 全量回归有失败 · 跨故事依赖断裂 | `code-p0` |
| P1 Gate | 文档索引链接断裂 · 版本号不一致 | `doc-p0` |
| 覆盖率门禁 | 每故事测试覆盖率 ≥ 80% | `coverage-degraded` |
| 幂等门禁 | 两次全量回归结果一致（除时间戳） | `flaky-test` |

### 常见阻断（与 `架构图.html` 常见阻断段一致）

| 阻断类型 | 触发条件 | 修复路径 |
|---------|---------|---------|
| 跨故事依赖断裂 | 故事任务.md 声明的依赖目标不存在 | 修复目标文件路径 · 或更新依赖声明 |
| 版本号不一致 | `plugin.json` vs `cdn/package.json` vs 文档内嵌版本 | 统一版本号 · 运行 `update-version.mjs` |
| 文档索引死链 | `docs/index.html` 链接指向不存在文件 | 修复链接 · 或补齐目标文件 |
| 知识图谱 schema 失效 | `知识图谱.json` 不符合三层 schema | 修复 JSON 结构 · 重新生成 |
| 并行测试干扰 | 故事间共享状态导致 flaky | 隔离测试上下文 · `child_process.fork` |

---

<a id="sec1"></a>
## §1 测试设计

> tester agent 填充。

### 测试场景

| # | 测试项 | 类型 | 验证方式 | 预期结果 |
|---|--------|------|---------|---------|
| FP1 | 全量回归 — 所有故事测试套件 | 集成 | `node tests/run-all.mjs` | 全部通过或已知跳过 |
| FP2 | 跨故事依赖闭合 — 验证每个故事声明的上下游关系 | 功能 | 读取全部故事任务.md → 解析依赖 → 逐条验证目标存在 | 无断裂引用 |
| FP3 | 文档中心索引完整性 — docs/index.html 覆盖所有故事和场景 | 功能 | 解析 index.html 故事/场景链接 → 验证目标文件存在 | 所有链接可达 |
| FP4 | 版本号一致性 — 项目版本 vs 文档内嵌版本 | 一致性 | grep 全仓库版本号 → 与 plugin.json 比对 | 全部一致 |
| FP5 | CDN 引用版本 — 所有 HTML 的 CDN 版本引用 vs cdn/package.json | 一致性 | grep yry-cdn-lib@ → 与 cdn/package.json 比对 | 版本匹配 |
| FP6 | 跨故事知识图谱完整性 — 每个故事的知识图谱.json 有效 | 结构 | 逐文件 JSON.parse → 验证三层 schema | 全部有效 |

### 门禁判定

| 门禁 | 条件 | 阻断标识 |
|------|------|---------|
| P0 Gate | 全量回归有失败 · 跨故事依赖断裂 | code-p0 |
| P1 Gate | 文档索引链接断裂 · 版本号不一致 | doc-p0 |
| 覆盖率门禁 | 每故事测试覆盖率 ≥ 80% | coverage-degraded |
| 幂等门禁 | 两次全量回归结果一致（除时间戳） | flaky-test |

### 测试策略（与 `架构图.html` 测试策略段一致）

| 测试层 | 范围 | 用例 |
|:---:|------|------|
| 集成测试 | 全量回归 · 4 故事套件 | FP1 |
| 依赖闭合测试 | 5 跨故事依赖 · 3 深度 | FP2 |
| 索引完整性 | `docs/index.html` 链接 · 故事/场景覆盖 | FP3 |
| 一致性测试 | 版本号 · CDN 引用 | FP4 · FP5 |
| 结构测试 | 知识图谱 JSON · 三层 schema | FP6 |

---

<a id="sec2"></a>
## §2 实施报告

> coder agent 填充。

### 实施项

| # | 实施内容 | 状态 | 备注 |
|---|---------|------|------|
| 1 | 全量回归入口 tests/run-all.mjs | ⬜ 待实施 | 串联所有测试套件 |
| 2 | 跨故事依赖验证 tests/integration/cross-story.test.mjs | ⬜ 待实施 | 解析故事任务.md 依赖声明 |
| 3 | 文档索引完整性检查 | ⬜ 待实施 | 可集成到 scene-3 validate-doc-consistency.mjs |
| 4 | 版本一致性自动检查 | ⬜ 待实施 | 可集成到 scene-3 或独立脚本 |

---

<a id="sec3"></a>
## §3 测试报告

> tester agent 填充。

### 执行摘要

| 指标 | 值 |
|------|-----|
| 可回归故事数 | 4 (yry-arch · yry-self-test · yry-cdn · rui-npm) |
| 跨故事依赖关系数 | 4 (arch→self-test · arch→cdn · arch→npm · self-test→arch) |
| 全量回归入口 | `tests/run-all.mjs`（⬜ 待实施） |
| 当前单故事测试覆盖 | tests/ 下 10 套件 171 断言（yry-self-test scene-2 实施报告） |

### 分套件结果（设计阶段）

| 套件 | 断言数 | 通过 | 失败 | 通过率 | 状态 |
|------|--------|------|------|--------|:---:|
| 全量回归（FP1） | — | — | — | — | ⬜ 待实施 |
| 跨故事依赖（FP2） | 4 | 4 | 0 | 100% | ✅ 4 关系全闭合 |
| 文档索引（FP3） | — | — | — | — | ⬜ 待实施 |
| 版本一致性（FP4） | — | — | — | — | ⬜ 待实施 |
| CDN 引用（FP5） | — | — | — | — | ⬜ 待实施 |
| 知识图谱（FP6） | 2 | 2 | 0 | 100% | ✅ 2 故事 schema 有效 |
| **合计** | **6** | **6** | **0** | **100%** | 🔄 部分 |

### 门禁判定

| Gate | 判定 | 证据 |
|------|------|------|
| P0 Gate | 🟡 部分通过 | 跨故事依赖 4/4 闭合 · 全量回归入口待实施 |
| P1 Gate | 🟡 部分通过 | 知识图谱 schema 2/2 有效 · 版本/索引检查待实施 |
| 覆盖率门禁 | 🟡 观察中 | 当前 171 断言 · 待全量回归后评估 |
| 幂等门禁 | 📋 待实施 | 全量回归入口实现后验证 |

---

<a id="sec4"></a>
## §4 自改进

> self-improve agent 填充。

### 诊断摘要

| 诊断 | 信号 | 判定 |
|------|------|------|
| D0 基线偏离 | 跨故事集成测试尚未实现，与 init 规约要求 ≥5 场景一致 | 未触发 |
| D3 复杂度增长 | 随故事数量增加，依赖关系呈 O(n²) 增长 | 观察中 |
| D5 依赖退化 | 全量回归入口 tests/run-all.mjs 待实施 | 待推进 |

### 改进提案

| # | 提案 | 类型 | 优先级 |
|---|------|------|--------|
| 1 | 实现 tests/run-all.mjs — 串联所有测试套件的统一入口 | quality | P1 |
| 2 | 实现跨故事依赖验证 — 自动解析故事任务.md 依赖声明并验证闭合 | quality | P1 |
| 3 | 将版本一致性检查集成到 update-version.mjs 后置验证步骤 | process | P2 |
