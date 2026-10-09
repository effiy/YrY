import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, Spacer, Button, useDisclosure } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState, useMemo } from 'react';

import { useToastStyle, useConfig, deleteKey } from '../../../../../hooks';
import SelectPluginModal from '../SelectPluginModal';
import { osType } from '../../../../../utils/env';
import { ServiceType, createServiceInstanceKey } from '../../../../../utils/service_instance';
import ServiceItemView from './ServiceItemView';
import SelectServiceModal from './SelectServiceModal';
import ServiceConfigModal from './ServiceConfigModal';

/**
 * 通用「服务管理页面」组件。
 * translate / recognize / collection / tts 4 个页面逻辑完全一致，
 * 差异只在于：服务类型、存储键、默认列表、初始选中项、内置服务模块、
 * 是否强制保留至少一个服务。
 */
export const SERVICE_PAGE_META = {
    [ServiceType.TRANSLATE]: {
        storeKey: 'translate_service_list',
        defaultList: ['deepl', 'bing', 'lingva', 'yandex', 'google', 'ecdict'],
        initialKey: 'deepl',
        requireAtLeastOne: true,
    },
    [ServiceType.RECOGNIZE]: {
        storeKey: 'recognize_service_list',
        defaultList: ['system', 'tesseract'],
        initialKey: 'system',
        requireAtLeastOne: true,
    },
    [ServiceType.COLLECTION]: {
        storeKey: 'collection_service_list',
        defaultList: [],
        initialKey: 'anki',
        requireAtLeastOne: false,
    },
    [ServiceType.TTS]: {
        storeKey: 'tts_service_list',
        defaultList: ['lingva_tts'],
        initialKey: 'lingva_tts',
        requireAtLeastOne: true,
    },
};

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

export default function ServiceManagerPage({ serviceType, pluginList, builtinServices }) {
    const meta = SERVICE_PAGE_META[serviceType];
    if (!meta) throw new Error(`Unknown service type: ${serviceType}`);

    // --- Modal 状态：一处声明，四处复用
    const selectPlugin = useDisclosure();
    const selectBuiltin = useDisclosure();
    const config = useDisclosure();

    const [currentConfigKey, setCurrentConfigKey] = useState(meta.initialKey);
    const [instanceList, setInstanceList] = useConfig(meta.storeKey, meta.defaultList);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    const services = useMemo(() => builtinServices ?? {}, [builtinServices]);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        setInstanceList(reorder(instanceList, result.source.index, result.destination.index));
    };

    const deleteServiceInstance = (instanceKey) => {
        if (meta.requireAtLeastOne && instanceList.length === 1) {
            toast.error(t('config.service.least'), { style: toastStyle });
            return;
        }
        setInstanceList(instanceList.filter((x) => x !== instanceKey));
        deleteKey(instanceKey);
    };

    const updateServiceInstanceList = (instanceKey) => {
        if (instanceList.includes(instanceKey)) return;
        setInstanceList([...instanceList, instanceKey]);
    };

    const props = {
        serviceType,
        pluginList,
        builtinServices: services,
        currentConfigKey,
        setCurrentConfigKey,
        deleteServiceInstance,
        onConfigOpen: config.onOpen,
    };

    return (
        <>
            {meta.requireAtLeastOne && <Toaster />}
            <Card
                className={`${
                    osType === 'Linux' ? 'h-[calc(100vh-140px)]' : 'h-[calc(100vh-120px)]'
                } overflow-y-auto p-5 flex flex-col justify-between`}
            >
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={`droppable-${serviceType}`} direction='vertical'>
                        {(provided) => (
                            <div
                                className='overflow-y-auto h-full flex-1'
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {(instanceList ?? []).map((instanceKey, index) => (
                                    <Draggable
                                        key={instanceKey}
                                        draggableId={instanceKey}
                                        index={index}
                                    >
                                        {(dragProvided) => (
                                            <div
                                                ref={dragProvided.innerRef}
                                                {...dragProvided.draggableProps}
                                            >
                                                <ServiceItemView
                                                    {...dragProvided.dragHandleProps}
                                                    {...props}
                                                    serviceInstanceKey={instanceKey}
                                                />
                                                <Spacer y={2} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <Spacer y={2} />
                <div className='flex'>
                    <Button fullWidth onPress={selectBuiltin.onOpen}>
                        {t('config.service.add_builtin_service')}
                    </Button>
                    <Spacer x={2} />
                    <Button fullWidth onPress={selectPlugin.onOpen}>
                        {t('config.service.add_external_service')}
                    </Button>
                </div>
            </Card>

            <SelectPluginModal
                isOpen={selectPlugin.isOpen}
                onOpenChange={selectPlugin.onOpenChange}
                setCurrentConfigKey={setCurrentConfigKey}
                onConfigOpen={config.onOpen}
                pluginType={serviceType}
                pluginList={pluginList}
                deleteService={deleteServiceInstance}
            />
            <SelectServiceModal
                isOpen={selectBuiltin.isOpen}
                onOpenChange={selectBuiltin.onOpenChange}
                setCurrentConfigKey={(k) => {
                    setCurrentConfigKey(createServiceInstanceKey(k));
                    config.onOpen();
                }}
                {...props}
            />
            <ServiceConfigModal
                serviceInstanceKey={currentConfigKey}
                isOpen={config.isOpen}
                onOpenChange={config.onOpenChange}
                pluginList={pluginList}
                builtinServices={services}
                serviceType={serviceType}
                updateServiceInstanceList={updateServiceInstanceList}
            />
        </>
    );
}
