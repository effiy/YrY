---
title: User Research Interview Outline Template
aliases:
- user-research-interview-template
- interview-template
tags:
- template
- user-research
- interview
- discovery
category: knowledge-curator/templates
created: 2026-07-31
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: yearly
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
benefit: template reusable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./usability-test-report.md
- ./prd.md
- ../../product-manager/discovery/ux--README.md
tacit: false
---

# User Research Interview Outline Template

> **As a** knowledge curator, **I want to** conduct user research interviews, **so that** the template is reusable.

> During product discovery and requirement research, you can use a semi-structured interview outline before the interview. Have an outline but allow for exploration; use the critical incident method to probe specific recent scenarios.

## Summary

- Six stages: warm-up → background → current workflow → pain points and expectations → solution feedback (optional) → wrap-up
- Use critical incidents: ask "what did you do last time specifically" rather than "what do you usually do"
- Do not lead, do not judge, do not explain; after asking, allow 5 seconds of silence
- Focus on the present, not the future: users' predictions of the future are inaccurate, descriptions of the present are accurate
- Sample size ≥ 15; 3+ respondents mentioning the same pain point = signal

## Template body text

```markdown
# User interview: {research topic}

**Date**: YYYY-MM-DD
**Interviewer**: {name}
**Respondent**: {role / industry / experience}
**Interview duration**: 45-60 minutes
**Research goal**: {1-2 sentences}

## 1. Warm-up and consent (5 minutes)

- Introduce the research purpose and how recordings / notes will be used
- Obtain informed consent
- Brief self-introduction + let the respondent introduce themselves

## 2. Background (5-10 minutes)

- What is your role and daily responsibility in the company?
- How frequently do you interact with {product / scenario}?
- When was the last time you used / handled {scenario}?

## 3. Current workflow (10-15 minutes)

Core questions, semi-structured probing. Use 5-Why or critical incident method:

- Please describe the full process of the last {scenario}
- Which step takes the most time?
- Which step is the most error-prone?
- Which step is the most frustrating?
- Who do you collaborate with? How does information flow?
- What tools do you use? Why that one?

## 4. Pain points and expectations (10-15 minutes)

- If you could change one thing, what would you change?
- How do you work around this problem now?
- How much cost / loss does this problem cause per year?
- Have you considered switching solutions? Why haven't you?

## 5. Solution feedback (10 minutes, optional)

Show the prototype / sketch:

- What do you notice first?
- Who do you think this is for?
- How would you use it? Walk me through it
- What feels unnecessary / redundant?
- What part do you most want to use?
- What price would you expect?

## 6. Wrap-up (5 minutes)

- Is there anything I didn't ask but you thought of?
- Would you be willing to chat again?
- Can you recommend other interviewees?

## Immediately after the interview, record

- Respondent characteristic tags (industry, role, frequency of use)
- Key insights (3-5 items)
- Findings compared to assumptions
- Next steps to verify
```

## Field explanations

| Field | Required | Spec |
|---|---|---|
| researchTarget | Yes | 1-2 sentences, measurable |
| Respondent background | Yes | Role + industry + experience |
| Current workflow | Yes | Use critical incident |
| Pain points and expectations | Yes | Do not lead, do not hint |
| Solution feedback | Optional | Only during prototype stage |

## Usage suggestions

1. **Do not lead**: Ask "how do you feel" rather than "do you think this feature is good or bad"
2. **Do not judge**: Record whatever the respondent says; do not interrupt or argue
3. **Do not explain**: If the respondent asks "how is this used", ask back "how do you think it should be used"
4. **5 seconds of silence**: After asking, wait 5 seconds; the respondent will actively supplement
5. **Specific over abstract**: Ask "what exactly did you do last time" rather than "what do you usually do"
6. **Present not future**: Users' future predictions are inaccurate; present descriptions are accurate
7. **Sample size ≥ 15**: Interview at least 15 people to cover sub-segments

### Recording and coding

- Record the entire session (with informed consent)
- Write notes immediately (do not rely on memory)
- Coding: code interview content by topic with objective markers, look for patterns
- Pattern identification: 3+ respondents mentioning the same pain point = signal

## Anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Leading question | "Don't you like X?" | Instead ask "how do you evaluate X" |
| Abstract problem | "What do you usually do" | "What exactly did you do last time" |
| Self-report only | Let users describe the process | Let users demonstrate |
| Insufficient sample | Drawing conclusions after interviewing 3 people | ≥ 15 |
| No recording | Relying on after-the-fact memory | Recording + immediate notes |

## Related

- For QA use: [usability-test-report-template.md](./usability-test-report.md)
- PRD Template: [prd.md](./prd.md)
- UX methodology: [../../product-manager/discovery/ux](../../product-manager/discovery/ux)

## References

- Steve Portigal — *Interviewing Users*
- Tomer Sharon — *Validating Product Ideas through User Research*
- Jakob Nielsen — *Why You Only Need to Test with 5 Users* (for QA use)
