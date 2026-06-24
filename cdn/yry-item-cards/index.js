/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryItemCards · 静态资产卡片数据 + 自动注入控制器 (Vue 3 自定义元素, full)

   页面使用方式:
     <link rel="stylesheet" href="../cdn/yry-item-cards/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../cdn/yry-item-cards/index.js"></script>
     <yry-item-cards></yry-item-cards>

   行为:
     1) 内置 12 个 grid 的完整卡片数据(agent/rule/ref/story/scene 等)
     2) 自动遍历 DOM,寻找匹配 gridId 的 <yry-card-grid> 元素并设置 .items 属性
     3) 通过 MutationObserver + 复合组件 ready 事件 + 周期轮询三层兜底,
        确保 yry-layer-agents/rules/refs 异步渲染 grid 后能挂载数据
     4) 暴露 window.YRY_ITEM_CARDS 给旧版调用方
     5) 自动补齐 7 种交付物图标链接
     6) 派发 yry-item-cards-ready 事件

   数据迁移说明:
     本组件 1:1 保留 docs/js/yry-item-cards.js 的 553 行数据与多重兜底挂载逻辑,
     但改为 Vue 3 custom element 模式,模板来自 index.html,数据集中在 buildComponent() 内。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  /* global requestAnimationFrame, MutationObserver */

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryItemCards] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TAG_NAME = 'yry-item-cards';

  var TEMPLATE_ID = 'yry-item-cards-tpl';

  var READY_EVENT = 'yry-item-cards-ready';

  var LOAD_TIMEOUT_MS = 5000;

  var DELIVERY_ICONS = [
    { icon: '📋', label: '清单' },
    { icon: '📐', label: '架构' },
    { icon: '🔗', label: '图谱' },
    { icon: '🧪', label: '测试' },
    { icon: '📄', label: '源码' },
    { icon: '💡', label: '演示' },
    { icon: '📝', label: '审查' }
  ];

  function buildItemCardsData() {
    return {
      /* Layer 5 · Agent 角色 (9) */
      'agent-roles-grid': [
        {
          icon: 'P',
          iconModifier: 'agent',
          name: 'pm',
          nameHref: '../skills/rui/pm.md',
          nameTarget: '_blank',
          desc: '产品决策者 — 决定做什么和不做什么,委派给子项目 PM,把控产品方向',
          tags: [
            { text: '核心角色', modifier: 'purple' },
            { text: '决策', modifier: 'info' }
          ],
          meta: '需求解析 → 自适应规划 → 委派子 PM'
        },
        {
          icon: 'L',
          iconModifier: 'agent',
          name: 'planner',
          nameHref: '../skills/rui-plan/planner.md',
          nameTarget: '_blank',
          desc: '实施规划者 — 接收 PM 委派,拆分实施步骤为 bite-sized 执行计划,评估技术方案可行性,编排任务执行顺序',
          tags: [
            { text: '核心角色', modifier: 'purple' },
            { text: '规划', modifier: 'info' }
          ],
          meta: '需求分析 → 步骤拆分 → 方案评估 → 委派 coder'
        },
        {
          icon: 'A',
          iconModifier: 'agent',
          name: 'architect',
          nameHref: '../skills/rui-plan/architect.md',
          nameTarget: '_blank',
          desc: '系统架构设计者 — 设计系统级架构,评估 trade-off,创建架构决策记录',
          tags: [
            { text: '只读', modifier: 'info' },
            { text: '架构设计', modifier: 'purple' }
          ],
          meta: '架构设计 → 影响分析 → ADR'
        },
        {
          icon: 'C',
          iconModifier: 'agent',
          name: 'coder',
          nameHref: '../skills/rui/coder.md',
          nameTarget: '_blank',
          desc: '代码实现者 — 按设计文档逐模块实现,强制 P0 清零,通过审查门禁',
          tags: [
            { text: '核心角色', modifier: 'purple' },
            { text: '实现', modifier: 'info' }
          ],
          meta: '读写 · 逐模块实现 · P0 强制清零'
        },
        {
          icon: 'R',
          iconModifier: 'agent',
          name: 'code-reviewer',
          nameHref: '../skills/rui-code/code-reviewer.md',
          nameTarget: '_blank',
          desc: '代码质量审查者 — 审查正确性、设计模式、反模式,发现简化和复用机会',
          tags: [
            { text: '只读', modifier: 'info' },
            { text: '审查', modifier: 'purple' }
          ],
          meta: '正确性 · 模式 · 反模式 · 简化'
        },
        {
          icon: 'T',
          iconModifier: 'agent',
          name: 'tester',
          nameHref: '../skills/rui/tester.md',
          nameTarget: '_blank',
          desc: '质量保障者 — 测试先行方法,定义验收标准,强制 Gate A/B 关卡',
          tags: [
            { text: '关卡角色', modifier: 'purple' },
            { text: '质量保障', modifier: 'info' }
          ],
          meta: 'Gate A 准入 · Gate B 交付'
        },
        {
          icon: 'E',
          iconModifier: 'agent',
          name: 'reporter',
          nameHref: '../skills/rui-reporter/reporter.md',
          nameTarget: '_blank',
          desc: '过程报告者 — 生成过程报告,整理知识资产,遵循证据标准',
          tags: [
            { text: '只读', modifier: 'info' },
            { text: '报告', modifier: 'purple' }
          ],
          meta: '自改进复盘 → 交付文档生成'
        },
        {
          icon: 'S',
          iconModifier: 'agent',
          name: 'security',
          nameHref: '../skills/rui/security.md',
          nameTarget: '_blank',
          desc: '安全专家 — 威胁建模分析,执行安全约束,向 coder 注入安全任务',
          tags: [
            { text: '只读', modifier: 'info' },
            { text: '安全', modifier: 'purple' }
          ],
          meta: '威胁建模 · 约束注入 · 安全审查'
        },
        {
          icon: 'I',
          iconModifier: 'agent',
          name: 'self-improve',
          nameHref: '../skills/rui-yry/self-improve.md',
          nameTarget: '_blank',
          desc: '自改进引擎 — 数据驱动提案,效果评估,回溯报告,驱动项目持续进化',
          tags: [
            { text: '闭环角色', modifier: 'purple' },
            { text: '进化', modifier: 'info' }
          ],
          meta: '诊断 D0-D7 · 效果评估 E1-E4'
        }
      ],
      /* Layer 5 · Agent 角色拓扑 (1) */
      'agent-topology-grid': [
        {
          icon: 'T',
          iconModifier: 'ref',
          name: 'AGENT.md',
          nameHref: '../skills/rui/AGENT.md',
          nameTarget: '_blank',
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
          icon: 'P',
          iconModifier: 'rule',
          name: 'code-pipeline.md',
          nameHref: '../skills/rui-code/rules/code-pipeline.md',
          nameTarget: '_blank',
          desc: '管线全流程规范 — 分支隔离策略、Gate A/B 关卡、逐模块清零、研究优先开发',
          tags: [
            { text: '核心管线', modifier: 'green' },
            { text: '流程规范', modifier: 'info' }
          ],
          meta: '30KB · Gate A/B · 分支隔离 · 逐模块'
        },
        {
          icon: 'T',
          iconModifier: 'rule',
          name: 'code-pipeline-techniques.md',
          nameHref: '../skills/rui-code/rules/code-pipeline-techniques.md',
          nameTarget: '_blank',
          desc: '管线支撑技术模式 — 贯穿管线各阶段的实战技术模式,每项对应一条 Iron Law',
          tags: [
            { text: '核心管线', modifier: 'green' },
            { text: '技术模式', modifier: 'info' }
          ],
          meta: '支撑技术 · Iron Law 实战 · 研究优先开发'
        },
        {
          icon: 'D',
          iconModifier: 'rule',
          name: 'delivery-gate.md',
          nameHref: '../skills/rui/rules/delivery-gate.md',
          nameTarget: '_blank',
          desc: '交付收口规范 — 三步 Hook:追加日志 → 文档同步 → 企微通知',
          tags: [
            { text: '交付门禁', modifier: 'green' },
            { text: 'Hook', modifier: 'info' }
          ],
          meta: '7.5KB · 三步收口 · 交付纪律'
        },
        {
          icon: 'A',
          iconModifier: 'rule',
          name: 'architecture-diagram.md',
          nameHref: '../skills/rui-html/rules/architecture-diagram.md',
          nameTarget: '_blank',
          desc: '架构图规范 — Mermaid 语法约定、颜色语义体系、布局标准',
          tags: [
            { text: '表达优先', modifier: 'green' },
            { text: 'Mermaid', modifier: 'info' }
          ],
          meta: '9.7KB · 颜色语义 · 布局约定'
        },
        {
          icon: 'E',
          iconModifier: 'rule',
          name: 'plan-execution.md',
          nameHref: '../skills/rui-plan/rules/plan-execution.md',
          nameTarget: '_blank',
          desc: '计划执行与验证管线 — 逐步骤执行、每步验证、P0 强制清零、完成信号定义',
          tags: [
            { text: '执行纪律', modifier: 'green' },
            { text: '验证', modifier: 'info' }
          ],
          meta: '5.9KB · 逐步骤验证 · 完成信号'
        }
      ],
      /* Layer 5 · 文档规则 (4) */
      'rule-doc-grid': [
        {
          icon: 'D',
          iconModifier: 'rule',
          name: 'doc-generation.md',
          nameHref: '../skills/rui-html/rules/doc-generation.md',
          nameTarget: '_blank',
          desc: '文档生成约束 — 表达优先原则(图 → 结构化文本 → 表格),不可降级',
          tags: [
            { text: '表达优先', modifier: 'green' },
            { text: '文档规范', modifier: 'info' }
          ],
          meta: '21KB · 图→文→表 · 不可降级'
        },
        {
          icon: 'L',
          iconModifier: 'rule',
          name: 'doc-generation-lifecycle.md',
          nameHref: '../skills/rui-html/rules/doc-generation-lifecycle.md',
          nameTarget: '_blank',
          desc: '文档生命周期 — 补充文档触发条件 · 文档策展策略 · 例外处理 · 生效标志',
          tags: [
            { text: '表达优先', modifier: 'green' },
            { text: '生命周期', modifier: 'info' }
          ],
          meta: '触发·策展·例外·生效标志'
        },
        {
          icon: 'K',
          iconModifier: 'rule',
          name: 'knowledge-graph.md',
          nameHref: '../skills/rui-story/rules/knowledge-graph.md',
          nameTarget: '_blank',
          desc: '知识图谱规范 — 节点类型定义、边关系约束、JSON Schema、生成标准',
          tags: [
            { text: '知识管理', modifier: 'green' },
            { text: '图谱', modifier: 'info' }
          ],
          meta: '6.6KB · JSON Schema · 节点边规范'
        },
        {
          icon: 'M',
          iconModifier: 'rule',
          name: 'mermaid-theme.md',
          nameHref: '../skills/rui/rules/mermaid-theme.md',
          nameTarget: '_blank',
          desc: 'Mermaid 统一主题配置 — 全局主题变量、颜色语义、布局约定、暗色主题标准',
          tags: [
            { text: '表达优先', modifier: 'green' },
            { text: '主题', modifier: 'info' }
          ],
          meta: '2.1KB · 主题变量 · 暗色标准'
        }
      ],
      /* Layer 5 · 安全与配置规则 (2) */
      'rule-security-grid': [
        {
          icon: 'S',
          iconModifier: 'rule',
          name: 'security-guardrails.md',
          nameHref: '../skills/rui/rules/security-guardrails.md',
          nameTarget: '_blank',
          desc: '安全护栏 — 认证不可绕过、密钥不落盘、输入必校验、禁止魔法数字',
          tags: [
            { text: '安全底线', modifier: 'green' },
            { text: '约束', modifier: 'info' }
          ],
          meta: '8.9KB · 四不妥协 · 安全面覆盖'
        },
        {
          icon: 'C',
          iconModifier: 'rule',
          name: 'rui-claude.md',
          nameHref: '../skills/rui-claude/rules/rui-claude.md',
          nameTarget: '_blank',
          desc: 'rui-claude 配置管理规则 — .claude/ 目录同步策略、健康分析标准',
          tags: [
            { text: '配置治理', modifier: 'green' },
            { text: '.claude/', modifier: 'info' }
          ],
          meta: '5.7KB · 同步策略 · 健康分析'
        }
      ],
      /* Layer 5 · 自改进规则 (1) */
      'rule-selfimprove-grid': [
        {
          icon: 'I',
          iconModifier: 'rule',
          name: 'self-improve.md',
          nameHref: '../skills/rui-yry/rules/self-improve.md',
          nameTarget: '_blank',
          desc: '自改进闭环 — 诊断 D0-D7、经验技能化、记忆压缩注入、效果评估 E1-E4',
          tags: [
            { text: '闭环驱动', modifier: 'green' },
            { text: '进化', modifier: 'info' }
          ],
          meta: '11KB · D0-D7 诊断 · E1-E4 评估'
        }
      ],
      /* Layer 5 · 设计与质量管理 (6) */
      'rule-design-grid': [
        {
          icon: 'A',
          iconModifier: 'rule',
          name: 'architecture-principles.md',
          nameHref: '../skills/rui/rules/architecture-principles.md',
          nameTarget: '_blank',
          desc: '架构宪法 — 内核与扩展边界定义、配置 API 规范、代码范式约束、可健康检测的架构基线',
          tags: [
            { text: '架构宪法', modifier: 'green' },
            { text: '架构', modifier: 'info' }
          ],
          meta: '内核轻量·扩展丰富·配置API·健康检测'
        },
        {
          icon: 'D',
          iconModifier: 'rule',
          name: 'design-principles.md',
          nameHref: '../skills/rui/rules/design-principles.md',
          nameTarget: '_blank',
          desc: '九条工程原则 — SRP · 高内聚 · 低耦合 · DIP · OCP · ISP · DRY · YAGNI · 组合优于继承。每 Agent/Skill/Lib 审查基准',
          tags: [
            { text: '设计原则', modifier: 'green' },
            { text: '架构', modifier: 'info' }
          ],
          meta: '2.8KB · 9 原则 · 验证标准 · 反例'
        },
        {
          icon: 'C',
          iconModifier: 'rule',
          name: 'code-paradigm.md',
          nameHref: '../skills/rui-code/rules/code-paradigm.md',
          nameTarget: '_blank',
          desc: '代码编程范式约束 — 模块范式、函数范式、错误处理、导入规范、常量定义。可 grep 验证的硬约束,非风格建议',
          tags: [
            { text: '代码范式', modifier: 'green' },
            { text: '硬约束', modifier: 'info' }
          ],
          meta: '模块·函数·错误·导入·常量 — 正反例'
        },
        {
          icon: 'H',
          iconModifier: 'rule',
          name: 'agent-handoff.md',
          nameHref: '../skills/rui/rules/agent-handoff.md',
          nameTarget: '_blank',
          desc: 'Agent 交接规范 — 交接信号格式(from/to/deliverable/acceptance)、Agent 间契约(pm→planner→coder→tester→reporter)、阻断条件',
          tags: [
            { text: '协作规范', modifier: 'green' },
            { text: 'Agent 交接', modifier: 'info' }
          ],
          meta: '1.5KB · 5 对契约 · 5 阻断标识'
        },
        {
          icon: 'Q',
          iconModifier: 'rule',
          name: 'doc-quality.md',
          nameHref: '../skills/rui-html/rules/doc-quality.md',
          nameTarget: '_blank',
          desc: '文档质量标准 — A/B/C/D 四级证据 · Agent/Skill/Rule 统一模版 · 禁止 TBD/占位符/无来源断言 · 退化三信号检测',
          tags: [
            { text: '质量标准', modifier: 'green' },
            { text: '文档规范', modifier: 'info' }
          ],
          meta: '2.2KB · 4 等级 · 8 审查项 · 3 退化信号'
        },
        {
          icon: 'K',
          iconModifier: 'rule',
          name: 'knowledge-graph-ownership.md',
          nameHref: '../skills/rui-story/rules/knowledge-graph-ownership.md',
          nameTarget: '_blank',
          desc: '知识图谱所有权模型 — 单点写入多点只读 · story/scene 节点归 pm · file/function 节点归 coder · reporter 只读验证 · 阻断条件',
          tags: [
            { text: '数据治理', modifier: 'green' },
            { text: '所有权', modifier: 'info' }
          ],
          meta: '1.8KB · 5 阻断标识 · 三方耦合解耦'
        }
      ],
      /* Layer 6 · 文档入口 (4) */
      'ref-doc-grid': [
        {
          icon: 'R',
          iconModifier: 'ref',
          name: 'README.md',
          nameHref: '../README.md',
          nameTarget: '_blank',
          desc: '项目总览 — 系统全景图、管线架构、快速开始、命令参考、领域语言(20 术语)',
          tags: [
            { text: '入口文档', modifier: 'accent' },
            { text: '总览', modifier: 'info' }
          ],
          meta: '15KB · 20 术语 · 系统全景'
        },
        {
          icon: 'C',
          iconModifier: 'ref',
          name: 'CLAUDE.md',
          nameHref: '../CLAUDE.md',
          nameTarget: '_blank',
          desc: '项目指令 — 四大铁律、项目画像、不可妥协底线、退化三因与四层防御',
          tags: [
            { text: 'AI 约束', modifier: 'accent' },
            { text: '铁律', modifier: 'info' }
          ],
          meta: '6KB · 行为规范 · 退化对策'
        },
        {
          icon: 'F',
          iconModifier: 'ref',
          name: 'formulas.md',
          nameHref: '../skills/rui/formulas.md',
          nameTarget: '_blank',
          desc: '故事文档公式 — 故事任务、场景、知识图谱、架构图的生成公式与模板规范',
          tags: [
            { text: '文档模板', modifier: 'accent' },
            { text: '公式', modifier: 'info' }
          ],
          meta: '28KB · 生成模板 · 公式定义'
        },
        {
          icon: 'B',
          iconModifier: 'ref',
          name: '企微 Bot 配置',
          nameHref: '../skills/rui-bot/SKILL.md',
          nameTarget: '_blank',
          desc: 'Webhook 配置 — 消息格式定义、通知触发条件、发送演示',
          tags: [
            { text: '机器人', modifier: 'accent' },
            { text: '通知', modifier: 'info' }
          ],
          meta: '5.6KB · Webhook · 通知触发'
        }
      ],
      /* Layer 6 · 角色拓扑 (1) */
      'ref-agent-grid': [
        {
          icon: 'T',
          iconModifier: 'ref',
          name: 'AGENT.md',
          nameHref: '../skills/rui/AGENT.md',
          nameTarget: '_blank',
          desc: 'Agent 角色拓扑总纲 — 行为纪律 · 设计原则 · 执行准则 · ADR · 多 Agent 协作模式',
          tags: [
            { text: '总纲', modifier: 'accent' },
            { text: '拓扑', modifier: 'info' },
            { text: '多 Agent', modifier: 'purple' }
          ],
          meta: '22KB · 9 角色 · 协作模式'
        }
      ],
      /* Layer 6 · 监控与报告 (6) */
      'ref-monitor-grid': [
        {
          icon: '🩺',
          iconModifier: 'ref',
          name: '健康报告',
          nameHref: '../docs/健康报告/index.html',
          nameTarget: '_blank',
          desc: '健康报告中心 — 历次 9 维度健康评分(A/B/C/D 四级)、D0-D7 诊断、机器人就绪状态、报告归档与查询',
          tags: [
            { text: '监控面板', modifier: 'green' },
            { text: '健康', modifier: 'info' }
          ],
          meta: '归档 + 趋势 · 9 维度 · D0-D7 诊断'
        },
        {
          icon: '🔄',
          iconModifier: 'ref',
          name: '自循环报告',
          nameHref: './自循环报告/index.html',
          nameTarget: '_blank',
          desc: '自循环报告中心 — 12 项技能每日/每周巡检报告 · 通过/告警/异常 · 发现清单分级',
          tags: [
            { text: '监控面板', modifier: 'green' },
            { text: '循环', modifier: 'info' }
          ],
          meta: '12 项技能 · 日/周巡检 · 分级清单'
        },
        {
          icon: '📡',
          iconModifier: 'ref',
          name: '趋势报告',
          nameHref: './趋势报告/index.html',
          nameTarget: '_blank',
          desc: '趋势报告中心 — GitHub Trending / OSS Insight / TrendShift / Top-Starred 数据源扫描,可达性 + 趋势分析',
          tags: [
            { text: '监控面板', modifier: 'green' },
            { text: '趋势', modifier: 'info' }
          ],
          meta: '4 数据源 · 可达性 · 趋势方向'
        },
        {
          icon: '🧬',
          iconModifier: 'ref',
          name: '自改进分析',
          nameTarget: '_self',
          desc: '本页面顶部的自改进面板 — 日/周/月/全景四视角,实时追踪健康趋势与改进信号',
          tags: [
            { text: '本页内嵌', modifier: 'green' },
            { text: '分析', modifier: 'info' }
          ],
          meta: '日/周/月/全景 · 趋势追踪',
          onClick: function () {
            if (window.openPanel) window.openPanel('selfimprove');
          }
        },
        {
          icon: '📦',
          iconModifier: 'ref',
          name: 'memory 文件',
          nameTarget: '_blank',
          desc: 'YrY 运行时记忆 — .memory/ 目录的健康趋势、摘要、循环统计原始数据',
          tags: [
            { text: '数据源', modifier: 'green' },
            { text: 'memory', modifier: 'info' }
          ],
          meta: 'jsonl + json · 健康趋势 · 循环'
        },
        {
          icon: '🤖',
          iconModifier: 'ref',
          name: 'bot 状态',
          nameTarget: '_blank',
          desc: '企业微信机器人就绪状态 — Webhook 配置、消息计数、最近通知记录、连通性测试',
          tags: [
            { text: '运维面板', modifier: 'green' },
            { text: 'bot', modifier: 'info' }
          ],
          meta: '就绪状态 · 消息计数 · 连通测试'
        }
      ]
    };
  }

  function enrichLinks(grids) {
    Object.keys(grids).forEach(function (gridId) {
      (grids[gridId] || []).forEach(function (item) {
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
    return grids;
  }

  window.YrYVueCE.define({
    componentName: 'YryItemCards',
    templateId: 'yry-item-cards-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryItemCards',
        template: templateHTML,
        data: function () {
          var grids = enrichLinks(buildItemCardsData());
          /* 暴露给全局,兼容旧版调用方 */
          window.YRY_ITEM_CARDS = grids;
          return { grids: grids, mounted: {} };
        },
        methods: {
          mountAll: function () {
            var grids = this.grids;
            var mountedGrids = this.mounted;
            var mountCount = 0,
              pendingGrids = [];
            var self = this;

            Object.keys(grids).forEach(function (gridId) {
              if (mountedGrids[gridId]) return;
              var grid = document.getElementById(gridId);
              if (!grid) {
                pendingGrids.push(gridId);
                return;
              }
              if (grid.tagName && grid.tagName.toLowerCase() === 'yry-card-grid') {
                grid.items = grids[gridId];
                mountedGrids[gridId] = true;
                mountCount++;
                return;
              }
              /* 旧路径 fallback:plain <div class="card-grid"> → 手动挂载 */
              if (!window.YryItemCard) {
                console.warn('[YryItemCards] YryItemCard 未注册,跳过挂载 #' + gridId);
                return;
              }
              grids[gridId].forEach(function (item) {
                var host = document.createElement('div');
                grid.appendChild(host);
                if (window.Vue && window.YryItemCard) {
                  window.Vue.createApp(window.YryItemCard, item).mount(host);
                }
                mountCount++;
              });
              mountedGrids[gridId] = true;
            });

            if (mountCount > 0) {
              console.info(
                '[YryItemCards] 成功挂载',
                mountCount,
                '张卡片到',
                Object.keys(mountedGrids).length,
                '个 grid'
              );
            } else if (pendingGrids.length) {
              console.info(
                '[YryItemCards] 待挂载 grid:',
                pendingGrids.join(', '),
                '· 等待 yry-layer-*-ready 事件或 MutationObserver'
              );
            }

            /* 还原原静态 item-card 的交错动画延迟 */
            if (typeof requestAnimationFrame !== 'undefined') {
              requestAnimationFrame(function () {
                var i = 0;
                document.querySelectorAll('.card-grid .item-card').forEach(function (card) {
                  if (!card.style.animationDelay) {
                    card.style.animationDelay = 0.01 + (i % 20) * 0.012 + 's';
                  }
                  i++;
                });
              });
            }

            return pendingGrids.length;
          },
          setupObserver: function () {
            if (typeof MutationObserver === 'undefined') return;
            var self = this;
            var pendingTimer = null;
            function scheduleMount() {
              if (pendingTimer) return;
              pendingTimer = setTimeout(function () {
                pendingTimer = null;
                self.mountAll();
              }, 0);
            }
            ['yry-layer-agents', 'yry-layer-rules', 'yry-layer-refs'].forEach(function (tagName) {
              var el = document.querySelector(tagName);
              if (!el) return;
              var mo = new MutationObserver(function () {
                scheduleMount();
              });
              mo.observe(el, { childList: true, subtree: true });
            });
            var bodyMO = new MutationObserver(function (mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                  var n = added[j];
                  if (n.nodeType !== 1) continue;
                  if (n.id && window.YRY_ITEM_CARDS[n.id]) {
                    scheduleMount();
                    return;
                  }
                  if (n.querySelector && n.querySelector('yry-card-grid')) {
                    scheduleMount();
                    return;
                  }
                }
              }
            });
            bodyMO.observe(document.body, { childList: true, subtree: true });
          },
          triggerAll: function () {
            var self = this;
            this.mountAll();
            if (window.YryItemCard) this.mountAll();
            else
              document.addEventListener(
                'yry-item-card-ready',
                function () {
                  self.mountAll();
                },
                { once: true }
              );
            document.addEventListener('yry-layer-agents-ready', function () {
              self.mountAll();
            });
            document.addEventListener('yry-layer-rules-ready', function () {
              self.mountAll();
            });
            document.addEventListener('yry-layer-refs-ready', function () {
              self.mountAll();
            });
            if (document.readyState === 'loading') {
              document.addEventListener(
                'DOMContentLoaded',
                function () {
                  self.setupObserver();
                },
                { once: true }
              );
            } else {
              this.setupObserver();
            }
            [1000, 2000, 4000, 8000].forEach(function (delay) {
              setTimeout(function () {
                self.mountAll();
              }, delay);
            });
          }
        },
        mounted: function () {
          var self = this;
          this.$nextTick(function () {
            self.triggerAll();
          });
          document.dispatchEvent(
            new CustomEvent(READY_EVENT, { detail: { component: 'YryItemCards' } })
          );
        }
      };
    }
  });
})();
