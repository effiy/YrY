---

doc_type: test
title: "YA-09-23: 配置中心热更新 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-23"
source_prds: ["27-需求-配置中心热更新"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-23: 配置中心热更新 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖运行时参数热更新、config.yaml 文件监听、配置校验、回滚机制。

> 来源 PRD：[27-需求-配置中心热更新.md](../../prds/2026-09/27-需求-配置中心热更新.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 配置合并、校验逻辑 | pytest | YAML 解析、schema 校验、类型转换 |
| L2 集成测试 | 文件监听 + 服务运行时 | pytest + watchdog | config.yaml 修改→热加载→行为验证 |

### 1.2 可热更新的配置项

| 配置项 | 热更新 | 需重启 | 说明 |
|--------|--------|--------|------|
| `knowledge.watcher_poll_seconds` | 是 | 否 | 轮询间隔 |
| `llm.default_model` | 是 | 否 | 默认模型 |
| `llm.timeout` | 是 | 否 | 超时时间 |
| `rate_limit.*` | 是 | 否 | 限流配置 |
| `mongodb.url` | 否 | 是 | 数据库连接 |
| `server.port` | 否 | 是 | 服务端口 |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import yaml
import asyncio
from pathlib import Path
from unittest.mock import MagicMock, patch

@pytest.fixture
def base_config():
    """基础配置。"""
    return {
        "knowledge": {"watcher_poll_seconds": 60},
        "llm": {"default_model": "qwen2.5:7b", "timeout": 120},
        "rate_limit": {"user": {"rate": 10, "capacity": 20}},
        "mongodb": {"url": "mongodb://localhost:27017"},
        "server": {"port": 10086},
    }

@pytest.fixture
def updated_config():
    """更新后的配置——仅修改可热更新项。"""
    return {
        "knowledge": {"watcher_poll_seconds": 30},
        "llm": {"default_model": "qwen2.5:1.5b", "timeout": 60},
        "rate_limit": {"user": {"rate": 20, "capacity": 40}},
        "mongodb": {"url": "mongodb://localhost:27017"},  # 不变
        "server": {"port": 10086},  # 不变
    }

@pytest.fixture
def invalid_config():
    """无效配置——类型错误。"""
    return {
        "knowledge": {"watcher_poll_seconds": "invalid_string"},
        "llm": {"default_model": 123},  # 应为字符串
    }

@pytest.fixture
def config_file(tmp_path):
    """临时配置文件。"""
    config_path = tmp_path / "config.yaml"
    config_path.write_text(yaml.dump({
        "knowledge": {"watcher_poll_seconds": 60},
        "llm": {"default_model": "qwen2.5:7b", "timeout": 120},
    }))
    return config_path
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 热更新基本功能

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CF-01 | config.yaml 修改后热加载 | 文件监听启用 | 1. 修改 watcher_poll_seconds=60→30<br>2. 等待文件监听触发 | 配置在 5s 内生效 | P0 |
| TC-CF-02 | 热更新后服务行为变更 | watcher_poll_seconds=60→30 | 1. 修改轮询间隔<br>2. 观察知识库监视器 | 轮询间隔从 60s 变为 30s | P1 |
| TC-CF-03 | 无需重启的配置项不中断服务 | 修改 llm.timeout | 1. 修改超时配置<br>2. 检查服务状态 | 服务持续运行，无中断 | P1 |
| TC-CF-04 | 需重启的配置项热更新被忽略 | 修改 server.port | 1. 修改端口<br>2. 检查实际端口 | 端口不变，日志 INFO "端口需重启生效" | P1 |

### 3.2 配置校验

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CF-05 | 类型校验拒绝无效值 | invalid_config | 1. 文件写入无效值<br>2. 检查校验结果 | 拒绝加载，回退到上一个有效配置 | P0 |
| TC-CF-06 | 范围校验 | watcher_poll_seconds=0 | 1. 尝试设置 0（不合法）<br>2. 检查行为 | 拒绝，"值应 >= 1" | P2 |
| TC-CF-07 | 缺少必填字段 | config 缺少 knowledge 节 | 1. 写入不完整配置<br>2. 检查校验 | 拒绝加载，日志 ERROR | P2 |

### 3.3 配置回滚

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CF-08 | 无效配置自动回滚 | 新配置校验失败 | 1. 写入无效配置<br>2. 检查当前运行配置 | 保持上一个有效配置不变 | P1 |
| TC-CF-09 | 手动回滚到指定版本 | 配置变更历史 | 1. 回滚到上一个版本的配置<br>2. 检查行为 | 配置恢复到指定的历史版本 | P2 |
| TC-CF-10 | YAML 语法错误保护 | 非法 YAML 语法 | 1. 写入语法错误的 config.yaml<br>2. 检查行为 | 保留当前配置，日志 ERROR "YAML 解析失败" | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-CF-01 | 配置文件被删除 | config.yaml 不存在 | 使用默认配置，日志 WARNING | P1 |
| EG-CF-02 | 配置文件权限不足 | config.yaml 不可读 | 保留当前配置，日志 ERROR | P2 |
| EG-CF-03 | 高频修改配置文件 | 1s 内修改 10 次 | 防抖动，仅加载最终版本 | P2 |
| EG-CF-04 | 并发读取配置 | 配置热更新期间有请求 | 原子切换，请求获取一致配置 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-CF-01 | 热更新不影响现有请求 | 配置热更新期间 | 进行中的请求使用更新前配置 | P1 |
| RG-CF-02 | 默认配置与 config.yaml 合并正确 | 仅修改部分配置 | 未修改的配置保持原值 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 文件监听热加载 | TC-CF-01 ~ TC-CF-04 | 修改生效/行为变更/无中断/重启项忽略 |
| FR2: 配置校验 | TC-CF-05 ~ TC-CF-07 | 类型/范围/必填 |
| FR3: 回滚机制 | TC-CF-08 ~ TC-CF-10 | 自动回滚/手动/语法错误 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| MongoDB 配置中心 | 当前仅文件监听，无集中配置存储 | 添加 MongoDB configs 集合→文件同步测试 |
| 多实例配置同步 | 多个 YiAi 实例配置不一致 | 添加分布式配置一致性测试 |
| 配置变更审计 | 无变更历史记录 | 添加配置变更审计日志测试 |