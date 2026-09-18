/** Web Worker pool for off-main-thread export generation. */
import type { WorkerMessage, WorkerResponse } from "./export.worker";

type Resolver = (content: string) => void;
type Rejecter = (err: Error) => void;

const pending = new Map<string, { resolve: Resolver; reject: Rejecter }>();
let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./export.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, type, content, error } = e.data;
      const entry = pending.get(id);
      if (!entry) return;
      pending.delete(id);
      if (type === "result" && content !== undefined) {
        entry.resolve(content);
      } else {
        entry.reject(new Error(error ?? "Unknown worker error"));
      }
    };
    worker.onerror = () => {
      // Reject all pending on worker crash
      for (const [id, entry] of pending) {
        entry.reject(new Error("Export worker crashed"));
        pending.delete(id);
      }
    };
  }
  return worker;
}

let idCounter = 0;

/** Run export generation in a Web Worker. Falls back to main thread if Worker unavailable. */
export function runInWorker(msg: Omit<WorkerMessage, "id">): Promise<string> {
  const id = `w${++idCounter}`;
  return new Promise((resolve, reject) => {
    try {
      const w = getWorker();
      pending.set(id, { resolve, reject });
      w.postMessage({ ...msg, id } satisfies WorkerMessage);
    } catch {
      // Worker unavailable — reject so caller can fall back to main thread
      reject(new Error("Worker unavailable"));
    }
  });
}

/** Release the worker instance. Call when the app unmounts. */
export function disposeWorker() {
  worker?.terminate();
  worker = null;
  for (const [, entry] of pending) {
    entry.reject(new Error("Worker disposed"));
  }
  pending.clear();
}
