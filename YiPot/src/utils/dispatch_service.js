import { invoke_plugin } from './invoke_plugin';
import {
    getServiceName,
    whetherPluginService,
    ServiceSourceType,
    getServiceSouceType,
} from './service_instance';

/**
 * 统一「内置 / 插件」服务调度，避免调用方写两份完全一致的 if/else。
 *
 * 背景：
 *   - 旧版 TargetArea.translate 与 Recognize 里 plugin/builtin 两个分支
 *     都要做：语言表检查 → auto→second 语替换 → 取 config → setResult 包裹
 *     → then/catch 写 history / autoCopy / setError；这部分代码 95% 相同。
 *   - 抽出 `runService` 后，调用方只需声明：
 *       - 服务类型 (translate/recognize/tts/collection)
 *       - 服务实例 key
 *       - 「内置服务注册中心」与「插件表」（由上层 hook 传入）
 *       - 「方法名」：translate / recognize / speak / collect 等
 *       - 「参数」与「执行前后钩子」
 *
 * 返回 Promise<{ value, cancelled }>，caller 不用再手写 nanoid race 判断。
 */

const idStore = new Map();

/** 生成一次调用 id，并在遇到更晚调用时将本 id 作废。 */
const touchCallId = (scope, index) => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const bucket = idStore.get(scope) ?? [];
    bucket[index] = id;
    idStore.set(scope, bucket);
    return id;
};
const isCallLatest = (scope, index, id) => (idStore.get(scope) ?? [])[index] === id;

/**
 * 取当前服务对应的语言枚举。
 *  - 内置：从 builtinServices[name].Language 拿
 *  - 插件：从 pluginList[serviceType][name].language 拿
 */
const resolveLanguageMap = (ctx) => {
    const { serviceType, serviceName, builtinServices, pluginList } = ctx;
    const isPlugin = ctx.isPlugin;
    if (isPlugin) {
        const pluginInfo = pluginList?.[serviceType]?.[serviceName];
        return pluginInfo?.language ?? {};
    }
    return builtinServices?.[serviceName]?.Language ?? {};
};

const resolveTargetLanguage = (sourceLanguage, targetLanguage, detectLanguage, secondLanguage) => {
    // 用户选的目标语言与自动检测相同，说明「源语言=目标」。fallback 到第二目标语言
    if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
        return secondLanguage ?? targetLanguage;
    }
    return targetLanguage;
};

/**
 * 执行某个服务实例，统一：
 *   - 语言检查与 auto 修正（可通过 skipLanguageCheck 跳过，如 tts / collection）
 *   - 调用最新一次结果丢弃（避免并发请求旧返回覆盖新结果）
 *   - setResult 包裹（自动丢弃过期调用的 setResult）
 *   - 插件端注入 utils 与 invoke_binary helper
 *   - 调用方只关心：请求构造 + 成功/失败回调
 */
export async function runService(params) {
    const {
        scope = 'default',
        index = 0,
        serviceType,
        instanceKey,
        methodName = serviceType, // translate / recognize / tts / collection
        builtinServices = {},
        pluginList = {},
        args = [], // 传给服务方法的前 N 个位置参数（未经语言映射的原始 lang code：如 zh_cn）
        options = {}, // { config, detect, ...etc }
        setResult,
        secondLanguage,
        detectLanguage,
        sourceLanguage,
        targetLanguage,
        skipLanguageCheck = false,
    } = params;

    const serviceName = getServiceName(instanceKey);
    const isPlugin = whetherPluginService(instanceKey);
    const sourceType = getServiceSouceType(instanceKey);

    const callId = touchCallId(scope, index);
    const stillValid = () => isCallLatest(scope, index, callId);

    const guardedSetResult = (v) => {
        if (!stillValid()) return;
        setResult?.(v);
    };

    // --- 语言检查 / 重映射（仅对 translate/recognize 需要）
    let mappedSource = null;
    let mappedTarget = null;
    let finalTarget = targetLanguage;
    if (!skipLanguageCheck) {
        const langMap = resolveLanguageMap({
            serviceType,
            serviceName,
            builtinServices,
            pluginList,
            isPlugin,
        });
        if (!(sourceLanguage in langMap) || !(targetLanguage in langMap)) {
            return {
                ok: false,
                cancelled: false,
                error: new Error('Language not supported'),
                stillValid: stillValid(),
            };
        }
        finalTarget = resolveTargetLanguage(sourceLanguage, targetLanguage, detectLanguage, secondLanguage);
        if (!(finalTarget in langMap)) {
            return {
                ok: false,
                cancelled: false,
                error: new Error('Language not supported'),
                stillValid: stillValid(),
            };
        }
        mappedSource = langMap[sourceLanguage];
        mappedTarget = langMap[finalTarget];
    }

    // 位置参数：[sourceText, from, to] 用于 translate/recognize 等
    const positionalArgs = skipLanguageCheck
        ? args
        : [args[0], mappedSource, mappedTarget, ...(args.slice(3) ?? [])];

    try {
        let value;
        if (isPlugin) {
            if (sourceType !== ServiceSourceType.PLUGIN) {
                // 理论上不可达
                throw new Error(`Plugin service ${serviceName} not found`);
            }
            const [fn, utils] = await invoke_plugin(serviceType, serviceName);
            const pluginOpts = {
                ...options,
                setResult: guardedSetResult,
                utils,
            };
            value = await fn(...positionalArgs, pluginOpts);
        } else {
            const module = builtinServices[serviceName];
            if (!module || typeof module[methodName] !== 'function') {
                throw new Error(`Built-in service not found: ${serviceType}.${serviceName}.${methodName}`);
            }
            value = await module[methodName](...positionalArgs, {
                ...options,
                setResult: guardedSetResult,
            });
        }
        if (!stillValid()) {
            return { ok: false, cancelled: true, value, stillValid: false };
        }
        return {
            ok: true,
            value,
            mappedSource,
            mappedTarget,
            finalTarget,
            stillValid: true,
        };
    } catch (e) {
        if (!stillValid()) {
            return { ok: false, cancelled: true, error: e, stillValid: false };
        }
        return { ok: false, error: e, stillValid: true, mappedSource, mappedTarget, finalTarget };
    }
}

/** 便捷：取「该实例启用状态」。 */
export const isServiceEnabled = (instanceConfig, defaultValue = true) =>
    instanceConfig?.enable ?? defaultValue;
