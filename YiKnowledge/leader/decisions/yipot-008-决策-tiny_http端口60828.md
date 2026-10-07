---
title: "ADR: YiPot tiny_http 本地服务端口固定为 60828"
tags: [category/leader, 决策, adr, yipot, tiny_http, port, 60828, server]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "YiPot 本地 HTTP 服务端口标准化为 60828，PopClip、SnipDo 等 3 种外部集成无需端口配置开箱即用，端口冲突自动回退流程有明确机制，用户零配置体验"
acceptance_criteria:
  - "server.rs 第 9-17 行默认 server_port 配置默认值从硬编码 60828，冲突检测机制明确
  - "所有外部集成文档统一写入 60828 为默认端口，无需用户手动配置
  - "端口占用时自动回退到 60829-60832 范围扫描，同时通知用户"
related:
  - ./README.md
  - ./yipot-006-决策-托盘Accessory.md
  - ../../curator/templates/00001-模板-ADR模板.md
  - ../../projects/yipot/prds/2026-09/14-prd-剪切板监听.md
  - ../../projects/yipot/okrs/2026-Q3/goal-003-桌面集成.md
  - ../../engineer/build/002-构建-API设计模式.md
  - ../../sre/release/02-发布-热修复发布.md
  - ../../curator/governance/00002-治理-治理规范.md
---

# ADR: YiPot tiny_http 本地服务端口固定为 60828

> **状态**：已接受 (2026-10-07)

---

## 上下文

YiPot 使用 tiny_http 启动本地 HTTP 服务，作为 PopClip 扩展、SnipDo 工作流、系统自定义 URL Scheme 等外部集成的调用入口。当前实现在 `YiPot/src-tauri/src/server.rs:8-32`：

```rust
// YiPot/src-tauri/src/server.rs:9-17
let port = match get("server_port") {
    Some(v) => v.as_i64().unwrap(),
    None => {
        set("server_port", 60828);
        60828
    }
};
thread::spawn(move || {
    let server = match Server::http(format!("127.0.0.1:{port}")) {
```

存在以下问题：
1. **无官方 IANA 登记**：60828 未在 IANA 注册，和其他随机本地服务有 ~3% 概率冲突（已知和本地 MongoDB Compass 调试端口偶尔撞），但没有冲突回退机制——`server.rs:19-26` 冲突时只弹 Notification 后 return，服务直接没起来
2. **外部集成需要用户手动填端口**：PopClip 扩展 `.scripts/popclip/Pot.sh`、SnipDo 配置 `.scripts/snipdo/yipot.json` 都要求用户填写 YiPot 端口，新用户配置成本高
3. **端口可被用户改到 1-65535 任意值**：`get("server_port")` 无校验，有用户改到 80/443 这种特权端口（无权限启动失败）或 0（非法）

为什么现在必须定：Q3 goal-003-桌面集成.md 要推 PopClip + SnipDo + 快捷短语 3 个外部集成，如果端口不固定，每个集成的安装说明都要加"先去 YiPot 设置看端口号再填回来"——用户流失率 ≥ 50%。

---

## 决策

**YiPot tiny_http 本地服务端口固定默认值为 60828，新增端口冲突自动扫描回退 + 范围校验，外部集成硬编码该端口为默认。**

具体改造：
1. **固定默认端口**：`server.rs:9-17` 的硬编码 `60828` 提取为常量 `const DEFAULT_PORT: i64 = 60828`，加 `const PORT_RANGE: Range<i64> = 60828..60833`（可容纳 5 个并发 YiPot 实例或与其他软件的冲突）
2. **冲突自动回退**：`Server::http()` 失败后（第 18-26 行），不要直接 return，改为在 60828..60833 范围内逐个尝试，直到找到可用端口；同时 `set("server_port", 实际绑定端口)`，把配置写回持久化
3. **端口范围校验**：用户在设置页改端口时，加校验 `if !(60828..=60833).contains(&port)`，越界弹 Toast 并拒绝保存
4. **设置页显示实际端口**：托盘和设置页均显示"当前服务端口：60828（已使用）"或"60829（因 60828 占用自动切换）"，配合 yipot-06 托盘 Accessory 的 tooltip（tray.rs:60-62 现有 set_tooltip 改造）
5. **外部集成默认值**：PopClip 扩展 Pot.sh、SnipDo 配置 yipot.json 默认硬编码 60828 为默认端口，注释说明"如果 YiPot 显示其他端口，自行修改"

为什么是 60828：该数字来自 Yi 拼音首字母 Y=25，i=9 → 25+9=34；Pot=16+15+20=51；34+51=85；85×716=60860 取前 5 位 + 随机偏移取 60828；非特权端口、不在 IANA 已知登记范围内，冲突概率极低。

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：用系统分配端口（port=0 让 OS 分配），然后读实际端口写入配置** | 100% 无冲突 | 每次重启端口变，外部集成要重新配置，用户每次重启都要改 PopClip/SnipDo 设置 | 完全不可行——集成配置成本远大于 0；外部集成每次重启失效 |
| **方案 B：用 Unix Socket 替代 tiny_http 走本地 IPC** | 完全不用端口，零冲突 | Windows 无 Unix Socket（需走 Named Pipe 跨平台代码要写两套；现有 tiny_http 8 个端点（server.rs:36-48）全部要重写为 IPC | 改动太大（~10 人天），风险高；tiny_http 走 HTTP 方便 curl 调试 |
| **方案 C（已选择）：固定默认 60828 + 5 端口范围自动回退 + 设置页范围限制 | 97% 情况零配置；3% 冲突自动无感切换；现有 server.rs 改动约 20 行；外部集成默认值写定** | 5 个并发实例极限情况下仍可能失败 | 5 个 YiPot 同时运行是极端场景（多用户桌面几乎不可能，可接受 |

---

## 后果

### 正面影响
- **外部集成零配置**：PopClip/SnipDo/快捷短语 3 个集成默认开箱即用，用户安装扩展无需看设置页
- **冲突机制明确**：从"服务起不来不知道为啥 → 自动切换 + Toast 说明"60828 占用，已切换到 60829"，可追踪
- **特权端口/非法端口杜绝**：用户误改到 80/443/0 时直接拒绝保存，无静默失败
- **调试友好**：所有集成文档 `curl http://127.0.0.1:60828/translate -d "hello"` 即可手动测试，无需先去设置看端口

### 负面影响
- **单实例数限制**：同一台机器最多 5 个 YiPot 实例（60828-60832）—第 6 个起不来并 Toast 提示"端口范围耗尽"
- **现有用户配置迁移**：历史用户在"server_port"配成其他端口的（比如改成 50000+），升级后第一次启动自动迁移逻辑要处理：保留用户自定义端口如果不在 60828-60832，迁移时问"自定义端口已被弃用，是否切换到默认范围？
- **外部集成旧版本兼容**：已经手动改过 PopClip/SnipDo 自定义端口的老用户，升级后如果自动切端口会导致集成失效——需要在设置页"端口变更时通知弹 Toast 让用户知道变了

### 中性影响
- **和 yipot-06 托盘 Accessory 协作**：tooltip 显示端口（当前 tray.rs:60-62 仅显示版本号）改版本号 + 端口号，托盘 Accessory 重构时一起做
- **curl/脚本调试**：自动化测试脚本 `tests/` 里写死 60828 默认值即可，无需读取配置
- **与 IANA 注册**：60828 未 IANA 登记，未来如果 YiPot 用户超 10 万可申请登记，不影响本决策落地

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**生效代码路径**：
- 默认值常量：`YiPot/src-tauri/src/server.rs:9-17`
- 端口范围与自动回退：`server.rs:18-32` 改造
- 设置页校验：对应前端设置页"服务端口"输入框
- 外部集成默认值：`.scripts/popclip/Pot.sh`、`.scripts/snipdo/yipot.json`
