import { formatHHMM } from '../../utils/time.js'
import { defineView } from '../../utils/defineView.js'

const renderContent = (text) => {
  if (!text) return ''
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)/gm, '<h4>$1</h4>')
    .replace(/^## (.+)/gm, '<h3>$1</h3>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
}

export default defineView({
  name: 'ChatMessage',
  html: new URL('./index.html', import.meta.url).href,
  css: new URL('./index.css', import.meta.url).href,
  props: {
    role: { type: String, required: true },
    content: { type: String, default: '' },
    ts: { type: Number, default: 0 }
  },
  setup() {
    return { renderContent, formatTime: formatHHMM }
  }
})
