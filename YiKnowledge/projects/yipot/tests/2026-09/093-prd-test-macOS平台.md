---

doc_type: test
title: "macOS 平台 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["49-prd-macOS平台适配"]
source_modules: ["49-prd-task-macOS平台适配"]

type: test
---

# macOS 平台 — 测试方案

| 编号 | 用例 | 预期 |
|------|------|------|
| TC-MAC-01 | screencapture 截图 | 正常 |
| TC-MAC-02 | Vision OCR 离线 | < 200ms |
| TC-MAC-03 | 无 Dock 图标 | Activity Monitor 验证 |
| TC-MAC-04 | 辅助功能权限 | 首次引导授权 |
| TC-MAC-05 | 公证通过 | spctl 验证 |
| TC-MAC-06 | M 芯片兼容 | arm64 原生运行 |

## 系统版本

| 版本 | 状态 |
|------|------|
| macOS 12 | ✓ |
| macOS 13 | ✓ |
| macOS 14 | ✓ |
| macOS 15 | ✓ |

## 边界与异常测试

| 场景 | 操作步骤 | 预期结果 |
|------|----------|----------|
| 首次启动无辅助功能权限 | 首次安装后直接打开 | 弹授权引导窗口，不崩溃 |
| screencapture 被其他应用占用 | 同时运行多个截图工具 | 超时或有友好提示 |
| Vision OCR 处理非文字区域 | 截图纯色块/图标区域 | 返回空字符串 + 置信度 = 0 |
| 低电量模式 (Low Power Mode) | macOS 系统设置启用低电量模式 | 非必要动画和轮询自动禁用 |
| 多桌面 (Mission Control Space) 切换 | 翻译窗口在 Space 1，切换到 Space 2 | 窗口跟随或保持在原 Space |
| App Nap 触发 | 翻译窗口长时间后台 | 翻译任务不被系统挂起 |
| Retina 显示器 (2x/3x DPI) | 外接 Retina 显示器 | 窗口无模糊，截图分辨率正确 |
| M 芯片 Rosetta 模式 | 强制以 Rosetta 运行 x86_64 构建 | 功能正常但性能降低（标记警告） |

## 性能基准测试

| 场景 | 测试方法 | 基准 |
|------|----------|------|
| Vision OCR 离线识别 | 200x100 区域截图 | < 200ms |
| screencapture 选区截图 | 从调用到文件落盘 | < 500ms |
| 窗口弹出动画（Metal 加速） | `requestAnimationFrame` 帧率 | 60fps 稳定 |
| 通用二进制 (universal) 启动 | arm64/x86_64 分别 `time` 测量 | < 1s |
| 内存占用（空闲状态） | `Activity Monitor` 查看 | < 150MB |

## 回归测试清单

- [ ] macOS 12/13/14/15 四个系统版本均可运行
- [ ] M1/M2/M3/M4 芯片原生 arm64 运行
- [ ] Intel Mac x86_64 正常运行
- [ ] 公证 (notarization) 通过 `spctl -a -v` 验证
- [ ] 辅助功能权限引导流程完整可用
- [ ] Dock 图标隐藏且托盘图标正常