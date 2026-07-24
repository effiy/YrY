/**
 * 认证管理模块
 */
const API_TOKEN_KEY = 'YiH5.authToken.v1'

export const getStoredToken = () => {
  try { return localStorage.getItem(API_TOKEN_KEY) || '' } catch { return '' }
}

export const saveToken = (token) => {
  try { localStorage.setItem(API_TOKEN_KEY, String(token || '').trim()) } catch {}
}

export const getAuthHeaders = (token) => {
  const authToken = token || getStoredToken()
  if (!authToken) return {}
  return { 'X-Token': authToken }
}
