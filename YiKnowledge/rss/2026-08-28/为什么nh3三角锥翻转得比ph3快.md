---
title: 为什么NH3三角锥翻转得比PH3快?
tags:
- 知乎日报
category: life/lifestyle
created: '2026-08-29'
source: https://daily.zhihu.com/story/9792230
type: rss
source_name: 知乎日报
source_url: https://rsshub.rssforever.com/zhihu/daily
published: Fri, 28 Aug 2026 23:00:00 GMT
---

<div class="main-wrap content-wrap">
<div class="headline">

<div class="img-place-holder"></div>



</div>

<div class="content-inner">




<div class="question">
<h2 class="question-title"></h2>

<div class="answer">

<div class="meta">
<img class="avatar" src="https://pic1.zhimg.com/v2-06533a3de871558e8ab6b7e3b5ea9994_l.jpg?source=8673f162" />
<span class="author">Bright Summer，</span><span class="bio">徜徉于自然科学之海</span>
<a class="originUrl" hidden="" href="https://www.zhihu.com/question/476076036/answer/2029359297">查看知乎原文</a>
</div>

<div class="content">
<p>这是一个好问题，涉及到分子结构理论最基本的一些东西。下面我们将用两大定性模型——<strong>价键理论（VB）</strong>和<strong>分子轨道理论（MO）</strong>解答这一问题。</p>
<p><strong>Part 1: 有关实验事实</strong></p>
<p>在进入分析和解答之前，我们先看看支持题主所述这一结论的实验事实。</p>
<p>显然 PR3 和 NR3 通常都是三角锥构型的：</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-2e57ab0f5a3ce40808949a56759f0e54_720w.jpg?source=8673f162" /><figcaption>NH3 的三角锥构型</figcaption></figure>
<p>其中心原子还含有一对孤对电子，占据四面体的一个顶点，因此分子呈三角锥型。</p>
<p>如果将孤对电子也视作一个取代基，那么该模型就可以看作类似碳四面体的结构。我们知道，四个取代基不同的碳原子具有手性，那么，三个取代基不同的 N 和 P 应当同样有手性。对于磷来说，确实是这样；但是对于氮来说，一般情况下并无手性，因为常温下<strong>NR3 会经过如下的快速翻转而很快消旋</strong>：</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-3f6df7961aef4b5a42d9cf8f9789e67f_720w.jpg?source=8673f162" /></figure>
<p>而对于磷来说，翻转十分困难，因此一般认为三不同取代的磷是具有手性的。</p>
<p>具体来说，对于含一对孤对电子的三角锥型分子 ER3，它的翻转过程先经历一个平面型的 sp2 杂化过渡态，然后再转换为另一角锥型。</p>
<figure><img alt="" class="content-image" src="https://pic1.zhimg.com/v2-5bf008329c33e30227c450fbebd884af_720w.jpg?source=8673f162" /></figure>
<p>活化能即为平面型与角锥型的能量差，随着 E 和 R 的不同而不同。</p>
<figure><img alt="" class="content-image" src="https://pic1.zhimg.com/v2-67e7e83213122c50584e9ed56dcbf1f1_720w.jpg?source=8673f162" /></figure>
<p>由上表可以看出，R 相同时，<strong>N 翻转所需活化能远低于 P</strong>，因此 NR3 翻转很快而 PR3 几乎不能翻转。但显然这并没有实际解答这一问题，我们需要弄清 N 和 P 究竟差别在哪里。下面将对这一现象给出解释。</p>
<p><strong>Part 2: 价键理论角度的定性解释</strong></p>
<p>对于 NR3 的成键，运用经典的 VSEPR 理论和杂化轨道模型，可以判断 N 采用 sp3 杂化。但事实上，<strong>四个杂化轨道的成分并不是全同的 sp3</strong>（25%s+75%p)。由于孤对电子完全归氮所有，但键合电子只有一定系数为 N 所贡献（类似于ψBO=c1ψ1+c2ψ2），考虑到 s 轨道能量更低，因此，N 在杂化时将分给孤对电子更多的 s 轨道以降低能量，成键则分给更多的 p 轨道。所以，N 的各个杂化轨道均略有偏离 sp3。由于 p 轨道成分越大键角越小，因此 R-N-R 键角要略小于 109.5°。</p>
<p>下面是 NH3 的键参数以验证上面的定性分析。</p>
<figure><img alt="" class="content-image" src="https://pic1.zhimg.com/v2-ad06f0281b8648333ef3ab4670f0b574_720w.jpg?source=8673f162" /></figure>
<blockquote>另一种解释是孤对电子排斥力大于键合电子导致键角减小。这两种解释方式是几近等价的。</blockquote>
<p>事实上，我们还可以扩展这种解释方法，也就是<strong>Bent's rule</strong>。对于电负性较大的原子和中心原子成的键，键合电子会更加偏向高电负性原子而远离中心原子，因此中心原子只需要拿出较少的 s 成分进行杂化。对于 NH3，N 电负性远大于 H，因此键合电子很靠近 N，就比孤对电子差那么一点，因此键角偏差并不大。对于 PH3 则不然，P 的电负性小于 H，键合电子更偏向于 H，P 贡献系数很小，因此 P 进行成键采用较多的 p 成分，键角非常小。另外，<strong>N 的 2s、2p 轨道尺寸相近，但 P 的 3p 轨道要比 3s 大很多</strong>，因此 3s 与 H 的 1s 轨道重叠得并不好，从这个角度来说 P 也将采取 s 轨道成分少的杂化方式成键。</p>
<p>PH3 的键参数如下：</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-d9729b2a38afd6a208950baacca2f417_720w.jpg?source=8673f162" /></figure>
<p>键角都已经接近直角（也就是 p 轨道之间的夹角）了，可见<strong>P 甚至已经几乎不杂化了</strong>，成键 p 轨道成分太高了。</p>
<p>但无论如何，对于平面型的过渡态，任何一种中心原子都必须采用 sp2 杂化。因此，相较于本来还有 25%s 成分成键的 N，角锥型几乎完全采用 p 轨道成键的 PH3 的 sp2 平面型与稳定角锥型的差距肯定要更大，所以 PH3 翻转的活化能要更高。</p>
<p><strong>Part 3: 分子轨道理论角度的定性解释</strong></p>
<p>分子轨道理论处理 AXn 型分子的核心是用 A 的原子轨道和 n 个 X 组成的群轨道线性组合形成分子轨道。</p>
<p>现在来考察平面型转化为角锥型的分子轨道能级变化，这由<strong>Walsh 图</strong>所揭示。</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-612a87fee7e4fd5e8f58472495e47b97_720w.jpg?source=8673f162" /></figure>
<p>上图是 PH3 的 Walsh 图解，左侧是平面型的分子轨道能级，右侧是角锥型的。注意 e 对称性轨道能级为二重简并。</p>
<p>运用前线轨道的思想，我们只需要考察过程前后 HOMO 能级的变化。下面将平面型与角锥型的 HOMO 与 LUMO 单独取出：</p>
<figure><img alt="" class="content-image" src="https://pica.zhimg.com/v2-5856755f5ce1f78a28974183af534d3b_720w.jpg?source=8673f162" /></figure>
<p>可以发现，HOMO 能级的能量变化反映了活化能的高低。不难看出，角锥型 HOMO——2a1 轨道可以视为平面型 2a1’和 a2"的线性组合。正<strong>类似</strong>于两个原子轨道组合成成键、反键分子轨道，平面型 2a1’和 a2"可以组合为角锥型 2a1「成键」和 3a1「反键」。这样，根据分子轨道理论的基本原理，当平面型 2a1’和 a2"能量相近（即图中所示 delta e 较小）时，就类似于「成键」效率更高，也就意味着 2a1 能量比 a2’’降低得更多，反应的活化能越高。</p>
<p>观察图形可知，2a1’为 s 轨道与群轨道的反键轨道，由于 P 的 s 轨道与 H 重叠性差，显然 2a1’能量比 N 低。a2’’为 p 轨道孤对电子，显然 P 的 3p 轨道能量要高于 N 的 2p 轨道，P 的 a2’’能量比 N 高。综合起来，delta e 值 P 要比 N 小，翻转活化能比 N 高。</p>
<p><strong>Part 4: 其它影响翻转能垒的因素</strong></p>
<p>显然平面型 sp2 过渡态的相对稳定程度影响着翻转的能垒。由于空间效应和电子效应的影响，配体不同，相应的能垒也不同。</p>
<p><strong><em>空间效应</em></strong></p>
<p>由于角锥型下配体分布比平面型要拥挤，因此配体体积越大，越有利于平面型的稳定。</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-65efc13138dd5b0c546927b51398aefc_720w.jpg?source=8673f162" /></figure>
<p>由于平面型键角为 120°，大于角锥型键角的 109.5°，因此如果配体与中心原子形成三元环，平面型角张力会增大，能垒升高。</p>
<figure><img alt="" class="content-image" src="https://pic1.zhimg.com/v2-df45af6e4a29e3607b15cbe03584d526_720w.jpg?source=8673f162" /></figure>
<p>配体中若有孤对电子，则会和平面型中中心原子的孤对电子产生排斥，能垒升高。</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-ce8516786ac4b7bc53c08b806df35342_720w.jpg?source=8673f162" /></figure>
<p><strong><em>电子效应</em></strong></p>
<p>如果平面型中中心原子的孤对电子能与配体共轭，离域到配体中，显然是极好的稳定效应，有助于能垒降低。</p>
<figure><img alt="" class="content-image" src="https://picx.zhimg.com/v2-2c800585a41d49c1e46976c334259387_720w.jpg?source=8673f162" /></figure>
<p>如果配体电负性更大，显然会导致配体占的 p 轨道成分与 s 轨道成分之比更大，会导致能垒升高。</p>
<figure><img alt="" class="content-image" src="https://pic1.zhimg.com/v2-645e3cbd97950d0986e0c46a6d5cad2e_720w.jpg?source=8673f162" /></figure>
<blockquote>Reference：<br />Montgomery, C. D., <em>J. Chem. Educ.</em> 2013, 90, 5, 661–664.<br />Gilheany, D. G., <em>Chem. Rev.</em> 1994, 94, 1339-1374.<br />Albright, T. A. &amp; Burdett, J. K. &amp; Whangbo, M., (2013). Orbital interactions in chemistry. New Jersey: Hoboken.</blockquote>
</div>
</div>


<div class="view-more"><a href="https://www.zhihu.com/question/476076036">查看知乎讨论<span class="js-question-holder"></span></a></div>

</div>


</div>
</div>