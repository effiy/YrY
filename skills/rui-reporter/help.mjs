#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-reporter — 过程报告与知识策展')}
${dim('记发生过的事 · 每条结论附引用 · 场景文档各 § 交叉对齐')}

${hdr('用法')}
${item('/rui-reporter', '项目级进程摘要', cyan)}
${item('/rui-reporter --story <name>', '单故事详细报告', yellow)}
${item('/rui-reporter knowledge-graph', '知识图谱一致性检查', yellow)}
${item('/rui-reporter trends', '跨故事趋势分析', yellow)}

${hdr('报告类型')}
${item('故事进程', '管线阶段追踪、阻断事件汇总、质量指标趋势')}
${item('知识图谱一致性', 'FP# 覆盖率、实现边完整性、层次闭合、悬挂边检测')}
${item('交付摘要', '变更统计、测试通过率、P0 清零确认、Gate B 裁决')}
${item('跨故事趋势', '完成率、阻断率、P0 密度、经验技能化候选')}

${hdr('规则')}
${item('不扭曲实际路径', '完整记录包括失败')}
${item('不编造数据', '缺口标注 Level C，不可编造')}
${item('交叉引用闭合', '场景文档各 § 无矛盾叙述')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-reporter/SKILL.md — 完整规约', dim)}
${item('reporter.md', 'agents/reporter.md — Reporter Agent 角色规约', dim)}
`;

console.log(help);
