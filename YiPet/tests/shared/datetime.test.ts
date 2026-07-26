import { describe, it, expect } from 'vitest';
import {
  nowUTC,
  isValidUTC,
  formatDateTime,
  formatRelativeTime,
  formatDate,
  formatTime,
} from '../../src/shared/datetime';

describe('datetime', () => {
  describe('nowUTC()', () => {
    it('returns an ISO 8601 string ending with Z', () => {
      const result = nowUTC();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('returns a valid Date when parsed', () => {
      const result = nowUTC();
      expect(isValidUTC(result)).toBe(true);
    });
  });

  describe('isValidUTC()', () => {
    it('returns true for valid UTC timestamps', () => {
      expect(isValidUTC('2026-07-26T09:30:00.000Z')).toBe(true);
    });

    it('returns false for non-Z timestamps', () => {
      expect(isValidUTC('2026-07-26T09:30:00.000+09:00')).toBe(false);
    });

    it('returns false for garbage strings', () => {
      expect(isValidUTC('not-a-date')).toBe(false);
    });
  });

  describe('formatDateTime()', () => {
    const utc = '2026-07-26T09:30:00.000Z';

    it('formats UTC to Tokyo time', () => {
      const result = formatDateTime(utc, 'en-US', 'Asia/Tokyo');
      // 09:30 UTC → 18:30 JST
      expect(result).toContain('2026');
      expect(result).toContain('Jul');
      expect(result).toMatch(/6:30/);
    });

    it('formats with zh-CN locale', () => {
      const result = formatDateTime(utc, 'zh-CN', 'Asia/Shanghai');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles invalid date gracefully', () => {
      const result = formatDateTime('bogus', 'en-US', 'UTC');
      expect(result).toBe('bogus');
    });

    it('respects custom format options', () => {
      const result = formatDateTime(utc, 'en-US', 'UTC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(result).toBe('July 26, 2026');
    });
  });

  describe('formatRelativeTime()', () => {
    it('formats seconds ago', () => {
      const recent = new Date(Date.now() - 45 * 1000).toISOString();
      const result = formatRelativeTime(recent, 'en-US');
      expect(result).toContain('second');
    });

    it('formats minutes ago', () => {
      const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = formatRelativeTime(recent, 'en-US');
      expect(result).toContain('minute');
    });

    it('formats hours ago', () => {
      const recent = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
      const result = formatRelativeTime(recent, 'en-US');
      expect(result).toContain('hour');
    });

    it('formats days ago', () => {
      const recent = new Date(Date.now() - 2 * 86400 * 1000).toISOString();
      const result = formatRelativeTime(recent, 'en-US');
      expect(result).toContain('day');
    });

    it('handles invalid dates gracefully', () => {
      expect(formatRelativeTime('not-a-date', 'en-US')).toBe('not-a-date');
    });
  });

  describe('formatDate()', () => {
    it('formats date without time', () => {
      const result = formatDate('2026-07-26T09:30:00.000Z', 'en-US', 'UTC');
      expect(result).toContain('July');
      expect(result).toContain('2026');
      expect(result).not.toMatch(/\d:\d/); // no time component
    });
  });

  describe('formatTime()', () => {
    it('formats time without date', () => {
      const result = formatTime('2026-07-26T09:30:00.000Z', 'en-US', 'UTC');
      expect(result).toMatch(/\d/);
      expect(result).not.toContain('2026'); // no date component
    });
  });
});
