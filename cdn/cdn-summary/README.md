# YrY CDN · CDN Summary 跨版本摘要

> CDN 跨多版本聚合摘要数据，CDN 首页实时评分面板的核心数据源。
> `index.json` 由 `rui-bot health` 每 5 分钟自动刷新，提供综合评分 · 8 维聚合 · 诊断标签 · 趋势信号。

## 文件

```
cdn-summary/
├── index.html    # 摘要可视化页面（版本演进 · 8 维聚合 · 组件仪表板 · 原始数据）
├── index.json    # 摘要数据（机器可读，每 5min 刷新）
└── README.md     # 本文件
```

## 数据格式 (index.json)

```json
{
  "latest": {
    "version": "1.2.0",
    "composite": 92,
    "grade": "A",
    "date": "2026-06-16"
  },
  "totalVersions": 3,
  "dateRange": "2026-04-08 ~ 2026-06-22",
  "dimSummary": [
    { "label": "CSS 组件覆盖", "avgScore": 95, "trend": 5,  "recentAvg": 95, "entries": 3 },
    { "label": "双主题完备性", "avgScore": 90, "trend": 0,  "recentAvg": 90, "entries": 3 },
    { "label": "JS API 一致性", "avgScore": 88, "trend": 3,  "recentAvg": 88, "entries": 3 },
    { "label": "加载链稳定",   "avgScore": 96, "trend": 2,  "recentAvg": 96, "entries": 3 },
    { "label": "页面迁移率",   "avgScore": 85, "trend": 8,  "recentAvg": 85, "entries": 3 },
    { "label": "字体性能",     "avgScore": 92, "trend": 0,  "recentAvg": 92, "entries": 3 },
    { "label": "测试覆盖",     "avgScore": 87, "trend": 6,  "recentAvg": 87, "entries": 3 },
    { "label": "自改进闭环",   "avgScore": 89, "trend": 4,  "recentAvg": 89, "entries": 3 }
  ],
  "diagSummary": [
    { "id": "D0", "label": "基线偏离",   "count": 0, "rate": 0 },
    { "id": "D1", "label": "效率退化",   "count": 0, "rate": 0 },
    { "id": "D2", "label": "质量退化",   "count": 0, "rate": 0 },
    { "id": "D3", "label": "复杂度增长", "count": 1, "rate": 33 },
    { "id": "D4", "label": "流程退化",   "count": 0, "rate": 0 },
    { "id": "D5", "label": "依赖退化",   "count": 0, "rate": 0 },
    { "id": "D6", "label": "文档过时",   "count": 0, "rate": 0 },
    { "id": "D7", "label": "配置漂移",   "count": 0, "rate": 0 }
  ],
  "diagLabels": { "D0": "基线偏离", "D1": "效率退化", "D2": "质量退化", "D3": "复杂度增长", "D4": "流程退化", "D5": "依赖退化", "D6": "文档过时", "D7": "配置漂移" },
  "scoreTrend": [
    { "date": "2026-04-08", "score": 78, "grade": "C", "version": "1.0.0" },
    { "date": "2026-05-20", "score": 86, "grade": "B", "version": "1.1.0" },
    { "date": "2026-06-16", "score": 92, "grade": "A", "version": "1.2.0" }
  ],
  "signals": [
    { "type": "improvement", "icon": "📈", "msg": "页面迁移率连续 3 版本上升至 85%, D0-D8 诊断覆盖率改善" },
    { "type": "info",        "icon": "ℹ️", "msg": "CDN 组件已扩展至 125 个 (30 Vue + 83 Vanilla + 12 页面/样式基类), 文档覆盖率 100% · 完整 111 · 待补 14" }
  ],
  "componentHealth": {
    "vue":          { "count": 54, "avgScore": 92 },
    "vanilla":      { "count": 53, "avgScore": 90 },
    "infrastructure": { "count": 9,  "avgScore": 95 },
    "overallAvg": 92,
    "totalComponents": 107
  },
  "scoreReport": {
    "updated": "2026-06-20T01:32:14.203Z",
    "composite": 92,
    "grade": "A",
    "dataPoints": 3,
    "trend": {
      "direction": "rising",
      "slopePerWeek": 49,
      "r2": 0.99,
      "confidence": "high"
    },
    "reliability": {
      "current": 92,
      "mean": 85.3,
      "stddev": 5.7,
      "ci95": [80.8, 103.2],
      "volatility": "moderate",
      "score": 0.93
    }
  }
}
```

## 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `latest` | object | 最新版本快照：`version` · `composite` · `grade` · `date` |
| `totalVersions` | number | 版本总数（当前 3） |
| `dateRange` | string | 数据时间范围（ISO 日期区间） |
| `dimSummary` | array | 8 维跨版本聚合评分（每维含 `label` · `avgScore` · `trend` · `recentAvg` · `entries`） |
| `diagSummary` | array | D0-D8 九级诊断触发统计（每级含 `id` · `label` · `count` · `rate`） |
| `diagLabels` | object | D0-D8 中文标签映射 |
| `scoreTrend` | array | 版本评分趋势数组（`date` · `score` · `grade` · `version`） |
| `signals` | array | 智能信号列表（`type` · `icon` · `msg`） |
| `componentHealth` | object | 组件健康分布（`vue` · `vanilla` · `infrastructure` 三组 + `overallAvg` · `totalComponents`） |
| `scoreReport` | object | 评分报告（含趋势分析 · 可靠性指标 · 置信区间） |

## 8 维聚合评分（dimSummary）

| # | 维度 | avgScore | trend | 含义 |
|---|------|:---:|:---:|------|
| 1 | CSS 组件覆盖 | 95 | +5 | `yry-*` 目录含 `index.css` 的比例与质量 |
| 2 | 双主题完备性 | 90 | 0 | System + Mono 双主题均可用 |
| 3 | JS API 一致性 | 88 | +3 | `YrY.*` 9 API 命名与签名一致性 |
| 4 | 加载链稳定 | 96 | +2 | 5 步加载链各步成功率 |
| 5 | 页面迁移率 | 85 | +8 | 存量页面迁移到新架构的比例 |
| 6 | 字体性能 | 92 | 0 | JetBrains Mono 加载性能 |
| 7 | 测试覆盖 | 87 | +6 | vitest 覆盖率与用例通过率 |
| 8 | 自改进闭环 | 89 | +4 | D0-D8 诊断与 E1-E4 评估闭环活跃度 |

## D0-D8 九级诊断（diagSummary）

| 级别 | 标签 | 触发次数 | 触发率 |
|------|------|:---:|:---:|
| D0 | 基线偏离 | 0 | 0% |
| D1 | 效率退化 | 0 | 0% |
| D2 | 质量退化 | 0 | 0% |
| D3 | 复杂度增长 | 1 | 33% |
| D4 | 流程退化 | 0 | 0% |
| D5 | 依赖退化 | 0 | 0% |
| D6 | 文档过时 | 0 | 0% |
| D7 | 配置漂移 | 0 | 0% |

## 组件健康分布（componentHealth）

| 类别 | 数量 | 平均分 |
|------|:---:|:---:|
| Vue 组件 | 54 | 92 |
| Vanilla 组件 | 53 | 90 |
| 基础设施模块 | 9 | 95 |
| **总计** | **107** | **92（overallAvg）** |

## 趋势与可靠性（scoreReport）

| 指标 | 值 | 说明 |
|------|:---:|------|
| 综合评分 | 92 | 当前 composite |
| 等级 | A | 评级规则映射 |
| 数据点 | 3 | 历史版本数 |
| 趋势方向 | rising | `slopePerWeek` > 0 |
| 每周斜率 | 49 | 评分增长速率 |
| R² | 0.99 | 线性拟合度（1.0 = 完美线性） |
| 置信度 | high | R² ≥ 0.95 |
| 均值 | 85.3 | 历史平均分 |
| 标准差 | 5.7 | 评分波动幅度 |
| 95% 置信区间 | [80.8, 103.2] | 下一版本预测区间 |
| 波动性 | moderate | stddev/mean 分级 |
| 可靠性评分 | 0.93 | 0-1 标准化 |

## 消费方

| 消费方 | 路径 | 用途 |
|--------|------|------|
| **CDN 首页** | `cdn/index.html` | 实时评分面板（综合评分 · 维度分解 · 趋势对比） |
| **健康报告** | `cdn/health-report/index.html` | 版本对比 · 健康趋势 |
| **组件报告** | `docs/组件报告/index.html` | 组件质量分布 · 分类评分 |
| **企微通知** | `rui-bot health --notify` | 健康摘要推送 |
| **自改进闭环** | `docs/自我改进/` | 信号驱动改进项 |

## 刷新机制

| 属性 | 值 |
|------|-----|
| **刷新频率** | 每 5 分钟 |
| **生成命令** | `node skills/rui-bot/send.mjs health` |
| **容错策略** | 2 次重试 + 10s 超时 → 离线降级到内置默认数据 |
| **数据源** | 文件系统扫描 + vitest runner + 客户端埋点 + HTTP 探测 |
| **持久化** | `.memory/health-trend.jsonl` 追加写入 |

## 评级规则

| 等级 | 分数范围 | 含义 | 行动 |
|------|---------|------|------|
| **A** | ≥ 80 | 优秀 — 系统健康 | 维持现状 |
| **B** | 60-79 | 良好 — 需关注 | 排查退化维度 |
| **C** | 40-59 | 需改进 — 存在缺陷 | 制定修复计划 |
| **D** | < 40 | 严重缺陷 | 立即修复 P0 |

## 关联

- [health-report/README.md](../health-report/README.md) — CDN 健康报告数据页
- [components-manifest/README.md](../components-manifest/README.md) — 组件清单元数据
- [changelog/README.md](../changelog/README.md) — 版本历史数据
- [SECURITY.md](../SECURITY.md) — 安全策略
- [CHANGELOG.md](../CHANGELOG.md) — 版本变更日志

## 四维评分算法

| 维度 | 权重 | 度量方法 | 数据源 |
|------|:---:|------|------|
| CSS 规范性 | 0.30 | Stylelint 规则通过率 | `.stylelintrc` |
| API 一致性 | 0.25 | Props/Events 命名规范度 | manifest.json |
| 可访问性 | 0.25 | WCAG AA 合规度 | axe-core |
| 响应式 | 0.20 | 断点覆盖 + 触控目标 | Lighthouse |

**总分**: `Σ(维度分 × 权重) / Σ权重`

## 13 细分类别（COMPONENTS.md 子节）

对应 title "10 大功能类别" 的 finer breakdown — COMPONENTS.md 的 13 个 `###` 子节：

| 类别 | 组件数 | 占比 | 平均分 |
|------|:---:|:---:|:---:|
| 布局与结构 | 9 | 8.4% | A |
| 导航 | 5 | 4.7% | A |
| 卡片与展示 | 11 | 10.3% | A |
| 场景组件 | 7 | 6.5% | A |
| 统计与健康 | 5 | 4.7% | A |
| 检查清单 | 5 | 4.7% | A |
| 风险与审查 | 4 | 3.7% | A |
| 浮动面板 | 4 | 3.7% | B |
| 交互与反馈 | 12 | 11.2% | A |
| 展示与可视化 | 10 | 9.3% | B |
| 步骤与流程 | 8 | 7.5% | A |
| 命令与操作 | 6 | 5.6% | A |
| 其他 | 21 | 19.6% | B |

## 历史评分趋势

| 日期 | 总分 | 等级 | 关键变化 |
|------|:---:|:---:|------|
| 2026-04-08 | 78 | C | 初始发布 |
| 2026-05-20 | 86 | B | theme-mono + 字体 |
| 2026-06-16 | 92 | A | 125 组件 · 完整 111 · 待补 14 |
| 2026-06-22 | 95 | A | 文档完善 |

## 组件评分分布

| 分数区间 | 组件数 | 占比 | 状态 |
|---------|:---:|:---:|------|
| ≥ 90 (A) | 89 | 83.2% | 优秀 |
| 80-89 (B) | 12 | 11.2% | 良好 |
| 70-79 (C) | 5 | 4.7% | 合格 |
| 60-69 (D) | 1 | 0.9% | 待改进 |
| < 60 (F) | 0 | 0% | 不合格 |

## 退化检测与告警

| 退化类型 | 检测信号 | 告警阈值 | 响应 |
|---------|------|:---:|------|
| 评分降级 | 当前 vs 上次 | ≥ 1 级 | 日报 |
| 维度退化 | 单维度 vs 7 天均值 | > 10% | 周报 |
| 组件退化 | 单组件 vs 历史 | > 2 级 | 即时 |
| 覆盖率退化 | 当前 vs 上次 | < 上次 5% | 日报 |
| 性能退化 | FCP vs 7 天均值 | > 20% | 周报 |
- [健康评分规则](../../skills/rui-health/rules/health-scoring.md) — 19 维加权评分引擎
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 健康检测架构
