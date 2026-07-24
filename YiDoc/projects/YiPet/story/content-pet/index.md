# Story · content/pet · 桌宠交互

> 页面：[YiPet Story](../index.md) · `src/content/pet/`

## 场景

- [US-PT1 · 桌宠在页面角落常驻，可拖拽与点击触发动作](scene-1-drag-click/index.md)
- [US-PT2 · 桌宠能表达情绪（待机 / 思考 / 回复中）](scene-2-emotion/index.md)
- [US-PT3 · 桌宠可隐藏 / 显示](scene-3-toggle-visibility/index.md)

## 使用场景 · 组件化

- `pet-manager-core.js` / `pet-manager-ui.js` / `pet-manager.js` 已分层（core / ui / facade）→ 组件化的良好样本。
- 下一步：将 pet-manager-ui 抽为 `<YiPetAvatar>` 组件入 CDN 库。
