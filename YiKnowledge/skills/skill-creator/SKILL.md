---
name: skill-creator
description: 创建新技能、修改和改进现有技能，以及衡量技能表现。当用户想要从零开始创建技能、编辑或优化现有技能、运行 eval 来测试技能、通过方差分析进行技能基准测试，或优化技能描述以获得更好的触发准确率时使用。
---

# 技能创建器

用于创建新技能并迭代改进的技能。

## 核心循环

```
起草 → 测试（有/无技能）→ 审查（人工 + 量化）→ 改进 → 重复
```

1. 理解技能应该做什么，起草 SKILL.md
2. 并行运行有技能和无技能的测试提示
3. 起草断言，评分结果，汇总基准数据，启动审查查看器
4. 收集人工反馈并改进技能
5. 重复直到满意，然后可选择优化描述并打包

你的工作是弄清楚用户在这个流程中的哪个阶段，并帮助他们推进。如果他们只有一个想法，从零开始。如果他们已经有一个草稿，跳到测试阶段。如果他们想改进现有技能，将旧版本快照作为基线，然后迭代。

---

## 与用户沟通

用户从终端新手到经验丰富的开发者不等。注意上下文线索：
- "evaluation"和"benchmark"——对大多数用户来说可以接受
- "JSON"和"assertion"——仅在用户表现出熟悉度时使用
- 如果不确定，简要解释术语

---

## 创建技能

### 捕获意图

首先理解用户想要什么。如果当前对话已经包含了他们想要捕获的工作流程，先从历史记录中提取——使用的工具、步骤顺序、做出的修正、输入/输出格式。然后填补空白：

1. 这个技能应该让 Claude 能够做什么？
2. 它应该在什么时候触发？（什么用户短语/上下文）
3. 预期的输出格式是什么？
4. 是否应该设置测试用例？具有客观可验证输出的技能（文件转换、数据提取、代码生成、固定工作流程）受益于测试用例。主观性技能（写作风格、设计）通常不需要。建议适当的默认值，但让用户决定。

### 访谈和研究

探究边缘情况、输入/输出格式、示例文件、成功标准和依赖项。检查可用的 MCP 进行研究——搜索文档、查找类似技能、查找最佳实践。带着上下文准备充分，减少用户的负担。

### 编写 SKILL.md

填写以下组成部分：

- **name**：技能标识符
- **description**：何时触发，做什么。这是主要的触发机制——包含技能做什么以及何时使用的具体上下文。所有"何时使用"的信息放在这里，不要放在正文中。让描述稍微"强势"一些——Claude 倾向于不足触发技能。例如，与其写"如何构建仪表盘"，不如写"如何构建仪表盘。当用户提到仪表盘、数据可视化、内部指标或想要展示公司数据时使用此技能，即使他们没有明确要求'仪表盘'。"
- **compatibility**：所需工具、依赖项（可选，很少需要）
- **正文**：技能指令

### 技能编写指南

**结构：**
```
skill-name/
├── SKILL.md（必需）
│   ├── YAML frontmatter（name、description 必需）
│   └── Markdown 指令
└── 捆绑资源（可选）
    ├── scripts/    - 用于确定性/重复性任务的可执行代码
    ├── references/ - 按需加载到上下文中的文档
    └── assets/     - 输出中使用的文件（模板、图标、字体）
```

**渐进式披露：**
1. **元数据**（name + description）——始终在上下文中（约 100 词）
2. **SKILL.md 正文**——技能触发时在上下文中（理想情况下 <500 行）
3. **捆绑资源**——按需使用（无限制，脚本可以无需加载即可执行）

将 SKILL.md 保持在 500 行以内。如果接近此限制，添加层次结构层，并明确指向后续文件。对于大型参考文件（>300 行），包含目录。

**领域组织**——当支持多个领域/框架时，按变体组织：
```
cloud-deploy/
├── SKILL.md（工作流程 + 选择）
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
Claude 只读取相关的参考文件。

**编写模式：**
- 使用祈使句形式
- 用模板定义输出格式：`## 报告结构` / `始终使用此精确模板：`
- 包含示例：`**示例：** 输入：... → 输出：...`
- 解释事情**为什么**重要，而不是使用强硬的"必须"。运用心智理论，使技能通用化，不要过度拟合特定示例。

---

## 测试用例

起草技能后，创建 2-3 个真实的测试提示——真实用户实际会说的话。与用户分享，然后保存到 `evals/evals.json`：

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "用户的任务提示",
      "expected_output": "预期结果的描述",
      "files": []
    }
  ]
}
```

完整 schema 参见 `references/schemas.md`。现在不要写断言——在运行进行中起草它们。

---

## 运行和评估测试用例

这是一个连续的序列——不要中途停止。

### 步骤 1：并行启动所有运行

对于每个测试用例，**在同一轮**中启动两个子代理——一个带技能，一个不带。不要先启动带技能的，再启动基线。

**带技能运行：**
```
执行此任务：
- 技能路径：<path-to-skill>
- 任务：<eval prompt>
- 输入文件：<eval files 如果有，否则 "none">
- 保存输出到：<workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- 要保存的输出：<用户关心的内容>
```

**基线运行：**
- **创建新技能**：完全不使用技能。相同的提示，保存到 `without_skill/outputs/`。
- **改进现有技能**：先快照旧版本（`cp -r <skill> <workspace>/skill-snapshot/`），然后将基线子代理指向快照。保存到 `old_skill/outputs/`。

为每个测试用例编写 `eval_metadata.json`（断言暂时可以为空）。根据测试内容给每个 eval 一个描述性名称——也用作目录名。

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "用户的任务提示",
  "assertions": []
}
```

### 步骤 2：在运行进行中起草断言

不要等待——利用这段时间高效工作。为每个测试用例起草量化断言，并向用户解释。如果 `evals/evals.json` 中已经存在断言，审查它们。

好的断言是客观可验证的，具有描述性名称。主观性技能（写作风格、设计质量）更适合定性评估。用断言更新 `eval_metadata.json` 和 `evals/evals.json`。

### 步骤 3：运行完成时捕获时间数据

当每个子代理任务完成时，你会收到带有 `total_tokens` 和 `duration_ms` 的通知。立即保存到运行目录中的 `timing.json`：

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

这是捕获此数据的唯一机会——它通过任务通知传来，不会在其他地方持久化。

### 步骤 4：评分、汇总并启动查看器

1. **评分每个运行**——启动一个评分子代理（或内联评分），读取 `agents/grader.md` 并根据输出评估每个断言。保存到 `grading.json`。expectations 数组必须使用 `text`、`passed` 和 `evidence` 字段（而不是 `name`/`met`/`details`）。对于程序化断言，编写并运行脚本，而不是肉眼判断。

2. **汇总为基准数据：**
   ```bash
   python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
   ```
   这会生成 `benchmark.json` 和 `benchmark.md`。将每个 with_skill 版本放在其基线对应版本之前。

3. **进行分析师检查**——阅读基准数据并发现模式：无论技能如何都始终通过的断言（无区分度）、高方差 eval（可能不稳定）、时间/Token 权衡。参见 `agents/analyzer.md` 了解需要关注的内容。

4. **启动查看器：**
   ```bash
   nohup python <skill-creator-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   ```
   对于第 2 次及以后的迭代，添加 `--previous-workspace <workspace>/iteration-<N-1>`。

   **没有显示器？** 使用 `--static <output_path>` 生成独立的 HTML 文件。当用户点击"提交所有审查"时，反馈将以 `feedback.json` 形式下载。

5. **告诉用户：**"我已在浏览器中打开结果。有两个标签页——'Outputs'让你可以点击浏览每个测试用例并留下反馈，'Benchmark'显示量化对比。完成后，回到这里告诉我。"

### 步骤 5：读取反馈并改进

用户完成后，读取 `feedback.json`：

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "图表缺少坐标轴标签", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": "", "timestamp": "..."}
  ],
  "status": "complete"
}
```

空反馈表示用户认为没问题。将改进重点放在有具体投诉的测试用例上。关闭查看器：`kill $VIEWER_PID 2>/dev/null`。

---

## 改进技能

### 如何思考改进

1. **从反馈中泛化。** 技能应该适用于百万次使用，而不仅仅是 2-3 个测试用例。如果顽固问题持续存在，尝试不同的隐喻或工作模式，而不是繁琐的过度拟合更改。

2. **保持提示精简。** 删除不起作用的内容。阅读转录记录，而不仅仅是最终输出——如果技能让模型在无意义的事情上浪费时间，删掉它们。

3. **解释为什么。** 当今的 LLM 很聪明——它们有良好的心智理论，在获得良好推理时可以超越死记硬背的指令。如果你发现自己用全大写写 ALWAYS 或 NEVER，那是黄色警告——用推理来重新表述。

4. **寻找跨测试用例的重复工作。** 如果所有 3 个测试用例都独立编写了相同的辅助脚本，将其打包到 `scripts/` 中并从技能中引用它。这可以节省每次未来调用的重复劳动。

### 迭代循环

1. 对技能应用改进
2. 将所有测试用例重新运行到新的 `iteration-<N+1>/` 目录中，包括基线
3. 使用 `--previous-workspace` 指向上一次迭代来启动审查器
4. 等待用户审查，读取反馈，再次改进

**停止时机：** 用户表示满意，反馈全部为空，或者你没有取得有意义的进展。

---

## 描述优化

SKILL.md frontmatter 中的 description 字段是技能触发的主要机制。技能完成后，提供优化选项。

### 步骤 1：生成触发 Eval 查询

创建 20 个 eval 查询——混合应该触发和不应该触发的。保存为 JSON：

```json
[
  {"query": "用户提示", "should_trigger": true},
  {"query": "另一个提示", "should_trigger": false}
]
```

**应该触发（8-10 个）：** 同一意图的不同表述——正式、随意、带和不带技能名称。包含边缘情况。查询必须足够实质性，Claude 才会实际考虑使用技能（简单的一步查询无论如何都不会触发）。

**不应该触发（8-10 个）：** 聚焦于近似匹配——共享关键词但需要不同内容的查询。相邻领域、模糊表述。不要让这些明显不相关。

查询应该是真实的：具体、具体，带有文件路径、上下文、口语化表达、拼写错误。不是抽象的。

### 步骤 2：与用户一起审查

1. 从 `assets/eval_review.html` 读取模板
2. 将 `__EVAL_DATA_PLACEHOLDER__` 替换为 JSON 数组，`__SKILL_NAME_PLACEHOLDER__` 替换为技能名称，`__SKILL_DESCRIPTION_PLACEHOLDER__` 替换为当前描述
3. 写入 `/tmp/eval_review_<skill-name>.html` 并打开
4. 用户可以编辑查询、切换 should-trigger、添加/删除条目，然后点击"导出 Eval 集"
5. 文件下载到 `~/Downloads/eval_set.json`——检查最新版本

### 步骤 3：运行优化循环

告诉用户："这需要一些时间——我会在后台运行优化循环。"

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

这会将 eval 集分割为 60% 训练集 / 40% 测试集，评估当前描述（每个查询运行 3 次以确保可靠性），最多迭代 5 次，并通过测试分数（而非训练分数）选择 `best_description` 以避免过度拟合。定期查看输出以向用户更新进度。

### 步骤 4：应用结果

从输出中获取 `best_description` 并更新 SKILL.md frontmatter。显示前后对比并报告分数。

---

## 高级：盲法对比

用于两个技能版本之间的严格 A/B 对比。详情请阅读 `agents/comparator.md` 和 `agents/analyzer.md`。一个独立的代理在不知道哪个是哪个的情况下评判两个版本的输出，然后分析师解释获胜者为什么获胜。这是可选的，大多数用户不需要。

---

## 平台特定适配

### Claude.ai

没有子代理意味着没有并行执行。按如下方式适配：
- **自己运行测试用例**，一次一个，按照技能指令执行。跳过基线——只使用技能完成任务。这不够严谨，但人工审查可以弥补。
- **在对话中内联审查结果**——显示每个提示和输出。跳过浏览器查看器和量化基准测试。
- **描述优化**需要 `claude` CLI 工具（`claude -p`）——如果不可用则跳过。
- **盲法对比**需要子代理——跳过。
- **打包**在 Python 和文件系统下正常工作。

### Cowork

子代理可用，因此主要工作流程完全支持。关键区别：
- 没有浏览器/显示器——使用 `--static <output_path>` 与 `generate_review.py` 生成独立的 HTML 文件。提供用户可以点击的链接。
- **始终在自己评估输入之前生成 eval 查看器。** 尽快将结果呈现给人类。
- 反馈："提交所有审查"按钮下载 `feedback.json`——从下载位置读取它。
- 描述优化正常工作，因为它通过子进程使用 `claude -p`。

### 更新现有技能

- **保留原始名称**——目录名和 `name` frontmatter 字段不变。
- **如果安装路径是只读的，在编辑前复制到可写位置**（`/tmp/skill-name/`）。
- **如果因权限问题直接写入失败，从副本打包**。

---

## 打包和呈现

如果 `present_files` 工具可用，打包技能：

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

引导用户到生成的 `.skill` 文件路径，以便他们安装。

---

## 参考文件

- `agents/grader.md`——如何根据输出评估断言
- `agents/comparator.md`——如何进行盲法 A/B 对比
- `agents/analyzer.md`——如何分析为什么一个版本优于另一个
- `references/schemas.md`——evals.json、grading.json 等的 JSON 结构