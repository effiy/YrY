---
title: 突发| DeepSeek 多模态模型上新，鲸鱼终于开「天眼」了
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-22'
source: https://www.ifanr.com/1676067?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Fri, 21 Aug 2026 10:23:24 +0000
author: 莫崇宇
---

<p><img alt="" class="alignnone size-full wp-image-1676085" height="821" src="https://s3.ifanr.com/wp-content/uploads/2026/08/227-2.png" width="1915" /></p>
<p>DeepSeek 终于「开眼」了。</p>
<p>就在刚刚，DeepSeek 推出了一款面向 Agent 时代的多模态模型：deepseek-v4-flash-vision-exp。<br />
目前，该模型已经上线 DeepSeek API 平台上，用户可以通过设置 model=&#8217;deepseek-v4-flash-vision-exp&#8217; 访问该模型。</p>
<p>官方介绍，这是一个实验性质的模型。该模型在保持 DeepSeek-V4-Flash 文本能力的基础上，新增视觉理解能力，可以处理图片输入，并进一步提升多模态 Agent 任务表现。</p>
<p><img alt="" class="alignnone size-full wp-image-1676074" height="1742" src="https://s3.ifanr.com/wp-content/uploads/2026/08/111-5.png" width="1194" /></p>
<p>与此同时，DeepSeek Harness 0.1.1 版本也加入了对该模型的原生支持，开发者可以直接调用 deepseek-v4-flash-vision-exp，将图像理解能力接入现有 Agent 工作流。</p>
<p>这意味着 DeepSeek 的多模态能力开始从单纯的「看图问答」走向更复杂的任务执行场景。</p>
<h3>从文本模型到多模态 Agent</h3>
<p>过去一段时间，AI Agent 的竞争重点逐渐从模型生成能力转向任务执行能力。</p>
<p>一个能够完成真实工作的 Agent，需要理解用户输入的信息，也需要读取文件、识别图片、调用工具，并根据环境变化调整行动路径。<br />
在这一过程中，视觉能力成为重要组成部分。</p>
<p>DeepSeek 表示，deepseek-v4-flash-vision-exp 在文本能力方面与 V4-Flash 保持一致，包括 Agent 能力、推理能力以及世界知识。</p>
<p>同时，该模型在多模态 Agent 基准测试中，相比 V4-Flash 有明显提升，模型表现接近 Opus-4.8 等高端模型。</p>
<p><img alt="" class="alignnone size-full wp-image-1676086" height="1652" src="https://s3.ifanr.com/wp-content/uploads/2026/08/667.jpg" width="2025" /></p>
<p>目前，deepseek-v4-flash-vision-exp 支持混合文本和图片输入，图片可以通过 Base64、外部 URL 或 Files API 方式提供。</p>
<p>开发者可以通过 Chat Completions、Messages 以及 Responses API 调用该模型，使图片理解能力接入不同类型的应用。<br />
例如，在办公场景中，Agent 可以读取截图、分析文档页面、理解表格内容；在开发场景中，它可以识别界面问题、分析错误信息；在内容生产场景中，它可以根据图片素材辅助生成内容。</p>
<p>比如我们可以用 deepseek-v4-flash-vision-exp 生成商业定制西藏自驾游 PPT。</p>
<p><img alt="" class="alignnone size-full wp-image-1676078" height="4096" src="https://s3.ifanr.com/wp-content/uploads/2026/08/115.jpg" width="607" /></p>
<p>再比如，我们还可以用它对 DeepSeek Harness 官网进行二次创作。</p>
<p><img alt="" class="alignnone size-full wp-image-1676081" height="332" src="https://s3.ifanr.com/wp-content/uploads/2026/08/222.gif" width="600" /></p>
<p>简言之，多模态能力的加入，让 Agent 能够处理的信息范围进一步扩大。</p>
<p>定价延续 V4-Flash，图片按 Token 计费</p>
<p>从 API 价格来看，deepseek-v4-flash-vision-exp 延续了 DeepSeek-V4-Flash 的价格体系。</p>
<p>模型输入和输出均按照 token 数量计算费用，其中图片会根据尺寸转换为 token，与文本 token 一同计费。</p>
<p>官方表示，每张图片最高会换算为 384 tokens，并按照 V4-Flash 的价格标准计费。</p>
<p><img alt="" class="alignnone size-full wp-image-1676075" height="2412" src="https://s3.ifanr.com/wp-content/uploads/2026/08/112-4.png" width="1886" /></p>
<div class="editor-image-source">
<p>▲ <img alt="🔗" class="wp-smiley" src="https://s.w.org/images/core/emoji/11/72x72/1f517.png" style="height: 1em;" /> https://api-docs.deepseek.com/zh-cn/quick_start/pricing/</p>
</div>
<p>目前，deepseek-v4-flash-vision-exp 的百万 tokens 输入价格如下：</p>
<ul>
<li>缓存命中情况下，空闲时段价格为 0.05 元，高峰时段为 0.10 元。</li>
<li>缓存未命中情况下，空闲时段价格为 1.5 元，高峰时段为 3 元。</li>
<li>输出价格方面，空闲时段为每百万 tokens 4.5 元，高峰时段为 9 元。</li>
</ul>
<p>其中，高峰时段为北京时间每天 9:00 至 12:00，以及 14:00 至 18:00，其余时间按照空闲时段价格计算。</p>
<p>相比一些主打多模态能力的大模型，DeepSeek 继续保持相对较低成本的 API 策略，希望降低开发者调用视觉模型的门槛。</p>
<h3>Files API 解决图片复用问题</h3>
<p>伴随视觉模型上线，DeepSeek 同步推出 Files API。</p>
<p>此前，开发者调用视觉模型时，通常需要在每次请求中重新上传图片。当图片需要在多个请求、多轮对话或者 Agent 任务中重复使用时，不仅增加网络传输成本，也会受到请求大小限制影响。</p>
<p>Files API 提供了一种新的方式。</p>
<p>开发者可以先上传图片文件，随后通过 file_id 在不同请求中引用同一文件，无需重复上传。</p>
<p><img alt="" class="alignnone size-full wp-image-1676076" height="1674" src="https://s3.ifanr.com/wp-content/uploads/2026/08/113-3.png" width="1954" /></p>
<div class="editor-image-source">
<p>▲ <img alt="🔗" class="wp-smiley" src="https://s.w.org/images/core/emoji/11/72x72/1f517.png" style="height: 1em;" /> https://api-docs.deepseek.com/zh-cn/guides/files\_api</p>
</div>
<p>目前，Files API 支持 JPEG、PNG、GIF 和 WebP 格式，单个文件最大支持 64 MiB，单用户最大存储空间为 25 GiB，最多可以保存 10000 个文件。</p>
<p><img alt="" class="alignnone size-full wp-image-1676077" height="834" src="https://s3.ifanr.com/wp-content/uploads/2026/08/114-2.png" width="1176" /></p>
<p>对于复杂 Agent 工作流来说，这类文件管理能力的重要性正在提升。</p>
<p>例如，一个需要长期分析产品资料的 Agent，可以先上传大量图片、文档素材，之后根据任务需要反复调用，而无需每次重新传输数据。</p>
<p>值得一提的是，DeepSeek 此次上线 deepseek-v4-flash-vision-exp，并没有单独强调图像生成或视觉娱乐能力，而是将重点放在多模态 Agent 场景。</p>
<p>从行业趋势来看，AI Agent 正在从处理文字指令，走向理解现实世界中的各种信息。</p>
<p>文字是人类交流的重要方式，但大量真实工作依赖图片、文件、界面和环境信息。一个只能处理文本的 Agent，很难真正进入办公、设计、开发等复杂场景。</p>
<p>因此，多模态能力正在成为 Agent 进一步发展的基础设施。DeepSeek 通过 V4-Flash-Vision-Exp、Files API 以及 Harness 生态支持，正在尝试补齐这一环节。</p>
<p>只能说，那个熟悉的 DeepSeek 终于又回来了。</p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>