# YryStoryCardList · 故事卡片列表组件

> Vue 3 组件 · 自定义元素 `<yry-story-card-list>` · 多故事卡 + 场景列表 + 摘要条

## 文件

```
yry-story-card-list/
├── index.html    # 模板源 + Demo 预览
├── index.js      # Vue 3 组件 loader (异步 fetch 模板)
└── index.css     # 组件样式
```

## 功能

- 渲染摘要条 (summary) + 多故事卡 (stories)
- 每个故事卡支持: badge (6 种语义色) · 标题 · 描述 · meta 行 · 场景列表
- 每个场景支持: 链接 · 描述 · 多个交付物链接 (清单/架构/图谱/测试/源码/演示/审查)
- 响应式 grid 布局 (minmax(280px, 1fr))

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-story-card-list/index.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="../../cdn/yry-story-card-list/index.js"></script>
<yry-story-card-list id="scl-app"></yry-story-card-list>
<script>
  var el = document.getElementById('scl-app');
  el.summary = [{ value: '6', label: '故事' }, { value: '32', label: '场景' }];
  el.stories = [
    {
      badge: 'CDN',
      badgeVariant: 'cdn',  // cdn / home / checklist / test / arch / self
      title: 'Story 1: CDN 共享前端资源库',
      desc: '...',
      meta: [{ text: '📁 cdn/' }, { text: '🎬 5 场景' }],
      scenes: [
        {
          name: '场景 1 · ...',
          href: '...',
          desc: '...',
          links: [{ label: '清单', href: '...' }, { label: '架构', href: '...' }]
        }
      ]
    }
  ];
</script>
```

## Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `summary` | Array | `[]` | 摘要条 `[{ value, label }]` |
| `stories` | Array | `[]` | 故事列表 (见下) |

### story 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `badge` | String | 标签文字 (如 'CDN') |
| `badgeVariant` | String | 标签色变体: `cdn` / `home` / `checklist` / `test` / `arch` / `self` |
| `title` | String | 故事标题 |
| `desc` | String | 故事描述 |
| `meta` | Array | `[{ text }]` meta 行 |
| `scenes` | Array | 场景列表 (见下) |

### scene 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | String | 场景名 (链接文本) |
| `href` | String | 场景链接 |
| `desc` | String | 场景描述 |
| `links` | Array | `[{ label, href }]` 交付物链接 |

## 依赖

- Vue 3 (`vue.global.prod.js`)
- 共享样式 `cdn/theme/index.css` (设计令牌)
