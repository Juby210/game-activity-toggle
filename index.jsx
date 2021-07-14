const { Plugin } = require('powercord/entities')
const { getModule, contextMenu, React, i18n: { Messages } } = require('powercord/webpack')
const { findInReactTree, forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util')
const { inject, uninject } = require('powercord/injector')

const accountClasses = getModule(['container', 'usernameContainer'], false)
const Menu = getModule(['MenuGroup', 'MenuItem'], false)
const statusClasses = getModule(['status', 'statusItem'], false)
const settings = getModule(['updateRemoteSettings'], false)
const SettingsStore = getModule(['showCurrentGame'], false)
const { playSound } = getModule(['playSound'], false) || {}

const SpotifyUtils = require('./spotify')
const Joystick = require('./components/Joystick')
const Settings = require('./components/Settings')
const SpotifyContextMenu = require('./components/Spotify')

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
         if (args[0].navId !== 'status-picker') return args
         
         const [{ children }] = args
         const invisibleStatus = children.find(c => c.props.id === 'invisible')

         if (!children.find(c => c.props.id == 'game-activity')) {
            this.enabled = SettingsStore.showCurrentGame

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
                        aria-label={`${this.enabled ? 'Hide' : 'Show'} Game Activity`}
                     >
                        <Joystick
                           disabled={this.enabled}
                           width={16}
                           height={16}
                        />
                        <div className={statusClasses.status}>
                           {this.enabled ? 'Hide' : 'Show'} Game Activity
                        </div>
                        <div className={statusClasses.description}>
                           Display current running game as a status message.
                        </div>
                     </div>
                  }
               />,
               SpotifyUtils.getSpotifyAccounts().length > 0 ? SpotifyContextMenu.buildSpotifyGroup() : null
            )
         }

         return args
      }, true)
      Menu.default.displayName = 'Menu'
   }

   async patchAccountContainer() {
      let container = await waitFor(`.${accountClasses.container}`);
      if (container.parentElement.className.includes('powercord-spotify')) {
         container = Array.from(document.querySelectorAll(`.${accountClasses.container}`)).pop();
      }

      const Account = getOwnerInstance(container);

      inject('game-activity-toggle', Account.__proto__, 'render', (_, res) => {
         const r = findInReactTree(res, e => e?.props?.basis && e.props.children && e.props.shrink);

         if (r) {
            this.enabled = SettingsStore.showCurrentGame;

            const Comp = r.props.children[0].type;

            r.props.children.unshift(
               <Comp
                  icon={() =>
                     <Joystick
                        disabled={!this.enabled}
                        width={20}
                        height={20}
                     />
                  }
                  onClick={() => {
                     this.onToggleClicked();
                     forceUpdateElement(`.${accountClasses.container}`, true);
                  }}
                  onContextMenu={e => contextMenu.openContextMenu(e, SpotifyContextMenu)}
                  tooltipText={`${this.enabled ? 'Hide' : 'Show'} Game Activity`}
               />
            );
         }

         return res;
      });

      Account.forceUpdate();

      SettingsStore.addChangeListener(this.changeListener = () => {
         if (this.enabled != SettingsStore.showCurrentGame) {
            forceUpdateElement(`.${accountClasses.container}`, true);
         }
      });
   }

   onToggleClicked() {
      this.enabled = !this.enabled
      if (this.settings.get('sound', false)) playSound(this.enabled ? 'unmute' : 'mute', 0.4)
      return settings.updateRemoteSettings({ showCurrentGame: this.enabled })
   }

   pluginWillUnload() {
      powercord.api.settings.unregisterSettings(this.entityID);
      uninject('game-activity-toggle');
      if (this.changeListener) SettingsStore.removeChangeListener(this.changeListener);
   }
};
