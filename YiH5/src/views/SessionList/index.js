import { storeToRefs } from 'pinia'
import { useAppStore } from '../../store/index.js'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { formatMDHM, shiftISODate } from '../../utils/time.js'
import { useListPage } from '../../composables/useListPage.js'
import { defineView } from '../../utils/defineView.js'
import FilterBar from '../../components/FilterBar/index.js'

export default defineView({
  name: 'SessionList',
  html: new URL('./index.html', import.meta.url).href,
  components: { FilterBar },
  setup() {
    const store = useAppStore()
    const router = useRouter()
    const { filteredSessions: filtered } = storeToRefs(store)

    const { refreshing, onRefresh } = useListPage({
      reload: (force) => store.loadSessions(force)
    })

    const goChat = (item) => {
      store.activeSessionKey = item.key
      store.chatSource = 'session'
      router.push(`/chat?key=${encodeURIComponent(item.key)}`)
    }

    const onDelete = async (item) => {
      try {
        await store.deleteSessionData(item.key)
        showToast('删除成功')
      } catch (e) {
        showToast('删除失败: ' + e.message)
      }
    }

    return {
      store, filtered, refreshing, onRefresh,
      goChat, onDelete, formatTime: formatMDHM, shiftISODate
    }
  }
})
