# coder 工作手册

> **口诀：知目录、循公式、明数据。**
>
> **项目**: YrY · 元项目(插件/配置) · 公式: 模块 → 接口 → 数据流

## 文档分层

| 类别 | 用途 | 触发 |
|------|------|------|
| 故事级执行 | 做什么/怎么做/做了什么 | /rui doc · /rui code |
| 项目级参考 | 当前是什么 | /rui doc --from-code |

```
docs/
├── 故事任务面板/YrY/<name>/   ← 执行
├── 组件文档/YrY/<component>/  ← 参考（组件）
├── 页面文档/YrY/<page>/       ← 参考（页面）
├── 接口文档/YrY/<resource>/   ← 参考（API）
└── 领域模型/YrY/<domain>/     ← 参考（领域）
```

## 故事目录骨架

| 文件 | 必选 | 负责人 | 阶段 |
|------|:---:|--------|------|
| 01-故事任务.md | ✓ | pm | 文档生成 |
| 02-后端技术评审.md | ✓ | coder + security | 文档生成 |
| 03-前端技术评审.md | ✓ | coder | 文档生成 |
| 04-测试用例评审.md | ✓ | tester | 文档生成 |
| 05-后端实施报告.md | ✓ | coder | 验证 |
| 06-前端实施报告.md | ✓ | coder | 验证 |
| 07-测试用例报告.md | ✓ | tester | 验证 |
| 08-自改进复盘.md | ✓ | self-improve | 自改进 |

## 完整度判定

| 状态 | 条件 |
|------|------|
| not_started | 故事任务不存在 |
| docs_in_progress | 故事任务存在，必选文档有缺失 |
| docs_done | 所有必选文档存在 |
| code_in_progress | 文档齐全 + 部分实施报告 |
| code_done | 所有必选文件 + 自改进复盘存在 |
| blocked | rui-state.json 中 blocked=true |

## 数据契约

```
docs/<文档类>/YrY/<name>/
├── .improvement/proposals.jsonl     ← self-improve 追加
└── .memory/
    ├── execution-memory.jsonl       ← 每次阶段变更追加
    └── rui-state.json               ← 当前状态覆盖写
```

### 写入规则

| 规则 | 说明 |
|------|------|
| append-only | execution-memory.jsonl 与 proposals.jsonl 仅追加 |
| 覆盖写 | rui-state.json 每次阶段变更覆盖 |
| 不手编 | 三个文件均由脚本管理 |
