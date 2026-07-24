import { config } from '../../config.js'
import { fetchWithAuth } from './client.js'

export const fetchNews = async (isoDate, token) => {
  const url = `${config.apiBase}${config.endpoints.mongodb}?isoDate=${encodeURIComponent(isoDate)}`
  const resp = await fetchWithAuth(url, {}, token)
  return await resp.json()
}
