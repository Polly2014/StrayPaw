// pages/about/about.js

Page({
  data: {
    stats: {
      rescued: '-',
      adopted: '-',
      volunteers: 35
    },
    contactWechat: 'straypaw_rescue',
    contactPhone: '待填写'
  },

  onShow() {
    this.loadStats()
  },

  async loadStats() {
    try {
      const db = wx.cloud.database()
      const [totalRes, adoptedRes] = await Promise.all([
        db.collection('animals').count(),
        db.collection('animals').where({ status: 'adopted' }).count()
      ])
      this.setData({
        'stats.rescued': totalRes.total,
        'stats.adopted': adoptedRes.total
      })
    } catch (err) {
      console.error('加载统计失败', err)
    }
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' })
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' })
  },

  goAgreement() {
    wx.navigateTo({ url: '/pages/agreement/agreement' })
  },

  copyWechat() {
    wx.setClipboardData({
      data: this.data.contactWechat,
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' })
      }
    })
  },

  makeCall() {
    if (this.data.contactPhone === '待填写') {
      wx.showToast({ title: '电话号码待补充', icon: 'none' })
      return
    }
    wx.makePhoneCall({
      phoneNumber: this.data.contactPhone
    })
  },

  onShareAppMessage() {
    return {
      title: '流浪动物救助 - 每一个生命都值得被温柔以待 🐾',
      path: '/pages/about/about'
    }
  },

  onShareTimeline() {
    return {
      title: '流浪动物救助 - 每一个生命都值得被温柔以待 🐾'
    }
  }
})
