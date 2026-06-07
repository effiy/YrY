# YrY Templates

> 模板系统为 `/rui doc` 和 `/rui init` 管线提供可复用的起点。每模板文件使用 `{{PLACEHOLDER}}` 语法标记可替换值。

## 模板占位符

| 占位符 | 用途 | 示例 |
|----------|-------|--------|
| `{{PROJECT_NAME}}` | 项目名称 | `YrY` |
| `{{VERSION}}` | 故事版本（非项目版本） | `1.0.0` |
| `{{DATE}}` | ISO 日期 | `2026-06-05` |
| `{{AUTHOR}}` | 作者标识 | `deepseek-v4-pro` |
| `{{STORY_NAME}}` | 故事目录名 | `yry-arch` |
| `{{STORY_DESC}}` | 故事描述 | `系统架构知识固化` |
| `{{STORY_LABEL}}` | 故事简短标签 | `系统架构` |
| `{{DOCS_INDEX}}` | 文档中心链接 | `../../../index.html` |
| `{{SCENE_NAME}}` | 场景完整名称 | `场景 1 · 模块定位与职责` |
| `{{SCENE_SHORT}}` | 场景简短标识 | `场景1: 模块定位` |
| `{{SCENE_SLUG}}` | 场景文件夹名 | `场景-1-模块定位` |
| `{{PAGE_TYPE}}` | 当前页面类型 | `架构图` / `知识图谱` / `测试面板` / `演示` / `计划清单` |

## 目录结构

```
templates/
├── README.md                          # 本文件
├── docs/
│   ├── index.html                     # 文档中心着陆页
│   └── 故事任务面板/
│       ├── 故事任务.md                # 故事任务文档
│       ├── 场景-<N>-<slug>.md         # 场景文档模板
│       ├── 计划清单.html              # 每场景实施清单
│       ├── 架构图.html                # 每场景架构图（深色主题 + SVG）
│       ├── 知识图谱.html              # 每场景知识图谱（深色主题 + D3）
│       ├── 测试面板.html              # 每场景测试仪表盘（分页 + 统计）
│       ├── 演示.html                  # 每场景交互演示（逐步展示）
│       └── 审查.html                  # 每场景审查报告（维度评分 + 案例 + 建议）
└── tests/
    ├── run.mjs                        # 测试运行器（子进程生成，多过滤器）
    ├── manifest.json                  # 测试清单
    ├── results.json                   # 测试结果模式
    ├── agents/
    │   └── agents.test.mjs            # Agent 定义验证
    ├── integration/
    │   ├── cross-references.test.mjs  # 跨文档交叉引用检查
    │   └── knowledge-graph.test.mjs   # 知识图谱结构检查
    ├── lib/
    │   ├── helpers.mjs                # 共享测试工具（FS、解析器、列表）
    │   └── test-harness.mjs           # describe/it/assert 测试框架
    ├── rules/
    │   └── rules.test.mjs             # 规则定义验证
    └── skills/
        └── (每个技能一个测试文件 — 请参见实际 tests/skills/ 示例)
```

> **注意**: `templates/tests/` 和 `tests/` 是**有意分离**的。前者通过 `/rui init` 分发给新项目，后者是 YrY 自身的自检测试。两者结构镜像但路径解析上下文不同（`PROJECT_ROOT` 指向各自的项目根）。修改测试框架时更新 `templates/tests/`，然后同步至 `tests/`。

## 每场景 6 个交付物

每个场景目录在管线完成后包含恰好 6 个 HTML 交付物：

| 文件 | 负责人 | 用途 | 模板 |
|------|--------|-------|-----------|
| `计划清单.html` | planner | 实施规划与进度追踪 | `templates/docs/故事任务面板/计划清单.html` |
| `架构图.html` | architect | SVG 架构图，含导出 | `templates/docs/故事任务面板/架构图.html` |
| `知识图谱.html` | pm | 知识图谱可视化 | `templates/docs/故事任务面板/知识图谱.html` |
| `测试面板.html` | tester | 测试仪表盘与结果 | `templates/docs/故事任务面板/测试面板.html` |
| `演示.html` | coder | 交互式逐步演示 | `templates/docs/故事任务面板/演示.html` |
| `审查.html` | reviewer | 代码审查记录 — 维度评分 · 好/坏案例 · 改进建议 · 证据链 | `templates/docs/故事任务面板/审查.html` |

## 模板使用方式

模板通过 `/rui doc` 管线即时处理，管线找到匹配 `{{UPPER_CASE}}` 语法的占位符，并将其替换为从项目元数据、故事前端内容和场景定义中获取的值。

### 约定

1. **仅使用大写占位符** — `{{VERSION}}`，不使用 `{{version}}`
2. **占位符是自描述的** — 名称应传达预期值
3. **模板是有效的 HTML/Markdown** — 即使有未解析的占位符，它们也应能渲染
4. **与仓库保持同步** — 当生产文件引入新模式时，更新模板
5. **测试框架是模板的镜像** — `templates/tests/lib/` 是测试框架的**权威源**；修改时先改模板再同步到 `tests/lib/`
6. **共享代码放 `lib/`** — 新项目通过 `/rui init` 获得项目根 `lib/` 目录（TTY 格式化、FS 工具、共享常量、help 布局），跨脚本公共代码从此导入，禁止 copy-paste
