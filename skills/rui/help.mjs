#!/usr/bin/env node
// rui — Story-driven SDLC orchestrator help
// 用法: node skills/rui/help.mjs 或 /rui --help

import { bold, dim, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 | 20 技能 + 9 Agent 协同 | Gate A/B 门禁 | 三步强制交付")}

${hdr("快速入门")}
${item("/rui <需求>", "端到端：需求 → 文档基线 → 编码 → 交付", cyan)}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板", cyan)}
${item("/rui", "任务推荐（只读，不触发交付）", cyan)}

${hdr("命令路由（委托子技能）")}

${subhdr("端到端管线")}
${item("/rui <需求>", "rui-doc → rui-code（→ /rui-doc → /rui-code）", cyan)}

${subhdr("文档基线 → rui-doc")}
${item("/rui doc <需求>", "拆需求为故事 + 生成文档基线（只读源码）", cyan)}
${item("/rui doc --from-code [需求]", "从源码反推故事文档（只读，冲突保护）", cyan)}
${item("/rui doc --from-local <name>", "从已有本地文档补全缺失基线", cyan)}

${subhdr("实施计划 → rui-plan")}
${item("/rui plan <name>", "读取文档基线 → 生成 plan.html + 计划清单.html", cyan)}

${subhdr("编码实现 → rui-code")}
${item("/rui code <name>", "实现故事（源码唯一入口）", cyan)}
${item("/rui code --from-doc <name>", "从文档反推，补全缺失文档（只读）", cyan)}

${subhdr("增量更新 → rui-update")}
${item("/rui update <name> [ctx] [--no-code]", "增量更新（T1/T2/T3 自动裁剪）", cyan)}

${subhdr("自改进闭环 → rui-yry")}
${item("/rui yry [--depth N]", "全自主自改进闭环", cyan)}
${flag("depth N", "最大闭环次数（默认 3）")}

${subhdr("版本管理 → rui-version")}
${item("/rui version --up", "版本升级：自主判定 → 更新文件 → git commit → push + tag", cyan)}
${item("/rui version --rollback <name>", "版本回退（需确认）", cyan)}

${subhdr("项目初始化 → rui-init")}
${item("/rui init", "建立项目基线", cyan)}

${hdr("子技能直接调用")}
${item("/rui-init", "项目初始化", dim)}
${item("/rui-doc", "文档基线生成", dim)}
${item("/rui-plan <name>", "实施计划生成", dim)}
${item("/rui-code <name>", "源码实现管线", dim)}
${item("/rui-update <name>", "增量更新", dim)}
${item("/rui-yry", "自改进闭环", dim)}
${item("/rui-version --up", "版本管理", dim)}
${item("/rui-html <story>", "HTML 文档生成", dim)}
${item("/rui-analysis", "代码与架构静态分析", dim)}
${item("/rui-reporter", "过程报告与知识策展", dim)}

${hdr("使用场景")}
${scene("端到端：一个需求从始至终")}
${item('/rui "用户登录：密码+短信验证码" --name user-login', "拆故事 → 文档基线 → 编码 → 验证 → 交付", cyan)}
${scene("仅生成文档基线")}
${item('/rui doc "用户登录功能" --name user-login', "拆需求为故事，产出文档基线到面板目录", cyan)}
${scene("从文档基线开始编码")}
${item("/rui code user-login", "Gate A → 逐模块 P0 清零 → Gate B → 交付", cyan)}
${scene("存量代码补文档")}
${item("/rui doc --from-code", "pm 扫描源码推荐待文档化的模块", cyan)}
${scene("查看进度 & 获取推荐")}
${item("/rui-story list && /rui", "扫描故事状态 → 获取推荐任务", cyan)}
${scene("静态分析")}
${item("/rui-analysis complexity --scope src/", "分析源码目录的复杂度热点", cyan)}
${scene("生成报告")}
${item("/rui-reporter --story user-login", "生成 user-login 完整过程报告", cyan)}
`;

console.log(help);
