<template>
  <div v-if="linkedModules.length || linkedBugs.length" class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><Connection /></el-icon>
      <span>Linked Items</span>
    </div>
    <div class="id-sb-group__body">
      <div v-if="linkedModules.length" class="id-sb-dep">
        <span class="id-sb-dep__label">Module</span>
        <div class="id-sb-dep__tags">
          <el-tag
            v-for="m in linkedModules"
            :key="m.key"
            size="small"
            @click="router.push(`/module/${m.key}`)"
          >{{ m.name }}</el-tag>
        </div>
      </div>
      <div v-if="linkedBugs.length" class="id-sb-dep">
        <span class="id-sb-dep__label">Bug</span>
        <div class="id-sb-dep__tags">
          <el-tag
            v-for="b in linkedBugs"
            :key="b.key"
            size="small"
            type="danger"
            @click="router.push(`/bug/${b.key}`)"
          >{{ b.title }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarLinkedItems">
import { Connection } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import type { Module } from "@/api/modules/moduleService";
import type { BugDocument } from "@/api/modules/bug";

defineProps<{ linkedModules: Module[]; linkedBugs: BugDocument[] }>();
const router = useRouter();
</script>