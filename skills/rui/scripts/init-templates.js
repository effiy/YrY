#!/usr/bin/env node

// init-templates.js — init 产物模板（纯数据，无副作用）
//
// 职责：接收 profile 对象，返回文件内容字符串。
// 遵循「留核心」——最可靠的模块是没有模块。

'use strict';

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

// ── Exports ────────────────────────────────────────────────────

module.exports = { readmeMd };
