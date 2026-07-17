import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Button,
} from '@nextui-org/react';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import { sendNotification } from '@tauri-apps/api/notification';
import React, { useEffect, useState, useRef } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import { semanticColors } from '@nextui-org/theme';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Database from 'tauri-plugin-sql-api';
import { useTheme } from 'next-themes';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useSpring, animated } from '@react-spring/web';
import useMeasure from 'react-use-measure';

import * as builtinCollectionServices from '../../../../services/collection';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { useConfig, useToastStyle, useVoice, useTtsPluginInfo } from '../../../../hooks';
import { sourceTextAtom, detectLanguageAtom } from '../SourceArea';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as builtinServices from '../../../../services/translate';
import * as builtinTtsServices from '../../../../services/tts';
import ResultView from './ResultView';
import ServiceDropdown from './ServiceDropdown';
import ActionBar from './ActionBar';

import { info, error as logError } from 'tauri-plugin-log-api';
import {
    ServiceSourceType,
    getServiceName,
    getServiceSouceType,
    whetherPluginService,
} from '../../../../utils/service_instance';

function invokeOnce(fn) {
    let isInvoke = false;
    return (...args) => {
        if (isInvoke) return;
        fn(...args);
        isInvoke = true;
    };
}

async function callPlugin(kind, serviceName, args, baseConfig) {
    const [func, utils] = await invoke_plugin(kind, serviceName);
    return func(...args, { ...baseConfig, utils });
}

async function callTranslateService({
    isPlugin,
    serviceName,
    text,
    sourceLangCode,
    targetLangCode,
    instanceConfig,
    detect,
    setResult,
}) {
    const config = isPlugin ? { ...instanceConfig, enable: 'true' } : instanceConfig;
    const baseConfig = { config, detect, setResult };
    if (isPlugin) {
        return callPlugin('translate', serviceName, [text, sourceLangCode, targetLangCode], baseConfig);
    }
    return builtinServices[serviceName].translate(text, sourceLangCode, targetLangCode, baseConfig);
}

async function callTtsService({ isPlugin, serviceName, text, targetLangCode, instanceConfig }) {
    const baseConfig = { config: instanceConfig };
    if (isPlugin) {
        return callPlugin('tts', serviceName, [text, targetLangCode], baseConfig);
    }
    return builtinTtsServices[serviceName].tts(text, targetLangCode, baseConfig);
}

async function callCollectionService({ isPlugin, serviceName, sourceText, result, instanceConfig }) {
    const baseConfig = { config: instanceConfig };
    if (isPlugin) {
        return callPlugin('collection', serviceName, [sourceText.trim(), result.toString()], baseConfig);
    }
    return builtinCollectionServices[serviceName].collection(sourceText, result, baseConfig);
}

function getServiceMeta(instanceKey, pluginList) {
    const isPlugin = whetherPluginService(instanceKey);
    const serviceName = getServiceName(instanceKey);
    const languageMap = isPlugin
        ? pluginList['translate'][serviceName].language
        : builtinServices[serviceName].Language;
    return { isPlugin, serviceName, languageMap };
}

const INSERT_HISTORY_SQL =
    'INSERT into history (text, source, target, service, result, timestamp) VALUES ($1, $2, $3, $4, $5, $6)';
const CREATE_HISTORY_SQL =
    'CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL,source TEXT NOT NULL,target TEXT NOT NULL,service TEXT NOT NULL, result TEXT NOT NULL,timestamp INTEGER NOT NULL)';

export default function TargetArea(props) {
    const { index, name, translateServiceInstanceList, pluginList, serviceInstanceConfigMap, ...drag } = props;

    const [currentTranslateServiceInstanceKey, setCurrentTranslateServiceInstanceKey] = useState(name);

    const [appFontSize] = useConfig('app_font_size', 16);
    const [collectionServiceList] = useConfig('collection_service_list', []);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');
    const [historyDisable] = useConfig('history_disable', false);
    const [isLoading, setIsLoading] = useState(false);
    const [hide, setHide] = useState(true);

    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const [autoCopy] = useConfig('translate_auto_copy', 'disable');
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [clipboardMonitor] = useConfig('clipboard_monitor', false);

    const detectLanguage = useAtomValue(detectLanguageAtom);
    const ttsPluginInfo = useTtsPluginInfo(ttsServiceList);
    const { t } = useTranslation();
    const textAreaRef = useRef();
    const currentTranslateIdRef = useRef(null);
    const toastStyle = useToastStyle();
    const speak = useVoice();
    const theme = useTheme();

    useEffect(() => {
        if (error) {
            logError(`[${currentTranslateServiceInstanceKey}]happened error: ` + error);
        }
    }, [error]);

    useEffect(() => {
        const configsReady = autoCopy !== null && hideWindow !== null && clipboardMonitor !== null;
        if (!(sourceText.trim() !== '' && sourceLanguage && targetLanguage && configsReady)) {
            return;
        }
        setResult('');
        setError('');
        if (autoCopy === 'source' && !clipboardMonitor) {
            writeText(sourceText).then(() => {
                if (hideWindow) {
                    sendNotification({ title: t('common.write_clipboard'), body: sourceText });
                }
            });
        }
        translate();
    }, [
        sourceText,
        sourceLanguage,
        targetLanguage,
        autoCopy,
        hideWindow,
        currentTranslateServiceInstanceKey,
        clipboardMonitor,
    ]);

    const addToHistory = async (text, source, target, serviceInstanceKey, result) => {
        const row = [text, source, target, serviceInstanceKey, result, Date.now()];
        const db = await Database.load('sqlite:history.db');
        try {
            await db.execute(CREATE_HISTORY_SQL);
            await db.execute(INSERT_HISTORY_SQL, row);
        } finally {
            await db.close();
        }
    };

    const autoCopyResult = (v, sourceTextTrimmed) => {
        if (index !== 0 || clipboardMonitor) return;
        switch (autoCopy) {
            case 'target':
                writeText(v).then(() => {
                    if (hideWindow) {
                        sendNotification({ title: t('common.write_clipboard'), body: v });
                    }
                });
                break;
            case 'source_target':
                writeText(sourceTextTrimmed + '\n\n' + v).then(() => {
                    if (hideWindow) {
                        sendNotification({
                            title: t('common.write_clipboard'),
                            body: sourceTextTrimmed + '\n\n' + v,
                        });
                    }
                });
                break;
            default:
                break;
        }
    };

    const translate = async () => {
        const id = nanoid();
        currentTranslateIdRef.current = id;
        const isCurrent = () => currentTranslateIdRef.current === id;

        const { isPlugin, serviceName: translateServiceName, languageMap } = getServiceMeta(
            currentTranslateServiceInstanceKey,
            pluginList
        );

        if (!(sourceLanguage in languageMap && targetLanguage in languageMap)) {
            setError('Language not supported');
            return;
        }

        let newTargetLanguage = targetLanguage;
        if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
            newTargetLanguage = translateSecondLanguage;
        }

        setIsLoading(true);
        setHide(true);
        const instanceConfig = serviceInstanceConfigMap[currentTranslateServiceInstanceKey];
        const setHideOnce = invokeOnce(setHide);
        const sourceTextTrimmed = sourceText.trim();

        callTranslateService({
            isPlugin,
            serviceName: translateServiceName,
            text: sourceTextTrimmed,
            sourceLangCode: languageMap[sourceLanguage],
            targetLangCode: languageMap[newTargetLanguage],
            instanceConfig,
            detect: detectLanguage,
            setResult: (v) => {
                if (!isCurrent()) return;
                setResult(v);
                setHideOnce(false);
            },
        }).then(
            (v) => {
                info(`[${currentTranslateServiceInstanceKey}]resolve:` + v);
                if (!isCurrent()) return;
                const trimmed = typeof v === 'string' ? v.trim() : v;
                setResult(trimmed);
                setIsLoading(false);
                if (v !== '') setHideOnce(false);
                if (!historyDisable) {
                    addToHistory(
                        sourceTextTrimmed,
                        detectLanguage,
                        newTargetLanguage,
                        translateServiceName,
                        trimmed
                    );
                }
                autoCopyResult(v, sourceTextTrimmed);
            },
            (e) => {
                info(`[${currentTranslateServiceInstanceKey}]reject:` + e);
                if (!isCurrent()) return;
                setError(e.toString());
                setIsLoading(false);
            }
        );
    };

    const translateBack = async () => {
        setError('');
        let newTargetLanguage = sourceLanguage;
        if (sourceLanguage === 'auto') newTargetLanguage = detectLanguage;
        let newSourceLanguage = targetLanguage;
        if (sourceLanguage === 'auto') newSourceLanguage = 'auto';

        const { isPlugin, serviceName, languageMap } = getServiceMeta(
            currentTranslateServiceInstanceKey,
            pluginList
        );

        if (!(newSourceLanguage in languageMap && newTargetLanguage in languageMap)) {
            setError('Language not supported');
            return;
        }

        setIsLoading(true);
        setHide(true);
        const instanceConfig = serviceInstanceConfigMap[currentTranslateServiceInstanceKey];
        const setHideOnce = invokeOnce(setHide);

        callTranslateService({
            isPlugin,
            serviceName,
            text: result.trim(),
            sourceLangCode: languageMap[newSourceLanguage],
            targetLangCode: languageMap[newTargetLanguage],
            instanceConfig,
            detect: isPlugin ? detectLanguage : newSourceLanguage,
            setResult: (v) => {
                setResult(v);
                setHideOnce(false);
            },
        }).then(
            (v) => {
                if (v === result) {
                    setResult(v + ' ');
                } else {
                    setResult(v.trim());
                }
                setIsLoading(false);
                if (v !== '') setHideOnce(false);
            },
            (e) => {
                setError(e.toString());
                setIsLoading(false);
            }
        );
    };

    useEffect(() => {
        if (textAreaRef.current !== null) {
            textAreaRef.current.style.height = '0px';
            if (result !== '') {
                textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
            }
        }
    }, [result]);

    const handleSpeak = async () => {
        try {
            const instanceKey = ttsServiceList[0];
            const isPlugin = getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN;
            const serviceName = getServiceName(instanceKey);
            const languageMap = isPlugin
                ? ttsPluginInfo?.language
                : builtinTtsServices[serviceName].Language;
            if (!languageMap || !(targetLanguage in languageMap)) {
                throw new Error('Language not supported');
            }
            const instanceConfig = serviceInstanceConfigMap[instanceKey];
            const data = await callTtsService({
                isPlugin,
                serviceName,
                text: result,
                targetLangCode: languageMap[targetLanguage],
                instanceConfig,
            });
            speak(data);
        } catch (e) {
            toast.error(e.toString(), { style: toastStyle });
        }
    };

    const collect = (instanceName) => {
        const isPlugin = getServiceSouceType(instanceName) === ServiceSourceType.PLUGIN;
        const serviceName = getServiceName(instanceName);
        const instanceConfig = serviceInstanceConfigMap[instanceName];
        callCollectionService({
            isPlugin,
            serviceName,
            sourceText,
            result,
            instanceConfig,
        }).then(
            () => toast.success(t('translate.add_collection_success'), { style: toastStyle }),
            (e) => toast.error(e.toString(), { style: toastStyle })
        );
    };

    const [boundRef, bounds] = useMeasure({ scroll: true });
    const springs = useSpring({
        from: { height: 0 },
        to: { height: hide ? 0 : bounds.height },
    });

    return (
        <Card
            shadow='none'
            className='rounded-[10px]'
        >
            <Toaster />
            <CardHeader
                className={`flex justify-between py-1 px-0 bg-content2 h-[30px] ${hide ? 'rounded-[10px]' : 'rounded-t-[10px]'}`}
                {...drag}
            >
                {/* current service instance and available service instance to change */}
                <div className='flex'>
                    <ServiceDropdown
                        currentKey={currentTranslateServiceInstanceKey}
                        instanceList={translateServiceInstanceList}
                        pluginList={pluginList}
                        serviceInstanceConfigMap={serviceInstanceConfigMap}
                        onSelect={setCurrentTranslateServiceInstanceKey}
                    />
                    <PulseLoader
                        loading={isLoading}
                        color={theme === 'dark' ? semanticColors.dark.default[500] : semanticColors.light.default[500]}
                        size={8}
                        cssOverride={{
                            display: 'inline-block',
                            margin: 'auto',
                            marginLeft: '20px',
                        }}
                    />
                </div>
                {/* content collapse */}
                <div className='flex'>
                    <Button
                        size='sm'
                        isIconOnly
                        variant='light'
                        className='h-[20px] w-[20px]'
                        onPress={() => setHide(!hide)}
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
                    {/* result content */}
                    <CardBody className={`p-[12px] pb-0 ${hide && 'h-0 p-0'}`}>
                        <ResultView
                            result={result}
                            error={error}
                            textAreaRef={textAreaRef}
                            appFontSize={appFontSize}
                            speak={speak}
                        />
                    </CardBody>
                    <CardFooter
                        className={`bg-content1 rounded-none rounded-b-[10px] flex px-[12px] p-[5px] ${hide && 'hidden'}`}
                    >
                        <ActionBar
                            result={result}
                            error={error}
                            collectionServiceList={collectionServiceList}
                            pluginList={pluginList}
                            onSpeak={handleSpeak}
                            onCopy={() => writeText(result)}
                            onTranslateBack={translateBack}
                            onRetry={() => {
                                setError('');
                                setResult('');
                                translate();
                            }}
                            onCollect={collect}
                        />
                    </CardFooter>
                </div>
            </animated.div>
        </Card>
    );
}
