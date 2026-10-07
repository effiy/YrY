---
title: STRIDE-YiPet威胁模型
tags:
  - perfbaseline
  - stride
  - threat
  - security
  - yipet
  - threat-model
  - risk
  - chrome-extension
category: projects/yipet/bugs/2026-09
created: 2026-10-07
updated: 2026-10-07
source: internal
type: baseline / analysis
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - sre
  - engineer
  - security
benefit: 覆盖 YiPet Chrome 扩展 content script / storage.sync / host_permissions / SW 长连接 / activeTab 五类核心 STRIDE 风险，引用 03-prd 安全合规 + 139 隐私仪表盘 + 110 质量审计三条设计闭环。
acceptance_criteria:
  - 6 行 STRIDE 矩阵均映射到 yipet 特有扩展能力，143-prd 代码片段 storage.sync 明文写回为明确 P0
  - 引用 03-prd 安全合规 / 139-prd 隐私仪表盘 / 110-prd 质量审计三条 PRD 对应 ≥ 2 条缓解
  - 缓解路线图 30/60/90 天覆盖 Chrome Web Store 合规复审清单
related:
  - ../../prds/2026-09/03-prd-图片批量处理工具.md
  - ../../prds/2026-09/139-prd-隐私仪表盘.md
  - ../../prds/2026-09/110-prd-代码质量审计报告.md
  - ../../prds/2026-09/143-prd-代码片段库.md
  - ../../prds/2026-09/08-prd-ContentScript.md
  - ../../prds/2026-09/09-prd-ServiceWorker.md
---

## 一、STRIDE 威胁矩阵（6 行 × 4 列）

| STRIDE 类别 | 威胁场景 | 影响 | 可能性 | 缓解措施 |
| --- | --- | --- | --- | --- |
| **S 仿冒 (Spoofing)** | Content Script 跨域注入 XSS：`matches: <all_urls>` + `runAt: document_start` 注入时未对 `document.cookie` 读取做隔离；恶意站点 `postMessage('*', payload)` 冒充 YiPet 前端触发 "注入代码片段" 按钮。 | 高：对用户登录态银行/GitHub/企业内网站点可伪造请求、读 cookie、窃取会话。 | 高：08-prd ContentScript 默认 `<all_urls>` 实际运行 2 个月，03-prd 安全合规未落地。 | (1) 03-prd 安全合规落地：`matches` 从 `<all_urls>` 缩减为可配置白名单（默认 0 个，用户手动勾选常用站点）；(2) `postMessage` 目标 origin 精确匹配 chrome-extension://<id>，禁止 `'*'`；(3) Content Script 启用世界隔离 `world: ISOLATED` + CSP `script-src 'self'`。 |
| **T 篡改 (Tampering)** | 143-prd 代码片段明文写回：代码片段库 `storage.sync.set({ snippets: [...] })` 明文、无签名；攻击者通过 SW 同步漏洞或跨扩展消息通道污染后，用户点击 "插入片段" → 注入恶意 JS 到编辑器 / `fetch('/api/...')` 执行。 | 高：用户开发环境直接植入后门，等同于 RCE 到用户的全部代码仓库。 | 高：143-prd 当前实现就是 JSON 明文存 sync，版本 v0.4.2 全量用户。 | (1) 143-prd 修复：`snippets` 入库前加 HMAC-SHA256(用户本地 `identity.email` + chrome.storage.local 派生 key)，读取时校验失败走 139 隐私仪表盘告警；(2) 同步链路对写入侧做 schema 校验：`snippet.language ∈ 支持列表 / code 长度 ≤ 64KB / 拒绝 `\` 反引号模板嵌套 `fetch` 模式；(3) 插入片段弹窗显式展示 "修改时间 / 来源机器 / hash" 三元组。 |
| **R 抵赖 (Repudiation)** | 代码片段同步冲突审计缺失：多设备 `storage.sync` 覆盖写入时，`lastModifiedBy` 没记录 `deviceId` + `chrome.instanceId`，误删/被改后无法追溯哪台设备操作。 | 低：现阶段用户量小，抵赖不造成严重合规问题，但企业版部署必须补。 | 中：多设备用户占比 18%，已出现 3 次误删工单。 | (1) 所有 sync 写入操作追加 `oplog` 集合（local-only，不上 sync），TTL 60 天；(2) 139 隐私仪表盘增加 "同步历史" 子页，可一键导出冲突记录；(3) 110 质量审计对接：冲突率 > 1% 触发质量告警。 |
| **I 信息泄露 (Information Disclosure)** | `host_permissions` 过宽：当前 `manifest.json` 声明 `host_permissions: ["<all_urls>"]`，实际功能只用了 12 个图片类 CDN；扩展一安装就拥有所有网站 Fetch 权限，若被 BEC 绕过可上传 `document.body.innerHTML` 任意网页正文。 | 高：等于拥有所有网页读取能力，Chrome Web Store 复审必挂。 | 高：CWS 最新政策 "最小权限" 审查已扫描到 2 次告警。 | (1) 03-prd 安全合规落地：`host_permissions` 从 `<all_urls>` 收缩到实际 12 CDN + 可选 `optional_host_permissions` 用户按需授权；(2) 139 隐私仪表盘：首页顶部显示 "当前授权站点数 N / 实际使用 N"，> 5 且 30 天未使用的自动建议回收；(3) Fetch 封装强制经过 `HostAllowlist` 中间件，超出的抛错并上报 110 审计。 |
| **D 拒绝服务 (Denial of Service)** | Service Worker 长连接死循环：09-prd SW 的 `image-cdn-proxy` 逻辑遇 302 跳转未设 `maxRedirects`，当目标站点返回循环重定向时 SW `fetch` 无限递归 → Chrome 扩展进程 CPU 100% → 浏览器整体卡 3~10s。 | 中：不丢数据但体验极差，App Store 评论已 2 条 "卡到关不掉"。 | 中：过去 30 天 crashlytics 捕获到 14 次相同调用栈。 | (1) 09-prd SW `fetch` 包装强制 `redirect: 'manual'` + 自实现最多 5 跳；(2) 死循环 watchdog：每 2s 检查 `event.waitUntil` 存活时长，> 8s 主动 `self.registration.unregister()` 并弹窗提示重装；(3) 110 质量审计：SW crash 率 > 0.3% 阻断发布。 |
| **E 提权 (Elevation of Privilege)** | `activeTab` 所有 tab：manifest 声明 `"permissions": ["activeTab","tabs","<all_urls>"]`，activeTab 本意 "用户点扩展图标时只授权当前页"，但叠加 `tabs` 权限后实际所有 tab 都可读 `tab.url + tab.title`，无需用户点击 → 等价于 "<all_urls> 读取升级到元数据"。 | 中：不能直接执行代码，但可偷用户浏览历史（敏感内网站点标题 → 定位项目）。 | 高：当前版本就是这么声明的，用户 100% 被静默授权。 | (1) 去掉 `tabs` 权限，只保留 `activeTab`，其余用 `chrome.tabs.query({active:true, currentWindow:true})` 只拿当前；(2) 139 隐私仪表盘加 "权限使用热力图"：7 天未使用的权限弹窗建议回收；(3) Chrome 企业策略：对公司部署的扩展强制 `runtime_host_permissions` 最小集。 |

## 二、风险等级总表 P0 / P1 / P2

| 风险 ID | STRIDE 类别 | 摘要 | 影响 | 可能性 | 综合等级 | 对应 PRD/bug |
| --- | --- | --- | --- | --- | --- | --- |
| YIPET-STRIDE-001 | T 篡改 | 143-prd 代码片段 storage.sync 明文无签名 | 高 | 高 | **P0** | 143-prd / 110-prd |
| YIPET-STRIDE-002 | I 信息泄露 | host_permissions `<all_urls>` CWS 复审必挂 | 高 | 高 | **P0** | 03-prd 安全合规 / CWS policy |
| YIPET-STRIDE-003 | S 仿冒 | Content Script `postMessage '*'` XSS | 高 | 高 | **P0** | 08-prd ContentScript |
| YIPET-STRIDE-004 | E 提权 | activeTab + tabs 静默全量历史可读 | 中 | 高 | **P1** | 139-prd 隐私仪表盘 |
| YIPET-STRIDE-005 | D DoS | SW 302 死循环 CPU 100% | 中 | 中 | **P1** | 09-prd ServiceWorker |
| YIPET-STRIDE-006 | R 抵赖 | sync 冲突无 `deviceId` 审计 | 低 | 中 | **P2** | 110-prd 质量审计 |

## 三、缓解路线图 30 / 60 / 90 天

| 阶段 | 交付物 | 对应风险 | 验收标准 |
| --- | --- | --- | --- |
| **30 天 (T+0 ~ T+30)** | ① 143-prd 代码片段 HMAC 入库 + schema 校验；② host_permissions 收缩至 12 CDN + optional；③ activeTab 去 `tabs` 权限 | 001, 002, 004 | ① 无签名片段 100% 拒绝加载；② CWS 自动策略扫描 0 条 `<all_urls>` 告警；③ `chrome://extensions` 权限页不再显示 "可读取浏览历史"。 |
| **60 天 (T+31 ~ T+60)** | ④ 08-prd ContentScript 隔离世界 + postMessage origin 精确匹配；⑤ 09-prd SW 302 防死循环 + watchdog；⑥ 139 隐私仪表盘权限使用热力图 | 003, 005, 004 | ④ 构造 XSS postMessage 样本 50 条 0 条命中；⑤ crashlytics SW CPU 100% 报告 0 次；⑥ 7 天未使用权限自动回收率 ≥ 60% 活跃用户。 |
| **90 天 (T+61 ~ T+90)** | ⑦ 03-prd 安全合规 + CWS 复审全项通过；⑧ sync 冲突 oplog + 110 质量审计阻断；⑨ STRIDE 扩展权限 fuzzing 进 CI | 002, 006, 全 | ⑦ CWS 复审一次性通过无驳回；⑧ 冲突工单 0 单；⑨ fuzzing 24h 未发现新的权限绕过。 |
