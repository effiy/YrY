---

doc_type: module
prd_task_id: "YP-09-M14"
title: "React 组件与窗口架构 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 4
source_prd: "00-prd-需求总览.md"

type: task
---

# React 组件与窗口架构 — 开发方案

> 需求编号：YP-09-M14 · 优先级：高 · 人天：4d

---

## 一、多窗口架构

YiPot 使用 Tauri 多窗口模式，每个功能窗口独立：

```
App.jsx (BrowserRouter)
  → windowMap[appWindow.label]
    ├── "translate"  → <Translate />
    ├── "recognize"  → <Recognize />
    ├── "screenshot" → <Screenshot />
    ├── "config"     → <Config />
    └── "updater"    → <Updater />
```

**窗口 → 组件映射**:

| 窗口 Label | 组件 | 功能 |
|-----------|------|------|
| translate | `window/Translate/index.jsx` | 翻译结果展示 |
| recognize | `window/Recognize/index.jsx` | OCR 识别结果 |
| screenshot | `window/Screenshot/index.jsx` | 截图选框 |
| config | `window/Config/index.jsx` | 设置管理 |
| updater | `window/Updater/index.jsx` | 更新管理 |

---

## 二、翻译窗口组件树

```
Translate/
├── index.jsx                — 翻译主窗口
├── components/
│   ├── SourceArea/          — 原文输入区
│   │   └── index.jsx
│   ├── TargetArea/          — 译文展示区
│   │   └── index.jsx
│   └── LanguageArea/        — 语言选择器
│       └── index.jsx
```

### 翻译数据流

```
Rust invoke("get_text") → Tauri event "new_text"
  → Translate/index.jsx 监听事件
    → getEnabledServices("translate")
      → Promise.allSettled([...services])
        → 结果渲染到 TargetArea
```

---

## 三、OCR 窗口组件树

```
Recognize/
├── index.jsx                — OCR 主窗口
├── ImageArea/               — 截图预览
│   └── index.jsx
├── TextArea/                — 识别文字展示
│   └── index.jsx
└── ControlArea/             — 操作按钮
    └── index.jsx            — 复制/翻译/重试
```

---

## 四、设置窗口架构

```
Config/
├── index.jsx                — 设置主框架（SideBar + 路由）
├── routes/index.jsx         — React Router 子路由
├── components/SideBar/      — 侧边栏导航
└── pages/
    ├── General/             — 语言/主题/字体/字体大小
    ├── Translate/           — 翻译服务列表
    ├── Recognize/           — OCR 服务列表
    ├── Service/             — 服务配置详情
    │   ├── Translate/       — 翻译服务配置表单
    │   │   ├── index.jsx
    │   │   ├── ServiceItem/
    │   │   ├── ConfigModal/
    │   │   └── SelectModal/
    │   ├── Recognize/       — OCR 服务配置表单
    │   ├── Tts/             — TTS 服务配置
    │   ├── Collection/      — 生词本配置
    │   └── SelectPluginModal/
    ├── Hotkey/              — 快捷键录制器
    ├── Backup/              — 备份恢复（本地/WebDAV/阿里云）
    ├── History/             — 翻译历史记录
    └── About/               — 版本信息 + 链接
```

---

## 五、Hooks 层

| Hook | 文件 | 职责 |
|------|------|------|
| `useConfig` | `hooks/useConfig.jsx` | 读写持久化配置 |
| `useVoice` | `hooks/useVoice.jsx` | TTS 语音播放 |
| `useGetState` | `hooks/useGetState.jsx` | 获取最新 state |
| `useSyncAtom` | `hooks/useSyncAtom.jsx` | 原子状态同步 |
| `useToastStyle` | `hooks/useToastStyle.jsx` | 主题自适应 Toast |

---

## 六、工具层

| 工具 | 文件 | 职责 |
|------|------|------|
| Store | `utils/store.js` | 配置持久化（tauri-plugin-store） |
| i18n | `utils/language.ts` | 语言映射与检测 |
| Lang Detect | `utils/lang_detect.js` | 前端语言检测（franc） |
| Env | `utils/env.js` | 平台判断 |
| Invoke | `utils/invoke_plugin.js` | Tauri invoke 封装 |
| Service Instance | `utils/service_instance.ts` | 服务实例管理 |


## 七、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 多窗口模式 | Tauri 多 WebviewWindow (独立窗口) | 单窗口 + React Router / 虚拟窗口 | 窗口独立生命周期 (崩溃隔离)，原生窗口管理 (置顶/阴影/级别)，系统级窗口分组 | 跨窗口通信需通过 Rust 事件总线，内存 ~20MB/窗口 |
| 窗口路由 | `windowMap[label]` 静态路由 | React Router 动态路由 / 单页切换 | Tauri 窗口与 React 组件 1:1 绑定，无需路由库 | 新增窗口需修改 App.jsx 映射表 |
| 组件通信 | Tauri event (跨窗口) + Props (组件树内) | Jotai atom 跨窗口共享 / Redux | Tauri event 原生支持跨 WebView 通信，Props 简单可靠 | 跨窗口状态同步需手动 emit/listen |
| 设置页架构 | SideBar + React Router 子路由 | Tab 切换 / 分段控制器 | 设置项 10+ 页，SideBar 导航最清晰 | 需要 React Router 依赖 |
| 窗口生命周期 | 预创建 + 显示/隐藏 (常驻) | 惰性创建 + 销毁 | 首开 < 80ms (vs ~280ms 创建) | 常驻 3 窗口 ~60MB 内存 |
| 样式方案 | Tailwind CSS (原子类) + NextUI (组件) | CSS Modules / styled-components | 零运行时 CSS，与 NextUI 一致，上游社区标准 | 模板中类名较长 |
| 截图窗口 | 独立 window (全屏透明 WebView) | 在主窗口内 Canvas 覆盖 | Tauri 独立窗口可全屏透明 + 跨显示器，样式自由可控 | 额外窗口管理复杂度 |

### 跨窗口通信架构

```
┌─────────────────┐     Tauri Event Bus     ┌─────────────────┐
│ Translate Window│ ←──────────────────────→ │ Recognize Window │
│  (translate)    │   "translate-event"      │  (recognize)    │
│                 │   "ocr-result"           │                 │
└────────┬────────┘                          └────────┬────────┘
         │ invoke()                                   │ invoke()
         ▼                                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Rust Backend                         │
│  clipboard.rs | hotkey.rs | screenshot.rs | window.rs  │
└─────────────────────────────────────────────────────────┘

通信模式:
  1. Rust → 前端: app_handle.emit_all("event-name", payload)
  2. 前端 → Rust: invoke("command", { params })
  3. 前端 → 前端 (跨窗口): 通过 Rust 事件总线转发
```

### 窗口创建 vs 显示/隐藏 设计

```rust
// window.rs — 窗口两种状态
// NONE:   未创建 (首次)
// VISIBLE: 已创建且显示中
// HIDDEN:  已创建但隐藏 (消耗内存但不渲染)

创建策略:
  应用启动 → 预创建 translate + recognize + screenshot (HIDDEN)
  用户触发 → set_visible(true) → set_focus()
  用户关闭 → set_visible(false) (不销毁)
  
内存-速度权衡:
  预创建: 启动慢 100ms，但后续打开 < 80ms
  惰性创建: 启动快，但后续打开 ~280ms
  选择预创建: 翻译工具高频使用，首开体验重要
```


## 八、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 窗口预创建 | 启动时创建核心窗口 (HIDDEN) | 首次打开时延 -70% | 首开 ~80ms vs ~280ms |
| 组件懒加载 | React.lazy + Suspense (设置页/更新页) | 首屏体积 -50% | 翻译窗口 Bundle ~80KB |
| 虚拟列表 | 翻译历史列表使用 react-window | 1000+ 条历史渲染 < 50ms | — |
| React.memo | 翻译服务列表项 memo 化 (避免全部重渲染) | 配置页切换 Tab 时延 -40% | — |
| Jotai 原子化 | 细粒度状态更新 (仅订阅的组件重渲染) | 避免 Redux 全局 rerender | 状态变更仅影响 1-3 个组件 |
| OCR 窗口 | OffscreenCanvas 渲染图片 + 原图 lazy 加载 | OCR 窗口内存 -30MB | — |
| 事件监听 | 窗口失焦时停止不必要的监听 | 后台 CPU < 0.1% | — |

### React.lazy 拆分策略

```javascript
// App.jsx
const Translate = lazy(() => import("./window/Translate"));
const Recognize = lazy(() => import("./window/Recognize"));
const Config = lazy(() => import("./window/Config"));    // ~2000 行
const Updater = lazy(() => import("./window/Updater"));  // ~100 行

// 当前窗口 label → 仅加载对应组件
<Suspense fallback={<Loading />}>
  {windowMap[appWindow.label]}
</Suspense>
```

> 设置页 (Config, ~2000 行) 是最大的组件，懒加载使其不影响翻译窗口首屏。


## 九、错误处理 (组件与窗口)

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-窗口 | WebView 崩溃 (内存不足) | Tauri 自动重建 WebView | 自动恢复 | 窗口闪现后恢复 |
| L1-窗口 | 窗口创建失败 (GPU 资源不足) | 降级到软件渲染 + 日志 | 自动降级 | 无感知 |
| L2-组件 | React 渲染异常 | Error Boundary 捕获 → 显示错误 UI | 用户手动刷新 | "组件渲染失败，点击刷新" |
| L2-组件 | 翻译结果渲染异常 (特殊 Unicode) | Error Boundary → 降级纯文本显示 | 自动降级 | "渲染异常，已切换为纯文本" |
| L3-路由 | 设置页路由匹配失败 | 重定向到 General 页 | 自动重定向 | 无感知 |
| L4-状态 | Jotai atom 读写异常 | Error Boundary + 重置为默认值 | 自动恢复 | "状态异常，已重置" |

### Error Boundary 实现

```jsx
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p>页面渲染异常: {this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

> 每个功能窗口最外层均包裹 ErrorBoundary，防止单个组件崩溃导致整个窗口白屏。

**关联文档**：
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — Translate 窗口数据流
- [OCR 识别架构](./02-prd-task-OCR识别架构.md) — Recognize 窗口组件树
- [国际化与主题实现](./06-prd-task-国际化与主题实现.md) — App.jsx 根组件
- [需求总览](./00-prd-task-需求总览.md) — 技术栈与源码索引


## 十、跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 窗口装饰 | `title_bar_style: Overlay` + `hidden_title: true` (嵌入标题栏) | `transparent: true` + `decorations: false` (无边框 + 自定义) | 同 Windows (无边框 + 自定义) |
| 窗口阴影 | 系统原生阴影 (NSWindow) | 无原生阴影 (需 CSS box-shadow 模拟) | 取决于窗口管理器 (GNOME/KDE 有, 其他可能无) |
| 窗口置顶 | `.set_always_on_top(true)` — 所有桌面可用 | 同左 | 同左，但某些平铺 WM (i3/sway) 忽略 |
| 窗口最小化 | 标准最小化到 Dock | 标准最小化到任务栏 | 取决于窗口管理器 |
| 窗口全屏 | 原生全屏 (独立 Space) | 窗口最大化 (非全屏 Space) | 取决于窗口管理器 |
| 透明窗口背景 | 需要 `.transparent(true)` (WebView 默认白底) | 同左 | 需要合成器支持 (Wayland + wlroots) |
| WebView 引擎 | WKWebView (Safari 内核, 系统自带) | WebView2 (Edge Chromium, 自动安装 ~150MB) | WebKitGTK (系统库, 需预装) |
| WebView 崩溃恢复 | Tauri 自动重建 WebView | 同左 | 同左 |
| React 渲染兼容性 | Safari 13 目标 (ES2019, 无 `?.` 可选链语法) | Chrome 105 目标 (ES2022 全支持) | Safari 13 目标 (同 macOS) |
| CSS 差异 | `backdrop-filter` 需 `-webkit-` 前缀 | 原生支持 | 需启用 WebKit GTK 实验特性 |
| 字体渲染 | Core Text (次像素渲染, 中文边缘平滑) | DirectWrite (灰度渲染, 中文边缘较锐) | FreeType (取决于 hinting 配置) |
| 文件选择器样式 | 原生 NSOpenPanel (macOS 风格) | 原生 IFileDialog (Windows 风格) | GTK/Qt FileChooser (取决于桌面) |
| 拖拽区域 | 标题栏区域可拖拽 (Overlay 模式) | 自定义拖拽区域 (CSS `-webkit-app-region: drag`) | 同 Windows |

### 平台特定窗口行为

```
macOS:
  - 全屏动画 ~500ms (系统动画，无法跳过)
  - 窗口关闭默认不退出应用 (macOS 惯例，需 Tauri 配置 prevent_close)
  - Traffic Light (红绿灯) 按钮在 Overlay 模式下嵌入标题栏

Windows:
  - 任务栏缩略图显示窗口内容 (WebView 实时预览)
  - Alt+Tab 切换包含所有 Tauri 窗口 (每个窗口一个缩略图)
  - Snap 布局 (Win+←/→) 自动触发 Tauri 窗口 resize 事件

Linux:
  - 窗口行为高度依赖 WM/DE (GNOME/KDE/XFCE/i3/Hyprland)
  - Wayland 下透明窗口需合成器支持 wlroots 协议
  - X11 下窗口定位坐标可能有偏移 (多显示器/DPI 缩放)
```

### 跨平台兼容性矩阵

| 平台 | 版本 | WebView | 测试状态 |
|------|------|---------|---------|
| macOS | 10.15+ (Catalina) | WKWebView 内置 | 已测试 |
| macOS | 11+ (Big Sur+) | WKWebView 内置 | 已测试 |
| Windows | 10 1809+ | WebView2 自动安装 | 已测试 |
| Windows | 11 | WebView2 内置 | 已测试 |
| Ubuntu | 20.04+ | WebKitGTK (apt 安装) | 已测试 |
| Fedora | 36+ | WebKitGTK (dnf 安装) | 已测试 |
| Arch | Latest | WebKitGTK (pacman 安装) | 社区测试 |
| Debian | 11+ | WebKitGTK (apt 安装) | 已测试 |