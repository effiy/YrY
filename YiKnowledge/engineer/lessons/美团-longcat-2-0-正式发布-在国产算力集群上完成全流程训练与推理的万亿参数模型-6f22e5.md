---
title: 美团 LongCat-2.0 正式发布：在国产算力集群上完成全流程训练与推理的万亿参数模型
tags:
- 美团技术团队
category: engineer/lessons
created: '2026-08-16'
source: https://tech.meituan.com/2026/06/30/LongCat2.0.html
type: rss
source_name: 美团技术团队
source_url: https://tech.meituan.com/feed/
---

<p>6月30日，美团正式发布新一代万亿参数大模型 LongCat-2.0，并将对外开源。</p>
<p>作为<strong>业界首个在五万卡国产算力集群上完成全流程训练与推理的万亿参数模型</strong>（总参数 1.6 T，平均激活约 48 B，动态范围 33B~56B），LongCat-2.0 从零开始预训练，原生支持 1M 超长上下文，其架构设计自始至终围绕一个核心目标：<strong>让模型在真实的 Agentic Coding 任务中，更高效、更稳定地完成代码理解、生成与执行</strong>。</p>
<p>正式版发布前，LongCat-2.0预览版本已通过 OpenRouter 平台和<a href="https://longcat.ai/" rel="noopener noreferrer" target="_blank">longcat.ai</a>面向全球开发者开放调用——截至目前该模型<strong>已跻身 OpenRouter 全球大模型调用量前三</strong>，月调用量在 Hermes、Claude Code 和 OpenClaw 分列全球第一、第二和第三位，<strong>成为最受全球 Agent 开发者欢迎的模型之一</strong>。</p>

<h2>01 国模国芯全栈协同：完成万亿参数 MoE 模型在国产算力上的稳定训练</h2>
<p>LongCat 团队对国产算力的探索始于 2023 年，三年来，团队从千卡起步，逐步攻克算子适配、通信优化、分布式稳定性等基础难题，最终在五万卡集群上完成万亿参数模型的全流程训练与推理。</p>
<p>LongCat-2.0 预训练数据规模超过30Ttokens，覆盖中文、英文、多语言和代码等多类数据；面对万卡级训练中的硬件故障、通信异常、显存压力与数值波动，LongCat 团队从<strong>稳定性、正确性和效率</strong>三方面攻克国产算力训练难题。</p>
<ul>
<li>在<strong>稳定性</strong>上，通过卡间通信异常处理、弹性扩缩卡和自动故障恢复，将月均日故障率降低70%以上；</li>
<li>在<strong>正确性</strong>上，通过自研设计确定性算子、Bitwise 一致性验证和参数检测，保障训练结果的可靠，同时基于实践提升关键模块计算精度、优化 Reduce 逻辑；</li>
<li>在<strong>效率</strong>上，通过流水线调度、显存优化和算子级控核，训练 MFU 提升 1.5 倍。</li>
</ul>
<p><strong>最终，LongCat 实现稳态日吞吐超过1T tokens/day，完成万亿参数 MoE 模型在国产算力上的稳定训练。</strong></p>
<p>在推理阶段，LongCat-2.0 围绕模型、算子和框架进行协同优化：通过大规模专家并行聚合访存带宽，支撑万亿参数 MoE 模型的低延迟解码；将零计算专家机制融入专家并行通信流程，使路由到零专家的 token 真正避免不必要的传输与计算；并针对通信、Attention、GEMM 等核心算子优化调度，结合提前下发与权重预取等框架机制，进一步降低推理链路中的等待开销。</p>
<p><strong>从稳定训练到低延迟推理，LongCat-2.0 验证了我们已具备在国产算力集群上进行大规模模型训练的能力。它不只是“能训出”万亿参数模型，还让万亿参数模型能够在真实任务中稳定运行。</strong></p>
<h2>02 让模型在真实 Agentic Coding 任务中更高效、更稳定地完成代码理解、生成与执行</h2>
<p>LongCat-2.0 的架构设计始终围绕一个核心目标：<strong>让模型在真实 Agentic Coding 任务中更高效、更稳定地完成代码理解、生成与执行</strong>。</p>
<p><strong>1M超长上下文，让 Agent 看见整个项目。传统模型在处理超过 100K 上下文后就开始“遗忘”前面的内容</strong>。LongCat-2.0 采用<strong>LongCat Sparse Attention（LSA）稀疏注意力机制</strong>，在处理长文本时不再“逐字逐句地看”，而是智能筛选关键信息，将计算量从平方级降至线性级。这使得模型在 100 万 Token 的超长上下文中，依然保持精准的信息定位与理解能力。</p>
<p><strong>零计算专家 + ScMoE，让算力用在刀刃上</strong>。代码任务中不同 token 复杂度差异巨大——定义变量名和推导递归算法对算力的需求完全不同。LongCat-2.0 通过零计算专家实现 token 级动态激活（33B~56B），简单 token 不消耗算力，复杂 token 自动获得更多计算资源。</p>
<p><strong>MOPD 多专家融合，一个模型同时擅长写代码、做推理、懂交互</strong>。LongCat-2.0 通过 MOPD 架构融合 Agent、Reasoning、Interaction 三组专家能力——Agent Experts 专攻工具调用与自主纠错，Reasoning Experts 深耕数学与 STEM 推理，Interaction Experts 优化指令遵循与交互体验。推理时由门控网络根据任务类型动态调度最擅长的专家，而非简单合并参数。得益于此，模型在编程、推理、交互等维度均表现突出。</p>
<p><strong>LongCat-2.0 通过精细的架构设计，让万亿参数模型在实际任务中更高效、更稳定地发挥能力。</strong></p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/ef19600fdb0e6868a3574c4a8c7ff746220482.png" /></p>
<h2>03 在编程能力、真实办公场景的复杂任务处理方面表现优异</h2>
<p>综合评测结果显示，LongCat-2.0 凭借卓越的综合性能与稳定的任务表现，<strong>在 Code 和 General Agent 场景表现优异</strong>。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/9d8da6909183ad1a8e591186849c0947457784.png" /></p>
<ul>
<li><strong>在编程能力方面</strong>，LongCat-2.0 展现出扎实的综合实力：在考察深层工程能力的 SWE-bench Pro 中获得 59.5，领先Gemini 3.1 Pro（54.2）、GPT-5.5（58.6）和 Claude Opus 4.6（57.3）；在 SWE-bench Multilingual 中取得 77.3 的成绩，与 Claude Opus 4.6（77.8）保持在同一水位；此外，在真实终端指令交互评测 Terminal-Bench 2.1 中取得 70.8，体现了其在真实运维与开发终端任务中的稳定执行与纠错能力。</li>
<li><strong>在真实办公场景的复杂任务处理方面</strong>，LongCat-2.0 表现均衡：在搜索智能体评测集RWSearch中获得 78.8，在生产力场景评测集 FORTE 中获得 73.2 ，在 BrowseComp 中获得 79.9，均达到或接近前沿闭源模型水平，证明了其在多步骤任务规划、复杂工具调用及长程检索执行上的高可靠性，能够较好的契合企业级 Agent 的落地需求。</li>
</ul>
<h2>04 在真实工作场景中，成为大家可靠的“工作伙伴”</h2>
<p>内测期间，我们面向真实工作场景征集了大量真实的用户任务需求，这些来自一线的真实“工作单”，可以看出 LongCat-2.0 在用户的真实工作场景中正在成为他们可靠的“工作伙伴”。</p>
<p><strong>Agent 搭建：一问即得，全闭环交付</strong></p>
<p>通过 LongCat-2.0 搭建的 AI SQL Agent，业务人员可以直接用自然语言查询数据。LongCat-2.0 自动完成全链路闭环——理解问题意图、规划查询步骤，并将数据结果转化为清晰的业务洞察。</p>
<p><a href="https://mp.weixin.qq.com/s/9XFcx3fmFcmbry5bHMJsow" rel="noopener noreferrer" target="_blank">查看视频</a></p>
<p><strong>代码库迁移：读懂老代码，重构新架构</strong></p>
<p>给 LongCat-2.0 一个旧版插件代码库和一份新版SDK文档，它能自行分析整体架构、梳理核心逻辑，再将整个插件重构为符合新API的实现——保留全部原有功能，修复潜在隐患，编译一次通过。</p>
<p><a href="https://mp.weixin.qq.com/s/9XFcx3fmFcmbry5bHMJsow" rel="noopener noreferrer" target="_blank">查看视频</a></p>
<p><strong>完整应用开发：从一句话到可运行产品</strong></p>
<p>描述一个“儿童AI游戏训练场”的创意，LongCat-2.0 会逐步生成技术选型、页面架构、游戏逻辑与视觉细节——从首页到三个完整可玩的游戏页面，全部代码一次产出，开箱即用。从一句话到可用的产品，将灵感轻松实现。</p>
<p><a href="https://mp.weixin.qq.com/s/9XFcx3fmFcmbry5bHMJsow" rel="noopener noreferrer" target="_blank">查看视频</a></p>
<p><strong>3D交互演示：一句话，生成一个3D世界</strong></p>
<p>通过一句话描述，LongCat-2.0 即可生成完整 Three.js 3D 演示：透明烧瓶、荧光液体、泡沫喷发、液面下降和堆积效果全部可交互呈现。所有代码封装在一个 HTML 文件中，打开即用，让创意快速转化为可交互的3D体验。</p>
<p><a href="https://mp.weixin.qq.com/s/9XFcx3fmFcmbry5bHMJsow" rel="noopener noreferrer" target="_blank">查看视频</a></p>
<p><strong>AI 小说工厂：从单点灵感到商业变现</strong></p>
<p>基于 LongCat-2.0 构建的“AI小说工厂”，将创意写作升级为自动化内容流水线。用户输入灵感后，系统编排多个 Agent，自动完成世界观构建、并行章节生成、质量评估与回流修订。并通过长上下文能力保障百万字级设定一致性。最终内容可自动适配多平台发布，并由 Web 面板实时监控生成进度与质量状态，实现持续稳定的连载输出。</p>
<p><a href="https://mp.weixin.qq.com/s/9XFcx3fmFcmbry5bHMJsow" rel="noopener noreferrer" target="_blank">查看视频</a></p>
<p><strong>立即体验</strong></p>
<ul>
<li><strong>API 开放平台：<a href="https://longcat.chat/platform/product" rel="noopener noreferrer" target="_blank">https://longcat.chat/platform/product</a></strong></li>
</ul>