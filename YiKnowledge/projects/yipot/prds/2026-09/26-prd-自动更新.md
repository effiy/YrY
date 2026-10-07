---
doc_type: prd
title: "YP-09-S15: 自动更新系统"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S15
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 自动更新, 升级]
category: 项目/桌面应用/需求
---

# YP-09-S15: 自动更新系统

> 需求编号：YP-09-S15 · 优先级：P2 · 人天：1.0d · 状态：已完成

## 背景

桌面应用的版本更新依赖用户主动下载安装。自动更新系统让用户始终使用最新版本，及时获得功能改进和安全修复。

## 需求

### 更新检查

```rust
// updater.rs
pub fn check_update(app_handle: &AppHandle) {
    // 请求 GitHub Release API
    // 比较版本号
    // 有新版本 → 弹窗提示
}
```

### 更新窗口

`YiPot/src/window/Updater/index.jsx`:
- 显示当前版本和最新版本
- 更新日志展示
- 下载进度条
- 安装并重启按钮

### 更新器脚本

- `updater/updater.mjs` — 下载新版本 → 替换二进制 → 重启
- `updater/updater-for-fix-runtime.mjs` — 修复 macOS "damaged" 错误

## 验收标准

- [ ] 启动时检查更新（非阻塞）
- [ ] 有新版本时弹窗提示
- [ ] 下载进度显示
- [ ] 安装后自动重启

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| GitHub API 限流 | 异常 | 显示"更新检查失败"，不阻塞启动 | 下次启动重试 |
| 下载中断（网络断开） | 异常 | 支持断点续传 | 下次从断点继续 |
| 磁盘空间不足 | 异常 | 提示"磁盘空间不足，需要 XX MB" | — |
| 版本回退检测 | 边界 | 禁止安装比当前版本旧的更新 | 提示"已是最新版本" |
| 更新文件校验失败 | 异常 | 提示"安装包校验失败，请手动下载" | 删除损坏文件 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 启动时检查更新 | ≤ 5s（非阻塞，异步） | 网络请求计时 |
| 性能 | 更新下载速度 | 不限速 | 带宽测试 |
| 可靠性 | 增量更新大小 | ≤ 10MB（补丁） | 构建产物对比 |
| 兼容性 | macOS 运行时修复 | updater-for-fix-runtime.mjs | "已损坏"错误修复 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | GitHub Release API | HTTPS GET | `{tag_name, assets, body}` |
| 依赖 | Rust updater.rs | Tauri command | `check_update()` |
| 依赖 | updater.mjs | Node.js 脚本 | 下载 + 替换 + 重启 |
| 被依赖 | 更新窗口 (Updater/index.jsx) | UI 显示 | 当前版本 + 最新版本 + 进度 |

---

## 相关文档

- 开发方案: [26-prd-task-自动更新](../../devs/2026-09/26-prd-task-自动更新.md)
- 测试方案: [26-prd-test-自动更新](../../tests/2026-09/26-prd-test-自动更新.md)
- 构建发布与安全: [11-prd-构建发布与安全](./11-prd-构建发布与安全.md)