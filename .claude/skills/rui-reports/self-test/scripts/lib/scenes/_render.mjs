/**
 * rui-report-self-test · scene markdown renderer
 * ----------------------------------------------------------------------
 * Renders a single scene (the output of one `buildSceneN()`) into a
 * self-contained Markdown document with the section layout the report
 * UI expects (§0 Effect Sketch, §1 Test Design, §2 Output Inventory,
 * §2.5 Evidence, §3 Test Report, §4 Self-Improvement).
 */

export function sceneToMarkdown(scene, scopeTitle) {
    const s = scene;
    const date = new Date().toISOString().slice(0, 10);
    const coveragePct = (s.coverage * 100).toFixed(0);
    return `# Scene ${s.index} · ${s.title}

> **Facet**: \`${s.facet}\` · **Slug**: \`${s.slug}\` · **Verdict**: **${s.verdict}** · **Coverage**: ${coveragePct}%
> **Scope**: ${scopeTitle} · **Generated**: ${date}

---

## §0 · Effect Sketch

### What this scene demonstrates

${s.section0.effect}

### Why it matters

${s.section0.matters}

${s.section0.mermaid ? `### Flow

\`\`\`mermaid
${s.section0.mermaid}
\`\`\`
` : ''}
---

## §1 · Test Design — Verification Steps

${s.section1.steps.map((step, index) => `### Step ${index + 1} · ${step.title}

- **Action**: ${step.action}
- **Expected**: ${step.expected}
- **File**: \`${step.file || '<not applicable>'}\`
`).join('\n')}
---

## §2 · Output Inventory

| # | File / Directory | Type | Description |
|---|------------------|------|-------------|
${s.section2.outputs.map((output, index) => `| ${index + 1} | \`${output.path}\` | ${output.type} | ${output.description} |`).join('\n')}

---

## §2.5 · Evidence — Raw Facet Probes

${s.evidence && s.evidence.length ? `| Label | Value |
|-------|-------|
${s.evidence.map(evidence => `| ${evidence.label} | \`${evidence.value}\` |`).join('\n')}` : '_No evidence recorded for this scene._'}

---

## §3 · Test Report — ${date}

| # | Step | Result | Notes |
|---|------|:---:|-------|
${s.section3.report.map((report, index) => `| ${index + 1} | ${report.step} | ${report.result} | ${report.notes} |`).join('\n')}

**Overall**: ${s.section3.overall}

**Verdict**: **${s.verdict}** (coverage: ${coveragePct}% · threshold: pass ≥ 90%, partial 50–89%, fail < 50%)

---

## §4 · Self-Improvement

### Edge cases found

${s.section4.edgeCases.map(edgeCase => `- ${edgeCase}`).join('\n')}

### Suggested improvements

${s.section4.improvements.map(improvement => `- ${improvement}`).join('\n')}

### Limitations

${s.section4.limitations.map(limit => `- ${limit}`).join('\n')}
`;
}
