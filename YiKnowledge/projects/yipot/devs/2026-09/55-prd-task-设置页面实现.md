---

doc_type: module
prd_task_id: "YP-09-S26"
title: "设置页面架构 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "37-prd-设置页面架构.md"
tags: [开发方案, 设置, 配置, UI]

type: task
---

# 设置页面架构 — 开发方案

## 架构与数据流

```
Config/index.jsx (主框架)
     │
     ├── SideBar (左侧导航)
     │   ├── 分组: 通用 / 服务 / 工具 / 关于
     │   ├── 活跃状态: React Router NavLink activeClassName
     │   └── 依赖: routes/index.jsx (路由表)
     │
     ├── <Router> (右侧内容区, React.lazy 懒加载)
     │   │
     │   ├── General (通用设置)
     │   │   ├── 语言/主题/字体/字号 → tauri-plugin-store
     │   │   └── 代理/端口 → 影响全局 fetch
     │   │
     │   ├── Translate/Recognize/TTS/Collection (服务管理)
     │   │   ├── 服务列表: 扫描 services/{type}/ 目录自动发现
     │   │   ├── 排序: 拖拽调整服务优先级
     │   │   ├── 启用/禁用: toggle 即时生效
     │   │   └── Service/{Type}/ (单服务配置)
     │   │       ├── ConfigModal: API Key/参数编辑
     │   │       ├── SelectPluginModal: 从插件列表选择添加
     │   │       └── 依赖: services/{type}/{name}/info.ts (插件元信息)
     │   │
     │   ├── Hotkey (快捷键)
     │   │   ├── 录制器: keydown/keyup 事件捕获
     │   │   ├── 冲突检测: 全局已注册快捷键 Set
     │   │   └── 依赖: tauri-plugin-global-shortcut
     │   │
     │   ├── Backup (备份)
     │   │   ├── 本地: 导出/导入 JSON
     │   │   ├── WebDAV: 连接测试 + PUT/GET
     │   │   └── 阿里云 OSS: AK/SK 配置 + SDK 操作
     │   │
     │   ├── History (历史)
     │   │   └── 翻译历史列表 + 搜索 + 清空
     │   │
     │   └── About (关于)
     │       └── 版本号 / 开源许可 / GitHub 链接
     │
     └── 全局状态
         ├── Jotai configAtom (读写 tauri-plugin-store)
         ├── Jotai themeAtom (亮/暗/跟随系统)
         └── Jotai servicesAtom (服务启用/禁用/排序)
```

**上游依赖**: `config.rs` (Rust 配置读写) / `tauri-plugin-store` (`.pot.dat` 持久化) / `backup.rs` (备份操作)
**下游消费者**: 所有功能窗口 (Translate/OCR/Screenshot 读取配置) / Jotai atoms (UI 层配置缓存)

## 关键实现

### 主框架与路由

```jsx
// src/window/Config/index.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import SideBar from "./components/SideBar";

const General = lazy(() => import("./pages/General"));
const TranslateServices = lazy(() => import("./pages/TranslateServices"));
const RecognizeServices = lazy(() => import("./pages/RecognizeServices"));
const TTSServices = lazy(() => import("./pages/TTSServices"));
const CollectionServices = lazy(() => import("./pages/CollectionServices"));
const ServiceConfig = lazy(() => import("./pages/Service"));
const Hotkey = lazy(() => import("./pages/Hotkey"));
const Backup = lazy(() => import("./pages/Backup"));
const History = lazy(() => import("./pages/History"));
const About = lazy(() => import("./pages/About"));

export default function Config() {
  return (
    <div className="config-container">
      <SideBar />
      <div className="config-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<General />} />
            <Route path="/translate" element={<TranslateServices />} />
            <Route path="/recognize" element={<RecognizeServices />} />
            <Route path="/tts" element={<TTSServices />} />
            <Route path="/collection" element={<CollectionServices />} />
            <Route path="/service/:type/:id" element={<ServiceConfig />} />
            <Route path="/hotkey" element={<Hotkey />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
```

### 配置持久化 (Jotai + tauri-plugin-store)

```typescript
// src/stores/configAtom.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Store } from "tauri-plugin-store-api";

const store = new Store(".pot.dat");

// 基础配置 atom (带 debounce 写入)
export const configAtom = atom(
  async () => await store.get<Config>("config"),
  async (get, set, newConfig: Config) => {
    set(configAtom, newConfig); // 立即更新 UI
    // 500ms debounce 写入磁盘
    debouncedSave(newConfig);
  }
);

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(config: Config) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const current = await store.get<Config>("config");
    if (JSON.stringify(current) !== JSON.stringify(config)) {
      await store.set("config", config);
      await store.save();
    }
  }, 500);
}

// 主题 atom (立即生效)
export const themeAtom = atom(
  (get) => get(configAtom)?.general?.theme || "system",
  (get, set, theme: string) => {
    const config = get(configAtom);
    set(configAtom, { ...config, general: { ...config.general, theme } });
    applyTheme(theme); // 立即切换 CSS 变量
  }
);

// 服务列表 atom (自动发现)
export const servicesAtom = atom(async () => {
  const services = await scanServices(); // 扫描 services/{type}/ 目录
  const stored = await store.get<ServiceConfig[]>("services");
  return mergeServiceConfigs(services, stored);
});
```

### 服务自动发现

```typescript
// src/services/scanner.ts
export async function scanServices(type: "translate" | "recognize" | "tts" | "collection") {
  const modules = import.meta.glob(`@/services/${type}/**/info.ts`, { eager: true });
  return Object.entries(modules).map(([path, mod]) => {
    const dir = path.split("/").slice(-2, -1)[0]; // 服务目录名
    return {
      id: dir,
      type,
      path: path.replace("/info.ts", ""),
      ...(mod as any).default, // info.ts default export
    };
  });
}
```

### 配置 Schema

```typescript
// src/types/config.ts
interface ServiceConfig {
  id: string;
  enabled: boolean;
  order: number;
  config: Record<string, string>; // API Key 等敏感字段
}

interface GeneralConfig {
  language: string;
  theme: "light" | "dark" | "system";
  font: string;
  fontSize: number;
  proxy?: { host: string; port: number; username?: string; password?: string };
  port: number;
}

interface Config {
  general: GeneralConfig;
  services: {
    translate: ServiceConfig[];
    recognize: ServiceConfig[];
    tts: ServiceConfig[];
    collection: ServiceConfig[];
  };
  hotkeys: Record<string, string>;
  backup: { local: { path?: string }; webdav: WebDAVConfig; aliyun: AliyunConfig };
}

interface WebDAVConfig { url: string; username: string; password: string; }
interface AliyunConfig { bucket: string; region: string; ak: string; sk: string; }
```

### 快捷键录制器

```jsx
// src/window/Config/pages/Hotkey/index.jsx
export default function HotkeyPage() {
  const [recording, setRecording] = useState(null);
  const [hotkeys, setHotkeys] = useAtom(hotkeysAtom);
  const registeredKeys = useMemo(() => new Set(Object.values(hotkeys)), [hotkeys]);

  const handleKeyDown = useCallback((e) => {
    if (!recording) return;
    e.preventDefault();
    const combo = [e.ctrlKey && "Ctrl", e.altKey && "Alt", e.shiftKey && "Shift", e.metaKey && "Meta",
      e.key.toUpperCase()].filter(Boolean).join("+");

    if (registeredKeys.has(combo) && hotkeys[recording] !== combo) {
      alert(`快捷键 "${combo}" 已被 "${findConflictName(combo, hotkeys)}" 占用`);
      return;
    }
    setHotkeys((prev) => ({ ...prev, [recording]: combo }));
    setRecording(null);
  }, [recording, registeredKeys, hotkeys]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="hotkey-page">
      {Object.entries(hotkeys).map(([name, key]) => (
        <div key={name} className="hotkey-item">
          <label>{name}</label>
          <button onClick={() => setRecording(name)} className={recording === name ? "recording" : ""}>
            {recording === name ? "请按键..." : key}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 状态管理 | Jotai atoms (configAtom, themeAtom, servicesAtom) | 原子化, 按需订阅, 配合 `tauri-plugin-store` 异步读写 |
| 路由懒加载 | `React.lazy` + `Suspense` | 减少设置页首屏体积, 各页面按需加载 |
| 配置持久化防抖 | 500ms debounce + diff 比较 | 连续修改只触发一次磁盘写入, diff 避免无意义写入 |
| 服务自动发现 | `import.meta.glob` 扫描 `services/{type}/` 目录 | 新增服务零配置, 自动出现在服务列表页 |
| 配置文件损坏恢复 | 自动备份 `.pot.dat.bak` + 默认配置覆盖 | 不丢失用户数据, 弹窗提示 |
| 多开设置窗口 | `WebviewWindow::get_by_label("config")` 检查 | 不允许重复创建, 已存在则聚焦 |
| 快捷键冲突检测 | 全局 `Set` 记录已注册组合键 | 实时检测冲突, 显示冲突方名称 |

## 性能优化

| 优化项 | 措施 | 目标 |
|--------|------|------|
| 路由懒加载 | `React.lazy` 分包 | 首屏体积减少 60%+ |
| 配置写入防抖 | 500ms debounce | 连续修改只触发一次 I/O |
| diff 比较 | 写入前 JSON.stringify 比较 | 相同值不触发写入, 减少磁盘 I/O |
| 服务列表扫描 | `import.meta.glob` 编译时预扫描 | 零运行时开销 |
| 窗口预创建 | `WebviewWindowBuilder` | 打开设置页 < 500ms |

## 错误处理

| 场景 | 触发条件 | 用户提示 | 恢复策略 |
|------|----------|----------|----------|
| 配置文件损坏 | JSON 解析失败 | 弹窗 "配置已重置为默认值" | 自动备份 `.pot.dat.bak`, 默认配置覆盖 |
| 配置写入失败 | 磁盘满/权限不足 | 弹窗 "配置保存失败" | 保留内存中的修改 |
| 快捷键冲突 | 录制已占用快捷键 | 弹窗 "被 {功能名} 占用, 是否覆盖?" | 显示冲突方, 允许覆盖或重新录制 |
| 导入配置版本不兼容 | JSON 缺少字段 | 合并模式: 仅导入可识别字段 | 报告跳过的字段列表 |
| 字体未安装 | 用户选择未安装字体 | 显示 "字体不可用" + fallback 系统字体 | `document.fonts.check()` 检测 |
| 服务 Key 泄露风险 | 截图/日志 | 输入框 `type="password"` + 脱敏 | 日志仅显示前 4 + 后 4 位 |
| WebDAV 连接失败 | 保存时网络不通 | 本地保存 + 标记 "待同步" | 下次连接成功自动上传 |

## 交叉引用

- [43-prd-Rust配置备份错误处理](../prds/2026-09/43-prd-Rust配置备份错误处理.md) — Rust 层配置读写
- [39-prd-WebDAV阿里云备份](../prds/2026-09/39-prd-WebDAV阿里云备份.md) — WebDAV/阿里云备份细节
- [46-prd-ADR-插件架构](../prds/2026-09/46-prd-ADR-插件架构.md) — 插件目录约定
- [45-prd-ADR-Jotai选择](../prds/2026-09/45-prd-ADR-Jotai选择.md) — Jotai 状态管理方案
- [57-prd-task-WebDAV备份实现](./57-prd-task-WebDAV备份实现.md) — 备份功能开发方案
- [61-prd-task-Rust配置备份实现](./61-prd-task-Rust配置备份实现.md) — Rust 配置备份开发方案