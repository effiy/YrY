export interface MetricEvent {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface MetricAggregate {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50?: number;
  p95?: number;
  p99?: number;
  firstTimestamp: number;
  lastTimestamp: number;
  tags?: Record<string, string>;
}

export class MetricsRecorder {
  private readonly buffer: MetricEvent[] = [];
  private readonly capacity: number;

  constructor(capacity = 2000) {
    this.capacity = capacity;
  }

  push(name: string, value: number, tags?: Record<string, string>): void {
    const event: MetricEvent = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };
    if (this.buffer.length >= this.capacity) {
      this.buffer.shift();
    }
    this.buffer.push(event);
  }

  getBuffer(): readonly MetricEvent[] {
    return this.buffer;
  }

  getCapacity(): number {
    return this.capacity;
  }

  get size(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer.length = 0;
  }

  aggregate(name?: string): MetricAggregate[] {
    const groups = new Map<string, MetricEvent[]>();

    for (const event of this.buffer) {
      if (name && event.name !== name) continue;
      const key = this.groupKey(event);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    }

    const results: MetricAggregate[] = [];
    for (const [, events] of groups) {
      if (events.length === 0) continue;
      const sorted = [...events].sort((a, b) => a.value - b.value);
      const values = sorted.map((e) => e.value);
      const count = events.length;
      const sum = values.reduce((acc, v) => acc + v, 0);
      const avg = sum / count;
      const min = values[0];
      const max = values[count - 1];
      const p50 = this.percentile(values, 50);
      const p95 = this.percentile(values, 95);
      const p99 = this.percentile(values, 99);

      const timestamps = events.map((e) => e.timestamp);
      const firstTimestamp = Math.min(...timestamps);
      const lastTimestamp = Math.max(...timestamps);

      results.push({
        name: events[0].name,
        count,
        sum,
        avg,
        min,
        max,
        p50,
        p95,
        p99,
        firstTimestamp,
        lastTimestamp,
        tags: events[0].tags,
      });
    }

    return results;
  }

  private groupKey(event: MetricEvent): string {
    if (!event.tags) return event.name;
    const tagStr = Object.entries(event.tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(",");
    return `${event.name}|${tagStr}`;
  }

  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    if (sortedValues.length === 1) return sortedValues[0];
    const idx = (p / 100) * (sortedValues.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sortedValues[lower];
    const weight = idx - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }
}
