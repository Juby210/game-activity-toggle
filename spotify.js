const { getModule } = require('powercord/webpack')

const { getAccounts } = getModule(['getAccounts'], false) || {}
const accountsMdl = getModule(['setShowActivity'], false) || {}

module.exports = {
    getSpotifyAccounts() {
        return getAccounts().filter(a => a.type === 'spotify')
    },
    
    toggleShowActivity(account) {
        const v = !account.showActivity
        account.showActivity = v
        accountsMdl.setShowActivity('spotify', account.id, v)
    }
}
