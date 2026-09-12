import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SvgIcon from "@/components/SvgIcon/index.vue";

describe("SvgIcon", () => {
  it("renders an svg element", () => {
    const wrapper = mount(SvgIcon, { props: { name: "test" } });
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("uses the default prefix 'icon'", () => {
    const wrapper = mount(SvgIcon, { props: { name: "home" } });
    const use = wrapper.find("use");
    expect(use.attributes("href")).toBe("#icon-home");
  });

  it("uses a custom prefix", () => {
    const wrapper = mount(SvgIcon, { props: { name: "close", prefix: "ep" } });
    const use = wrapper.find("use");
    expect(use.attributes("href")).toBe("#ep-close");
  });

  it("applies default icon style", () => {
    const wrapper = mount(SvgIcon, { props: { name: "test" } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("style")).toContain("width: 100px");
    expect(svg.attributes("style")).toContain("height: 100px");
  });

  it("applies custom icon style", () => {
    const wrapper = mount(SvgIcon, {
      props: { name: "test", iconStyle: { width: "24px", color: "red" } },
    });
    const svg = wrapper.find("svg");
    expect(svg.attributes("style")).toContain("width: 24px");
    expect(svg.attributes("style")).toContain("color: red");
  });

  it("marks svg as aria-hidden", () => {
    const wrapper = mount(SvgIcon, { props: { name: "test" } });
    expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true");
  });
});