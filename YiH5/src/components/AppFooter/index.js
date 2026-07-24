import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../store/index.js'
import { defineView } from '../../utils/defineView.js'

export default defineView({
  name: 'AppFooter',
  html: new URL('./index.html', import.meta.url).href,
  setup() {
    const store = useAppStore()
    const router = useRouter()

    const activeTab = computed({
      get: () => store.activeTab,
      set: (v) => store.setTab(v)
    })

    const onTabChange = (tab) => {
      store.setTab(tab)
      if (tab === 'sessions') {
        store.loadSessions()
        router.push('/sessions')
      } else {
        const isoDate = store.selectedDate
          ? `${store.selectedDate},${store.selectedDate}`
          : `${new Date().toISOString().slice(0, 10)},${new Date().toISOString().slice(0, 10)}`
        store.loadNews(isoDate)
        router.push('/news')
      }
    }

    return { activeTab, onTabChange }
  }
})
