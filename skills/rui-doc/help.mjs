#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-doc — 文档基线生成')}
${dim('需求 → 故事拆分 → 文档基线（故事任务 + 场景 + 架构图 + 知识图谱）')}

${hdr('用法')}
${item('/rui-doc <需求>', '从需求生成完整文档基线', cyan)}
${item('/rui-doc --from-code [需求]', '从源码反推文档基线（req 空时推荐引路）', yellow)}
${item('/rui-doc --from-local <name>', '从已有本地文档补全缺失基线', yellow)}

${hdr('模式')}
${item('默认', 'pm 解析需求 → 拆分故事 → 逐故事生成文档基线')}
${item('--from-code', '扫描源码 → 推荐/反推 → 生成文档（只读，Level B 证据）')}
${item('--from-local', '扫描已有文档 → 按依赖链生成缺失文档（不覆盖已有）')}

${hdr('产出')}
${item('故事任务.md', '问题空间基线')}
${item('场景-N-<slug>.md', '场景层 §0 + §1（≥ 2 场景）')}
${item('场景-N-<slug>.html', '架构图（自包含 HTML+SVG）')}
${item('知识图谱.json + .html', '知识层')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-doc/SKILL.md — 完整规约', dim)}
${item('formulas.md', 'skills/rui/formulas.md — 文档公式', dim)}
`;

console.log(help);
