#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, item } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-bundle-analyze — 文件体积与依赖分析')}
${dim('类 webpack-bundle-analyzer — treemap + 依赖图谱 + 统计面板')}

${hdr('用法')}
${item('/rui-bundle-analyze', '全量分析，生成 HTML 报告并在浏览器打开', cyan)}
${item('/rui-bundle-analyze --dir <path>', '分析指定目录', yellow)}
${item('/rui-bundle-analyze --no-open', '仅生成报告，不打开浏览器', yellow)}
${item('/rui-bundle-analyze --json', 'JSON 输出（供管线消费）', yellow)}
${item('/rui-bundle-analyze --scope <glob>', '限定文件范围（如 "**/*.js"）', yellow)}

${hdr('分析内容')}
${item('📏 Treemap', '文件体积矩形图，面积与文件大小成比例')}
${item('🔗 依赖图谱', '力导向图展示 import/require 依赖关系')}
${item('📊 体积统计', 'Top-20 最大文件 + 扩展名分布 + 目录分布')}
${item('🔥 依赖热点', '被依赖最多模块 + fan-out 排行 + 循环依赖检测')}

${hdr('输出')}
${item('HTML 报告', 'docs/bundle-reports/bundle-YYYY-MM-DD-HHmmss.html')}
${item('JSON 数据', 'stdout（--json 时）')}

${hdr('集成')}
${item('rui-health', 'file_size + dep_analysis 维度评分输入')}
${item('self-improve', 'D3 复杂度 + D5 依赖退化检测输入')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-bundle-analyze/SKILL.md — 完整规约', dim)}
`;

console.log(help);
