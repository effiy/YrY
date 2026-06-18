/**
 * rui-story cli — argument parsing and help delegation
 * Extracted from rui-story.mjs for single-responsibility
 */

import { bold, dim } from "../../../lib/tty.mjs";
import { NODE_ARGV_OFFSET } from "../../../lib/constants.mjs";
import { showPluginHelp } from "../../../lib/plugin-utils.mjs";

export const SKILL_NAME = "rui-story";
export const SHOW_MIN_ARGS = 2;

export function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  if (args.length === 0) return { command: "overview" };

  const cmd = args[0];

  if (cmd === "--help" || cmd === "-h" || cmd === "help") {
    return { command: "help" };
  }

  if (cmd === "overview" || cmd === "list" || cmd === "recommend" || cmd === "health" || cmd === "merge-to-main") {
    return { command: cmd };
  }

  if (cmd === "sync") {
    return { command: "sync", name: args[1] || null };
  }

  if (cmd === "show") {
    if (args.length < SHOW_MIN_ARGS) {
      console.error("rui-story: show 需要 <name> 参数");
      process.exit(1);
    }
    return { command: "show", name: args[1] };
  }

  console.error(`rui-story: 未知命令 "${cmd}"，使用 --help 查看帮助`);
  process.exit(1);
}

export function showHelp() {
  showPluginHelp(SKILL_NAME, fallbackHelp);
}

export function fallbackHelp() {
  console.log("");
  console.log(bold("rui-story — 故事任务面板管理"));
  console.log("");
  console.log(dim("远端查询 · 同步 · 健康检查 | 数据源为远端 API，不读本地文件系统"));
  console.log("");
  console.log(bold("只读命令（远端 API）"));
  console.log("  /rui-story                    状态概览");
  console.log("  /rui-story list               进度全景表格");
  console.log("  /rui-story health             健康检查");
  console.log("");
  console.log(bold("写入命令"));
  console.log("  /rui-story sync [<name>]      远端→本地 (委托 rui-import)");
  console.log("  /rui-story remove <name>      仅本地：删除故事目录");
  console.log("");
}
