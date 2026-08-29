#!/usr/bin/env node
/**
 * rui-npm — personal npm package manager
 * Usage: node skills/rui-npm/rui-npm.mjs <command> [options]
 *
 * Corresponding scenario docs:
 *   - skills/rui-npm/scenes/scene-1-package-search-and-discovery/
 *   - skills/rui-npm/scenes/scene-2-package-install-and-version-management/
 *   - skills/rui-npm/scenes/scene-3-local-publish-and-npx-usage/
 *   - skills/rui-npm/scenes/scene-4-package-info-audit-and-uninstall/
 *   - skills/rui-npm/scenes/scene-5-account-level-package-management/
 *
 * Subcommands:
 *   search       <keyword>           Search npm registry
 *   install      <pkg>[@version]     Install package
 *   update       <pkg>               Update package
 *   list         [--depth N]         List installed packages
 *   info         <pkg>               View package info
 *   uninstall    <pkg>               Uninstall package
 *   publish      <path>              Publish local file/directory
 *   npx          <pkg>[@version]     npx execute package
 *   audit                            Security audit
 *   cdn          <pkg>[@version]     View CDN reference URLs
 *   login        [--token <token>]   Configure Access Token authentication
 *   my-packages  [--limit N]         List all my packages
 *   deprecate    <pkg> "<msg>"       Deprecate package version
 *   unpublish    <pkg>[@version]     Delete package/version
 */

// @ts-nocheck — Project does not have @types/node installed; here only using node: built-in module runtime APIs (child_process / path / process),
// TypeScript language service cannot resolve without Node types, but `node skills/rui-npm/rui-npm.mjs --help` runs without error.
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
      console.error(`❌ Unknown subcommand: ${command}`);
      console.error("   Available commands: search, install, update, list, info, uninstall, publish, npx, audit, cdn, login, my-packages, deprecate, unpublish");
      console.error("   View help: rui-npm --help");
      process.exit(1);
  }
}

main();