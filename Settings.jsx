const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = ({ getSetting, toggleSetting, reload }) => <>
    <SwitchItem
        value={getSetting('showInMenu')}
        onChange={() => {
            toggleSetting('showInMenu')
            reload()
        }}
    >Show game activity toggle in status menu</SwitchItem>
    <SwitchItem
        value={getSetting('sound')}
        disabled={getSetting('showInMenu')}
        onChange={() => toggleSetting('sound')}
    >Play toggle sound</SwitchItem>
</>
