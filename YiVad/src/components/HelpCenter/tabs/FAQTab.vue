<template>
  <div class="faq-tab">
    <div v-if="degraded" class="faq-tab__degraded">
      <el-icon :size="14"><InfoFilled /></el-icon>
      {{ t('help.faq.degraded_hint') }}
    </div>

    <el-collapse v-model="active" accordion class="faq-collapse">
      <el-collapse-item v-for="(f, i) in list" :key="f.id" :name="String(i)">
        <template #title>
          <div class="faq-q">
            <el-tag size="small" v-for="tag in f.tags.slice(0, 2)" :key="tag">{{ tag }}</el-tag>
            <span class="faq-q__title">{{ f.question }}</span>
            <span class="faq-q__date">{{ formatDate(f.updatedAt) }}</span>
          </div>
        </template>
        <SafeMarkdown :content="f.answer" />
        <div class="faq-actions">
          <span class="faq-rate-label">{{ t('help.faq.useful') }}</span>
          <el-button-group>
            <el-button size="small" @click="rate(f.id, true)">👍 {{ t('help.faq.yes') }}</el-button>
            <el-button size="small" @click="rate(f.id, false)">👎 {{ t('help.faq.no') }}</el-button>
          </el-button-group>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-empty v-if="!list.length" :description="t('help.faq.empty')" />
  </div>
</template>

<script setup lang="ts">
/**
 * FAQTab — HelpOS Tab-3 FAQ 条目。
 * props 均通过 defineProps 定义；t 通过 useI18n 解构。
 */
import { onMounted, ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import SafeMarkdown from "../shared/SafeMarkdown.vue";
import { searchFAQ } from "../helpServices";
import type { FAQItem, HelpRequestOptions } from "../types";

const props = defineProps<{ query?: string; options?: HelpRequestOptions }>();

const { t } = useI18n();
const list = ref<FAQItem[]>([]);
const degraded = ref(false);
const active = ref<string | number>("");

async function load() {
  const res = await searchFAQ(props.query ?? "", props.options ?? undefined);
  list.value = [...res.items];
  degraded.value = res.degraded;
}

watch(() => props.query, load, { flush: "post" });
onMounted(load);

function formatDate(s: string) { return dayjs(s).format("YYYY-MM-DD"); }
function rate(id: string, positive: boolean) {
  (fetch as any)?.("/api/help/faq/rate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, useful: positive })
  }).catch(() => void 0);
  ElMessage.success(t("help.faq.thanks"));
}
</script>

<style lang="scss" scoped>
.faq-tab {}
.faq-tab__degraded {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-radius: 6px; margin-bottom: 10px;
  background: var(--el-color-warning-light-9); color: var(--el-color-warning);
  font-size: 12px;
}
.faq-q { display: flex; align-items: center; gap: 8px; flex: 1; }
.faq-q__title { flex: 1; font-weight: 500; color: var(--el-text-color-primary); }
.faq-q__date { color: var(--el-text-color-secondary); font-size: 12px; }
.faq-actions { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.faq-rate-label { font-size: 12px; color: var(--el-text-color-secondary); }
</style>
