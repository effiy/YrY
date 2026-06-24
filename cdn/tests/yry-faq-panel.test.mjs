/**
 * YryFaqPanel — FAQ 面板组件测试
 * 重点验证:methods toggle/isOpen · data faqs 初始状态
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-faq-panel', 'yry-faq-panel-tpl');

// 模拟 getFaqs 返回的数据 — 用 factory 让每个测试独立
function makeFaqs() {
  return [
    { q: 'YrY 是什么?', a: '<p>故事驱动 SDLC 系统</p>', open: false },
    { q: '如何使用 /rui?', a: '<p>输入 /rui 启动管线</p>', open: false },
    { q: '四个面板关系?', a: '<p>观察-调度-诊断-解惑</p>', open: false }
  ];
}

const YryFaqPanel = defineComponent({
  name: 'YryFaqPanel',
  data() {
    return { faqs: makeFaqs() };
  },
  methods: {
    toggle(i) {
      let openIdx = -1;
      for (let k = 0; k < this.faqs.length; k++) {
        if (this.faqs[k].open) {
          openIdx = k;
          break;
        }
      }
      this.faqs.forEach((item, idx) => {
        item.open = idx === i && openIdx !== i;
      });
    },
    isOpen(i) {
      return !!this.faqs[i] && !!this.faqs[i].open;
    }
  },
  template: TEMPLATE
});

describe('YryFaqPanel — 渲染', () => {
  it('render 所有问题', () => {
    const w = mount(YryFaqPanel);
    expect(w.html()).toContain('YrY 是什么?');
    expect(w.html()).toContain('如何使用 /rui?');
    expect(w.html()).toContain('四个面板关系?');
  });

  it('a 通过 v-html 渲染', () => {
    const w = mount(YryFaqPanel);
    expect(w.html()).toContain('<p>故事驱动 SDLC 系统</p>');
  });
});

describe('YryFaqPanel — methods.isOpen', () => {
  it('初始所有 FAQ 都关闭', () => {
    const w = mount(YryFaqPanel);
    for (let i = 0; i < 3; i++) {
      expect(w.vm.isOpen(i)).toBe(false);
    }
  });

  it('越界索引返回 false', () => {
    const w = mount(YryFaqPanel);
    expect(w.vm.isOpen(99)).toBe(false);
    expect(w.vm.isOpen(-1)).toBe(false);
  });
});

describe('YryFaqPanel — methods.toggle', () => {
  it('toggle 打开指定 FAQ', async () => {
    const w = mount(YryFaqPanel);
    w.vm.toggle(0);
    await w.vm.$nextTick();
    expect(w.vm.isOpen(0)).toBe(true);
    expect(w.vm.isOpen(1)).toBe(false);
  });

  it('toggle 同一 FAQ 再次点击关闭', async () => {
    const w = mount(YryFaqPanel);
    w.vm.toggle(0);
    await w.vm.$nextTick();
    expect(w.vm.isOpen(0)).toBe(true);

    w.vm.toggle(0);
    await w.vm.$nextTick();
    expect(w.vm.isOpen(0)).toBe(false);
  });

  it('toggle 新 FAQ 关闭之前打开的(互斥)', async () => {
    const w = mount(YryFaqPanel);
    w.vm.toggle(0);
    await w.vm.$nextTick();
    expect(w.vm.isOpen(0)).toBe(true);

    w.vm.toggle(1);
    await w.vm.$nextTick();
    expect(w.vm.isOpen(0)).toBe(false);
    expect(w.vm.isOpen(1)).toBe(true);
  });

  it('toggle 不影响其他未打开的 FAQ', async () => {
    const w = mount(YryFaqPanel);
    w.vm.toggle(0);
    await w.vm.$nextTick();
    expect(w.vm.isOpen(1)).toBe(false);
    expect(w.vm.isOpen(2)).toBe(false);
  });
});
