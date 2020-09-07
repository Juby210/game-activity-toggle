const { Plugin } = require('powercord/entities')
const { findInReactTree, forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util')
const { getModule, React, i18n: { Messages } } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

const Settings = require('./Settings')

/**
 * Contributor(s): Harley (M|-|4r13y ツ#1051)
 */

module.exports = class GameActivityToggle extends Plugin {
    async startPlugin() {
        powercord.api.settings.registerSettings('game-activity-toggle', {
            category: this.entityID,
            label: 'Game Activity Toggle',
            render: p => React.createElement(Settings, {
                reload: () => {
                    this._unload()
                    this._load()
                }, ...p
            })
        })

        const settings = await getModule(['updateRemoteSettings'])
        const g = await getModule(['showCurrentGame'])

        // yes, i use same svgs as BD plugin, credits to egrodo
        const enabledIcon = w => React.createElement('svg', {
            viewBox: '0 0 24 24', width: w, height: w
        }, React.createElement('path', {
            style: { fill: 'currentColor' },
            d: 'M20.8,7.7c-0.6-1.2-1.8-1.9-3.1-1.9H6.3C5,5.7,3.8,6.5,3.2,7.6l-2.8,5.8c0,0,0,0,0,0C-0.3,15.1,0.4,17,2,17.8L2.3,18C4,18.7,5.9,18,6.7,16.4l0.1-0.3c0.3-0.6,0.9-1,1.6-1h7.1c0.7,0,1.3,0.4,1.6,1l0.1,0.3c0.8,1.6,2.7,2.4,4.4,1.6l0.3-0.1c1.6-0.8,2.3-2.7,1.6-4.4L20.8,7.7z M8.6,10.5c0,0.2-0.2,0.4-0.4,0.4H7.3c-0.2,0-0.4,0.2-0.4,0.4v0.9c0,0.2-0.2,0.4-0.4,0.4H5.7c-0.2,0-0.4-0.2-0.4-0.4v-0.9c0-0.2-0.2-0.4-0.4-0.4c0,0,0,0,0,0H4.1c-0.2,0-0.4-0.2-0.4-0.4V9.7c0-0.2,0.2-0.4,0.4-0.4h0.9c0.2,0,0.4-0.2,0.4-0.4c0,0,0,0,0,0V8.1c0-0.2,0.2-0.4,0.4-0.4h0.8C6.8,7.7,7,7.9,7,8.1V9c0,0.2,0.2,0.4,0.4,0.4h0.9c0.2,0,0.3,0.2,0.3,0.4V10.5z M15.6,10.9c-0.4,0-0.8-0.3-0.8-0.8c0-0.4,0.3-0.8,0.8-0.8c0,0,0,0,0,0c0.4,0,0.8,0.3,0.8,0.8C16.4,10.5,16.1,10.9,15.6,10.9z M17.2,7.7C17.2,7.7,17.2,7.7,17.2,7.7c0.4,0,0.8,0.3,0.8,0.8c0,0,0,0,0,0c0,0.4-0.4,0.8-0.8,0.8c-0.4,0-0.8-0.4-0.8-0.8S16.8,7.7,17.2,7.7z M18,11.7L18,11.7C18,11.7,18,11.7,18,11.7c0,0.4-0.3,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.8c0-0.4,0.3-0.8,0.8-0.8c0,0,0,0,0,0C17.7,10.9,18,11.3,18,11.7C18,11.7,18,11.7,18,11.7L18,11.7C18,11.7,18,11.7,18,11.7C18,11.7,18,11.7,18,11.7z M18.9,10.9c-0.4,0-0.8-0.3-0.8-0.8c0-0.4,0.3-0.8,0.8-0.8c0,0,0,0,0,0c0.4,0,0.8,0.3,0.8,0.8C19.6,10.5,19.3,10.9,18.9,10.9z'
        }))
        const disabledIcon = w => React.createElement('svg', {
            viewBox: '0 0 24 24', width: w, height: w
        }, React.createElement('path', {
            style: { fill: 'currentColor' },
            d: 'M17.7,5.7h-0.8L4.4,18.1c1-0.2,1.9-0.8,2.3-1.8l0.1-0.3c0.3-0.6,0.9-1,1.6-1h1.9l4.7-4.6v0c-0.1-0.1-0.1-0.2-0.1-0.4c0-0.4,0.3-0.8,0.8-0.8c0,0,0,0,0,0c0.1,0,0.2,0,0.3,0.1l0.5-0.5c-0.1-0.1-0.1-0.2-0.1-0.4c0-0.4,0.3-0.8,0.8-0.8c0.1,0,0.3,0,0.4,0.1l1.7-1.7C18.8,5.8,18.3,5.7,17.7,5.7z M23.5,13.4l-2.8-5.8c0,0,0-0.1-0.1-0.1l-1.8,1.8c0.4,0,0.7,0.4,0.7,0.8c0,0.4-0.3,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.7l-0.8,0.8c0.4,0,0.7,0.4,0.7,0.8c0,0.4-0.4,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.7L13.1,15h2.4c0.7,0,1.3,0.4,1.6,1l0.1,0.3c0.8,1.6,2.7,2.3,4.4,1.6l0.3-0.1C23.6,17,24.3,15,23.5,13.4z M6.3,5.7C5,5.7,3.8,6.4,3.3,7.6l-2.8,5.8c0,0,0,0,0,0C-0.3,15,0.4,16.9,2,17.7L14,5.7H6.3z M8.2,10.8H7.3c-0.2,0-0.4,0.2-0.4,0.3v0.9c0,0.2-0.2,0.3-0.3,0.3H5.7c-0.2,0-0.3-0.2-0.3-0.3v-0.9c0-0.2-0.2-0.3-0.4-0.3H4.1c-0.2,0-0.4-0.2-0.4-0.4V9.6c0-0.2,0.2-0.4,0.4-0.4H5c0.2,0,0.4-0.2,0.4-0.4V8c0-0.2,0.2-0.4,0.4-0.4h0.8C6.8,7.7,7,7.8,7,8v0.9c0,0.2,0.2,0.4,0.4,0.4h0.9c0.2,0,0.3,0.2,0.3,0.4v0.8C8.6,10.7,8.4,10.8,8.2,10.8z'
        }), React.createElement('polygon', {
            style: { fill: '#F04747' },
            points: '22.6,2.7 22.6,2.8 19.3,6.1 16,9.3 16,9.4 15,10.4 15,10.4 10.3,15 2.8,22.5 1.4,21.1 21.2,1.3 '
        }))
        let showCurrentGame

        if (this.settings.get('showInMenu')) {
            const classes = await getModule(['status', 'description'])
            const Menu = await getModule(m => m.default && m.default.displayName == 'Menu')
            inject('game-activity-toggle', Menu, 'default', args => {
                if (args[0].navId != 'status-picker') return args

                const [{ children }] = args
                const invisibleStatus = children.find(c => c.props.id == 'invisible')

                if (!children.find(c => c.props.id == 'game-activity')) {
                    showCurrentGame = g.showCurrentGame

                    children.splice(children.indexOf(invisibleStatus) + 1, 0, React.createElement(Menu.MenuItem, {
                        id: 'game-activity',
                        keepItemStyles: true,
                        action: () => {
                            showCurrentGame = !showCurrentGame;
                            return settings.updateRemoteSettings({ showCurrentGame })
                        },
                        render: () => React.createElement('div', {
                            className: classes.statusItem,
                            'aria-label': `${showCurrentGame ? 'Hide' : 'Show'} Game Activity`
                        }, showCurrentGame ? disabledIcon('16') : enabledIcon('16'), React.createElement('div', {
                            className: classes.status
                        }, `${showCurrentGame ? 'Hide' : 'Show'} Game Activity`), React.createElement('div', {
                            className: classes.description
                        }, Messages.SHOW_CURRENT_GAME))
                    }))
                }

                return args
            }, true)
            Menu.default.displayName = 'Menu'
        } else {
            const classes = await getModule(['container', 'usernameContainer'])
            let container = await waitFor('.' + classes.container)
            if (container.parentElement.className.includes('powercord-spotify'))
                container = document.querySelectorAll('.' + classes.container)[document.querySelectorAll('.' + classes.container).length - 1]
            const Account = getOwnerInstance(container)
            inject('game-activity-toggle', Account.__proto__, 'render', (_, res) => {
                const r = findInReactTree(res, e => e.props && e.props.basis && e.props.children && e.props.shrink)
                if (!r) return res
                showCurrentGame = g.showCurrentGame

                r.props.children.unshift(React.createElement(r.props.children[0].type, {
                    icon: () => showCurrentGame ? enabledIcon('20') : disabledIcon('20'),
                    onClick: () => {
                        showCurrentGame = !showCurrentGame
                        settings.updateRemoteSettings({ showCurrentGame })
                        forceUpdateElement('.' + classes.container, true)
                    },
                    tooltipText: `${showCurrentGame ? 'Hide' : 'Show'}`
                }))

                return res
            })
            Account.forceUpdate()

            g.addChangeListener(this.changeListener = () => {
                if (showCurrentGame != g.showCurrentGame)
                    forceUpdateElement('.' + classes.container, true)
            })
        }
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings('game-activity-toggle')
        uninject('game-activity-toggle')
        if (this.changeListener)
            getModule(['showCurrentGame'], false).removeChangeListener(this.changeListener)
    }
}
