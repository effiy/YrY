/**
 * Critical path calculation using topological sort + earliest/latest start times.
 */
import type { GanttTask, CriticalPathResult } from "@/types/gantt";

export function calcCriticalPath(tasks: GanttTask[]): CriticalPathResult {
  if (tasks.length === 0) return { path: [], totalDays: 0 };

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const t of tasks) {
    if (!inDegree.has(t.id)) inDegree.set(t.id, 0);
    if (!adj.has(t.id)) adj.set(t.id, []);
    for (const dep of t.dependencies) {
      if (!adj.has(dep)) adj.set(dep, []);
      adj.get(dep)!.push(t.id);
      inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
    }
  }

  // Topological sort (Kahn)
  const sorted: string[] = [];
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  while (queue.length) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const neighbor of adj.get(node) || []) {
      const deg = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  // Earliest start/finish (forward pass)
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  for (const id of sorted) {
    const task = taskMap.get(id);
    if (!task) continue;
    const startDate = new Date(task.start_date).getTime();
    const endDate = new Date(task.end_date).getTime();
    const duration = Math.max(1, (endDate - startDate) / 86_400_000);

    let earliestStart = startDate;
    for (const dep of task.dependencies) {
      const depEf = ef.get(dep);
      if (depEf && depEf > earliestStart) earliestStart = depEf;
    }
    es.set(id, earliestStart);
    ef.set(id, earliestStart + duration * 86_400_000);
  }

  // Latest start/finish (backward pass)
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();
  const maxEf = Math.max(...Array.from(ef.values()), 0);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const id = sorted[i];
    const task = taskMap.get(id);
    if (!task) continue;
    const duration = Math.max(1, (new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / 86_400_000);

    let latestFinish = maxEf;
    for (const neighbor of adj.get(id) || []) {
      const neighborLs = ls.get(neighbor);
      if (neighborLs && neighborLs < latestFinish) latestFinish = neighborLs;
    }
    lf.set(id, latestFinish);
    ls.set(id, latestFinish - duration * 86_400_000);
  }

  // Critical path: tasks where ES == LS
  const criticalIds = sorted.filter((id) => {
    const taskEs = es.get(id);
    const taskLs = ls.get(id);
    return taskEs !== undefined && taskLs !== undefined && Math.abs(taskEs - taskLs) < 1000;
  });

  return {
    path: criticalIds,
    totalDays: Math.round((maxEf - Math.min(...Array.from(es.values()), Date.now())) / 86_400_000),
  };
}