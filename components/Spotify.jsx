const { React, getModule, contextMenu: { closeContextMenu } } = require('powercord/webpack');
const { getOwnerInstance } = require('powercord/util');
const { default: Menu, MenuCheckboxItem, MenuGroup, MenuItem } = getModule(['MenuGroup', 'MenuItem'], false) || {};

const SpotifyUtils = require('../spotify');

const cssPath = function (el) {
   if (!el) return '';
   const path = [];
   while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) selector += `#${el.id}`;
      else {
         let sib = el, nth = 1;
         while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++);
         selector += `:nth-child(${nth})`;
      }
      path.unshift(selector);
      el = el.parentNode;
      if (el.id === 'app-mount') break;
   }
   return path.join(' > ');
};

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
               // sometimes doesn't work, I have no idea
               setImmediate(() => getOwnerInstance(document.querySelector(cssPath(el))).forceUpdate());
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
