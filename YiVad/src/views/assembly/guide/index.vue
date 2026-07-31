<template>
  <div class="card content-box">
    <span class="text"> Guide Page 🍓🍇🍈🍉</span>
    <el-alert
      title="The guide page is helpful for first-time users. You can briefly introduce the project's features. This demo is based on driver.js."
      type="warning"
      :closable="false"
    />
    <div id="YiVad">
      <el-button type="primary" @click.prevent.stop="driverObj.drive()"> Start Guide 🤹‍♂️ </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="guide">
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const driverObj = driver({
  allowClose: true,
  doneBtnText: "Done",
  nextBtnText: "Next",
  prevBtnText: "Previous",
  steps: [
    {
      element: "#collapseIcon",
      popover: {
        title: "Collapse Icon",
        description: "Open && Close sidebar",
        side: "right"
      }
    },
    {
      element: "#breadcrumb",
      popover: {
        title: "Breadcrumb",
        description: "Indicate the current page location",
        side: "right"
      }
    },
    {
      element: "#assemblySize",
      popover: {
        title: "Switch Assembly Size",
        description: "Switch the system size",
        side: "left"
      }
    },
    {
      element: "#language",
      popover: {
        title: "Switch Language",
        description: "Switch the system language",
        side: "left"
      }
    },
    {
      element: "#searchMenu",
      popover: {
        title: "Page Search",
        description: "Page search, quick navigation",
        side: "left"
      }
    },
    {
      element: "#themeSetting",
      popover: {
        title: "Setting theme",
        description: "Customize settings theme",
        side: "left"
      }
    },
    {
      element: "#message",
      popover: {
        title: "Message Notification",
        description: "Can receive company information",
        side: "left"
      }
    },
    {
      element: "#fullscreen",
      popover: {
        title: "Full Screen",
        description: "Full Screen, Exit The Full Screen Page",
        side: "left"
      }
    }
  ]
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
