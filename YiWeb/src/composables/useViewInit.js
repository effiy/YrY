/**
 * useViewInit - 通用视图初始化
 * 参考 YiH5 的 useListPage/useChat 模式，
 * 提取 YiWeb 各视图共用的 createStore + createBaseView 流程
 * author: liangliang
 */

import { createBaseView } from '/cdn/utils/view/baseView.js';
import { logInfo, logError } from '/cdn/utils/core/log.js';
import { setupBrowserExtensionErrorFilter } from '/cdn/utils/core/error-esm.js';

/**
 * 初始化一个 YiWeb 视图应用
 *
 * 对齐 YiH5 的视图初始化模式，统一处理：
 * - Store 创建
 * - BaseView 挂载
 * - 错误过滤
 * - 全局暴露（window.xxxApp / window.xxxStore）
 *
 * @param {Object} config
 * @param {string} config.name - 视图名称（如 'aicr', 'story', 'claude'）
 * @param {string} config.label - 视图中文标签（如 '代码审查页面'）
 * @param {Function} config.createStore - store 工厂函数
 * @param {Function|Object} [config.useComputed] - 计算属性
 * @param {Function|Object} [config.useMethods] - 方法函数
 * @param {string[]} config.components - 组件名列表
 * @param {string[]} config.componentModules - 组件模块路径列表
 * @param {Object} [config.data] - 传递给模板的响应式数据
 * @param {Function} [config.onMounted] - 挂载后回调
 * @param {Object} [config.props] - 子组件 props
 * @param {Object} [config.methods] - 模板方法
 * @param {Object} [config.computed] - 模板计算属性
 * @param {Object} [config.options] - 额外选项
 * @param {boolean} [config.options.tooltipPortal=true] - 是否加载 tooltipPortal
 * @returns {Promise<Object>} 包含 app 和 store 的对象
 */
export async function useViewInit(config) {
  const {
    name,
    label,
    createStore: createStoreFn,
    useComputed: useComputedFn,
    useMethods: useMethodsFn,
    components,
    componentModules,
    data,
    onMounted,
    props,
    methods,
    computed,
    options = {}
  } = config;

  const { tooltipPortal = true } = options;

  if (tooltipPortal) {
    try { await import('/cdn/utils/ui/tooltipPortal.js'); } catch (_) { }
  }

  const store = createStoreFn();

  const baseViewConfig = {
    createStore: () => store,
    components,
    componentModules,
  };

  if (useComputedFn) baseViewConfig.useComputed = useComputedFn;
  if (useMethodsFn) baseViewConfig.useMethods = useMethodsFn;
  if (data) baseViewConfig.data = data;
  if (props) baseViewConfig.props = props;
  if (methods) baseViewConfig.methods = methods;
  if (computed) baseViewConfig.computed = computed;
  if (onMounted) {
    baseViewConfig.onMounted = (mountedApp) => {
      logInfo(`[${label}] 应用已挂载`);
      onMounted(mountedApp, store);
    };
  }

  const app = await createBaseView(baseViewConfig);

  window[`${name}App`] = app;
  window[`${name}Store`] = store;

  setupBrowserExtensionErrorFilter(name, true);

  logInfo(`[${label}] 初始化完成`);
  return { app, store };
}

export default useViewInit;
