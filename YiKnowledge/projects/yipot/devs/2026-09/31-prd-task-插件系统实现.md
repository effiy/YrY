---

doc_type: module
prd_task_id: "YP-09-M05"
title: "插件与服务系统 — 开发方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 3
source_prd: "04-prd-插件与服务系统.md"

type: task
---

# 插件与服务系统 — 开发方案

> 来源 PRD：[04-prd-插件与服务系统.md](../../prds/2026-09/04-prd-插件与服务系统.md)
> 需求编号：YP-09-M05 · 优先级：P1 · 人天：3d

> **文档职责**：本文档定义插件架构、服务配置管理、插件生命周期的**实现方案与架构决策**（HOW/WHY），不含产品目标。

---

## 一、插件架构设计

### 1.1 插件接口规范

```typescript
// 每个插件模块的标准导出
interface PluginModule {
  info: PluginInfo;     // 元信息
  default: PluginImpl;  // 核心逻辑
  Config: React.FC;     // 配置界面 (可选)
}

interface PluginInfo {
  id: string;           // 唯一标识, 如 "baidu_translate"
  name: string;         // 显示名称, 如 "百度翻译"
  type: 'translate' | 'recognize' | 'tts' | 'collection';
  version: string;      // 语义化版本
  author: string;
  description: string;
  languages?: string[]; // 支持的语言列表 (翻译/OCR 类型)
  requirements?: string[]; // 依赖声明
}

// 翻译插件核心接口
interface TranslateImpl {
  translate(text: string, from: string, to: string): Promise<TranslateResult>;
}

// OCR 插件核心接口
interface RecognizeImpl {
  recognize(image: string): Promise<OCRResult>; // image 为 base64
}

// TTS 插件核心接口
interface TTSImpl {
  synthesize(text: string, lang: string): Promise<AudioBuffer>;
}

// 生词本插件核心接口
interface CollectionImpl {
  add(word: string, translation: string): Promise<void>;
}
```

### 1.2 目录结构

```
YiPot/src/
├── services/
│   ├── translate/          # 翻译插件 (12 个)
│   │   ├── baidu/
│   │   │   ├── info.ts     # 插件元信息
│   │   │   ├── index.ts    # translate() 实现
│   │   │   └── Config.tsx  # API Key 配置表单
│   │   ├── google/
│   │   ├── deepl/
│   │   └── ...
│   ├── recognize/          # OCR 插件 (4 个)
│   │   ├── baidu_accurate/
│   │   ├── baidu_general/
│   │   ├── intsig/
│   │   └── system/
│   ├── tts/                # TTS 插件 (3 个)
│   │   ├── baidu_tts/
│   │   ├── tencent_tts/
│   │   └── azure_tts/
│   └── collection/         # 生词本插件 (2 个)
│       ├── anki/
│       └── eudic/
└── lib/
    └── pluginLoader.ts     # 插件加载器
```

### 1.3 动态插件加载

```typescript
// pluginLoader.ts
class PluginLoader {
  private plugins: Map<string, PluginModule> = new Map();
  private pluginOrder: Map<string, string[]> = new Map(); // type → [pluginId...]
  
  // 加载内置插件 (编译期静态导入)
  async loadBuiltinPlugins(): Promise<void> {
    const builtinModules = import.meta.glob('../services/**/index.ts', {
      eager: true
    });
    
    for (const [path, module] of Object.entries(builtinModules)) {
      const plugin = (module as any).default as PluginModule;
      this.register(plugin);
    }
  }
  
  // 加载第三方插件 (运行时动态导入)
  async loadExternalPlugin(pluginDir: string): Promise<void> {
    // 1. 读取 info.ts 验证格式
    // 2. 动态 import index.ts
    // 3. 注册到 plugin map
  }
  
  // 按优先级获取服务列表
  getServicesByType(type: string): PluginModule[] {
    const order = this.pluginOrder.get(type) || [];
    return order
      .filter(id => this.plugins.get(id)?.info.type === type)
      .map(id => this.plugins.get(id)!);
  }
  
  // 更新服务优先级
  reorderServices(type: string, newOrder: string[]): void {
    this.pluginOrder.set(type, newOrder);
    persistOrder(type, newOrder); // 持久化到 store
  }
}
```

**决策理由**：使用 Vite 的 `import.meta.glob` 编译期扫描内置插件目录，零配置注册。第三方插件走运行时 `import()` 动态加载，实现插件隔离。

---

## 二、服务配置管理

### 2.1 配置模型

```typescript
interface ServiceConfig {
  id: string;           // plugin id
  enabled: boolean;     // 启用状态
  apiKey?: string;      // 加密存储
  apiSecret?: string;   // 加密存储
  baseUrl?: string;     // 自定义 API 地址 (私有化部署)
  priority: number;     // 排序权重
  instances: ServiceInstance[]; // 多账号支持
}

interface ServiceInstance {
  id: string;
  label: string;        // 用户自定义名称, 如 "公司百度翻译"
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
}
```

### 2.2 配置持久化

```typescript
// 配置读写通过 tauri-plugin-store
// 所有服务配置集中存储在 service_configs key 下
const store = new Store('.settings.dat');

async function saveServiceConfig(config: ServiceConfig): Promise<void> {
  // API Key 加密后再存盘
  if (config.apiKey) {
    config.apiKey = await encryptAES(config.apiKey);
  }
  await store.set(`service_${config.id}`, config);
  await store.save();
}
```

---

## 三、插件生命周期

```
[安装] → [加载] → [启用] → [运行] → [禁用] → [卸载]
   │        │       │        │        │        │
   │   验证info   配置面板   服务查询   配置保留   清理配置
   │   注册模块   注入实例   并行执行   可重新启用  删除目录
```

### 3.1 安装校验

```typescript
function validatePlugin(dir: string): ValidationResult {
  // 1. info.ts 存在且可解析
  const info = loadInfo(dir);
  if (!info) return { valid: false, error: '缺少 info.ts' };
  
  // 2. 版本兼容性检查
  if (!isCompatible(info.version, CURRENT_POT_VERSION)) {
    return { valid: false, error: `插件要求 Pot ≥ ${info.requirements?.[0]}` };
  }
  
  // 3. 同名检查
  if (pluginExists(info.id)) {
    return { valid: false, error: '同名插件已安装' };
  }
  
  return { valid: true };
}
```

### 3.2 插件隔离

第三方插件运行在受限环境中：
- 不能直接访问文件系统（须通过 Tauri invoke API）
- 不能直接访问网络（须通过统一 HTTP client，走代理配置）
- 崩溃不影响主进程（动态 import 的错误被 try-catch 捕获）

---

## 四、设计决策

| 决策 | 理由 |
|------|------|
| 动态 import 而非 iframe 沙箱 | Tauri 环境下 iframe 限制多，性能差；动态 import 天然隔离 |
| 编译期 glob 内置插件 | 零配置注册，开发体验好；内置插件不需要额外安装流程 |
| 拖拽排序将结果持久化 | 优先级配置属于高频调整项，不持久化则每次重启丢失排序 |
| 插件与服务共享加密方案 | 统一 AES 密钥派生机制，避免多套加密方案增加维护成本 |
| 卸载时配置保留 30 天 | 防止误操作导致配置丢失，期满自动清理 |

---

## 五、错误处理

| 错误 | 处理 |
|------|------|
| 插件 info.ts 缺失 | 安装失败，提示"插件格式不正确" |
| 插件版本不兼容 | 阻止安装，提示最低版本要求 |
| 插件加载异常 | 捕获 error，标记该插件为 "error" 状态，不影响其他插件 |
| 服务 API Key 为空 | 并行查询前过滤，该服务自动跳过 |
| 拖拽排序冲突 | 原子操作：拖拽完成一次性保存，不允许拖到非法位置 |

---

## 六、交叉引用

- 开发方案: [04-prd-task-翻译服务插件实现](./04-prd-task-翻译服务插件实现.md)
- 开发方案: [05-prd-task-OCR服务插件实现](./05-prd-task-OCR服务插件实现.md)
- 开发方案: [21-prd-task-并行调度](./21-prd-task-并行调度.md)
- PRD: [05-prd-翻译服务接口全景](../../prds/2026-09/05-prd-翻译服务接口全景.md)
- PRD: [06-prd-OCR服务接口全景](../../prds/2026-09/06-prd-OCR服务接口全景.md)