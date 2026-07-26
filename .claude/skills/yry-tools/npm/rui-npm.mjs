#!/usr/bin/env node
/**
 * rui-npm — personal npm package manager
 * 用法: node skills/rui-npm/rui-npm.mjs <command> [options]
 *
 * 对应场景文档:
 *   - skills/rui-npm/scenes/场景-1-包搜索与发现/
 *   - skills/rui-npm/scenes/场景-2-包安装与版本管理/
 *   - skills/rui-npm/scenes/场景-3-本地发布与npx使用/
 *   - skills/rui-npm/scenes/场景-4-包信息审计与卸载/
 *   - skills/rui-npm/scenes/场景-5-账号级包管理/
 *
 * 子命令:
 *   search       <keyword>           搜索 npm registry
 *   install      <pkg>[@version]     安装包
 *   update       <pkg>               更新包
 *   list         [--depth N]         列出已安装包
 *   info         <pkg>               查看包信息
 *   uninstall    <pkg>               卸载包
 *   publish      <path>              发布本地文件/目录
 *   npx          <pkg>[@version]     npx 执行包
 *   audit                            安全审计
 *   cdn          <pkg>[@version]     查看 CDN 引用地址
 *   login        [--token <token>]   配置 Access Token 认证
 *   my-packages  [--limit N]         列出我所有的包
 *   deprecate    <pkg> "<msg>"       废弃包版本
 *   unpublish    <pkg>[@version]     删除包/版本
 */

// @ts-nocheck — 项目未安装 @types/node;此处仅使用 node: 内置模块的运行时 API (child_process / path / process),
// TypeScript 语言服务在没有 Node 类型时无法解析,但 `node skills/rui-npm/rui-npm.mjs --help` 运行无误。
import { spawnSync } from "node:child_process"; // @ts-ignore
import { join, dirname } from "node:path"; // @ts-ignore

import { checkNpm } from "./lib/npm-utils.mjs";
import { NODE_ARGV_OFFSET } from "../../lib/constants.mjs";
import { parseArgs } from "./lib/cli.mjs";
import { cmdSearch, cmdList, cmdInfo } from "./lib/read.mjs";
import { cmdInstall, cmdUpdate, cmdUninstall } from "./lib/write.mjs";
import { cmdMyPackages, cmdDeprecate, cmdUnpublish } from "./lib/account.mjs";
import { cmdNpx, cmdAudit, cmdCdn } from "./lib/tools.mjs";
import { cmdLogin } from "./lib/auth.mjs";
import { cmdPublish } from "./lib/publish.mjs";

function main() {
  const rawArgs = process.argv.slice(NODE_ARGV_OFFSET);
  if (rawArgs.length === 0 || rawArgs[0] === "help" || rawArgs[0] === "--help" || rawArgs[0] === "-h") {
    const helpPath = join(dirname(new URL(import.meta.url).pathname), "help.mjs");
    spawnSync("node", [helpPath], { stdio: "inherit" });
    process.exit(0);
  }

  checkNpm();
  const command = rawArgs[0];
  const rest = rawArgs.slice(1);
  const args = parseArgs(rest);

  switch (command) {
    case "search":      cmdSearch(args._[0], args); break;
    case "install":     cmdInstall(args._[0], args); break;
    case "update":      cmdUpdate(args._[0], args); break;
    case "list":        cmdList(args); break;
    case "info":        cmdInfo(args._[0], args); break;
    case "uninstall":   cmdUninstall(args._[0], args); break;
    case "publish":     cmdPublish(args._[0], args); break;
    case "npx":         cmdNpx(args._[0], args); break;
    case "audit":       cmdAudit(args); break;
    case "cdn":         cmdCdn(args._[0], args); break;
    case "login":       cmdLogin(args); break;
    case "my-packages": cmdMyPackages(args); break;
    case "deprecate":   cmdDeprecate(args._[0], args); break;
    case "unpublish":   cmdUnpublish(args._[0], args); break;
    default:
      console.error(`❌ 未知子命令: ${command}`);
      console.error("   可用命令: search, install, update, list, info, uninstall, publish, npx, audit, cdn, login, my-packages, deprecate, unpublish");
      console.error("   查看帮助: rui-npm --help");
      process.exit(1);
  }
}

main();
