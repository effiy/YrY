<template>
  <div class="skills">
    <header class="skills__header">
      <h1>Claude Code Skills</h1>
      <p>
        {{ skills.length }} skills across {{ categories.length }} categories — reusable Claude Code
        capabilities that accelerate development across the full stack.
      </p>
    </header>

    <section class="skills__agent">
      <h2 class="skills__section-title skills__section-title--agent">
        🤖 Server agent capabilities <span class="skills__section-badge">/agent/tools</span>
      </h2>
      <p class="skills__section-desc">
        Live catalog exposed by the YiAi agent loop — {{ agentTools.length }} tools,
        {{ agentSkills.length }} skills.
      </p>

      <div v-if="agentLoading" class="skills__agent-loading">Loading agent capabilities…</div>

      <template v-else>
        <h3 class="skills__agent-sub">Tools</h3>
        <div v-for="(tools, group) in toolGroups" :key="group" class="skills__agent-group">
          <div class="skills__agent-group-title">{{ group }}</div>
          <div class="skills__grid">
            <el-card v-for="tool in tools" :key="tool.name" class="skills__card skills__card--tool" shadow="never">
              <div class="skills__card-head">
                <span class="skills__card-icon">🔧</span>
                <div class="skills__card-title">
                  <h3 class="skills__card-name">{{ tool.name }}</h3>
                  <span class="skills__card-handle">{{ tool.group }}</span>
                </div>
              </div>
              <p class="skills__card-desc">{{ tool.description }}</p>
              <div class="skills__card-meta">
                <span v-if="tool.requires_confirmation" class="skills__card-tag skills__card-tag--confirm">needs confirmation</span>
                <span v-else class="skills__card-tag skills__card-tag--auto">auto</span>
              </div>
            </el-card>
          </div>
        </div>

        <h3 class="skills__agent-sub">Skills</h3>
        <div class="skills__grid">
          <el-card v-for="skill in agentSkills" :key="skill.name" class="skills__card skills__card--skill" shadow="never">
            <div class="skills__card-head">
              <span class="skills__card-icon">📄</span>
              <div class="skills__card-title">
                <h3 class="skills__card-name">{{ skill.name }}</h3>
                <span v-if="skill.chip" class="skills__card-handle">{{ skill.chip }}</span>
              </div>
            </div>
            <p class="skills__card-desc">{{ skill.description }}</p>
            <div v-if="skill.tags?.length" class="skills__card-meta">
              <span v-for="tag in skill.tags" :key="tag" class="skills__card-tag skills__card-tag--skill">{{ tag }}</span>
            </div>
          </el-card>
        </div>
      </template>
    </section>

    <div class="skills__stats">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="skills__stat-chip"
        :style="{ background: cat.color + '18', borderColor: cat.color + '40', color: cat.color }"
      >
        <span class="skills__stat-chip-icon">{{ cat.icon }}</span>
        <span class="skills__stat-chip-label">{{ cat.label }}</span>
        <span class="skills__stat-chip-count">{{ skillsInCat(cat.id).length }}</span>
      </div>
    </div>

    <section v-for="cat in categories" :key="cat.id" class="skills__section">
      <h2 class="skills__section-title" :style="{ borderLeftColor: cat.color }">
        {{ cat.icon }} {{ cat.label }}
      </h2>
      <p class="skills__section-desc">{{ cat.desc }}</p>

      <div class="skills__grid">
        <el-card
          v-for="skill in skillsInCat(cat.id)"
          :key="skill.id"
          class="skills__card"
          shadow="hover"
          @click="openSkill(skill)"
        >
          <div class="skills__card-head">
            <span class="skills__card-icon">{{ skill.icon || "📄" }}</span>
            <div class="skills__card-title">
              <h3 class="skills__card-name">{{ skill.title }}</h3>
              <span class="skills__card-handle">/{{ skill.name }}</span>
            </div>
          </div>
          <p class="skills__card-desc">{{ skill.description }}</p>
          <div class="skills__card-meta">
            <span class="skills__card-files">{{ skill.files }} files</span>
            <span
              v-if="skill.user_invocable"
              class="skills__card-tag skills__card-tag--invocable"
            >user-invocable</span>
            <span class="skills__card-tag" :class="lifecycleClass(skill.lifecycle)">
              {{ skill.lifecycle }}
            </span>
          </div>
        </el-card>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts" name="skillsHub">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  listAgentTools,
  type AgentSkillDescriptor,
  type AgentToolDescriptor,
} from "@/api/modules/agentService";
import { skills, categories, skillsInCat, type SkillDef } from "./constants";

const router = useRouter();

function lifecycleClass(lc: string) {
  return `skills__card-tag--${lc}`;
}

function openSkill(skill: SkillDef) {
  router.push(`/skills/${skill.id}`);
}

// ── Server-side agent capabilities (deepseek-harness: capabilities = tools) ──
const agentTools = ref<AgentToolDescriptor[]>([]);
const agentSkills = ref<AgentSkillDescriptor[]>([]);
const agentLoading = ref(true);

const toolGroups = ref<Record<string, AgentToolDescriptor[]>>({});

async function loadAgentTools() {
  agentLoading.value = true;
  const res = await listAgentTools();
  agentTools.value = res.tools;
  agentSkills.value = res.skills;
  const groups: Record<string, AgentToolDescriptor[]> = {};
  for (const tool of res.tools) {
    const g = tool.group || "other";
    (groups[g] ||= []).push(tool);
  }
  toolGroups.value = groups;
  agentLoading.value = false;
}

onMounted(loadAgentTools);
</script>

<style scoped lang="scss">
.skills {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}

.skills__header {
  margin-bottom: 14px;

  h1 {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

.skills__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.skills__stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid;
}

.skills__stat-chip-icon {
  font-size: 14px;
}

.skills__stat-chip-count {
  font-size: 11px;
  opacity: 0.7;
  margin-left: 2px;
}

.skills__section {
  margin-bottom: 20px;
}

.skills__section-title {
  margin: 0 0 2px;
  padding-left: 10px;
  border-left: 3px solid var(--el-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.skills__section-desc {
  margin: 0 0 10px;
  padding-left: 13px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.skills__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
}

.skills__card {
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    padding: 14px;
  }
}

.skills__card-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}

.skills__card-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.skills__card-title {
  min-width: 0;
}

.skills__card-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.skills__card-handle {
  display: inline-block;
  margin-top: 2px;
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 6px;
  border-radius: 4px;
}

.skills__card-desc {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.skills__card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.skills__card-files {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
}

.skills__card-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;

  &--invocable {
    background: #e6f9f2;
    color: #10b981;
  }

  &--active {
    background: #e6f0ff;
    color: #1677ff;
  }

  &--draft {
    background: #fff7e6;
    color: #f59e0b;
  }

  &--deprecated {
    background: #fef0f0;
    color: #f56c6c;
  }

  &--confirm {
    background: #fff7e6;
    color: #f59e0b;
  }

  &--auto {
    background: #e6f9f2;
    color: #10b981;
  }

  &--skill {
    background: #f4f4f5;
    color: var(--el-text-color-secondary);
  }
}

/* ── Server agent capabilities section ────────────────────────────────── */

.skills__agent {
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  background: var(--el-fill-color-blank);
}

.skills__section-title--agent {
  border-left-color: #7c3aed;
}

.skills__section-badge {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  font-family: "SF Mono", "Fira Code", monospace;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}

.skills__agent-loading {
  padding: 16px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.skills__agent-sub {
  margin: 12px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.skills__agent-group {
  margin-bottom: 10px;
}

.skills__agent-group-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--el-text-color-placeholder);
  margin: 0 0 6px 2px;
}
</style>