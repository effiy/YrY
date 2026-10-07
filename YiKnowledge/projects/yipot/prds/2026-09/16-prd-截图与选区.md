---
doc_type: prd
title: "YP-09-S05: 截图与选区交互"
tags: [需求文档, 截图, 选区, 交互]
category: 项目/桌面应用/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S05
estimate_frontend: 2.0
review_status: 已发布
issue_type: 功能
roles: [engineer]
---

# YP-09-S05: 截图与选区交互

> 需求编号：YP-09-S05 · 优先级：P0 · 人天：2.0d · 状态：已完成

## 背景

截图是 OCR 和截图翻译的前置步骤。macOS 使用系统 screencapture 命令，Win/Linux 使用自定义全屏截图窗口。

## 需求

### macOS 截图

```rust
// 使用系统 screencapture 命令
std::process::Command::new("/usr/sbin/screencapture")
    .arg("-i")   // 交互模式（手动框选）
    .arg("-r")   // 不播放音效
    .arg(path)   // 保存路径
    .output()
```

### Win/Linux 截图窗口

`YiPot/src/window/Screenshot/index.jsx`:
- 全屏半透明遮罩
- Canvas 绘制选区
- 拖拽创建选区矩形
- 支持 Esc 取消 / Enter 确认
- 选区高亮 + 尺寸标注

### 截图窗口特性

- 全屏 + 置顶 + 无边框
- 跳过任务栏
- Esc 关闭截图窗口

### 图片处理

- 截图保存为 PNG
- 转 base64 传递给 OCR 服务
- 支持裁剪前预览

## 验收标准

- [ ] macOS: screencapture -i 正常截取
- [ ] Win/Linux: 框选正确，选区边界清晰
- [ ] Esc 取消截图，无残留窗口
- [ ] Enter 确认截图，传递图片给 OCR
- [ ] 多显示器下截取正确显示器内容

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | macOS screencapture 截图耗时 | ≤ 500ms（从触发到文件就绪） | 50 次计时取 P95 | P0 |
| AC-02 | Win/Linux Canvas 选区渲染帧率 | ≥ 30 FPS（拖拽选区时） | requestAnimationFrame 监测 | P0 |
| AC-03 | 截图窗口打开速度 | ≤ 300ms（快捷键到全屏遮罩显示） | 50 次计时取 P95 | P0 |
| AC-04 | 选区精度 | 像素级精确（±1px） | 对比截图原始坐标 | P1 |
| AC-05 | PNG 转换耗时 | ≤ 100ms（截图到 base64） | Canvas toDataURL 计时 | P1 |
| AC-06 | Esc 取消窗口关闭 | ≤ 100ms（按键到窗口消失） | 计时测试 | P1 |
| AC-07 | 多显示器截图准确率 | 100%（各显示器均可独立截取） | 双屏/三屏环境全覆盖测试 | P1 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| macOS screencapture 失败 | 异常 | 显示错误并回退到自定义截图窗口 | macOS 无屏幕录制权限时引导授权 |
| 截图区域过小 (< 10x10px) | 边界 | 取消截图，无操作 | — |
| 切换显示器时截图窗口 | 边界 | 截图窗口覆盖所有显示器 | — |
| 截图过程按 Ctrl+C | 边界 | 忽略，截图窗口保持 Esc 取消 | — |
| 截图文件写入失败 | 异常 | 提示"截图保存失败，磁盘空间不足？" | 使用内存缓存 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 截图 PNG 编码 | ≤ 100ms (1920x1080) | 编码计时 |
| 性能 | 截图窗口渲染 | ≤ 50ms（全屏遮罩） | React Profiler |
| 可用性 | 选区拖拽帧率 | 60fps | Canvas 帧率监测 |
| 兼容性 | macOS 权限检测 | screencapture 错误码判断 | 无权限时引导 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | macOS screencapture | Rust Command | PNG 文件路径 |
| 依赖 | 自定义截图窗口 (Canvas) | React 组件 | 选区坐标 (x, y, w, h) |
| 依赖 | Rust window 模块 | Tauri builder | 全屏截图窗口创建 |
| 被依赖 | OCR 服务插件 | PNG bytes → base64 | ImageBase64 |

---

## 相关文档

- 开发方案: [16-prd-task-截图与选区](../../devs/2026-09/16-prd-task-截图与选区.md)
- 测试方案: [16-prd-test-截图与选区](../../tests/2026-09/16-prd-test-截图与选区.md)
- OCR 与截图识别: [02-prd-OCR与截图识别](./02-prd-OCR与截图识别.md)
- Rust 截图模块: [42-prd-Rust截图OCR语言检测](./42-prd-Rust截图OCR语言检测.md)