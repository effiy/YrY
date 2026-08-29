/**
 * Seed documentation pages for the rs.h5 project.
 */
import type { SeedPage } from "./yivad-docs";

export const rsh5Docs: SeedPage[] = [
  {
    order: 1,
    tag: "getting-started",
    title: "快速开始",
    content: `# 快速开始

## 环境要求

- **Node.js** >= 16.18.0
- **pnpm** (推荐包管理器)
- **iOS App / iPad WebView** 运行环境 (售后助手工作台)

## 安装与启动

\`\`\`bash
cd rs.h5

# 安装依赖
pnpm install

# 启动开发服务器 (端口 3000)
pnpm serve:emuat

# 构建
pnpm build:emuat   # UAT 环境
pnpm build:emprod  # 生产环境

# 预览构建产物
pnpm preview

# 运行测试
pnpm test
pnpm test:watch
pnpm test:coverage
\`\`\`

## 预览

| 环境 | 地址 |
|------|------|
| UAT | https://partner-uat.zeekrlife-test.com/rs-h5/#/ |
| 生产 | https://partner.zeekrglobal.com/rs-h5/#/ |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4 | 前端框架 |
| Vite | 5 | 构建工具 |
| Pinia | 2 | 状态管理 |
| Vant | 4.9 | 移动端 UI 组件库 |
| Vue Router | 4 | 路由 (Hash 模式) |
| Vue-i18n | 11 | 国际化 (zh/en/ko) |
| Axios | 1.6 | HTTP 请求 |
| Vitest | 2 | 测试框架 |
| TypeScript | 5.x | 类型系统 |
| SCSS | — | CSS 预处理 |
`
  },
  {
    order: 2,
    tag: "architecture",
    title: "目录结构",
    content: `# 目录结构

\`\`\`
src/
├── api/              — HTTP 请求层
│   └── modules/      — 领域服务函数
│       ├── work-order.js      — 工单/结算/PDI
│       ├── repair-service.js  — 维修任务
│       ├── appointment.js     — 预约单
│       ├── reception.js       — 接待
│       ├── settlement/        — 结算子模块
│       ├── pdi.js             — PDI 检测
│       ├── pipa.js            — PIPA 合规
│       ├── common.js          — 通用接口
│       └── fileUpload.js      — 文件上传
├── assets/           — 静态资源 (图片/图标)
├── components/       — 共享组件
│   ├── Scan/                 — 扫码组件
│   ├── SignaturePopup/       — 签名弹窗
│   ├── DateTimePicker/       — 日期时间选择器
│   ├── OptionSelect/         — 选项选择器
│   ├── InfoGrid/             — 信息网格
│   ├── AttachmentDisplay/    — 附件展示
│   ├── CollapseCell/         — 折叠单元格
│   ├── ConfirmDialog/        — 确认弹窗
│   ├── CustomRadio/          — 自定义单选
│   ├── Empty/                — 空状态
│   ├── SingleSearch/         — 单选搜索
│   └── VideoPlayerPopup/     — 视频播放器
├── composables/      — 组合式函数
│   └── useKeyboardAdapt.js  — iOS 软键盘适配
├── config/           — 市场/租户配置
│   └── spConfig.js          — 市场代码/租户/直营模式
├── directives/       — 自定义指令
│   └── index.js             — v-focus/v-debounce/v-copy/v-longpress/v-lazy/v-clickOutside/v-ripple/v-permission
├── locale/           — 国际化语言包
│   └── lang/{en-US,zh-CN,ko-KR}.js
├── router/           — 路由配置 (Hash History)
├── store/            — Pinia 状态管理
│   └── modules/
│       ├── user.js               — 用户状态
│       ├── workOrderList.js      — 工单列表
│       ├── repairList.js         — 维修任务列表
│       ├── appointmentList.js    — 预约单列表
│       ├── appointmentDashboard.js — 预约仪表盘
│       ├── settlementList.js     — 结算单列表
│       └── common.js             — 通用状态
├── styles/           — 全局 SCSS (variables/mixins/vant)
├── utils/            — 工具函数
│   ├── request.js    — Axios + HMAC-SHA256 签名 + 多租户头
│   ├── auth.js       — 认证/Token/租户管理
│   ├── hmac.js       — HMAC-SHA256 签名
│   ├── ditto.js      — Native Bridge ($ditto)
│   ├── amount.js     — 金额/货币精度
│   ├── basedata.js   — 基础数据缓存
│   ├── pipa.js       — PIPA 合规脱敏
│   └── index.js      — 通用工具 (时区/日期/扫码)
└── views/            — 业务视图
    ├── ServiceWorkOrder/   — 工单/结算/PDI/打印
    ├── repair-service/     — 维修任务/详情/仪表盘
    └── AppointmentService/ — 预约单/仪表盘
\`\`\`
`
  },
  {
    order: 3,
    tag: "architecture",
    title: "架构设计",
    content: `# 架构设计

## 整体架构

rs.h5 是一个 Vue 3 移动端 SPA，部署在 iOS App / iPad WebView 售后助手工作台中，服务于极氪售后技师和经销商。

## 数据流

\`\`\`
App.vue (keepAlive 路由)
  → router/index.js (Hash History, 4 大根路由)
    → views/<domain>/* (业务视图)
      → components/* (共享组件)
      → store/modules/* (Pinia 状态)
        → api/modules/* (领域 API)
          → utils/request.js (Axios + HMAC + 多租户头)
            → 后端 API Gateway
\`\`\`

## 启动时序

\`\`\`
① dittoLanguageReady() 语言初始化
② createApp + 注册指令 + VConsole (非 prod)
③ Pinia → AuthCenter SDK → router → i18n → initDitto
④ initData() 经 Ditto Bridge 取 token/租户
⑤ AuthCenter.useACStore#getUserPermission() 取权限
⑥ mount + initTheme
\`\`\`

## 核心特性

- **Native Bridge 集成** — 通过 @zeekr-f2e/zeekr-ditto 调用原生能力 (扫码/Token/语言/401)
- **HMAC-SHA256 签名** — 每个请求经 HMAC 签名，密钥不落盘
- **多市场/多租户** — 支持 EM/EU/US 三市场，运行时切换租户
- **AuthCenter 统一认证** — @zeekr-f2e/vue3-auth-center 权限管理
- **PIPA 合规** — 个人信息脱敏处理，满足隐私合规要求
- **iOS 软键盘适配** — useKeyboardAdapt 组合式函数处理 WebView 键盘遮挡
- **国际化** — vue-i18n 支持 zh-CN / en-US / ko-KR 三种语言
- **移动端调试** — 非生产环境自动启用 VConsole

## 4 大业务域

| 路由前缀 | 业务域 | 功能 |
|---------|--------|------|
| \`/work-order-list/...\` | 工单/结算/PDI | 工单管理、结算、PDI 检测、打印 |
| \`/repair-service/...\` | 维修任务 | 维修任务列表、详情、仪表盘 |
| \`/appointment/...\` | 预约单 | 预约单管理、仪表盘 |
| \`/settlement/...\` | 结算编辑 | 结算编辑、打印 |

## 安全机制

- **HMAC-SHA256 签名** — 每个请求经 \`utils/hmac.js\` 签名
- **多租户头** — \`Tmp-Tenant-Code\` + \`SOURCE-TERMINAL: IPAD\` + \`OpSource: RS\`
- **AuthCenter SDK** — 统一认证和权限管理
- **Ditto Bridge** — Native 能力 (扫码/token/语言/401)
- **PIPA 合规** — 个人信息脱敏处理
`
  },
  {
    order: 4,
    tag: "architecture",
    title: "路由设计",
    content: `# 路由设计

## 路由架构

使用 **Vue Router 4** 的 **Hash History** 模式 (\`createWebHashHistory\`)，不依赖服务端路由。

## 路由守卫

\`src/router/index.js\` 处理：
- **认证检查** — 未认证时通过 Ditto Bridge 重新获取 Token
- **权限验证** — 根据 AuthCenter 返回的权限列表控制页面访问
- **页面保活** — 通过 \`keepAlive\` meta 控制组件缓存

## 4 大根路由

| 路径 | 业务域 | 说明 |
|------|--------|------|
| \`/work-order-list\` | 工单管理 | 工单列表/搜索 |
| \`/work-order-list/detail/:id\` | 工单详情 | 工单详情页 |
| \`/work-order-list/settlement\` | 结算管理 | 结算单列表 |
| \`/work-order-list/settlement/detail/:id\` | 结算详情 | 结算单详情/编辑 |
| \`/work-order-list/pdi\` | PDI 检测 | PDI 检测列表 |
| \`/repair-service\` | 维修任务 | 维修任务列表 |
| \`/repair-service/detail/:id\` | 维修详情 | 维修任务详情 |
| \`/repair-service/dashboard\` | 维修仪表盘 | 维修数据仪表盘 |
| \`/appointment\` | 预约单 | 预约单列表 |
| \`/appointment/detail/:id\` | 预约详情 | 预约单详情 |
| \`/appointment/dashboard\` | 预约仪表盘 | 预约数据仪表盘 |
| \`/settlement\` | 结算编辑 | 结算编辑/打印 |

## 主要业务模块

| 模块 | 说明 |
|------|------|
| 工单管理 | 工单列表、搜索、详情、状态流转 |
| 结算管理 | 结算单列表、结算编辑、打印 |
| PDI 检测 | 新车交付前检测列表与操作 |
| 维修任务 | 维修任务列表、详情、仪表盘统计 |
| 预约单 | 预约单列表、详情、仪表盘统计 |
| 接待管理 | 到店接待、BP 外派 |

## 路由 Meta

- \`title\` — 文档标题 (必填)
- \`keepAlive\` — 页面保活
- \`titleKey\` — i18n 标题键

## 权限指令

\`\`\`vue
<template>
  <!-- 单个权限 -->
  <van-button v-permission="'RS.RepairService.RepairList.Export'">导出</van-button>

  <!-- 多个权限 (OR 逻辑) -->
  <van-button v-permission="['RS.Admin', 'RS.Manager']">管理</van-button>
</template>
\`\`\`

基于 \`useUserStore().permissions\`，无权限时移除元素。
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
| 组件风格 | \`<script setup>\` + Composition API |
| 状态管理 | Pinia \`defineStore\` (Setup Store 语法) |
| UI 组件库 | Vant 4 (禁止引入 ant-design-vue/element-plus) |
| 样式 | SCSS + CSS 变量 (语义化命名) |
| HTTP 请求 | 通过 \`api/modules/*\` 封装，禁止组件内 \`import axios\` |
| 类型系统 | TypeScript 5.x |

## 命名约定

| 约定 | 适用范围 |
|------|----------|
| PascalCase | 组件目录 |
| camelCase | 组合式函数、工具函数 |
| kebab-case | CSS 类名 |
| \`rs.<module>.*\` | i18n key 前缀 |

## 代码质量

| 工具 | 用途 |
|------|------|
| ESLint | 代码检查 |
| TypeScript | 类型检查 |
| Vitest | 单元测试 + 覆盖率 |
| lint-staged | 暂存文件检查 |

## 环境变量

| 变量 | 说明 |
|------|------|
| \`VITE_MARKET_CODE\` | 市场代码 (em/eu/us) |
| \`VITE_APP_ENV\` | 环境 (sit/uat/prod) |
| \`VITE_BASE_API_PATH\` | API 基础路径 |
| \`VITE_APP_CODE\` | AuthCenter 应用编码 |
| \`VITE_HMAC_ACCESS_KEY\` | HMAC 访问密钥 (不落盘) |
| \`VITE_HMAC_SECRET_KEY\` | HMAC 密钥 (不落盘) |

## 关键约定

- **禁止 Options API** — 只使用 \`<script setup>\`
- **API 走模块封装** — 组件内禁止直接 \`axios\` 调用
- **i18n 全量覆盖** — 用户可见文案必须走 \`$t()\`
- **状态码语义化** — 数字字面量赋予常量名
- **CSS 变量语义化** — 禁止数字 token，使用 \`--rui-accent\` 等
- **业务域内聚** — 业务域内允许子目录 \`components/composables/utils\`，不外泄
`
  },
  {
    order: 6,
    tag: "deployment",
    title: "构建部署",
    content: `# 构建部署

## 构建命令

| 命令 | 说明 |
|------|------|
| \`pnpm serve:emuat\` | 启动 UAT 开发服务器 (端口 3000) |
| \`pnpm build:emuat\` | UAT 环境构建 |
| \`pnpm build:emprod\` | 生产环境构建 |
| \`pnpm preview\` | 预览构建产物 |
| \`pnpm test\` | 运行测试 |
| \`pnpm test:watch\` | 监听模式测试 |
| \`pnpm test:coverage\` | 测试覆盖率 |

## 多环境配置

通过 \`VITE_APP_ENV\` 和 \`VITE_MARKET_CODE\` 切换环境：

| 模式 | 环境 | 市场 |
|------|------|------|
| serve:emuat | UAT | EM (极氪) |
| build:emuat | UAT | EM (极氪) |
| build:emprod | 生产 | EM (极氪) |

## 代理配置

开发服务器代理 \`/api → gateway-int-zk-sit.zeekrlife-test.com\`，rewrite 至 \`/pub/tmp\`。

## 多市场构建

通过 \`VITE_MARKET_CODE\` 切换市场：

| 市场 | 代码 | 说明 |
|------|------|------|
| 中国 | em | 极氪 |
| 欧洲 | eu | 欧洲经销商 |
| 美国 | us | 美国市场 |

## 部署流程

\`\`\`bash
# 1. 运行测试
pnpm test

# 2. 构建
pnpm build:emprod

# 3. 部署 dist/ 到 iOS App WebView
# 由 iOS 端和运维负责部署
\`\`\`

## 发布管道

DevOps Zadig: \`emrs\` 项目
- em:sit / em:uat / sea-uat 流水线
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
| vue | ^3.4.21 | 前端框架 |
| vue-router | ^4.3.0 | 路由管理 |
| pinia | ^2.1.7 | 状态管理 |
| vant | ^4.9.24 | 移动端 UI 组件库 |
| vue-i18n | ^11.4.4 | 国际化 |
| axios | ^1.6.8 | HTTP 客户端 |
| @zeekr-f2e/vue3-auth-center | ^3.3.1 | 认证中心 |
| @zeekr-f2e/zeekr-ditto | ^1.0.42 | Native Bridge |
| crypto-js | ^4.2.0 | HMAC 签名 |
| decimal.js | ^10.6.0 | 金额精度 |
| number-precision | ^1.6.0 | 数字精度 |
| moment-timezone | ^0.6.2 | 时区处理 |

## 开发依赖

| 包 | 版本 | 用途 |
|----|------|------|
| vite | ^5 | 构建工具 |
| vitest | ^2.0 | 测试框架 |
| jsdom | ^25 | DOM 模拟 |
| @vue/test-utils | ^2.4 | Vue 组件测试 |
| @pinia/testing | — | Pinia 测试工具 |
| sass | — | SCSS 编译 |
| vconsole | ^3.15.1 | 移动端调试 |
`
  },
  {
    order: 8,
    tag: "core-code",
    title: "核心代码",
    content: `# 核心代码

## 入口文件

### src/main.js
应用入口，按顺序初始化：dittoLanguageReady → createApp → Pinia → AuthCenter SDK → router → i18n → initDitto → initData (token/租户) → getUserPermission → mount + initTheme

## 核心模块

### src/utils/request.js — HTTP 客户端
封装 Axios 实例，统一注入业务头：\`Tmp-Tenant-Code\`、\`SOURCE-TERMINAL: IPAD\`、\`OpSource: RS\`、\`Accept-Language\`、\`utcoffset\`。HMAC-SHA256 签名。401 时通过 Ditto Bridge 重新认证。

### src/utils/auth.js — 认证管理
JWT Token + 租户 Code 管理。结合 AuthCenter SDK 和 Ditto Bridge 的 Native 认证能力。

### src/utils/hmac.js — HMAC 签名
基于 crypto-js 的 HMAC-SHA256 签名，密钥从 \`import.meta.env\` 读取，不落盘。

### src/utils/ditto.js — Native Bridge
封装 @zeekr-f2e/zeekr-ditto，提供 Native 能力：扫码 (\`zeekr_custom.openQRCodeScanVC\`)、token 获取、语言切换、401 处理。

### src/utils/amount.js — 金额精度
基于 decimal.js + number-precision 的金额计算，避免浮点数精度问题。

### src/config/spConfig.js — 市场配置
运行时市场/租户配置：\`marketCode\` (\`VITE_MARKET_CODE\`)、\`tenantCode\` (localStorage)、\`directMode\` (EU 经销商判定)。

### src/directives/index.js — 自定义指令
8 个自定义指令：\`v-focus\`、\`v-debounce\`、\`v-copy\`、\`v-longpress\`、\`v-lazy\`、\`v-clickOutside\`、\`v-ripple\`、\`v-permission\`。

## 关键模式

### Pinia Setup Store
\`\`\`js
export const useRepairListStore = defineStore('repairList', () => {
  const list = ref([])
  const loading = ref(false)
  async function fetch(params) { ... }
  return { list, loading, fetch }
})
\`\`\`

### API 模块模式
\`\`\`js
import request from '@/utils/request'
export function getRepairList(params) {
  return request({ url: '/api/repair/list', method: 'get', params })
}
\`\`\`

### HMAC 请求签名
\`\`\`js
import HmacSHA256 from 'crypto-js/hmac-sha256'
import Base64 from 'crypto-js/enc-base64'

function signRequest(config) {
  const timestamp = Date.now()
  const signature = Base64.stringify(
    HmacSHA256(timestamp + config.url, secretKey)
  )
  config.headers['X-Timestamp'] = timestamp
  config.headers['X-Signature'] = signature
}
\`\`\`

### 权限指令
\`\`\`vue
<van-button v-permission="'RS.RepairService.RepairList.Export'">导出</van-button>
\`\`\`

### 多语言使用
\`\`\`vue
<template>
  <van-nav-bar :title="$t('rs.workOrder.list.title')" />
  <van-button>{{ $t('rs.common.submit') }}</van-button>
</template>
\`\`\`
`
  }
];