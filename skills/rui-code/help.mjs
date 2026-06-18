#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, item } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-code — 源码实现管线')}
${dim('源码改动唯一入口：分支隔离 → Gate A → 逐模块 P0 清零 → Gate B → 自改进 → 交付')}

${hdr('用法')}
${item('/rui-code <name>', '为指定故事执行完整代码管线', cyan)}
${item('/rui-code --from-doc <name>', '从文档反推补全缺失章节（只读，不覆盖）', yellow)}

${hdr('管线阶段')}
${item('① 分支隔离', 'node lib/branch-check.mjs 强制验证')}
${item('② 计划门禁', 'plan.html 存在且无占位符')}
${item('③ Gate A', '测试设计存在且完整')}
${item('④ 逐模块实现', '每模块编码 → P0 清零 → 下一模块')}
${item('⑤ Gate B', '五步验证 ≤ 2 轮')}
${item('⑥ 自改进', 'D0–D7 诊断 + 提案生成')}
${item('⑦ 交付', 'rui-import → rui-bot')}

${hdr('约束')}
${item('源码唯一入口', '只能走 /rui-code 改源码')}
${item('P0 清零', '每模块 P0 清零后再进下一模块')}
${item('Gate B ≤ 2 轮', '超过则阻断 gate-b-limit')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-code/SKILL.md — 完整规约', dim)}
${item('code-pipeline.md', 'rules/code-pipeline.md — 代码管线规则', dim)}
`;

console.log(help);
