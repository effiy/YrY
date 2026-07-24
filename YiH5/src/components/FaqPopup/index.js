import { defineView } from '../../utils/defineView.js'

export default defineView({
  name: 'FaqPopup',
  html: new URL('./index.html', import.meta.url).href,
  css: new URL('./index.css', import.meta.url).href,
  props: {
    show: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    items: { type: Array, default: () => [] }
  },
  emits: ['update:show', 'select']
})
