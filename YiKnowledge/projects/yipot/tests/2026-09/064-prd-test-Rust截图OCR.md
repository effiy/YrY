---

doc_type: test
title: "Rust 截图/OCR/语言检测 — 测试方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["42-prd-Rust截图OCR语言检测"]
source_modules: ["42-prd-Rust截图OCR语言检测"]

type: test
---

# Rust 截图/OCR/语言检测 — 测试方案

> 覆盖 YP-09-R03：`screenshot.rs` 全平台截图、`system_ocr.rs` 系统原生 OCR、`lang_detect.rs` 语言检测

---

## 一、核心功能测试

### 1.1 截图 (screenshot.rs)

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-SCR-001 | macOS 截图 | 调用 screenshot() | 返回 PNG 字节流 |
| TC-SCR-002 | Windows 截图 | 调用 screenshot() (BitBlt) | 返回 PNG/BMP 字节流 |
| TC-SCR-003 | Linux xdg-screenshot | 调用 screenshot() | 返回 PNG 字节流 |
| TC-SCR-004 | Linux grim | Wayland 环境调用 screenshot() | 返回 PNG 字节流 |
| TC-SCR-005 | 多显示器截图 | 双显示器 → 调用 screenshot() | 跨越所有屏幕的全屏截图 |
| TC-SCR-006 | Retina 显示器 | macOS Retina → screenshot() | 正确获取 2x 分辨率截图 |

### 1.2 系统 OCR (system_ocr.rs)

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-SYSOCR-001 | macOS 中文 OCR | 传入中文截图 → system_ocr("zh") | 返回中文识别文字 |
| TC-SYSOCR-002 | macOS 英文 OCR | 传入英文截图 → system_ocr("en") | 返回英文识别文字 |
| TC-SYSOCR-003 | Windows 中文 OCR | Windows → system_ocr("zh") | 返回中文识别文字 |
| TC-SYSOCR-004 | Windows 英文 OCR | Windows → system_ocr("en") | 返回英文识别文字 |
| TC-SYSOCR-005 | Linux 不可用 | Linux → system_ocr("zh") | 返回 Err("Not available") |
| TC-SYSOCR-006 | 离线可用 | 断网 → system_ocr() | 正常识别（系统原生） |

### 1.3 语言检测 (lang_detect.rs)

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-LD-001 | 检测中文 | lang_detect("你好世界") | 返回 "zh" |
| TC-LD-002 | 检测英文 | lang_detect("Hello World") | 返回 "en" |
| TC-LD-003 | 检测日文 | lang_detect("こんにちは") | 返回 "ja" |
| TC-LD-004 | 检测韩文 | lang_detect("안녕하세요") | 返回 "ko" |
| TC-LD-005 | 检测中英混合 | lang_detect("Hello 你好") | 返回主导语言 |
| TC-LD-006 | 短文本检测 | lang_detect("OK") (2 字符) | 返回合理检测结果或 "unknown" |
| TC-LD-007 | 准确率验证 | 100 种语言各 50 条样本 | 准确率 > 90% |

---

## 二、边界与异常测试

| 编号 | 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|------|----------|----------|----------|
| TC-SCR-EDGE-01 | macOS 截图权限未授权 | 系统设置拒绝屏幕录制 | 返回错误，提示用户授权 | 引导到系统偏好设置 |
| TC-SCR-EDGE-02 | Windows BitBlt 失败 | 锁屏/远程桌面 | 返回空或错误 | 提示当前不可用 |
| TC-SCR-EDGE-03 | Linux wayland 权限 | 未授权 screencopy | 返回错误 | 提示设置环境变量 |
| TC-SCR-EDGE-04 | 系统 OCR 空图片 | 纯白图片 → system_ocr() | 返回空字符串或"未检测到文字" | — |
| TC-SCR-EDGE-05 | 系统 OCR 大图片 | 8K 分辨率截图 | 正常处理，不 OOM | Rust 层 buffer 管理 |
| TC-SCR-EDGE-06 | 语言检测空字符串 | lang_detect("") | 返回 "unknown" 或空 | 不崩溃 |
| TC-SCR-EDGE-07 | 语言检测纯数字 | lang_detect("12345") | 返回 "unknown" | — |
| TC-SCR-EDGE-08 | 模型初始化失败 | franc/CLD3 模型文件不存在 | 返回错误，不启动语言检测 | 提示缺少模型 |

---

## 三、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-SCR-PERF-01 | 截图 (macOS) | 2560x1600 全屏 | < 500ms | > 1s | CGWindowListCreateImage |
| TC-SCR-PERF-02 | 截图 (Windows) | 1920x1080 全屏 | < 300ms | > 800ms | BitBlt + GDI |
| TC-SCR-PERF-03 | 截图 (Linux) | 1920x1080 全屏 | < 500ms | > 1s | xdg-screenshot/grim |
| TC-SCR-PERF-04 | 系统 OCR (macOS) | 含 50 字文字区域 | < 500ms | > 1.5s | macOS Vision |
| TC-SCR-PERF-05 | 系统 OCR (Windows) | 含 50 字文字区域 | < 500ms | > 1.5s | Windows OCR |
| TC-SCR-PERF-06 | 语言检测 | 100 字文本 | < 10ms | > 50ms | franc/CLD3 |
| TC-SCR-PERF-07 | 语言检测初始化 | 模型加载 | < 2s | > 5s | 应用启动时 |

---

## 四、平台兼容测试

| 编号 | 测试项 | 测试平台 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SCR-PLT-01 | macOS 截图 (CGWindowList) | macOS 13+ | 正常返回 PNG | P0 |
| TC-SCR-PLT-02 | macOS OCR (Vision) | macOS 13+ | 中英文识别正确 | P0 |
| TC-SCR-PLT-03 | Windows 截图 (BitBlt) | Windows 10/11 | 正常返回数据 | P0 |
| TC-SCR-PLT-04 | Windows OCR (WinRT) | Windows 10/11 | 中英文识别正确 | P0 |
| TC-SCR-PLT-05 | Linux 截图 (xdg/grim) | Ubuntu/Fedora | 正常返回 PNG | P1 |
| TC-SCR-PLT-06 | Linux OCR 不可用 | Linux | 返回 "Not available" 不崩溃 | P1 |
| TC-SCR-PLT-07 | 多显示器拼接 | macOS/Windows | 截图覆盖所有屏幕 | P1 |

---

## 五、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-SCR-01 | macOS 截图 PNG 字节流 | 截图 | 否 | P0 |
| REG-SCR-02 | Windows 截图正确 | 截图 | 否 | P0 |
| REG-SCR-03 | macOS 系统 OCR 离线可用 | system_ocr | 否 | P0 |
| REG-SCR-04 | Windows 系统 OCR 离线可用 | system_ocr | 否 | P0 |
| REG-SCR-05 | 中文语言检测 "zh" | lang_detect | 否 | P1 |
| REG-SCR-06 | 英文语言检测 "en" | lang_detect | 否 | P1 |
| REG-SCR-07 | 日/韩语言检测 | lang_detect | 否 | P2 |
| REG-SCR-08 | 语言检测准确率 > 90% | lang_detect | 否 | P1 |
| REG-SCR-09 | Linux OCR 返回 "Not available" | system_ocr | 否 | P2 |

---

## 六、参考文档

- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — 源 PRD
- [32-prd-百度腾讯OCR](../prds/2026-09/32-prd-百度腾讯OCR.md) — 在线 OCR 服务（与系统 OCR 互补）
- [33-prd-讯飞合合火山OCR](../prds/2026-09/33-prd-讯飞合合火山OCR.md) — 在线 OCR 服务
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 结果展示 UI
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 翻译窗口使用语言检测