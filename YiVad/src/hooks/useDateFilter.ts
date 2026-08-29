/**
 * YiVad — Date filter composable for cross-page date navigation.
 * Provides date navigation, labels, relative dates, and a YYYY-MM-DD string for API queries.
 */
import { computed, type Ref } from 'vue';
import dayjs from 'dayjs';

export function useDateFilter(filterDate: Ref<Date | null>) {
  const label = computed(() => {
    const d = filterDate.value;
    if (!d) return '全部';
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return '今天';
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return '明天';
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return '昨天';
    return dayjs(d).format('M/D ddd');
  });

  const isToday = computed(() => {
    const d = filterDate.value;
    return d ? d.toDateString() === new Date().toDateString() : false;
  });

  const filterDateStr = computed(() =>
    filterDate.value ? dayjs(filterDate.value).format('YYYY-MM-DD') : ''
  );

  function goToPrevDay() {
    const d = filterDate.value ? new Date(filterDate.value) : new Date();
    d.setDate(d.getDate() - 1);
    filterDate.value = d;
  }
  function goToNextDay() {
    const d = filterDate.value ? new Date(filterDate.value) : new Date();
    d.setDate(d.getDate() + 1);
    filterDate.value = d;
  }
  function goToFilterToday() {
    filterDate.value = new Date();
  }
  function clearFilterDate() {
    filterDate.value = null;
  }

  /** Relative date string for display (e.g. "逾期 3 天", "今天截止"). */
  function dueRelative(dueDate: string): string {
    if (!dueDate) return '';
    const d = dayjs(dueDate);
    if (!d.isValid()) return '';
    const today = dayjs().startOf('day');
    const diff = d.diff(today, 'day');
    if (diff < 0) return `逾期 ${Math.abs(diff)} 天`;
    if (diff === 0) return '今天截止';
    if (diff === 1) return '明天截止';
    if (diff <= 3) return `${diff} 天后截止`;
    return '';
  }

  return { label, isToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate, dueRelative };
}