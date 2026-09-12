<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <template v-for="(item, index) in items" :key="item.id">
        <div v-if="item.type === 'divider'" class="context-menu__divider" />
        <ContextMenuItem
          v-else
          :item="item"
          :active="activeIndex === index"
          :context="context"
          @click.native="handleItemClick(item)"
          @mouseenter="activeIndex = index"
        />
      </template>
    </div>
    <div v-if="visible" class="context-menu__backdrop" @click="hide" @contextmenu.prevent="hide" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { MenuItem, MenuContext } from "./types";
import { useMenuPosition } from "./useMenuPosition";
import { useMenuKeyboard } from "@/composables/useMenuKeyboard";
import ContextMenuItem from "./ContextMenuItem.vue";

const props = defineProps<{
  visible: boolean;
  position: { x: number; y: number };
  items: MenuItem[];
  context: MenuContext | null;
}>();

const emit = defineEmits<{
  (e: "hide"): void;
  (e: "action", item: MenuItem, context: MenuContext | null): void;
}>();

const menuRef = ref<HTMLElement>();
const menuWidth = ref(200);
const menuHeight = ref(0);
const activeIndex = ref(-1);

const posRef = computed(() => props.position);
const widthRef = computed(() => menuWidth.value);
const heightRef = computed(() => menuHeight.value);
const { adjustedPosition, transformOrigin } = useMenuPosition(posRef, widthRef, heightRef);

const menuStyle = computed(() => ({
  left: `${adjustedPosition.value.x}px`,
  top: `${adjustedPosition.value.y}px`,
  transformOrigin: transformOrigin.value,
}));

function hide() {
  emit("hide");
}

function handleItemClick(item: MenuItem) {
  if (item.type === "divider") return;
  if ((item as any).disabled) return;
  if (item.type !== "submenu") {
    emit("action", item, props.context);
    hide();
  }
}

const { activeIndex: _ai } = useMenuKeyboard(
  computed(() => props.visible),
  computed(() => props.items),
  (index: number) => handleItemClick(props.items[index]),
  hide
);

onMounted(() => {
  if (menuRef.value) {
    menuWidth.value = menuRef.value.offsetWidth;
    menuHeight.value = menuRef.value.offsetHeight;
  }
});

onBeforeUnmount(() => {
  hide();
});
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  max-width: 280px;
  padding: 4px 0;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  animation: context-menu-enter 150ms ease-out;
}

.context-menu__divider {
  height: 1px;
  margin: 4px 8px;
  background: var(--el-border-color-lighter);
}

.context-menu__backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

@keyframes context-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>