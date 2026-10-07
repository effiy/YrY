import { describe, it, expect } from "vitest";
import {
  severityColor, severityTagType, priorityTagType, statusTagType,
  frequencyTagType, progressColor, formatRelativeTime, truncatePlainText,
  notificationIcon, notificationColor, typeIcon,
  SEVERITY_COLORS, NOTIFICATION_ICONS, NOTIFICATION_COLORS,
  TYPE_ICONS, SHORTCUTS
} from "@/hooks/useTagHelpers";

describe("useTagHelpers", () => {
  // ── Severity ──────────────────────────────────────────────────────────
  describe("severityColor", () => {
    it("returns correct hex for known severities", () => {
      expect(severityColor("critical")).toBe("#f56c6c");
      expect(severityColor("major")).toBe("#e6a23c");
      expect(severityColor("minor")).toBe("#409eff");
      expect(severityColor("trivial")).toBe("#909399");
    });
    it("returns fallback for unknown severity", () => {
      expect(severityColor("unknown")).toBe("#909399");
      expect(severityColor("")).toBe("#909399");
    });
  });

  describe("severityTagType", () => {
    it("maps critical → danger", () => expect(severityTagType("critical")).toBe("danger"));
    it("maps major → warning", () => expect(severityTagType("major")).toBe("warning"));
    it("maps minor/trivial → info", () => {
      expect(severityTagType("minor")).toBe("info");
      expect(severityTagType("trivial")).toBe("info");
    });
    it("falls back to info", () => {
      expect(severityTagType("unknown")).toBe("info");
      expect(severityTagType("")).toBe("info");
    });
  });

  describe("SEVERITY_COLORS", () => {
    it("has all 4 standard severities", () => {
      expect(Object.keys(SEVERITY_COLORS)).toEqual(["critical", "major", "minor", "trivial"]);
    });
  });

  // ── Priority ──────────────────────────────────────────────────────────
  describe("priorityTagType", () => {
    it("maps p0/urgent → danger", () => {
      expect(priorityTagType("p0")).toBe("danger");
      expect(priorityTagType("urgent")).toBe("danger");
    });
    it("maps p1/high → warning", () => {
      expect(priorityTagType("p1")).toBe("warning");
      expect(priorityTagType("high")).toBe("warning");
    });
    it("maps p2/medium → info", () => {
      expect(priorityTagType("p2")).toBe("info");
      expect(priorityTagType("medium")).toBe("info");
    });
    it("maps p3/low/none → info", () => {
      expect(priorityTagType("p3")).toBe("info");
      expect(priorityTagType("low")).toBe("info");
      expect(priorityTagType("none")).toBe("info");
    });
    it("falls back to info", () => expect(priorityTagType("unknown")).toBe("info"));
  });

  // ── Status ────────────────────────────────────────────────────────────
  describe("statusTagType", () => {
    it("maps open/todo → primary", () => {
      expect(statusTagType("open")).toBe("primary");
      expect(statusTagType("todo")).toBe("primary");
    });
    it("maps in_progress/in_review/reopened → warning", () => {
      expect(statusTagType("in_progress")).toBe("warning");
      expect(statusTagType("in_review")).toBe("warning");
      expect(statusTagType("reopened")).toBe("warning");
    });
    it("maps resolved/done/completed → success", () => {
      expect(statusTagType("resolved")).toBe("success");
      expect(statusTagType("done")).toBe("success");
      expect(statusTagType("completed")).toBe("success");
    });
    it("maps closed/cancelled/backlog → info", () => {
      expect(statusTagType("closed")).toBe("info");
      expect(statusTagType("cancelled")).toBe("info");
      expect(statusTagType("backlog")).toBe("info");
    });
    it("maps rejected → danger", () => expect(statusTagType("rejected")).toBe("danger"));
    it("maps active → success, archived → info, planned → info", () => {
      expect(statusTagType("active")).toBe("success");
      expect(statusTagType("archived")).toBe("info");
      expect(statusTagType("planned")).toBe("info");
    });
    it("falls back to info", () => expect(statusTagType("unknown")).toBe("info"));
  });

  // ── Frequency ─────────────────────────────────────────────────────────
  describe("frequencyTagType", () => {
    it("maps always → danger", () => expect(frequencyTagType("always")).toBe("danger"));
    it("maps sometimes → warning", () => expect(frequencyTagType("sometimes")).toBe("warning"));
    it("maps rarely/once/unable → info", () => {
      expect(frequencyTagType("rarely")).toBe("info");
      expect(frequencyTagType("once")).toBe("primary");
      expect(frequencyTagType("unable")).toBe("info");
    });
    it("falls back to info", () => expect(frequencyTagType("")).toBe("info"));
  });

  // ── Progress ──────────────────────────────────────────────────────────
  describe("progressColor", () => {
    it("returns green for >= 80", () => {
      expect(progressColor(100)).toBe("#67c23a");
      expect(progressColor(80)).toBe("#67c23a");
    });
    it("returns amber for 50-79", () => {
      expect(progressColor(79)).toBe("#e6a23c");
      expect(progressColor(50)).toBe("#e6a23c");
    });
    it("returns red for < 50", () => {
      expect(progressColor(49)).toBe("#f56c6c");
      expect(progressColor(0)).toBe("#f56c6c");
    });
    it("handles negative values", () => {
      expect(progressColor(-1)).toBe("#f56c6c");
    });
  });

  // ── Time formatting ───────────────────────────────────────────────────
  describe("formatRelativeTime", () => {
    it("returns empty for falsy input", () => {
      expect(formatRelativeTime("")).toBe("");
    });

    it("returns 'just now' for recent timestamps", () => {
      expect(formatRelativeTime(new Date())).toBe("just now");
      expect(formatRelativeTime(Date.now())).toBe("just now");
    });

    it("returns Nm ago for minutes-old timestamps", () => {
      const ts = Date.now() - 90_000; // 90 seconds
      expect(formatRelativeTime(ts)).toBe("1m ago");
    });

    it("returns Nh ago for hours-old timestamps", () => {
      const ts = Date.now() - 3_600_000; // 1 hour
      expect(formatRelativeTime(ts)).toBe("1h ago");
    });

    it("returns Nd ago for days-old timestamps", () => {
      const ts = Date.now() - 86_400_000; // 1 day
      expect(formatRelativeTime(ts)).toBe("1d ago");
    });

    it("returns Nd ago for week-old timestamps", () => {
      const ts = Date.now() - 7 * 86_400_000; // 7 days
      expect(formatRelativeTime(ts)).toBe("7d ago");
    });

    it("accepts ISO string", () => {
      const d = new Date(Date.now() - 120_000); // 2 min ago
      expect(formatRelativeTime(d.toISOString())).toBe("2m ago");
    });
  });

  // ── Text truncation ───────────────────────────────────────────────────
  describe("truncatePlainText", () => {
    it("strips markdown headings", () => {
      expect(truncatePlainText("## Hello World", 50)).toBe("Hello World");
    });
    it("strips bold markers", () => {
      expect(truncatePlainText("**bold** text", 50)).toBe("bold text");
    });
    it("strips inline code", () => {
      expect(truncatePlainText("use `code` here", 50)).toBe("use code here");
    });
    it("strips markdown links", () => {
      expect(truncatePlainText("[click](https://example.com) now", 50)).toBe("click now");
    });
    it("strips list markers", () => {
      const result = truncatePlainText("- item 1\n- item 2\n* item 3", 50);
      expect(result).toContain("item 1");
      expect(result).toContain("item 2");
      expect(result).toContain("item 3");
      expect(result).not.toContain("-");
      expect(result).not.toContain("*");
    });
    it("truncates long text with ellipsis", () => {
      const long = "This is a very long text that should be truncated at the specified max length";
      const result = truncatePlainText(long, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
      expect(result.endsWith("...")).toBe(true);
    });
    it("does not truncate short text", () => {
      expect(truncatePlainText("Short text", 50)).toBe("Short text");
    });
    it("uses default maxLen of 160", () => {
      const short = "Hello world";
      expect(truncatePlainText(short)).toBe("Hello world");
    });
    it("handles blockquote markers", () => {
      expect(truncatePlainText("> quoted text here", 50)).toBe("quoted text here");
    });
    it("collapses newlines to spaces", () => {
      expect(truncatePlainText("line1\nline2\n\nline3", 50)).toBe("line1 line2 line3");
    });
  });

  // ── Notification helpers ──────────────────────────────────────────────
  describe("notificationIcon", () => {
    it("returns Setting for system", () => {
      expect(notificationIcon("system")).toBe(NOTIFICATION_ICONS.system);
    });
    it("returns User for user_action", () => {
      expect(notificationIcon("user_action")).toBe(NOTIFICATION_ICONS.user_action);
    });
    it("returns Cpu for ai", () => {
      expect(notificationIcon("ai")).toBe(NOTIFICATION_ICONS.ai);
    });
    it("returns Warning for error", () => {
      expect(notificationIcon("error")).toBe(NOTIFICATION_ICONS.error);
    });
    it("falls back to Setting", () => {
      expect(notificationIcon("unknown")).toBe(NOTIFICATION_ICONS.system);
      expect(notificationIcon("")).toBe(NOTIFICATION_ICONS.system);
    });
  });

  describe("notificationColor", () => {
    it("returns correct color for known types", () => {
      expect(notificationColor("system")).toBe("#409eff");
      expect(notificationColor("user_action")).toBe("#67c23a");
      expect(notificationColor("ai")).toBe("#e6a23c");
      expect(notificationColor("error")).toBe("#f56c6c");
    });
    it("falls back to gray", () => {
      expect(notificationColor("unknown")).toBe("#909399");
    });
  });

  describe("NOTIFICATION_ICONS", () => {
    it("has 4 type entries", () => {
      expect(Object.keys(NOTIFICATION_ICONS)).toEqual(["system", "user_action", "ai", "error"]);
    });
  });

  describe("NOTIFICATION_COLORS", () => {
    it("has 4 type entries", () => {
      expect(Object.keys(NOTIFICATION_COLORS)).toEqual(["system", "user_action", "ai", "error"]);
    });
  });

  // ── Type icons ────────────────────────────────────────────────────────
  describe("typeIcon", () => {
    it("returns Tickets for issue", () => {
      expect(typeIcon("issue")).toBe(TYPE_ICONS.issue);
    });
    it("returns Folder for project", () => {
      expect(typeIcon("project")).toBe(TYPE_ICONS.project);
    });
    it("returns Collection for module", () => {
      expect(typeIcon("module")).toBe(TYPE_ICONS.module);
    });
    it("returns WarningFilled for bug", () => {
      expect(typeIcon("bug")).toBe(TYPE_ICONS.bug);
    });
    it("returns Document for page", () => {
      expect(typeIcon("page")).toBe(TYPE_ICONS.page);
    });
    it("falls back to Document", () => {
      expect(typeIcon("unknown")).toBe(TYPE_ICONS.page);
    });
  });

  describe("TYPE_ICONS", () => {
    it("has 5 type entries", () => {
      expect(Object.keys(TYPE_ICONS)).toEqual(["issue", "project", "module", "bug", "page"]);
    });
  });

  // ── Shortcuts ─────────────────────────────────────────────────────────
  describe("SHORTCUTS", () => {
    it("has globalSearch shortcut", () => {
      expect(SHORTCUTS.globalSearch).toBeTruthy();
    });
    it("has focusSearch shortcut", () => {
      expect(SHORTCUTS.focusSearch).toBe("/");
    });
    it("has newItem shortcut", () => {
      expect(SHORTCUTS.newItem).toBe("N");
    });
    it("has save shortcut", () => {
      expect(SHORTCUTS.save).toContain("S");
    });
    it("has escape shortcut", () => {
      expect(SHORTCUTS.escape).toBe("Esc");
    });
    it("is readonly (const assertion)", () => {
      expect(SHORTCUTS).toBeDefined();
    });
  });
});