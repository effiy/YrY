#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-plan — 实施计划生成')}
${dim('doc 和 code 之间的桥梁 — 读取文档基线，生成实施计划')}

${hdr('用法')}
${item('/rui-plan <name>', '为指定故事生成 plan.html + 计划清单.html', cyan)}

${hdr('流程')}
${item('1. 读取基线', '故事任务 + 场景文档 → 结构化上下文')}
${item('2. 文件映射', 'AC/FP → 物理文件路径')}
${item('3. 任务分解', '每步 2-5 分钟可执行粒度')}
${item('4. 自审查', '六项检查：占位符/粒度/覆盖/依赖/可并行/可验证')}
${item('5. 保存', 'plan.html + 计划清单.html')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-plan/SKILL.md — 完整规约', dim)}
${item('plan-execution.md', 'rules/plan-execution.md — 计划执行规则', dim)}
`;

console.log(help);
