<template>
  <div v-if="issue.blocked_by?.length || issue.blocks?.length || issue.related?.length" class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><Link /></el-icon>
      <span>Dependencies</span>
    </div>
    <div class="id-sb-group__body">
      <div v-if="issue.blocked_by?.length" class="id-sb-dep">
        <span class="id-sb-dep__label">Blocked by</span>
        <div class="id-sb-dep__tags">
          <el-tag
            v-for="k in issue.blocked_by"
            :key="k"
            size="small"
            type="danger"
            @click="router.push(`/issue/${k}`)"
          >{{ k }}</el-tag>
        </div>
      </div>
      <div v-if="issue.blocks?.length" class="id-sb-dep">
        <span class="id-sb-dep__label">Blocks</span>
        <div class="id-sb-dep__tags">
          <el-tag
            v-for="k in issue.blocks"
            :key="k"
            size="small"
            type="warning"
            @click="router.push(`/issue/${k}`)"
          >{{ k }}</el-tag>
        </div>
      </div>
      <div v-if="issue.related?.length" class="id-sb-dep">
        <span class="id-sb-dep__label">Related</span>
        <div class="id-sb-dep__tags">
          <el-tag
            v-for="k in issue.related"
            :key="k"
            size="small"
            type="info"
            @click="router.push(`/issue/${k}`)"
          >{{ k }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarDependencies">
import { Link } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import type { Issue } from "@/api/modules/issueService";

defineProps<{ issue: Issue }>();
const router = useRouter();
</script>