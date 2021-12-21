const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');

const PanelButton = getModuleByDisplayName('PanelButton', false);
const { ShowCurrentGame } = getModule(['ShowCurrentGame'], false) || {};

const Joystick = require('./Joystick');

module.exports = props => {
    const enabled = ShowCurrentGame.useSetting();

    return <PanelButton
        icon={() =>
            <Joystick
                disabled={!enabled}
                width={20}
                height={20}
            />
        }
        tooltipText={`${enabled ? 'Hide' : 'Show'} Game Activity`}
        {...props}
    />;
};
