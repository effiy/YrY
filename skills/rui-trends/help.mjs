#!/usr/bin/env node
// rui-trends — technology trend discovery
// 用法: node skills/rui-trends/help.mjs 或 /rui-trends --help

import { bold, dim, yellow, green, cyan } from '../../lib/tty.mjs';
import { hdr, subhdr, item, flag, scene } from '../../lib/help-layout.mjs';

const help = `
${bold("# rui-trends — 技术趋势发现")}

${dim("GitHub Trending · OSS Insight · TrendShift · Top-Starred")}

${hdr("快速入门")}
${item("/rui-trends status", "数据源可达性检查 + 最近查询时间", green)}
${item("/rui-trends all", "一键全量扫描 — 依次查询全部四个数据源", cyan)}
${item("/rui-trends --help", "显示此帮助信息", dim)}

${hdr("子命令")}

${subhdr("status — 数据源探活")}
${item("/rui-trends status", "检查各数据源可达性 + 最近查询时间", green)}

${subhdr("github-trending — GitHub Trending 热门仓库")}
${item("/rui-trends github-trending", "查询 GitHub Trending 当前榜单", green)}
${flag("lang <L>", "编程语言过滤（如 TypeScript, Rust, Go）")}
${flag("since daily|weekly", "时间窗口，默认 daily")}

${subhdr("oss-insight — OSS Insight 仓库排名")}
${item("/rui-trends oss-insight", "查询 OSS Insight 仓库排名数据", green)}
${flag("metric stars|forks|contributors", "排序指标，默认 stars")}
${flag("limit N", "返回结果数量，默认 20")}

${subhdr("trendshift — 趋势变化追踪")}
${item("/rui-trends trendshift", "查询 TrendShift 趋势变化数据", green)}
${flag("range 7|30|90", "时间范围（天），默认 30")}

${subhdr("top-starred — 高星项目发现")}
${item("/rui-trends top-starred", "查询 GitHub 高星项目", green)}
${flag("min-stars N", "最小 star 数过滤，默认 1000")}

${subhdr("find-skills — Agent 技能发现（桥接至 rui-skills）")}
${item("/rui-trends find-skills", "从 GitHub Trending 发现 Agent/技能仓库", yellow)}
${flag("lang <L>", "编程语言过滤")}

${subhdr("all — 全量趋势扫描")}
${item("/rui-trends all", "依次查询全部四个数据源，输出综合报告", cyan)}

${hdr("使用场景")}
${scene("技术选型评估")}
${item("/rui-trends github-trending --lang TypeScript", "了解 TypeScript 生态当前热门项目", green)}
${item("/rui-trends oss-insight --metric contributors", "按贡献者数评估社区活跃度", green)}
${item("/rui-trends trendshift --range 90", "识别过去 90 天快速上升的项目", green)}
${scene("架构验证")}
${item("/rui-trends top-starred --min-stars 5000", "查看社区验证的高星项目作为架构参照", green)}
${item("/rui-trends github-trending --since weekly", "每周趋势快照，跟踪技术方向变化", green)}
${scene("依赖健康检查（D5 诊断）")}
${item("/rui-trends oss-insight --metric stars", "评估候选依赖的社区认可度", green)}
${item("/rui-trends trendshift --range 30", "识别快速衰退或上升的依赖项目", green)}
${scene("自改进 — 新兴工具发现（D6 诊断）")}
${item("/rui-trends all", "全量扫描生成综合趋势报告，输入自改进闭环", cyan)}
${scene("Agent 技能发现")}
${item("/rui-trends find-skills --lang TypeScript", "从 GitHub Trending 发现 TypeScript 生态的 Agent/技能仓库", green)}

${hdr("故障排查")}
${item("github-trending 无数据", "GitHub 未认证限制 60 req/h；设置 GITHUB_TOKEN 提升", yellow)}
${item("oss-insight 无数据", "页面 JS 渲染无法提取；降级为手动访问 ossinsight.io", yellow)}
${item("所有源不可达", "标注 no-metrics，D5 诊断跳过，不计入退化窗口", yellow)}
${item("脚本超时", "逐个数据源查询而非并发；增加超时时间", yellow)}

${hdr("HTML 报告生成")}
${item("--html", "附加到任何子命令后，生成 HTML 趋势快照到 docs/趋势报告/", yellow)}
${item("node skills/rui-trends/rui-trends.mjs all --html", "全量扫描并生成综合趋势报告（推荐）", cyan)}
${scene("通知面板")}
${item("docs/index.html 通知面板 → 趋势发现 Tab", "展示趋势快照历史，铃铛计入趋势报告数", yellow)}

${hdr("可执行脚本")}
${item("node skills/rui-trends/rui-trends.mjs <cmd>", "命令行直接执行趋势查询", dim)}
${item("node skills/rui-trends/help.mjs", "显示此帮助信息", dim)}
`;

console.log(help);
