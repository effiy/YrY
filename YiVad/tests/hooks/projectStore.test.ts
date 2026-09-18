import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("@/api/modules/projectService", () => ({
  getProjectList: vi.fn().mockResolvedValue({ data: { list: [{ key: "p1", name: "Project 1" }], total: 1 } }),
  getProject: vi.fn().mockResolvedValue({ data: { list: [{ key: "p1", name: "Project 1" }] } }),
  createProject: vi.fn().mockResolvedValue({ code: 0 }),
  updateProject: vi.fn().mockResolvedValue({ code: 0 }),
  deleteProject: vi.fn().mockResolvedValue({ code: 0 }),
}));

import { useProjectStore } from "@/stores/modules/project";

describe("useProjectStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("starts with empty projects", () => {
    const store = useProjectStore();
    expect(store.projects).toHaveLength(0);
    expect(store.total).toBe(0);
    expect(store.loading).toBe(false);
  });

  it("fetchProjects populates list", async () => {
    const store = useProjectStore();
    await store.fetchProjects();
    expect(store.projects).toHaveLength(1);
    expect(store.total).toBe(1);
    expect(store.projects[0].name).toBe("Project 1");
  });

  it("fetchProject loads single project", async () => {
    const store = useProjectStore();
    const result = await store.fetchProject("p1");
    expect(store.currentProject?.name).toBe("Project 1");
  });

  it("loading flag toggles during fetch", async () => {
    const store = useProjectStore();
    const promise = store.fetchProjects();
    expect(store.loading).toBe(true);
    await promise;
    expect(store.loading).toBe(false);
  });
});
