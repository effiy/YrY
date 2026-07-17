import {m} from 'malevic';

import type {ExtWrapper} from '../../../../definitions';
import {getLocalMessage} from '../../../../utils/locales';
import {isChromium} from '../../../../utils/platform';
import {isLocalFile} from '../../../../utils/url';
import {Toggle} from '../../../controls';
import {SettingsIcon} from '../../../icons';
import SiteToggle from '../site-toggle';

import MoreNewHighlight from './more-new-highlight';
import MoreSiteSettings from './more-site-settings';


declare const __CHROMIUM_MV3__: boolean;

type HeaderProps = ExtWrapper & {
    onMoreSiteSettingsClick: () => void;
};

export function toggleExtension(props: ExtWrapper, enabled: boolean) {
    const {actions} = props;
    actions.changeSettings({enabled});
}

export function getSiteToggleMessage(props: ExtWrapper) {
    const {data} = props;
    const tab = data.activeTab;
    const isFile = isChromium && isLocalFile(tab.url);

    const isProtected = !isFile && ((!__CHROMIUM_MV3__ && !tab.isInjected) || tab.isProtected);

    return isProtected ?
        getLocalMessage('page_protected')
        : isFile && !data.isAllowedFileSchemeAccess ?
            getLocalMessage('local_files_forbidden')
            : tab.isInDarkList ?
                getLocalMessage('page_in_dark_list')
                : tab.isDarkThemeDetected ?
                    getLocalMessage('dark_theme_detected')
                    : getLocalMessage('configure_site_toggle');
}

function Header(props: HeaderProps) {
    const {data, actions, onMoreSiteSettingsClick} = props;

    function toggleApp(enabled: boolean) {
        toggleExtension(props, enabled);
    }

    const tab = data.activeTab;
    const isFile = isChromium && isLocalFile(tab.url);

    const isProtected = !isFile && ((!__CHROMIUM_MV3__ && !tab.isInjected) || tab.isProtected);
    const isProtectedFile = isFile && !data.isAllowedFileSchemeAccess;
    const isSiteEnabled = !(isProtected || isProtectedFile || tab.isInDarkList);

    const siteToggleMessage = getSiteToggleMessage(props);

    return (
        <header class="header">
            <span class="header__logo">
                Dark Reader
            </span>
            <div class="header__control header__site-toggle">
                <SiteToggle
                    data={data}
                    actions={actions}
                />
                <span
                    class={{
                        'header__more-settings-button': true,
                        'header__more-settings-button--off': !isSiteEnabled,
                    }}
                    onclick={onMoreSiteSettingsClick}
                >
                    <SettingsIcon class="header__more-settings-button__icon" />
                    {siteToggleMessage}
                </span>
            </div>
            <div class="header__control header__app-toggle">
                <Toggle checked={data.isEnabled} labelOn={getLocalMessage('on')} labelOff={getLocalMessage('off')} onChange={toggleApp} />
            </div>
        </header>
    );
}

export {
    Header,
    MoreNewHighlight,
    MoreSiteSettings,
};
