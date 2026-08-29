/**
 * Seed documentation pages for the rs.ui project.
 */
import type { SeedPage } from "./yivad-docs";

export const rsuiDocs: SeedPage[] = [
  {
    order: 1,
    tag: "getting-started",
    title: "快速开始",
    content: `# 快速开始

## 环境要求

- **Node.js** >= 14.x
- **npm** (包管理器)

## 安装与启动

\`\`\`bash
cd rs.ui

# 安装依赖
npm install

# 启动开发服务器
npm run serve:dev    # 开发环境
npm run serve:sit    # SIT 环境
npm run serve:uat    # UAT 环境
npm run serve:local  # 本地环境

# 构建
npm run build:emprod  # 生产环境 (EM)
npm run build:euprod  # 生产环境 (EU)
npm run build:prod    # 生产环境

# Lint
npm run lint
\`\`\`

## 预览

在线预览: https://design-pro.zeekrlife.com/

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 2.6 | 前端框架 |
| Vue CLI | 4.5 | 构建工具 |
| Vuex | 3.6 | 状态管理 |
| Vue Router | 3.5 | 路由管理 |
| ZeekrUI | 3.27 | 企业级 UI 组件库 |
| vue-i18n | 8.x | 国际化 |
| Axios | 0.26 | HTTP 请求 |
| TypeScript | 4.x | 类型系统 |
| Less/Sass | 3.x | CSS 预处理 |
`
  },
  {
    order: 2,
    tag: "architecture",
    title: "目录结构",
    content: `# 目录结构

\`\`\`
src/
├── api/              — HTTP 请求层 (按业务模块划分)
│   ├── modules/      — 通用模块 API
│   ├── system/       — 系统管理 API
│   │   ├── Vehicle/          — 车辆管理
│   │   ├── stationManage/    — 门店管理
│   │   ├── userManager/      — 用户管理
│   │   ├── menuManager/      — 菜单管理
│   │   ├── personnel/        — 人员管理
│   │   ├── configItemManager/ — 配置项管理
│   │   ├── questionBank/     — 题库管理
│   │   ├── questionnaire/    — 问卷管理
│   │   ├── servicePackage/   — 服务包管理
│   │   ├── maintenancePlan/  — 保养计划
│   │   ├── businessHours/    — 营业时间
│   │   ├── lane/             — 车道管理
│   │   ├── dict/             — 字典管理
│   │   └── ...
│   ├── appointmentBoard/ — 预约看板
│   ├── orderBoard/       — 工单看板
│   ├── reception/        — 接待管理
│   ├── maintain/         — 维修保养
│   ├── qualityTest/      — 质量检测
│   ├── batterytraceability/ — 电池追溯
│   ├── delivery/         — 交车管理
│   └── appoinment/       — 预约提醒
├── assets/           — 静态资源 (图片/图标/字体)
├── components/       — 共享组件
├── config/           — 应用配置
├── directives/       — 自定义指令
├── filters/          — Vue 过滤器
├── locale/           — 国际化语言包
├── mock/             — Mock 数据
├── plugins/          — Vue 插件
│   ├── zeekr-ui.js        — ZeekrUI 注册
│   ├── zeekr-http.js      — HTTP 客户端
│   └── vue-sso-login.js   — SSO 登录
├── router/           — 路由配置
├── store/            — Vuex 状态管理
├── styles/           — 全局样式
├── timeZone/         — 时区处理
├── types/            — TypeScript 类型定义
├── utils/            — 工具函数
├── App.vue           — 根组件
├── main.ts           — 应用入口
├── permission.js     — 权限守卫
└── setting.js        — 项目设置
\`\`\`
`
  },
  {
    order: 3,
    tag: "architecture",
    title: "架构设计",
    content: `# 架构设计

## 整体架构

rs.ui 是 **Zeekr Design Pro** — 基于 ZeekrUI 的开箱即用中后台最佳实践。采用 Vue 2.6 + Vue CLI 经典架构。

## 数据流

\`\`\`
main.ts (应用入口)
  → permission.js (权限守卫)
    → router (Vue Router)
      → views/* (业务页面)
        → store/* (Vuex 状态)
          → api/* (领域 API)
            → plugins/zeekr-http.js (@zeekr-f2e/zeekr-http)
              → 后端 API Gateway
\`\`\`

## 核心特性

- **极氪设计规范** — 遵循 Zeekr Design System
- **SSO 登录** — @zeekr-f2e/vue-sso-login 统一认证
- **zeekr-http** — 企业级 HTTP 客户端封装
- **多页签** — 内置多页签解决方案
- **主题系统** — 内置主色变更 + 暗黑模式
- **国际化** — vue-i18n 8.x 多语言支持
- **Mock 数据** — 内置 mockjs API 模拟
- **微前端** — 支持 qiankun 微前端架构

## 微前端支持

| 组件 | 仓库 |
|------|------|
| 基座脚手架 | vue-qiankun-main |
| 子应用脚手架 | vue-qiankun-micro |

## 页面模板

推荐使用 Pandora 辅助页面开发，物料市场提供丰富的页面模板（表格、表单、详情等），下载即用。
`
  },
  {
    order: 4,
    tag: "architecture",
    title: "路由设计",
    content: `# 路由设计

## 路由架构

使用 **Vue Router 3** 管理路由，支持动态路由和权限守卫。

## 权限守卫

\`src/permission.js\` 处理：
- **登录状态检查** — 未登录跳转 SSO 登录
- **权限验证** — 根据用户角色控制页面访问
- **动态路由** — 从后端菜单 API 加载路由配置

## 主要业务模块

| 模块 | 说明 |
|------|------|
| 预约管理 | 预约看板、预约单、预约提醒 |
| 工单管理 | 工单看板、工单列表、工单详情 |
| 接待管理 | BP 外派、围栏安装 |
| 维修保养 | 维修工单、维修详情、保养计划 |
| 质量检测 | 质量报告、质检管理 |
| 交车管理 | 交车报表 |
| 电池追溯 | 电池追溯查询 |
| 系统管理 | 车辆/门店/用户/菜单/人员/配置/题库/问卷/服务包等 |
| 售后咨询 | 技术咨询、配件咨询、保修咨询、其他咨询 |
| 通用服务 | 通知公告、文件上传、下载记录 |

## 页面模板

Pandora 物料市场提供：
- 表格模板 (ProTable)
- 表单模板 (ProForm)
- 详情模板 (ProDetail)
- 搜索列表模板
`
  },
  {
    order: 5,
    tag: "conventions",
    title: "项目规范",
    content: `# 项目规范

## 编码规范

| 领域 | 标准 |
|------|------|
| 组件风格 | Vue 2 Class Component + 装饰器 |
| 状态管理 | Vuex Module Decorators |
| UI 组件库 | ZeekrUI 3.27 (禁止引入其他 UI 库) |
| HTTP 请求 | @zeekr-f2e/zeekr-http 统一封装 |
| 样式 | Less/Sass + CSS 变量 |
| 类型系统 | TypeScript 4.x |

## 命名约定

| 约定 | 适用范围 |
|------|----------|
| PascalCase | 组件、类 |
| camelCase | 方法、变量 |
| kebab-case | 目录、CSS 类名 |

## 代码质量

| 工具 | 用途 |
|------|------|
| ESLint | 代码检查 (@zeekr-f2e/eslint-config-zeekr-eslint) |
| TypeScript | 类型检查 |
| lint-staged | 暂存文件检查 |

## 关键约定

- **ZeekrUI 统一组件库** — 禁止引入 ant-design-vue、element-plus 等
- **zeekr-http 统一请求** — 不直接使用 axios
- **SSO 登录** — 统一使用 vue-sso-login 插件
- **国际化** — 用户可见文案走 \`$t()\`
- **多页签** — 内置页签管理，支持页面缓存
`
  },
  {
    order: 6,
    tag: "deployment",
    title: "构建部署",
    content: `# 构建部署

## 构建命令

| 命令 | 环境 | 说明 |
|------|------|------|
| \`npm run serve:dev\` | DEV | 开发环境启动 |
| \`npm run serve:sit\` | SIT | SIT 环境启动 |
| \`npm run serve:uat\` | UAT | UAT 环境启动 |
| \`npm run build:emprod\` | EM 生产 | 极氪生产构建 |
| \`npm run build:euprod\` | EU 生产 | 欧洲生产构建 |
| \`npm run build:prod\` | 生产 | 通用生产构建 |

## 多环境配置

通过 Vue CLI 模式 (\`--mode\`) 切换环境：

| 模式 | 环境 | 市场 |
|------|------|------|
| local | 本地开发 | — |
| dev | 开发环境 | — |
| sit / emsit / eusit | SIT 测试 | EM / EU |
| uat / emuat / euuat | UAT 预发 | EM / EU |
| prod / emprod / euprod | 生产环境 | EM / EU |

## 部署流程

\`\`\`bash
# 1. Lint 检查
npm run lint

# 2. 构建
npm run build:emprod

# 3. 部署 dist/ 到静态服务器
# 配置 Nginx 反向代理到后端 API
\`\`\`

## Docker 部署

项目包含 Dockerfile，支持容器化部署。
`
  },
  {
    order: 7,
    tag: "dependencies",
    title: "核心依赖",
    content: `# 核心依赖

## 运行时依赖

| 包 | 版本 | 用途 |
|----|------|------|
| vue | ^2.6.11 | 前端框架 |
| vue-router | ^3.5.3 | 路由管理 |
| vuex | ^3.6.2 | 状态管理 |
| vue-i18n | ^8.27.1 | 国际化 |
| @zeekr-f2e/zeekr-ui | 3.27.0 | 企业级 UI 组件库 |
| @zeekr-f2e/zeekr-http | ^1.4.0 | HTTP 客户端 |
| @zeekr-f2e/vue-sso-login | 9.9.2 | SSO 登录 |
| @zeekr-f2e/vue-auth-center | ^2.8.0 | 认证中心 |
| @zeekr-f2e/oversea-theme | ^0.2.0 | 海外主题 |
| axios | 0.26.1 | HTTP 请求 |
| dayjs | ^1.11.13 | 日期处理 |
| lodash-es | ^4.17.21 | 工具函数 |
| crypto-js | ^4.1.1 | 加密 |
| decimal.js | ^10.6.0 | 精度计算 |
| mockjs | ^1.1.0 | Mock 数据 |
| nprogress | ^0.2.0 | 进度条 |
| clipboard | ^2.0.11 | 剪贴板 |
| js-cookie | ^3.0.5 | Cookie 管理 |
| sign-canvas | ^1.1.4 | 签名画布 |
| @cloudcare/browser-rum | ^3.0.23 | 前端监控 |

## 开发依赖

| 包 | 版本 | 用途 |
|----|------|------|
| @vue/cli-service | ~4.5.0 | 构建服务 |
| typescript | 4.x | 类型系统 |
| @zeekr-f2e/eslint-config-zeekr-eslint | ^0.3.2 | ESLint 配置 |
| less | ^3.9.0 | Less 预处理 |
| sass | ^1.22.10 | Sass 预处理 |
| i18n-xlsx-tool | ^1.1.1 | i18n Excel 工具 |
`
  },
  {
    order: 8,
    tag: "core-code",
    title: "核心代码",
    content: `# 核心代码

## 入口文件

### src/main.ts
应用入口，按顺序初始化：Vue 实例 → ZeekrUI 插件 → zeekr-http 插件 → vue-sso-login 插件 → router → vuex → i18n → 权限守卫 → 挂载应用

## 核心模块

### src/plugins/zeekr-http.js — HTTP 客户端
基于 @zeekr-f2e/zeekr-http 的企业级 HTTP 封装，统一处理请求/响应拦截、错误处理、Token 注入。

### src/plugins/vue-sso-login.js — SSO 登录
基于 @zeekr-f2e/vue-sso-login 的统一认证插件，处理登录/登出/Token 刷新。

### src/permission.js — 权限守卫
路由前置守卫，检查登录状态和页面权限，未登录跳转 SSO，无权限显示 403。

### src/store/ — Vuex 状态管理
使用 vuex-module-decorators 装饰器模式，按业务模块划分 Store。

### src/utils/ — 工具函数
包含时区处理、金额计算、加密解密等通用工具函数。

## 关键模式

### Vuex Module Decorator
\`\`\`ts
@Module({ dynamic: true, store, name: 'user' })
class UserStore extends VuexModule {
  public token = ''
  @Action
  async login(params: LoginParams) { ... }
}
\`\`\`

### 组件装饰器
\`\`\`ts
@Component({ components: { ... } })
export default class MyPage extends Vue {
  @Prop() id!: string
  dataList: Item[] = []
  mounted() { this.fetchData() }
}
\`\`\`

### API 调用
\`\`\`ts
import { http } from '@zeekr-f2e/zeekr-http'
export function getList(params: any) {
  return http.get('/api/list', { params })
}
\`\`\`
`
  }
];