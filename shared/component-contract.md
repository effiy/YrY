# 共享组件开发契约

> 本文件定义“共享组件”的开发规范（不绑定具体部署形态），作为 `architect`、`code-reviewer` 和 `implement-code` 的共享解释层。

## 1. 什么放共享层，什么放应用层

| 类型 | 存放位置 | 判断标准 |
|------|---------|---------|
| 跨应用共享组件 | `<shared>/components/` | 至少 2 个应用需要使用 |
| 应用特有组件 | `<app>/components/` | 只在单个应用中使用 |
| 通用工具函数 | `<shared>/utils/` | 不依赖任何特定应用的 Store |
| 应用特有工具 | `<app>/utils/` | 依赖特定应用的状态/上下文 |

**建议**：跨应用复用的组件优先提升到共享层，避免在应用层复制粘贴。

## 2. 共享组件三文件结构

每个共享组件遵循三文件结构：

```
<shared>/components/<分类>/<组件名>/
├── index.js       # 组件逻辑（必须）
├── template.html  # 组件模板（必须）
└── index.css      # 组件样式（可选）
```

### index.js 规范

组件逻辑建议使用项目既有的组件注册/导出方式（如下仅为示例）：

```javascript
registerGlobalComponent({
    name: 'AppButton',
    html: '<shared>/components/common/buttons/AppButton/template.html',
    css: '<shared>/components/common/buttons/AppButton/index.css',

    props: {
        variant: { type: String, default: 'primary' },
        disabled: { type: Boolean, default: false }
    },
    emits: ['click'],

    computed: {
        buttonClass() {
            return `app-btn app-btn--${this.variant}`;
        }
    },
    methods: {
        handleClick(event) {
            if (!this.disabled) {
                this.$emit('click', event);
            }
        }
    }
});
```

### template.html 规范

模板使用标准 HTML，通过 Vue 模板语法绑定：

```html
<button :class="buttonClass" :disabled="disabled" @click="handleClick">
    <slot></slot>
</button>
```

### index.css 规范

样式使用 BEM 命名（前缀按项目约定）：

```css
.app-btn { ... }
.app-btn--primary { ... }
.app-btn--secondary { ... }
```

## 3. Barrel Export 规范

若项目使用 barrel export，则共享组件应在统一入口文件中导出：

```javascript
export { default as AppButton } from './common/buttons/AppButton/index.js';
export { default as AppModal } from './common/modals/AppModal/index.js';
```

**建议**：避免在入口导出中遗漏已开发的共享组件。

## 4. 组件分类约定

| 分类 | 路径 | 说明 |
|------|------|------|
| 通用按钮 | `<shared>/components/common/buttons/` | Button, IconButton |
| 通用表单 | `<shared>/components/common/forms/` | Input, Select, Checkbox |
| 通用弹窗 | `<shared>/components/common/modals/` | Modal, Dialog |
| 通用数据展示 | `<shared>/components/common/data-display/` | Table, Tooltip |
| 通用反馈 | `<shared>/components/common/feedback/` | Loading, EmptyState |
| 领域组件 | `<shared>/components/domain/` | 领域特有组件（若需要共享） |

## 5. 与应用入口的衔接

应用入口应在初始化阶段显式声明/注册需要用到的共享组件（方式按项目约定）：

```javascript
initApp({
    components: ['Page', 'Header', 'AppModal', 'AppButton'],
})
```

入口初始化逻辑需确保这些组件的模板、样式与脚本可被正确加载/注册。

## 6. 安全执行与错误处理

共享组件内部建议使用项目统一的错误处理封装（如下仅为示例）：

```javascript
import { safeExecute } from '<shared>/utils/error.js';

methods: {
    async loadData() {
        return safeExecute(async () => {
            const data = await fetchData();
            this.items = data;
        }, '加载数据');
    }
}
```

## 7. 检查清单

开发共享组件时，请确认：

- 组件位于共享层路径下（按项目约定），不与应用层代码混放
- 三文件结构完整（index.js + template.html + index.css）
- 如使用 barrel export，已在统一入口导出
- 类名遵循项目 BEM/前缀约定
- 异步操作使用 `safeExecute` 包装
- Props 使用对象语法（含 type 和 default）
- Events 通过 `$emit` 发送，不在组件内部直接修改父级状态
