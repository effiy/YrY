# YryVerifyReportFoot · 验证报告页脚

> Vue 3 组件 · 自定义元素 `<yry-verify-report-foot>` · 验证报告底部

## 文件

```
yry-verify-report-foot/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Loader: fetch → DOMParser → 注册 → ready 事件
└── index.css     # 组件样式 (2KB CSS)
```

## 事件

`yry-verify-report-foot-ready` — 模板 fetch + 注册完成

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-verify-report-foot/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../../../cdn/yry-verify-report-foot/index.js"></script>
<div id="verify-report-foot-app"></div>
<script>
  function mount() {
    Vue.createApp(window.YryVerifyReportFoot, { /* props */ }).mount('#verify-report-foot-app');
  }
  if (window.YryVerifyReportFoot) mount();
  else document.addEventListener('yry-verify-report-foot-ready', mount, { once: true });
</script>
```

## 依赖

Vue 3 运行时