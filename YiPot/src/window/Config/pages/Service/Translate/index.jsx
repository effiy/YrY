import React from 'react';
import * as builtinServices from '../../../../../services/translate';
import ServiceManagerPage, { SERVICE_PAGE_META } from '../_shared/ServiceManagerPage';
import { ServiceType } from '../../../../../utils/service_instance';

/**
 * 翻译服务管理（Translate Service）。
 * 所有通用逻辑见 `_shared/ServiceManagerPage.jsx`，此处仅传入
 * 翻译服务专属的 builtin 注册项与类型常量。
 */
export default function Translate({ pluginList }) {
    return (
        <ServiceManagerPage
            serviceType={ServiceType.TRANSLATE}
            pluginList={pluginList}
            builtinServices={builtinServices}
        />
    );
}
