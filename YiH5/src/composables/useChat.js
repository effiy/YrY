import { ref, shallowRef, nextTick } from 'vue'
import { streamPrompt } from '../services/prompt.js'

/**
 * 聊天消息管理 composable
 * 使用 shallowRef 优化消息列表性能（仅追踪数组引用变化，避免深度响应式）
 *
 * @param {Object} opts
 * @param {import('vue').Ref<string>} opts.keyRef - 当前会话/新闻 key
 * @param {import('vue').Ref<boolean>} opts.isSessionRef - 是否为 session 模式
 * @param {Object} opts.store - Pinia store
 * @param {Object} [opts.scrollContainer] - 消息容器的 Ref
 */
export function useChat({ keyRef, isSessionRef, store, scrollContainer }) {
  const messages = shallowRef([])
  const inputText = ref('')
  const sending = ref(false)

  /**
   * 从 store 加载已有消息
   */
  const loadMessages = () => {
    const key = keyRef.value
    if (isSessionRef.value) {
      const session = store.findSession(key)
      messages.value = Array.isArray(session?.messages) ? [...session.messages] : []
    } else {
      messages.value = store.chatMessages[key] || []
    }
  }

  /**
   * 持久化消息到 store / 后端
   */
  const persistMessages = async (previewText) => {
    const key = keyRef.value
    if (isSessionRef.value) {
      const session = store.findSession(key)
      if (session) {
        session.messages = [...messages.value]
        session.messageCount = messages.value.length
        session.lastActiveAt = Date.now()
        if (previewText) session.preview = previewText
        await store.saveSessionData(session)
      }
    } else {
      store.chatMessages[key] = [...messages.value]
    }
  }

  /**
   * 发送消息并获取流式回复
   */
  const sendMessage = async () => {
    const text = inputText.value.trim()
    if (!text || sending.value) return

    inputText.value = ''
    sending.value = true

    const userMsg = { role: 'user', content: text, ts: Date.now() }
    const aiMsg = { role: 'assistant', content: '', ts: Date.now() + 1, streaming: true }
    messages.value = [...messages.value, userMsg, aiMsg]
    const aiIdx = messages.value.length - 1

    nextTick(() => scrollToBottom())

    try {
      await persistMessages(text)

      const finalText = await streamPrompt(
        '你是一个专业、简洁且可靠的 AI 助手。',
        `## 当前消息\n\n${text}`,
        'deepseek-r1:32b',
        keyRef.value,
        store.authToken,
        undefined,
        (_chunk, full) => {
          aiMsg.content = full
          // 浅层更新：替换整个数组引用以触发重渲染
          const copy = [...messages.value]
          copy[aiIdx] = { ...aiMsg }
          messages.value = copy
          nextTick(() => scrollToBottom())
        }
      )

      aiMsg.content = finalText
      aiMsg.streaming = false
      const copy = [...messages.value]
      copy[aiIdx] = { ...aiMsg }
      messages.value = copy

      await persistMessages()
    } catch (e) {
      aiMsg.content = `请求失败：${e.message || '未知错误'}`
      aiMsg.error = true
      const copy = [...messages.value]
      copy[aiIdx] = { ...aiMsg }
      messages.value = copy
    } finally {
      sending.value = false
    }
  }

  const scrollToBottom = () => {
    const el = scrollContainer?.value
    if (el) el.scrollTop = el.scrollHeight
  }

  return { messages, inputText, sending, loadMessages, sendMessage, scrollToBottom }
}
