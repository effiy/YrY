import { computed, type Ref } from "vue";
import type { RssSourceStats } from "@/api/interface/yiAi";

const SOURCE_PALETTE = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SOURCE_PALETTE[h % SOURCE_PALETTE.length];
}

export function useSourceColor(sources: Ref<RssSourceStats[]>) {
  const sourceColorMap = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    sources.value.forEach((s, i) => {
      map[s.name] = SOURCE_PALETTE[i % SOURCE_PALETTE.length];
    });
    return map;
  });

  function sourceColor(name: string): string {
    return sourceColorMap.value[name] ?? hashColor(name || "unknown");
  }

  function dotStyle(name: string): Record<string, string> {
    return { "--dot-color": sourceColor(name) } as Record<string, string>;
  }

  function badgeStyle(name: string): Record<string, string> {
    const color = sourceColor(name);
    return {
      "--badge-bg": color,
      "--badge-shadow": `${color}40`,
    } as Record<string, string>;
  }

  return { sourceColorMap, sourceColor, dotStyle, badgeStyle };
}