/**
 * YryScorecard — 评分卡片组件测试
 * 重点验证:cellText/cellClass methods 处理多种 cell 类型
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scorecard', 'yry-scorecard-tpl');

const YryScorecard = defineComponent({
  name: 'YryScorecard',
  props: {
    columns: { type: String, default: '[]' },
    rows: { type: String, default: '[]' },
    total: { type: String, default: '[]' }
  },
  computed: {
    parsedColumns() {
      try {
        return JSON.parse(this.columns);
      } catch (e) {
        return [];
      }
    },
    parsedRows() {
      try {
        return JSON.parse(this.rows);
      } catch (e) {
        return [];
      }
    },
    parsedTotal() {
      try {
        return JSON.parse(this.total);
      } catch (e) {
        return [];
      }
    }
  },
  methods: {
    cellClass(c) {
      if (c && typeof c === 'object' && c.status) return c.status;
      if (typeof c === 'boolean') return c ? 'pass' : 'fail';
      return '';
    },
    cellText(c) {
      if (c === null || c === undefined) return '';
      if (typeof c === 'object') return c.text !== undefined ? c.text : '';
      if (typeof c === 'boolean') return c ? '✓' : '✗';
      return String(c);
    }
  },
  template: TEMPLATE
});

describe('YryScorecard — computed JSON 解析', () => {
  it('parsedColumns 解析列定义', () => {
    const w = mount(YryScorecard, {
      props: { columns: '[{"key":"name","label":"名称"}]' }
    });
    expect(w.vm.parsedColumns).toHaveLength(1);
    expect(w.vm.parsedColumns[0]).toEqual({ key: 'name', label: '名称' });
  });

  it('parsedRows 解析行数据', () => {
    const w = mount(YryScorecard, {
      props: { rows: '[["a","b"],["c","d"]]' }
    });
    expect(w.vm.parsedRows).toHaveLength(2);
  });

  it('parsedTotal 解析汇总行', () => {
    const w = mount(YryScorecard, {
      props: { total: '[1,2,3]' }
    });
    expect(w.vm.parsedTotal).toEqual([1, 2, 3]);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryScorecard, {
      props: { columns: 'x', rows: 'x', total: 'x' }
    });
    expect(w.vm.parsedColumns).toEqual([]);
    expect(w.vm.parsedRows).toEqual([]);
    expect(w.vm.parsedTotal).toEqual([]);
  });
});

describe('YryScorecard — methods.cellText', () => {
  it('null/undefined 返回空字符串', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText(null)).toBe('');
    expect(w.vm.cellText(undefined)).toBe('');
  });

  it('boolean true → ✓', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText(true)).toBe('✓');
  });

  it('boolean false → ✗', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText(false)).toBe('✗');
  });

  it('对象 {text: "x"} 返回 text', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText({ text: '通过' })).toBe('通过');
  });

  it('对象无 text 属性返回空', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText({ foo: 'bar' })).toBe('');
  });

  it('数字转字符串', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText(42)).toBe('42');
  });

  it('字符串直接返回', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellText('hello')).toBe('hello');
  });
});

describe('YryScorecard — methods.cellClass', () => {
  it('对象带 status 返回 status', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellClass({ status: 'pass' })).toBe('pass');
    expect(w.vm.cellClass({ status: 'fail' })).toBe('fail');
    expect(w.vm.cellClass({ status: 'warn' })).toBe('warn');
  });

  it('boolean true → pass', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellClass(true)).toBe('pass');
  });

  it('boolean false → fail', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellClass(false)).toBe('fail');
  });

  it('null 返回空字符串', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellClass(null)).toBe('');
  });

  it('对象无 status 返回空字符串', () => {
    const w = mount(YryScorecard, { props: {} });
    expect(w.vm.cellClass({ text: 'x' })).toBe('');
  });
});
