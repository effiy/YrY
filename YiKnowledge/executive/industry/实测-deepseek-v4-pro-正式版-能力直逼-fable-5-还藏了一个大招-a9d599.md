---
title: 实测 DeepSeek V4 Pro 正式版：能力直逼 Fable 5，还藏了一个大招
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-16'
source: https://www.ifanr.com/1674965?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Wed, 12 Aug 2026 22:55:33 +0000
author: 彭海星
---

<p><img alt="" class="aligncenter size-full wp-image-1674966" height="818" src="https://s3.ifanr.com/wp-content/uploads/2026/08/32052db5-c474-466d-8fe3-f7a25818a58f.png" width="1923" /></p>
<p>盼星星，盼月亮，我们等来了七月初一的月光——</p>
<p>就在今天凌晨，DeepSeek 官网毫无预兆地更新，DeepSeek V4 Pro 0813 正式登场。依据惯例，无需手动调整，现在 API 接入的 deepseek-v4-pro 就会是最新模型。</p>
<p>此外，DeepSeek API 使用与 OpenAI/Anthropic 兼容的 API 格式，简单粘贴 API Key，就能在 Codex、Claude Code 和 OpenCode 等第三方工具中将 DeepSeek 作为后端模型使用。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674967" height="1053" src="https://s3.ifanr.com/wp-content/uploads/2026/08/Snipaste_2026-08-13_06-33-06.png" width="860" /><br />
令人稍显宽心的是，虽然已经通过提前预告的方式给用户们打了很久「API 即将涨价」的预防针，更新到 0813 版本后的 DeepSeek V4 Pro 目前依然没有涨价。每百万 token 输入（缓存未命中）与输出的定价分别是 3 元和 6 元，和预览版保持一致，也正好是 DeepSeek V4 Flash 的三倍。</p>
<p>事不宜迟，这就来看看在预览版发布的 111 天后，终于问世的 DeepSeek V4 Pro 正式版带来了哪些变化。</p>
<h3>Agent 能力，终于支棱起来了</h3>
<p>不同于往常偏好在白天流量时段发布新模型，DeepSeek 这次的凌晨更新显得有些仓促，看似官网只来得及修改模型参数介绍、API 使用指南等少数文档页，连这回的更新日志都还没端上来。进一步的更新解读，可能要留待今日白天。</p>
<p>但考虑到 V4 Pro 正式版发布的时间只比 7 月 31 日更新的 V4 Flash 正式版晚了不到半个月，我们可以有很大把握相信，二者共享了相近的优化思路（如果不是完全相同的话）。</p>
<p>所以，直接看 V4 Flash 正式版的更新日志来推导 V4 Pro 的变化也未尝不可。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674969" height="350" src="https://s3.ifanr.com/wp-content/uploads/2026/08/BandiView_Snipaste_2026-08-13_06-37-34.jpg" width="1125" /></p>
<p>DeepSeek V4 Flash 0731 更新日志里最引人注目的信息，莫过于官方宣称其基模与预览版在模型结构、尺寸上都保持一致，仅仅重新进行了后训练，但针对性的后训练也确实使得「<strong>Agent 能力大幅增强，基准测试远超 V4-Pro-Preview</strong>」 。</p>
<p><strong>如果今晚的 V4 Pro 正式版也是如此，那我们可以预期观察到它在 Agent 能力上的突飞猛进。</strong></p>
<p><img alt="" class="aligncenter size-full wp-image-1674968" height="1080" src="https://s3.ifanr.com/wp-content/uploads/2026/08/20260813021648_206_30.jpg" width="2425" /><br />
目前网上流传的第一批跑分结果，很大程度上印证了这一预期。在这些与 Agent 强相关的评测集中，V4 Pro 的表现比起预览版可谓突飞猛进，在一些项目中接近甚至超越了目前的性能标杆 Fable 5：</p>
<p>代表 DeepSeek 自家软件工程基准的 DeepSWE 从 12.8 分飙升至 62.7 分；代表 DeepSeek 全栈开发基准困难子集的 DSBench-Hard 分数翻了一倍多，达到 67.2 分；通过自然语言从零生成代码仓库的 NL2Repo 从 38.5 分提至 61.5 分 ……</p>
<p>也就是说，同一个 API 名称，昨天基本还不会做的活儿，今天就可以跟全球第一梯队的代码 Agent 掰掰手腕了。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674970" height="545" src="https://s3.ifanr.com/wp-content/uploads/2026/08/20260813063904_74_131.jpg" width="813" /></p>
<p>当然了，有 KIMI K3 珠玉在前，即使是更新后的 DeepSeek V4 Pro 正式版也还没坐上开源界的头把交椅（一些测试上与 K3 有轻微差距）；但众所周知，DeepSeek 的思路一向是：</p>
<p><strong>比我强的没我便宜，比我便宜的没我强。</strong></p>
<p>在补上了 Agent 能力短板后，我们的大鲸鱼，再一次维护了这一神圣秩序。</p>
<p>为了更好地理解 V4 Pro 的能力，我们把它接入了 Workbuddy，做了一些简单的 Agent 任务实测，看看它会交出怎样的结果。</p>
<h3>5 个实测案例，完全自主规划</h3>
<p>第一个任务很简单：接入我的微信读书 Skill，用读取到的数据做一个简单的数据报表。利用 Skills 来工作，本来就是 Agent 能力的日常体现。</p>
<p>这一点当然完全难不倒 DeepSeek，令人惊喜的是，它还主动阅读了我此前因为其他工作而放在文件库里的爱范儿设计规范 Skill，给阅读报告也配上了我们的专属配色。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674983" height="978" src="https://s3.ifanr.com/wp-content/uploads/2026/08/Snipaste_2026-08-13_05-16-01.png" width="1908" /></p>
<div class="editor-image-source">
<p>▲ 提示词：从微信读书 Skill 获取 8 月读书数据，制作为 HTML 形式的数据报表</p>
</div>
<p>接下来两个是网页设计任务，因为时间所限，我没有详细地撰写提示词规定各种约束和指导条件，可以说是相当模糊的任务指令。但就结果而言，V4 Pro 都完成得非常好——</p>
<p>在构建新闻首页的任务上，它找到了过去几天我们在选题会上讨论过的真实新闻，模仿传统媒体格调的版式设计和衬线字体也非常对味，还「手绘」了一张看着很像样的配图。<br />
<img alt="" class="aligncenter size-full wp-image-1674972" height="1067" src="https://s3.ifanr.com/wp-content/uploads/2026/08/BandiView_Snipaste_2026-08-13_05-27-12.jpg" width="1920" /></p>
<div class="editor-image-source">
<p>▲ 提示词：搜集近日科技新闻，以 THE IFANR POST 为标题，制作一个仿照传统新闻媒体的网站首页，并为头条制作一张虚假的渲染配图</p>
</div>
<p>构思设计风格展示网站时，V4 Pro 更「自作主张」地用上了.style 的网站名称后缀和渐变色标题，各种设计风格示例卡片也大体正确，整体来看精致灵动。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674985" height="1140" src="https://s3.ifanr.com/wp-content/uploads/2026/08/Snipaste_2026-08-13_05-29-31.png" width="1920" /></p>
<div class="editor-image-source">
<p>▲ 提示词：制作一个现代化的设计风格展示网站，展示极简、斯堪的纳维亚、新拟物等多种设计风格的 Bento 卡片。</p>
</div>
<p><strong>将模糊指令重新梳理为清晰需求，并根据这一需求自主规划、分步完成项目，DeepSeek V4 Pro 正式版的智能程度可见一斑。</strong></p>
<p>至于更复杂的交互式实例，V4 Pro 也展现出了不俗实力：</p>
<p>一个是基础的俄罗斯方块游戏，方块的绘制显然相当精美，带有一点小小的伪 3D 效果。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674975" height="998" src="https://s3.ifanr.com/wp-content/uploads/2026/08/block.gif" width="820" /></p>
<div class="editor-image-source">
<p>▲ 提示词：以发散式思维，制作包含复杂物理或交互效果的互动式示例组件，包含旋转/碰撞/消行/加速的正确性，自行设计用例设计方向。</p>
</div>
<p>另一个案例则是从我读书记录中的《随椋鸟飞行》中获取灵感，制作了一个显示简单规则如何涌现出复杂秩序的「椋鸟群模拟器」，动画效果令人惊艳。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674974" height="665" src="https://s3.ifanr.com/wp-content/uploads/2026/08/Bird-3.gif" width="800" /></p>
<div class="editor-image-source">
<p>▲ 提示词：以发散式思维，制作包含复杂物理或交互效果的互动式示例组件，包含旋转/碰撞/消行/加速的正确性，自行设计用例设计方向。</p>
</div>
<p>为什么是模型来「获取灵感」？那是因为在布置后面几个任务时，我只跟模型说了「我要去睡觉」，要以什么方向来构思示例、又应该以何种方式来实现，都完全是 DeepSeek 自己在掂量。</p>
<p><img alt="" class="aligncenter size-full wp-image-1674976" height="215" src="https://s3.ifanr.com/wp-content/uploads/2026/08/BandiView_Snipaste_2026-08-13_03-14-51.jpg" width="707" /></p>
<p>你看，只要模型足够聪明，当媒体老师也不用真的熬夜追热点——AI Agent 能够自行替我解决大多数问题。</p>
<h3>还有一个「隐藏大招」</h3>
<p>话说回来，DeepSeek V4 Pro 正式版的发布当然是一件大事，但如果把时间拉长来看，它可能只是另一件大事的前奏。</p>
<p>如果仔细阅读此前官网关于 V4 Flash 正式版的更新公告，会发现里面隐藏着一条关键信息：</p>
<blockquote><p>对于公开基准测试集中的 Code Agent 任务，正式版 DeepSeek-V4-Flash 使用 DeepSeek Harness 极简模式（即将发布）作为框架进行测试，并使用 max 档位，topp=0.95，temperature=1.0</p></blockquote>
<p><strong>没错，DeepSeek Harness 要来了。</strong></p>
<p>近一两年，AI 工程的研究者们逐渐形成了一个共识：<strong>随着各家 AI 模型在推理能力上接近天花板，未来真正决定 AI Agent 能力的将不会是底层模型，而是 Harness（运行框架）。</strong></p>
<p>如果说 LLM 是一个数字员工的大脑，那 Harness 就是它的办公系统，负责给它分配权限与任务、调取工具、审批流程、检查结果、保存日志等工作。</p>
<p>没有好的运行框架，再强的智能也无从发挥，甚或是会让 AI 成为失去管控的脱缰野马。反过来说，一套足够好的 Harness，能让平庸的员工发挥出 200% 的实力。</p>
<p>如今，随着 V4 Pro 正式版问世，未来 DeepSeek AI Agent 系统的模型部分已完全到位。那么，Harness 是不是已经准备好了呢？</p>
<p><img alt="" class="aligncenter size-full wp-image-1674978" height="734" src="https://s3.ifanr.com/wp-content/uploads/2026/08/20260813064603_76_131.jpg" width="1267" /></p>
<p>答案显然是肯定的。无论是此前 DeepSeek 招聘 Harness 研发工程师的新闻，还是前天注册「DeepSeek Harness 团队」公众号，一切证据都指向：</p>
<p>短至数天、长至数月之内，DeepSeek Harness 就将与我们见面。</p>
<p><strong>或许，新的 DeepSeek 时刻不会太远。</strong></p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>