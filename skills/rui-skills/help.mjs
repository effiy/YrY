#!/usr/bin/env node
// rui-skills — Agent skill ecosystem discovery
// 用法: node skills/rui-skills/help.mjs 或 /rui-skills --help

import { bold, dim, green, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui-skills — Agent 技能生态发现")}

${dim("搜索 · 安装 · 验证 — 开放 Agent 技能生态系统")}

${hdr("快速入门")}
${item("/rui-skills find [query]", "搜索开放生态中的 Agent 技能", green)}
${item("/rui-skills add <package>", "安装指定的技能包", cyan)}
${item("/rui-skills --help", "显示此帮助信息", dim)}

${hdr("子命令")}

${subhdr("find — 技能发现")}
${item("/rui-skills find", "交互式搜索 Agent 技能", green)}
${flag("query <q>", "搜索关键词（如 react, testing, deploy）")}

${subhdr("add — 技能安装")}
${item("/rui-skills add <owner/repo@skill>", "从 GitHub 安装技能包", cyan)}

${hdr("使用场景")}
${scene("按需扩展能力")}
${item("/rui-skills find react", "搜索 React 生态相关技能", green)}
${item("/rui-skills find testing", "搜索测试相关技能", green)}
${scene("安装推荐技能")}
${item("/rui-skills add vercel-labs/agent-skills@react", "安装 Vercel Labs 的 React 技能", cyan)}

${hdr("质量验证标准")}
${item("安装量 ≥ 1K", "社区验证的基本门槛", green)}
${item("GitHub stars ≥ 100", "过低需怀疑来源质量", dim)}
${item("来源信誉", "优先 vercel-labs、ComposioHQ 等知名来源", green)}
`;

console.log(help);
