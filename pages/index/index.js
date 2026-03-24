const { listItems, addItem } = require("../../utils/store");

Page({
  data: {
    list: [],
    keyword: "",
    platformFilter: "all",
    statusFilter: "all",
    showQuickCreate: false,
    quickUrl: "",
    quickNotes: ""
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const all = await listItems();
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

  openQuickCreate() {
    this.setData({
      showQuickCreate: true,
      quickUrl: "",
      quickNotes: ""
    });
  },

  closeQuickCreate() {
    this.setData({ showQuickCreate: false });
  },

  onQuickUrlInput(e) {
    this.setData({ quickUrl: e.detail.value.trim() });
  },

  onQuickNotesInput(e) {
    this.setData({ quickNotes: e.detail.value });
  },

  detectPlatform(url) {
    if (!url) return "other";
    const lower = url.toLowerCase();
    if (lower.includes("douyin.com")) return "douyin";
    if (lower.includes("xiaohongshu.com")) return "xiaohongshu";
    return "other";
  },

  guessCoverImage(url, platform) {
    const lower = (url || "").toLowerCase();
    if (/\.(png|jpg|jpeg|webp|gif)(\?.*)?$/.test(lower)) {
      return url;
    }
    if (platform === "douyin") {
      return "https://p9-pc-sign.douyinpic.com/tos-cn-i-0813/93f1cbf53f6845728a7f8d357f3f2207~tplv-dy-resize-walign-adapt-aq:540:q75.webp";
    }
    if (platform === "xiaohongshu") {
      return "https://fe-static.xhscdn.com/fedos/small-app-web/public/home.7b6dc09c.png";
    }
    return "";
  },

  async parseByCloud(url) {
    const app = getApp();
    const env = app && app.globalData ? app.globalData.cloudEnv : "";
    if (!url || !wx.cloud || !env || env === "your-cloud-env-id") {
      return null;
    }
    try {
      const res = await wx.cloud.callFunction({
        name: "parseLinkMeta",
        data: { url }
      });
      if (!res || !res.result || !res.result.success) {
        return null;
      }
      return res.result.data || null;
    } catch (e) {
      return null;
    }
  },

  async saveQuickItem() {
    const { quickUrl, quickNotes } = this.data;
    if (!quickUrl && !quickNotes) {
      wx.showToast({ title: "请填链接或想法", icon: "none" });
      return;
    }
    let sourcePlatform = this.detectPlatform(quickUrl);
    let coverImage = this.guessCoverImage(quickUrl, sourcePlatform);
    let title = quickNotes ? quickNotes.slice(0, 18) : "链接灵感";

    const cloudParsed = await this.parseByCloud(quickUrl);
    if (cloudParsed) {
      sourcePlatform = cloudParsed.sourcePlatform || sourcePlatform;
      coverImage = cloudParsed.coverImage || coverImage;
      if (!quickNotes) {
        title = cloudParsed.title || title;
      }
    }

    await addItem({
      title,
      sourceUrl: quickUrl,
      sourcePlatform,
      coverImage,
      notes: quickNotes,
      tags: [],
      status: "inbox"
    });
    wx.showToast({ title: "已保存", icon: "success" });
    this.closeQuickCreate();
    this.loadData();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  }
});
