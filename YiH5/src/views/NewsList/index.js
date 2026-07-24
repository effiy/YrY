import { storeToRefs } from 'pinia'
import { useAppStore } from '../../store/index.js'
import { useRouter } from 'vue-router'
import { shiftISODate } from '../../utils/time.js'
import { useListPage } from '../../composables/useListPage.js'
import { defineView } from '../../utils/defineView.js'
import FilterBar from '../../components/FilterBar/index.js'

export default defineView({
  name: 'NewsList',
  html: new URL('./index.html', import.meta.url).href,
  components: { FilterBar },
  setup() {
    const store = useAppStore()
    const router = useRouter()
    const { filteredNews: filtered } = storeToRefs(store)

    const { refreshing, onRefresh } = useListPage({
      reload: (force) => store.loadNews(getIsoDate(), force)
    })

    const getIsoDate = () => {
      const ymd = store.selectedDate || new Date().toISOString().slice(0, 10)
      return `${ymd},${ymd}`
    }

    const onDateChange = (val) => {
      store.selectedDate = val
      store.loadNews(getIsoDate(), true)
    }

    const prevDay = () => {
      store.selectedDate = shiftISODate(store.selectedDate, -1)
      store.loadNews(getIsoDate(), true)
    }

    const nextDay = () => {
      store.selectedDate = shiftISODate(store.selectedDate, 1)
      store.loadNews(getIsoDate(), true)
    }

    const goChat = async (item) => {
      await store.createNewsSession(item)
      store.activeNewsKey = item.key
      store.chatSource = 'news'
      router.push(`/chat?key=${encodeURIComponent(item.key)}&type=news`)
    }

    return { store, filtered, refreshing, onRefresh, goChat, onDateChange, prevDay, nextDay }
  }
})
