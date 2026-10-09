import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Tooltip,
} from '@nextui-org/react';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { sendNotification } from '@tauri-apps/api/notification';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import { TbTransformFilled } from 'react-icons/tb';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { semanticColors } from '@nextui-org/theme';
import toast, { Toaster } from 'react-hot-toast';
import { MdContentCopy } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { GiCycle } from 'react-icons/gi';
import { useTheme } from 'next-themes';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useSpring, animated } from '@react-spring/web';
import useMeasure from 'react-use-measure';

import { info, error as logError } from 'tauri-plugin-log-api';

import * as builtinCollectionServices from '../../../../services/collection';
import * as builtinServices from '../../../../services/translate';
import * as builtinTtsServices from '../../../../services/tts';

import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { useConfig, useToastStyle, useVoice } from '../../../../hooks';
import { sourceTextAtom, detectLanguageAtom } from '../SourceArea';
import { addHistoryRecord } from '../../../../utils/history_store';
import { runService } from '../../../../utils';
import {
    INSTANCE_NAME_CONFIG_KEY,
    ServiceSourceType,
    getDisplayInstanceName,
    getServiceName,
    getServiceSouceType,
    whetherPluginService,
} from '../../../../utils/service_instance';

/** 相同输入值只调用一次 setHide(false)。 */
const invokeOnce = (fn) => {
    let called = false;
    return (...args) => {
        if (called) return;
        called = true;
        fn(...args);
    };
};

/**
 * 翻译 + 历史 + 自动复制的「后置处理」（translate 成功后统一走这条路径，避免两份 then/catch）
 */
const applyTranslateAftermath = ({
    value,
    finalTarget,
    sourceText,
    detectLanguage,
    serviceName,
    historyDisable,
    index,
    clipboardMonitor,
    autoCopy,
    hideWindow,
    t,
}) => {
    if (index === 0 && !clipboardMonitor) {
        const trimmedSource = sourceText.trim();
        const final = typeof value === 'string' ? value : value;
        switch (autoCopy) {
            case 'target':
                writeText(final).then(() => {
                    if (hideWindow) sendNotification({ title: t('common.write_clipboard'), body: final });
                });
                break;
            case 'source_target':
                writeText(`${trimmedSource}\n\n${final}`).then(() => {
                    if (hideWindow)
                        sendNotification({
                            title: t('common.write_clipboard'),
                            body: `${trimmedSource}\n\n${final}`,
                        });
                });
                break;
            default:
                break;
        }
    }
    if (!historyDisable) {
        addHistoryRecord({
            text: sourceText.trim(),
            source: detectLanguage,
            target: finalTarget,
            service: serviceName,
            result: typeof value === 'string' ? value.trim() : value,
        }).catch((e) => logError(`addToHistory failed: ${e?.message ?? String(e)}`));
    }
};

export default function TargetArea(props) {
    const { index, name, translateServiceInstanceList, pluginList, serviceInstanceConfigMap, ...drag } = props;

    const [currentTranslateServiceInstanceKey, setCurrentTranslateServiceInstanceKey] = useState(name);

    const getInstanceName = useCallback(
        (instanceKey, serviceNameSupplier) => {
            const instanceConfig = serviceInstanceConfigMap[instanceKey] ?? {};
            return getDisplayInstanceName(instanceConfig[INSTANCE_NAME_CONFIG_KEY], serviceNameSupplier);
        },
        [serviceInstanceConfigMap]
    );

    const [appFontSize] = useConfig('app_font_size', 16);
    const [collectionServiceList] = useConfig('collection_service_list', []);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');
    const [historyDisable] = useConfig('history_disable', false);
    const [autoCopy] = useConfig('translate_auto_copy', 'disable');
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [clipboardMonitor] = useConfig('clipboard_monitor', false);

    const [isLoading, setIsLoading] = useState(false);
    const [hide, setHide] = useState(true);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);

    const [ttsPluginInfo, setTtsPluginInfo] = useState();
    const { t } = useTranslation();
    const textAreaRef = useRef();
    const toastStyle = useToastStyle();
    const speak = useVoice();
    const theme = useTheme();

    useEffect(() => {
        if (error) logError(`[${currentTranslateServiceInstanceKey}] error: ${error}`);
    }, [error, currentTranslateServiceInstanceKey]);

    // ------------------------------------------------------------------
    // 统一翻译入口（内置 + 插件统一路径）
    // ------------------------------------------------------------------
    const performTranslate = useCallback(
        async ({
            customSourceText,
            customSourceLang,
            customTargetLang,
            customDetect,
            detectModeFromInput = false,
            onSuccessTransform,
        } = {}) => {
            const textIn = (customSourceText ?? sourceText).trim();
            if (!textIn) return;

            const srcLang = customSourceLang ?? sourceLanguage;
            const tgtLang = customTargetLang ?? targetLanguage;
            const detectVal = customDetect ?? detectLanguage;
            if (!srcLang || !tgtLang) return;

            setIsLoading(true);
            setError('');
            setResult('');
            setHide(true);
            const setHideOnce = invokeOnce(() => setHide(false));

            const instanceConfig = {
                ...(serviceInstanceConfigMap[currentTranslateServiceInstanceKey] ?? {}),
            };
            // 旧版 plugin 分支会给 enable 赋值；这里统一显式保证 enable=true
            instanceConfig.enable = instanceConfig.enable ?? true;

            const outcome = await runService({
                scope: 'translate-targetarea',
                index,
                serviceType: 'translate',
                instanceKey: currentTranslateServiceInstanceKey,
                methodName: 'translate',
                builtinServices,
                pluginList,
                args: [textIn, srcLang, tgtLang],
                options: { config: instanceConfig, detect: detectVal },
                setResult: (v) => {
                    setResult(v);
                    setHideOnce();
                },
                secondLanguage: translateSecondLanguage,
                detectLanguage: detectVal,
                sourceLanguage: srcLang,
                targetLanguage: tgtLang,
            });

            if (!outcome.stillValid) return; // 有更新的请求进来，丢弃老结果

            if (!outcome.ok) {
                setIsLoading(false);
                if (outcome.cancelled) return;
                const msg = outcome.error?.message ?? String(outcome.error ?? 'Unknown Error');
                info(`[${currentTranslateServiceInstanceKey}] reject: ${msg}`);
                setError(msg);
                return;
            }

            info(`[${currentTranslateServiceInstanceKey}] resolve: ${JSON.stringify(outcome.value)}`);
            let finalVal = typeof outcome.value === 'string' ? outcome.value.trim() : outcome.value;
            if (onSuccessTransform) finalVal = onSuccessTransform(finalVal, result);
            if (typeof finalVal === 'string') setResult(finalVal);
            else setResult(finalVal);
            setIsLoading(false);
            if (outcome.value !== '') setHideOnce();

            applyTranslateAftermath({
                value: finalVal,
                finalTarget: outcome.finalTarget ?? tgtLang,
                sourceText: textIn,
                detectLanguage: detectModeFromInput ? detectVal : detectVal,
                serviceName: getServiceName(currentTranslateServiceInstanceKey),
                historyDisable,
                index,
                clipboardMonitor,
                autoCopy,
                hideWindow,
                t,
            });
        },
        [
            sourceText,
            sourceLanguage,
            targetLanguage,
            detectLanguage,
            currentTranslateServiceInstanceKey,
            serviceInstanceConfigMap,
            index,
            translateSecondLanguage,
            historyDisable,
            clipboardMonitor,
            autoCopy,
            hideWindow,
            t,
        ]
    );

    // 源文本 / 语言 / 自动复制相关变量变化 → 自动翻译
    useEffect(() => {
        if (sourceText.trim() === '' || !sourceLanguage || !targetLanguage) return;
        if (autoCopy === null || hideWindow === null || clipboardMonitor === null) return;
        if (autoCopy === 'source' && !clipboardMonitor) {
            writeText(sourceText).then(() => {
                if (hideWindow)
                    sendNotification({ title: t('common.write_clipboard'), body: sourceText });
            });
        }
        performTranslate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceText, sourceLanguage, targetLanguage, autoCopy, hideWindow, currentTranslateServiceInstanceKey, clipboardMonitor]);

    // textarea auto height
    useEffect(() => {
        if (!textAreaRef.current) return;
        textAreaRef.current.style.height = '0px';
        if (result !== '' && typeof result === 'string') {
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [result]);

    // TTS 插件 info（插件分支需要读 info.json 拿 language 表）
    useEffect(() => {
        const first = ttsServiceList?.[0];
        if (!first || getServiceSouceType(first) !== ServiceSourceType.PLUGIN) {
            setTtsPluginInfo(undefined);
            return;
        }
        let cancelled = false;
        readTextFile(`plugins/tts/${getServiceName(first)}/info.json`, {
            dir: BaseDirectory.AppConfig,
        })
            .then((s) => {
                if (!cancelled) setTtsPluginInfo(JSON.parse(s));
            })
            .catch((e) => logError(`TTS info load: ${e?.message ?? String(e)}`));
        return () => {
            cancelled = true;
        };
    }, [ttsServiceList]);

    // ------------------------------------------------------------------
    // 播放按钮（TTS）：内置 / 插件统一走 runService
    // ------------------------------------------------------------------
    const handleSpeak = useCallback(async () => {
        if (typeof result !== 'string' || result === '') return;
        const instanceKey = ttsServiceList[0];
        const outcome = await runService({
            scope: 'translate-targetarea-tts',
            index,
            serviceType: 'tts',
            instanceKey,
            methodName: 'tts',
            builtinServices: builtinTtsServices,
            pluginList,
            args: [result, targetLanguage],
            options: { config: serviceInstanceConfigMap[instanceKey] ?? {} },
            skipLanguageCheck: false,
            secondLanguage: translateSecondLanguage,
            detectLanguage,
            sourceLanguage: targetLanguage,
            targetLanguage,
        });
        if (!outcome.ok || outcome.cancelled) {
            throw outcome.error ?? new Error('TTS failed');
        }
        speak(outcome.value);
    }, [result, ttsServiceList, pluginList, targetLanguage, serviceInstanceConfigMap, index, translateSecondLanguage, detectLanguage, speak]);

    // ------------------------------------------------------------------
    // 收藏按钮（Collection）：内置 / 插件统一走 runService
    // ------------------------------------------------------------------
    const handleCollect = useCallback(
        async (collectionKey) => {
            const outcome = await runService({
                scope: 'translate-targetarea-collect',
                index,
                serviceType: 'collection',
                instanceKey: collectionKey,
                methodName: 'collection',
                builtinServices: builtinCollectionServices,
                pluginList,
                args: [sourceText.trim(), typeof result === 'string' ? result : String(result)],
                options: { config: serviceInstanceConfigMap[collectionKey] ?? {} },
                skipLanguageCheck: true,
            });
            if (!outcome.ok && !outcome.cancelled) {
                throw outcome.error ?? new Error('Collection failed');
            }
        },
        [sourceText, result, pluginList, serviceInstanceConfigMap, index]
    );

    // ------------------------------------------------------------------
    // 译回（translate back）：复用 performTranslate，复用 performTranslate
    // ------------------------------------------------------------------
    const handleTranslateBack = useCallback(async () => {
        if (typeof result !== 'string' || result === '') return;
        const newTarget = sourceLanguage === 'auto' ? detectLanguage : sourceLanguage;
        const newSource = sourceLanguage === 'auto' ? 'auto' : targetLanguage;
        await performTranslate({
            customSourceText: result,
            customSourceLang: newSource,
            customTargetLang: newTarget,
            customDetect: newSource === 'auto' ? detectLanguage : newSource,
            detectModeFromInput: true,
            onSuccessTransform: (finalVal, originalResult) =>
                finalVal === originalResult ? `${finalVal} ` : finalVal,
        });
    }, [result, sourceLanguage, targetLanguage, detectLanguage, performTranslate]);

    const [boundRef, bounds] = useMeasure({ scroll: true });
    const springs = useSpring({
        from: { height: 0 },
        to: { height: hide ? 0 : bounds.height },
    });

    // ------------------------------------------------------------------
    // 服务下拉列表（每个条目根据 builtin/plugin 分别决定 icon / title）
    // ------------------------------------------------------------------
    const renderedDropdownItems = useMemo(
        () =>
            (translateServiceInstanceList ?? []).map((instanceKey) => {
                const isPlugin = whetherPluginService(instanceKey);
                const serviceName = getServiceName(instanceKey);
                const icon = isPlugin
                    ? pluginList['translate']?.[serviceName]?.icon
                    : builtinServices[serviceName]?.info?.icon;
                const title = isPlugin
                    ? `${getInstanceName(instanceKey, () => pluginList['translate']?.[serviceName]?.display)} `
                    : getInstanceName(instanceKey, () => t(`services.translate.${serviceName}.title`));
                return (
                    <DropdownItem key={instanceKey} startContent={<img src={icon} className='h-[20px] my-auto' alt={serviceName} />}>
                        <div className='my-auto'>{title}</div>
                    </DropdownItem>
                );
            }),
        [translateServiceInstanceList, pluginList, builtinServices, getInstanceName, t]
    );

    const currentServiceIcon = useMemo(() => {
        const isPlugin = whetherPluginService(currentTranslateServiceInstanceKey);
        const serviceName = getServiceName(currentTranslateServiceInstanceKey);
        return isPlugin
            ? pluginList['translate']?.[serviceName]?.icon
            : builtinServices[serviceName]?.info?.icon;
    }, [currentTranslateServiceInstanceKey, pluginList, builtinServices]);

    const currentServiceLabel = useMemo(() => {
        const isPlugin = whetherPluginService(currentTranslateServiceInstanceKey);
        const serviceName = getServiceName(currentTranslateServiceInstanceKey);
        return isPlugin
            ? `${getInstanceName(currentTranslateServiceInstanceKey, () => pluginList['translate']?.[serviceName]?.display)} `
            : getInstanceName(currentTranslateServiceInstanceKey, () => t(`services.translate.${serviceName}.title`));
    }, [currentTranslateServiceInstanceKey, pluginList, getInstanceName, t]);

    return (
        <Card shadow='none' className='rounded-[10px]'>
            <Toaster />
            <CardHeader
                className={`flex justify-between py-1 px-0 bg-content2 h-[30px] ${hide ? 'rounded-[10px]' : 'rounded-t-[10px]'}`}
                {...drag}
            >
                <div className='flex'>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                size='sm'
                                variant='solid'
                                className='bg-transparent'
                                startContent={<img src={currentServiceIcon} className='h-[20px] my-auto' alt='' />}
                            >
                                <div className='my-auto'>{currentServiceLabel}</div>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='translate service selector'
                            className='max-h-[40vh] overflow-y-auto'
                            onAction={(key) => setCurrentTranslateServiceInstanceKey(String(key))}
                        >
                            {renderedDropdownItems}
                        </DropdownMenu>
                    </Dropdown>
                    <PulseLoader
                        loading={isLoading}
                        color={theme === 'dark' ? semanticColors.dark.default[500] : semanticColors.light.default[500]}
                        size={8}
                        cssOverride={{ display: 'inline-block', margin: 'auto', marginLeft: '20px' }}
                    />
                </div>
                <div className='flex'>
                    <Button
                        size='sm'
                        isIconOnly
                        variant='light'
                        className='h-[20px] w-[20px]'
                        onPress={() => setHide((v) => !v)}
                    >
                        {hide ? (
                            <BiExpandVertical className='text-[16px]' />
                        ) : (
                            <BiCollapseVertical className='text-[16px]' />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <animated.div style={{ ...springs }}>
                <div ref={boundRef}>
                    <CardBody className={`p-[12px] pb-0 ${hide ? 'h-0 p-0' : ''}`}>
                        {typeof result === 'string' ? (
                            <textarea
                                ref={textAreaRef}
                                className='h-0 resize-none bg-transparent select-text outline-none'
                                readOnly
                                style={{ fontSize: `${appFontSize}px` }}
                                value={result}
                            />
                        ) : (
                            <div>
                                {result?.pronunciations &&
                                    result.pronunciations.map((pron) => (
                                        <div key={nanoid()}>
                                            {pron.region && (
                                                <span
                                                    className='mr-[12px] text-default-500'
                                                    style={{ fontSize: `${appFontSize}px` }}
                                                >
                                                    {pron.region}
                                                </span>
                                            )}
                                            {pron.symbol && (
                                                <span
                                                    className='mr-[12px] text-default-500'
                                                    style={{ fontSize: `${appFontSize}px` }}
                                                >
                                                    {pron.symbol}
                                                </span>
                                            )}
                                            {pron.voice && pron.voice !== '' && (
                                                <HiOutlineVolumeUp
                                                    className='inline-block my-auto cursor-pointer'
                                                    style={{ fontSize: `${appFontSize}px` }}
                                                    onClick={() => speak(pron.voice)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                {result?.explanations &&
                                    result.explanations.map((group) => (
                                        <div key={nanoid()}>
                                            {group?.explains &&
                                                group.explains.map((explain, i) => (
                                                    <span key={nanoid()}>
                                                        {i === 0 ? (
                                                            <>
                                                                <span
                                                                    className='text-default-500 mr-[12px]'
                                                                    style={{ fontSize: `${appFontSize - 2}px` }}
                                                                >
                                                                    {group.trait}
                                                                </span>
                                                                <span
                                                                    className='font-bold select-text'
                                                                    style={{ fontSize: `${appFontSize}px` }}
                                                                >
                                                                    {explain}
                                                                </span>
                                                                <br />
                                                            </>
                                                        ) : (
                                                            <span
                                                                key={nanoid()}
                                                                className='text-default-500 select-text mr-1'
                                                                style={{ fontSize: `${appFontSize - 2}px` }}
                                                            >
                                                                {explain}
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                        </div>
                                    ))}
                                <br />
                                {result?.associations &&
                                    result.associations.map((a) => (
                                        <div key={nanoid()}>
                                            <span
                                                className='text-default-500'
                                                style={{ fontSize: `${appFontSize}px` }}
                                            >
                                                {a}
                                            </span>
                                        </div>
                                    ))}
                                {result?.sentence &&
                                    result.sentence.map((s, i) => (
                                        <div key={nanoid()}>
                                            <span style={{ fontSize: `${appFontSize - 2}px` }} className='mr-[12px]'>
                                                {i + 1}.
                                            </span>
                                            {s.source && (
                                                <span
                                                    className='select-text'
                                                    style={{ fontSize: `${appFontSize}px` }}
                                                    dangerouslySetInnerHTML={{ __html: s.source }}
                                                />
                                            )}
                                            {s.target && (
                                                <div
                                                    className='select-text text-default-500'
                                                    style={{ fontSize: `${appFontSize}px` }}
                                                    dangerouslySetInnerHTML={{ __html: s.target }}
                                                />
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                        {error !== '' &&
                            error.split('\n').map((v) => (
                                <p
                                    key={v}
                                    className='text-red-500'
                                    style={{ fontSize: `${appFontSize}px` }}
                                >
                                    {v}
                                </p>
                            ))}
                    </CardBody>
                    <CardFooter
                        className={`bg-content1 rounded-none rounded-b-[10px] flex px-[12px] p-[5px] ${hide ? 'hidden' : ''}`}
                    >
                        <ButtonGroup>
                            <Tooltip content={t('translate.speak')}>
                                <Button
                                    isIconOnly
                                    variant='light'
                                    size='sm'
                                    isDisabled={typeof result !== 'string' || result === ''}
                                    onPress={() => handleSpeak().catch((e) => toast.error(e.toString(), { style: toastStyle }))}
                                >
                                    <HiOutlineVolumeUp className='text-[16px]' />
                                </Button>
                            </Tooltip>
                            <Tooltip content={t('translate.copy')}>
                                <Button
                                    isIconOnly
                                    variant='light'
                                    size='sm'
                                    isDisabled={typeof result !== 'string' || result === ''}
                                    onPress={() => typeof result === 'string' && writeText(result)}
                                >
                                    <MdContentCopy className='text-[16px]' />
                                </Button>
                            </Tooltip>
                            <Tooltip content={t('translate.translate_back')}>
                                <Button
                                    isIconOnly
                                    variant='light'
                                    size='sm'
                                    isDisabled={typeof result !== 'string' || result === ''}
                                    onPress={handleTranslateBack}
                                >
                                    <TbTransformFilled className='text-[16px]' />
                                </Button>
                            </Tooltip>
                            <Tooltip content={t('translate.retry')}>
                                <Button
                                    isIconOnly
                                    variant='light'
                                    size='sm'
                                    className={`${error === '' ? 'hidden' : ''}`}
                                    onPress={() => {
                                        setError('');
                                        setResult('');
                                        performTranslate();
                                    }}
                                >
                                    <GiCycle className='text-[16px]' />
                                </Button>
                            </Tooltip>
                            {(collectionServiceList ?? []).map((collectionKey) => {
                                const isPlugin = getServiceSouceType(collectionKey) === ServiceSourceType.PLUGIN;
                                const sName = getServiceName(collectionKey);
                                const icon = isPlugin
                                    ? pluginList['collection']?.[sName]?.icon
                                    : builtinCollectionServices[sName]?.info?.icon;
                                return (
                                    <Button
                                        key={collectionKey}
                                        isIconOnly
                                        variant='light'
                                        size='sm'
                                        onPress={() =>
                                            handleCollect(collectionKey)
                                                .then(() => toast.success(t('translate.add_collection_success'), { style: toastStyle }))
                                                .catch((e) => toast.error(e.toString(), { style: toastStyle }))
                                        }
                                    >
                                        <img src={icon} className='h-[16px] w-[16px]' alt='' />
                                    </Button>
                                );
                            })}
                        </ButtonGroup>
                    </CardFooter>
                </div>
            </animated.div>
        </Card>
    );
}
