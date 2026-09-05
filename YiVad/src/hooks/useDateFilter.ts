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
    if (!d) {
      // #region debug-point B:label-all
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:18",msg:"[DEBUG] label computed via i18n t(dateFilter.all)",data:{filterDate:null,locale:t('dateFilter.all')},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.all');
    }
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      // #region debug-point B:label-today
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:28",msg:"[DEBUG] label computed via i18n t(dateFilter.today)",data:{filterDate:d.toISOString(),locale:t('dateFilter.today')},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.today');
    }
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) {
      // #region debug-point B:label-tomorrow
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:38",msg:"[DEBUG] label computed via i18n t(dateFilter.tomorrow)",data:{filterDate:d.toISOString(),locale:t('dateFilter.tomorrow')},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.tomorrow');
    }
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      // #region debug-point B:label-yesterday
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:48",msg:"[DEBUG] label computed via i18n t(dateFilter.yesterday)",data:{filterDate:d.toISOString(),locale:t('dateFilter.yesterday')},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.yesterday');
    }
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
    if (diff < 0) {
      const n = Math.abs(diff);
      // #region debug-point B:due-overdue
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:97",msg:"[DEBUG] dueRelative via i18n t(dateFilter.dueOverdue)",data:{dueDate,diff,locale:t('dateFilter.dueOverdue',{n})},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.dueOverdue', { n });
    }
    if (diff === 0) {
      // #region debug-point B:due-today
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:107",msg:"[DEBUG] dueRelative via i18n t(dateFilter.dueToday)",data:{dueDate,diff,locale:t('dateFilter.dueToday')},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.dueToday');
    }
    if (diff === 1) {
      // #region debug-point B:due-tomorrow
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:117",msg:"[DEBUG] dueRelative via i18n t(dateFilter.dueTomorrow)",data:{dueDate,diff,locale:t('dateFilter.dueTomorrow')},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.dueTomorrow');
    }
    if (diff <= 3) {
      // #region debug-point B:due-days
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"project-detail-bugs",runId:"post",hypothesisId:"B",location:"useDateFilter.ts:127",msg:"[DEBUG] dueRelative via i18n t(dateFilter.dueInDays)",data:{dueDate,diff,locale:t('dateFilter.dueInDays',{n:diff})},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return t('dateFilter.dueInDays', { n: diff });
    }
    return '';
  }

  return { label, isToday, filterDateStr, dateRange, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate, dueRelative };
}
