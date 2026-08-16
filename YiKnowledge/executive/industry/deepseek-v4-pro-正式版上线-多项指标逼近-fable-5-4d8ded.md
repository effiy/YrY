---
title: DeepSeek V4 Pro 正式版上线，多项指标逼近 Fable 5
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-16'
source: https://www.ifanr.com/1674964?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Thu, 13 Aug 2026 01:04:57 +0000
author: 莫崇宇
---

<p><img alt="" class="alignnone size-full wp-image-1674993" height="818" src="https://s3.ifanr.com/wp-content/uploads/2026/08/6-4.png" width="1923" /></p>
<p>就在刚刚，DeepSeek V4 Pro 正式版来了。</p>
<p>最新的模型与价格页面显示，deepseek-v4-pro 对应模型版本已经更新为 DeepSeek-V4-Pro-0813。</p>
<p>从目前公布的信息来看，deepseek-v4-pro 支持 1M 上下文长度，最大输出长度达到 384K Token，同时支持非思考模式和思考模式，其中思考模式默认开启。</p>
<p>对于长代码库、大规模文档处理以及需要连续执行大量步骤的 Agent 任务来说，1M 上下文和 384K 最大输出，意味着一次调用能够容纳和生成的内容规模都相当可观。</p>
<p><img alt="" class="alignnone size-full wp-image-1674991" height="1794" src="https://s3.ifanr.com/wp-content/uploads/2026/08/1-6.png" width="1356" /></p>
<p>配套能力也基本覆盖了目前主流的 Agent 开发需求。</p>
<p>deepseek-v4-pro 支持 JSON Output、Tool Calls、Responses API、Anthropic API，同时支持 Beta 阶段的对话前缀续写与 FIM 补全，其中 FIM 补全仅限非思考模式使用。</p>
<p>API 接入方式则同时兼容 OpenAI 和 Anthropic 两套格式。</p>
<p>更值得关注的还是价格。DeepSeek 此前发布公告，宣布计划近期整体上调 API 服务定价，而当下的价格和原来的价格保持一致。</p>
<p>deepseek-v4-pro 当前每百万 Token 的价格分别为：缓存命中输入 0.025 元，缓存未命中输入 3 元，输出 6 元。</p>
<p>相比之下，deepseek-v4-flash 分别为 0.02 元、1 元和 2 元。也就是说，在缓存未命中输入和输出两个主要计费项目上，Pro 的价格都是 Flash 的 3 倍。</p>
<p>两者的并发限制也有所区别。deepseek-v4-flash 的并发限制为 2500，deepseek-v4-pro 则为 500。</p>
<p>跑分图如下：</p>
<p><img alt="" class="alignnone size-full wp-image-1674992" height="706" src="https://s3.ifanr.com/wp-content/uploads/2026/08/2-5.png" width="1308" /></p>
<p>此外，从价格和并发配置来看，Flash 更明显地面向高频、大规模调用场景，而 Pro 则把资源进一步集中到规格更高的任务上。即便如此，V4 Pro 目前的绝对调用成本依旧不算太高。</p>
<p>随着 DeepSeek-V4-Pro-0813 出现，V4 系列的产品结构也进一步清晰起来：</p>
<p>Flash 主打更低成本和更高并发，Pro 则提供更高规格的模型服务，并围绕 Tool Calls、Responses API、Anthropic API 等能力继续向 Agent 和 Coding 场景延伸。</p>
<p>今晚又是一个不眠夜。</p>
<p>官方博客地址：<br />
https://api-docs.deepseek.com/zh-cn/quick_start/pricing</p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>