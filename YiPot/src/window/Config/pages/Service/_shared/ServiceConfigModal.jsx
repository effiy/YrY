import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { osType } from '../../../../../utils/env';
import {
    ServiceSourceType,
    getServiceSouceType,
    getServiceName,
    whetherPluginService,
} from '../../../../../utils/service_instance';
import { PluginConfig } from '../PluginConfig';

/**
 * 通用「服务配置」弹窗（translate / recognize / collection / tts 共用）。
 */
export default function ServiceConfigModal(props) {
    const {
        serviceInstanceKey,
        pluginList,
        builtinServices = {},
        serviceType,
        isOpen,
        onOpenChange,
        updateServiceInstanceList,
    } = props;

    const { t } = useTranslation();
    const pluginFlag = whetherPluginService(serviceInstanceKey);
    const sourceType = getServiceSouceType(serviceInstanceKey);
    const serviceName = getServiceName(serviceInstanceKey);

    if (pluginFlag && !(serviceName in (pluginList ?? {}))) return null;

    const ConfigComponent = pluginFlag ? PluginConfig : builtinServices[serviceName]?.Config;
    if (!ConfigComponent) return null;

    const builtinIcon =
        serviceType === 'recognize' && serviceName === 'system'
            ? `logo/${osType}.svg`
            : builtinServices[serviceName]?.info?.icon;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior='inside'>
            <ModalContent className='max-h-[75vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {sourceType === ServiceSourceType.BUILDIN && (
                                <div className='flex items-center'>
                                    <img
                                        src={builtinIcon}
                                        className='h-[24px] w-[24px] my-auto'
                                        draggable={false}
                                        alt={serviceName}
                                    />
                                    <Spacer x={2} />
                                    {t(`services.${serviceType}.${serviceName}.title`)}
                                </div>
                            )}
                            {pluginFlag && (
                                <div className='flex items-center'>
                                    <img
                                        src={pluginList[serviceName].icon}
                                        className='h-[24px] w-[24px] my-auto'
                                        draggable={false}
                                        alt={serviceName}
                                    />
                                    <Spacer x={2} />
                                    {`${pluginList[serviceName].display} [${t('common.plugin')}]`}
                                </div>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            <ConfigComponent
                                name={serviceName}
                                instanceKey={serviceInstanceKey}
                                pluginType={serviceType}
                                pluginList={pluginList}
                                updateServiceList={updateServiceInstanceList}
                                onClose={onClose}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' variant='light' onPress={onClose}>
                                {t('common.cancel')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
