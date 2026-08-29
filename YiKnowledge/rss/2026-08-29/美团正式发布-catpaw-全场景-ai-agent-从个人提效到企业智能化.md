---
title: 美团正式发布 CatPaw：全场景 AI Agent，从个人提效到企业智能化
tags:
- 美团技术团队
category: engineer/lessons
created: '2026-08-29'
source: https://tech.meituan.com/2026/07/28/CatPaw-LongCat.html
type: rss
source_name: 美团技术团队
source_url: https://tech.meituan.com/feed/
---

<p>本月，美团 LongCat 2.0 已<a href="https://tech.meituan.com/2026/07/12/LongCat-2.0-Open-source.html" rel="noopener noreferrer" target="_blank">正式开源</a>，总参数 1.6T，平均激活约 48B，动态范围 33B 到 56B，原生支持 1M 超长上下文。这是首个在五万张国产算力卡上完成全流程训练与推理的万亿参数模型。开源只是第一步，让 LongCat 2.0 在真实的工作任务中成为可靠的“工作伙伴”，才是真正的考验。</p>
<p>现在，搭载 LongCat 2.0 的美团全场景 AI Agent 平台 <a href="https://catpaw.meituan.com/" rel="noopener noreferrer" target="_blank">CatPaw</a> 正式上线，将模型能力从“跑得动”推向“用得好”。CatPaw 提供开箱即用的 AI 智能工作台与企业级 Agent 开发托管能力。</p>
<p>不仅如此，依托美团十余年深耕本地生活的行业积累，CatPaw 将商家经营、服务履约与消费决策的深度认知融入其中，助力企业构建 AI 数字员工、推进业务智能化升级。</p>
<p>目前，CatPaw 已在美团内部大规模落地：累计覆盖 9 万员工、搭建 Agent 3 万个，并在多个真实业务场景中完成验证。</p>
<h2>全时段运行，多终端协作的 AI 智能工作台</h2>
<h3>01 移动/PC/云端，全时段多端协作</h3>
<p>提供独立的<strong>移动端 App 与 PC 客户端</strong>，双端任务实时同步、无缝协作。移动端支持随时发起任务、查看进度与远程确认关键决策；PC 端专注本地深度执行，具备文件操作、浏览器控制与终端命令等完整能力。</p>
<p>云端模式支持 <strong>7 × 24 小时不间断运行</strong>，即使本地设备关机或断网也不受影响。长程任务与定时任务于云端持续运转，完成后随时打开手机或电脑即可查看成果。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/a690ba49597fd8720f96ea56573b54cc151290.png" /></p>
<h3>02 深耕本地生活，融合美团业务生态</h3>
<p>在全场景通用 AI Agent 能力的基础上，CatPaw 进一步融入了美团在本地生活领域的全链路行业认知。从门店经营、评价体系、营销转化到履约配送，这些深度积累已被封装为即装即用的<strong>专家与技能</strong>，覆盖门店评价诊断与优化、商品文案生成、营销物料设计评估、活动策划、经营数据分析等场景。</p>
<p>CatPaw 既是人人可用的<strong>全能 AI 助手</strong>，也是真正懂本地生活生意的智能搭档。</p>
<p><img alt="" src="https://p1.meituan.net/meituantechblog/864f86011bdcc6a2428f980323605284136476.png" /></p>
<h3>03 专家与技能，丰富能力即装即用</h3>
<p>CatPaw <strong>支持 AI 专家</strong>，每位专家<strong>集成多项技能与子代理，高效完成特定领域的复杂任务</strong>。从专家广场<strong>一键安装</strong>即可使用，也可通过对话将自己的工作方式快速封装为专属专家，团队共享复用。</p>
<p>平台内置丰富的技能库，开箱即用。内嵌浏览器还<strong>支持操作过程一键录制</strong>，将日常高频流程自动生成专属技能，让个人与团队经验沉淀为可复用的数字化资产。</p>
<p>支持<strong>跨会话长期记忆</strong>，自动记忆用户的个性化偏好、操作习惯与历史上下文，跨设备、跨对话保持连续理解，越用越懂你。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/7f715c1d858cead54dad86e431e30153313940.png" /></p>
<h3>04 对话即交付，多 Agent 自主协同</h3>
<p>只需明确最终目标，Agent 便会<strong>自主规划步骤并在授权范围内深度执行</strong>：读取文件、操作浏览器、运行终端命令，直接交付 Excel、可视化报告或代码等可用成果。</p>
<p>面对跨领域的复杂任务，系统动态进行任务拆解，<strong>调度多个具备专属工具的 Agent 并发处理</strong>，各 Agent 在独立环境中互不干扰，进度实时可见，结果自动汇总。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/2122a550b13a060033f2a0343680ccfa345379.png" /></p>
<h2>从 AI 工作台到业务系统：Managed Agents</h2>
<p>CatPaw Managed Agents 是企业级 AI Agent 开发与托管平台，提供开箱即用的工程底座，<strong>无需从零搭建底层基建</strong>，即可快速构建、部署与管理专属 Agent。</p>
<h3>01 数字员工，扫码即用灵活配置</h3>
<p>数字员工是运行在飞书、企微等 IM 中的 AI 虚拟同事，@ 即可唤醒使用。<strong>平台预置多种角色模板，扫码即用</strong>；美团在本地生活领域的长期积累也已沉淀为专属模板，不只是通用的聊天机器人，而是理解业务的行业 AI 助手。</p>
<p>同时支持通过 <strong>AI 对话描述需求，快速生成专属数字员工</strong>。从 Agent 创建到环境部署、会话初始化，<strong>全程自动完成，无需手动配置</strong>。</p>
<p>提示词、知识库、凭证、工具均支持在线管理，团队可按业务场景灵活搭建。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/a4a4286eab88dc7a9fb8ad4a359f57d3202455.png" /></p>
<h3>02 企业级安全，数据隔离可控</h3>
<p><strong>Agent 运行环境严格隔离</strong>，租户间数据互不可见。凭证集中托管，<strong>确保 Agent 全程零接触敏感资产</strong>。</p>
<p>支持<strong>分级权限管控</strong>与私有化部署，全面满足企业合规与安全审计要求。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/d8ea3582939d36764915e7b5f848790e478278.png" /></p>
<h3>03 Agent 托管运行，持续在线</h3>
<p>支持<strong>按需配置运行环境</strong>，一键托管上线，<strong>资源动态扩缩</strong>。</p>
<p>沙箱环境轻量隔离，百毫秒级冷启动，闲时自动释放，兼顾响应速度与成本。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/1c65c6d75279f7085030ad763eeff3b2368282.png" /></p>
<h3>04 可视化运维，全链路可观测</h3>
<p>提供统一的运维管理界面，<strong>会话记录完整留存可追溯</strong>，支持在线调试实时排查问题，<strong>模型调用量与消耗清晰可见</strong>。</p>
<p>多维度数据统计与分析，帮助团队持续评估 Agent 表现、优化运行效果。</p>
<p><img alt="" src="https://p0.meituan.net/meituantechblog/4344c5e90e47733d89ef9ee3d792f88f140185.png" /></p>
<h2>从个人提效到组织智能化：与商家一起探索更多可能</h2>
<p>在全场景 AI 能力之上，CatPaw 提供<strong>组织级的管理与管控能力</strong>，满足商家**规模化落地 AI **的管理需求。</p>
<p>CatPaw 提供统一管理后台，支持团队账号体系。团队成员与权限集中管理，用量明细与消耗实时可查，成本清晰可控。AI 专家和技能支持按团队或角色集中配置与精准下发，一线员工开箱即用，AI 能力快速转化为实际生产力。</p>
<p>此外，CatPaw 还提供与<strong>美团业态深度关联的专属专家与技能</strong>，覆盖外卖、服务零售、医药健康等多个行业。以服务零售为例，美团商家运营专家整合了经营数据分析、评价管理、门店装修等核心场景，帮助商家实现智能化运营。</p>
<p>CatPaw 将持续深入行业场景，让 AI Agent <strong>真正成为驱动经营增长的数字化伙伴</strong>。更多能力陆续开放中，<strong>诚邀美团合作商家抢先体验</strong>。</p>
<p><strong>体验地址</strong>：<a href="https://catpaw.meituan.com/" rel="noopener noreferrer" target="_blank">https://catpaw.meituan.com/</a></p>