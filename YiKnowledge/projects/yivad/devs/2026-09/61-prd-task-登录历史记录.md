---
doc_type: module
prd_task_id: "YV-09-131"
title: "YV-09-131: 登录历史记录 — 用户登录日志、IP/位置/设备/浏览器记录、异地登录检测、登录趋势分析、导出 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "61-prd-登录历史记录.md"
---

# YV-09-131: 登录历史记录 — 用户登录日志、IP/位置/设备/浏览器记录、异地登录检测、登录趋势分析、导出 — 开发任务

> 来源 PRD：[61-prd-登录历史记录.md](../prds/2026-09/61-prd-登录历史记录.md)
> 需求编号：YV-09-131 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 GeoIPService（GeoLite2 集成） | `YiAi/services/auth/geoip_service.py` | IP → 地理位置解析正常 | 0.04 |
| 2 | 实现 LoginHistoryService（记录 + 查询） | `YiAi/services/auth/login_history_service.py` | 登录记录写入/查询 | 0.04 |
| 3 | 实现 LoginAnomalyDetector（异常检测） | `YiAi/services/auth/login_anomaly_detector.py` | 新IP/新设备/异地检测 | 0.04 |
| 4 | 集成到登录接口 | `YiAi/services/auth/login_handler.py` | 登录时触发记录 + 检测 | 0.02 |
| 5 | 实现 YiVad 登录历史页面 | `YiVad/src/views/user/login-history.vue` | 列表 + 筛选 + 导出 | 0.06 |
| 6 | 实现管理端登录仪表盘 | `YiVad/src/views/system/login-dashboard.vue` | 趋势图 + 地图 + 统计 | 0.06 |
| 7 | 路由注册 + 集成测试 | 路由文件 + 测试文件 | 功能端到端验证 | 0.04 |

**总人天：0.3d**

---
