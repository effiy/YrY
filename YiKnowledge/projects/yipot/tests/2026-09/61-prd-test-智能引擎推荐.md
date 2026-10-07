---

doc_type: module
prd_id: "PO-09-61"
title: "PO-09-61-test: 智能引擎推荐 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-61-test: 智能引擎推荐 — 测试方案

## 测试范围

| 测试项 | 类型 | 验证内容 |
|--------|------|----------|
| RPC 连通性 | 集成 | `getProviderRecommend` 可调用并返回排名 |
| 健康状态点 | UI | 下拉菜单中绿/黄/红/灰状态点正确显示 |
| Best 徽章 | UI | 推荐引擎显示 "Best" + 成功率 |
| 快速切换 | UI | 点击头部标签切换引擎 |
| 降级处理 | 容错 | YiAi 不可达时无状态点，功能正常 |
| 空数据 | 容错 | 无翻译记录时返回空排名 |

## 测试用例

### TC-01: RPC 返回推荐排名

```
Given: YiAi 运行，translation_records 有数据
When: 调用 getProviderRecommend('en', 'zh')
Then: 返回 {recommended, providers: [...], healthy_count, degraded_count, down_count}
      providers 按 status tier + success_rate 降序排列
```

### TC-02: 健康状态点渲染

```
Given: 推荐数据中 google 状态 healthy, baidu 状态 degraded, deepl 状态 down
When: 渲染引擎下拉菜单
Then: google 旁显示绿点，baidu 黄点，deepl 红点，插件显示灰点
```

### TC-03: Best 徽章和成功率

```
Given: google 为推荐引擎，成功率 0.98
When: 渲染下拉菜单
Then: google 行显示 "Best" 绿色徽章 + "98%" 成功率文本
```

### TC-04: 快速切换标签

```
Given: 推荐 google，当前使用 openai
When: 点击头部 "Best: google (98%)" 标签
Then: 当前引擎切换为 google
```

### TC-05: 语言切换触发重新推荐

```
Given: en→zh 显示 google 为最佳
When: 切换为 ja→en
Then: useEffect 触发，重新调用 getProviderRecommend('ja','en')
      下拉菜单更新健康数据和推荐引擎
```

### TC-06: YiAi 不可达降级

```
Given: YiAi 不可达（连接拒绝）
When: useEffect 触发推荐请求
Then: catch 设置 providerRec = null
      下拉菜单显示灰点（无健康数据）
      翻译功能正常
```

## 测试环境

- YiAi 运行在 localhost:10086
- MongoDB 有 translation_records 数据
- YiPot 开发模式（`pnpm tauri dev`）