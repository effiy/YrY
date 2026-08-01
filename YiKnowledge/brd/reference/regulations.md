---
title: Regulatory Frameworks by Country & Domain
tags: [brd, reference, regulations, compliance]
category: brd/reference
created: 2026-08-01
type: reference-data
status: active
---

# Regulatory Frameworks by Country & Domain

> 按国家和业务领域的法规框架参考，供 `yry-gen-brd` skill 在 `regulatory_context` 字段生成时引用。

---

## 通用跨领域法规 (EU)

| 法规 | 全称 | 核心条款要点 | 适用领域 |
|------|------|-------------|---------|
| GDPR | General Data Protection Regulation (EU) 2016/679 | Art. 5 数据处理原则；Art. 6 合法基础；Art. 25 数据保护设计；Art. 35 DPIA；Art. 17 删除权 | **所有领域** |
| EU Data Act 2025 | Regulation on Harmonised Rules on Fair Access to and Use of Data | 互联产品数据共享义务；第三方向用户数据访问权；云切换权 | 售后、数据、IT |
| ePrivacy Directive | Directive 2002/58/EC (Cookie Law) | 电子通信隐私；Cookie 同意；直接营销 opt-out | 营销、销售 |
| DORA | Digital Operational Resilience Act (EU) 2022/2554 | ICT 风险管理；事件报告；第三方风险；渗透测试 | 安全、IT、金融 |
| NIS2 Directive | Directive (EU) 2022/2555 | 网络安全风险管理；事件通报（24h 初报）；供应链安全 | 安全、IT |
| EU AI Act | Regulation (EU) 2024/1689 | 高风险 AI 系统的合规要求；透明度义务；人工监督 | 数据、AI |
| CSRD | Corporate Sustainability Reporting Directive (EU) 2022/2464 | ESG 可持续报告强制性披露 | 财务、HR、供应链 |
| Whistleblower Directive | Directive (EU) 2019/1937 | 举报人保护；内部报告渠道 | 法律、HR |

---

## 售后与汽车行业专项法规 (EU)

| 法规 | 核心条款要点 | 对 BRD 的影响 |
|------|-------------|--------------|
| Block Exemption Regulation (EU) 461/2010 | 经销商配件来源自由；独立维修商技术信息平等获取权；保修不得以使用原厂配件为前提 | 配件数据平台需向独立维修商开放；保修政策设计受约束 |
| Type-Approval Framework (EU) 2018/858 | 车辆型式认证；市场监督；召回义务 | 召回管理系统需记录和追溯；VIN 数据库完整性 |
| Euro 7 Emissions Standard (proposed) | 更严格的尾气和制动颗粒物排放标准 | 可能影响诊断和维修程序设计 |
| General Product Safety Regulation (EU) 2023/988 | 产品安全追溯；在线市场监管 | 配件和化学品的可追溯性要求 |
| End-of-Life Vehicles Directive (ELV) | 车辆回收拆解要求；有害物质限制 | 配件回收和再制造流程合规 |

---

## 财务专项法规

| 法规 | 核心条款要点 | 适用国家 |
|------|-------------|---------|
| IFRS 15 / ASC 606 | 五步收入确认模型（合同识别→履约义务→交易价格→分摊→确认） | 全球（IFRS）/ 美国（ASC） |
| IFRS 16 / ASC 842 | 租赁确认于资产负债表；使用权资产+租赁负债 | 全球/美国 |
| German GAAP (HGB) | 谨慎原则；历史成本为主；法定准备金 | 德国 |
| EU VAT Directive 2006/112/EC | 跨境交易逆向征收；B2B 通用反向征收；Intrastat 申报 | EU |
| German E-Invoicing (2025+) | B2B 电子发票强制；XRechnung / ZUGFeRD 格式 | 德国 |
| Italian E-Invoicing (Fattura Elettronica) | B2B + B2C 全面电子发票强制 (SdI 系统) | 意大利 |
| US SOX §404 | 管理层内控评估；IT 一般控制 (ITGC) | 美国（上市公司） |

---

## 合规法规矩阵

### 按领域 — 法规适用速查表

| 领域 | GDPR | EU Data Act | ePrivacy | DORA | NIS2 | EU AI Act | 行业专项 |
|:------|:----:|:-----------:|:--------:|:----:|:----:|:---------:|:--------:|
| After-Sales | ✓ | ✓ | — | — | — | — | BER, Type-Approval, ELV |
| Sales / CRM | ✓ | — | ✓ | — | — | — | — |
| Marketing | ✓ | — | ✓ | — | — | — | — |
| Supply Chain | ✓ | ✓ | — | — | — | — | CSRD |
| Finance | ✓ | — | — | ✓ | — | — | IFRS/GAAP, SOX |
| HR | ✓ | — | — | — | — | — | 劳工法（各国不同） |
| Data / Analytics | ✓ | ✓ | — | — | — | ✓ | — |
| IT Infrastructure | ✓ | ✓ | — | ✓ | ✓ | — | — |
| Security | ✓ | ✓ | — | ✓ | ✓ | ✓ | — |
| Legal | ✓ | — | — | — | — | — | Whistleblower |

### 按国家 — 法规合规项速查表

| 国家 | 数据保护 | 电子发票 | 车检制度 | 劳工特色 | 其他 |
|:-----|:--------|:--------|:--------|:--------|:-----|
| DE | GDPR + BDSG | 2025+ 强制 | TÜV 每 2 年 | 劳资协同决策 | 环保排放标准严格 |
| FR | GDPR + LIL | 2024+ 强制 (Chorus Pro) | Contrôle Technique | 35h 工作周 | 法语强制使用 |
| UK | UK GDPR | Making Tax Digital (MTD) | MOT 每年 (3+ 年) | 较灵活 | 脱欧后独立法规 |
| IT | GDPR + Codice Privacy | 强制 (SdI) | Revisione | 裁员限制严格 | — |
| ES | GDPR + LOPDGDD | 2025+ 强制 (Verifactu) | ITV | 区域自治 | — |
| NL | GDPR + UAVG | Peppol-based | APK | 灵活 + 高兼职率 | 电动车政策领先 |
| PL | GDPR + PL DPA | 2026 KSeF 强制 | Badanie techniczne | 灵活 | — |
| CN | PIPL + DSL | 全面电子发票 | 强制年检 | 书面合同强制 | 数据境内存储 |
| JP | APPI | 合格发票制度 | 車検 2–3 年 | 长期雇佣传统 | 右舵车 |
| US | CCPA+（州级） | — | 各州不同 | At-will employment | 集体诉讼风险高 |
