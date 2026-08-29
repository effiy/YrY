<template>
  <svg :style="iconStyle" aria-hidden="true">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup lang="ts" name="SvgIcon">
import { computed, CSSProperties } from "vue";

interface SvgProps {
  name: string; // Icon name ==> required
  prefix?: string; // Icon prefix ==> optional (default "icon")
  iconStyle?: CSSProperties; // Icon style ==> optional
}

const props = withDefaults(defineProps<SvgProps>(), {
  prefix: "icon",
  iconStyle: () => ({ width: "100px", height: "100px" })
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
</script>
