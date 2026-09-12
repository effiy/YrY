class ShortcutAnalytics {
  private usageCount: Map<string, number> = new Map();
  private lastUsed: Map<string, number> = new Map();

  recordUsage(shortcutId: string): void {
    this.usageCount.set(shortcutId, (this.usageCount.get(shortcutId) || 0) + 1);
    this.lastUsed.set(shortcutId, Date.now());
  }

  getUnused(days: number): string[] {
    const threshold = Date.now() - days * 86400000;
    const result: string[] = [];
    for (const [id, timestamp] of this.lastUsed) {
      if (timestamp < threshold) result.push(id);
    }
    return result;
  }

  getMostUsed(limit: number): Array<{ id: string; count: number }> {
    const entries = Array.from(this.usageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({ id, count }));
    return entries;
  }
}

export const shortcutAnalytics = new ShortcutAnalytics();