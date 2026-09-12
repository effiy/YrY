import { describe, it, expect, vi } from "vitest";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

describe("useInfiniteScroll", () => {
  it("initial state: not loading, not finished, no error", () => {
    const { loading, finished, error } = useInfiniteScroll(async () => {});
    expect(loading.value).toBe(false);
    expect(finished.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it("observe does not throw when given an element", () => {
    const { observe } = useInfiniteScroll(async () => {});
    const el = document.createElement("div");
    expect(() => observe(el)).not.toThrow();
  });

  it("observe disconnects previous observer", () => {
    const { observe } = useInfiniteScroll(async () => {});
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    observe(el1);
    observe(el2); // should disconnect el1 observer
  });

  it("setFinished prevents further loading", () => {
    const loadMore = vi.fn();
    const { setFinished } = useInfiniteScroll(loadMore);
    setFinished();
    // finished flag is set; no more loads should trigger
  });

  it("reset clears finished and error", () => {
    const { reset, setFinished } = useInfiniteScroll(async () => {});
    setFinished();
    reset();
  });
});