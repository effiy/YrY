# rui-bundle-analyze Agent 角色

> rui-bundle-analyze 是独立工具技能 (lifecycle: standalone)，无 agent 角色定义。通过 `analyze.mjs` 可执行入口直接调用。

## 技能定位

项目体积与依赖结构分析。类 webpack-bundle-analyzer 风格，生成自包含 HTML 交互报告。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-yry (自改进) | D2 文件膨胀诊断 | 读取分析报告 |
| rui-analysis | 补充依赖分析维度 | 互补分析 |
| 手动调用 | 独立分析 | `/rui-bundle-analyze` |

## 可执行入口

- `node skills/rui-bundle-analyze/analyze.mjs [options]` — 运行分析
- `node skills/rui-bundle-analyze/help.mjs` — 显示帮助