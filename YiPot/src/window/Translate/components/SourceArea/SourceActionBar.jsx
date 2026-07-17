import { Button, ButtonGroup, CardFooter, Chip, Tooltip } from '@nextui-org/react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { MdContentCopy, MdSmartButton } from 'react-icons/md';
import { LuDelete } from 'react-icons/lu';
import { HiTranslate } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

export default function SourceActionBar({
    sourceText,
    detectLanguage,
    onSpeak,
    onCopy,
    onDeleteNewline,
    onClear,
    onTranslate,
}) {
    const { t } = useTranslation();

    return (
        <CardFooter className='bg-content1 rounded-none rounded-b-[10px] flex justify-between px-[12px] p-[5px]'>
            <div className='flex justify-start'>
                <ButtonGroup className='mr-[5px]'>
                    <Tooltip content={t('translate.speak')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
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
                            onPress={onCopy}
                        >
                            <MdContentCopy className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.delete_newline')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={onDeleteNewline}
                        >
                            <MdSmartButton className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('common.clear')}>
                        <Button
                            variant='light'
                            size='sm'
                            isIconOnly
                            isDisabled={sourceText === ''}
                            onPress={onClear}
                        >
                            <LuDelete className='text-[16px]' />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
                {detectLanguage !== '' && (
                    <Chip
                        size='sm'
                        color='secondary'
                        variant='dot'
                        className='my-auto'
                    >
                        {t(`languages.${detectLanguage}`)}
                    </Chip>
                )}
            </div>
            <Tooltip content={t('translate.translate')}>
                <Button
                    size='sm'
                    color='primary'
                    variant='light'
                    isIconOnly
                    className='text-[14px] font-bold'
                    startContent={<HiTranslate className='text-[16px]' />}
                    onPress={onTranslate}
                />
            </Tooltip>
        </CardFooter>
    );
}
