---

doc_type: summary
title: "ADR-003 插件架构选型 — 实施总结"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prd: "46-prd-ADR-插件架构.md"

type: task
---
# ADR-003 插件架构 — 实施总结
> 来源 ADR：[46-prd-ADR-插件架构](../../prds/2026-09/46-prd-ADR-插件架构.md)
## 决策回顾
选择函数导出式三文件插件模式 (info.ts/index.jsx/Config.jsx)，支持翻译/OCR/TTS/生词本四类服务。
## 实施效果
| 指标 | 目标 | 实际 |
|------|------|------|
| 插件类型 | 4 类 | 4 类 (translate/recognize/tts/collection) |
| 已集成服务 | ≥15 翻译 + ≥8 OCR | 21 翻译 + 15 OCR + 3 TTS + 2 生词本 |
| 社区贡献 | 支持第三方插件 | 80%+ 插件由社区贡献 |
## 插件目录清单
| 类型 | 目录 | 插件数 |
|------|------|--------|
| 翻译 | `services/translate/` | 21 |
| OCR | `services/recognize/` | 15 |
| TTS | `services/tts/` | 3 |
| 生词本 | `services/collection/` | 2 |
## 交叉引用
- ADR: [46-prd-ADR-插件架构](../../prds/2026-09/46-prd-ADR-插件架构.md)
- 插件开发规范: [03-规范-插件开发](../workflows/开发规范/03-规范-插件开发.md)
- 翻译服务插件: [04-prd-task-翻译服务插件实现](./04-prd-task-翻译服务插件实现.md)

## 插件测试策略

| 测试层 | 覆盖 | 工具 |
|--------|------|------|
| info.ts 验证 | 必需字段完整性、类型正确性 | vitest snapshot |
| index.jsx 单元测试 | 翻译/OCR/TTS/生词本核心逻辑 | vitest + mock fetch |
| Config.jsx 渲染测试 | 配置表单渲染、输入交互 | @testing-library/react |
| 集成测试 | 插件注册→配置→调用全链路 | vitest + Tauri mock |

## 插件注册流程

```
Vite build 扫描 services/ 目录
  → 收集 info.ts 元信息
    → 生成插件注册表 (service_instance.ts)
      → 设置页自动生成配置表单
        → 用户启用 → 翻译时调度
```