import {m} from 'malevic';

import type {Theme, ViewProps} from '../../../../definitions';
import {Scheme} from '../controls';
import {getCurrentThemePreset} from '../utils';

interface ThemeGroupProps {
    theme: Theme;
    change: (theme: Partial<Theme>) => void;
}

function MainGroup({theme, change}: ThemeGroupProps) {
    return (
        <Scheme
            isDark={theme.mode === 1}
            onChange={(isDark) => change({mode: isDark ? 1 : 0})}
        />
    );
}

export default function ThemePage(props: ViewProps) {
    const {theme, change} = getCurrentThemePreset(props);

    return (
        <section class="m-section theme-page">
            <MainGroup theme={theme} change={change} />
        </section>
    );
}
