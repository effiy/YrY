import { defineView } from '../../utils/defineView.js'

export default defineView({
  name: 'FilterBar',
  html: new URL('./index.html', import.meta.url).href,
  props: {
    query: { type: String, default: '' },
    queryPlaceholder: { type: String, default: '搜索' },
    selectedDate: { type: String, default: '' },
    sortKey: { type: String, default: 'time' },
    allTags: { type: Array, default: () => [] },
    selectedTags: { type: Array, default: () => [] }
  },
  emits: [
    'update:query',
    'update:selectedDate',
    'prev-day',
    'next-day',
    'toggle-sort',
    'toggle-tag'
  ]
})
