import { Card, CardBody, CardFooter, Button, Skeleton, ButtonGroup, Tooltip } from '@nextui-org/react';
import { sendNotification } from '@tauri-apps/api/notification';
import { writeText } from '@tauri-apps/api/clipboard';
import { atom, useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { CgSpaceBetween } from 'react-icons/cg';
import { MdContentCopy, MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';

import { getServiceName, getServiceSouceType, ServiceSourceType } from '../../../utils/service_instance';
import { currentServiceInstanceKeyAtom, languageAtom, recognizeFlagAtom } from '../ControlArea';
import { invoke_plugin } from '../../../utils/invoke_plugin';
import * as builtinServices from '../../../services/recognize';
import { useConfig } from '../../../hooks';
import { base64Atom } from '../ImageArea';
import { pluginListAtom } from '..';

export const textAtom = atom();

const cleanText = (v, deleteNewline) =>
    deleteNewline ? v.replace(/\-\s+/g, '').replace(/\s+/g, ' ') : v;

async function callRecognize({ isPlugin, serviceName, base64, langCode, instanceConfig }) {
    const baseConfig = { config: instanceConfig };
    if (isPlugin) {
        const [func, utils] = await invoke_plugin('recognize', serviceName);
        return func(base64, langCode, { ...baseConfig, utils });
    }
    return builtinServices[serviceName].recognize(base64, langCode, baseConfig);
}

export default function TextArea(props) {
    const { serviceInstanceConfigMap } = props;
    const [autoCopy] = useConfig('recognize_auto_copy', false);
    const [deleteNewline] = useConfig('recognize_delete_newline', false);
    const [hideWindow] = useConfig('recognize_hide_window', false);
    const recognizeFlag = useAtomValue(recognizeFlagAtom);
    const currentServiceInstanceKey = useAtomValue(currentServiceInstanceKeyAtom);
    const language = useAtomValue(languageAtom);
    const base64 = useAtomValue(base64Atom);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useAtom(textAtom);
    const [error, setError] = useState('');
    const pluginList = useAtomValue(pluginListAtom);
    const { t } = useTranslation();
    const recognizeIdRef = useRef(null);

    useEffect(() => {
        setText('');
        setError('');
        const ready =
            base64 !== '' &&
            currentServiceInstanceKey &&
            autoCopy !== null &&
            deleteNewline !== null &&
            hideWindow !== null;
        if (!ready) return;

        const isPlugin = getServiceSouceType(currentServiceInstanceKey) === ServiceSourceType.PLUGIN;
        const serviceName = getServiceName(currentServiceInstanceKey);
        const languageMap = isPlugin
            ? pluginList[serviceName].language
            : builtinServices[serviceName].Language;
        if (!(language in languageMap)) {
            setError('Language not supported');
            return;
        }

        const id = nanoid();
        recognizeIdRef.current = id;
        const isCurrent = () => recognizeIdRef.current === id;
        const instanceConfig = serviceInstanceConfigMap[currentServiceInstanceKey] ?? {};

        setLoading(true);
        callRecognize({
            isPlugin,
            serviceName,
            base64,
            langCode: languageMap[language],
            instanceConfig,
        }).then(
            (v) => {
                if (!isCurrent()) return;
                const cleaned = cleanText(v.trim(), deleteNewline);
                setText(cleaned);
                setLoading(false);
                if (autoCopy) {
                    writeText(cleaned).then(() => {
                        if (hideWindow) {
                            sendNotification({
                                title: t('common.write_clipboard'),
                                body: cleaned,
                            });
                        }
                    });
                }
            },
            (e) => {
                if (!isCurrent()) return;
                setError(e.toString());
                setLoading(false);
            }
        );
    }, [base64, currentServiceInstanceKey, language, recognizeFlag, autoCopy, deleteNewline, hideWindow]);

    return (
        <Card
            shadow='none'
            className='bg-content1 h-full ml-[6px] mr-[12px]'
            radius='10'
        >
            <CardBody className='bg-content1 p-0 h-full'>
                {loading ? (
                    <div className='space-y-3 m-[12px]'>
                        <Skeleton className='w-3/5 rounded-lg'>
                            <div className='h-3 w-3/5 rounded-lg bg-default-200'></div>
                        </Skeleton>
                        <Skeleton className='w-4/5 rounded-lg'>
                            <div className='h-3 w-4/5 rounded-lg bg-default-200'></div>
                        </Skeleton>
                        <Skeleton className='w-2/5 rounded-lg'>
                            <div className='h-3 w-2/5 rounded-lg bg-default-300'></div>
                        </Skeleton>
                    </div>
                ) : (
                    <>
                        {text && (
                            <textarea
                                value={text}
                                className='bg-content1 h-full m-[12px] mb-0 resize-none focus:outline-none'
                                onChange={(e) => {
                                    setText(e.target.value);
                                }}
                            />
                        )}
                        {error && (
                            <textarea
                                value={error}
                                readOnly
                                className='bg-content1 h-full m-[12px] mb-0 resize-none focus:outline-none text-red-500'
                            />
                        )}
                    </>
                )}
            </CardBody>
            <CardFooter className='bg-content1 flex justify-start px-[12px]'>
                <ButtonGroup>
                    <Tooltip content={t('recognize.copy_text')}>
                        <Button
                            isIconOnly
                            size='sm'
                            variant='light'
                            onPress={() => {
                                writeText(text);
                            }}
                        >
                            <MdContentCopy className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('recognize.delete_newline')}>
                        <Button
                            isIconOnly
                            size='sm'
                            variant='light'
                            onPress={() => {
                                setText(cleanText(text, true));
                            }}
                        >
                            <MdSmartButton className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('recognize.delete_space')}>
                        <Button
                            isIconOnly
                            size='sm'
                            variant='light'
                            onPress={() => {
                                setText(text.replaceAll(' ', ''));
                            }}
                        >
                            <CgSpaceBetween className='text-[16px]' />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
}
