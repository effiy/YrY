---
doc_type: prd
title: 构建发布与安全隐私 — 需求规格
tags:
- 需求文档
- 构建
- 发布
- 自动更新
- 安全
category: 项目/桌面应用/需求
created: '2026-09-23'
updated: '2026-09-23'
source: 内部
type: 需求
status: 已完成
priority: 中
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: '202609'
prd_task_id: YP-09-M13
estimate_frontend: 3
review_status: 已发布
issue_type: 功能
roles: [engineer, qa]
---

# 构建发布与安全隐私 — 需求规格

> 需求编号：YP-09-M13 · 优先级：P2 · 人天：~3d

---

## 一、构建系统

### 1.1 构建配置

| 属性 | 值 |
|------|-----|
| 前端构建 | Vite 5 |
| 后端构建 | Cargo (Rust) |
| 包管理 | pnpm |
| 桌面框架 | Tauri 1.6 |

### 1.2 构建产物

| 平台 | 格式 | 签名 |
|------|------|------|
| macOS | .dmg | Apple Developer 签名 |
| Windows | .msi / .exe | — |
| Linux | .deb / .AppImage / .rpm | — |

### 1.3 Rust Tauri 插件

| 插件 | 功能 |
|------|------|
| `tauri-plugin-autostart` | 开机启动 |
| `tauri-plugin-log` | 日志输出 |
| `tauri-plugin-sql` | SQLite 数据库 |
| `tauri-plugin-store` | KV 配置存储 |
| `tauri-plugin-fs-watch` | 文件系统监听 |
| `tauri-plugin-single-instance` | 单实例检测 |

---

## 二、自动更新

### 2.1 更新检查 (`updater.rs`)

- 启动时自动检查更新
- 更新窗口: `YiPot/src/window/Updater/index.jsx`
- 支持增量更新和全量更新

### 2.2 更新器脚本

- `updater/updater.mjs` — 标准更新
- `updater/updater-for-fix-runtime.mjs` — 运行时修复

---

## 三、安全与隐私

### 3.1 API Key 安全

- 所有 API Key 本地加密存储
- 使用 `crypto-js` 加密敏感配置
- 不通过网络传输未加密的凭据

### 3.2 macOS 权限

| 权限 | 用途 |
|------|------|
| 辅助功能 (Accessibility) | 读取选中文本 |
| 屏幕录制 | 截图功能 |

- 使用 `macos_accessibility_client` 检测权限状态
- 权限不足时提示用户授权

### 3.3 隐私保护

- 翻译内容不记录到日志
- 本地 OCR (系统/Tesseract) 无数据上传
- HTTP 服务仅绑定 127.0.0.1
- 剪切板监听可随时关闭

### 3.4 代码签名

- macOS: Apple Developer 签名 + 公证
- Windows: 可选代码签名证书

---

## 四、验收标准

- [ ] 三大平台可正常构建
- [ ] macOS 版本通过 Apple 公证
- [ ] 自动更新检查不阻塞启动
- [ ] API Key 不以明文存储在磁盘
- [ ] macOS 辅助功能权限提示友好
- [ ] 日志中不包含翻译内容

---

## 用户画像与使用场景

### 典型用户

| 画像 | 角色 | 核心诉求 | 使用频率 |
|------|------|---------|---------|
| macOS 用户 | 需要从非 App Store 安装桌面应用 | 应用经过 Apple 公证、无"已损坏"警告 | 初次安装 |
| 企业 IT 管理员 | 管理内部软件分发 | 静默安装、msi 部署、自动更新 | 版本发布时 |

### 使用场景

1. **macOS 首次安装**: 用户下载 dmg → 拖入 Applications → 双击启动 → 期望: 不弹出"无法验证开发者"警告
2. **自动更新流程**: 用户收到更新提示 → 点击更新 → 期望: 自动下载 → 安装 → 重启，配置不丢失
3. **企业批量部署**: IT 管理员通过 SCCM 推送 msi → 期望: 静默安装，预置配置，无需用户交互
4. **AppImage 便携使用**: Linux 用户下载 AppImage → chmod +x → 直接运行 → 期望: 无需安装依赖，即开即用

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | macOS 构建通过 Apple 公证 | 100% 通过 notarization | `spctl --assess --verbose` | P1 |
| AC-02 | 三大平台构建成功率 | 100% (CI 环境) | GitHub Actions 构建矩阵 | P0 |
| AC-03 | 构建产物大小 (macOS) | ≤ 50MB (.dmg) | 构建产物检查 | P2 |
| AC-04 | 构建产物大小 (Windows) | ≤ 60MB (.msi) | 构建产物检查 | P2 |
| AC-05 | 安装包增量更新大小 | ≤ 5MB（补丁） | 二进制 diff | P2 |
| AC-06 | API Key 磁盘存储 | 100% 加密存储，无明文 | 磁盘搜索 | P0 |
| AC-07 | 日志安全性 | 0 条翻译内容泄露 | 日志全文搜索 | P1 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| macOS 公证失败 | 异常 | CI 通知开发者，不发布 | 检查签名证书有效性 |
| Windows Defender 误报 | 异常 | 提交误报到 Microsoft | 代码签名证书可降低误报 |
| 自动更新下载中断 | 异常 | 支持断点续传，进度持久化 | 从断点继续下载 |
| 空间不足无法下载更新 | 异常 | 提示"磁盘空间不足，需要 XX MB" | — |
| macOS 辅助功能权限被撤销 | 异常 | 提示"检测到辅助功能权限已移除，请重新授权" | 引导至系统偏好设置 |
| 构建时网络错误 | 异常 | 重试 3 次（npm/cargo 依赖下载） | CI 缓存策略 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 安全 | 代码签名 | macOS: Apple Developer / Windows: 可选 EV 证书 | 签名验证 |
| 安全 | CSP (Content Security Policy) | 禁止 eval / inline script | Tauri 配置检查 |
| 安全 | CSP 外部连接白名单 | 仅允许已知翻译/OCR API 域名 | 配置审查 |
| 兼容性 | Tauri 最低版本 | 1.6.x | cargo.toml 检查 |
| 兼容性 | Node.js 构建版本 | ≥ 18 | CI 环境检查 |
| 可维护性 | CI 构建矩阵 | macOS x86/arm64 + Windows x64 + Linux x64 | GitHub Actions |

---

## 构建产物对比

| 平台 | 格式 | 典型大小 | 签名 | 安装方式 |
|------|------|---------|------|---------|
| macOS (Intel) | .dmg | ~45MB | Apple 公证 | 拖入 Applications |
| macOS (Apple Silicon) | .dmg | ~40MB | Apple 公证 | 拖入 Applications |
| Windows | .msi | ~55MB | 可选 EV 签名 | 安装向导 |
| Windows | .exe | ~50MB | 可选 EV 签名 | 绿色便携 |
| Linux | .deb | ~45MB | — | dpkg -i |
| Linux | .AppImage | ~50MB | — | 直接运行 |
| Linux | .rpm | ~45MB | — | rpm -i |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | Tauri bundler | tauri.conf.json | 构建配置 |
| 依赖 | Vite 5 | vite.config.ts | 前端构建 |
| 依赖 | Rust/cargo | Cargo.toml | 后端构建 |
| 依赖 | GitHub Release API | HTTPS | 版本号 + 二进制 |
| 依赖 | crypto-js | 加密 API | AES 加密配置 |

---

## CI/CD 流水线设计

### 构建流水线 (GitHub Actions)

```
push tag v*.*.*
    ↓
并行构建矩阵
├─ macOS x86_64  ──→ .dmg ──→ Apple 公证 ──→ 上传 Release
├─ macOS arm64    ──→ .dmg ──→ Apple 公证 ──→ 上传 Release
├─ Windows x64    ──→ .msi + .exe ──→ 上传 Release
└─ Linux x64      ──→ .deb + .AppImage + .rpm ──→ 上传 Release
    ↓
更新 manifest.json (版本号 + 下载链接 + 哈希)
    ↓
发布 GitHub Release
```

### 各阶段耗时预算

| 阶段 | 预计耗时 | 并行化 |
|------|---------|--------|
| 前端构建 (Vite) | ~2min | 与 Rust 并行 |
| Rust 编译 (release) | ~5min (macOS), ~8min (Win/Linux) | 各平台独立 |
| Tauri 打包 | ~2min | 各平台独立 |
| macOS 公证 | ~3min (Apple 服务器响应) | — |
| 上传 Release | ~1min | 串行 |

### 环境矩阵

| 平台 | Runner | Rust Target | Node.js |
|------|--------|-------------|---------|
| macOS x86_64 | macos-13 | x86_64-apple-darwin | 20 |
| macOS arm64 | macos-latest | aarch64-apple-darwin | 20 |
| Windows x64 | windows-latest | x86_64-pc-windows-msvc | 20 |
| Linux x64 | ubuntu-latest | x86_64-unknown-linux-gnu | 20 |

---

## 发布渠道与灰度策略

| 渠道 | 目标用户 | 更新频率 | 风险等级 |
|------|---------|---------|---------|
| Stable | 所有用户 (默认) | 每月 | 低（充分测试） |
| Beta | 尝鲜用户 (手动选择) | 每两周 | 中 |
| Nightly | 开发者/贡献者 | 每日 (CI 通过) | 高 |

### 灰度发布流程

```
v3.2.0-beta.1 → Beta 用户 (1 周)
    ↓ 无严重 bug
v3.2.0 Stable → 全量推送 (分 3 天)
    ├─ Day 1: 20% 用户
    ├─ Day 2: 50% 用户
    └─ Day 3: 100% 用户
```

### 回滚策略

- 更新服务器支持版本回退 (保留最近 3 个版本)
- 用户可在设置中选择"回退到上一版本"
- 自动更新失败率 > 5% 时暂停推送

---

## 相关文档

- 开发方案: [11-prd-task-构建发布与安全](../../devs/2026-09/11-prd-task-构建发布与安全.md)
- 测试方案: [11-prd-test-构建发布与安全](../../tests/2026-09/11-prd-test-构建发布与安全.md)
- 自动更新: [26-prd-自动更新](./26-prd-自动更新.md)
- 安全加密存储: [27-prd-安全加密存储](./27-prd-安全加密存储.md)
- macOS 平台适配: [49-prd-macOS平台适配](./49-prd-macOS平台适配.md)
- Wndows/Linux 平台适配: [50-prd-WindowsLinux平台适配](./50-prd-WindowsLinux平台适配.md)