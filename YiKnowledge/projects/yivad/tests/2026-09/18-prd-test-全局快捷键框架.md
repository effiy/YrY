---
doc_type: test
title: "全局快捷键框架 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-43"
source_prds: ["18-prd-全局快捷键框架"]
source_modules: []
---
# 全局快捷键框架 — 测试规格

> 来源 PRD：[18-prd-全局快捷键框架.md](../../prds/2026-09/18-prd-全局快捷键框架.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### Scenario 1: 全局快捷键触发
- **GIVEN** 用户在项目列表页面，未打开任何模态框
- **WHEN** 用户按下 Ctrl+K
- **THEN** 命令面板打开，搜索框自动聚焦

### Scenario 2: 模态框内快捷键禁用
- **GIVEN** 删除确认对话框已打开
- **WHEN** 用户按下 Ctrl+S（保存快捷键）
- **THEN** 保存快捷键不触发，仅对话框内的 Escape 键可关闭对话框

### Scenario 3: 序列快捷键
- **GIVEN** 用户在任意页面
- **WHEN** 用户依次按下 G 键，然后 1 秒内按下 I 键
- **THEN** 页面导航到 Issues 页面；序列超时（超过 1 秒）则序列重置

### Scenario 4: 快捷键覆盖层
- **GIVEN** 用户在任意页面
- **WHEN** 用户按下 ? 键
- **THEN** 半透明遮罩显示，分组列出所有已注册的快捷键；搜索框可过滤快捷键；再次按 ? 或 Esc 关闭

### Scenario 5: 快捷键自定义
- **GIVEN** 用户在快捷键设置页面
- **WHEN** 用户点击"保存"快捷键，按下 Ctrl+Shift+S
- **THEN** "保存"快捷键更新为 Ctrl+Shift+S；如果 Ctrl+Shift+S 已被其他快捷键占用，显示冲突警告

### Scenario 6: 输入框内快捷键不干扰
- **GIVEN** 用户在文本输入框中编辑文本
- **WHEN** 用户按下 Ctrl+S
- **THEN** 若当前输入框注册了 `input` 作用域的 Ctrl+S，则触发输入框的保存逻辑；否则触发全局保存逻辑（取决于作用域优先级）

---


## 补充：单元测试用例

### UT-HK01: useKeyboardShortcuts

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 注册快捷键 | `register('ctrl+s', saveHandler)` | 按键触发 handler |
| 2 | 冲突检测 | 注册已存在的快捷键 | 控制台警告或后者覆盖 |
| 3 | 作用域隔离 | 弹窗内注册的快捷键 | 弹窗外不触发 |
| 4 | 注销 | 组件卸载 | 快捷键不再触发 |
| 5 | 输入框豁免 | 焦点在 input/textarea | 快捷键不触发 |
| 6 | 动态注册 | 条件变化时注册/注销 | 响应式更新快捷键绑定 |

