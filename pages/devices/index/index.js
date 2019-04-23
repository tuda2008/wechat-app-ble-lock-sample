// pages/devices/index/index.js
import Tools from '../../../utils/tools.js';

const Tls = new Tools();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    totalPage: 1,
    deviceNum: 1,
    carousels: [
      {'id': 1, 'url': '/images/carousel/factory1.jpg'}, 
      {'id': 2, 'url': '/images/carousel/factory1.jpg'},
      {'id': 3, 'url': '/images/carousel/factory1.jpg'}
    ],
    devices: [{"id": "1", "name": "门锁", "code": "abcd"}],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 2000,
    imgWidth: 750,
    imgHeights: [],
    token: "",
    textTips: 'Tips，1.按右下角绿色按钮扫码添加设备，2.添加设备成功后，按“0#”唤醒设备蓝牙后，打开手机蓝牙并按设备列表中的蓝牙图标直接连接设备蓝牙，3.连接设备蓝牙成功后，即可注册指纹、密码、IC卡，4.任何意见、建议均可点击左下角图标联系在线客服.',
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    size: 14,
    length: 0,
    windowWidth: 0,
    orientation: 'left',//滚动方向
    marqueeInterval: 20 //时间间隔
  },
  showDevice: function(e){
    wx.navigateTo({
      url: '/pages/devices/show/show?id=' + e.currentTarget.dataset.id + '&code=' + e.currentTarget.dataset.code + '&name=' + e.currentTarget.dataset.name,
    });
  },
  connectBle: function(e){
    wx.navigateTo({
      url: '/pages/bluetooth/index/index?id=' + e.currentTarget.dataset.id + '&code=' + e.currentTarget.dataset.code + '&name=' + e.currentTarget.dataset.name,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.runMarquee();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    that.closeBleConnection()
    // 页面显示
    let length = that.data.textTips.length * that.data.size; //文字长度
    let windowWidth = wx.getSystemInfoSync().windowWidth; //屏幕宽度
    that.setData({
      marqueePace: 1,
      length: length,
      windowWidth: windowWidth
    });
  },

  closeBleConnection: function () {
    let that = this
    wx.closeBLEConnection({
      deviceId: wx.getStorageSync('connectedDeviceId'),
      success(res) {
        wx.showToast({
          title: '当前已经断开与云锁蓝牙的连接',
          icon: 'none',
          duration: 2000
        })
        wx.getStorageSync('connectedId', "")
        wx.getStorageSync('connectedDeviceId', "")
      }
    })
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
    this.setData({
      marqueeInterval: 20
    })
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

  imageLoad: function (e) {
    //获取图片真实宽度
    var imgwidth = e.detail.width,
    imgheight = e.detail.height,
    //宽高比
    ratio = imgwidth / imgheight;
    //计算的高度值
    var viewHeight = app.getWindowWidth() / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgHeights
    //把每一张图片的高度记录到数组里
    imgheights.push(imgheight)
    this.setData({
      imgHeights: imgheights
    })
  },

  imageChange: function (e) {
    this.setData({ current: e.detail.current})
  },

  runMarquee: function () {
    let that = this
    that.setData({
      marqueeDistance: 0
    })
    let marqueeInterval = setInterval(function () {
      if (-that.data.marqueeDistance < that.data.length - 100) {
        that.setData({
          marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
        });
      } else {
        clearInterval(marqueeInterval);
        that.setData({
          marqueeDistance: 0
        });
        that.runMarquee();
      }
    }, that.data.marqueeInterval);
  }
})