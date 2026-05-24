// pages/detail/detail.js

Page({
  data: {
    animal: {}
  },

  onLoad(options) {
    const { id } = options
    this.loadAnimal(id)
  },

  async loadAnimal(id) {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('animals').doc(id).get()
      const animal = res.data

      if (!animal) {
        wx.showToast({ title: '动物信息不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      this.setData({ animal })
      wx.setNavigationBarTitle({ title: animal.name || '动物详情' })
    } catch (err) {
      console.error('加载详情失败', err)
      wx.showToast({ title: '该动物信息不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  previewPhoto(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.animal.photos || []
    })
  },

  goAdopt() {
    wx.navigateTo({
      url: `/pages/adopt/adopt?id=${this.data.animal._id}&name=${this.data.animal.name}`
    })
  },

  onShareAppMessage() {
    const { animal } = this.data
    return {
      title: `${animal.name}在等一个家 🐾`,
      path: `/pages/detail/detail?id=${animal._id}`
    }
  },

  onShareTimeline() {
    const { animal } = this.data
    return {
      title: `${animal.name}在等一个家 🐾`,
      query: `id=${animal._id}`
    }
  }
})
