import { ref } from 'vue'

/**
 * 通用列表页刷新/加载逻辑
 * 遵循 Vue 3 composition 模式，使用 ref 确保响应式
 *
 * @param {Object} opts
 * @param {Function} opts.reload - 强制重新加载函数，调用时传 force=true
 * @returns {{ refreshing: Ref<boolean>, loading: Ref<boolean>, onRefresh: () => Promise<void> }}
 */
export function useListPage({ reload }) {
  const refreshing = ref(false)

  const onRefresh = async () => {
    refreshing.value = true
    try {
      await reload(true)
    } finally {
      refreshing.value = false
    }
  }

  return { refreshing, onRefresh }
}
