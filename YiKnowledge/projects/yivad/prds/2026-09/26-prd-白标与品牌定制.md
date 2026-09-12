---
title: 白标与品牌定制
tags:
- 白标
- 品牌定制
- WhiteLabel
- 多租户
- 主题
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202609"
prd_task_id: YV-09-52
estimate_frontend: 0.3
review_status: 待评审
issue_type: 功能
roles:
- engineer
- qa
source_okr: [yivad-003]
---

# 白标与品牌定制

> 需求编号：YV-09-52 · 优先级：P2 · 人天：0.3d
> 依赖：YiAi 品牌配置接口（`services.brand.brand_service`）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| 品牌配置类型定义 | 新增 | `src/types/brand.ts` |
| 品牌配置 Composable | 新增 | `src/composables/useBrand.ts` |
| 品牌配置 API 服务 | 新增 | `src/services/brand.service.ts` |
| 品牌配置管理页面 | 新增 | `src/views/settings/BrandSettings.vue` |
| 品牌预览组件 | 新增 | `src/components/brand/BrandPreview.vue` |
| 品牌色选择器 | 新增 | `src/components/brand/ColorPicker.vue` |
| Logo 上传组件 | 新增 | `src/components/brand/LogoUploader.vue` |
| 动态 CSS 变量注入 | 新增 | `src/utils/brand-css.ts` |
| 品牌配置初始化 | 新增 | `src/boot/brand.ts` |
| 登录页品牌适配 | 修改 | `src/views/login/` 使用品牌配置 |
| 全局布局品牌适配 | 修改 | `src/layout/` 使用品牌 logo 和名称 |
| PWA Manifest 动态生成 | 修改 | `index.html` 注入品牌 meta 标签 |
| Favicon 动态替换 | 修改 | `src/utils/brand-css.ts` 动态更新 favicon |

## 涉及文件

```
YiVad/
└── src/
    ├── types/
    │   └── brand.ts                            # 新增：品牌配置类型定义
    ├── composables/
    │   └── useBrand.ts                         # 新增：品牌配置 Composable
    ├── services/
    │   └── brand.service.ts                    # 新增：品牌配置 API 服务
    ├── views/
    │   └── settings/
    │       └── BrandSettings.vue               # 新增：品牌配置管理页面
    ├── components/
    │   └── brand/
    │       ├── BrandPreview.vue                # 新增：品牌实时预览组件
    │       ├── ColorPicker.vue                 # 新增：品牌色选择器
    │       └── LogoUploader.vue                # 新增：Logo 上传组件
    ├── utils/
    │   └── brand-css.ts                        # 新增：动态 CSS 变量注入
    ├── boot/
    │   └── brand.ts                            # 新增：品牌配置初始化
    ├── layout/
    │   └── index.vue                           # 修改：使用品牌 logo 和名称
    ├── views/
    │   └── login/
    │       └── index.vue                       # 修改：登录页品牌适配
    └── index.html                              # 修改：注入品牌 meta 标签
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-52 |
| 模块 | 系统设置 |
| 优先级 | **P2**（多租户 SaaS 化基础能力） |
| 前端人天 | 0.3d |
| 后端人天 | 0.2d（品牌配置 CRUD 接口） |
| 依赖 | YiAi `services.brand.brand_service` 提供品牌配置存取 |

---

## 背景

YiVad 作为企业管理后台，未来可能以 SaaS 模式提供给多个组织使用。不同组织需要看到自己的品牌标识（Logo、名称、主题色），而非 YiVad 的默认品牌。当前系统所有品牌元素（Logo、标题、颜色）均为硬编码，无法按组织定制。白标能力是 SaaS 化部署的基础要求。

**核心问题：**

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **品牌标识硬编码** -- Logo、应用名称、favicon 在代码中写死 | **高** | 无法为不同客户提供定制化品牌体验 |
| 2 | **主题色固定** -- Element Plus 主题色为固定的 `#409eff` | **中** | 与客户品牌色不一致，视觉割裂 |
| 3 | **登录页无品牌定制** -- 登录页显示统一的 YiVad 品牌 | **中** | 客户员工登录时看到的是 YiVad 品牌而非自己的品牌 |
| 4 | **无品牌配置管理** -- 管理员无法在后台修改品牌设置 | **中** | 品牌变更需要修改代码重新部署 |
| 5 | **多租户品牌隔离缺失** -- 无按组织隔离品牌配置的机制 | **中** | 无法同时服务多个品牌客户 |

## 一、现状分析

### 当前品牌元素矩阵

| 品牌元素 | 当前状态 | 期望状态 | 差距 |
|------|---------|---------|------|
| 应用 Logo | 硬编码在 `layout/` 组件中 | 从品牌配置动态加载，支持上传替换 | 完全不可配置 |
| 应用名称 | 硬编码为 "YiVad" | 从品牌配置读取，显示为客户公司名称 | 完全不可配置 |
| 浏览器标题 | 硬编码 `<title>YiVad</title>` | 动态替换为品牌名称 | 完全不可配置 |
| Favicon | 硬编码 `/favicon.ico` | 支持上传自定义 favicon | 完全不可配置 |
| 主题色 | 硬编码 SCSS 变量 `--el-color-primary: #409eff` | 从品牌配置读取，动态注入 CSS 变量 | 完全不可配置 |
| 登录页 Logo | 无 Logo，仅显示"YiVad"文字 | 展示客户自定义 Logo 和欢迎语 | 完全不可配置 |
| 登录页背景 | 默认渐变背景 | 支持上传自定义背景图 | 完全不可配置 |
| 邮件模板 | 无品牌定制 | 邮件头部显示客户 Logo 和品牌色 | 完全不可配置 |
| PWA 名称/图标 | 硬编码在 `manifest.json` | 动态生成，匹配品牌配置 | 完全不可配置 |

### 根因分析矩阵

| 缺失项 | 根因 | 影响链 |
|--------|------|--------|
| 品牌配置数据模型 | 未定义品牌配置的 MongoDB 存储结构 | 无法存储和读取品牌配置 |
| 品牌配置管理 API | 未实现品牌配置 CRUD 接口 | 前端无法获取和更新品牌配置 |
| 动态 CSS 变量注入 | 主题色硬编码在 SCSS 中，编译后不可变 | 无法在运行时切换主题色 |
| 品牌资源存储 | 无 Logo/Favicon 上传和存储机制 | 无法上传自定义品牌素材 |
| 多租户品牌隔离 | 未实现按组织/租户加载品牌配置 | 无法为不同租户提供不同品牌 |

---

## 二、设计决策

### 品牌配置存储策略

| 维度 | MongoDB 单集合 | 独立配置文件 | 决策 |
|------|--------------|------------|------|
| 动态修改 | 通过 API 实时修改，无需重启 | 需修改文件重新部署 | **MongoDB** |
| 多租户隔离 | 通过 `tenant_id` 字段隔离 | 每租户一个文件，管理复杂 | **MongoDB** |
| 缓存友好 | 可缓存到 Redis/内存 | 文件系统缓存 | **MongoDB** |
| 版本管理 | 需要自行实现历史记录 | Git 天然支持 | 品牌配置变更频率低，历史记录非强需求 |

**决策：** 品牌配置存储在 MongoDB `brand_configs` 集合中，前端应用启动时通过 API 加载品牌配置并缓存到 Pinia store。

### 主题色注入方式

| 策略 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| CSS 变量覆盖 | 运行时通过 JS 设置 CSS 自定义属性 | 简单、直接、无需构建 | 需确保所有组件使用 CSS 变量 |
| 构建时替换 | 构建时通过环境变量替换 SCSS 变量 | 无运行时开销 | 每个品牌需单独构建 |
| Element Plus 主题 API | 使用 Element Plus 的 `useTheme` 或 CSS 变量覆盖 | 官方支持，兼容性好 | 仅覆盖 Element Plus 组件 |

**决策：** 采用 CSS 变量覆盖策略。YiVad 已使用 Element Plus CSS 变量（如 `--el-color-primary`），运行时通过 `document.documentElement.style.setProperty` 覆盖这些变量即可实现主题色切换。同时生成 primary 色的衍生色阶（light-3, light-5, light-7, light-9, dark-2）。

### 品牌配置字段

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `tenant_id` | string | 租户标识（多租户隔离） | `default` |
| `app_name` | string | 应用名称（浏览器标题、登录页标题） | `YiVad` |
| `company_name` | string | 公司名称（显示在页脚、邮件） | `YiVad` |
| `logo_url` | string | Logo 图片 URL（侧边栏、登录页） | 默认 YiVad Logo |
| `logo_small_url` | string | 小尺寸 Logo（折叠侧边栏） | 默认 YiVad 小 Logo |
| `favicon_url` | string | Favicon URL | 默认 favicon.ico |
| `primary_color` | string | 主题色（HEX 格式） | `#409eff` |
| `login_background_url` | string | 登录页背景图 URL | 默认渐变 |
| `login_welcome_text` | string | 登录页欢迎语 | `欢迎使用` |
| `footer_text` | string | 页脚文字 | `YiVad` |
| `pwa_enabled` | boolean | 是否启用 PWA | `false` |
| `updated_at` | string | 最后更新时间 | -- |

---

## 三、目标架构

```
┌──────────────────────────────────────────────────────────────────┐
│                     White-Label & Brand System                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    YiAi 后端 (品牌服务)                     │    │
│  │                                                             │    │
│  │  ┌────────────────────────────────────────────────────┐    │    │
│  │  │  brand_service                                      │    │    │
│  │  │  - get_brand_config(tenant_id) → BrandConfig        │    │    │
│  │  │  - update_brand_config(tenant_id, config) → void    │    │    │
│  │  │  - upload_brand_asset(tenant_id, file) → url        │    │    │
│  │  │  - delete_brand_asset(tenant_id, asset_key) → void  │    │    │
│  │  │  - export_brand_config(tenant_id) → JSON            │    │    │
│  │  │  - import_brand_config(tenant_id, config) → void    │    │    │
│  │  └───────────────────────┬────────────────────────────┘    │    │
│  │                          │                                  │    │
│  │                          ▼                                  │    │
│  │  ┌────────────────────────────────────────────────────┐    │    │
│  │  │  brand_configs (MongoDB)                            │    │    │
│  │  │  - tenant_id: 唯一索引                               │    │    │
│  │  │  - 品牌素材文件存储在 static_files 集合               │    │    │
│  │  └────────────────────────────────────────────────────┘    │    │
│  │                                                             │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    YiVad 前端 (品牌层)                      │    │
│  │                                                             │    │
│  │  ┌────────────────────────────────────────────────────┐    │    │
│  │  │  boot/brand.ts (应用初始化)                          │    │    │
│  │  │  - 调用 brand_service.get_brand_config()             │    │    │
│  │  │  - 注入 CSS 变量 (--el-color-primary 等)              │    │    │
│  │  │  - 更新 document.title 和 favicon                    │    │    │
│  │  │  - 更新 PWA manifest                                │    │    │
│  │  │  - 存储品牌配置到 Pinia brandStore                   │    │    │
│  │  └───────────────────────┬────────────────────────────┘    │    │
│  │                          │                                  │    │
│  │                          ▼                                  │    │
│  │  ┌────────────────────────────────────────────────────┐    │    │
│  │  │  useBrand() Composable                              │    │    │
│  │  │  - brandConfig: 响应式品牌配置                        │    │    │
│  │  │  - isLoaded: 品牌配置是否加载完成                     │    │    │
│  │  │  - updateBrand(config): 更新品牌配置                  │    │    │
│  │  │  - resetBrand(): 重置为默认品牌                       │    │    │
│  │  │  - exportBrand(): 导出品牌配置 JSON                   │    │    │
│  │  │  - importBrand(json): 导入品牌配置                    │    │    │
│  │  └───────────────────────┬────────────────────────────┘    │    │
│  │                          │                                  │    │
│  │         ┌────────────────┼────────────────┐                 │    │
│  │         ▼                ▼                ▼                 │    │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │  Layout   │  │  Login Page  │  │  PWA Layer   │         │    │
│  │  │  - Logo   │  │  - Logo      │  │  - manifest  │         │    │
│  │  │  - 标题   │  │  - 背景图     │  │  - 图标      │         │    │
│  │  │  - 页脚   │  │  - 欢迎语     │  │  - 主题色    │         │    │
│  │  └──────────┘  └──────────────┘  └──────────────┘         │    │
│  │                                                             │    │
│  │  ┌────────────────────────────────────────────────────┐    │    │
│  │  │  BrandSettings.vue (品牌配置管理页面)                 │    │    │
│  │  │  ┌─────────────┐  ┌─────────────┐                   │    │    │
│  │  │  │ 配置表单     │  │ BrandPreview│                   │    │    │
│  │  │  │ - 应用名称   │  │ - 实时预览   │                   │    │    │
│  │  │  │ - 公司名称   │  │ - 登录页效果 │                   │    │    │
│  │  │  │ - 主题色     │  │ - 侧边栏效果 │                   │    │    │
│  │  │  │ - Logo上传   │  │ - 表格效果   │                   │    │    │
│  │  │  │ - Favicon    │  │              │                   │    │    │
│  │  │  │ - 登录背景   │  │              │                   │    │    │
│  │  │  │ - 欢迎语     │  │              │                   │    │    │
│  │  │  └─────────────┘  └─────────────┘                   │    │    │
│  │  └────────────────────────────────────────────────────┘    │    │
│  │                                                             │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 四、具体改动

### 4.1 品牌配置类型定义

**文件：** `src/types/brand.ts`（新增）

```typescript
// 品牌配置
export interface BrandConfig {
  tenantId: string;
  appName: string;
  companyName: string;
  logoUrl: string;
  logoSmallUrl: string;
  faviconUrl: string;
  primaryColor: string;
  loginBackgroundUrl: string;
  loginWelcomeText: string;
  footerText: string;
  pwaEnabled: boolean;
  updatedAt: string;
}

// 品牌配置更新参数
export interface BrandConfigUpdate {
  appName?: string;
  companyName?: string;
  logoUrl?: string;
  logoSmallUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  loginBackgroundUrl?: string;
  loginWelcomeText?: string;
  footerText?: string;
  pwaEnabled?: boolean;
}

// 默认品牌配置
export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  tenantId: 'default',
  appName: 'YiVad',
  companyName: 'YiVad',
  logoUrl: '/assets/logo.svg',
  logoSmallUrl: '/assets/logo-small.svg',
  faviconUrl: '/favicon.ico',
  primaryColor: '#409eff',
  loginBackgroundUrl: '',
  loginWelcomeText: '欢迎使用 YiVad 管理后台',
  footerText: 'YiVad',
  pwaEnabled: false,
  updatedAt: '',
};

// 品牌色衍生色阶
export interface ColorPalette {
  base: string;
  light3: string;
  light5: string;
  light7: string;
  light9: string;
  dark2: string;
}
```

### 4.2 品牌配置 API 服务

**文件：** `src/services/brand.service.ts`（新增）

```typescript
import { RequestHttp } from '@/utils/request';
import type { BrandConfig, BrandConfigUpdate } from '@/types/brand';

const http = new RequestHttp();

export const brandService = {
  // 获取品牌配置
  async getBrandConfig(): Promise<BrandConfig> {
    return http.post('/', {
      module_name: 'services.brand.brand_service',
      method_name: 'get_brand_config',
      parameters: {},
    });
  },

  // 更新品牌配置
  async updateBrandConfig(config: BrandConfigUpdate): Promise<void> {
    return http.post('/', {
      module_name: 'services.brand.brand_service',
      method_name: 'update_brand_config',
      parameters: { config },
    });
  },

  // 上传品牌素材
  async uploadBrandAsset(file: File, assetKey: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset_key', assetKey);
    return http.post('/upload-brand-asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 删除品牌素材
  async deleteBrandAsset(assetKey: string): Promise<void> {
    return http.post('/', {
      module_name: 'services.brand.brand_service',
      method_name: 'delete_brand_asset',
      parameters: { asset_key: assetKey },
    });
  },

  // 导出品牌配置
  async exportBrandConfig(): Promise<BrandConfig> {
    return http.post('/', {
      module_name: 'services.brand.brand_service',
      method_name: 'export_brand_config',
      parameters: {},
    });
  },

  // 导入品牌配置
  async importBrandConfig(config: BrandConfig): Promise<void> {
    return http.post('/', {
      module_name: 'services.brand.brand_service',
      method_name: 'import_brand_config',
      parameters: { config },
    });
  },
};
```

### 4.3 动态 CSS 变量注入工具

**文件：** `src/utils/brand-css.ts`（新增）

```typescript
import type { BrandConfig, ColorPalette } from '@/types/brand';

// 十六进制颜色转 RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 64, g: 158, b: 255 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// RGB 转十六进制
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
    .join('');
}

// 混合颜色（用于生成衍生色阶）
function mixColor(hex: string, mixColor: string, weight: number): string {
  const c1 = hexToRgb(hex);
  const c2 = hexToRgb(mixColor);
  const r = c1.r * (1 - weight) + c2.r * weight;
  const g = c1.g * (1 - weight) + c2.g * weight;
  const b = c1.b * (1 - weight) + c2.b * weight;
  return rgbToHex(r, g, b);
}

// 生成品牌色衍生色阶
export function generateColorPalette(primaryColor: string): ColorPalette {
  return {
    base: primaryColor,
    light3: mixColor(primaryColor, '#ffffff', 0.3),
    light5: mixColor(primaryColor, '#ffffff', 0.5),
    light7: mixColor(primaryColor, '#ffffff', 0.7),
    light9: mixColor(primaryColor, '#ffffff', 0.9),
    dark2: mixColor(primaryColor, '#000000', 0.2),
  };
}

// 注入 CSS 变量
export function injectBrandCssVariables(config: BrandConfig): void {
  const root = document.documentElement;
  const palette = generateColorPalette(config.primaryColor);

  root.style.setProperty('--el-color-primary', palette.base);
  root.style.setProperty('--el-color-primary-light-3', palette.light3);
  root.style.setProperty('--el-color-primary-light-5', palette.light5);
  root.style.setProperty('--el-color-primary-light-7', palette.light7);
  root.style.setProperty('--el-color-primary-light-9', palette.light9);
  root.style.setProperty('--el-color-primary-dark-2', palette.dark2);

  // 设置品牌色 RGB 值（用于 rgba 透明度场景）
  const rgb = hexToRgb(config.primaryColor);
  root.style.setProperty('--brand-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

// 更新文档标题
export function updateDocumentTitle(config: BrandConfig): void {
  document.title = config.appName;
}

// 更新 Favicon
export function updateFavicon(config: BrandConfig): void {
  if (!config.faviconUrl) return;
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (link) {
    link.href = config.faviconUrl;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = config.faviconUrl;
    document.head.appendChild(newLink);
  }
}

// 动态更新 PWA Manifest
export function updatePwaManifest(config: BrandConfig): void {
  const manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
  if (!manifestLink) return;

  const manifest = {
    name: config.appName,
    short_name: config.appName,
    theme_color: config.primaryColor,
    background_color: '#ffffff',
    icons: [
      { src: config.logoUrl, sizes: '192x192', type: 'image/png' },
      { src: config.logoUrl, sizes: '512x512', type: 'image/png' },
    ],
  };

  manifestLink.href =
    'data:application/json;base64,' +
    btoa(JSON.stringify(manifest));
}

// 重置所有品牌 CSS 变量
export function resetBrandCssVariables(): void {
  const root = document.documentElement;
  root.style.removeProperty('--el-color-primary');
  root.style.removeProperty('--el-color-primary-light-3');
  root.style.removeProperty('--el-color-primary-light-5');
  root.style.removeProperty('--el-color-primary-light-7');
  root.style.removeProperty('--el-color-primary-light-9');
  root.style.removeProperty('--el-color-primary-dark-2');
  root.style.removeProperty('--brand-primary-rgb');
}
```

### 4.4 useBrand Composable

**文件：** `src/composables/useBrand.ts`（新增）

```typescript
import { ref, computed } from 'vue';
import { brandService } from '@/services/brand.service';
import { injectBrandCssVariables, updateDocumentTitle, updateFavicon } from '@/utils/brand-css';
import type { BrandConfig, BrandConfigUpdate } from '@/types/brand';
import { DEFAULT_BRAND_CONFIG } from '@/types/brand';
import { ElMessage } from 'element-plus';

// 全局品牌配置（单例）
const brandConfig = ref<BrandConfig>({ ...DEFAULT_BRAND_CONFIG });
const isLoaded = ref(false);

export function useBrand() {
  // 加载品牌配置
  async function loadBrandConfig(): Promise<void> {
    try {
      const config = await brandService.getBrandConfig();
      brandConfig.value = config;
      applyBrandConfig(config);
      isLoaded.value = true;
    } catch (e) {
      // 加载失败时使用默认配置
      console.warn('[Brand] Failed to load brand config, using defaults');
      applyBrandConfig(DEFAULT_BRAND_CONFIG);
      isLoaded.value = true;
    }
  }

  // 应用品牌配置
  function applyBrandConfig(config: BrandConfig): void {
    injectBrandCssVariables(config);
    updateDocumentTitle(config);
    updateFavicon(config);
    // PWA manifest 更新在品牌配置有变化时触发
  }

  // 更新品牌配置
  async function updateBrand(update: BrandConfigUpdate): Promise<void> {
    try {
      await brandService.updateBrandConfig(update);
      // 合并更新
      brandConfig.value = { ...brandConfig.value, ...update, updatedAt: new Date().toISOString() };
      applyBrandConfig(brandConfig.value);
      ElMessage.success('品牌配置已更新');
    } catch (e) {
      ElMessage.error('品牌配置更新失败');
      throw e;
    }
  }

  // 重置为默认品牌
  async function resetBrand(): Promise<void> {
    await updateBrand({ ...DEFAULT_BRAND_CONFIG });
  }

  // 导出品牌配置
  async function exportBrand(): Promise<string> {
    const config = await brandService.exportBrandConfig();
    return JSON.stringify(config, null, 2);
  }

  // 导入品牌配置
  async function importBrand(json: string): Promise<void> {
    const config = JSON.parse(json) as BrandConfig;
    await brandService.importBrandConfig(config);
    brandConfig.value = config;
    applyBrandConfig(config);
    ElMessage.success('品牌配置已导入');
  }

  const hasCustomBrand = computed(
    () => brandConfig.value.primaryColor !== DEFAULT_BRAND_CONFIG.primaryColor ||
         brandConfig.value.appName !== DEFAULT_BRAND_CONFIG.appName
  );

  return {
    brandConfig,
    isLoaded,
    hasCustomBrand,
    loadBrandConfig,
    updateBrand,
    resetBrand,
    exportBrand,
    importBrand,
  };
}
```

### 4.5 品牌配置初始化

**文件：** `src/boot/brand.ts`（新增）

```typescript
import { useBrand } from '@/composables/useBrand';

export async function initBrand(): Promise<void> {
  const { loadBrandConfig } = useBrand();
  await loadBrandConfig();
}
```

在 `main.ts` 中调用：
```typescript
import { initBrand } from '@/boot/brand';

async function bootstrap() {
  await initBrand(); // 在 Vue 应用挂载前加载品牌配置
  const app = createApp(App);
  // ...
  app.mount('#app');
}
bootstrap();
```

### 4.6 BrandPreview 品牌预览组件

**文件：** `src/components/brand/BrandPreview.vue`（新增）

核心功能：
- 实时预览品牌配置效果（修改表单时即时反映）
- 预览区域包含：模拟侧边栏（Logo + 名称）、模拟登录页（Logo + 背景 + 欢迎语）、模拟表格（按钮/链接使用主题色）
- 预览区与配置表单并排显示（桌面端左右分栏，移动端上下排列）
- 预览区使用缩小的 iframe 或独立渲染区域
- 使用 `watch` 监听配置变更，实时更新预览

### 4.7 样式

**文件：** `src/styles/brand-settings.scss`（新增）

```scss
.brand-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__preview {
    position: sticky;
    top: 80px;
    align-self: start;
  }
}

.brand-preview {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  background: var(--el-bg-color);

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--el-color-primary);
    color: #fff;

    img {
      width: 24px;
      height: 24px;
    }
  }

  &__sidebar {
    width: 60px;
    padding: 12px 8px;
    background: var(--el-bg-color-page);
    border-right: 1px solid var(--el-border-color);
  }

  &__login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background-size: cover;
    background-position: center;

    img {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    &-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
  }

  &__button {
    padding: 8px 16px;
    background: var(--el-color-primary);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 14px;
  }
}

.color-picker-preset {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  &__item {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 150ms;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &--active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
    }
  }
}
```

---

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义品牌配置类型接口 | `types/brand.ts` | TypeScript 类型检查通过 | 0.02 |
| 2 | 实现品牌配置 API 服务 | `services/brand.service.ts` | 接口调用返回正确数据结构 | 0.02 |
| 3 | 实现动态 CSS 变量注入工具 | `utils/brand-css.ts` | 设置 primaryColor 后页面主题色变化 | 0.04 |
| 4 | 实现 useBrand Composable | `composables/useBrand.ts` | 加载/更新/重置/导出/导入功能正常 | 0.04 |
| 5 | 实现品牌配置初始化 | `boot/brand.ts` | 应用启动时加载品牌配置并注入 CSS | 0.01 |
| 6 | 实现 BrandSettings 管理页面 | `views/settings/BrandSettings.vue` | 配置表单正常提交，配置生效 | 0.06 |
| 7 | 实现 BrandPreview 组件 | `components/brand/BrandPreview.vue` | 实时预览正常，与配置表单联动 | 0.04 |
| 8 | 实现 ColorPicker 组件 | `components/brand/ColorPicker.vue` | 颜色选择器 + 预设色板正常 | 0.02 |
| 9 | 实现 LogoUploader 组件 | `components/brand/LogoUploader.vue` | Logo 上传、预览、删除正常 | 0.02 |
| 10 | 登录页品牌适配 | 修改 `views/login/index.vue` | 登录页显示自定义 Logo/背景/欢迎语 | 0.02 |
| 11 | 布局组件品牌适配 | 修改 `layout/index.vue` | 侧边栏 Logo 和标题使用品牌配置 | 0.01 |
| 12 | 样式文件 | `styles/brand-settings.scss` | 品牌设置页面样式正常 | 0.01 |
| 13 | 组件测试 | 测试文件 | 6 个测试场景通过 | 0.01 |

**总计：** 0.3d

---

## 六、测试规格

### Scenario 1: 品牌配置加载
- **GIVEN** 系统中已为当前租户配置了品牌（主题色 `#16a34a`，应用名称"绿洲管理"）
- **WHEN** 用户打开 YiVad 应用
- **THEN** 页面加载后，浏览器标题显示"绿洲管理"，Element Plus 主题色变为绿色，侧边栏显示自定义 Logo 和"绿洲管理"标题

### Scenario 2: 更新品牌主题色
- **GIVEN** 管理员打开品牌配置页面
- **WHEN** 管理员在颜色选择器中选择 `#dc2626`（红色），点击保存
- **THEN** 页面主题色立即切换为红色，所有按钮、链接、高亮元素使用红色系，BrandPreview 组件实时显示红色主题效果

### Scenario 3: 上传自定义 Logo
- **GIVEN** 管理员打开品牌配置页面
- **WHEN** 管理员点击 Logo 上传区域，选择一张 PNG 图片（200x60px），点击保存
- **THEN** 侧边栏和登录页显示新上传的 Logo，Logo 保持原始宽高比，容器内自适应缩放

### Scenario 4: 登录页品牌定制
- **GIVEN** 管理员已配置登录页背景图和欢迎语"欢迎使用绿洲管理系统"
- **WHEN** 用户访问登录页
- **THEN** 登录页背景显示自定义图片，中央显示 Logo 和"欢迎使用绿洲管理系统"文字，登录表单样式与主题色一致

### Scenario 5: 品牌配置导出导入
- **GIVEN** 管理员已配置完整的品牌设置
- **WHEN** 管理员点击"导出配置"按钮，下载 JSON 文件；然后在另一个环境中点击"导入配置"，选择该 JSON 文件
- **THEN** 导入后品牌配置与原环境完全一致，包括主题色、Logo URL、应用名称等所有字段

### Scenario 6: 重置为默认品牌
- **GIVEN** 当前品牌配置已修改为自定义品牌
- **WHEN** 管理员点击"重置为默认"按钮并确认
- **THEN** 所有品牌配置恢复为默认值（主题色 `#409eff`、应用名称"YiVad"），页面外观恢复为默认样式

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| Logo 图片加载失败导致布局错乱 | 中 | 低 | 低 | Logo 组件设置固定宽高和 fallback 占位图 | 图片加载失败时显示默认 YiVad Logo |
| 主题色与白色/黑色对比度不足 | 低 | 中 | 低 | 颜色选择器验证 WCAG AA 对比度（4.5:1） | 提示用户选择对比度更高的颜色 |
| 品牌配置加载阻塞首屏渲染 | 中 | 中 | 中 | 使用默认配置先渲染，品牌配置加载后平滑切换 | 设置 3 秒超时，超时后使用默认配置 |
| 多租户品牌配置加载错误 | 中 | 高 | 中 | 后端通过 Token 中的 tenant_id 自动选择配置 | 配置加载失败时回退到默认品牌 |
| CSS 变量覆盖不完整 | 低 | 低 | 低 | 覆盖 Element Plus 主要 CSS 变量，测试所有组件 | 补充遗漏的 CSS 变量覆盖 |

---

## 八、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 品牌配置导致页面样式异常 | 在 BrandSettings 页面点击"重置为默认" | 品牌外观 | < 1min |
| 品牌配置加载失败导致白屏 | 后端返回默认配置，前端跳过品牌初始化 | 品牌外观 | 自动恢复 |
| 上传的 Logo 文件损坏 | 删除损坏的 Logo，重新上传或使用默认 Logo | Logo 显示 | < 2min |
| 导入的配置导致问题 | 使用导出功能恢复之前保存的配置 | 品牌配置 | < 3min |
| CSS 变量注入导致性能问题 | 移除 `injectBrandCssVariables` 调用 | 主题色 | < 2min |

**回滚验证：**
- 回滚后页面主题色恢复为默认 `#409eff`
- 回滚后应用名称恢复为"YiVad"
- 回滚后 Logo 恢复为默认 YiVad Logo
- 回滚后 `pnpm build` 构建成功

---

## 九、设计决策记录

### D-01: CSS 变量覆盖而非构建时替换

**背景：** 主题色切换可以在构建时或运行时实现。
**决策：** 运行时通过 JS 设置 CSS 自定义属性覆盖 Element Plus 变量。
**权衡：** 首次加载时可能有短暂的颜色闪烁（默认色 → 自定义色），但避免了每个品牌单独构建的复杂性。
**后果：** 需在 `index.html` 中添加内联样式，设置默认主题色，避免闪烁。如果闪烁问题严重，可考虑 SSR 或构建时注入。

### D-02: 品牌配置存储于 MongoDB 而非配置文件

**背景：** 品牌配置可以存储在 MongoDB 或静态配置文件中。
**决策：** 存储在 MongoDB `brand_configs` 集合中，通过 API 实时读写。
**权衡：** 依赖数据库可用性，但支持管理后台在线修改，无需重新部署。
**后果：** 如果数据库不可用，品牌配置加载失败，降级为默认品牌。

### D-03: 品牌色仅修改 primary 色

**背景：** 完整的品牌定制需要修改多个颜色（primary、success、warning、danger）。
**决策：** 第一阶段仅支持修改 primary 色，其他语义色保持不变。
**权衡：** 减少了配置复杂度，但品牌定制灵活性有限。
**后果：** 如果用户需要修改完整色板，可在后续版本中扩展为完整主题编辑器。

### D-04: 品牌配置与租户绑定

**背景：** 多租户场景下，每个租户需要独立的品牌配置。
**决策：** 品牌配置通过 `tenant_id` 隔离，后端根据当前用户的 `tenant_id` 自动选择配置。
**权衡：** 单租户部署时 `tenant_id` 固定为 `default`，不影响使用。
**后果：** 多租户功能的实现依赖于用户认证和租户识别机制的完善。

---

## 十、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| 品牌配置加载耗时 | Performance API | > 1s | 品牌配置 API 响应时间 |
| 品牌配置加载成功率 | 前端错误捕获 | < 99% | 是否频繁回退到默认配置 |
| 品牌配置修改频率 | 前端埋点 | -- | 品牌配置变更频率 |
| 主题色切换次数 | 前端埋点 | -- | 用户主动修改主题色的频率 |
| 品牌配置导出导入次数 | 前端埋点 | -- | 配置迁移频率 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `DEBUG` | 品牌配置加载 | `[Brand] Loading brand config for tenant=default` |
| `INFO` | 品牌配置更新 | `[Brand] Brand config updated: primaryColor=#16a34a` |
| `WARN` | 品牌配置加载失败 | `[Brand] Failed to load brand config, falling back to default` |
| `ERROR` | Logo 加载失败 | `[Brand] Logo image failed to load: https://...` |

---

## 十一、代码审查检查清单

- [ ] `types/brand.ts` 中 BrandConfig 接口字段完整，DEFAULT_BRAND_CONFIG 正确
- [ ] `brand.service.ts` 中所有 API 调用使用正确的 RPC 信封格式
- [ ] `brand-css.ts` 中颜色衍生算法正确，CSS 变量注入覆盖所有 Element Plus 变量
- [ ] `brand-css.ts` 中 favicon 更新逻辑正确，避免重复创建 link 标签
- [ ] `useBrand.ts` 中 loadBrandConfig 失败时降级为默认配置
- [ ] `boot/brand.ts` 在 Vue 应用挂载前完成品牌配置加载
- [ ] `BrandSettings.vue` 表单验证完整，提交后配置即时生效
- [ ] `BrandPreview.vue` 实时预览与配置表单联动，watch 依赖正确
- [ ] `ColorPicker.vue` 颜色格式验证正确（HEX 6 位），预设色板合理
- [ ] `LogoUploader.vue` 文件类型/大小限制正确，上传预览正常
- [ ] 登录页和布局组件正确使用 `useBrand().brandConfig` 而非硬编码
- [ ] CSS 变量覆盖不会影响其他非 Element Plus 组件
- [ ] `vue-tsc --noEmit` 类型检查通过

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 自定义主题色与白色文字对比度不足 | 用户选择浅色（如 `#f0f0f0`）作为 primary 色 | 颜色选择器未验证对比度 | 在 ColorPicker 中验证 WCAG AA 对比度（至少 4.5:1），不满足时显示警告 |
| 2 | Logo 图片过大导致布局偏移 | 用户上传 2000x1000px 的 Logo | 未限制 Logo 尺寸和文件大小 | 前端限制 Logo 最大尺寸 200x60px、文件大小 500KB，后端压缩大图 |
| 3 | 品牌配置未缓存导致每次刷新都请求 | 用户每次刷新页面都加载品牌配置，首屏变慢 | 品牌配置未缓存到 localStorage | 将品牌配置缓存到 localStorage（TTL 1 小时），优先使用缓存，后台静默更新 |
| 4 | 品牌配置更新后其他标签页未同步 | 在标签页 A 更新品牌配置，标签页 B 仍显示旧配置 | 品牌配置存储在 Pinia，未跨标签页同步 | 使用 `BroadcastChannel` API 或 `localStorage` 事件跨标签页同步品牌配置变更 |
| 5 | 主题色切换时页面闪烁 | primary 色从蓝色切换到红色时，先恢复默认色再切换 | CSS 变量更新是异步的，渲染存在间隙 | 使用 `requestAnimationFrame` 批量更新 CSS 变量，或使用 CSS transition 平滑过渡 |
| 6 | 导出配置中包含敏感信息 | 导出的 JSON 包含 Logo URL 等可能含有认证信息的字段 | 未对导出内容进行脱敏处理 | 导入时重新上传 Logo 等素材文件，导出仅包含配置元数据（不含具体 URL） |

---

## 性能分析

### 品牌配置加载性能

| 场景 | 预估耗时 | 说明 |
|------|---------|------|
| 品牌配置 API 请求 | < 200ms | 单文档查询，tenant_id 索引 |
| CSS 变量注入 | < 1ms | 同步 DOM 操作，6 个 setProperty 调用 |
| 页面标题更新 | < 0.1ms | 同步 DOM 操作 |
| Favicon 更新 | < 1ms | 同步 DOM 操作 |
| 品牌配置初始化总耗时 | < 250ms | 含网络请求 |

### 组件渲染性能

| 组件 | 预估渲染时间 | 说明 |
|------|------------|------|
| BrandSettings 页面 | < 15ms | 表单 + 预览组件 |
| BrandPreview | < 10ms | 预览区域渲染 |
| ColorPicker | < 5ms | 颜色选择器 + 预设色板 |
| LogoUploader | < 5ms | 上传区域 + 预览 |

### 主题色切换性能

| 操作 | 影响范围 | 耗时 | 说明 |
|------|---------|------|------|
| 修改 6 个 CSS 变量 | 全局 | < 2ms | 浏览器重绘 Element Plus 组件 |
| 用户感知延迟 | 全局 | < 50ms | 浏览器重绘在下一帧完成 |
| 内存增量 | -- | 0KB | CSS 变量修改不增加内存占用 |

