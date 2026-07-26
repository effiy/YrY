import { ref, onMounted, onUnmounted } from "vue";

/**
 * @description Check if network is available
 * */
export const useOnline = () => {
  const online = ref(true);
  const showStatus = (val: any) => {
    online.value = typeof val == "boolean" ? val : val.target.online;
  };
  // Set correct network status after page load
  navigator.onLine ? showStatus(true) : showStatus(false);

  onMounted(() => {
    // Start listening for network status changes
    window.addEventListener("online", showStatus);
    window.addEventListener("offline", showStatus);
  });

  onUnmounted(() => {
    // Remove network status change listener
    window.removeEventListener("online", showStatus);
    window.removeEventListener("offline", showStatus);
  });

  return { online };
};
