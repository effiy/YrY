---
title: 世界模型进入下半场：自变量 WALL-SS 突破三大瓶颈，让虚拟世界成为机器人的「训练场」
tags:
- 极客公园 geekpark
category: life/lifestyle
created: '2026-08-29'
source: http://www.geekpark.net/news/369508
type: rss
source_name: 极客公园 geekpark
source_url: https://www.geekpark.net/rss
published: Fri, 28 Aug 2026 13:10:32 +0800
---

<section class="wx-article-wrap">
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/f4/92/f4928d3c7fc8307b2d1ff868682f7e53.jpeg" /></section>
<section class="">机器人世界模型的下一场竞争，可能不是画质，是架构。</section>
<section>
<p style="text-align: left; margin: 0px;"><strong style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; font-weight: bold; line-height: 1.5; color: #375474; text-align: left;">作者｜Li Yuan</strong></p>
<p style="text-align: left; margin: 0px;"><strong style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; font-weight: bold; line-height: 1.5; color: #375474; text-align: left;">编辑｜郑玄</strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">一只机械臂的夹爪明明没有夹住杯子，杯子却像被磁铁吸住一样，跟着夹爪升了起来。这个看似荒诞的问题，正在困扰机器人世界模型，业内甚至将其称为「磁铁式抓取」。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">视频生成模型只要让画面看起来合理，就算完成任务；但世界模型不能只追求「像真的」。机器人训练数据大多来自成功演示，模型容易形成捷径：与其理解动作的细微差别，不如按照画面，直接生成最可能的结果。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">可在真实世界里，夹爪位置偏移几毫米，就可能让结果从抓起变成碰倒杯子甚至抓空。世界模型真正需要理解的，是动作与结果之间的因果关系。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">8 月 27 日，自变量机器人发布下一尺度自回归世界模型 WALL-SS，试图让世界模型从「能用」走向「好用」。WALL-SS 不是一次性生成整个画面，而是通过由粗到细的方式描绘未来，让不同动作真正对应不同结果；同时结合长时记忆机制，实现最长 60 秒连续推演。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">测试显示，WALL-SS 连续推演 60 秒后，画面和运动轨迹仍更接近真实视频，动作跟随得分达到 0.29，而 Cosmos3-Nano 为 0.044，其他测试模型干脆为 0。可以说，WALL-SS 是少数画面预测会跟随动作指令的模型。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">自变量同时宣布发布 WALL-SS。对于尚未形成统一技术路线的机器人世界模型而言，发布的意义不仅是开放一个模型，更是让行业共同验证：世界模型是否在按照动作做预测，虚拟推演能否真正服务于真实机器人。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">「技术范式尚未收敛时，持续探索本身就是竞争力。」具身智能需要的不只是快速落地的硬件，也需要持续挑战既有路线、开拓核心技术边界的公司。</p>
<section>
<section>
<section>
<section>
<section>
<p style="margin-left: 8px; margin-right: 8px;"><em><strong>01</strong></em></p>
</section>
</section>
<section>
<section></section>
</section>
</section>
</section>
<p><strong style="letter-spacing: 1px;"><strong><strong>世界模型，成为具身智能的主赛道</strong></strong></strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">2026 年，世界模型正在成为机器人领域最受关注的技术方向之一。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">英伟达持续迭代 Cosmos，并开始将视频世界模型用于机器人控制和规划；Meta 的 V-JEPA 2 尝试让机器人通过预测物理世界的变化，在陌生环境中完成抓取。越来越多研究也开始探索用世界模型替代部分真机测试，让机器人在「动手」之前，先在虚拟世界中预测不同策略的结果。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">理解这股热潮并不复杂。大语言模型通过预测下一个词学习语言规律，世界模型预测的则是下一刻的世界：机器人向左移动，杯子会不会被碰倒；夹爪再收紧一点，物体能不能被抓起；一个动作持续执行十秒，场景最终会变成什么样。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这对具身智能尤其重要。过去几年，行业主要解决的是机器人「怎么做」的问题，VLA 可以根据视觉和语言指令直接输出动作。但随着机器人能力提升，一个新的问题变得越来越突出：如何判断一套策略到底好不好？</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">如果每次模型迭代都依赖真机测试，成本高、周期长，很容易成为训练和迭代的瓶颈。传统仿真虽然可以承担部分测试，但需要人为建模物体材质、摩擦、形变和接触关系，很难覆盖真实世界的复杂性。世界模型则试图从真实视频和机器人交互数据中学习世界如何变化，让机器人可以在虚拟环境中反复预测和验证策略。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">它甚至可以进一步参与机器人的决策。VLA 看到杯子后直接决定「伸手去抓」，世界模型则可以先预测不同动作的后果，再帮助机器人选择更合适的策略&mdash;&mdash;从「直接行动」走向「先想象，再行动」。</p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/36/cb/36cb40827ab02552a38a2c4df9569fe6.jpeg" /><img class="rich_pages wxw-img" />
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">但要真正成为具身智能的基础设施，今天的世界模型仍面临三个关键门槛。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">第一是动作与结果的因果一致性。模型不能只生成符合预期的画面，而必须准确反映动作带来的结果，否则一个实际上抓不住杯子的策略，也可能在虚拟世界里被判定为成功。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">第二是长时推演能力。机器人任务往往持续数十秒甚至更久，模型需要不断把自己的预测作为下一刻的输入，任何微小误差都可能在持续推演中累积。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">第三是虚拟预测与真机实操的一致性。生成得再逼真、推演得再长，也不意味着模型真的能够评估机器人策略。只有虚拟世界中的表现能够与真机结果建立稳定对应，世界模型才真正具备替代部分真实试错的价值。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这三道门槛，也正在成为下一阶段世界模型竞争的核心。</p>
<section>
<section>
<section>
<section>
<section>
<p style="margin-left: 8px; margin-right: 8px;"><em><strong>02</strong></em></p>
</section>
</section>
<section>
<section></section>
</section>
</section>
</section>
<p><strong style="letter-spacing: 1px;"><strong><strong>WALL-SS，从架构底层改进世界模型</strong></strong></strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">WALL-SS 正是针对这些问题的一次新尝试。按照论文介绍，它是首个采用下一尺度自回归架构的世界模型。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">此前，不少世界模型沿用视频 Diffusion 的思路：输入历史画面和动作，通过多轮去噪生成未来视频。动作虽然是生成条件，但没有被明确写进「动作&rarr;结果」的生成链条里，因此模型很容易依赖视觉先验，直接预测一个「大概率成功」的未来&mdash;&mdash;即使夹爪实际上没有夹住杯子，也可能生成杯子被成功拿起的画面。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">WALL-SS 则把观察和动作组织成「观察&mdash;动作&mdash;新观察」的因果序列，让动作真正参与未来状态的生成。简单来说，就是先确定世界怎么变化，再逐层补足细节：粗尺度确定机械臂和物体的大致状态，细尺度进一步还原运动和接触。再配合失败、接管和纠偏数据，让模型学会「动作不同，结果也不同」。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这一能力在指标上得到验证。WALL-SS 的动作跟随得分达到 0.29，轨迹准确率达到 0.539；相比之下，Cosmos3-Nano 的动作跟随得分仅为 0.044。其他模型干脆得分为 0。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 8px;"><em><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/f8/83/f8832a6d59b4f347f88d85fa3d4031d4.jpeg" /><img class="rich_pages wxw-img" /><span>WALL-SS 推演至 60 秒，画面仍保持清晰，物体位置稳定；通用视频模型在约 30 秒后物体消失。</span></em></p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">另一个关键问题，是世界模型能不能「记得足够久」。WALL-SS 通过多尺度长时记忆保留近期细节、压缩远期历史，并让模型在训练时接着自己的预测继续推演，减少误差不断累积的问题。这让模型能够连续推演 60 秒，而其他模型持续 20-30 秒已经是极限。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">更重要的是，这些能力最终接受了真机检验。自变量让同一套策略分别在 WALL-SS 和真实机器人上执行，完成 600 组虚实配对实验。结果显示，两者任务成功率相关系数达到 0.926，对不同策略强弱的排序准确率达到 89%。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这意味着世界模型开始具备一个更重要的价值：不只是生成「看起来真实」的未来，而是能够帮助机器人判断不同动作会带来什么结果，并在虚拟世界中提前验证策略。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">当然，WALL-SS 目前仍有边界。其动作输入主要包括机械臂末端位置、朝向和夹爪开合，不包含完整关节状态、力和力矩，因此对精细接触和多指灵巧手的支持仍有待进一步验证。</p>
<section>
<section>
<section>
<section>
<section>
<p style="margin-left: 8px; margin-right: 8px;"><em><strong>03</strong></em></p>
</section>
</section>
<section>
<section></section>
</section>
</section>
</section>
<p><strong style="letter-spacing: 1px;"><strong><strong>在路线尚未收敛时，持续做架构创新</strong></strong></strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">WALL-SS 不是自变量突然追逐世界模型热潮的结果。过去一年，自变量一直在探索同一个问题：如何让机器人对世界的理解、对动作的预测与真实执行真正连接起来。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">WALL-OSS 通过大规模多模态预训练，将视觉、语言和机器人动作纳入同一个具身基础模型；WALL-OSS-0.5 进一步推动预训练能力向真机迁移；随后，WALL-WM 开始联合建模世界变化与机器人动作，X-Tokenizer 则探索不同机器人、不同动作如何进入统一模型。到了 WALL-SS，这条路线进一步指向一个核心问题：执行一个动作之后，世界究竟会发生什么。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">贯穿这一系列探索的，是自变量对「世界-动作」统一建模的长期投入。机器人不仅要能够行动，还要能够预判行动的后果，并根据结果不断修正自己的行为。随着模型、数据、本体和真机经验不断积累，这些探索也逐渐形成相互反馈的技术闭环。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">而具身智能的基础架构，远未收敛。在这个阶段，真正重要的并不是每一次尝试都押中最终答案，而是能否持续提出新的架构假设，用数据和真机验证，再根据结果不断调整路线。</p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/6d/f9/6df9ec9c75bb51cd34980448a8520bcf.png" /><img class="rich_pages wxw-img" />
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">此次自变量宣布发布 WALL-SS，也是这一思路的延续。发布的不只是一个模型，更是一套可以被行业共同验证的技术路线：下一尺度自回归是否更适合机器人，动作与结果能否真正对应，虚拟测试能否反映真机表现。研究者可以基于此继续探索，机器人公司也可以直接验证它能否进入自己的训练和评测体系。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这也是发布对于早期具身智能产业更重要的意义：降低行业探索成本，也让不同路线在真实应用中接受检验。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">过去几年，国内具身智能的竞争更多集中在本体、数据和产品落地。但一个尚未定型的行业，不能只等着成熟架构出现后再追赶，也需要有人进入世界模型、动作表征和学习范式这些更底层的位置，持续寻找下一种可能。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">WALL-SS 当然不是最终答案，但它代表了一种变化：国内公司开始不只是跟随已有路线，而是提出自己的架构假设，并把它开放出来接受行业检验。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">当技术路线真正发生切换时，决定一家公司的不只是它有没有跟上上一代，而是它是否始终保留着探索下一代的能力。</p>
<section>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 14px; color: #888; margin: 0 0 8px 0; text-align: left;">*头图来源：自变量</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 14px; text-align: left; color: #888; margin: 0;">本文为极客公园原创文章，转载请联系极客君微信 geekparkGO</p>
</section>
<section>
<section>
<section></section>
</section>
<section>
<section>
<section><strong style="font-family: Optima-Regular, PingFangTC-light;">极客一问</strong></section>
</section>
</section>
<section><strong style="font-family: Optima-Regular, PingFangTC-light;">世界模型如何突破仿真局限，</strong></section>
<section><strong style="font-family: Optima-Regular, PingFangTC-light;">实现真实可用的机器人虚拟训练？</strong></section>
</section>
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://mmbiz.qpic.cn/mmbiz_png/8cu01Kavc5YTxYGib55rtMHhP1YJ44FLtVGp8Keyg6D2X3AUhgNicT1ibKKh0fE1eiaGqkSXnTlW0ib96ib3HDAIrnVA/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" /></section>
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://mmbiz.qpic.cn/mmbiz_png/8cu01Kavc5Z5rEl2poJuZqVBGZteWibbvpuA2OibrtXHS6bAJibcYSkxdsV1VicAF088bxt3yluWTQeMyL38W8bfrw/640?wx_fmt=png&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=8" /></section>
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder __bg_gif" src="https://imgslim.geekpark.net/uploads/image/file/ef/07/ef07c78be48ca254bfbdf84b34670cd0.gif" /></section>
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder __bg_gif" src="https://imgslim.geekpark.net/uploads/image/file/2d/13/2d13d9b51ea6754b34c0ca9dc26d8b75.gif" /></section>
</section>
<p style="display: none;">&nbsp;</p>