<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

/**
 * Location picker using Leaflet (OpenStreetMap).
 * Falls back to a manual lat/lng input if Leaflet is not loaded.
 */
const props = withDefaults(defineProps<{
  lat?: number;
  lng?: number;
  address?: string;
  radius?: number;
  readonly?: boolean;
}>(), {
  lat: 39.9042,
  lng: 116.4074,
  radius: 500,
});

const emit = defineEmits<{
  (e: "update:lat", value: number): void;
  (e: "update:lng", value: number): void;
  (e: "update:address", value: string): void;
  (e: "update:radius", value: number): void;
  (e: "change", value: { lat: number; lng: number; address: string; radius: number }): void;
}>();

const currentLat = ref(props.lat);
const currentLng = ref(props.lng);
const currentAddress = ref(props.address || "");
const currentRadius = ref(props.radius);
const searchQuery = ref("");
const mapReady = ref(false);
const mapContainer = ref<HTMLDivElement | null>(null);
let mapInstance: any = null;
let markerInstance: any = null;
let circleInstance: any = null;

function emitChange() {
  emit("update:lat", currentLat.value);
  emit("update:lng", currentLng.value);
  emit("update:address", currentAddress.value);
  emit("update:radius", currentRadius.value);
  emit("change", {
    lat: currentLat.value,
    lng: currentLng.value,
    address: currentAddress.value,
    radius: currentRadius.value,
  });
}

async function initMap() {
  if (!mapContainer.value) return;

  try {
    // Dynamic import of Leaflet (lazy load, types may not be installed)
    const L = (await import("leaflet" as any)).default || (await import("leaflet" as any));

    mapInstance = L.map(mapContainer.value).setView([currentLat.value, currentLng.value], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    markerInstance = L.marker([currentLat.value, currentLng.value], { draggable: !props.readonly }).addTo(mapInstance);
    markerInstance.on("dragend", () => {
      const pos = markerInstance.getLatLng();
      currentLat.value = pos.lat;
      currentLng.value = pos.lng;
      updateCircle();
      reverseGeocode(pos.lat, pos.lng);
      emitChange();
    });

    mapInstance.on("click", (e: any) => {
      if (props.readonly) return;
      const { lat, lng: lon } = e.latlng;
      markerInstance.setLatLng([lat, lon]);
      currentLat.value = lat;
      currentLng.value = lon;
      updateCircle();
      reverseGeocode(lat, lon);
      emitChange();
    });

    circleInstance = L.circle([currentLat.value, currentLng.value], {
      radius: currentRadius.value,
      color: "var(--el-color-primary)",
      fillOpacity: 0.1,
    }).addTo(mapInstance);

    mapReady.value = true;
  } catch {
    // Leaflet not available — use manual input (already displayed)
    mapReady.value = false;
  }
}

function updateCircle() {
  if (circleInstance) {
    circleInstance.setLatLng([currentLat.value, currentLng.value]);
    circleInstance.setRadius(currentRadius.value);
  }
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh`
    );
    const data = await res.json();
    currentAddress.value = data.display_name || "";
  } catch {
    // Silently fail — geocoding is best-effort
  }
}

async function searchAddress() {
  if (!searchQuery.value.trim()) return;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&accept-language=zh&limit=1`
    );
    const data = await res.json();
    if (data.length > 0) {
      currentLat.value = parseFloat(data[0].lat);
      currentLng.value = parseFloat(data[0].lon);
      currentAddress.value = data[0].display_name;
      if (mapInstance && markerInstance) {
        mapInstance.setView([currentLat.value, currentLng.value], 15);
        markerInstance.setLatLng([currentLat.value, currentLng.value]);
        updateCircle();
      }
      emitChange();
    }
  } catch {
    // Silently fail
  }
}

function useCurrentLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentLat.value = pos.coords.latitude;
        currentLng.value = pos.coords.longitude;
        if (mapInstance && markerInstance) {
          mapInstance.setView([currentLat.value, currentLng.value], 15);
          markerInstance.setLatLng([currentLat.value, currentLng.value]);
          updateCircle();
        }
        if (!currentAddress.value) reverseGeocode(currentLat.value, currentLng.value);
        emitChange();
      },
      () => {
        // Permission denied or unavailable
      }
    );
  }
}

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (mapInstance) mapInstance.remove();
});
</script>

<template>
  <div class="location-picker">
    <!-- Search & controls -->
    <div class="location-picker__controls">
      <el-input
        v-model="searchQuery"
        placeholder="搜索地址..."
        size="small"
        style="width: 240px"
        @keyup.enter="searchAddress"
      >
        <template #append>
          <el-button @click="searchAddress">搜索</el-button>
        </template>
      </el-input>
      <el-button size="small" @click="useCurrentLocation">当前位置</el-button>
    </div>

    <!-- Map -->
    <div ref="mapContainer" class="location-picker__map" />

    <!-- Coordinates display -->
    <div class="location-picker__info">
      <div class="location-picker__coord">
        <span class="location-picker__label">纬度</span>
        <el-input-number
          :model-value="currentLat"
          :precision="6"
          :step="0.001"
          size="small"
          :disabled="readonly"
          @change="(v) => { currentLat = v || 0; emitChange(); }"
        />
        <span class="location-picker__label">经度</span>
        <el-input-number
          :model-value="currentLng"
          :precision="6"
          :step="0.001"
          size="small"
          :disabled="readonly"
          @change="(v) => { currentLng = v || 0; emitChange(); }"
        />
      </div>
      <div v-if="currentAddress" class="location-picker__address">
        {{ currentAddress }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.location-picker {
  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__map {
    width: 100%;
    height: 300px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background: var(--el-fill-color-light);
    z-index: 1;
  }

  &__info {
    margin-top: 10px;
    font-size: 13px;
  }

  &__coord {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    min-width: 28px;
  }

  &__address {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}
</style>