---
doc_type: test
title: "实时协作光标与状态 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-46"
source_prds: ["21-prd-实时协作光标与状态"]
source_modules: []
---
# 实时协作光标与状态 — 测试规格

> 来源 PRD：[21-prd-实时协作光标与状态.md](../../prds/2026-09/21-prd-实时协作光标与状态.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：PresenceIndicator

#### Scenario: 显示在线状态
- **GIVEN** 用户状态为 `editing`，另有 2 人在线
- **WHEN** 挂载 PresenceIndicator 组件
- **THEN** 渲染橙色圆点、"编辑中"标签、"2 人在线"计数

#### Scenario: 显示锁定信息
- **GIVEN** `lockOwner` 为 "张三"
- **WHEN** 挂载 PresenceIndicator 组件
- **THEN** 渲染锁图标和"张三 正在编辑"文本

### 组件测试：RemoteCursor

#### Scenario: 渲染远程光标
- **GIVEN** 2 个远程用户，均有光标位置
- **WHEN** 挂载 RemoteCursor 组件
- **THEN** 渲染 2 个光标箭头和用户名徽章，颜色与用户分配颜色一致

#### Scenario: 隐私模式隐藏光标
- **GIVEN** 1 个远程用户 `privacyLevel` 为 `hidden`
- **WHEN** 挂载 RemoteCursor 组件
- **THEN** 该用户的光标不渲染

### Composable 测试：useCursorTracking

#### Scenario: 光标位置节流上报
- **GIVEN** 鼠标快速移动，触发多次 `mousemove` 事件
- **WHEN** 500ms 内触发 10 次 `mousemove`
- **THEN** WebSocket 仅发送 1 次光标更新消息

#### Scenario: 输入框聚焦上报字段名
- **GIVEN** 聚焦 `data-field="title"` 的输入框
- **WHEN** 触发 `focusin` 事件
- **THEN** 光标位置 `field` 更新为 `"title"`

---

