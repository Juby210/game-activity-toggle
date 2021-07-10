const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = ({ getSetting, toggleSetting, plugin }) => <>
   <SwitchItem
      value={getSetting('showInMenu', false)}
      onChange={() => {
         toggleSetting('showInMenu');
         plugin._unload();
         plugin._load();
      }}
   >
      Show game activity toggle in status menu
   </SwitchItem>
   <SwitchItem
      value={getSetting('sound', false)}
      onChange={() => toggleSetting('sound')}
   >
      Play toggle sound
   </SwitchItem>
</>;
