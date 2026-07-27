import { describe, expect, it } from 'vitest';
import { createConfig } from '../../src/config/config';

describe('config', () => {
  describe('createConfig()', () => {
    it('returns config for production environment', () => {
      const cfg = createConfig('production', 'http://localhost:10086');
      expect(cfg.env).toBe('production');
      expect(cfg.url('/api/v1/test')).toBe('http://localhost:10086/api/v1/test');
    });

    it('returns config for staging environment', () => {
      const cfg = createConfig('staging');
      expect(cfg.env).toBe('staging');
    });

    it('returns config for development environment', () => {
      const cfg = createConfig('development');
      expect(cfg.env).toBe('development');
    });

    it('falls back to default API base when none provided', () => {
      const cfg = createConfig('production');
      expect(cfg.url('/api/v1/ping')).toContain('localhost:10086');
    });

    it('provides api client config with retry settings', () => {
      const cfg = createConfig('production', 'http://example.com:8080');
      const apiCfg = cfg.getApiClientConfig();
      expect(apiCfg.baseUrl).toBe('http://example.com:8080');
      expect(apiCfg.timeout).toBe(30000);
      expect(apiCfg.retry).toBeDefined();
      expect(apiCfg.retry!.maxRetries).toBe(3);
      expect(apiCfg.retry!.baseMs).toBe(500);
    });

    it('url() constructs correct paths', () => {
      const cfg = createConfig('production', 'https://api.example.com');
      expect(cfg.url('/auth/login')).toBe('https://api.example.com/auth/login');
      expect(cfg.url('sessions')).toBe('https://api.example.com/sessions');
    });

    it('url() strips trailing slash from base', () => {
      const cfg = createConfig('production', 'http://localhost:10086/');
      expect(cfg.url('/ping')).toBe('http://localhost:10086/ping');
    });

    it('includes constants from defaults', () => {
      const cfg = createConfig('production');
      expect(cfg.constants.DEFAULTS.PET_ROLE).toBe('Teacher');
      expect(cfg.constants.RETRY.MAX_RETRIES).toBe(3);
      expect(cfg.constants.TIMING.NOTIFICATION_DURATION).toBe(3000);
    });

    it('includes pet defaults', () => {
      const cfg = createConfig('production');
      expect(cfg.pet.defaultSize).toBe(260);
      expect(cfg.pet.sizeLimits.min).toBe(80);
      expect(cfg.pet.sizeLimits.max).toBe(400);
      expect(cfg.pet.colors).toHaveLength(5);
    });
  });
});
