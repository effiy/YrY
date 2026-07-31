import { describe, expect, it } from 'vitest';
import * as endpoints from '../../src/api/endpoints';

describe('API endpoints', () => {
  describe('EXECUTION', () => {
    it('exposes the JSON-RPC root', () => {
      expect(endpoints.EXECUTION.ROOT).toBe('/');
    });
  });

  describe('AUTH', () => {
    it('has login and logout paths', () => {
      expect(endpoints.AUTH.LOGIN).toBe('/auth/login');
      expect(endpoints.AUTH.LOGOUT).toBe('/auth/logout');
    });
  });

  describe('FILES', () => {
    it('has file operation paths', () => {
      expect(endpoints.FILES.READ).toBe('/read-file');
      expect(endpoints.FILES.WRITE).toBe('/write-file');
      expect(endpoints.FILES.DELETE).toBe('/delete-file');
      expect(endpoints.FILES.DELETE_FOLDER).toBe('/delete-folder');
      expect(endpoints.FILES.RENAME).toBe('/rename-file');
      expect(endpoints.FILES.RENAME_FOLDER).toBe('/rename-folder');
      expect(endpoints.FILES.UPLOAD_IMAGE).toBe('/upload-image-to-oss');
    });
  });

  describe('STATE', () => {
    it('has the records list path', () => {
      expect(endpoints.STATE.RECORDS).toBe('/state/records');
    });

    it('generates a parametrised record path', () => {
      expect(endpoints.STATE.RECORD('abc-123')).toBe('/state/records/abc-123');
    });

    it('encodes special characters in record keys', () => {
      expect(endpoints.STATE.RECORD('a/b')).toBe('/state/records/a%2Fb');
    });
  });

  describe('WEWORK', () => {
    it('has the WeCom webhook send path', () => {
      expect(endpoints.WEWORK.SEND_MESSAGE).toBe('/wework/send-message');
    });
  });
});
