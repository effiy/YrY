/**
 * Bridge Service — Cross-project bridge token operations.
 *
 * Layer 4 domain service for YP-09-09 cross-project bridge reliability.
 * Replaces URL-query-based sessionKey passing with secure one-time tokens.
 */
import { type ApiClient } from '../client';
import { BRIDGE } from '../endpoints';

export class BridgeService {
  constructor(private client: ApiClient) {}

  /** Create a one-time bridge token for session transfer. */
  async createToken(sessionId: string): Promise<{ token: string }> {
    const res = await this.client.post<{ token: string }>(BRIDGE.CREATE_TOKEN, {
      session_id: sessionId,
      origin: 'yipet',
    });
    if (!res.ok) throw new Error(res.error || 'Failed to create bridge token');
    return res.data;
  }

  /** Exchange a one-time bridge token for session data. */
  async exchangeToken(token: string): Promise<{ session_id: string; valid: boolean }> {
    const res = await this.client.post<{ session_id: string; valid: boolean }>(
      BRIDGE.EXCHANGE_TOKEN,
      { token, origin: 'yivad' },
    );
    if (!res.ok) throw new Error(res.error || 'Failed to exchange bridge token');
    return res.data;
  }
}