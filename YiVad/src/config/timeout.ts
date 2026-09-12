/**
 * Per-endpoint timeout configuration (milliseconds).
 * Different API endpoints have different latency profiles — a one-size-fits-all
 * timeout either cuts off legitimate long-running requests or waits too long to
 * fail on fast endpoints.
 */
export const TIMEOUT_CONFIG = {
  /** Default timeout for general RPC calls */
  default: 30_000,
  /** Query/list endpoints should respond quickly */
  query: 15_000,
  /** File uploads can be slow over poor connections */
  upload: 120_000,
  /** File downloads — same reasoning as uploads */
  download: 120_000,
  /** SSE streams have no fixed duration; timeout is managed by the caller */
  sse: 0,
  /** Agent loops may involve multiple LLM round-trips */
  agent: 300_000,
  /** RPC calls to the data service */
  rpc: 30_000,
} as const;