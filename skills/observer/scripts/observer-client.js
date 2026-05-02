#!/usr/bin/env node

/**
 * observer-client.js
 *
 * Agent harness performance observer for the YiAi MCP (api.effiy.cn/mcp).
 *
 * Reliability features:
 *   - Memory explosion fix: circular telemetry buffer + tail sampling
 *   - Throttling: token-bucket per tool
 *   - Sandbox access fix: path / module validation
 *   - Lazy-start: SSE connection deferred until first call
 *   - Re-entrancy guard: call-depth tracking + deadlock prevention
 *
 * Usage:
 *   node observer-client.js --call read_file --args '{"target_file":"README.md"}'
 *   node observer-client.js --health
 *   node observer-client.js --flush
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { EventEmitter } = require('events');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const TELEMETRY_FILE = path.join(REPO_ROOT, 'docs', '.memory', 'observer-telemetry.jsonl');
const MAX_BUFFER_SIZE = 1000;
const FLUSH_INTERVAL_MS = 30000;
const MAX_REENTRANCY_DEPTH = 3;
const CONNECT_TIMEOUT_MS = 10000;
const CALL_TIMEOUT_MS = 30000;

// Token-bucket config per tool category
const THROTTLE_CONFIG = {
  default: { rate: 10, burst: 20 },
  read: { rate: 20, burst: 40 },
  write: { rate: 5, burst: 10 },
  execute: { rate: 2, burst: 4 },
  upload: { rate: 3, burst: 6 },
  message: { rate: 5, burst: 10 },
};

function getToolCategory(toolName) {
  if (toolName.startsWith('read_')) return 'read';
  if (toolName.startsWith('write_')) return 'write';
  if (toolName.startsWith('delete_')) return 'write';
  if (toolName.startsWith('rename_')) return 'write';
  if (toolName.startsWith('execute_module')) return 'execute';
  if (toolName.startsWith('upload_')) return 'upload';
  if (toolName.startsWith('send_wework')) return 'message';
  return 'default';
}

// ---------- Token Bucket ----------
class TokenBucket {
  constructor(rate, burst) {
    this.rate = rate;
    this.burst = burst;
    this.tokens = burst;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const delta = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.burst, this.tokens + delta * this.rate);
    this.lastRefill = now;
  }

  consume(tokens = 1) {
    this.refill();
    if (this.tokens < tokens) return false;
    this.tokens -= tokens;
    return true;
  }
}

// ---------- Circular Buffer with Tail Sampling ----------
class TelemetryBuffer {
  constructor(capacity = MAX_BUFFER_SIZE) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.size = 0;
    this.sampleCounter = {};
    this.sampleRates = {
      read_file: 1,
      write_file: 1,
      delete_file: 5, // sample 1 in 5
      execute_module_get: 1,
      execute_module_post: 1,
      upload_file: 2,
      send_wework_message: 1,
    };
  }

  shouldSample(toolName) {
    const rate = this.sampleRates[toolName] || 1;
    if (rate <= 1) return true;
    this.sampleCounter[toolName] = (this.sampleCounter[toolName] || 0) + 1;
    return this.sampleCounter[toolName] % rate === 0;
  }

  push(record) {
    if (!this.shouldSample(record.tool)) return;
    this.buffer[this.head] = record;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) this.size++;
  }

  toArray() {
    const out = [];
    for (let i = 0; i < this.size; i++) {
      const idx = (this.head - this.size + i + this.capacity) % this.capacity;
      out.push(this.buffer[idx]);
    }
    return out;
  }

  clear() {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.size = 0;
  }
}

// ---------- Sandbox Validator ----------
class SandboxValidator {
  constructor(allowedRoots) {
    this.allowedRoots = allowedRoots.map(r => path.resolve(r));
  }

  isAllowed(targetPath) {
    const resolved = path.resolve(targetPath);
    return this.allowedRoots.some(root => {
      const relative = path.relative(root, resolved);
      return !relative.startsWith('..') && !path.isAbsolute(relative);
    });
  }

  validateToolCall(toolName, args) {
    const errors = [];

    const pathFields = [
      'target_file', 'target_dir', 'old_path', 'new_path',
      'old_dir', 'new_dir', 'directory',
    ];

    for (const field of pathFields) {
      if (args[field] && typeof args[field] === 'string') {
        if (!this.isAllowed(args[field])) {
          errors.push(`sandbox violation: ${field}="${args[field]}" is outside allowed roots`);
        }
      }
    }

    // Module execution sandbox
    if (toolName.startsWith('execute_module')) {
      const moduleName = args.module_name || '';
      // Deny execution of system-level modules or paths with .. traversal
      if (moduleName.includes('..')) {
        errors.push('sandbox violation: module_name contains path traversal');
      }
      if (/^\//.test(moduleName) && !this.isAllowed(moduleName)) {
        errors.push(`sandbox violation: module_name="${moduleName}" is outside allowed roots`);
      }
    }

    return errors;
  }
}

// ---------- Reentrancy Guard ----------
class ReentrancyGuard {
  constructor(maxDepth = MAX_REENTRANCY_DEPTH) {
    this.maxDepth = maxDepth;
    this.stack = new Map(); // sessionId -> depth
    this.locks = new Set();
  }

  enter(sessionId) {
    const depth = (this.stack.get(sessionId) || 0) + 1;
    if (depth > this.maxDepth) {
      throw new Error(`Reentrancy guard: max depth ${this.maxDepth} exceeded for session ${sessionId}`);
    }
    this.stack.set(sessionId, depth);
    return depth;
  }

  exit(sessionId) {
    const depth = (this.stack.get(sessionId) || 1) - 1;
    if (depth <= 0) {
      this.stack.delete(sessionId);
    } else {
      this.stack.set(sessionId, depth);
    }
  }

  isLocked(key) {
    return this.locks.has(key);
  }

  lock(key) {
    this.locks.add(key);
  }

  unlock(key) {
    this.locks.delete(key);
  }
}

// ---------- SSE MCP Transport ----------
class SseMcpTransport extends EventEmitter {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl;
    this.sessionId = null;
    this.messageUrl = null;
    this.sseReq = null;
    this.connected = false;
    this.pending = new Map();
    this.idCounter = 1;
    this.buffer = '';
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._cleanup();
        reject(new Error('SSE connect timeout'));
      }, CONNECT_TIMEOUT_MS);

      const url = new URL(this.baseUrl);
      const lib = url.protocol === 'https:' ? https : http;

      this.sseReq = lib.request(url, {
        headers: { Accept: 'text/event-stream', 'Cache-Control': 'no-cache' },
      }, (res) => {
        if (res.statusCode !== 200) {
          clearTimeout(timeout);
          reject(new Error(`SSE connect failed: ${res.statusCode}`));
          return;
        }

        res.on('data', (chunk) => this._onSseData(chunk));
        res.on('end', () => {
          this.connected = false;
          this.emit('disconnect');
        });
        res.on('error', (err) => this.emit('error', err));

        // Wait for endpoint event
        const onEndpoint = (endpoint) => {
          clearTimeout(timeout);
          this.connected = true;
          resolve();
        };
        this.once('endpoint', onEndpoint);
      });

      this.sseReq.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.sseReq.end();
    });
  }

  _onSseData(chunk) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop(); // keep incomplete line

    let eventName = '';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        data = line.slice(6);
      } else if (line.trim() === '') {
        if (eventName === 'endpoint' && data) {
          const endpointPath = data.trim();
          const base = new URL(this.baseUrl);
          this.messageUrl = `${base.protocol}//${base.host}${endpointPath}`;
          const m = endpointPath.match(/session_id=([0-9a-f-]+)/);
          if (m) this.sessionId = m[1];
          this.emit('endpoint', this.messageUrl);
        } else if (eventName === 'message' && data) {
          try {
            const msg = JSON.parse(data);
            this._handleJsonMessage(msg);
          } catch {
            this.emit('raw', data);
          }
        }
        eventName = '';
        data = '';
      }
    }
  }

  _handleJsonMessage(msg) {
    if (msg.id != null && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else {
      this.emit('notification', msg);
    }
  }

  async send(method, params) {
    if (!this.connected || !this.messageUrl) {
      throw new Error('Transport not connected');
    }

    const id = this.idCounter++;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Call timeout: ${method}`));
      }, CALL_TIMEOUT_MS);

      this.pending.set(id, {
        resolve: (result) => { clearTimeout(timeout); resolve(result); },
        reject: (err) => { clearTimeout(timeout); reject(err); },
      });

      const url = new URL(this.messageUrl);
      const lib = url.protocol === 'https:' ? https : http;
      const req = lib.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      }, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => {
          // Server responds with {"message":"Accepted"} to POST
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Response will come through SSE
          } else {
            this.pending.delete(id);
            clearTimeout(timeout);
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => {
        this.pending.delete(id);
        clearTimeout(timeout);
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }

  _cleanup() {
    if (this.sseReq) {
      try { this.sseReq.destroy(); } catch {}
      this.sseReq = null;
    }
    this.connected = false;
    for (const { reject } of this.pending.values()) {
      reject(new Error('Transport disconnected'));
    }
    this.pending.clear();
  }

  async disconnect() {
    this._cleanup();
  }
}

// ---------- Observer Client ----------
class ObserverClient {
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || 'https://api.effiy.cn/mcp';
    this.allowedRoots = opts.allowedRoots || [REPO_ROOT];
    this.telemetryFile = opts.telemetryFile || TELEMETRY_FILE;
    this.transport = new SseMcpTransport(this.baseUrl);
    this.buckets = new Map();
    this.telemetry = new TelemetryBuffer(opts.bufferSize || MAX_BUFFER_SIZE);
    this.validator = new SandboxValidator(this.allowedRoots);
    this.guard = new ReentrancyGuard(opts.maxDepth || MAX_REENTRANCY_DEPTH);
    this.lazyStarted = false;
    this.flushing = false;
    this.flushTimer = null;
    this.callCount = 0;
    this.errorCount = 0;
  }

  _getBucket(toolName) {
    if (!this.buckets.has(toolName)) {
      const cfg = THROTTLE_CONFIG[getToolCategory(toolName)] || THROTTLE_CONFIG.default;
      this.buckets.set(toolName, new TokenBucket(cfg.rate, cfg.burst));
    }
    return this.buckets.get(toolName);
  }

  async _ensureConnected() {
    if (!this.lazyStarted) {
      this.lazyStarted = true;
      await this.transport.connect();
      // Send initialize
      await this.transport.send('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'observer', version: '1.0' },
      });
      // Send initialized notification
      await this.transport.send('notifications/initialized', {});
      this._startFlushTimer();
    }
  }

  _startFlushTimer() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flushTelemetry(), FLUSH_INTERVAL_MS);
  }

  async callTool(toolName, args, sessionId = 'default') {
    await this._ensureConnected();

    // Reentrancy guard
    let depth;
    try {
      depth = this.guard.enter(sessionId);
    } catch (err) {
      this._record(toolName, args, null, err, 0);
      throw err;
    }

    const lockKey = `${sessionId}:${toolName}`;
    if (this.guard.isLocked(lockKey)) {
      this.guard.exit(sessionId);
      throw new Error(`Reentrancy guard: recursive call to ${toolName} blocked`);
    }

    try {
      this.guard.lock(lockKey);

      // Sandbox validation
      const sandboxErrors = this.validator.validateToolCall(toolName, args);
      if (sandboxErrors.length > 0) {
        const err = new Error(`Sandbox validation failed: ${sandboxErrors.join('; ')}`);
        this._record(toolName, args, null, err, depth);
        throw err;
      }

      // Throttling
      const bucket = this._getBucket(toolName);
      if (!bucket.consume(1)) {
        const err = new Error(`Throttled: ${toolName} rate limit exceeded`);
        this._record(toolName, args, null, err, depth);
        throw err;
      }

      const start = Date.now();
      let result;
      let error;

      try {
        result = await this.transport.send('tools/call', { name: toolName, arguments: args });
        this.callCount++;
      } catch (err) {
        error = err;
        this.errorCount++;
      }

      const latency = Date.now() - start;
      this._record(toolName, args, result, error, depth, latency);

      if (error) throw error;
      return result;
    } finally {
      this.guard.unlock(lockKey);
      this.guard.exit(sessionId);
    }
  }

  _record(toolName, args, result, error, depth, latency) {
    this.telemetry.push({
      ts: Date.now(),
      tool: toolName,
      depth,
      latency: latency || 0,
      error: error ? error.message : null,
      size: JSON.stringify(result || {}).length,
    });
  }

  async flushTelemetry() {
    if (this.flushing || this.telemetry.size === 0) return;
    this.flushing = true;
    try {
      await fsp.mkdir(path.dirname(this.telemetryFile), { recursive: true });
      const lines = this.telemetry.toArray().map(r => JSON.stringify(r)).join('\n') + '\n';
      await fsp.appendFile(this.telemetryFile, lines, 'utf8');
      this.telemetry.clear();
    } catch (err) {
      // Telemetry failure must not break the pipeline
      console.error('[observer] flush failed:', err.message);
    } finally {
      this.flushing = false;
    }
  }

  async health() {
    const status = {
      connected: this.transport.connected,
      lazyStarted: this.lazyStarted,
      callCount: this.callCount,
      errorCount: this.errorCount,
      errorRate: this.callCount > 0 ? (this.errorCount / this.callCount).toFixed(4) : 0,
      telemetryBufferSize: this.telemetry.size,
      reentrancyDepths: Object.fromEntries(this.guard.stack),
    };

    if (this.transport.connected) {
      try {
        await this.transport.send('ping', {});
        status.ping = 'ok';
      } catch (err) {
        status.ping = `fail: ${err.message}`;
      }
    } else {
      status.ping = 'not connected';
    }

    return status;
  }

  async disconnect() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushTelemetry();
    await this.transport.disconnect();
    this.lazyStarted = false;
  }
}

// ---------- CLI ----------
async function main() {
  const args = process.argv.slice(2);
  const client = new ObserverClient();

  process.on('SIGINT', async () => {
    await client.disconnect();
    process.exit(0);
  });

  if (args.includes('--health')) {
    const h = await client.health();
    console.log(JSON.stringify(h, null, 2));
    await client.disconnect();
    return;
  }

  if (args.includes('--flush')) {
    await client.flushTelemetry();
    console.log('Telemetry flushed.');
    await client.disconnect();
    return;
  }

  const callIdx = args.indexOf('--call');
  if (callIdx !== -1 && args[callIdx + 1]) {
    const toolName = args[callIdx + 1];
    let toolArgs = {};
    const argsIdx = args.indexOf('--args');
    if (argsIdx !== -1 && args[argsIdx + 1]) {
      try { toolArgs = JSON.parse(args[argsIdx + 1]); } catch (e) {
        console.error('Invalid JSON args:', e.message);
        process.exit(1);
      }
    }

    try {
      const result = await client.callTool(toolName, toolArgs);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    } finally {
      await client.disconnect();
    }
    return;
  }

  console.log(`Usage:
  node observer-client.js --call <tool> [--args '{"key":"val"}']
  node observer-client.js --health
  node observer-client.js --flush
`);
  await client.disconnect();
}

module.exports = { ObserverClient, SseMcpTransport, TokenBucket, TelemetryBuffer, SandboxValidator, ReentrancyGuard };

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
