# Scene · Streamlit UI 一键触发全流程

> Story: [batch-ui](../index.md) · US-B1

## 用户故事

作为用户，Streamlit UI 能一键触发全流程。

## 验收

- 侧边栏 "Start" 按钮调用 `launch.py`；进度条显示当前阶段。
- 失败阶段高亮；可单独重跑。
- 中断后可从最近 checkpoint 恢复。

## 使用场景 · 模块化

- `st.py` 只调 `launch.py` 公共入口；不直接 import 阶段模块。
- UI 与管线解耦 → 阶段模块可独立测试或被 `batch/` 复用。
