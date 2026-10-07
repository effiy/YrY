import { describe, it, expect } from "vitest";
import { normalizeIssue } from "@/api/modules/issueService";

describe("normalizeIssue", () => {
  // ── Status normalization ──────────────────────────────────────────────
  describe("status", () => {
    it("passes through canonical lowercase status unchanged", () => {
      expect(normalizeIssue({ status: "done" }).status).toBe("done");
      expect(normalizeIssue({ status: "in_progress" }).status).toBe("in_progress");
      expect(normalizeIssue({ status: "backlog" }).status).toBe("backlog");
      expect(normalizeIssue({ status: "todo" }).status).toBe("todo");
      expect(normalizeIssue({ status: "in_review" }).status).toBe("in_review");
      expect(normalizeIssue({ status: "cancelled" }).status).toBe("cancelled");
    });

    it("converts Title Case → snake_case", () => {
      expect(normalizeIssue({ status: "Done" }).status).toBe("done");
      expect(normalizeIssue({ status: "In Progress" }).status).toBe("in_progress");
      expect(normalizeIssue({ status: "To Do" }).status).toBe("todo");
      expect(normalizeIssue({ status: "In Review" }).status).toBe("in_review");
      expect(normalizeIssue({ status: "Backlog" }).status).toBe("backlog");
      expect(normalizeIssue({ status: "Review" }).status).toBe("in_review");
      expect(normalizeIssue({ status: "Cancelled" }).status).toBe("cancelled");
    });

    it("falls back to lowercased value for unknown statuses", () => {
      expect(normalizeIssue({ status: "ARCHIVED" }).status).toBe("archived");
      expect(normalizeIssue({ status: "Blocked" }).status).toBe("blocked");
    });

    it("handles empty/missing status gracefully", () => {
      expect(normalizeIssue({}).status).toBe("");
      expect(normalizeIssue({ status: "" }).status).toBe("");
    });
  });

  // ── issue_type normalization ──────────────────────────────────────────
  describe("issue_type", () => {
    it("passes through canonical issue_type unchanged", () => {
      expect(normalizeIssue({ issue_type: "task" }).issue_type).toBe("task");
      expect(normalizeIssue({ issue_type: "feature" }).issue_type).toBe("feature");
      expect(normalizeIssue({ issue_type: "bug" }).issue_type).toBe("bug");
      expect(normalizeIssue({ issue_type: "improvement" }).issue_type).toBe("improvement");
    });

    it("maps imported `type` field to `issue_type` when issue_type is missing", () => {
      expect(normalizeIssue({ type: "task" }).issue_type).toBe("task");
      expect(normalizeIssue({ type: "feature" }).issue_type).toBe("feature");
      expect(normalizeIssue({ type: "bug" }).issue_type).toBe("bug");
    });

    it("prefers issue_type over type when both are present", () => {
      const r = normalizeIssue({ issue_type: "feature", type: "task" });
      expect(r.issue_type).toBe("feature");
    });

    it("normalizes Title Case type values", () => {
      expect(normalizeIssue({ type: "Task" }).issue_type).toBe("task");
      expect(normalizeIssue({ type: "Feature" }).issue_type).toBe("feature");
    });

    it("defaults to 'task' when neither issue_type nor type is present", () => {
      expect(normalizeIssue({}).issue_type).toBe("task");
      expect(normalizeIssue({ status: "done" }).issue_type).toBe("task");
    });
  });

  // ── Priority normalization ────────────────────────────────────────────
  describe("priority", () => {
    it("passes through canonical priority unchanged", () => {
      expect(normalizeIssue({ priority: "high" }).priority).toBe("high");
      expect(normalizeIssue({ priority: "medium" }).priority).toBe("medium");
      expect(normalizeIssue({ priority: "low" }).priority).toBe("low");
    });

    it("converts Title Case priority", () => {
      expect(normalizeIssue({ priority: "High" }).priority).toBe("high");
      expect(normalizeIssue({ priority: "Medium" }).priority).toBe("medium");
    });

    it("defaults missing priority to 'medium'", () => {
      expect(normalizeIssue({}).priority).toBe("medium");
      expect(normalizeIssue({ priority: "" }).priority).toBe("medium");
    });

    it("defaults null/undefined priority to 'medium'", () => {
      expect(normalizeIssue({ priority: null }).priority).toBe("medium");
      expect(normalizeIssue({ priority: undefined }).priority).toBe("medium");
    });
  });

  // ── Assignee normalization ────────────────────────────────────────────
  describe("assignee", () => {
    it("passes through valid assignee", () => {
      expect(normalizeIssue({ assignee: "Alice" }).assignee).toBe("Alice");
    });

    it("defaults missing assignee to empty string", () => {
      expect(normalizeIssue({}).assignee).toBe("");
    });

    it("defaults non-string assignee to empty string", () => {
      expect(normalizeIssue({ assignee: null }).assignee).toBe("");
      expect(normalizeIssue({ assignee: 123 }).assignee).toBe("");
    });
  });

  // ── Date field normalization ──────────────────────────────────────────
  describe("date fields", () => {
    const iso = "2026-09-20T02:06:51.194069Z";

    it("passes through canonical updated_at unchanged", () => {
      expect(normalizeIssue({ updated_at: iso }).updated_at).toBe(iso);
    });

    it("maps imported updatedTime → updated_at", () => {
      expect(normalizeIssue({ updatedTime: iso }).updated_at).toBe(iso);
    });

    it("maps imported updatedAt → updated_at", () => {
      expect(normalizeIssue({ updatedAt: iso }).updated_at).toBe(iso);
    });

    it("prefers updated_at over imported variants", () => {
      const r = normalizeIssue({ updated_at: "2026-01-01", updatedTime: iso });
      expect(r.updated_at).toBe("2026-01-01");
    });

    it("passes through canonical created_at unchanged", () => {
      expect(normalizeIssue({ created_at: iso }).created_at).toBe(iso);
    });

    it("maps imported createdAt → created_at", () => {
      expect(normalizeIssue({ createdAt: iso }).created_at).toBe(iso);
    });

    it("maps imported createdTime → created_at", () => {
      expect(normalizeIssue({ createdTime: iso }).created_at).toBe(iso);
    });

    it("prefers created_at over imported variants", () => {
      const r = normalizeIssue({ created_at: "2026-01-01", createdAt: iso });
      expect(r.created_at).toBe("2026-01-01");
    });

    it("leaves date fields undefined when all sources are missing", () => {
      const r = normalizeIssue({});
      expect(r.updated_at).toBeUndefined();
      expect(r.created_at).toBeUndefined();
    });
  });

  // ── Idempotency & immutability ────────────────────────────────────────
  describe("idempotency & safety", () => {
    it("is idempotent — normalizing twice yields same result", () => {
      const raw = { status: "Done", type: "task", priority: "High" };
      const once = normalizeIssue(raw);
      const twice = normalizeIssue(once);
      expect(twice.status).toBe(once.status);
      expect(twice.issue_type).toBe(once.issue_type);
      expect(twice.priority).toBe(once.priority);
    });

    it("preserves all original fields (pass-through)", () => {
      const raw = {
        key: "test-1",
        title: "Sample issue",
        description: "A test issue",
        labels: ["bug", "frontend"],
        story_points: 5,
        custom_field: { nested: true }
      };
      const r = normalizeIssue(raw) as Record<string, unknown>;
      expect(r.key).toBe("test-1");
      expect(r.title).toBe("Sample issue");
      expect(r.description).toBe("A test issue");
      expect(r.labels).toEqual(["bug", "frontend"]);
      expect(r.story_points).toBe(5);
      expect(r.custom_field).toEqual({ nested: true });
    });

    it("does not throw on null/undefined input fields", () => {
      expect(() => normalizeIssue({ status: null, type: undefined, priority: null })).not.toThrow();
    });

    it("handles empty object gracefully", () => {
      const r = normalizeIssue({});
      expect(r.status).toBe("");
      expect(r.issue_type).toBe("task");
      expect(r.priority).toBe("medium");
      expect(r.assignee).toBe("");
    });
  });

  // ── Real-world scenario: full imported issue ─────────────────────────
  describe("real-world imported issue", () => {
    it("normalizes a complete Linear/Jira import record", () => {
      const imported = {
        key: "36cf2dda-5645-47bf-9019-06ece326e65a",
        title: "Migrate rpc to new API",
        status: "Done",
        module: "rpc",
        project_key: "YiVad",
        type: "task",
        createdAt: "2026-09-02T21:50:00Z",
        createdTime: "2026-09-20T02:06:51.194069Z",
        updatedTime: "2026-09-20T02:06:51.194069Z",
        order: 255
      };

      const r = normalizeIssue(imported) as Record<string, unknown>;
      expect(r.status).toBe("done");
      expect(r.issue_type).toBe("task");
      expect(r.priority).toBe("medium");
      expect(r.assignee).toBe("");
      expect(r.updated_at).toBe("2026-09-20T02:06:51.194069Z");
      expect(r.created_at).toBe("2026-09-02T21:50:00Z");
      // Original fields preserved
      expect(r.key).toBe(imported.key);
      expect(r.title).toBe(imported.title);
      expect(r.module).toBe("rpc");
    });

    it("normalizes a mixed native + import issue correctly", () => {
      const mixed = {
        key: "yivad-1",
        project_key: "yivad",
        title: "aiChat port from YiWeb",
        status: "done",
        priority: "high",
        issue_type: "feature",
        assignee: "Chengliang Yi",
        due_date: "2026-07-27",
        created_at: "2026-07-26T00:00:00.000Z",
        updated_at: "2026-07-27T00:00:00.000Z"
      };

      const r = normalizeIssue(mixed);
      // Native fields pass through unchanged
      expect(r.status).toBe("done");
      expect(r.priority).toBe("high");
      expect(r.issue_type).toBe("feature");
      expect(r.assignee).toBe("Chengliang Yi");
      expect(r.updated_at).toBe("2026-07-27T00:00:00.000Z");
    });
  });
});