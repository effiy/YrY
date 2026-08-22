---
title: 零基础速通DeepSeek Harness，带你玩转赛博乐高
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-22'
source: https://www.ifanr.com/1675781?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Fri, 21 Aug 2026 02:43:14 +0000
author: 张子豪
---

<p><img alt="" class="alignnone size-full wp-image-1675952" height="817" src="https://s3.ifanr.com/wp-content/uploads/2026/08/ChatGPT-Image-08_53_19.png" width="1923" /></p>
<p>学不过来，刚刚学会怎么用好 Codex，现在又来了个 DeepSeek Harness。</p>
<p>过去几天，我们已经介绍过它的插件、各种新玩法和新上线的多模态，但还有一个最基础的问题没有解决：DeepSeek Harness 到底该怎么装，又该怎么用？</p>
<p>这次我们从安装、第一次对话、装 Skill、玩插件一路到卸载，带大家从零跑通 DeepSeek Harness。</p>
<h2>用 WorkBuddy 安装 DeepSeek Harness</h2>
<p>DSH 在某种程度上有点像龙虾，没有完整的点击即安装的应用程序，只有放在代码库里需要通过命令行安装的软件包。</p>
<p><img alt="" class="alignnone size-full wp-image-1675785" height="1974" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_14-08-47.png" width="3840" /></p>
<p>DeepSeek 官方提供了两种方式，一种是从源码安装，获取完整项目源码，并按照仓库说明完成安装。</p>
<blockquote><p>git clone https://github.com/deepseek-ai/deepseek-harness</p></blockquote>
<p>对于熟悉 Git 和命令行的用户来说，这套流程并不复杂，但后面还要继续执行 pnpm install、构建项目等一系列操作。如果只是想先体验一下 DeepSeek Harness 的普通用户来说，多少还是有些劝退。</p>
<p>所以更简单的方法，是直接通过 Node.js 快速启动。安装 Node.js 后，只需要输入：</p>
<blockquote><p>npx @deepseek-ai/dsh web</p></blockquote>
<p>我们这一批从「龙虾时代」走过来的 AI 原生玩家，电脑上一般都已经安装了 Node.js。在命令行输入 node -v、npm -v 检查一下是否安装好，如果都没有，直接从官网 https://nodejs.org/en/download 下载安装即可。</p>
<p>正常来说，输入快速体验的命令后，我们在浏览器中打开 http://127.0.0.1:3080 该本地地址，就能启动顺利启动 DeepSeek Harness。</p>
<p><img alt="" class="alignnone size-full wp-image-1675801" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_15-47-54.png" width="3840" /></p>
<p>如果还是启动失败，不妨试试社区开发的第三方应用。不少开发者已经基于开源的 DeepSeek Harness 仓库，独立开发了相关的应用，可以像安装微信一样，一键安装到本地电脑上。</p>
<p>其中收藏比较多的是由 Anywhere Lab 开发的桌面端，目前在 GitHub 上已经有 14000 个 Star，算是目前关注度最高的第三方客户端之一。</p>
<p><img alt="" class="alignnone size-full wp-image-1675803" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_15-54-27.png" width="3840" /></p>
<p>正常安装完成后，其界面和官方的 WebUI 基本是保持一致，不同的地方在于它新增了一个插件市场的入口，我们可以直接在插件市场里找到有意思的插件并安装。</p>
<p><img alt="" class="alignnone size-full wp-image-1675802" height="1680" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_15-53-33.png" width="2560" /></p>
<p>更终极的方法，如果你不想用第三方应用，也不想自己捣鼓终端，交给 WorkBuddy 或者 Codex。</p>
<p>早在我们内测时，安装方法就需要从自己的 GitHub 仓库里面部署，对小白来说是完全不懂。我们就直接把项目链接发给 Codex，Codex 会自动读取项目文档，帮我们在命令行处理那些操作。</p>
<p><img alt="" class="alignnone size-full wp-image-1675783" height="1918" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_13-36-09.png" width="3118" /></p>
<p>同样的 DeepSeek Harness，我们也可以直接把 GitHub 的仓库链接丢给 Codex，https://github.com/deepseek-ai/deepseek-harness，选择 Codex 访问权限为全部访问，等待它慢慢操作，就能直接帮我们打开安装好的 DeepSeek Harness。</p>
<p>用 WorkBuddy 也可以，就选「日常办公」，工作空间可以任意指定一个本地的文件夹，或者干脆不用指定。模型和思考强度不用太纠结，安装任务本身并不复杂；如果中途涉及较多环境排错，再切高推理等级。</p>
<p>然后直接发送「帮我把这个 https://github.com/deepseek-ai/deepseek-harness 项目部署到本地，让我可以通过 http://127.0.0.1:3080 访问该服务。」</p>
<p><img alt="" class="alignnone size-full wp-image-1675784" height="2000" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_14-02-59.png" width="3296" /></p>
<p>很快，Workbuddy 就帮我们安装好了最新版本的 DeepSeek Harness，后续有更新，还可以继续和它对话，让它帮忙更新。</p>
<p><strong>以前安装一个开源项目，第一步是学会敲命令；现在第一步可以是把 GitHub 链接丢给另一个 Agent。</strong></p>
<p>DeepSeek Harness 自己还没有做到点击即用，但 Codex、WorkBuddy 这类本地电脑 Agent，已经把它最劝退普通用户的命令行门槛直接抹掉了，而后续更多的繁琐操作，都可以甩手交给 DeepSeek Harness 处理。</p>
<h2>第一次对话，怎么用多模态</h2>
<p>和所有的 Agent 一样，工作区可以让我们指定某个文件夹，在该项目内就能直接开启对话。</p>
<p><img alt="" class="alignnone size-full wp-image-1675804" height="622" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_16-04-02.png" width="1828" /></p>
<p>举个例子，点击对话框，选择本地电脑上任意一个文件夹，可以是新创建的，也可以是包含了具体项目文件的；选择之后，我们就能给 DeepSeek Harness 下需求。</p>
<p>一般来说，模型可以选择 DeepSeek-V4-Pro，推理等级选择 Max，虽然贵一点，但是也能减少我们和 AI 拉扯的时间。</p>
<p><img alt="" class="alignnone size-full wp-image-1675805" height="472" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_16-10-43.png" width="1594" /></p>
<p>DeepSeek Harness 也会在理解我们需求之后，将项目分成多个有进度可跟踪的任务，以及使用目标模式来控制任务不偏离原需求。</p>
<p><img alt="" class="alignnone size-full wp-image-1675806" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_16-25-33.png" width="3840" /></p>
<p>中途遇到需要我们做决策的部分，或者需要授权的审批，DeepSeek Harness 都会弹出通知让我们选择。</p>
<p><img alt="" class="alignnone size-full wp-image-1675786" height="716" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_14-53-50.png" width="1552" /> <img alt="" class="alignnone size-full wp-image-1675807" height="896" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_17-39-43.png" width="1630" /></p>
<p>和一般的网页版生成不同，DeepSeek Harness 会持续调用工具来完善最终的交付，就像这个《牛来》的游戏，DeepSeek Harness 生成的网页，还是有一定的可玩性的。</p>
<p id="oknmfUa"><a href="https://s3.ifanr.com/wp-content/uploads/2026/08/img_6a86c921b524e.png" rel="lightbox[1675781]"><img alt="" class="alignnone size-full wp-image-1675810 " src="https://s3.ifanr.com/wp-content/uploads/2026/08/img_6a86c921b524e.png" /></a></p>
<p>甚至还识别到了「半导体老祖」、「跳过小溪」、「父子相认」这些名场面。</p>
<p>而简单的问答或是安装 Skills 现在都可以交给他，例如我们从网上找了一个 PPT 的 Skill，ppt-master，然后直接在对话框发送「帮我安装一下这个 Skill https://github.com/hugohe3/ppt-master/blob/main/skills/ppt-master/SKILL.md」</p>
<p>安装完成之后，直接说用这个 Skill 帮我做一份语文课 PPT，内容是朱自清的《荷塘月色》。</p>
<p>DeepSeek Harness 会遵照 PPT Master Skill 的要求，自动打开一个新的浏览器标签页，要我确认设计方案。</p>
<p><img alt="" class="alignnone size-full wp-image-1675790" height="1744" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-20-10.png" width="3222" /> <img alt="" class="alignnone size-full wp-image-1675791" height="1744" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-23-52.png" width="3222" /></p>
<p>最后生成的效果，也确实很不错。</p>
<p><img alt="" class="alignnone size-full wp-image-1675795" height="1720" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-48-55.png" width="3072" /></p>
<p>和其他 Agent 不一样的地方，则是 DeepSeek Harness 新增的「轨迹」页面，把调用了哪些工具，助手的回复，上下文注入以及 Token 的使用都清晰的呈现出来了。</p>
<p><img alt="" class="alignnone size-full wp-image-1675787" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-13-37.png" width="3840" /></p>
<p>以及多种不同的运行模式，处理不同的任务。</p>
<p><img alt="" class="alignnone size-full wp-image-1675788" height="908" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-15-30.png" width="2620" /></p>
<p>基本的使用大概就是这样，如果是从一个已有文件的本地文件夹，我们也可以让 DeepSeek Harness 帮我们完成文件的整理。</p>
<p>刚好 DeepSeek Harness 最近的更新加入了多模态的功能，在 0820 的更新日志里写着「新增功能：增强多模态支持度，DeepSeek 模型适配器支持配置启用原生图片请求，/goal、/plan 等命令可接收图文输入，@ 菜单支持引用文件和会话」</p>
<p>但实际的情况是 <strong>Harness 多模态了，当前用的这个 DeepSeek 模型还没有。</strong></p>
<p>当 DeepSeek Harness 遇到整理的文件是图片时，它依然会报错，表示 DeepSeek-V4-Pro 不是一个支持多模态的模型，它无法读取图片内容。</p>
<p><img alt="" class="alignnone size-full wp-image-1675808" height="462" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-19_18-17-01.png" width="1534" /></p>
<p>这次更新打通的是 Harness 的输入管线和模型适配层，所以 DSH 已经能把图片送给支持视觉的模型；V4-Pro 本身不接图片，因此默认组合下依然看不了图。</p>
<p>根据更新的仓库代码显示，前一版本的 DeepSeek Harness 多模态支持处于较基础阶段。在多轮对话中，如果发送了多张图片或单张图太大，极易因为图片历史堆积（Token 超限、API 格式不支持）导致模型请求直接崩溃（Crash）。</p>
<p>更新之后的多模态，不仅仅是聊天框，/goal（目标模式）和 /plan（计划模式）这些底层命令也正式打通了图文输入，并且能在 @ 菜单里直接拖入/引用图片文件。</p>
<p id="ezFBkum"><a href="https://s3.ifanr.com/wp-content/uploads/2026/08/img_6a86c9d10b766.png" rel="lightbox[1675781]"><img alt="" class="alignnone size-full wp-image-1675811 " src="https://s3.ifanr.com/wp-content/uploads/2026/08/img_6a86c9d10b766.png" /></a></p>
<p>但如果模型本身不支持「看图」，即模型在 DeepSeek 官方适配器中被标记为 [&#8220;text&#8221;]，就无法使用 DSH 的多模态能力。代码注释还解释了为什么拒绝：工具结果会进入持久会话历史，如果路由不支持图片，会破坏续聊和分叉。</p>
<h2>创作第一个插件</h2>
<p>万物皆插件，插件几乎是 DeepSeek Harness 最大的亮点，如果不使用插件，可能会觉得 DSH 也不过如此。</p>
<p>在 DeepSeek Harness 官网，给出的自定义插件案例，就有创作 UI 插件，开发贪吃蛇游戏插件，以及自定义一个代码审查模式。</p>
<p id="wdEORDH"><a href="https://s3.ifanr.com/wp-content/uploads/2026/08/img_6a86cb7685bfd.png" rel="lightbox[1675781]"><img alt="" class="alignnone size-full wp-image-1675812 " src="https://s3.ifanr.com/wp-content/uploads/2026/08/img_6a86cb7685bfd.png" /></a></p>
<p>我们可以直接在对话框输入「给当前界面加入一个鲸鱼的背景。」DSH 的插件能力，就能让我们自定义整个用户界面。</p>
<p><img alt="" class="alignnone size-full wp-image-1675794" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-47-07.png" width="3840" /></p>
<p>从 DSH 的思考轨迹可以看到，它使用的是 Cordis 内核的能力，即 Cordis 内核只负责插件的加载、卸载和依赖关系，不承载 Agent 的具体能力。</p>
<blockquote><p>基于 Cordis 内核的服务，模型、工具、技能、会话、沙箱、存储、循环、调度、UI 等所有 Agent 能力均可以由插件提供，再通过 Cordis 服务与事件彼此协作。</p></blockquote>
<p>前段时间，「滑动变祖器」在社交媒体上被网友们疯狂转载。我们也把这个项目链接丢给 DSH，告诉他当我们选择不同的思考深度时，界面的 UI 要根据 Low、High、Max 做出对应的调整。</p>
<p><img alt="" class="alignnone size-full wp-image-1675782" height="1109" src="https://s3.ifanr.com/wp-content/uploads/2026/08/2026-08-20-16.18.30.2026-08-20-16_25_39.gif" width="2160" /></p>
<div class="editor-image-source">
<p>▲ 提示词：参考这个仓库 https://github.com/Lichtspektrum/liang-intensity-calibrator，把滑动变化的图片设置为 UI 界面的背景，然后当我们选择不同的思考深度时，界面的 UI 要会根据 推理等级 做出对应的调整，变化为不同的图片背景。</p>
</div>
<p>类似皮肤的插件还可以在专门的皮肤市场找到更多的案例，有深海女仆工坊、回到 2005 的广告门户网站、海洋皮肤、滑动变祖，以及便签等 189 个皮肤插件。</p>
<p><img alt="" class="alignnone size-full wp-image-1675792" height="1602" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_15-33-18.png" width="2480" /></p>
<div class="editor-image-source">
<p>▲ 地址：https://kingofsoysauce.github.io/dsh-skin-market/</p>
</div>
<p>之前我们也分享了 DSH 好玩的插件，也有网友自发整理了各类插件，不过目前主流的玩法还是集中在可视化的 UI、不同任务类型的 Agent 编排、以及处理记忆、连接不同第三方服务的 MCP 等。</p>
<p>如果看到有意思的插件，安装也很简单，除了在终端输入类似的命令 dsh plugin &#8211;profile web add github:csyangwen/dsh-memory-evolve，我们甚至可以直接跟 DeepSeek Harness 对话就行。</p>
<p><img alt="" class="alignnone size-full wp-image-1675796" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_16-29-25.png" width="3840" /></p>
<div class="editor-image-source">
<p>▲ 安装的记忆插件，让对话框上方从对话和轨迹，变成了包含技能、待办等多项内容的界面</p>
</div>
<p>或许有意思的插件，还得自己去对话框一轮一轮测试，记得切换到创造模式，效果或许会更好。</p>
<h2>一键卸载</h2>
<p>卸载和安装一样，直接告诉 WorkBuddy/Codex 也可以，一句话「帮我卸载电脑上的 DeepSeek Harness。」</p>
<p>如果是通过：npx @deepseek-ai/dsh web 快速体验，DeepSeek Harness 并没有作为一个全局应用安装到电脑里。<strong>关闭运行它的终端，或者结束对应的进程，服务也就停止了，不需要再额外执行 npm uninstall。</strong></p>
<p>如果此前是从 GitHub 克隆源码运行，则停止服务后，<strong>再删除本地的 deepseek-harness 项目文件夹即可</strong>。至于第三方桌面客户端，就和普通应用一样，直接从系统中卸载。</p>
<p><img alt="" class="alignnone size-full wp-image-1675800" height="406" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_17-12-39.png" width="1326" /> <img alt="" class="alignnone size-full wp-image-1675799" height="1744" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_17-11-42.png" width="3222" /></p>
<div class="editor-image-source">
<p>▲ 提示词：帮我在桌面制作一个deepseek harness本地桌面启动器，有一键打开和一键卸载的功能</p>
</div>
<p>而 DeepSeek Harness 留下的会话、配置和凭据也不准备保留的话，还可以继续删除 ~/.dsh 目录。</p>
<p>到这里，从安装、第一次任务、装 Skill、折腾插件，再到最后卸载，DeepSeek Harness 基本就算跑过一遍了。</p>
<p><img alt="" class="alignnone size-full wp-image-1675797" height="1984" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_16-52-45.png" width="3840" /> <img alt="" class="alignnone size-full wp-image-1675798" height="1744" src="https://s3.ifanr.com/wp-content/uploads/2026/08/PixPin_2026-08-20_16-56-12.png" width="3222" /><br />
DSH 说 15s 之后会重启，它自己还在输出，时间到了就重启完，重启之后成功安装了工作区目录树的插件</p>
<p>回头想想，这套流程里最有意思的变化可能还发生在 DeepSeek Harness 之外：<strong>我们可以让 Agent 帮忙安装 Harness，再让 Harness 给自己安装插件</strong>。</p>
<p>以后折腾一个新的 AI 工具，需要记住的命令可能会越来越少，需要说清楚的只剩下一件事——我们到底想让 AI 做什么。</p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>