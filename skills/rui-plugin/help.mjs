#!/usr/bin/env node
// rui-plugin — .claude-plugin/ directory lifecycle management help
// 用法: node skills/rui-plugin/help.mjs 或 /rui-plugin --help

const { bold, underline, dim, yellow, green, cyan, red } = (() => {
  const make = (code) => (s) => `\x1b[${code}m${s}\x1b[0m`;
  const e = {
    bold: make(1), underline: make(4), dim: make(2),
    yellow: make(33), green: make(32), cyan: make(36), red: make(31),
  };
  if (!process.stdout.isTTY) {
    for (const k of Object.keys(e)) e[k] = (s) => s;
  }
  return e;
})();

const INDENT = "  ";
const LEFT_COLUMN_WIDTH = 30;
const COLUMN_MIN_PADDING = 2;

function hdr(text) {
  return `\n${bold(underline(text))}\n`;
}

function subhdr(text) {
  return `\n${bold(text)}`;
}

function item(cmd, desc, colorFn) {
  const left = `${INDENT}${cmd}`;
  const pad = Math.max(COLUMN_MIN_PADDING, LEFT_COLUMN_WIDTH - left.length);
  return `${colorFn ? colorFn(left) : left}${" ".repeat(pad)}${desc}`;
}

function section(title, entries) {
  return hdr(title) + entries.map(([c, d, color]) => item(c, d, color)).join("\n");
}

function line(text) {
  return `${INDENT}${text}`;
}

function para(text) {
  return `\n${INDENT}${text}`;
}

function flag(name, desc) {
  return item(`--${name}`, desc, yellow);
}

const help = `
${bold("# rui-plugin — .claude-plugin/ 生命周期管理")}

${dim("版本校验 · 统一升级 · 健康分析 · 发布准备 | 与 /rui-claude 互补")}

${hdr("用法")}
${item("/rui-plugin --help, -h, help", "显示此帮助信息")}
${item("/rui-plugin validate", "版本一致性校验")}
${item("/rui-plugin bump <version>", "统一版本升级 (semver)")}
${item("/rui-plugin health", "插件健康分析")}
${item("/rui-plugin publish-prep", "发布准备检查")}

${hdr("命令详解")}

${subhdr("validate — 版本一致性校验")}
${item("执行: node skills/rui-plugin/validate.mjs", "", dim)}
${item("数据源: version-sources.json 定义的各版本声明", "", dim)}
${item("行为: 只读，逐项提取版本号 → 比对", "", dim)}
${item("退出: 0 = 一致, 1 = 不一致或读取失败", "", dim)}

${subhdr("bump — 统一版本升级")}
${item("用法: /rui-plugin bump <x.y.z>", "", green)}
${item("前置: 工作区干净（无未提交变更）+ semver 格式", "", dim)}
${item("行为: 原子更新所有声明位置，任一失败则全部回滚", "", dim)}
${item("退出: 0 = 成功, 1 = 格式非法, 2 = dirty, 3 = 写入失败", "", dim)}

${subhdr("health — 插件健康分析")}
${item("检查维度:", "", dim)}
${item("① plugin.json 必填字段完整性", "", dim)}
${item("② marketplace.json 存在性与一致性", "", dim)}
${item("③ 版本一致性 (plugin.json ↔ CLAUDE.md)", "", dim)}
${item("④ 必需目录存在 (skills/ agents/ rules/)", "", dim)}
${item("⑤ marketplace.json plugins[].path 有效性", "", dim)}
${item("退出: 0 = healthy, 1 = error", "", dim)}

${subhdr("publish-prep — 发布准备检查")}
${item("串联 validate + health + 必需文档检查", "", dim)}
${item("退出: 0 = ready, 1 = blocked", "", dim)}

${hdr("常用场景示例")}
${item("# 查看当前版本一致性", "", bold)}
${item("/rui-plugin validate", "逐项显示各声明位置的版本号及一致性", green)}
${item("", "")}
${item("# 统一升级版本号", "", bold)}
${item("/rui-plugin bump 1.6.0", "原子更新所有声明位置到 1.6.0", green)}
${item("", "")}
${item("# 全面健康检查", "", bold)}
${item("/rui-plugin health", "多维度检查 + 分类报告 (pass/warn/error)", green)}
${item("", "")}
${item("# 发布前检查", "", bold)}
${item("/rui-plugin publish-prep", "串联所有检查 → 就绪/阻断清单", green)}
${item("", "")}
${item("# 升级后验证", "", bold)}
${item("/rui-plugin bump 1.6.0", "先升级", green)}
${item("/rui-plugin validate", "再验证一致性", green)}

${hdr("操作边界")}
${item("✅ .claude-plugin/", "plugin.json · marketplace.json · version-sources.json", green)}
${item("✅ CLAUDE.md", "版本声明行", green)}
${item("❌ .claude/", "不可触及", red)}
${item("❌ 业务源码", "不可触及", red)}

${hdr("核心规则")}
${line(dim("1. 操作范围仅限 .claude-plugin/ + CLAUDE.md 版本行"))}
${line(dim("2. validate 只读不写"))}
${line(dim("3. bump 原子化 — 全部更新或全部回滚"))}
${line(dim("4. 版本号格式严格 semver（/^\\d+\\.\\d+\\.\\d+$/）"))}
${line(dim("5. 密钥不落盘 — 脚本不含 token"))}

${hdr("退出码速查")}
${item("validate", "0 = 一致, 1 = 不一致")}
${item("bump", "0 = 成功, 1 = 格式, 2 = dirty, 3 = 写入失败")}
${item("health", "0 = healthy, 1 = error")}
${item("publish-prep", "0 = ready, 1 = blocked")}

${hdr("相关资源")}
${item("SKILL.md", "skills/rui-plugin/SKILL.md — 完整规约", dim)}
${item("version-sources.json", "skills/rui-plugin/version-sources.json — 版本源定义", dim)}
${item("rui-claude", "/rui-claude — .claude/ 目录管理（互补）", dim)}

${dim("详细说明: skills/rui-plugin/SKILL.md")}
`;

console.log(help);
