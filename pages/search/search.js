const { listItems } = require("../../utils/store");

Page({
  data: { keyword: "", list: [], allItems: [] },

  onShow() {
    this.loadAll();
  },

  async loadAll() {
    const all = await listItems();
    this.setData({ allItems: all });
  },

  onKeywordInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ keyword });
    this.search(keyword);
  },

  search(keyword) {
    if (!keyword) { this.setData({ list: [] }); return; }
    const lower = keyword.toLowerCase();
    const list = this.data.allItems.filter((item) =>
      item.title.toLowerCase().includes(lower) ||
      (item.notes || "").toLowerCase().includes(lower) ||
      (item.sourceUrl || "").toLowerCase().includes(lower) ||
      (item.tags || []).join(",").toLowerCase().includes(lower)
    );
    this.setData({ list });
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  goHome() { wx.navigateBack(); },
  goCategory() { wx.navigateTo({ url: "/pages/category/category" }); },
  goProfile() { wx.navigateTo({ url: "/pages/profile/profile" }); }
});
