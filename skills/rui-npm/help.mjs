#!/usr/bin/env node
/**
 * rui-npm — personal npm package manager help
 * 用法: node skills/rui-npm/help.mjs 或 /rui-npm --help
 */

import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui-npm — 个人 npm packages 管理器")}

${dim("搜索 · 安装 · 更新 · 列表 · 信息 · 卸载 · 本地发布 · npx 执行 · 安全审计 · CDN 引用 · 账号级管理")}

${hdr("快速入门")}
${item("node skills/rui-npm/rui-npm.mjs search <keyword>", "按关键词搜索 npm registry，结构化展示", cyan)}
${item("node skills/rui-npm/rui-npm.mjs install <pkg>[@version]", "安装包到当前项目", cyan)}
${item("node skills/rui-npm/rui-npm.mjs publish <file|dir>", "发布本地文件或目录为 npm 包", cyan)}
${item("node skills/rui-npm/rui-npm.mjs npx <pkg>", "不安装直接通过 npx 运行包", cyan)}

${hdr("可执行入口: node skills/rui-npm/rui-npm.mjs")}

${subhdr("子命令")}
${item("search <keyword>", "搜索 npm registry — 关键词匹配，结果按下载量排序", cyan)}
${item("install <pkg>[@version]", "安装包 — 写入 package.json + node_modules", cyan)}
${item("update <pkg>", "更新包 — 升级到兼容最新版本，展示版本变更", cyan)}
${item("list", "列出已安装 — 当前项目依赖树或平面列表", cyan)}
${item("info <pkg>", "查看包信息 — 版本/许可证/依赖/维护者/仓库链接", cyan)}
${item("uninstall <pkg>", "卸载包 — 从 package.json 和 node_modules 移除", cyan)}
${item("publish <path>", "本地发布 — 文件或目录一键发布为 npm 包", cyan)}
${item("npx <pkg>[@version]", "npx 执行 — 不安装直接运行 npm 包", cyan)}
${item("audit", "安全审计 — 检查依赖已知漏洞，按严重级别分组", cyan)}
${item("cdn <pkg>[@version]", "CDN 引用 — 查看包在 unpkg/jsDelivr/esm.sh 的引用地址", cyan)}
${item("login [--token <token>]", "登录 npm — 通过 Access Token 配置 npm registry 认证", cyan)}
${item("my-packages", "列出我所有的包 — 当前登录用户拥有的全部 npm 包", cyan)}
${item("deprecate <pkg>[@version] \"<msg>\"", "废弃版本 — 标记指定包/版本为 deprecated", cyan)}
${item("unpublish <pkg>[@version]", "删除包/版本 — 从 registry 移除（安全警告前置）", cyan)}
${item("--help, -h, help", "显示此帮助", cyan)}

${subhdr("参数")}
${item("--json", "输出 JSON 格式（search/list/info/audit/cdn 支持）", cyan)}
${item("--dev, -D", "安装为 devDependency（install 支持）", yellow)}
${item("--global, -g", "全局安装（install 支持）", yellow)}
${item("--depth <N>", "依赖树深度，默认 0 仅直接依赖（list 支持）", yellow)}
${item("--limit <N>", "搜索结果数量限制，默认 20（search 支持）", yellow)}
${item("--name <name>", "指定发布包名（publish 支持）", yellow)}
${item("--version <ver>", "指定发布版本号，默认 1.0.0（publish 支持）", yellow)}
${item("--description <desc>", "包描述（publish 支持）", yellow)}
${item("--access public", "发布为公开包（publish scope 包时使用）", yellow)}
${item("--dry-run", "模拟发布，不实际上传（publish 支持）", yellow)}
${item("--force, -f", "强制操作，绕过限制（unpublish 支持）", yellow)}
${item("--token <token>", "Access Token，也可通过 NPM_TOKEN 环境变量传入（login 支持）", yellow)}
${item("-- args...", "传递给 npx 包的命令行参数（npx 支持，注意 -- 分隔）", yellow)}

${hdr("使用场景")}
${scene("场景 1 — 搜索并安装包")}
${item("node skills/rui-npm/rui-npm.mjs search react", "Step 1：搜索 react 相关包", cyan)}
${item("node skills/rui-npm/rui-npm.mjs info react", "Step 2：查看 react 详细信息确认", cyan)}
${item("node skills/rui-npm/rui-npm.mjs install react", "Step 3：安装 react 到当前项目", cyan)}

${scene("场景 2 — 本地脚本即发即用")}
${item("node skills/rui-npm/rui-npm.mjs publish ./my-script.js --name my-util", "Step 1：发布本地脚本为 npm 包", cyan)}
${item("node skills/rui-npm/rui-npm.mjs npx my-util", "Step 2：通过 npx 直接运行", cyan)}
${item("# 或安装后使用", "Step 2 替代：先 install 再调用", dim)}
${item("node skills/rui-npm/rui-npm.mjs install my-util", "", dim)}

${scene("场景 3 — 依赖审计与更新")}
${item("node skills/rui-npm/rui-npm.mjs audit", "Step 1：审计当前项目依赖漏洞", cyan)}
${item("node skills/rui-npm/rui-npm.mjs update lodash", "Step 2：更新有漏洞的包", cyan)}
${item("node skills/rui-npm/rui-npm.mjs list --depth 0", "Step 3：确认最终依赖状态", cyan)}

${scene("场景 4 — 查看和清理依赖")}
${item("node skills/rui-npm/rui-npm.mjs list", "Step 1：列出所有直接依赖", cyan)}
${item("node skills/rui-npm/rui-npm.mjs info moment", "Step 2：查看包详情（许可证/维护状态）", cyan)}
${item("node skills/rui-npm/rui-npm.mjs uninstall moment", "Step 3：卸载不再需要的包", cyan)}

${scene("场景 5 — 账号级包管理")}
${item("node skills/rui-npm/rui-npm.mjs login --token <token>", "Step 1：配置 npm 认证", cyan)}
${item("node skills/rui-npm/rui-npm.mjs my-packages", "Step 2：查看自己发布的所有包", cyan)}
${item("node skills/rui-npm/rui-npm.mjs deprecate my-util@1.0.0 \"Use 2.0.0\"", "Step 3：废弃不再维护的版本", cyan)}
${item("node skills/rui-npm/rui-npm.mjs unpublish my-util@1.0.0", "Step 4：删除误发布的版本（安全警告前置）", cyan)}`;

console.log(help);
