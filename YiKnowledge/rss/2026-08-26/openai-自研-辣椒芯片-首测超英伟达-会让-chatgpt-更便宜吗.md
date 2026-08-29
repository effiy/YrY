---
title: OpenAI 自研「辣椒芯片」首测超英伟达，会让 ChatGPT 更便宜吗？
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-29'
source: https://www.ifanr.com/1676738?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Wed, 26 Aug 2026 09:46:32 +0000
author: 张子豪
---

<p><img alt="" class="alignnone size-full wp-image-1676787" height="821" src="https://s3.ifanr.com/wp-content/uploads/2026/08/ChatGPT-Image15_40_58.png" width="1916" /></p>
<p>做芯片很难，第一代产品就做到有竞争力更难。OpenAI 这次交出的答案，至少在大模型推理这件事上，已经足够夸张。</p>
<p>今天，OpenAI 正式公布了其首款定制推理芯片 Jalapeño（墨西哥辣椒）的首批实测性能数据。</p>
<p><img alt="" class="alignnone size-full wp-image-1676754" height="2154" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_10-27-11.png" width="2880" /></p>
<p>在基于自己开源模型 GPT-OSS 120B 的公开基准测试 InferenceX 上，Jalapeño 的每千瓦峰值吞吐量和 Token 延迟都比现有的硬件系统表现要好。</p>
<p>要知道，对大多数芯片来说，吞吐和延迟往往是一道只能二选一的难题。而除了针对 OpenAI 的大模型优化明显，芯片在 670B 的 DeepSeek R1 和 1T 的 Kimi K2.5 上表现也更出色，对手都是英伟达 GB200/GB300 等市面上最强的商用 AI 系统。</p>
<p>奥特曼在 X 上毫不客气地评价：「我们造了一颗芯片，快得离谱。」</p>
<p><img alt="" class="alignnone size-full wp-image-1676755" height="348" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_10-46-13.png" width="1196" /></p>
<p>知名科技 Newsletter SemiAnalysi 创始人 Dylan Patel 更给了极高的评价，「第一代芯片通常毫无竞争力，但 OpenAI 正在打败英伟达 Blackwell，甚至 Rubin。」</p>
<p>更巧的是，OpenAI 并不是这几天唯一一家谈芯片的公司。</p>
<p>小米刚刚一口气公布三颗自研芯片，苹果昨天发布首颗 2nm M6，接下来一个月，高通、联发科、苹果和华为的新一代旗舰芯片还会继续扎堆登场。</p>
<p><img alt="" class="alignnone size-full wp-image-1676760" height="1972" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_14-04-48.png" width="3840" /></p>
<p>从数据中心到手机，AI 芯片正在成为所有科技巨头共同争夺的一块地盘。</p>
<h2>一份近乎「不讲理」的成绩单</h2>
<p>先看 Jalapeño 的数据，OpenAI 这次采用 InferenceX 测试，统一设置为 8K 输入、1K 输出，使用标准单 token 预测，没有开启推测解码。对照系统包括英伟达 GB200 和 GB300。</p>
<p>OpenAI 将 DeepSeek R1 与 Kimi K2.5 标为 MXFP4，在 GPT-OSS 120B、DeepSeek R1 670B 和 Kimi K2.5 1T 三个模型上的结果显示：</p>
<ul>
<li>峰值吞吐量，每瓦的 AI 工作量是对比系统的 1.5 到 1.9 倍，</li>
<li>端到端延迟降低了 1.7 到 3.6 倍，</li>
<li>对于高交互性工作负载，其性能更是提升了 2.1 到 4.1 倍。</li>
</ul>
<p><img alt="" class="alignnone size-full wp-image-1676742" height="1026" src="https://s3.ifanr.com/wp-content/uploads/2026/08/3-6.png" width="1574" /></p>
<p>在最极端的对比项里，差距被拉得相当大，GB200 此前最佳的单用户速度（约 535 tok/s）下，Jalapeño 的每千瓦吞吐是前者的 53.7 倍。</p>
<p><img alt="" class="alignnone size-full wp-image-1676740" height="1062" src="https://s3.ifanr.com/wp-content/uploads/2026/08/1-12.png" width="1574" /></p>
<p>跑 DeepSeek R1 时，Jalapeño 单用户可达 700 tok/s，对标系统只有 169 tok/s。而 Jalapeño 标称功耗仅 700W，实测持续功耗不超过 550W。</p>
<p>对于规模化推理服务来说，芯片最终拼的除了跑得多快，还有花同样的电、占同样的数据中心容量，能服务多少用户。</p>
<p>换成云计算生意里的语言，就是一句很直接的话：「每瓦吞吐，最后都会变成成本和收入。」</p>
<p><img alt="" class="alignnone size-full wp-image-1676757" height="1450" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_11-48-08.png" width="3006" /></p>
<div class="editor-image-source">
<p>▲跑 DeepSeek R1 时，Jalapeño 单用户生成速度最高约 700 tok/s，GB300 为 169 tok/s。</p>
</div>
<p><img alt="" class="alignnone size-full wp-image-1676741" height="1026" src="https://s3.ifanr.com/wp-content/uploads/2026/08/2-9.png" width="1574" /></p>
<p>更值得注意的是 OpenAI 这颗辣椒芯片的达成方式：没有多 token 预测（MTP）、没有投机解码、没有 prefill-decode 分离，就这样赢过了软硬件优化的英伟达对手芯片。</p>
<p>SemiAnalysis 长篇技术博客里也验证了测试过程，并确认 Jalapeño 跑出的 GSM8k 精度与英伟达芯片持平。</p>
<p><img alt="" class="alignnone size-full wp-image-1676758" height="1978" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_13-33-18.png" width="3840" /></p>
<div class="editor-image-source">
<p>▲文章链接：https://newsletter.semianalysis.com/p/openai-jalapeno-better-than-nvidia</p>
</div>
<p>当然，X 上的讨论也没少泼冷水。daily.dev 的开发者社区就指出，那个疯传的「104.3 倍」只是特定等速解码场景下的单一数据点，而且测试模型和对比基线都是 OpenAI 自己挑的。</p>
<p>SemiAnalysis 也承认，Jalapeño 还没跑过多轮长上下文的 AgentX 测试；真正的对手应该是同样用 HBM4 的 Vera Rubin 而非 Blackwell。</p>
<p>即便如此，最终的共识依然是：第一代自研芯片就站上帕累托前沿，这在行业里没有先例。Meta 和微软折腾多年始终难产的 AI ASIC 项目，是最好的反证。</p>
<h2>非 OpenAI 模型独家专用，是通用推理引擎</h2>
<p>外界一度认为 OpenAI 造芯是给自家模型开小灶，SemiAnalysis 则提到 Jalapeño 是通用推理芯片。测试表现最好的三个模型里，DeepSeek R1 和 Kimi K2.5 根本不在 OpenAI 最初的投产计划内。</p>
<p>团队还提到用 Codex 两个月就把它们优化到了高性能，并且在这颗芯片上成功运行了游戏《Doom》，移植全程只用了 Codex 提示词。</p>
<p><img alt="" class="alignnone size-full wp-image-1676744" height="510" src="https://s3.ifanr.com/wp-content/uploads/2026/08/5-6.png" width="1846" /></p>
<p>硬件上，Jalapeño 采用台积电 N3P 工艺，最新的 B0 步进单计算 die 提供 13.4 PFLOPS 的 MXFP4 算力。同工艺、同尺寸的英伟达 Rubin 计算 die 是 17.5 PFLOPS（NVFP4），但 Jalapeño 的 TDP 只有 700W，Rubin 是 900～1150W。</p>
<p>再看设计逻辑。要理解 Jalapeño，得先知道大模型推理其实是两种完全不同的活：处理 prompt 的 prefill 阶段吃算力，逐字生成回答的 decode 阶段吃显存带宽，而数据在核心间、芯片间搬来搬去的通信开销则在两边拖后腿。</p>
<p>多数系统擅长其中一种，却会在等待数据时把优势浪费掉。</p>
<p><img alt="" class="alignnone size-full wp-image-1676749" height="1300" src="https://s3.ifanr.com/wp-content/uploads/2026/08/10-6.png" width="1712" /></p>
<p>Jalapeño 的核心思路，是尽可能让数据待在原地，减少搬运。</p>
<p>芯片的核心和 HBM 都被切成一一对应的切片，每个核心切片对自己那片 HBM 拥有低延迟的本地视图；KV cache 和模型权重被显式地安置在原地，生成过程中不再挪窝。</p>
<p>切片之间需要同步时，可以走一条专用的高带宽集合通信网络，通用通信则交给另一张简化的 NoC。对比 GPU 里层层穿越的复杂内存体系，这套「极简内存层级」省掉了大量的延迟和功耗。</p>
<p><img alt="" class="alignnone size-full wp-image-1676747" height="1342" src="https://s3.ifanr.com/wp-content/uploads/2026/08/8-5.png" width="3480" /></p>
<p>这套方法论可以总结成两步：硬件负责把理论上限拉到最高，AI 负责找到逼近上限的写法。</p>
<p>结果是它在各种批量、各种形状下都更接近硬件的屋顶线（roofline），尤其是 GPU 最不擅长的小批量、低延迟场景，而这些又恰好是 agentic 工作负载最在意的地方。</p>
<p>系统层面同样贯彻这个思路，OpenAI 没有采用目前热门的优化路线：PD 分离（prefill 和 decode 分池部署），理由是真实流量里输入输出的比例全天都在漂移，固定分池必然一边闲置一边排队，KV cache 跨池搬运还会平添功耗和延迟。</p>
<p><img alt="" class="alignnone size-full wp-image-1676746" height="1382" src="https://s3.ifanr.com/wp-content/uploads/2026/08/7-6.png" width="1304" /></p>
<p>统一池子里，128 颗芯片组成一个机架（CPU 托盘叫 Katsu、ASIC 托盘叫 Vindaloo、交换托盘叫 Chana，都是一串咖喱菜名），16 个机架再用铜缆加光交换织成 2048 颗芯片的单一 scale-up 域。</p>
<p>整个请求从进来到出去，数据都不需要使用 PD 分离的转移。</p>
<h2>真正的秘密武器是：用 AI 造芯片</h2>
<p>如果 Jalapeño 的故事只到这里，它仍然只是一颗性能很强的 ASIC 推理芯片。</p>
<p>真正让这件事有点反常识的，是 OpenAI 连「怎么造芯片」这件事本身，也开始交给 AI 加速。</p>
<p>Jalapeño 项目 2024 年年中才启动，2025 年 11 月流片，前后约 16 个月；流片后 9 个月、点亮仅 3 个月就交出了上述成绩。</p>
<p><img alt="" class="alignnone size-full wp-image-1676745" height="376" src="https://s3.ifanr.com/wp-content/uploads/2026/08/6-8.png" width="1426" /></p>
<p>OpenAI 提到 AI 深度参与了设计：探索实现方案、缩短验证循环、优化算术电路，SIMD 单元面积缩小 8%、矩阵引擎缩小 10% 都有 AI 的功劳。部分 AI 生成的内核实现比人类专家手写版本快 1.5～1.8 倍。</p>
<p>过去几十年，芯片研发一直拥有极高的专业门槛。一套新架构从设计、验证、流片，到建立编译器、内核库和完整的软件生态，通常都需要大量经验丰富的工程师和漫长的迭代周期。</p>
<p><img alt="" class="alignnone size-full wp-image-1676763" height="1254" src="https://s3.ifanr.com/wp-content/uploads/2026/08/image-2.png" width="1980" /></p>
<p>CUDA 最坚固的护城河，也恰恰来自这里。就像英伟达真正难被复制的部分，除了 GPU 本身，还有围绕 GPU 积累了十几年的工具链、Kernel、开发者和工程经验。</p>
<p>但 Jalapeño 这次 AI 造芯片的经验，展示了另一种可能。硬件工程师可以让模型辅助设计和验证；一颗芯片点亮之后，Codex 又可以帮助工程师写 Kernel、适配新模型，甚至把一个完全没有准备过的模型在几个月内优化到高性能。</p>
<p><img alt="" class="alignnone size-full wp-image-1676762" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_15-08-59.png" width="3840" /></p>
<p>于是会出现一个很有意思的循环：<strong>用英伟达 GPU 训练出来的 AI，正在帮助工程师设计下一颗不依赖英伟达的芯片。</strong></p>
<p>SemiAnalysis 对此给出了一个非常激进的判断：<strong>CUDA 的护城河，可能正在松动。</strong></p>
<p>当然，只是一颗推理芯片的 Jalapeño 还远远不足以宣判 CUDA 的结局。但它至少证明了一件以前很难想象的事情：AI 已经开始进入生产下一代 AI 基础设施的研发循环。</p>
<p><strong>模型帮助造芯片，更好的芯片又用来运行下一代模型。</strong></p>
<h2>当大家都开始造芯</h2>
<p>也正是在这个背景下，再看最近密集发生的芯片新闻，会发现它们指向的是同一个方向。</p>
<p>两天，四家公司，芯片从手机、Mac 延伸到数据中心，小米的「自研芯片+OS+大模型」组合，苹果也是全系芯片都在为 Apple Intelligence 准备好，以及做能跑前沿模型的最好本地设备。</p>
<p><img alt="" class="alignnone size-full wp-image-1676756" height="908" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_11-04-22.png" width="2142" /></p>
<p>高通、联发科两个手机芯片大厂，骁龙 8 Gen 6 与天玑 9600 也双双杀入 2nm；华为的终端与云端路线上，麒麟 9030 和昇腾系列都将迎来更新。</p>
<p>还有 Anthropic，虽然还没发布芯片，但已经确认组建内部定制芯片团队。</p>
<p>8 月被彭博曝出挖来谷歌 TPU 业务前负责人 Amir Salek，这位老将带队交付了 Google 前七代 TPU；6 月又从 OpenAI 芯片团队挖走二号工程师 Clive Chan，此前在特斯拉参与 Dojo 超级计算机。</p>
<p><img alt="" class="alignnone size-full wp-image-1676739" height="933" src="https://s3.ifanr.com/wp-content/uploads/2026/08/1_VXwi23EGtlHt8Ag9tiwYIg.png" width="1400" /></p>
<p>OpenAI 博客里那句「AI 的进步在整个系统一起变好时复利最快」，放在这些动作上，全部都成立。</p>
<p><img alt="" class="alignnone size-full wp-image-1676759" height="1950" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-26_13-59-46.png" width="2752" /></p>
<p>Jalapeño 的故事，与其说是「OpenAI 造了一颗好芯片」，不如说是在验证一条新路径：当一个团队同时拥有模型、软件栈和最懂负载的场景时，白纸设计反而成了优势——不用背负向后兼容，还可以让 AI 同时担任设计师和程序员。</p>
<p>而这个 8 月和即将到来的 9 月将证明，这条路径也并不是 OpenAI 独享：所有人都在把「芯片—系统—模型」的垂直整合推到前所未有的深度。</p>
<p>当然，OpenAI 这颗芯片目前仍处在量产验证和软件成熟阶段，测试也没有覆盖真实的长下文、多轮 Agent 工作流等，但整个的方向已经没有悬念。</p>
<p>OpenAI 表示 Gen 2 已经在深入开发中，Gen 3 正在成形，今年年底 Jalapeño 将开始进入自有算力基础设施部署，下一个目标是 100MW 规模。</p>
<p><img alt="" class="alignnone size-full wp-image-1676750" height="1153" src="https://s3.ifanr.com/wp-content/uploads/2026/08/11-9.png" width="2048" /></p>
<p>芯片的定义权，正在从少数几家芯片公司手里，流向每一家认真对待 AI 的公司。</p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>