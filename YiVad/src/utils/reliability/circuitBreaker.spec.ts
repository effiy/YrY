import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CircuitBreaker, getCircuit, clearCircuitRegistry, CircuitState } from "@/utils/reliability/circuitBreaker";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearCircuitRegistry();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("TR-2.1 三次失败触发熔断（fake timers 120s）", () => {
    it("should start in closed state", () => {
      const cb = new CircuitBreaker();
      expect(cb.getState()).toBe("closed");
      expect(cb.canExecute()).toBe(true);
    });

    it("should allow execution in closed state", () => {
      const cb = new CircuitBreaker();
      const result = cb.execute(() => 42);
      expect(result).toBe(42);
      expect(cb.getState()).toBe("closed");
    });

    it("should record first 2 failures without opening", () => {
      const cb = new CircuitBreaker();

      expect(() => cb.execute(() => {
        throw new Error("err1");
      })).toThrow("err1");
      expect(cb.getState()).toBe("closed");
      expect(cb.getFailureCount()).toBe(1);
      expect(cb.canExecute()).toBe(true);

      expect(() => cb.execute(() => {
        throw new Error("err2");
      })).toThrow("err2");
      expect(cb.getState()).toBe("closed");
      expect(cb.getFailureCount()).toBe(2);
      expect(cb.canExecute()).toBe(true);
    });

    it("should open circuit after 3 consecutive failures", () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 120000 });
      const start = Date.now();

      for (let i = 1; i <= 2; i++) {
        expect(() => cb.execute(() => {
          throw new Error(`err${i}`);
        })).toThrow(`err${i}`);
        expect(cb.getState()).toBe("closed");
      }

      expect(() => cb.execute(() => {
        throw new Error("err3");
      })).toThrow("err3");

      expect(cb.getState()).toBe("open");
      expect(cb.getFailureCount()).toBe(3);
      expect(cb.canExecute()).toBe(false);
      expect(cb.getOpenedAt()).toBeGreaterThanOrEqual(start);
    });

    it("should reject execution when circuit is open", () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 120000 });

      for (let i = 0; i < 3; i++) {
        try {
          cb.execute(() => {
            throw new Error("err");
          });
        } catch {
          /* ignore */
        }
      }

      expect(cb.getState()).toBe("open");
      let fnCalled = false;
      expect(() => cb.execute(() => {
        fnCalled = true;
        return "x";
      })).toThrow("CircuitBreaker: circuit is open");
      expect(fnCalled).toBe(false);
    });

    it("should remain open for resetTimeoutMs (120s) using fake timers", () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 120000 });

      for (let i = 0; i < 3; i++) {
        try {
          cb.execute(() => {
            throw new Error("err");
          });
        } catch {
          /* ignore */
        }
      }
      expect(cb.getState()).toBe("open");

      vi.advanceTimersByTime(60000);
      expect(cb.getState()).toBe("open");
      expect(cb.canExecute()).toBe(false);

      vi.advanceTimersByTime(59999);
      expect(cb.getState()).toBe("open");
      expect(cb.canExecute()).toBe(false);

      vi.advanceTimersByTime(1);
      expect(cb.getState()).toBe("half-open");
      expect(cb.canExecute()).toBe(true);
    });

    it("getCircuit registry should return same instance for same key", () => {
      const a = getCircuit("api-foo");
      const b = getCircuit("api-foo");
      const c = getCircuit("api-bar");
      expect(a).toBe(b);
      expect(a).not.toBe(c);
    });

    it("getCircuit registry should honor options on first create", () => {
      const cb = getCircuit("custom", { failureThreshold: 2, resetTimeoutMs: 5000 });
      expect(cb.getFailureThreshold()).toBe(2);
      expect(cb.getResetTimeoutMs()).toBe(5000);
    });
  });

  describe("TR-2.2 半开探测与恢复", () => {
    function makeOpenThenHalfOpen(): CircuitBreaker {
      const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 120000 });
      for (let i = 0; i < 3; i++) {
        try {
          cb.execute(() => {
            throw new Error("err");
          });
        } catch {
          /* ignore */
        }
      }
      expect(cb.getState()).toBe("open");
      vi.advanceTimersByTime(120000);
      expect(cb.getState()).toBe("half-open");
      return cb;
    }

    it("should transition to half-open after reset timeout", () => {
      const cb = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 120000 });
      for (let i = 0; i < 3; i++) {
        try {
          cb.execute(() => {
            throw new Error("err");
          });
        } catch {
          /* ignore */
        }
      }
      expect(cb.getState()).toBe("open");
      vi.advanceTimersByTime(120000);
      expect(cb.getState()).toBe("half-open");
    });

    it("should allow exactly 1 probe in half-open by default", () => {
      const cb = makeOpenThenHalfOpen();
      expect(cb.canExecute()).toBe(true);
      let called = 0;
      cb.execute(() => {
        called++;
        return 1;
      });
      expect(called).toBe(1);
    });

    it("should close circuit when half-open probe succeeds", () => {
      const cb = makeOpenThenHalfOpen();

      const result = cb.execute(() => "success");
      expect(result).toBe("success");
      expect(cb.getState()).toBe("closed");
      expect(cb.getFailureCount()).toBe(0);
      expect(cb.canExecute()).toBe(true);
    });

    it("should allow normal execution after recovery", () => {
      const cb = makeOpenThenHalfOpen();
      cb.execute(() => "probe-ok");
      expect(cb.getState()).toBe("closed");

      for (let i = 0; i < 10; i++) {
        expect(cb.execute(() => i)).toBe(i);
      }
      expect(cb.getState()).toBe("closed");
    });

    it("should re-open circuit when half-open probe fails", () => {
      const cb = makeOpenThenHalfOpen();

      expect(() => cb.execute(() => {
        throw new Error("probe-fail");
      })).toThrow("probe-fail");

      expect(cb.getState()).toBe("open");
      expect(cb.canExecute()).toBe(false);
    });

    it("should re-open with new reset timeout on probe failure", () => {
      const cb = makeOpenThenHalfOpen();
      try {
        cb.execute(() => {
          throw new Error("probe-fail");
        });
      } catch {
        /* ignore */
      }
      expect(cb.getState()).toBe("open");

      vi.advanceTimersByTime(60000);
      expect(cb.getState()).toBe("open");

      vi.advanceTimersByTime(60000);
      expect(cb.getState()).toBe("half-open");
    });

    it("executeAsync should work with success path through half-open to closed", async () => {
      const cb = makeOpenThenHalfOpen();

      const r = await cb.executeAsync(async () => {
        return "async-ok";
      });
      expect(r).toBe("async-ok");
      expect(cb.getState()).toBe("closed");
    });

    it("executeAsync should work with failure path through half-open to open", async () => {
      const cb = makeOpenThenHalfOpen();

      await expect(() =>
        cb.executeAsync(async () => {
          throw new Error("async-fail");
        })
      ).rejects.toThrow("async-fail");

      expect(cb.getState()).toBe("open");
    });

    it("success in closed state should reset failureCount", () => {
      const cb = new CircuitBreaker({ failureThreshold: 3 });
      try {
        cb.execute(() => {
          throw new Error("e1");
        });
      } catch {
        /* ignore */
      }
      try {
        cb.execute(() => {
          throw new Error("e2");
        });
      } catch {
        /* ignore */
      }
      expect(cb.getFailureCount()).toBe(2);

      cb.execute(() => "ok");
      expect(cb.getFailureCount()).toBe(0);
      expect(cb.getState()).toBe("closed");
    });
  });
});
