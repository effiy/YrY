import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { osType } from '../../../../../utils/env';
import {
    ServiceSourceType,
    getServiceSouceType,
    getServiceName,
    whetherPluginService,
} from '../../../../../utils/service_instance';

/**
 * 通用「选择内置服务」弹窗（translate / recognize / collection / tts 共用）。
 */
export default function SelectServiceModal(props) {
    const {
        isOpen,
        onOpenChange,
        setCurrentConfigKey,
        serviceType,
        builtinServices = {},
    } = props;
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior='inside'>
            <ModalContent className='max-h-[80vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>{t('config.service.add_service')}</ModalHeader>
                        <ModalBody>
                            {Object.keys(builtinServices).map((serviceKey) => {
                                const isSystemOcr = serviceType === 'recognize' && serviceKey === 'system';
                                const icon = isSystemOcr
                                    ? `logo/${osType}.svg`
                                    : builtinServices[serviceKey]?.info?.icon;
                                const nameKey = builtinServices[serviceKey]?.info?.name ?? serviceKey;
                                return (
                                    <div key={serviceKey} className='mb-2'>
                                        <Button
                                            fullWidth
                                            onPress={() => {
                                                setCurrentConfigKey?.(serviceKey);
                                                onClose();
                                            }}
                                            startContent={
                                                icon ? (
                                                    <img
                                                        src={icon}
                                                        className='h-[24px] w-[24px]'
                                                        alt={serviceKey}
                                                    />
                                                ) : undefined
                                            }
                                        >
                                            <div className='w-full text-left'>
                                                {t(`services.${serviceType}.${nameKey}.title`)}
                                            </div>
                                        </Button>
                                    </div>
                                );
                            })}
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
