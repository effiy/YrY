import { API_BASE } from './client.js'
import { getAuthHeaders } from './auth.js'
import { config } from '../../config.js'

export const callPrompt = async (systemPrompt, userPrompt, model = 'deepseek-r1:32b', conversationId, token) => {
  const headers = {
    ...getAuthHeaders(token),
    'Content-Type': 'application/json'
  }
  const body = {
    fromSystem: systemPrompt,
    fromUser: userPrompt,
    model
  }
  if (conversationId) body.conversation_id = conversationId

  const resp = await fetch(`${API_BASE}${config.endpoints.prompt}`, {
    method: 'POST', headers, body: JSON.stringify(body)
  })
  return await resp.json()
}

export const streamPrompt = async (systemPrompt, userPrompt, model, conversationId, token, signal, onChunk) => {
  const headers = {
    ...getAuthHeaders(token),
    'Content-Type': 'application/json'
  }
  const body = {
    fromSystem: systemPrompt,
    fromUser: userPrompt,
    model,
    stream: true
  }
  if (conversationId) body.conversation_id = conversationId

  const resp = await fetch(`${API_BASE}${config.endpoints.prompt}`, {
    method: 'POST', headers, body: JSON.stringify(body), signal
  })

  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`)

  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    fullText += chunk
    if (onChunk) onChunk(chunk, fullText)
  }

  return fullText
}
