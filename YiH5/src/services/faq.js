import { API_BASE } from './client.js'
import { fetchWithAuth } from './client.js'

export const buildFaqApiUrl = () => `${API_BASE}/`

export const fetchFaqs = async (token) => {
  const params = new URLSearchParams({
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: JSON.stringify({ cname: 'faqs' })
  })
  const url = `${API_BASE}/?${params.toString()}`
  const resp = await fetchWithAuth(url, {}, token)
  return await resp.json()
}
