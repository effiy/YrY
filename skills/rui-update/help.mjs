#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-update — 增量更新')}
${dim('按 T1/T2/T3 变更范围自动裁剪管线')}

${hdr('用法')}
${item('/rui-update <name> [ctx]', '增量更新故事文档和/或代码', cyan)}
${item('/rui-update <name> --no-code', '仅文档不改源码', yellow)}

${hdr('变更级别')}
${item('T1 措辞/格式', '跳过分析+设计，仅刷新变更章节')}
${item('T2 增删/接口', '裁剪分析+设计，刷新目标+下游')}
${item('T3 边界/重构', '完整重跑，全级联刷新')}

${hdr('约束')}
${item('分支隔离', '写入前必须验证 feat/<name> 分支')}
${item('版本刷新', '更新后必须刷新版本号 + version_history')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-update/SKILL.md — 完整规约', dim)}
`;

console.log(help);
