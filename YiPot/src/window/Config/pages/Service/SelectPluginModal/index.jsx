import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { removeDir, BaseDirectory } from '@tauri-apps/api/fs';
import { open as openInBrowser } from '@tauri-apps/api/shell';
import toast, { Toaster } from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import React, { useCallback, useState } from 'react';
import { emit } from '@tauri-apps/api/event';

import { createServiceInstanceKey } from '../../../../../utils/service_instance';
import { useToastStyle } from '../../../../../hooks';

/**
 * 「选择/安装/卸载外部插件」模态。
 * 被 ServiceManagerPage 共用；旧版每类服务都 import 一份相同实现，此处保留单份。
 */
export default function SelectPluginModal(props) {
    const {
        isOpen,
        onOpenChange,
        setCurrentConfigKey,
        onConfigOpen,
        pluginType,
        pluginList = {},
        deleteService,
    } = props;

    const [installing, setInstalling] = useState(false);
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    const uninstall = useCallback(
        async (pluginId) => {
            try {
                await removeDir(`plugins/${pluginType}/${pluginId}`, {
                    dir: BaseDirectory.AppConfig,
                    recursive: true,
                });
                toast.success(t('config.service.uninstall_success'), { style: toastStyle });
                deleteService?.(pluginId);
                emit('reload_plugin_list');
            } catch (e) {
                toast.error(e.toString(), { style: toastStyle });
            }
        },
        [pluginType, deleteService, toastStyle, t]
    );

    const installFromFiles = useCallback(async () => {
        setInstalling(true);
        try {
            const selected = await open({
                multiple: true,
                directory: false,
                filters: [{ name: '*.potext', extensions: ['potext'] }],
            });
            if (selected === null || selected.length === 0) return;
            const count = await invoke('install_plugin', { pathList: selected });
            toast.success(`Installed ${count} plugins`, { style: toastStyle });
            emit('reload_plugin_list');
        } catch (e) {
            toast.error(e.toString(), { style: toastStyle });
        } finally {
            setInstalling(false);
        }
    }, [toastStyle, t]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior='inside'>
            <Toaster />
            <ModalContent className='max-h-[80vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>{t('config.service.add_service')}</ModalHeader>
                        <ModalBody>
                            {Object.keys(pluginList).length === 0 && (
                                <Button
                                    fullWidth
                                    variant='flat'
                                    onPress={() => openInBrowser('https://yipot.com/plugin.html')}
                                >
                                    <div className='w-full'>{t('config.service.view_plugin_list')}</div>
                                </Button>
                            )}

                            {Object.entries(pluginList).map(([id, info]) => (
                                <div key={id} className='flex justify-between mb-2'>
                                    <Button
                                        fullWidth
                                        className='mr-[8px]'
                                        onPress={() => {
                                            setCurrentConfigKey(createServiceInstanceKey(id));
                                            onClose();
                                            onConfigOpen();
                                        }}
                                        startContent={
                                            <img
                                                src={info.icon}
                                                className='h-[24px] w-[24px] my-auto'
                                                alt={id}
                                            />
                                        }
                                    >
                                        <div className='w-full text-left'>{info.display}</div>
                                    </Button>
                                    <Button
                                        isIconOnly
                                        color='danger'
                                        variant='flat'
                                        onPress={() => uninstall(id)}
                                        aria-label='uninstall-plugin'
                                    >
                                        <MdDeleteOutline className='text-xl' />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                fullWidth
                                isLoading={installing}
                                color='secondary'
                                variant='flat'
                                onPress={installFromFiles}
                            >
                                <div className='w-full'>{t('config.service.install_plugin')}</div>
                            </Button>
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
