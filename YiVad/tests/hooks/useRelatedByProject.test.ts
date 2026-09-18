import { describe, it, expect } from "vitest";
import { RELATED_TOPICS, RELATED_DOMAIN_ORDER, type RelatedDomain } from "@/hooks/useRelatedByProject";

describe("useRelatedByProject", () => {
  describe("RELATED_TOPICS", () => {
    it("has entries for all domains", () => {
      const domains = new Set(RELATED_TOPICS.map(t => t.domain));
      expect(domains.has("tl")).toBe(true);
      expect(domains.has("cr")).toBe(true);
      expect(domains.has("bug")).toBe(true);
      expect(domains.has("story")).toBe(true);
    });

    it("every topic has cname and route", () => {
      RELATED_TOPICS.forEach(t => {
        expect(t.cname).toBeTruthy();
        expect(t.route).toBeTruthy();
        expect(t.label).toBeTruthy();
      });
    });

    it("all cnames are unique", () => {
      const cnames = RELATED_TOPICS.map(t => t.cname);
      expect(new Set(cnames).size).toBe(cnames.length);
    });
  });

  describe("RELATED_DOMAIN_ORDER", () => {
    it("contains all 4 domains", () => {
      expect(RELATED_DOMAIN_ORDER).toHaveLength(4);
      expect(RELATED_DOMAIN_ORDER).toEqual(["tl", "cr", "bug", "story"]);
    });
  });
});
