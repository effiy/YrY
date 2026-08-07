---
title: learning and development dashboard
aliases:
- L&D dashboard
- training and development dashboard
- engineering learning dashboard
- skills development dashboard
tags:
- dashboard
- learning
- development
- training
- mentorship
- skills
- career-growth
category: skill-author/patterns
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- tech-lead
- executive
- skill-author
benefit: learning and development health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- training completion, skill acquisition velocity, certification coverage, mentorship effectiveness, and learning culture defined
related:
- ./dashboard-skill-ecosystem.md
- ../../tech-lead/capacity/dashboard-engineering-capacity.md
- ../../tech-lead/capacity/dashboard-talent-retention.md
- ../../new-hire/onboarding/dashboard-onboarding-progress.md
- ../../knowledge-curator/people/dashboard-people-expertise.md
tacit: false
---

# learning and development dashboard

> **As a** tech lead, **I want to** track learning and development across the engineering organization, **so that** every engineer grows their skills, the organization builds critical capabilities, and learning is a strategic investment, not an afterthought.

> Learning is the highest-leverage investment an engineering organization can make. This dashboard tracks training completion, skill acquisition velocity, certification coverage, mentorship effectiveness, and learning culture — turning L&D from a checkbox activity into a measurable competitive advantage.

## Summary

- 5 learning & development dimensions: training completion, skill acquisition velocity, certification coverage, mentorship effectiveness, learning culture
- 285 engineers across 8 teams; $4,200/engineer/year L&D budget; 8,500 hours of learning logged in last 12 months
- 42 internal courses, 18 external programs, 12 certification tracks, 85 active mentorship pairs
- Skill acquisition measured by: pre/post assessment scores, project application rate, peer recognition, promotion velocity
- Dashboard reviewed monthly; L&D strategy review quarterly with engineering and HR leadership

## Core viewpoints

- Learning is a leading indicator of retention — engineers who are learning stay; engineers who are stagnating leave; L&D investment is retention investment
- Skill acquisition is measurable — it's not enough to "feel" like you're learning; pre/post assessments, project application, and peer recognition make learning visible
- The 70-20-10 model is real — 70% of learning comes from challenging projects, 20% from mentorship and peers, 10% from formal training; L&D strategy must address all three
- Mentorship is the highest-ROI learning intervention — 1 hour of mentor time can save 10 hours of solo struggle; mentorship programs pay for themselves many times over

## Key information

### 5-panel L&D overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TRAINING COMPLETION              │  SKILL ACQUISITION VELOCITY       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Courses: 60 total      │   │  │  Skill assessments: 850  │   │
│  │  Completed: 850 enroll  │   │  │  Pre-score avg: 62/100   │   │
│  │  Completion rate: 78%   │   │  │  Post-score avg: 82/100  │   │
│  │  Internal: 42 courses   │   │  │  Gain: +20 pts (32%)     │   │
│  │  External: 18 programs  │   │  │  Project application: 65%│   │
│  │  Hours logged: 8,500    │   │  │  Peer recognition: 42%   │   │
│  │  Avg hrs/eng: 29.8/yr   │   │  │  Promo velocity: 2.2 yr  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CERTIFICATION COVERAGE           │  MENTORSHIP EFFECTIVENESS         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Cert tracks: 12        │   │  │  Active pairs: 85        │   │
│  │  Certified: 142 (50%)   │   │  │  Mentor satisfaction:82% │   │
│  │  In progress: 48 (17%)  │   │  │  Mentee satisfaction: 78%│   │
│  │  Not started: 95 (33%)  │   │  │  Goal achievement: 72%   │   │
│  │  Cloud cert: 68 (48%)   │   │  │  Session frequency: 1.8× │   │
│  │  Security cert: 28 (20%)│   │  │  Avg duration: 6.5 months │   │
│  │  AI/ML cert: 32 (23%)   │   │  │  Career impact: 68%       │   │
│  │  Expired: 12 (8%)       │   │  │  Mentor burnout: 12%      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Training program inventory

| Program | Type | Enrollments | Completed | Completion rate | Avg rating | Hours | Cost |
|---|---|---|---|---|---|---|---|
| **Internal courses** | | | | | | | |
| Advanced TypeScript | Internal | 45 | 38 | 84% | 4.2/5 | 12 hr | $8K |
| System Design Masterclass | Internal | 52 | 42 | 81% | 4.5/5 | 16 hr | $12K |
| Go for Python Engineers | Internal | 35 | 28 | 80% | 4.0/5 | 20 hr | $10K |
| React Performance Patterns | Internal | 48 | 40 | 83% | 4.3/5 | 8 hr | $6K |
| Kubernetes Deep Dive | Internal | 38 | 30 | 79% | 4.4/5 | 24 hr | $15K |
| Prompt Engineering Workshop | Internal | 85 | 72 | 85% | 4.6/5 | 4 hr | $5K |
| Security for Engineers | Internal | 55 | 42 | 76% | 4.1/5 | 8 hr | $8K |
| Database Optimization | Internal | 32 | 25 | 78% | 4.2/5 | 12 hr | $9K |
| **External programs** | | | | | | | |
| AWS Solutions Architect | External | 28 | 18 | 64% | 4.0/5 | 40 hr | $42K |
| GCP Professional DE | External | 15 | 10 | 67% | 3.8/5 | 35 hr | $22K |
| Kubernetes CKA/CKAD | External | 20 | 12 | 60% | 4.2/5 | 50 hr | $30K |
| CISSP | External | 8 | 5 | 63% | 3.5/5 | 60 hr | $18K |
| TensorFlow Developer | External | 12 | 8 | 67% | 3.9/5 | 30 hr | $15K |
| **Overall** | | **850** | **660** | **78%** | **4.1/5** | | **$200K** |

### Skill acquisition velocity by domain

| Skill domain | Engineers assessed | Pre-score | Post-score | Gain | Project application | Peer recognition | Time to proficiency |
|---|---|---|---|---|---|---|---|
| **Cloud/Infrastructure** | 42 | 55 | 78 | +23 (42%) | 72% | 48% | 4.2 months |
| **AI/ML Engineering** | 38 | 48 | 75 | +27 (56%) | 68% | 52% | 5.5 months |
| **Frontend/React** | 55 | 62 | 82 | +20 (32%) | 78% | 58% | 3.2 months |
| **Backend/Systems** | 48 | 58 | 80 | +22 (38%) | 65% | 42% | 4.8 months |
| **Security** | 28 | 45 | 72 | +27 (60%) | 55% | 35% | 6.2 months |
| **Data Engineering** | 22 | 52 | 76 | +24 (46%) | 62% | 40% | 5.0 months |
| **Mobile** | 18 | 58 | 80 | +22 (38%) | 75% | 55% | 3.8 months |
| **Leadership/Management** | 25 | 55 | 72 | +17 (31%) | 58% | 32% | 8.5 months |
| **Overall** | **276** | **62** | **82** | **+20 (32%)** | **65%** | **42%** | **4.8 months** |

### Certification coverage

| Certification | Target engineers | Certified | In progress | Expired | Coverage % | Renewal needed |
|---|---|---|---|---|---|---|
| **AWS Solutions Architect Pro** | 35 | 22 | 5 | 2 | 63% | 4 (by 2027) |
| **AWS Developer Associate** | 30 | 18 | 4 | 1 | 60% | 2 (by 2027) |
| **GCP Professional Cloud Architect** | 15 | 8 | 3 | 0 | 53% | 1 (by 2027) |
| **Kubernetes CKA** | 25 | 12 | 5 | 2 | 48% | 3 (by 2026) |
| **Kubernetes CKAD** | 20 | 8 | 4 | 1 | 40% | 2 (by 2026) |
| **CISSP** | 10 | 5 | 2 | 0 | 50% | 1 (by 2027) |
| **AWS Security Specialty** | 12 | 4 | 3 | 0 | 33% | 0 |
| **TensorFlow Developer** | 18 | 10 | 5 | 1 | 56% | 2 (by 2027) |
| **HashiCorp Terraform Associate** | 25 | 15 | 4 | 2 | 60% | 3 (by 2026) |
| **Certified Scrum Master** | 15 | 12 | 1 | 0 | 80% | 2 (by 2027) |
| **ISTQB Test Automation** | 10 | 5 | 2 | 1 | 50% | 1 (by 2027) |
| **Confluent Kafka Developer** | 8 | 3 | 2 | 0 | 38% | 0 |
| **Overall** | **223** | **122 (55%)** | **40 (18%)** | **10 (4%)** | **55%** | **21** |

### Mentorship program health

| Metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| Active mentorship pairs | 85 | 72 | 58 | 100 | ↑ |
| Mentor pool | 52 | 45 | 38 | 60 | ↑ |
| Mentee waitlist | 18 | 25 | 32 | 0 | ↓ |
| Avg session frequency | 1.8×/month | 1.5× | 1.2× | 2×/month | ↑ |
| Avg mentorship duration | 6.5 months | 5.8 months | 4.5 months | 6-9 months | ↑ |
| Goal achievement rate | 72% | 65% | 58% | 80% | ↑ |
| Mentor satisfaction | 82/100 | 78/100 | 72/100 | > 85 | ↑ |
| Mentee satisfaction | 78/100 | 72/100 | 65/100 | > 85 | ↑ |
| Career impact (promotion/role change) | 68% | 62% | 55% | 75% | ↑ |
| Mentor burnout rate | 12% | 15% | 18% | < 10% | ↓ |

### Mentorship effectiveness by program type

| Program type | Pairs | Goal achievement | Satisfaction (mentor) | Satisfaction (mentee) | Career impact | Avg duration |
|---|---|---|---|---|---|---|
| **Technical skill mentorship** | 35 | 75% | 84/100 | 80/100 | 72% | 6 months |
| **Career growth mentorship** | 22 | 68% | 78/100 | 82/100 | 78% | 8 months |
| **Onboarding buddy** | 18 | 85% | 88/100 | 85/100 | 55% | 3 months |
| **Leadership development** | 10 | 62% | 75/100 | 72/100 | 65% | 9 months |
| **Cross-team rotation** | 8 | 58% | 72/100 | 68/100 | 58% | 4 months |
| **Overall** | **85** | **72%** | **82/100** | **78/100** | **68%** | **6.5 months** |

### Learning culture metrics

| Metric | Current | 3 months ago | 6 months ago | Benchmark (tech) | Trend |
|---|---|---|---|---|---|
| Learning hours/engineer/month | 2.5 hr | 2.2 hr | 1.8 hr | 3-5 hr | ↑ |
| Engineers with active learning goals | 68% | 62% | 55% | 75% | ↑ |
| Weekly learning time protected | 42% | 35% | 28% | 50% | ↑ |
| Conference/training attendance | 85 engineers | 72 engineers | 58 engineers | — | ↑ |
| Internal tech talks/month | 8 | 6 | 4 | 8-12 | ↑ |
| Knowledge sharing (blog posts, talks) | 45 posts/yr | 32 posts/yr | 22 posts/yr | — | ↑ |
| Learning budget utilization | 72% | 65% | 55% | 80% | ↑ |
| "I have time to learn" survey | 58/100 | 52/100 | 48/100 | 65/100 | ↑ |
| "My manager supports my growth" | 72/100 | 68/100 | 62/100 | 75/100 | ↑ |

### L&D budget allocation

| Category | Annual spend | % of L&D budget | Per engineer | ROI assessment |
|---|---|---|---|---|
| **External courses & certifications** | $200K | 33% | $702 | Skill gain +32%, certification coverage 55% |
| **Conference & event attendance** | $150K | 25% | $526 | External knowledge, recruiting brand |
| **Internal training development** | $85K | 14% | $298 | 42 internal courses, 78% completion |
| **Learning platforms (O'Reilly, Udemy, etc.)** | $65K | 11% | $228 | 8,500 hours, $7.65/hr cost |
| **Mentorship program** | $35K | 6% | $123 | 85 pairs, 72% goal achievement |
| **Books & resources** | $18K | 3% | $63 | Technical library, book clubs |
| **Leadership development** | $45K | 7% | $158 | 10 leadership mentees, 62% goal achievement |
| **Hackathon & innovation days** | $12K | 2% | $42 | 4 hackathons/yr, 28 projects |
| **Total** | **$610K** | **100%** | **$2,140/eng** | |

### Learning modality effectiveness

| Modality | Completion rate | Skill gain | Application rate | Cost/hr | Best for |
|---|---|---|---|---|---|
| **Hands-on workshop (internal)** | 82% | +24 pts | 72% | $45 | Practical skills, tooling |
| **Project-based learning** | 90% | +28 pts | 85% | $15 | Deep technical skills |
| **Online course (self-paced)** | 65% | +18 pts | 55% | $12 | Foundational knowledge |
| **Instructor-led (external)** | 72% | +22 pts | 62% | $85 | Certification prep |
| **Mentorship/coaching** | 85% | +20 pts | 68% | $25 | Career growth, leadership |
| **Peer learning (book clubs, etc.)** | 75% | +15 pts | 58% | $5 | Broad knowledge, culture |
| **Conference/event** | 55% | +12 pts | 42% | $120 | Inspiration, networking |
| **Documentation/self-study** | 45% | +10 pts | 45% | $2 | Reference, quick lookup |

### Career development pipeline

| Career stage | Engineers | Avg tenure | Promotion velocity | Learning hours/yr | Active goals | Flight risk |
|---|---|---|---|---|---|---|
| **Junior (L3-L4)** | 55 | 1.5 yr | 2.2 yr to next level | 35 hr | 78% | 12% |
| **Mid (L5-L6)** | 125 | 3.2 yr | 2.8 yr to next level | 28 hr | 65% | 18% |
| **Senior (L7-L8)** | 72 | 5.5 yr | 3.5 yr to next level | 22 hr | 52% | 22% |
| **Staff+ (L9+)** | 28 | 7.8 yr | 4.2 yr to next level | 18 hr | 38% | 25% |
| **Management** | 25 | 4.5 yr | 3.0 yr to next level | 15 hr | 45% | 20% |
| **Overall** | **285** | **3.8 yr** | **2.8 yr** | **29.8 hr** | **68%** | **18%** |

## Action recommendations

1. **Learning hours gap**: 2.5 hr/engineer/month vs 3-5 hr benchmark; implement "Learning Fridays" (Friday afternoons protected for learning), target 4 hr/month
2. **Certification coverage**: 55% overall, 33% security cert; increase certification reimbursement, add exam prep study groups, target 70% coverage
3. **Mentee waitlist**: 18 engineers waiting; recruit 10 more mentors from senior/staff engineers, launch group mentorship as interim solution
4. **Flight risk for senior engineers**: 22% senior, 25% staff+; increase L&D investment for senior+ (currently 18-22 hr/yr vs 35 hr for juniors)
5. **Leadership development**: 62% goal achievement, lowest of all programs; redesign leadership curriculum with external coach, add 360 feedback
6. **External certification completion**: 64% AWS, 60% K8s; add study groups, practice exams, and dedicated prep time for certification tracks
7. **Learning culture survey**: 58/100 "I have time to learn"; address manager support, reduce meeting load, protect learning time in sprint planning
8. **Conference knowledge sharing**: 85 engineers attended conferences; require post-conference tech talk or blog post, increase knowledge multiplier
9. **Mentor burnout**: 12% burnout rate; add mentor recognition program, limit to 2 mentees/mentor, provide mentor training and support
10. **Monthly L&D review**: review training completion, skill acquisition, mentorship health, and learning culture with engineering leadership



- Learning as a perk, not a strategy → offering a Udemy subscription and calling it an L&D program; learning must be aligned with organizational capability needs and individual career goals
- Training without application → completing a course but never applying the skill; every training program should include a project application component
- L&D budget as a cost center → cutting L&D budget first during belt-tightening; this accelerates attrition of your best engineers who value growth
- Mentorship as a checkbox → assigning mentor-mentee pairs without goals, structure, or support; mentorship without structure is just coffee chats
- Certification chasing → collecting certifications without practical application; certifications are a signal, not a substitute for demonstrated competence

## Related

- Same class: [dashboard-skill-ecosystem](dashboard-skill-ecosystem.md) — skill inventory and quality
- Same class: [dashboard-engineering-capacity](../../tech-lead/capacity/dashboard-engineering-capacity.md) — engineering capacity and headcount
- Same class: [dashboard-talent-retention](../../tech-lead/capacity/dashboard-talent-retention.md) — talent retention and engagement
- Same class: [dashboard-onboarding-progress](../../new-hire/onboarding/dashboard-onboarding-progress.md) — onboarding and ramp-up
- Same class: [dashboard-people-expertise](../../knowledge-curator/people/dashboard-people-expertise.md) — expertise distribution
- References: Josh Bersin — *The Learning and Development Maturity Model*; 70-20-10 Institute — *The 70-20-10 Model for Learning*; Google — *Project Oxygen (Manager Effectiveness)*; LinkedIn — *Workplace Learning Report*; ATD — *State of the Industry: Talent Development*