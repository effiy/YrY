/**
 * bot-transport — Notification transport: HTTP send, retry, queue, delivery log.
 * Extracted from send.mjs for module decomposition.
 */

import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";

import {
  HTTP_TIMEOUT_MS, MAX_RETRIES, RETRY_DELAY_MS, DEFAULT_API_URL,
} from "../../../lib/constants.mjs";
import { readJson } from "../../../lib/fs.mjs";

export const API_URL_DEFAULT = `${DEFAULT_API_URL}/wework/send-message`;

const NOTIFICATION_QUEUE_FILE = ".memory/notification-queue.jsonl";
const NOTIFICATION_LOG_FILE = ".memory/notification-log.jsonl";

export async function sendToWecom(apiUrl, webhookUrl, content, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Token": token || "",
      },
      body: JSON.stringify({
        webhook_url: webhookUrl,
        content,
      }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);

    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: true, data };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendWithRetry(apiUrl, webhookUrl, content, token, maxRetries) {
  let lastError = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await sendToWecom(apiUrl, webhookUrl, content, token);
      return { ...result, retries: i };
    } catch (err) {
      lastError = err.message;
      if (i < maxRetries) {
        console.error(`[rui-bot] 重试 ${i + 1}/${maxRetries}: ${err.message}`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  return { ok: false, error: lastError, retries: maxRetries };
}

export function enqueueFailedNotification(projectRoot, message, webhookUrl, apiUrl, token) {
  const queuePath = join(projectRoot, NOTIFICATION_QUEUE_FILE);
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    webhook_url: webhookUrl,
    api_url: apiUrl,
    token_hint: token ? `${token.slice(0, 4)}...` : "",
    retries: 0,
  });
  try {
    appendFileSync(queuePath, entry + "\n", "utf-8");
    console.log("[rui-bot] 📥 失败通知已入队列, 待 flush 重试");
  } catch (err) {
    console.error(`[rui-bot] 入队列失败: ${err.message}`);
  }
}

export async function flushNotificationQueue(projectRoot) {
  const queuePath = join(projectRoot, NOTIFICATION_QUEUE_FILE);
  if (!existsSync(queuePath)) {
    console.log("[rui-bot] 通知队列为空，无需处理");
    return { flushed: 0, remaining: 0 };
  }

  let lines;
  try {
    lines = readFileSync(queuePath, "utf-8").trim().split("\n").filter(Boolean);
  } catch {
    return { flushed: 0, remaining: 0 };
  }

  if (lines.length === 0) {
    return { flushed: 0, remaining: 0 };
  }

  console.log(`[rui-bot] 队列中有 ${lines.length} 条待发通知，开始重试...`);

  const remaining = [];
  let flushed = 0;

  for (const line of lines) {
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }

    if (!entry.webhook_url || !entry.message) continue;

    const token = process.env.API_X_TOKEN || "";
    if (!token) {
      remaining.push(line);
      continue;
    }

    const result = await sendWithRetry(entry.api_url, entry.webhook_url, entry.message, token, 1);
    if (result.ok) {
      flushed++;
    } else {
      entry.retries = (entry.retries || 0) + 1;
      if (entry.retries < MAX_RETRIES) {
        remaining.push(JSON.stringify(entry));
      } else {
        console.error(`[rui-bot] 通知已达最大重试次数，丢弃: ${entry.timestamp}`);
      }
    }
  }

  try {
    if (remaining.length > 0) {
      writeFileSync(queuePath, remaining.join("\n") + "\n", "utf-8");
    } else {
      writeFileSync(queuePath, "", "utf-8");
    }
  } catch { /* best effort */ }

  console.log(`[rui-bot] 队列处理完成: 发送 ${flushed} 条, 剩余 ${remaining.length} 条`);
  return { flushed, remaining: remaining.length };
}

export function logNotificationDelivery(projectRoot, opts, result) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      story: opts.story || "",
      skill: opts.skill || "",
      status: opts.status || "",
      result: result.ok ? "ok" : "fail",
      error: result.error || "",
      retries: result.retries || 0,
      msgLength: result.msgLength || 0,
      dryRun: result.dryRun || false,
    };
    const logPath = join(projectRoot, NOTIFICATION_LOG_FILE);
    appendFileSync(logPath, JSON.stringify(entry) + "\n", "utf-8");
  } catch { /* best effort */ }
}

export function loadConfig(projectRoot) {
  const configPath = join(projectRoot, ".claude", "skills", "rui-bot", "config.json");
  const cfg = readJson(configPath);
  return cfg || { api_url: API_URL_DEFAULT, robots: {}, agents: {}, default_robot: "general" };
}
