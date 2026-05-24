// pages/admin/admin.js
Page({
  data: {
    isAdmin: false,
    checked: false,
    openid: '',
    currentTab: 'animals',
    animals: [],
    animalTotal: 0,
    adoptions: [],
    adoptionFilter: 'pending',
    pendingCount: 0
  },

  onLoad() {
    this.checkAdmin()
  },

  onShow() {
    if (this.data.isAdmin) {
      this.loadData()
    }
  },

  async checkAdmin() {
    try {
      const res = await wx.cloud.callFunction({ name: 'adminCheck' })
      const { isAdmin, openid } = res.result
      this.setData({ isAdmin, openid, checked: true })
      if (isAdmin) {
        this.loadData()
        this.requestSubscribe()
      }
    } catch (err) {
      console.error('鉴权失败', err)
      this.setData({ checked: true })
    }
  },

  requestSubscribe() {
    const tmplId = 'oj9vcvtZSF4I52v9YWOoHfPQ8CAlM85IFN2rFXv1N04'
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success(res) {
        console.log('订阅结果:', res[tmplId])
      },
      fail(err) {
        console.warn('订阅消息请求失败:', err)
      }
    })
  },

  async loadData() {
    await Promise.all([
      this.loadAnimals(),
      this.loadAdoptions()
    ])
  },

  async loadAnimals() {
    try {
      const res = await wx.cloud.callFunction({ name: 'getAnimals', data: { pageSize: 100 } })
      const { data, total } = res.result
      this.setData({ animals: data || [], animalTotal: total || 0 })
    } catch (err) {
      console.error('加载动物列表失败', err)
    }
  },

  async loadAdoptions() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'adminManage',
        data: {
          action: 'getAdoptions',
          data: { status: this.data.adoptionFilter || undefined, pageSize: 100 }
        }
      })
      const { data, total } = res.result
      this.setData({ adoptions: data || [] })

      // 获取待审核数量
      if (this.data.adoptionFilter !== 'pending') {
        const pendingRes = await wx.cloud.callFunction({
          name: 'adminManage',
          data: { action: 'getAdoptions', data: { status: 'pending' } }
        })
        this.setData({ pendingCount: pendingRes.result.total || 0 })
      } else {
        this.setData({ pendingCount: total || 0 })
      }
    } catch (err) {
      console.error('加载领养申请失败', err)
    }
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab })
  },

  // ===== 动物管理 =====
  addAnimal() {
    wx.navigateTo({ url: '/pages/admin-edit/admin-edit' })
  },

  editAnimal(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/admin-edit/admin-edit?id=${id}` })
  },

  deleteAnimal(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${name}」吗？此操作不可恢复。`,
      confirmColor: '#ff4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'adminManage',
              data: { action: 'deleteAnimal', data: { id } }
            })
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadAnimals()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // ===== 领养审核 =====
  filterAdoptions(e) {
    this.setData({ adoptionFilter: e.currentTarget.dataset.status })
    this.loadAdoptions()
  },

  viewAdoption(e) {
    const adoption = this.data.adoptions[e.currentTarget.dataset.index]
    const info = adoption.applicant
    wx.showModal({
      title: `${info.name} 的申请详情`,
      content: `申请领养：${adoption.animalName}\n姓名：${info.name}\n电话：${info.phone}\n微信：${info.wechat || '未填'}\n年龄：${info.age}\n居住：${info.housing}\n宠物经验：${info.hasPetExp ? '有' : '无'}\n家人同意：${info.familyAgree ? '是' : '否'}\n\n理由：${adoption.reason}`,
      showCancel: false
    })
  },

  approveAdoption(e) {
    const { id, name, animal } = e.currentTarget.dataset
    wx.showModal({
      title: '通过申请',
      content: `确认通过「${name}」对「${animal}」的领养申请？\n该动物状态将变为"已领养"。`,
      success: async (res) => {
        if (res.confirm) {
          await this.reviewAdoption(id, 'approved')
        }
      }
    })
  },

  rejectAdoption(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '拒绝申请',
      content: `确认拒绝「${name}」的领养申请？`,
      confirmColor: '#ff4444',
      success: async (res) => {
        if (res.confirm) {
          await this.reviewAdoption(id, 'rejected')
        }
      }
    })
  },

  async reviewAdoption(id, status) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'adminManage',
        data: { action: 'reviewAdoption', data: { id, status } }
      })
      if (res.result.code === 0) {
        wx.showToast({ title: res.result.message, icon: 'success' })
        this.loadAdoptions()
        this.loadAnimals()
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' })
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  copyOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => wx.showToast({ title: 'OpenID 已复制', icon: 'success' })
    })
  }
})
