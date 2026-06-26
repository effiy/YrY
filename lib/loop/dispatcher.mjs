/**
 * loop-dispatcher — Self-loop task dispatcher.
 *
 * Reads the loop registry, determines which skills are due (based on intervalCron
 * vs last-run timestamp), runs their checkScript, and calls loop-report.mjs to
 * generate pass/fail HTML reports based on exit codes.
 *
 * Usage:
 *   node lib/loop/dispatcher.mjs              # run due checks
 *   node lib/loop/dispatcher.mjs --skill=<n>  # force-run one skill regardless of schedule
 *   node lib/loop/dispatcher.mjs --dry-run    # show what would run, execute nothing
 *
 * State persisted to .memory/loop-state.json:
 *   { "<skill>": { "lastRun": "<ISO>", "lastStatus": "pass|warn|fail", "lastExitCode": <n> } }
 *
 * Exit code: 0 if all due checks ran (regardless of individual pass/fail), non-zero on dispatcher error.
 *
 * Designed to be invoked by a single durable CronCreate task every 5 minutes.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isMain } from "../../lib/fs.mjs";
import { NODE_ARGV_OFFSET } from "../../lib/constants.mjs";
import { LOOP_SKILLS, getCronEligibleSkills } from "../../lib/loop/registry.mjs";

const STATE_FILE = ".memory/loop-state.json";
const CRON_PROMPT_PREFIX = "[loop-dispatcher]";
const P0_ESCALATION_THRESHOLD = 3;
const OVERDUE_MULTIPLIER = 2; // skill is overdue if age > 2 × interval

/**
 * Parse cron field into numeric ranges for due-checking.
 * Supports: star-slash-N, N, N-comma-M, N-dash-M, star.
 */
/** @type {(field: string, min: number, max: number) => number[]} */
function parseCronField(/** @type {string} */ field, /** @type {number} */ min, /** @type {number} */ max) {
  if (field === "*") {
    const arr = [];
    for (let i = min; i <= max; i++) arr.push(i);
    return arr;
  }
  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2), 10);
    const arr = [];
    for (let i = min; i <= max; i += step) arr.push(i);
    return arr;
  }
  if (field.includes(",")) {
    return field.split(",").flatMap((/** @type {string} */ f) => parseCronField(f.trim(), min, max));
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-").map((/** @type {string} */ n) => parseInt(n, 10));
    const arr = [];
    for (let i = a; i <= b; i++) arr.push(i);
    return arr;
  }
  return [parseInt(field, 10)];
}

/**
 * Compute the effective interval in minutes from a 5-field cron expression.
 * Used by the dispatcher's elapsed-time heuristic.
 *   star-slash-5 minute  → 5
 *   star-slash-30 minute → 30
 *   0 star star star star → 60
 *   0 8 star star 1-5    → 1440 (daily on weekdays, approximate)
 *   0 9 star star 1     → 10080 (weekly)
 *   0 8 star star 1,4    → 5040 (twice a week, approximate)
 */
/** @type {(cronExpr: string | null | undefined) => number} */
function cronIntervalMinutes(/** @type {string | null | undefined} */ cronExpr) {
  if (!cronExpr) return Infinity;
  const [mField, hField, , , dowField] = cronExpr.split(/\s+/);
  if (mField.startsWith("*/")) return parseInt(mField.slice(2), 10);
  if (hField === "*" && !mField.startsWith("*/")) {
    // hourly at specific minute — approx 60 min
    return 60;
  }
  const dowCount = parseCronField(dowField, 0, 6).length;
  if (dowCount >= 7) return 1440; // every day
  if (dowCount >= 5) return 1440 * 7 / 5; // weekdays — approx 2016 min between runs
  if (dowCount >= 2) return 1440 * 7 / dowCount; // ~twice a week
  return 10080; // weekly
}

/**
 * Check if a skill is due to run, based on its cron and last-run time.
 * Heuristic: due if elapsed since lastRun >= effective interval.
 * If never ran, due only if current time matches the cron (to avoid running
 * weekly tasks at boot).
 */
/** @type {(cronExpr: string | null | undefined, lastRunISO: string | null | undefined, now?: Date) => boolean} */
function isCronDue(/** @type {string | null | undefined} */ cronExpr, /** @type {string | null | undefined} */ lastRunISO, /** @type {Date} */ now = new Date()) {
  if (!cronExpr) return false;
  if (!lastRunISO) {
    // Never ran — only due if current time matches the cron window
    const [mField, hField, , monField, dowField] = cronExpr.split(/\s+/);
    const minutes = parseCronField(mField, 0, 59);
    const hours = parseCronField(hField, 0, 23);
    const mons = parseCronField(monField, 1, 12);
    const dows = parseCronField(dowField, 0, 6);
    return minutes.includes(now.getMinutes())
      && hours.includes(now.getHours())
      && mons.includes(now.getMonth() + 1)
      && dows.includes(now.getDay());
  }
  const lastRun = new Date(lastRunISO);
  const elapsedMin = (now.getTime() - lastRun.getTime()) / 60000;
  const intervalMin = cronIntervalMinutes(cronExpr);
  // Add a 1-minute grace period to avoid double-runs within the same window
  return elapsedMin >= intervalMin + 1;
}

/**
 * Load dispatcher state from .memory/loop-state.json.
 */
function loadState() {
  try {
    if (!existsSync(STATE_FILE)) return {};
    const data = readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save dispatcher state.
 */
function saveState(/** @type {any} */ state) {
  mkdirSync(".memory", { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

/**
 * Run a checkScript and return { exitCode, status, output }.
 */
function runCheck(/** @type {string} */ skill, /** @type {string} */ checkScript, /** @type {number} */ timeoutMs = 120_000) {
  const [cmd, ...args] = checkScript.split(/\s+/);
  const result = spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: "utf-8",
    timeout: timeoutMs,
    env: process.env,
  });
  const exitCode = result.status ?? -1;
  const status = exitCode === 0 ? "pass" : "fail";
  const output = (result.stdout || "") + (result.stderr || "");
  return { exitCode, status, output: output.slice(-2000) };
}

/**
 * Generate a self-loop report via loop-report.mjs.
 */
function generateReport(/** @type {string} */ skill, /** @type {string} */ status, /** @type {string} */ summary) {
  const args = [
    "skills/rui-bot/lib/loop-report.mjs",
    `--skill=${skill}`,
    `--status=${status}`,
    `--summary=${summary}`,
  ];
  const result = spawnSync("node", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
    timeout: 30_000,
  });
  return result.status === 0;
}

/**
 * Send a P0 escalation notification via rui-bot (WeCom webhook).
 * Calls loop-report.mjs's notifyReport() which handles the HTTP send.
 */
async function notifyP0Escalation(/** @type {string} */ skill, /** @type {string} */ status, /** @type {string} */ summary, /** @type {number} */ consecutiveFails) {
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${skill}-${today}.html`;
  try {
    const mod = await import("../../skills/rui-bot/lib/loop-report.mjs");
    if (typeof mod.notifyReport !== "function") return false;
    const ok = await mod.notifyReport({
      skill,
      status,
      filename,
      summary: `🚫 P0 升级：${skill} 连续 ${consecutiveFails} 次 fail\n${summary}`,
      findings: [{ level: "fail", title: `连续 ${consecutiveFails} 次失败`, detail: summary }],
    });
    return ok;
  } catch (err) {
    console.error(`${CRON_PROMPT_PREFIX} P0 通知发送失败: ${err.message}`);
    return false;
  }
}

/**
 * Determine which skills are due.
 */
function getDueSkills(/** @type {any} */ state, /** @type {Date} */ now, /** @type {string} */ forceSkill) {
  if (forceSkill) {
    const s = LOOP_SKILLS.find(x => x.skill === forceSkill);
    return s ? [s] : [];
  }
  return getCronEligibleSkills().filter(s => {
    const last = state[s.skill];
    return isCronDue(s.intervalCron, last?.lastRun, now);
  });
}

/**
 * Detect skills that haven't run in > OVERDUE_MULTIPLIER × interval.
 * These are "silent stalls" — the dispatcher's cron may not be firing,
 * or the skill's checkScript is hanging.
 */
function getOverdueSkills(/** @type {any} */ state, /** @type {Date} */ now = new Date()) {
  return getCronEligibleSkills().filter(s => {
    const last = state[s.skill];
    if (!last?.lastRun) return false; // never run is not "overdue", it's "uninitialized"
    const intervalMin = cronIntervalMinutes(s.intervalCron);
    const ageMin = (now.getTime() - new Date(last.lastRun).getTime()) / 60000;
    return ageMin > intervalMin * OVERDUE_MULTIPLIER;
  });
}

/**
 * Main dispatcher entry.
 * opts: { dryRun, forceSkill, bootstrap }
 *   bootstrap=true forces ALL cli-eligible skills to run once, ignoring due-check.
 * @returns {Promise<{ ran: number, passed: number, failed: number, p0Escalated: number, p0Notified: number, skipped?: number, overdue?: number }>}
 */
async function dispatch(/** @type {any} */ opts = {}) {
  const { dryRun = false, forceSkill = null, bootstrap = false } = opts;
  const now = new Date();
  const state = loadState();
  let due;
  if (bootstrap) {
    due = getCronEligibleSkills();
    console.log(`${CRON_PROMPT_PREFIX} bootstrap: forcing ${due.length} cli skill(s) to run once`);
  } else {
    due = getDueSkills(state, now, forceSkill);
  }

  if (due.length === 0) {
    console.log(`${CRON_PROMPT_PREFIX} no skills due at ${now.toISOString()}`);
    return { ran: 0, passed: 0, failed: 0, p0Escalated: 0, p0Notified: 0 };
  }

  console.log(`${CRON_PROMPT_PREFIX} ${due.length} skill(s) due: ${due.map(s => s.skill).join(", ")}`);
  let ran = 0;
  let passed = 0;
  let failed = 0;
  let p0Notified = 0;

  for (const skill of due) {
    if (dryRun) {
      console.log(`  [dry-run] would run: ${skill.skill} → ${skill.checkScript}`);
      continue;
    }
    console.log(`  ▶ running ${skill.skill}: ${skill.checkScript}`);
    const { exitCode, status, output } = runCheck(skill.skill, /** @type {string} */ (skill.checkScript));

    // Track consecutive failures for P0 escalation
    const prev = state[skill.skill] || {};
    const consecutiveFails = status === "pass" ? 0 : (prev.consecutiveFails || 0) + 1;
    const p0Escalated = consecutiveFails >= P0_ESCALATION_THRESHOLD;
    const justEscalated = p0Escalated && !(prev.p0Escalated);

    let summary;
    if (status === "pass") {
      summary = `${skill.skill} 自循环通过 (exit ${exitCode})`;
    } else if (p0Escalated) {
      summary = `🚫 P0 升级：${skill.skill} 连续 ${consecutiveFails} 次 fail (exit ${exitCode}): ${output.slice(0, 200).replace(/\n/g, " ")}`;
    } else {
      summary = `${skill.skill} 自循环失败 (exit ${exitCode}, 连续 ${consecutiveFails}/${P0_ESCALATION_THRESHOLD}): ${output.slice(0, 200).replace(/\n/g, " ")}`;
    }

    const reportOk = generateReport(skill.skill, status, summary);
    const p0Tag = p0Escalated ? " 🚫P0" : "";
    console.log(`    → ${status} (exit ${exitCode}), report: ${reportOk ? "ok" : "failed"}${p0Tag}`);

    // Send P0 notification only on fresh escalation (avoid spamming every run)
    if (justEscalated) {
      const notifyOk = await notifyP0Escalation(skill.skill, status, summary, consecutiveFails);
      if (notifyOk) {
        p0Notified++;
        console.log(`    → 📨 P0 企微通知已发送`);
      } else {
        console.log(`    → ⚠️ P0 通知发送失败（见 loop-report 错误日志）`);
      }
    }

    state[skill.skill] = {
      lastRun: now.toISOString(),
      lastStatus: status,
      lastExitCode: exitCode,
      lastOutput: output.slice(0, 500),
      consecutiveFails,
      p0Escalated,
    };
    saveState(state);

    ran++;
    if (status === "pass") passed++;
    else failed++;
  }

  const p0Count = due.filter(s => state[s.skill]?.p0Escalated).length;

  // Detect overdue skills (silent stalls)
  const overdue = getOverdueSkills(state, now);
  if (overdue.length > 0) {
    console.log(`${CRON_PROMPT_PREFIX} ⚠️ ${overdue.length} overdue skill(s) — silent stall suspected:`);
    overdue.forEach(s => {
      const last = state[s.skill];
      const ageMin = ((now.getTime() - new Date(last.lastRun).getTime()) / 60000).toFixed(0);
      const intervalMin = cronIntervalMinutes(s.intervalCron);
      console.log(`    ⚠️ ${s.skill}: age=${ageMin}min, interval=${intervalMin}min (overdue ×${(Number(ageMin)/intervalMin).toFixed(1)})`);
    });
  }

  // Single-line summary for cron prompt visibility
  const summaryParts = [`${ran} ran`, `${passed} pass`, `${failed} fail`];
  if (p0Count > 0) summaryParts.push(`🚫${p0Count} P0`);
  if (overdue.length > 0) summaryParts.push(`⚠️${overdue.length} overdue`);
  if (p0Notified > 0) summaryParts.push(`${p0Notified} notified`);
  console.log(`${CRON_PROMPT_PREFIX} done: ${summaryParts.join(", ")}`);

  return { ran, passed, failed, p0Escalated: p0Count, p0Notified, overdue: overdue.length };
}

/**
 * Remove reports older than `maxAgeDays` from reports.json and the filesystem.
 * Keeps the most recent report per skill regardless of age (to preserve history).
 * @returns {{ removed: string[], kept: number }}
 */
function cleanStale(maxAgeDays = 7) {
  const REPORT_DIR = "docs/自循环报告";
  const reportsPath = `${REPORT_DIR}/reports.json`;
  if (!existsSync(reportsPath)) {
    console.log(`${CRON_PROMPT_PREFIX} reports.json not found, nothing to clean`);
    return { removed: [], kept: 0 };
  }
  const reports = JSON.parse(readFileSync(reportsPath, "utf-8"));
  const now = new Date();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  // Find most recent date per skill (preserve at least one per skill)
  const latestBySkill = new Map();
  for (const r of reports) {
    const existing = latestBySkill.get(r.skill);
    if (!existing || new Date(r.date) > new Date(existing)) {
      latestBySkill.set(r.skill, r.date);
    }
  }

  const removed = [];
  const kept = [];
  for (const r of reports) {
    const ageMs = now.getTime() - new Date(r.date).getTime();
    const isLatest = r.date === latestBySkill.get(r.skill);
    if (ageMs > maxAgeMs && !isLatest) {
      // Remove HTML file + skip from kept
      const filePath = `${REPORT_DIR}/${r.file}`;
      if (existsSync(filePath)) {
        try { unlinkSync(filePath); } catch { /* ignore */ }
      }
      removed.push(`${r.skill}-${r.date}`);
    } else {
      kept.push(r);
    }
  }

  if (removed.length > 0) {
    writeFileSync(reportsPath, JSON.stringify(kept, null, 2), "utf-8");
    console.log(`${CRON_PROMPT_PREFIX} cleaned ${removed.length} stale report(s):`);
    removed.forEach(x => console.log(`  ✗ ${x}`));
    console.log(`${CRON_PROMPT_PREFIX} kept ${kept.length} report(s) (including latest per skill)`);
  } else {
    console.log(`${CRON_PROMPT_PREFIX} no stale reports (all within ${maxAgeDays}d or latest per skill)`);
  }
  return { removed, kept: kept.length };
}

/**
 * Print a status table of all cli-eligible skills without running anything.
 * Shows: lastRun age, lastStatus, consecutiveFails, p0Escalated, overdue flag.
 */
function printStatus() {
  const state = loadState();
  const now = new Date();
  const skills = getCronEligibleSkills();
  console.log(`${CRON_PROMPT_PREFIX} status — ${skills.length} cli skill(s)`);
  console.log("");
  console.log("  skill                status   age      cf  p0  overdue");
  console.log("  " + "-".repeat(58));
  let pass = 0, fail = 0, overdue = 0, p0 = 0;
  for (const s of skills) {
    const last = state[s.skill];
    if (!last) {
      console.log(`  ${s.skill.padEnd(20)} —       never    —   —   —`);
      continue;
    }
    const ageMin = ((now.getTime() - new Date(last.lastRun).getTime()) / 60000).toFixed(0);
    const intervalMin = cronIntervalMinutes(s.intervalCron);
    const isOverdue = Number(ageMin) > intervalMin * OVERDUE_MULTIPLIER;
    const status = last.lastStatus || "—";
    const cf = last.consecutiveFails || 0;
    const p0Flag = last.p0Escalated ? "🚫" : " ";
    const odFlag = isOverdue ? "⚠️" : " ";
    console.log(`  ${s.skill.padEnd(20)} ${status.padEnd(8)} ${ageMin.padStart(4)}m   ${cf}   ${p0Flag}   ${odFlag}`);
    if (status === "pass") pass++;
    else if (status === "fail") fail++;
    if (isOverdue) overdue++;
    if (last.p0Escalated) p0++;
  }
  console.log("");
  console.log(`${CRON_PROMPT_PREFIX} ${skills.length} skills: ${pass} pass, ${fail} fail, ${p0} P0, ${overdue} overdue`);
}

// --- CLI entry ---------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  /** @type {{ dryRun: boolean, forceSkill: string|null, cleanStale: boolean, staleDays: number, bootstrap: boolean, status: boolean }} */
  const opts = { dryRun: false, forceSkill: null, cleanStale: false, staleDays: 7, bootstrap: false, status: false };
  for (const arg of args) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg.startsWith("--skill=")) opts.forceSkill = arg.slice(8);
    else if (arg === "--clean-stale") opts.cleanStale = true;
    else if (arg.startsWith("--stale-days=")) opts.staleDays = parseInt(arg.slice(13), 10) || 7;
    else if (arg === "--bootstrap") opts.bootstrap = true;
    else if (arg === "--status") opts.status = true;
  }
  return opts;
}

if (isMain(import.meta.url)) {
  const opts = parseArgs();
  if (opts.status) {
    printStatus();
    process.exit(0);
  }
  if (opts.cleanStale) {
    cleanStale(opts.staleDays);
    process.exit(0);
  }
  dispatch(opts).then(result => {
    // Exit code: 0=healthy, 1=has failures, 2=has P0 escalation
    const code = result.p0Escalated > 0 ? 2 : (result.failed > 0 ? 1 : 0);
    process.exit(code);
  });
}

export { dispatch, cleanStale, printStatus, isCronDue, cronIntervalMinutes, getDueSkills, getOverdueSkills, loadState, saveState };
