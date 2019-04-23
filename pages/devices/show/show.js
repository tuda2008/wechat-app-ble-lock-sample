// pages/devices/show/show.js
import Tools from '../../../utils/tools.js';

const Tls = new Tools();
const md5 = require('../../../utils/md5.min.js');
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    oriDeviceId: "",
    connectedId: "",
    bluetoothMac: "",
    connectedDeviceId: "",
    connected: true,
    serviceId: "",
    qoe: "充足",
    openDoorNum: 0,
    connectBleName: "请连接蓝牙",
    code: "",
    name: "",
    lastDate: "",
    turnOff: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (typeof(options.bluetoothMac) == "undefined") {
      that.setData({
        name: options.name,
        oriDeviceId: options.id,
        code: options.code,
        connectedId: wx.getStorageSync('connectedId'),
        connectedDeviceId: wx.getStorageSync('connectedDeviceId')
      })
    } else {
      that.setData({
        name: options.name,
        oriDeviceId: options.id,
        code: options.code,
        connectedId: wx.getStorageSync('connectedId'),
        connectedDeviceId: wx.getStorageSync('connectedDeviceId'),
        bluetoothMac: options.bluetoothMac,
        connectBleName: wx.getStorageSync('connectedId')==options.id ? '已连接蓝牙' : '请连接蓝牙'
      })
      setTimeout(function () {
        wx.onBLEConnectionStateChanged(function (res) {
          //connected: false, errorCode: 10003, errorMsg: "The specified device has disconnected from us."
          console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
          that.setData({
            connected: res.connected
          })
          if (res.connected) {
          } else {
            that.closeBleConnection();
            wx.setStorageSync('connectedDeviceId', "")
            wx.showModal({
                title: '提示',
                showCancel: true,
                cancelText: "取消",
                cancelColor: "#000",
                confirmText: "确定",
                confirmColor: "#0f0",
                content: `云锁蓝牙已断开，请按0♯重新开启蓝牙连接`,
                success: function (res) {
                  console.log(res)
                  if (res.confirm) {
                    that.connectBluetooth();
                  }
                }
            })
          }
        })
      }, 1000)
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    let that = this;
    setTimeout(function () {
      if (that.data.connected && (typeof(that.data.bluetoothMac) != undefined) && wx.getStorageSync('notifyCharId').length>0) {
        wx.notifyBLECharacteristicValueChange({
          state: true,
          deviceId: wx.getStorageSync('connectedDeviceId'),
          serviceId: wx.getStorageSync('serviceId'),
          characteristicId: wx.getStorageSync('notifyCharId'),
          success() {
            console.log('开始监听特征值')
            wx.onBLECharacteristicValueChange(function (onNotityChangeRes) {
              that.handleBLEMessage(Tls.ab2hex(onNotityChangeRes.value))
            })
          },
          fail: (res) => {
            if (res.errCode==10006 && !that.data.turnOff) {
              that.closeBleConnection();
              wx.setStorageSync('connectedDeviceId', "")
              wx.showModal({
                  title: '提示',
                  showCancel: true,
                  cancelText: "取消",
                  cancelColor: "#000",
                  confirmText: "确定",
                  confirmColor: "#0f0",
                  content: `云锁蓝牙已断开，请按0♯重新开启蓝牙连接`,
                  success: function (res) {
                    console.log(res)
                    if (res.confirm) {
                      that.connectBluetooth();
                    }
                  }
              })
            }
            console.warn("监听特征值失败");
            console.log(res);
          }
        })
      }
    }, 3000) // 5000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


  handleBLEMessage: function (msg) {
    console.log(msg)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },


  settingFinger: function () {
    let that = this
    if (that.data.connectedId==that.data.oriDeviceId) {
      let cmd = []
      let params = "a01400" + that.data.code + "010e" + Tls.currentTime()
      params = params + md5(app.globalData.salt + params).slice(0,16)
      params.match(/[\da-f]{2}/gi).map(function (h) {
        cmd.push(parseInt(h, 16))
      });

      let sum = 0
      for (var i=0;i<cmd.length;i++) {
        sum = sum + cmd[i]
      }
      cmd.push(sum&0xff)
      let cmdArray = new Uint8Array(cmd);
      setTimeout(() => {
        that.writeArray(cmdArray)
      }, 300)
      wx.showToast({
        title: '正在发送指令...',
        icon: 'loading',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '请先连接蓝牙',
        icon: 'none',
        duration: 2000
      })
    }
  },

  settingPassword: function () {
    let that = this
    if (that.data.connectedId==that.data.oriDeviceId) {
      let cmd = []
      let params = "a01700" + that.data.code + "0211"
      let password = "123456"

      params.match(/[\da-f]{2}/gi).map(function (h) {
        cmd.push(parseInt(h, 16))
      });
         
      password.match(/[\da-f]{2}/gi).map(function (j) {
        cmd.push(parseInt(j, 10))
      });

      params = params + password + Tls.currentTime();
      (Tls.currentTime() + md5(app.globalData.salt + params).slice(0,16)).match(/[\da-f]{2}/gi).map(function (k) {
        cmd.push(parseInt(k, 16))
      });

      let sum = 0
      for (var i=0;i<cmd.length;i++) {
        sum = sum + cmd[i]
      }
      cmd.push(sum&0xff)
      let cmdArray = new Uint8Array(cmd);
      setTimeout(() => {
        that.writeArray(cmdArray)
      }, 1000)
      wx.showToast({
        title: '正在发送指令...',
        icon: 'loading',
        duration: 5000
      })
    } else {
      wx.showToast({
        title: '请先连接蓝牙',
        icon: 'none',
        duration: 2000
      })
    }
  },

  settingICCard: function () {
    let that = this
    if (that.data.connectedId==that.data.oriDeviceId) {
      let cmd = []
      let params = "a01400" + that.data.code + "030e" + Tls.currentTime()
      params = params + md5(app.globalData.salt + params).slice(0,16)
      params.match(/[\da-f]{2}/gi).map(function (h) {
        cmd.push(parseInt(h, 16))
      });

      let sum = 0
      for (var i=0;i<cmd.length;i++) {
        sum = sum + cmd[i]
      }
      cmd.push(sum&0xff)
      let cmdArray = new Uint8Array(cmd);
      setTimeout(() => {
        that.writeArray(cmdArray)
      }, 300)
      wx.showToast({
        title: '正在发送指令...',
        icon: 'loading',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '请先连接蓝牙',
        icon: 'none',
        duration: 2000
      })
    }
  },

  bleOpenDoor: function () {
    let that = this
    if (that.data.connectedId==that.data.oriDeviceId) {
      let cmd = []
      let params = "a01400" + that.data.code + "040e" + Tls.currentTime()
      params = params + md5(app.globalData.salt + params).slice(0,16)
      params.match(/[\da-f]{2}/gi).map(function (h) {
        cmd.push(parseInt(h, 16))
      });

      let sum = 0
      for (var i=0;i<cmd.length;i++) {
        sum = sum + cmd[i]
      }
      cmd.push(sum&0xff)
      let cmdArray = new Uint8Array(cmd);
      setTimeout(() => {
        that.writeArray(cmdArray)
      }, 300)
      wx.showToast({
        title: '正在发送指令...',
        icon: 'loading',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '请先连接蓝牙',
        icon: 'none',
        duration: 2000
      })
    }
  },

  connectBluetooth: function () {
    wx.redirectTo({
      url: '/pages/bluetooth/index/index?id=' + this.data.oriDeviceId + '&code=' + this.data.code + '&name=' + this.data.name,
    });
  },


  writeArray: function (cmdArray) {
    let that = this
    // 每间隔5s发送一次 
    if(Math.round(new Date().getTime()/1000) - wx.getStorageSync('lastCmdTime') < 5) {
      wx.showToast({
        title: '亲，您操作太快了',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.setStorageSync('lastCmdTime', Math.round(new Date().getTime()/1000))
    setTimeout(() => {
      wx.writeBLECharacteristicValue({
        deviceId: wx.getStorageSync('connectedDeviceId'),
        serviceId: wx.getStorageSync('serviceId'),
        characteristicId: wx.getStorageSync('writeCharId'),
        value: cmdArray.buffer,
        success: function (res) {
          wx.showToast({
            title: '指令发送成功',
            icon: 'success',
            duration: 1000
          })
          wx.setStorageSync('lastCmdTime', Math.round(new Date().getTime()/1000))
        },
        fail: function (res) {
          if (res.errCode==10006 || res.errCode==0) {
            wx.showToast({
              title: '云锁蓝牙已断开，请按"0#"唤醒蓝牙，然后重新连接',
              icon: 'none',
              duration: 2000
            })
            that.closeBleConnection()
          } else {
            wx.showToast({
              title: '指令发送失败',
              icon: 'none',
              duration: 2000
            })
          }
          console.log(res)
        }
      })
    }, 250)
  },


  closeBleConnection: function () {
    let that = this
    wx.closeBLEConnection({
      deviceId: wx.getStorageSync('connectedDeviceId'),
      success(res) {
        that.setData({
          connected: false,
          bluetoothMac: "",
          connectedId: "",
          connectBleName: '请连接蓝牙'
        })
        wx.getStorageSync('connectedId', "")
        wx.getStorageSync('connectedDeviceId', "")
      }
    })
  }


})