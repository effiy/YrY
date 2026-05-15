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

// ── 项目上下文 helpers ──────────────────────────────────────────

function _degradationSignals(p) {
  const map = {
    frontend: '关注组件接口漂移（Props/Events/Expose 变更未同步）、状态管理退化（store 散落）、视觉回归。',
    backend: '关注 API 契约漂移（接口签名变更未同步文档）、数据模型与 schema 不匹配、中间件链断裂。',
    fullstack: '关注前后端契约不对齐（接口签名/字段名/错误码不一致）、数据流断裂（前端期望与后端返回不匹配）。',
    meta: '关注规则冲突（多规则重叠覆盖同一场景）、配置漂移（远端与本地不一致）。',
  };
  return map[p.type] || '关注模块边界模糊、接口隐式耦合。';
}

function _archContext(p) {
  const map = {
    monorepo: '跨包子项目影响先分析再动手。',
    microservice: '服务间契约先对齐再动手。',
  };
  return map[p.architecture?.pattern] || '模块边界先明确再动手。';
}

function _effectiveSignals(p) {
  const map = {
    frontend: '组件接口无漂移（Props/Events/Expose 变更已同步评审），视觉回归已截图对比。',
    backend: 'API 契约无断裂（接口签名/错误码/数据模型与评审对齐）。',
    fullstack: '前后端契约对齐（接口签名一致，数据流闭合），组件接口无漂移。',
    meta: '配置漂移已检测（远端与本地 diff 可复核），规则冲突已排查。',
  };
  return map[p.type] || '接口契约与评审对齐，测试覆盖闭合，交付管线全部触发。';
}

/**
 * 生成完整 CLAUDE.md（当文件不存在时使用）。
 * 以插件 CLAUDE.md 为哲学框架，针对项目 profile 重写执行准则、退化对策、自约束。
 */
function claudeMdFull(p) {
  const archCtx = _archContext(p);
  const techStack = p.manifest.tech_stack.length ? p.manifest.tech_stack.join(' · ') : '未识别';
  const buildCmd = p.manifest.build_commands.length ? p.manifest.build_commands.join(' · ') : '无构建命令';
  const testCmd = p.manifest.test_commands.length ? p.manifest.test_commands.join(' · ') : '无测试命令';
  const testFw = p.test_framework.framework || '未配置';
  const testRun = p.test_framework.runner_command || testCmd;
  const ecoList = p.manifest.ecosystems.length ? p.manifest.ecosystems.join(' · ') : '未识别';
  const secList = p.security_surface.signals.length ? p.security_surface.signals.join(' · ') : '无显著安全面';

  return `# CLAUDE.md

> **${p.project}** — ${p.type_label} · ${p.architecture.pattern} 架构。
> 三公理推导一切——基础信念是 why，工作原则是设计约束，执行准则是日常动作。

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

## 项目画像

**${p.project}** 是一个 ${p.type_label}（${p.architecture.pattern} 架构），基于 ${ecoList} 生态。

| 维度 | 值 |
|------|-----|
| 类型 | ${p.type_label} |
| 架构 | ${p.architecture.pattern} |
| 技术栈 | ${techStack} |
| 构建 | ${buildCmd} |
| 测试框架 | ${testFw} |
| 测试命令 | ${testRun} |
| 安全面 | ${secList} |

## 执行准则

**思先于码。** 陈述假设，呈现权衡。不确定就停，问。${archCtx}

**最少代码。** 只解决这个问题。不请自来的功能、单次抽象、不可能场景的错误处理——不写。现有依赖已覆盖项目基础设施，避免引入新依赖除非有明确需求。

**精确修改。** 只动必须动的。改动不留残余。每行改动可追溯到请求。验证：\`${buildCmd}\` 通过，\`${testRun}\` 通过。

**目标驱动。** 先写失败测试再通过。"看起来没问题"等于没做。运行 \`${testRun}\` 验证。

**完成通知。** 做完或卡住都同步状态。沉默比失败更危险。

**表达优先：图 → 结构化文本 → 表。**

${claudeMdProjectSection(p)}
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

// ── README.md ──────────────────────────────────────────────────

function readmeMd(p) {
  const techStack = p.manifest.tech_stack.length > 0 ? p.manifest.tech_stack : ['待补充'];
  const ecoList = p.manifest.ecosystems.length ? p.manifest.ecosystems.join(' · ') : '待补充';
  const capDesc = { frontend: '前端应用', backend: '后端服务', fullstack: '全栈应用', meta: '项目' }[p.type] || '软件项目';
  const secList = p.security_surface.signals.length ? p.security_surface.signals.join(' · ') : '无显著安全面';
  const testFw = p.test_framework.framework || '待配置';
  const testCmd = p.manifest.test_commands[0] || p.test_framework.runner_command || '待配置';
  const buildCmd = p.manifest.build_commands[0] || '待配置';
  const installCmd = ecoList.includes('node') ? 'npm install' : (ecoList.includes('python') ? 'pip install -r requirements.txt' : (ecoList.includes('go') ? 'go mod download' : '见构建文档'));
  const runCmdHint = ecoList.includes('node') ? 'npm start / npm run dev' : (ecoList.includes('python') ? 'python main.py / uvicorn ...' : (ecoList.includes('go') ? 'go run .' : '见运行文档'));
  const deps = [...(p.manifest.dependencies.production || []), ...(p.manifest.dependencies.dev || [])];
  const keyDeps = deps.slice(0, 8);
  const bottomLines = [p.security_surface.auth ? '认证不可绕过' : null, '密钥不落盘', p.security_surface.user_input ? '输入必校验' : null, p.security_surface.data_storage ? '数据不裸存' : null].filter(Boolean);

  return `# ${p.project}

> ${capDesc} · ${p.architecture.pattern} 架构 · ${ecoList}

## 项目概览

**${p.project}** 是一个基于 ${ecoList} 生态的 ${p.type_label}。${p.coder_formula.focus}。

| 属性 | 值 |
|------|-----|
| 类型 | ${p.type_label} |
| 架构 | ${p.architecture.pattern} |
| 运行时 | ${ecoList} |
| 安全面 | ${secList} |
| 安全底线 | ${bottomLines.join(' · ')} |

## 技术栈

| 类别 | 技术 |
|------|------|
| 运行时 | ${ecoList} |
| 核心框架 | ${techStack.join(' · ')} |
| 关键依赖 | ${keyDeps.length ? keyDeps.join(' · ') : '待补充'} |
| 构建工具 | ${buildCmd} |
| 测试框架 | ${testFw} |
| 测试命令 | \`${testCmd}\` |

## 目录结构

\`\`\`
${p.project}/
├── src/                        # 源代码
├── tests/                      # 测试文件
├── docs/                       # 项目文档
├── scripts/                    # 构建/部署脚本
├── CLAUDE.md                   # AI 协作指令
└── README.md                   # 本文件
\`\`\`

## 快速开始

\`\`\`bash
# 1. 安装依赖
${installCmd}

# 2. 构建
${buildCmd}

# 3. 运行测试
${testCmd}

# 4. 启动
${runCmdHint}
\`\`\`
`;
}

// ── wework-bot config.json ─────────────────────────────────────

function weworkBotConfig(p, pluginCfg) {
  // 从插件配置读取默认值，项目未配置时自动回退到插件通知
  const apiUrl = (pluginCfg && pluginCfg.api_url) || 'https://api.effiy.cn/wework/send-message';
  const webhookUrl = (pluginCfg && pluginCfg.robots && pluginCfg.robots.general && pluginCfg.robots.general.webhook_url) || 'YOUR_WEBHOOK_URL_HERE';
  const defaultRobot = (pluginCfg && pluginCfg.default_robot) || 'general';
  const agents = (pluginCfg && pluginCfg.agents) || { rui: 'general' };
  const robots = (pluginCfg && pluginCfg.robots) || { general: { webhook_url: 'YOUR_WEBHOOK_URL_HERE' } };

  const cfg = {
    default_robot: defaultRobot,
    api_url: apiUrl,
    robots,
    agents,
  };

  if (webhookUrl === 'YOUR_WEBHOOK_URL_HERE') {
    cfg._comment = '由 rui init 生成。请替换 YOUR_WEBHOOK_URL_HERE 为实际的企业微信机器人 webhook URL。未配置时将回退到插件通知。';
  } else {
    cfg._comment = '由 rui init 生成。当前使用插件默认通知配置，如需变更请修改 webhook_url。';
  }

  return JSON.stringify(cfg, null, 2) + '\n';
}

// ── Exports ────────────────────────────────────────────────────

module.exports = { projectSnapshot, readmeMd, claudeMdProjectSection, claudeMdFull, weworkBotConfig };
