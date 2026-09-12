import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useWatermarkStore } from "@/stores/modules/watermark";

interface WatermarkConfig {
  username: string;
  ipAddress: string;
  color: string;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  timestamp: Date;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateWatermarkSVG(config: WatermarkConfig): string {
  const lines = [
    config.username,
    config.timestamp.toLocaleString(),
    config.ipAddress || "N/A",
    "YiVad Management Console",
  ];
  const lineHeight = 20;
  const width = 280;
  const height = lines.length * lineHeight + 20;

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <g transform="rotate(-25, ${width / 2}, ${height / 2})">
      ${lines.map((line, i) => `
        <text x="${width / 2}" y="${20 + i * lineHeight}" text-anchor="middle"
              fill="${config.color}" fill-opacity="${config.opacity}"
              font-size="${config.fontSize}px" font-family="${config.fontFamily}">
          ${escapeXml(line)}
        </text>
      `).join("")}
    </g>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
}

export function useWatermark() {
  const store = useWatermarkStore();
  const currentTime = ref(new Date());
  const observer = ref<MutationObserver | null>(null);
  let timeInterval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    timeInterval = setInterval(() => {
      currentTime.value = new Date();
    }, 60000);
  });

  onBeforeUnmount(() => {
    if (timeInterval) clearInterval(timeInterval);
    observer.value?.disconnect();
  });

  const watermarkDataURI = computed(() => {
    if (!store.enabled) return "";
    return generateWatermarkSVG({
      username: store.username,
      ipAddress: store.ipAddress,
      color: store.color,
      opacity: store.opacity,
      fontSize: store.fontSize,
      fontFamily: store.fontFamily,
      timestamp: currentTime.value,
    });
  });

  const overlayStyle = computed(() => ({
    backgroundImage: `url(${watermarkDataURI.value})`,
    backgroundRepeat: "repeat",
    backgroundSize: `${store.spacingX}px ${store.spacingY}px`,
    opacity: store.enabled ? 1 : 0,
    pointerEvents: "none" as const,
    position: "fixed" as const,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: 9999,
  }));

  function setupTamperProtection(element: HTMLElement) {
    if (observer.value) observer.value.disconnect();

    observer.value = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
          const removed = Array.from(mutation.removedNodes);
          if (removed.some((n) => n === element || element.contains(n as Node))) {
            document.body.appendChild(element);
            console.warn("[Watermark] Tamper detected — watermark restored");
          }
        }
        if (mutation.type === "attributes" && mutation.target === element) {
          Object.assign(element.style, overlayStyle.value);
          console.warn("[Watermark] Style tamper detected — restored");
        }
      }
    });

    observer.value.observe(document.body, { childList: true, subtree: true });
    observer.value.observe(element, { attributes: true, attributeFilter: ["style", "class"] });
  }

  return {
    watermarkDataURI,
    overlayStyle,
    setupTamperProtection,
    isEnabled: computed(() => store.enabled),
  };
}