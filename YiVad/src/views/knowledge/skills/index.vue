<template>
  <div class="skills">
    <header class="skills__header">
      <h1>Claude Code Skills</h1>
      <p>
        {{ skills.length }} skills across {{ categories.length }} categories — reusable Claude Code
        capabilities that accelerate development across the full stack.
      </p>
    </header>

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
import { useRouter } from "vue-router";
import { skills, categories, skillsInCat, type SkillDef } from "./constants";

const router = useRouter();

function lifecycleClass(lc: string) {
  return `skills__card-tag--${lc}`;
}

function openSkill(skill: SkillDef) {
  router.push(`/skills/${skill.id}`);
}
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
}
</style>