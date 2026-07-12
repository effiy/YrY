# Architecture Diagram — Quality Rubric

> Self-assessment criteria for evaluating generated diagrams. Apply this rubric before delivering any `architecture-diagram.html` artifact.

## Scoring Dimensions

Each dimension is scored 0–4. A production-ready diagram should score ≥ 3 on all dimensions.

---

## 1. Completeness (0–4)

| Score | Criterion |
|-------|-----------|
| 4 | All major system components, data stores, external services, security boundaries, and infrastructure elements are represented. No obvious omissions. |
| 3 | One minor component or connection is missing but does not affect overall understanding. |
| 2 | Two or more significant components are missing; the diagram gives an incomplete picture of the system. |
| 1 | Major architectural layers are absent (e.g., no database shown, no authentication flow). |
| 0 | Diagram is skeletal — only 2-3 components shown for what should be a complex system. |

### Completeness Checklist

- [ ] Entry points (CDN, load balancer, API gateway) shown
- [ ] Core backend services represented
- [ ] Data stores (databases, caches, queues) included
- [ ] Authentication/authorization flow visible
- [ ] External/third-party service integrations shown
- [ ] Infrastructure components (CI/CD, monitoring, logging) present
- [ ] Security boundaries (VPCs, security groups, WAF) drawn where applicable
- [ ] All inter-component connections have arrows

---

## 2. Accuracy (0–4)

| Score | Criterion |
|-------|-----------|
| 4 | All component roles, relationships, protocols, and data flow directions are correct. Arrows accurately represent actual system behavior. |
| 3 | One minor inaccuracy in a label or arrow direction that does not mislead. |
| 2 | A protocol label or connection type is incorrect (e.g., REST labeled where gRPC is used). |
| 1 | Multiple flow directions are reversed or component responsibilities are misattributed. |
| 0 | The diagram fundamentally misrepresents the system architecture. |

### Accuracy Checklist

- [ ] Arrow directions match actual data/request flow
- [ ] Protocol labels are correct (REST, gRPC, GraphQL, WSS, SMTP)
- [ ] Auth flow correctly labeled (JWT, OAuth2, OIDC, mTLS)
- [ ] Component colors match their actual type (frontend ≠ backend ≠ database)
- [ ] Cloud service names match actual AWS/GCP/Azure service names
- [ ] Port numbers and endpoints are accurate where specified
- [ ] Async vs sync communication correctly distinguished

---

## 3. Clarity (0–4)

| Score | Criterion |
|-------|-----------|
| 4 | Layout is logical and intuitive. Flow direction is consistent. No overlapping components. Labels are readable and unambiguous. |
| 3 | Minor crowding in one area or one ambiguous label. Still easily understood. |
| 2 | Several components are crowded or the flow direction is inconsistent. Reader needs effort to trace connections. |
| 1 | Significant overlap, confusing layout, or illegible labels. Diagram is hard to follow. |
| 0 | Diagram is chaotic — components randomly placed, connections impossible to trace. |

### Clarity Checklist

- [ ] Flow direction is consistent (left→right or top→bottom)
- [ ] No two component boxes overlap
- [ ] All arrow labels are readable (not overlapping other elements)
- [ ] ≥ 40px vertical gap between rows of components
- [ ] ≥ 20px horizontal gap between components in the same row
- [ ] Legend is outside all boundaries with ≥ 20px clearance
- [ ] Component names are specific and descriptive (not "Service A")
- [ ] Gateway/critical components are visually prominent (larger boxes)

---

## 4. Visual Quality (0–4)

| Score | Criterion |
|-------|-----------|
| 4 | Flawless application of the design system. Colors, typography, spacing, and SVG order are all correct. Visual effects (shadows, gradients, animations) applied tastefully. |
| 3 | One minor deviation from the design system (e.g., slightly wrong font size, one missing mask rect). |
| 2 | Multiple design system violations (wrong colors, missing opaque masks, legend issues). |
| 1 | Significant visual problems — arrows bleeding through components, wrong color assignments, broken layout at common screen sizes. |
| 0 | Design system ignored entirely. Inconsistent colors, no masks, legend missing or wrong. |

### Visual Quality Checklist

- [ ] SVG paint order correct: defs → grid → arrows → masks → boxes → boundaries → legend
- [ ] Every component has an opaque mask rect (`fill="#0f172a"`) drawn BEFORE the styled rect
- [ ] Color palette strictly followed per component type
- [ ] Arrow markers use distinct colors per connection type
- [ ] Legend includes both component swatches AND line style samples
- [ ] Legend only lists types actually used in the diagram
- [ ] viewBox accommodates all content without cropping
- [ ] Typography follows the design system (JetBrains Mono, correct sizes)
- [ ] SVG filters (shadow-sm, shadow-md) applied to key components
- [ ] CSS load animation (fadeInUp) present
- [ ] Interactive features functional (hover highlight, click focus)

---

## 5. Professionalism (0–4)

| Score | Criterion |
|-------|-----------|
| 4 | Diagram could be used directly in an architecture decision record, investor deck, or onboarding document. Production metadata present (instance counts, scaling, latency, SLA targets). |
| 3 | Diagram is professional but lacks some production detail (no instance counts or latency annotations). |
| 2 | Diagram is functional but reads as a draft — generic labels, no operational metadata, summary cards are thin. |
| 1 | Diagram looks like a placeholder — generic content, missing sections, no export readiness. |
| 0 | Template placeholders still present. Cannot be used in any professional context. |

### Professionalism Checklist

- [ ] No `[...]` sentinel placeholders remain in the output
- [ ] Header: specific title, descriptive subtitle, functional export toolbar
- [ ] Summary cards: exactly 3, each with 3–5 specific, technically precise bullet items
- [ ] Footer: project name, region/platform, stack, date
- [ ] Production metadata: instance counts, scaling behavior, latency/throughput annotations
- [ ] Security and compliance: encryption labels, auth protocols, security group rules
- [ ] Export scripts functional: CDN links present, all 3 buttons (Copy/PNG/PDF) work
- [ ] No generic text: "Component N", "Service A", "Card Title", "Item one"

---

## Scoring Summary

| Dimension | Weight | Score (0–4) | Weighted |
|-----------|--------|-------------|----------|
| Completeness | ×2 | | |
| Accuracy | ×2 | | |
| Clarity | ×1.5 | | |
| Visual Quality | ×1 | | |
| Professionalism | ×1.5 | | |
| **Total** | **÷8** | | **/4.0** |

**Pass threshold: ≥ 3.0 / 4.0**

### Interpreting the Score

| Score | Verdict | Action |
|-------|---------|--------|
| 3.5–4.0 | Excellent | Ready for delivery. Suitable for executive review, investor decks, and public documentation. |
| 3.0–3.4 | Good | Ready for delivery. Suitable for team review, onboarding, and internal documentation. |
| 2.5–2.9 | Adequate | Deliverable but note known gaps. Schedule improvements for the next iteration. |
| 2.0–2.4 | Needs Work | Do not deliver without specific caveats. Identify and fix at least the completeness and accuracy issues. |
| < 2.0 | Insufficient | Regenerate. The diagram has fundamental issues that cannot be fixed with minor edits. |

---

## Self-Assessment Protocol

When using this skill to generate a diagram:

1. **Before writing**: Review the brief/codebase analysis output. Mentally score completeness — are all components identified?
2. **During layout**: Check clarity — is the flow direction consistent? Are gaps sufficient?
3. **After SVG construction**: Verify visual quality — SVG order, masks, colors, legend.
4. **Before saving**: Run the Professionalism checklist. Are all placeholders gone? Are summary cards substantive?
5. **After saving**: Open the HTML in a browser. Test hover/click interactions. Test all three export buttons.

If any dimension scores < 3, fix the issues before delivering. If Completeness or Accuracy scores < 3, regenerate the relevant sections entirely — minor edits won't suffice.
