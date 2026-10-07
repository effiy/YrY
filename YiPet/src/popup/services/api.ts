/**
 * Popup API access helper — type-safe bridge to the four-layer API architecture.
 *
 * Usage in popup components:
 *   import { getApiServices } from '../services/api';
 *   const svc = getApiServices();
 *   const health = await svc?.translation.getProviderHealth(24);
 */
import type { ApiServices } from '@/api';

export function getApiServices(): ApiServices | null {
  if (typeof window === 'undefined') return null;
  return (window as any).__yipet_services as ApiServices | null;
}