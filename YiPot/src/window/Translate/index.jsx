import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { appWindow, currentMonitor } from '@tauri-apps/api/window';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Spacer, Button } from '@nextui-org/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import React, { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { BsPinFill } from 'react-icons/bs';

import LanguageArea from './components/LanguageArea';
import SourceArea from './components/SourceArea';
import TargetArea from './components/TargetArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import { store } from '../../utils/store';
import { info } from 'tauri-plugin-log-api';

/**
 * 窗口 blur→300ms 后关闭，在 focus/move/showing 时取消；
 * 与 Recognize 统一的 hook：使用 per-instance ref 管理 listener/timer，
 * 避免旧实现里模块级变量 + 顶层 listen 在 WebView 重建（HMR/关窗后重开）时多次叠加。
 */
function useBlurAutoClose(enable) {
    const blurTimerRef = useRef(null);
    const unlistenBlurRef = useRef(null);
    const unlistenFocusRef = useRef(null);
    const unlistenMoveRef = useRef(null);
    const unlistenResizeRef = useRef(null);
    // 最后一次「我们主动」触发的窗口变化时间：
    // - move/resize 自身事件刷新
    // - 前端每次调用 show/setFocus 成功后也刷新（通过全局事件桥）
    const lastSelfChangeAtRef = useRef(Date.now());
    const SELF_CHANGE_SUPPRESS_MS = 500;

    useEffect(() => {
        const onSelfChangeHint = () => {
            lastSelfChangeAtRef.current = Date.now();
        };
        window.addEventListener('__yipot_translate_self_change__', onSelfChangeHint);
        const cleanup = () => {
            window.removeEventListener('__yipot_translate_self_change__', onSelfChangeHint);
            if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
            }
            const olds = [
                unlistenBlurRef.current,
                unlistenFocusRef.current,
                unlistenMoveRef.current,
                unlistenResizeRef.current,
            ];
            unlistenBlurRef.current = null;
            unlistenFocusRef.current = null;
            unlistenMoveRef.current = null;
            unlistenResizeRef.current = null;
            olds.forEach((u) => u?.then?.((f) => f?.()).catch(() => {}));
        };
        cleanup();
        if (!enable) return cleanup;

        // 比 blur 延时多 20ms：彻底吸收平台的瞬时 deactivate/activate
        const BLUR_CLOSE_MS = 300;

        unlistenBlurRef.current = listen('tauri://blur', () => {
            if (appWindow.label !== 'translate') return;
            const now = Date.now();
            const suppressFor = SELF_CHANGE_SUPPRESS_MS - (now - lastSelfChangeAtRef.current);
            // 我们主动触发的窗口变化/move/resize/setFocus 都会产生平台层假 blur，
            // 在 SELF_CHANGE_SUPPRESS_MS 内直接忽略，不 arm close 定时器。
            if (suppressFor > 0) return;
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            info('Blur (Translate, scheduled close)');
            blurTimerRef.current = setTimeout(async () => {
                blurTimerRef.current = null;
                info('Confirm Blur Close (Translate)');
                await appWindow.close().catch(() => {});
            }, BLUR_CLOSE_MS);
        }).catch((e) => {
            info('listen(blur) skipped:' + (e?.message ?? e));
            return () => {};
        });

        unlistenFocusRef.current = listen('tauri://focus', () => {
            info('Focus (Translate, cancel close)');
            lastSelfChangeAtRef.current = Date.now();
            if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
            }
        }).catch(() => () => {});

        unlistenMoveRef.current = listen('tauri://move', () => {
            info('Move (Translate, cancel close)');
            lastSelfChangeAtRef.current = Date.now();
            if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
            }
        }).catch(() => () => {});

        unlistenResizeRef.current = listen('tauri://resize', () => {
            info('Resize (Translate, cancel close)');
            lastSelfChangeAtRef.current = Date.now();
            if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
            }
        }).catch(() => () => {});

        return cleanup;
    }, [enable]);
}

export default function Translate() {
    const [closeOnBlur] = useConfig('translate_close_on_blur', true);
    const [alwaysOnTop] = useConfig('translate_always_on_top', false);
    const [windowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [translateServiceInstanceList, setTranslateServiceInstanceList] = useConfig('translate_service_list', [
        'deepl',
        'bing',
        'lingva',
        'yandex',
        'google',
        'ecdict',
    ]);
    const [recognizeServiceInstanceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceInstanceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [collectionServiceInstanceList] = useConfig('collection_service_list', []);
    const [hideLanguage] = useConfig('hide_language', false);
    const [pined, setPined] = useState(false);
    const [pluginList, setPluginList] = useState(null);
    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = useState(null);
    const moveTimerRef = useRef(null);
    const resizeTimerRef = useRef(null);

    // 自动关闭：blur 触发；关闭条件：closeOnBlur=true 且 未置顶未钉
    useBlurAutoClose(Boolean(closeOnBlur && !pined && !alwaysOnTop));

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = reorder(translateServiceInstanceList, result.source.index, result.destination.index);
        setTranslateServiceInstanceList(items);
    };

    // 是否默认置顶：钉住=禁用 blur 自动关闭
    useEffect(() => {
        if (alwaysOnTop !== null && alwaysOnTop) {
            appWindow.setAlwaysOnTop(true).catch(() => {});
            setPined(true);
        }
    }, [alwaysOnTop]);
    // 保存窗口位置
    useEffect(() => {
        let unlistenFn = null;
        let cancelled = false;
        if (windowPosition === 'pre_state') {
            const unlistenP = listen('tauri://move', async () => {
                if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
                moveTimerRef.current = setTimeout(async () => {
                    if (appWindow.label !== 'translate') return;
                    let position = await appWindow.outerPosition();
                    const monitor = await currentMonitor();
                    const factor = monitor.scaleFactor;
                    position = position.toLogical(factor);
                    await store.set('translate_window_position_x', parseInt(position.x));
                    await store.set('translate_window_position_y', parseInt(position.y));
                    await store.save().catch(() => {});
                }, 100);
            });
            unlistenP.then((f) => {
                if (!cancelled) unlistenFn = f;
            }).catch(() => {});
        }
        return () => {
            cancelled = true;
            if (moveTimerRef.current) {
                clearTimeout(moveTimerRef.current);
                moveTimerRef.current = null;
            }
            if (typeof unlistenFn === 'function') unlistenFn();
        };
    }, [windowPosition]);
    // 保存窗口大小
    useEffect(() => {
        let unlistenFn = null;
        let cancelled = false;
        if (rememberWindowSize) {
            const unlistenP = listen('tauri://resize', async () => {
                if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
                resizeTimerRef.current = setTimeout(async () => {
                    if (appWindow.label !== 'translate') return;
                    let size = await appWindow.outerSize();
                    const monitor = await currentMonitor();
                    const factor = monitor.scaleFactor;
                    size = size.toLogical(factor);
                    await store.set('translate_window_height', parseInt(size.height));
                    await store.set('translate_window_width', parseInt(size.width));
                    await store.save().catch(() => {});
                }, 100);
            });
            unlistenP.then((f) => {
                if (!cancelled) unlistenFn = f;
            }).catch(() => {});
        }
        return () => {
            cancelled = true;
            if (resizeTimerRef.current) {
                clearTimeout(resizeTimerRef.current);
                resizeTimerRef.current = null;
            }
            if (typeof unlistenFn === 'function') unlistenFn();
        };
    }, [rememberWindowSize]);

    const loadPluginList = async () => {
        const serviceTypeList = ['translate', 'tts', 'recognize', 'collection'];
        let temp = {};
        for (const serviceType of serviceTypeList) {
            temp[serviceType] = {};
            if (await exists(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig })) {
                const plugins = await readDir(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig });
                for (const plugin of plugins) {
                    const infoStr = await readTextFile(`plugins/${serviceType}/${plugin.name}/info.json`, {
                        dir: BaseDirectory.AppConfig,
                    });
                    let pluginInfo = JSON.parse(infoStr);
                    if ('icon' in pluginInfo) {
                        const appConfigDirPath = await appConfigDir();
                        const iconPath = await join(
                            appConfigDirPath,
                            `/plugins/${serviceType}/${plugin.name}/${pluginInfo.icon}`
                        );
                        pluginInfo.icon = convertFileSrc(iconPath);
                    }
                    temp[serviceType][plugin.name] = pluginInfo;
                }
            }
        }
        setPluginList({ ...temp });
    };

    // 插件列表刷新：单份 listener（HMR 下也不会重复叠加）
    const pluginReloadRef = React.useRef(null);
    useEffect(() => {
        loadPluginList();
        if (!pluginReloadRef.current) {
            pluginReloadRef.current = listen('reload_plugin_list', loadPluginList).catch(() => () => {});
        }
        return () => {
            const ref = pluginReloadRef.current;
            pluginReloadRef.current = null;
            if (ref && typeof ref.then === 'function') {
                ref.then((u) => typeof u === 'function' && u()).catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadServiceInstanceConfigMap = async () => {
        const config = {};
        for (const serviceInstanceKey of translateServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of recognizeServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of ttsServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of collectionServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        setServiceInstanceConfigMap({ ...config });
    };
    useEffect(() => {
        if (
            translateServiceInstanceList !== null &&
            recognizeServiceInstanceList !== null &&
            ttsServiceInstanceList !== null &&
            collectionServiceInstanceList !== null
        ) {
            loadServiceInstanceConfigMap();
        }
    }, [
        translateServiceInstanceList,
        recognizeServiceInstanceList,
        ttsServiceInstanceList,
        collectionServiceInstanceList,
    ]);

    return (
        pluginList && (
            <div
                className={`bg-background h-screen w-screen ${
                    osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
                }`}
            >
                <div
                    className='fixed top-[5px] left-[5px] right-[5px] h-[30px]'
                    data-tauri-drag-region='true'
                />
                <div className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className='my-auto bg-transparent'
                        onPress={() => {
                            setPined((old) => {
                                const next = !old;
                                // pinned=true: 强制最前，禁用 blur 自动关闭（由 useBlurAutoClose 联动）
                                // pinned=false: 恢复默认层级，blur 自动关闭在 !next && closeOnBlur 时生效
                                appWindow.setAlwaysOnTop(next).catch(() => {});
                                return next;
                            });
                        }}
                    >
                        <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
                    </Button>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                        onPress={() => {
                            void appWindow.close();
                        }}
                    >
                        <AiFillCloseCircle className='text-[20px] text-default-400' />
                    </Button>
                </div>
                <div className={`${osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'} px-[8px]`}>
                    <div className='h-full overflow-y-auto'>
                        <div>
                            {serviceInstanceConfigMap !== null && (
                                <SourceArea
                                    pluginList={pluginList}
                                    serviceInstanceConfigMap={serviceInstanceConfigMap}
                                />
                            )}
                        </div>
                        <div className={`${hideLanguage && 'hidden'}`}>
                            <LanguageArea />
                            <Spacer y={2} />
                        </div>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable
                                droppableId='droppable'
                                direction='vertical'
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {translateServiceInstanceList !== null &&
                                            serviceInstanceConfigMap !== null &&
                                            translateServiceInstanceList.map((serviceInstanceKey, index) => {
                                                const config = serviceInstanceConfigMap[serviceInstanceKey] ?? {};
                                                const enable = config['enable'] ?? true;

                                                return enable ? (
                                                    <Draggable
                                                        key={serviceInstanceKey}
                                                        draggableId={serviceInstanceKey}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                            >
                                                                <TargetArea
                                                                    {...provided.dragHandleProps}
                                                                    index={index}
                                                                    name={serviceInstanceKey}
                                                                    translateServiceInstanceList={
                                                                        translateServiceInstanceList
                                                                    }
                                                                    pluginList={pluginList}
                                                                    serviceInstanceConfigMap={serviceInstanceConfigMap}
                                                                />
                                                                <Spacer y={2} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ) : (
                                                    <></>
                                                );
                                            })}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            </div>
        )
    );
}
