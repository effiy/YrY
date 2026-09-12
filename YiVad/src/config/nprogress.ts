import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  easing: "ease", // Animation easing
  speed: 500, // Progress bar increment speed
  showSpinner: true, // Show loading spinner
  trickleSpeed: 200, // Auto increment interval
  minimum: 0.3 // Minimum percentage on init
});

export default NProgress;
