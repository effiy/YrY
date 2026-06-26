/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayerInfoPanel · 层级详情弹出面板 (Vue 3 custom element, full)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-layer-info-panel/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-layer-info-panel/index.js"></script>
     <yry-layer-info-panel></yry-layer-info-panel>
     <a onclick="window.layerInfo.show('deps')">查看依赖</a>

   行为:
     1) 内置 7 个层级 (deps/story/scene/skills/agents/rules/refs) 详情数据
     2) 暴露 window.layerInfo.show(name) / window.layerInfo.close() 全局 API
     3) ESC 关闭 · 点击 overlay 关闭
     4) 派发 yry-layer-info-panel-ready 事件

   数据迁移说明:
     本组件 1:1 保留 docs/js/layer-info.js 的 DATA 字典与 show/close API,
     但改为 Vue 3 custom element 模式,模板来自 index.html。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryLayerInfoPanel] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TAG_NAME = 'yry-layer-info-panel';

  var TEMPLATE_ID = 'yry-layer-info-panel-tpl';

  var READY_EVENT = 'yry-layer-info-panel-ready';

  var LOAD_TIMEOUT_MS = 5000;

  function buildLayerData() {
    return {
      deps: {
        title: '📦 第三方依赖与框架',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">YrY 运行和开发所依赖的外部资源,按职责分为运行时和开发两类。</p><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">运行时依赖 (6)</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>yry-cdn-lib</code></td><td>自建 CDN 共享库 — 双主题 + 21 CSS 组件 + 9 JS API</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>Cytoscape.js</code></td><td>知识图谱交互式可视化引擎</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>html2canvas</code></td><td>架构图 DOM → Canvas 截图导出</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>jsPDF</code></td><td>客户端 PDF 生成引擎</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>api.effiy.cn</code></td><td>远端文档 CRUD API(自建)</td></tr><tr><td style="padding:4px 8px"><code>企业微信 Webhook</code></td><td>企微群机器人消息推送</td></tr></table><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">开发依赖 (4)</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>Node.js 内置模块</code></td><td>fs/path/child_process/crypto/http — 零 npm 运行时依赖</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>vitest</code></td><td>ESM 原生测试框架 + 覆盖率</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>@vitest/ui</code></td><td>测试可视化仪表盘</td></tr><tr><td style="padding:4px 8px"><code>chrome-devtools-mcp</code></td><td>程序化浏览器验证(CDN 加载链路)</td></tr></table>'
      },
      lib: {
        title: '📚 内部共享库 (lib/) — 28 模块 · 7 类目',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">lib/ 是项目自建的内部共享库,被所有 skill 调用。按职责分为 7 类:架构校验 · 引擎 · 基础工具 · 测试基础设施 · 智能引擎 · 辅助工具。零运行时 npm 依赖,纯 ESM + Node.js 内置模块。</p><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">架构校验 (3 项)</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>arch-check.mjs</code></td><td>10 维度架构合规 — kernel(3) + solid(5) + quality(2)</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>arch-dimensions/kernel-paradigm</code></td><td>kernel · paradigm · coupling 三检查器</td></tr><tr><td style="padding:4px 8px"><code>arch-dimensions/solid</code></td><td>SOLID 五原则 — SRP / DRY / YAGNI / OCP / ISP</td></tr></table><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">引擎 (4 项)</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>engine/diagnostics</code></td><td>诊断引擎 — D0-D7 八级规则化判定</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>engine/evaluate</code></td><td>评估引擎 — E1-E4 改进前后对比</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>engine/materialize</code></td><td>物化引擎 — 抽象规则转化为可执行产物</td></tr><tr><td style="padding:4px 8px"><code>engine/upgrade</code></td><td>升级引擎 — 经验技能化升级路径</td></tr></table><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">测试 (3 项) — 105 自检测试全通过</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>test-harness.mjs</code></td><td>统一测试框架 — describe/it/assert/run</td></tr><tr><td style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,.04)"><code>test-helpers.mjs</code></td><td>测试工具集 — 25+ 函数(fileExists/parseFrontmatter 等)</td></tr><tr><td style="padding:4px 8px"><code>vitest-adapter.mjs</code></td><td>Vitest 适配器 — 双轨运行支持</td></tr></table><p style="font-size:.64rem;color:var(--text-muted);margin-top:10px">🧪 <code>node skills/rui/tests/run.mjs --lib</code> 一键跑全部 105 个 lib/ 自检测试</p>'
      },
      story: {
        title: '📖 故事 — 项目核心工作单元',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">故事是管线中单一、独立、可完成的作业单元。每个故事内聚在 <code>docs/故事任务面板/&lt;name&gt;/</code> 目录。</p><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr style="background:rgba(255,255,255,.02)"><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)">yry-arch</td><td style="padding:6px 8px">系统架构知识固化 — 4 场景:模块定位 · 数据流追踪 · 新人上手 · 依赖变更影响</td><td style="padding:6px 8px;white-space:nowrap;color:var(--color-accent)">v1.0.0</td></tr><tr><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)">yry-self-test</td><td style="padding:6px 8px">自主测试方案 — 项目的免疫系统:4 场景全量/增量自检</td><td style="padding:6px 8px;white-space:nowrap;color:var(--color-accent)">v1.1.0</td></tr><tr style="background:rgba(255,255,255,.02)"><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)">rui-npm</td><td style="padding:6px 8px">npm 包管理工具 — 5 场景:搜索/安装/发布/审计/账号管理。32 文件 · 77 测试</td><td style="padding:6px 8px;white-space:nowrap;color:var(--color-accent)">v1.1.0</td></tr><tr><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)">yry-cdn</td><td style="padding:6px 8px">CDN 共享前端资源库 — 5 场景:双主题系统 · 21 组件 · 9 API</td><td style="padding:6px 8px;white-space:nowrap;color:var(--color-accent)">v1.0.0</td></tr></table><p style="font-size:.64rem;color:var(--text-muted);margin-top:10px">📖 每个故事含:故事任务.md + 场景-N-&lt;slug&gt;.md §0-§4 + knowledge-graph.json</p>'
      },
      scene: {
        title: '🎬 场景 — 21 个独立可验证的交付切片',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">每个场景含 7 类标准 HTML 文档:计划清单 · 架构图 · 知识图谱 · 源码 · 测试面板 · 演示 · 审查。</p><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">按故事分组</h3><table style="width:100%;font-size:.68rem;color:var(--text-muted);border-collapse:collapse"><tr style="background:rgba(255,255,255,.02)"><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)">📐 yry-arch</td><td style="padding:4px 8px">4 场景</td><td style="padding:4px 8px">模块定位 · 数据流追踪 · 新人上手 · 依赖变更影响</td></tr><tr><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)">🧪 yry-self-test</td><td style="padding:4px 8px">4 场景</td><td style="padding:4px 8px">init 后全量自检 · commit 前增量 · 文档代码一致性 · 安全面回归</td></tr><tr style="background:rgba(255,255,255,.02)"><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)">📦 rui-npm</td><td style="padding:4px 8px">5 场景</td><td style="padding:4px 8px">搜索与发现 · 安装与版本 · 发布与 npx · 审计与卸载 · 账号管理</td></tr><tr><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)">🌐 yry-cdn</td><td style="padding:4px 8px">5 场景</td><td style="padding:4px 8px">资源加载 · 双主题 · 组件与 API · 页面迁移 · 发布与版本</td></tr><tr style="background:rgba(255,255,255,.02)"><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)">🎬 演示中心</td><td style="padding:4px 8px">3 场景</td><td style="padding:4px 8px">架构/自检/npm 三大演示入口</td></tr></table>'
      },
      skills: {
        title: '⚡ 技能 — 19 能力模块',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">技能是单一职责的能力模块,通过 <code>/rui</code> 编排器路由。按 SRP 拆分为编排入口、管线子技能、支撑技能、新增技能四组。</p><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">编排入口 (1)</h3><table style="width:100%;font-size:.68rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:3px 8px"><code>rui</code></td><td style="padding:3px 8px">故事驱动 SDLC 编排器 — 命令路由 + 推荐引擎,委托 7 子技能</td></tr></table><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">管线子技能 (7)</h3><table style="width:100%;font-size:.68rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:3px 8px"><code>rui-init</code></td><td style="padding:3px 8px">项目基线建立 — detect → explore → generate → arch → setup → verify</td></tr><tr><td style="padding:3px 8px"><code>rui-doc</code></td><td style="padding:3px 8px">Markdown 文档基线 — 需求→故事拆分→文档基线,3 模式</td></tr><tr><td style="padding:3px 8px"><code>rui-plan</code></td><td style="padding:3px 8px">实施计划 — 文件映射→任务分解→六项自审查→plan.html</td></tr><tr><td style="padding:3px 8px"><code>rui-code</code></td><td style="padding:3px 8px">源码实现管线 — 分支隔离→Gate A→逐模块 P0 清零→Gate B→交付</td></tr><tr><td style="padding:3px 8px"><code>rui-update</code></td><td style="padding:3px 8px">增量更新 — T1/T2/T3 变更范围自动裁剪管线</td></tr><tr><td style="padding:3px 8px"><code>rui-yry</code></td><td style="padding:3px 8px">自改进闭环 — 全自主扫描→诊断→实现→验证→版本升级</td></tr><tr><td style="padding:3px 8px"><code>rui-version</code></td><td style="padding:3px 8px">版本管理 — 语义版本判定→四文件更新→commit+tag+push</td></tr></table>'
      },
      agents: {
        title: '🤖 Agent 角色 — 9 角色 + 1 拓扑总纲',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">Agent 是管线中的角色定义,各有职责边界和读写权限。由 <code>agents/AGENT.md</code> 拓扑总纲统一协调。</p><p style="font-size:.66rem;color:var(--text-muted);margin-bottom:8px">pm 作为决策中枢,沿 <code>pm → planner → coder → tester → reporter</code> 主链委派,security / architect / code-reviewer 横切注入约束,self-improve 异步闭环。详细契约与多 Agent 协作模式见 <a href="../agents/AGENT.md" target="_blank" style="color:var(--cyan)">agents/AGENT.md</a>。</p><table style="width:100%;font-size:.68rem;color:var(--text-muted);border-collapse:collapse"><tr style="background:rgba(255,255,255,.03)"><td style="padding:5px 8px;font-weight:600;color:var(--text-primary)" colspan="3">核心角色 (4) — 读写权限,驱动管线执行</td></tr><tr><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)"><code>pm</code></td><td style="padding:4px 8px">产品决策者</td><td style="padding:4px 8px;font-size:.62rem">需求解析→自适应规划→委派子 PM</td></tr><tr><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)"><code>planner</code></td><td style="padding:4px 8px">实施规划者</td><td style="padding:4px 8px;font-size:.62rem">步骤拆分→方案评估→委派 coder</td></tr><tr><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)"><code>coder</code></td><td style="padding:4px 8px">代码实现者</td><td style="padding:4px 8px;font-size:.62rem">逐模块实现·P0 强制清零·Gate 审查</td></tr><tr><td style="padding:4px 8px;font-weight:600;color:var(--text-primary)"><code>tester</code></td><td style="padding:4px 8px">质量保障者</td><td style="padding:4px 8px;font-size:.62rem">测试先行·Gate A 准入·Gate B 交付</td></tr></table>'
      },
      rules: {
        title: '📜 治理规则 — 18 条约束',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">规则定义不可妥协的底线和最佳实践,按 5 类组织:管线执行 · 文档 · 安全配置 · 自改进 · 设计质量。所有 Agent 行为受其约束,合规性由健康检查与 rui-yry 自循环监控。</p><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">管线与执行 (5)</h3><table style="width:100%;font-size:.68rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:3px 8px"><a href="../../skills/rui-code/rules/code-pipeline.md" target="_blank" style="color:var(--cyan)">code-pipeline</a></td><td style="padding:3px 8px">分支隔离 · Gate A/B 关卡 · 逐模块 P0 清零 · 研究优先开发</td></tr><tr><td style="padding:3px 8px"><a href="../../skills/rui-code/rules/code-pipeline-techniques.md" target="_blank" style="color:var(--cyan)">code-pipeline-techniques</a></td><td style="padding:3px 8px">10 项支撑技术模式 · 贯穿管线各阶段 · 每项对应一条 Iron Law</td></tr><tr><td style="padding:3px 8px"><a href="../../skills/rui/rules/delivery-gate.md" target="_blank" style="color:var(--cyan)">delivery-gate</a></td><td style="padding:3px 8px">交付收口三步 Hook:追加日志 → 文档同步 → 企微通知</td></tr><tr><td style="padding:3px 8px"><a href="../../skills/rui-html/rules/architecture-diagram.md" target="_blank" style="color:var(--cyan)">architecture-diagram</a></td><td style="padding:3px 8px">Mermaid 语法 · 颜色语义体系 · 布局标准</td></tr><tr><td style="padding:3px 8px"><a href="../../skills/rui-plan/rules/plan-execution.md" target="_blank" style="color:var(--cyan)">plan-execution</a></td><td style="padding:3px 8px">计划创建 → 逐步骤执行 → 每步验证 → P0 强制清零 → 完成信号</td></tr></table>'
      },
      refs: {
        title: '🔗 参考入口 — 项目元信息(4 文档 + 1 拓扑 + 6 监控)',
        content:
          '<p style="color:var(--text-secondary);margin-bottom:12px">项目最重要的入口文档、角色拓扑与监控仪表板。所有外部触发与系统状态都在此汇总。</p><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">文档入口 (4)</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)"><a href="../README.md" target="_blank" style="color:var(--cyan)">README.md</a></td><td style="padding:6px 8px">项目总览 — 系统全景图 · 管线架构 · 快速开始 · 命令参考 · 领域语言(20 术语)</td></tr><tr style="background:rgba(255,255,255,.02)"><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)"><a href="../CLAUDE.md" target="_blank" style="color:var(--cyan)">CLAUDE.md</a></td><td style="padding:6px 8px">AI 项目指令 — 四大铁律 · 项目画像 · 不可妥协底线 · 退化三因与四层防御</td></tr><tr><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)"><a href="../skills/rui/formulas.md" target="_blank" style="color:var(--cyan)">formulas.md</a></td><td style="padding:6px 8px">故事文档公式 — 生成模板与公式定义(通用元素 · 故事主线 · 补充文档)</td></tr><tr style="background:rgba(255,255,255,.02)"><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)"><a href="../skills/rui-bot/SKILL.md" target="_blank" style="color:var(--cyan)">企微 Bot 配置</a></td><td style="padding:6px 8px">Webhook 配置 — 消息格式定义 · 通知触发条件 · 发送演示</td></tr></table><h3 style="color:var(--color-accent);font-size:.78rem;margin:12px 0 6px">角色与拓扑 (1)</h3><table style="width:100%;font-size:.7rem;color:var(--text-muted);border-collapse:collapse"><tr><td style="padding:6px 8px;font-weight:600;color:var(--text-primary)"><a href="../agents/AGENT.md" target="_blank" style="color:var(--cyan)">AGENT.md</a></td><td style="padding:6px 8px">Agent 角色拓扑总纲 — 行为纪律 · 设计原则 · 执行准则 · ADR · 多 Agent 协作模式</td></tr></table>'
      }
    };
  }

  window.YrYVueCE.define({
    componentName: 'YryLayerInfoPanel',
    templateId: 'yry-layer-info-panel-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryLayerInfoPanel',
        template: templateHTML,
        data: function () {
          return {
            DATA: buildLayerData(),
            currentName: null,
            openState: false
          };
        },
        computed: {
          currentTitle: function () {
            if (!this.currentName || !this.DATA[this.currentName]) return '层级详情';
            return this.DATA[this.currentName].title;
          },
          currentContent: function () {
            if (!this.currentName || !this.DATA[this.currentName]) return '';
            return this.DATA[this.currentName].content;
          }
        },
        methods: {
          show: function (name) {
            if (!this.DATA[name]) return false;
            this.currentName = name;
            this.openState = true;
            return true;
          },
          close: function () {
            this.openState = false;
          },
          onOverlayClick: function () {
            this.close();
          },
          isOpen: function () {
            return this.openState;
          },
          registerAPI: function () {
            var self = this;
            window.layerInfo = {
              show: function (name) {
                return self.show(name);
              },
              close: function () {
                self.close();
              }
            };
          }
        },
        mounted: function () {
          var self = this;
          this.registerAPI();
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && self.openState) self.close();
          });
          document.dispatchEvent(
            new CustomEvent(READY_EVENT, { detail: { component: 'YryLayerInfoPanel' } })
          );
        }
      };
    }
  });
})();
