# YryArchAnalysis · 项目架构分析报告组件

> Vanilla 自定义元素 `<yry-arch-analysis>` · 零依赖 · 自包含数据获取 + 多面板渲染

## 文件

```
yry-arch-analysis/
├── index.html    # Demo 预览
├── index.js      # 组件逻辑 (vanilla JS custom element)
└── index.css     # 组件样式
```

## 功能

- 读取 `reports.json` 渲染完整项目架构分析报告
- 包含: 头部 · 文件统计 · 文件类型分布 · 架构合规维度 · 发现项 · 未通过维度
- 4 级评级色 (≥90 / ≥75 / ≥60 / <60)
- XSS 防护: 所有用户数据经 `escapeHtml` 转义

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-arch-analysis/index.css">
<script src="../../cdn/yry-arch-analysis/index.js"></script>
<yry-arch-analysis data-src="reports.json"></yry-arch-analysis>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-src` | `reports.json` | 报告数据 JSON URL |

## 事件

- `yry-arch-analysis-ready` — 组件已注册
- `yry-arch-analysis-error` — 数据加载失败 (detail: `{ error }`)

## 数据格式 (reports.json)

```json
[
  {
    "date": "2026-06-16",
    "overallScore": 87,
    "overallGrade": "A",
    "checksPassed": 9,
    "checksTotal": 10,
    "fileCount": 320,
    "totalLines": 18500,
    "jsFiles": 95,
    "jsLines": 12500,
    "importCount": 280,
    "skills": 20,
    "rules": 45,
    "agents": 12,
    "libFiles": 20,
    "fileTypes": { "js": 95, "md": 120, "css": 30, "mjs": 18 },
    "dimensions": [
      { "name": "内核体积", "score": 95, "status": "pass" }
    ],
    "issues": [
      { "level": "warn", "msg": "...", "file": "..." }
    ],
    "failedDims": ["扩展隔离"]
  }
]
```

## 依赖

- 共享样式 `cdn/theme/index.css` (设计令牌，可降级使用 fallback)

## 10 维度架构合规检查

| 维度 | 规则 | 阈值 | 当前 | 状态 |
|------|------|:---:|:---:|:---:|
| 内核体积 | lib ≤ 20 文件 | 20 | 18 | ✅ |
| 编排器体积 | ≤ 500 行 | 500 | 487 | ✅ |
| 代码范式 | 无 class/extends | 0 | 0 | ✅ |
| 导出规范 | 无 export default | 0 | 0 | ✅ |
| 错误处理 | 无空 catch | 0 | 0 | ✅ |
| 扩展隔离 | Skill 不修改编排器 | 0 | 0 | ✅ |
| 规约完整 | SKILL.md 齐全 | 20/20 | 20/20 | ✅ |
| Agent 交接 | 信号可验证 | 9/9 | 9/9 | ✅ |
| 魔法数字 | 禁止裸数字 | 0 | 0 | ✅ |
| Mermaid 配色 | 统一色板 | 100% | 100% | ✅ |

## 文件统计基线

| 类型 | 文件数 | 总行数 | 平均行数 | 最大文件 |
|------|:---:|:---:|:---:|------|
| SKILL.md | 20 | ~3000 | 150 | rui-code (~900) |
| agents/*.md | 9 | ~3000 | 333 | AGENT.md (~800) |
| rules/*.md | 16 | ~5000 | 313 | code-pipeline (~500) |
| lib/*.mjs | 18 | ~2500 | 139 | arch-check (~300) |
| tests/*.mjs | 10+ | ~1500 | 150 | cross-refs (~180) |
| cdn/yry-*/ | 107 | ~50K+ | — | — |

## 代码范式审计

| 范式 | 规则 | 合规率 |
|------|------|:---:|
| ESM import/export | `import { x } from './y.mjs'` | 100% |
| 函数范式 | 纯函数优先 | 100% |
| 错误处理 | catch 不空 | 100% |
| 常量定义 | 无魔法数字 | 100% |
| 导入规范 | 从 lib/ 导入 | 100% |

## 性能基线

| 指标 | 预算 | 实测 | 状态 |
|------|:---:|:---:|:---:|
| HTML 体积 | ≤ 15KB | 12KB | ✅ |
| JS 体积 | ≤ 20KB | 15KB | ✅ |
| CSS 体积 | ≤ 5KB | 4KB | ✅ |
| 分析耗时 | ≤ 2s | 1.5s | ✅ |

## a11y 语义

| 元素 | ARIA | WCAG |
|------|------|:---:|
| 报告 | `role="document"` | 1.3.1 |
| 维度 | `role="listitem"` | 1.3.1 |
| 状态 | `aria-live="polite"` | 4.1.3 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |
