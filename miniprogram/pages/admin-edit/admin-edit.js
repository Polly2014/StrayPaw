// pages/admin-edit/admin-edit.js
Page({
  data: {
    isEdit: false,
    animalId: '',
    submitting: false,
    photos: [], // 临时本地路径或云存储 fileID
    tagOptions: ['温顺', '活泼', '粘人', '独立', '胆小', '好奇', '安静', '爱呼噜', '亲人', '聪明', '调皮', '乖巧'],
    form: {
      name: '',
      species: 'cat',
      breed: '',
      gender: 'male',
      birthday: '',
      weight: '',
      height: '',
      neckCirc: '',
      chestCirc: '',
      specialNote: '',
      status: 'available',
      tags: [],
      neutered: false,
      neuteredDate: '',
      vaccinated: false,
      vaccinatedDate: '',
      dewormed: false,
      dewormedDate: '',
      description: '',
      personality: '',
      healthNote: '',
      rescueStory: ''
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, animalId: options.id })
      wx.setNavigationBarTitle({ title: '编辑动物' })
      this.loadAnimal(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '添加动物' })
    }
  },

  async loadAnimal(id) {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('animals').doc(id).get()
      const animal = res.data
      this.setData({
        form: {
          name: animal.name || '',
          species: animal.species || 'cat',
          breed: animal.breed || '',
          gender: animal.gender || 'male',
          birthday: animal.birthday || '',
          weight: animal.weight || '',
          height: animal.height || '',
          neckCirc: animal.neckCirc || '',
          chestCirc: animal.chestCirc || '',
          specialNote: animal.specialNote || '',
          status: animal.status || 'available',
          tags: animal.tags || [],
          neutered: animal.neutered || false,
          neuteredDate: animal.neuteredDate || '',
          vaccinated: animal.vaccinated || false,
          vaccinatedDate: animal.vaccinatedDate || '',
          dewormed: animal.dewormed || false,
          dewormedDate: animal.dewormedDate || '',
          description: animal.description || '',
          personality: animal.personality || '',
          healthNote: animal.healthNote || '',
          rescueStory: animal.rescueStory || ''
        },
        photos: animal.photos || (animal.photo ? [animal.photo] : [])
      })
    } catch (err) {
      console.error('加载动物信息失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onRadio(e) {
    const { field, value } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: value })
  },

  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onToggle(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: !this.data.form[field] })
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    const tags = [...this.data.form.tags]
    const index = tags.indexOf(tag)
    if (index > -1) {
      tags.splice(index, 1)
    } else {
      tags.push(tag)
    }
    this.setData({ 'form.tags': tags })
  },

  // 选择照片
  choosePhoto() {
    wx.chooseMedia({
      count: 6 - this.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = res.tempFiles.map(f => f.tempFilePath)
        this.setData({
          photos: [...this.data.photos, ...newPhotos]
        })
      }
    })
  },

  removePhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
  },

  // 上传照片到云存储（单张失败重试一次）
  async uploadPhotos() {
    const uploaded = []
    for (const photo of this.data.photos) {
      if (photo.startsWith('cloud://')) {
        uploaded.push(photo)
      } else {
        const ext = photo.split('.').pop() || 'jpg'
        const cloudPath = `animals/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
        try {
          const res = await wx.cloud.uploadFile({ cloudPath, filePath: photo })
          uploaded.push(res.fileID)
        } catch (err) {
          console.warn('照片上传失败，重试中...', err)
          try {
            const retryPath = `animals/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
            const res = await wx.cloud.uploadFile({ cloudPath: retryPath, filePath: photo })
            uploaded.push(res.fileID)
          } catch (retryErr) {
            console.error('照片上传重试失败，跳过', retryErr)
            wx.showToast({ title: '部分照片上传失败', icon: 'none' })
          }
        }
      }
    }
    return uploaded
  },

  validate() {
    const { form } = this.data
    if (!form.name.trim()) {
      wx.showToast({ title: '请填写名字', icon: 'none' })
      return false
    }
    if (!form.breed.trim()) {
      wx.showToast({ title: '请填写品种', icon: 'none' })
      return false
    }
    return true
  },

  async onSubmit() {
    if (!this.validate()) return
    this.setData({ submitting: true })

    try {
      // 上传照片
      wx.showLoading({ title: '上传照片中...' })
      const photoFileIDs = await this.uploadPhotos()
      wx.hideLoading()

      const animalData = {
        ...this.data.form,
        photo: photoFileIDs[0] || '',
        photos: photoFileIDs
      }

      if (this.data.isEdit) {
        // 编辑模式：photo 和 photos 保持一致
        if (photoFileIDs.length === 0) {
          animalData.photo = ''
          animalData.photos = []
        }
        animalData.id = this.data.animalId
        await wx.cloud.callFunction({
          name: 'adminManage',
          data: { action: 'updateAnimal', data: animalData }
        })
        wx.showToast({ title: '修改成功', icon: 'success' })
      } else {
        // 新增模式：清理空字符串字段
        Object.keys(animalData).forEach(key => {
          if (animalData[key] === '') delete animalData[key]
        })
        await wx.cloud.callFunction({
          name: 'adminManage',
          data: { action: 'addAnimal', data: animalData }
        })
        wx.showToast({ title: '添加成功', icon: 'success' })
      }

      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      console.error('保存失败', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
