//app.js
App({
  onLaunch: function (options) {
    this.globalData.sysinfo = wx.getSystemInfoSync()
  },
  getModel: function () {
    return this.globalData.sysinfo["model"]
  },
  getVersion: function () {
    return this.globalData.sysinfo["version"]
  },
  getSystem: function () {
    return this.globalData.sysinfo["system"]
  },
  getPlatform: function () {
    return this.globalData.sysinfo["platform"]
  },
  getSDKVersion: function () {
    return this.globalData.sysinfo["SDKVersion"]
  },
  getWindowWidth: function () {
    return this.globalData.sysinfo["windowWidth"]
  },
  getWindowHeight: function () {
    return this.globalData.sysinfo["windowHeight"]
  },
  globalData: {
    salt: "hello",
    userInfo: null
  },
})