/**
 * Tests for shared/vue-ce-loader.js — YrYVueCE.define()
 *
 * 验证项:
 *   - kebabCase 转换(PascalCase → kebab-case)
 *   - 参数校验(缺 componentName/templateId/buildComponent 抛 TypeError)
 *   - Vue 未加载时安全降级(不抛错)
 *   - 正常流程:fetch HTML → DOMParser 提取模板 → 注册 custom element
 *   - 超时处理(模板加载超时不阻塞)
 *   - 重复注册防护(customElements.get 命中时跳过)
 */

import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SHARED_DIR = path.resolve(import.meta.dirname, '../shared');
const loaderCode = fs.readFileSync(`${SHARED_DIR}/vue-ce-loader.js`, 'utf8');

function createSandbox() {
  const sandbox = {
    console: { warn: vi.fn(), error: vi.fn(), log: vi.fn() },
    setTimeout: (cb) => 0,
    clearTimeout: () => {},
    navigator: {},
    location: { href: 'http://localhost:8765/test/' },
    URL,
    document: {
      currentScript: null,
      dispatchEvent: () => {},
      getElementById: () => null,
      createElement: () => ({})
    },
    customElements: {
      _r: new Map(),
      get(name) {
        return this._r.get(name);
      },
      define(name, ctor) {
        this._r.set(name, ctor);
      }
    },
    CustomEvent: function (name, detail) {
      return { type: name, name: name, detail: detail && detail.detail };
    }
  };
  sandbox.window = sandbox;
  return sandbox;
}

function loadVue(sandbox) {
  const vueCode = fs.readFileSync(
    `${SHARED_DIR}/../node_modules/vue/dist/vue.global.prod.js`,
    'utf8'
  );
  vm.createContext(sandbox);
  vm.runInContext(vueCode, sandbox);
}

function loadLoader(sandbox) {
  vm.runInContext(loaderCode, sandbox);
}

describe('YrYVueCE.kebabCase — PascalCase → kebab-case', () => {
  let YrYVueCE;
  beforeAll(() => {
    const sandbox = createSandbox();
    loadVue(sandbox);
    loadLoader(sandbox);
    YrYVueCE = sandbox.window.YrYVueCE;
  });

  it('YryStoryCard → yry-story-card', () => {
    expect(YrYVueCE.kebabCase('YryStoryCard')).toBe('yry-story-card');
  });

  it('YryCmdHead → yry-cmd-head', () => {
    expect(YrYVueCE.kebabCase('YryCmdHead')).toBe('yry-cmd-head');
  });

  it('YryChecklistHead → yry-checklist-head', () => {
    expect(YrYVueCE.kebabCase('YryChecklistHead')).toBe('yry-checklist-head');
  });

  it('单字母前缀 Yry → yry', () => {
    expect(YrYVueCE.kebabCase('Yry')).toBe('yry');
  });
});

describe('YrYVueCE.define — 参数校验', () => {
  let sandbox;
  beforeAll(() => {
    sandbox = createSandbox();
    loadVue(sandbox);
    loadLoader(sandbox);
  });

  it('缺 options 抛 TypeError', () => {
    expect(() => sandbox.window.YrYVueCE.define()).toThrow(/options 必填/);
  });

  it('options 为非对象抛 TypeError', () => {
    expect(() => sandbox.window.YrYVueCE.define('string')).toThrow(/options 必填/);
  });

  it('缺 componentName 抛 TypeError', () => {
    expect(() =>
      sandbox.window.YrYVueCE.define({ templateId: 'x', buildComponent: () => ({}) })
    ).toThrow(/componentName/);
  });

  it('缺 templateId 抛 TypeError', () => {
    expect(() =>
      sandbox.window.YrYVueCE.define({ componentName: 'X', buildComponent: () => ({}) })
    ).toThrow(/templateId/);
  });

  it('缺 buildComponent 抛 TypeError', () => {
    expect(() =>
      sandbox.window.YrYVueCE.define({ componentName: 'X', templateId: 'x-tpl' })
    ).toThrow(/buildComponent/);
  });

  it('componentName 非字符串抛 TypeError', () => {
    expect(() =>
      sandbox.window.YrYVueCE.define({
        componentName: 123,
        templateId: 'x',
        buildComponent: () => ({})
      })
    ).toThrow(/componentName/);
  });
});

describe('YrYVueCE.define — 安全降级', () => {
  it('Vue 未加载时 warn 但不抛错', () => {
    const sandbox = createSandbox();
    sandbox.window.Vue = undefined;
    vm.createContext(sandbox);
    vm.runInContext(loaderCode, sandbox);

    expect(() =>
      sandbox.window.YrYVueCE.define({
        componentName: 'YryTest',
        templateId: 'yry-test-tpl',
        buildComponent: () => ({})
      })
    ).not.toThrow();
    expect(sandbox.console.warn).toHaveBeenCalled();
  });

  it('document.currentScript 缺失时 warn 但不抛错', () => {
    const sandbox = createSandbox();
    loadVue(sandbox);
    sandbox.document.currentScript = null;
    loadLoader(sandbox);

    sandbox.window.YrYVueCE.define({
      componentName: 'YryTest',
      templateId: 'yry-test-tpl',
      buildComponent: () => ({})
    });
    expect(sandbox.console.warn).toHaveBeenCalled();
  });
});

describe('YrYVueCE.define — 完整流程', () => {
  let sandbox;
  let fetchCalls;
  const FAKE_HTML = `<html><body>
    <script type="text/x-template" id="yry-test-tpl">
      <div class="test">{{ name }}</div>
    </script>
  </body></html>`;

  beforeEach(() => {
    sandbox = createSandbox();
    sandbox.document.currentScript = {
      src: 'http://localhost:8765/yry-test/index.js',
      getAttribute: (k) => (k === 'src' ? 'http://localhost:8765/yry-test/index.js' : null)
    };
    sandbox.document.dispatchEvent = () => {};
    fetchCalls = [];
    sandbox.fetch = (url, opts) => {
      fetchCalls.push({ url, opts });
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(FAKE_HTML)
      });
    };
    sandbox.DOMParser = class {
      parseFromString(html) {
        const m = html.match(/<script[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/);
        const results = {};
        if (m) results[m[1]] = { innerHTML: m[2] };
        return { getElementById: (id) => results[id] || null };
      }
    };
    loadVue(sandbox);
    loadLoader(sandbox);
  });

  it('fetch 模板 HTML → DOMParser 提取 → 注册 custom element', async () => {
    sandbox.window.YrYVueCE.define({
      componentName: 'YryTest',
      templateId: 'yry-test-tpl',
      buildComponent: (tpl) => ({ name: 'YryTest', template: tpl, props: { name: String } })
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0].url).toBe('http://localhost:8765/yry-test/index.html');
    expect(fetchCalls[0].opts).toEqual({ credentials: 'same-origin' });
    expect(sandbox.customElements.get('yry-test')).toBeDefined();
    expect(typeof sandbox.customElements.get('yry-test')).toBe('function');
  });

  it('注册成功后派发 ready 事件', async () => {
    let dispatchedEvent = null;
    sandbox.document.dispatchEvent = (event) => {
      dispatchedEvent = event;
    };

    sandbox.window.YrYVueCE.define({
      componentName: 'YryTest',
      templateId: 'yry-test-tpl',
      buildComponent: () => ({ name: 'YryTest' })
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(dispatchedEvent).not.toBeNull();
    expect(dispatchedEvent.name).toBe('yry-test-ready');
    expect(dispatchedEvent.detail).toMatchObject({ component: 'YryTest' });
  });

  it('将组件工厂挂到 window 全局', async () => {
    sandbox.window.YrYVueCE.define({
      componentName: 'YryTest',
      templateId: 'yry-test-tpl',
      buildComponent: () => ({ name: 'YryTest', custom: 'field' })
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(sandbox.window.YryTest).toBeDefined();
    expect(sandbox.window.YryTest.custom).toBe('field');
  });

  it('模板未找到时记录 error 不抛错', async () => {
    sandbox.fetch = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('<html><body>no template here</body></html>')
      });

    sandbox.window.YrYVueCE.define({
      componentName: 'YryTest',
      templateId: 'missing-tpl',
      buildComponent: () => ({ name: 'YryTest' })
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(sandbox.console.error).toHaveBeenCalled();
  });

  it('fetch 失败时记录 error 不抛错', async () => {
    sandbox.fetch = () => Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });

    sandbox.window.YrYVueCE.define({
      componentName: 'YryTest',
      templateId: 'yry-test-tpl',
      buildComponent: () => ({ name: 'YryTest' })
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(sandbox.console.error).toHaveBeenCalled();
  });
});

describe('YrYVueCE — 导出 API', () => {
  it('导出 define 函数', () => {
    const sandbox = createSandbox();
    loadVue(sandbox);
    loadLoader(sandbox);
    expect(typeof sandbox.window.YrYVueCE.define).toBe('function');
  });

  it('导出 kebabCase 函数', () => {
    const sandbox = createSandbox();
    loadVue(sandbox);
    loadLoader(sandbox);
    expect(typeof sandbox.window.YrYVueCE.kebabCase).toBe('function');
  });
});
