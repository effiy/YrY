/**
 * Third-party service reachability self-check.
 *
 * Verifies external services (npm Registry, CDN providers) are reachable.
 * Addresses the self-test story open question:
 *   "自检项清单是否需要覆盖第三方工具或服务的可达性"
 *
 * Run: npx vitest run tests/infrastructure/third-party-reachability.test.mjs
 */

import { describe, it, assert, expect } from '../../../../lib/vitest-adapter.mjs';

const REACH_TIMEOUT = 10_000;

async function checkUrl(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REACH_TIMEOUT);
  try {
    const res = await fetch(url, {
      method: opts.method || 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e.cause?.code || e.message };
  } finally {
    clearTimeout(timeout);
  }
}

describe('第三方服务可达性', () => {
  describe('npm Registry', () => {
    it('registry.npmjs.org 可达', async () => {
      const r = await checkUrl('https://registry.npmjs.org/');
      expect(r.ok, `registry.npmjs.org status=${r.status}`).toBe(true);
    });

    it('vitest 包在 registry 中存在', async () => {
      const r = await checkUrl('https://registry.npmjs.org/vitest/latest', { method: 'GET' });
      expect(r.ok, `vitest registry status=${r.status}`).toBe(true);
    });
  });

  describe('CDN 三路源', () => {
    const cdns = [
      { name: 'unpkg', url: 'https://unpkg.com/' },
      { name: 'jsDelivr', url: 'https://cdn.jsdelivr.net/' },
      { name: 'esm.sh', url: 'https://esm.sh/' },
    ];

    for (const cdn of cdns) {
      it(`${cdn.name} 可达`, async () => {
        const r = await checkUrl(cdn.url);
        expect(r.ok, `${cdn.name} status=${r.status}`).toBe(true);
      });
    }
  });

  describe('npm API', () => {
    it('npm search API 可达', async () => {
      const r = await checkUrl('https://registry.npmjs.org/-/v1/search?text=vitest&size=1', { method: 'GET' });
      expect(r.ok, `npm search status=${r.status}`).toBe(true);
    });
  });
});
