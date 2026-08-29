---
title: AI 开始给自己造芯了，OpenAI 只用了九个月
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-29'
source: https://www.ifanr.com/1676824?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Wed, 26 Aug 2026 12:07:59 +0000
author: 彭海星
---

<p><img alt="" class="aligncenter size-full wp-image-1676843" height="900" src="https://s3.ifanr.com/wp-content/uploads/2026/08/BandiView_logan-voss-MERDjcUqFI0-unsplash.jpg" width="1600" /></p>
<p>「造芯」这件事，已成了一种潮流。</p>
<p>就在昨晚，OpenAI 公布了和博通联合自研的首款 AI 推理芯片 Jalapeño（墨西哥辣椒）首轮公开测试成绩。</p>
<p>在 SemiAnalysis 发布的公开基准测试 InferenceX 上，Jalapeño 运行了 GPT-OSS 120B、DeepSeek R1 670B 和 Kimi K2.5 1T 三款模型，结果显示，Jalapeño 每瓦完成的 AI 工作比英伟达 GB200、GB300 多 1.5—1.9 倍，端到端延迟缩短至对照系统的约 30%—60%。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745908421-2.png" style="height: auto; border-radius: 8px;" /></p>
<p>运行 DeepSeek R1 时，一次 8K 输入、1K 输出的推理从 5.99 秒降到 1.65 秒，最低 token 间隔则由 5.90ms 压到 1.43ms。</p>
<p>有了 Jalapeño，也许未来在 ChatGPT 上你能看到的不止是 1.5 倍速输出结果的「快速」模式，只要舍得花钱，3 倍速也是有可能做出来的。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745909177-3.png" style="height: auto; border-radius: 8px;" /></p>
<p>实力着实超群，让 Sam Altman 在说这件事时也相当言简意赅：</p>
<p>「我们制造了一款芯片，它很快。」</p>
<h3>火爆小辣椒，为推理而生</h3>
<p>不同于更通用的 GPU，Jalapeño 从设计之初就只有一个目标：承载现代大模型的推理部分工作。</p>
<p>这一目标，跟当下 AI Agent 的流行又有着紧密关联。</p>
<p>须知道，一问一答的普通聊天只需要调用几轮模型，延迟也比较容易忍受；但只要是看过 Agent 干活时的任务链，就会发现它们往往要连续调用模型几十次：读文件、搜资料、操作软件、检查结果，再根据结果推进下一步工作。</p>
<p>每一步的推理延迟累积起来，让 Agent 处理哪怕不算太复杂的日常事务，也往往会消耗掉不少时间。</p>
<p>这就是为什么，ChatGPT 的首页界面会分为「聊天」和「工作」——</p>
<p>简单的日常问答可以快速输出，而需要调用到 Agent 的复杂任务必须单独区分开来，以免「想得太多」的 Agent 拖慢日常体验。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745911825-4.png" style="height: auto; border-radius: 8px;" /></p>
<p>如果可以让 Agent 推理得更快，那 Agent 的响应也会越来越接近普通聊天。原则上，以后的 ChatGPT 又将恢复到最初的形态：首页只有一个对话框，不再需要专门区分聊天和工作。</p>
<p>而为了让推理速度更快，Jalapeño 在设计之初就针对大模型推理的真实负载做了专门优化。</p>
<p>众所周知，只要是冯·诺依曼架构下的芯片，运算速度往往都要远大于数据运输的速度。在前天的文章中我们用过一个比喻：哪怕厨房切菜翻炒的速度快如闪电，只要运输食材的速度跟不上，那再怎么快手的厨师也只能守着空灶等待。</p>
<p>大模型的推理过程主要分为两个阶段：第一段是 Prefill，芯片一次性读懂用户输入的整段提示词，主要考验计算能力；第二段是 Decode，模型开始逐个生成 token，这一步需要反复从内存读取权重和 KV Cache，几乎必然会撞上数据搬运速度跟不上计算速度的「内存墙」。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745912516-5.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜OpenAI</div>
<p>这也意味着，要想接近计算能力的上限，就需要像 OpenAI 在设计 Jalapeño 时那样，将计算核心、HBM 内存和网络通盘考虑进来协同设计，尽可能地减少读取数据的耗时。</p>
<p>据 SemiAnalysis 披露，Jalapeño 配有 216GiB HBM4，内存带宽达到 15.4TB/s。这个数字接近微软 Maia 200 和 Google Ironwood 的两倍。如此激进的带宽，就是为了让数据能跟上计算，把那些被等待数据浪费的理论算力重新利用起来。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745921688-6.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜SemiAnalysis</div>
<p>另外，Jalapeño 将计算核心和 HBM 划分成了多个彼此对应的区域，让模型权重和 KV Cache 尽量留在负责处理它们的本地内存中；需要跨区域同步时，才经过专门的高速通信网络运输数据，从而减少数据在核心、内存和芯片之间来回搬运的步骤，也减少计算单元「等菜」的时间。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745924193-7.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜SemiAnalysis</div>
<p>由于计算、内存和网络资源一开始就并入芯片设计架构之中考虑，Jalapeño 达到了极其惊人的能效比——它的标称功耗为 700W，实际测试中持续功耗更是低于 550W；作为对照，英伟达的 GB200 和 GB300 标称功耗分别为 1200W 和 1400W。</p>
<p>也就是说，Jalapeño 能够用英伟达芯片约一半的能耗，实现相对更高的推理性能。</p>
<p>能耗就是电，电就是白花花的钱。考虑到数据中心每日面临的惊人计算需求，任何能效比的优化，都能让 OpenAI 的算力成本支出减去一截。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745925228-8.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜Computex 2026 keynote</div>
<p>OpenAI 计划在年底前，将 Jalapeño 部署到计算基础设施之中，同时第二代产品已经在开发中段，第三代也初具雏形。</p>
<p>随着 Jalapeño 广泛使用，我们也有望见到 Tibo 更频繁地按下那颗「重置」按钮。</p>
<h3>三年造芯，九个月流片</h3>
<p>Jalapeño 的「快」不只在于性能，它的设计生产也快得不像半导体产品。</p>
<p>据路透社报道，这个项目正式起步时间大约是 2024 年底至 2025 年初，初始成员很多来自 Google TPU 项目。而在那之前一年，OpenAI 已经邀请了前 Google TPU 负责人 Richard Ho 组建硬件团队——</p>
<p>很显然，早在 Gemini 借助自有 TPU 算力一度弯道超车之前，OpenAI 已经意识到了自有芯片的重要性。</p>
<p>最终，这个项目的正式亮相是在去年 10 月，当时 OpenAI 宣布将会和博通合作部署 10 吉瓦的定制 AI 加速器，「将前沿模型与产品研发经验直接融入硬件」；传出正式流片的消息，则是在去年 11 月。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745931096-9.png" style="height: auto; border-radius: 8px;" /></p>
<p>综合 6 月份官方博客披露这个项目从初始设计到流片只花了 9 个月、路透社估计从流片到成品需要约 6 个月、SemiAnalysis 透露在 8 月正式测试前 OpenAI 只进行了约 3 个月的芯片上电调试等消息，我们可以整理出一条清晰的时间线：</p>
<p><strong>Jalapeño 大约在 2025 年 2 月进入正式设计周期，11 月完成流片，今年 5 月 OpenAI 拿到第一块成品芯片，8 月份完成调试并开启公开测试。</strong></p>
<p>每一步都密锣紧鼓，直逼芯片设计速度的上限。</p>
<p><img alt="" class="aligncenter size-full wp-image-1676840" height="941" src="https://s3.ifanr.com/wp-content/uploads/2026/08/d9bd3f4d-c4b7-4092-b5e3-8310d969dbe4.png" width="1672" /></p>
<p>据 Semiconductor Engineering 的估算，像 Jalapeño 这样高复杂度的 AI 加速芯片，从正式设计到流片通常需要 18—24 个月；OpenAI 将正式设计周期压缩到九个月，可以说是快了接近一倍，堪称是 AI 时代狂飙突进的最佳写照。</p>
<p><strong>实现如此速度的一个关键因素，正是 AI 本身。</strong></p>
<p>用 OpenAI 的话来说，AI 直接参与了 Jalapeño 的开发。他们的模型在设计期间用于探索实现方案、参与验证和修改方案、优化芯片算术电路等工作；成品芯片进入实验室后，OpenAI 又使用 Codex 和未发布的 Astra 模型，在两个月内将 GPT-OSS、DeepSeek R1 和 Kimi K2.5 几款不在 Jalapeño 原始适配计划中的模型完成了适配。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745943895-11.png" style="height: auto; border-radius: 8px;" /></p>
<p>作为「大加速时代」的标志和产物，AI 正在大幅缩短芯片的研发过程。第二、第三代 Jalapeño，以及其他大模型公司的专用芯片，都有可能在未来几年内跟我们见面。</p>
<h3>为什么模型公司都在自研芯片？</h3>
<p>Jalapeño 的问世固然惊艳，但 OpenAI 不是自研芯片路线上最早的玩家。</p>
<p>为这一项目提供了无数初始人才的 Google TPU 自不必说。这款十年前开始投入数据中心的产品，如今已经迭代到了第八代。</p>
<p>早在 2025 年的第七代产品，就是首款专为推理而设的 TPU 芯片 Ironwood；而今年发布的第八代产品，则进一步细分为了用于训练的TPU 8t 和用于推理的TPU 8i。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745946363-12.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜Google Cloud</div>
<p>Google 甚至认为 TPU 还不够专用。据 The Information 报道，Google 正在研究一颗代号 Frozen v2 的服务器芯片，尝试把 Gemini 的部分架构直接固化进硬件，它的每瓦生成 token 数量预估可达到最新 TPU 的 6—10 倍。</p>
<p>另一厢，亚马逊 AWS 也先后开发了用于推理的 Inferentia 和兼顾训练、推理的 Trainium 芯片，通过对外出售算力来支撑云业务。</p>
<p>作为最大外部盟友，Anthropic 已经通过 Project Rainier 获取了接近 100 万颗 Trainium 芯片的算力。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745951617-13.png" style="height: auto; border-radius: 8px;" /></p>
<p>但 Anthropic 也没有打算完全依赖亚马逊。就在月初，他们证实正在组建内部专用芯片研发团队，为下一代 Claude 大模型打造定制化 AI 芯片。</p>
<p>很明显，押注自研芯片已经成为了头部大模型厂商的共同方向。</p>
<p><strong>这一变化最直接的理由，自然是算力效率关乎公司的经济账。</strong></p>
<p>我们可以做一个对比：2024 年 GPT-4o 刚刚发布时，每百万输入、输出 token 分别收费 5 美元和 15 美元；如今 GPT-5.6 Luna 已降到 0.2 美元和 1.2 美元。</p>
<p>假设一项 Agent 任务累计使用 2 万输入 token、5000 输出 token，GPT-4o 当年的费用约为 0.175 美元，Luna 只需 0.01 美元，降幅超过 94%。如果每天执行 1000 万次，一年的公开调用金额会从约 6.39 亿美元降到 3650 万美元。</p>
<p>当然，两个模型规模和能力并不完全相同，降价也包含算法、软件与市场竞争的共同作用，但十几倍的价格差仍然离不开计算效率的持续提升。</p>
<p>如果能将计算效率的主导权掌握在自己手中，结合 ChatGPT 巨大的调用量，通过节省支出来收回自研芯片的投入可以说是比较轻松的。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745954629-14.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜NVIDIA blog</div>
<p>成本之外，算力供给同样重要。</p>
<p>哪怕是手握 TPU 的 Google Cloud 也不总是有余粮，他们曾因容量不足拒绝部分外部订单，近来 Gemini 的混乱据报也有内部算力争夺的原因；只有把芯片握在手里，模型研发才不会完全受制于单一供应商的产能和报价。</p>
<p>在昨晚同步发布的在昨晚同步发布的战略文章中，OpenAI CFO Sarah Friar 将公司的战略选择概括为「以广度建生态，以自营握杠杆」（Build for breadth, own for leverage）：训练和通用计算继续采购外部高端系统，稳定且巨量的推理则由 Jalapeño 分担。第一代芯片暂不出售，也不出租，产能全部留给 OpenAI。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787745961819-15.png" style="height: auto; border-radius: 8px;" /></p>
<p>我们不能忽视，作为模型公司，OpenAI 做自研芯片还有一个得天独厚的优势：没有别的公司比他们更了解 Agent 的实际工作流程。</p>
<p>众多用户提供的 Agent 工作流，实际上也是在告诉 OpenAI 下一代芯片如何设计才能最好地对应自家产品的实际推理需求。</p>
<p>Alan Kay 曾说，真正认真对待软件的人，应该制造自己的硬件。现在，这句话应该有一个大模型时代的变体：</p>
<p><strong>真正认真对待模型的人，也会去造一颗专属于模型的芯片。</strong></p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>