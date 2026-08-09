---
lifecycle: active
title: BRD Template
status: stable
type: template
category: knowledge-curator/templates
tags:
  - template
  - brd
  - business-requirements
  - knowledge-curator
created: 2026-08-07
updated: 2026-08-07
source: internal
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
review_cycle: quarterly
tacit: false
related:
  - ./INDEX-resources.md
  - ./README-resources.md
  - ./README-templates.md
  - ../README.md
  - ../INDEX.md
---

# BRD template / Business Requirements Document Template

> **As a** knowledge curator, **I want to** brd, **so that** template reusable.

**BRD template / BRD Template** Version: 1.0 \| Status: Draft

---

## Document Information

|**Field**|**Content**|**Field**|**Content**|
|---|---|---|---|
|BRD Number|BRD-[Year]-[Serial]|Created Date|YYYY-MM-DD|
|Business Owner|[Name]|Country|[Country Name]|
|Brand|xxx / xxx|Domain|[Domain]|
|Priority|P0/P1/P2/P3|Expected Go-Live|YYYY-MM-DD|

---

## 1. Business Background and Objectives

### 1.1 Business Background

[Describe the current business status, existing problems or opportunities. Explain why this requirement is needed.]

**Current Status:**

- [Status description 1]

- [Status description 2]

**Problem/Opportunity:**

- [Problem or opportunity description]

### 1.2 Business Objectives

[Clearly state the business objectives to be achieved through this requirement, quantify where possible.]

|Objective|Metric|Target Value|
|---|---|---|
|[Objective 1]|[Metric 1]|[Target 1]|
|[Objective 2]|[Metric 2]|[Target 2]|

---

## 2. Business Scenario Description

### 2.1 Core Users

[Identify the main user roles involved in this requirement.]

|User Role|Description|Usage Frequency|
|---|---|---|
|[Role 1]|[Role description]|Daily/Weekly/Monthly/On-demand|
|[Role 2]<br>|[Role description]|Daily/Weekly/Monthly/On-demand|

### 2.2 Business Scenarios

[Describe business scenarios in detail, including user operation flows and business logic.]

**Scenario 1: [Scenario Name]**

- **Trigger**: [When does this scenario trigger]

- **Prerequisites**: [Prerequisites that must be met]

- **Operation Flow**:

    1. [Step 1]

    2. [Step 2]

    3. [Step 3]

- **Expected Result**: [Expected result after scenario completion]

**Scenario 2: [Scenario Name]**

- **Trigger**: [When does this scenario trigger]

- **Prerequisites**: [Prerequisites that must be met]

- **Operation Flow**:

    1. [Step 1]

    2. [Step 2]

- **Expected Result**: [Expected result after scenario completion]

---

## 3. Involved Countries/Domains/System Modules

### 3.1 Involved Countries

[List the countries or regions affected by this requirement.]

|Country/Region|Brand|Impact Scope|
|---|---|---|
|[Country]|[Brand]|All / Partial|

### 3.2 Involved System Modules

[List the system modules affected by this requirement.]

|System Module|Impact Description|
|---|---|
|[Module 1]|[Impact description]|
|[Module 2]|[Impact description]|

---

## 4. Business Rules and Constraints

### 4.1 Business Rules

[Describe business rules in detail, including data validation, process control, permission requirements, etc.]

|Rule ID|Rule Description|Priority|
|---|---|---|
|BR-001|[Rule description]|Must / Should / Could|
|BR-002|[Rule description]|Must / Should / Could|
|BR-003|[Rule description]|Must / Should / Could|

### 4.2 Constraints

[Describe constraints during implementation, such as technical limitations, compliance requirements, performance requirements, etc.]

**Compliance Requirements**:

- [Compliance requirement 1]

- [Compliance requirement 2]

**Technical Constraints:**

- [Technical constraint 1]

- [Technical constraint 2]

**Performance Requirements:**

- [Performance requirement 1]

- [Performance requirement 2]

---

## 5. Expected Delivery Timeline

### 5.1 Milestone Plan

[List key milestones and expected completion dates.]

|Milestone|Expected Date|Status|
|---|---|---|
|BRD Review Approved|YYYY-MM-DD|Pending Review|
|PRD Output|YYYY-MM-DD|Not Started|
|Development Complete|YYYY-MM-DD|Not Started|
|UAT Acceptance|YYYY-MM-DD|Not Started|
|Go-Live|YYYY-MM-DD|Not Started|

### 5.2 Urgency Level

[Explain the urgency level and impact of this requirement.]

**Urgency**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)

**Impact Description**:

- [What is the impact if not delivered on time]

---

## 6. Acceptance Criteria

### 6.1 Functional Acceptance

[List functional-level acceptance criteria.]

|Acceptance Item|Acceptance Criteria|Priority|
|---|---|---|
|AC-001|[Acceptance criteria description]|Must / Should|
|AC-002|[Acceptance criteria description]|Must / Should|
|AC-003|[Acceptance criteria description]|Must / Should|

### 6.2 Data Acceptance

[List data-level acceptance criteria, such as report accuracy, data integrity, etc.]

* [ ] [Data acceptance item 1]

* [ ] [Data acceptance item 2]

### 6.3 Business Objective Achievement

[Describe how to verify if business objectives are achieved.]

|Business Objective|Verification Method|Success Criteria|
|---|---|---|
|[Objective 1]|[Verification method]|[Success criteria]|
|[Objective 2]|[Verification method]|[Success criteria]|

---

## 7. Attachments

[If there are relevant attachments (flowcharts, prototypes, reference documents, etc.), please list them here.]

* [ ] Business Process Flowchart: [Link]

* [ ] Prototype Design: [Link]

* [ ] Reference Documents: [Link]

---

## Approval Records

|**Approval Role**|**Approver**|**Approval Date**|**Comments**|
|---|---|---|---|
|Business Owner|[Name]|YYYY-MM-DD|Approved / Rejected|
|EU HUB ITBP|xxx / xxx xxx / xxx|YYYY-MM-DD|Approved / Rejected|
|RSC Business|[Name]|YYYY-MM-DD|Approved / Rejected|
|HQ Counterpart|[Name]|YYYY-MM-DD|Approved / Rejected|

---

**Usage Instructions**:

1. Business Owner fills out this template

2. Submit to NSC ITBP for registration

3. Follow requirements management process for review

4. After approval, proceed to PRD phase


