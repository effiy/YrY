# YryToast · Vue 3 Toast 通知组件

> Vue 3 懒加载挂载 · 全局变量 `window.YryToast` · 5 种语义色 · 模板源 + Demo 预览三件套

## 文件

```
yry-toast/
├── index.html    # 模板源 + Demo 预览 (含 <script type="text/x-template" id="yry-toast-tpl">)
├── index.js      # 懒加载 loader + 全局服务 API (show/success/error/warn/info/dismiss)
└── index.css     # 组件样式 (含 Vue <transition-group> 动画)
```

## 功能

- Toast 消息通知 · 页面级浮动提示
- 5 种语义色: `default` / `success` / `warn` / `error` / `info`
- 懒加载挂载: 首次调用 API 时才 fetch 模板 + 创建 Vue 应用
- 模板上限 5 条 · 自动消失 · 可点击关闭 · 支持标题
- a11y: `role="alert"` / `role="status"` / `aria-live="polite"`

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-toast/index.css">
<script src="../shared/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-toast/index.js"></script>
<script>
  YryToast.success('已复制', '链接已复制');
  YryToast.show('自定义消息', 'info', '提示', 5000); // 停留 5 秒
</script>
```

## API

| 方法 | 签名 | 说明 |
|------|------|------|
| `YryToast.show(text, type?, title?, duration?)` | `(text, type, title, duration)` | 显示 toast,type 缺省为 `default` |
| `YryToast.success(text, title?, duration?)` | `(text, title, duration)` | 成功 toast (`is-success` 绿色) |
| `YryToast.error(text, title?, duration?)`   | `(text, title, duration)` | 错误 toast (`is-error` 红色) |
| `YryToast.warn(text, title?, duration?)`    | `(text, title, duration)` | 警告 toast (`is-warn` 黄色) |
| `YryToast.info(text, title?, duration?)`    | `(text, title, duration)` | 信息 toast (`is-info` 青色) |
| `YryToast.dismiss(id?)` | `(id?)` | 关闭指定 id 或全部 |

## 5 种语义色

| type | class | 颜色 | 图标 | 用途 |
|------|-------|------|:---:|------|
| `default` | `is-default` | 灰 | ℹ | 默认主色 |
| `success` | `is-success` | 绿 | ✓ | 成功 / 通过 |
| `warn`    | `is-warn`    | 黄 | ⚠ | 警告 / 提示 |
| `error`   | `is-error`   | 红 | ✕ | 错误 / 失败 |
| `info`    | `is-info`    | 青 | ℹ | 信息 / 通知 |

> 兼容别名: `warning` 自动归一化为 `warn`。

## 参数约定

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `text` | String | 必填 | 通知正文 |
| `type` | String | `default` | 语义色 (见上表) |
| `title` | String | `''` | 可选标题,显示在正文上方加粗 |
| `duration` | Number | `3500` | 显示时长 (ms),`0` 表示不自动消失 |
| `id` | Number | — | `dismiss` 接受的条目 id |

## 模板结构

`<script type="text/x-template" id="yry-toast-tpl">` 内容:

```html
<div class="yry-toast-container" role="region" aria-live="polite" aria-atomic="false">
  <transition-group name="yry-toast-anim" tag="div" class="yry-toast-stack">
    <div v-for="item in items" :key="item.id" :class="['yry-toast', 'is-' + item.type]"
         :role="item.type === 'error' ? 'alert' : 'status'" @click="dismiss(item.id)">
      <span class="yry-toast-icon" aria-hidden="true">{{ icons[item.type] || icons.default }}</span>
      <div class="yry-toast-body">
        <div v-if="item.title" class="yry-toast-title">{{ item.title }}</div>
        <div v-if="item.text" class="yry-toast-text">{{ item.text }}</div>
      </div>
      <button class="yry-toast-close" aria-label="关闭通知" type="button" @click.stop="dismiss(item.id)">×</button>
    </div>
  </transition-group>
</div>
```

## 事件

| 事件 | 派发时机 | detail |
|------|----------|--------|
| `yry-toast-ready` | 首次挂载完成 | `{ component: 'YryToast' }` |

## 性能基线

| 指标 | 预算 | 说明 |
|------|:---:|------|
| HTML 体积 | ≤ 6KB | 模板 + Demo 预览 |
| JS 体积 | ≤ 7KB | loader + 服务 API |
| CSS 体积 | ≤ 5KB | 样式 + 动画 |
| 显示延迟 | ≤ 16ms | 仅 fetch + Vue 渲染 |
| 消失动画 | ≤ 300ms | Vue transition-group |

## a11y 语义

| 元素 | ARIA | 说明 |
|------|------|------|
| 容器 | `role="region"` · `aria-live="polite"` | 整体可感知 |
| error 条目 | `role="alert"` | 立即播报 |
| 其他条目 | `role="status"` | 礼貌播报 |
| 关闭按钮 | `aria-label="关闭通知"` | 可读 |

## 兼容性

| 浏览器 | 最低版本 | 测试 |
|--------|:---:|:---:|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 迁移说明 (v1 → v2)

- 由 vanilla JS 改为 Vue 3 懒加载组件
- 模板从字符串拼接改为 fetch('index.html') + DOMParser
- 样式类名保持 `yry-toast*` 兼容,容器从 `sr-toast-container` 改为组件自动创建 `#yry-toast-host`
- API 兼容: `YryToast.show/success/error/warn/info` 签名一致
- 新增: 支持 `title` 标题;新增 `dismiss(id?)` 关闭 API
