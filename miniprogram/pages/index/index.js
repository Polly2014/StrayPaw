// pages/index/index.js

Page({
  _searchTimer: null,
  data: {
    animals: [],
    filteredAnimals: [],
    searchText: '',
    currentFilter: 'all',
    loading: false,
    page: 1,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadAnimals()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadAnimals().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  async loadAnimals() {
    this.setData({ loading: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getAnimals',
        data: { page: 1, pageSize: 20 }
      })
      const { data, hasMore } = res.result

      this.setData({
        animals: data || [],
        filteredAnimals: this.applyFilters(data || [], this.data.currentFilter, this.data.searchText),
        loading: false,
        page: 1,
        hasMore: hasMore !== false
      })
    } catch (err) {
      console.error('加载动物列表失败', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async loadMore() {
    this.setData({ loadingMore: true })
    const nextPage = this.data.page + 1

    try {
      const res = await wx.cloud.callFunction({
        name: 'getAnimals',
        data: { page: nextPage, pageSize: 20 }
      })
      const { data, hasMore } = res.result
      const allAnimals = [...this.data.animals, ...(data || [])]

      this.setData({
        animals: allAnimals,
        filteredAnimals: this.applyFilters(allAnimals, this.data.currentFilter, this.data.searchText),
        page: nextPage,
        hasMore: hasMore !== false,
        loadingMore: false
      })
    } catch (err) {
      console.error('加载更多失败', err)
      this.setData({ loadingMore: false })
    }
  },

  onSearchInput(e) {
    const searchText = e.detail.value
    // 防抖 300ms
    if (this._searchTimer) clearTimeout(this._searchTimer)
    this._searchTimer = setTimeout(() => {
      this.setData({
        searchText,
        filteredAnimals: this.applyFilters(this.data.animals, this.data.currentFilter, searchText)
      })
    }, 300)
  },

  onFilter(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentFilter: type,
      filteredAnimals: this.applyFilters(this.data.animals, type, this.data.searchText)
    })
  },

  applyFilters(animals, filter, search) {
    let result = animals

    // 按种类筛选
    if (filter !== 'all') {
      result = result.filter(a => a.species === filter)
    }

    // 按关键字搜索
    if (search) {
      const keyword = search.toLowerCase()
      result = result.filter(a =>
        (a.name || '').toLowerCase().includes(keyword) ||
        (a.breed || '').toLowerCase().includes(keyword) ||
        (a.description || '').toLowerCase().includes(keyword)
      )
    }

    return result
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  onShareAppMessage() {
    return {
      title: '流浪动物救助 — 领养代替购买 🐾',
      path: '/pages/index/index'
    }
  },

  onShareTimeline() {
    return {
      title: '流浪动物救助 — 领养代替购买 🐾'
    }
  }
})
