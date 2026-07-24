import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';
import { LanguageFlag } from '../../../../utils/language';

const languageName = {
    zh_cn: 'Simplified Chinese',
    zh_tw: 'Traditional Chinese',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    fr: 'Français',
    es: 'Español',
    ru: 'Русский',
    de: 'Deutsch',
    it: 'Italiano',
    tr: 'Türkçe',
    pt_pt: 'Português',
    pt_br: 'Português (Brasil)',
    nb_no: 'Norsk Bokmål',
    nn_no: 'Norsk Nynorsk',
    fa: 'فارسی',
    uk: 'Українська',
    ar: 'العربية',
    he: 'עִבְרִית',
};

const languageKeys = Object.keys(languageName);

export default function LanguageDropdown({ value, onChange }) {
    if (value === null) return null;
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button
                    variant='bordered'
                    startContent={<span className={`fi fi-${LanguageFlag[value]}`} />}
                >
                    {languageName[value]}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label='app language'
                className='max-h-[40vh] overflow-y-auto'
                onAction={onChange}
            >
                {languageKeys.map((key) => (
                    <DropdownItem
                        key={key}
                        startContent={<span className={`fi fi-${LanguageFlag[key]}`} />}
                    >
                        {languageName[key]}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
