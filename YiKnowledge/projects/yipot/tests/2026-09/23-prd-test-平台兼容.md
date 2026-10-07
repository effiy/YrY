---

doc_type: test
title: "平台兼容 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["49-prd-macOS平台适配", "50-prd-WindowsLinux平台适配"]

type: test
---

# 平台兼容 — 测试方案

## macOS

### TC-MAC-001: 截图

| 步骤 | 快捷键截图 OCR |
| 预期 | screencapture -i 正常工作 |

### TC-MAC-002: Dock 图标

| 步骤 | 启动 → 关闭所有窗口 |
| 预期 | Dock 不显示图标，仅托盘 |

### TC-MAC-003: 公证

| 步骤 | `spctl -a -v Pot.app` |
| 预期 | "accepted" + notarization 通过 |

## Windows

### TC-WIN-001: 截图窗口

| 步骤 | 快捷键截图 OCR |
| 预期 | 全屏截图窗口正常 |

### TC-WIN-002: MSI 安装

| 步骤 | 安装 .msi → 启动 |
| 预期 | 正常运行 |

## Linux

### TC-LNX-001: Wayland

| 步骤 | `echo $XDG_SESSION_TYPE` = wayland → 运行 |
| 预期 | 快捷键和窗口正常 |

### TC-LNX-002: 系统托盘

| 步骤 | 启动 → 检查托盘图标 |
| 预期 | libayatana-appindicator 托盘正常 |

---

## 增强边界与异常测试

### 边界值测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-EDGE-01 | macOS HiDPI/Retina 缩放 | 2x/3x 缩放 → 截图 OCR | 截图分辨率正确，无模糊或截断 | P1 |
| TC-EDGE-02 | Windows 高 DPI 缩放 | 150%/200% 缩放 → 翻译窗口 | 窗口和文字不模糊，尺寸正确 | P1 |
| TC-EDGE-03 | Linux 多 DE (GNOME/KDE/XFCE) | 切换桌面环境后启动 | 托盘图标在各 DE 中正常显示 | P2 |
| TC-EDGE-04 | macOS 多桌面/Spaces | 在桌面 2 使用 → 切换到桌面 1 | 窗口跟随到当前桌面 | P2 |
| TC-EDGE-05 | Windows 虚拟桌面 | 虚拟桌面 1 打开窗口 → 切换到桌面 2 | 窗口跟随或正确隐藏 | P3 |
| TC-EDGE-06 | 不同系统语言环境 | 系统语言 zh-CN / en-US / ja-JP | UI 文字正确显示，不出现乱码或截断 | P1 |
| TC-EDGE-07 | macOS 深色/浅色模式切换 | 使用中切换系统外观 | 实时跟随系统主题，颜色正确 | P2 |
| TC-EDGE-08 | 低分辨率屏幕 (1366x768) | 小屏幕设备使用浮窗 | 窗口自适应，不超出可见区域 | P2 |

### 异常场景测试

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-01 | macOS 辅助功能权限未授予 | 首次启动不授权辅助功能 | 截图/划词提示需要权限，引导到系统设置 | 授权后功能正常 |
| TC-ERR-02 | macOS Gatekeeper 阻止启动 | 未签名的 App 直接启动 | 提示"无法验证开发者"，引导用户手动允许 | 系统设置允许后正常 |
| TC-ERR-03 | Windows 杀毒软件误报 | Windows Defender 隔离 exe | 签名/白名单后不再误报 | — |
| TC-ERR-04 | Linux Wayland 截图权限 | Wayland + 未授权 screencopy | 提示"Wayland 下截图需要额外授权" | 安装 xdg-desktop-portal 后正常 |
| TC-ERR-05 | Linux AppImage 权限不足 | 未 chmod +x 直接运行 | 提示"无执行权限" | chmod +x 后正常 |
| TC-ERR-06 | 系统语言包缺失字体 | 语言设中文但无中文字体 | 使用后备字体，不显示方框 (tofu) | 安装字体后正常 |
| TC-ERR-07 | macOS 全屏应用模式 | 全屏应用中使用快捷键 | 窗口在正确的屏幕层级弹出 | — |
| TC-ERR-08 | Windows 平板模式 | Surface 平板模式使用 | 触控翻译按钮可用，窗口尺寸适配触摸 | — |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | macOS 冷启动 | 首次启动到托盘图标 | ≤ 2s | > 4s | MacBook Pro M1 基准 |
| TC-PERF-02 | Windows 冷启动 | 首次启动到托盘图标 | ≤ 3s | > 5s | i5-12400 基准 |
| TC-PERF-03 | Linux 冷启动 | 首次启动到托盘图标 | ≤ 3s | > 5s | Ubuntu 22.04 基准 |
| TC-PERF-04 | macOS 截图延迟 | screencapture -i 完成 | ≤ 200ms | > 500ms | 含系统截图工具启动 |
| TC-PERF-05 | 跨平台内存基线对比 | 空闲 RSS (macOS/Win/Linux) | ≤ 80/100/90MB | > 150/180/160MB | 相同版本三平台对比 |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | macOS 代码签名验证 | `codesign -dvvv Pot.app` | 包含有效签名 + Hardened Runtime | P0 |
| TC-SEC-02 | macOS 公证验证 | `spctl -a -v Pot.app` | "accepted"，无公证拒绝 | P0 |
| TC-SEC-03 | Windows 数字签名 | 检查 .exe 属性 → 数字签名 | 含有效 Authenticode 签名 | P1 |
| TC-SEC-04 | Linux AppImage 校验 | sha256sum 对比发布页 | 提供 checksum 文件供用户验证 | P2 |
| TC-SEC-05 | 平台特定沙箱限制 | 检查应用访问的路径/权限 | 仅访问必要的系统 API，不超过声明权限 | P1 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 优先级 |
|------|---------|---------|--------|
| REG-01 | macOS 截图 OCR 正常 | macOS 核心 | P0 |
| REG-02 | macOS 托盘 + 无 Dock 图标 | macOS 外观 | P1 |
| REG-03 | Windows 截图窗口正常 | Windows 核心 | P0 |
| REG-04 | Linux Wayland 快捷键正常 | Linux 核心 | P1 |
| REG-05 | 三平台快捷键修饰键正确 | 跨平台一致性 | P1 |
| REG-06 | macOS 公证通过 | 分发合规 | P0 |

## 参考文档

- [macOS 适配 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/49-prd-macOS平台适配.md)
- [Windows/Linux 适配 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/50-prd-WindowsLinux平台适配.md)
- [快捷键测试](17-prd-test-快捷键.md)