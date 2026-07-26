---
name: component-extractor
description: Extracts reusable Vue 3 components, composables, and directives from existing YiVad code.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# component-extractor — YiVad 组件/Composable 抽取

从现有代码中抽取可复用的组件、Composable 和指令，放入正确的目录。

## 目标目录

```
src/components/               # 跨页面复用的 UI 组件
├── ProTable/                 # 表格组件（canonical table pattern）
├── SearchForm/               # 搜索表单
├── SelectFilter/             # 下拉筛选
├── TreeFilter/               # 树形筛选
├── Upload/                   # 文件上传（Img.vue, Imgs.vue）
├── WangEditor/               # 富文本编辑器
├── SvgIcon/                  # SVG 图标
├── ErrorMessage/             # 错误页（403, 404, 500）
└── ImportExcel/              # Excel 导入

src/hooks/                    # Composable 函数（useXxx）
├── useTable.ts               # 表格逻辑
├── useTheme.ts               # 主题切换
├── useSelection.ts            # 多选逻辑
└── ...

src/directives/modules/       # 自定义指令
├── auth.ts                   # v-auth — 权限控制
├── copy.ts                   # v-copy — 一键复制
├── debounce.ts               # v-debounce — 防抖
├── draggable.ts              # v-draggable — 拖拽
└── ...
```

## 抽取检查清单

当发现重复代码时，按以下优先级抽取：

1. **Composable** — 纯逻辑重复 → `src/hooks/useXxx.ts`
2. **Directive** — DOM 行为重复 → `src/directives/modules/<name>.ts`
3. **Component** — UI 模板重复 → `src/components/<Name>/index.vue`

## 规则

- Component 使用 `defineProps<{...}>()` 和 `defineEmits<{...}>()` 定义接口
- Composable 返回包含 `ref`/`reactive`/`computed`/方法的对象
- Directive 在 `src/directives/index.ts` 中注册
- 只抽取有 2+ 使用点的代码 — 单次使用的抽象层反而增加复杂度
- 抽取后更新所有调用点，确保类型检查通过
