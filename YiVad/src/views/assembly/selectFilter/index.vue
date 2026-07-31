<template>
  <div class="card content-box">
    <span class="text"> Select Filter 🍓🍇🍈🍉</span>
    <SelectFilter :data="filterData" :default-values="filterResult" @change="changeFilter" />
    <span class="result">Return Value: {{ filterResult }}</span>
    <el-descriptions title="Config Options 📚" :column="1" border>
      <el-descriptions-item label="data"> Data list to filter, see code for details </el-descriptions-item>
      <el-descriptions-item label="defaultValues"> Default selected values </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref } from "vue";
import SelectFilter from "@/components/SelectFilter/index.vue";

const filterResult = ref({ state: "1", type: ["1", "3"] });

const changeFilter = (val: typeof filterResult.value) => {
  filterResult.value = val;
};

const filterData = [
  {
    title: "Logistics Status (Single)",
    key: "state",
    options: [
      {
        label: "All",
        value: ""
      },
      {
        label: "Ordered",
        value: "1",
        icon: "ShoppingCart"
      },
      {
        label: "Shipped",
        value: "2",
        icon: "Van"
      },
      {
        label: "Received",
        value: "3",
        icon: "Edit"
      },
      {
        label: "Returned",
        value: "4",
        icon: "Guide"
      },
      {
        label: "Completed",
        value: "5",
        icon: "CircleCheck"
      }
    ]
  },
  {
    title: "Product Type (Multiple)",
    key: "type",
    multiple: true,
    options: [
      {
        label: "All",
        value: ""
      },
      {
        label: "Food",
        value: "1"
      },
      {
        label: "Clothing",
        value: "2"
      },
      {
        label: "Furniture",
        value: "3"
      },
      {
        label: "Daily Necessities",
        value: "4"
      }
    ]
  }
];
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
