import {m} from 'malevic';

import type {Theme, ViewProps} from '../../../definitions';
import {Scheme} from '../theme/controls';
import {getCurrentThemePreset} from '../theme/utils';

function ThemeControls(props: {theme: Theme; onChange: (theme: Partial<Theme>) => void}) {
    const {theme, onChange} = props;
    return (
        <section class="m-section m-theme-controls">
            <Scheme
                isDark={theme.mode === 1}
                onChange={(isDark) => onChange({mode: isDark ? 1 : 0})}
            />
        </section>
    );
}

export default function ThemeGroup(props: ViewProps & {onThemeNavClick: () => void}) {
    const preset = getCurrentThemePreset(props);

    return (
        <div class="theme-group">
            <div class="theme-group__controls-wrapper">
                <ThemeControls
                    theme={preset.theme}
                    onChange={preset.change}
                />
            </div>
            <label class="theme-group__description">
                Configure theme
            </label>
        </div>
    );
}
