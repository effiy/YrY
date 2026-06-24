#!/usr/bin/env node
import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, item } from '../../lib/help-layout.mjs';

const help = `
${bold('# rui-version — 版本管理')}
${dim('自主判定版本号 → 更新文件 → git commit + tag → push')}

${hdr('用法')}
${item('/rui-version --up', '分析变更 → 判定版本号 → 更新版本文件 → git commit + push', cyan)}
${item('/rui-version --rollback <name>', '回退故事文档到指定历史版本（需确认）', yellow)}

${hdr('版本判定')}
${item('PATCH', '措辞/格式调整 → 1.7.0 → 1.7.1')}
${item('MINOR', '新功能/新命令 → 1.7.0 → 1.8.0')}
${item('MAJOR', '架构变更/破坏性 → 1.7.0 → 2.0.0')}

${hdr('同步文件（必同步）')}
${item('CLAUDE.md', '项目画像表 版本 行')}
${item('README.md', '版本引用')}

${hdr('同步文件（插件项目额外同步）')}
${item('plugin.json', '.claude-plugin/plugin.json .version')}
${item('marketplace.json', '.claude-plugin/marketplace.json .metadata.version')}

${hdr('相关资源')}
${item('SKILL.md', 'skills/rui-version/SKILL.md — 完整规约', dim)}
`;

console.log(help);
