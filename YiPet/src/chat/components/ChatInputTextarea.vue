<script setup lang="ts">
/**
 * YiPet Chat — ChatInputTextarea
 * Textarea with @-mention dropdown, slash command palette, keyboard shortcuts,
 * paste handling, and composition events.
 */
import { t } from '@/shared/i18n';
import FileMentionDropdown from './FileMentionDropdown.vue';

const props = defineProps<{
  modelValue: string;
  placeholder: string;
  disabled: boolean;
  mentionQuery: string;
  mentionVisible: boolean;
  slashVisible: boolean;
  slashMatches: Array<{ name: string; short: string; hint: string; icon: string; kind: 'action' | 'session' | 'debug' }>;
  slashActive: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'mention-select': [path: string];
  'mention-close': [];
  'apply-slash': [name: string];
  'keydown': [e: KeyboardEvent];
  'paste': [e: ClipboardEvent];
  'compositionstart': [];
  'compositionupdate': [];
  'compositionend': [];
  'focus': [];
  'blur': [];
}>();

function onInput(val: string) {
  emit('update:modelValue', val);
}
</script>

<template>
  <div class="ci-textarea-wrap">
    <FileMentionDropdown
      :query="mentionQuery"
      :visible="mentionVisible"
      @close="emit('mention-close')"
      @select="(path: string) => emit('mention-select', path)"
    />
    <div v-if="slashVisible && slashMatches.length" class="ci-slash-dropdown">
      <div class="ci-slash-title">Slash commands · {{ slashMatches.length }}</div>
      <div
        v-for="(c, i) in slashMatches"
        :key="c.name"
        class="ci-slash-item"
        :class="{ 'is-active': i === slashActive }"
        @click="emit('apply-slash', c.name)"
      >
        <span class="ci-slash-icon" :class="`kind-${c.kind}`">{{ c.icon }}</span>
        <span class="ci-slash-main">
          <span class="ci-slash-name"><code>{{ c.name }}</code></span>
          <span class="ci-slash-short">{{ c.short }}</span>
        </span>
        <span class="ci-slash-hint">{{ c.hint }}</span>
      </div>
    </div>
    <el-input
      :model-value="modelValue"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 6 }"
      :placeholder="placeholder"
      :disabled="disabled"
      resize="none"
      :aria-label="t('chatInputAriaLabel')"
      class="ci-textarea"
      @update:model-value="onInput"
      @keydown="e => emit('keydown', e as KeyboardEvent)"
      @paste="(e: ClipboardEvent) => emit('paste', e)"
      @focus="emit('focus')"
      @blur="emit('blur')"
      @compositionstart="emit('compositionstart')"
      @compositionupdate="emit('compositionupdate')"
      @compositionend="emit('compositionend')"
    />
  </div>
</template>

<style lang="scss" scoped>
.ci-textarea-wrap { position: relative; flex: 1; min-width: 0; }

:deep(.el-textarea__inner) {
  min-height: 40px !important;
  padding: 8px 0 6px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--el-text-color-primary);
  transition: height .12s ease, padding .12s ease;
  &::placeholder { color: var(--el-text-color-regular); transition: opacity .15s; }
  &:focus { box-shadow: none; }
  &:focus::placeholder { opacity: .6; }
}

.ci-slash-dropdown {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0; right: 0;
  max-height: 280px;
  overflow-y: auto;
  z-index: 120;
  background: var(--el-bg-color);
  border: 1px solid rgba(99,102,241,.35);
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 12px 32px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.02) inset;
  animation: ci-slash-in .14s ease-out;
}
@keyframes ci-slash-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.ci-slash-title {
  padding: 4px 8px 6px; font-size: 10px; font-weight: 600;
  color: var(--primary-light,var(--el-color-primary)); text-transform: uppercase; letter-spacing: .08em;
  border-bottom: 1px dashed rgba(99,102,241,.15);
  margin-bottom: 4px;
}
.ci-slash-item {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px; border-radius: 6px; cursor: pointer;
  transition: all .1s;
  &:hover, &.is-active {
    background: rgba(99,102,241,.15);
  }
  &.is-active { outline: 1px solid rgba(99,102,241,.35); }
}
.ci-slash-icon {
  width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(99,102,241,.12); border-radius: 6px; font-size: 14px;
  &.kind-action  { background: rgba(59,130,246,.12); color: #60a5fa; }
  &.kind-session { background: rgba(168,85,247,.14); color: #c084fc; }
  &.kind-debug   { background: rgba(234,179,8,.14);  color: #facc15; }
}
.ci-slash-main { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
.ci-slash-name code {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 12px; font-weight: 700; color: var(--primary-light,var(--el-color-primary));
  background: rgba(99,102,241,.12); padding: 1px 6px; border-radius: 3px;
}
.ci-slash-short { font-size: 11px; color: var(--el-text-color-primary); margin-top: 2px; }
.ci-slash-hint { font-size: 11px; color: var(--el-text-color-regular); opacity: .75; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>