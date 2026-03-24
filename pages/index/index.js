const { getItems } = require("../../utils/store");

Page({
  data: {
    list: [],
    keyword: "",
    platformFilter: "all",
    statusFilter: "all"
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const all = getItems().sort((a, b) => b.updatedAt - a.updatedAt);
    const { keyword, platformFilter, statusFilter } = this.data;
    const filtered = all.filter((item) => {
      const textMatched =
        !keyword ||
        item.title.includes(keyword) ||
        item.notes.includes(keyword) ||
        item.tags.join(",").includes(keyword);
      const platformMatched =
        platformFilter === "all" || item.sourcePlatform === platformFilter;
      const statusMatched = statusFilter === "all" || item.status === statusFilter;
      return textMatched && platformMatched && statusMatched;
    });
    this.setData({ list: filtered });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value.trim() });
    this.loadData();
  },

  onPlatformChange(e) {
    this.setData({ platformFilter: e.currentTarget.dataset.value });
    this.loadData();
  },

  onStatusChange(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.value });
    this.loadData();
  },

  goCreate() {
    wx.navigateTo({ url: "/pages/create/create" });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  }
});
