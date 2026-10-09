import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import { atom, useAtom, useSetAtom, useAtomValue } from 'jotai';
import { fetch, Body } from '@tauri-apps/api/http';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import { GiCycle } from 'react-icons/gi';
import React, { useEffect, useMemo } from 'react';
import { nanoid } from 'nanoid';

import * as builtinService from '../../../services/recognize';
import { languageList } from '../../../utils/language';
import { useConfig } from '../../../hooks';
import { textAtom } from '../TextArea';
import { pluginListAtom } from '..';
import { osType } from '../../../utils/env';
import {
    ServiceSourceType,
    getServiceSouceType,
    getServiceName,
    INSTANCE_NAME_CONFIG_KEY,
    getDisplayInstanceName,
} from '../../../utils/service_instance';

export const currentServiceInstanceKeyAtom = atom();
export const languageAtom = atom();
export const recognizeFlagAtom = atom();

/** 给定实例 key，统一计算 icon / display title。2 份重复三元 → 1 处工厂。 */
const buildInstanceMeta = ({
    instanceKey,
    builtinServices,
    pluginList,
    serviceInstanceConfigMap,
    i18nT,
    serviceType = 'recognize',
}) => {
    const isPlugin = getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN;
    const serviceName = getServiceName(instanceKey);
    let icon = isPlugin
        ? pluginList?.[serviceName]?.icon
        : builtinServices?.[serviceName]?.info?.icon;
    // recognize 的内置 system 服务 icon = "system"（占位），替换为 OS logo
    if (!isPlugin && icon === 'system') icon = `logo/${osType}.svg`;

    const instanceCfg = serviceInstanceConfigMap?.[instanceKey] ?? {};
    const titleFromPlugin = () => pluginList?.[serviceName]?.display;
    const titleFromBuiltin = () => i18nT?.(`services.${serviceType}.${serviceName}.title`) ?? serviceName;
    const title = getDisplayInstanceName(
        instanceCfg[INSTANCE_NAME_CONFIG_KEY],
        isPlugin ? titleFromPlugin : titleFromBuiltin
    );
    return { isPlugin, serviceName, icon, title };
};

export default function ControlArea(props) {
    const { serviceInstanceConfigMap, serviceInstanceList } = props;
    const pluginList = useAtomValue(pluginListAtom);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [serverPort] = useConfig('server_port', 60828);
    const setRecognizeFlag = useSetAtom(recognizeFlagAtom);
    const [currentServiceInstanceKey, setCurrentServiceInstanceKey] = useAtom(currentServiceInstanceKeyAtom);
    const [language, setLanguage] = useAtom(languageAtom);
    const text = useAtomValue(textAtom);
    const { t } = useTranslation();

    useEffect(() => {
        if (serviceInstanceList) setCurrentServiceInstanceKey(serviceInstanceList[0]);
        if (recognizeLanguage) setLanguage(recognizeLanguage);
    }, [serviceInstanceList, recognizeLanguage, setCurrentServiceInstanceKey, setLanguage]);

    const currentMeta = useMemo(
        () =>
            currentServiceInstanceKey
                ? buildInstanceMeta({
                      instanceKey: currentServiceInstanceKey,
                      builtinServices: builtinService,
                      pluginList,
                      serviceInstanceConfigMap,
                      i18nT: t,
                  })
                : null,
        [currentServiceInstanceKey, pluginList, serviceInstanceConfigMap, t]
    );

    const listItems = useMemo(() => {
        return (serviceInstanceList ?? []).map((instanceKey) => {
            const meta = buildInstanceMeta({
                instanceKey,
                builtinServices: builtinService,
                pluginList,
                serviceInstanceConfigMap,
                i18nT: t,
            });
            return (
                <DropdownItem
                    key={instanceKey}
                    startContent={
                        <img className='h-[16px] w-[16px] my-auto' src={meta.icon} alt={meta.serviceName} />
                    }
                >
                    {meta.title}
                </DropdownItem>
            );
        });
    }, [serviceInstanceList, pluginList, serviceInstanceConfigMap, t]);

    return (
        <div className='flex justify-between px-[12px] h-full'>
            {currentMeta && (
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            className='my-auto'
                            variant='bordered'
                            size='sm'
                            startContent={
                                <img className='h-[16px] w-[16px] my-auto' src={currentMeta.icon} alt='' />
                            }
                        >
                            {currentMeta.title}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='service name'
                        className='max-h-[70vh] overflow-y-auto'
                        onAction={(key) => setCurrentServiceInstanceKey(String(key))}
                    >
                        {listItems}
                    </DropdownMenu>
                </Dropdown>
            )}
            {language && (
                <Dropdown>
                    <DropdownTrigger>
                        <Button className='my-auto' variant='bordered' size='sm'>
                            {t(`languages.${language}`)}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='language'
                        className='max-h-[70vh] overflow-y-auto'
                        onAction={(key) => setLanguage(key)}
                    >
                        <DropdownItem key='auto'>{t('languages.auto')}</DropdownItem>
                        {languageList.map((name) => (
                            <DropdownItem key={name}>{t(`languages.${name}`)}</DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            )}
            <Button
                variant='flat'
                color='secondary'
                size='sm'
                className='my-auto'
                startContent={<GiCycle className='text-[16px]' />}
                onPress={() => setRecognizeFlag(nanoid())}
            >
                {t('recognize.recognize')}
            </Button>
            <Button
                variant='flat'
                color='primary'
                size='sm'
                className='my-auto'
                startContent={<HiTranslate className='text-[16px]' />}
                onPress={async () => {
                    if (!text) return;
                    await fetch(`http://127.0.0.1:${serverPort}/translate`, {
                        method: 'POST',
                        body: Body.text(text),
                        responseType: 2,
                    }).catch(() => {});
                }}
            >
                {t('recognize.translate')}
            </Button>
        </div>
    );
}
