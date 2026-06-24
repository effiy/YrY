/**
 * loop-registry — Single source of truth for skill loop engineering metadata.
 *
 * Consumed by:
 *   - skills/rui-bot/lib/loop-report.mjs  — dispatches per-skill self-loop HTML reports
 *   - skills/rui-init/SKILL.md step 8a    — registers cron tasks per skill
 *
 * Adding a new skill's loop:
 *   1. Add a record to LOOP_SKILLS (with intervalCron + checkMode + checkScript)
 *   2. Add checklist to LOOP_CHECK_ITEMS
 *   3. Add cross-reference to LOOP_CROSS_REFS
 *   4. rui-init step 8a will auto-register the cron task on next init (cli mode only)
 *
 * checkMode values:
 *   - "cli"    : checkScript is a real node/npx command that runs without interaction
 *   - "slash"  : triggered via /rui-xxx Claude Code slash command (no standalone CLI)
 *   - "manual" : orchestration-only, triggered by /rui yry or /rui-init (no auto cron)
 *
 * Only checkMode="cli" skills are eligible for cron registration via getCronEligibleSkills().
 *
 * See: skills/rui/rules/loop-engineering.md
 */

/**
 * 20 skills' loop metadata.
 * Fields follow the 6-field contract defined in rules/loop-engineering.md.
 * `virtual: true` marks entries that are not real skills (e.g. rui-config is a config file).
 */
export const LOOP_SKILLS = [
  {
    skill: "rui-trends",
    icon: "📡",
    label: "技术趋势监控",
    category: "监控",
    interval: "每周一早 9 点",
    intervalCron: "0 9 * * 1",
    checkMode: "cli",
    checkScript: "node skills/rui-trends/rui-trends.mjs",
    trigger: "项目处于活跃开发期（最近 7 天有 commit）",
    termination: "趋势数据源全部不可达 / 连续 3 次无新发现",
    iteration: "查询多源趋势 → 与上次快照对比 → 有变化时生成 D5 诊断注入",
    alertConditions: "连续 2 周无新信号",
    convergence: "无新趋势信号或所有信号已在诊断中覆盖",
    checkScript: "node skills/rui-trends/rui-trends.mjs",
    desc: "扫描 GitHub Trending、OSS Insight、TrendShift、Top-Starred 四大数据源，追踪技术趋势变化，分类打标(AI/LLM·Web/前端·后端/基础设施·DevOps·编程语言·安全)，生成独立 HTML 报告和聚合视图",
  },
  {
    skill: "rui-analysis",
    icon: "🔍",
    label: "代码健康看门狗",
    category: "质量",
    interval: "周一/周四早 8 点",
    intervalCron: "0 8 * * 1,4",
    fastIntervalCron: "0 */12 * * *",
    checkMode: "slash",
    checkScript: null,
    trigger: "最近 3 天有新 commit（git log --since='3 days ago' --oneline 非空）",
    termination: "连续 2 次无新增告警 / 全部维度正常",
    iteration: "① 五维全量分析 → ② 与上次基线对比 → ③ 有新增告警时生成 D3/D5 诊断注入 → ④ 推送通知（如有 Critical）→ ⑤ 保存基线",
    alertConditions: "复杂度热点 >5 个 / 文件修改频率 >10 次/周 / 与 D3 复杂度增长联动",
    convergence: "连续 2 次无新增告警且全部维度正常",
    desc: "代码与架构静态分析，检测复杂度热点、高频修改文件、循环依赖、上帝模块和孤立文件，结果输入 D2 质量退化诊断",
  },
  {
    skill: "rui-import",
    icon: "📤",
    label: "持续文档同步",
    category: "同步",
    interval: "每 30 分钟",
    intervalCron: "*/30 * * * *",
    checkMode: "cli",
    checkScript: "node skills/rui-import/sync.mjs workspace=true",
    trigger: "本地文档目录有变更（git diff --stat docs/ 非空）",
    termination: "API_X_TOKEN 失效 / 手动停止",
    iteration: "① workspace=true 全量扫描 → ② 对比远端 session → ③ 增量上传 → ④ 输出同步摘要",
    alertConditions: "failed > 0 或 no-token 降级 / 连续失败 3 次 / 同步延迟 >24h",
    convergence: "created=0 且 failed=0（全部同步）",
    desc: "本地文档与远端 API 双向同步，确保故事文档、知识图谱和项目基线保持一致，同步失败时触发 API 可达性告警",
  },
  {
    skill: "rui-story",
    icon: "📋",
    label: "故事状态轮询",
    category: "同步",
    interval: "每 5 分钟",
    intervalCron: "*/5 * * * *",
    checkMode: "cli",
    checkScript: "node skills/rui-story/rui-story.mjs overview",
    trigger: "有活跃故事（状态非'完成'）",
    termination: "所有故事状态为'完成' / API_X_TOKEN 失效",
    iteration: "overview 查询远端 → 对比上次状态 → 有变化时输出变更摘要",
    alertConditions: "分支隔离违规 → P0 / 任务逾期 >3 天 → P1",
    convergence: "无状态变更或全部故事闭合",
    desc: "轮询故事任务面板状态变更，检测分支隔离违规、任务逾期和阻塞项，变更自动同步到知识图谱",
  },
  {
    skill: "rui-claude",
    icon: "⚙️",
    label: "配置健康检查",
    category: "配置",
    interval: "每天早 10 点",
    intervalCron: "0 10 * * *",
    checkMode: "slash",
    checkScript: null,
    trigger: "最近 24 小时有远程配置更新",
    termination: "连续 3 次检查无漂移",
    iteration: "① health 全量检查 → ② 对比上次快照 → ③ 有漂移时建议 sync → ④ 生成健康报告",
    alertConditions: "配置漂移 / 版本不一致 / 文件缺失 / 多目录配置漂移",
    convergence: "连续 3 次检查无漂移",
    desc: "检查 .claude/ 目录配置完整性，验证 settings.json、hooks、MCP 服务器配置，检测多目录配置漂移",
  },
  {
    skill: "rui-bot",
    icon: "💬",
    label: "通知队列轮询",
    category: "通知",
    interval: "每 5 分钟",
    intervalCron: "*/5 * * * *",
    checkMode: "cli",
    checkScript: "node skills/rui-bot/send.mjs flush",
    trigger: "通知日志中有未发送条目 / 其他模块自循环有新结果",
    termination: "队列为空 / webhook 失效",
    iteration: "扫描通知日志 → 批量发送 → 汇总自循环报告 → 更新发送状态",
    alertConditions: "投递成功率 <80% / 队列积压 >10 条 / webhook 响应 >2s",
    convergence: "所有 pending 条目已发送或标记 failed",
    desc: "轮询企微通知失败队列，自动重试失败消息，监控 webhook 响应时间，检测通知投递成功率",
  },
  {
    skill: "rui-npm",
    icon: "📦",
    label: "依赖安全审计",
    category: "安全",
    interval: "每周一早 8 点",
    intervalCron: "0 8 * * 1",
    checkMode: "cli",
    checkScript: "node skills/rui-npm/rui-npm.mjs",
    trigger: "当前目录存在 package.json",
    termination: "连续 2 次 audit 无新增漏洞",
    iteration: "① npm audit → ② 对比上次结果 → ③ 有新增漏洞时告警 → ④ 生成修复建议",
    alertConditions: "新增 Critical/High 漏洞 / 许可证违规",
    convergence: "连续 2 次 audit 无新增漏洞",
    desc: "审计 npm 依赖安全漏洞(CVE)，检查许可证合规性，验证版本锁定完整性，发现高危漏洞立即告警",
  },
  {
    skill: "self-improve",
    icon: "🔄",
    label: "持续自改进闭环",
    category: "改进",
    interval: "每周一早 9 点",
    intervalCron: "0 9 * * 1",
    checkMode: "manual",
    checkScript: null, // 由 /rui yry 手动触发
    trigger: "D0-D8 诊断触发率 >50% 或闭环中断",
    termination: "E1-E4 评估全部通过且无新诊断触发",
    iteration: "全自主扫描 → 诊断 → 实现 → 验证 → 版本升级四段闭环，驱动 D0-D8 九级诊断引擎和 E1-E4 四级评估",
    alertConditions: "诊断触发率 >50% / 闭环中断 / 改进建议采纳率 <70%",
    convergence: "E1-E4 评估全部通过且无新诊断触发",
    desc: "全自主扫描→诊断→实现→验证→版本升级四段闭环，驱动 D0-D8 九级诊断引擎和 E1-E4 四级评估",
  },
  {
    skill: "rui-html",
    icon: "🎨",
    label: "HTML 过期重生成",
    category: "同步",
    interval: "每 30 分钟",
    intervalCron: "*/30 * * * *",
    checkMode: "cli",
    checkScript: "node skills/rui-html/rui-html.mjs",
    trigger: "场景目录下 .md 文件的 mtime 晚于对应 .html",
    termination: "所有 HTML 均为最新",
    iteration: "① 扫描故事面板 → ② 对比 .md vs .html mtime → ③ 重新生成过期 HTML → ④ 输出更新摘要",
    alertConditions: "HTML 落后 .md > 1 小时 / 重生成失败",
    convergence: "所有场景 HTML 比对应 markdown 更新",
    desc: "检测 Markdown 文档变更，自动重生成 7 类标准 HTML 文档(架构图·知识图谱·测试面板·演示·审查·计划清单·源码)",
  },
  {
    skill: "rui-doc",
    icon: "📝",
    label: "文档新鲜度检查",
    category: "质量",
    interval: "工作日早 8 点",
    intervalCron: "0 8 * * 1-5",
    checkMode: "slash",
    checkScript: null,
    trigger: "源码目录有新 commit 但对应故事文档未更新",
    termination: "所有故事文档与源码同步",
    iteration: "① 扫描故事面板 → ② 对比文档 mtime 与源码最后 commit 时间 → ③ 列出过期文档 → ④ 生成更新建议",
    alertConditions: "文档 mtime < 源码最后 commit 时间 > 7 天 / 断链引用 >10 个",
    convergence: "所有文档 mtime ≥ 最后相关 commit 时间",
    desc: "检查所有文档的更新时间和新鲜度，检测过期文档、断链引用和过时内容，触发 D6 文档过时诊断",
  },
  {
    skill: "rui-version",
    icon: "🏷️",
    label: "版本漂移检测",
    category: "配置",
    interval: "每周一早 9 点",
    intervalCron: "0 9 * * 1",
    checkMode: "slash",
    checkScript: null,
    trigger: "有新的 git tag 或 commit 但 version_history 未更新",
    termination: "四文件版本号一致且与 git tag 对齐",
    iteration: "① 检查 plugin.json → ② 检查 CLAUDE.md → ③ 检查 README.md → ④ 检查 marketplace.json → ⑤ 对比版本号 → ⑥ 不一致时生成修复建议",
    alertConditions: "四文件版本号不一致 / 版本号与 git tag 不对齐 / 版本号出现跳号 / 连续 2 次不一致",
    convergence: "四文件版本号一致且与 git tag 对齐",
    desc: "检测 plugin.json 与实际 skills 内容版本号一致性，验证 package.json、CHANGELOG、README 版本同步",
  },
  {
    skill: "rui-plan",
    icon: "📐",
    label: "计划新鲜度检查",
    category: "质量",
    interval: "工作日早 8 点",
    intervalCron: "0 8 * * 1-5",
    checkMode: "slash",
    checkScript: null,
    trigger: "故事文档已更新但 plan.html 未重新生成",
    termination: "所有活跃故事的 plan.html 均为最新",
    iteration: "① 扫描活跃故事 → ② 对比文档 mtime vs plan.html mtime → ③ 列出过期计划 → ④ 生成重新规划建议",
    alertConditions: "plan.html mtime < 文档 mtime > 3 天 / 逾期任务 >3 / 无分配任务 >5",
    convergence: "所有活跃故事的 plan.html mtime ≥ 文档 mtime",
    desc: "检查实施计划的新鲜度和执行进度，检测逾期任务、未分配任务和阻塞项，计划偏离超过阈值时触发告警",
  },
  // --- 8 skills below were previously missing from the central dispatcher ---
  {
    skill: "rui-bundle-analyze",
    icon: "📊",
    label: "体积与依赖看门狗",
    category: "质量",
    interval: "每周一早 9 点",
    intervalCron: "0 9 * * 1",
    fastIntervalCron: "0 */6 * * *",
    checkMode: "cli",
    checkScript: "node skills/rui-bundle-analyze/analyze.mjs",
    trigger: "最近 7 天有新 commit（通过 git log --since 检测）",
    termination: "连续 2 次无新增告警",
    iteration: "① 全量分析 → ② 与基线对比 → ③ 检测告警条件 → ④ 推送通知（如有告警）→ ⑤ 保存为新基线",
    alertConditions: "新增 >500KB 文件 / 总体积增长 >15% / 新增循环依赖 / 新增孤儿文件 >5 / 包进入 Zone-of-Pain / 新增重复文件组",
    convergence: "无新增告警且体积增长率 <5%",
    desc: "项目体积与依赖图谱静态分析，检测体积异常、循环依赖、孤儿文件和重复文件组，被 rui-yry D3/D5 诊断调用",
  },
  {
    skill: "rui-code",
    icon: "🔧",
    label: "代码质量看门狗",
    category: "质量",
    interval: "工作日早 8 点",
    intervalCron: "0 8 * * 1-5",
    checkMode: "slash",
    checkScript: null,
    trigger: "有活跃 feat/* 分支且有未提交变更",
    termination: "所有 feat 分支已合并或关闭",
    iteration: "① 扫描活跃 feat 分支 → ② 检查 P0 清零状态 → ③ 检查 Gate B 轮次 → ④ 检查影响链闭合 → ⑤ 有异常时生成诊断",
    alertConditions: "P0 未清零 > 24h / Gate B 卡在第 2 轮 / 影响链未闭合",
    convergence: "所有活跃 feat 分支 P0 清零且 Gate B 通过",
    desc: "代码质量看门狗，监控活跃 feat 分支的 P0 清零状态、Gate B 轮次和影响链闭合情况",
  },
  {
    skill: "rui-health",
    icon: "🩺",
    label: "健康看门狗",
    category: "质量",
    interval: "每 30 分钟",
    intervalCron: "*/30 * * * *",
    checkMode: "cli",
    checkScript: "node skills/rui-bot/send.mjs health --html",
    trigger: "始终触发（定时任务）",
    termination: "手动停止",
    iteration: "① 16 维诊断 → ② D0-D8 引擎 → ③ 评分 + 趋势 → ④ HTML 报告 → ⑤ JSONL 持久化 → ⑥ (可选) 企微通知",
    alertConditions: "综合分 < 60 / 单维度归零 / 连续 3 次下降 / 新增诊断触发",
    convergence: "综合分 ≥ 80 且无新增诊断触发",
    desc: "健康看门狗，定时运行 16 维诊断，持续追踪项目健康度并生成 HTML 报告 + JSONL 趋势持久化",
  },
  {
    skill: "rui-init",
    icon: "🚀",
    label: "初始化健康检查",
    category: "配置",
    interval: "按需触发",
    intervalCron: null, // 按需触发，不注册 cron
    checkMode: "manual",
    checkScript: null,
    trigger: "项目首次初始化或重大结构变更",
    termination: "init 流程完成且工程化成熟度已评估",
    iteration: "① detect → ② explore → ③ generate → ④ arch → ⑤ setup → ⑥ verify → ⑦ maturity → ⑧ trigger",
    alertConditions: "验证失败 / 工程化成熟度评分 < C 级",
    convergence: "init 完成 + 健康报告 + 自循环报告生成 + cron 任务注册",
    desc: "项目初始化健康检查，驱动 8 阶段 init 流程并生成健康报告与自循环报告",
  },
  {
    skill: "rui-update",
    icon: "🔄",
    label: "增量更新检查",
    category: "质量",
    interval: "周一/周四早 8 点",
    intervalCron: "0 8 * * 1,4",
    checkMode: "slash",
    checkScript: null,
    trigger: "有故事文档 mtime 落后于相关源码 commit",
    termination: "所有故事文档与源码同步",
    iteration: "① 扫描故事面板 → ② 对比文档 mtime vs 源码 commit → ③ 自动判定 T 级别 → ④ 生成更新建议 → ⑤ 推送通知（如有 T3 需求）",
    alertConditions: "文档落后源码 > 7 天 / 检测到 T3 级别变更需求",
    convergence: "所有故事文档与源码同步",
    desc: "增量更新健康检查，检测是否有遗漏的更新需求并自动判定 T1/T2/T3 级别",
  },
  {
    skill: "rui-skills",
    icon: "🧩",
    label: "技能生态巡检",
    category: "安全",
    interval: "每周一早 9 点",
    intervalCron: "0 9 * * 1",
    checkMode: "cli",
    checkScript: "npx skills check",
    trigger: "有已安装技能（npx skills list 非空）",
    termination: "所有技能为最新版本且无新 CVE",
    iteration: "① npx skills check → ② npm audit 已安装技能 → ③ 有更新时审查变更日志 → ④ 有 CVE 时告警 → ⑤ 生成更新建议",
    alertConditions: "技能落后 ≥ 1 major / 新增 CVE / 技能仓库归档或删除",
    convergence: "无可用更新且无安全漏洞",
    desc: "技能生态健康巡检，检查已安装技能的更新和安全性",
  },
  {
    skill: "rui-reporter",
    icon: "📈",
    label: "报告新鲜度巡检",
    category: "质量",
    interval: "周一/周四早 8 点",
    intervalCron: "0 8 * * 1,4",
    checkMode: "slash",
    checkScript: null,
    trigger: "有活跃故事（状态非'改进'）且报告 mtime 落后于源码变更",
    termination: "所有活跃故事报告均为最新",
    iteration: "① 扫描活跃故事 → ② 对比报告 mtime vs 源码 commit 时间 → ③ 列出过期报告 → ④ 重新生成 → ⑤ 知识策展（如有新模式）",
    alertConditions: "报告过期 > 7 天 / 知识图谱不一致",
    convergence: "所有报告 mtime ≥ 最后相关 commit 时间",
    desc: "报告新鲜度巡检，检测过期报告并自动重新生成，含知识策展",
  },
  {
    skill: "rui-yry",
    icon: "🌀",
    label: "自改进编排闭环",
    category: "改进",
    interval: "每周一早 9 点",
    intervalCron: "0 9 * * 1",
    checkMode: "manual",
    checkScript: null, // rui-yry 是编排器，由 /rui yry 手动触发
    trigger: "D0-D8 诊断触发率 >50% 或闭环中断",
    termination: "E1-E4 评估全部通过且无新诊断触发",
    iteration: "扫描 → 诊断 D0-D8 → 经验技能化 → 实现 → 验证 → 效果评估 E1-E4 → 版本升级",
    alertConditions: "闭环中断 / 诊断触发率 >50% / E1-E4 评估未通过",
    convergence: "E1-E4 评估全部通过且无新诊断触发",
    desc: "自改进编排闭环，驱动 D0-D8 诊断引擎和 E1-E4 效果评估的四段闭环",
  },
  // --- virtual entry: config file, not a real skill ---
  {
    skill: "rui-config",
    icon: "⚙️",
    label: "配置完整性",
    category: "配置",
    interval: "每天早 10 点",
    intervalCron: "0 10 * * *",
    checkMode: "manual",
    checkScript: null, // 由 rui-claude 覆盖，不单独注册 cron
    trigger: ".claude/skills/rui-bot/config.json 存在",
    termination: "配置完整且格式正确",
    iteration: "① 检查 config.json → ② 验证 webhook 配置 → ③ 验证通知开关 → ④ 验证环境变量",
    alertConditions: "config.json 缺失 / 机器人未配置 / 环境变量缺失",
    convergence: "配置完整且格式正确",
    desc: "配置完整性检查（rui-bot config.json），由 rui-claude 巡检覆盖",
    virtual: true,
  },
];

/**
 * Cross-references between skills and health dimensions / diagnostics.
 * Used by loop-report.mjs to render the "影响与联动" section.
 */
export const LOOP_CROSS_REFS = {
  "rui-trends":      { dim: "D5 外部趋势诊断", desc: "趋势数据影响自循环报告新鲜度和 D5 诊断信号，过时趋势可能导致技术选型决策失误", impact: "连续 2 周无新信号 → P1 · 3 周以上 → P0 · 与 D4 依赖过期联动评估替代方案" },
  "rui-analysis":    { dim: "D2 质量退化诊断", desc: "代码分析结果直接输入 D2 质量退化检测，高频修改文件和复杂度热点是质量热点的核心信号", impact: "复杂度热点 >5 个 → P1 · 文件修改频率 >10 次/周 → P2 · 与 D3 复杂度增长联动" },
  "rui-import":      { dim: "API 可达性", desc: "文档同步依赖 API 可达性，失败时导致远端与本地文档基线不一致", impact: "连续失败 3 次 → P1 · 同步延迟 >24h → P2 · 影响 D6 文档过时诊断" },
  "rui-story":       { dim: "Git 仓库状态", desc: "故事状态变更涉及 Git 分支和索引更新，分支隔离违规为 P0 事件", impact: "分支隔离违规 → P0 · 任务逾期 >3 天 → P1 · 影响 D0 基线偏离诊断" },
  "rui-claude":      { dim: "配置文件", desc: "配置健康直接影响 .claude/ 完整性评分，多目录配置漂移触发 D6 诊断", impact: "配置缺失 → P1 · 多目录漂移 → P2 · 影响技能加载和通知路由" },
  "rui-bot":         { dim: "机器人配置", desc: "通知投递依赖机器人 webhook 配置和 API 可达性，失败队列堆积影响消息时效", impact: "投递成功率 <80% → P1 · 队列积压 >10 条 → P2 · 所有诊断告警依赖通知通道" },
  "rui-npm":         { dim: "依赖管理", desc: "依赖安全审计结果输入工程化成熟度-依赖管理维度，已知漏洞触发 P0 安全告警", impact: "高危 CVE → P0 · 中危 CVE → P1 · 许可证违规 → P1 · 与 D4 依赖退化联动" },
  "self-improve":    { dim: "D0-D8 诊断", desc: "自改进闭环是 D0-D8 诊断的主要触发源，驱动全维度健康检查", impact: "诊断触发率 >50% → P1 · 闭环中断 → P0 · 影响 E1-E4 评估效能" },
  "rui-html":        { dim: "文档新鲜度", desc: "HTML 过期重生成确保 Markdown→HTML 文档同步，过期文档影响信息准确性", impact: "重生成失败 → P1 · 文档过期 >7 天 → P2 · 与 D6 文档过时诊断联动" },
  "rui-doc":         { dim: "D6 文档过时诊断", desc: "文档新鲜度检查确保所有文档内容及时更新，过时文档影响决策质量", impact: "过期文档 >5 个 → P1 · 断链引用 >10 个 → P2 · 影响知识传承和新人上手" },
  "rui-version":     { dim: "D7 配置漂移诊断", desc: "版本漂移检测确保 plugin.json、package.json、CHANGELOG 版本号一致", impact: "版本不一致 → P1 · 连续 2 次不一致 → P0 · 影响自托管一致性和发布流程" },
  "rui-plan":        { dim: "计划执行健康", desc: "计划新鲜度检查确保实施计划与实际进度一致，偏离计划影响交付可预测性", impact: "逾期任务 >3 → P1 · 无分配任务 >5 → P2 · 影响 D0 基线偏离诊断" },
  "rui-config":      { dim: "配置完整性", desc: "配置完整性检查确保所有技能配置文件存在且格式正确，配置缺失导致功能不可用", impact: "config.json 缺失 → P0 · 机器人未配置 → P1 · 影响所有通知和自动化功能" },
  "rui-bundle-analyze": { dim: "D3 复杂度增长诊断", desc: "体积与依赖分析结果输入 D3 复杂度增长诊断，Treemap 和依赖图谱是核心信号", impact: "新增 >500KB 文件 → P1 · 新增循环依赖 → P0 · 与 D2 质量退化联动" },
  "rui-code":        { dim: "D0 基线偏离诊断", desc: "代码质量看门狗结果输入 D0 基线偏离诊断，P0 未清零是核心信号", impact: "P0 未清零 >24h → P0 · Gate B 卡在第 2 轮 → P1 · 影响交付可预测性" },
  "rui-health":      { dim: "综合健康度", desc: "健康看门狗是所有维度的聚合器，趋势数据驱动 D0-D8 诊断引擎", impact: "综合分 <60 → P0 · 单维度归零 → P1 · 连续 3 次下降 → P1" },
  "rui-init":        { dim: "初始化基线", desc: "初始化健康检查建立项目基线，工程化成熟度评分影响后续诊断阈值", impact: "验证失败 → P0 · 成熟度 <C 级 → P1 · 影响 cron 任务注册" },
  "rui-update":      { dim: "D6 文档过时诊断", desc: "增量更新检查结果输入 D6 文档过时诊断，T3 级别变更触发告警", impact: "文档落后源码 >7 天 → P1 · T3 变更 → P2 · 与 rui-doc 联动" },
  "rui-skills":      { dim: "依赖管理", desc: "技能生态巡检结果输入依赖管理维度，CVE 触发安全告警", impact: "新增 CVE → P0 · 技能落后 ≥1 major → P1 · 仓库归档 → P2" },
  "rui-reporter":    { dim: "D6 文档过时诊断", desc: "报告新鲜度巡检结果输入 D6 文档过时诊断，知识图谱不一致触发告警", impact: "报告过期 >7 天 → P1 · 知识图谱不一致 → P0 · 与 rui-doc 联动" },
  "rui-yry":         { dim: "D0-D8 诊断", desc: "自改进编排闭环驱动全维度诊断，是 D0-D8 的编排入口", impact: "闭环中断 → P0 · 诊断触发率 >50% → P1 · 影响 E1-E4 评估效能" },
};

/**
 * Per-skill check item checklists for the loop report "检查清单" section.
 * Each item: { label, keyword, target }
 * `keyword` is matched against finding titles to determine pass/warn/fail state.
 */
export const LOOP_CHECK_ITEMS = {
  "rui-trends": [
    { label: "数据源 API 可达性", keyword: "可达", target: "4/4 源可达" },
    { label: "趋势条目捕获数量", keyword: "条目", target: "≥10 条目" },
    { label: "分类打标准确率", keyword: "分类", target: "≥90% 准确" },
    { label: "HTML 报告生成", keyword: "报告", target: "生成成功" },
    { label: "趋势清单更新", keyword: "清单", target: "更新成功" },
  ],
  "rui-analysis": [
    { label: "复杂度热点检测", keyword: "复杂度", target: "≤3 热点" },
    { label: "高频修改文件追踪", keyword: "高频", target: "≤3 文件" },
    { label: "循环依赖扫描", keyword: "循环", target: "0 循环" },
    { label: "上帝模块检测", keyword: "上帝", target: "≤2 模块" },
    { label: "架构合规验证", keyword: "架构", target: "16/16 通过" },
  ],
  "rui-npm": [
    { label: "安全漏洞扫描 (CVE)", keyword: "漏洞", target: "0 高危" },
    { label: "许可证合规检查", keyword: "许可", target: "全部合规" },
    { label: "版本锁定完整性", keyword: "版本", target: "lockfile 存在" },
    { label: "依赖过期检测", keyword: "过期", target: "≤5 过期" },
  ],
  "rui-bot": [
    { label: "通知投递成功率", keyword: "投递", target: "≥95%" },
    { label: "失败队列积压量", keyword: "队列", target: "≤5 条" },
    { label: "Webhook 响应时间", keyword: "webhook", target: "≤2s" },
    { label: "机器人配置完整性", keyword: "配置", target: "全部就绪" },
  ],
  "rui-version": [
    { label: "plugin.json 版本一致性", keyword: "plugin", target: "与 skills 一致" },
    { label: "package.json 版本同步", keyword: "package", target: "与 plugin 一致" },
    { label: "CHANGELOG 版本记录", keyword: "changelog", target: "最新版本已记录" },
    { label: "README 版本号更新", keyword: "readme", target: "版本号正确" },
  ],
  "rui-config": [
    { label: "config.json 文件存在", keyword: "config", target: "文件存在" },
    { label: "机器人 webhook 配置", keyword: "webhook", target: "≥1 机器人" },
    { label: "通知开关配置", keyword: "通知", target: "配置正确" },
    { label: "环境变量完整性", keyword: "环境", target: "API_X_TOKEN 存在" },
  ],
  "rui-story": [
    { label: "故事面板数据同步", keyword: "同步", target: "同步成功" },
    { label: "分支隔离合规", keyword: "分支", target: "无违规" },
    { label: "任务逾期检测", keyword: "逾期", target: "0 逾期" },
    { label: "知识图谱一致性", keyword: "图谱", target: "一致" },
  ],
  "rui-plan": [
    { label: "计划新鲜度", keyword: "新鲜", target: "≤7 天" },
    { label: "任务分配完整", keyword: "分配", target: "全部已分配" },
    { label: "进度偏差检测", keyword: "偏差", target: "≤20%" },
    { label: "阻塞项扫描", keyword: "阻塞", target: "0 阻塞" },
  ],
  "rui-html": [
    { label: "Markdown 变更检测", keyword: "变更", target: "检测正常" },
    { label: "HTML 重生成成功率", keyword: "重生成", target: "100%" },
    { label: "7 类文档覆盖", keyword: "文档", target: "全部覆盖" },
    { label: "CDN 组件引用更新", keyword: "cdn", target: "引用正确" },
  ],
  "rui-import": [
    { label: "API 端点可达性", keyword: "可达", target: "可达" },
    { label: "文档双向同步", keyword: "同步", target: "同步成功" },
    { label: "同步延迟", keyword: "延迟", target: "≤30min" },
    { label: "冲突检测", keyword: "冲突", target: "0 冲突" },
  ],
  "rui-doc": [
    { label: "文档新鲜度检查", keyword: "新鲜", target: "≤7 天" },
    { label: "断链引用检测", keyword: "断链", target: "0 断链" },
    { label: "SKILL.md 完整性", keyword: "skill", target: "全部完整" },
    { label: "AGENT.md 完备性", keyword: "agent", target: "全部完备" },
  ],
  "rui-claude": [
    { label: ".claude/ 目录完整性", keyword: "claude", target: "文件齐全" },
    { label: "settings.json 格式", keyword: "settings", target: "格式正确" },
    { label: "多目录配置一致性", keyword: "漂移", target: "无漂移" },
    { label: "Hook 配置有效性", keyword: "hook", target: "全部有效" },
  ],
  "self-improve": [
    { label: "D0-D8 诊断覆盖率", keyword: "诊断", target: "8/8 覆盖" },
    { label: "E1-E4 评估效能", keyword: "评估", target: "全部通过" },
    { label: "改进建议采纳率", keyword: "采纳", target: "≥70%" },
    { label: "闭环周期完成率", keyword: "闭环", target: "100%" },
  ],
  // --- 8 new skills' checklists ---
  "rui-bundle-analyze": [
    { label: "体积增长检测", keyword: "体积", target: "≤15%" },
    { label: "大文件扫描", keyword: "大文件", target: "0 个 >500KB" },
    { label: "循环依赖检测", keyword: "循环", target: "0 循环" },
    { label: "孤儿文件检测", keyword: "孤儿", target: "≤5 个" },
    { label: "重复文件组检测", keyword: "重复", target: "0 新增组" },
  ],
  "rui-code": [
    { label: "P0 清零状态", keyword: "P0", target: "全部清零" },
    { label: "Gate B 轮次", keyword: "gate", target: "≤2 轮" },
    { label: "影响链闭合", keyword: "影响链", target: "全部闭合" },
    { label: "feat 分支健康度", keyword: "feat", target: "无阻塞" },
  ],
  "rui-health": [
    { label: "16 维诊断完整性", keyword: "维度", target: "16/16" },
    { label: "D0-D8 诊断引擎", keyword: "诊断", target: "运行成功" },
    { label: "综合分", keyword: "综合分", target: "≥80" },
    { label: "趋势持久化", keyword: "趋势", target: "JSONL 已追加" },
  ],
  "rui-init": [
    { label: "8 阶段流程完整", keyword: "阶段", target: "8/8 完成" },
    { label: "工程化成熟度评估", keyword: "成熟度", target: "≥C 级" },
    { label: "健康报告生成", keyword: "健康", target: "生成成功" },
    { label: "cron 任务注册", keyword: "cron", target: "全部注册" },
  ],
  "rui-update": [
    { label: "文档落后检测", keyword: "落后", target: "≤7 天" },
    { label: "T 级别判定", keyword: "T级别", target: "判定正确" },
    { label: "T3 变更告警", keyword: "T3", target: "0 未处理" },
    { label: "更新建议生成", keyword: "建议", target: "生成成功" },
  ],
  "rui-skills": [
    { label: "已安装技能扫描", keyword: "已安装", target: "扫描成功" },
    { label: "技能版本检查", keyword: "版本", target: "全部最新" },
    { label: "CVE 漏洞扫描", keyword: "CVE", target: "0 高危" },
    { label: "仓库状态检查", keyword: "仓库", target: "无归档" },
  ],
  "rui-reporter": [
    { label: "报告新鲜度检测", keyword: "新鲜", target: "≤7 天" },
    { label: "过期报告重生成", keyword: "过期", target: "全部最新" },
    { label: "知识图谱一致性", keyword: "图谱", target: "一致" },
    { label: "知识策展执行", keyword: "策展", target: "执行成功" },
  ],
  "rui-yry": [
    { label: "D0-D8 诊断触发", keyword: "诊断", target: "触发率 ≤50%" },
    { label: "E1-E4 评估通过", keyword: "评估", target: "全部通过" },
    { label: "闭环周期完成", keyword: "闭环", target: "100%" },
    { label: "版本升级执行", keyword: "版本", target: "升级成功" },
  ],
};

/**
 * Default fallback checklist when a skill is not in LOOP_CHECK_ITEMS.
 * Used by loop-report.mjs to ensure reports always render something.
 */
export const DEFAULT_CHECK_ITEMS = [
  { label: "定时巡检执行", keyword: "巡检", target: "执行成功" },
  { label: "报告生成", keyword: "报告", target: "生成成功" },
  { label: "数据完整性", keyword: "数据", target: "完整" },
  { label: "异常检测", keyword: "异常", target: "0 异常" },
];

/**
 * Lookup helper: get skill meta by skill id.
 * Returns a minimal record for unknown skills.
 */
export function getSkillMeta(skill) {
  const found = LOOP_SKILLS.find(s => s.skill === skill);
  return found || { skill, icon: "🔄", label: skill, interval: "—", category: "其他", desc: "" };
}

/**
 * Lookup helper: get check items for a skill, with default fallback.
 */
export function getCheckItems(skill) {
  return LOOP_CHECK_ITEMS[skill] || DEFAULT_CHECK_ITEMS;
}

/**
 * Lookup helper: get cross-reference for a skill.
 */
export function getCrossRef(skill) {
  return LOOP_CROSS_REFS[skill] || null;
}

/**
 * List of skills eligible for cron registration in rui-init step 8a.
 * Only checkMode="cli" skills (with real executable entry points) are eligible.
 * Excludes: virtual entries, slash/manual mode skills, skills without intervalCron.
 */
export function getCronEligibleSkills() {
  return LOOP_SKILLS.filter(s => !s.virtual && s.checkMode === "cli" && s.intervalCron && s.checkScript);
}

/**
 * Group skills by checkMode for reporting / documentation purposes.
 */
export function groupSkillsByCheckMode() {
  const groups = { cli: [], slash: [], manual: [] };
  for (const s of LOOP_SKILLS) {
    if (s.virtual) continue;
    const mode = s.checkMode || "manual";
    if (!groups[mode]) groups[mode] = [];
    groups[mode].push(s.skill);
  }
  return groups;
}
