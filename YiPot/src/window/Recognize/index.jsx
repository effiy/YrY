import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import React, { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Button } from '@nextui-org/react';
import { BsPinFill } from 'react-icons/bs';
import { atom, useAtom } from 'jotai';

import WindowControl from '../../components/WindowControl';
import { store, whenStoreReady } from '../../utils/store';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import ControlArea from './ControlArea';
import ImageArea from './ImageArea';
import TextArea from './TextArea';

export const pluginListAtom = atom();

/**
 * 窗口 blur → 50ms 后关闭，并在 focus 时取消；
 * 旧实现：用模块级变量 + 顶层 listen（HMR 后会多次订阅，且 timer 共享）；
 * 新实现：单个 hook 统一管理 unlisten/timer cleanup，在组件 unmount 时释放。
 */
function useBlurAutoClose(enable) {
    const blurTimerRef = useRef(null);
    const unlistenBlurRef = useRef(null);
    const unlistenFocusRef = useRef(null);

    useEffect(() => {
        // 先清掉旧订阅
        const cleanup = () => {
            if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
            }
            const old = [unlistenBlurRef.current, unlistenFocusRef.current];
            unlistenBlurRef.current = null;
            unlistenFocusRef.current = null;
            old.forEach((u) => u?.then?.((f) => f?.()).catch(() => {}));
        };
        cleanup();

        if (!enable) return cleanup;

        unlistenBlurRef.current = listen('tauri://blur', () => {
            if (appWindow.label !== 'recognize') return;
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            blurTimerRef.current = setTimeout(() => {
                blurTimerRef.current = null;
                appWindow.close().catch(() => {});
            }, 50);
        });

        unlistenFocusRef.current = listen('tauri://focus', () => {
            if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
            }
        });

        return cleanup;
    }, [enable]);
}

// 插件列表加载（单函数抽出去，便于复用）
const loadPluginListFor = async (serviceType) => {
    const result = {};
    if (!(await exists(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig }))) return result;
    const baseDirPath = await appConfigDir();
    const pluginDirs = await readDir(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig });
    for (const dirent of pluginDirs) {
        if (!dirent?.name) continue;
        try {
            const infoStr = await readTextFile(`plugins/${serviceType}/${dirent.name}/info.json`, {
                dir: BaseDirectory.AppConfig,
            });
            const info = JSON.parse(infoStr);
            if (info?.icon) {
                const iconPath = await join(baseDirPath, `plugins/${serviceType}/${dirent.name}/${info.icon}`);
                info.icon = convertFileSrc(iconPath);
            }
            result[dirent.name] = info;
        } catch {
            // 单个插件损坏不影响全局
        }
    }
    return result;
};

export default function Recognize() {
    const [pluginList, setPluginList] = useAtom(pluginListAtom);
    const [closeOnBlur] = useConfig('recognize_close_on_blur', false);
    const [pined, setPined] = useState(false);
    const [serviceInstanceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = useState(null);

    useBlurAutoClose(Boolean(closeOnBlur && !pined));

    const loadServiceInstanceConfigMap = async () => {
        await whenStoreReady();
        const config = {};
        for (const key of serviceInstanceList ?? []) {
            config[key] = (await store.get(key)) ?? {};
        }
        setServiceInstanceConfigMap({ ...config });
    };

    useEffect(() => {
        if (serviceInstanceList !== null) loadServiceInstanceConfigMap();
    }, [serviceInstanceList]);

    useEffect(() => {
        let cancelled = false;
        loadPluginListFor('recognize').then((list) => {
            if (!cancelled) setPluginList({ ...list });
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const togglePin = () => {
        setPined((old) => {
            const next = !old;
            // pinned = true → 常驻最前并禁用 blur 自动关闭
            appWindow.setAlwaysOnTop(next).catch(() => {});
            return next;
        });
    };

    return (
        pluginList &&
        serviceInstanceConfigMap !== null && (
            <div
                className={`bg-background h-screen ${
                    osType === 'Linux' ? 'rounded-[10px] border-1 border-default-100' : ''
                }`}
            >
                <div
                    data-tauri-drag-region='true'
                    className='fixed top-[5px] left-[5px] right-[5px] h-[30px]'
                />
                <div className={`h-[35px] flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className='my-auto mx-[5px] bg-transparent'
                        onPress={togglePin}
                    >
                        <BsPinFill
                            className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`}
                        />
                    </Button>
                    {osType !== 'Darwin' && <WindowControl />}
                </div>
                <div
                    className={`${
                        osType === 'Linux' ? 'h-[calc(100vh-87px)]' : 'h-[calc(100vh-85px)]'
                    } grid grid-cols-2`}
                >
                    <ImageArea />
                    <TextArea serviceInstanceConfigMap={serviceInstanceConfigMap} />
                </div>
                <div className='h-[50px]'>
                    <ControlArea
                        serviceInstanceList={serviceInstanceList}
                        serviceInstanceConfigMap={serviceInstanceConfigMap}
                    />
                </div>
            </div>
        )
    );
}
