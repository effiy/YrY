---
title: "YA-09-15: LLM Prompt 模板管理与版本控制 — 可复用提示词工程体系"
tags: [需求文档, Prompt, 模板管理, 版本控制, LLM, 后端]
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiAi
project_id: yiai
owner: 陈铭
prd_month: "202609"
prd_task_id: YA-09-15
estimate_backend: 1.0
review_status: 待评审
issue_type: 架构
roles: [aier, engineer]
---

# YA-09-15: LLM Prompt 模板管理与版本控制 — 可复用提示词工程体系

> 需求编号：YA-09-15 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

## 背景

YiAi 的 Prompt 分散在多个位置：Agent 系统提示词（`ai/agent.py`）、聊天系统提示词（`chat_service.py`）、RAG 上下文模板（`rag_service.py`）、总结模板（`compaction.py`）。当前 Prompt 以 Python 字符串内联在代码中，缺乏：

| 问题 | 影响 |
|------|------|
| Prompt 修改需改代码+重新部署 | 迭代慢——修改一个提示词需 10min 部署 |
| 无版本历史——Prompt 变更是隐式的 | 回滚困难——不知道"上个版本"的 Prompt 是什么 |
| 无 A/B 测试能力 | 无法量化 Prompt 变更效果 |
| 角色 Prompt 重复——YiPet 和 YiVad 各自维护角色定义 | 角色 Prompt 不一致 |

---

## 一、设计决策

### 决策 1：Prompt 存储 — 代码内嵌 vs 文件模板 vs 数据库

| 选项 | 版本控制 | 热更新 | 实现 |
|------|----------|--------|------|
| 代码内嵌 (当前) | Git (随代码) | 否 | 低 |
| **文件模板 (Jinja2/YAML)** | Git | 是 (文件轮询) | 中 |
| MongoDB 存储 | 需额外版本 | 是 | 高 |

**选择：YAML 文件模板。** Git 版本控制原生支持，Knowledge Watcher 可复用文件轮询机制实现热更新。

### 决策 2：模板引擎 — 纯字符串 vs Jinja2 vs f-string

**选择：Jinja2。** 支持条件、循环、过滤器——Agent 工具描述需要动态渲染。

---

## 二、目标架构

```
YiKnowledge/prompts/
├── system/
│   ├── agent.yml           # Agent 系统提示词 (ReAct 循环)
│   ├── chat.yml            # 通用聊天助手
│   └── code_review.yml     # 代码审查专用
├── tasks/
│   ├── summarize.yml       # 总结任务
│   ├── rag_context.yml     # RAG 上下文组装
│   └── compaction.yml      # 上下文压缩
├── roles/
│   ├── cat_assistant.yml   # 猫咪助手角色
│   └── tech_expert.yml     # 技术专家角色
└── _schemas/
    └── prompt.schema.yml   # Prompt 模板规范
```

```yaml
# YiKnowledge/prompts/system/agent.yml
version: "1.2.0"
name: agent_system
description: "Agent ReAct 循环系统提示词"
variables:
  - name: tools
    description: "可用工具列表（由 Agent 运行时注入）"
  - name: knowledge_context
    description: "RAG 检索到的知识上下文"
    default: ""
  - name: date
    description: "当前日期"
    default: "{{ current_date }}"
template: |
  你是一个 AI 助手，具有以下能力。

  ## 当前日期
  {{ date }}

  ## 可用工具
  {{ tools }}

  ## 知识库上下文
  {% if knowledge_context %}
  {{ knowledge_context }}
  {% else %}
  暂无相关上下文，请基于你的知识回答。
  {% endif %}

  ## 工作流程
  1. 分析用户问题——是否需要使用工具？
  2. 如果需要工具，调用最合适的工具
  3. 基于工具结果生成回答
  4. 如果工具结果不充分，尝试其他工具或告知用户

  ## 约束
  - 使用中文回答
  - 引用知识库来源（如有）: `[来源: {文件名}](路径)`
  - 不确定时明确告知，不要编造信息
metadata:
  author: 陈铭
  created: "2026-09-01"
  updated: "2026-09-09"
  tokens_estimate: 350
```

```python
# YiAi/src/services/ai/prompt_service.py

import yaml
from pathlib import Path
from jinja2 import Template
from datetime import datetime

class PromptManager:
    """Prompt 模板管理与热更新。"""

    def __init__(self, prompts_dir: str = "YiKnowledge/prompts"):
        self._prompts_dir = Path(prompts_dir)
        self._cache: dict[str, dict] = {}
        self._load_all()

    def _load_all(self):
        """加载所有 Prompt 模板。"""
        for yaml_file in self._prompts_dir.rglob("*.yml"):
            if '_schemas' in str(yaml_file):
                continue
            with open(yaml_file) as f:
                prompt = yaml.safe_load(f)
                key = f"{yaml_file.parent.name}/{yaml_file.stem}"
                self._cache[key] = prompt

    def render(self, name: str, variables: dict | None = None) -> str:
        """渲染 Prompt 模板。"""
        prompt = self._cache.get(name)
        if not prompt:
            raise PromptNotFoundError(f"Prompt '{name}' 不存在")

        vars_with_defaults = {
            'current_date': datetime.now().strftime('%Y-%m-%d'),
            **(variables or {}),
        }
        return Template(prompt['template']).render(**vars_with_defaults)

    def reload(self, file_path: str | None = None):
        """热更新——文件变更时重新加载。"""
        if file_path:
            self._load_single(file_path)
        else:
            self._load_all()
        logger.info(f"[Prompt] Reloaded: {file_path or 'all'}")

    def get_info(self, name: str) -> dict:
        """获取 Prompt 元信息（版本、变量列表等）。"""
        prompt = self._cache.get(name)
        if not prompt:
            raise PromptNotFoundError(f"Prompt '{name}' 不存在")
        return {
            'name': name,
            'version': prompt.get('version'),
            'description': prompt.get('description'),
            'variables': prompt.get('variables', []),
            'tokens_estimate': prompt.get('metadata', {}).get('tokens_estimate'),
        }
```

### 集成——Agent 使用 Prompt 模板

```python
# 改造前: prompt = "你是一个 AI 助手..." + tools_str + context (内联字符串)
# 改造后:
prompt = prompt_manager.render("system/agent", {
    "tools": tools_description,
    "knowledge_context": rag_context,
})
```

---

## 三、版本控制与回滚

| 能力 | 实现 |
|------|------|
| 版本记录 | `version: "1.2.0"` 在 YAML frontmatter 中 |
| 变更历史 | Git log `YiKnowledge/prompts/` |
| 回滚 | `git checkout <commit> -- YiKnowledge/prompts/` → 自动热更新 |
| A/B 测试 | 加载两个版本 → 随机分配 → 对比效果 (未来) |

---

## 四、测试规格

#### Scenario: 加载并渲染 Prompt 模板
- **Given** `prompts/system/agent.yml` 包含 `template: "你是 {{ role }}"`
- **When** `prompt_manager.render("system/agent", {"role": "代码审查员"})`
- **Then** 返回 `"你是 代码审查员"`

#### Scenario: 不存在的 Prompt 抛出异常
- **Given** Prompt `unknown/name` 未定义
- **When** `prompt_manager.render("unknown/name")`
- **Then** 抛出 `PromptNotFoundError`

#### Scenario: 热更新——文件变更后自动重载
- **Given** `agent.yml` 已修改（git pull 或文件编辑器保存）
- **When** `prompt_manager.reload("prompts/system/agent.yml")`
- **Then** 下次 `render("system/agent")` 使用新版本

#### Scenario: 变量默认值生效
- **Given** 模板包含 `{{ date }}`，variable 定义 `default: "{{ current_date }}"`
- **When** 调用 `render()` 时未传入 `date` 变量
- **Then** 使用当前日期作为默认值

#### Scenario: Jinja2 条件渲染
- **Given** 模板包含 `{% if knowledge_context %}{{ knowledge_context }}{% else %}无上下文{% endif %}`
- **When** 传入 `knowledge_context = ""`
- **Then** 渲染为 "无上下文"

---

## 五、代码审查检查清单

- [ ] 所有 Prompt 模板从 Python 代码中迁移到 `YiKnowledge/prompts/` 目录
- [ ] YAML 文件包含 `version`、`description`、`variables`、`template` 字段
- [ ] `_schemas/` 目录被 `_load_all()` 排除
- [ ] `render()` 使用 Jinja2 `Template` 而非字符串拼接
- [ ] `render()` 有 `PromptNotFoundError` 异常处理
- [ ] Knowledge Watcher 的文件变更回调触发 `prompt_manager.reload()`
- [ ] Prompt 目录受 YiKnowledge pre-commit hook 保护

---

## 六、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Jinja2 模板语法错误导致运行时异常 | 低 | 中 | `_load_all()` 时预编译模板，错误立即发现 |
| 热更新加载不完整的 YAML 文件 | 低 | 中 | 文件稳定性检测 (YK-09-02)，500ms 等待 |
| Prompt 变更影响 Agent 行为 | 中 | 中 | Git 版本历史可追溯 + 回滚 |

---

*PRD 来源: `projects/yiai/requirements/2026-09/15-需求-Prompt模板管理.md`*

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `chat_service.py`
- `rag_service.py`
- `compaction.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 在相关函数中添加参数校验和边界检查 |
| 测试 | 为 `chat_service.py` 添加单元测试 |
| 流程 | 代码审查时重点检查此类模式 |
| 监控 | 添加日志告警，异常发生时及时发现 |
| 文档 | 在编码规范中记录此类反模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
