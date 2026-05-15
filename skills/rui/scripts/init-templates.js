#!/usr/bin/env node

// init-templates.js — init 产物模板（纯数据，无副作用）
//
// 职责：接收 profile 对象，返回文件内容字符串。
// 遵循「留核心」——最可靠的模块是没有模块。

'use strict';

// ── CLAUDE.md 项目约束段 ───────────────────────────────────────

/**
 * 生成 CLAUDE.md 中 <!-- rui:project-start --> ... <!-- rui:project-end --> 段落。
 * 如果 CLAUDE.md 不存在，生成完整文件（含基础信念 + 项目约束）。
 */
function claudeMdProjectSection(p) {
  const bottomLines = [];
  if (p.security_surface.auth) {
    bottomLines.push('- **认证不可绕过** — 涉及 auth/token/session，任何绕过路径为 P0');
  }
  bottomLines.push('- **密钥不落盘** — Token/密钥/凭据禁止出现在源码或配置文件');
  if (p.security_surface.user_input) {
    bottomLines.push('- **输入必校验** — 用户输入必须经过验证/转义，XSS/注入为 P0');
  }
  if (p.security_surface.data_storage) {
    bottomLines.push('- **数据不裸存** — 敏感数据加密存储，明文落盘为 P0');
  }

  return `<!-- rui:project-start -->
## 项目约束

### 项目不可妥协底线

${bottomLines.join('\n')}
<!-- rui:project-end -->`;
}

/**
 * 生成完整 CLAUDE.md（当文件不存在时使用）。
 */
function claudeMdFull(p) {
  return `# CLAUDE.md

> 三公理推导一切——基础信念是 why，工作原则是设计约束，执行准则是日常动作。读完此文件，应能说出每个动作背后的那条公理。

## 基础信念

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

**思先于码。** 陈述假设，呈现权衡。不确定就停，问。

**最少代码。** 只解决这个问题。不请自来的功能、单次抽象、不可能场景的错误处理——不写。

**精确修改。** 只动必须动的。改动不留残余。每行改动可追溯到请求。

**目标驱动。** 先写失败测试再通过。"看起来没问题"等于没做。

**完成通知。** 做完或卡住都同步状态。沉默比失败更危险。**rui 管线必须触发 import-docs 文档同步 + wework-bot 通知，未触发等于未完成。**

**表达优先：图 → 结构化文本 → 表。**

**生效标志由各 agent 自定义。**

## 退化对策

类型、合约、运行结果是可见的——它们自己就在说话。规则是最后手段，因为规则本身也消耗注意力。

${claudeMdProjectSection(p)}

## 自约束

- **更短优先。** 本文件应比它指导的任何文件更短。
- **预算上限。** 公理数量 / 原则数量 / 准则数量——这是上限，不是下限。
- **增长触发审视。** 如果它增长了，说明某条推导失效了，或某层在做下一层的事。
`;
}

// ── 故事目录骨架文档 ───────────────────────────────────────────

/**
 * 生成故事目录下的全套骨架文档内容。
 * @param {object} p - profile
 * @returns {Array<{filename: string, content: string}>}
 */
function projectSnapshot(p) {
  const secList = p.security_surface.signals.length ? p.security_surface.signals.join(' · ') : '无显著安全面';
  const ecoList = p.manifest.ecosystems.length ? p.manifest.ecosystems.join(' · ') : '未识别';
  return `## 项目快照

\`\`\`mermaid
flowchart LR
    P[${p.project}]:::project --> T[${p.type_label}]:::type
    T --> A[${p.architecture.pattern}]:::arch
    A --> S[安全面<br/>${secList}]:::sec
    A --> E[${ecoList}]:::eco
    classDef project fill:#e3f2fd,stroke:#1565c0;
    classDef type fill:#fff3e0,stroke:#e65100;
    classDef arch fill:#e8f5e9,stroke:#2e7d32;
    classDef sec fill:#ffebee,stroke:#c62828;
    classDef eco fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

**${p.project}** 是一个 ${p.type_label} 项目（${p.architecture.pattern} 架构），基于 ${ecoList} 生态构建。安全面涉及 ${secList}。

| 维度 | 值 |
|------|-----|
| 项目 | ${p.project} |
| 类型 | ${p.type_label} |
| 架构 | ${p.architecture.pattern} |
| 技术栈 | ${p.manifest.tech_stack.join(' · ') || '未识别'} |
| 生态 | ${ecoList} |
| 构建 | ${p.manifest.build_commands.join(' · ') || '无'} |
| 测试框架 | ${p.test_framework.framework || '未配置'} |
| 测试命令 | ${p.manifest.test_commands.join(' · ') || '无'} |
| 安全面 | ${secList} |
| Coder 公式 | ${p.coder_formula.text} |
`;
}

function storySkeletonDocs(p) {
  const docs = [];
  const required = p.story_defaults.required_files;
  const secItems = p.security_surface.signals.length ? p.security_surface.signals.map(s => `- ${s}`).join('\n') : '- 未检测到显著安全面';
  const techStack = p.manifest.tech_stack.length ? p.manifest.tech_stack.join(' · ') : '未识别';
  const deps = [...(p.manifest.dependencies.production || []), ...(p.manifest.dependencies.dev || [])].slice(0, 15).join(' · ') || '无';
  const arch = p.architecture.pattern;
  const buildCmd = p.manifest.build_commands.length ? p.manifest.build_commands.join(' · ') : '无构建命令';
  const testCmd = p.manifest.test_commands.length ? p.manifest.test_commands.join(' · ') : '无测试命令';
  const testFw = p.test_framework.framework || '未配置';
  const snap = projectSnapshot(p);

  if (required.includes('01')) {
    docs.push({ filename: '01-故事任务.md', content: `# 故事任务

> 由 pm agent 填充。此文件为故事唯一真相源。

${snap}
## 需求概述

<!-- 在此描述本故事要解决的具体需求 -->

## 验收标准 (AC)

<!-- AC 列表，每条可独立验证 -->

## 影响分析

<!-- 影响范围 + 证据 -->

## 任务拆分

<!-- 子任务列表 -->

## 约束与风险

${p.security_surface.signals.length ? `- 安全面: ${p.security_surface.signals.join(' · ')}` : ''}
- 底线: 认证不可绕过 · 密钥不落盘${p.security_surface.user_input ? ' · 输入必校验' : ''}${p.security_surface.data_storage ? ' · 数据不裸存' : ''}
` });
  }

  if (required.includes('02')) {
    docs.push({ filename: '02-后端技术评审.md', content: `# 后端技术评审

> 由 coder + security agent 填充。

${snap}
## 架构决策

<!-- 模块划分 / 接口设计 / 数据模型 -->

## 安全评审

**已检测安全面:**
${secItems}

<!-- 补充缓解措施 -->

## 依赖变更

**当前依赖:** ${deps}

<!-- 新增/升级/移除依赖 -->

## 构建与测试

- 构建: ${buildCmd}
- 测试框架: ${testFw}
- 测试命令: ${testCmd}
` });
  }

  if (required.includes('03')) {
    docs.push({ filename: '03-前端技术评审.md', content: `# 前端技术评审

> 由 coder agent 填充。

${snap}
## 组件设计

<!-- 组件树 / Props / Events / Expose -->

## 状态管理

<!-- 状态流 + 数据源 -->

## 交互规格

<!-- 关键交互流程 -->

## 依赖与工具

**当前依赖:** ${deps}

## 安全注意事项

${p.security_surface.user_input ? '- 用户输入需校验（XSS/注入）' : '- 无用户输入面'}
${p.security_surface.third_party ? '- 第三方调用需处理错误/超时' : ''}
` });
  }

  if (required.includes('04')) {
    docs.push({ filename: '04-测试用例评审.md', content: `# 测试用例评审

> 由 tester agent 填充。Gate A 前置条件。

${snap}
## 测试策略

<!-- 测试层级 + 覆盖目标 -->

## 用例列表

<!-- 用例表格 -->

## 边界条件

<!-- 边界 + 异常场景 -->

## 已知安全面

${secItems}
` });
  }

  if (required.includes('05')) {
    docs.push({ filename: '05-后端实施报告.md', content: `# 后端实施报告

> 验证阶段产出。Gate B 输入。

${snap}
## 实施摘要

<!-- 变更文件 + 行数统计 -->

## 测试结果

- 框架: ${testFw}
- 命令: ${testCmd}

<!-- 测试通过率 + 覆盖率 -->

## 遗留问题

<!-- 已知问题 + 技术债 -->
` });
  }

  if (required.includes('06')) {
    docs.push({ filename: '06-前端实施报告.md', content: `# 前端实施报告

> 验证阶段产出。Gate B 输入。

${snap}
## 实施摘要

<!-- 变更组件 + 页面 -->

## 视觉验证

<!-- 截图/对比 -->

## 遗留问题

<!-- 已知问题 + 技术债 -->
` });
  }

  if (required.includes('07')) {
    docs.push({ filename: '07-测试用例报告.md', content: `# 测试用例报告

> 由 tester agent 填充。Gate B 输入。

${snap}
## 执行结果

<!-- 通过/失败/跳过 统计 -->

## 失败用例

<!-- 失败详情 -->

## 覆盖率

<!-- 覆盖率数据 -->
` });
  }

  if (required.includes('08')) {
    docs.push({ filename: '08-自改进复盘.md', content: `# 自改进复盘

> 由 pm + reporter agent 填充。

${snap}
## 执行数据

<!-- 耗时 / 轮次 / 阻断 -->

## 诊断信号

<!-- D0-D7 诊断结果 -->

## 改进提案

<!-- 提案列表 -->
` });
  }

  // 00 消息通知列表（自动生成，hook 追加）
  docs.push({ filename: '00-消息通知列表.md', content: `# 消息通知列表

> 由 hook 自动追加，每条消息以时间戳分隔。

` });

  return docs;
}

// ── README.md ──────────────────────────────────────────────────

function readmeMd(p) {
  const techList = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : '未识别';
  const ecoList = p.manifest.ecosystems.join(' · ') || '未识别';
  const capDesc = { frontend: '前端组件驱动开发', backend: '后端领域驱动开发', fullstack: '全栈端到端开发', meta: '插件/配置系统开发' }[p.type] || '通用软件开发';
  const secList = p.security_surface.signals.join(' · ') || '无显著安全面';
  const testFw = p.test_framework.framework || '未配置';
  const buildCmd = p.manifest.build_commands.join(' · ') || '无';

  // Story skeleton based on project type
  const skeletonLines = [];
  skeletonLines.push('├── 01-故事任务.md              ← 唯一真相源（pm）');
  if (['backend', 'fullstack', 'meta'].includes(p.type)) {
    skeletonLines.push('├── 02-后端技术评审.md          ← coder + security');
  }
  if (['frontend', 'fullstack'].includes(p.type)) {
    skeletonLines.push('├── 03-前端技术评审.md          ← coder');
  }
  skeletonLines.push('├── 04-测试用例评审.md          ← tester');
  if (['backend', 'fullstack', 'meta'].includes(p.type)) {
    skeletonLines.push('├── 05-后端实施报告.md          ← 验证阶段');
  }
  if (['frontend', 'fullstack'].includes(p.type)) {
    skeletonLines.push('├── 06-前端实施报告.md          ← 验证阶段');
  }
  skeletonLines.push('├── 07-测试用例报告.md          ← tester');
  skeletonLines.push('├── 08-自改进复盘.md            ← pm + reporter');
  skeletonLines.push('├── 00-消息通知列表.md          ← 自动（hook）');
  skeletonLines.push('├── .memory/                    ← 管线状态 + 执行记忆');
  skeletonLines.push('└── .improvement/               ← 自改进提案');

  return `# ${p.project}

> ${capDesc}，${p.coder_formula.focus}。

\`\`\`mermaid
flowchart LR
    Init[rui init<br/>建立基线]:::cmd --> Doc[rui doc<br/>拆故事+文档]:::cmd
    Doc --> Code[rui code<br/>实现+验证]:::cmd
    Code --> Done[交付<br/>同步+通知]:::gate
    Init --> List[rui list<br/>进度全景]:::cmd
    Code --> Update[rui update<br/>增量更新]:::cmd
    Claude[/rui-claude<br/>管理 .claude/]:::claude --> Doc
    classDef cmd fill:#e3f2fd,stroke:#1565c0;
    classDef gate fill:#e8f5e9,stroke:#2e7d32;
    classDef claude fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

**${p.project}** 是一个 ${p.type_label} 项目（${p.architecture.pattern} 架构），基于 ${ecoList} 生态构建。安全面涉及 ${secList}。

| 维度 | 值 |
|------|-----|
| 项目类型 | ${p.type_label} |
| 架构 | ${p.architecture.pattern} |
| 管线 | 需求解析 → 文档生成 → Gate A 测试先行 → 实现 → Gate B 验证 → 自改进 → 交付 |
| Coder 公式 | ${p.coder_formula.text} |
| 安全面 | ${secList} |
| 不可妥协底线 | 认证不可绕过 · 密钥不落盘 · 输入必校验 |

## 快速开始

\`\`\`mermaid
flowchart LR
    A[1. rui init] --> B[2. rui doc] --> C[3. rui code] --> D[4. 交付]
    A -.已有基线.-> B
    B -.已有文档.-> C
    E[5. rui-claude<br/>管理 .claude/]:::claude -.端到端.-> B
    classDef claude fill:#f3e5f5,stroke:#6a1b9a;
\`\`\`

### 1. 建立基线

\`\`\`bash
/rui init
\`\`\`

扫描项目五类信号（类型 · 清单 · 安全面 · 测试框架 · 架构），按 profile 全量生成 CLAUDE.md 项目约束段、README.md、\`.claude/\`（agents/rules/skills）、故事面板目录及骨架文档。可重复运行。

\`\`\`bash
### 2. 拆需求为故事

\`\`\`bash
/rui doc "用户登录页面需要支持手机号+验证码登录"
/rui doc @requirements.md    # 从文件读取
/rui doc https://...         # 从 URL 读取
\`\`\`

pm agent 解析需求 → 自适应规划 → 影响分析 → 架构设计，生成故事文档基线（01-故事任务 · 04-测试用例评审）。随后指派 coder 按项目类型补齐设计文档：前端项目仅补 03-前端技术评审，后端项目仅补 02-后端技术评审，全栈项目两者均补。自动创建 \`feat/<Project>-<name>\` 分支隔离。

\`\`\`bash
/rui doc --from-code [name]   # 从源码反推文档（推荐存量项目首选）
\`\`\`

### 3. 实现故事

\`\`\`bash
/rui code YiWeb-user-login
\`\`\`

Gate A 测试先行 → 逐模块编码（P0 清零方进下一模块）→ Gate B 验证（修复 ≤2 轮）→ 自改进复盘。三步交付管线按序触发文档同步 + 通知。

\`\`\`bash
/rui code --from-doc YiWeb-user-login  # 从已有文档补全缺失文档（只读源码）
/rui update YiWeb-user-login           # 增量更新（T1/T2/T3 裁剪）
/rui update YiWeb-user-login --no-code # 仅文档，不改源码
\`\`\`

### 4. 查看与推荐

\`\`\`bash
/rui list                    # 进度全景，按文件存在性判定状态
/rui                         # 5 层链式管线评分排序，推荐下一步任务
\`\`\`

### 5. 管理 .claude/ 配置

\`\`\`bash
/rui-claude sync              # 从远端同步 .claude/（覆盖式更新）
/rui-claude retro             # 复盘分析本地 .claude/ 结构
/rui-claude history           # 查看同步历史
/rui-claude <需求>            # 修改 .claude/，走全管线端到端（doc → code → 交付）
\`\`\`

\`/rui-claude\` 操作仅限 \`.claude/\` 目录，禁止自动 commit/push，git 操作由开发者手动执行。\`<需求>\` 走完整 SDLC：pm 拆故事 → coder 补齐设计文档 → Gate A 测试先行 → 实现 → Gate B 验证 → 自改进 → 交付。

### 常用组合

| 场景 | 命令 |
|------|------|
| 全新项目起步 | \`/rui init\` → \`/rui doc <需求>\` → \`/rui code <name>\` |
| 已有基线，新需求 | \`/rui <需求>\`（端到端 doc + code 全自动串联） |
| 补文档（推荐） | \`/rui doc --from-code\` → 选 → 生；或 \`/rui doc --from-code <name>\` 直推 |
| 补代码 | \`/rui code --from-doc <name>\` |
| 小改动了 | \`/rui update <name> "修改描述"\` |
| 同步 .claude/ | \`/rui-claude sync\` |
| 复盘 .claude/ | \`/rui-claude retro\` |
| 看进度 | \`/rui list\` |
| 不知道做什么 | \`/rui\` |

## 项目结构

\`\`\`mermaid
flowchart TD
    Root[${p.project}/] --> Skills[skills/rui/<br/>命令面+公式+脚本]
    Root --> Agents[agents/<br/>6 角色契约]
    Root --> Rules[rules/<br/>5 跨场景约束]
    Root --> Docs[docs/故事任务面板/<br/>故事产出目录]
    Skills --> Formulas[formulas.md<br/>文档公式 F.story.*]
    Skills --> Coder[coder.md<br/>目录+数据契约]
    Skills --> Scripts[scripts/<br/>init·list·recommend·state·...]
\`\`\`

| 目录 | 内容 |
|------|------|
| \`skills/rui/\` | 命令面定义、文档公式、目录/数据契约、执行脚本 |
| \`agents/\` | pm · coder · tester · reporter · security · self-improve 角色契约 |
| \`rules/\` | code-pipeline · delivery-gate · doc-generation · self-improve · rui-claude |
| \`docs/故事任务面板/\` | 故事产出目录，每个故事独立子目录，含主线文档 + 附属数据 |

### 故事目录骨架

\`\`\`
docs/故事任务面板/<Project>/<name>/
${skeletonLines.join('\n')}
\`\`\`

## 管线一览

\`\`\`mermaid
flowchart LR
    A[需求解析] --> B[自适应规划] --> C[影响分析] --> D[架构设计] --> E[文档生成]
    E --> F[预检<br/>分支隔离] --> G[Gate A<br/>测试先行] --> H[实现] --> I[Gate B<br/>验证] --> J[自改进] --> K[交付]
    K --> K1[追加日志] --> K2[文档同步] --> K3[发送通知]
\`\`\`

每阶段产出对应编号文件（01–08），完成后三步交付管线按序触发 import-docs 文档同步 + wework-bot 通知。
`;
}

// ── wework-bot config.json ─────────────────────────────────────

function weworkBotConfig(p) {
  return JSON.stringify({
    default_robot: 'general',
    api_url: 'https://api.effiy.cn/wework/send-message',
    robots: {
      general: {
        webhook_url: 'YOUR_WEBHOOK_URL_HERE'
      }
    },
    agents: {
      rui: 'general'
    },
    _comment: '由 rui init 生成。请替换 YOUR_WEBHOOK_URL_HERE 为实际的企业微信机器人 webhook URL。'
  }, null, 2) + '\n';
}

// ── Exports ────────────────────────────────────────────────────

module.exports = { projectSnapshot, readmeMd, claudeMdProjectSection, claudeMdFull, storySkeletonDocs, weworkBotConfig };
