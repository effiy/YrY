/**
 * LTTB (Largest-Triangle-Three-Buckets) 降采样算法
 * 将 N 个数据点降采样到 M 个，保留视觉趋势特征
 */
export function lttb(data: [number, number][], threshold: number): [number, number][] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold <= 2) return data.slice();

  const sampled: [number, number][] = [];
  const bucketSize = (dataLength - 2) / (threshold - 2);

  sampled.push(data[0]);

  let a = 1;
  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor(i * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 1) * bucketSize) + 1;
    const rangeStart = Math.max(a, avgRangeStart);
    const rangeEnd = Math.min(dataLength - 2, avgRangeEnd);

    if (rangeEnd <= rangeStart) continue;

    const nextRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const nextRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const nextA = Math.min(dataLength - 1, nextRangeStart);

    let avgX = 0, avgY = 0;
    const avgCount = Math.max(1, nextRangeEnd - nextA);
    for (let j = nextA; j < nextRangeEnd; j++) {
      avgX += data[j][0];
      avgY += data[j][1];
    }
    avgX /= avgCount;
    avgY /= avgCount;

    let maxArea = -1;
    let maxAreaIndex = rangeStart;
    const pointA = data[a - 1];

    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (pointA[0] - avgX) * (data[j][1] - pointA[1]) -
        (pointA[0] - data[j][0]) * (avgY - pointA[1])
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }

    sampled.push(data[maxAreaIndex]);
    a = maxAreaIndex + 1;
  }

  sampled.push(data[dataLength - 1]);
  return sampled;
}

export const DOWNSAMPLE_THRESHOLD = 10000;

export function shouldDownsample(dataLength: number): boolean {
  return dataLength > DOWNSAMPLE_THRESHOLD;
}

export function getDownsampleTarget(viewWidth: number): number {
  if (viewWidth >= 1920) return 1000;
  if (viewWidth >= 960) return 500;
  if (viewWidth >= 480) return 200;
  return 100;
}

export function downsampleTimeSeries(
  data: number[],
  targetLength: number,
): { data: number[]; indices: number[] } {
  if (data.length <= targetLength) return { data, indices: data.map((_, i) => i) };

  const pairs: [number, number][] = data.map((v, i) => [i, v]);
  const sampled = lttb(pairs, targetLength);

  return {
    data: sampled.map(p => p[1]),
    indices: sampled.map(p => p[0]),
  };
}