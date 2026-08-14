/**
 * WeCom Bot Webhook API service — sends text messages to a user's
 * configured WeCom bot via the YiAi backend's /wework/send-message route.
 *
 * The backend proxies the request to qyapi.weixin.qq.com and returns
 * {message: "Message sent successfully"} on success.
 */

import type { ApiClient, ApiResponse } from '../client';
import { WEWORK } from '../endpoints';
import type { WeWorkSendMessageParams, WeWorkSendMessageResult } from '../types';

export class WeWorkService {
  constructor(private client: ApiClient) {}

  /** Send a plain text message to a WeCom bot via the configured webhook. */
  async sendMessage(
    params: WeWorkSendMessageParams,
    signal?: AbortSignal,
  ): Promise<ApiResponse<WeWorkSendMessageResult>> {
    return this.client.post<WeWorkSendMessageResult>(
      WEWORK.SEND_MESSAGE,
      {
        webhook_url: params.webhook_url,
        content: params.content,
      },
      signal,
    );
  }
}
