---

doc_type: test
title: "九月迭代总览 — 测试策略"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-22
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["00-prd-需求总览"]
source_modules: ["00-prd-task-需求总览"]

type: test
---

# 九月迭代总览 — 测试策略

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试分层

| 层级 | 工具 | 覆盖 |
|------|------|------|
| L1 单元 | Vitest (React) + cargo test (Rust) | 工具函数、服务层、Rust 模块 |
| L2 集成 | Vitest + Tauri mock | 前后端通信、快捷键流程 |
| L3 E2E | 手动测试矩阵 | 全平台完整链路 |
| L4 平台兼容 | 真机测试 | Windows/macOS/Linux |

## 核心用例

| 模块 | 关键用例 | 优先级 |
|------|---------|--------|
| 划词翻译 | 选中文本 → 快捷键 → 翻译结果展示 | P0 |
| 剪切板监听 | 复制文本 → 自动触发翻译 | P0 |
| 截图 OCR | 框选区域 → OCR 识别文字 | P0 |
| 截图翻译 | 框选区域 → OCR → 翻译 | P0 |
| 系统 OCR | 离线模式下 OCR 可用 | P1 |
| TTS 朗读 | 点击朗读 → 语音播放 | P1 |
| 生词本导出 | 收藏词汇 → Anki 导出 | P1 |
| 全局快捷键 | 快捷键注册与冲突检测 | P0 |
| 系统托盘 | 托盘图标与菜单功能 | P1 |
| 国际化 | 语言切换后 UI 一致 | P2 |
| 配置备份 | 导出 → 导入恢复 | P2 |

## 平台测试矩阵

| 测试项 | Windows 10 | Windows 11 | macOS 12+ | Linux (X11) | Linux (Wayland) |
|--------|-----------|-----------|-----------|-------------|-----------------|
| 划词翻译 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 截图 OCR | ✓ | ✓ | ✓ | ✓ | ✓ |
| 系统 OCR | ✓ | ✓ | ✓ | — | — |
| 系统托盘 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 快捷键 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 开机启动 | ✓ | ✓ | — | — | — |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 三大平台可正常构建和运行
- [ ] macOS 签名验证通过
- [ ] 无高危安全漏洞（API Key 加密存储）
- [ ] i18n 翻译覆盖率 > 80%

---

## 边界与异常测试

### 全应用异常场景

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-01 | 配置文损坏 | 手动篡改 JSON 配置文件 | 启动时显示配置恢复提示，回退默认配置 | 可重新配置服务 |
| TC-ERR-02 | 磁盘空间不足 | 填满磁盘 | 优雅提示空间不足，不损坏已有配置 | 清理空间后正常 |
| TC-ERR-03 | 系统休眠恢复 | 休眠 → 唤醒 | 托盘图标、快捷键全部恢复 | 所有功能正常 |
| TC-ERR-04 | VPN 切换 | 频繁切换 VPN 连接 | 翻译请求自动重试，无崩溃 | 连接恢复后正常 |
| TC-ERR-05 | 同时启动两个实例 | 双击启动两次 | 第二个实例显示"应用已在运行"或激活已有窗口 | 关闭一个后正常 |
| TC-ERR-06 | 系统语言切换 | 运行时切换系统语言 | i18n 不受影响（独立于系统语言） | UI 语言保持不变 |
| TC-ERR-07 | 权限撤销 | 运行时关闭辅助功能权限 | 下次划词翻译时提示重新授权 | 重新授权后恢复 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | 冷启动时间 | Time-to-Tray | ≤ 3s | > 5s | 系统启动后首次启动计时 |
| TC-PERF-02 | 热启动时间 | Time-to-Tray | ≤ 1s | > 2s | 关闭后立即重启 |
| TC-PERF-03 | 划词翻译端到端 | 选中到结果展示 | ≤ 1s | > 2s | 100 次采样取 P95 |
| TC-PERF-04 | 截图 OCR 全流程 | 快捷键到结果展示 | ≤ 2s | > 4s | 10 次采样取 P95 |
| TC-PERF-05 | 空闲内存占用 | RSS | ≤ 150MB | > 250MB | 启动后静置 30s 取样 |
| TC-PERF-06 | 活跃内存占用 | RSS | ≤ 350MB | > 500MB | 连续翻译 10 次后取样 |
| TC-PERF-07 | 空闲 CPU 占用 | CPU% | ≤ 1% | > 3% | Activity Monitor / 任务管理器 |
| TC-PERF-08 | 快捷键响应时延 | 按下到浮窗显示 | ≤ 200ms | > 500ms | 高速摄像 + 日志时间戳 |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | API Key 加密存储 | 检查配置存储文件 | API Key 不以明文存储，使用操作系统安全存储机制 | P0 |
| TC-SEC-02 | HTTPS 强制 | 抓包检查所有 API 请求 | 所有云端翻译/OCR 请求使用 HTTPS | P0 |
| TC-SEC-03 | 本地 HTTP 仅回环绑定 | 从其他设备尝试连接 127.0.0.1:60828 | 外部设备无法连接 | P0 |
| TC-SEC-04 | 翻译内容不入日志 | 翻译敏感文本后检查所有日志文件 | 翻译内容不出现 | P1 |
| TC-SEC-05 | 剪切板不残留 | 翻译完成后检查系统剪切板 | 翻译前的选中文本不被替换污染 | P1 |
| TC-SEC-06 | 本地 OCR 隐私 | 使用系统 OCR 时断网 | 截图像素不发送到网络 | P0 |
| TC-SEC-07 | 配置备份加密检查 | 导出配置后检查备份文件 | 可选加密备份（WebDAV/OSS 场景） | P2 |
| TC-SEC-08 | 剪切板监听时敏感数据 | 开启监听后复制密码/银行卡号 | 应可配置敏感数据类型不过滤（功能设计确认） | P2 |

## 回归测试清单

每次发布前必须通过的回归用例：

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-01 | 划词翻译基本流程 | 翻译核心 | 否 | P0 |
| REG-02 | 截图 OCR 识别 | OCR 核心 | 否 | P0 |
| REG-03 | 全局快捷键注册与触发 | 快捷键系统 | 否 | P0 |
| REG-04 | 多接口并行翻译 | 翻译调度 | 否 | P0 |
| REG-05 | 剪切板监听开/关 | 剪切板监听 | 否 | P0 |
| REG-06 | 系统托盘图标与菜单 | 桌面集成 | 否 | P1 |
| REG-07 | i18n 语言切换 | 国际化 | 否 | P1 |
| REG-08 | 主题切换（浅/深/跟随系统） | 主题系统 | 否 | P1 |
| REG-09 | 配置导出/导入 | 配置管理 | 否 | P1 |
| REG-10 | 系统 OCR 离线可用 | OCR 离线 | 否 | P1 |
| REG-11 | TTS 朗读功能 | 语音合成 | 否 | P2 |
| REG-12 | 自动更新检查 | 更新系统 | 否 | P2 |
| REG-13 | 外部 HTTP 服务启动 | 外部调用 | 否 | P2 |
| REG-14 | macOS/Windows/Linux 构建 | 构建系统 | 否 | P1 |

---

## 参考文档

- [需求总览 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/00-prd-需求总览.md)
- [翻译核心测试](001-prd-test-翻译核心.md)
- [OCR 识别测试](002-prd-test-OCR识别.md)
- [桌面集成测试](003-prd-test-桌面集成.md)
- [快捷键系统测试](017-prd-test-快捷键.md)

---

## 测试环境配置矩阵

### 物理测试机一览

| 环境 | 操作系统 | 硬件规格 | 必备工具 | 用途 |
|------|---------|---------|---------|------|
| **macOS-A** (主力) | macOS 15 Sequoia (Apple Silicon) | M3 Max / 36GB RAM / 1TB SSD | Xcode 16.0+, Command Line Tools, Rust 1.82+, Node 22 LTS, pnpm 9.x | 日常开发、签名公证验证、系统 OCR (Vision) 测试 |
| **macOS-B** (兼容) | macOS 12 Monterey (Intel) | Intel i7 / 16GB RAM / 512GB SSD | Xcode 14.3, Rust 1.82+, Node 22 LTS | 旧版本兼容性回归、Intel 架构构建 |
| **Windows-11** | Windows 11 24H2 | i7-13700K / 32GB RAM / RTX 4060 / 1TB NVMe | Visual Studio 2022 Build Tools, Rust 1.82+, Node 22 LTS, WiX Toolset 4 | Windows 平台主测试、MSI 安装包验证、Windows OCR API 测试 |
| **Windows-10** | Windows 10 22H2 | i5-10400 / 16GB RAM / 512GB SSD | Visual Studio 2022 Build Tools, Rust 1.82+, Node 22 LTS | Windows 旧版本兼容性回归 |
| **Linux-X11** | Ubuntu 24.04 LTS (GNOME/X11) | AMD Ryzen 5 / 16GB RAM / 256GB NVMe | build-essential, libgtk-3-dev, libwebkit2gtk-4.1-dev, librsvg2-dev, Rust 1.82+, Node 22 LTS | Linux X11 测试、剪贴板 (xclip)、热键 (XGrabKey) |
| **Linux-Wayland** | Fedora 40 (GNOME/Wayland) | AMD Ryzen 5 / 16GB RAM / 256GB NVMe | 同上 + libdecor-dev, wlr-protocols | Linux Wayland 测试、Portal API 截图、剪贴板 (wl-clipboard) |

### 虚拟化环境 (CI)

| 环境 | 操作系统 | Runner 规格 | 工具链 | 用途 |
|------|---------|------------|--------|------|
| **macOS-VM** (GitHub Actions) | macOS 14 (Apple Silicon M1) | 3 vCPU / 7GB RAM | Xcode 15.4, Rust stable (via rustup), Node 22 | macOS 构建验证、CI 签名 |
| **Windows-VM** | Windows Server 2025 | 4 vCPU / 8GB RAM | VS 2022, Rust stable, Node 22 | Windows 构建验证 |
| **Linux-VM** | ubuntu-24.04 | 4 vCPU / 8GB RAM | Rust stable, Node 22, webkit2gtk deps | Linux 构建验证 |

### 测试环境变量

| 变量名 | 含义 | 默认值 / CI 值 | 作用范围 |
|--------|------|----------------|---------|
| `POT_DEV_MODE` | 开发模式开关 | `true` (dev) / `false` (CI) | 启用 Mock 服务、禁用遥测 |
| `POT_MOCK_TRANSLATE` | 模拟翻译 API | `true` (CI) | 用静态响应替代真实 API 调用 |
| `POT_MOCK_OCR` | 模拟 OCR API | `true` (CI) | 用预置 OCR 结果替代云端 OCR |
| `POT_MOCK_TTS` | 模拟 TTS API | `true` (CI) | 跳过真实 TTS 合成 |

### Mock 服务

| Mock 服务 | 地址 | 模拟目标 | 使用场景 |
|-----------|------|---------|---------|
| **translate-mock** | `http://127.0.0.1:19999/translate` | 百度/Google/DeepL 翻译 API | 自动化集成测试、无 API Key 环境 |
| **ocr-mock** | `http://127.0.0.1:19999/ocr` | 百度 OCR/系统 OCR | 截图 OCR 集成测试 |
| **tts-mock** | `http://127.0.0.1:19999/tts` | 百度/Azure TTS | TTS 集成测试 |
| **anki-mock** | `http://127.0.0.1:8765` | AnkiConnect API | 生词本导出测试 |

Mock 服务特性:
- 支持预设响应（从测试数据目录加载预期结果 JSON）
- 支持延迟注入（模拟网络延迟: 100ms / 500ms / 2000ms）
- 支持错误注入（HTTP 429/503/超时，模拟服务降级）
- 请求断言（验证请求格式、参数、认证头）

---

## 测试数据策略

### 翻译测试语料（按语言）

#### 英文 to 中文 (主力语种)

| 分类 | 测试文本 | 预期 | 用途 |
|------|---------|------|------|
| 短文本 | `Hello World` | 你好世界 | 基本翻译、缓存命中 |
| 中文本 | `The quick brown fox jumps over the lazy dog.` | 那只敏捷的棕色狐狸跳过那只懒狗。 | 普通句子翻译 |
| 长文本 | 200 词英文段落 (lorem ipsum 语义化版本) | 对应中文段落 | 长文本性能、分块策略 |
| 专业术语 | `The convolutional neural network achieved 97.3% accuracy on ImageNet classification benchmark.` | 该卷积神经网络在 ImageNet 分类基准上达到了 97.3% 的准确率。 | 专业术语翻译质量 |
| 特殊字符 | `npm install --save-dev @anthropic-ai/sdk` | npm install --save-dev @anthropic-ai/sdk（代码不翻译） | 代码保留测试 |
| HTML 富文本 | `<p>The <b>critical</b> update must be applied <em>immediately</em>.</p>` | 关键更新必须立即应用（标签剥离后翻译） | 富文本翻译 |
| Markdown | `## Summary\n\nThe **API** returns a JSON response.` | ## 摘要\n\n该 API 返回 JSON 响应。 | Markdown 结构保留 |

#### 中文 to 英文

| 分类 | 测试文本 | 预期 | 用途 |
|------|---------|------|------|
| 短文本 | `你好` | Hello | 基本中译英 |
| 成语 | `画蛇添足` | adding legs to a snake (superfluous) | 成语翻译 |
| 古诗 | `床前明月光，疑是地上霜。` | Moonlight before my bed, like frost upon the ground. | 文学翻译 |
| 科技 | `该算法采用动态规划思想，时间复杂度为 O(n log n)。` | The algorithm uses dynamic programming with O(n log n) time complexity. | 技术文本 |

#### 日文 to/from 中文

| 分类 | 测试文本 | 预期 | 用途 |
|------|---------|------|------|
| 短句 | `こんにちは` | 你好 | 基本日译中 |
| 敬语 | `お世話になっております。` | 承蒙关照。 | 敬语翻译 |
| 技术用语 | `ソースコードをGitHubにプッシュしました。` | 已将源代码推送到 GitHub。 | 技术日语 |
| 汉字 + 假名 | `資料は明日までに提出してください。` | 请在明天之前提交资料。 | 汉字混合翻译 |

#### 韩文 to/from 中文

| 分类 | 测试文本 | 预期 | 用途 |
|------|---------|------|------|
| 短句 | `안녕하세요` | 你好 | 基本韩译中 |
| 长句 | `이 제품은 한국에서 가장 인기 있는 스마트폰입니다.` | 该产品是韩国最受欢迎的智能手机。 | 韩语长句翻译 |

#### RTL 语言测试

| 语言 | 测试文本 | 预期 | 用途 |
|------|---------|------|------|
| 阿拉伯语 | `مرحبا بالعالم` | Hello world（方向验证） | RTL 文本处理、布局验证 |
| 希伯来语 | `שלום עולם` | Hello world（方向验证） | RTL 文本处理 |

### OCR 测试图像

#### 截图类 (screenshot)

| 类型 | 图像内容 | 尺寸 | 预期字符数 | 测试重点 |
|------|---------|------|-----------|---------|
| **纯英文文本** | 白色背景黑色英文段落 | 800x400 | 300-500 字 | 拉丁字符识别精度 |
| **纯中文文本** | 白色背景黑色中文段落 | 800x400 | 200-350 字 | CJK 字符识别精度 |
| **中英混排** | 公众号文章截图 | 600x800 | 150+ 字中英混排 | 混合语言识别 |
| **代码截图** | VSCode 暗色主题代码 (TypeScript/Python) | 1200x800 | 50 行代码 | 代码字符识别、特殊符号保留 |
| **表格截图** | Excel 表格 (数字/中文/英文混排) | 1000x600 | 表格结构化 | 结构化内容识别 |
| **图表标注** | Figma 设计稿中的中文/英文文字标注 | 800x600 | 小字体/艺术字 | 非标准字体识别 |
| **PDF 截图** | 学术论文 PDF 二栏布局截图 | 1200x900 | 500+ 字 | 高密度文本、多栏布局 |
| **系统菜单** | Windows 右键菜单 / macOS 菜单栏 中文截图 | 300x500 | 菜单文本 | UI 文本识别 |

#### 照片类 (photo)

| 类型 | 图像内容 | 分辨率 | OCR 挑战 | 测试重点 |
|------|---------|--------|---------|---------|
| **文档翻拍** | 手机拍摄 A4 打印件 (倾斜 15度) | 12MP | 透视畸变 | 倾斜校正、去噪 |
| **名片** | 强光下拍摄的中英双语名片 | 8MP | 高光反射 | 高光抑制、小字识别 |
| **路牌** | 户外中文路牌 (阴天) | 8MP | 低对比度 | 自然场景文本检测 |
| **菜单** | 餐厅菜单 (日文/中文) | 8MP | 多字体混排 | 多种字体、竖排 vs 横排 |
| **书页** | 弯曲书页翻拍 | 12MP | 曲面变形 | 曲面校正、阴影去除 |
| **低光** | 傍晚室内拍摄的说明书 | 8MP | 高 ISO 噪点 | 低光降噪、对比度增强 |

#### 扫描件类 (scanned)

| 类型 | 图像内容 | DPI | 测试重点 |
|------|---------|-----|---------|
| **标准扫描** | 300 DPI 扫描合同 (中文) | 300 | 高 DPI 基准精度 |
| **低质量扫描** | 75 DPI 扫描传真件 | 75 (模拟传真) | 低分辨率识别极限 |
| **黑白文档** | 纯黑白扫描 (无灰度) 英文论文 | 200 | 二值化后字符粘连处理 |
| **斑驳旧文档** | 泛黄/有水渍的中文书信扫描 | 200 | 背景噪音、字符分割 |

### 边界与异常输入

#### 翻译输入边界

| 边界类型 | 具体输入 | 预期行为 |
|---------|---------|---------|
| **空字符串** | `""` | 不触发翻译，无报错 |
| **仅空格** | `"   "` | 不触发翻译 |
| **单字符** | `"a"` | 正常翻译（不因过短忽略） |
| **4096 字符** | 4096 字符中英文混排 | 正常翻译 (API 限制边界) |
| **4097 字符** | 4097 字符 | 截断或降级（分块策略） |
| **纯 Emoji** | `"😀🌍🔥"` | 返回原文或 "无法翻译" 提示 |
| **纯数字** | `"12345678"` | 返回原文 |
| **零宽字符** | 包含 `\u200B` (零宽空格) 的文本 | 正确忽略零宽字符，不影响翻译 |
| **Unicode 控制字符** | 包含 `\u0000` `\u001F` 的文本 | 过滤控制字符，不崩溃 |
| **SQL 注入尝试** | `"'; DROP TABLE users; --"` | 不执行，正常翻译或过滤 |
| **XSS 尝试** | `"<script>alert('xss')</script>"` | 标签转义，不执行脚本 |
| **连续换行 100 行** | 大量空行 + "Hello" + 大量空行 | 压缩空行，正常翻译 |

#### OCR 输入边界

| 边界类型 | 图像规格 | 预期行为 |
|---------|---------|---------|
| **全白图片** | 1920x1080 纯白 (#FFFFFF) | 返回 "未检测到文字" |
| **全黑图片** | 1920x1080 纯黑 (#000000) | 返回 "未检测到文字" |
| **1x1 像素** | 1x1 白色像素 | 不崩溃，返回空结果 |
| **超大图片** | 8192x8192 PNG (67MB) | 超时或降采样后处理 |
| **极低对比度** | 浅灰 (#EEE) 文字在白色 (#FFF) 背景上 | 尽力识别或提示对比度不足 |
| **文字与背景同色** | 白色文字在白色背景 | 正确返回 "未检测到文字" |
| **倒置文字** | 文字 180 度旋转 | 正确处理方向 |
| **竖排文字** | 中国传统竖排文本 | 正确识别竖排文字（中日） |
| **损坏图片** | 截断的 PNG/JPG 文件头 | 返回错误提示，不崩溃 |
| **非二进制文件** | 尝试发送文本文件作为 OCR 输入 | 格式校验失败提示 |

---

## 自动化测试架构

### 测试运行器配置

```
Vitest Config (前端 React 模块)
├── vitest.config.ts
│   ├── environment: 'jsdom'
│   ├── setupFiles: ['./tests/setup.ts']  ← Jotai store 重置 + i18next mock
│   ├── include: ['src/**/*.test.{ts,tsx}']
│   ├── coverage: v8 provider, thresholds 80/70/60
│   └── mock: ['src/i18n', 'src/api/tauri.ts']  ← Tauri bridge mock

cargo test Config (Rust 系统模块)
├── src-tauri/Cargo.toml [dev-dependencies]
│   ├── mockall (mock framework)
│   └── serial_test (串行测试避免全局状态污染)
├── 测试文件: src-tauri/src/**/*_test.rs
└── CI 命令: cargo test --manifest-path src-tauri/Cargo.toml -- --test-threads=1
```

### CI 集成 (GitHub Actions)

```yaml
# 触发条件
on:
  push:
    branches: [main, 'release/**']
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    name: "前端测试 (${{ matrix.os }})"
    strategy:
      matrix:
        os: [ubuntu-24.04, macos-14, windows-2025]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm test          # Vitest
      - run: pnpm tsc --noEmit  # TypeScript 类型检查

  test-rust:
    name: "Rust 测试 (${{ matrix.os }})"
    strategy:
      matrix:
        os: [ubuntu-24.04, macos-14, windows-2025]
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo test --manifest-path src-tauri/Cargo.toml

  build-check:
    name: "构建验证 (${{ matrix.os }})"
    strategy:
      matrix:
        os: [ubuntu-24.04, macos-14, windows-2025]
    steps:
      - run: cargo build --release  # 确保可编译

  lint:
    name: "代码质量"
    runs-on: ubuntu-24.04
    steps:
      - run: pnpm lint              # ESLint + Prettier
      - run: cargo clippy -- -D warnings
```

### 快照测试策略

| 测试对象 | 快照类型 | 更新策略 | 审查要求 |
|---------|---------|---------|---------|
| **翻译窗口组件** | React Testing Library `toMatchSnapshot()` | PR 审查时手动批准 diff | 每次 UI 改动需附带快照对比截图 |
| **OCR 结果浮窗** | 同上 | 同上 | 同上 |
| **设置页面** | 分模块快照 (通用/翻译/OCR/TTS 每组独立) | 同上 | 同上 |
| **系统托盘菜单** | HTML 结构快照 | 同上 | 仅结构，不含样式 |
| **i18n 翻译键完整性** | 代码扫描 `i18next-parser` 生成键值表 | 非快照，通过 GitHub Actions 检查 | 拒绝合并键缺失的 PR |

### 视觉回归测试

| 测试方法 | 工具 | 覆盖场景 | 执行频率 |
|---------|------|---------|---------|
| **像素级对比** | Storybook + Chromatic | 所有 UI 组件 (50+ stories) | 每个 PR 自动触发 |
| **跨平台视觉一致性** | Playwright 截图对比 | 翻译窗口/OCR 窗口/设置页面 6 个关键布局 | 发布前手动执行 |
| **RTL 布局快照** | 手动截图对比 | 阿拉伯语/希伯来语界面布局 | 每次 i18n 变更后 |
| **主题快照** | Chromatic themes | 浅色/深色/跟随系统 3 种主题 | 每次 UI 组件变更 |

### L1 单元测试 Mock 策略

| 依赖 | Mock 方式 | 影响 |
|------|----------|------|
| `@tauri-apps/api` | `vi.mock('@tauri-apps/api')` 全量 mock | 前端测试不依赖 Rust 端 |
| Jotai store | `beforeEach` 中 `createStore()` 新实例 | 测试间独立，无状态泄漏 |
| i18next | mock `useTranslation` 返回静态翻译函数 | 翻译文本固定，无外部依赖 |
| 浏览器 API (`navigator.clipboard`) | `jsdom` 默认 behavior + 手动 mock | 剪切板操作测试可控 |
| `window.matchMedia` | jsdom polyfill | 主题跟随系统测试 |
| 模拟延迟 | 集成测试中通过 `POT_MOCK_DELAY` 环境变量注入 | 网络延迟场景可测试 |

---

## 覆盖率目标矩阵

### 模块覆盖率目标

| 模块 | 单元测试覆盖率 | 集成测试覆盖率 | 目标依据 |
|------|--------------|--------------|---------|
| **翻译服务适配器** (12+ plugins) | **90%** | **80%** | 每个适配器独立且逻辑相似，高单元覆盖率确保新增适配器安全。集成测试覆盖并行调度（多接口竞速、降级、超时）。 |
| **OCR 服务适配器** (4+ plugins) | **90%** | **70%** | 类似于翻译适配器，但 OCR 涉及图片预处理（base64 编码/解码），部分场景需真实图像验证，集成覆盖略低。 |
| **TTS 服务适配器** (3+ plugins) | **85%** | **60%** | TTS 的核心价值在音频质量 (主观评估)，单元测试覆盖参数校验与 API 请求构造，集成测试仅验证接口可连通。 |
| **生词本导出模块** (Anki/欧路) | **85%** | **70%** | 数据格式转换 (JSON ↔ Anki API) 的纯函数逻辑高覆盖率；集成测试需 real AnkiConnect 或 mock。 |
| **Rust 剪贴板模块** | **85%** | **60%** | 单元测试覆盖文本抓取/恢复逻辑；集成测试依赖各平台原生 API (macOS CGEvents / Windows Clipboard API / Linux xclip)，跨平台差异大。 |
| **Rust 快捷键模块** | **80%** | **50%** | 热键注册/释放/冲突检测逻辑可单元测试；但平台级快捷键捕获需要桌面环境 (X11/XGrabKey / macOS CGEvent)，集成测试受限。 |
| **Rust 截图模块** | **75%** | **40%** | 截图逻辑 (screencapture / DXGI / GNOME Screenshot Portal) 高度依赖平台 API；单元测试覆盖坐标计算与裁剪逻辑。 |
| **Rust 配置存储模块** | **95%** | **80%** | 配置读写为纯数据操作，高覆盖率可实现；加密解密函数均为纯函数，理想单元测试对象。 |
| **Rust 系统 OCR 模块** | **70%** | **50%** | 系统 OCR 调用 (macOS Vision / Windows OCR API) 依赖 OS SDK，单元测试仅覆盖语言匹配、路径查找；集成测试需真实 OS 环境。 |
| **React 翻译窗口** | **80%** | **70%** | 组件渲染 + 用户交互 (输入/点击/拖拽/键盘) 通过 Vitest + jsdom；集成测试覆盖与 Tauri bridge 的 invoke 调用。 |
| **React OCR 窗口** | **75%** | **65%** | 类似翻译窗口，增加截图选取交互逻辑。 |
| **React 设置页面** | **80%** | **60%** | 表单组件数据绑定、校验、服务配置 CRUD 的逻辑验证。 |
| **React 系统托盘 UI** | **60%** | **40%** | 托盘菜单交互依赖 Tauri 托盘 API mock，集成测试需真实桌面环境。 |
| **国际化 (i18n)** | **90%** | **随各模块** | i18n 主要为键值映射，翻译完成率检查可自动化 (i18next-parser)；集成测试融入各模块 UI 验证。 |
| **插件加载系统** | **85%** | **70%** | `info.ts` 解析、插件校验、版本匹配为纯逻辑；集成测试验证插件发现 to 加载 to 注册完整链路。 |
| **外部 HTTP 服务** | **80%** | **75%** | HTTP 服务器启动/路由/中间件可 mock；集成测试验证 real HTTP request to 翻译/OCR 插件转发。 |
| **代理与网络模块** | **75%** | **50%** | 代理配置解析与 URL 构造可单元测试；真实代理/网络故障切换需网络环境。 |
| **自动更新模块** | **80%** | **30%** | 版本比较、签名校验为纯逻辑；集成测试需 GitHub Release API + 真实下载，脆断而不适合 CI。 |

### 全局覆盖率门禁

| 门禁 | 阈值 | 触发 |
|------|------|------|
| **前端 `pnpm test --coverage`** | lines at least 80%, branches at least 70%, functions at least 85% | 每个 PR (GitHub Actions) |
| **Rust `cargo tarpaulin`** | lines at least 70% (src-tauri/src/) | 每个 PR (nightly 定时检查) |
| **E2E 手动测试矩阵** | P0 用例 100% | 每次发布前 |

### 豁免与合理降低

| 模块 | 降低原因 |
|------|---------|
| 截图模块 (40%) | 依赖 DXGI/Screencapture/GNOME Portal，无标准跨平台 mock |
| 快捷键捕获 (50%) | 平台级事件循环，无法在无头环境中测试 |
| 自动更新 E2E (30%) | 依赖 GitHub Release API 和平台更新机制，外部依赖不稳定 |

---

## 发布门禁检查清单 (Release Gate Checklist)

### 前置条件: 构建验证 (3 平台)

| 编号 | 检查项 | 平台 | 验证方法 | 通过条件 |
|------|--------|------|---------|---------|
| GATE-BUILD-01 | macOS ARM 构建成功 | macOS Apple Silicon | `cargo build --release --target aarch64-apple-darwin` | 编译无错误，产物 < 15MB |
| GATE-BUILD-02 | macOS Intel 构建成功 | macOS Intel | `cargo build --release --target x86_64-apple-darwin` | 同上 |
| GATE-BUILD-03 | Windows x64 构建成功 | Windows 11 | `cargo build --release --target x86_64-pc-windows-msvc` | 编译 + MSI 打包成功 |
| GATE-BUILD-04 | Linux x64 构建成功 | Ubuntu 24.04 | `cargo build --release --target x86_64-unknown-linux-gnu` | AppImage/deb 打包成功 |

### P0 冒烟测试 (Smoke Test)

| 编号 | 场景 | 操作 | 通过条件 |
|------|------|------|---------|
| GATE-SMOKE-01 | 启动 | 双击应用图标 | 3s 内托盘图标出现 |
| GATE-SMOKE-02 | 划词翻译 | 浏览器选中文字 to Ctrl+Shift+T | 翻译浮窗弹出，结果显示译文 |
| GATE-SMOKE-03 | 输入翻译 | Ctrl+Shift+F to 输入文本 to Enter | 翻译结果显示 |
| GATE-SMOKE-04 | 截图 OCR | Ctrl+Shift+O to 框选 to Enter | OCR 识别结果展示 |
| GATE-SMOKE-05 | 截图翻译 | Ctrl+Shift+S to 框选 to Enter | 翻译结果显示 |
| GATE-SMOKE-06 | 全局快捷键 | 在非英文输入法下使用快捷键 | 快捷键正确触发 (不冲突) |
| GATE-SMOKE-07 | 系统托盘 | 右键托盘图标 | 菜单完整 (翻译/OCR/设置/退出) |
| GATE-SMOKE-08 | 窗口关闭 | 翻译浮窗显示 to 点击外部 | 浮窗正常关闭 |

### 安全扫描

| 编号 | 检查项 | 工具/方法 | 通过条件 | 阻断级别 |
|------|--------|----------|---------|---------|
| GATE-SEC-01 | API Key 明文检查 | `grep -r "apiKey\|secret\|token" config/` + 手动审计 | 配置文件中无明文 Key | **阻断** |
| GATE-SEC-02 | npm 依赖审计 | `pnpm audit` / `npm audit` | 0 High/Critical | **阻断** |
| GATE-SEC-03 | Cargo 依赖审计 | `cargo audit` | 0 Critical | **阻断** |
| GATE-SEC-04 | 二进制签名验证 | `codesign -dv --verbose=4` (macOS) / `signtool verify` (Windows) | 签名有效、未篡改 | **阻断** |
| GATE-SEC-05 | HTTPS 强制检查 | `mitmproxy` 抓包 | 所有外发请求使用 HTTPS | **阻断** |
| GATE-SEC-06 | 本地 HTTP 回环绑定 | `nmap -p 60828 192.168.x.x` | 外部设备无法连接 | **阻断** |

### 性能基准对比

| 编号 | 指标 | 基准值 | 劣化阈值 | 当前版本实测 | 判定 |
|------|------|--------|---------|------------|------|
| GATE-PERF-01 | 冷启动时间 | at most 3s | > 5s | (待填入) | -- |
| GATE-PERF-02 | 热启动时间 | at most 1s | > 2s | (待填入) | -- |
| GATE-PERF-03 | 划词翻译 P95 | at most 1s | > 2s | (待填入) | -- |
| GATE-PERF-04 | 截图 OCR P95 | at most 2s | > 4s | (待填入) | -- |
| GATE-PERF-05 | 空闲内存 (RSS) | at most 150MB | > 250MB | (待填入) | -- |
| GATE-PERF-06 | 空闲 CPU | at most 1% | > 3% | (待填入) | -- |
| GATE-PERF-07 | 安装包大小 | at most 15MB | > 20MB | (待填入) | -- |

_发布时填入当前版本实测值并对比基准。任一指标劣化超过阈值需提供书面解释。_

### i18n 完整性

| 编号 | 检查项 | 工具 | 通过条件 |
|------|--------|------|---------|
| GATE-I18N-01 | 翻译键完整性 | `i18next-parser` 扫描所有 `t()` 调用 | 新增键 at most 10 个 / 无缺失键 |
| GATE-I18N-02 | 中文覆盖率 | `i18n-coverage` 脚本 | 100% (中文为基准语言) |
| GATE-I18N-03 | 英文覆盖率 | `i18n-coverage` 脚本 | at least 100% (中英对等) |
| GATE-I18N-04 | 日文覆盖率 | `i18n-coverage` 脚本 | at least 80% |
| GATE-I18N-05 | RTL 布局渲染 | 手动切换阿拉伯语 | 菜单/窗口/按钮 方向正确 |
| GATE-I18N-06 | 占位符完整性 | `grep -r "\{\{.*\}\}"` 扫描键值 | 所有语言的 `{{key}}` 占位符与中文一致 |

### 无障碍检查 (Accessibility)

| 编号 | 检查项 | 验证方法 | 通过条件 |
|------|--------|---------|---------|
| GATE-A11Y-01 | 键盘导航 | Tab/Shift+Tab 遍历所有交互元素 | 所有按钮/输入框可达、焦点可见 |
| GATE-A11Y-02 | 屏幕阅读器 | macOS VoiceOver / Windows Narrator 朗读设置页 | 所有按钮/标签有可读文本 |
| GATE-A11Y-03 | 快捷键提示 | 查看所有功能快捷键 | 快捷键组合在设置中明确标注 |
| GATE-A11Y-04 | 色觉障碍 | 仅使用灰度模式查看主题 | 错误/成功状态不仅靠颜色区分 |
| GATE-A11Y-05 | 缩放支持 | UI 缩放到 150% | 布局不破裂、文字可读 |

### 许可证合规

| 编号 | 检查项 | 工具 | 通过条件 |
|------|--------|------|---------|
| GATE-LIC-01 | 前端 npm 依赖许可证 | `npx license-checker --failOn GPL` | 无 GPL/AGPL 依赖 |
| GATE-LIC-02 | Rust crate 许可证 | `cargo-license` | 无 GPL/AGPL 依赖 |
| GATE-LIC-03 | 第三方插件许可证 | 手动审查插件 `info.ts` | 所有插件许可证明确 |
| GATE-LIC-04 | Tauri SBOM | `cargo sbom` 生成 | SBOM 随 Release 一起发布 |

### macOS 公证 (Notarization)

| 编号 | 检查项 | 验证方法 | 通过条件 |
|------|--------|---------|---------|
| GATE-NOT-01 | 代码签名 | `codesign --verify --deep --strict dist/Pot.app` | 签名有效 |
| GATE-NOT-02 | 公证票据 | `xcrun stapler validate dist/Pot.app` | "The validate action worked!" |
| GATE-NOT-03 | 网络加固 | 公证日志检查 | 无网络权限违规 |
| GATE-NOT-04 | DMG 签名 | `codesign --verify dist/Pot.dmg` | DMG 签名有效 |
| GATE-NOT-05 | Gatekeeper 通过 | 全新干净 macOS 环境首次启动 | 无 "无法验证开发者" 提示 |

### 发布决策矩阵

```
所有 "阻断" 级别门禁必须通过。

GATE-BUILD 全部通过 --+
GATE-SEC-01~06 全部通过 --+
GATE-SMOKE-01~08 全部通过 --+--> OK 可发布
GATE-PERF 无劣化超阈值 --+
GATE-I18N 全部通过 --+

任一项不满足 to X 阻断发布，需修复后重新评估
```

---

## 可追溯矩阵 (Traceability Matrix)

> **需求来源**: [00-prd-需求总览](../../prds/2026-09/00-prd-需求总览.md) 中定义的 6 个功能需求 (FR-1 ~ FR-6) + 非功能需求 (NFR)。

### FR-1: 翻译引擎

| FR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|--------|------|-----------|---------|---------|
| FR-1.1 | 划词翻译 | TC-TR-001 ~ TC-TR-020 | [01-prd-test-翻译核心](001-prd-test-翻译核心.md) | 已覆盖 |
| FR-1.1 | 划词翻译窗口交互 | TC-WIN-001 ~ TC-WIN-015 | [20-prd-test-翻译窗口交互](020-prd-test-翻译窗口交互.md) | 已覆盖 |
| FR-1.2 | 输入翻译 | TC-TR-021 ~ TC-TR-030 | [01-prd-test-翻译核心](001-prd-test-翻译核心.md) | 已覆盖 |
| FR-1.3 | 剪切板监听 | TC-CLIP-001 ~ TC-CLIP-020 | [13-prd-test-剪切板监听](013-prd-test-剪切板监听.md) | 已覆盖 |
| FR-1.3 | Rust 剪切板模块 | TC-CLIP-001 ~ TC-CLIP-010 | [24-prd-test-Rust模块](024-prd-test-Rust模块.md) | 已覆盖 |
| FR-1.4 | 多接口并行翻译 | TC-PARALLEL-001 ~ TC-PARALLEL-015 | [19-prd-test-并行调度](019-prd-test-并行调度.md) | 已覆盖 |
| FR-1.4 | 并行调度策略 | TC-SCHED-001 ~ TC-SCHED-010 | [56-prd-test-并行调度策略](056-prd-test-并行调度策略.md) | 已覆盖 |
| FR-1.4 | 百度翻译服务 | TC-BAIDU-001 ~ TC-BAIDU-015 | [11-prd-test-百度翻译](011-prd-test-百度翻译.md) / [36-prd-test-百度翻译服务](036-prd-test-百度翻译服务.md) | 已覆盖 |
| FR-1.4 | AI 翻译服务 (OpenAI) | TC-AI-001 ~ TC-AI-015 | [12-prd-test-AI翻译](012-prd-test-AI翻译.md) / [37-prd-test-AI翻译服务](037-prd-test-AI翻译服务.md) | 已覆盖 |
| FR-1.4 | Google 翻译 | TC-GOOG-001 ~ TC-GOOG-015 | [15-prd-test-GoogleDeepL翻译](015-prd-test-GoogleDeepL翻译.md) / [43-prd-test-Google翻译](043-prd-test-Google翻译.md) | 已覆盖 |
| FR-1.4 | DeepL 翻译 | TC-DEEPL-001 ~ TC-DEEPL-015 | [15-prd-test-GoogleDeepL翻译](015-prd-test-GoogleDeepL翻译.md) / [42-prd-test-DeepL翻译](042-prd-test-DeepL翻译.md) / [82-prd-test-DeepL翻译](082-prd-test-DeepL翻译.md) | 已覆盖 |
| FR-1.4 | 有道翻译 | TC-YOUDAO-001 ~ TC-YOUDAO-015 | [18-prd-test-有道翻译](018-prd-test-有道翻译.md) / [50-prd-test-有道翻译](050-prd-test-有道翻译.md) | 已覆盖 |
| FR-1.4 | 阿里/腾讯/火山翻译 | TC-ATV-001 ~ TC-ATV-015 | [52-prd-test-阿里腾讯火山](052-prd-test-阿里腾讯火山.md) | 已覆盖 |
| FR-1.4 | 彩云/Bing/Yandex 翻译 | TC-CBY-001 ~ TC-CBY-015 | [51-prd-test-彩云BingYandex](051-prd-test-彩云BingYandex.md) | 已覆盖 |
| FR-1.4 | 词典/本地翻译 | TC-DICT-001 ~ TC-DICT-010 | [53-prd-test-词典本地翻译](053-prd-test-词典本地翻译.md) | 已覆盖 |
| FR-1.4 | 翻译 Provider 适配器 | TC-PROV-001 ~ TC-PROV-020 | [100-prd-test-翻译Provider适配器](100-prd-test-翻译Provider适配器.md) | 已覆盖 |
| FR-1.4 | 翻译记忆与 RAG | TC-MEM-001 ~ TC-MEM-015 | [103-prd-test-翻译记忆与RAG上下文](103-prd-test-翻译记忆与RAG上下文.md) | 已覆盖 |
| FR-1 | 翻译历史记录 | TC-HIST-001 ~ TC-HIST-010 | [96-prd-test-翻译历史记录](096-prd-test-翻译历史记录.md) | 已覆盖 |
| FR-1 | YiAi 后端集成 (翻译) | TC-YIAI-001 ~ TC-YIAI-020 | [99-prd-test-YiAi后端集成](099-prd-test-YiAi后端集成.md) | 已覆盖 |
| FR-1 | 前端 YiAi 路由降级 | TC-DEGRADE-001 ~ TC-DEGRADE-015 | [105-prd-test-前端集成YiAi路由降级](105-prd-test-前端集成YiAi路由降级.md) | 已覆盖 |
| FR-1 | YiPot API 四层架构 | TC-API-001 ~ TC-API-020 | [104-prd-test-YiPotAPI四层架构](104-prd-test-YiPotAPI四层架构.md) | 已覆盖 |

### FR-2: 文字识别

| FR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|--------|------|-----------|---------|---------|
| FR-2.1 | 截图 OCR | TC-OCR-001 ~ TC-OCR-020 | [02-prd-test-OCR识别](002-prd-test-OCR识别.md) | 已覆盖 |
| FR-2.1 | OCR 窗口交互 | TC-OCRWIN-001 ~ TC-OCRWIN-015 | [21-prd-test-OCR窗口交互](021-prd-test-OCR窗口交互.md) / [58-prd-test-OCR窗口交互](058-prd-test-OCR窗口交互.md) | 已覆盖 |
| FR-2.1 | 截图与选区 | TC-CROP-001 ~ TC-CROP-015 | [16-prd-test-截图与选区](16-prd-test-截图与选区.md) / [86-prd-test-截图与选区](086-prd-test-截图与选区.md) | 已覆盖 |
| FR-2.1 | 截图选区交互 | TC-SEL-001 ~ TC-SEL-010 | [39-prd-test-截图选区](039-prd-test-截图选区.md) | 已覆盖 |
| FR-2.2 | 截图翻译 | TC-OCR-TR-001 ~ TC-OCR-TR-015 | [02-prd-test-OCR识别](002-prd-test-OCR识别.md) / [88-prd-test-OCR截图识别](088-prd-test-OCR截图识别.md) | 已覆盖 |
| FR-2.3 | macOS 系统 OCR (Vision) | TC-SYS-OCR-001 ~ TC-SYS-OCR-010 | [16-prd-test-系统OCR](016-prd-test-系统OCR.md) / [44-prd-test-系统OCR离线](044-prd-test-系统OCR离线.md) | 已覆盖 |
| FR-2.3 | Windows 系统 OCR | TC-WIN-OCR-001 ~ TC-WIN-OCR-010 | [16-prd-test-系统OCR](016-prd-test-系统OCR.md) | 已覆盖 |
| FR-2 | OCR 服务全览 | TC-OCR-SVC-001 ~ TC-OCR-SVC-015 | [05-prd-test-OCR服务接口](005-prd-test-OCR服务接口.md) / [30-prd-test-OCR服务全景](030-prd-test-OCR服务全景.md) | 已覆盖 |
| FR-2 | 百度/腾讯 OCR | TC-BT-OCR-001 ~ TC-BT-OCR-015 | [25-prd-test-百度腾讯OCR](025-prd-test-百度腾讯OCR.md) / [54-prd-test-百度腾讯OCR](054-prd-test-百度腾讯OCR.md) | 已覆盖 |
| FR-2 | 讯飞/合合/火山 OCR | TC-XHH-OCR-001 ~ TC-XHH-OCR-015 | [55-prd-test-讯飞合合火山OCR](055-prd-test-讯飞合合火山OCR.md) | 已覆盖 |
| FR-2 | Tesseract 离线 OCR | TC-TESS-001 ~ TC-TESS-015 | [45-prd-test-TesseractOCR](045-prd-test-TesseractOCR.md) / [83-prd-test-Tesseract离线OCR](083-prd-test-Tesseract离线OCR.md) | 已覆盖 |
| FR-2 | 公式/二维码 OCR | TC-FORMULA-001 ~ TC-FORMULA-010 | [26-prd-test-公式二维码OCR](026-prd-test-公式二维码OCR.md) | 已覆盖 |
| FR-2 | Rust 截图 OCR 语言检测 | TC-RS-OCR-001 ~ TC-RS-OCR-010 | [24-prd-test-Rust模块](024-prd-test-Rust模块.md) / [64-prd-test-Rust截图OCR](064-prd-test-Rust截图OCR.md) | 已覆盖 |
| FR-2 | OCR Provider 适配器 | TC-OCR-PROV-001 ~ TC-OCR-PROV-015 | [101-prd-test-OCRProvider适配器](101-prd-test-OCRProvider适配器.md) | 已覆盖 |

### FR-3: 语音合成与生词本

| FR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|--------|------|-----------|---------|---------|
| FR-3.1 | 多接口 TTS | TC-TTS-001 ~ TC-TTS-020 | [06-prd-test-语音合成与生词本](006-prd-test-语音合成与生词本.md) / [28-prd-test-语音合成生词本](028-prd-test-语音合成生词本.md) | 已覆盖 |
| FR-3.1 | TTS 详细测试 | TC-TTS-DETAIL-001 ~ TC-TTS-DETAIL-015 | [41-prd-test-TTS语音合成](041-prd-test-TTS语音合成.md) / [89-prd-test-TTS语音合成](089-prd-test-TTS语音合成.md) | 已覆盖 |
| FR-3.2 | 生词本导出 (Anki) | TC-ANKI-001 ~ TC-ANKI-015 | [06-prd-test-语音合成与生词本](006-prd-test-语音合成与生词本.md) | 已覆盖 |
| FR-3.2 | 生词本导出详细测试 | TC-EXPORT-001 ~ TC-EXPORT-015 | [46-prd-test-生词本导出](046-prd-test-生词本导出.md) / [84-prd-test-生词本导出](084-prd-test-生词本导出.md) | 已覆盖 |
| FR-3 | TTS 生词本 Provider | TC-TTS-PROV-001 ~ TC-TTS-PROV-015 | [102-prd-test-TTS生词本Provider](102-prd-test-TTS生词本Provider.md) | 已覆盖 |

### FR-4: 插件与服务系统

| FR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|--------|------|-----------|---------|---------|
| FR-4.1 | 插件架构 | TC-PLUG-001 ~ TC-PLUG-030 | [29-prd-test-插件系统](029-prd-test-插件系统.md) | 已覆盖 |
| FR-4.1 | 翻译服务全景 | TC-TSVC-001 ~ TC-TSVC-015 | [04-prd-test-翻译服务接口](004-prd-test-翻译服务接口.md) | 已覆盖 |
| FR-4.2 | 服务配置管理 | TC-CFG-SVC-001 ~ TC-CFG-SVC-015 | [04-prd-test-翻译服务接口](004-prd-test-翻译服务接口.md) / [29-prd-test-插件系统](029-prd-test-插件系统.md) | 已覆盖 |

### FR-5: 桌面集成

| FR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|--------|------|-----------|---------|---------|
| FR-5.1 | 全局快捷键 | TC-HK-001 ~ TC-HK-020 | [03-prd-test-桌面集成](003-prd-test-桌面集成.md) / [17-prd-test-快捷键](017-prd-test-快捷键.md) | 已覆盖 |
| FR-5.1 | 快捷键注册管理 | TC-HKREG-001 ~ TC-HKREG-015 | [47-prd-test-快捷键注册](047-prd-test-快捷键注册.md) | 已覆盖 |
| FR-5.2 | 系统托盘 | TC-TRAY-001 ~ TC-TRAY-020 | [03-prd-test-桌面集成](003-prd-test-桌面集成.md) / [85-prd-test-系统托盘](085-prd-test-系统托盘.md) / [81-prd-test-系统托盘](081-prd-test-系统托盘.md) / [38-prd-test-系统托盘](038-prd-test-系统托盘.md) | 已覆盖 |
| FR-5.2 | Rust 托盘模块 | TC-RS-TRAY-001 ~ TC-RS-TRAY-010 | [24-prd-test-Rust模块](024-prd-test-Rust模块.md) / [63-prd-test-Rust托盘](063-prd-test-Rust托盘.md) | 已覆盖 |
| FR-5.3 | 窗口管理 | TC-WINPOS-001 ~ TC-WINPOS-015 | [40-prd-test-窗口定位](040-prd-test-窗口定位.md) / [87-prd-test-窗口定位与多显示器](087-prd-test-窗口定位与多显示器.md) | 已覆盖 |
| FR-5 | 窗口动画过渡 | TC-ANIM-001 ~ TC-ANIM-010 | [97-prd-test-窗口动画过渡](097-prd-test-窗口动画过渡.md) | 已覆盖 |
| FR-5 | 桌面集成全览 | TC-DESK-001 ~ TC-DESK-020 | [31-prd-test-桌面集成](031-prd-test-桌面集成.md) | 已覆盖 |
| FR-5 | 启动与开机自启 | TC-STARTUP-001 ~ TC-STARTUP-010 | [03-prd-test-桌面集成](003-prd-test-桌面集成.md) | 已覆盖 |

### FR-6: 国际化

| FR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|--------|------|-----------|---------|---------|
| FR-6.1 | 多语言界面 (22 语言) | TC-I18N-001 ~ TC-I18N-020 | [07-prd-test-国际化与主题](007-prd-test-国际化与主题.md) / [32-prd-test-国际化主题](032-prd-test-国际化主题.md) | 已覆盖 |
| FR-6.1 | RTL 布局 | TC-RTL-001 ~ TC-RTL-010 | [07-prd-test-国际化与主题](007-prd-test-国际化与主题.md) | 已覆盖 |
| FR-6.1 | 主题系统 | TC-THEME-001 ~ TC-THEME-010 | [07-prd-test-国际化与主题](007-prd-test-国际化与主题.md) | 已覆盖 |

### 非功能需求 (NFR)

| NFR编号 | 需求 | 测试用例ID | 测试文件 | 覆盖状态 |
|---------|------|-----------|---------|---------|
| NFR-PERF | 翻译响应 < 2s | TC-PERF-001 ~ TC-PERF-020 | [22-prd-test-性能基准](022-prd-test-性能基准.md) | 已覆盖 |
| NFR-PERF | OCR 识别 < 3s | TC-PERF-OCR-001 ~ TC-PERF-OCR-010 | [22-prd-test-性能基准](022-prd-test-性能基准.md) | 已覆盖 |
| NFR-PERF | 快捷键响应 < 200ms | TC-PERF-HK-001 ~ TC-PERF-HK-005 | [22-prd-test-性能基准](022-prd-test-性能基准.md) | 已覆盖 |
| NFR-PLAT | macOS 平台适配 | TC-MAC-001 ~ TC-MAC-015 | [23-prd-test-平台兼容](023-prd-test-平台兼容.md) / [93-prd-test-macOS平台](093-prd-test-macOS平台.md) | 已覆盖 |
| NFR-PLAT | Windows 平台适配 | TC-WIN-001 ~ TC-WIN-015 | [23-prd-test-平台兼容](023-prd-test-平台兼容.md) | 已覆盖 |
| NFR-PLAT | Linux 平台适配 | TC-LINUX-001 ~ TC-LINUX-015 | [23-prd-test-平台兼容](023-prd-test-平台兼容.md) | 已覆盖 |
| NFR-SEC | API Key 加密存储 | TC-SEC-001 ~ TC-SEC-010 | [27-prd-test-安全加密存储](027-prd-test-安全加密存储.md) / [49-prd-test-安全加密](049-prd-test-安全加密.md) / [91-prd-test-安全加密存储](091-prd-test-安全加密存储.md) | 已覆盖 |
| NFR-SEC | 安全加密整体 | TC-SEC-001 ~ TC-SEC-008 | 本文「安全测试」章节 | 已覆盖 |
| NFR-CFG | 配置备份恢复 | TC-CFG-001 ~ TC-CFG-020 | [08-prd-test-配置管理与备份](008-prd-test-配置管理与备份.md) / [33-prd-test-配置备份](033-prd-test-配置备份.md) | 已覆盖 |
| NFR-CFG | WebDAV/阿里云备份 | TC-WEBDAV-001 ~ TC-WEBDAV-015 | [61-prd-test-WebDAV备份](061-prd-test-WebDAV备份.md) | 已覆盖 |
| NFR-CFG | Rust 配置备份 | TC-RS-CFG-001 ~ TC-RS-CFG-010 | [24-prd-test-Rust模块](024-prd-test-Rust模块.md) / [65-prd-test-Rust配置备份](065-prd-test-Rust配置备份.md) | 已覆盖 |
| NFR-HTTP | 外部 HTTP 服务 | TC-HTTP-001 ~ TC-HTTP-020 | [09-prd-test-外部HTTP服务](009-prd-test-外部HTTP服务.md) / [34-prd-test-HTTP服务](034-prd-test-HTTP服务.md) | 已覆盖 |
| NFR-NET | 代理与网络 | TC-PROXY-001 ~ TC-PROXY-015 | [14-prd-test-代理与网络](014-prd-test-代理与网络.md) | 已覆盖 |
| NFR-UPDATE | 自动更新 | TC-UPDATE-001 ~ TC-UPDATE-015 | [48-prd-test-自动更新](048-prd-test-自动更新.md) / [90-prd-test-自动更新](090-prd-test-自动更新.md) / [80-prd-test-自动更新](080-prd-test-自动更新.md) | 已覆盖 |
| NFR-BUILD | 构建发布与安全 | TC-BUILD-001 ~ TC-BUILD-015 | [10-prd-test-构建发布与安全](010-prd-test-构建发布与安全.md) / [35-prd-test-构建安全](035-prd-test-构建安全.md) | 已覆盖 |
| NFR-CLI | CLI 命令行 | TC-CLI-001 ~ TC-CLI-015 | [60-prd-test-CLI命令行](060-prd-test-CLI命令行.md) | 已覆盖 |
| NFR-SETTING | 设置页面架构 | TC-SETTING-001 ~ TC-SETTING-015 | [59-prd-test-设置页面架构](059-prd-test-设置页面架构.md) / [92-prd-test-设置页面](092-prd-test-设置页面.md) | 已覆盖 |
| NFR-RUST | Rust 核心模块 | TC-RUST-001 ~ TC-RUST-020 | [24-prd-test-Rust模块](024-prd-test-Rust模块.md) | 已覆盖 |
| NFR-DOCS | 知识库文档与基础设施 | TC-DOCS-001 ~ TC-DOCS-010 | [106-prd-test-知识库文档与基础设施](106-prd-test-知识库文档与基础设施.md) | 已覆盖 |

### 覆盖率统计

| 需求域 | 总需求数 | 已覆盖 | 未覆盖 | 覆盖率 |
|--------|---------|--------|--------|--------|
| FR-1 翻译引擎 | 20 | 20 | 0 | 100% |
| FR-2 文字识别 | 14 | 14 | 0 | 100% |
| FR-3 语音合成与生词本 | 5 | 5 | 0 | 100% |
| FR-4 插件与服务 | 4 | 4 | 0 | 100% |
| FR-5 桌面集成 | 8 | 8 | 0 | 100% |
| FR-6 国际化 | 3 | 3 | 0 | 100% |
| NFR 非功能 | 18 | 18 | 0 | 100% |
| **总计** | **72** | **72** | **0** | **100%** |

---

## 缺陷分类与严重度定义

### P0 -- 阻断级 (Blocker)

**定义**: 导致核心功能完全不可用，或造成数据丢失/隐私泄露的缺陷。必须在 24 小时内修复并紧急发布热修复版本。

| 示例编号 | 具体示例 | 影响范围 |
|---------|---------|---------|
| P0-EX-01 | 划词翻译快捷键在任意平台完全不工作 | 100% 用户核心功能瘫痪 |
| P0-EX-02 | 应用启动即崩溃 (crash on launch) | 所有用户无法使用 |
| P0-EX-03 | API Key 以明文写入日志文件并发往远程 | 所有用户的 API Key 泄露 |
| P0-EX-04 | 截图 OCR 导致系统级内存泄漏，10 分钟内 OOM | 系统稳定性崩溃 |
| P0-EX-05 | macOS 公证失败，Gatekeeper 阻止启动 | macOS 用户完全无法使用 |
| P0-EX-06 | 配置文件损坏后应用无法回退默认配置，无限崩溃循环 | 用户数据丢失且无法恢复 |
| P0-EX-07 | 剪贴板监听模式下复制密码后密码被外发 | 用户隐私泄露 |
| P0-EX-08 | 应用安装包包含恶意代码 (供应链攻击) | 所有用户安全 |

### P1 -- 严重级 (Critical)

**定义**: 核心功能严重降级，或特定平台/场景下功能不可用，但存在替代方案。必须在当前 Sprint 内修复（最多 3 个工作日）。

| 示例编号 | 具体示例 | 影响范围 |
|---------|---------|---------|
| P1-EX-01 | Windows 平台划词翻译正常但 macOS 上快捷键无响应 | macOS 用户核心功能不可用 |
| P1-EX-02 | 并行翻译中某个主流接口 (Google/DeepL) 100% 失败但不阻断其他接口 | 翻译质量降级，仍有替代 |
| P1-EX-03 | 系统托盘右键菜单在某平台完全空白 | 桌面集成功能缺失 |
| P1-EX-04 | 翻译窗口在多显示器扩展模式下定位到屏幕外 | 多显示器用户无法使用翻译窗口 |
| P1-EX-05 | 离线系统 OCR 完全无效 (macOS Vision API 调用失败) | 离线场景不可用 |
| P1-EX-06 | 配置导出后导入失败 (JSON 格式兼容性问题) | 用户备份迁移受阻 |
| P1-EX-07 | i18n 切换后部分关键 UI (翻译按钮/快捷键提示) 显示为键名而非翻译文本 | 影响核心操作路径 |
| P1-EX-08 | 语言自动检测将日语错判为中文 100% (NLP 模型退化) | 日语用户翻译功能严重降级 |

### P2 -- 一般级 (Major)

**定义**: 非核心功能缺陷，或核心功能的边界场景出现问题。应在下个版本修复，不阻断当前发布。

| 示例编号 | 具体示例 | 影响范围 |
|---------|---------|---------|
| P2-EX-01 | 主题切换后部分 UI (图标/边框) 颜色不跟随但功能正常 | 视觉一致性 |
| P2-EX-02 | TTS 朗读语速调节滑块拖拽时延迟 > 500ms | 体验降级 |
| P2-EX-03 | 生词本导出 Anki 时部分字段映射 (如音标) 缺失 | 导出数据不完整 |
| P2-EX-04 | 设置页面在 125% DPI 缩放下部分文字截断 | 特定缩放比例下的 UI 问题 |
| P2-EX-05 | 自动更新检测失败但不影响手动下载更新 | 更新便捷性 |
| P2-EX-06 | 快捷键冲突检测在 Linux Wayland 下部分失效 | 特定平台+显示协议 |
| P2-EX-07 | 某些翻译接口的历史记录在切换时丢失 | 历史数据不一致 |
| P2-EX-08 | RTL 语言下设置页布局方向正确但滚动条位置在右侧 (应为左侧) | RTL 细节不完善 |

### P3 -- 轻微级 (Minor)

**定义**: 视觉瑕疵、文案错误、非关键路径的性能问题。可在 Backlog 中排期，不要求在特定发布中必须修复。

| 示例编号 | 具体示例 | 影响范围 |
|---------|---------|---------|
| P3-EX-01 | 某个标签文字中英文间缺少空格 ("启用OCR" 应为 "启用 OCR") | 排版美观 |
| P3-EX-02 | 窗口动画在低端集成显卡上偶现 1-2 帧卡顿 | 极低概率视觉抖动 |
| P3-EX-03 | 系统托盘图标在深色任务栏下边缘锯齿可见 | 视觉细节 |
| P3-EX-04 | 帮助文档中某个链接使用了不再推荐的旧域名 | 文档准确度 |
| P3-EX-05 | 翻译历史搜索框的 placeholder 文字在少数几种语言中未翻译 | 极少数语言用户 |
| P3-EX-06 | 截图选区边框线宽在高 DPI 4K 屏幕上比设计稿细 1px | 像素级差异 |
| P3-EX-07 | 冷启动时终端输出一行不关键的 deprecation warning | 开发者体验 |

### 缺陷流转规则

```
P0 阻断级 to 立即修复 to 代码审查 to 合入 main to 打 hotfix tag to 紧急发布
P1 严重级 to Sprint 内排期 to 修复 to 合入 dev to 随下个版本发布
P2 一般级 to 标记为下个版本 milestone to 修复 to 合入 dev
P3 轻微级 to 加入 backlog to 批量修复 to 合入 dev
```

### 降级/升级规则

- **P0 降级为 P1**: 当且仅当缺陷仅影响 < 1% 用户且存在明确的用户端规避方法时。
- **P1 升级为 P0**: 当缺陷在发布前 48 小时内发现且无已知替代方案时。
- **P2 升级为 P1**: 当用户反馈量在 1 周内超 50 条同质报告时。
- 任何升级/降级必须由 QA 负责人和 PM 共同签字确认。

### 缺陷报告模板 (标准字段)

```yaml
缺陷ID: BUG-{YYYYMM}-{序号}
标题: [平台] 模块: 一句话描述
严重度: P0/P1/P2/P3
环境: {OS} {版本} | {架构} | {应用版本}
复现步骤:
  1. ...
  2. ...
  3. ...
实际结果: (附截图/日志/录屏)
预期结果: (来自 PRD 定义)
复现率: 每次复现 / 10次中N次 / 偶现
影响范围: {用户占比}% / {平台} 专属
附件: 日志文件路径, crash dump, 截图
```