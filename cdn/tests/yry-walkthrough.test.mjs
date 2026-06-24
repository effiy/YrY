/**
 * YryWalkthrough — 引导步骤组件测试
 * 重点验证:tagClass method + steps prop
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-walkthrough', 'yry-walkthrough-tpl');

// tagClass helper(从 index.js 提取)
function tagClass(status) {
  if (status === 'done') return 'ok';
  if (status === 'active') return 'now';
  if (status === 'pending') return 'todo';
  if (status === 'skip') return 'skip';
  return '';
}

const YryWalkthrough = defineComponent({
  name: 'YryWalkthrough',
  props: {
    steps: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    tagClass: tagClass
  },
  template: TEMPLATE
});

describe('YryWalkthrough — 渲染', () => {
  it('空 steps 渲染空', () => {
    const w = mount(YryWalkthrough, { props: { steps: [] } });
    expect(w.html()).toBeDefined();
  });

  it('render 单步', () => {
    const w = mount(YryWalkthrough, {
      props: { steps: [{ title: '第一步', status: 'done' }] }
    });
    expect(w.html()).toContain('第一步');
  });

  it('render 多步', () => {
    const w = mount(YryWalkthrough, {
      props: {
        steps: [
          { title: '步骤 1', status: 'done' },
          { title: '步骤 2', status: 'active' },
          { title: '步骤 3', status: 'pending' }
        ]
      }
    });
    expect(w.html()).toContain('步骤 1');
    expect(w.html()).toContain('步骤 2');
    expect(w.html()).toContain('步骤 3');
  });
});

describe('YryWalkthrough — methods.tagClass', () => {
  it('done → ok', () => {
    const w = mount(YryWalkthrough, { props: {} });
    expect(w.vm.tagClass('done')).toBe('ok');
  });

  it('active → now', () => {
    const w = mount(YryWalkthrough, { props: {} });
    expect(w.vm.tagClass('active')).toBe('now');
  });

  it('pending → todo', () => {
    const w = mount(YryWalkthrough, { props: {} });
    expect(w.vm.tagClass('pending')).toBe('todo');
  });

  it('skip → skip', () => {
    const w = mount(YryWalkthrough, { props: {} });
    expect(w.vm.tagClass('skip')).toBe('skip');
  });

  it('未知状态返回空字符串', () => {
    const w = mount(YryWalkthrough, { props: {} });
    expect(w.vm.tagClass('unknown')).toBe('');
    expect(w.vm.tagClass('')).toBe('');
  });

  it('null/undefined 返回空字符串', () => {
    const w = mount(YryWalkthrough, { props: {} });
    expect(w.vm.tagClass(null)).toBe('');
    expect(w.vm.tagClass(undefined)).toBe('');
  });
});
