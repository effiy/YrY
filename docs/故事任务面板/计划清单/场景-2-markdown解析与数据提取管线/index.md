# 场景 2 · markdown 解析与数据提取管线

> | v1.0.0 | 2026-06-13 | 🏷️ checklist | 📎 [故事任务](../故事任务.md) |

## §0 技术评审

从场景 index.md 中提取结构化数据，是计划清单从静态模板变为数据驱动页面的关键层。解析器将 markdown 的 §0–§4 章节拆分为可编程操作的 Context 对象。

### 效果示意

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b', 'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1', 'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b', 'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    MD["index.md"]:::src --> SPLIT["§0-§4 章节拆分"]:::t
    SPLIT --> TABLE["表格→JSON 解析"]:::t
    TABLE --> META["元数据抽取<br/>版本·日期·标题"]:::t
    META --> CTX["Context 对象组装"]:::t
    CTX --> RENDER["模板渲染输入"]:::out
    classDef src fill:#1e1f2b,stroke:#3d59a1,color:#a9b1d6
    classDef t fill:#3B82F6,color:#fff
    classDef out fill:#34d399,color:#000
```

## §1 测试设计

| TC# | 用例 | 验证点 | 预期 |
|-----|------|--------|------|
| TC-6 | 标准章节拆分 | §0-§4 全部识别 | 5/5 章节 |
| TC-7 | 步骤表解析 | 10 列完整提取 | 字段 100% 准确 |
| TC-8 | 空章节处理 | §3 缺失不崩溃 | 占位提示 |
| TC-9 | mermaid 提取 | 代码块完整 | 不截断 |

## §2 实施报告

| 产物 | 类型 | 状态 |
|------|------|------|
| extractor.mjs | Node 脚本 | ✅ 已交付 |
| Context schema | JSON Schema | ✅ 已交付 |
| 解析器测试套件 | vitest | ✅ 已交付 |

## §3 测试报告

| 套件 | 断言数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| 章节拆分 | 5 | 5 | 0 | 100% |
| 表格解析 | 12 | 12 | 0 | 100% |
| 元数据抽取 | 4 | 4 | 0 | 100% |
| 异常处理 | 3 | 3 | 0 | 100% |

## §4 自改进

- [x] 非标准章节（§5+）静默忽略不报错
- [x] 合并单元格自动填充值
- [ ] 支持 YAML frontmatter 元数据（P2）
