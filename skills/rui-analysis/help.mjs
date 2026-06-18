#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, item } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-analysis — 代码与架构静态分析')}
${dim('复杂度 · 耦合 · 文件膨胀 · 依赖健康 · 架构边界检测')}

${hdr('用法')}
${item('/rui-analysis', '全量分析，输出摘要报告', cyan)}
${item('/rui-analysis complexity', '仅复杂度分析', yellow)}
${item('/rui-analysis coupling', '仅耦合分析', yellow)}
${item('/rui-analysis bloat', '仅文件膨胀检测', yellow)}
${item('/rui-analysis deps', '仅依赖健康检查', yellow)}
${item('/rui-analysis boundaries', '仅架构边界检测', yellow)}

${hdr('选项')}
${item('--scope <path>', '限定分析范围（默认项目根）')}
${item('--format json', 'JSON 输出（供管线消费）')}

${hdr('分析维度')}
${item('复杂度', '圈复杂度、认知复杂度、热点识别')}
${item('耦合', 'import 依赖图、循环依赖、扇入/扇出比')}
${item('文件膨胀', '超大文件检测（>500L ⚠️, >1000L 🚫）')}
${item('依赖健康', '版本新鲜度、依赖树深度、未使用依赖')}
${item('架构边界', '跨边界依赖检测、层次违规')}

${hdr('集成点')}
${item('D3 诊断', '自改进复杂度增长检测')}
${item('D5 诊断', '自改进依赖退化检测')}
${item('计划阶段', '文件结构映射输入')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-analysis/SKILL.md — 完整规约', dim)}
`;

console.log(help);
