import React from 'react';
import * as builtinServices from '../../../../../services/tts';
import ServiceManagerPage from '../_shared/ServiceManagerPage';
import { ServiceType } from '../../../../../utils/service_instance';

/** TTS 服务管理。通用逻辑见 `_shared/ServiceManagerPage.jsx` */
export default function Tts({ pluginList }) {
    return (
        <ServiceManagerPage
            serviceType={ServiceType.TTS}
            pluginList={pluginList}
            builtinServices={builtinServices}
        />
    );
}
