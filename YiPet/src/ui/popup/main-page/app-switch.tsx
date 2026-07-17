import {m} from 'malevic';

import type {ViewProps} from '../../../definitions';
import {getLocalMessage} from '../../../utils/locales';
import {ControlGroup, MultiSwitch} from '../../controls';

export default function AppSwitch(props: ViewProps) {
    const isOn = props.data.settings.enabled === true;

    const values = [
        getLocalMessage('on'),
        getLocalMessage('off'),
    ];
    const value = isOn ? values[0] : values[1];

    function onSwitchChange(v: string) {
        const index = values.indexOf(v);
        if (index === 0) {
            props.actions.changeSettings({enabled: true});
        } else if (index === 1) {
            props.actions.changeSettings({enabled: false});
        }
    }

    const descriptionText = isOn ? 'Extension is enabled' : 'Extension is disabled';
    const description = (
        <span
            class={{
                'app-switch__description': true,
                'app-switch__description--on': props.data.isEnabled,
                'app-switch__description--off': !props.data.isEnabled,
            }}
        >
            {descriptionText}
        </span>
    );

    return (
        <ControlGroup class="app-switch">
            <ControlGroup.Control>
                <MultiSwitch
                    class="app-switch__control"
                    options={values}
                    value={value}
                    onChange={onSwitchChange}
                />
            </ControlGroup.Control>
            <ControlGroup.Description>
                {description}
            </ControlGroup.Description>
        </ControlGroup>
    );
}
