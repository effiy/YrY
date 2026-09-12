import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectCard from "@/views/project/components/ProjectCard.vue";
import { EMPTY_STATS } from "@/views/project/types";
import type { Project } from "@/api/modules/projectService";

const baseProject: Project = {
  key: "PL",
  identifier: "PL",
  name: "Platform",
  description: "Core platform infrastructure",
  status: "active",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  members: [],
  links: [],
  starred: false,
};

describe("ProjectCard", () => {
  it("renders project name", () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    expect(wrapper.text()).toContain("Platform");
  });

  it("renders status tag", () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    expect(wrapper.text()).toContain("active");
  });

  it("applies selected class when selected is true", () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: true,
      },
    });
    expect(wrapper.classes()).toContain("pc-card--selected");
  });

  it("emits open event when card is clicked", async () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("open")).toBeTruthy();
  });

  it("emits toggle-star when star button is clicked", async () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    await wrapper.find(".pc-star").trigger("click");
    expect(wrapper.emitted("toggle-star")).toBeTruthy();
  });

  it("renders risk chips when risks are present", () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: ["overdue", "stale"],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    const chips = wrapper.findAll(".pc-risk-chip");
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it("renders no members placeholder when members is empty", () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: EMPTY_STATS,
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    expect(wrapper.text()).toContain("No members");
  });

  it("renders metric values from stats", () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: baseProject,
        stats: { ...EMPTY_STATS, issues: 42, totalBugs: 7, totalModules: 12 },
        risks: [],
        health: "good",
        descHtml: "<p>test</p>",
        starred: false,
        selected: false,
      },
    });
    expect(wrapper.text()).toContain("42");
    expect(wrapper.text()).toContain("7");
    expect(wrapper.text()).toContain("12");
  });
});