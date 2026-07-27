import { describe, expect, it } from 'vitest';
import { CDN_CATALOG, catalogByKey } from '../../src/content/cdn/catalog';

describe('CDN catalog', () => {
  describe('CDN_CATALOG', () => {
    it('is a non-empty array', () => {
      expect(CDN_CATALOG.length).toBeGreaterThan(0);
    });

    it('every entry has required fields', () => {
      for (const entry of CDN_CATALOG) {
        expect(entry.key).toBeTruthy();
        expect(entry.path).toBeTruthy();
        expect(['js', 'css']).toContain(entry.type);
        expect(entry.desc).toBeTruthy();
      }
    });

    it('all keys are unique', () => {
      const keys = CDN_CATALOG.map((e) => e.key);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('includes core frameworks', () => {
      const keys = CDN_CATALOG.map((e) => e.key);
      expect(keys).toContain('react');
      expect(keys).toContain('react-dom');
      expect(keys).toContain('vue');
      expect(keys).toContain('jquery');
    });

    it('includes dayjs with all plugins and locales', () => {
      const keys = CDN_CATALOG.map((e) => e.key);
      expect(keys).toContain('dayjs');
      expect(keys).toContain('dayjs-utc');
      expect(keys).toContain('dayjs-tz');
      expect(keys).toContain('dayjs-rel');
      expect(keys).toContain('dayjs-zh');
    });

    it('includes YiPet utils', () => {
      const keys = CDN_CATALOG.map((e) => e.key);
      expect(keys).toContain('url');
      expect(keys).toContain('log');
      expect(keys).toContain('variables-css');
      expect(keys).toContain('reset-css');
    });

    it('JS entries with global set have a global field', () => {
      const jsWithGlobal = CDN_CATALOG.filter((e) => e.type === 'js' && e.global);
      expect(jsWithGlobal.length).toBeGreaterThan(0);
      for (const entry of jsWithGlobal) {
        expect(typeof entry.global).toBe('string');
      }
    });

    it('CSS entries have no global field', () => {
      const cssEntries = CDN_CATALOG.filter((e) => e.type === 'css');
      expect(cssEntries.length).toBeGreaterThan(0);
      for (const entry of cssEntries) {
        expect(entry.global).toBeUndefined();
      }
    });
  });

  describe('catalogByKey', () => {
    it('provides O(1) lookup for every entry', () => {
      for (const entry of CDN_CATALOG) {
        expect(catalogByKey[entry.key]).toBe(entry);
      }
    });

    it('returns undefined for unknown keys', () => {
      expect(catalogByKey.nonexistent).toBeUndefined();
    });
  });
});
