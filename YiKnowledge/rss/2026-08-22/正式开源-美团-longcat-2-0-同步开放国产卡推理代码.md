---
title: 正式开源！美团 LongCat-2.0 同步开放国产卡推理代码
tags:
- 美团技术团队
category: engineer/lessons
created: '2026-08-22'
source: https://tech.meituan.com/2026/07/12/LongCat-2.0-Open-source.html
type: rss
source_name: 美团技术团队
source_url: https://tech.meituan.com/feed/
---

<p><strong>本周，美团万亿参数大模型 LongCat-2.0 正式开源！</strong></p>
<p><a href="https://huggingface.co/meituan-longcat/LongCat-2.0" rel="noopener noreferrer" target="_blank">HuggingFace</a> | <a href="https://github.com/meituan-longcat/LongCat-2.0" rel="noopener noreferrer" target="_blank">GitHub</a> | <a href="https://www.modelscope.cn/collections/meituan-longcat/LongCat-20" rel="noopener noreferrer" target="_blank">ModelScope</a></p>
<p>作为业界首个在五万卡国产算力集群上完成推理的万亿参数模型，LongCat-2.0 已全面开源。<strong>针对显存与带宽受限的国产算力芯片，我们在模型架构、芯片适配到部署策略上进行了深度协同优化，让万亿参数模型在存量卡上同样跑得稳、跑得快。</strong> 我们希望以真实 Agentic Coding 任务中的稳定表现为依托，通过开源将模型能力与推理优化成果完整开放，盘活更多存量国产算力，释放国产算力生态的长期价值。</p>
<p>美团 LongCat-2.0 总参数 1.6T，平均激活约 48B，为真实的 Agentic Coding 任务而生，架构上创新性引入 LongCat 稀疏注意力和 N-gram Embedding，提升长上下文处理效率与 Token 级表示能力的同时，结合动态激活进一步强化了代码理解、生成以及执行的表现。</p>
<h2>01 模型、芯片适配与部署三个方向逐一突破，实现了万亿参数模型的流畅推理</h2>
<p>面对显存、带宽和互联的多重限制，LongCat-2.0 结合国产芯片特性，<strong>从模型、芯片适配与部署三个方向逐一突破，实现了万亿参数模型的流畅推理：</strong></p>
<ul>
<li>
<p><strong>模型层面：</strong> Attention 通过 absorb 计算模式、Indexer 与 MLA prolog 并行处理以及 KVP 切分 KV-cache，有效缓解了超长上下文的 I/O 与显存压力。ScMoE 则利用国产芯片的控核能力，让 Dense 与 MoE 分支实现物理核心级并行执行，进一步压缩端到端延迟，实现了百万上下文在国产芯片上的高效推理；</p>
</li>
<li>
<p><strong>芯片适配层面：</strong> 通过 Super Kernel 减少算子数量以降低启动开销，并以 Weight Prefetch 将 I/O 延迟隐藏在前序计算中；同时基于高速片间互联完成 layer-wise 的 KV-cache 传输，TP/SP/KVP 均在 scale-up 互联域内完成，在受限的显存和带宽条件下将硬件利用率最大化；</p>
</li>
<li>
<p><strong>部署策略层面：</strong> 采用 PD 分离部署兼顾 TTFT 与 TPOT：Prefill 端通过缩小 Expert-Parallel 域与序列并行分担长序列计算压力，Decode 端以 KV-cache 切分与高并行度降低单卡显存占用，配合异步化 Expert-Parallel Load Balancing 解决大 EP 度下的负载不均。上述并行方案均已适配 constrained decoding、multi-step scheduling 和 MTP 等推理优化特性，实现了万亿参数模型在国产算力上的稳定服务。</p>
</li>
</ul>
<p>LongCat-2.0 验证了国产芯片承载复杂大模型任务的成熟能力，并希望通过开源为行业提供一条可复现的技术路径，推动存量算力在真实场景中的应用价值。</p>
<h2>02 模型全面升级，会执行、会推理、懂交互</h2>
<p>LongCat-2.0 沿用了 LongCat-Flash 的整体设计，并围绕 LongCat-2.0 在长上下文、代码任务和智能体场景中的进一步升级，做了三项关键优化：</p>
<h3>2.1 LongCat 稀疏注意力机制，提升上下文处理效率</h3>
<p>面向智能体任务中的长输入场景，LongCat-2.0 引入 LongCat 稀疏注意力机制（LSA），通过流感知索引、跨层索引和层级化索引三项策略减少碎片化访存和重复索引计算，在保持模型质量的前提下，加速百万级长上下文的训练与推理。</p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/368b1cd0634db5c41b127242d8feee08118728.png" /></p>
<h3>2.2 引入 N-gram Embedding，提升参数利用效率</h3>
<p>LongCat-2.0 在 MoE 专家之外引入 N-gram Embedding 作为新的参数扩展路径。在 MoE 稀疏度已接近 97% 的情况下，将 135B 参数投入 N-gram Embedding 的收益远超继续扩充专家。该模块占比控制在总参数 10% 以内，兼顾了参数收益与结构稳定性。</p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/84d46b968d89efb8fd1bb66d3005680c29580.png" /></p>
<h3>2.3 通过 MOPD 架构在国产算力集群上无缝融合，让模型会执行、会推理、懂交互</h3>
<p>后训练阶段，LongCat-2.0 采用多教师在线蒸馏，将专家分为 Agent、推理和交互三类，分别聚焦自主执行、自适应推理和安全对齐等核心能力。最终通过 MOPD 架构在国产算力集群上无缝融合，使模型兼具深度推理、自主执行与精准交互的综合表现。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/7e5f64947ed21d4b1c24d3e94d855844154812.png" /></p>
<h2>03 开源开放</h2>
<p>LongCat-2.0 的开源，是一次技术路径的公开，也是一次生态邀约。</p>
<p>本次开源同步提供 BF16、FP8 以及 INT8 等多精度版本，全面覆盖不同算力平台的部署需求。同时，我们深度拥抱开源社区，将针对国产算力极致优化的推理成果同步开源。这意味着，即使手上没有最新算力，也能基于现有硬件将 LongCat-2.0 稳定跑起来。</p>
<p>我们希望通过这套开箱即用的推理栈，让更多的国产卡包括老卡，都能流畅部署万亿大模型推理服务，在真实生产力场景发挥更大价值。</p>
<h3>🚀 开源链接</h3>
<p><strong>Tech Blog：</strong> <a href="https://longcat.ai/blog/longcat-2.0/" rel="noopener noreferrer" target="_blank">https://longcat.ai/blog/longcat-2.0/</a></p>
<p><strong>Model Weights：</strong></p>
<ul>
<li>HuggingFace: <a href="https://huggingface.co/meituan-longcat/LongCat-2.0" rel="noopener noreferrer" target="_blank">https://huggingface.co/meituan-longcat/LongCat-2.0</a></li>
<li>GitHub: <a href="https://github.com/meituan-longcat/LongCat-2.0" rel="noopener noreferrer" target="_blank">https://github.com/meituan-longcat/LongCat-2.0</a></li>
<li>ModelScope: <a href="https://www.modelscope.cn/collections/meituan-longcat/LongCat-20" rel="noopener noreferrer" target="_blank">https://www.modelscope.cn/collections/meituan-longcat/LongCat-20</a></li>
</ul>
<p><strong>Inference Code:</strong></p>
<ul>
<li>GPU: <a href="https://github.com/sgl-project/sglang/pull/30042" rel="noopener noreferrer" target="_blank">https://github.com/sgl-project/sglang/pull/30042</a></li>
<li>NPU: <a href="https://github.com/meituan-longcat/SGLang-FluentLLM/tree/npu" rel="noopener noreferrer" target="_blank">https://github.com/meituan-longcat/SGLang-FluentLLM/tree/npu</a></li>
</ul>
<p><strong>API Platform：</strong></p>
<ul>
<li><a href="https://longcat.chat/platform/product" rel="noopener noreferrer" target="_blank">https://longcat.chat/platform/product</a></li>
</ul>