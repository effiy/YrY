---
doc_type: prd
title: 国际化与主题系统 — 需求规格
tags:
- 需求文档
- i18n
- 多语言
- 主题
- 暗色模式
category: 项目/桌面应用/需求
created: '2026-09-23'
updated: '2026-09-23'
source: 内部
type: 需求
status: 已完成
priority: 中
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: '202609'
prd_task_id: YP-09-M10
estimate_frontend: 3
review_status: 已发布
issue_type: 功能
roles: [engineer, qa]
---

# 国际化与主题系统 — 需求规格

> 需求编号：YP-09-M10 · 优先级：P2 · 人天：~3d

---

## 一、国际化（i18n）

### 1.1 支持语言（22 种）

| 语言 | 语言包 | RTL |
|------|--------|-----|
| 简体中文 | zh_CN | — |
| 繁体中文 | zh_TW | — |
| 英语 | en_US | — |
| 日语 | ja_JP | — |
| 韩语 | ko_KR | — |
| 法语 | fr_FR | — |
| 德语 | de_DE | — |
| 西班牙语 | es_ES | — |
| 葡萄牙语 | pt_PT / pt_BR | — |
| 俄语 | ru_RU | — |
| 意大利语 | it_IT | — |
| 土耳其语 | tr_TR | — |
| 阿拉伯语 | ar_AE | ✓ |
| 希伯来语 | he_IL | ✓ |
| 波斯语 | fa_IR | ✓ |
| 挪威语 | nb_NO / nn_NO | — |
| 乌克兰语 | uk_UA | — |
| 土库曼语 | tk_TM | — |
| 泰米尔语 | ta_IN | — |

### 1.2 技术实现

- **框架**: i18next + react-i18next
- **语言检测**: 默认跟随系统语言
- **热切换**: `i18n.changeLanguage()` 即时生效
- **配置持久化**: `app_language` 配置项 → `store.js`

### 1.3 RTL 布局支持

- 阿拉伯语/希伯来语/波斯语自动切换 RTL
- CSS 使用逻辑属性 (`margin-inline-start` 等)
- NextUI 组件原生支持 RTL

---

## 二、主题系统

### 2.1 三种主题模式

| 模式 | 配置值 | 行为 |
|------|--------|------|
| 跟随系统 | `system` | 监听 `prefers-color-scheme` 变化 |
| 浅色 | `light` | 固定浅色主题 |
| 深色 | `dark` | 固定深色主题 |

### 2.2 技术实现

- **框架**: next-themes
- **配置**: `app_theme` → `useConfig('app_theme', 'system')`
- **系统监听**: `window.matchMedia('(prefers-color-scheme: dark)')`

### 2.3 字体系统

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `app_font` | `default` | 主字体 |
| `app_fallback_font` | `default` | 回退字体 |
| `app_font_size` | `16` | 基准字号 (px) |

- 字体列表通过 Rust `font_list` 命令获取系统可用字体
- 设置页提供字体预览

---

## 三、验收标准

- [ ] 22 种语言切换后 UI 文本完整
- [ ] RTL 语言布局正确（右对齐、镜像图标）
- [ ] 主题切换 < 200ms 无闪烁
- [ ] 跟随系统主题实时响应
- [ ] 字体更改即时生效
- [ ] 语言/主题/字体配置持久化

---

## 用户画像与使用场景

### 典型用户

| 画像 | 角色 | 核心诉求 | 使用频率 |
|------|------|---------|---------|
| 国际化用户 | 非中文母语用户（日/韩/英/阿等） | 母语界面、RTL 布局正确 | 持续使用 |
| 夜间工作者 | 习惯暗色模式的开发者/设计师 | 自动跟随系统暗色模式、不刺眼 | 持续使用 |

### 使用场景

1. **阿拉伯语用户**: 用户切换语言为阿拉伯语 → 期望: 整个 UI 镜像翻转（按钮靠右、文字右对齐、图标镜像），布局不出错
2. **自动暗色模式**: macOS 日落后自动切换暗色模式 → Pot 跟随系统 → 期望: 翻译窗口背景变暗、文字变亮，不闪烁
3. **字体个性化**: 日语用户偏好 Noto Sans JP 字体 → 设置页选择系统字体 → 期望: 翻译窗口、设置页、OCR 窗口统一使用所选字体
4. **语言热切换**: 用户在翻译时想临时切英语界面 → 设置页选择 English → 期望: UI 即时变英文，无需重启

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | 22 种语言翻译覆盖率 | 100% UI 文本无英文 fallback | 手动切换逐一检查 | P2 |
| AC-02 | RTL 布局正确率 | 100%（阿拉伯语/希伯来语/波斯语） | 逐页截图对比 | P2 |
| AC-03 | 主题切换时间 | ≤ 200ms 无闪烁 | Performance + 视觉检查 | P2 |
| AC-04 | 系统主题跟随实时性 | ≤ 1s（系统切换后） | matchMedia 事件计时 | P2 |
| AC-05 | 字体切换即时生效 | ≤ 500ms | 设置页选择到全局更新 | P2 |
| AC-06 | 字体列表获取速度 | ≤ 2s（含系统字体扫描） | Rust font_list 计时 | P2 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 缺失语言包文件 | 异常 | 回退到英语 (en_US)，提示"语言包缺失" | en_US 作为 fallback |
| 语言包 JSON 格式错误 | 异常 | 回退到英语，控制台输出错误信息 | 使用上次缓存的正确语言包 |
| RTL + LTR 混排文本 | 边界 | 翻译结果区域保持 LTR | — |
| 系统无可用字体 | 边界 | 使用浏览器默认字体 (sans-serif/monospace) | — |
| 用户字体不支持 CJK | 边界 | fallback_font 默认识别并回退 | 自动检测字体字符覆盖范围 |
| 极深/极浅自定义主题色 | 边界 | 自动限制对比度 ≥ 4.5:1 (WCAG AA) | 颜色校正算法 |
| 系统不支持 matchMedia | 异常 | 降级为手动切换主题 | 静默降级 |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | 语言包大小 | ≤ 50KB/语言 | 构建产物检查 |
| 性能 | i18next 初始化时间 | ≤ 100ms | 启动计时 |
| 可用性 | 对比度 (WCAG) | ≥ 4.5:1 (AA) | 对比度检测工具 |
| 可用性 | 字体预览 | 设置页字体列表实时预览 | 功能验证 |
| 兼容性 | RTL CSS 逻辑属性 | 全部使用 margin-inline/padding-inline | 代码审查 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | i18next + react-i18next | React context | `t('key') → translated_string` |
| 依赖 | next-themes | React context | `theme: 'system' | 'light' | 'dark'` |
| 依赖 | Rust font_list 命令 | Tauri invoke | `string[]` 系统字体列表 |
| 依赖 | Rust config store | Tauri invoke | `app_language`, `app_theme`, `app_font` |
| 被依赖 | 所有 UI 组件 | 全局语言/主题上下文 | React Provider |

---

## 相关文档

- 开发方案: [08-prd-task-国际化与主题系统](../../devs/2026-09/08-prd-task-国际化与主题系统.md)
- 测试方案: [08-prd-test-国际化与主题系统](../../tests/2026-09/08-prd-test-国际化与主题系统.md)

---

## 社区翻译贡献流程

### 翻译文件结构

```
src/locales/
├── en_US/           # 基准语言 (所有 key 以此为准)
│   └── translation.json
├── zh_CN/
│   └── translation.json
├── ja_JP/
│   └── translation.json
└── ...
```

### 新增语言流程

```
1. 贡献者 fork 仓库
2. 复制 en_US/translation.json 为新语言目录
3. 翻译所有 value 字段 (保留 key 和插值变量 {{var}})
4. 在 i18n.ts 注册新语言 (语言名 + 方向)
5. 提交 PR → CI 校验 JSON 有效性 + Key 完整性
```

### 翻译完整性校验

| 检查项 | 工具 | 阈值 |
|--------|------|------|
| Key 数量一致性 | CI 脚本对比 en_US | 100% (不可缺 key) |
| JSON 格式合法性 | `jq` 或 JSON.parse | 必须通过 |
| 插值变量保留 | 正则 `\{\{.*?\}\}` 匹配 | 100% (不可丢失) |
| 未翻译字符串检测 | 与 en_US value 相同的标记 | 0 个 (除专有名词外) |
| RTL 语言布局 | 视觉回归截图对比 | CSS 逻辑属性覆盖率 100% |

### 翻译更新周期

| 事件 | 周期 | 说明 |
|------|------|------|
| 新增 UI 文本 | 即时 | en_US 先更新，其他语言标记为待翻译 |
| 社区 PR 合入 | 随版本发布 | 累计翻译在下个版本一并发布 |
| 翻译质量审核 | 季度 | curator 角色审核所有语言的覆盖率 |

---

## 主题扩展机制

### 自定义主题变量

| 变量类别 | 变量数 | 示例 |
|---------|--------|------|
| 颜色 (Light) | 12 个 | `--color-bg-primary`, `--color-text-primary`, `--color-border` |
| 颜色 (Dark) | 12 个 | 同上，暗色对应值 |
| 间距 | 4 个 | `--spacing-xs` (4px) ~ `--spacing-xl` (24px) |
| 圆角 | 3 个 | `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px) |
| 阴影 | 3 个 | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| 字体 | 4 个 | `--font-sans`, `--font-mono`, `--font-size-base`, `--font-size-sm` |

### 主题 CSS 变量注入

```
next-themes <ThemeProvider>
    ↓ 设置 data-theme="dark|light" 到 <html>
CSS 变量切换
    ↓ :root[data-theme="dark"] { ... }
所有组件自动响应
```

### 高对比度模式 (可访问性)

当检测到系统 `prefers-contrast: high` 时：
- 强制对比度 ≥ 7:1 (WCAG AAA)
- 所有边框加粗至 2px
- 焦点指示器强制可见
- 禁用半透明效果

> 实现方案见: [开发方案](../../devs/2026-09/08-prd-task-国际化与主题系统.md)