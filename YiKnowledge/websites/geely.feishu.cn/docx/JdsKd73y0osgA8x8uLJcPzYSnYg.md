---
title: Docs
url: https://geely.feishu.cn/docx/JdsKd73y0osgA8x8uLJcPzYSnYg
source: YiPet
---

---
title: "Docs"
url: "https://geely.feishu.cn/docx/JdsKd73y0osgA8x8uLJcPzYSnYg"
captured_at: 2026-08-20T01:18:43.023Z
source: YiPet
---

# Docs

浙江吉利控股集团有限公司
易呈亮
【Agent】海外售后AI-BRD智能体
Drive
秘密级（L2）
Last modified: 9:49 AM August 12
Share
Editing
【Agent】海外售后AI-BRD智能体
上期内容
新版 brd-ai
前期准备
1.1 新建 brd-man Agent
1.2 使用 brd-man agent 和 brd-ai skill 进行 brd 生成
1.3 交付产出
其他参考
总结经验
待办
1. brd-ai skill 需支持问答结束后生成飞书还是其他格式--在skill里约束为可选择项 @易呈亮
2. 小智同学的知识库云端共享方案待确认 @易呈亮
3. 第三方系统的接口数据是否有开放服务 @许老师 确认
Add Cover
【Agent】海外售后AI-BRD智能体​
易呈亮
顾灿灿
Modified August 12
上期内容​
​
【SKILL】海外售后AI-BRD智能体​
新版 brd-ai​
​
​
brd-ai.zip
18.87KB
​
​
​
Code block​
Plain Text
Wrap
Copy
brd-ai/​
├── SKILL.md                     # 技能定义与访谈流程​
├── assets/​
│   └── brd-template.md          # BRD 输出模板​
├── references/​
│   ├── business-scope.md        # 业务覆盖范围定义​
│   ├── kpi-rules.md             # KPI 指标统计口径校验规则​
│   ├── mermaid-rules.md         # Mermaid 绘图规范​
│   └── qa-rules.md              # 访谈提问规范​
└── evals/​
    └── evals.json               # 评测用例​
​
前期准备​
本地知识库准备​
​
​
knowledge.zip
63.47KB
​
​
​
Code block​
Python
Wrap
Copy
knowledge/​
├── README.md                          # 本文件 - 知识库总览​
├── 01-经销商管理/                      # 经销商准入、网络、绩效​
│   ├── overview.md                    #   业务域概览​
│   ├── dealer-onboarding.md           #   经销商准入流程​
│   ├── dealer-network.md              #   经销商网络管理​
│   └── dealer-performance.md          #   经销商绩效管理​
├── 02-DMS与维修/                       # DMS 系统与维修流程​
│   ├── overview.md                    #   业务域概览​
│   ├── service-appointment.md         #   服务预约​
│   ├── repair-order.md                #   维修工单​
│   └── maintenance.md                 #   保养管理​
├── 03-备件管理/                        # 备件订单、库存、供应​
│   ├── overview.md                    #   业务域概览​
​