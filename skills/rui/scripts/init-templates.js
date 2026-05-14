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
  const techList = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : `${p.type_label}项目`;
  const buildCmd = p.manifest.build_commands.length > 0 ? p.manifest.build_commands.join(' · ') : '无构建命令';
  const testFw = p.test_framework.framework || '未检测到测试框架';
  const secSignals = p.security_surface.signals.length > 0 ? p.security_surface.signals.join(' · ') : '无显著安全面';
  const ciProvider = p.ci_config.provider || '未配置';
  const ecoList = p.manifest.ecosystems.join(' · ') || '未识别';
  const storyReq = p.story_defaults.required_files.map(n => {
    const names = { '01': '故事任务', '02': '后端评审', '03': '前端评审', '04': '测试评审', '05': '后端实施', '06': '前端实施', '07': '测试报告', '08': '自改进' };
    return `${n}-${names[n] || n}`;
  }).join('/');

  // 底线规则：根据安全面动态生成
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

> 以下由 \`rui init\` 根据项目画像自动生成。每次 \`rui init\` 全量重生。

| 维度 | 约束 | 来源 |
|------|------|------|
| 项目 | ${p.project} · ${p.type_label} · ${p.architecture.pattern} | 目录扫描 |
| 技术栈 | ${techList} | 类型推断 |
| 构建 | ${buildCmd} | — |
| 测试 | ${testFw} | — |
| 安全面 | ${secSignals} | 源码扫描 |
| CI/CD | ${ciProvider} | — |
| 生态 | ${ecoList} | 清单文件 |
| Coder 公式 | ${p.coder_formula.text} | 类型推断 |
| 故事骨架 | ${p.story_defaults.skeleton}（必选: ${storyReq}）| 类型推断 |

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

> **口诀：信模型，惜注意，验现实。**

**信模型 — 模型有能力判断。** 上下文中的模型能做出合理决策。检查清单不能替代思考。

**惜注意 — 上下文有限且退化。** 注意力是稀缺资源。不必要的信息挤掉必要的信息。

**验现实 — 现实是唯一裁判。** 没验证等于没做。"应该没问题"不可证伪。

> 公理冲突时优先级：**验现实 > 信模型 > 惜注意**。

## 工作原则

> **口诀：守底线，留核心，退一步，验为实，说清楚，称轻重。**

| 原则 | 服务公理 | 一句话 |
|------|---------|--------|
| **涌现** 守底线 | 信模型 | 只定不可妥协的底线，其余交给上下文 |
| **简化** 留核心 | 惜注意 | 删至必要——最可靠的模块是没有模块 |
| **消失** 退一步 | 惜注意 | 流程复杂度 ≤ 任务复杂度 |
| **校准** 验为实 | 验现实 | 没运行过的结论不作数 |
| **释义** 说清楚 | 惜注意 | 人看不懂，正确也没意义 |
| **对等** 称轻重 | 全部 | 投入与改动量、风险等级匹配 |

## 执行准则

> **口诀：思在前，码从简，改必准，测先行，毕则告，图为首，自定验。**

## 退化对策

> **口诀：先可见，后规则。**

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

  if (required.includes('01')) {
    docs.push({ filename: '01-故事任务.md', content: `# 故事任务

> 由 pm agent 填充。此文件为故事唯一真相源。

**项目:** ${p.project} | **类型:** ${p.type_label} | **架构:** ${arch}
**技术栈:** ${techStack}

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

**项目:** ${p.project} | **架构:** ${arch}
**技术栈:** ${techStack}
**依赖快照:** ${deps}

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

**项目:** ${p.project} | **架构:** ${arch}
**技术栈:** ${techStack}

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

**项目:** ${p.project} | **测试框架:** ${testFw}
**测试命令:** ${testCmd}

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

**项目:** ${p.project} | **架构:** ${arch}
**技术栈:** ${techStack}

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

**项目:** ${p.project} | **架构:** ${arch}
**技术栈:** ${techStack}

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

**项目:** ${p.project} | **测试框架:** ${testFw}

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

**项目:** ${p.project} | **类型:** ${p.type_label} | **架构:** ${arch}

## 执行数据

<!-- 耗时 / 轮次 / 阻断 -->

## 诊断信号

<!-- D0-D7 诊断结果 -->

## 改进提案

<!-- 提案列表 -->

## 项目画像快照

- 技术栈: ${techStack}
- 安全面: ${p.security_surface.signals.join(' · ') || '无'}
- 测试: ${testFw}
- CI/CD: ${p.ci_config.provider || '未配置'}
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
  const techList = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack.join(' · ') : p.type_label;
  const ecoList = p.manifest.ecosystems.join(' · ') || '未识别';
  const capDesc = { frontend: '前端组件驱动开发', backend: '后端领域驱动开发', fullstack: '全栈端到端开发', meta: '插件/配置系统开发' }[p.type] || '通用软件开发';

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

- **项目类型** — ${p.type_label}（${p.architecture.pattern}）
- **技术栈** — ${techList}
- **生态** — ${ecoList}

## 快速开始

\`\`\`bash
/rui init                    # 建立项目基线（README.md + 故事面板目录）
/rui doc "需求描述"           # 拆需求为故事
/rui code <story-name>       # 实现故事
/rui                         # 任务推荐
\`\`\`

## 项目结构

| 目录/文件 | 职责 | 生成方式 |
|-----------|------|---------|
| \`README.md\` | 系统视图 + 项目画像 | rui init 全量重生 |
| \`docs/故事任务面板/\` | 故事产出（每故事独立目录） | rui doc/code 生成 |

### 故事目录骨架（${p.story_defaults.skeleton}）

\`\`\`
docs/故事任务面板/<Project>/<name>/
${skeletonLines.join('\n')}
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

module.exports = { readmeMd, claudeMdProjectSection, claudeMdFull, storySkeletonDocs, weworkBotConfig };
