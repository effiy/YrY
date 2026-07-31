<template>
  <div class="card content-box">
    <span class="text"> Button Permissions 🍓🍇🍈🍉</span>
    <el-alert
      class="mb20"
      :title="`Current user button permissions: ${JSON.stringify(Object.keys(BUTTONS))}`"
      type="success"
      :closable="false"
    />
    <el-divider content-position="left"> Bind permissions via Hooks </el-divider>
    <el-row class="mb20">
      <el-button v-if="BUTTONS.add" type="primary" :icon="CirclePlus"> Add </el-button>
      <el-button v-if="BUTTONS.edit" type="warning" :icon="EditPen"> Edit </el-button>
      <el-button v-if="BUTTONS.delete" type="danger" plain :icon="Delete"> Delete </el-button>
      <el-button v-if="BUTTONS.import" type="info" plain :icon="Upload"> Import Data </el-button>
      <el-button v-if="BUTTONS.export" type="info" plain :icon="Download"> Export Data </el-button>
    </el-row>
    <el-divider content-position="left"> Bind single permission via v-auth directive </el-divider>
    <el-row class="mb20">
      <el-button v-auth="'add'" type="primary" :icon="CirclePlus"> Add </el-button>
      <el-button v-auth="'edit'" type="warning" :icon="EditPen"> Edit </el-button>
      <el-button v-auth="'delete'" type="danger" plain :icon="Delete"> Delete </el-button>
      <el-button v-auth="'import'" type="info" plain :icon="Upload"> Import Data </el-button>
      <el-button v-auth="'export'" type="info" plain :icon="Download"> Export Data </el-button>
    </el-row>
    <el-divider content-position="left"> Bind multiple permissions via v-auth directive </el-divider>
    <el-row>
      <el-button v-auth="['add', 'edit', 'delete', 'import', 'export']" type="primary" :icon="CirclePlus"> Add </el-button>
      <el-button v-auth="['add', 'edit', 'delete', 'import', 'export']" type="warning" :icon="EditPen"> Edit </el-button>
      <el-button v-auth="['add', 'edit', 'delete', 'import', 'export']" type="danger" plain :icon="Delete"> Delete </el-button>
      <el-button v-auth="['add', 'edit', 'delete', 'import', 'export']" type="info" plain :icon="Upload"> Import Data </el-button>
      <el-button v-auth="['add', 'edit', 'delete', 'import', 'export']" type="info" plain :icon="Download">
        Export Data
      </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="authButton">
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { CirclePlus, Delete, EditPen, Download, Upload } from "@element-plus/icons-vue";

const { BUTTONS } = useAuthButtons();
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
