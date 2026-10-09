import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Spacer, Button, Switch } from '@nextui-org/react';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { BiSolidEdit } from 'react-icons/bi';
import React from 'react';

import { useConfig } from '../../../../../hooks';
import {
    INSTANCE_NAME_CONFIG_KEY,
    ServiceSourceType,
    getDisplayInstanceName,
    getServiceName,
    getServiceSouceType,
} from '../../../../../utils/service_instance';
import { osType } from '../../../../../utils/env';

/**
 * 通用 Service Item（translate / recognize / collection / tts 共用）。
 * Recognize 的 system 服务特殊处理 icon：使用 osType 对应 logo。
 */
export default function ServiceItemView(props) {
    const {
        serviceType,
        builtinServices,
        serviceInstanceKey,
        pluginList,
        deleteServiceInstance,
        setCurrentConfigKey,
        onConfigOpen,
        ...drag
    } = props;

    const { t } = useTranslation();
    const [serviceInstanceConfig, setServiceInstanceConfig] = useConfig(serviceInstanceKey, {});
    const sourceType = getServiceSouceType(serviceInstanceKey);
    const serviceName = getServiceName(serviceInstanceKey);

    // collection / recognize 不需要「启用开关」或可按服务类型保留
    const showEnableSwitch = serviceType !== 'collection';

    // 插件已被卸载时渲染空壳（保持列表顺序，避免丢失）
    if (sourceType === ServiceSourceType.PLUGIN && !(serviceName in (pluginList ?? {}))) {
        return null;
    }
    if (serviceInstanceConfig === null) return null;

    const buildinIcon =
        serviceType === 'recognize' && serviceName === 'system'
            ? `logo/${osType}.svg`
            : builtinServices?.[serviceName]?.info?.icon;

    const instanceName = serviceInstanceConfig[INSTANCE_NAME_CONFIG_KEY];
    const builtinTitle = t(`services.${serviceType}.${serviceName}.title`);
    const pluginTitle = pluginList?.[serviceName]?.display ?? serviceName;

    return (
        <div className='bg-content2 rounded-md px-[10px] py-[20px] flex justify-between items-center'>
            <div className='flex items-center'>
                <div {...drag} className='text-2xl my-auto cursor-grab active:cursor-grabbing'>
                    <RxDragHandleHorizontal />
                </div>
                <Spacer x={2} />
                {sourceType === ServiceSourceType.BUILDIN && (
                    <>
                        <img
                            src={buildinIcon}
                            className='h-[24px] w-[24px] my-auto'
                            draggable={false}
                            alt={serviceName}
                        />
                        <Spacer x={2} />
                        <h2 className='my-auto'>
                            {getDisplayInstanceName(instanceName, () => builtinTitle)}
                        </h2>
                    </>
                )}
                {sourceType === ServiceSourceType.PLUGIN && (
                    <>
                        <img
                            src={pluginList[serviceName].icon}
                            className='h-[24px] w-[24px] my-auto'
                            draggable={false}
                            alt={serviceName}
                        />
                        <Spacer x={2} />
                        <h2 className='my-auto'>
                            {`${getDisplayInstanceName(instanceName, () => pluginTitle)} [${t(
                                'common.plugin'
                            )}]`}
                        </h2>
                    </>
                )}
            </div>
            <div className='flex items-center'>
                {showEnableSwitch && (
                    <Switch
                        size='sm'
                        isSelected={serviceInstanceConfig.enable ?? true}
                        onValueChange={(v) =>
                            setServiceInstanceConfig({ ...serviceInstanceConfig, enable: v })
                        }
                    />
                )}
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    onPress={() => {
                        setCurrentConfigKey(serviceInstanceKey);
                        onConfigOpen();
                    }}
                    aria-label='edit-service'
                >
                    <BiSolidEdit className='text-2xl' />
                </Button>
                <Spacer x={2} />
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    color='danger'
                    onPress={() => deleteServiceInstance(serviceInstanceKey)}
                    aria-label='delete-service'
                >
                    <MdDeleteOutline className='text-2xl' />
                </Button>
            </div>
        </div>
    );
}
