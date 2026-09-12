---
doc_type: test
title: "YV-09-131: 登录历史记录 — 用户登录日志、IP/位置/设备/浏览器记录、异地登录检测、登录趋势分析、导出 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-131"
source_prds: ["61-prd-登录历史记录"]
source_modules: []
---
# YV-09-131: 登录历史记录 — 用户登录日志、IP/位置/设备/浏览器记录、异地登录检测、登录趋势分析、导出 — 测试规格

> 来源 PRD：[61-prd-登录历史记录.md](../../prds/2026-09/61-prd-登录历史记录.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：记录成功登录

**GIVEN** 用户输入正确的用户名和密码
**WHEN** 登录请求成功
**THEN** `login_history` 集合中插入一条记录
**AND** 记录包含 user_id、ip_address、location、device、login_at
**AND** login_result 为 "success"

### 场景 2：检测新 IP 登录

**GIVEN** 用户过去 30 天从 IP 1.1.1.1 登录，当前从 IP 2.2.2.2 登录
**WHEN** 用户登录成功
**THEN** login_history 记录中 is_anomaly 为 true
**AND** anomaly_reasons 包含 "new_ip"
**AND** 前端显示"检测到新 IP 地址登录"告警

### 场景 3：检测新设备登录

**GIVEN** 用户过去 30 天仅在 Chrome/macOS 登录，当前使用 Safari/iOS 登录
**WHEN** 用户登录成功
**THEN** login_history 记录中 is_anomaly 为 true
**AND** anomaly_reasons 包含 "new_device"

### 场景 4：检测异地短时登录

**GIVEN** 用户 1 小时前在杭州登录，当前从北京登录
**WHEN** 用户登录成功
**THEN** anomaly_reasons 包含 "rapid_location_change"
**AND** 前端显示"检测到短时间内异地登录"告警

### 场景 5：查看登录趋势

**GIVEN** 管理员访问登录统计仪表盘
**WHEN** 页面加载完成
**THEN** 显示近 30 天登录量趋势折线图
**AND** 显示今日登录数、活跃用户数、失败率统计卡片
**AND** 显示地理位置分布图

### 场景 6：导出登录历史

**GIVEN** 用户在登录历史页面，筛选了本月的记录
**WHEN** 用户点击"导出记录"按钮
**THEN** 下载一个 CSV 文件，包含登录时间、IP、位置、设备、是否异常
**AND** CSV 文件编码为 UTF-8 with BOM（兼容 Excel）

---

