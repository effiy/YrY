# rui-html Agent 角色

> rui-html 是管线工具技能，无 agent 角色定义。通过 `rui-html.mjs` 可执行入口直接调用。

## 技能定位

故事场景 HTML 文档生成器。读取 markdown 文档，按模板生成 7 类标准 HTML 文件。

## 铁律

**单源生**: 7 类 HTML 的唯一数据源是对应场景的 `index.md`。HTML 不可独立创作。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-doc (文档) | 文档生成后 | 自动生成 HTML |
| rui-code (实现) | 实现完成后 | 更新 HTML 报告 |
| 手动调用 | 独立生成 | `/rui-html <story>` |

## 可执行入口

- `node skills/rui-html/rui-html.mjs [options]` — 生成 HTML
- `node skills/rui-html/help.mjs` — 显示帮助