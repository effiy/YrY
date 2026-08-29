import { describe, it, expect } from "vitest";
import { injectCitations } from "@/utils/citations";

describe("injectCitations", () => {
  it("returns input unchanged when sourceCount is 0", () => {
    const html = "<p>See [1] for details</p>";
    expect(injectCitations(html, 0)).toBe(html);
  });

  it("returns input unchanged when html is empty", () => {
    expect(injectCitations("", 5)).toBe("");
  });

  it("wraps valid citation numbers in sup tags", () => {
    const result = injectCitations("<p>See [1] and [2]</p>", 3);
    expect(result).toContain('<sup class="cite-chip" data-cite-idx="1">[1]</sup>');
    expect(result).toContain('<sup class="cite-chip" data-cite-idx="2">[2]</sup>');
  });

  it("leaves out-of-range citations unchanged", () => {
    const result = injectCitations("<p>See [5]</p>", 3);
    expect(result).toBe("<p>See [5]</p>");
  });

  it("leaves citations inside <pre> tags unchanged", () => {
    const html = "<pre>code [1] here</pre><p>text [1] here</p>";
    const result = injectCitations(html, 3);
    expect(result).toContain("<pre>code [1] here</pre>");
    expect(result).toContain('<sup class="cite-chip" data-cite-idx="1">[1]</sup>');
  });

  it("leaves citations inside <code> tags unchanged", () => {
    const html = "<code>var[0]</code><p>see [1]</p>";
    const result = injectCitations(html, 3);
    expect(result).toContain("<code>var[0]</code>");
    expect(result).toContain('<sup class="cite-chip" data-cite-idx="1">[1]</sup>');
  });
});