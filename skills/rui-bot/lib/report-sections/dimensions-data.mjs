/**
 * report-sections/dimensions-data — Data tables for dimension panels.
 *
 * Split out from report-sections.mjs (originally ~1941 lines) so that the
 * dimension-build functions don't have to share a file with the (large)
 * fix-guidance methodology table.
 *
 * No runtime dependencies; both objects are pure data.
 */

/**
 * Per-dimension fix guidance.
 * Maps dimKey → { check, fix, impact } narrative.
 *
 * @type {Record<string, {check: string, fix: string, impact: string}>}
 */
export const DIM_FIX_GUIDANCE = {
  token: {
    check: "检查 API_X_TOKEN 环境变量是否正确配置",
    fix: "在 CI/CD 环境变量或 .env 文件中设置 API_X_TOKEN",
    impact: "影响所有通知发送功能",
  },
  config: {
    check: "检查 .claude/skills/rui-bot/config.json 文件是否存在",
    fix: "运行 rui-init 或手动创建配置文件，配置至少一个机器人 webhook",
    impact: "影响企微通知路由和机器人选择",
  },
  robots: {
    check: "检查每个机器人的 webhook_url 或 webhook_url_env 配置",
    fix: "在企业微信后台获取 Webhook 地址，填入 config.json 的 robots 字段",
    impact: "影响消息投递成功率",
  },
  api: {
    check: "分层检查 API 可达性: L1 配置(api_url+API_X_TOKEN) · L2 探测(POST 健康检查) · L3 历史投递(7天成功率)",
    fix: "L1: 确认 config.api_url 或默认 DEFAULT_API_URL, 设置 API_X_TOKEN 环境变量; L2: 确认网络可达, 环境性超时保留 15 分不归零; L3: 检查 .memory/notification-log.jsonl 投递成功率",
    impact: "影响通知发送链路稳定性评分 (配置缺失或真挂会暴露, 环境性不可达不拖累)",
  },
  reports: {
    check: "检查 docs/健康报告/ 目录是否存在且包含近期报告",
    fix: "运行 node skills/rui-bot/send.mjs health --html 生成报告",
    impact: "影响健康监控可见性和趋势分析",
  },
  format: {
    check: "检查通知消息是否包含必需字段（emoji、story、skill、status）",
    fix: "发送通知时确保 msgType 和对应字段完整；参考 FIELD_EMOJI 配置",
    impact: "影响消息格式合规性和可读性",
  },
  diagnostics: {
    check: "检查 .memory/execution-memory.jsonl 是否有足够执行记录",
    fix: "正常执行 rui 管线积累执行记录；确保 MIN_EXEC_MEMORIES ≥ 3",
    impact: "影响 D0-D8 诊断准确性和问题发现能力",
  },
  git: {
    check: "检查未提交文件数和分支状态",
    fix: "提交或暂存未提交文件；确保在正确的功能分支上工作",
    impact: "影响代码可追溯性和协作效率",
  },
  security: {
    check: "检查代码中是否包含硬编码密钥、Token、密码",
    fix: "将所有凭据移至环境变量；使用 .gitignore 排除敏感文件；运行安全扫描",
    impact: "P0 安全问题，可能导致凭据泄露",
  },
  file_size: {
    check: "检查是否有超过 50KB 的大文件或文件数量异常增长",
    fix: "拆分大文件（>500行）；检查 CDN 资源是否误提交到源码仓库",
    impact: "影响仓库克隆速度和编辑器性能",
  },
  dep_analysis: {
    check: "检查是否有循环依赖、上帝模块（≥10 依赖）或孤立文件",
    fix: "打破循环依赖（提取共享接口）；减少上帝模块依赖；清理或归档孤立文件",
    impact: "影响代码可维护性和模块化程度",
  },
  em_testing: {
    check: "检查测试框架配置和测试用例数量",
    fix: "安装 vitest/jest；添加测试脚本到 package.json；编写单元测试覆盖核心逻辑",
    impact: "影响代码质量保障和回归风险",
  },
  em_types: {
    check: "检查 TypeScript 配置和类型严格性",
    fix: "添加 tsconfig.json 并启用 strict 模式；为核心模块添加类型声明",
    impact: "影响代码健壮性和 IDE 智能提示",
  },
  em_linting: {
    check: "检查 ESLint、Prettier、EditorConfig 配置",
    fix: "安装 ESLint + Prettier；添加 .editorconfig；在 CI 中强制执行检查",
    impact: "影响代码风格一致性和可读性",
  },
  em_cicd: {
    check: "检查 CI/CD 管线配置和工作流数量",
    fix: "在 .github/workflows/ 中添加测试和部署工作流；配置自动化检查",
    impact: "影响自动化程度和交付速度",
  },
  em_docs: {
    check: "检查 README.md、CLAUDE.md、docs/ 目录是否齐全",
    fix: "补充 README 项目说明；完善 CLAUDE.md 开发指南；建立 docs/ 文档目录",
    impact: "影响新人上手速度和知识传承",
  },
  em_deps: {
    check: "检查 lockfile 存在性和版本管理脚本",
    fix: "提交 lockfile 到仓库；添加 version/release 脚本；定期更新依赖",
    impact: "影响构建可复现性和依赖安全",
  },
  em_git: {
    check: "检查 .gitignore、.gitattributes、PR 模板配置",
    fix: "添加 .gitignore 排除构建产物；配置 .gitattributes 换行符处理；添加 PR 模板",
    impact: "影响协作规范和代码审查质量",
  },
  comp_qual: {
    check: "检查组件的 SKILL.md/AGENT.md 完整性和代码质量",
    fix: "补充缺失的 SKILL.md；完善 frontmatter；添加 Mermaid 图表；增加代码注释",
    impact: "影响 YrY 插件的可发现性和可用性",
  },
  notify: {
    check: "检查 .memory/notification-log.jsonl 中的投递成功率",
    fix: "核查失败通知的 error 信息；确认 API_X_TOKEN 有效；检查 webhook 配置正确",
    impact: "影响企微通知的可靠性和监控覆盖",
  },
};

/**
 * Per-dimension scoring methodology (used by buildScoreTraceabilityPanel).
 * Documents the scoring formula, data sources, and check items so the
 * report is self-explanatory.
 *
 * @type {Record<string, {formula: string, source: string, checks: string[]}>}
 */
export const SCORE_METHODOLOGY = {
  token:       { formula: 'API_X_TOKEN 环境变量存在 → 100分，否则 → 0分', source: 'process.env', checks: ['环境变量检查'] },
  config:      { formula: 'config.json 存在 + robots>0 → 100分；仅存在 → 60分；缺失 → 20分', source: '.claude/skills/rui-bot/config.json', checks: ['文件存在性', '机器人数量'] },
  robots:      { formula: '已配置webhook的机器人数 / 总机器人数 × 100', source: 'config.json robots字段', checks: ['webhook_url', 'webhook_url_env'] },
  api:         { formula: 'L1(40): 配置齐全40/单项25/全缺0 + L2(30): 探测OK30 / 本地超时+L3有成功投递→间接验证30 / 本地超时无证据15 / 其他错0 + L3(30): 历史投递率≥95%30/≥80%24/≥50%12/<50%6/无记录30', source: 'config.json + HTTP POST 探测 + notification-log.jsonl', checks: ['api_url', 'API_X_TOKEN', 'HTTP响应', '超时降级', 'L3间接证据升级', '7天投递成功率'] },
  reports:     { formula: '有索引+近期报告 → 100分；有索引+过期 → 60分；无索引 → 40分；目录缺失 → 0分', source: 'docs/健康报告/', checks: ['目录存在', '报告数量', '报告新鲜度'] },
  format:      { formula: '全部消息格式约束通过 → 100分；否则 max(0, 100 - 问题数×25)', source: 'FIELD_EMOJI 配置', checks: ['emoji字段', '必填字段完整性'] },
  diagnostics: { formula: 'max(0, 100 - 触发诊断数×15)', source: '.memory/execution-memory.jsonl', checks: ['D0-D8 8项诊断', '执行记忆数量'] },
  git:         { formula: 'clean → 100分；1-2问题 → 80分；3+问题 → 60分；20+未提交 → 40分', source: 'git status', checks: ['未提交数', '分支状态', '未推送提交'] },
  security:    { formula: '无发现 → 100分；1-2项 → 70分；3-5项 → 40分；6+项 → 20分', source: 'grep 模式扫描', checks: ['硬编码密钥', 'Token泄露', '密码明文'] },
  notify:      { formula: '无记录 → 100分；成功率≥95% → 90分；≥80% → 70分；≥50% → 40分；<50% → 20分', source: '.memory/notification-log.jsonl', checks: ['投递成功率', '平均重试次数'] },
  file_size:   { formula: '100 - 大文件数×10 - 警告文件×2 - 平均体积惩罚', source: 'lib/ 文件扫描', checks: ['文件数', '总体积', '大文件(>50KB)', '平均体积'] },
  dep_analysis:{ formula: '100 - 循环依赖×15 - 上帝模块×5 - 孤立文件×2 - 额外惩罚', source: 'import/export 解析', checks: ['循环依赖', '上帝模块(≥10依赖)', '孤立文件'] },
  em_testing:  { formula: '有框架+≥10用例 → 100分；有框架+少量 → 80分；仅框架或目录 → 60分；仅脚本 → 30分', source: 'package.json + tests/', checks: ['测试框架', '测试目录', '用例数量'] },
  em_types:    { formula: 'TS strict → 100分；TS宽松 → 70分；Flow/类型声明 → 40分', source: 'tsconfig.json', checks: ['TS配置', 'strict模式', '类型声明'] },
  em_linting:  { formula: 'ESLint+CI强制 → 100分；2+工具 → 80分；1+工具 → 60分', source: '.eslintrc* + .prettier*', checks: ['ESLint', 'Prettier', 'EditorConfig', 'CI集成'] },
  em_cicd:     { formula: '有工作流 → 100分；有CI配置 → 70分', source: '.github/workflows/', checks: ['GitHub Actions', 'GitLab CI', 'Jenkins'] },
  em_docs:     { formula: '3文档齐全 → 100分；2文档 → 80分；1文档 → 50分', source: '根目录文件扫描', checks: ['README.md', 'CLAUDE.md', 'docs/'] },
  em_deps:     { formula: 'lockfile+版本脚本 → 100分；仅有lockfile → 70分', source: 'package.json + lockfile', checks: ['lockfile', '版本管理脚本'] },
  em_git:      { formula: 'GitHub+2+项 → 100分；2+项 → 80分；仅.gitignore → 60分', source: '.git* 文件扫描', checks: ['.gitignore', '.gitattributes', 'PR模板'] },
  comp_qual:   { formula: '全部组件均分: Skills(40+60+60) 含 Agents + Rules + Scripts(40+60)', source: 'skills/ lib/ 扫描', checks: ['SKILL.md存在', 'frontmatter', '文档长度', '代码注释', '测试覆盖'] },
};