---

doc_type: module
prd_task_id: "YP-09-S05"
title: "截图与选区 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "16-prd-截图与选区.md"

type: task
---

# 截图与选区 — 开发方案

## macOS

```rust
// 使用系统 screencapture 命令
std::process::Command::new("/usr/sbin/screencapture")
    .arg("-i").arg("-r").arg(path)
    .output()
```

## Win/Linux 截图窗口

`YiPot/src/window/Screenshot/index.jsx`:
- 全屏半透明遮罩 Canvas
- 拖拽选区 + 尺寸标注
- Esc 取消 / Enter 确认

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| macOS | screencapture 系统命令 | 原生体验最佳 |
| Win/Linux | 自绘全屏窗口 + Canvas | 跨平台统一，自定义UI |


## 性能优化

| 优化点 | 优化手段 | 预期收益 | 实测数据 |
|--------|---------|---------|---------|
| Canvas 选区渲染 | requestAnimationFrame 驱动绘制 (仅 mousemove 时触发) | 非拖拽时 CPU 0% | — |
| 截图格式 | PNG (无损压缩) 保证 OCR 识别准确率 | OCR 精度不受压缩影响 | — |
| 临时文件清理 | 启动时自动清理 `pot_screenshot_*.png` (7 天前) | 零磁盘碎片积累 | — |
| 图片传输 | base64 内嵌直接传递 (免文件 I/O) | OCR 接口调用 -10ms | — |
| OffscreenCanvas | 离屏 Canvas 渲染选区 (不阻塞主线程) | FPS 稳定 60 | — |
| macOS screencapture | `-x` 参数跳过后台处理 | 截图完成时间 -100ms | — |
| 多显示器全屏 | Tauri 窗口仅当前显示器全屏 (非跨屏) | 窗口创建 -20ms | — |

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-macOS | screencapture 命令不存在 | 降级到 WebView 截图窗口 | 自动降级 | "系统截图不可用，已切换内置截图" |
| L1-macOS | Accessibility 权限未授予 (TCC) | 提示用户开启权限 → 降级到 WebView 截图 | 用户授权或使用内置截图 | "请在系统偏好设置中允许辅助功能权限" |
| L1-Linux | WebKitGTK 不支持透明窗口 (Wayland) | 降级为白色背景遮罩 | 自动降级 | 截图遮罩效果不同于 macOS/Windows |
| L2-选区 | 选区尺寸为 0 (未拖拽) | 阻止 Enter 确认，无操作 | 用户拖拽后重试 | 无响应 (Enter 无效) |
| L2-选区 | Canvas getContext 失败 (GPU 资源不足) | 降级到 2D 软件渲染 | 自动降级 | 无感知 (性能略降) |
| L3-截图 | 截图保存失败 (磁盘空间不足) | Toast 提示，保留截图窗口 | 用户清理磁盘后重试 | "磁盘空间不足，无法保存截图" |
| L3-截图 | 截图全黑/全白 (显示器关闭) | 亮度检测 (avg < 5 or > 250) → 提示异常 | 用户重试 | "截图内容异常，请确认显示器已开启" |
| L4-清理 | 临时文件清理失败 (文件被占用) | 跳过 + 日志，下次启动重试 | 自动重试 | 无感知 |

## 跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 截图方式 | 系统 screencapture 命令 (原生十字光标) | 自定义 WebView 全屏 Canvas 窗口 | 同 Windows |
| 截图窗口 | 不创建 (系统接管) | `fullscreen + always_on_top + transparent` | 同 Windows，需合成器支持 |
| 透明窗口 | N/A | SetLayeredWindowAttributes API | X11: composite 扩展 / Wayland: wlroots |
| 多显示器 | screencapture -i 默认当前显示器 | 全屏窗口限定当前显示器 | 同 Windows |
| 截图音效 | `-r -x` 参数静音 | 无音效 | 无音效 |
| 权限要求 | Accessibility (TCC) | 无 | 无 |
| 选区触发 | 系统十字光标拖拽 | Canvas mousedown/mousemove/mouseup | 同 Windows |
| Esc 取消 | screencapture 内置取消 | keydown Escape → 关闭窗口 | 同 Windows |
| 临时文件路径 | `$TMPDIR` | `%TEMP%` | `/tmp` |
| Wayland 兼容 | N/A | N/A | 需 compositor 支持透明窗口 + 全屏置顶 |

**关联文档**：
- [OCR 识别架构](./02-prd-task-OCR识别架构.md) — 截图后 OCR 处理流程
- [React 组件与窗口架构](./10-prd-task-React组件与窗口架构.md) — Screenshot 窗口注册
- [窗口定位](./14-prd-task-窗口定位.md) — 截图窗口显示位置
- 源 PRD：[16-prd-截图与选区.md](../../prds/2026-09/16-prd-截图与选区.md)