/**
 * LTTB (Largest-Triangle-Three-Buckets) downsampling algorithm.
 * Reduces N data points to M while preserving visual trend characteristics.
 * Time complexity: O(N), Space complexity: O(M).
 */
export function lttb(data: [number, number][], threshold: number): [number, number][] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold <= 2) return [...data];

  const sampled: [number, number][] = [];
  sampled.push(data[0]);

  const bucketSize = (dataLength - 2) / (threshold - 2);
  let a = 1;

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor(i * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 1) * bucketSize) + 1;
    const rangeStart = Math.max(a, avgRangeStart);
    const rangeEnd = Math.min(dataLength - 2, avgRangeEnd);

    const nextRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const nextRangeEnd = Math.min(dataLength, Math.floor((i + 2) * bucketSize) + 1);
    const nextA = Math.min(dataLength - 1, nextRangeStart);

    if (rangeEnd <= rangeStart) continue;

    let avgX = 0,
      avgY = 0;
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
      const area = Math.abs((pointA[0] - avgX) * (data[j][1] - pointA[1]) - (pointA[0] - data[j][0]) * (avgY - pointA[1])) * 0.5;

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

export function shouldDownsample(dataLength: number, viewportWidth: number): boolean {
  const maxVisiblePoints = Math.max(100, Math.floor(viewportWidth / 1.5));
  return dataLength > maxVisiblePoints;
}

export function getThreshold(dataLength: number, viewportWidth: number): number {
  return Math.max(100, Math.floor(viewportWidth / 1.5));
}
