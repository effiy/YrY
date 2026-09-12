/**
 * YiVad — Date filter composable for cross-page date navigation.
 * Provides date navigation, labels, relative dates, and a YYYY-MM-DD string for API queries.
 */
import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

export function useDateFilter(filterDate: Ref<Date | null>) {
  const { t } = useI18n();

  const label = computed(() => {
    const d = filterDate.value;
    if (!d) return t('dateFilter.all');
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return t('dateFilter.today');
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return t('dateFilter.tomorrow');
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t('dateFilter.yesterday');
    return dayjs(d).format('M/D ddd');
  });

  const isToday = computed(() => {
    const d = filterDate.value;
    return d ? d.toDateString() === new Date().toDateString() : false;
  });

  const filterDateStr = computed(() =>
    filterDate.value ? dayjs(filterDate.value).format('YYYY-MM-DD') : ''
  );

  const dateRange = computed<Record<string, any>>(() => {
    if (!filterDateStr.value) return {};
    const start = filterDateStr.value;
    const end = dayjs(start).add(1, 'day').format('YYYY-MM-DD');
    return { updated_at: { $gte: start, $lt: end } };
  });

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
    if (diff < 0) return t('dateFilter.dueOverdue', { n: Math.abs(diff) });
    if (diff === 0) return t('dateFilter.dueToday');
    if (diff === 1) return t('dateFilter.dueTomorrow');
    if (diff <= 3) return t('dateFilter.dueInDays', { n: diff });
    return '';
  }

  return { label, isToday, filterDateStr, dateRange, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate, dueRelative };
}
