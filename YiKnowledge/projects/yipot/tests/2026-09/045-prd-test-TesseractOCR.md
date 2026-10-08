---

doc_type: test
title: "Tesseract.js 离线 OCR — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["23-prd-Tesseract离线OCR"]
source_modules: ["17-prd-task-系统OCR"]

type: test
---

# Tesseract.js 离线 OCR — 测试方案

## 核心功能测试

| 编号 | 用例 | 操作 | 预期 |
|------|------|------|------|
| TC-TES-01 | 英文识别 | Tesseract.recognize(英文截图, "eng") | 正确识别英文，准确率 ≥ 95% |
| TC-TES-02 | 中文识别 | Tesseract.recognize(中文截图, "chi_sim") | 正确识别中文，准确率 ≥ 90% |
| TC-TES-03 | 中英混合 | Tesseract.recognize(中英混合截图, "eng+chi_sim") | 两种语言均识别 |
| TC-TES-04 | 日文识别 | Tesseract.recognize(日文截图, "jpn") | 正确识别日文 |
| TC-TES-05 | 韩文识别 | Tesseract.recognize(韩文截图, "kor") | 正确识别韩文 |
| TC-TES-06 | 语言包自动下载 | 首次使用 "fra" (法语) | 自动下载法语语言包，WASM 加载 |
| TC-TES-07 | 语言包缓存 | 第二次使用同一语言 | 不重新下载，直接使用缓存 |
| TC-TES-08 | 无需 Rust FFI | 纯前端运行 | 浏览器环境直接调用 Tesseract.js |
| TC-TES-09 | 识别结果可翻译 | Tesseract 结果 → 翻译服务 | OCR 文本作为翻译输入 |
| TC-TES-10 | Linux 平台可用 | Linux 环境 → Tesseract OCR | 正常识别 (无系统 OCR 时的唯一方案) |
| TC-TES-11 | 多语言组合 | "eng+chi_sim+jpn" | 三种语言按顺序尝试识别 |

## 增强边界与异常测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-TES-E01 | 空白截图 | 无文字图片 | 返回空字符串或低置信度结果 | P1 |
| TC-TES-E02 | 语言包下载失败 | 网络断开 + 首次使用新语言 | 提示"语言包下载失败"，不崩溃 | P1 |
| TC-TES-E03 | WASM 加载失败 | 模拟加载错误 | 提示"OCR 引擎加载失败" | P1 |
| TC-TES-E04 | 超大图片 (8K) | 7680x4320 截图 | 耗时 ≤ 3s，识别正常 | P2 |
| TC-TES-E05 | 极小图片 (< 50px) | 50x50 截图 | 尽力识别，可能失败 | P3 |
| TC-TES-E06 | 不支持的 language code | "xyz" | 提示不支持该语言 | P1 |
| TC-TES-E07 | 连续识别 (10 次) | 连续 10 次 Tesseract.recognize | 每次独立返回，不崩溃 | P1 |
| TC-TES-E08 | 低质量截图 | 模糊/JPEG 压缩严重 | 尽力识别，准确率降低 | P2 |
| TC-TES-E09 | 识别中关闭窗口 | 识别进行中 → 关闭窗口 | Worker 终止，无后台残留 | P1 |
| TC-TES-E10 | WASM 内存占用 | 连续识别 5 次 | Worker 不内存泄漏 | P1 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-TES-P01 | 英文识别 (400x300) | P50/P95 | ≤ 800/1500ms | > 1500/3000ms | 30 次采样 |
| TC-TES-P02 | 中文识别 (400x300) | P50/P95 | ≤ 1000/2000ms | > 2000/4000ms | 30 次采样 |
| TC-TES-P03 | 中英混合识别 | P50 | ≤ 1500ms | > 3000ms | 20 次采样 |
| TC-TES-P04 | 语言包首次下载 | 下载时间 | ≤ 30s | > 60s | 各语言包测量 |
| TC-TES-P05 | 语言包缓存命中 | 加载时间 | ≤ 500ms | > 1000ms | 10 次命中 |
| TC-TES-P06 | WASM 运行内存 | 识别时峰值内存 | ≤ 100MB | > 200MB | Memory Profiler |
| TC-TES-P07 | 准确率 (英文) | 字符级 CER | ≤ 3% | > 8% | 100 样本 |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-TES-S01 | WASM 沙箱 | 检查 Tesseract Worker | 前端隔离运行，无系统访问 | P1 |
| TC-TES-S02 | 截图不发送网络 | 断网 + Tesseract → 抓包 | 无网络请求 | P0 |
| TC-TES-S03 | Worker 资源清理 | 识别完成 → 检查 Workers | Worker 已 terminate | P2 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-TES-01 | 英文图片识别 | 核心识别 | 否 | P0 |
| REG-TES-02 | 中英混合识别 | 多语言 | 否 | P0 |
| REG-TES-03 | 语言包自动下载 | 语言包管理 | 否 | P1 |
| REG-TES-04 | Linux 平台可用 | 平台兼容 | 否 | P1 |
| REG-TES-05 | 识别→翻译链路 | 集成 | 否 | P1 |
| REG-TES-06 | 下载失败降级处理 | 错误处理 | 否 | P1 |

## 参考文档

- [Tesseract 离线 OCR PRD](../../prds/2026-09/23-prd-Tesseract离线OCR.md)
- [系统 OCR 离线识别 PRD](../../prds/2026-09/22-prd-系统OCR离线识别.md)
- [系统 OCR 测试](044-prd-test-系统OCR离线.md)
- [OCR 服务接口测试](005-prd-test-OCR服务接口.md)