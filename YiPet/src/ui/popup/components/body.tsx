import {m} from 'malevic';
import {getContext} from 'malevic/dom';
import {withForms} from 'malevic/forms';
import {withState, useState} from 'malevic/state';

import type {ExtensionData, ExtensionActions} from '../../../definitions';
import {getHelpURL} from '../../../utils/links';
import {getLocalMessage} from '../../../utils/locales';
import {isMobile} from '../../../utils/platform';
import {TabPanel} from '../../controls';
import {compose} from '../../utils';
import NewBody from '../body';

import FilterSettings from './filter-settings';
import {Header, MoreSiteSettings} from './header';
import Loader from './loader';
import MoreSettings from './more-settings';
import SiteListSettings from './site-list-settings';


import {PlusBody, activate} from '@plus/popup/plus-body';

declare const __THUNDERBIRD__: boolean;
declare const __PLUS__: boolean;

interface BodyProps {
    data: ExtensionData;
    actions: ExtensionActions;
}

interface BodyState {
    activeTab: string;
    moreSiteSettingsOpen: boolean;
    newToggleMenusHighlightHidden: boolean;
}

function Body(props: BodyProps & {fonts: string[]} & {installation: {date: number; version: string}}) {
    const context = getContext();
    const {state, setState} = useState<BodyState>({
        activeTab: 'Filter',
        moreSiteSettingsOpen: false,
        newToggleMenusHighlightHidden: false,
    });

    if (!props.data.isReady) {
        return (
            <body>
                <Loader complete={false} />
            </body>
        );
    }

    const v = props.installation?.version?.split('.').map((p) => parseInt(p));
    const n = v && v.length >= 3 ? (v[0] * 1e6 + v[1] * 1e3 + v[2]) : 0;

    if (
        __PLUS__ && (
            props.data.settings.previewNewestDesign || (isMobile && n && n >= 4009093)
        )
    ) {
        return <PlusBody {...props} fonts={props.fonts} />;
    }

    if (isMobile || props.data.settings.previewNewDesign) {
        return <NewBody {...props} fonts={props.fonts} />;
    }

    function toggleMoreSiteSettings() {
        setState({moreSiteSettingsOpen: !state.moreSiteSettingsOpen, newToggleMenusHighlightHidden: true});
        if (props.data.uiHighlights.includes('new-toggle-menus')) {
            props.actions.hideHighlights(['new-toggle-menus']);
        }
    }

    const filterTab = <FilterSettings data={props.data} actions={props.actions} />;

    const moreTab = <MoreSettings data={props.data} actions={props.actions} fonts={props.fonts} />;

    return (
        <body
            class={{
                'ext-disabled': !props.data.isEnabled,
                'ext-tall': __PLUS__ || props.data.uiHighlights.includes('anniversary'),
            }}
        >
            <Loader complete />

            <Header
                data={props.data}
                actions={props.actions}
                onMoreSiteSettingsClick={toggleMoreSiteSettings}
            />

            <TabPanel
                activeTab={state.activeTab}
                onSwitchTab={(tab) => setState({activeTab: tab})}
                tabs={__THUNDERBIRD__ ? {
                    'Filter': filterTab,
                    'More': moreTab,
                } : {
                    'Filter': filterTab,
                    'Site list': (
                        <SiteListSettings data={props.data} actions={props.actions} isFocused={state.activeTab === 'Site list'} />
                    ),
                    'More': moreTab,
                }}
                tabLabels={{
                    'Filter': getLocalMessage('filter'),
                    'Site list': getLocalMessage('site_list'),
                    'More': getLocalMessage('more'),
                }}
            />

            <footer>
                <div class="footer-buttons">
                    <a class="footer-help-link" href={getHelpURL()} target="_blank" rel="noopener noreferrer">{getLocalMessage('help')}</a>
                </div>
            </footer>
            <MoreSiteSettings
                data={props.data}
                actions={props.actions}
                isExpanded={state.moreSiteSettingsOpen}
                onClose={toggleMoreSiteSettings}
            />
        </body>
    );
}

export default compose(Body as any, withState, withForms);
