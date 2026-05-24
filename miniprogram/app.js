// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d2gtyemv5242263c3',
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  globalData: {}
})
