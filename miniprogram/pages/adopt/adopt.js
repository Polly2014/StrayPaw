// pages/adopt/adopt.js

Page({
  data: {
    animalId: '',
    animalName: '',
    submitting: false,
    agreed: false,
    housingOptions: ['自有住房', '租房（允许养宠）', '租房（未确认）', '与父母同住', '宿舍/合租'],
    form: {
      name: '',
      phone: '',
      wechat: '',
      age: '',
      housing: '',
      housingIndex: -1,
      hasPetExp: null,
      familyAgree: null,
      reason: ''
    }
  },

  onLoad(options) {
    this.setData({
      animalId: options.id || '',
      animalName: options.name || ''
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onHousingChange(e) {
    const index = e.detail.value
    this.setData({
      'form.housingIndex': index,
      'form.housing': this.data.housingOptions[index]
    })
  },

  onPetExp(e) {
    this.setData({
      'form.hasPetExp': e.currentTarget.dataset.value === 'true'
    })
  },

  onFamilyAgree(e) {
    this.setData({
      'form.familyAgree': e.currentTarget.dataset.value === 'true'
    })
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  goAgreement() {
    wx.navigateTo({ url: '/pages/agreement/agreement' })
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' })
  },

  validate() {
    const { form } = this.data

    if (!form.name.trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' })
      return false
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      wx.showToast({ title: '请填写正确的手机号', icon: 'none' })
      return false
    }
    if (!form.age || parseInt(form.age) < 18) {
      wx.showToast({ title: '需年满18周岁', icon: 'none' })
      return false
    }
    if (!form.housing) {
      wx.showToast({ title: '请选择居住情况', icon: 'none' })
      return false
    }
    if (form.hasPetExp === null) {
      wx.showToast({ title: '请选择是否养过宠物', icon: 'none' })
      return false
    }
    if (form.familyAgree === null) {
      wx.showToast({ title: '请确认家人是否同意', icon: 'none' })
      return false
    }
    if (!form.reason.trim() || form.reason.trim().length < 10) {
      wx.showToast({ title: '领养理由至少10个字', icon: 'none' })
      return false
    }
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意用户协议和隐私指引', icon: 'none' })
      return false
    }

    return true
  },

  async onSubmit() {
    if (!this.validate()) return

    this.setData({ submitting: true })

    try {
      const { form, animalId, animalName } = this.data

      const res = await wx.cloud.callFunction({
        name: 'submitAdopt',
        data: { animalId, animalName, ...form }
      })
      if (res.result.code !== 0) throw new Error(res.result.message)

      wx.showModal({
        title: '提交成功 🎉',
        content: `您对「${animalName}」的领养申请已提交，工作人员会在3个工作日内联系您。`,
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    } catch (err) {
      console.error('提交领养申请失败', err)
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
