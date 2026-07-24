# YiAi · 用户故事与模块化分析

> 轴线：**后端 → 模块化**（见 `.claude/skills/yry-init/rules/architecture-direction.md`）。
> 分析口径：以**架构设计**为大模块（domain boundary），每个模块下展开用户故事；以**功能模块化**为基础组织使用场景。
> 源码根：`YiAi/src/`。生成于 2026-07-24。

## 故事目录

| 领域模块（大模块） | 路径 | 故事 | 场景数 |
|--------------------|------|------|--------|
| `ai` | `src/domain/ai/` | [AI 对话与执行编排](ai/index.md) | 3 |
| `execution` | `src/domain/execution/` | [模块化执行引擎](execution/index.md) | 3 |
| `files` | `src/domain/files/` | [文件 / OSS 存储](files/index.md) | 3 |
| `rss` | `src/domain/rss/` | [RSS 订阅源](rss/index.md) | 3 |
| `state` | `src/domain/state/` | [会话 / 任务状态机](state/index.md) | 3 |
| `wework` | `src/domain/wework/` | [企微联动](wework/index.md) | 3 |

架构层：入口 `src/app.py` + `server/routes/` → 领域 `domain/<module>/` → 服务 `services/<module>/` → 数据 `data/`；`shared/` + `models/` + `observer/` 横切。

## 模块化方向（下一步边界固化）

| 机会 | 现状 | 建议边界 |
|------|------|----------|
| 公共 API 显式化 | 部分模块未声明 `__all__` | 每个领域模块 `__init__.py` 显式导出公共接口 |
| 跨模块依赖方向 | `domain/execution` 可能直引 `services/storage` | 引入 `services → domain` 单向依赖断言 |
| 路由层瘦身 | `server/routes/execution.py` 含少量业务判断 | 路由只做参数解析与委派 |
| observer 旁路 | 事件未显式契约 | 定义 `Event` 类型，observer 订阅而非直调 |

## 非目标

- 不在本阶段拆分独立服务（模块化优先于微服务化）。
- 不强制更换 ORM（`services/database/` 当前方案够用）。

## 链接

- 架构场景：`../arch/index.html`
- 测试场景：`../test/index.html`
- 文件清单：`../files/index.html`
- API 清单：`../apis/index.html`
