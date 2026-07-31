<template>
  <div class="dataScreen-container">
    <div class="dataScreen-content" ref="dataScreenRef">
      <div class="dataScreen-header">
        <div class="header-lf">
          <span class="header-screening" @click="router.push(HOME_URL)">Home</span>
        </div>
        <div class="header-ct">
          <div class="header-ct-title">
            <span>Smart Tourism Big Data Visualization Platform</span>
            <div class="header-ct-warning">Peak platform warning alerts (2)</div>
          </div>
        </div>
        <div class="header-ri">
          <span class="header-download">Statistical Report</span>
          <span class="header-time">Current Time: {{ time }}</span>
        </div>
      </div>
      <div class="dataScreen-main">
        <div class="dataScreen-lf">
          <div class="dataScreen-top">
            <div class="dataScreen-main-title">
              <span>Real-time Visitor Statistics</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <RealTimeAccessChart />
            </div>
          </div>
          <div class="dataScreen-center">
            <div class="dataScreen-main-title">
              <span>Male/Female Ratio</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <MaleFemaleRatioChart />
            </div>
          </div>
          <div class="dataScreen-bottom">
            <div class="dataScreen-main-title">
              <span>Age Ratio</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <AgeRatioChart />
            </div>
          </div>
        </div>
        <div class="dataScreen-ct">
          <div class="dataScreen-map">
            <div class="dataScreen-map-title">Real-time Scenic Spot Visitor Flow</div>
            <!-- <vue3-seamless-scroll
                :list="alarmData"
                class="dataScreen-alarm"
                :step="0.5"
                :hover="true"
                :limitScrollNum="3"
              >
                <div class="dataScreen-alarm">
                  <div class="map-item" v-for="item in alarmData" :key="item.id">
                    <img src="./images/dataScreen-alarm.png" alt="" />
                    <span class="map-alarm sle">{{ item.label }} warning: {{ item.warnMsg }}</span>
                  </div>
                </div>
              </vue3-seamless-scroll> -->
            <ChinaMapChart />
          </div>
          <div class="dataScreen-cb">
            <div class="dataScreen-main-title">
              <span>Next 30 Days Visitor Trend Forecast</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <OverNext30Chart />
            </div>
          </div>
        </div>
        <div class="dataScreen-rg">
          <div class="dataScreen-top">
            <div class="dataScreen-main-title">
              <span>Top Scenic Spots Ranking</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <HotPlateChart />
            </div>
          </div>
          <div class="dataScreen-center">
            <div class="dataScreen-main-title">
              <span>Annual Visitor Comparison</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <AnnualUseChart />
            </div>
          </div>
          <div class="dataScreen-bottom">
            <div class="dataScreen-main-title">
              <span>Booking Channel Statistics</span>
              <img src="./images/dataScreen-title.png" alt="" />
            </div>
            <div class="dataScreen-main-chart">
              <PlatformSourceChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="dataScreen">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { HOME_URL } from "@/config";
import { useRouter } from "vue-router";
import AgeRatioChart from "./components/AgeRatioChart.vue";
import AnnualUseChart from "./components/AnnualUseChart.vue";
import ChinaMapChart from "./components/ChinaMapChart.vue";
import HotPlateChart from "./components/HotPlateChart.vue";
import MaleFemaleRatioChart from "./components/MaleFemaleRatioChart.vue";
import OverNext30Chart from "./components/OverNext30Chart.vue";
import PlatformSourceChart from "./components/PlatformSourceChart.vue";
import RealTimeAccessChart from "./components/RealTimeAccessChart.vue";
import dayjs from "dayjs";

const router = useRouter();
const dataScreenRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
    dataScreenRef.value.style.width = `1920px`;
    dataScreenRef.value.style.height = `1080px`;
  }
  window.addEventListener("resize", resize);
});

// Set responsive
const resize = () => {
  if (dataScreenRef.value) {
    dataScreenRef.value.style.transform = `scale(${getScale()}) translate(-50%, -50%)`;
  }
};

// Calculate scale ratio based on browser size
const getScale = (width = 1920, height = 1080) => {
  let ww = window.innerWidth / width;
  let wh = window.innerHeight / height;
  return ww < wh ? ww : wh;
};

// Get current time
let timer: NodeJS.Timer | null = null;
let time = ref<string>(dayjs().format("YYYY-MM-DD HH:mm:ss"));
timer = setInterval(() => {
  time.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
}, 1000);

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  clearInterval(timer as unknown as number);
});
</script>
<style lang="scss" scoped>
@use "./index.scss" as *;
</style>
