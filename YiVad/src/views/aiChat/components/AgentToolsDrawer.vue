<script setup lang="ts" name="aiChatAgentToolsDrawer">
/**
 * AgentToolsDrawer — dsh-style capability discovery inside the chat.
 *
 * A right-hand drawer that browses the live `/agent/tools` catalog: the agent
 * loop's tools (grouped, with confirmation + auto badges) and the skill suite
 * (grouped by category). Mirrors YiPet's AgentToolsDrawer at the same surface.
 * Fetches lazily on first open and caches for the session.
 */
import { computed, onMounted, ref } from "vue";
import { Loading } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import {
  listAgentTools,
  type AgentSkillDescriptor,
  type AgentToolDescriptor,
} from "@/api/modules/agentService";

const store = useAiChatStore();

const tools = ref<AgentToolDescriptor[]>([]);
const skills = ref<AgentSkillDescriptor[]>([]);
const loading = ref(false);
let loaded = false;

async function load() {
  if (loaded || loading.value) return;
  loading.value = true;
  const res = await listAgentTools();
  tools.value = res.tools;
  skills.value = res.skills;
  loaded = true;
  loading.value = false;
}

function open() {
  store.openAgentToolsDrawer();
  void load();
}

function close() {
  store.closeAgentToolsDrawer();
}

onMounted(load);

const toolGroups = computed(() => {
  const groups: Record<string, AgentToolDescriptor[]> = {};
  for (const tool of tools.value) {
    const g = tool.group || "other";
    (groups[g] ||= []).push(tool);
  }
  return groups;
});

const skillGroups = computed(() => {
  const groups: Record<string, AgentSkillDescriptor[]> = {};
  for (const skill of skills.value) {
    const g = skill.category || "other";
    (groups[g] ||= []).push(skill);
  }
  return groups;
});

function paramsPreview(params?: Record<string, unknown>): string {
  if (!params) return "{}";
  const text = JSON.stringify(params);
  return text.length > 160 ? text.slice(0, 160) + "…" : text;
}
</script>

<template>
  <el-drawer
    :model-value="store.agentToolsDrawerVisible"
    title="Agent capabilities"
    size="420px"
    :append-to-body="true"
    @open="open"
    @close="close"
  >
    <div class="atd">
      <p class="atd__sub">
        Live catalog exposed by the agent loop — {{ tools.length }} tools,
        {{ skills.length }} skills.
      </p>

      <div v-if="loading" class="atd__loading">
        <el-icon class="atd__spin"><Loading /></el-icon>
        Loading capabilities…
      </div>

      <template v-else>
        <h3 class="atd__heading">Tools</h3>
        <div v-for="(groupTools, group) in toolGroups" :key="group" class="atd__group">
          <div class="atd__group-title">{{ group }}</div>
          <el-collapse accordion>
            <el-collapse-item
              v-for="tool in groupTools"
              :key="tool.name"
              :name="tool.name"
            >
              <template #title>
                <div class="atd__tool-head">
                  <span class="atd__tool-name">{{ tool.name }}</span>
                  <span
                    class="atd__badge"
                    :class="tool.requires_confirmation ? 'atd__badge--confirm' : 'atd__badge--auto'"
                  >
                    {{ tool.requires_confirmation ? "needs confirmation" : "auto" }}
                  </span>
                </div>
              </template>
              <p class="atd__tool-desc">{{ tool.description }}</p>
              <pre class="atd__tool-params">{{ paramsPreview(tool.parameters) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <h3 class="atd__heading">Skills</h3>
        <div v-for="(groupSkills, category) in skillGroups" :key="category" class="atd__group">
          <div class="atd__group-title">{{ category }}</div>
          <div v-for="skill in groupSkills" :key="skill.name" class="atd__skill">
            <div class="atd__skill-head">
              <span class="atd__skill-name">{{ skill.name }}</span>
              <span v-if="skill.chip" class="atd__chip">{{ skill.chip }}</span>
            </div>
            <p class="atd__skill-desc">{{ skill.description }}</p>
            <div v-if="skill.tags?.length" class="atd__skill-tags">
              <span v-for="tag in skill.tags" :key="tag" class="atd__tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <el-empty
          v-if="!tools.length && !skills.length"
          description="No capabilities returned — is the YiAi backend running?"
        />
      </template>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.atd {
  padding: 0 4px;
}

.atd__sub {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.atd__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.atd__spin {
  animation: atd-spin 1s linear infinite;
}
@keyframes atd-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.atd__heading {
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.atd__group {
  margin-bottom: 8px;
}

.atd__group-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--el-text-color-placeholder);
  margin: 0 0 4px 2px;
}

.atd__tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.atd__tool-name {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 12px;
  font-weight: 600;
}

.atd__badge {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;

  &--confirm {
    background: #fff7e6;
    color: #f59e0b;
  }
  &--auto {
    background: #e6f9f2;
    color: #10b981;
  }
}

.atd__tool-desc {
  margin: 4px 0 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.atd__tool-params {
  margin: 0;
  padding: 6px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

.atd__skill {
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  & + & {
    margin-top: 6px;
  }
}

.atd__skill-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.atd__skill-name {
  font-size: 12px;
  font-weight: 600;
}

.atd__chip {
  font-size: 10px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 3px;
}

.atd__skill-desc {
  margin: 4px 0 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.atd__skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.atd__tag {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  padding: 1px 6px;
  border-radius: 3px;
}
</style>
