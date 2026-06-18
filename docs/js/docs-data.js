/* ═══════════════════════════════════════════════════════════════════════════
   YrY 文档中心 · 页面数据源

   整个页面的内容数据都集中在这里,YryDocLayer 组件会根据此数据动态渲染。
   数据格式:
     layers: [
       {
         id, num, titleIcon, titlePrefix, titleAccent, titleSuffix,
         stats, panels, sections: [
           { subTitle: { icon, text, count? }, grid: 'card'|'story'|'scene', items: [...] }
         ]
       }
     ]

   修改原则: 增删资产条目 / 调整章节顺序,只需编辑此文件即可。
   页面布局、样式、交互完全由 cdn/yry-* 组件承担。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────
     Layer 1: 第三方依赖与框架
     ────────────────────────────────────────────────────────────────── */
  var layerDeps = {
    id: 'layer-deps', num: '1',
    titleIcon: '📚', titleAccent: '第三方依赖与框架',
    stats: ['🩺 依赖健康 100分 · 6 运行时 · 6 开发'],
    panels: [
      { icon: '📦', label: '', title: '查看依赖详情', panel: 'deps', onPanel: 'layerInfo' }
    ],
    sections: [
      {
        subTitle: { icon: '⚡', text: '运行时依赖 (6)', count: '6 项' },
        grid: 'card',
        items: [
          { icon: 'C', iconModifier: 'rule', name: 'yry-cdn-lib', nameHref: 'https://www.jsdelivr.com/package/npm/yry-cdn-lib', nameTarget: '_blank', desc: 'YrY 自建 CDN 共享库 — 双主题系统 (Mono + System)、14 设计令牌、22 CSS 组件、9 JS 工具 API。55+ 页面统一引用,消除内联重复代码 40–60%。<a href="../cdn/index.html" style="color:var(--yry-cyan)">详情 → CDN 共享库</a>', tags: [{ text: '自建', modifier: 'accent' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v1.1.0', modifier: 'cyan' }], meta: 'shared.css + theme.css + theme-mono.css + fonts.css + shared.js',
          demo: 'https://www.jsdelivr.com/package/npm/yry-cdn-lib' },
          { icon: 'G', iconModifier: 'rule', name: 'Cytoscape.js', nameHref: 'https://js.cytoscape.org/', nameTarget: '_blank', desc: '图论可视化库 — 知识图谱页面的交互式节点-边图渲染。支持 breadthfirst/concentric/cose 布局、缩放平移、节点拖拽、PNG 导出', tags: [{ text: '可视化', modifier: 'green' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v3.28.1', modifier: 'cyan' }], meta: '4 故事面板 · 知识图谱.html — 三层 schema: story→scene→source',
          demo: 'https://js.cytoscape.org/' },
          { icon: 'H', iconModifier: 'rule', name: 'html2canvas', nameHref: 'https://html2canvas.hertzen.com/', nameTarget: '_blank', desc: 'DOM 截图引擎 — 架构图和知识图谱页面的截图导出。DOM → Canvas → PNG/PDF,支持跨域图片、缩放质量可配置', tags: [{ text: '导出', modifier: 'green' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v1.4.1', modifier: 'cyan' }], meta: '架构图 + 知识图谱 — Copy / PNG / PDF 三格式导出 · scale 2x 高清',
          demo: 'https://html2canvas.hertzen.com/' },
          { icon: 'J', iconModifier: 'rule', name: 'jsPDF', nameHref: 'https://github.com/parallax/jsPDF', nameTarget: '_blank', desc: '客户端 PDF 生成 — 架构图和知识图谱页面的 PDF 导出。配合 html2canvas 使用,支持 A4/A3 纸张、矢量缩放、多页输出', tags: [{ text: '导出', modifier: 'green' }, { text: 'jsDelivr CDN', modifier: 'info' }, { text: 'v2.5.2', modifier: 'cyan' }], meta: 'A4 纵向 · 矢量缩放 · addPage 多页 · Blob 下载触发',
          demo: 'https://github.com/parallax/jsPDF' },
          { icon: 'A', iconModifier: 'rule', name: 'api.effiy.cn', desc: '远端文档 API — rui-import 同步引擎的目标端点。文档 CRUD、session 管理、文件读写。认证: X-Token 环境变量注入', tags: [{ text: '自建', modifier: 'accent' }, { text: 'REST API', modifier: 'info' }, { text: '认证', modifier: 'purple' }], meta: 'query_documents · create_document · update_document · write-file · read-file · session' },
          { icon: 'W', iconModifier: 'rule', name: '企业微信 Webhook', nameHref: 'https://developer.work.weixin.qq.com/document/path/91770', nameTarget: '_blank', desc: '企微群机器人消息推送 — rui-bot 通知引擎。Rich/Verbose 格式 + Dry-Run 预览 + 失败队列重试 + 9 维健康检查', tags: [{ text: '通知', modifier: 'purple' }, { text: 'Webhook', modifier: 'info' }, { text: 'Health', modifier: 'accent' }], meta: 'rui-bot · 9维健康检查 · 自循环报告 · 阻断/完成/异常通知',
          demo: 'https://developer.work.weixin.qq.com/document/path/91770' }
        ]
      },
      {
        subTitle: { icon: '🛠', text: '开发依赖 (6)', count: '6 项' },
        grid: 'card',
        items: [
          { icon: 'N', iconModifier: 'ref', name: 'Node.js 内置模块', nameHref: 'https://nodejs.org/api/', nameTarget: '_blank', desc: '全部脚本基于 Node.js 内置模块:fs, path, child_process, crypto, http, os, url。14 脚本 + 8 共享库仅使用标准库', tags: [{ text: '零运行时依赖', modifier: 'green' }, { text: 'Built-in', modifier: 'info' }], meta: '14 脚本 + 8 共享库 — 全部使用 Node.js 标准库',
          demo: 'https://nodejs.org/api/' },
          { icon: 'V', iconModifier: 'ref', name: 'vitest', nameHref: 'https://vitest.dev/', nameTarget: '_blank', desc: '工程化测试框架 — 基于 Vite 的 ESM 原生测试运行器。提供 test/watch/coverage 命令,并行执行,v8 覆盖率。14 脚本 + 77+ 测试用例', tags: [{ text: '测试框架', modifier: 'accent' }, { text: 'npm devDependency', modifier: 'info' }, { text: 'v3.2.x', modifier: 'cyan' }], meta: 'npm test · npm run test:watch · npm run test:coverage — 双轨共存 (vitest + legacy)',
          demo: 'https://vitest.dev/' },
          { icon: 'U', iconModifier: 'ref', name: '@vitest/ui', nameHref: 'https://vitest.dev/guide/ui.html', nameTarget: '_blank', desc: 'Vitest 可视化仪表盘 — Web UI 实时查看测试结果、过滤/搜索用例、覆盖率可视化。开发时调试首选', tags: [{ text: '开发工具', modifier: 'green' }, { text: 'npm devDependency', modifier: 'info' }, { text: 'v3.2.x', modifier: 'cyan' }], meta: 'npm run test:ui · 实时仪表盘 · 按模块过滤',
          demo: 'https://vitest.dev/guide/ui.html' },
          { icon: 'M', iconModifier: 'ref', name: 'chrome-devtools-mcp', nameHref: 'https://github.com/ChromeDevTools/chrome-devtools-mcp', nameTarget: '_blank', desc: 'Chrome DevTools MCP 协议 — 程序化浏览器验证。navigate_page / evaluate_script / list_network_requests / take_screenshot 替代手工 DevTools 面板操作', tags: [{ text: '测试工具', modifier: 'accent' }, { text: 'MCP', modifier: 'info' }, { text: 'v1.2.0', modifier: 'cyan' }], meta: 'CDN 加载链路自动化验证 · 71 断言全通过 · 零手工 DevTools',
          demo: 'https://github.com/ChromeDevTools/chrome-devtools-mcp' },
          { icon: 'C', iconModifier: 'ref', name: 'Claude Code', nameHref: 'https://code.claude.com/docs/en/overview', nameTarget: '_blank', desc: 'Agentic 编程工具 — 在终端/IDE 中读取仓库上下文、编辑文件、执行命令与测试;支撑 YrY 的实现/验证闭环', tags: [{ text: '开发工具', modifier: 'green' }, { text: 'AI Agent', modifier: 'info' }, { text: 'CLI/IDE', modifier: 'purple' }], meta: '多文件改动 · 命令执行 · 计划/审查工作流 · 与 .claude/ 协同',
          demo: 'https://code.claude.com/docs/en/overview' },
          { icon: 'T', iconModifier: 'ref', name: 'TRAE', nameHref: 'https://www.trae.ai/', nameTarget: '_blank', desc: 'AI IDE — 代码理解 + 生成/编辑 + 终端/预览联动,面向端到端开发流程的 Agent 协作环境', tags: [{ text: '开发工具', modifier: 'green' }, { text: 'IDE', modifier: 'info' }, { text: 'Agent', modifier: 'accent' }], meta: 'IDE 内协作式开发 · 任务拆解与执行 · 预览验证 · 可扩展工具接入',
          demo: 'https://www.trae.ai/' }
        ]
      }
    ]
  };

  /* ──────────────────────────────────────────────────────────────────
     Layer 2: 技能
     ────────────────────────────────────────────────────────────────── */
  var layerSkills = {
    id: 'layer-skills', num: '2',
    titleIcon: '🛠', titleAccent: '技能',
    stats: ['🩺 技能健康 86/A · 19 能力模块 · SRP 拆分 · 故事驱动的 SDLC 编排'],
    panels: [
      { icon: '📋', label: '', title: '技能详情',          panel: 'skills', onPanel: 'layerInfo' },
      { icon: '⏰', label: '', title: '调度任务',          panel: 'cron',        onPanel: 'panel' },
      { icon: '🔔', label: '', title: '通知汇总',          panel: 'notify',      onPanel: 'panel' },
      { icon: '🧬', label: '', title: '健康趋势',          panel: 'selfimprove', onPanel: 'panel' },
      { icon: '❓', label: '', title: 'FAQ',               panel: 'faq',         onPanel: 'panel' }
    ],
    sections: [
      {
        subTitle: { icon: '🌐', text: '编排入口 (1)', count: '1 项' },
        grid: 'card',
        items: [
          { icon: 'R', iconModifier: 'skill', name: 'rui', nameHref: '../skills/rui/SKILL.md', nameTarget: '_blank', badge: '薄编排器', desc: '故事驱动 SDLC 编排器 — 命令路由 + 推荐引擎。委托 7 子技能执行具体管线(init/doc/plan/code/update/yry/version)', tags: [{ text: '核心入口', modifier: 'accent' }, { text: '路由', modifier: 'info' }, { text: '/rui', modifier: 'cyan' }],
          demo: '../skills/rui/SKILL.md' }
        ]
      },
      {
        subTitle: { icon: '⚡', text: '管线子技能 (7) — 从 rui 按 SRP 拆分', count: '7 项' },
        grid: 'card',
        items: [
          { icon: 'I', iconModifier: 'skill', name: 'rui-init', nameHref: '../skills/rui-init/SKILL.md', nameTarget: '_blank', desc: '项目基线建立 — detect → explore → generate → arch → setup → verify → trigger。可重复运行,全量重生标记段', tags: [{ text: '初始化', modifier: 'accent' }, { text: '/rui-init', modifier: 'cyan' }],
          demo: '../skills/rui-init/SKILL.md' },
          { icon: 'D', iconModifier: 'skill', name: 'rui-doc', nameHref: '../skills/rui-doc/SKILL.md', nameTarget: '_blank', desc: 'Markdown 文档基线生成 — 需求→故事拆分→文档基线。3 模式:默认 / --from-code / --from-local', tags: [{ text: '文档基线', modifier: 'accent' }, { text: '/rui-doc', modifier: 'cyan' }],
          demo: '../skills/rui-doc/SKILL.md' },
          { icon: 'P', iconModifier: 'skill', name: 'rui-plan', nameHref: '../skills/rui-plan/SKILL.md', nameTarget: '_blank', desc: '实施计划生成 — 读取文档基线 → 文件映射 → 任务分解 → 六项自审查 → plan.html + 计划清单.html', tags: [{ text: '计划', modifier: 'accent' }, { text: '/rui-plan', modifier: 'cyan' }],
          demo: '../skills/rui-plan/SKILL.md' },
          { icon: 'C', iconModifier: 'skill', name: 'rui-code', nameHref: '../skills/rui-code/SKILL.md', nameTarget: '_blank', desc: '源码实现管线 — 源码改动唯一入口。分支隔离 → Gate A → 逐模块 P0 清零 → Gate B → 自改进 → 交付', tags: [{ text: '实现管线', modifier: 'accent' }, { text: '/rui-code', modifier: 'cyan' }],
          demo: '../skills/rui-code/SKILL.md' },
          { icon: 'U', iconModifier: 'skill', name: 'rui-update', nameHref: '../skills/rui-update/SKILL.md', nameTarget: '_blank', desc: '增量更新 — 按 T1/T2/T3 变更范围自动裁剪管线。--no-code 仅文档不改源码', tags: [{ text: '增量', modifier: 'accent' }, { text: '/rui-update', modifier: 'cyan' }],
          demo: '../skills/rui-update/SKILL.md' },
          { icon: 'Y', iconModifier: 'skill', name: 'rui-yry', nameHref: '../skills/rui-yry/SKILL.md', nameTarget: '_blank', desc: '自改进闭环 — 全自主扫描→诊断→实现→验证→版本升级,循环至无改进空间或达深度上限', tags: [{ text: '闭环', modifier: 'accent' }, { text: '/rui-yry', modifier: 'cyan' }],
          demo: '../skills/rui-yry/SKILL.md' },
          { icon: 'V', iconModifier: 'skill', name: 'rui-version', nameHref: '../skills/rui-version/SKILL.md', nameTarget: '_blank', desc: '版本管理 — 自主判定语义版本号 → 更新四文件 → git commit + tag + push。支持 --rollback', tags: [{ text: '版本', modifier: 'accent' }, { text: '/rui-version', modifier: 'cyan' }],
          demo: '../skills/rui-version/SKILL.md' }
        ]
      },
      {
        subTitle: { icon: '🔬', text: '支撑技能 (8)', count: '8 项' },
        grid: 'card',
        items: [
          { icon: 'H', iconModifier: 'skill', name: 'rui-html', nameHref: '../skills/rui-html/SKILL.md', nameTarget: '_blank', desc: 'HTML 文档生成 — 读取 markdown 基线,生成 7 类标准 HTML(计划清单/架构图/知识图谱/源码/测试面板/演示/审查)', tags: [{ text: '文档生成', modifier: 'accent' }, { text: 'HTML', modifier: 'info' }, { text: '/rui-html', modifier: 'cyan' }],
          demo: '../skills/rui-html/SKILL.md' },
          { icon: 'S', iconModifier: 'skill', name: 'rui-story', nameHref: '../skills/rui-story/SKILL.md', nameTarget: '_blank', desc: '故事任务面板管理 — 收集故事、查看状态、同步远端。list / sync / remove / health', tags: [{ text: '面板管理', modifier: 'accent' }, { text: '/rui-story', modifier: 'cyan' }],
          demo: '../skills/rui-story/SKILL.md' },
          { icon: 'L', iconModifier: 'skill', name: 'rui-claude', nameHref: '../skills/rui-claude/SKILL.md', nameTarget: '_blank', desc: '.claude/ 配置管理 — sync / update / retro / history。仅限 .claude/ 目录,委托 rui-import 同步', tags: [{ text: '配置管理', modifier: 'accent' }, { text: '/rui-claude', modifier: 'cyan' }],
          demo: '../skills/rui-claude/SKILL.md' },
          { icon: 'M', iconModifier: 'skill', name: 'rui-import', nameHref: '../skills/rui-import/SKILL.md', nameTarget: '_blank', desc: '文档同步 — 本地 ↔ 远端 API 双向同步。全量纳入,并发 ≤4,单文件失败不阻断', tags: [{ text: '文档同步', modifier: 'accent' }, { text: 'API', modifier: 'info' }],
          demo: '../skills/rui-import/SKILL.md' },
          { icon: 'K', iconModifier: 'skill', name: 'rui-skills', nameHref: '../skills/rui-skills/SKILL.md', nameTarget: '_blank', badge: '新', desc: '技能市场 — 发现和安装 Claude/Agent 技能包,从开放生态扩展能力', tags: [{ text: '技能市场', modifier: 'accent' }, { text: '/rui-skills', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }],
          demo: '../skills/rui-skills/SKILL.md' },
          { icon: 'B', iconModifier: 'skill', name: 'rui-bot', nameHref: '../skills/rui-bot/SKILL.md', nameTarget: '_blank', desc: '企微消息推送 — Rich/Verbose 格式 + Dry-Run 预览 + 失败队列重试。健康诊断已拆分至 rui-health', tags: [{ text: '消息推送', modifier: 'accent' }, { text: '企微', modifier: 'info' }],
          demo: '../skills/rui-bot/SKILL.md' },
          { icon: 'Z', iconModifier: 'skill', name: 'rui-health', nameHref: '../skills/rui-health/SKILL.md', nameTarget: '_blank', badge: '新', desc: '系统健康诊断 — 9 核心维度 + 7 工程成熟度评分 · HTML 报告生成 · D0-D7 诊断触发 · 趋势持久化', tags: [{ text: 'Health', modifier: 'accent' }, { text: '诊断', modifier: 'info' }, { text: '/rui-health', modifier: 'cyan' }],
          demo: '../skills/rui-health/SKILL.md' },
          { icon: 'T', iconModifier: 'skill', name: 'rui-trends', nameHref: '../skills/rui-trends/SKILL.md', nameTarget: '_blank', desc: '技术趋势发现 — GitHub Trending / OSS Insight / TrendShift / Top-Starred。自改进 D5 核心数据源', tags: [{ text: '趋势发现', modifier: 'accent' }, { text: '选型', modifier: 'info' }],
          demo: '../skills/rui-trends/SKILL.md' },
          { icon: 'N', iconModifier: 'skill', name: 'rui-npm', nameHref: '../skills/rui-npm/SKILL.md', nameTarget: '_blank', desc: 'npm 包管理 — 14 子命令:search / install / publish / npx / audit / cdn / login / deprecate / unpublish 等', tags: [{ text: '包管理', modifier: 'accent' }, { text: '/rui-npm', modifier: 'cyan' }],
          demo: '../skills/rui-npm/SKILL.md' }
        ]
      },
      {
        subTitle: { icon: '🎯', text: '新增技能 (3) — v5.0.0', count: '3 项' },
        grid: 'card',
        items: [
          { icon: 'A', iconModifier: 'skill', name: 'rui-analysis', nameHref: '../skills/rui-analysis/SKILL.md', nameTarget: '_blank', badge: '新', desc: '代码与架构静态分析 — 复杂度/耦合/文件膨胀/依赖健康/架构边界检测。规约驱动,只读分析', tags: [{ text: '分析', modifier: 'accent' }, { text: '/rui-analysis', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }],
          demo: '../skills/rui-analysis/SKILL.md' },
          { icon: 'E', iconModifier: 'skill', name: 'rui-reporter', nameHref: '../skills/rui-reporter/SKILL.md', nameTarget: '_blank', badge: '新', desc: '过程报告与知识策展 — 故事进程/知识图谱一致性/交付摘要/跨故事趋势。证据驱动,≥2 来源', tags: [{ text: '报告', modifier: 'accent' }, { text: '/rui-reporter', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }],
          demo: '../skills/rui-reporter/SKILL.md' },
          { icon: 'S', iconModifier: 'rule', name: 'self-improve', nameHref: '../rules/self-improve.md', nameTarget: '_blank', badge: '新', desc: '持续自改进闭环 — D0-D7 诊断 → 提案生成 → 物化为故事 → 效果评估 (E1-E4)。数据驱动,全自动演进', tags: [{ text: '演进', modifier: 'accent' }, { text: 'D0-D7', modifier: 'info' }, { text: '/self-improve', modifier: 'cyan' }, { text: 'v5.0', modifier: 'green' }],
          demo: '../rules/self-improve.md' }
        ]
      }
    ]
  };

  /* ──────────────────────────────────────────────────────────────────
     Layer 3: 故事
     ────────────────────────────────────────────────────────────────── */
  var layerStory = {
    id: 'layer-story', num: '3',
    titleIcon: '📖', titleAccent: '故事',
    stats: ['🩺 故事健康 85/B · 7 故事 · 架构基线 + 自检体系 + npm 管理 + CDN 共享库 + 自改进闭环 + 文档首页 + 计划清单生成'],
    panels: [
      { icon: '📖', label: '', title: '查看故事详情', panel: 'story', onPanel: 'layerInfo' }
    ],
    sections: [
      {
        grid: 'story',
        items: [
          { icon: '📑', name: '系统架构知识固化', nameHref: '故事任务面板/架构/故事任务.md', nameTarget: '_blank', badge: 'v1.3.0', desc: 'YrY 架构全景分析,构建系统自我认知基线。模块拓扑 + 数据流追踪 + 新人上手 + 依赖变更影响 + 信任边界 + 工程化建设(校验脚本化 · 漂移监测 · 健康仪表板),让后续故事规划、影响分析和架构决策有唯一事实参照。', scenes: ['1. 新人上手与开发指南', '2. 模块定位与职责', '3. 数据流与追踪', '4. 依赖变更影响分析', '5. 信任边界与安全面', '6. 架构断言脚本化校验', '7. 架构漂移持续监测', '8. 架构健康度量仪表板'],
          demo: '故事任务面板/架构/故事任务.md' },
          { icon: '🧪', name: '自主测试方案', nameHref: '故事任务面板/自测/故事任务.md', nameTarget: '_blank', badge: 'v1.1.0', desc: 'YrY 自检体系 — 项目的免疫系统。管线健康自检验证纪律关卡是否有效执行,文档基线完整性校验验证文档是否始终是可信任的真相来源。', scenes: ['1. init 后全量自检', '2. commit 前增量自检', '3. 文档代码一致性校验', '4. 安全面回归自检', '5. 跨故事集成回归自检', '6. 第三方框架与服务自检'],
          demo: '故事任务面板/自测/故事任务.md' },
          { icon: '📦', name: 'npm 包管理工具', nameHref: '故事任务面板/npm包管理/故事任务.md', nameTarget: '_blank', badge: 'v1.1.0', desc: '个人 npm 包全生命周期管理 — 包搜索与发现、安装与版本管理、本地发布与 npx 使用、包信息审计与安全卸载。32 文件 · 77 测试 · 每场景 7 配套文件。', scenes: ['1. 包搜索与发现', '2. 包安装与版本管理', '3. 本地发布与 npx 使用', '4. 包信息审计与卸载', '5. 账号级包管理'],
          demo: '故事任务面板/npm包管理/故事任务.md' },
          { icon: '🌐', name: 'CDN 共享前端资源库', nameHref: '故事任务面板/cdn/故事任务.md', nameTarget: '_blank', badge: 'v1.0.0', desc: 'YrY 共享前端资源 — 双主题系统(Mono + System)、22 CSS 组件、9 JS 工具 API。55+ 页面统一引用,消除内联重复代码 40-60%。<a href="../cdn/index.html" style="color:var(--yry-cyan)">详情 → CDN 共享库</a>', scenes: ['1. CDN资源加载与页面渲染', '2. 双主题系统设计', '3. 组件库与JS工具API', '4. 存量页面迁移', '5. npm包发布与版本管理'],
          demo: '故事任务面板/cdn/故事任务.md' },
          { icon: '🧬', name: '自改进闭环', nameHref: '故事任务面板/自改进/故事任务.md', nameTarget: '_blank', badge: 'v5.1.0', desc: '自改进机制场景化 — 将 rules/self-improve.md + agents/self-improve.md 中的规则转化为可操作执行场景。四段闭环(观察→诊断→改进→评估)+ 八级诊断 D0-D7 + 四级效果评估 E1-E4 + 经验技能化升级路径。', scenes: ['1. 数据采集与观察', '2. 诊断引擎', '3. 提案生成与路由', '4. 效果评估与闭环', '5. 经验技能化与记忆注入'],
          demo: '故事任务面板/自改进/故事任务.md' },
          { icon: '🏠', name: '文档中心首页', nameHref: '故事任务面板/首页/故事任务.md', nameTarget: '_blank', badge: 'v1.0.0', desc: 'YrY 文档统一入口页面 — 六层结构(依赖→技能→故事→场景→Agent/规则→参考入口)聚合全部项目资产。数据驱动生成,实时面板集成,全站交叉导航。从手工维护升级为 rui-html 管线自动生成。', scenes: ['1. 数据采集与六层聚合', '2. 实时面板与交互组件', '3. 交叉导航与可访问性', '4. 自动化生成管线'],
          demo: '故事任务面板/首页/故事任务.md' },
          { icon: '📋', name: '计划清单生成技能', nameHref: '故事任务面板/计划清单/故事任务.md', nameTarget: '_blank', badge: 'v1.0.0', desc: '从 markdown 到 HTML 清单的自动化生成管线 — 模板架构 · 组件交互 · 验证集成 · 批量自循环。20 功能点,21 业务规则,4 层管线将计划清单从手工维护升级为数据驱动的可交互工具。', scenes: ['1. 模板架构与CSS设计系统', '2. 清单交互组件实现', '3. 验证报告与健康面板集成', '4. 批量生成与自循环机制'],
          demo: '故事任务面板/计划清单/故事任务.md' }
        ]
      }
    ]
  };

  /* ──────────────────────────────────────────────────────────────────
     Layer 4: 场景 (37 张)
     ────────────────────────────────────────────────────────────────── */
  var layerScene = {
    id: 'layer-scene', num: '4',
    titleIcon: '🎬', titleAccent: '场景',
    stats: ['🩺 场景健康 80/B · 7 故事 · 37 场景'],
    panels: [
      { icon: '🎬', label: '', title: '查看场景详情', panel: 'scene', onPanel: 'layerInfo' }
    ],
    sections: [
      {
        subTitle: { icon: '📑', text: '系统架构知识固化 — 8 场景', count: '8 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '新人上手与开发指南',     nameHref: '故事任务面板/架构/场景-1-新人上手与开发指南/index.md',     nameTarget: '_blank', desc: '环境搭建 · 调试方法 · 常见任务 — 新人可独立完成首修', meta: YrY.sceneMeta('故事任务面板/架构/场景-1-新人上手与开发指南') },
          { num: '场景 2', name: '模块定位与职责',         nameHref: '故事任务面板/架构/场景-2-模块定位与职责/index.md',         nameTarget: '_blank', desc: '19 技能 · 9 Agent · 16 规则 — 模块识别 · 职责边界 · 入口验证', meta: YrY.sceneMeta('故事任务面板/架构/场景-2-模块定位与职责') },
          { num: '场景 3', name: '数据流与追踪',           nameHref: '故事任务面板/架构/场景-3-数据流与追踪/index.md',           nameTarget: '_blank', desc: '数据流建模 + 调用链追踪 + 断点定位 — 理解系统动态行为', meta: YrY.sceneMeta('故事任务面板/架构/场景-3-数据流与追踪') },
          { num: '场景 4', name: '依赖变更影响分析',       nameHref: '故事任务面板/架构/场景-4-依赖变更影响分析/index.md',       nameTarget: '_blank', desc: '依赖图谱分析 + 影响面计算 + 升级路径评估 — 升级前必做', meta: YrY.sceneMeta('故事任务面板/架构/场景-4-依赖变更影响分析') },
          { num: '场景 5', name: '信任边界与安全面',       nameHref: '故事任务面板/架构/场景-5-信任边界与安全面/index.md',       nameTarget: '_blank', desc: '信任模型 + 攻击面分析 + 最小权限原则 — 安全设计基线', meta: YrY.sceneMeta('故事任务面板/架构/场景-5-信任边界与安全面') },
          { num: '场景 6', name: '架构断言脚本化校验',     nameHref: '故事任务面板/架构/场景-6-架构断言脚本化校验/index.md',     nameTarget: '_blank', desc: '架构规则可执行化 — 每条架构原则对应一条可 grep/可测试的脚本断言', meta: YrY.sceneMeta('故事任务面板/架构/场景-6-架构断言脚本化校验') },
          { num: '场景 7', name: '架构漂移持续监测',       nameHref: '故事任务面板/架构/场景-7-架构漂移持续监测/index.md',       nameTarget: '_blank', desc: 'PR-time 架构规则门禁 + 漂移报告 — 架构基线持续守护', meta: YrY.sceneMeta('故事任务面板/架构/场景-7-架构漂移持续监测') },
          { num: '场景 8', name: '架构健康度量仪表板',     nameHref: '故事任务面板/架构/场景-8-架构健康度量仪表板/index.md',     nameTarget: '_blank', desc: '架构健康指标可视化 — 7 维度评分 + 趋势图 + 退化告警', meta: YrY.sceneMeta('故事任务面板/架构/场景-8-架构健康度量仪表板') }
        ]
      },
      {
        subTitle: { icon: '🧪', text: '自主测试方案 — 6 场景', count: '6 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: 'init 后全量自检',        nameHref: '故事任务面板/自测/场景-1-init后全量自检/index.md',         nameTarget: '_blank', desc: 'rui-init 完成后全量自检 — 管线 14 脚本 · 8 共享库 · 文档完整性', meta: YrY.sceneMeta('故事任务面板/自测/场景-1-init后全量自检') },
          { num: '场景 2', name: 'commit 前增量自检',      nameHref: '故事任务面板/自测/场景-2-commit前增量自检/index.md',       nameTarget: '_blank', desc: '变更文件影响面 + 相关测试覆盖 — 守门员', meta: YrY.sceneMeta('故事任务面板/自测/场景-2-commit前增量自检') },
          { num: '场景 3', name: '文档代码一致性校验',    nameHref: '故事任务面板/自测/场景-3-文档代码一致性校验/index.md',     nameTarget: '_blank', desc: '文档与代码 1:1 对照 — 防止文档说一套代码做一套', meta: YrY.sceneMeta('故事任务面板/自测/场景-3-文档代码一致性校验') },
          { num: '场景 4', name: '安全面回归自检',        nameHref: '故事任务面板/自测/场景-4-安全面回归自检/index.md',         nameTarget: '_blank', desc: '认证绕过 / 密钥落盘 / 输入校验 / 魔法数字四不妥协验证', meta: YrY.sceneMeta('故事任务面板/自测/场景-4-安全面回归自检') },
          { num: '场景 5', name: '跨故事集成回归自检',    nameHref: '故事任务面板/自测/场景-5-跨故事集成回归自检/index.md',     nameTarget: '_blank', desc: '多 story 协同端到端验证 — rui-* 接口契约', meta: YrY.sceneMeta('故事任务面板/自测/场景-5-跨故事集成回归自检') },
          { num: '场景 6', name: '第三方框架与服务自检',  nameHref: '故事任务面板/自测/场景-6-第三方框架与服务自检/index.md',   nameTarget: '_blank', desc: 'Cytoscape.js / html2canvas / jsPDF / api.effiy.cn / 企微 webhook 健康', meta: YrY.sceneMeta('故事任务面板/自测/场景-6-第三方框架与服务自检') }
        ]
      },
      {
        subTitle: { icon: '📦', text: 'npm 包管理工具 — 5 场景', count: '5 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '包搜索与发现',      nameHref: '故事任务面板/npm包管理/场景-1-包搜索与发现/index.md',      nameTarget: '_blank', desc: 'npm search · registry 查询 · 包详情获取 — 快速发现和评估 npm 包', meta: YrY.sceneMeta('故事任务面板/npm包管理/场景-1-包搜索与发现') },
          { num: '场景 2', name: '包安装与版本管理',  nameHref: '故事任务面板/npm包管理/场景-2-包安装与版本管理/index.md',  nameTarget: '_blank', desc: 'npm install · 版本锁定 · 依赖树管理 — 安全可靠的包安装', meta: YrY.sceneMeta('故事任务面板/npm包管理/场景-2-包安装与版本管理') },
          { num: '场景 3', name: '本地发布与 npx 使用', nameHref: '故事任务面板/npm包管理/场景-3-本地发布与npx使用/index.md', nameTarget: '_blank', desc: 'npm pack · npm link · npx 执行 — 本地开发与测试工作流', meta: YrY.sceneMeta('故事任务面板/npm包管理/场景-3-本地发布与npx使用') },
          { num: '场景 4', name: '包信息审计与卸载',  nameHref: '故事任务面板/npm包管理/场景-4-包信息审计与卸载/index.md',  nameTarget: '_blank', desc: 'npm audit · npm ls · npm uninstall — 安全审计与清理', meta: YrY.sceneMeta('故事任务面板/npm包管理/场景-4-包信息审计与卸载') },
          { num: '场景 5', name: '账号级包管理',      nameHref: '故事任务面板/npm包管理/场景-5-账号级包管理/index.md',      nameTarget: '_blank', desc: 'my-packages · deprecate · unpublish — 个人 npm 资产 CRUD', meta: YrY.sceneMeta('故事任务面板/npm包管理/场景-5-账号级包管理') }
        ]
      },
      {
        subTitle: { icon: '🌐', text: 'CDN 共享前端资源库 — 5 场景', count: '5 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: 'CDN资源加载与页面渲染', nameHref: '故事任务面板/cdn/场景-1-cdn资源加载与页面渲染/index.md',  nameTarget: '_blank', desc: '5 步加载链 · shared.css + 主题 CSS + shared.js — 55 页面统一渲染', meta: YrY.sceneMeta('故事任务面板/cdn/场景-1-cdn资源加载与页面渲染') },
          { num: '场景 2', name: '双主题系统设计',       nameHref: '故事任务面板/cdn/场景-2-双主题系统设计/index.md',          nameTarget: '_blank', desc: 'Cat A (Mono) vs Cat B (System) · 14 设计令牌 · 22 组件 · 7 动画', meta: YrY.sceneMeta('故事任务面板/cdn/场景-2-双主题系统设计') },
          { num: '场景 3', name: '组件库与JS工具API',    nameHref: '故事任务面板/cdn/场景-3-组件库与JS工具API/index.md',       nameTarget: '_blank', desc: '22 CSS 组件 · 9 YrY.* API — Toast/复制/面板切换/折叠套件/剪贴板', meta: YrY.sceneMeta('故事任务面板/cdn/场景-3-组件库与JS工具API') },
          { num: '场景 4', name: '存量页面迁移',         nameHref: '故事任务面板/cdn/场景-4-存量页面迁移/index.md',            nameTarget: '_blank', desc: '6 步迁移指南 · 可删除清单 · 类名替换 · JS 函数替换 · 截图验证', meta: YrY.sceneMeta('故事任务面板/cdn/场景-4-存量页面迁移') },
          { num: '场景 5', name: 'npm包发布与版本管理',  nameHref: '故事任务面板/cdn/场景-5-npm包发布与版本管理/index.md',     nameTarget: '_blank', desc: 'package.json 规范 · PATCH/MINOR/MAJOR 策略 · dry-run · git tag 版本链', meta: YrY.sceneMeta('故事任务面板/cdn/场景-5-npm包发布与版本管理') }
        ]
      },
      {
        subTitle: { icon: '🧬', text: '自改进闭环 — 5 场景', count: '5 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '数据采集与观察',         nameHref: '故事任务面板/自改进/场景-1-数据采集与观察/index.md',        nameTarget: '_blank', desc: '契约与源端定义 — 健康趋势、诊断信号、执行记忆的采集链路与数据质量标准', meta: YrY.sceneMeta('故事任务面板/自改进/场景-1-数据采集与观察') },
          { num: '场景 2', name: '诊断引擎',               nameHref: '故事任务面板/自改进/场景-2-诊断引擎/index.md',              nameTarget: '_blank', desc: 'D0-D7 规则可判定 — 每级诊断的触发条件、证据来源、置信度计算方法', meta: YrY.sceneMeta('故事任务面板/自改进/场景-2-诊断引擎') },
          { num: '场景 3', name: '提案生成与路由',         nameHref: '故事任务面板/自改进/场景-3-提案生成与路由/index.md',        nameTarget: '_blank', desc: '类型路由与生成约束 — 五种提案类型、触发条件、生成边界、委派目标', meta: YrY.sceneMeta('故事任务面板/自改进/场景-3-提案生成与路由') },
          { num: '场景 4', name: '效果评估与闭环',         nameHref: '故事任务面板/自改进/场景-4-效果评估与闭环/index.md',        nameTarget: '_blank', desc: 'E1-E4 评估基准 — 改进前后对比、指标变化量化、闭合标准、回溯报告', meta: YrY.sceneMeta('故事任务面板/自改进/场景-4-效果评估与闭环') },
          { num: '场景 5', name: '经验技能化与记忆注入',   nameHref: '故事任务面板/自改进/场景-5-经验技能化与记忆注入/index.md',  nameTarget: '_blank', desc: '跨会话持久化 — 记忆压缩策略、相似检索注入、经验技能化升级路径', meta: YrY.sceneMeta('故事任务面板/自改进/场景-5-经验技能化与记忆注入') }
        ]
      },
      {
        subTitle: { icon: '🏠', text: '文档中心首页 — 4 场景', count: '4 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '数据采集与六层聚合',  nameHref: '故事任务面板/首页/场景-1-数据采集与六层聚合/index.md', nameTarget: '_blank', desc: '5 大资产源 · 5 步采集流程 · 6 层页面结构 — 从规约自动采集项目全貌', meta: YrY.sceneMeta('故事任务面板/首页/场景-1-数据采集与六层聚合') },
          { num: '场景 2', name: '实时面板与交互组件',  nameHref: '故事任务面板/首页/场景-2-实时面板与交互组件/index.md', nameTarget: '_blank', desc: '4 面板按钮 · PanelHub API · 5 步数据流 — 调度/通知/自改进/FAQ 一键可达', meta: YrY.sceneMeta('故事任务面板/首页/场景-2-实时面板与交互组件') },
          { num: '场景 3', name: '交叉导航与可访问性',  nameHref: '故事任务面板/首页/场景-3-交叉导航与可访问性/index.md', nameTarget: '_blank', desc: '9 交叉导航链接 · breadcrumb · 6 层 id anchor · 响应式 720px — 全站三跳可达', meta: YrY.sceneMeta('故事任务面板/首页/场景-3-交叉导航与可访问性') },
          { num: '场景 4', name: '自动化生成管线',      nameHref: '故事任务面板/首页/场景-4-自动化生成管线/index.md',     nameTarget: '_blank', desc: '/rui-html 首页 · 3 触发路径 · 3 验证门禁 — 项目结构变更时首页自动同步', meta: YrY.sceneMeta('故事任务面板/首页/场景-4-自动化生成管线') }
        ]
      },
      {
        subTitle: { icon: '📋', text: '计划清单生成技能 — 4 场景', count: '4 个' },
        grid: 'scene',
        items: [
          { num: '场景 1', name: '模板架构与CSS设计系统', nameHref: '故事任务面板/计划清单/场景-1-模板架构与CSS设计系统/index.md', nameTarget: '_blank', desc: 'HTML 7区域骨架 · 22 Token 变量 · CSS 设计系统 · CDN 加载链 — 从模板到渲染的完整基础', meta: YrY.sceneMeta('故事任务面板/计划清单/场景-1-模板架构与CSS设计系统') },
          { num: '场景 2', name: '清单交互组件实现',      nameHref: '故事任务面板/计划清单/场景-2-清单交互组件实现/index.md',       nameTarget: '_blank', desc: '勾选进度联动 · 折叠面板 · 标签页切换 · 风险行展开 — localStorage 持久化 + 键盘快捷键', meta: YrY.sceneMeta('故事任务面板/计划清单/场景-2-清单交互组件实现') },
          { num: '场景 3', name: '验证报告与健康面板集成', nameHref: '故事任务面板/计划清单/场景-3-验证报告与健康面板集成/index.md', nameTarget: '_blank', desc: 'KPI卡片 · 5×5风险热力图 · 趋势迷你图 · 纯CSS分数卡 — 无JS图表库依赖', meta: YrY.sceneMeta('故事任务面板/计划清单/场景-3-验证报告与健康面板集成') },
          { num: '场景 4', name: '批量生成与自循环机制',  nameHref: '故事任务面板/计划清单/场景-4-批量生成与自循环机制/index.md',   nameTarget: '_blank', desc: '/rui-html 全量生成 · mtime增量检测 · 30min自循环调度 · 故障隔离 — 文档自动同步', meta: YrY.sceneMeta('故事任务面板/计划清单/场景-4-批量生成与自循环机制') }
        ]
      }
    ]
  };

  window.YRY_DOCS_DATA = {
    layers: [layerDeps, layerSkills, layerStory, layerScene]
    /* Layer 5 (agents + rules) 与 Layer 6 (refs) 暂保留在静态 HTML 中。
       数据迁移路径已通过 Layer 1-4 完整演示,后续可按相同模式继续迁移。 */
  };


  /* 为每张卡片补齐 7 种交付物图标链接 */
  var DELIVERY_ICONS = [
    { icon: '📋', label: '清单' },
    { icon: '📐', label: '架构' },
    { icon: '🔗', label: '图谱' },
    { icon: '🧪', label: '测试' },
    { icon: '📄', label: '源码' },
    { icon: '💡', label: '演示' },
    { icon: '📝', label: '审查' }
  ];
  [layerDeps, layerSkills, layerStory].forEach(function (layer) {
    layer.sections.forEach(function (sec) {
      (sec.items || []).forEach(function (item) {
        if (item.links) return;
        var links = [];
        DELIVERY_ICONS.forEach(function (d) {
          var entry = { icon: d.icon, label: d.label };
          if (d.label === '源码' && item.nameHref) entry.href = item.nameHref;
          if (d.label === '演示' && item.demo) entry.href = item.demo;
          links.push(entry);
        });
        item.links = links;
      });
    });
  });

})();
