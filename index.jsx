const { findInReactTree, forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { getModule, React, i18n: { Messages } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');

const accountClasses = getModule(['container', 'usernameContainer'], false);
const Menu = getModule(m => m.default?.displayName == 'Menu', false);
const statusClasses = getModule(['status', 'statusItem'], false);
const settings = getModule(['updateRemoteSettings'], false);
const SettingsUtil = getModule(['showCurrentGame'], false);
const { playSound } = getModule(['playSound'], false);

const Joystick = require('./components/Joystick');
const Settings = require('./components/Settings');

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
         if (args[0].navId == 'status-picker') {
            const [{ children }] = args;
            const invisibleStatus = children.find(c => c.props.id == 'invisible');

            if (!children.find(c => c.props.id == 'game-activity')) {
               this.enabled = SettingsUtil.showCurrentGame;

               let item = <Menu.MenuItem
                  id='game-activity'
                  keepItemStyles={true}
                  action={this.onToggleClicked.bind(this)}
                  render={() =>
                     <div
                        className={statusClasses.statusItem}
                        aria-label={`${this.enabled ? 'Hide' : 'Show'} Game Activity`}
                     >
                        <Joystick.default
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
               />;

               children.splice(children.indexOf(invisibleStatus) + 1, 0, item);
            }
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

         if (r) {
            this.enabled = SettingsUtil.showCurrentGame;

            const Comp = r.props.children[0].type;

            r.props.children.unshift(
               <Comp
                  icon={this.enabled ? Joystick.disabled : Joystick.default}
                  onClick={() => {
                     this.onToggleClicked();
                     forceUpdateElement(`.${accountClasses.container}`, true);
                  }}
                  tooltipText={`${this.enabled ? 'Hide' : 'Show'} Game Activity`}
               />
            );
         }

         return res;
      });

      Account.forceUpdate();

      SettingsUtil.addChangeListener(this.changeListener = () => {
         if (this.enabled != SettingsUtil.showCurrentGame) {
            forceUpdateElement(`.${accountClasses.container}`, true);
         }
      });
   }

   onToggleClicked() {
      this.enabled = !this.enabled;
      if (this.settings.get('sound', false)) {
         playSound(this.enabled ? 'mute' : 'unmute', 0.4);
      }
      return settings.updateRemoteSettings({ showCurrentGame: this.enabled });
   }

   pluginWillUnload() {
      powercord.api.settings.unregisterSettings(this.entityID);
      uninject('game-activity-toggle');
      if (this.changeListener) SettingsUtil.removeChangeListener(this.changeListener);
   }
};
