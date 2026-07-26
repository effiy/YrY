<template>
  <div class="card content-box">
    <span class="text">I'm TreeFilter Detail Page, at the same route level as TreeFilter 🍓🍇🍈🍉</span>
    <span class="text">params:{{ route.params }}</span>
    <span class="text">query:{{ route.query }}</span>
  </div>
</template>

<script setup lang="ts" name="useTreeFilter">
import { useRoute } from "vue-router";
const route = useRoute();
</script>
