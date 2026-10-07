---

doc_type: test
title: 'YA-09-145: 插件化扩展系统 — Hook 机制与动态模块加载 — 测试规格'
status: 待开始
priority: P2
owner: 陈铭
roles:
- engineer
- qa
created: 2026-09-11
updated: '2026-09-23'
project: YiAi
project_id: yiai
prd_month: '202609'
prd_task_id: YA-09-145
source_prds:
- 151-需求-插件化扩展系统
source_modules: []
source_okr:
- yiai-003

type: test
---

# YA-09-145: 插件化扩展系统 — 测试规格

> 来源 PRD：[151-需求-插件化扩展系统.md](../../prds/2026-09/151-需求-插件化扩展系统.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **核心模块**：`src/domain/plugins/manager.py`（新建）— `PluginManager` 类的 discover/load_manifest/load_plugin/load_all 方法
- **Hook 注册中心**：`src/domain/plugins/manager.py` — `HookRegistry` 类的 register_event/register_filter/emit_event/apply_filters 方法
- **Hook 常量定义**：`src/domain/plugins/hooks.py`（新建）— 6 个 Event Hook + 3 个 Filter Hook 常量
- **集成模块**：`src/server/rpc_router.py`（修改）— before/after RPC Hook 集成点
- **排除范围**：具体插件实现（Slack 通知器、GitHub 同步器）的功能测试（属于插件自身测试），插件热加载性能压测（需基准测试环境）

### 测试策略

| 层级 | 策

## 二、测试数据 / Fixtures

- `temp_plugins_dir` — 测试数据 fixture
- `hook_registry` — 测试数据 fixture
- `plugin_manager` — 测试数据 fixture


## 三、详细测试用例

### TC-01: 插件目录发现（有效插件）
- **P0** | 返回列表含 1 个元素（插件目录路径） | 列表元素以 `test-plugin` 结尾

### TC-02: 空插件目录
- **P1** | 返回空列表 `[]` | 不抛出异常

### TC-03: Manifest 解析
- **P0** | 返回 `PluginManifest` 对象 | `name == "test-plugin"`，`version == "1.0.0"`

### TC-04: Manifest 缺少必填字段
- **P1** | 抛出 `KeyError` 或自定义异常 | 错误信息明确指出缺少字段 `name`

### TC-05: 事件 Hook 注册与触发
- **P0** | handler 被调用 1 次 | 调用参数包含 `error_type="test"`, `message="err"`

### TC-06: 未注册事件触发
- **P2** | 不抛出异常（空 handler 列表正常处理） | 无任何 handler 被调用

### TC-07: Filter Hook 链式执行
- **P0** | 返回 `{"msg": "hello_a_b"}`（按注册顺序链式执行） | handler_a 和 handler_b 各被调用 1 次

### TC-08: 插件版本不兼容
- **P1** | 抛出 `ValueError`，信息包含版本不兼容提示 | 插件未被加载到 `plguins` 字典中

### TC-09: 插件加载失败不阻塞其他插件
- **P1** | 返回列表含 1 个插件名（有效插件） | 无异常抛出（无效插件被跳过）

### TC-10: RPC Hook 集成点
- **P1** | before_rpc_call 修改的参数被传递给 RPC 处理函数 | on_agent_step 事件被异步触发，不阻塞 RPC 响应


## 四、边界与异常测试

### EC-01: `plugins/` 目录不存在
- **步骤**：删除 `plugins/` 目录后调用 `discover()`
- **预期**：返回空列表 `[]`，不崩溃

### EC-02: Manifest YAML 格式错误
- **步骤**：`plugin.yaml` 为非 YAML 格式（如纯文本或 JSON 格式）
- **预期**：`load_manifest` 抛出 `yaml.YAMLError`，错误信息包含文件名

### EC-03: 事件 handler 内部异常不传播
- **步骤**：注册一个会抛出 `RuntimeError` 的 event handler，触发事件
- **预期**：emit_event 返回，不向上层抛出异常；后续 handler 不受影响

### EC-04: Filter handler 返回非 dict 类型
- **步骤**：Filter handler 返回 `None` 而非 dict
- **预期**：`apply_filters` 仍然正常执行（或抛出明确 TypeError）

### EC-05: 并发加载同一插件
- **步骤**：2 个协程同时调用 `load_plugin` 加载同一插件目录
- **预期**：插件仅被加载 1 次（或有明确的竞态处理，如日志告警）


## 五、回归测试

### RG-01: 环境变量 `PLUGINS_ENABLED=false`
- **步骤**：设置 `PLUGINS_ENABLED=false`

### RG-02: 插件 manifest 中 `secret: true` 的字段不应出现在日志中
- **步骤**：加载包含 `secret: true` 配置字段的插件


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| EC-01~05 | 边界/异常情况 | 七、风险与缓解 |
| RG-01 | 回滚策略 | 八、回滚策略 |
| RG-02 | 配置安全 | 回归问题预测 #6 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| PluginHotReload 热加载测试 | 热加载涉及文件系统监控（watchdog），需要长时间运行测试 | 单独编写集成测试，使用 inotify/kqueue mock |
| 插件间依赖管理 | 本期不实现插件间依赖声明 | 未来版本补充依赖解析和加载顺序测试 |

*测试规格基于 PRD [151-需求-插件化扩展系统.md](../../prds/2026-09/151-需求-插件化扩展系统.md) 提取，覆盖 10 个用例 + 5 个边界测试 + 2 个回归测试。*
