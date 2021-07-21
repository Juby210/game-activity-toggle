const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = ({ getSetting, toggleSetting, plugin }) => <>
   <SwitchItem
      value={getSetting('showInMenu', false)}
      onChange={() => {
         toggleSetting('showInMenu', false);
         plugin._unload();
         plugin._load();
      }}
   >
      Show game activity toggle in status menu
   </SwitchItem>
   {getSetting('showInMenu', false) ?
      <SwitchItem
         value={getSetting('showSpotify', true)}
         onChange={() => toggleSetting('showSpotify', true)}
      >
         Display toggleable spotify activites for each account
      </SwitchItem> : null
   }
   <SwitchItem
      value={getSetting('sound', false)}
      onChange={() => toggleSetting('sound', false)}
   >
      Play toggle sound
   </SwitchItem>
</>;
