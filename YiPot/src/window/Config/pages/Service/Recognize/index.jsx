import React from 'react';
import * as builtinServices from '../../../../../services/recognize';
import ServiceManagerPage from '../_shared/ServiceManagerPage';
import { ServiceType } from '../../../../../utils/service_instance';

/** 识别/OCR 服务管理（Recognize Service）。通用逻辑见 `_shared/ServiceManagerPage.jsx` */
export default function Recognize({ pluginList }) {
    return (
        <ServiceManagerPage
            serviceType={ServiceType.RECOGNIZE}
            pluginList={pluginList}
            builtinServices={builtinServices}
        />
    );
}
