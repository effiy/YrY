/* ═══════════════════════════════════════════════════════════════════════════
   YRY 静态资产卡片 · 数据驱动挂载脚本

   职责:
     1) 定义所有静态 card-grid 中需要渲染的 item-card 数据
     2) 等待 YryItemCard 组件就绪后,逐项创建 Vue 应用并挂载
     3) 还原原静态 <div class="item-card"> 的:
        - 链接/面板跳转(含 🧬/🔔 走 PanelHub.open)
        - 交错动画延迟(staggered fadeInUp)

   数据格式 (YRY_ITEM_CARDS):
     {
       "<gridId>": [
         {
           icon         (必填) 字母/图标
           iconModifier (必填) skill | agent | rule | ref
           name         (必填) 标题(可含 emoji)
           nameHref     (可选) 标题链接 URL
           nameTarget   (可选) '_blank'
           desc         (可选) 描述文本
           tags         (可选) [{ text, modifier, href }]
           meta         (可选) 底部元信息
           onClick      (可选) 替代跳转的点击回调
                         (如 onClick 与 nameHref 同时存在,点击触发 onClick 并 preventDefault)
         }
       ]
     }

   依赖:
     - Vue 3                  (window.Vue)
     - YryItemCard            (window.YryItemCard)
     - PanelHub (optional)    (window.PanelHub,用于 onClick 跳转)

   使用方式 (在 docs/index.html 中):
     <div class="card-grid" id="agent-roles-grid"></div>
     ...
     <script src="js/yry-item-cards.js"></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────
     1) 数据源 · 9 个 card-grid 的所有 item-card
     ───────────────────────────────────────────────────────────────────── */
  window.YRY_ITEM_CARDS = {

    /* Layer 5 · Agent 角色 (9) */
    'agent-roles-grid': [
      {
        icon: 'P', iconModifier: 'agent', name: 'pm', nameHref: '../agents/pm.md', nameTarget: '_blank',
        desc: '产品决策者 — 决定做什么和不做什么，委派给子项目 PM，把控产品方向',
        tags: [{ text: '核心角色', modifier: 'purple' }, { text: '决策', modifier: 'info' }],
        meta: '需求解析 → 自适应规划 → 委派子 PM'
      },
      {
        icon: 'L', iconModifier: 'agent', name: 'planner', nameHref: '../agents/planner.md', nameTarget: '_blank',
        desc: '实施规划者 — 接收 PM 委派，拆分实施步骤为 bite-sized 执行计划，评估技术方案可行性，编排任务执行顺序',
        tags: [{ text: '核心角色', modifier: 'purple' }, { text: '规划', modifier: 'info' }],
        meta: '需求分析 → 步骤拆分 → 方案评估 → 委派 coder'
      },
      {
        icon: 'A', iconModifier: 'agent', name: 'architect', nameHref: '../agents/architect.md', nameTarget: '_blank',
        desc: '系统架构设计者 — 设计系统级架构，评估 trade-off，创建架构决策记录',
        tags: [{ text: '只读', modifier: 'info' }, { text: '架构设计', modifier: 'purple' }],
        meta: '架构设计 → 影响分析 → ADR'
      },
      {
        icon: 'C', iconModifier: 'agent', name: 'coder', nameHref: '../agents/coder.md', nameTarget: '_blank',
        desc: '代码实现者 — 按设计文档逐模块实现，强制 P0 清零，通过审查门禁',
        tags: [{ text: '核心角色', modifier: 'purple' }, { text: '实现', modifier: 'info' }],
        meta: '读写 · 逐模块实现 · P0 强制清零'
      },
      {
        icon: 'R', iconModifier: 'agent', name: 'code-reviewer', nameHref: '../agents/code-reviewer.md', nameTarget: '_blank',
        desc: '代码质量审查者 — 审查正确性、设计模式、反模式，发现简化和复用机会',
        tags: [{ text: '只读', modifier: 'info' }, { text: '审查', modifier: 'purple' }],
        meta: '正确性 · 模式 · 反模式 · 简化'
      },
      {
        icon: 'T', iconModifier: 'agent', name: 'tester', nameHref: '../agents/tester.md', nameTarget: '_blank',
        desc: '质量保障者 — 测试先行方法，定义验收标准，强制 Gate A/B 关卡',
        tags: [{ text: '关卡角色', modifier: 'purple' }, { text: '质量保障', modifier: 'info' }],
        meta: 'Gate A 准入 · Gate B 交付'
      },
      {
        icon: 'E', iconModifier: 'agent', name: 'reporter', nameHref: '../agents/reporter.md', nameTarget: '_blank',
        desc: '过程报告者 — 生成过程报告，整理知识资产，遵循证据标准',
        tags: [{ text: '只读', modifier: 'info' }, { text: '报告', modifier: 'purple' }],
        meta: '自改进复盘 → 交付文档生成'
      },
      {
        icon: 'S', iconModifier: 'agent', name: 'security', nameHref: '../agents/security.md', nameTarget: '_blank',
        desc: '安全专家 — 威胁建模分析，执行安全约束，向 coder 注入安全任务',
        tags: [{ text: '只读', modifier: 'info' }, { text: '安全', modifier: 'purple' }],
        meta: '威胁建模 · 约束注入 · 安全审查'
      },
      {
        icon: 'I', iconModifier: 'agent', name: 'self-improve', nameHref: '../agents/self-improve.md', nameTarget: '_blank',
        desc: '自改进引擎 — 数据驱动提案，效果评估，回溯报告，驱动项目持续进化',
        tags: [{ text: '闭环角色', modifier: 'purple' }, { text: '进化', modifier: 'info' }],
        meta: '诊断 D0-D7 · 效果评估 E1-E4'
      }
    ],

    /* Layer 5 · Agent 角色拓扑 (1) */
    'agent-topology-grid': [
      {
        icon: 'T', iconModifier: 'ref', name: 'AGENT.md', nameHref: '../agents/AGENT.md', nameTarget: '_blank',
        desc: '角色拓扑总览 — 行为纪律、设计原则、执行准则、ADR、多 Agent 协作模式',
        tags: [
          { text: '总纲', modifier: 'accent' },
          { text: '角色拓扑', modifier: 'info' },
          { text: '多 Agent', modifier: 'purple' }
        ],
        meta: '22KB · 角色间委派与反馈回路'
      }
    ],

    /* Layer 5 · 管线与执行规则 (5) */
    'rule-pipeline-grid': [
      {
        icon: 'P', iconModifier: 'rule', name: 'code-pipeline.md', nameHref: '../rules/code-pipeline.md', nameTarget: '_blank',
        desc: '管线全流程规范 — 分支隔离策略、Gate A/B 关卡、逐模块清零、研究优先开发',
        tags: [{ text: '核心管线', modifier: 'green' }, { text: '流程规范', modifier: 'info' }],
        meta: '30KB · Gate A/B · 分支隔离 · 逐模块'
      },
      {
        icon: 'T', iconModifier: 'rule', name: 'code-pipeline-techniques.md', nameHref: '../rules/code-pipeline-techniques.md', nameTarget: '_blank',
        desc: '管线支撑技术模式 — 贯穿管线各阶段的实战技术模式，每项对应一条 Iron Law',
        tags: [{ text: '核心管线', modifier: 'green' }, { text: '技术模式', modifier: 'info' }],
        meta: '支撑技术 · Iron Law 实战 · 研究优先开发'
      },
      {
        icon: 'D', iconModifier: 'rule', name: 'delivery-gate.md', nameHref: '../rules/delivery-gate.md', nameTarget: '_blank',
        desc: '交付收口规范 — 三步 Hook：追加日志 → 文档同步 → 企微通知',
        tags: [{ text: '交付门禁', modifier: 'green' }, { text: 'Hook', modifier: 'info' }],
        meta: '7.5KB · 三步收口 · 交付纪律'
      },
      {
        icon: 'A', iconModifier: 'rule', name: 'architecture-diagram.md', nameHref: '../rules/architecture-diagram.md', nameTarget: '_blank',
        desc: '架构图规范 — Mermaid 语法约定、颜色语义体系、布局标准',
        tags: [{ text: '表达优先', modifier: 'green' }, { text: 'Mermaid', modifier: 'info' }],
        meta: '9.7KB · 颜色语义 · 布局约定'
      },
      {
        icon: 'E', iconModifier: 'rule', name: 'plan-execution.md', nameHref: '../rules/plan-execution.md', nameTarget: '_blank',
        desc: '计划执行与验证管线 — 逐步骤执行、每步验证、P0 强制清零、完成信号定义',
        tags: [{ text: '执行纪律', modifier: 'green' }, { text: '验证', modifier: 'info' }],
        meta: '5.9KB · 逐步骤验证 · 完成信号'
      }
    ],

    /* Layer 5 · 文档规则 (4) */
    'rule-doc-grid': [
      {
        icon: 'D', iconModifier: 'rule', name: 'doc-generation.md', nameHref: '../rules/doc-generation.md', nameTarget: '_blank',
        desc: '文档生成约束 — 表达优先原则（图 → 结构化文本 → 表格），不可降级',
        tags: [{ text: '表达优先', modifier: 'green' }, { text: '文档规范', modifier: 'info' }],
        meta: '21KB · 图→文→表 · 不可降级'
      },
      {
        icon: 'L', iconModifier: 'rule', name: 'doc-generation-lifecycle.md', nameHref: '../rules/doc-generation-lifecycle.md', nameTarget: '_blank',
        desc: '文档生命周期 — 补充文档触发条件 · 文档策展策略 · 例外处理 · 生效标志',
        tags: [{ text: '表达优先', modifier: 'green' }, { text: '生命周期', modifier: 'info' }],
        meta: '触发·策展·例外·生效标志'
      },
      {
        icon: 'K', iconModifier: 'rule', name: 'knowledge-graph.md', nameHref: '../rules/knowledge-graph.md', nameTarget: '_blank',
        desc: '知识图谱规范 — 节点类型定义、边关系约束、JSON Schema、生成标准',
        tags: [{ text: '知识管理', modifier: 'green' }, { text: '图谱', modifier: 'info' }],
        meta: '6.6KB · JSON Schema · 节点边规范'
      },
      {
        icon: 'M', iconModifier: 'rule', name: 'mermaid-theme.md', nameHref: '../rules/mermaid-theme.md', nameTarget: '_blank',
        desc: 'Mermaid 统一主题配置 — 全局主题变量、颜色语义、布局约定、暗色主题标准',
        tags: [{ text: '表达优先', modifier: 'green' }, { text: '主题', modifier: 'info' }],
        meta: '2.1KB · 主题变量 · 暗色标准'
      }
    ],

    /* Layer 5 · 安全与配置规则 (2) */
    'rule-security-grid': [
      {
        icon: 'S', iconModifier: 'rule', name: 'security-guardrails.md', nameHref: '../rules/security-guardrails.md', nameTarget: '_blank',
        desc: '安全护栏 — 认证不可绕过、密钥不落盘、输入必校验、禁止魔法数字',
        tags: [{ text: '安全底线', modifier: 'green' }, { text: '约束', modifier: 'info' }],
        meta: '8.9KB · 四不妥协 · 安全面覆盖'
      },
      {
        icon: 'C', iconModifier: 'rule', name: 'rui-claude.md', nameHref: '../rules/rui-claude.md', nameTarget: '_blank',
        desc: 'rui-claude 配置管理规则 — .claude/ 目录同步策略、健康分析标准',
        tags: [{ text: '配置治理', modifier: 'green' }, { text: '.claude/', modifier: 'info' }],
        meta: '5.7KB · 同步策略 · 健康分析'
      }
    ],

    /* Layer 5 · 自改进规则 (1) */
    'rule-selfimprove-grid': [
      {
        icon: 'I', iconModifier: 'rule', name: 'self-improve.md', nameHref: '../rules/self-improve.md', nameTarget: '_blank',
        desc: '自改进闭环 — 诊断 D0-D7、经验技能化、记忆压缩注入、效果评估 E1-E4',
        tags: [{ text: '闭环驱动', modifier: 'green' }, { text: '进化', modifier: 'info' }],
        meta: '11KB · D0-D7 诊断 · E1-E4 评估'
      }
    ],

    /* Layer 5 · 设计与质量管理 (6) */
    'rule-design-grid': [
      {
        icon: 'A', iconModifier: 'rule', name: 'architecture-principles.md', nameHref: '../rules/architecture-principles.md', nameTarget: '_blank',
        desc: '架构宪法 — 内核与扩展边界定义、配置 API 规范、代码范式约束、可健康检测的架构基线',
        tags: [{ text: '架构宪法', modifier: 'green' }, { text: '架构', modifier: 'info' }],
        meta: '内核轻量·扩展丰富·配置API·健康检测'
      },
      {
        icon: 'D', iconModifier: 'rule', name: 'design-principles.md', nameHref: '../rules/design-principles.md', nameTarget: '_blank',
        desc: '九条工程原则 — SRP · 高内聚 · 低耦合 · DIP · OCP · ISP · DRY · YAGNI · 组合优于继承。每 Agent/Skill/Lib 审查基准',
        tags: [{ text: '设计原则', modifier: 'green' }, { text: '架构', modifier: 'info' }],
        meta: '2.8KB · 9 原则 · 验证标准 · 反例'
      },
      {
        icon: 'C', iconModifier: 'rule', name: 'code-paradigm.md', nameHref: '../rules/code-paradigm.md', nameTarget: '_blank',
        desc: '代码编程范式约束 — 模块范式、函数范式、错误处理、导入规范、常量定义。可 grep 验证的硬约束，非风格建议',
        tags: [{ text: '代码范式', modifier: 'green' }, { text: '硬约束', modifier: 'info' }],
        meta: '模块·函数·错误·导入·常量 — 正反例'
      },
      {
        icon: 'H', iconModifier: 'rule', name: 'agent-handoff.md', nameHref: '../rules/agent-handoff.md', nameTarget: '_blank',
        desc: 'Agent 交接规范 — 交接信号格式（from/to/deliverable/acceptance）、Agent 间契约（pm→planner→coder→tester→reporter）、阻断条件',
        tags: [{ text: '协作规范', modifier: 'green' }, { text: 'Agent 交接', modifier: 'info' }],
        meta: '1.5KB · 5 对契约 · 5 阻断标识'
      },
      {
        icon: 'Q', iconModifier: 'rule', name: 'doc-quality.md', nameHref: '../rules/doc-quality.md', nameTarget: '_blank',
        desc: '文档质量标准 — A/B/C/D 四级证据 · Agent/Skill/Rule 统一模版 · 禁止 TBD/占位符/无来源断言 · 退化三信号检测',
        tags: [{ text: '质量标准', modifier: 'green' }, { text: '文档规范', modifier: 'info' }],
        meta: '2.2KB · 4 等级 · 8 审查项 · 3 退化信号'
      },
      {
        icon: 'K', iconModifier: 'rule', name: 'knowledge-graph-ownership.md', nameHref: '../rules/knowledge-graph-ownership.md', nameTarget: '_blank',
        desc: '知识图谱所有权模型 — 单点写入多点只读 · story/scene 节点归 pm · file/function 节点归 coder · reporter 只读验证 · 阻断条件',
        tags: [{ text: '数据治理', modifier: 'green' }, { text: '所有权', modifier: 'info' }],
        meta: '1.8KB · 5 阻断标识 · 三方耦合解耦'
      }
    ],

    /* Layer 6 · 文档入口 (4) */
    'ref-doc-grid': [
      {
        icon: 'R', iconModifier: 'ref', name: 'README.md', nameHref: '../README.md', nameTarget: '_blank',
        desc: '项目总览 — 系统全景图、管线架构、快速开始、命令参考、领域语言（20 术语）',
        tags: [{ text: '入口文档', modifier: 'accent' }, { text: '总览', modifier: 'info' }],
        meta: '15KB · 20 术语 · 系统全景'
      },
      {
        icon: 'C', iconModifier: 'ref', name: 'CLAUDE.md', nameHref: '../CLAUDE.md', nameTarget: '_blank',
        desc: '项目指令 — 四大铁律、项目画像、不可妥协底线、退化三因与四层防御',
        tags: [{ text: 'AI 约束', modifier: 'accent' }, { text: '铁律', modifier: 'info' }],
        meta: '6KB · 行为规范 · 退化对策'
      },
      {
        icon: 'F', iconModifier: 'ref', name: 'formulas.md', nameHref: '../skills/rui/formulas.md', nameTarget: '_blank',
        desc: '故事文档公式 — 故事任务、场景、知识图谱、架构图的生成公式与模板规范',
        tags: [{ text: '文档模板', modifier: 'accent' }, { text: '公式', modifier: 'info' }],
        meta: '28KB · 生成模板 · 公式定义'
      },
      {
        icon: 'B', iconModifier: 'ref', name: '企微 Bot 配置', nameHref: '../skills/rui-bot/SKILL.md', nameTarget: '_blank',
        desc: '企业微信 Webhook 配置 — 消息格式定义、通知触发条件、发送演示',
        tags: [{ text: 'Webhook', modifier: 'info' }, { text: '消息', modifier: 'info' }],
        meta: 'rui-bot · 交付 Hook 第三步'
      }
    ],

    /* Layer 6 · 监控与报告 (5) */
    'ref-monitor-grid': [
      {
        icon: 'H', iconModifier: 'ref', name: '🩺 健康报告', nameHref: './健康报告/index.html',
        desc: '系统综合健康度量 — 9 核心维度 + 7 工程成熟度评分 · HTML 仪表板 · 趋势写入 .memory/health-trend.jsonl 并按日期覆盖 · D0-D7 诊断触发',
        tags: [
          { text: 'Health', modifier: 'accent' },
          { text: '9 核 + 7 工', modifier: 'info' },
          { text: 'A 级', modifier: 'green' }
        ],
        meta: '生成: node skills/rui-bot/send.mjs health --html · 定时: 健康检查 Cron 触发'
      },
      {
        icon: 'L', iconModifier: 'ref', name: '🔄 自循环报告', nameHref: './自循环报告/index.html',
        desc: '12 技能定期巡检 — Cron 定时触发技能执行 → 生成 HTML 报告 → 汇总推送企微通知。覆盖趋势监控、代码健康、文档同步、故事轮询、配置检查、依赖审计、自改进闭环',
        tags: [
          { text: '自循环', modifier: 'accent' },
          { text: '12 技能', modifier: 'info' },
          { text: '企微通知', modifier: 'purple' }
        ],
        meta: '生成: node skills/rui-bot/lib/loop-report.mjs · 索引: docs/自循环报告/'
      },
      {
        icon: 'T', iconModifier: 'ref', name: '📡 趋势报告', nameHref: './趋势报告/index.html',
        desc: '技术趋势发现 — GitHub Trending / OSS Insight / TrendShift / Top-Starred 四大数据源定期扫描。分类打标 (AI/Web/后端/DevOps/语言/安全)，数据输入 D5 外部趋势诊断',
        tags: [
          { text: '趋势发现', modifier: 'accent' },
          { text: '4 数据源', modifier: 'info' },
          { text: 'D5 诊断', modifier: 'green' }
        ],
        meta: '生成: node skills/rui-trends/rui-trends.mjs all · 每周一早 9 点'
      },
      {
        icon: 'S', iconModifier: 'ref', name: '🧬 自改进分析', nameHref: '#',
        desc: '持续自改进可视化 — 读取 .memory/health-trend.jsonl + docs/自我改进/summary.json，按日/周/月/全景四视角展示健康趋势、D0-D7 诊断覆盖率、等级分布、分支健康对比；健康数据以日期为单位覆盖',
        tags: [
          { text: '演进', modifier: 'accent' },
          { text: '4 视角', modifier: 'info' },
          { text: 'D0-D7', modifier: 'purple' }
        ],
        meta: '数据: .memory/health-trend.jsonl · summary.json · 实时面板',
        onClick: function () {
          if (window.PanelHub) window.PanelHub.open('selfimprove');
          else if (window.openPanel) window.openPanel('selfimprove');
        }
      },
      {
        icon: 'N', iconModifier: 'ref', name: '🔔 通知中心', nameHref: '#',
        desc: '三类通知统一汇总 — 健康检查报告 (🩺) + 自循环巡检 (🔄) + 趋势扫描 (📡)。其中健康报告按日期保留最新一份；支持按类型筛选、最新评分趋势追踪、诊断触发追踪、企微推送记录',
        tags: [
          { text: '通知汇总', modifier: 'accent' },
          { text: '3 类通知', modifier: 'info' },
          { text: '企微', modifier: 'purple' }
        ],
        meta: '面板: docs/js/notify-panel.js · 健康报告按日期汇总展示',
        onClick: function () {
          if (window.PanelHub) window.PanelHub.open('notify');
          else if (window.openPanel) window.openPanel('notify');
        }
      }
    ]
  };

  /* ─────────────────────────────────────────────────────────────────────
     2) 挂载逻辑
     ───────────────────────────────────────────────────────────────────── */

  /**
   * 在指定 host 元素上挂载一张 YryItemCard
   * @param {HTMLElement} host - 挂载点(空 div)
   * @param {Object} item    - 卡片数据(支持 onClick 字段)
   * @returns {ComponentInstance} Vue 应用实例
   */
  function mountYryItemCard(host, item) {
    var props = {};
    Object.keys(item).forEach(function (k) { props[k] = item[k]; });

    /* 提取 onClick 并从 props 中移除(避免 Vue 警告 unknown prop) */
    var onClick = props.onClick;
    delete props.onClick;

    /* 若声明了 onClick 但无 nameHref,补一个占位 href(模板需 nameHref 非空才渲染 <a>) */
    if (onClick && !props.nameHref) props.nameHref = '#';

    var app = Vue.createApp(window.YryItemCard, props).mount(host);

    /* 接管点击行为:阻止默认跳转,执行 onClick */
    if (typeof onClick === 'function') {
      var link = host.querySelector('.item-card .name a');
      if (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          try {
            onClick();
          } catch (err) {
            console.error('[YRY_ITEM_CARDS] onClick 执行失败:', err);
          }
        });
      }
    }
    return app;
  }

  /**
   * 主流程:挂载所有 card-grid 中的所有卡片
   *  - 若 grid 是 <yry-card-grid> 自定义元素 → 直接设 .items 属性(由组件内部渲染)
   *  - 否则走旧路径:手动创建 div 并 Vue.createApp 挂载 YryItemCard
   */
  function mountAll() {
    if (!window.Vue) {
      console.warn('[YRY_ITEM_CARDS] Vue 3 未加载,跳过挂载');
      return;
    }

    var grids = window.YRY_ITEM_CARDS;
    Object.keys(grids).forEach(function (gridId) {
      var grid = document.getElementById(gridId);
      if (!grid) {
        /* grid 尚未被 yry-layer-agents/rules/refs 渲染出来 → 静默等待下一次 mountAll */
        return;
      }

      /* 新路径:自定义元素 <yry-card-grid> → 设 .items 属性 */
      if (grid.tagName && grid.tagName.toLowerCase() === 'yry-card-grid') {
        grid.items = grids[gridId];
        return;
      }

      /* 旧路径:plain <div class="card-grid"> → 手动挂载 YryItemCard */
      if (!window.YryItemCard) {
        console.warn('[YRY_ITEM_CARDS] YryItemCard 未注册,跳过挂载 #' + gridId);
        return;
      }
      grids[gridId].forEach(function (item) {
        var host = document.createElement('div');
        grid.appendChild(host);
        mountYryItemCard(host, item);
      });
    });

    /* 还原原静态 item-card 的交错动画延迟(staggered fadeInUp)
       与原 docs/index.html 中 line ~755 的逻辑保持一致 */
    requestAnimationFrame(function () {
      var i = 0;
      document.querySelectorAll('.card-grid .item-card').forEach(function (card) {
        card.style.animationDelay = (0.01 + (i % 20) * 0.012) + 's';
        i++;
      });
    });
  }

  /* 启动:若 YryItemCard 已就绪立即执行,否则等待 ready 事件 */
  if (window.YryItemCard) {
    mountAll();
  } else {
    document.addEventListener('yry-item-card-ready', mountAll, { once: true });
  }

  /* 复合组件 (yry-layer-agents/rules/refs) 异步渲染 <yry-card-grid>,
     需在它们就绪后重新挂载卡片 */
  document.addEventListener('yry-layer-agents-ready', mountAll);
  document.addEventListener('yry-layer-rules-ready', mountAll);
  document.addEventListener('yry-layer-refs-ready', mountAll);

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
  Object.keys(window.YRY_ITEM_CARDS).forEach(function (gridId) {
    (window.YRY_ITEM_CARDS[gridId] || []).forEach(function (item) {
      if (item.links) return;
      var links = [];
      DELIVERY_ICONS.forEach(function (d) {
        var entry = { icon: d.icon, label: d.label };
        if (d.label === '源码' && item.nameHref) entry.href = item.nameHref;
        links.push(entry);
      });
      item.links = links;
    });
  });

})();
