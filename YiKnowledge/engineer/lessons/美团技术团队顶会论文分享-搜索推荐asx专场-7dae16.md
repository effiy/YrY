---
title: 美团技术团队顶会论文分享：搜索推荐ASX专场
tags:
- 美团技术团队
category: engineer/lessons
created: '2026-08-16'
source: https://tech.meituan.com/2026/06/18/2026-ASX.html
type: rss
source_name: 美团技术团队
source_url: https://tech.meituan.com/feed/
---

<p>美团业务研发平台/搜推 ASX (Agentic System X)团队聚焦构建大模型为基础的 Agent 技术体系，在大模型后训练、Agentic 强化学习以及多模态理解等核心前沿方向持续深耕，已在 ICLR、NeurIPS、CVPR、AAAI 等 AI 领域的国际顶会发表数十篇高质量研究成果。本文精选了6篇进行解读，希望对大家有所帮助或启发。</p>
<h2>01 Contextual Rollout Bandits for Reinforcement Learning with Verifiable Rewards</h2>
<p><strong>上下文轨迹老虎机：面向可验证奖励的强化学习</strong></p>
<p>论文下载：<a href="https://arxiv.org/abs/2602.08499" rel="noopener noreferrer" target="_blank">PDF</a></p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/b59c0ffafdeba4539136582e0271b740362659.png" /></p>
<p><strong>论文简介</strong>：现有基于规则奖励的强化学习后训练通常直接使用最近一轮 rollout 进行策略优化，其中，低质量样本会引入噪声，高质量样本又常在单次使用后被丢弃，导致训练不稳定、样本利用不足。本文提出在线样本调度算法 CBS，将样本选择建模为上下文多臂老虎机问题，把每个候选样本视为 arm，并以训练后带来的性能增益作为奖励；通过轻量神经网络预测样本价值，并结合在线反馈动态调度。实验表明，CBS 可与多种策略优化方法结合，在 6 个数学推理数据集上稳定提升性能和训练效率。</p>
<h2>02 ResRL: Boosting LLM Reasoning via Negative Sample Projection Residual Reinforcement Learning</h2>
<p><strong>ResRL：通过负样本投影残差强化学习提升大语言模型推理能力</strong></p>
<p><strong>论文下载</strong>：<a href="https://arxiv.org/abs/2605.00380" rel="noopener noreferrer" target="_blank">PDF</a></p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/c3dfb092a8e1937a69abc1722d9331f0509496.png" /></p>
<p><strong>论文简介</strong>：本文提出 ResRL，一个负样本强化学习的新算法，旨在解决RLVR 提升LLM推理能力却损伤了输出多样性的问题。我们发现根因是惩罚负样本时误伤了正负样本共享的有效语义。ResRL 用 SVD 正确子空间 +投影残差，让惩罚只打在“真正的错误方向”上--数学超 NSR 9.4%、代码刷新 CodeForces SOTA、ALFWorld 超 PPO 7.8%，且 Pass@1 与 Pass@k 兼得。</p>
<h2>03 CDRRM: Contrast-Driven Rubric Generation for Reliable and Interpretable Reward Modeling</h2>
<p><strong>CDRRM：对比驱动的评分准则生成以实现可靠且可解释的奖励建模</strong></p>
<p><strong>论文下载</strong>：<a href="https://arxiv.org/abs/2603.08035" rel="noopener noreferrer" target="_blank">PDF</a></p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/8847ebcc0f8b9e40bc4e27cf77c58e83700241.png" /></p>
<p><strong>论文简介</strong>：本文提出 CDRRM，一个对比驱动的评分准则生成与奖励建模框架，旨在提升LLM对齐中奖励模型的可靠性、可解释性与数据效率。传统奖励模型是“黑箱”且依赖昂贵标注；现有准则方法存在冗余与偏见。CDRRM采用“对比-聚合”流程：先对比好/差回答定位关键差异，再聚合为简洁的任务相关准则，指导评判模型。实验表明，CDRRM在三个基准上达最先进水平，缓解话痨、位置等偏见，且仅用3千样本让未微调模型超越全量微调基线，兼具高效与可解释性。</p>
<h2>04 LocalSearchBench: Benchmarking Agentic Search in Real-World Local Life Services</h2>
<p><strong>LocalSearchBench:真实本地生活服务中的智能体搜索基准评测</strong></p>
<p><strong>论文下载</strong>：<a href="https://arxiv.org/abs/2512.07436" rel="noopener noreferrer" target="_blank">PDF</a></p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/169201562bedc76379b2721360d481a3524305.png" /></p>
<p><strong>论文简介</strong>：本文针对本地生活服务领域智能体搜索的研究空白，构建LocalSearchBench评测基准。该基准涵盖国内 9 座城市、6 大服务品类，包含超 134 万商户数据与 900 道用户多跳问答任务，同时配套交互环境 LocalPlayground 与商户检索工具 LocalRAG。实验测评 16 款主流大语言推理模型后发现,当前模型在此类任务表现不佳，最优模型 DeepSeek-V3.2 答题正确率仅 35.60%，普遍存在信息完整性、可信度不足等问题。研究还剖析了模型工具调用、多跳推理等典型缺陷，为本地生活服务场景下智能体搜索的模型训练和基准测试提供了重要支撑。</p>
<h2>05 DiningBench: A Hierarchical Multi-view Benchmark for Perception and Reasoning in the Dietary Domain</h2>
<p><strong>DiningBench：饮食领域感知与推理的层次化多视角基准</strong></p>
<p><strong>论文下载</strong>：<a href="https://arxiv.org/abs/2604.10425" rel="noopener noreferrer" target="_blank">PDF</a></p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/147fffac098126cce65e2db924ae00c0336417.png" /></p>
<p><strong>论文简介</strong>：本论文提出 DiningBench，一个面向饮食领域的层次化多视角 VLM 评测基准，旨在弥补现有数据集任务单一、视角有限和营养标注不足的问题。该基准包含细粒度分类、营养估计和视觉问答三类任务，覆盖 3,021 道菜品和多视角图像。通过评测 29 个主流VLM模型，揭示现有模型在细粒度识别、营养推理和多视角融合上的不足。</p>
<h2>06 Mem²Evolve: Towards Self-Evolving Agents via Co-Evolutionary Capability Expansion and Experience Distillation</h2>
<p><strong>Mem2Evolve：通过协同进化能力扩展与经验蒸馏实现自进化智能体</strong></p>
<p><strong>论文下载</strong>：<a href="https://arxiv.org/abs/2604.10923v1" rel="noopener noreferrer" target="_blank">PDF</a></p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/383439ef9a174a64e2bb1775919ae3c3476454.png" /></p>
<p><strong>论文简介</strong>：本文提出 Mem2Evolve，一个面向大语言模型智能体的自进化框架，通过 Asset Memory 与 Experience Memory 双记忆机制，协同实现能力扩展与经验积累。该框架可在任务执行中动态复用或创建工具与专家智能体，并从成功和失败轨迹中蒸馏可迁移经验。实验覆盖 6 类任务、8 个基准，结果表明 Mem2Evolve 显著优于普通 LLM 及单一进化策略，展现出更强的持续学习与任务泛化能力。</p>