const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = class Settings extends React.PureComponent {
    render() {
        return <SwitchItem
            value={ this.props.getSetting('showInMenu') }
            onChange={ () => {
                this.props.toggleSetting('showInMenu')
                this.props.reload()
            }}
        >Show game activity toggle in status menu</SwitchItem>
    }
}
