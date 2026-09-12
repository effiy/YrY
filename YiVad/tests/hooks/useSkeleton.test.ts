import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSkeleton } from "@/hooks/useSkeleton";

describe("useSkeleton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("initial state is not visible", () => {
    const { visible } = useSkeleton();
    expect(visible.value).toBe(false);
  });

  it("show does not set visible before delayMs", () => {
    const { visible, show } = useSkeleton(300, 100);
    show();
    vi.advanceTimersByTime(50);
    expect(visible.value).toBe(false);
  });

  it("show sets visible after delayMs", () => {
    const { visible, show } = useSkeleton(300, 100);
    show();
    vi.advanceTimersByTime(150);
    expect(visible.value).toBe(true);
  });

  it("hide keeps visible for minDisplayMs then hides", () => {
    const { visible, show, hide } = useSkeleton(300, 0);
    show();
    vi.advanceTimersByTime(0);
    expect(visible.value).toBe(true);
    hide();
    expect(visible.value).toBe(true); // still visible during min window
    vi.advanceTimersByTime(350);
    expect(visible.value).toBe(false);
  });

  it("hide fires when minDisplayMs has elapsed", () => {
    const { visible, show, hide } = useSkeleton(200, 0);
    show();
    vi.advanceTimersByTime(0);
    expect(visible.value).toBe(true);
    // Advance past minDisplayMs
    vi.advanceTimersByTime(500);
    hide();
    // hide uses Date.now() internally; need to advance past minDisplayMs
    vi.advanceTimersByTime(250);
    expect(visible.value).toBe(false);
  });

  it("quick show/hide clears timer and never shows", () => {
    const { visible, show, hide } = useSkeleton(300, 100);
    show();
    vi.advanceTimersByTime(50);
    hide();
    vi.advanceTimersByTime(200);
    expect(visible.value).toBe(false);
  });

  it("handles custom parameters", () => {
    const { visible, show } = useSkeleton(500, 200);
    show();
    vi.advanceTimersByTime(150);
    expect(visible.value).toBe(false);
    vi.advanceTimersByTime(100);
    expect(visible.value).toBe(true);
  });
});