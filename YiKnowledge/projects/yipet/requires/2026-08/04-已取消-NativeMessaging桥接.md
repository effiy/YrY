---
title: 原生消息主机桥接 (已取消)
tags: [改进, 原生消息, 已取消]
category: 问题/改进
created: 2026-08-22
updated: 2026-08-22
source: 内部
type: 问题
status: 已取消
priority: 低
问题type: 改进
project: YiPet
project_id: yipet
owner: 陈铭
estimate_points: 3
评审status: 已通过
prd_month: 202608
prd_task_id: 6
roles: [engineer]
---

# Native Messaging 主机桥接 (已取消)

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 6 |
| 项目 | YiPet (Chrome MV3 Extension) |
| 代码仓库 | `YrY/YiPet` |
| 功能模块 | 通信层 |
| 优先级 | 低 |
| 人天 | 3.0d |
| 状态 | 已取消 |

### 原始需求

通过 Chrome Native Messaging 协议桥接扩展与本地原生辅助程序，实现更强大的本地能力调用（如文件系统访问、本地进程管理）。

### 取消原因

经评估，当前 Content Script fetch 路径已足够满足需求：

1. **Content Script fetch 已验证**：扩展通过 ISOLATED world 的 fetch 直接调用 YiAi API，无需中间层
2. **复杂度不成比例**：Native Messaging 需要额外的原生宿主程序开发、安装、更新机制
3. **跨平台兼容**：Native Messaging 在不同操作系统上需要不同的宿主程序实现
4. **安全考量**：Native Messaging 引入了额外的权限面和攻击面
5. **部署成本**：用户需要额外安装原生程序，增加使用门槛

### 决策结论

- 暂不实现 Native Messaging 桥接
- 保留 Content Script fetch 直连方案
- 四层 API 架构（client → endpoints → types → services）已满足当前需求
- 未来如有本地文件系统等强需求，可重新评估

### 替代方案

| 场景 | 当前方案 |
|------|----------|
| HTTP API 调用 | Content Script fetch → YiAi |
| 数据持久化 | `chrome.storage.local` / `chrome.storage.sync` |
| 文件下载 | Chrome Downloads API |
| 本地存储 | IndexedDB（MV3 Service Worker 支持） |

---

*source: `projects/yipet/requires/2026-08/native-messaging-host-bridge-cancelled.md`*