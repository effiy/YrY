#!/usr/bin/env node
// rui-health — System health diagnosis help
// 用法: node skills/rui-health/help.mjs 或 /rui-health --help

import { bold, dim, green, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui-health — 系统健康诊断")}

${dim("16 维度评分 · D0-D8 诊断引擎 · HTML 报告 · 趋势持久化")}

${hdr("快速入门")}
${item("node skills/rui-health/health.mjs", "文本摘要输出", green)}
${item("node skills/rui-health/health.mjs --json", "JSON 输出（供管线消费）", cyan)}
${item("node skills/rui-health/health.mjs --html", "HTML 报告生成", cyan)}
${item("node skills/rui-health/health.mjs --trend", "追加趋势数据到 health-trend.jsonl", yellow)}

${hdr("可执行入口: node skills/rui-health/health.mjs")}

${subhdr("参数")}
${flag("--json", "JSON 格式输出，含 composite/grade/dimensions/timestamp")}
${flag("--html", "生成自包含 HTML 报告到 docs/健康报告/")}
${flag("--trend", "追加趋势数据到 .memory/health-trend.jsonl")}
${flag("--notify", "委托 rui-bot 发送企微通知")}

${hdr("诊断维度")}
${item("核心维度 (9)", "token · config · robots · api · reports · format · diagnostics · git · security", green)}
${item("工程成熟度 (7)", "em_testing · em_types · em_linting · em_cicd · em_docs · em_deps · em_git", cyan)}

${hdr("评级阈值")}
${item("A ≥ 90", "优秀 — 系统健康，无需干预", green)}
${item("B ≥ 75", "良好 — 基本健康，有改进空间", yellow)}
${item("C ≥ 60", "一般 — 存在风险，需要关注", yellow)}
${item("D < 60", "需关注 — 存在严重问题", dim)}

${hdr("与 rui-bot 的关系")}
${item("rui-health", "管健康诊断 + 报告生成", green)}
${item("rui-bot", "管消息推送 + 通知发送", cyan)}
${item("解耦边界", "通过报告文件路径传递，不直接调用", dim)}
`;

console.log(help);