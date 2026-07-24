/**
 * HTTP 客户端模块
 */
import { getAuthHeaders } from './auth.js'
import { config } from '../../config.js'

export const API_BASE = config.apiBase

export const handleApiError = (error) => {
  const msg = error?.message || ''
  if (msg.includes('401')) return '需要配置 API 鉴权，请设置 X-Token。'
  return '请求失败：请稍后重试。'
}

export const fetchWithAuth = async (url, options = {}, token) => {
  const headers = { ...getAuthHeaders(token), ...options.headers }
  const resp = await fetch(url, { ...options, headers })
  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`)
  return resp
}

export const extractList = (result, listKey = 'list') => {
  if (result?.data && Array.isArray(result.data[listKey])) return result.data[listKey]
  if (Array.isArray(result)) return result
  if (result && Array.isArray(result.data)) return result.data
  if (result && Array.isArray(result[listKey])) return result[listKey]
  if (result && Array.isArray(result.items)) return result.items
  return []
}

export const executeModule = async (moduleName, methodName, parameters, token) => {
  const base = String(config.apiBase || '').replace(/\/+$/, '')
  const headers = { ...getAuthHeaders(token), 'Content-Type': 'application/json' }
  const resp = await fetch(`${base}/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ module_name: moduleName, method_name: methodName, parameters })
  })
  const json = await resp.json().catch(() => null)
  if (!resp.ok) {
    const msg = json?.message || json?.data?.message || `HTTP ${resp.status}`
    throw new Error(msg)
  }
  return json
}
