---
title: CAICT AI whitepaper summary
aliases:
- caict-ai-whitepaper
- caict-ai-report
- china-ai-whitepaper
- china-ai-policy
tags:
- CAICT
- China-AI
- AI-policy
- domestic-models
- compliance
category: executive/industry/reports
created: 2026-08-07
updated: 2026-08-07
source: http://www.caict.ac.cn/kxyj/qwfb/bps/
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- executive
- tech-lead
- product-manager
benefit: "executives can understand China's AI market, policy landscape, and domestic technology trends from the authoritative CAICT perspective"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./gartner-ai-hype-cycle.md
- ./mckinsey-ai-report.md
- ../market-trends/ai-market-trend-first-half.md
- ../competitors/llm-vendor-landscape.md
tacit: false
---

# CAICT AI whitepaper summary

> **As an** executive, **I want to** understand the CAICT AI whitepaper findings on China's AI market, policy, and technology trends, **so that** I can align our China market strategy with regulatory requirements and domestic ecosystem dynamics.

> The China Academy of Information and Communications Technology (CAICT) publishes the most authoritative annual whitepapers on China's AI industry. These reports cover market size, technology development, policy evolution, and industry application, providing the definitive view of AI from China's policy and regulatory perspective.

## Summary

- China's AI market is estimated at 600-800 billion RMB in 2025, growing at 20-25% CAGR, with the large model and generative AI segments growing fastest at 50%+.
- CAICT identifies three strategic priorities: foundational model self-reliance, AI application in traditional industries (manufacturing, healthcare, finance), and AI governance.
- China's AI policy framework is maturing rapidly: the Interim Measures for Generative AI Services (2023), the AI Law (draft, expected 2026-2027), and sector-specific regulations are creating a structured compliance environment.
- Domestic large models (DeepSeek, Qwen, GLM, Baichuan) are closing the gap with global leaders, reaching 80-90% of GPT-4 class performance on Chinese-language tasks.
- CAICT emphasizes "trustworthy AI" as a core principle: security, fairness, explainability, and controllability are mandatory for AI deployment in China.

## Core viewpoints

### 1. Self-reliance in foundational AI technology is a national strategic priority

CAICT whitepapers consistently frame AI capability as a matter of technological sovereignty. The goal is not just to match global capabilities but to build an independent AI stack: domestic chips (Huawei Ascend, Cambricon), domestic frameworks (PaddlePaddle, MindSpore), and domestic models (DeepSeek, Qwen, GLM). This drives government procurement preferences, research funding, and regulatory requirements that favor domestic technology.

### 2. AI governance in China is moving from principle to implementation

The 2023 Interim Measures for Generative AI Services were the first step, requiring security assessments, content moderation, and algorithm filing. The draft AI Law (expected 2026-2027) will create a comprehensive legal framework covering: training data compliance, model evaluation and certification, deployment obligations, and liability allocation. Organizations deploying AI in China must prepare for a structured compliance regime, not just a principle-based framework.

### 3. Industry application is the primary growth driver, not foundational research

CAICT emphasizes the "AI + industry" paradigm: applying AI to manufacturing (predictive maintenance, quality inspection), healthcare (medical imaging, drug discovery), finance (risk assessment, fraud detection), and government (smart city, public services). The value is in vertical application, not horizontal platform. This is distinct from the US market, where horizontal platform plays (foundational models, AI APIs) dominate.

### 4. China's AI market has structural differences from the global market

The China AI market is characterized by: (1) government as a major buyer (smart city, public services), (2) manufacturing as the largest industry vertical (not technology/services), (3) mobile-first user behavior (WeChat ecosystem, mini-programs), and (4) data localization requirements that limit cross-border data flows. A global AI product cannot simply be translated for China; it must be fundamentally adapted.

## Key info

### China AI market size and growth

| Segment | 2024 Market size (RMB) | 2025 Estimated | CAGR 2024-2028 | Key drivers |
|---|---|---|---|---|
| AI total market | 500-600B | 600-800B | 20-25% | Government investment, enterprise digitalization |
| Large models and GenAI | 50-80B | 100-150B | 50-60% | Foundation model development, enterprise adoption |
| AI chips | 30-50B | 50-80B | 30-40% | Domestic substitution, export controls |
| AI applications | 300-400B | 400-500B | 15-20% | Industry digitalization, smart city |
| AI cloud services | 100-150B | 150-200B | 25-30% | Model-as-a-Service, AI PaaS |

### Policy and regulatory timeline

| Year | Policy/Regulation | Key requirements |
|---|---|---|
| 2017 | New Generation AI Development Plan | National AI strategy, 2030 goals |
| 2022 | Internet Information Service Algorithmic Recommendation Regulation | Algorithm filing, user opt-out |
| 2023 | Interim Measures for Generative AI Services | Security assessment, content moderation, training data compliance |
| 2024 | AI Safety Governance Framework | Risk classification, red-teaming, human oversight |
| 2025 | Sector-specific AI regulations (finance, healthcare, education) | Industry-specific compliance requirements |
| 2026-2027 | AI Law (draft) | Comprehensive legal framework for AI |

### Domestic model landscape

| Model | Developer | Parameters | Strengths | Availability |
|---|---|---|---|---|
| DeepSeek V3 | DeepSeek | 671B (MoE) | Coding, reasoning, cost efficiency | Open-source, API |
| Qwen3 | Alibaba | Various (0.5B-72B) | Multilingual, multimodal, broad ecosystem | Open-source, API |
| GLM-4 | Zhipu AI | Various (9B-130B) | Chinese language, enterprise features | Open-source, API, private deployment |
| Baichuan 4 | Baichuan | Various | Chinese language, domain-specific variants | API, private deployment |
| Kimi | Moonshot AI | Proprietary | Long context (2M tokens), document analysis | API |
| Ernie 5.0 | Baidu | Proprietary | Deep Baidu ecosystem integration | API, cloud |

### Key compliance requirements for AI deployment in China

1. **Algorithm filing**: Register algorithmic recommendation and generative AI services with the Cyberspace Administration.
2. **Security assessment**: Conduct security assessments for generative AI services with "public opinion attributes or social mobilization capabilities."
3. **Content moderation**: Implement real-time content filtering for politically sensitive, violent, pornographic, and fraudulent content.
4. **Training data compliance**: Ensure training data is legally sourced, respects IP rights, and does not contain prohibited content.
5. **Data localization**: Personal data and important data must be stored within China; cross-border transfer requires security assessment.
6. **User identification**: Real-name verification for users of generative AI services.
7. **Transparency**: Disclose the AI nature of the service and provide mechanisms for user feedback and complaints.

## Action recommendations

1. Track CAICT annual whitepapers (typically published mid-year) as the authoritative source for China AI policy and market trends.
2. For AI products deployed in China, begin compliance preparation early: algorithm filing, security assessment, and content moderation are not optional.
3. Evaluate domestic model integration (DeepSeek, Qwen, GLM) as an alternative or complement to global models for China deployments.
4. Adapt AI products for China market structure: government buyers, manufacturing vertical, WeChat ecosystem integration, and mobile-first UX.
5. Monitor the draft AI Law for liability allocation, model certification requirements, and deployment obligations.
6. Prepare for data localization: architect systems so that China data stays in China, with clear separation from global data flows.

## Anti-patterns

- **Translating global AI products for China without adaptation** -- the China market has different buyers, verticals, platforms, and compliance requirements. Translation is not localization.
- **Ignoring compliance until product completion** -- algorithm filing and security assessment can take 3-6 months. Late compliance work delays launch.
- **Using global AI models for China data without data localization** -- sending China user data to global model APIs violates data localization requirements.
- **Assuming global market analysis applies to China** -- CAICT data shows different growth rates, vendor dynamics, and buyer priorities than global reports.
- **Treating China AI policy as static** -- the regulatory environment is evolving rapidly. Annual CAICT whitepaper review is the minimum.

## Related

- Same category: [./gartner-ai-hype-cycle.md](./gartner-ai-hype-cycle.md) -- Gartner AI Hype Cycle
- Same category: [./mckinsey-ai-report.md](./mckinsey-ai-report.md) -- McKinsey AI report
- Same category: [../market-trends/ai-market-trend-first-half.md](../market-trends/ai-market-trend-first-half.md) -- 2026 H1 market trends
- Upstream: [../competitors/llm-vendor-landscape.md](../competitors/llm-vendor-landscape.md) -- LLM vendor landscape
- Downstream: [../../../engineer/infrastructure/data-compliance.md](../../../engineer/infrastructure/data-compliance.md) -- data compliance

## References

- CAICT -- AI Whitepaper (annual): http://www.caict.ac.cn/kxyj/qwfb/bps/
- CAICT -- Large Model Industry Map (annual)
- Cyberspace Administration of China -- Interim Measures for Generative AI Services (2023)
- China AI Law (draft) -- expected 2026-2027