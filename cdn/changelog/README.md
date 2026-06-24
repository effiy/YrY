# YrY CDN · Changelog 版本历史

> 版本发布历史数据快照（SemVer + 迁移说明 + 变更亮点），与 [CHANGELOG.md](../CHANGELOG.md) 同源。
> `index.json` 是机器可读的真相源，`index.html` 为人类可读的时间线视图。

## 文件

```
changelog/
├── index.html    # 版本历史页面（时间线展示 · MAJOR/MINOR/PATCH 三级分类徽章）
├── index.json    # 版本数据（机器可读，单一真相源）
└── README.md     # 本文档
```

## 数据格式

```json
{
  "releases": [
    {
      "version": "1.2.0",
      "date": "2026-06-16",
      "type": "MINOR",
      "icon": "📦",
      "title": "yry-cdn v1.2.0 — 组件库扩张 + 迁移工具完善",
      "summary": "新增 5 个组件 (stats-grid / panel-hub / doc-layer / story-card / scene-card), 2 个 YrY.* API, 迁移 6 步清单上线。",
      "highlights": [
        "📊 yry-stats-grid — 统计卡组, 支持 KPI 总览",
        "🎛 yry-panel-hub — 浮动面板工具栏",
        "📑 yry-doc-layer — 文档分层容器",
        "📖 yry-story-card / yry-scene-card — 故事/场景卡片",
        "🔧 YrY.copyCmd / YrY.exportPng — 新增 2 个 JS 工具 API"
      ],
      "migration": {
        "from": "1.1.0",
        "breaking": false,
        "steps": ["npm install yry-cdn@1.2.0", "无需代码改动"]
      },
      "filesChanged": ["package.json", "cdn/index.html", "components-manifest/index.json"]
    }
  ]
}
```

## 每个发布版本的元数据

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 语义化版本号（如 `1.2.0`） |
| `date` | string | 发布日期（ISO 8601，如 `2026-06-16`） |
| `type` | enum | `MAJOR` · `MINOR` · `PATCH`（三级分类） |
| `icon` | string | 版本类型图标 emoji（📦 MINOR · 🐛 PATCH · 💥 MAJOR） |
| `title` | string | 版本标题（含核心变更摘要） |
| `summary` | string | 一句话概述本次发布核心内容 |
| `highlights` | string[] | 变更亮点列表（每项一个新特性或重要修复） |
| `migration` | object | 迁移信息：`from`（源版本）· `breaking`（是否破坏性）· `steps`（迁移步骤） |
| `filesChanged` | string[] | 本次发布变更的文件清单 |

## MAJOR/MINOR/PATCH 三级分类

对应 [SemVer](https://semver.org/) 规范，`index.html` 页面以徽章色区分：

| 类型 | 徽章色 | 含义 | 迁移难度 |
|------|--------|------|---------|
| `MAJOR` | 红 | 破坏性变更，需代码改动 | 高 |
| `MINOR` | 琥珀 | 新增功能，向后兼容 | 低 |
| `PATCH` | 绿 | Bug 修复，无 API 变更 | 零 |

## 当前版本演进

| 版本 | 日期 | 类型 | 破坏性 | 核心变更 |
|------|------|------|--------|---------|
| 1.0.0 | 2026-04-08 | MAJOR | — | 首次发布：78 组件 · 评分 C |
| 1.1.0 | 2026-05-20 | MINOR | 无 | 新增 theme-mono + 字体 · 评分 B |
| 1.2.0 | 2026-06-16 | MINOR | 无 | 新增 5 组件 + 2 API · 评分 A |

## 消费方

| 消费方 | 用途 |
|--------|------|
| CDN 首页 `cdn/index.html` | 版本徽章 · 历史时间线展示 |
| `cdn-summary/index.html` | 版本演进对比卡片 |
| 自动化健康检查 `rui-bot` | `--notify` 版本变更检测 · 企微推送 |
| CI/CD 管线 | 版本一致性验证（`npm run validate:version`） |
| 迁移指南 | `migration` 字段驱动 `CHANGELOG.md` 迁移速查表 |

## 维护

**由 `scripts/sync-version.mjs` 自动维护**：

- 新增版本时，在 `index.json` 的 `releases` 数组头部插入新条目
- `sync-version.mjs` 会将 `package.json` 版本号同步到所有引用点
- `CHANGELOG.md` 的 `## 版本迁移速查` 表由 `migration` 字段生成
- 手动编辑后必跑 `npm run sync:version` 确保三方一致（package.json · index.json · CHANGELOG.md）

## 版本发布管线

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b', 'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1', 'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b', 'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    DEV["开发分支<br/>feat/x"] --> MERGE["合并 main"]
    MERGE --> BUMP["版本号 bump<br/>sync-version"]
    BUMP --> CHANGELOG["更新 CHANGELOG"]
    CHANGELOG --> TAG["git tag vX.Y.Z"]
    TAG --> PUBLISH["npm publish"]
    PUBLISH --> JSDELIVR["jsDelivr 同步<br/>≤ 5min"]
    JSDELIVR --> VERIFY["发布后验证"]
    VERIFY --> NOTIFY["通知渠道"]
```

## 版本类型决策树

```
本次变更包含破坏性 API 变更？
├── 是 → MAJOR (x+1.0.0) · 红色 · 72h 后转 latest
└── 否 → 本次包含新组件/新 API/新主题？
        ├── 是 → MINOR (x.y+1.0) · 琥珀色 · 即时 latest
        └── 否 → PATCH (x.y.z+1) · 绿色 · 即时 latest
```

## 版本演进详细统计

| 版本 | 组件数 | 新增 | 破坏 | 评分 | 体积 | 下载量 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| 1.0.0 | 78 | 78 | — | 78/C | 2.5MB | 120 |
| 1.1.0 | 86 | 8 | 0 | 86/B | 2.8MB | 480 |
| 1.2.0 | 107 | 21 | 0 | 92/A | 3.2MB | 1240 |
| 1.3.0 | 107 | 0 | 0 | 95/A | 3.4MB | — |

## 迁移影响评估

| 迁移路径 | 影响范围 | 破坏性变更 | 迁移成本 | 自动化支持 |
|---------|:---:|------|:---:|------|
| 1.0 → 1.1 | 低 | 0 | 5min | ✅ |
| 1.1 → 1.2 | 极低 | 0 | 2min | ✅ |
| 1.2 → 1.3 | 无 | 0 | 0min | ✅ |
| 1.x → 2.x | 高 | ≥ 1 | 高 | 需迁移工具 |

## 自动化校验

| 校验项 | 命令 | 阻断 | 频率 |
|--------|------|:---:|:---:|
| 版本号一致 | `npm run validate:version` | ✅ | 每次提交 |
| CHANGELOG 更新 | `grep "^## \[" CHANGELOG.md` | ⚠️ | 发布前 |
| SemVer 合规 | `node -e "semver.valid(v)"` | ✅ | 发布前 |
| git tag 存在 | `git tag -l "v$ver"` | ✅ | 发布前 |
| npm 可发布 | `npm publish --dry-run` | ✅ | 发布前 |

## 相关文档

- [CHANGELOG.md](../CHANGELOG.md) — 人类可读的版本变更日志（与本数据同源）
- [scripts/README.md](../scripts/README.md) — `sync-version.mjs` 工具链说明
- [CONTRIBUTING.md](../CONTRIBUTING.md) — 版本发布流程与 Conventional Commits
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 自托管一致性底线
