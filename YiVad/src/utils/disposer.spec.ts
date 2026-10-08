import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DisposerBag } from "@/utils/disposer";

describe("DisposerBag", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("TR-1.1 dispose 清理 timer+AbortController+fn", () => {
    it("should clear all added timers on dispose", () => {
      const bag = new DisposerBag();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const t1 = setTimeout(() => {}, 1000);
      const t2 = setInterval(() => {}, 500);
      const t3 = 42 as unknown as number;

      bag.addTimer(t1);
      bag.addTimer(t2);
      bag.addTimer(t3);

      expect(bag.size).toBe(3);
      expect(bag.isDisposed).toBe(false);

      const result = bag.dispose();
      expect(result).toBe(true);

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(bag.size).toBe(0);
      expect(bag.isDisposed).toBe(true);
    });

    it("should abort all AbortControllers on dispose", () => {
      const bag = new DisposerBag();
      const ctrl1 = new AbortController();
      const ctrl2 = new AbortController();

      bag.addAbort(ctrl1);
      bag.addAbort(ctrl2);

      expect(ctrl1.signal.aborted).toBe(false);
      expect(ctrl2.signal.aborted).toBe(false);

      bag.dispose();

      expect(ctrl1.signal.aborted).toBe(true);
      expect(ctrl2.signal.aborted).toBe(true);
    });

    it("should execute all added fns in reverse order on dispose", () => {
      const bag = new DisposerBag();
      const order: number[] = [];

      const fn1 = () => order.push(1);
      const fn2 = () => order.push(2);
      const fn3 = () => order.push(3);

      bag.addFn(fn1);
      bag.addFn(fn2);
      bag.addFn(fn3);

      bag.dispose();

      expect(order).toEqual([3, 2, 1]);
    });

    it("should clear timer, abort ctrl and execute fn together", () => {
      const bag = new DisposerBag();
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
      const ctrl = new AbortController();
      let fnCalled = false;

      const t = setTimeout(() => {}, 100);
      bag.addTimer(t);
      bag.addAbort(ctrl);
      bag.addFn(() => {
        fnCalled = true;
      });

      bag.dispose();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(t);
      expect(ctrl.signal.aborted).toBe(true);
      expect(fnCalled).toBe(true);
      expect(bag.isDisposed).toBe(true);
      expect(bag.size).toBe(0);
    });

    it("should not throw even if fn throws during dispose", () => {
      const bag = new DisposerBag();
      bag.addFn(() => {
        throw new Error("boom");
      });
      bag.addFn(() => {
        throw new Error("boom2");
      });

      expect(() => bag.dispose()).not.toThrow();
      expect(bag.isDisposed).toBe(true);
    });

    it("should immediately clear/abort/execute if added after disposed", () => {
      const bag = new DisposerBag();
      bag.dispose();

      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
      const t = setTimeout(() => {}, 100);
      bag.addTimer(t);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(t);

      const ctrl = new AbortController();
      bag.addAbort(ctrl);
      expect(ctrl.signal.aborted).toBe(true);

      let fnCalled = false;
      bag.addFn(() => {
        fnCalled = true;
      });
      expect(fnCalled).toBe(true);
    });
  });

  describe("TR-1.2 dispose 幂等", () => {
    it("should return true on first dispose, false on subsequent calls", () => {
      const bag = new DisposerBag();
      bag.addFn(() => {});

      const r1 = bag.dispose();
      const r2 = bag.dispose();
      const r3 = bag.dispose();

      expect(r1).toBe(true);
      expect(r2).toBe(false);
      expect(r3).toBe(false);
    });

    it("should only execute fns once even if dispose called multiple times", () => {
      const bag = new DisposerBag();
      let count = 0;
      bag.addFn(() => count++);

      bag.dispose();
      bag.dispose();
      bag.dispose();

      expect(count).toBe(1);
    });

    it("should only abort once even if dispose called multiple times", () => {
      const bag = new DisposerBag();
      const ctrl = new AbortController();
      let abortCount = 0;

      ctrl.signal.addEventListener("abort", () => abortCount++);
      bag.addAbort(ctrl);

      bag.dispose();
      bag.dispose();

      expect(abortCount).toBe(1);
    });

    it("isDisposed should remain true after multiple dispose calls", () => {
      const bag = new DisposerBag();
      expect(bag.isDisposed).toBe(false);

      bag.dispose();
      expect(bag.isDisposed).toBe(true);

      bag.dispose();
      expect(bag.isDisposed).toBe(true);
    });
  });
});
