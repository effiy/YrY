---

doc_type: module
prd_task_id: "YP-09-S15"
title: "自动更新 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "26-prd-自动更新.md"

type: task
---

# 自动更新 — 开发方案

## 源码

`YiPot/src-tauri/src/updater.rs` + `YiPot/src/window/Updater/index.jsx`
`updater/updater.mjs` + `updater/updater-for-fix-runtime.mjs`

## Rust 检查逻辑

```rust
pub fn check_update(app_handle: &AppHandle) {
    // 请求 GitHub Release API
    // GET https://api.github.com/repos/pot-app/pot-desktop/releases/latest
    // 解析 tag_name → semver 比较
    // 当前版本 < 最新版本 → 打开更新窗口
}
```

## 更新窗口 UI

- 显示当前版本 → 最新版本
- 更新日志 (Markdown 渲染)
- 下载进度条
- "安装并重启" 按钮

## 更新器脚本

```javascript
// updater/updater.mjs
async function update() {
  // 1. 下载新版本 .dmg/.msi
  // 2. 校验 SHA256
  // 3. 关闭当前进程
  // 4. 安装新版本
  // 5. 重启应用
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 更新源 | GitHub Release | 免费 CDN，版本管理一体化 |
| 校验 | SHA256 | 防止下载损坏/篡改 |
| 更新UI | 独立窗口 | 不阻塞翻译窗口 |
| 版本比较 | semver 语义化版本 | 正确处理 `1.2.3` vs `1.10.0` 比较 |
| 静默失败 | 网络错误不弹窗 | 避免干扰用户正常使用 |
| 更新器独立进程 | Node.js script（updater.mjs）| Tauri 退出后可继续安装 |

## 性能优化

| 优化项 | 方案 | 效果 |
|--------|------|------|
| 启动时检查 | 异步非阻塞，Tauri `setup` hook 中 `tauri::async_runtime::spawn` | 不影响窗口启动时间 |
| 版本缓存 | `localStorage` 记录上次检查时间，24h 内不重复请求 | 减少 GitHub API 调用 |
| 下载进度 | 分块下载 + `reqwest::Response::chunk()` 流式写入 | 大文件不阻塞 UI 线程 |
| 增量更新 | 仅下载变更文件（`diff` 模式，暂未实现） | 减少带宽消耗 70%+ |
| 并行校验 | 下载同时计算 SHA256 摘要 | 下载完成即校验完成 |

## 错误处理

| 错误场景 | 错误码 | 处理方式 | 用户提示 |
|----------|--------|----------|----------|
| GitHub API 限流 (403) | `UPD-403` | 等待 `X-RateLimit-Reset` 后重试 1 次 | "更新检查过于频繁，稍后重试" |
| GitHub API 不可达 | `UPD-NET` | 静默失败，不弹窗 | 无（仅日志记录） |
| 下载中断 | `UPD-DOWN` | 保留已下载部分，支持断点续传（HTTP Range） | "下载中断，点击重试" |
| SHA256 校验失败 | `UPD-HASH` | 删除已下载文件，提示重新下载 | "文件校验失败，请重新下载" |
| 磁盘空间不足 | `UPD-SPACE` | 检查安装包 2x 可用空间 | "磁盘空间不足，请清理后重试" |
| 安装脚本执行失败 | `UPD-INST` | 日志记录错误详情，保留旧版本可运行 | "安装失败，请手动下载更新" |
| 版本号解析异常 | `UPD-FMT` | 回退到字符串比较 | 日志警告，不阻塞流程 |
| macOS 公证验证失败 | `UPD-GATE` | 提示用户手动允许 | "请在系统设置中允许此应用" |

## 交叉引用

| 关联文档 | 关系 | 说明 |
|----------|------|------|
| [26-prd-自动更新](../prds/2026-09/26-prd-自动更新.md) | 上游 PRD | 功能需求定义 |
| [80-prd-test-自动更新](../tests/2026-09/80-prd-test-自动更新.md) | 下游测试 | 测试用例与验证方案 |
| 项目 `updater/updater.mjs` | 源码 | 更新器独立脚本 |
| 项目 `src-tauri/src/updater.rs` | 源码 | Rust 端检查逻辑 |

> **平台差异**：macOS 需额外处理 `.dmg` 挂载与公证（notarization）；Windows 需处理 `.msi` 安装与注册表；Linux 依赖 `.deb`/`.AppImage`。
> **安全关注**：SHA256 校验 + HTTPS 传输 + 签名验证（macOS notarization）三者缺一不可。