<script setup lang="ts" name="aicrMessageList">
import { ref, watch, computed } from "vue";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useMarkdown } from "@/hooks/useMarkdown";
import MessageBubble from "./MessageBubble.vue";

const chatStore = useAicrChatStore();
const { render } = useMarkdown();
const container = ref<HTMLDivElement>();

const messages = computed(() => chatStore.messages);

function scrollToBottom() {
  if (container.value) container.value.scrollTop = container.value.scrollHeight;
}

watch(
  () => [chatStore.scrollTick, messages.value[messages.value.length - 1]?.message, messages.value.length],
  () => scrollToBottom(),
  { flush: "post" }
);
watch(() => chatStore.sending, v => v && scrollToBottom());

// Welcome card HTML — mirrors YiWeb's welcomeCard.js (header / url / description / tags / messages / time)
const welcomeCardHtml = computed(() => {
  const c = chatStore.welcomeCard;
  if (!c) return "";
  const hasTitle = !!c.title.trim();
  const hasUrl = !!c.url.trim();
  const hasDesc = !!c.description.trim();
  const hasTags = c.tags.length > 0;
  const hasMsgs = c.messageCount > 0;
  const hasTime = !!(c.createdAt || c.updatedAt);
  if (!hasTitle && !hasUrl && !hasDesc && !hasTags && !hasMsgs && !hasTime) {
    return `<div class="wc-card"><div class="wc-empty">No page info</div></div>`;
  }

  const header = hasTitle ? `<div class="wc-title">${escapeHtml(c.title)}</div>` : "";

  const urlSec = hasUrl
    ? `<div class="wc-section">
         <div class="wc-section-hdr"><span class="wc-section-title">🔗 URL</span>
           <button data-wc-copy="url" title="Copy URL">Copy</button></div>
         <a class="wc-url" href="${escapeHtml(c.url)}" target="_blank" rel="noreferrer">${escapeHtml(c.url)}</a>
       </div>`
    : "";

  const descSec = hasDesc
    ? `<div class="wc-section wc-desc">
         <div class="wc-section-hdr"><span class="wc-section-title">📝 Page description</span>
           <button data-wc-copy="description" title="Copy description">Copy</button></div>
         <div class="wc-md">${render(c.description)}</div>
       </div>`
    : "";

  const tagsSec = hasTags
    ? `<div class="wc-section">
         <div class="wc-section-title">🏷️ Tags</div>
         <div class="wc-tags">${c.tags.map(t => `<span class="wc-tag">${escapeHtml(t)}</span>`).join("")}</div>
       </div>`
    : "";

  const msgsSec = hasMsgs
    ? `<div class="wc-section">
         <div class="wc-section-title">💬 Conversation</div>
         <div class="wc-meta">
           <span>${c.messageCount} messages</span>
           ${c.userMessageCount > 0 ? `<span>(user: ${c.userMessageCount})</span>` : ""}
         </div>
       </div>`
    : "";

  let timeSec = "";
  if (hasTime) {
    const created = c.createdAt ? new Date(c.createdAt) : null;
    const updated = c.updatedAt ? new Date(c.updatedAt) : null;
    const hasC = created && !isNaN(created.getTime());
    const hasU = updated && !isNaN(updated.getTime());
    const sameTime = hasC && hasU && Math.abs(created!.getTime() - updated!.getTime()) < 60000;
    timeSec = `<div class="wc-section">
      <div class="wc-section-title">⏰ Time</div>
      <div class="wc-meta">
        ${hasC ? `<span>Created: ${escapeHtml(formatDateTime(created!))}</span>` : ""}
        ${hasU && !sameTime ? `<span>Updated: ${escapeHtml(formatDateTime(updated!))}</span>` : ""}
      </div>
    </div>`;
  }

  return `<div class="wc-card">${header}${urlSec}${descSec}${tagsSec}${msgsSec}${timeSec}</div>`;
});

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function onWelcomeClick(e: MouseEvent) {
  const t = e.target as HTMLElement;
  const btn = t.closest("button[data-wc-copy]") as HTMLElement | null;
  if (!btn) return;
  const c = chatStore.welcomeCard;
  if (!c) return;
  const key = btn.dataset.wcCopy as "url" | "title" | "description" | undefined;
  if (!key) return;
  navigator.clipboard.writeText(c[key] || "");
}
</script>

<template>
  <div ref="container" class="ml-container">
    <div v-if="chatStore.loading" class="ml-center">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>Loading...</span>
    </div>
    <div v-else-if="chatStore.error && !chatStore.activeSession" class="ml-center">
      <el-alert :title="chatStore.error" type="error" show-icon />
    </div>
    <div v-else-if="!chatStore.activeSession" class="ml-center">
      <el-empty description="Select a session to start chatting" :image-size="80" />
    </div>
    <template v-else>
      <!-- Welcome card -->
      <div v-if="welcomeCardHtml" class="ml-welcome" v-html="welcomeCardHtml" @click="onWelcomeClick" />

      <MessageBubble
        v-for="(msg, idx) in messages"
        :key="`${msg.timestamp}_${idx}`"
        :message="msg"
        :index="idx"
        :streaming="chatStore.isStreaming(msg, idx)"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.ml-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 12px;
  overflow-y: auto;
}
.ml-center {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.ml-welcome {
  padding: 10px 12px;
  margin-bottom: 12px;
  font-size: 13px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}
.ml-welcome :deep(.wc-title) {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}
.ml-welcome :deep(.wc-section) {
  margin-bottom: 8px;
}
.ml-welcome :deep(.wc-section:last-child) {
  margin-bottom: 0;
}
.ml-welcome :deep(.wc-section-hdr) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.ml-welcome :deep(.wc-section-title) {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.ml-welcome :deep(.wc-section-hdr button) {
  padding: 1px 6px;
  font-size: 11px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
.ml-welcome :deep(.wc-section-hdr button:hover) {
  background: var(--el-color-primary-light-9);
}
.ml-welcome :deep(.wc-url) {
  font-size: 12px;
  color: var(--el-color-primary);
  word-break: break-all;
  text-decoration: none;
}
.ml-welcome :deep(.wc-md) {
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}
.ml-welcome :deep(.wc-md p) {
  margin: 0 0 4px;
}
.ml-welcome :deep(.wc-md p:last-child) {
  margin-bottom: 0;
}
.ml-welcome :deep(.wc-tags) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.ml-welcome :deep(.wc-tag) {
  padding: 1px 6px;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 10px;
}
.ml-welcome :deep(.wc-meta) {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.ml-welcome :deep(.wc-empty) {
  font-style: italic;
  color: var(--el-text-color-placeholder);
}
</style>
