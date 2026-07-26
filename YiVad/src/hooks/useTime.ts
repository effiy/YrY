import { ref } from "vue";

/**
 * @description Get local time
 */
export const useTime = () => {
  const year = ref(0); // Year
  const month = ref(0); // Month
  const week = ref(""); // Day of week
  const day = ref(0); // Day
  const hour = ref<number | string>(0); // Hour
  const minute = ref<number | string>(0); // Minute
  const second = ref<number | string>(0); // Second
  const nowTime = ref<string>(""); // Current time

  // Update time
  const updateTime = () => {
    const date = new Date();
    year.value = date.getFullYear();
    month.value = date.getMonth() + 1;
    week.value = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
    day.value = date.getDate();
    hour.value =
      (date.getHours() + "")?.padStart(2, "0") ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(date.getHours());
    minute.value =
      (date.getMinutes() + "")?.padStart(2, "0") ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(date.getMinutes());
    second.value =
      (date.getSeconds() + "")?.padStart(2, "0") ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(date.getSeconds());
    nowTime.value = `${year.value}-${month.value}-${day.value} ${hour.value}:${minute.value}:${second.value}`;
  };

  updateTime();

  return { year, month, day, hour, minute, second, week, nowTime };
};
