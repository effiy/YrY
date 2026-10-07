---
title: STRIDE-YiPot威胁模型
tags:
  - perfbaseline
  - stride
  - threat
  - security
  - yipot
  - threat-model
  - risk
  - tauri
category: projects/yipot/bugs
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
benefit: 覆盖 YiPot tray/剪贴板/HTTP 60828/SQLite/API Key/Accessibility 六类 STRIDE 风险，对应三个安全隐私 + 性能问题 + 平台兼容 bug 分类，消除本地桌面应用默认开放端口与明文凭据。
acceptance_criteria:
  - STRIDE 6 行矩阵逐项映射到 bugs/安全隐私/性能问题/平台兼容三个子目录条目，抵赖类别可标 "无" 但需说明理由
  - 07 ADR 已删除 tray check_update 的仿冒风险明确标注已缓解；60828 无认证 + 剪贴板中间人为 P0
  - 缓解路线图 30/60/90 天覆盖 macOS Accessibility 权限最小化 + tauri-plugin-sql path 加固
related:
  - ../../prds/2026-09/07-prd-桌面集成与快捷键.md
  - ../../prds/2026-09/10-prd-外部调用与HTTP服务.md
  - ../../prds/2026-09/14-prd-剪切板监听.md
  - ./安全隐私/001-APIKey明文存储.md
  - ./安全隐私/002-tauri-安全配置-daemon-csp.md
  - ./性能问题/001-剪切板CPU占用高.md
---

## 一、STRIDE 威胁矩阵（6 行 × 4 列）

| STRIDE 类别 | 威胁场景 | 影响 | 可能性 | 缓解措施 |
| --- | --- | --- | --- | --- |
| **S 仿冒 (Spoofing)** | tray `check_update` 自动更新：原实现通过 HTTP 明文下载 `latest.yml` 校验缺失，中间人可投毒替换二进制；对应 07 ADR **已删除** tray check_update 模块，风险已关闭但仍需防止回退。 | 中：历史版本仍在 v1.4.x 流通，用户不升级则可被 RCE。 | 低（已删除）：新版本不存在该逻辑，但老版本有存量。 | (1) 07 ADR 已生效：构建阶段 `tauri.conf.json` 禁用 `updater` 插件；(2) 安装包签名 + Notarization 硬校验，老版本升级提示强引导；(3) CI 中加回退检测：若 `withGlobalTauri(updater)` 出现在代码库则构建失败。 |
| **T 篡改 (Tampering)** | 双入口篡改：① 剪贴板中间人注入：用户复制→未签名→YiPot 读取→注入恶意翻译 prompt；② HTTP 服务绑定 `0.0.0.0:60828` 无认证：局域网任意机器 POST `/translate` 带 payload 修改 `preferences.json` 中的 `default_engine` / `api_key`。 | 高：① 可让翻译返回含 XSS/钓鱼链接；② 可偷 API Key 或把翻译流量转发攻击者服务器。 | 高：0.0.0.0 默认绑定 + 无鉴权是出厂状态，所有 macOS/Windows 用户暴露在局域网内。 | (1) 剪贴板内容 HMAC 校验开关（可选）+ 对 `text/html` 类型剪贴板强制净化（DOMPurify）；(2) 10-prd HTTP 服务：默认绑定 `127.0.0.1`，允许 0.0.0.0 必须手动开 + 加 Bearer Token 校验；(3) `/translate` 请求入参 Pydantic 校验，拒绝 `text` 中包含 `<script javascript:` 等模式。 |
| **R 抵赖 (Repudiation)** | 无。翻译行为纯本地 + SQLite history 本地落盘，不存在多方共享场景下的不可抵赖需求；若后期接入云端同步再补。 | 无 | 无 | **无**（标注：本模型版本不覆盖抵赖项；cloud-sync PRD 接入时重评）。 |
| **I 信息泄露 (Information Disclosure)** | 安全隐私双 001/002：① 001 API Key 明文 storage：`~/.config/yipot/preferences.json` 中 `google_api_key` / `deepl_auth_key` 等 7 个引擎 key 明文 `chmod 644`；② 002 `tauri-plugin-sql` `history.db` path 未限制：前端 `window.__TAURI__.sql` 可读任意用户可读路径（包含 `~/.ssh/id_rsa`）。 | 高：① 本地多账号/恶意扫描器读到 key → 直接盗用引擎配额产生账单；② 前端 XSS 链式 → 读任意本地文件。 | 高：出厂默认，已在安全隐私 bug 记录。 | (1) 对接 001：使用 macOS Keychain / Windows Credential Locker 存储 API Key，`preferences.json` 只留 handle；(2) 对接 002：`tauri-plugin-sql` 加 allowlist：path 仅允许 `$APPCONFIG/history.db` 单文件；(3) 全量 CSP 收紧：`default-src 'self'`，禁止 `unsafe-inline-script`。 |
| **D 拒绝服务 (Denial of Service)** | 双 DoS：① 性能问题 001 clipboard 高频 CPU 耗尽：攻击者构造每秒 200 次 `NSPasteboard` 写入（AirDrop 批量或 AppleScript）→ YiPot 监听线程 100% CPU → 机器卡顿 30+ 秒；② 60828 无认证 + 无限流：局域网 `ab -n 100000 -c 200 /translate` → 21 个翻译引擎并发耗尽网络/TLS 句柄。 | 中：不会破坏数据但严重影响可用性，笔记本电池掉电 + 风扇狂转。 | 高：复现容易，已在性能问题 001 复现（CPU 峰值 9.4%，极端 10x 放大可达 90%+）。 | (1) 剪贴板监听合并 150ms debounce + 回压：队列 > 32 丢弃；(2) 60828 接入 `ip-filter` + `token bucket`：单 IP 30 req/min，全局 120 req/min；(3) 翻译引擎层加 per-engine 并发上限 4。 |
| **E 提权 (Elevation of Privilege)** | macOS Accessibility 权限过宽：`14-prd 剪切板监听` 申请了 `kAXTrustedCheckOptionPrompt` 但实际功能只用了 "读剪贴板"，默认 Accept 后 YiPot 拥有 "控制电脑" 能力 → 可模拟按键/点击/启动任意 app。 | 高：一旦 YiPot 主进程被 RCE（上文中 S/T 的组合），直接等于拿到用户会话完全控制。 | 中：需先有 RCE 入口，但 0.0.0.0:60828 无认证 + 明文 API key 给了 RCE 前序。 | (1) macOS Accessibility 按需申请：不启动 "划词翻译 OCR" 时完全不 prompt；(2) `Info.plist` 细化 usage description，区分 "剪贴板读" vs "模拟按键"；(3) 使用 Tauri `capabilities` v2 按功能 granular 拆权限，默认 0 个，用户点哪项申请哪项。 |

## 二、风险等级总表 P0 / P1 / P2

| 风险 ID | STRIDE 类别 | 摘要 | 影响 | 可能性 | 综合等级 | 对应 bug 子目录 |
| --- | --- | --- | --- | --- | --- | --- |
| YIPOT-STRIDE-001 | T 篡改 | HTTP 0.0.0.0:60828 无认证可改写 preferences | 高 | 高 | **P0** | 平台兼容 / 安全隐私 |
| YIPOT-STRIDE-002 | I 信息泄露 | API Key 明文 + tauri-plugin-sql 任意读 | 高 | 高 | **P0** | 安全隐私 001 / 002 |
| YIPOT-STRIDE-003 | E 提权 | macOS Accessibility 权限过宽 | 高 | 中 | **P0** | 平台兼容 001 macOS |
| YIPOT-STRIDE-004 | T 篡改 | 剪贴板中间人注入翻译结果 | 中 | 高 | **P1** | 性能问题 001 关联 |
| YIPOT-STRIDE-005 | D DoS | clipboard 高频耗尽 CPU + 60828 无限流 | 中 | 高 | **P1** | 性能问题 001 |
| YIPOT-STRIDE-006 | S 仿冒 | tray check_update 历史版本 HTTP 明文 | 中 | 低 | **P2** | bugs/模板 ADR-07 对照 |
| YIPOT-STRIDE-007 | R 抵赖 | 无（留空占位） | 无 | 无 | — | — |

## 三、缓解路线图 30 / 60 / 90 天

| 阶段 | 交付物 | 对应风险 | 验收标准 |
| --- | --- | --- | --- |
| **30 天 (T+0 ~ T+30)** | ① 10-prd HTTP 默认绑定 127.0.0.1 + Bearer Token 校验 + 限流；② 剪贴板监听 150ms debounce + 队列回压；③ 001 API Key 迁入 Keychain/Credential Locker | 001, 005, 002 | ① nmap 局域网扫 60828 默认 CLOSED，未带 token 调用 100% 401；② 200/s 剪贴板写入 CPU ≤ 6%；③ `preferences.json` grep 0 处明文 key。 |
| **60 天 (T+31 ~ T+60)** | ④ 002 tauri-plugin-sql path allowlist 单文件；⑤ macOS Accessibility 按需申请 + Tauri capabilities v2 拆权限；⑥ CSP 收紧去 `unsafe-inline` | 002, 003, 002 | ④ 前端尝试读 `~/.ssh/id_rsa` 100% 抛 `NotAllowed`；⑤ 首次启动不弹 Accessibility 提示，OCR 才弹；⑥ CSP 评估工具零违规。 |
| **90 天 (T+61 ~ T+90)** | ⑦ 剪贴板内容 HMAC + HTML DOMPurify；⑧ 老版本 tray updater 禁用 + 签名校验回退检测；⑨ STRIDE 模型集成 CI：每次发布前跑 checklist | 004, 006, 全 | ⑦ 剪贴板注入 XSS 样本 100% 被拦截；⑧ 07 ADR 回退检测 CI 失败；⑨ 发布门禁：P0 必须 0，P1 必须 ≥1 条缓解合入。 |
