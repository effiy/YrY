import React from 'react';
import * as builtinServices from '../../../../../services/collection';
import ServiceManagerPage from '../_shared/ServiceManagerPage';
import { ServiceType } from '../../../../../utils/service_instance';

/** 收藏服务管理（Collection / Wordbook Service）。通用逻辑见 `_shared/ServiceManagerPage.jsx` */
export default function Collection({ pluginList }) {
    return (
        <ServiceManagerPage
            serviceType={ServiceType.COLLECTION}
            pluginList={pluginList}
            builtinServices={builtinServices}
        />
    );
}
