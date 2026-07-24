import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter/index.js'

const template = await fetch(new URL('./index.html', import.meta.url)).then(r => {
  if (!r.ok) throw new Error(`[App] 模板加载失败: ./index.html`)
  return r.text()
})

export default defineComponent({
  name: 'App',
  template,
  components: { AppFooter },
  setup() {
    const router = useRouter()

    const keepAliveNames = computed(() =>
      router.getRoutes()
        .filter(r => r.meta?.keepAlive)
        .map(r => r.name)
    )

    const showFooter = computed(() => {
      const route = router.currentRoute.value
      return !route.path.includes('/chat')
    })

    return { keepAliveNames, showFooter }
  }
})
