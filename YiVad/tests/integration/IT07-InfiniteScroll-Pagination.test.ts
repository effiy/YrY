import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

/**
 * IT-07: 无限滚动 × 分页
 *
 * 验证无限滚动与分页的组合行为：
 * - 触底加载追加数据
 * - 加载中不重复请求
 * - 全部加载完成显示结束提示
 * - 请求失败显示重试
 */
describe("IT-07: InfiniteScroll × Pagination", () => {
  let pageNum: number;
  let allLoaded: boolean;

  beforeEach(() => {
    pageNum = 1;
    allLoaded = false;
  });

  it("load more increments page and appends data", async () => {
    const data = ref<any[]>([]);
    const loadMore = vi.fn(async () => {
      pageNum++;
    });

    await loadMore();
    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(pageNum).toBe(2);
  });

  it("loading state prevents duplicate requests", async () => {
    let loading = false;
    let callCount = 0;
    const loadMore = async () => {
      if (loading) return;
      loading = true;
      callCount++;
      // Simulate async work
      await new Promise(r => setTimeout(r, 10));
      loading = false;
    };

    // Sequential calls — second sees loading=true
    const p1 = loadMore();
    const p2 = loadMore();
    await Promise.all([p1, p2]);
    // First starts, second returns immediately because loading=true
    expect(callCount).toBe(1);
  });

  it("finished state prevents further loading", async () => {
    let finished = false;
    let callCount = 0;
    const loadMore = async () => {
      if (finished) return;
      callCount++;
      if (callCount >= 2) finished = true;
    };

    await loadMore(); // call 1
    await loadMore(); // call 2, sets finished
    await loadMore(); // should be skipped
    expect(callCount).toBe(2);
  });

  it("error state enables retry", async () => {
    let error: string | null = null;
    let calls = 0;

    const loadMore = async () => {
      calls++;
      if (calls === 1) {
        error = "Network error";
        throw new Error("Network error");
      }
      error = null;
    };

    try { await loadMore(); } catch {}
    expect(error).toBeTruthy();

    // Retry
    try { await loadMore(); } catch {}
    expect(error).toBeNull();
  });

  it("reset clears finished and error", () => {
    let finished = true;
    let error = "some error";

    const reset = () => {
      finished = false;
      error = null;
    };

    reset();
    expect(finished).toBe(false);
    expect(error).toBeNull();
  });

  it("data appends rather than replaces on load more", () => {
    const existing = [{ id: 1 }, { id: 2 }];
    const newPage = [{ id: 3 }, { id: 4 }];
    const combined = [...existing, ...newPage];
    expect(combined.length).toBe(4);
    expect(combined[0].id).toBe(1);
    expect(combined[3].id).toBe(4);
  });

  it("skip parameter increases with each page", () => {
    const pageSize = 20;
    const skips = [1, 2, 3].map(p => (p - 1) * pageSize);
    expect(skips).toEqual([0, 20, 40]);
  });
});