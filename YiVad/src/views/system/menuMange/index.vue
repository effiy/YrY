<template>
  <div class="table-box">
    <ProTable ref="proTable" title="Menu List" row-key="path" :indent="20" :columns="columns" :data="menuData">
      <!-- Table header buttons -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus"> Add Menu </el-button>
      </template>
      <!-- Menu icon -->
      <template #icon="scope">
        <el-icon :size="18">
          <component :is="scope.row.meta.icon"></component>
        </el-icon>
      </template>
      <!-- Menu operations -->
      <template #operation>
        <el-button type="primary" link :icon="EditPen"> Edit </el-button>
        <el-button type="primary" link :icon="Delete"> Delete </el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts" name="menuMange">
import { ref } from "vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, CirclePlus } from "@element-plus/icons-vue";
import authMenuList from "@/assets/json/authMenuList.json";
import ProTable from "@/components/ProTable/index.vue";

const proTable = ref();

const menuData = ref(authMenuList.data);

// Table column config
const columns: ColumnProps[] = [
  { prop: "meta.title", label: "Menu Name", align: "left", search: { el: "input" } },
  { prop: "meta.icon", label: "Menu Icon" },
  { prop: "name", label: "Menu Name", search: { el: "input" } },
  { prop: "path", label: "Menu Path", width: 300, search: { el: "input" } },
  { prop: "component", label: "Component Path", width: 300 },
  { prop: "operation", label: "Actions", width: 250, fixed: "right" }
];
</script>
