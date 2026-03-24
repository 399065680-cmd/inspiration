const { listItems } = require("../../utils/store");

const PLATFORMS = [
  { key: "all", label: "全部" },
  { key: "douyin", label: "抖音" },
  { key: "xiaohongshu", label: "小红书" },
  { key: "weibo", label: "微博" },
  { key: "taobao", label: "淘宝" },
  { key: "other", label: "其他" }
];

const STATUSES = [
  { key: "all", label: "全部" },
  { key: "inbox", label: "收集箱" },
  { key: "todo", label: "待执行" },
  { key: "done", label: "已完成" }
];

Page({
  data: {
    platforms: PLATFORMS,
    statuses: STATUSES,
    platformFilter: "all",
    statusFilter: "all",
    list: [],
    allItems: []
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const all = await listItems();
    this.setData({ allItems: all });
    this.applyFilter();
  },

  applyFilter() {
    const { allItems, platformFilter, statusFilter } = this.data;
    const list = allItems.filter((item) => {
      const p = platformFilter === "all" || item.sourcePlatform === platformFilter;
      const s = statusFilter === "all" || item.status === statusFilter;
      return p && s;
    });
    this.setData({ list });
  },

  onPlatformTap(e) {
    this.setData({ platformFilter: e.currentTarget.dataset.key });
    this.applyFilter();
  },

  onStatusTap(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.key });
    this.applyFilter();
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  goHome() { wx.switchTab ? wx.switchTab({ url: "/pages/index/index" }) : wx.navigateBack(); },
  goSearch() { wx.navigateTo({ url: "/pages/search/search" }); },
  goProfile() { wx.navigateTo({ url: "/pages/profile/profile" }); }
});
