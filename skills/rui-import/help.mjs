#!/usr/bin/env node
// rui-import — Batch sync local documents to remote API help
// 用法: node skills/rui-import/help.mjs 或 /rui-import --help

import { bold, dim, yellow, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui-import — 文档批量同步到远端")}

${dim("扫描 · 过滤 · 路径映射 · 上传 | rui 管线强制集成")}

${hdr("快速入门")}
${item("/rui-import workspace=true", "项目根全量扫描 + 上传（最常用）", cyan)}
${item("/rui-import", "状态检测：token / 远端可达性 / 文件差异 → 推荐任务", cyan)}
${item("/rui-import mode=list", "仅枚举不上传，输出文件清单", cyan)}

${hdr("参数")}

${subhdr("路径控制")}
${item("workspace=true", "项目根全量扫描 + 上传", cyan)}
${item("dir=<absolute path>", "指定目录扫描 + 上传", cyan)}
${item("prefix=a,b", "远端路径前缀（多级目录）", yellow)}
${item("file=<path>", "单文件导入（自动附加三组语义标签）", cyan)}
${item("exclude=tmp,build", "追加排除子目录", yellow)}

${subhdr("文件过滤")}
${item("exts=md,json,yaml", "覆盖默认扩展名（默认：md）", yellow)}
${item("names=a,b", "按文件名关键词过滤（pull 模式精确拉取）", yellow)}

${subhdr("模式控制")}
${item("mode=list", "仅枚举不上传，输出文件清单", cyan)}
${item("mode=pull", "远端→本地下载（需配合 dir=）", cyan)}

${subhdr("其他")}
${item("apiUrl=<url>", "覆盖默认 API 地址", yellow)}

${hdr("使用场景")}
${scene("全量同步")}
${item("/rui-import workspace=true", "扫描项目根全部 .md + .claude/ → 上传", cyan)}
${scene("从远端拉取故事文档")}
${item("/rui-import dir=docs/故事任务面板/user-login/ mode=pull", "远端 → 本地覆盖", cyan)}
${scene("从远端拉取 .claude/ 配置")}
${item("/rui-import dir=.claude/ mode=pull", "远端 → 本地覆盖 .claude/ 全量", cyan)}
${scene("同步指定目录 + 多文件类型")}
${item("/rui-import dir=/path/to/docs exts=md,json,yaml", "仅该目录下的 md/json/yaml", cyan)}
${scene("全量 + 排除临时目录")}
${item("/rui-import workspace=true exclude=tmp,vendor", "跳过 tmp/ 和 vendor/", cyan)}
${scene("预览不上传")}
${item("/rui-import workspace=true mode=list", "列出待上传文件清单", cyan)}
${scene("带远端前缀上传")}
${item("/rui-import workspace=true prefix=docs,api-v2", "远端路径前追加 docs/api-v2/", cyan)}
${scene("按文件名关键词精确拉取")}
${item("/rui-import dir=docs/故事任务面板/user-login/ mode=pull names=技术评审,安全审计", "仅拉取名中含「技术评审」或「安全审计」的文件", cyan)}
${scene("覆盖远端 API 地址")}
${item("/rui-import workspace=true apiUrl=https://staging-api.example.com", "切换 API 目标（如预发验证）", cyan)}
${scene("先预览再同步（安全工作流）")}
${item("/rui-import workspace=true mode=list", "Step 1：预览待上传文件清单", cyan)}
${item("/rui-import workspace=true", "Step 2：确认无误后实际同步", cyan)}
${scene("仅同步 .claude/ 配置到远端")}
${item("/rui-import dir=.claude/", "扫描 .claude/ 全量 → 上传到远端", cyan)}
${scene("拉取单个故事的全部文档")}
${item("/rui-import dir=docs/故事任务面板/user-login/ mode=pull", "从远端拉取整个故事目录覆盖本地", cyan)}
${scene("单文件导入（自动语义标签）")}
${item("/rui-import file=docs/故事任务面板/user-login/故事任务.md", "导入单个文件，自动附加 stage:doc / type:task / baseline:problem 标签", cyan)}
`;

console.log(help);
