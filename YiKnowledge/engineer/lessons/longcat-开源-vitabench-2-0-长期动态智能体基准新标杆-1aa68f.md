---
title: LongCat 开源 VitaBench 2.0：长期动态智能体基准新标杆
tags:
- 美团技术团队
category: engineer/lessons
created: '2026-08-16'
source: https://tech.meituan.com/2026/06/29/LongCat-VitaBench-2.0.html
type: rss
source_name: 美团技术团队
source_url: https://tech.meituan.com/feed/
---

<p>一个经常加班的白领，一个带着孩子出游的父亲，你的AI助理能分清他们需要什么样的服务吗？</p>
<p>现实是，它常常分不清。</p>
<p>AI能执行你明确的指令，却很难记住那些藏在场景和身份背后的真实需求。它们是真的无法理解，还是“情商”不够高呢？</p>
<p>自去年10月发布了 <strong>VitaBench 1.0</strong>，首次定义了生活场景下智能体任务的复杂度，美团 Longcat 团队再次推出 VitaBench 2.0，它不再仅仅关注任务有多难，而是将目光投向了更深层次的挑战。</p>
<p><strong>VitaBench 2.0 是首个真实生活场景下面向长期动态用户建模的智能体评测基准，它系统性地评测大语言模型在长期、真实、动态的用户互动中个性化与主动性的能力</strong>。</p>
<p><strong>VitaBench 2.0 的 核心“硬核”看点</strong>：</p>
<ul>
<li>高难度业界首创：首次将智能体场景与丰富用户生态相结合，打造面向长期动态用户建模的智能体基准。其包含56名真实特征用户、819个复杂任务、超2000个动态偏好及66个可执行工具。</li>
<li>超长跨度动态追踪：平均每位用户包含 2093 个交互事件，平均时间跨度长达 1580 天，严格按时间线向 Agent 暴露，真实还原用户偏好的演进与漂移。</li>
<li>统一评测生态：针对长文本上下文学习（In-context learning）与智能体记忆策略（Memory Strategy）的统一评测平台。</li>
</ul>
<h2>01 设计原理：VitaBench 2.0的三维解构</h2>
<p>能得出这些结论，得益于VitaBench 2.0的核心设计。它不再是简单的问答，而是围绕三大创新构建了一个前所未有的评测体系。</p>
<p><img alt="图1：VitaBench 2.0 概览图" src="https://p0.meituan.net/meituantechblog/ecfdc52ee4ab7253a877d5df75217f21127484.webp" /></p>
<h3>1.1 搭建“人生副本”：让AI在真实用户轨迹中接受考验</h3>
<p>不同于一次性的问答，VitaBench 2.0为56位虚拟用户，在送餐、到店、差旅等多个真实领域中，构建了包含2000多种动态偏好、跨度长达数年的生活轨迹。</p>
<p>这背后是庞大而真实的数据支撑。如下图所示，这些图表直观地展示了我们构建的用户画像和偏好分布的真实性与复杂性。</p>
<p><img alt="图2：VitaBench 2.0 用户画像统计图" src="https://p0.meituan.net/meituantechblog/54c8ca3a15f23f55b88d079885aedf63148034.webp" /></p>
<p><img alt="图3：VitaBench 2.0 用户偏好统计图" src="https://p0.meituan.net/meituantechblog/765450b81465c59972ae583ca0946e64149788.webp" /></p>
<p>具体来说，这个数据生态包含：</p>
<ul>
<li>56个拟真用户，每个用户都拥有基于真实世界统计数据构建的独特身份、习惯和需求。</li>
<li>819个可执行任务，贯穿于用户的整个生命周期。</li>
<li>用户的偏好不是静态标签，而是会随着时间、事件而动态演变，平均每个用户的偏好会发生超过48次动态变化。</li>
</ul>
<p>这些偏好被巧妙地嵌入到碎片化的互动历史中，包括对话记录和行为日志（如浏览、搜索、下单）。智能体必须像侦探一样，从这些混杂着“信号”与“噪音”的线索中，持续对用户进行理解。</p>
<h3>1.2  引入“时间标尺”：将持续理解作为核心目标</h3>
<p>传统的Agent评测关注“单个任务是否完成”，而VitaBench 2.0的核心目标是评测<strong>智能体是否在持续理解一个动态的人</strong>。</p>
<p>为此，我们将评测的时间轴拉长到了前所未有的尺度，用户的平均交互周期长达<strong>1580天（约4.3年）</strong>，最长甚至达到&nbsp;<strong>2,974</strong> 天。在这漫长的时间线里，智能体需要不断地<strong>提取、利用、并更新</strong>对用户的理解，才能在后续的任务中做出正确决策。这从根本上改变了评测的焦点，从单次任务的成功，转向了对用户偏好的考核。</p>
<h3>1.3  设立“记忆擂台”：对决AI的两种记忆模式</h3>
<p>为了探究记忆在长期用户建模中的作用，VitaBench 2.0搭建了首个真实用户场景下的统一长期智能体评测平台，通过可扩展的接口，让两种代表性机制在此对决：</p>
<ul>
<li><strong>智能体记忆</strong>： AI自己决定记住什么、忘记什么，主动维护一个精炼的用户档案。</li>
<li><strong>RAG记忆</strong>： 像一个外部搜索引擎，根据当前任务检索最相关的历史片段。</li>
</ul>
<p>通过对比这两种模式，我们可以清晰地看到不同记忆架构，以及同架构下的不同设计对个性化决策的真实影响，从而回答“AI应该如何记忆”这一关键问题。同时，为了考验AI的“眼力劲”，我们还设计了主动性任务。在这些任务中，AI必须意识到信息不足并主动提问，而不是盲目决策。</p>
<h2>02 核心洞察：用数据看清模型的短板</h2>
<p>VitaBench 2.0不仅给出了总分，更用数据揭示了模型们犯错的具体原因。如表1所示，这是主要模型在不同记忆设置下的性能排行榜。</p>
<p><img alt="表1：主要模型在不同记忆设置下的性能表现" src="https://p1.meituan.net/meituantechblog/521cabb68ee8fad43452344cba3bb4a1649960.webp" /></p>
<p>从排行榜（表1）可以看出，即使在能看到全部历史记录的“开卷”模式下，最强的模型Claude-Opus-4.6的平均分也刚过0.5，说明从海量信息中准确提炼偏好本身就比较困难。而一旦切换到更真实的记忆模式，模型的表现出现了不同程度的下滑。</p>
<p><strong>洞察一：时间越长，AI忘得越快</strong></p>
<p>如下图所示，随着任务序列索引增加（即时间推移），所有模型的平均性能都在下降。这说明，无论是处理超长上下文的能力，还是记忆模块的累积误差，都严重限制了AI的长期服务能力。</p>
<p><strong>更关键的是，记忆并没有成为解药</strong>。对比实验结果发现，大部分模型在接入Agentic Memory或RAG Memory后，性能反而低于直接使用全历史记录的场景——<strong>记忆不是装上就好</strong>，如何正确更新、检索和利用，才是真正的挑战。</p>
<p><img alt="图4：模型性能随任务序列（时间）的衰减分析" src="https://p1.meituan.net/meituantechblog/212aa3a638a9bcacbbcadea7718d77d628306.webp" /></p>
<p><strong>洞察二：高“智商”不等于高“情商”</strong></p>
<p>一个常见的假设是，开启模型的“思考模式”能提升其表现。然而，VitaBench 2.0 的实验结果给出了相反的答案：<strong>开启思考模式，在个性化任务上并不总是有帮助</strong>。</p>
<p>下图展示了模型在开启/关闭思考模式下的性能与效率关系。横轴是完成任务所需的交互轮数（越少越好），纵轴是平均性能（越高越好），理想的模型应位于左上角。可以看到，开启思考模式的点并没有稳定地比关闭模式更优越。</p>
<p><img alt="图5：开启/关闭思考模式下的模型性能与效率" src="https://p0.meituan.net/meituantechblog/5e633bfcc648e2d8d5b34eaaa9469a7048792.webp" /></p>
<p><strong>洞察三：AI普遍缺乏“主动沟通”的意愿</strong></p>
<p>模型普遍缺乏在信息不足时主动提问的“眼力见”。所有模型家族在需要主动提问的任务上，得分都出现了“断崖式”下跌。例如，Claude家族的平均分从46.0骤降至27.4。这表明，AI倾向于“想当然”，而不是在不确定时“多问一句”。</p>
<p><img alt="图6：模型在主动性任务上的性能表现" src="https://p0.meituan.net/meituantechblog/dc9b1835d1107a759336fabf3ba6870074674.webp" /></p>
<p><strong>洞察四：就算“喂到嘴边”，AI也未必会吃</strong></p>
<p>为了分离“提取偏好”和“利用偏好”这两个难题，我们直接把真实用户偏好告诉模型。虽然性能有所提升，但仍有很大进度空间。<strong>即便把真实偏好直接告诉模型，多数模型仍然失败</strong>。这说明，即使拥有了准确的用户画像，在高压、多约束的决策中正确应用这些偏好，本身就是一个巨大的挑战。</p>
<p><img alt="图7：在提供真实偏好下的模型性能" src="https://p1.meituan.net/meituantechblog/cf75832fa9983f74bb404bf899cac91223446.webp" /></p>
<p><strong>洞察五：从“工具失误”到“情商不足”的瓶颈转移</strong></p>
<p>我们对模型的失败原因进行了分类统计。在由<strong>66个真实工具</strong>构成的复杂生活服务场景中，早期模型更多地犯下工具使用错误（A类），例如选错API或填错参数。而更强的模型（如DeepSeek-V4-Pro）虽然工具用得更好了，但在偏好理解和应用（B类）上的失败却成了主要矛盾。这表明随着模型基础能力的提升，<strong>个性化已是当前 Agent 的最大瓶颈</strong>。</p>
<p><img alt="图8：模型失败模式分析（DeepSeek家族为例）" src="https://p1.meituan.net/meituantechblog/8cdd5784d215584793d4eabed47c184f59698.webp" /></p>
<h2>03 总结：定义下一代智能体评测范式</h2>
<p>VitaBench 2.0清晰地揭示了，当前AI在成为“高情商助理”的路上，依然任重道远。</p>
<p>它的核心价值，在于推动了评测范式的演进：<strong>从单点任务到长期陪伴，从被动执行到主动沟通，从黑盒到透明</strong>。这使得VitaBench 2.0成为一座连接技术与产品的“桥梁”，它用可量化的数据回答了“我的AI为什么不够好用”的问题，并为开发者指明了模型在“服务于人”这一终极目标上的具体短板。</p>
<p>我们希望，VitaBench 2.0能成为一个起点，激发更多研究关注智能体的个性化、记忆和主动性，共同推动AI从一个强大的“工具”进化为一个有温度的“伙伴”。</p>
<p><strong>VitaBench 2.0 已全面开源，欢迎各大模型前来接受“情商”大考</strong>。</p>
<p><strong>开源地址</strong></p>
<ul>
<li><strong>项目主页</strong>： <a href="https://vitabench2.github.io/" rel="noopener noreferrer" target="_blank">https://vitabench2.github.io/</a></li>
<li><strong>论文链接</strong>： <a href="https://arxiv.org/abs/2605.27141" rel="noopener noreferrer" target="_blank">https://arxiv.org/abs/2605.27141</a></li>
<li><strong>GitHub</strong>： <a href="https://github.com/meituan-longcat/vitabench-2.0" rel="noopener noreferrer" target="_blank">https://github.com/meituan-longcat/vitabench-2.0</a></li>
<li><strong>HuggingFace</strong>：<a href="https://huggingface.co/datasets/meituan-longcat/VitaBench-2.0" rel="noopener noreferrer" target="_blank">https://huggingface.co/datasets/meituan-longcat/VitaBench-2.0</a></li>
</ul>