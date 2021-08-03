const { React, getModule, contextMenu: { closeContextMenu } } = require('powercord/webpack');
const { getOwnerInstance } = require('powercord/util');
const { default: Menu, MenuCheckboxItem, MenuGroup, MenuItem } = getModule(['MenuGroup', 'MenuItem'], false) || {};

const SpotifyUtils = require('../spotify');

const buildSpotifyGroup = () => {
   const accounts = SpotifyUtils.getSpotifyAccounts();
   return <MenuGroup label='Spotify Activity'>
      {accounts.length === 0 ?
         <MenuItem id='no-accounts' label='No accounts' disabled={true} /> :
         accounts.map(a => <MenuCheckboxItem
            id={a.id}
            label={a.name}
            checked={a.showActivity}
            action={e => {
               SpotifyUtils.toggleShowActivity(a);
               const el = e.target.closest('[role="menu"]');
               setImmediate(() => getOwnerInstance(el).forceUpdate());
            }}
         />
         )}
   </MenuGroup>;
};

const SpotifyContextMenu = () => <Menu
   navId='spotify-toggle'
   onClose={closeContextMenu}
>{buildSpotifyGroup()}</Menu>;

module.exports = SpotifyContextMenu;
module.exports.buildSpotifyGroup = buildSpotifyGroup;
