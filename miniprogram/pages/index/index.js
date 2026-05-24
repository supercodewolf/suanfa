const { categories } = require('../../data/algorithmMeta');

Page({
  data: {
    categories: []
  },

  onLoad() {
    // 初始化并默认全部展开
    const cats = categories.map(cat => ({ ...cat, expanded: true }));
    this.setData({ categories: cats });
  },

  // 折叠/展开分类
  toggleCategory(e) {
    const { id } = e.currentTarget.dataset;
    const cats = this.data.categories.map(cat => {
      if (cat.id === id) {
        return { ...cat, expanded: !cat.expanded };
      }
      return cat;
    });
    this.setData({ categories: cats });
  },

  // 跳转详情页
  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});
