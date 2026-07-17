import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import {
    INSTANCE_NAME_CONFIG_KEY,
    getDisplayInstanceName,
    getServiceName,
    whetherPluginService,
} from '../../../../utils/service_instance';
import * as builtinServices from '../../../../services/translate';

function getInstanceName(instanceKey, serviceNameSupplier, serviceInstanceConfigMap) {
    const instanceConfig = serviceInstanceConfigMap[instanceKey] ?? {};
    return getDisplayInstanceName(instanceConfig[INSTANCE_NAME_CONFIG_KEY], serviceNameSupplier);
}

function buildServiceMeta(instanceKey, pluginList, serviceInstanceConfigMap, t) {
    const isPlugin = whetherPluginService(instanceKey);
    const serviceName = getServiceName(instanceKey);
    const icon = isPlugin
        ? pluginList['translate'][serviceName].icon
        : builtinServices[serviceName].info.icon;
    const displayName = getInstanceName(
        instanceKey,
        isPlugin
            ? () => pluginList['translate'][serviceName].display
            : () => t(`services.translate.${serviceName}.title`),
        serviceInstanceConfigMap
    );
    return { isPlugin, serviceName, icon, displayName };
}

export default function ServiceDropdown({
    currentKey,
    instanceList,
    pluginList,
    serviceInstanceConfigMap,
    onSelect,
}) {
    const { t } = useTranslation();
    const currentMeta = buildServiceMeta(currentKey, pluginList, serviceInstanceConfigMap, t);

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    size='sm'
                    variant='solid'
                    className='bg-transparent'
                    startContent={<img src={currentMeta.icon} className='h-[20px] my-auto' />}
                >
                    <span className='my-auto'>{currentMeta.displayName}</span>
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label='app language'
                className='max-h-[40vh] overflow-y-auto'
                onAction={(key) => {
                    onSelect(key);
                }}
            >
                {instanceList.map((instanceKey) => {
                    const meta = buildServiceMeta(instanceKey, pluginList, serviceInstanceConfigMap, t);
                    return (
                        <DropdownItem
                            key={instanceKey}
                            startContent={<img src={meta.icon} className='h-[20px] my-auto' />}
                        >
                            <span className='my-auto'>{meta.displayName}</span>
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}
