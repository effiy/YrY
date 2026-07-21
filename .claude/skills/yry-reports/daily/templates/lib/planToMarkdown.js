/**
 * @file: lib/planToMarkdown.js
 * @purpose: Pure markdown exporter for the `/daily plan` template.
 *           Split from `index.js` so the export logic can be unit-tested
 *           in isolation and so the entry file can stay focused on the
 *           Vue mount path.
 *
 * @load:  <script src="lib/planToMarkdown.js"></script>
 *         must be included BEFORE `index.js` so the namespace is ready
 *         when the entry IIFE runs.
 *
 * @exposes: window.dailyPlanToMarkdown
 *   - escapeCellPipes(s)   escape `|` inside a markdown cell
 *   - mdRow(cells)         pipe-joined row, escapes each cell
 *   - mdHeader(headers)    header row + separator row
 *   - mdExcluded()         "— excluded via --tiers —" placeholder
 *   - planToMarkdown(d)    full exporter, mirrors the 13 HTML sections
 *
 * @data_shape: same as window.PLAN_DATA (see data.js). The exporter
 *              never reads globals — pass `d` explicitly. When called
 *              with no arg it falls back to `window.PLAN_DATA`.
 */
(function () {
  'use strict';

  function escapeCellPipes(s) {
    return String(s == null ? '' : s).replace(/\|/g, '\\|');
  }

  function mdRow(cells) {
    return '| ' + cells.map(escapeCellPipes).join(' | ') + ' |';
  }

  function mdHeader(headers) {
    return [
      mdRow(headers),
      '| ' + headers.map(function () { return '---'; }).join(' | ') + ' |'
    ].join('\n');
  }

  function mdExcluded() { return '— excluded via --tiers —'; }

  function planToMarkdown(d) {
    d = d || window.PLAN_DATA;
    if (!d || !d.meta) return '# Engineering Plan (empty data)';

    var out = [];
    var meta = d.meta;
    var tiers = d.tiers || { '30d': true, '90d': true, 'long': true };

    out.push('# ' + meta.project + ' — Engineering Plan (DRAFT — ' + meta.date + ')');
    out.push('');
    out.push('> Horizon: ' + meta.horizon + ' · Tiers: 30d / 90d / long-term');
    out.push('> Generated ' + meta.timestamp + ' · Offline + git-only');
    out.push('> Label as DRAFT until reviewed.');
    out.push('');

    /* 1. DIFF */
    out.push('## Plan Diff vs Prior');
    out.push('');
    if (!d.diff || !d.diff.enabled) {
      out.push(mdExcluded());
    } else {
      var df = d.diff;
      out.push('**Verdict:** ' + df.verdictUpper + ' — ' + df.verdictLabel);
      out.push('');
      out.push('- vs prior plan dated `' + df.priorDate + '`');
      out.push('- counts: ' + df.counts.stable + ' stable · ' + df.counts.changed + ' changed · ' + df.counts.added + ' added · ' + df.counts.removed + ' removed');
      out.push('');
      if (df.changed && df.changed.length) {
        out.push('### Changed items');
        out.push('');
        df.changed.forEach(function (c) {
          out.push('- `' + c.id + '` — ' + c.name);
          (c.fields || []).forEach(function (f) {
            out.push('  - ' + f.field + ': ' + f.old + ' → ' + f.new);
          });
        });
        out.push('');
      }
      if (df.added && df.added.length) {
        out.push('### Added items');
        out.push('');
        df.added.forEach(function (a) { out.push('- + `' + a.id + '` — ' + a.name); });
        out.push('');
      }
      if (df.removed && df.removed.length) {
        out.push('### Removed items');
        out.push('');
        df.removed.forEach(function (r) {
          out.push('- − `' + r.id + '` — ' + r.name + (r.reason ? ' (cut — ' + r.reason + ')' : ''));
        });
        out.push('');
      }
      if (df.assumptionChanges && df.assumptionChanges.length) {
        out.push('### Assumption status changes');
        out.push('');
        df.assumptionChanges.forEach(function (a) {
          out.push('- `' + a.id + '` — ' + a.from + ' → ' + a.to);
        });
        out.push('');
      }
    }

    /* 2. CONTEXT */
    out.push('## Context');
    out.push('');
    if (d.context && d.context.paragraph) out.push(d.context.paragraph);
    out.push('');
    if (d.context) {
      out.push('- **Last commit:** `' + (d.context.lastCommit || '—') + '`');
      out.push('- **Active branches:** ' + (d.context.activeBranches || '—'));
      out.push('- **TODO / FIXME:** ' + (d.context.todoCount || 0));
      out.push('- **Test / src ratio:** ' + (d.context.testRatio || 0));
      out.push('- **Median commits/day:** ' + (d.context.medianCommits || 0));
    }
    out.push('');

    /* 3. ASSUMPTIONS */
    out.push('## Assumptions Register');
    out.push('');
    if (d.assumptions) {
      out.push('**' + (d.assumptions.open || 0) + ' open · ' +
               (d.assumptions.validated || 0) + ' validated · ' +
               (d.assumptions.invalidated || 0) + ' invalidated**');
      out.push('');
      out.push(mdHeader(['ID','Assumption','Tier','Validation','Signal','Consequence','Owner','Status']));
      (d.assumptions.rows || []).forEach(function (r) {
        out.push(mdRow([
          r.id + (r.inferred ? ' [inferred]' : ''),
          r.text, r.tier, r.validation, r.signal, r.consequence, r.owner, r.status
        ]));
      });
    }
    out.push('');

    /* 4. DECISIONS */
    out.push('## Decision Log');
    out.push('');
    if (d.decisions) {
      out.push('**' + (d.decisions.made || 0) + ' made · ' +
               (d.decisions.superseded || 0) + ' superseded · ' +
               (d.decisions.reversed || 0) + ' reversed**');
      out.push('');
      out.push(mdHeader(['ID','Date','Decision','Rationale','Alternatives considered','Reversibility','Tier','Owner','Status']));
      (d.decisions.rows || []).forEach(function (r) {
        out.push(mdRow([
          r.id + (r.inferred ? ' [inferred]' : ''),
          r.date, r.decision, r.rationale, r.alternatives, r.reversibility, r.tier, r.owner, r.status
        ]));
      });
    }
    out.push('');

    /* 5. TIER 30D */
    out.push('## 30 DAYS — Sprint-tier execution');
    out.push('');
    if (!tiers['30d']) { out.push(mdExcluded()); out.push(''); }
    else if (d.tier30d) {
      out.push('### Milestones');
      out.push('');
      out.push(mdHeader(['ID','Name','Window','Exit criteria','Depends on','DoD']));
      (d.tier30d.milestones || []).forEach(function (m) {
        out.push(mdRow([m.id, m.name, m.window, m.exit, m.dependsOn, m.dod]));
      });
      out.push('');
      out.push('### Work items');
      out.push('');
      out.push(mdHeader(['ID','Title','Size','Owner','Dependencies','Files likely touched','Risk']));
      (d.tier30d.workItems || []).forEach(function (w) {
        out.push(mdRow([w.id, w.title, w.size, w.owner, w.deps, w.files, w.risk]));
      });
      out.push('');
    }

    /* 6. TIER 90D */
    out.push('## 90 DAYS — Quarter-tier commitments');
    out.push('');
    if (!tiers['90d']) { out.push(mdExcluded()); out.push(''); }
    else if (d.tier90d) {
      out.push('### Themes');
      out.push('');
      out.push(mdHeader(['ID','Name','Exit criteria','Roll-up from','Owner','North-star metric']));
      (d.tier90d.themes || []).forEach(function (t) {
        out.push(mdRow([t.id, t.name, t.exit, t.rollup, t.owner, t.northStar]));
      });
      out.push('');
      out.push('### Epics');
      out.push('');
      out.push(mdHeader(['ID','Title','Size','Dependencies','Risk']));
      (d.tier90d.epics || []).forEach(function (e) {
        out.push(mdRow([e.id, e.title, e.size, e.deps, e.risk]));
      });
      out.push('');
    }

    /* 7. TIER LONG */
    out.push('## LONG-TERM — Strategic bets');
    out.push('');
    if (!tiers['long']) { out.push(mdExcluded()); out.push(''); }
    else if (d.tierLong) {
      out.push('### Strategic bets');
      out.push('');
      out.push(mdHeader(['ID','Name','Hypothesis','Roll-up from','North-star metric','Kill criteria','Decision point']));
      (d.tierLong.bets || []).forEach(function (b) {
        out.push(mdRow([b.id, b.name, b.hypothesis, b.rollup, b.northStar, b.kill, b.decisionPoint]));
      });
      out.push('');
      out.push('### Platform / architectural shifts');
      out.push('');
      (d.tierLong.shifts || []).forEach(function (s) { out.push('- ' + s); });
      out.push('');
      out.push('### Project north-star metrics');
      out.push('');
      (d.tierLong.northStars || []).forEach(function (n) { out.push('- ' + n); });
      out.push('');
    }

    /* 8. TRACEABILITY */
    out.push('## Traceability Matrix');
    out.push('');
    if (d.traceability && d.traceability.length) {
      out.push(mdHeader(['30d work item','30d milestone','90d theme','Long-term bet','North-star metric']));
      d.traceability.forEach(function (t) {
        out.push(mdRow([t.workItem, t.milestone, t.theme, t.bet, t.northStar]));
      });
    }
    out.push('');

    /* 9. CAPACITY */
    out.push('## Capacity vs Demand');
    out.push('');
    if (d.capacity) {
      var c = d.capacity;
      out.push('**Available:** ' + c.available + ' person-days (' + c.committers + ' committers × ' + c.workingDays + ' days × ' + c.focus + ' focus)');
      out.push('');
      out.push('**Demand:** ' + c.demand + ' person-days (' + c.workDemand + ' work + ' + c.meetingDemand + ' meetings + ' + c.oncallDemand + ' oncall × 1.15 buffer)');
      out.push('');
      out.push('**Verdict:** ' + c.verdictUpper + ' (' + c.deltaLabel + ')');
      out.push('');
      out.push(mdHeader(['Work item','Size','Estimate (days)','Dependents']));
      (c.breakdown || []).forEach(function (b) {
        out.push(mdRow([b.item, b.size, b.estimate, b.dependents]));
      });
      out.push(mdRow(['Meeting overhead', '', c.meetingDemand, '—']));
      out.push(mdRow(['Oncall overhead', '', c.oncallDemand, '—']));
      out.push(mdRow(['Buffer (15%)', '', c.bufferDemand, '—']));
      out.push(mdRow(['**Total demand**', '', '**' + c.demand + '**', '—']));
      if (c.suggestedCuts && c.suggestedCuts.length) {
        out.push('');
        out.push('### Suggested cuts');
        out.push('');
        c.suggestedCuts.forEach(function (s) { out.push('- ' + s); });
      }
    }
    out.push('');

    /* 10. RISKS */
    out.push('## Risk Mitigations');
    out.push('');
    if (d.risks && d.risks.actionBlock) {
      out.push('> **Action:** ' + d.risks.actionBlock);
      out.push('');
    }
    if (d.risks && d.risks.rows) {
      out.push(mdHeader(['Risk','Tier','Likelihood','Impact','Mitigation','Owner','Trigger']));
      d.risks.rows.forEach(function (r) {
        out.push(mdRow([r.risk, r.tier, r.likelihood, r.impact, r.mitigation, r.owner, r.trigger]));
      });
    }
    out.push('');

    /* 11. TEAM */
    out.push('## Team Allocation');
    out.push('');
    if (d.team) {
      out.push('### Roster');
      out.push('');
      out.push(mdHeader(['Author','Commit share','Files owned (top 3)']));
      (d.team.roster || []).forEach(function (r) {
        out.push(mdRow([r.author, r.share, r.files]));
      });
      out.push('');
      out.push('### 30d allocation (DRAFT)');
      out.push('');
      out.push(mdHeader(['Work item','Suggested owner','Reviewer','Bus-factor flag']));
      (d.team.alloc30d || []).forEach(function (a) {
        out.push(mdRow([a.item, a.owner, a.reviewer, a.busFactor]));
      });
      out.push('');
      out.push('### 90d allocation (DRAFT)');
      out.push('');
      out.push(mdHeader(['Theme','Suggested owner']));
      (d.team.alloc90d || []).forEach(function (a) {
        out.push(mdRow([a.theme, a.owner]));
      });
    }
    out.push('');

    /* 12. DoD */
    out.push('## Definition of Done');
    out.push('');
    out.push('**30d DoD**');
    out.push('');
    out.push('- [ ] All 30d milestone exit criteria met');
    out.push('- [ ] All L / XL items have a reviewer assigned');
    out.push('- [ ] Test-to-src LOC ratio did not decrease vs baseline');
    out.push('- [ ] No new TODO/FIXME without a linked issue');
    out.push('');
    out.push('**90d DoD**');
    out.push('');
    out.push('- [ ] All 90d theme exit criteria met (north-star metrics moved)');
    out.push('- [ ] Every 30d milestone traces to a 90d theme');
    out.push('- [ ] Cross-team dependencies resolved or documented');
    out.push('- [ ] Capacity plan reviewed vs actual velocity');
    out.push('');
    out.push('**Long-term DoD**');
    out.push('');
    out.push('- [ ] Every 90d theme traces to a long-term bet');
    out.push('- [ ] Each bet has a kill criteria + decision point');
    out.push('- [ ] Platform shifts have a migration sketch (not a full plan)');
    out.push('- [ ] North-star metrics reviewed quarterly');
    out.push('');

    /* 13. REVIEW */
    out.push('## Review Checklist');
    out.push('');
    out.push('### Narrative');
    out.push('- [ ] Context paragraph names the thrust for all three tiers');
    out.push('- [ ] No marketing language or hedging');
    out.push('- [ ] The single biggest assumption is named in the context');
    out.push('- [ ] The single biggest risk is named in the context');
    out.push('');
    out.push('### Roll-up integrity');
    out.push('- [ ] Every 30d milestone traces to a 90d theme');
    out.push('- [ ] Every 90d theme traces to a long-term bet');
    out.push('- [ ] Traceability matrix has no — ORPHAN — cells');
    out.push('- [ ] No 90d theme or long-term bet is an orphan');
    out.push('');
    out.push('### Capacity');
    out.push('- [ ] Capacity verdict is green or amber (or --allow-overcommit documented)');
    out.push('- [ ] Buffer is 15% of (work + meeting + oncall)');
    out.push('- [ ] Focus factor matches the scenario');
    out.push('- [ ] Active committer count reflects reality');
    out.push('');
    out.push('### Assumptions');
    out.push('- [ ] Every assumption has a concrete consequence');
    out.push('- [ ] Every assumption has a validation date in T+Nd form');
    out.push('- [ ] Inferred assumptions are tagged [inferred] and reviewed');
    out.push('- [ ] No assumption\'s validation date is in the past without a status update');
    out.push('');
    out.push('### Risks');
    out.push('- [ ] Every risk has a trigger signal');
    out.push('- [ ] Tier tags are present (30d / 90d / long)');
    out.push('- [ ] Amber and red risks have mitigations');
    out.push('- [ ] The highest-impact risk has a named owner');
    out.push('');
    if (d.review) {
      out.push('### Sign-off');
      out.push('');
      out.push(mdHeader(['Role','Name','Date']));
      out.push(mdRow(['Author',        d.review.author,        d.review.date]));
      out.push(mdRow(['Peer reviewer', d.review.peer,          d.review.peerDate]));
      out.push(mdRow(['Stakeholder',   d.review.stakeholder,   d.review.stakeholderDate]));
      out.push(mdRow(['Next review',   '—',                    d.review.nextDate]));
    }
    out.push('');
    out.push('---');
    out.push('');
    out.push('Generated by `/daily plan` · three-horizon model (30d / 90d / long-term) · data is offline + git-only · label as DRAFT until reviewed.');

    return out.join('\n');
  }

  window.dailyPlanToMarkdown = {
    escapeCellPipes: escapeCellPipes,
    mdRow: mdRow,
    mdHeader: mdHeader,
    mdExcluded: mdExcluded,
    planToMarkdown: planToMarkdown,
  };
})();
