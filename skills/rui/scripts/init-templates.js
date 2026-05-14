#!/usr/bin/env node

// init-templates.js — init 产物模板（纯数据，无副作用）
//
// 职责：接收 profile 对象，返回文件内容字符串。
// 只含 init.js 实际调用的三个函数：claudeMd / readmeMd / architectureStoryFiles。
// 遵循 CLAUDE.md「留核心」——最可靠的模块是没有模块。

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

> 以下由 \`rui init\` 根据项目画像自动生成。每次 \`rui init\` 全量重生。

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

function readmeMd(p) {
  const techList = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : p.type_label;
  const ecoList = p.manifest.ecosystems.join(' · ') || '未识别';
  const capDesc = { frontend: '前端组件驱动开发', backend: '后端领域驱动开发', fullstack: '全栈端到端开发', meta: '插件/配置系统开发' }[p.type] || '通用软件开发';

  return `# ${p.project}

> 故事驱动的 SDLC 编排系统。${capDesc}，${p.coder_formula.focus}。

- **项目类型** — ${p.type_label}（${p.architecture.pattern}）
- **技术栈** — ${techList}
- **生态** — ${ecoList}
- **基础** — 三条公理推导全部行为准则，详见 [CLAUDE.md](./CLAUDE.md)

## 快速开始

\`\`\`bash
/rui init                    # 建立项目基线（CLAUDE.md + README.md + 架构故事）
/rui doc "需求描述"           # 拆需求为故事
/rui code <story-name>       # 实现故事
/rui                         # 任务推荐
\`\`\`

## 项目结构

| 目录/文件 | 职责 | 生成方式 |
|-----------|------|---------|
| \`CLAUDE.md\` | 哲学基础 + 项目约束 | rui init 全量重生 |
| \`README.md\` | 系统视图 + 项目画像 | rui init 全量重生 |
| \`docs/故事任务面板/架构故事/\` | 系统架构全景文档 | rui init 全量重生 |
| \`docs/故事任务面板/\` | 故事产出 | rui doc/code 生成 |
| \`agents/\` | 角色契约 | 手动维护 |
| \`rules/\` | 跨场景约束 | 手动维护 |
| \`skills/\` | 技能定义 + 脚本 | 手动维护 |

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
- [rules/](./rules/) — 规则细节
- [agents/](./agents/) — 角色边界
- [skills/rui/formulas.md](./skills/rui/formulas.md) — 文档公式
- [skills/rui/coder.md](./skills/rui/coder.md) — Coder 手册
`;
}

// ── 架构故事 ───────────────────────────────────────────────────

function architectureStoryFiles(p) {
  const date = new Date().toISOString().split('T')[0];
  const techStack = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : p.type_label;
  const ecosystems = p.manifest.ecosystems.join(' · ') || '未识别';
  const files = {};

  files['01-系统概述.md'] = `# 系统概述

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 一句话

${p.project} 是一个 ${p.type_label} 项目（${p.architecture.pattern}），技术栈 ${techStack}，生态 ${ecosystems}。

## 项目画像

| 维度 | 内容 | 来源 |
|------|------|------|
| 项目类型 | ${p.type_label} | 源码扫描 |
| 架构模式 | ${p.architecture.pattern} | ${p.architecture.signals.join('；') || '默认'} |
| 技术栈 | ${techStack} | 清单文件 |
| 生态 | ${ecosystems} | 清单文件 |
| 构建 | ${p.manifest.build_commands.join(' · ') || '无'} | 清单文件 |
| 测试 | ${p.test_framework.framework || '未配置'} · \`${p.test_framework.runner_command || '无'}\` | 配置文件 |
| CI/CD | ${p.ci_config.provider || '未配置'} | ${p.ci_config.config_file || '—'} |
| 安全面 | ${p.security_surface.signals.join(' · ') || '无显著安全面'} | 源码扫描 |
| Coder 公式 | ${p.coder_formula.text} | 类型推断 |
`;

  const topologies = {
    frontend: `\`\`\`mermaid
flowchart TB
    User([用户]) --> UI[UI 层<br/>组件树] --> State[状态管理] --> API[API 调用层] --> External([外部服务])
\`\`\``,
    backend: `\`\`\`mermaid
flowchart TB
    Client([客户端]) --> Router[路由层] --> Controller[控制器] --> Service[服务层] --> Repo[数据访问层] --> DB[(存储)]
\`\`\``,
    fullstack: `\`\`\`mermaid
flowchart TB
    User([用户]) --> FE[前端<br/>组件 + 状态] -->|API 契约| BE[后端<br/>路由 + 服务] --> Store[(存储)]
    BE --> Ext([第三方])
\`\`\``,
    meta: `\`\`\`mermaid
flowchart TB
    Entry([入口命令]) --> Core[核心模块<br/>Skills] --> Scripts[脚本层]
    Core --> Config[配置层<br/>Agents + Rules]
    Scripts --> Output([产物输出])
\`\`\``,
  };

  let moduleTable = '';
  if (p.type === 'meta') {
    moduleTable = `\n## 模块清单\n\n| 模块 | 职责 | 路径 |\n|------|------|------|\n| skills/rui | 故事 SDLC 编排核心 | \`skills/rui/\` |\n| skills/rui-claude | .claude 配置管理 | \`skills/rui-claude/\` |\n| agents | Agent 角色定义 | \`agents/\` |\n| rules | 规则定义 | \`rules/\` |\n`;
  }

  files['02-系统拓扑.md'] = `# 系统拓扑

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 架构图

${topologies[p.type] || topologies.meta}
${moduleTable}`;

  const dataFlows = {
    frontend: `## 主数据流

\`\`\`
用户操作 → 组件事件 → 状态变更 → API 请求 → 响应渲染
\`\`\`

### 状态流向

1. 用户在 UI 层触发事件
2. 事件处理器更新本地/全局状态
3. 状态变更触发视图重渲染
4. 需要持久化时发起 API 请求
5. 响应数据回写状态，驱动 UI 更新`,
    backend: `## 主数据流

\`\`\`
请求 → 路由匹配 → 中间件链 → 控制器 → 服务逻辑 → 数据访问 → 响应
\`\`\`

### 请求生命周期

1. 客户端发起 HTTP 请求
2. 路由层匹配到对应 Handler
3. 中间件链执行（认证、日志、限流）
4. 控制器解析参数，调用服务层
5. 服务层执行业务逻辑
6. 数据访问层读写存储
7. 响应序列化返回客户端`,
    fullstack: `## 主数据流

\`\`\`
用户操作 → 前端状态 → API 契约 → 后端服务 → 数据存储 → 响应回传 → UI 更新
\`\`\`

### 前后端交互

1. 前端组件触发用户意图
2. 状态层决定是否需要后端数据
3. 通过 API 契约发起请求
4. 后端路由 → 服务 → 存储
5. 响应按契约格式返回
6. 前端状态更新，驱动 UI`,
    meta: `## 主数据流

\`\`\`
入口命令 → 探测项目 → 模板渲染 → 产物写入 → 验证闭环
\`\`\`

### 执行流程

1. 用户通过命令入口触发
2. 探测器扫描项目结构，生成 profile
3. 模板引擎根据 profile 渲染产物内容
4. 写入器将产物落盘
5. 验证器检查产物完整性`,
  };

  files['03-数据流.md'] = `# 数据流

> | v0.1.0 | ${date} | rui init | 🌿 main |

${dataFlows[p.type] || dataFlows.meta}
`;

  if (p.security_surface.signals.length > 0) {
    const secRows = p.security_surface.signals.map(s => `| ${s} | 需在架构层面防护 | P0 |`).join('\n');
    files['04-安全边界.md'] = `# 安全边界

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 已识别安全面

| 安全面 | 影响 | 防护要求 |
|--------|------|----------|
${secRows}

## 不可妥协底线

${p.security_surface.auth ? '- **认证不可绕过** — 涉及 auth/token/session，任何绕过路径为 P0\n' : ''}${p.security_surface.user_input ? '- **输入必须校验** — 用户输入点已识别，XSS/注入防护为 P0\n' : ''}${p.security_surface.data_storage ? '- **存储必须安全** — 数据持久化已识别，敏感数据加密/脱敏为 P0\n' : ''}${p.security_surface.api_exposure ? '- **API 必须鉴权** — 暴露接口已识别，未鉴权端点为 P0\n' : ''}- **密钥不落盘** — Token/密钥/凭据禁止出现在源码或配置文件
`;
  }

  const decisions = [];
  decisions.push(`| ${date} | 初始化基线 | rui init | 全局 |`);
  if (p.architecture.pattern !== 'single') decisions.push(`| ${date} | 架构模式: ${p.architecture.pattern} | ${p.architecture.signals.join('；') || '项目结构'} | 全局 |`);
  if (p.test_framework.framework) decisions.push(`| ${date} | 测试框架: ${p.test_framework.framework} | 项目已配置 | 测试层 |`);
  if (p.ci_config.provider) decisions.push(`| ${date} | CI/CD: ${p.ci_config.provider} | ${p.ci_config.config_file} | 部署层 |`);

  files['05-架构决策.md'] = `# 架构决策记录

> | v0.1.0 | ${date} | rui init | 🌿 main |

## 决策日志

| 时间 | 决策 | 原因 | 影响范围 |
|------|------|------|---------|
${decisions.join('\n')}

## 演进方向

> 随故事推进，在此记录架构演进决策。
`;

  return files;
}

// ── Exports ────────────────────────────────────────────────────

module.exports = { claudeMd, readmeMd, architectureStoryFiles };
