---

doc_type: module
prd_id: "PE-09-107"
title: "PE-09-107-test: 服务器状态指示器 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-107-test: 服务器状态指示器 — 测试方案

## 测试用例

### TC-01: YiAi 在线显示绿点

```
Given: YiAi 运行在 localhost:10086
When: 打开聊天窗口，StatsBar 挂载
Then: checkServer() 成功，serverOnline = true
      显示绿色发光圆点
      tooltip: "YiAi up · Nh uptime"
```

### TC-02: YiAi 离线显示红点

```
Given: YiAi 未运行
When: 打开聊天窗口
Then: checkServer() 失败，serverOnline = false
      显示红色圆点（无发光）
      tooltip: "YiAi unreachable"
```

### TC-03: 检测失败不影响功能

```
Given: YiAi 不可达
When: StatsBar 渲染
Then: 统计卡片正常显示
      仅状态圆点为红色
      刷新按钮仍可用（使用本地数据）
```

## 测试环境

- Chrome 加载 YiPet 扩展
- YiAi 运行/停止切换测试