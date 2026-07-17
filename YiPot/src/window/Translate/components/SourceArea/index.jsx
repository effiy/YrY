import { Card, CardBody, Spacer } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { appWindow } from '@tauri-apps/api/window';
import toast, { Toaster } from 'react-hot-toast';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';
import { atom, useAtom } from 'jotai';
import { getServiceName, getServiceSouceType, ServiceSourceType } from '../../../../utils/service_instance';
import { useConfig, useSyncAtom, useVoice, useToastStyle, useTtsPluginInfo } from '../../../../hooks';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as recognizeServices from '../../../../services/recognize';
import * as builtinTtsServices from '../../../../services/tts';
import detect from '../../../../utils/lang_detect';
import SourceActionBar from './SourceActionBar';

export const sourceTextAtom = atom('');
export const detectLanguageAtom = atom('');

const INPUT_TRANSLATE = '[INPUT_TRANSLATE]';
const IMAGE_TRANSLATE = '[IMAGE_TRANSLATE]';
const SELECTION_TRANSLATE = '[SELECTION_TRANSLATE]';

async function callRecognizeService({ isPlugin, serviceName, base64, langCode, instanceConfig }) {
    const baseConfig = { config: instanceConfig };
    if (isPlugin) {
        const [func, utils] = await invoke_plugin('recognize', serviceName);
        return func(base64, langCode, { ...baseConfig, utils });
    }
    return recognizeServices[serviceName].recognize(base64, langCode, baseConfig);
}

async function callTtsService({ isPlugin, serviceName, text, langCode, instanceConfig }) {
    const baseConfig = { config: instanceConfig };
    if (isPlugin) {
        const [func, utils] = await invoke_plugin('tts', serviceName);
        return func(text, langCode, { ...baseConfig, utils });
    }
    return builtinTtsServices[serviceName].tts(text, langCode, baseConfig);
}

const VAR_NAME_TRANSFORMS = [
    // snake_case → SNAKE_CASE
    {
        test: /_[a-z]/,
        transform: (s) => s.split('_').map((it) => it.toLocaleUpperCase()).join('_'),
    },
    // SNAKE_CASE → kebab-case
    {
        test: /^[A-Z]+(_[A-Z]+)*$/,
        transform: (s) => s.split('_').map((it) => it.toLocaleLowerCase()).join('-'),
    },
    // kebab-case → dot.notation
    {
        test: /-/,
        transform: (s) => s.split('-').map((it) => it.toLocaleLowerCase()).join('.'),
    },
    // dot.notation → space separated
    {
        test: /\.[a-z]/,
        transform: (s) => s.replaceAll(/(\.)([a-z])/g, (_, _2, it) => ' ' + it),
    },
    // space separated → Title Case
    {
        test: /\s[a-z]/,
        transform: (s) => {
            const titled = s.replaceAll(/\s([a-z])/g, (_, it) => ' ' + it.toLocaleUpperCase());
            return titled.substring(0, 1).toLocaleUpperCase() + titled.substring(1);
        },
    },
    // Title Case → CamelCase
    {
        test: /\s[A-Z]/,
        transform: (s) => {
            const camelled = s.replaceAll(/\s([A-Z])/g, (_, it) => it);
            return camelled.substring(0, 1).toLocaleLowerCase() + camelled.substring(1);
        },
    },
    // CamelCase → PascalCase
    {
        test: /^[a-z]+[A-Z]+/,
        transform: (s) => s.substring(0, 1).toLocaleUpperCase() + s.substring(1),
    },
    // PascalCase → snake_case
    {
        test: /[^\s][A-Z]/,
        transform: (s) =>
            s.replaceAll(/[A-Z]/g, (it, offset) => (offset == 0 ? '' : '_') + it.toLocaleLowerCase()),
    },
];

function transformVarName(str) {
    for (const { test, transform } of VAR_NAME_TRANSFORMS) {
        if (test.test(str)) {
            const next = transform(str);
            if (next !== str) return next;
        }
    }
    return str;
}

export default function SourceArea(props) {
    const { pluginList, serviceInstanceConfigMap } = props;
    const [appFontSize] = useConfig('app_font_size', 16);
    const [sourceText, setSourceText, syncSourceText] = useSyncAtom(sourceTextAtom);
    const [detectLanguage, setDetectLanguage] = useAtom(detectLanguageAtom);
    const [incrementalTranslate] = useConfig('incremental_translate', false);
    const [dynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline] = useConfig('translate_delete_newline', false);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [recognizeServiceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [hideSource] = useConfig('hide_source', false);
    const ttsPluginInfo = useTtsPluginInfo(ttsServiceList);
    const [windowType, setWindowType] = useState(SELECTION_TRANSLATE);
    const toastStyle = useToastStyle();
    const textAreaRef = useRef();
    const sourceTextChangeTimerRef = useRef(null);
    const handleNewTextRef = useRef(null);
    const changeSourceTextRef = useRef(null);
    const speak = useVoice();

    const applyRecognizedText = (rawText) => {
        const newText = deleteNewline
            ? rawText.replace(/\-\s+/g, '').replace(/\s+/g, ' ')
            : rawText.trim();
        if (incrementalTranslate) {
            setSourceText((old) => old + ' ' + newText);
        } else {
            setSourceText(newText);
        }
        detect_language(newText).then(() => {
            syncSourceText();
        });
    };

    const setWindowVisibility = () => {
        if (hideWindow) {
            appWindow.hide();
        } else {
            appWindow.show();
            appWindow.setFocus();
        }
    };

    const handleNewText = async (text) => {
        text = text.trim();
        setWindowVisibility();
        if (detectLanguage !== '') setDetectLanguage('');
        if (text === INPUT_TRANSLATE) {
            setWindowType(INPUT_TRANSLATE);
            setSourceText('', true);
        } else if (text === IMAGE_TRANSLATE) {
            setWindowType(IMAGE_TRANSLATE);
            const base64 = await invoke('get_base64');
            const serviceInstanceKey = recognizeServiceList[0];
            const isPlugin = getServiceSouceType(serviceInstanceKey) === ServiceSourceType.PLUGIN;
            const serviceName = getServiceName(serviceInstanceKey);
            const languageMap = isPlugin
                ? pluginList['recognize'][serviceName].language
                : recognizeServices[serviceName].Language;
            if (!(recognizeLanguage in languageMap)) {
                setSourceText('Language not supported');
                return;
            }
            const instanceConfig = serviceInstanceConfigMap[serviceInstanceKey];
            callRecognizeService({
                isPlugin,
                serviceName,
                base64,
                langCode: languageMap[recognizeLanguage],
                instanceConfig,
            }).then(
                (v) => applyRecognizedText(v),
                (e) => setSourceText(e.toString())
            );
        } else {
            setWindowType(SELECTION_TRANSLATE);
            applyRecognizedText(text);
        }
    };
    handleNewTextRef.current = handleNewText;

    const keyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            detect_language(sourceText).then(() => {
                syncSourceText();
            });
        }
        if (event.key === 'Escape') {
            appWindow.close();
        }
    };

    const handleSpeak = async () => {
        try {
            const instanceKey = ttsServiceList[0];
            let detected = detectLanguage;
            if (detected === '') {
                detected = await detect(sourceText);
                setDetectLanguage(detected);
            }
            const isPlugin = getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN;
            const serviceName = getServiceName(instanceKey);
            const languageMap = isPlugin
                ? ttsPluginInfo?.language
                : builtinTtsServices[serviceName].Language;
            if (!languageMap || !(detected in languageMap)) {
                throw new Error('Language not supported');
            }
            const instanceConfig = serviceInstanceConfigMap[instanceKey];
            const data = await callTtsService({
                isPlugin,
                serviceName,
                text: sourceText,
                langCode: languageMap[detected],
                instanceConfig,
            });
            speak(data);
        } catch (e) {
            toast.error(e.toString(), { style: toastStyle });
        }
    };

    useEffect(() => {
        if (hideWindow === null) return;
        let unlistenFn;
        let cancelled = false;
        listen('new_text', (event) => {
            appWindow.setFocus();
            handleNewTextRef.current(event.payload);
        }).then((f) => {
            if (cancelled) {
                f();
            } else {
                unlistenFn = f;
            }
        });
        return () => {
            cancelled = true;
            unlistenFn?.();
        };
    }, [hideWindow]);

    useEffect(() => {
        if (
            deleteNewline !== null &&
            incrementalTranslate !== null &&
            recognizeLanguage !== null &&
            recognizeServiceList !== null &&
            hideWindow !== null
        ) {
            invoke('get_text').then((v) => {
                handleNewText(v);
            });
        }
    }, [deleteNewline, incrementalTranslate, recognizeLanguage, recognizeServiceList, hideWindow]);

    useEffect(() => {
        textAreaRef.current.style.height = '50px';
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }, [sourceText]);

    const lastDetectRef = useRef({ text: '', detected: '' });
    const detect_language = async (text) => {
        if (lastDetectRef.current.text === text) {
            setDetectLanguage(lastDetectRef.current.detected);
            return;
        }
        const detected = await detect(text);
        lastDetectRef.current = { text, detected };
        setDetectLanguage(detected);
    };

    const changeSourceText = async (text) => {
        setDetectLanguage('');
        await setSourceText(text);
        if (dynamicTranslate) {
            if (sourceTextChangeTimerRef.current) {
                clearTimeout(sourceTextChangeTimerRef.current);
            }
            sourceTextChangeTimerRef.current = setTimeout(() => {
                detect_language(text).then(() => {
                    syncSourceText();
                });
            }, 1000);
        }
    };
    changeSourceTextRef.current = changeSourceText;

    useEffect(() => {
        return () => {
            if (sourceTextChangeTimerRef.current) {
                clearTimeout(sourceTextChangeTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const el = textAreaRef.current;
        if (!el) return;
        const handler = async (event) => {
            if (event.altKey && event.shiftKey && event.code === 'KeyU') {
                const originText = el.value;
                const selectionStart = el.selectionStart;
                const selectionEnd = el.selectionEnd;
                const selectionText = originText.substring(selectionStart, selectionEnd);

                const convertedText = transformVarName(selectionText);
                const targetText = originText.substring(0, selectionStart) + convertedText + originText.substring(selectionEnd);

                await changeSourceTextRef.current(targetText);
                el.selectionStart = selectionStart;
                el.selectionEnd = selectionStart + convertedText.length;
            }
        };
        el.addEventListener('keydown', handler);
        return () => el.removeEventListener('keydown', handler);
    }, [textAreaRef]);


    return (
        <div className={hideSource && windowType !== INPUT_TRANSLATE && 'hidden'}>
            <Card
                shadow='none'
                className='bg-content1 rounded-[10px] mt-[1px] pb-0'
            >
                <Toaster />
                <CardBody className='bg-content1 p-[12px] pb-0 max-h-[40vh] overflow-y-auto'>
                    <textarea
                        autoFocus
                        ref={textAreaRef}
                        className={`text-[${appFontSize}px] bg-content1 h-full resize-none outline-none`}
                        value={sourceText}
                        onKeyDown={keyDown}
                        onChange={(e) => {
                            const v = e.target.value;
                            changeSourceText(v);
                        }}
                    />
                </CardBody>

                <SourceActionBar
                    sourceText={sourceText}
                    detectLanguage={detectLanguage}
                    onSpeak={handleSpeak}
                    onCopy={() => writeText(sourceText)}
                    onDeleteNewline={() => {
                        const newText = sourceText.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
                        setSourceText(newText);
                        detect_language(newText).then(() => {
                            syncSourceText();
                        });
                    }}
                    onClear={() => {
                        setSourceText('');
                    }}
                    onTranslate={() => {
                        detect_language(sourceText).then(() => {
                            syncSourceText();
                        });
                    }}
                />
            </Card>
            <Spacer y={2} />
        </div>
    );
}
