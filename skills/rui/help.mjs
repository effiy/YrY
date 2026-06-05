#!/usr/bin/env node
// rui — Story-driven SDLC orchestrator help
// 用法: node skills/rui/help.mjs 或 /rui --help

import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui — 故事驱动 SDLC 编排器")}

${dim("需求 → 文档 → 代码 → 交付 | 6 Agent 协同 | Gate A/B 门禁 | 三步强制交付")}

${hdr("快速入门")}
${item("/rui <需求> [--name <name>]", "端到端：需求 → 文档基线 → 编码 → 交付", cyan)}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板", cyan)}
${item("/rui", "任务推荐（只读，不触发交付）", cyan)}

${hdr("子命令")}

${subhdr("端到端管线")}
${item("/rui <需求> [--name <name>]", "需求 → 文档基线 → 编码 → 交付", cyan)}
${flag("name <name>", "故事名（kebab-case，如 user-login）。省略时 pm 自动提取")}

${subhdr("文档基线")}
${item("/rui doc <需求> [--name <name>]", "拆需求为故事 + 生成文档基线（只读源码）", cyan)}
${item("/rui doc --from-code [需求]", "从源码反推故事文档（只读，冲突保护）", cyan)}
${item("/rui doc --from-local <name>", "从已有本地文档补全缺失基线（只读已有，不覆盖）", cyan)}

${subhdr("编码实现")}
${item("/rui code <name>", "实现故事（源码唯一入口）", cyan)}
${item("/rui code --from-doc <name>", "从文档反推，补全缺失文档（只读）", cyan)}

${subhdr("增量更新")}
${item("/rui update <name> [ctx] [--no-code]", "增量更新（T1/T2/T3 自动裁剪）", cyan)}
${flag("no-code", "仅刷新文档不改源码")}

${subhdr("自改进闭环")}
${item("/rui yry [--depth N]", "全自主自改进闭环：扫描→诊断→实现→验证→版本升级", cyan)}
${flag("depth N", "最大闭环次数（默认 3）。≤0 时仅扫描诊断不执行")}

${subhdr("版本管理")}
${item("/rui version --up", "版本升级：自主判定 → 更新文件 → git commit → merge main → push + tag", cyan)}
${item("/rui version --rollback <name> [--to <version>]", "版本回退：基于 git 版本链回退故事文档（需确认）", cyan)}
${flag("to <version>", "目标版本号或 commit hash。省略时展示可用版本列表")}

${subhdr("项目初始化")}
${item("/rui init", "建立项目基线：CLAUDE.md + README + 故事面板", cyan)}
${item("/rui", "任务推荐（只读，不触发交付）", cyan)}

${hdr("使用场景")}
${scene("端到端：一个需求从始至终")}
${item('/rui "用户登录：密码+短信验证码" --name user-login', "拆故事 → 文档基线 → 编码 → 验证 → 交付", cyan)}
${scene("仅生成文档基线")}
${item('/rui doc "用户登录功能" --name user-login', "拆需求为故事，产出文档基线到面板目录", cyan)}
${item("/rui doc @requirements.md --name payment", "从本地文件读取需求", cyan)}
${scene("从文档基线开始编码")}
${item("/rui code user-login", "Gate A → 逐模块 P0 清零 → Gate B → 交付", cyan)}
${scene("存量代码补文档")}
${item("/rui doc --from-code", "pm 扫描源码推荐待文档化的模块（5 层评分）", cyan)}
${item("/rui doc --from-code user-login", "从指定模块源码反推完整文档基线", cyan)}
${scene("小修小补")}
${item('/rui update user-login "新增 OAuth 登录"', "T1~T3 自动判定变更范围，刷新文档 + 重跑验证", cyan)}
${item("/rui update user-login --no-code", "仅刷新文档不改源码", cyan)}
${scene("已有部分文档，补全缺失基线")}
${item("/rui doc --from-local user-login", "扫描已有文档 → 按依赖链生成缺失 → 不覆盖已有", cyan)}
${scene("查看进度 & 获取推荐")}
${item("/rui-story list && /rui", "扫描故事状态 → 获取管线评分的推荐任务", cyan)}
${scene("首次进入仓库")}
${item("/rui init", "建立 CLAUDE.md + README + 故事面板基线", cyan)}
${scene("多故事串行 + 被阻断后恢复")}
${item('/rui "用户系统：注册+登录+权限管理"', "pm 拆分为 ≥3 故事 → 逐故事串行 doc → code", cyan)}
${item("/rui code user-login", "被阻断后重跑同命令，从断点续跑", cyan)}
`;

console.log(help);
