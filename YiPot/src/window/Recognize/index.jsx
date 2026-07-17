import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Button } from '@nextui-org/react';
import { BsPinFill } from 'react-icons/bs';
import { atom, useAtom } from 'jotai';

import WindowControl from '../../components/WindowControl';
import { store } from '../../utils/store';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import ControlArea from './ControlArea';
import ImageArea from './ImageArea';
import TextArea from './TextArea';

export const pluginListAtom = atom();

let blurTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'recognize') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            // Close the window after 50ms, because on Windows dragging the window first triggers blur then immediately focus
            // Closing immediately would prevent the window from being draggable
            blurTimeout = setTimeout(async () => {
                await appWindow.close();
            }, 50);
        }
    });
};

let unlisten = listenBlur();
// Cancel the blur listener
const unlistenBlur = () => {
    unlisten.then((f) => {
        f();
    });
};

// Listen for the focus event to cancel closing within the blurTimeout window
void listen('tauri://focus', () => {
    if (blurTimeout) {
        clearTimeout(blurTimeout);
    }
});

export default function Recognize() {
    const [pluginList, setPluginList] = useAtom(pluginListAtom);
    const [closeOnBlur] = useConfig('recognize_close_on_blur', false);
    const [pined, setPined] = useState(false);
    const [serviceInstanceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = useState(null);

    const loadPluginList = async () => {
        let temp = {};
        if (await exists(`plugins/recognize`, { dir: BaseDirectory.AppConfig })) {
            const plugins = await readDir(`plugins/recognize`, { dir: BaseDirectory.AppConfig });
            for (const plugin of plugins) {
                const infoStr = await readTextFile(`plugins/recognize/${plugin.name}/info.json`, {
                    dir: BaseDirectory.AppConfig,
                });
                let pluginInfo = JSON.parse(infoStr);
                if ('icon' in pluginInfo) {
                    const appConfigDirPath = await appConfigDir();
                    const iconPath = await join(
                        appConfigDirPath,
                        `/plugins/recognize/${plugin.name}/${pluginInfo.icon}`
                    );
                    pluginInfo.icon = convertFileSrc(iconPath);
                }
                temp[plugin.name] = pluginInfo;
            }
        }
        setPluginList({ ...temp });
    };
    const loadServiceInstanceConfigMap = async () => {
        const config = {};
        for (const serviceInstanceKey of serviceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        setServiceInstanceConfigMap({ ...config });
    };
    useEffect(() => {
        if (serviceInstanceList !== null) {
            loadServiceInstanceConfigMap();
        }
    }, [serviceInstanceList]);

    useEffect(() => {
        loadPluginList();
    }, []);
    // Whether to auto-close the window
    useEffect(() => {
        if (closeOnBlur !== null && !closeOnBlur) {
            unlistenBlur();
        }
    }, [closeOnBlur]);

    return (
        pluginList &&
        serviceInstanceConfigMap !== null && (
            <div
                className={`bg-background h-screen ${
                    osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
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
                        onPress={() => {
                            if (pined) {
                                if (closeOnBlur) {
                                    unlisten = listenBlur();
                                }
                                appWindow.setAlwaysOnTop(false);
                            } else {
                                unlistenBlur();
                                appWindow.setAlwaysOnTop(true);
                            }
                            setPined(!pined);
                        }}
                    >
                        <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
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
