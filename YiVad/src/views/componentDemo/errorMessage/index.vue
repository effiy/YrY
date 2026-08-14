<template>
  <div class="card content-box">
    <span class="text">ErrorMessage Demo</span>
    <el-alert
      title="ErrorMessage components (403, 404, 500) provide consistent error pages with navigation back to home."
      type="warning"
      :closable="false"
    />
    <el-row :gutter="20" class="mt30">
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>403 Forbidden</template>
          <div class="error-demo">
            <p class="error-code">403</p>
            <p class="error-msg">Sorry, you don't have access to this page.</p>
            <el-button type="primary" @click="$router.push('/403')">View 403 Page</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>404 Not Found</template>
          <div class="error-demo">
            <p class="error-code">404</p>
            <p class="error-msg">Sorry, the page you visited does not exist.</p>
            <el-button type="primary" @click="$router.push('/404')">View 404 Page</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>500 Server Error</template>
          <div class="error-demo">
            <p class="error-code">500</p>
            <p class="error-msg">Sorry, the server encountered an error.</p>
            <el-button type="primary" @click="$router.push('/500')">View 500 Page</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-descriptions title="Usage" :column="1" border class="mt30">
      <el-descriptions-item label="Import">import Error403 from "@/components/ErrorMessage/403.vue"</el-descriptions-item>
      <el-descriptions-item label="Location">src/components/ErrorMessage/</el-descriptions-item>
      <el-descriptions-item label="Routes">Static routes /403, /404, /500</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoErrorMessage"></script>

<style scoped lang="scss">
.error-demo { text-align: center; }
.error-code { font-size: 48px; font-weight: 700; color: var(--el-color-primary); margin: 0 0 8px; }
.error-msg { color: var(--el-text-color-secondary); margin-bottom: 16px; }
.mt30 { margin-top: 30px; }
</style>