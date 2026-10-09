import { Card, CardBody, CardFooter, Button, Skeleton, ButtonGroup, Tooltip } from '@nextui-org/react';
import { sendNotification } from '@tauri-apps/api/notification';
import { writeText } from '@tauri-apps/api/clipboard';
import { atom, useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState, useCallback } from 'react';
import { CgSpaceBetween } from 'react-icons/cg';
import { MdContentCopy } from 'react-icons/md';
import { MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { error as logError } from 'tauri-plugin-log-api';

import * as builtinServices from '../../../services/recognize';
import { useConfig } from '../../../hooks';
import { runService } from '../../../utils';
import { base64Atom } from '../ImageArea';
import { pluginListAtom } from '..';
import { currentServiceInstanceKeyAtom, languageAtom, recognizeFlagAtom } from '../ControlArea';

export const textAtom = atom();

const postprocess = (raw, deleteNewline) => {
    let s = typeof raw === 'string' ? raw : String(raw ?? '');
    s = s.trim();
    if (deleteNewline) s = s.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
    return s;
};

export default function TextArea(props) {
    const { serviceInstanceConfigMap } = props;

    const [autoCopy] = useConfig('recognize_auto_copy', false);
    const [deleteNewline] = useConfig('recognize_delete_newline', false);
    const [hideWindow] = useConfig('recognize_hide_window', false);

    const recognizeFlag = useAtomValue(recognizeFlagAtom);
    const currentServiceInstanceKey = useAtomValue(currentServiceInstanceKeyAtom);
    const language = useAtomValue(languageAtom);
    const base64 = useAtomValue(base64Atom);
    const pluginList = useAtomValue(pluginListAtom);

    const [loading, setLoading] = useState(false);
    const [text, setText] = useAtom(textAtom);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const performRecognize = useCallback(async () => {
        if (!base64 || !currentServiceInstanceKey) return;
        if (autoCopy === null || deleteNewline === null || hideWindow === null) return;

        setText('');
        setError('');
        setLoading(true);

        const outcome = await runService({
            scope: 'recognize-textarea',
            index: 0,
            serviceType: 'recognize',
            instanceKey: currentServiceInstanceKey,
            methodName: 'recognize',
            builtinServices,
            // runService 需要 pluginList 按 serviceType 索引（与 TargetArea 中 pluginList 形状一致）
            pluginList: { recognize: pluginList ?? {} },
            args: [base64, language],
            options: { config: serviceInstanceConfigMap?.[currentServiceInstanceKey] ?? {} },
            skipLanguageCheck: false,
            secondLanguage: 'auto',
            detectLanguage: 'auto',
            sourceLanguage: language,
            // recognize 的语言表只映射「源语言」；runService 会做 source/target 双检查，这里给相同值即可
            targetLanguage: language,
        });

        if (!outcome.stillValid) return;
        if (!outcome.ok) {
            setLoading(false);
            if (outcome.cancelled) return;
            const msg = outcome.error?.message ?? String(outcome.error ?? 'Language not supported');
            setError(msg);
            logError(`[recognize] ${currentServiceInstanceKey}: ${msg}`);
            return;
        }

        const final = postprocess(outcome.value, deleteNewline);
        setText(final);
        setLoading(false);

        if (autoCopy && final) {
            writeText(final).then(() => {
                if (hideWindow) sendNotification({ title: t('common.write_clipboard'), body: final });
            });
        }
    }, [
        base64,
        currentServiceInstanceKey,
        language,
        pluginList,
        serviceInstanceConfigMap,
        autoCopy,
        deleteNewline,
        hideWindow,
        t,
        setText,
    ]);

    useEffect(() => {
        performRecognize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base64, currentServiceInstanceKey, language, recognizeFlag, autoCopy, deleteNewline, hideWindow]);

    return (
        <Card shadow='none' className='bg-content1 h-full ml-[6px] mr-[12px]' radius='10'>
            <CardBody className='bg-content1 p-0 h-full'>
                {loading ? (
                    <div className='space-y-3 m-[12px]'>
                        <Skeleton className='w-3/5 rounded-lg'>
                            <div className='h-3 w-3/5 rounded-lg bg-default-200' />
                        </Skeleton>
                        <Skeleton className='w-4/5 rounded-lg'>
                            <div className='h-3 w-4/5 rounded-lg bg-default-200' />
                        </Skeleton>
                        <Skeleton className='w-2/5 rounded-lg'>
                            <div className='h-3 w-2/5 rounded-lg bg-default-300' />
                        </Skeleton>
                    </div>
                ) : (
                    <>
                        {text && (
                            <textarea
                                value={text}
                                className='bg-content1 h-full m-[12px] mb-0 resize-none focus:outline-none'
                                onChange={(e) => setText(e.target.value)}
                            />
                        )}
                        {error && (
                            <textarea
                                value={error}
                                readOnly
                                className='bg-content1 h-full m-[12px] mb-0 resize-none focus:outline-none text-red-500'
                                onChange={(e) => setText(e.target.value)}
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
                            isDisabled={!text}
                            onPress={() => text && writeText(text)}
                        >
                            <MdContentCopy className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('recognize.delete_newline')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            isDisabled={!text}
                            onPress={() => setText(text.replace(/\-\s+/g, '').replace(/\s+/g, ' '))}
                        >
                            <MdSmartButton className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('recognize.delete_space')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            isDisabled={!text}
                            onPress={() => setText(text.replaceAll(' ', ''))}
                        >
                            <CgSpaceBetween className='text-[16px]' />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
}
