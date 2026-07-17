import { Button, ButtonGroup, Tooltip } from '@nextui-org/react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { MdContentCopy } from 'react-icons/md';
import { TbTransformFilled } from 'react-icons/tb';
import { GiCycle } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import {
    ServiceSourceType,
    getServiceName,
    getServiceSouceType,
} from '../../../../utils/service_instance';
import * as builtinCollectionServices from '../../../../services/collection';

export default function ActionBar({
    result,
    error,
    collectionServiceList,
    pluginList,
    onSpeak,
    onCopy,
    onTranslateBack,
    onRetry,
    onCollect,
}) {
    const { t } = useTranslation();
    const disabled = typeof result !== 'string' || result === '';

    return (
        <ButtonGroup>
            <Tooltip content={t('translate.speak')}>
                <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    isDisabled={disabled}
                    onPress={onSpeak}
                >
                    <HiOutlineVolumeUp className='text-[16px]' />
                </Button>
            </Tooltip>
            <Tooltip content={t('translate.copy')}>
                <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    isDisabled={disabled}
                    onPress={onCopy}
                >
                    <MdContentCopy className='text-[16px]' />
                </Button>
            </Tooltip>
            <Tooltip content={t('translate.translate_back')}>
                <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    isDisabled={disabled}
                    onPress={onTranslateBack}
                >
                    <TbTransformFilled className='text-[16px]' />
                </Button>
            </Tooltip>
            <Tooltip content={t('translate.retry')}>
                <Button
                    isIconOnly
                    variant='light'
                    size='sm'
                    className={`${error === '' && 'hidden'}`}
                    onPress={onRetry}
                >
                    <GiCycle className='text-[16px]' />
                </Button>
            </Tooltip>
            {collectionServiceList &&
                collectionServiceList.map((instanceName) => {
                    const isPlugin = getServiceSouceType(instanceName) === ServiceSourceType.PLUGIN;
                    const serviceName = getServiceName(instanceName);
                    return (
                        <Button
                            key={instanceName}
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                onCollect(instanceName);
                            }}
                        >
                            <img
                                src={
                                    isPlugin
                                        ? pluginList['collection'][serviceName].icon
                                        : builtinCollectionServices[serviceName].info.icon
                                }
                                className='h-[16px] w-[16px]'
                            />
                        </Button>
                    );
                })}
        </ButtonGroup>
    );
}
