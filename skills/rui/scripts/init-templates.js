#!/usr/bin/env node

// init-templates.js — 模板生成器（纯数据，无副作用）
//
// 职责：接收 profile 对象，返回文件内容字符串。
// 设计：与 init.js 分离，遵循 CLAUDE.md「对等/称轻重」——
//       改模板不碰逻辑，改逻辑不碰模板。

'use strict';

// ── CLAUDE.md ──────────────────────────────────────────────────

function claudeMd(p) {
  const row = (dim, val, src) => `| ${dim} | ${val} | ${src} |`;
  const techStack = p.manifest.tech_stack.length > 0
    ? row('技术栈', p.manifest.tech_stack.join(' · '), '清单文件')
    : row('技术栈', `${p.type_label}项目`, '类型推断');
  const buildCmds = p.manifest.build_commands.length > 0
    ? row('构建', `\`${p.manifest.build_commands.join('` · `')}\``, '清单文件')
    : row('构建', '无构建命令', '—');
  const testSection = p.test_framework.framework
    ? row('测试', `${p.test_framework.framework} · \`${p.test_framework.runner_command}\``, p.test_framework.config_file || '约定')
    : row('测试', '未检测到测试框架', '—');
  const securitySection = p.security_surface.signals.length > 0
    ? row('安全面', p.security_surface.signals.join(' · '), '源码扫描')
    : row('安全面', '无显著安全面', '源码扫描');
  const ciSection = p.ci_config.provider
    ? row('CI/CD', `${p.ci_config.provider}${p.ci_config.has_deploy ? ' (含部署)' : ''}`, p.ci_config.config_file)
    : row('CI/CD', '未配置', '—');

  return `# CLAUDE.md

> 三公理推导一切——基础信念是 why，工作原则是设计约束，执行准则是日常动作。读完此文件，应能说出每个动作背后的那条公理。

## 基础信念

> **口诀：信模型，惜注意，验现实。**

\`\`\`mermaid
flowchart LR
    A[信模型<br/>模型能判断] --> B[惜注意<br/>注意力稀缺]
    B --> C[验现实<br/>运行即证]
    C -.反馈修正.-> A
\`\`\`

**信模型 — 模型有能力判断。** 上下文中的模型能做出合理决策。检查清单不能替代思考。

**惜注意 — 上下文有限且退化。** 注意力是稀缺资源。不必要的信息挤掉必要的信息。退化三因：外部不可达、渐进漂移、人机偏差。

**验现实 — 现实是唯一裁判。** 没验证等于没做。"应该没问题"不可证伪。

> 公理冲突时优先级：**验现实 > 信模型 > 惜注意**。先确保事实，再相信判断，最后省注意力。

## 工作原则

> **口诀：守底线，留核心，退一步，验为实，说清楚，称轻重。**

每条原则都在缓解某条公理的张力。

| 原则 | 服务公理 | 一句话 | 反例（违反就改） |
|------|---------|--------|----------------|
| **涌现** 守底线 | 信模型 | 只定不可妥协的底线，其余交给上下文 | 把"风格偏好"写进硬规则 |
| **简化** 留核心 | 惜注意 | 删至必要——最可靠的模块是没有模块 | 增加抽象层却没第二个调用方 |
| **消失** 退一步 | 惜注意 | 流程复杂度 ≤ 任务复杂度 | 用户感觉"在走流程"而非"在解决问题" |
| **校准** 验为实 | 验现实 | 没运行过的结论不作数 | 凭代码"看起来对"就提交 |
| **释义** 说清楚 | 惜注意 | 人看不懂，正确也没意义 | 一段话三层从句解释一件事 |
| **对等** 称轻重 | 全部 | 投入与改动量、风险等级匹配 | 改注释和重写核心循环走同套流程 |

## 执行准则

> **口诀：思在前，码从简，改必准，测先行，毕则告，图为首，自定验。**

**思先于码。** 陈述假设，呈现权衡。不确定就停，问。

**最少代码。** 只解决这个问题。不请自来的功能、单次抽象、不可能场景的错误处理——不写。

**精确修改。** 只动必须动的。改动不留残余。每行改动可追溯到请求。

**目标驱动。** 先写失败测试再通过。"看起来没问题"等于没做。

**完成通知。** 做完或卡住都同步状态。沉默比失败更危险。

**表达优先：口诀 → 图 → 结构化文本 → 表。**

**生效标志由各 agent 自定义。**

## 退化对策

> **口诀：先可见，后规则。**

类型、合约、运行结果是可见的——它们自己就在说话。规则是最后手段，因为规则本身也消耗注意力。

<!-- rui:project-start -->
## 项目约束

> 以下由 \`rui init\` 根据项目画像自动生成。每次 \`rui init\` 运行时更新。

| 维度 | 约束 | 来源 |
|------|------|------|
| 项目 | ${p.project} · ${p.type_label} · ${p.architecture.pattern} | 目录扫描 |
${techStack}
${buildCmds}
${testSection}
${securitySection}
${ciSection}
| 生态 | ${p.manifest.ecosystems.join(' · ') || '未识别'} | 清单文件 |
| Coder 公式 | ${p.coder_formula.text} | 类型推断 |
| 故事骨架 | ${p.story_defaults.skeleton}（必选: ${p.story_defaults.required_files.join('/')}）| 类型推断 |

### 项目不可妥协底线

${bottomLines(p)}
<!-- rui:project-end -->

## 自约束

- **更短优先。** 本文件应比它指导的任何文件更短。
- **预算上限。** 公理 3 / 原则 6 / 准则 7——这是上限，不是下限。
- **增长触发审视。** 如果它增长了，说明某条推导失效了，或某层在做下一层的事。
`;
}

function bottomLines(p) {
  const lines = [];
  if (p.security_surface.auth) lines.push('- **认证不可绕过** — 涉及 auth/token/session，任何绕过路径为 P0');
  if (p.security_surface.user_input) lines.push('- **输入必须校验** — 用户输入点已识别，XSS/注入防护为 P0');
  if (p.security_surface.data_storage) lines.push('- **存储必须安全** — 数据持久化已识别，敏感数据加密/脱敏为 P0');
  if (p.security_surface.api_exposure) lines.push('- **API 必须鉴权** — 暴露接口已识别，未鉴权端点为 P0');
  if (p.architecture.pattern === 'monorepo') lines.push('- **包边界不可穿透** — monorepo 各包独立，跨包直接引用内部模块为 P0');
  if (p.architecture.pattern === 'microservice') lines.push('- **服务边界不可穿透** — 微服务间只通过定义的通道通信');
  lines.push('- **密钥不落盘** — Token/密钥/凭据禁止出现在源码或配置文件');
  if (p.test_framework.framework) lines.push(`- **测试必须通过** — \`${p.test_framework.runner_command}\` 全绿方可提交`);
  return lines.join('\n') || '- 无特殊底线（通用安全规则适用）';
}


// ── README.md ──────────────────────────────────────────────────

function readmeMd(p, meta) {
  const techList = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : p.type_label;
  const ecoList = p.manifest.ecosystems.join(' · ') || '未识别';
  const capDesc = { frontend: '前端组件驱动开发', backend: '后端领域驱动开发', fullstack: '全栈端到端开发', meta: '插件/配置系统开发' }[p.type] || '通用软件开发';
  const skeletonDesc = p.story_defaults.skip_files.length > 0
    ? `${p.story_defaults.skeleton}（跳过: ${p.story_defaults.skip_files.map(f => f + '-*').join('/')}）`
    : p.story_defaults.skeleton;

  return `# ${p.project}

> 故事驱动的 SDLC 编排系统。${capDesc}。

- **项目类型** — ${p.type_label}（${p.architecture.pattern}）
- **技术栈** — ${techList}
- **生态** — ${ecoList}
- **基础** — 三条公理推导全部行为准则，详见 [CLAUDE.md](./CLAUDE.md)

## 系统能力

\`\`\`mermaid
flowchart TB
    User([用户]):::user
    subgraph 入口层
      direction LR
      Cmd1["/rui"]:::cmd
      Cmd2["/rui-claude"]:::cmd
    end
    User --> Cmd1 & Cmd2
    Cmd1 --> R["rui<br/>故事 SDLC 编排"]:::core
    Cmd2 --> C["rui-claude<br/>.claude 配置管理"]:::core
    R --- Agents["${meta.agentCount} Agents · Gate A/B<br/>故事骨架: ${skeletonDesc}"]
    C --- Scope[".claude/ 范围内<br/>sync / retro / history"]
    classDef user fill:#fff3e0,stroke:#e65100;
    classDef cmd fill:#e3f2fd,stroke:#1976d2,color:#0d47a1;
    classDef core fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

## 快速开始

\`\`\`bash
/rui init                    # 建立项目基线
/rui doc "需求描述"           # 拆需求为故事
/rui code <story-name>       # 实现故事
/rui                         # 任务推荐
\`\`\`

## 项目画像

| 维度 | 值 |
|------|-----|
| 类型 | ${p.type_label} |
| 架构 | ${p.architecture.pattern} |
| Coder 公式 | ${p.coder_formula.text} |
| 安全面 | ${p.security_surface.signals.join(' · ') || '无显著安全面'} |
| 测试 | ${p.test_framework.framework || '未配置'} |
| CI/CD | ${p.ci_config.provider || '未配置'} |
| 构建 | ${p.manifest.build_commands.join(' · ') || '无'} |

## 进一步

- [CLAUDE.md](./CLAUDE.md) — 哲学基础
- \`.claude/rules/\` — 规则细节
- \`.claude/agents/\` — 角色边界
- \`.claude/formulas.md\` — 文档公式
`;
}

// ── Agents ─────────────────────────────────────────────────────

function agents(p) {
  const out = {};

  out['AGENT.md'] = `# Agents

> **口诀：指人、给据、收口。**

哲学源头 [CLAUDE.md](../../CLAUDE.md)：信模型、惜注意、验现实。

## 项目上下文

- **项目**: ${p.project} · ${p.type_label} · ${p.architecture.pattern}
- **Coder 公式**: ${p.coder_formula.text}
- **安全面**: ${p.security_surface.signals.join(' · ') || '无显著安全面'}
- **测试**: ${p.test_framework.framework || '未配置'} · \`${p.test_framework.runner_command || '无'}\`

## 角色拓扑

\`\`\`mermaid
flowchart LR
    pm(("pm<br/>决策")):::core
    pm -->|安全审查| sec[security]:::side
    pm -->|拆故事/排优先级| coder & tester & reporter
    coder --> tester --> reporter
    sec -.约束.-> coder
    si["self-improve"]:::side -.提案.-> pm
    classDef core fill:#fff3e0,stroke:#e65100;
    classDef side fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

| Agent | 口诀 | 一句话 |
|-------|------|--------|
| pm | 拆·排·收 | 决定做/不做/延期 |
| coder | 分·清·追 | 逐模块实现，P0 清零 |
| tester | 先·覆·断 | 测试先行，Gate 阻断 |
| reporter | 记·引·串 | 三报告交叉闭合 |
| security | 建·注·卡 | 威胁建模 → P0 卡发布 |
| self-improve | 采·断·出 | 数据驱动改进提案 |

## 共用底线

### 证据等级

| Level | 含义 | 写法 |
|-------|------|------|
| **A** 已验证 | Read/Grep/Glob 可复核 | 直接陈述，附路径 |
| **B** 可推导 | 从 A 推出一步 | "由……可得" |
| **C** 未验证 | 用户口述、未抓取 | \`> 待补充\` |
| **D** 禁止 | 无 A/B 支撑且非 C 标注 | 视为幻觉，不得出现 |

### 生效标志

每个 agent 在自身文件末尾定义"何时算交接成功"。
`;

  out['pm.md'] = agentPm(p);
  out['coder.md'] = agentCoder(p);
  out['tester.md'] = agentTester(p);
  out['reporter.md'] = agentReporter(p);
  out['security.md'] = agentSecurity(p);
  out['self-improve.md'] = agentSelfImprove(p);
  return out;
}

function agentPm(p) {
  const explore = p.type === 'frontend'
    ? '| 前端 | `.vue`/`.jsx`/`.tsx` 的 Props/Events/Expose | 核心业务无文档 > 普通 |'
    : p.type === 'backend'
    ? '| 后端 | 路由/控制器 → HTTP 方法/路径/schema | 核心 API 无文档 > 普通 |'
    : '| 全栈 | 两端独立扫描 | 分别输出 |';
  return `---
name: pm
description: Product decision maker for ${p.project} (${p.type_label})
tools: Read, Grep, Glob, Bash
---

# pm — 产品决策者

> **口诀：拆·排·收。**

## 项目上下文

- **项目**: ${p.project} · ${p.type_label}
- **故事骨架**: ${p.story_defaults.skeleton}（必选: ${p.story_defaults.required_files.join('/')}）
- **Coder 公式**: ${p.coder_formula.text}

## 拆故事决策

| 信号 | 处理 |
|------|------|
| ≥2 独立角色 | 按角色拆 |
| ≥2 独立入口 | 按入口拆 |
| 子需求可独立交付 | 拆为独立故事 |
${p.type === 'fullstack' ? '| 跨前后端且任一端 > 3 模块 | 前端故事 + 后端故事 |\n' : ''}| 单一场景不可再分 | 不拆 |

## --from-code 探索

| 项目类型 | 扫描目标 | 排序 |
|---------|---------|------|
${explore}

## 生效标志

- 故事 §1 ≤ 3 句说清「做什么/给谁/为什么」
- §2 功能点全部 P0/P1/P2 标注且与 §5 AC 一一对应
- §4 任务表每行有 Agent + 门禁 + 交接信号
`;
}

function agentCoder(p) {
  return `---
name: coder
description: Code implementer for ${p.project} (${p.type_label}), formula: ${p.coder_formula.variant}
tools: Read, Grep, Glob, Edit, Write, Bash
---

# coder — 代码实现

> **口诀：分·清·追。** 逐模块（分），P0 清零（清），改动可追溯（追）。

## 项目上下文

- **公式**: ${p.coder_formula.text}
- **焦点**: ${p.coder_formula.focus}
- **构建**: \`${p.manifest.build_commands.join('` · `') || '无'}\`
- **测试**: \`${p.test_framework.runner_command || p.manifest.test_commands.join('` · `') || '无'}\`

## 工作循环

\`\`\`mermaid
flowchart LR
    Br[切分支] --> M1[模块 1] --> R1{P0=0?}
    R1 -.否.-> M1
    R1 -->|是| M2[模块 2] --> R2{P0=0?}
    R2 -->|是| Done[交接 tester]
\`\`\`

## 规则

1. 功能分支从 main/master 创建，命名 \`feat/${p.project}-<name>\`
2. 改动源码前必须已切到功能分支
3. 源码改动唯一入口是 \`/rui code\` 管线
4. 禁止功能分支自动合并到 main
5. P0 缺失不进入实现，影响链未闭合不声称闭合

## 审查维度

| 维度 | 检查点 |
|------|--------|
| Correctness | 逻辑错误、边界、null、并发 |
| Security | ${p.security_surface.signals.length > 0 ? p.security_surface.signals.join('、') : '注入、认证绕过、数据暴露'} |
| Maintainability | 命名、复杂度、重复、抽象层级 |

## 生效标志

- 每模块 P0 清零证据可追溯
- 影响链标注 \`闭合\` 且二级传递可复核
`;
}

function agentTester(p) {
  const testCmd = p.test_framework.runner_command || p.manifest.test_commands[0] || '未配置';
  return `---
name: tester
description: Quality assurance for ${p.project}, framework: ${p.test_framework.framework || 'unknown'}
tools: Read, Grep, Glob, Bash
---

# tester — 质量保证

> **口诀：先·覆·断。** 测试先行（先），覆盖正常/边界/异常/回归（覆），Gate 阻断不放行（断）。

## 项目上下文

- **测试框架**: ${p.test_framework.framework || '未配置'}
- **运行命令**: \`${testCmd}\`

## 双 Gate 模型

| Gate | 阻断口令 | 条件 |
|------|---------|------|
| Gate A | \`skip-gate-a\` | 04 不存在 → 阻编码 |
| Gate B | \`gate-b-limit\` | ≤2 轮修复 |

## 用例规则

1. 命名："should [预期] when [条件]"
2. Mock 外部依赖，不 mock 内部模块
3. 每故事至少一条主操作流

## 生效标志

- 04 §1.1 覆盖矩阵：每 FP ≥3 类
- §6 Gate A 交接信号四项齐备
- 07 §6 Gate B 评估全部达标
`;
}

function agentReporter(p) {
  return `---
name: reporter
description: Process reports for ${p.project}
tools: Read, Grep, Glob
---

# reporter — 过程报告与知识策展

> **口诀：记·引·串。** 记发生过的事（记），每条结论附引用（引），三报告交叉对齐（串）。

## 规则

1. 过程报告：不扭曲实际路径，不编造失败/建议
2. 证据标准：Level A/B 或标注 Level C；Level D 视为幻觉
3. 交叉引用闭合：报告必须互引一致

## 生效标志

- 报告版本行/关联文档/评审清单三项齐备
- 任一断言可指向 git diff 或测试输出
- Gate B 评审清单全 ✅
`;
}

function agentSecurity(p) {
  const sec = p.security_surface;
  const conditions = [];
  if (sec.user_input) conditions.push('- 涉及用户输入（表单/URL 参数/上传/富文本）');
  if (sec.api_exposure) conditions.push('- 调用外部 API 或暴露 API');
  if (sec.auth) conditions.push('- 含认证/授权/会话/凭据');
  if (sec.data_storage) conditions.push('- 数据持久化（DB/缓存/localStorage/文件）');
  if (sec.third_party) conditions.push('- 第三方集成（脚本/iframe/SDK）');
  if (conditions.length === 0) conditions.push('- 当前项目无显著安全面，按通用规则审查');

  const dims = [];
  if (sec.user_input) dims.push('| Injection | XSS、命令注入、SQL 注入、路径穿越 |');
  if (sec.auth) dims.push('| Auth | 越权、提权、会话固定、Token 处理 |');
  if (sec.data_storage) dims.push('| Data | 敏感数据暴露、不安全存储、日志泄露 |');
  if (sec.third_party || sec.api_exposure) dims.push('| Integrity | CSP、SRI、签名校验 |');
  if (dims.length === 0) dims.push('| General | 密钥硬编码、依赖漏洞、配置暴露 |');

  return `---
name: security
description: Security expert for ${p.project} — threat modeling
tools: Read, Grep, Glob
---

# security — 安全专家

> **口诀：建·注·卡。** 威胁建模（建），约束注入任务（注），P0 卡住发布（卡）。

## 项目安全面

已识别：${sec.signals.join(' · ') || '无显著安全面'}

## 注入条件

${conditions.join('\n')}

## 审查维度

| 维度 | 检查点 |
|------|--------|
${dims.join('\n')}

## 规则

1. 威胁建模不遗漏已识别的安全面
2. 硬编码第三方域无 integrity → P0
3. 密钥/Token 出现在源码或落盘文件 → P0
4. P0 必须阻断交付，不可降级

## 生效标志

- §3 安全约束 + §4 安全任务有对应 AC/测试用例覆盖
- P0 安全发现关联到代码 commit 或显式阻断标记
`;
}

function agentSelfImprove(p) {
  return `---
name: self-improve
description: Self-improvement pipeline for ${p.project}
tools: Read, Grep, Glob, Bash
---

# self-improve — 自改进管线

> **口诀：采·断·出。** 采数据（采），按 D0–D7 出诊断（断），每诊断写一条提案（出）。

## 诊断规则 D0–D7

| # | 信号 | 阈值 |
|---|------|------|
| D0 | 执行与基线冲突 | ≥1 条记忆 |
| D1 | 阻断率 | > 20% |
| D2 | P0 密度 | > 均值 2× |
| D3 | T3 占比 | > 30% |
| D4 | Gate B 轮次 | > 2 |
| D5 | 阶段耗时 | > 均值 3× |
| D6 | 连续退化 | 2 窗口 |
| D7 | 提案闭合率 | < 50% |

## 规则

1. 提案必须有 snapshot 证据支撑
2. \`proposals.jsonl\` append-only
3. \`no-metrics\` 降级不阻断交付

## 生效标志

- 08 §0 基线校准表覆盖三类基线
- §2 诊断决策表 D1–D5 全部判定
- §5 评审清单 8 项全 ✅
`;
}


// ── Rules ──────────────────────────────────────────────────────

function rules(p) {
  const out = {};
  out['code-pipeline.md'] = ruleCodePipeline(p);
  out['delivery-gate.md'] = ruleDeliveryGate(p);
  out['doc-generation.md'] = ruleDocGeneration(p);
  out['self-improve.md'] = ruleSelfImprove(p);
  out['rui-claude.md'] = ruleRuiClaude(p);
  return out;
}

function ruleCodePipeline(p) {
  const gateANote = p.type === 'meta' ? '元项目可跳过 Gate A（配置变更）' : '单行 CSS/文案变更可跳过 Gate A';
  const gateBReports = p.story_defaults.required_files
    .filter(f => ['05','06','07'].includes(f))
    .map(f => f === '05' ? '05-后端实施' : f === '06' ? '06-前端实施' : '07-测试报告');

  return `---
paths:
  - "**/*.{js,ts,jsx,tsx,vue,py,go,rs,java,rb,php}"
---

# code-pipeline

> **口诀：分支隔、测先行、模块清、闭环验。** 源码改动只走 \`/rui code\`。

## 适用

${p.project} 源码改动（${p.type_label}）。

## 规则

### 分支隔

1. 功能分支从 main/master 创建，命名 \`feat/${p.project}-<name>\`
2. 改动源码前必须已切到该分支（\`no-checkout\`）
3. 禁止自动合并到主干（\`auto-merge\`）

### 测先行（Gate A）

4. 04-测试用例评审.md 不存在，不得编码（\`skip-gate-a\`）
5. 例外：${gateANote}

### 模块清

6. 逐模块编码：每模块完成后审查 P0/P1/P2，**P0 不清零不进下一模块**
7. 影响链未闭合不声称闭合（\`chain-broken\`）

### 闭环验（Gate B）

8. 五步：环境快照 → 静态预检 → 设计/实现对齐 → 单次执行 → 报告（${gateBReports.join('/')})
9. 修复 ≤ 2 轮，超过阻断（\`gate-b-limit\`）
10. 自改进必须产出 08

## 阻断标识

| 标识 | 触发 |
|------|------|
| \`no-checkout\` | 未切换故事分支即改源码 |
| \`auto-merge\` | 功能分支被自动合并 |
| \`skip-gate-a\` | Gate A 未通过即编码 |
| \`chain-broken\` | 影响链未闭合 |
| \`gate-b-limit\` | Gate B > 2 轮 |
`;
}

function ruleDeliveryGate(p) {
  return `---
paths:
  - "docs/故事任务面板/**/.memory/rui-state.json"
  - "docs/故事任务面板/**/*.md"
---

# delivery-gate

> **口诀：标记即证据。** 三步交付按序执行，每步必标记。

## 适用

${p.project} 每个 \`/rui\` 命令的末端。

## 三步管线

| # | 操作 | 标记 |
|---|------|------|
| 1 | 追加日志 | \`log_appended\` |
| 2 | 文档同步 | \`docs_synced\` |
| 3 | 发送通知 | \`notification_sent\` |

## 规则

1. 标记即证据：未标记视为未执行
2. 顺序强制：三步严格按序
3. \`API_X_TOKEN\` 仅从环境变量读取，禁止写入文件
4. 缺 Token → \`no-token\` 降级，跳过推送但仍标记
`;
}

function ruleDocGeneration(p) {
  const docTypes = ['故事'];
  if (p.type === 'frontend' || p.type === 'fullstack') docTypes.push('组件', '页面');
  if (p.type === 'backend' || p.type === 'fullstack' || p.type === 'meta') docTypes.push('接口', '领域');

  return `---
paths:
  - "docs/**/*.md"
---

# doc-generation

> **口诀：版头齐、目录清、证据足、裁剪准。**

## 适用

${p.project} 所有 \`docs/\` 下的产出。文档类型：${docTypes.join(' · ')}。

## 规则

1. 版本行必填：\`v{版本} | {YYYY-MM-DD} | {模型} | {分支}\`
2. 证据：A/B 可写入；C 标 \`> 待补充\`；D 禁止
3. 不编造未验证的模块名/接口/路径
4. 裁剪：T1 仅变更章节；T2 目标+下游；T3 全级联刷新
`;
}

function ruleSelfImprove(p) {
  return `---
paths:
  - "docs/故事任务面板/**/.improvement/**"
  - "docs/故事任务面板/**/.memory/**"
---

# self-improve

> **口诀：有据才发、对基线断、单次不阻。**

## 适用

${p.project} 每个故事走完管线后产出 08-自改进复盘.md。

## 规则

1. 提案必须有 snapshot 证据支撑
2. \`proposals.jsonl\` append-only
3. 效果评估需前后各 ≥ 3 条记忆
4. \`no-metrics\` 降级不阻断交付
5. 诊断以基线文件为判定基准
`;
}

function ruleRuiClaude(p) {
  return `---
paths:
  - ".claude/**"
---

# rui-claude

> 操作范围限定在 \`.claude/\` 目录。

## 规则

1. 所有变更限定在 \`.claude/\` 范围
2. sync 拉取远端最新
3. retro 健康复盘
4. history 操作回溯
5. 不修改 \`.claude/\` 范围外的文件
`;
}

// ── Formulas ───────────────────────────────────────────────────

function formulas(p) {
  const isFE = p.type === 'frontend';
  const isBE = p.type === 'backend';

  let content = `# 故事文档公式

> **口诀：公式即合约、信模型生成、不写占位符。**
>
> **项目**: ${p.project} · ${p.type_label} · 骨架: ${p.story_defaults.skeleton}
> **必选文件**: ${p.story_defaults.required_files.join('/')} · **跳过**: ${p.story_defaults.skip_files.join('/') || '无'}

## 通用元素

- **F.meta**: \`> | v{version} | {YYYY-MM-DD} | {model} | 🌿 {branch} |\`
- **F.nav**: \`> **导航**: [← prev] · [↑ 索引] · [next →]\`
- **F.evidence**: A=已验证 | B=可推导 | C=未验证(\`> 待补充\`) | D=禁止

---

## 故事主线公式

### F.story.01 — 01-故事任务.md

**公式**: \`meta + 角色公式速查 + Story×N + (§6 改进? + §7 架构演进?)\`

角色公式速查:
- PM: \`作为 [角色] 我想要 [动作] 以便 [价值]\`
- Tester: \`Given [前置] When [操作] Then [预期]\`
- Coder: \`${p.coder_formula.text}\`
- Security: \`威胁 → 信任边界 → 缓解\`

`;

  if (!isFE) content += `### F.story.02 — 02-后端技术评审.md

**公式**: \`meta + nav + 服务架构 + API + 数据模型 + 安全 + 性能 + 评审清单\`

`;
  if (!isBE) content += `### F.story.03 — 03-前端技术评审.md

**公式**: \`meta + nav + 组件架构 + 状态 + 交互 + 样式 + DOM + 依赖 + 评审清单\`

`;

  content += `### F.story.04 — 04-测试用例评审.md

**公式**: \`meta + nav + 测试范围 + 用例×4类 + 环境专项 + Gate A 交接信号\`

`;
  if (!isFE) content += `### F.story.05 — 05-后端实施报告.md

**公式**: \`meta + nav + 实施总结 + 偏差 + P0审查 + 评审清单\`

`;
  if (!isBE) content += `### F.story.06 — 06-前端实施报告.md

**公式**: \`meta + nav + 实施总结 + 偏差 + P0审查 + 评审清单\`

`;

  content += `### F.story.07 — 07-测试用例报告.md

**公式**: \`meta + nav + 测试环境 + 冒烟 + 回归 + 已知问题 + Gate B 评估 + 评审清单\`

### F.story.08 — 08-自改进复盘.md

**公式**: \`meta + nav + 基线校准 + 观察 + 诊断 + 改进 + 经验沉淀 + 评审清单\`

## 使用约定

1. 按文件公式逐章节产出
2. 裁剪：T1 仅写变更章节；T2 同步影响章节；T3 全文重生
3. 校验：F.meta + F.nav 占位符必须替换；表列必须齐
`;
  return content;
}

// ── Coder Handbook ─────────────────────────────────────────────

function coderHandbook(p) {
  const isFE = p.type === 'frontend';
  const isBE = p.type === 'backend';

  let tree = `docs/\n├── 故事任务面板/${p.project}/<name>/   ← 执行\n`;
  if (!isBE) tree += `├── 组件文档/${p.project}/<component>/  ← 参考\n`;
  if (!isFE) tree += `└── 接口文档/${p.project}/<resource>/   ← 参考\n`;

  let skeleton = `| 01-故事任务.md | ✓ | pm | 文档生成 |\n`;
  if (!isFE) skeleton += `| 02-后端技术评审.md | ✓ | coder + security | 文档生成 |\n`;
  if (!isBE) skeleton += `| 03-前端技术评审.md | ✓ | coder | 文档生成 |\n`;
  skeleton += `| 04-测试用例评审.md | ✓ | tester | 文档生成 |\n`;
  if (!isFE) skeleton += `| 05-后端实施报告.md | ✓ | coder | 验证 |\n`;
  if (!isBE) skeleton += `| 06-前端实施报告.md | ✓ | coder | 验证 |\n`;
  skeleton += `| 07-测试用例报告.md | ✓ | tester | 验证 |\n| 08-自改进复盘.md | ✓ | self-improve | 自改进 |`;

  return `# coder 工作手册

> **口诀：知目录、循公式、明数据。**
>
> **项目**: ${p.project} · ${p.type_label} · 公式: ${p.coder_formula.text}

## 文档目录

\`\`\`
${tree}\`\`\`

## 故事目录骨架

| 文件 | 必选 | 负责人 | 阶段 |
|------|:---:|--------|------|
${skeleton}

## 完整度判定

| 状态 | 条件 |
|------|------|
| not_started | 故事任务不存在 |
| docs_in_progress | 故事任务存在，必选文档有缺失 |
| docs_done | 所有必选文档存在 |
| code_in_progress | 文档齐全 + 部分实施报告 |
| code_done | 所有必选文件 + 自改进复盘存在 |
| blocked | rui-state.json 中 blocked=true |

## 数据契约

| 文件 | 写入规则 |
|------|---------|
| execution-memory.jsonl | append-only |
| proposals.jsonl | append-only |
| rui-state.json | 覆盖写 |
`;
}

// ── Core Docs ──────────────────────────────────────────────────

function architectureStory(p) {
  const date = new Date().toISOString().split('T')[0];
  const techStack = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : p.type_label;

  const topologies = {
    frontend: `\`\`\`mermaid
flowchart TB
    User([用户]) --> UI[UI 层] --> State[状态管理] --> API[API 调用层] --> External([外部服务])
\`\`\``,
    backend: `\`\`\`mermaid
flowchart TB
    Client([客户端]) --> Router[路由层] --> Service[服务层] --> Repo[数据访问层] --> DB[(存储)]
\`\`\``,
    fullstack: `\`\`\`mermaid
flowchart TB
    User([用户]) --> FE[前端] --> |API 契约| BE[后端] --> Store[(存储)]
\`\`\``,
  };
  const topology = topologies[p.type] || `\`\`\`mermaid
flowchart TB
    Entry([入口]) --> Core[核心模块] --> Ext[扩展/插件]
\`\`\``;

  return `# ${p.project} 架构故事

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 一句话

${p.project} 是一个 ${p.type_label} 项目（${p.architecture.pattern}），技术栈 ${techStack}。

## 系统拓扑

${topology}

## 模块全景

| 维度 | 内容 |
|------|------|
| 项目类型 | ${p.type_label} |
| 架构模式 | ${p.architecture.pattern} |
| 技术栈 | ${techStack} |
| 构建 | ${p.manifest.build_commands.join(' · ') || '无'} |
| 测试 | ${p.test_framework.framework || '未配置'} |
| 安全面 | ${p.security_surface.signals.join(' · ') || '无显著安全面'} |

## 演进方向

> 待补充。随故事推进，在此记录架构演进决策。

| 时间 | 决策 | 原因 | 影响范围 |
|------|------|------|---------|
| ${date} | 初始化基线 | rui init | 全局 |
`;
}

function coreInterfaceDoc(apis, p) {
  const date = new Date().toISOString().split('T')[0];
  const ranked = apis.slice(0, 5);
  const table = ranked.map((api, i) => {
    const pri = i < 2 ? '⭐ 高' : (i < 4 ? '◆ 中' : '○ 低');
    return `| ${api.name} | \`${api.basePath || '/'}\` | \`${api.path}\` | ${pri} |`;
  }).join('\n');

  return `# ${p.project} 核心接口文档【推荐的】

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 说明

以下接口由源码扫描自动发现，按业务重要性排序推荐。⭐ 高优先级建议优先文档化。

## 推荐接口清单

| 接口名 | Base Path | 源码位置 | 推荐优先级 |
|--------|-----------|---------|-----------|
${table}

## 下一步

\`\`\`bash
/rui doc --from-code ${ranked[0]?.name || '<接口名>'}   # 为核心接口生成详细文档
\`\`\`
`;
}

function coreComponentDoc(components, p) {
  const date = new Date().toISOString().split('T')[0];
  const ranked = components.sort((a, b) => b.fileCount - a.fileCount).slice(0, 5);
  const table = ranked.map((comp, i) => {
    const pri = i < 2 ? '⭐ 高' : (i < 4 ? '◆ 中' : '○ 低');
    return `| ${comp.name} | \`${comp.path}\` | ${comp.fileCount} | ${pri} |`;
  }).join('\n');

  return `# ${p.project} 核心组件文档【推荐的】

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 说明

以下组件由源码扫描自动发现，按复杂度排序推荐。⭐ 高优先级建议优先文档化。

## 推荐组件清单

| 组件名 | 路径 | 文件数 | 推荐优先级 |
|--------|------|--------|-----------|
${table}

## 下一步

\`\`\`bash
/rui doc --from-code ${ranked[0]?.name || '<组件名>'}   # 为核心组件生成详细文档
\`\`\`
`;
}

function coreModuleDoc(modules, p) {
  const date = new Date().toISOString().split('T')[0];
  const table = modules.map((mod, i) => {
    const pri = i < 2 ? '⭐ 高' : (i < 4 ? '◆ 中' : '○ 低');
    return `| ${mod.name} | ${mod.type || 'module'} | \`${mod.path}\` | ${pri} |`;
  }).join('\n');

  return `# ${p.project} 核心组件文档【推荐的】

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 说明

以下模块由源码扫描自动发现，按重要性排序推荐。⭐ 高优先级建议优先文档化。

## 推荐模块清单

| 模块名 | 类型 | 路径 | 推荐优先级 |
|--------|------|------|-----------|
${table}

## 下一步

\`\`\`bash
/rui doc --from-code ${modules[0]?.name || '<模块名>'}   # 为核心模块生成详细文档
\`\`\`
`;
}

// ── Config ─────────────────────────────────────────────────────

function mcpConfig() {
  return JSON.stringify({ mcpServers: {} }, null, 2) + '\n';
}

function settings(p) {
  const s = { _doc: `${p.project} 项目权限配置。rui init 生成。`, permissions: { allow: [], deny: [] } };
  if (p.manifest.ecosystems.includes('node')) s.permissions.allow.push('npm run *', 'npx *');
  if (p.manifest.ecosystems.includes('python')) s.permissions.allow.push('pytest *', 'python *');
  if (p.manifest.ecosystems.includes('rust')) s.permissions.allow.push('cargo *');
  if (p.manifest.ecosystems.includes('go')) s.permissions.allow.push('go *');
  return JSON.stringify(s, null, 2) + '\n';
}

// ── Exports ────────────────────────────────────────────────────

module.exports = {
  claudeMd,
  readmeMd,
  agents,
  rules,
  formulas,
  coderHandbook,
  architectureStory,
  coreInterfaceDoc,
  coreComponentDoc,
  coreModuleDoc,
  mcpConfig,
  settings,
};
