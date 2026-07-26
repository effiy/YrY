import { describe, it, expect } from 'vitest';
import * as endpoints from '../../src/api/endpoints';

describe('API endpoints', () => {
  describe('BASE', () => {
    it('has API version paths', () => {
      expect(endpoints.BASE.API).toBe('/api');
      expect(endpoints.BASE.V1).toBe('/api/v1');
      expect(endpoints.BASE.V2).toBe('/api/v2');
    });
  });

  describe('AUTH', () => {
    it('has all auth paths', () => {
      expect(endpoints.AUTH.LOGIN).toBe('/auth/login');
      expect(endpoints.AUTH.LOGOUT).toBe('/auth/logout');
      expect(endpoints.AUTH.REFRESH).toBe('/auth/refresh');
      expect(endpoints.AUTH.PROFILE).toBe('/auth/profile');
      expect(endpoints.AUTH.VALIDATE).toBe('/auth/validate');
    });
  });

  describe('SESSIONS', () => {
    it('has static paths', () => {
      expect(endpoints.SESSIONS.LIST).toBe('/sessions');
      expect(endpoints.SESSIONS.CREATE).toBe('/sessions');
      expect(endpoints.SESSIONS.SEARCH).toBe('/sessions/search');
      expect(endpoints.SESSIONS.FAVORITES).toBe('/sessions/favorites');
      expect(endpoints.SESSIONS.EXPORT).toBe('/sessions/export');
      expect(endpoints.SESSIONS.IMPORT).toBe('/sessions/import');
      expect(endpoints.SESSIONS.BATCH_DELETE).toBe('/sessions/batch');
    });

    it('generates parametrised paths', () => {
      expect(endpoints.SESSIONS.GET('abc-123')).toBe('/sessions/abc-123');
      expect(endpoints.SESSIONS.UPDATE('abc-123')).toBe('/sessions/abc-123');
      expect(endpoints.SESSIONS.DELETE('abc-123')).toBe('/sessions/abc-123');
    });

    it('encodes special characters in IDs', () => {
      expect(endpoints.SESSIONS.GET('a/b')).toBe('/sessions/a%2Fb');
    });
  });

  describe('CHAT', () => {
    it('has prompt paths', () => {
      expect(endpoints.CHAT.STREAM).toBe('/prompt');
      expect(endpoints.CHAT.PROMPT).toBe('/prompt/');
    });
  });

  describe('FAQ', () => {
    it('has static paths', () => {
      expect(endpoints.FAQ.LIST).toBe('/faqs');
      expect(endpoints.FAQ.CREATE).toBe('/faqs');
      expect(endpoints.FAQ.BATCH_UPDATE).toBe('/faqs/batch');
      expect(endpoints.FAQ.REORDER).toBe('/faqs/reorder');
    });
  });

  describe('CONFIG', () => {
    it('has config paths', () => {
      expect(endpoints.CONFIG.GET).toBe('/config');
      expect(endpoints.CONFIG.UPDATE).toBe('/config');
      expect(endpoints.CONFIG.RESET).toBe('/config/reset');
    });
  });

  describe('DATABASE', () => {
    it('has database paths', () => {
      expect(endpoints.DATABASE.QUERY).toBe('/database/query');
      expect(endpoints.DATABASE.CREATE).toBe('/database/create');
      expect(endpoints.DATABASE.UPDATE).toBe('/database/update');
      expect(endpoints.DATABASE.DELETE).toBe('/database/delete');
      expect(endpoints.DATABASE.BATCH).toBe('/database/batch');
    });
  });
});
