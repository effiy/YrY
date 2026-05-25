> | v1.0.0 | 2026-05-23 | deepseek-v4-pro | 🌿 feat/rui-trends-help-doc | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-使用场景](./YrY-使用场景.md) · [YrY-测试设计 →](./YrY-测试设计.md) · [YrY-安全审计 →](./YrY-安全审计.md)

> **来源引用**: 基于双基线 + 源码反推。证据 Level B + 源码路径。

[§0 设计决策](#sec0-design) · [§1 系统架构](#sec1-architecture) · [§9 评审清单](#sec9-checklist)

### 主要价值

- 🏗 定义帮助系统技术架构：模板字符串 + ANSI + TTY 降级
- 🔗 6 个子命令按功能分组（统计/大文件/热点/组件/复盘/趋势）的格式化约定
- 🛡 TTY 检测防御确保管道兼容
- ⚡ 为测试和安全审计提供技术基线

---

<a id="sec0-design"></a>
## §0 设计决策

### §0.0 基线溯源

| 本设计章节 | 实现故事任务 | 服务使用场景 | 覆盖状态 |
|-----------|------------|------------|---------|
| §1 系统架构 | FP1–FP4 | 场景 1–4 | 已覆盖 |

### §0.1 设计决策

| 决策领域 | 选定方案 | 选择理由 |
|---------|---------|---------|
| 输出构建 | 模板字符串拼接 | 静态文本 |
| 子命令展示 | 6 个子命令按功能分组（modules/large-files/hotspots/components/review/trending） | 按分析类型分离 |
| TTY 降级 | isTTY + 函数替换 | 零开销透传 |
| 列对齐 | 44 字符命令列 | 适配子命令长度 |

---

<a id="sec1-architecture"></a>
## §1 系统架构

### 效果示意

```mermaid
flowchart TD
    ENTRY["执行 help.mjs"]:::entry --> INIT["ANSI 常量 + TTY 检测"]:::proc
    INIT --> FUNC["格式化函数"]:::proc
    FUNC --> BUILD["模板字符串拼接<br/>子命令+参数+场景"]:::proc
    BUILD --> OUTPUT["console.log"]:::out

    classDef entry fill:#e8f5e9,stroke:#2e7d32;
    classDef proc fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
```

---

<a id="sec9-checklist"></a>
## §9 评审清单

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 基线溯源完备 | ✅ |
| 2 | 效果示意完整 | ✅ |
| 3 | TTY 降级路径存在 | ✅ |

---

> **变更记录**
> | 日期 | 变更 | 触发 | 证据 |
> |------|------|------|------|
> | 2026-05-23 | 初始生成 | /rui doc --from-code rui-trends-help-doc | skills/rui-trends/help.mjs |
