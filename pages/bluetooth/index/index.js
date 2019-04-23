import Tools from '../../../utils/tools.js';

const Tls = new Tools();
const app = getApp();
var devices_list = []
var connectedDeviceId
Page({
  data: {
    name: "",
    oriDeviceId: "",
    code: "",
    serviceId: "",
    searching: false,
    button_width: 0,
    list_width: 0,
    list_height: 0,
    autoConnect: false
  },
  searchBluetooth: function () {
    var that = this
    wx.setStorageSync('turnOff', false)
    if (!that.data.searching && that.data.autoConnect) {
      wx.closeBluetoothAdapter({
        complete: function (res) {
          setTimeout(function () {
            wx.openBluetoothAdapter({
              success: function (res) {
                wx.getBluetoothAdapterState({
                  success: function (res) {
                  },
                  fail: function (res) {
                  },
                })
                wx.onBluetoothAdapterStateChange(function (res) {
                  that.setData({
                    searching: res.discovering
                  })
                  if (!res.available) {
                    wx.setStorageSync('connectedDeviceId', "")
                    that.setData({
                      devices_list: [],
                      searching: false
                    })
                  }
                })
                wx.onBluetoothDeviceFound(function (devices) {
                  //剔除重复设备，兼容不同设备API的不同返回值
                  var isnotexist = true
                  if (devices.deviceId) {
                    var i = 0;
                    devices.advertisData = Tls.ab2hex(devices.advertisData);
                    if (devices.advertisData == "") {
                      devices.advertisData = '空'
                    }
                    if (devices.name == "") {
                      devices.name = '空'
                    }
                    for (i = 0; i < devices_list.length; i++) {
                      if (devices.deviceId == devices_list[i].deviceId) {
                        isnotexist = false
                      }
                    }
                    if (isnotexist) {
                      devices_list.push(devices)
                    } else {
                      devices_list[i - 1].RSSI = devices.RSSI
                    }
                  } else if (devices.devices) {
                    var i;
                    devices.devices[0].advertisData = Tls.ab2hex(devices.devices[0].advertisData)
                    if (devices.devices[0].advertisData == "") {
                      devices.devices[0].advertisData = '空'
                    }
                    if (devices.devices[0].name == "") {
                      devices.devices[0].name = '空'
                    }
                    for (i = 0; i < devices_list.length; i++) {
                      if (devices.devices[0].deviceId == devices_list[i].deviceId) {
                        isnotexist = false
                      }
                    }
                    if (isnotexist) {
                      devices_list.push(devices.devices[0])
                    } else {
                      devices_list[i - 1].RSSI = devices.devices[0].RSSI
                    }
                  } else if (devices[0]) {
                    var i;
                    devices[0].advertisData = Tls.ab2hex(devices[0].advertisData)
                    if (devices[0].advertisData == "") {
                      devices[0].advertisData = '空'
                    }
                    if (devices[0].name == "") {
                      devices[0].name = '空'
                    }
                    for (i = 0; i < devices_list.length; i++) {
                      if (devices[0].deviceId == devices_list[i].deviceId) {
                        isnotexist = false
                      }
                    }
                    if (isnotexist) {
                      devices_list.push(devices.devices[0])
                    } else {
                      devices_list[i - 1].RSSI = devices[0].RSSI
                    }
                  }
                  that.setData({
                    devices_list: devices_list
                  })
                  if (devices_list.length == 1) {
                    that.ConnectToCurrent(devices_list[0].deviceId);
                  }
                })
                wx.startBluetoothDevicesDiscovery({
                  allowDuplicatesKey: false,
                  success: function (res) {
                    wx.setStorageSync('connectedDeviceId', "")
                    wx.setStorageSync('connectedId', "")
                    that.setData({
                      searching: true,
                      devices_list: []
                    })
                    setTimeout(function () {
                      wx.getBluetoothDevices({
                        success(res) {
                          if (res.devices.length==0) {
                            wx.showModal({
                              title: '没有找到可用的蓝牙设备',
                              content: `请手机开启位置权限，\r\n云锁按0♯唤醒蓝牙后重试`,
                              showCancel: false
                            })
                            that.setData({
                              searching: false,
                              devices_list: []
                            })
                          }
                        }
                      })
                    }, 30000) 
                  }
                })
              },
              fail: function (res) {
                console.log(res)
                wx.showModal({
                  title: '提示',
                  content: '请检查手机蓝牙是否打开',
                  showCancel: false,
                  success: function (res) {
                    wx.setStorageSync('connectedDeviceId', "")
                    wx.setStorageSync('connectedId', "")
                    that.setData({
                      searching: false,
                      devices_list: []
                    })
                  }
                })
              }
            })
          }, 500)
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  ConnectToCurrent: function (deviceId) {
    var that = this
    var advertisData, name
    for (var i = 0; i < devices_list.length; i++) {
      if (deviceId == devices_list[i].deviceId) {
        name = devices_list[i].name
        advertisData = devices_list[i].advertisData
      }
    }
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        that.setData({
          searching: false
        })
      }
    })
    that.closeBleConnection()
    wx.showLoading({
      title: '连接蓝牙设备中...'
    })
    wx.createBLEConnection({
      deviceId: deviceId,
      timeout: 5000,
      success: function (res) {
        wx.setStorageSync('connectedDeviceId', deviceId)
        wx.setStorageSync('connectedId', that.data.oriDeviceId)
        setTimeout(function () {
          wx.getBLEDeviceServices({
            deviceId: deviceId,
            timeout: 1000,
            success: function (res) {
              wx.setStorageSync('serviceId', res.services[0].uuid)
              that.setData({
                serviceId: res.services[0].uuid
              })
              setTimeout(function () {
                wx.getBLEDeviceCharacteristics({
                  deviceId: deviceId,
                  serviceId: that.data.serviceId,
                  timeout: 2000,
                  success(res) {
                    wx.hideLoading();
                    //get characteristicId
                    for (var i = 0; i < res.characteristics.length; i++) {
                      if (res.characteristics[i].properties.write) {
                        wx.setStorageSync('writeCharId', res.characteristics[i].uuid)
                      } else if (res.characteristics[i].properties.notify) {
                        wx.setStorageSync('notifyCharId', res.characteristics[i].uuid)
                      }
                    }
                    wx.showToast({
                      title: '连接成功',
                      icon: 'success',
                      duration: 2000
                    })
                  },
                  fail: (res) => {
                    console.warn("获取特征值失败", res);
                  },
                  complete: (res) => {
                    console.log("获取特征值完成", res);
                  }
                })
              }, 1000);
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/devices/show/show?id=' + that.data.oriDeviceId + '&bluetoothMac=' + deviceId + '&code=' + that.data.code + '&name=' + this.data.name,
                })
              }, 1000);
            }
          });
        }, 1000);
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        if (res.errCode == -1 && res.errMsg.match("already connect")) {
          wx.showToast({
            title: '已连接成功',
            icon: 'success',
            duration: 2000
          })
        } else if (res.errCode == 10003) {
          wx.showToast({
            title: '云锁蓝牙已断开，请按"0#"唤醒蓝牙',
            icon: 'none',
            duration: 2000
          })
        } else if (res.errCode == 10012) {
          wx.showToast({
            title: '连接蓝牙超时，请重连',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '连接失败',
            showCancel: false
          })
        }
      }
    })
  },
  ConnectTo: function (e) {
    var that = this
    var advertisData, name
    for (var i = 0; i < devices_list.length; i++) {
      if (e.currentTarget.id == devices_list[i].deviceId) {
        name = devices_list[i].name
        advertisData = devices_list[i].advertisData
      }
    }
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        that.setData({
          searching: false
        })
      }
    })
    that.closeBleConnection()
    wx.showLoading({
      title: '连接蓝牙设备中...'
    })
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      timeout: 5000,
      success: function (res) {
        wx.setStorageSync('connectedDeviceId', e.currentTarget.id)
        wx.setStorageSync('connectedId', that.data.oriDeviceId)
        wx.hideLoading();
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          wx.getBLEDeviceServices({
            deviceId: e.currentTarget.id,
            timeout: 2000,
            success: function (res) {
              wx.setStorageSync('serviceId', res.services[0].uuid)
              that.setData({
                serviceId: res.services[0].uuid
              })
              wx.getBLEDeviceCharacteristics({
                deviceId: e.currentTarget.id,
                serviceId: res.services[0].uuid,
                timeout: 2000,
                success(res) {
                  //get characteristicId
                  for (var i = 0; i < res.characteristics.length; i++) {
                    if (res.characteristics[i].properties.write) {
                      wx.setStorageSync('writeCharId', res.characteristics[i].uuid)
                    } else if (res.characteristics[i].properties.notify) {
                      wx.setStorageSync('notifyCharId', res.characteristics[i].uuid)
                    }
                  }
                },
                fail: (res) => {
                  console.warn("获取特征值失败", res);
                },
                complete: (res) => {
                  console.log("获取特征值完成", res);
                }
              })
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/devices/show/show?id=' + that.data.oriDeviceId + '&bluetoothMac=' + e.currentTarget.id + '&code=' + that.data.code+ '&name=' + this.data.name,
                })
              }, 1000);
            }
          });
        }, 1000);
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        if (res.errCode == -1 && res.errMsg.match("already connect")) {
          wx.showToast({
            title: '已连接成功',
            icon: 'success',
            duration: 2000
          })
        } else if (res.errCode == 10003) {
          wx.showToast({
            title: '云锁蓝牙已断开，请按"0#"唤醒蓝牙',
            icon: 'none',
            duration: 2000
          })
        } else if (res.errCode == 10012) {
          wx.showToast({
            title: '连接蓝牙超时，请重连',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '连接失败',
            showCancel: false
          })
        }
      }
    })
  },
  onShow: function () {
    if (wx.setKeepScreenOn) {
      wx.setKeepScreenOn({
        keepScreenOn: true,
        success: function (res) {
          //console.log('保持屏幕常亮')
        }
      })
    }
  },
  onLoad: function (options) {
    this.setData({
      autoConnect: true,
      name: options.name,
      oriDeviceId: options.id,
      code: options.code,
      devices_list: [],
      button_width: app.getWindowWidth() - 32,
      list_width: app.getWindowWidth() - 32,
      list_height: app.getWindowHeight() - 82
    })

    if (app.getPlatform() == 'android' && Tls.versionCompare('6.5.7', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    } else if (app.getPlatform() == 'ios' && Tls.versionCompare('6.5.6', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
    this.searchBluetooth();
  },

  closeBleConnection: function () {
    let that = this
    if (that.data.serviceId!="" && wx.getStorageSync('connectedDeviceId')!="") {
      setTimeout(function () {
        wx.closeBLEConnection({
          deviceId: wx.getStorageSync('connectedDeviceId'),
          success(res) {
            that.setData({
              searching: false,
              serviceId: ""
            })
            wx.setStorageSync('connectedDeviceId', "")
            wx.setStorageSync('connectedId', "")
          }
        })
      }, 250);
    }
  },

  onHide: function () {
    // var that = this
    // this.setData({
    //   devices_list: []
    // })
    // if (this.data.searching) {
    //   wx.stopBluetoothDevicesDiscovery({
    //     success: function (res) {
    //       console.log(res)
    //       that.setData({
    //         searching: false
    //       })
    //     }
    //   })
    // }
  }
})