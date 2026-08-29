---
title: 为什么苹果、小米的 AI 电脑，都在死磕「内存墙」｜AI 器物志
tags:
- 爱范儿 ifanr
category: executive/industry
created: '2026-08-29'
source: https://www.ifanr.com/1676852?utm_source=rss&utm_medium=rss&utm_campaign=
type: rss
source_name: 爱范儿 ifanr
source_url: https://www.ifanr.com/feed
published: Thu, 27 Aug 2026 10:15:44 +0000
author: 郑廷旭
---

<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795224152-1.png" style="height: auto; border-radius: 8px;" /></p>
<div style="margin: 26px 0; padding: 20px 18px 8px; background: #f8f8f8; color: #696969; border-radius: 12px;">
<p style="margin: 0 0 12px; line-height: 28px;">智能手机统治了过去十几年的数字生态，它是注意力的黑洞，是我们最私密的随身之物。但手机从设计之初就是为「人盯着它」而生的——它的全部逻辑，都止于屏幕。</p>
<p style="margin: 0 0 12px; line-height: 28px;">AI 的需求却恰恰相反：它需要持续感知物理世界——见你所见，听你所闻，随时在场，而非等你解锁屏幕才醒来。</p>
<p style="margin: 0 0 12px; line-height: 28px;">当 AI 真正成为一种基础能力，它迟早要从屏幕里破壳而出，寻找属于它自己的形状。这将是一个漫长的探索和演化过程。</p>
<p style="margin: 0 0 12px; line-height: 28px;">「AI 器物志」栏目由此而来，爱范儿想和你一起持续观察：AI 如何改变硬件设计，如何重塑人机交互，以及更重要的——AI 将以怎样的形态进入我们的日常生活？</p>
<p style="margin: 0 0 12px; line-height: 28px;">这是「AI 器物志」的第 <strong>23</strong> 篇文章。</p>
</div>
<p>苹果前不久刚发的新 Mac，再次刷新了「AI 电脑」的性能预期。小巧的 Mac mini 被官方直接定义成了全天候跑 Agent 的生产力工具，而专业级的 Mac Studio，更是直接给到了最高 512GB 统一内存。</p>
<p>不过，它们真正「强」的地方，藏在一个过去大家都不怎么关心的参数里——<strong>内存带宽</strong>。</p>
<p>标准版 M6 的统一内存带宽来到 170GB/s，M5 Pro 版本推到了 307GB/s，顶配的 M5 Ultra 更是直接跨过 TB 级大关，干到了 <strong>1.2TB/s</strong>。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795226142-2.png" style="height: auto; border-radius: 8px;" /></p>
<p>为了配合这次新品，苹果还给 Mac mini 拍了一支「牛来」宣传片，让小巧的银色方盒子长出了粗壮的肌肉手臂。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795227129-3.gif" style="height: auto; border-radius: 8px;" /></p>
<p>无独有偶，就在新 Mac Studio 发布前一天，<a href="https://mp.weixin.qq.com/s/E7MaWYJTXlWeRYTOioZXog">小米公布的端侧 AI 加速芯片玄戒 O100，同样把内存带宽做到了 1.22TB/s</a>；而英伟达目前最新的消费级旗舰显卡 RTX 5090，凭借 32GB GDDR7 显存，带宽更是顶到了接近 1.8TB/s。</p>
<p>桌面 SoC、端侧专用 NPU 与独立 GPU 的架构路径大相径庭，但无论是做电脑的、做手机芯片的，还是做显卡的，大家都在不约而同地干同一件事——让内存里的数据跑得更快。</p>
<h3>AI 算得越来越快，也越来越容易「吃不饱」</h3>
<p>芯片厂费这么大劲去拼带宽，说到底，是因为今天的 AI 越来越能算，同时也越来越容易被内存「饿着」。</p>
<p>这里很多人的第一反应往往是：<strong>内存不就是看容量吗？大就是好，好就是大！</strong></p>
<p>其实容量和带宽完全是两码事。<strong>容量决定的是这台电脑能装下多大的模型，而带宽决定的，是这些数据每秒能以多快的速度喂给计算核心。</strong></p>
<p>大模型一旦跑起来，最消耗资源的往往不是单纯的计算，而是贯穿始终的「搬数据」。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795229210-4.gif" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜LLM 预填充-输出示意｜NVIDIA</div>
<p>我们平时在对话框里看到文字一个接一个往外冒，在自回归生成（Decode）阶段，计算单元每生成一个新 token，就必须把内存里几十亿、上百亿的参数权重完整读取一遍。</p>
<p>就像后厨里手速极快的大厨，翻炒只要两分钟，但配菜师傅半天才能送来一盘切好的食材。大厨炒得再快，大部分时间也只能握着锅铲在灶台前干等。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795229783-5.png" style="height: auto; border-radius: 8px;" /></p>
<p>不管是 CPU、GPU 还是 NPU，现在都卡在这道坎上。算力一路狂飙突进，但内存通道的拓宽速度却跟不上。模型小的时候还能凑合，一旦上了几十 B、几百 B 的大模型，每吐一个词都要吞吐海量数据。</p>
<p>计算单元再能算，也只能把大把时间耗在等内存喂饭上。这种现象在体系结构中被称为 memory-bound（内存受限）。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795231446-6.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜整理自互联网公开信息</div>
<h3>更快的内存，也更贵</h3>
<p>很多人看内存价格，直觉上总觉得「32GB 肯定比 16GB 贵，512GB 自然比 32GB 贵」。但如果把视线放进半导体供应链，真正的规律其实是：<strong>越大的内存越贵，但越快的内存，贵得呈指数级上升。</strong></p>
<p>要让海量数据跑得更快，不能只靠堆颗粒，还得用更宽的位宽、更高频的接口，以及极其复杂的先进封装与垂直堆叠。以今天 AI 服务器标配的 HBM（高带宽内存）为例，它把多层 DRAM 芯片垂直打孔堆叠（TSV），制造难度和芯片面积远超传统内存。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795233271-7.png" style="height: auto; border-radius: 8px;" /></p>
<p>这种对超高带宽的极端渴求，正在上游掀起一场全球性的「产能大迁徙」。</p>
<p>TrendForce 的调查数据显示，由于 AI 数据中心对 HBM 和高规格服务器 DDR5 的需求暴增，三星、SK 海力士和美光三大存储巨头正在全力将有限的先进晶圆产能向企业级倾斜。</p>
<p>这直接挤压了留给消费级 PC DRAM 的供给空间，即便在传统淡季，合约价格依然持续环比上涨。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795234959-8.png" style="height: auto; border-radius: 8px;" /></p>
<p>去年底，美光正式宣布逐步退出 Crucial（英睿达）消费级内存业务，把供应链资源全面倒向规模更大、利润更高的战略客户；而最近国内 SK 海力士的第三方品牌授权店终止运营，也折射出上游原厂对消费级渠道的冷落。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795237092-9.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜美光</div>
<p>普通装机者面对价格犹豫不决时，一抬头才发现：自己加装一根内存条的预算，无形中正和全球 AI 数据中心抢夺着同一批先进晶圆。</p>
<p>为了不让算力卡在数据搬运上，芯片界从不同维度给出了各自的解法：</p>
<h4>1. 物理加宽车道：GDDR7 与 HBM</h4>
<p>最直观的办法依然是「大力出奇迹」。RTX 5090 采用 512-bit 超宽位宽配合 GDDR7，硬把显存带宽拉到了 1.8TB/s；AI 数据中心则在 GPU 身边紧挨着塞进一圈 8 层、12 层的 HBM 堆栈。这条路简单粗暴，但代价极其高昂，属于用最贵的工艺换取极致的吞吐。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795238198-10.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜NVIDIA</div>
<h4>2. 把存储搬到计算隔壁：玄戒 O100 的 3D 堆叠</h4>
<p>既然平面走线太长会有延迟和功耗，那就向立体空间要效率。小米玄戒 O100 采用了晶圆级垂直堆叠（Wafer-on-Wafer），直接把两层 DRAM 晶圆压在 NPU 计算晶圆的正上方。物理距离缩短到了微米级，数据不用在电路板上长途跋涉，用超短的垂直互联一口气换来了 1.22TB/s 的端侧带宽。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795238876-11.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜小米</div>
<h4>3. 消除冗余搬运与外部高速扩展：统一内存与雷雳 5</h4>
<p>在系统架构层面，苹果的统一内存解决的是「避免无谓倒手」。传统 PC 里 CPU 内存与 GPU 显存各占一边，数据要在两块内存之间来回复制；而在 Apple Silicon 统一内存体系下，所有计算核心直接共享同一块内存池，省去了繁琐的跨总线拷贝——少跑一趟，本身就是在抢时间。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795240375-12.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜M1 Ultra 的统一内存架构｜Apple</div>
<p>而当单台设备的内存装不下超大模型时，高速数据通道还在往机箱外延伸。M5 Pro 版本的 Mac mini 配备了 3 个雷雳 5 端口，支持将多台设备直接串成集群；而在 Mac Studio 上，通过雷雳 5（最高 120Gb/s）和 RDMA 技术，4 台 Mac Studio 组建的分布式推理集群，能跑出接近单机 3 倍的吐字吞吐。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795241601-13.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜Mac Studio 集群｜Jeff Geerling</div>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795242318-14.png" style="height: auto; border-radius: 8px;" /></p>
<h4>4. 把计算搬到内存旁边：PIM 与存内计算</h4>
<p>再往前走一步，则是更大胆的颠覆：<strong>如果数据搬运代价太大，能不能干脆把计算挪到存储旁边，让数据留在原地？</strong></p>
<p>还是用前面后厨做菜来理解：GDDR7 和 HBM 是把过道拓宽；玄戒 3D 堆叠是把备菜台挨着炒锅放；苹果统一内存是共用一个主备料盒；而 PIM（Processing-in-Memory）和存内计算，则是工程师在琢磨——</p>
<blockquote><p>有些洗菜切菜的基础备菜工作，能不能直接在仓库里顺手做完，免得每次把整筐生料大老远端给大厨去折腾？</p></blockquote>
<p>PIM 会把部分计算单元直接塞进内存颗粒附近，避免数据反复回传；更进一步的存内计算（CIM），甚至尝试直接利用存储介质本身的物理特性完成矩阵乘加。</p>
<p>尽管这类前沿架构在通用性和编译器生态上仍待成熟，但它指明了一个确定性的方向：<strong>未来的芯片设计，必须想方设法让数据少走几步路。</strong></p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795243633-15.png" style="height: auto; border-radius: 8px;" /></p>
<h3>绕了一大圈，AI 还是撞上了「内存墙」</h3>
<p>今天 AI 硬件折腾的这些问题，其实并不是什么新鲜事。</p>
<p>我们现在使用的大部分计算机，仍然延续着经典冯·诺依曼架构的基本思路：<strong>存储和计算分离</strong>。</p>
<p>数据放在内存里，处理器负责计算，需要用时再通过总线搬运。这种设计赋予了通用计算机极大的灵活性，但也埋下了一个三十年来始终无法摆脱的物理宿命：<strong>只要存算分立，数据就必须来回搬。</strong></p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795245539-16.png" style="height: auto; border-radius: 8px;" /></p>
<p>早在 1995 年，计算机科学家 William A. Wulf 和 Sally A. McKee 就发表过一篇经典论文《Hitting the Memory Wall》（撞上内存墙）。</p>
<p>他们敏锐地注意到，处理器的算力增速远快于内存带宽增速，两者的剪刀差持续扩大，处理器终将把越来越多时间耗在等待数据上——这便是著名的「内存墙」。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795247967-17.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜<img alt="🔗" class="wp-smiley" src="https://s.w.org/images/core/emoji/11/72x72/1f517.png" style="height: 1em;" /> dl.acm.org/doi/epdf/10.1145/216585.216588</div>
<p>三十年过去，这堵墙从未消失，只是大模型的爆发以前所未有的速度把整个行业推到了它面前。</p>
<p>计算机关于「快」的度量衡，也随之发生了变化。以前衡量芯片，大家盯的是发布会 PPT 上的 TOPS、TFLOPS 和跑分；但到了今天，算力再高，只要数据送不过来，芯片也只能原地空转。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795249129-18.png" style="height: auto; border-radius: 8px;" /></p>
<div class="editor-image-source" style="color: #a7a7a7; font-size: 12px; text-align: center;">图｜Apple</div>
<p>再回头看苹果那支 Mac mini 宣传片，小盒子上长出的粗壮肌肉胳膊，像极了过去几十年大家对「性能」最朴素的想象：芯片变强，就等于电脑又练出了一身肌肉，能扛更重的活。</p>
<p>但在 AI 时代，肌肉练得再大，如果原料和养料供不上，庞大的身躯也只能原地干等。</p>
<p>有意思的是，在这个连做张海报都能一键交给 AI 生成的时代，苹果这次给 Mac mini 拍摄宣传片，反而罕见地用了「古法手作」。</p>
<p>从草图起步，到手工雕刻微缩模型、焊接机械联动结构，镜头里那些稍纵即逝的机械变形与视觉特效，背后大多真有一个可以拿在手里的实体道具。</p>
<p><img alt="Image" src="https://s3.ifanr.com/wp-content/uploads/2026/08/lark2pad-1787795250286-19.gif" style="height: auto; border-radius: 8px;" /></p>
<p>在全行业都在为纯虚拟的 AI 生成狂热时，苹果反倒花了大量「笨功夫」打磨实体质感。这恰好就像今天芯片底层的处境一样——</p>
<p>无论上层的 AI 模型如何神乎其神，底层的硬件系统依然无法逃避最朴素的物理法则；想要数据跑得快，那些实实在在的通道、走线和晶圆工艺，终究一步都偷不了懒。</p>
<p>过去几十年，我们想尽办法让计算机<strong>算得更快</strong>；而 AI 带来的新命题，则是如何让数据<strong>跟得上它</strong>。</p>
<p>#欢迎关注爱范儿官方微信公众号：爱范儿（微信号：ifanr），更多精彩内容第一时间为您奉上。</p>