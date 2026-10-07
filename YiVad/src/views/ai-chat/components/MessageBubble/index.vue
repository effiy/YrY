<script setup lang="ts" name="aiChatMessageBubble">
import { computed, inject } from "vue";
import dayjs from "dayjs";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { ChatMessage } from "@/api/interface/yiAi";
import UserMessage from "./UserMessage.vue";
import PetMessage from "./PetMessage.vue";
import MessageActions from "./MessageActions.vue";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const store = useAiChatStore();
const openMessageEditor = inject<(opts: { content: string; onSave: (content: string) => Promise<void> }) => void>(
  "openMessageEditor",
  () => {}
);

const isUser = computed(() => props.message.type === "user");
const time = computed(() => {
  if (!props.message.timestamp) return "";
  const d = dayjs(props.message.timestamp);
  if (!d.isValid()) return "";
  const now = dayjs();
  const diffMin = now.diff(d, "minute");
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (d.isSame(now, "day")) return d.format("HH:mm");
  if (d.isSame(now.subtract(1, "day"), "day")) return "Yesterday " + d.format("HH:mm");
  return d.format("MM/DD HH:mm");
});
const tokenEstimate = computed(() => Math.ceil((props.message.message?.length ?? 0) / 4));

// ── Message grouping: detect same-role consecutive messages ─────────
const msgs = computed(() => store.activeConversation?.messages ?? []);
const sameAsPrev = computed(() => {
  if (props.index === 0) return false;
  return msgs.value[props.index - 1]?.type === props.message.type;
});
const sameAsNext = computed(() => {
  if (props.index >= msgs.value.length - 1) return false;
  return msgs.value[props.index + 1]?.type === props.message.type;
});

const prevRoleMessage = computed<{ tokens: number; snippet: string; ts: number | null } | null>(() => {
  const msgs = store.activeConversation?.messages ?? [];
  const myTs = props.message.timestamp;
  let myIdx = -1;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].timestamp === myTs) {
      myIdx = i;
      break;
    }
  }
  if (myIdx < 1) return null;
  for (let j = myIdx - 1; j >= 0; j--) {
    if (msgs[j].type === props.message.type) {
      const text = msgs[j].message ?? "";
      const snippet = text.length > 80 ? text.slice(0, 79) + "…" : text;
      return {
        tokens: Math.ceil(text.length / 4),
        snippet: snippet.replace(/\s+/g, " "),
        ts: msgs[j].timestamp ?? null
      };
    }
  }
  return null;
});
const prevRoleTokenEstimate = computed(() => prevRoleMessage.value?.tokens ?? null);

function scrollToPrevRoleMessage(): void {
  const ts = prevRoleMessage.value?.ts;
  if (ts == null) return;
  const el = document.querySelector<HTMLElement>(`[data-msg-ts="${ts}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("mb-bubble--flash");
  window.setTimeout(() => el.classList.remove("mb-bubble--flash"), 2000);
}

const tokenTrend = computed<{ arrow: string; delta: number; sign: string; cls: string } | null>(() => {
  const prev = prevRoleTokenEstimate.value;
  if (prev == null) return null;
  const delta = tokenEstimate.value - prev;
  if (delta === 0) return { arrow: "→", delta: 0, sign: "±", cls: "mb-tokens-trend--flat" };
  if (delta > 0) return { arrow: "↑", delta, sign: "+", cls: "mb-tokens-trend--up" };
  return { arrow: "↓", delta: -delta, sign: "-", cls: "mb-tokens-trend--down" };
});

const charCount = computed(() => props.message.message?.length ?? 0);
const wordCount = computed(() => {
  const s = props.message.message ?? "";
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
});
const lineCount = computed(() => {
  const s = props.message.message ?? "";
  if (!s) return 0;
  return s.split("\n").length;
});

const hasWebSearch = computed(() => !!props.message.searchContext && isUser.value);

function onEdit() {
  openMessageEditor({
    content: props.message.message ?? "",
    onSave: async (content: string) => {
      const next = content.trim();
      if (!next) return;
      await store.editMessage(props.index, next);
    }
  });
}
</script>

<template>
  <div
    class="mb-bubble"
    :class="{
      'mb-bubble--user': isUser,
      'mb-bubble--pet': !isUser,
      'mb-bubble--error': props.message.error,
      'mb-bubble--grouped': sameAsPrev || sameAsNext,
      'mb-bubble--group-start': !sameAsPrev && sameAsNext,
      'mb-bubble--group-mid': sameAsPrev && sameAsNext,
      'mb-bubble--group-end': sameAsPrev && !sameAsNext,
    }"
    :data-msg-ts="String(props.message.timestamp ?? '')"
  >
    <div class="mb-content">
      <UserMessage v-if="isUser" :message="props.message" :index="props.index" :streaming="props.streaming" />
      <PetMessage v-else :message="props.message" :index="props.index" :streaming="props.streaming" />
    </div>
    <div class="mb-meta">
      <MessageActions
        :message="props.message"
        :index="props.index"
        :is-user="isUser"
        :sending="store.sending"
        :has-web-search="hasWebSearch"
        :web-search-enabled="store.webSearchEnabled"
        @edit="onEdit"
      />
      <time class="mb-time">{{ time }}</time>
      <el-tooltip
        :content="`${charCount} chars · ${wordCount} words · ${lineCount} line(s) · ~${tokenEstimate} tokens (chars/4 estimate)`"
        placement="top"
        :show-after="300"
      >
        <span class="mb-tokens" :class="isUser ? 'mb-tokens--user' : 'mb-tokens--pet'">
          ~{{ tokenEstimate }} tok
          <el-tooltip v-if="tokenTrend" placement="top" :show-after="200">
            <template #content>
              <div class="mb-trend-tip">
                <div>
                  <b>Previous {{ isUser ? "user" : "pet" }} message:</b> ~{{ prevRoleTokenEstimate }} tok (Δ {{ tokenTrend.sign
                  }}{{ tokenTrend.delta }})
                </div>
                <div v-if="prevRoleMessage" class="mb-trend-tip-snip">"{{ prevRoleMessage.snippet }}"</div>
                <div class="mb-trend-tip-note">
                  {{
                    tokenTrend.cls === "mb-tokens-trend--up"
                      ? "Longer than previous"
                      : tokenTrend.cls === "mb-tokens-trend--down"
                        ? "Shorter than previous"
                        : "Same length as previous"
                  }}
                </div>
              </div>
            </template>
            <span class="mb-tokens-trend" :class="tokenTrend.cls" @click="scrollToPrevRoleMessage"
              >{{ tokenTrend.arrow }}{{ tokenTrend.delta > 0 ? tokenTrend.delta : "" }}</span
            >
          </el-tooltip>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>


<style scoped lang="scss">
@use "./index.scss";
</style>
