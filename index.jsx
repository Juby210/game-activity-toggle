const { Plugin } = require('powercord/entities');
const { getModule, contextMenu, React, i18n: { Messages } } = require('powercord/webpack');
const { findInReactTree, forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

const accountClasses = getModule(['container', 'usernameContainer'], false);
const Menu = getModule(['MenuGroup', 'MenuItem'], false);
const statusClasses = getModule(['status', 'statusItem'], false);
const { ShowCurrentGame } = getModule(['ShowCurrentGame'], false) || {};
const { playSound } = getModule(['playSound'], false) || {};

const SpotifyUtils = require('./spotify');
const Joystick = require('./components/Joystick');
const Settings = require('./components/Settings');
const SpotifyContextMenu = require('./components/Spotify');
const ToggleButton = require('./components/ToggleButton');

module.exports = class GameActivityToggle extends Plugin {
   async startPlugin() {
      powercord.api.settings.registerSettings(this.entityID, {
         category: this.entityID,
         label: 'Game Activity Toggle',
         render: (props) => <Settings plugin={this} {...props} />
      });

      if (this.settings.get('showInMenu', false)) {
         this.patchStatusPicker();
      } else {
         this.patchAccountContainer();
      }
   }

   patchStatusPicker() {
      inject('game-activity-toggle', Menu, 'default', (args) => {
         if (args[0]?.navId !== 'status-picker') return args;

         const [{ children }] = args;
         const invisibleStatus = children.find(c => c.props.id === 'invisible');

         if (!children.find(c => c?.props?.id == 'game-activity')) {
            const enabled = ShowCurrentGame.getSetting();

            children.splice(
               children.indexOf(invisibleStatus) + 1,
               0,
               <Menu.MenuSeparator />,
               <Menu.MenuItem
                  id='game-activity'
                  keepItemStyles={true}
                  action={this.onToggleClicked.bind(this)}
                  render={() =>
                     <div
                        className={statusClasses.statusItem}
                        aria-label={`${enabled ? 'Hide' : 'Show'} Game Activity`}
                     >
                        <Joystick
                           disabled={enabled}
                           width={16}
                           height={16}
                        />
                        <div className={statusClasses.status}>
                           {enabled ? 'Hide' : 'Show'} Game Activity
                        </div>
                        <div className={statusClasses.description}>
                           Display current running game as a status message.
                        </div>
                     </div>
                  }
               />,
               this.settings.get('showSpotify', true) ? SpotifyUtils.getSpotifyAccounts().length > 0 ? SpotifyContextMenu.buildSpotifyGroup() : null : null
            );
         }

         return args;
      }, true);
      Menu.default.displayName = 'Menu';
   }

   async patchAccountContainer() {
      let container = await waitFor(`.${accountClasses.container}`);
      if (container.parentElement.className.includes('powercord-spotify')) {
         container = Array.from(document.querySelectorAll(`.${accountClasses.container}`)).pop();
      }

      const Account = getOwnerInstance(container);

      inject('game-activity-toggle', Account.__proto__, 'render', (_, res) => {
         const r = findInReactTree(res, e => e?.props?.basis && e.props.children && e.props.shrink);

         if (r) r.props.children.unshift(
            <ToggleButton
               onClick={() => {
                  this.onToggleClicked();
                  forceUpdateElement(`.${accountClasses.container}`, true);
               }}
               onContextMenu={e => contextMenu.openContextMenu(e, SpotifyContextMenu)}
            />
         );

         return res;
      });

      Account.forceUpdate();
   }

   onToggleClicked() {
      ShowCurrentGame.updateSetting(!ShowCurrentGame.getSetting());
      if (this.settings.get('sound', false)) playSound(ShowCurrentGame.getSetting() ? 'unmute' : 'mute', 0.4);
   }

   pluginWillUnload() {
      powercord.api.settings.unregisterSettings(this.entityID);
      uninject('game-activity-toggle');
   }
};
