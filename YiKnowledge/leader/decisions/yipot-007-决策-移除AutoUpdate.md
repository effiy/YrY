---
title: "ADR: 移除 YiPot Tauri 内置 AutoUpdate 机制"
tags: [category/leader, 决策, adr, yipot, autoupdate, tauri, security]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "消除 Tauri 自动更新签名配置维护负担，改用 YiPot 托盘手动检查 + GitHub Release 通知，更新失败率从 35% 降至接近 0"
acceptance_criteria:
  - "updater.rs 中的 tauri::updater::builder 代码块（第 1-28 行）保持注释状态并加 ADR 链接说明
  - "托盘菜单 check_update 项（tray.rs:112, 187-189）改为跳转 GitHub Release 页面而非调用 tauri updater
  - "tauri.conf.json 中 updater 相关配置块移除或标记为 disabled，无安全告警"
related:
  - ./README.md
  - ./yipot-yipot-yipot-006-决策-托盘Accessory.md
  - ../../curator/templates/0001-模板-ADR模板.md
  - ../../projects/yipot/prds/2026-09/26-prd-自动更新.md
  - ../../projects/yipot/bugs/README.md
  - ../../engineer/ship/0008-交付-部署指南.md
  - ../../engineer/SECURITY.md
  - ../../sre/release/0003-发布-发布冻结.md
---

# ADR: 移除 YiPot Tauri 内置 AutoUpdate 机制

> **状态**：已接受 (2026-10-07)

---

## 上下文

YiPot 当前使用 Tauri 框架内置的 `tauri::updater` 机制提供自动更新功能。对应代码：
- `YiPot/src-tauri/src/updater.rs:1-28`：`check_update()` 函数，已被整段注释，仅保留 `pub fn check_update()` 空壳调用
- `YiPot/src-tauri/src/tray.rs:112, 187-189`：托盘菜单 `check_update` 项的事件处理 `on_check_update_click()`，当前仅打一行日志 `"Auto-update has been disabled"`

为什么即使代码注释了也要写 ADR 正式决策：
1. **签名维护成本**：Tauri 自动更新要求每平台（macOS/Windows/Linux）都有代码签名证书 + Tauri updater sign key，macOS 还需要 Apple Developer Program（$99/年）。当前 YrY 没有任何签名证书，26-prd-自动更新.md 中提到的更新功能因签名缺失 35% 更新尝试失败
2. **供应链安全风险**：Tauri updater 下载文件走公共 CDN，如果签名被绕过或 updater 配置错误，用户会运行未经签名的代码——这是 SECURITY.md 中标注的"高风险配置"
3. **用户体量小**：YiPot 当前活跃用户 < 200 人，且都是技术用户，愿意手动下载新版。强制自动更新带来的收益远小于维护成本和风险

---

## 决策

**正式移除 YiPot 内置自动更新，采用"托盘手动检查 + GitHub Release Webhook 通知"双通道方案。**

具体落地：
1. **updater.rs 保持注释**：`YiPot/src-tauri/src/updater.rs:1-28` 的 tauri::updater::builder 代码块维持注释状态，在文件顶部加注释链接到本 ADR 说明决策原因
2. **托盘菜单项行为改造**：`tray.rs:112` 的 `check_update` 事件（当前第 187-189 行仅打日志）改为 `tauri::api::shell::open()` 跳转 GitHub Release 页面（类似 `on_view_log_click` 第 190-194 行的写法），并加版本比较：读取 `app_handle.package_info().version` 和 GitHub latest tag API，有新版时弹 Toast "有新版本 vX.Y.Z，点击前往下载"
3. **tauri.conf.json 配置清理**：`tauri.conf.json` 中的 `updater` 配置块（如果存在）删除或标记为 `"active": false`，确保打包产物不含 updater 依赖
4. **发布流程补充**：sre/release 流程新增 YiPot Release 步骤：打 tag → 自动触发 GitHub Release → 自动发 issue 到 YiKnowledge/projects/yipot/bugs/README.md 通知活跃用户

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：修复签名，维持 Tauri 自动更新** | 用户体验无缝；已写好的 updater 代码复用 | 年成本 ≥ $99（Apple 证书）+ Windows EV 签名（$200+/年）；证书轮换、过期、泄露等运维负担；35% 失败率即使修复签名仍有 10-15%（网络问题） | 200 用户体量不值得每年 $300+ 成本；签名管理本身就是持续运维负担 |
| **方案 B：用 Sparkle（macOS）+ Squirrel（Windows）替代 Tauri updater** | 比 Tauri updater 更成熟稳定；生态更广 | 引入两套完全不同的更新机制，跨平台代码重复；Sparkle/Squirrel 都仍要签名；和 Tauri 生命周期对接有坑 | 方案 A 的所有问题都存在，还新增双框架维护成本；完全不划算 |
| **方案 C（已选择）：托盘手动检查 + GitHub Release 页面跳转 + Webhook 通知** | 零额外运维成本；签名问题彻底消失；GitHub Release 自带 CDN + 防篡改 hash；用户可选择是否更新 | 用户要点击 2-3 次完成更新；<10% 用户从不主动更新 | 200 技术用户都能接受手动更新；10% 不更新的用户用老版本也能用（不强制）；零成本 + 零风险 > 无缝体验 |

---

## 后果

### 正面影响
- **安全风险降低**：消除未签名更新被篡改的攻击面，符合 SECURITY.md 供应链加固要求
- **运维成本归零**：无需证书续费、签名过期告警、updater 配置排错
- **更新可靠性提升**：GitHub Release 下载成功率 > 99%，用户不再遇到 "Update failed, please redownload"
- **和现有发布流程一致**：YiPot 和 YiAi/YiPet 一样，统一走 GitHub Release → 手动下载，无特殊流程

### 负面影响
- **用户体验下降**：从 1 点击自动更新变为 2-3 点击手动下载覆盖；约 10% 用户会停留在旧版本
- **托盘菜单项需要文案说明**："检查更新"→"前往 GitHub 下载新版"的语义变化，需在设置页加说明文档
- **和 26-prd-自动更新.md 不一致**：PRD 写的是自动更新，需发一个 PRD 补充说明或标记 PRD 中该需求为"descoped"，并记录原因

### 中性影响
- **与 yipot-06 托盘 Accessory 的协作**：yipot-06 重构 TrayAccessory 时，check_update 菜单项的事件直接实现为 shell::open，无需考虑 tauri updater 的异步问题
- **updater.rs 文件保留**：不删除文件，仅保留空壳 + ADR 注释链接——未来如果用户规模超过 5000，可以恢复自动更新而不丢历史代码
- **tauri.conf.json 配置**：updater 配置块如果删除，需要在 Cargo.toml 的 tauri feature 里确认没有多余 feature 被启用，避免打包进无用依赖

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**后续追踪**：
- 超 5000 用户时：重新提案自动更新方案，评估是否采购签名证书
- 每季度审查 GitHub Release 手动更新率，若低于 70% 则考虑在应用启动时加非阻塞更新提示
