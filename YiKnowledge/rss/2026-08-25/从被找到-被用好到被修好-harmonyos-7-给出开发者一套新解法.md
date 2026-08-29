---
title: 从被找到、被用好到被修好，HarmonyOS 7 给出开发者一套新解法
tags:
- 极客公园 geekpark
category: life/lifestyle
created: '2026-08-29'
source: http://www.geekpark.net/news/369356
type: rss
source_name: 极客公园 geekpark
source_url: https://www.geekpark.net/rss
published: Tue, 25 Aug 2026 23:52:42 +0800
---

<section class="wx-article-wrap">
<section><img alt="图片" class="rich_pages wxw-img" src="https://imgslim.geekpark.net/uploads/image/file/3a/d5/3ad5c22ebf3ece512c4f71c54f177022.png" style="display: block; width: 661px !important; vertical-align: bottom; margin: 0px; height: auto !important;" /></section>
<section class="js_darkmode__bg__0 js_darkmode__0">原来关注 App 被打开的次数，现在关注的是服务被调用的次数。</section>
<section>
<p style="text-align: left; margin: 0px;"><strong class="js_darkmode__1" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; font-weight: bold; line-height: 1.5; color: #375474; text-align: left;">作者｜张勇毅</strong></p>
<p style="text-align: left; margin: 0px;"><strong class="js_darkmode__2" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; font-weight: bold; line-height: 1.5; color: #375474; text-align: left;">编辑｜靖宇</strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">对应用开发者来讲，一天里有三个时刻经常会想起操作系统：早上看数据。昨天的新增还剩多少，七日留存掉到了哪条线，还有那一大批装了就再没打开过的用户&mdash;&mdash;你的图标被留在第四屏，和几十个 App 挤在一起。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">下午改代码。一个编译错误卡了半小时，AI 给的写法改了三遍还是不对，因为它根本没见过多少这个平台的代码。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">半夜被告警叫醒。线上崩溃率抬头，后台堆了几千条日志，没有一条直接告诉你为什么。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">被找到、被用好、被修好&mdash;&mdash;这三件事和操作系统的关系，过去十年几乎没变过：系统给你一个图标位、一套 SDK、一份崩溃日志，剩下的靠自己。</p>
<p style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 16px; line-height: 1.75; margin: 0px 8px 24px;">变化发生在 AI 进入系统层之后：操作系统第一次有机会替开发者接管这三件事的一部分，而不只是提供工具。HarmonyOS 7 是做得比较完整的一个样本，8 月 21 日 HDD 深圳站的 AI 专场把它拆成了五个议题。这篇文章不复述议题，只回答一个问题：<strong class="js_darkmode__3" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">对一个应用开发者来说，这三件事现在分别变成了什么样，以及哪些还没变。</strong></p>
<img alt="图片" class="rich_pages wxw-img" src="https://imgslim.geekpark.net/uploads/image/file/f7/c3/f7c365e6d430822667eac68bbb6fd1c1.jpeg" style="display: block; vertical-align: bottom; margin: 0px 8px 8px; width: 677px !important; height: auto !important;" />
<p class="js_darkmode__4" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">应用上线之后的三件事，以及 HarmonyOS 7 对应给出的能力与边界｜图片来源：极客公园</p>
<section>
<section>
<section>
<section>
<section>
<p style="margin-left: 8px; margin-right: 8px;"><em><strong>01</strong></em></p>
</section>
</section>
<section>
<section class="js_darkmode__5"></section>
</section>
</section>
</section>
<p class="js_darkmode__6"><strong style="letter-spacing: 1px;"><span class="js_darkmode__7"><strong class="js_darkmode__8"><span class="js_darkmode__9"><strong>看得见的体验</strong></span></strong></span></strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">在 HarmonyOS 7 上，应用接触用户的方式多了一种：用户对小艺说一句话，系统理解意图，把任务派给对应的服务，结果以通知的形式回到与用户的上下文对话里。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">华为把它叫「意图即服务」。听起来像发布会词，拆开看其实是一条分发通道&mdash;&mdash;<strong class="js_darkmode__10" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">用户不再需要找到你的图标，你的服务可以被系统找到。</strong></p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">对开发者，这是一个不依赖首屏位置的入口。统计数据显示小艺家族每天被唤醒超 30 亿次，数字本身不重要，重要的是它不收买量费，并且已经深入了鸿蒙系统的方方面面，渗透进用户日常使用体验的每一部分。</p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/1b/46/1b46ee67a295d2d8c92ee9dcad16f1b4.png" />
<p class="js_darkmode__11" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">小艺家族的系统级 AI 入口与分发｜图片来源：HDD</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">接进小艺有两条路，从轻的那条走起。大多数应用需要的只是 Skill：能力是一问一答的&mdash;&mdash;参数进、结果出&mdash;&mdash;一个 API 或一个想法，在开放平台上用对话就能生成，随应用打包上架时自动注册进小艺，投入是天级的。算力很贵，没必要一上来就养一个 Agent。只有业务真的要来回商量&mdash;&mdash;多轮对话、追问、记住上下文&mdash;&mdash;才值得做成 Agent，走 A2A 协议接进来。判断标准就一条：一问一答，做 Skill；要商量着办，再上 Agent。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">端侧 A2A 是 HarmonyOS 7 新加的一条。它的来历不是产品规划，是伙伴诉求：去年底一批银行类应用提出，对话数据不能离开手机，也不想为小艺再维护一套 Agent。系统层于是加了一对组件&mdash;&mdash;一个让应用内的 Agent 直接和小艺通信，一个让应用里做好的卡片复用到小艺的对话流里，卡片内容支持开发者自行加密，系统和小艺都读不到。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;"><strong class="js_darkmode__12" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">隐私在这里不是一句承诺，是一条协议。</strong></p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">横向看，苹果和谷歌同时也在做同一件事：iOS 的 App Intents 让应用把动作暴露给 Siri，Android 也有把应用动作交给 Gemini 调度的机制。鸿蒙的差别在两个小地方&mdash;&mdash;一是应用可以用自己的 Agent 来答，而不是把意图交给系统代为执行，业务逻辑和界面还在自己手里；二是 Skill 兼容开源规范，已有资产直接导入，不必按平台重写。边界也要说清楚：这条通道只在鸿蒙设备上存在，端侧 A2A 更是从 HarmonyOS 7 起才有，存量系统上的用户暂时用不到。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">快递 100 是把这三条路都走了一遍的应用，选型逻辑可以直接抄：单号进、结果出的查件，封装成 Skill 最合算；要判断能不能寄、要比价、要多轮追问的寄件，交给 Agent 走 A2A。它先用单 Agent 开放了查轨迹、查价格、查违禁品三个能力，等到要把公司内部的全流程经营智能体果宝一并接进生态，就迁到了云侧 A2A，一次开发、各入口统一分发。接上小艺 Claw 之后，用户可以交代一句「盯着这个包裹，有异常叫我」&mdash;&mdash;查件从手动的串行操作，变成了智能体的代办。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">快递 100 的产品负责人李新良说过一句话，可以当作这条通道的注脚：<strong class="js_darkmode__13" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">「原来关注 App 被打开的次数，现在关注的是服务被调用的次数。」</strong></p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">不过有个数字同样值得关注：快递 100 的鸿蒙应用月活在五十万量级，智能体月活在一万量级。新入口是真的，但它今天带来的还是增量，不是替代。<strong class="js_darkmode__14" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">分发方式的转变，比应用自身的转变快得多。</strong></p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/cf/b8/cfb8ea52c55a6f878a3c890c8827539f.png" />
<p class="js_darkmode__15" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">接入小艺的三条通道：按业务形态选择｜图片来源：极客公园</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">被找到之后，是被用好&mdash;&mdash;系统开放给应用的端侧 AI 能力，价值不在「大」，在于一批很具体的小用处。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">知乎接了图像超分。用户的感受只有一条：旧图、糊图点开变清楚了。开发者的账要拆开算：过去想要这个效果，要么在云端存高清原图、每次下发大图，带宽和加载时间一起涨；要么在端侧自己部署超分模型，选型、机型适配、功耗调优都得自己扛。现在它是一个系统 API&mdash;&mdash;模型不用训，所有 Harmony OS 7 设备均可支持，超分跑在 NPU 上，时延比应用自己部署低一半。图片链路甚至可以反着设计：云端存小图，端侧放大&mdash;&mdash;清晰度给用户，省下的带宽和存储留给自己。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">文搜图给开发者省掉的是同一类东西。想给应用里的图片做语义搜索，过去只有两条路：把图传上云跑检索，隐私和调用成本都在账上；或者往安装包里塞一个检索模型，包体和功耗都在用户手机上。南航 e 家用的是系统能力：没打过标签的照片，用户一句话就能捞出来，图不出手机。京东金融的未读消息摘要同理&mdash;&mdash;放在端侧大模型上跑，每条摘要不再是一次按量计费的云端调用；在金融这种数据敏感的场景里，「不出手机」本身就是省下来的合规成本。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">其中有几项是别的平台暂时没有以系统 API 开放给三方应用的&mdash;&mdash;据公开资料，苹果和谷歌都没把图像超分、文本语义搜图做成开发者可直接调用的系统能力。OCR、人脸检测这类三家都有，鸿蒙的差别主要在芯片协同带来的时延，以及免费：头部应用的文字识别每月调用十万到上亿次，按业界按次计费折算，一个月省下数十万到上百万元。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">端侧大模型部分，苹果的 Foundation Models 框架和谷歌的 Gemini Nano 都已经把端侧小模型开放给开发者，鸿蒙这次给的是 3B 和 7B 两档；华为自己的说法是大模型「还在爬坡阶段」，今年基本追上开源第一梯队。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">鸿蒙独家的是模型之外的三层：芯片、供给方式，和给自带模型留的路。最底下是芯片&mdash;&mdash;低比特量化、大颗粒度算子融合、异构调度这些活都做在系统里，3B 模型首字时延半秒，内存和功耗比行业低约两成，这是应用自带模型很难自己做到的数。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">中间是供给方式&mdash;&mdash;3B、7B 两档模型装在系统里，不占应用的安装包，版本更新、机型适配都由系统统一维护，应用按 API 调用就行。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">最上面是给自带模型的路&mdash;&mdash;CANN、MindSpore Lite 这些推理加速套件同样开放，应用自己的模型也能吃到 NPU 的加速。至于边界，华为自己说得直白：大模型「还在爬坡阶段」，今年基本追上开源第一梯队&mdash;&mdash;摘要、抽取这类功能放端侧放心，复杂推理还是得回云端。</p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/c0/1b/c01b7a4a412bd3a6de2ec55b7b650cb0.png" />
<p class="js_darkmode__16" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">南航 e 家接入文搜图：用一句话在图片库里检索｜图片来源：HDD</p>
<section>
<section>
<section>
<section>
<section>
<p style="margin-left: 8px; margin-right: 8px;"><em><strong>02</strong></em></p>
</section>
</section>
<section>
<section class="js_darkmode__17"></section>
</section>
</section>
</section>
<p class="js_darkmode__18"><strong style="letter-spacing: 1px;"><span class="js_darkmode__19"><strong class="js_darkmode__20"><span class="js_darkmode__21"><strong>看不见的工程</strong></span></strong></span></strong></p>
</section>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">运维阶段的真实处境是：没有现场，只剩日志。冻屏、内存泄漏、崩溃是三类最耗人的问题，团队里能把它们又快又准解决掉的人永远稀缺。系统这边的检测能力年年增强，问题被发现得越来越快，但定位和解决的效率并没有跟着提升&mdash;&mdash;告警越来越多，消灭得却没有更快。</p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/3e/29/3e2940a07460c95b3c2bd7402a99f6ff.png" />
<p class="js_darkmode__22" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">故障发现快、定位和解决慢：AI 辅助故障定位议题现场｜图片来源：HDD</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">「AI 辅助故障定位」这次给的不是一个新平台，是一组 Skill：六个面向故障定位的 AI 技能，对应冻屏、C++ 崩溃、JS 崩溃、JS 内存泄漏、Native 内存泄漏和 API 误用。工作方式是先评估整机资源、排除系统级异常，再解析调用栈、还原主线程当时的执行分布，最后给出根因报告和精确到源码行的修复建议。部署有三种：本地跑，集成进企业自建的 APM，或者直接用华为的 APMS 平台&mdash;&mdash;配好告警规则，现网故障上报后自动聚类、自动分析。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">和安卓对照会更清楚。Android Studio 已经把 Gemini 接进了崩溃洞察，能解释 Crashlytics 里的崩溃；鸿蒙这套的两个小差别在于：一，Skill 是开源的，可以拆下来装进任何 APM&mdash;&mdash;小红书和支付宝就是集成进自家平台在用，不必迁到华为的工具链；二，冻屏这类问题依赖系统层的采样栈和整机资源状态，操作系统厂商手里的信息比应用侧 SDK 完整。<strong class="js_darkmode__23" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">开源和系统权限，是这组 Skill 比单纯的「AI 解释崩溃」多出来的部分。</strong></p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/95/f7/95f733b2283f5d24ca69b623ff87b04a.jpeg" />
<p class="js_darkmode__24" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">AI 辅助故障定位的四层结构与知识回写闭环｜图片来源：极客公园</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">修完故障总要改代码，而这恰恰是通用 AI 在鸿蒙上最容易掉链子的地方。原因不复杂：ArkTS 的训练语料比 TypeScript 少得多，大模型动不动就把 ArkTS 写成 TS，编译不过；元服务的分包规则它知道，但遵不遵守要打问号。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">HarmonyOS 开发助手补的就是这一段。它是一个 IDE 插件，三个功能：几句话生成一个元服务，从需求分析、编码、测试到打包全流程接管；存量小程序转元服务&mdash;&mdash;一个两万行代码的工程，识别修复 121 处错误，约 20 分钟完成，界面九成相似；三方库鸿蒙化，针对的是通用 AI 能搞定七成、剩下三成最难最耗时的那一段，已经有开发者用它完成了 400 个三方库的适配，周期降了约七成。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这三个功能本身就说明了鸿蒙生态的现状：小程序和三方库的迁移工具之所以存在，是因为存量代码还在别的平台上。因为开发小程序和三方库（Flutter、RN 等）最常使用 VS Code 开发， 所以小程序和三方库的迁移插件在 VS Code 系的 IDE 里已经支持；一站式生成元服务本来就是鸿蒙应用，是 0-1 生成， 所以一站式生成元服务在 DevEco Studio 中支持；生成元服务时 AI 的思考时间偏长，这是用过的人的原话。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">IDE 之外，鸿蒙开发者知识 MCP 服务还把官方文档开放给任何支持 MCP 的编程工具，Cursor、Claude Code 配一段地址就能实时检索，官网更新后 30 分钟内同步。它承认了一个事实：<strong class="js_darkmode__25" style="color: #000000; font-size: 16px; letter-spacing: 0.5px; line-height: 1.75; font-family: Optima-Regular, PingFangTC-light;">开发者不会为了一个平台换掉自己顺手的工具。</strong></p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">把三件事放回开发者的账本上看，分发这笔账：买量之外多了一条免费通道，外加天工计划最高 75 万元的现金激励；代价是要把服务拆成系统能调度的粒度&mdash;&mdash;拆过之后的能力在任何助手里都能复用，这笔投入不会被锁死在一个平台上。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">至于算力：OCR、超分、摘要这类高频功能放到端侧，省的是按次计费的云端成本，换来的是数据不出手机；代价是端侧模型的能力上限。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">在运维侧，故障定位从「最有经验的那个人」变成一组能装进自家平台的开源 Skill，专家的时间挪到复核和决策；代价是六类问题之外，还是得靠人。</p>
<img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder" src="https://imgslim.geekpark.net/uploads/image/file/b0/5b/b05b0b2cc2a95751f5f0ade9c0af8aca.png" />
<p class="js_darkmode__26" style="font-family: Optima-Regular, PingFangTC-light, 'PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; font-size: 14px; line-height: 1.5em; text-align: left; color: #b2b2b2; margin: 0px 8px 24px;">HDD 现场开发实操，体验最新的技术能力，完成 codelabs 赛题｜图片来源：HDD</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">这三件事，过去是每个团队各自重复付出的成本：分发靠买量，体验靠堆人调优，质量靠少数专家的经验。HarmonyOS 7 做的事情，是把所有应用都要做的那部分工程收进系统&mdash;&mdash;不是替开发者做产品，而是把时间还给开发者。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">对开发者，价值不止省下的账单。当入口不再决定生死、排障不再依赖「大佬」，应用之间比的就回到了服务本身：谁更懂自己的用户，谁的能力更值得被一次次调用。这一轮分发逻辑的变化，站在了开发者一边。</p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 16px; line-height: 1.75; margin: 0 0 24px 0; margin-left: 8px; margin-right: 8px;">如今，HarmonyOS 7 正式版即将发布。有存量应用的团队，先把一两个高频功能封装成 Skill，看调用次数；还在用云端 OCR 或图片处理的，算一次端侧替换的账；被冻屏和内存泄漏困住的，把 AI 辅助故障定位装进自己的 APM 跑一周。每一件的试错成本都比两个月前低&mdash;&mdash; 先试的团队，自然会先知道自己的服务在新入口里值多少（了解详情可点击【阅读原文】查看）。</p>
<section class="js_darkmode__27">
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 14px; color: #888; margin: 0 0 8px 0; text-align: left;">*头图来源：<span>HDD</span></p>
<p style="font-family: Optima-Regular, PingFangTC-light,'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei',sans-serif; font-size: 14px; text-align: left; color: #888; margin: 0;">本文为极客公园原创文章，转载请联系极客君微信 geekparkGO</p>
</section>
<section class="js_darkmode__28">
<section class="js_darkmode__29">
<section class="js_darkmode__30"></section>
</section>
<section class="js_darkmode__31">
<section>
<section><strong style="font-family: Optima-Regular, PingFangTC-light;">极客一问</strong></section>
</section>
</section>
<section class="js_darkmode__32"><strong style="font-family: Optima-Regular, PingFangTC-light;">你最希望手机里的哪个功能，<br />被一句话叫出来？</strong></section>
</section>
<section></section>
<section></section>
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder __bg_gif" src="https://imgslim.geekpark.net/uploads/image/file/b8/40/b84088930f999b549dd3dc66a7333b7d.gif" /></section>
<section><img alt="图片" class="rich_pages wxw-img js_img_placeholder wx_img_placeholder __bg_gif" src="https://imgslim.geekpark.net/uploads/image/file/1c/26/1c2691937530ee79bc4d87ff6ce95982.gif" /></section>
</section>
<p style="display: none;">&nbsp;</p>