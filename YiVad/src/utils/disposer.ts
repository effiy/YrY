/**
 * DisposerBag —— 资源清理原语。
 *
 * 统一托管 Timer 句柄、AbortController、自定义清理函数。
 * 保证 `dispose()` 幂等，可安全多次调用。
 *
 * 使用约定：
 *   - 任何创建 setTimeout/setInterval 的模块都必须把返回句柄 addTimer 到 bag；
 *   - 任何创建 AbortController 的模块都必须 addAbort 到 bag；
 *   - 组件卸载、Hook 停止、请求 cancel 触发时，统一调 bag.dispose()。
 */
type TimerHandle = number | ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

type Entry =
  | { kind: "timer"; handle: TimerHandle }
  | { kind: "abort"; ctrl: AbortController }
  | { kind: "fn"; fn: () => void };

export class DisposerBag {
  private readonly entries: Set<Entry> = new Set();
  private disposed = false;

  /** 添加一个 timer 句柄（setTimeout/setInterval/setInterval 返回的 number 或对象均可） */
  addTimer(handle: TimerHandle): void {
    if (this.disposed) {
      this.clearTimer(handle);
      return;
    }
    this.entries.add({ kind: "timer", handle });
  }

  /** 添加一个 AbortController；dispose 时会调用 abort() */
  addAbort(ctrl: AbortController): void {
    if (this.disposed) {
      try {
        ctrl.abort();
      } catch {
        /* noop */
      }
      return;
    }
    this.entries.add({ kind: "abort", ctrl });
  }

  /** 添加一个自定义清理函数；dispose 时按添加顺序反序执行 */
  addFn(fn: () => void): void {
    if (this.disposed) {
      try {
        fn();
      } catch {
        /* noop */
      }
      return;
    }
    this.entries.add({ kind: "fn", fn });
  }

  /** 幂等清理；返回 true 表示本次是首次触发清理，false 表示已 clean */
  dispose(): boolean {
    if (this.disposed) return false;
    this.disposed = true;
    // 反向遍历，保证 fn 执行顺序更可预测（栈式）
    const items = Array.from(this.entries).reverse();
    this.entries.clear();
    for (const entry of items) {
      try {
        if (entry.kind === "timer") this.clearTimer(entry.handle);
        else if (entry.kind === "abort") entry.ctrl.abort();
        else entry.fn();
      } catch {
        /* dispose 绝不抛错，避免污染上层卸载流程 */
      }
    }
    return true;
  }

  /** 当前是否已清理 */
  get isDisposed(): boolean {
    return this.disposed;
  }

  /** 估算当前托管句柄数（用于调试/断言） */
  get size(): number {
    return this.entries.size;
  }

  private clearTimer(handle: TimerHandle): void {
    try {
      if (typeof handle === "number") {
        clearTimeout(handle);
        clearInterval(handle);
      } else if (handle && typeof (handle as any).unref === "function") {
        // Node / browser 返回的 Timeout 对象
        clearTimeout(handle as any);
        clearInterval(handle as any);
      }
    } catch {
      /* noop */
    }
  }
}
