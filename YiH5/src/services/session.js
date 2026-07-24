import { config } from '../../config.js'
import { fetchWithAuth, extractList, executeModule } from './client.js'

export const fetchSessions = async (token) => {
  const params = new URLSearchParams({
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: JSON.stringify({ cname: 'sessions' })
  })
  const url = `${config.apiBase}/?${params.toString()}`
  const resp = await fetchWithAuth(url, {}, token)
  const data = await resp.json()
  return extractList(data, 'list')
}

export const fetchSessionDetail = async (sessionKey, token) => {
  if (!sessionKey) return null
  const params = new URLSearchParams({
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: JSON.stringify({ cname: 'sessions', filter: { key: sessionKey } })
  })
  const url = `${config.apiBase}/?${params.toString()}`
  const resp = await fetchWithAuth(url, {}, token)
  const data = await resp.json()
  const list = extractList(data)
  return list[0] || null
}

export const saveSession = async (sessionData, token) => {
  const key = String(sessionData?.key || '').trim()
  if (!key) throw new Error('会话Key不能为空')

  const payload = { ...sessionData }
  const setPayload = { ...payload }
  delete setPayload.key
  delete setPayload.createdTime
  delete setPayload.createdAt

  try {
    await executeModule('services.database.data_service', 'update_document',
      { cname: 'sessions', data: payload }, token)
  } catch (e) {
    const msg = String(e?.message || '')
    if (!msg.includes('未找到') && e?.status !== 404) throw e
    await executeModule('services.database.data_service', 'upsert_document',
      { cname: 'sessions', filter: { key }, update: { $set: setPayload, $setOnInsert: { key } } }, token)
  }

  return { code: 0, message: 'success' }
}

export const deleteSession = async (sessionKey, token) => {
  if (!sessionKey) throw new Error('会话Key不能为空')
  await executeModule('services.database.data_service', 'delete_document',
    { cname: 'sessions', key: String(sessionKey) }, token)
  return { code: 0, message: 'success' }
}
