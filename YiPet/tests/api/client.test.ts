import { describe, it, expect } from 'vitest';
import { createApiClient } from '../../src/api/client';

describe('API client', () => {
  const client = createApiClient({
    baseUrl: 'http://localhost:10086',
    timeout: 5000,
    retry: { maxRetries: 1, baseMs: 10 },
  });

  describe('createApiClient()', () => {
    it('returns an object with all HTTP methods', () => {
      expect(client.get).toBeInstanceOf(Function);
      expect(client.post).toBeInstanceOf(Function);
      expect(client.put).toBeInstanceOf(Function);
      expect(client.delete).toBeInstanceOf(Function);
      expect(client.stream).toBeInstanceOf(Function);
      expect(client.url).toBeInstanceOf(Function);
    });
  });

  describe('url()', () => {
    it('builds full URL from path', () => {
      expect(client.url('/auth/login')).toBe('http://localhost:10086/auth/login');
    });

    it('handles missing leading slash', () => {
      expect(client.url('api/v1/test')).toBe('http://localhost:10086/api/v1/test');
    });

    it('handles trailing slash in base URL', () => {
      const c2 = createApiClient({ baseUrl: 'http://example.com/' });
      expect(c2.url('/ping')).toBe('http://example.com/ping');
    });
  });

  describe('HTTP methods', () => {
    it('get() returns ApiResponse structure on success', async () => {
      // Mock fetch for a successful response
      const mockFetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      );
      vi.stubGlobal('fetch', mockFetch);

      const result = await client.get('/test');
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it('post() sends JSON body', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ id: '1' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }))
      );
      vi.stubGlobal('fetch', mockFetch);

      const result = await client.post('/sessions', { title: 'Test' });
      expect(result.ok).toBe(true);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('/sessions');
      expect(callArgs[1].method).toBe('POST');
      expect(JSON.parse(callArgs[1].body)).toEqual({ title: 'Test' });
    });

    it('put() sends JSON body', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      );
      vi.stubGlobal('fetch', mockFetch);

      await client.put('/config', { updates: { theme: 'dark' } });
      expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
    });

    it('delete() sends no body', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve(new Response('', { status: 204 }))
      );
      vi.stubGlobal('fetch', mockFetch);

      await client.delete('/sessions/123');
      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    });

    it('handles HTTP errors', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ detail: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }))
      );
      vi.stubGlobal('fetch', mockFetch);

      const result = await client.get('/nonexistent');
      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toContain('Not found');
    });

    it('handles network errors with retry', async () => {
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }));
      vi.stubGlobal('fetch', mockFetch);

      const result = await client.get('/retry-test');
      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2); // 1 failure + 1 retry
    });
  });
});
