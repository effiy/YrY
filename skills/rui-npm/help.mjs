#!/usr/bin/env node
// rui-npm — personal npm package manager help
// 用法: node skills/rui-npm/help.mjs 或 /rui-npm --help

import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui-npm — 个人 npm packages 管理器")}

${dim("搜索 · 安装 · 更新 · 列表 · 信息 · 卸载 · 本地发布 · npx 执行 · 安全审计")}

${hdr("可执行入口: node skills/rui-npm/rui-npm.mjs <command> [options]")}

${subhdr("子命令")}
${item("search <keyword>", "搜索 npm registry — 关键词匹配，结果按周下载量降序排列", cyan)}
${item("install <pkg>[@version]", "安装包 — 写入 package.json + node_modules", cyan)}
${item("update <pkg>", "更新包 — 升级到兼容最新版本，展示版本变更", cyan)}
${item("list [--depth N]", "列出已安装 — 当前项目直接依赖（默认）或完整依赖树", cyan)}
${item("info <pkg>", "查看包信息 — 版本/许可证/依赖/维护者/仓库链接/最近版本", cyan)}
${item("uninstall <pkg>", "卸载包 — 从 package.json 和 node_modules 移除", cyan)}
${item("publish <path>", "本地发布 — 文件或目录一键发布为 npm 包，即发即用", cyan)}
${item("npx <pkg>[@version]", "npx 执行 — 不安装直接运行 npm 包，流式透传输出", cyan)}
${item("audit", "安全审计 — 检查依赖已知漏洞，按严重级别分组 + 修复建议", cyan)}
${item("--help, -h, help", "显示此帮助", cyan)}

${subhdr("通用参数")}
${item("--json", "输出 JSON 格式（search/list/info/audit 支持）", cyan)}

${subhdr("search 参数")}
${item("--limit <N>", "搜索结果数量限制，默认 20", yellow)}
${item("--json", "输出 JSON 格式搜索结果", yellow)}

${subhdr("install 参数")}
${item("--dev, -D", "安装为 devDependency", yellow)}
${item("--global, -g", "全局安装（不检查 package.json）", yellow)}
${item("<pkg>@<version>", "安装指定版本，如 lodash@4.17.21", yellow)}

${subhdr("list 参数")}
${item("--depth <N>", "依赖树深度，默认 0（仅直接依赖）", yellow)}
${item("--json", "输出 JSON 格式依赖树", yellow)}

${subhdr("publish 参数")}
${item("--name <name>", "指定发布包名（默认从文件名/目录名推导）", yellow)}
${item("--version <ver>", "指定发布版本号，默认 1.0.0", yellow)}
${item("--description <desc>", "包描述", yellow)}
${item("--access public", "发布为公开包（scope 包默认为 private，需显式指定）", yellow)}
${item("--dry-run", "模拟发布，不实际上传（预览上传内容）", yellow)}

${subhdr("npx 参数")}
${item("-- args...", "传递给 npx 包的命令行参数（注意 -- 分隔符）", yellow)}

${hdr("使用场景")}

${scene("场景 1 — 搜索并安装包")}
${dim("    发现 → 确认 → 安装的典型工作流")}
${item("$ rui-npm search react", "搜索 react 相关包，按下载量排序", cyan)}
${item("#   #1 react  react   19.2.0  12.3M/w  React is a JavaScript library...", "", dim)}
${item("$ rui-npm info react", "查看 react 许可证/维护者/依赖详情", cyan)}
${item("$ rui-npm install react", "安装 react 到当前项目", cyan)}
${item("#   ✅ react@19.2.0 安装完成", "", dim)}
${item("变体", "安装为 devDependency:", dim)}
${item("$ rui-npm install prettier --dev", "", cyan)}

${scene("场景 2 — 本地脚本即发即用（文件模式）")}
${dim("    单文件 JS/MJS 一键发布 → npx 即刻运行")}
${item("$ rui-npm publish ./my-cli.mjs --name my-util", "发布本地脚本为 npm 包", cyan)}
${item("#   👤 已登录 npm: yourname", "", dim)}
${item("#   📝 自动生成 package.json (name: my-util)", "", dim)}
${item("#   ✅ my-util@1.0.0 发布成功", "", dim)}
${item("$ rui-npm npx my-util", "通过 npx 直接运行", cyan)}
${item("$ rui-npm npx my-util@1.0.0 -- --flag value", "指定版本 + 传递参数", cyan)}
${item("决策:", "文件模式适合单文件 CLI 工具。多文件/含依赖用目录模式（场景 3）", dim)}

${scene("场景 3 — 本地项目发布（目录模式）")}
${dim("    含 package.json 的目录发布，dry-run 先行验证")}
${item("$ rui-npm publish ./my-lib --dry-run", "先模拟发布，预览上传内容", cyan)}
${item("$ rui-npm publish ./my-lib", "确认无误后正式发布", cyan)}
${item("$ rui-npm publish ./my-lib --access public", "scope 包需显式指定公开访问", cyan)}
${item("$ rui-npm install my-lib", "在消费项目中安装验证", cyan)}
${item("决策:", "发布前用 --dry-run 预览内容，避免泄露敏感文件（检查 .npmignore）", dim)}

${scene("场景 4 — 依赖安全审计与修复")}
${dim("    定期检查漏洞 → 更新 → 确认状态")}
${item("$ rui-npm audit", "审计当前项目所有依赖的已知漏洞", cyan)}
${item("#   | 💀 Critical | 0   |", "", dim)}
${item("#   | 🔴 High     | 2   |", "", dim)}
${item("#   | 🟡 Moderate | 5   |", "", dim)}
${item("#   | 🟢 Low      | 3   |", "", dim)}
${item("$ rui-npm update lodash", "更新有漏洞的包到兼容最新版", cyan)}
${item("#   ✅ lodash: 4.17.20 → 4.17.21", "", dim)}
${item("$ rui-npm list --depth 0", "确认最终依赖版本状态", cyan)}
${item("决策:", "优先处理 critical/high。npm audit fix 自动修兼容漏洞；--force 可能 breaking", dim)}

${scene("场景 5 — 依赖清理")}
${dim("    审查依赖全景 → 确认可移除 → 卸载")}
${item("$ rui-npm list", "列出所有直接依赖及版本", cyan)}
${item("#   已安装依赖（42 个包）", "", dim)}
${item("$ rui-npm info moment", "查看待清理包的详情（许可证/维护状态）", cyan)}
${item("#   | 名称   | moment              |", "", dim)}
${item("#   | 许可证 | MIT                 |", "", dim)}
${item("$ rui-npm uninstall moment", "从项目移除不再需要的包", cyan)}
${item("#   ✅ moment 已卸载", "", dim)}
${item("决策:", "不确定是否还在使用时，先在项目中 grep 引用再决定。uninstall 不可逆", dim)}

${scene("场景 6 — 全局工具安装")}
${dim("    跨项目复用的开发辅助工具")}
${item("$ rui-npm search typescript", "搜索确认准确包名", cyan)}
${item("$ rui-npm install typescript --global", "全局安装 TypeScript", cyan)}
${item("#   ✅ typescript@5.9.0 安装完成", "", dim)}
${item("$ tsc --version", "验证全局命令可用（脱离 rui-npm，直接调 CLI）", cyan)}
${item("#   Version 5.9.0", "", dim)}
${item("决策:", "全局安装不检查 package.json。项目内工具用 --dev 保证团队环境一致", dim)}

${scene("场景 7 — JSON 模式集成")}
${dim("    结构化数据供脚本/管线/CI 消费，跳过表格格式化")}
${item("$ rui-npm search react --json --limit 5", "JSON 格式搜索结果", cyan)}
${item("$ rui-npm list --json --depth 1", "JSON 格式依赖树", cyan)}
${item("$ rui-npm audit --json", "JSON 格式漏洞数据（CI 可解析阻断）", cyan)}
${item("$ rui-npm info react --json", "JSON 格式完整元数据（许可证合规检查）", cyan)}
${item("决策:", "所有只读命令均支持 --json。CI 中用 audit --json 解析，critical > 0 阻断 pipeline", dim)}
`;

console.log(help);
