# Story · 批量与 UI（batch-ui）

> 模块：[YiviY Story](../index.md) · `launch.py` + `batch/` + `st_utils/`

## 场景

- [US-B1 · Streamlit UI 一键触发全流程](scene-1-one-click-streamlit/index.md)
- [US-B2 · 批量脚本并行处理多视频](scene-2-parallel-batch/index.md)
- [US-B3 · UI 多语资源可运行时切换](scene-3-i18n-switch/index.md)

## 使用场景 · 模块化

- `launch.py` 只做参数解析与阶段编排，不内嵌业务逻辑。
- `batch/` 与 Streamlit UI 共享 `core/` 公共接口，不直接调用内部阶段函数。
