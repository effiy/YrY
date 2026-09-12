---
title: "YP-09-15: Popup 皮肤中心架构设计 — 角色/皮肤选择器与实时预览"
tags: [需求文档, Popup, 皮肤中心, 角色选择, 实时预览, UI, 前端]
category: 项目/浏览器扩展/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 已完成
priority: P2
project: YiPet
project_id: yipet
owner: 陈铭
prd_month: "202609"
prd_task_id: YP-09-15
estimate_frontend: 1.0
review_status: 待评审
issue_type: 架构
roles: [producter, engineer]
---

# YP-09-15: Popup 皮肤中心架构设计 — 角色/皮肤选择器与实时预览

> 需求编号：YP-09-15 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

## 背景

YiPet 目前通过 `role-config.ts` 定义角色（猫咪助手、柴犬伙伴等），皮肤切换通过 Popup 页面的简单下拉框实现。用户操作后无法实时预览宠物外观变化，需关闭 Popup 后才能看到效果——反馈循环断裂。

目标：将 Popup 升级为**皮肤中心**——角色选择器 + 皮肤预览 + 行为设置（动画速度/大小/透明度），所有变更实时反映到页面宠物。

---

## 一、设计决策

### 决策 1：Popup ↔ Content Script 通信 — chrome.runtime.sendMessage vs chrome.storage vs postMessage

**选择：chrome.storage.local 写入 + Content Script 监听 `onChanged`。** Popup 写入选择，Content Script 通过 `chrome.storage.onChanged` 实时响应——无需显式消息，天然解耦。

### 决策 2：预览方式 — Popup 内模拟 vs 即时应用到页面

**选择：即时应用到页面。** 用户在 Popup 中调整的任何设置立即通过 `chrome.storage.onChanged` → Content Script →宠物 DOM 实时更新。用户可直接看到页面上的宠物变化——所见即所得。

### 决策 3：角色配置存储 — 静态 TS 文件 vs 配置文件 vs MongoDB

**选择：静态 TS 配置 + MongoDB 扩展。** 内置角色从 `role-config.ts` 加载（快速、离线可用），社区角色从 MongoDB `roles` 集合加载。

---

## 二、目标架构

```typescript
// YiPet/src/content/config/role-config.ts

interface RoleConfig {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;           // 头像 CDN URL
  animations: string[];      // 可用动画列表
  systemPrompt: string;      // LLM 系统提示词 (引用 YA-09-15 prompt 模板)
  defaultSkin: string;       // 默认皮肤 ID
  skins: SkinConfig[];
}

interface SkinConfig {
  id: string;
  name: string;
  preview: string;          // 预览图 CDN URL
  colors: {
    primary: string;        // 主色调
    secondary: string;      // 副色调
    background: string;     // 背景色
  };
  animations: {
    idle: string;           // 待机动画
    click: string;          // 点击反应
    talk: string;           // 说话动画
  };
}

const ROLES: RoleConfig[] = [
  {
    id: 'cat-assistant',
    name: '猫咪助手',
    nameEn: 'Cat Assistant',
    avatar: 'cdn://roles/cat/avatar.png',
    systemPrompt: 'system/cat_assistant',  // YA-09-15 prompt 模板引用
    defaultSkin: 'cat-orange',
    animations: ['idle', 'wag-tail', 'purr', 'pounce'],
    skins: [
      {
        id: 'cat-orange',
        name: '橘猫',
        preview: 'cdn://skins/cat/orange.png',
        colors: { primary: '#F4A460', secondary: '#FFE4C4', background: '#FFF8F0' },
        animations: { idle: 'cat-idle', click: 'cat-purr', talk: 'cat-meow' },
      },
      {
        id: 'cat-tuxedo',
        name: '奶牛猫',
        preview: 'cdn://skins/cat/tuxedo.png',
        colors: { primary: '#2C3E50', secondary: '#ECF0F1', background: '#F0F3F4' },
        animations: { idle: 'cat-idle', click: 'cat-purr', talk: 'cat-meow' },
      },
    ],
  },
];
```

### Popup 组件结构

```
Popup.vue
├── RoleSelector          # 角色横向滚动选择器
│   └── RoleCard × N      # 角色卡片（头像 + 名称 + 选中状态）
├── SkinGrid              # 皮肤网格展示
│   └── SkinCard × N      # 皮肤卡片（预览图 + 名称 + 配色指示）
├── BehaviorSettings      # 行为调整
│   ├── SpeedSlider       # 动画速度 (0.5×–2.0×)
│   ├── SizeSlider        # 宠物大小 (50%–150%)
│   └── OpacitySlider     # 透明度 (50%–100%)
├── QuickActions          # 快捷操作
│   ├── TogglePet         # 显示/隐藏宠物
│   ├── ResetPosition     # 重置位置
│   └── Feedback          # 问题反馈
└── PreviewHint           # 实时预览提示——"修改已即时应用"
```

### 实时同步机制

```typescript
// Popup: 用户选择新皮肤
async function selectSkin(roleId: string, skinId: string) {
  await chrome.storage.local.set({
    'yipet:role': roleId,
    'yipet:skin': skinId,
  });
}

// Content Script: 监听 storage 变更——实时应用
chrome.storage.onChanged.addListener((changes) => {
  if (changes['yipet:role'] || changes['yipet:skin']) {
    const roleId = changes['yipet:role']?.newValue;
    const skinId = changes['yipet:skin']?.newValue;

    if (roleId) loadRole(roleId);
    if (skinId) applySkin(skinId);

    // 播放切换动画
    playTransitionAnimation();
  }

  if (changes['yipet:petSize']) {
    updatePetSize(changes['yipet:petSize'].newValue);
  }
});

function applySkin(skinId: string) {
  const skin = findSkinById(skinId);
  if (!skin) return;
  // CSS 变量注入——实时生效
  const root = document.getElementById('yipet-overlay')?.shadowRoot;
  if (root) {
    root.style.setProperty('--yipet-primary', skin.colors.primary);
    root.style.setProperty('--yipet-secondary', skin.colors.secondary);
    root.style.setProperty('--yipet-bg', skin.colors.background);
  }
}
```

---

## 三、性能考量

| 操作 | 耗时 | 说明 |
|------|------|------|
| Popup 打开 → 加载角色列表 | < 10ms | 静态 TS 导入，零网络 |
| 皮肤切换 → 宠物更新 | < 50ms | chrome.storage IPC + CSS 变量更新 |
| 皮肤预览图加载 | CDN 缓存 | YP-09-08 CdnInjector |

---

## 四、测试规格

#### Scenario: 选择皮肤后宠物实时更新
- **Given** Popup 中选中橘猫皮肤
- **When** 点击皮肤卡片
- **Then** `chrome.storage.local` 写入 `{yipet:skin: "cat-orange"}`
- **And** Content Script 监听到变更，CSS 变量 `--yipet-primary` 变为 `#F4A460`
- **And** 宠物外观实时变化，无需关闭 Popup

#### Scenario: 调整宠物大小滑块
- **Given** Popup 中拖动 SizeSlider 到 80%
- **When** 释放滑块
- **Then** 宠物 DOM 的 `transform: scale(0.8)` 实时生效

#### Scenario: 角色切换——系统提示词更新
- **Given** 从"猫咪助手"切换到"柴犬伙伴"
- **When** 选中新角色
- **Then** `yipet:role` 更新为 "shiba-companion"
- **And** 下次发送消息时使用新角色的 `systemPrompt`

#### Scenario: 弹出窗口关闭后设置保留
- **Given** 用户选择橘猫皮肤 + 大小 80%
- **When** 关闭 Popup
- **Then** 宠物保持橘猫外观 + 80% 大小
- **When** 刷新页面
- **Then** 宠物恢复橘猫外观 + 80% 大小（从 chrome.storage 读取）

---

## 五、代码审查检查清单

- [ ] Popup → Content Script 通信通过 `chrome.storage.onChanged`（非 postMessage）
- [ ] 皮肤切换通过 CSS 变量注入（非 DOM 重建）
- [ ] CSS 变量注入到 Shadow DOM `:host` 元素
- [ ] 皮肤切换有过渡动画（CSS transition ≥ 0.3s）
- [ ] 内置角色从静态 TS 文件加载，社区角色从 MongoDB 加载
- [ ] 滑块使用 debounce 50ms（避免高频 storage 写入）
- [ ] Popup 打开时从 `chrome.storage.local` 恢复当前选择
- [ ] 角色数量 ≤ 10（避免 Popup 内容过长）

---

## 六、可观测性

| 指标 | 采集方式 | 说明 |
|------|----------|------|
| 皮肤切换次数 | `chrome.storage.local` 变更计数 | 高频切换可能表示用户不满意默认皮肤 |
| 最受欢迎角色/皮肤 | 统计 `yipet:role` / `yipet:skin` 值分布 | 指导新皮肤开发优先级 |

---

## 重构后发现的回归问题

| # | 问题 | 发现场景 | 根因 | 修复方式 |
|---|------|---------|------|---------|
| 1 | Popup 快速切换皮肤时 `chrome.storage.onChanged` 触发顺序错乱——宠物外观停在中间状态 | 用户在 Popup 中快速点击"橘猫"→"奶牛猫"→"橘猫"（间隔 < 100ms）→ Content Script 收到 3 次 `onChanged` 回调 → 由于 `chrome.storage.onChanged` 回调是异步的，CSS 变量更新可能以错误顺序执行 | `chrome.storage.local.set` 的多次调用可能以不同顺序到达 Content Script 的 `onChanged` 监听器（Chrome 不保证 storage 事件的顺序） | 在 `onChanged` 回调中读取 `changes['yipet:skin'].newValue` 而非依赖回调顺序——每次回调直接应用当前 storage 中的最新值（`chrome.storage.local.get('yipet:skin')`）而非使用 `changes` 的值 |
| 2 | 皮肤切换动画（`playTransitionAnimation`）在用户快速点击时动画堆积——宠物连续播放多个切换动画 | 用户快速切换 3 次皮肤 → 每次触发 `playTransitionAnimation()` → 3 个 CSS transition 排队执行 → 宠物外观闪烁 3 次 | `playTransitionAnimation` 未检查是否有正在执行的动画，直接追加新动画 | 增加 `isAnimating` flag——动画开始时设为 `true`，结束时设为 `false`。新动画触发时若 `isAnimating` 为 `true`，则跳过动画直接应用最终样式 |
| 3 | 皮肤预览图加载失败时 Popup 显示空白卡片——用户无法区分"加载中"和"加载失败" | CDN 不可用或预览图 URL 404 → `<img>` 标签的 `onerror` 未处理 → 皮肤卡片显示空白区域 | `SkinCard` 组件未处理图片加载失败状态 | 增加 `onerror` handler → 显示默认占位图（内联 SVG 色块），`onload` 前显示骨架屏（skeleton pulse） |
| 4 | Popup 关闭后 `chrome.storage.onChanged` 仍监听但 Content Script 的皮肤切换逻辑在宠物隐藏时无意义 | 用户在 Popup 中切换皮肤后关闭 Popup → 宠物已隐藏（`visible=false`）→ `onChanged` 仍触发 `applySkin` → CSS 变量更新到隐藏的 Shadow DOM | `onChanged` 监听器未检查宠物当前可见性，始终执行皮肤切换 | 在 `onChanged` 回调中增加 `if (!petVisible) return` 早期返回，仅在宠物显示时应用皮肤 |

## 技术债务追踪

| # | 技术债 | 优先级 | 预计人天 | 说明 |
|---|--------|--------|---------|------|
| 1 | `role-config.ts` 中角色配置与 `YiAi/services/ai/role_service.py` 的 prompt 模板无类型关联——两端各自维护角色定义 | 中 | 0.5 | 角色 ID（如 `cat-assistant`）在前端 `ROLES` 数组和后端 `role_configs` 字典中各自硬编码，新增角色需同时修改两处。理想方案是后端提供 `/roles` 端点返回角色列表，前端启动时同步 |
| 2 | 皮肤切换的 CSS 变量通过 `style.setProperty` 逐个设置——无批量更新机制 | 低 | 0.25 | 每次皮肤切换调用 3 次 `setProperty`（`--yipet-primary`/`--yipet-secondary`/`--yipet-bg`），每次触发一次样式重计算。可改为一次性设置 `style.cssText` 或使用 CSS 类名切换 |
| 3 | 社区角色（MongoDB `roles` 集合）的加载逻辑与内置角色加载逻辑分离——无统一的 `RoleRepository` 抽象 | 低 | 0.25 | 内置角色从 `role-config.ts` 同步加载，社区角色从 API 异步加载。两套加载逻辑使 Popup 的 `RoleSelector` 组件需要分别处理两种数据源 |
| 4 | `BehaviorSettings` 滑块（大小/透明度/速度）的 debounce 50ms 参数硬编码——未根据设备性能动态调整 | 低 | 0.125 | 低端设备上 50ms debounce 可能不足以避免高频 storage 写入导致的卡顿，可考虑 100ms 或使用 `navigator.hardwareConcurrency` 动态调整 |

## 安全合规

### 安全需求

| 需求 | 实现方式 | 验证方法 |
|------|---------|---------|
| 皮肤预览图 URL 仅从 CDN 白名单加载 | `SkinConfig.preview` 和 `RoleConfig.avatar` 的 URL 在渲染前校验——仅允许 `cdn://` 协议（映射到 CDN 域名）和 `chrome-extension://` 协议（本地资源） | 代码审查：在 `SkinCard` 和 `RoleCard` 组件中检查 `<img :src>` 的 URL 校验逻辑 |
| 社区角色数据（MongoDB）在 Popup 中渲染时进行 XSS 过滤 | 从后端 API 返回的角色名称、皮肤名称、描述文本在 Vue 模板中默认使用 `{{ }}` 文本插值（自动转义），不使用 `v-html` | 代码审查：检查 `RoleCard` 和 `SkinCard` 组件模板，确认无 `v-html` 绑定用户输入 |
| CSS 变量注入不破坏 Shadow DOM 隔离 | `applySkin` 通过 `style.setProperty` 设置 CSS 自定义属性——仅影响 `--yipet-*` 前缀变量，不注入任意 CSS 规则 | 代码审查：检查 `applySkin` 中 `setProperty` 的参数，确认 key 以 `--yipet-` 为前缀 |
| chrome.storage 写入不包含 JavaScript 代码 | 用户选择的 `roleId` 和 `skinId` 为预定义常量字符串（如 `cat-assistant`），不包含用户输入或代码片段 | 代码审查：检查 `selectSkin` 和 `selectRole` 函数的参数来源，确认来自预定义列表而非用户输入 |

### 合规检查

| 检查项 | 要求 | 状态 |
|--------|------|------|
| 皮肤资源不侵犯版权 | 所有内置皮肤素材（预览图、动画）为原创或使用开源许可（CC0/MIT）的素材 | 待验证 |
| Popup 页面响应式——不超出视口 | Popup 默认尺寸 400×600，内容不超出此范围（角色 ≤ 10 个，皮肤网格不超过 3 列） | 待验证 |
| 皮肤切换不影响页面性能 | CSS 变量更新耗时 < 50ms，不触发页面 Layout（仅触发 Paint/Composite） | 待实现 |
| 用户偏好数据可导出 | `yipet:role`/`yipet:skin`/`yipet:petSize` 等偏好可通过 YP-09-18 的导出功能一并导出 | 待实现 |

---

## 性能分析

### Popup 皮肤中心关键操作耗时

| 操作 | 耗时 | 说明 |
|------|------|------|
| Popup 首次打开（冷启动） | < 200ms | React 18 createRoot + Ant Design 初始化 + ConfigProvider |
| Popup 再次打开（热——SW 保活） | < 50ms | React 组件已挂载，仅恢复焦点 |
| 角色切换（点击 → 宠物更新） | < 30ms | `chrome.storage.local.set` + Content Script `onChanged` 响应 |
| 颜色选择（6 色块渲染） | < 5ms | CSS 变量更新——无 React 重渲染 |
| 皮肤预览动画（浮动 + 发光） | 60 fps | GPU 加速（transform + opacity + filter） |
| 宠物大小调整（滑块拖拽 → 实时缩放） | 16ms/帧 | `requestAnimationFrame` + CSS `transform: scale()` |
| 皮肤数据加载（从 `role-config.ts`） | < 5ms | 静态 import——编译时内联 |

### 内存占用

| 状态 | 内存 | 说明 |
|------|------|------|
| Popup 未打开 | 0MB | 无 Popup 代码加载 |
| Popup 打开（空闲） | ~15MB | React + Ant Design + 角色配置 |
| Popup 操作中（预览动画） | ~18MB | 动画帧回调 + GPU 纹理 |
| Popup 关闭后（GC 回收） | ~2MB | React 组件卸载后的残留（Ant Design 缓存） |

### 皮肤切换性能路径

```
用户点击角色卡片
  → Popup: setSelectedRole(roleId)               < 1ms
  → chrome.storage.local.set({ role: roleId })     < 5ms
  → Content Script: onChanged 回调                 < 2ms
  → overlay.ts: updatePetAppearance(role)          < 10ms
  → CSS 变量更新（--primary-gradient 等）         < 5ms
  → 浏览器 Paint（仅受影响区域）                  < 16ms
  ─────────────────────────────────────────────────
  总延迟：< 40ms（用户无感知）
```

---

## 回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 新皮肤配置格式错误——`role-config.ts` 中角色配置的 JSON 结构不兼容旧版，Popup 打开即崩溃 | 回退 `role-config.ts` 到上一版本——内置角色使用旧格式，社区角色暂时隐藏 | Popup 皮肤中心 | < 5min（git revert） |
| 皮肤预览动画在低端设备上导致 Popup 卡顿（FPS < 30） | Feature Flag 关闭预览动画——保留静态角色展示，移除浮动/发光 CSS 动画 | Popup UI 性能 | < 1min（CSS class toggle） |
| `chrome.storage.onChanged` 同步在多个 Tab 之间产生 ping-pong 效应——Tab A 切换皮肤 → Tab B 同步 → Tab B 的 onChanged 触发反向写操作 | 添加变更来源标识（`source: 'popup'` / `source: 'sync'`）——`onChanged` 回调检查来源，仅处理远程变更 | 多 Tab 皮肤同步 | < 10min（代码修改） |
| CSS 变量名称与 Content Script 的 overlay 样式不兼容——新增的 `--yipet-` 变量在旧版 overlay 中无对应处理 | 变量名前缀版本化（`--yipet-v2-*`）或添加默认值 fallback——`var(--yipet-new-var, var(--yipet-old-var))` | 宠物外观渲染 | < 5min（CSS fallback） |
| Popup 的 Ant Design `ConfigProvider` 主题与皮肤颜色冲突——暗色主题下角色卡片颜色对比度不足 | 皮肤颜色选择时动态调整 Popup 主题 token（`colorBgContainer`、`colorText`）确保对比度 | Popup UI 可读性 | < 5min（ConfigProvider 配置） |

**回滚验证**：Popup 正常打开 → 角色/颜色切换即时生效 → 页面宠物外观同步更新 → 皮肤预览动画流畅（60fps）→ 关闭 Popup 后内存正常释放。

---

## 回归问题预测

| # | 预测问题 | 原因 | 验证方法 |
|---|---------|------|---------|
| 1 | `chrome.storage.onChanged` 监听器在 Popup 关闭后未被移除——Popup 组件卸载但 storage 监听器仍活跃，导致 Popup 的 React 状态更新在组件销毁后触发（React warning: "Can't perform a React state update on an unmounted component"） | Popup 的 `useEffect(() => { chrome.storage.onChanged.addListener(handler); return () => chrome.storage.onChanged.removeListener(handler); }, [])` 的 cleanup 函数依赖 React 严格模式正确执行——但 Popup 通过用户点击外部关闭时可能跳过 cleanup | 打开 Popup → 切换角色 → 点击 Popup 外部关闭 → 在另一个 Tab 中修改皮肤设置 → 检查浏览器 Console 是否有 React 内存泄漏警告 |
| 2 | 角色图片（头像 CDN URL）在弱网下加载失败——Popup 显示破损图片图标，用户以为角色不可用 | `role-config.ts` 中 `avatar` 字段使用 CDN 外链（`public/cdn/roles/cat.png` → `chrome.runtime.getURL()`）——本地资源不会加载失败。但社区角色可能使用远程 URL——在网络离线时加载失败 | 离线环境下打开 Popup——检查内置角色头像是否正常显示（本地资源），社区角色是否显示默认占位图 |
| 3 | 皮肤切换在 Content Script 未就绪时触发——用户在页面加载期间打开 Popup 并切换角色，`chrome.tabs.sendMessage` 失败，角色切换静默失效 | 页面加载期间 Content Script 的 `initRelay()` 可能尚未注册 `chrome.runtime.onMessage` 监听器。Popup 的 `chrome.storage.local.set` 写入成功，但 Content Script 尚未读取——用户关闭 Popup 后宠物外观未更新 | 在页面加载进度条仍在时打开 Popup 切换角色——检查页面完全加载后宠物外观是否与 Popup 设置一致 |
| 4 | 颜色选择器的 6 色块在设备色彩配置文件不同时显示不一致——设计师在 Mac (P3 色域) 选择"蓝色"，用户在 Windows (sRGB) 看到不同的颜色 | CSS 颜色使用 `#hex` 或 `rgb()` 值——在不同色域设备上渲染结果一致。但如果使用 `color(display-p3 ...)` 或依赖系统颜色管理，不同设备的色彩差异可达 ΔE 5+ | 在 Mac (P3) 和 Windows (sRGB) 上分别截图 Popup 的 6 个色块——使用取色器对比 RGB 值是否一致 |
| 5 | 宠物大小调整滑块的 0.5-2.0 范围在极小值（0.5）时宠物几乎不可见——用户误触滑块后找不到宠物，以为是 Bug | 宠物默认大小使用 CSS `transform: scale(1)`——`scale(0.5)` 将宠物缩小至 50%，在 4K 屏幕上可能仅有 30px 大小，用户难以在页面中找到 | 在 4K 屏幕上将宠物大小调至 0.5——检查宠物是否仍然可被用户发现（建议最小值设为 0.7 或添加"太小了？"提示） |
| 6 | `role-config.ts` 新增角色后 Popup 的 RolePicker 2 列布局溢出——10+ 角色时卡片超出 Popup 400×600 视口 | `RolePicker` 使用 CSS Grid 2 列布局，`grid-template-rows` 未设限制。10 个角色 = 5 行，每行 80px = 400px + padding，仍在 600px Popup 内。但 15+ 角色时可能溢出 | 添加 20 个测试角色到 `role-config.ts`——打开 Popup 检查 RolePicker 是否有滚动条且不超出 Popup 视口 |

---

## 设计决策记录

### D-01: chrome.storage.local + onChanged 实现 Popup 与 Content Script 通信

**状态**: 已采纳
**背景**: Popup 中用户选择皮肤/角色后，需将变更实时同步到页面宠物的 Content Script。传统方案（`chrome.runtime.sendMessage`）需要显式发送消息并处理 SW 中继，增加了消息丢失和时序问题的风险。
**决策**: 采用 `chrome.storage.local` 写入 + Content Script 监听 `chrome.storage.onChanged` 的通信模式。Popup 写入 `yipet:role`/`yipet:skin` 到 storage，Content Script 通过 `onChanged` 监听器实时响应，无需显式消息传递。
**理由**: 天然解耦——Popup 和 Content Script 无需知道彼此的存在；storage 作为单一数据源，避免了消息丢失和重复问题；`onChanged` 回调中直接读取 `changes[key].newValue` 而非依赖回调顺序，解决了快速切换时的时序问题。
**影响**: 多 Tab 场景下 `onChanged` 在所有 Tab 的 Content Script 中触发，需添加变更来源标识（`source: 'popup'` / `source: 'sync'`）避免 ping-pong 效应；Popup 关闭后 `onChanged` 监听器需正确移除（React cleanup 函数）；`chrome.storage.local.set` 写入频率需 debounce 控制（滑块 50ms）。

### D-02: 即时应用到页面（WYSIWYG 预览）

**状态**: 已采纳
**背景**: 传统方案在 Popup 内模拟预览效果，用户关闭 Popup 后才能看到实际页面变化——反馈循环断裂。
**决策**: 采用即时应用（WYSIWYG）模式——用户在 Popup 中调整的任何设置（皮肤、角色、大小、透明度）立即通过 `chrome.storage.onChanged` 触发 Content Script 更新宠物 DOM，用户可直接在页面上看到实时变化。
**理由**: 所见即所得的预览体验消除了反馈延迟；用户无需反复打开/关闭 Popup 来确认效果；实现成本低——仅依赖已有的 `onChanged` 通信机制，无需额外的预览渲染逻辑。
**影响**: 皮肤切换动画（`playTransitionAnimation`）在快速点击时可能堆积，需增加 `isAnimating` flag 跳过重复动画；CSS 变量更新耗时 < 50ms，不会触发页面 Layout（仅 Paint/Composite）；低端设备上动画可能影响帧率，需提供关闭动画的选项。

### D-03: CSS 变量注入实现皮肤切换

**状态**: 已采纳
**背景**: 皮肤切换需要在宠物 DOM 中应用新的配色方案。DOM 重建方案（销毁旧 DOM + 创建新 DOM）性能差且会丢失动画状态。
**决策**: 通过 Shadow DOM 的 `style.setProperty` 注入 CSS 自定义属性（`--yipet-primary`、`--yipet-secondary`、`--yipet-bg`），宠物组件的样式通过 `var(--yipet-primary)` 引用这些变量，实现无需 DOM 重建的皮肤切换。
**理由**: CSS 变量更新仅触发 Paint/Composite（不触发 Layout），性能最优；Shadow DOM 中的 CSS 变量天然隔离，不影响页面样式；一次设置 3 个变量即可完成皮肤切换，代码简洁。
**影响**: 需确保 CSS 变量注入到 Shadow DOM 的 `:host` 元素；变量名使用 `--yipet-` 前缀避免与页面样式冲突；回归风险：新增 CSS 变量在旧版 overlay 中无对应处理，需添加 fallback（`var(--yipet-new-var, var(--yipet-old-var))`）。

### D-04: 静态 TS 配置 + MongoDB 混合角色存储

**状态**: 已采纳
**背景**: 角色数据需要同时满足离线可用（内置角色）和动态扩展（社区角色）的需求。纯静态文件无法支持社区角色，纯远程 API 在网络不可用时无法加载角色。
**决策**: 内置角色从 `role-config.ts` 静态导入（编译时内联，零网络依赖），社区角色从 MongoDB `roles` 集合通过 API 异步加载。Popup 打开时合并两种数据源展示。
**理由**: 静态 TS 导入保证内置角色在离线环境下立即可用（< 10ms 加载）；MongoDB 扩展支持社区角色动态新增且无需发版；用户在网络不可用时仍可使用内置角色。

**影响**: 两套加载逻辑需统一抽象（`RoleRepository`），避免 `RoleSelector` 组件分别处理两种数据源；`role-config.ts` 中角色 ID 需与后端 `role_service.py` 的 prompt 模板保持同步；社区角色数据需在渲染前进行 XSS 过滤（仅使用 `{{ }}` 文本插值，不使用 `v-html`）。

## 相关文档

- [主题系统](../26-需求-主题系统.md) — 皮肤中心是主题系统的用户入口，皮肤选择与主题色彩、字体等视觉配置联动
- [聊天窗口交互](../05-需求-聊天窗口交互.md) — 皮肤切换后聊天窗口的视觉表现需与交互体验协调一致
