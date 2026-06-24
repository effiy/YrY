# YrY CDN · Health Report 健康报告数据

> CDN 资源库专属健康数据快照 — `_meta.dimensions` 定义 D0-D8 九级诊断维度，`reports[].dims` 含 20 维实际评分（9 核心 + 7 工程 + 4 附加）。
> 与项目级 `docs/健康报告/` 隔离，仅评估 CDN 自身的文件完整性、组件覆盖、加载链、版本同步等。

## 文件

```
health-report/
├── index.html    # 健康报告可视化页面（D0-D8 维度详情 · 评级规则 · 健康趋势 · 原始数据）
├── index.json    # 健康数据快照（机器可读，rui-bot 自动维护）
└── README.md     # 本文件
```

## 数据格式 (index.json)

```json
{
  "_meta": {
    "scope": "cdn/",
    "description": "YrY CDN 资源库专属健康报告",
    "dimensions": [
      { "id": "D0", "name": "组件完整性", "desc": "yry-* 目录同时具备 index.{html,css,js} 三件套的比例" },
      { "id": "D1", "name": "核心文件",   "desc": "shared.css / theme.css / fonts.css / shared.js 4 基线文件" },
      { "id": "D2", "name": "字体资源",   "desc": "fonts/ 目录 4 字重 woff2 全部就位" },
      { "id": "D3", "name": "发布元数据", "desc": "package.json + README.md + .npmignore + changelog" },
      { "id": "D4", "name": "主题覆盖",   "desc": "System 主题 + Mono 主题双主题均可用" },
      { "id": "D5", "name": "演示覆盖",   "desc": "yry-* 组件含 index.html 演示页的比例" },
      { "id": "D6", "name": "加载链",     "desc": "5 步加载顺序各步成功率" },
      { "id": "D7", "name": "jsDelivr 同步", "desc": "package.json 版本与 jsDelivr CDN 可达性" }
    ]
  },
  "reports": [
    {
      "date": "2026-06-22",
      "time": "2026-06-22 09:31:26",
      "type": "project",
      "score": 95,
      "grade": "A",
      "triggers": 1,
      "dimTotal": 20,
      "dims": {
        "token":       { "score": 100, "detail": "已配置 (8 字符)" },
        "config":      { "score": 100, "detail": "1 机器人, 0/4 通知开关已启用" },
        "robots":      { "score": 100, "detail": "1/1 webhook 就绪" },
        "api":         { "score": 100, "detail": "可达 (HTTP 400)" },
        "reports":     { "score": 100, "detail": "18 份报告, 14 份近 7 天" },
        "format":      { "score": 100, "detail": "SKILL.md 格式约束全部满足" },
        "diagnostics": { "score": 85,  "detail": "0 条记录, 1/8 诊断触发" },
        "git":         { "score": 40,  "detail": "main · 74 个未提交文件" },
        "security":    { "score": 100, "detail": "..." },
        "...":         "... 其余 11 维（em_testing · em_types · em_linting · em_cicd · em_docs · em_deps · em_git · file_size · dep_analysis · notify · comp_qual）"
      }
    }
  ]
}
```

## 两层维度模型

### D0-D8 九级诊断（_meta.dimensions · CDN 专属）

| 级别 | 维度 | 检查内容 | 数据源 | 阈值 |
|------|------|---------|--------|------|
| **D0** | 组件完整性 | `yry-*` 目录同时具备 `index.{html,css,js}` 三件套的比例 | 文件系统扫描 | ≥ 95% |
| **D1** | 核心文件 | `shared.css` / `theme.css` / `fonts.css` / `shared.js` 4 基线文件 | 文件系统检查 | 4/4 存在 |
| **D2** | 字体资源 | `fonts/` 目录 4 字重 woff2（JetBrains Mono 400/500/600/700） | 文件系统检查 | 4/4 存在 |
| **D3** | 发布元数据 | `package.json` + `README.md` + `.npmignore` + `changelog/index.json` | 文件系统检查 | 4/4 完整 |
| **D4** | 主题覆盖 | System 主题 + Mono 主题双主题均可用 | CSS 解析 | 双主题可用 |
| **D5** | 演示覆盖 | `yry-*` 组件含 `index.html` 演示页的比例 | 文件系统扫描 | ≥ 85% |
| **D6** | 加载链 | 5 步加载顺序：shared → theme → 组件CSS → Vue3 → 组件JS | 客户端埋点 | 各步 ≥ 99% |
| **D7** | jsDelivr 同步 | `package.json` 版本与 jsDelivr CDN 可达性 | HTTP 探测 | 可达 + 一致 |

### reports[].dims 20 维实际评分

`reports[].dims` 对象包含 20 个维度的实际评分（`dimTotal: 20`），分三组：

| 组 | 数量 | 维度 |
|----|------|------|
| **核心 (9)** | 9 | `token` · `config` · `robots` · `api` · `reports` · `format` · `diagnostics` · `git` · `security` |
| **工程 (7)** | 7 | `em_testing` · `em_types` · `em_linting` · `em_cicd` · `em_docs` · `em_deps` · `em_git` |
| **附加 (4)** | 4 | `file_size` · `dep_analysis` · `notify` · `comp_qual` |

每维字段：`{ score: number, detail: string }`

## 评级规则

| 等级 | 分数 | 含义 | 行动 |
|------|------|------|------|
| **A** | ≥ 95 | 系统健康 — 所有维度通过 | 维持现状 |
| **B** | 85-94 | 需关注 — 1-2 维度告警 | 排查退化维度 |
| **C** | 70-84 | 需修复 — 3+ 维度告警或 1 维度失败 | 制定修复计划 |
| **D** | < 70 | 严重缺陷 — 多个维度失败 | 立即修复 P0 |

## 历史趋势

当前 `reports` 数组含 6 次快照（最新置顶）：

| 日期 | 分数 | 等级 |
|------|------|------|
| 2026-06-22 | 95 | A |
| 2026-06-19 | 82 | B |
| 2026-06-18 | 92 | A |
| 2026-06-16 | 97 | A |
| 2026-05-20 | 94 | A |
| 2026-04-08 | 88 | B |

版本演进：v1.0.0 (78/C) → v1.1.0 (86/B) → v1.2.0 (92/A) 持续上升。

## 更新方式

```bash
# 手动触发健康检查并生成 HTML 报告
node skills/rui-bot/send.mjs health --html

# 仅更新数据（不生成 HTML）
node skills/rui-bot/send.mjs health

# 带企微通知
node skills/rui-bot/send.mjs health --notify

# 查看单行摘要
node skills/rui-bot/send.mjs health --short

# 查看 diff 变化摘要
node skills/rui-bot/send.mjs health --diff

# 智能告警
node skills/rui-bot/send.mjs health --alert
```

每次检查自动追加到 `.memory/health-trend.jsonl`（趋势持久化）。

## 消费方

| 消费方 | 路径 | 用途 |
|--------|------|------|
| **CDN 首页** | `cdn/index.html` | 健康概览区 · 综合评分展示 |
| **企微通知** | `rui-bot health --notify` | 健康摘要推送（Rich/Verbose 格式） |
| **健康趋势** | `.memory/health-trend.jsonl` | 趋势持久化 · 历史对比 |
| **自改进面板** | `docs/自我改进/` | D0-D8 诊断详情 · 改进建议 |
| **项目健康报告** | `docs/健康报告/` | 项目级健康仪表板（与本项目隔离） |
| **HTML 仪表板** | `docs/健康报告/health-cdn-*.html` | 历史报告归档 |

## 关联

- [cdn-summary/README.md](../cdn-summary/README.md) — CDN 组件四维评分数据
- [components-manifest/README.md](../components-manifest/README.md) — 组件清单元数据
- [scripts/README.md](../scripts/README.md) — `validate.mjs` D0-D8 校验实现

## 健康检查触发矩阵

| 触发 | 命令 | 阻断 | 耗时 | 报告渠道 |
|------|------|:---:|:---:|------|
| 手动 | `rui-bot health` | — | ≤ 3s | 控制台 |
| 手动 + HTML | `rui-bot health --html` | — | ≤ 5s | 浏览器 |
| 手动 + 企微 | `rui-bot health --notify` | — | ≤ 10s | 企微 |
| CI build | PR | ✅ | ≤ 5s | GitHub |
| 定时 | Cron 每日 | ⚠️ | ≤ 5s | 企微 + 邮件 |
| 告警 | `--alert` | ⚠️ | ≤ 5s | 企微 (仅异常时) |
| Diff | `--diff` | — | ≤ 5s | 控制台 |
| 单行 | `--short` | — | ≤ 3s | 控制台 |

## 9 维度健康评分算法

| 维度 | 权重 | 度量 | 数据源 | 阈值 |
|------|:---:|------|------|:---:|
| D0 组件完整性 | 0.15 | 完整组件数/总组件数 | manifest.json | ≥ 0.90 |
| D1 核心文件 | 0.15 | 核心文件存在率 | 文件系统 | 1.00 |
| D2 字体资源 | 0.10 | 4 字重 woff2 存在 | fonts/ | 1.00 |
| D3 发布元数据 | 0.10 | package.json 等完整 | 文件系统 | 1.00 |
| D4 主题覆盖 | 0.10 | 双主题完整 | theme/*.css | 1.00 |
| D5 演示覆盖 | 0.10 | 含 index.html 演示 | manifest | ≥ 0.90 |
| D6 加载链 | 0.10 | 5 步加载顺序 | 文档审查 | 1.00 |
| D7 版本同步 | 0.10 | 三方版本一致 | sync-version | 1.00 |
| D8 架构合规 | 0.10 | A 级评分 | arch-check.mjs | ≥ 0.90 |

**总分公式**: `Σ(维度得分 × 权重) / Σ权重`

## 健康评分等级

| 等级 | 分数 | 颜色 | 状态 | 行动 |
|:---:|:---:|:---:|------|------|
| A | ≥ 0.90 | 绿 | 优秀 | 保持 |
| B | 0.80-0.89 | 蓝 | 良好 | 关注 |
| C | 0.70-0.79 | 黄 | 合格 | 改进 |
| D | 0.60-0.69 | 橙 | 待改进 | 修复 |
| F | < 0.60 | 红 | 不合格 | 立即修复 |

## 趋势分析指标

| 指标 | 公式 | 用途 |
|------|------|------|
| 当前评分 | 最近一次检查 | 实时状态 |
| 7 天均值 | 过去 7 天评分平均 | 短期趋势 |
| 30 天均值 | 过去 30 天评分平均 | 长期趋势 |
| 趋势方向 | 今日 - 7 天均值 | 上升/下降 |
| 波动率 | 30 天标准差 | 稳定性 |
| 历史最低 | 30 天最低值 | 退化记录 |
| 历史最高 | 30 天最高值 | 基线参考 |

## 告警阈值

| 告警级别 | 触发条件 | 通知方式 | 响应时效 |
|---------|---------|------|:---:|
| 红色 | 评分 < 0.7 或 D8 阻断 | 企微 + 邮件 | 1h |
| 橙色 | 评分降级 ≥ 2 级 | 企微 | 4h |
| 黄色 | 单维度 < 0.7 | 日报 | 1d |
| 蓝色 | 趋势连续 3 天下降 | 日报 | 3d |

## 报告归档策略

| 类型 | 保留期 | 清理 | 命名 |
|------|:---:|------|------|
| HTML 历史 | 90 天 | 自动 | `health-cdn-YYYY-MM-DD.html` |
| JSONL 趋势 | 1 年 | 滚动 | `.memory/health-trend.jsonl` |
| 控制台输出 | 当前 | — | — |
| 企微通知 | 永久 | — | — |
- [SECURITY.md](../SECURITY.md) — 安全策略
- [CHANGELOG.md](../CHANGELOG.md) — 版本变更日志
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 健康检测架构
- [健康评分规则](../../skills/rui-health/rules/health-scoring.md) — 19 维加权评分引擎
