import { useEffect, useState } from 'react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { getServiceName, getServiceSouceType, ServiceSourceType } from '../utils/service_instance';

export const useTtsPluginInfo = (ttsServiceList) => {
    const [ttsPluginInfo, setTtsPluginInfo] = useState();
    useEffect(() => {
        const instanceKey = ttsServiceList?.[0];
        if (instanceKey && getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN) {
            readTextFile(`plugins/tts/${getServiceName(instanceKey)}/info.json`, {
                dir: BaseDirectory.AppConfig,
            }).then((infoStr) => {
                setTtsPluginInfo(JSON.parse(infoStr));
            });
        }
    }, [ttsServiceList]);
    return ttsPluginInfo;
};
