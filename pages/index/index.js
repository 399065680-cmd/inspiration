const { listItems, addItem } = require("../../utils/store");

const PLATFORM_INFO = {
  douyin: { emoji: "🎵", bg: "#1a1a2e" },
  xiaohongshu: { emoji: "📕", bg: "#fe2c55" },
  weibo: { emoji: "🌐", bg: "#e6162d" },
  taobao: { emoji: "🛍", bg: "#ff6034" },
  other: { emoji: "💡", bg: "#6c5ce7" }
};

function getPlatformInfo(platform) {
  return PLATFORM_INFO[platform] || PLATFORM_INFO.other;
}

function formatTime(ts) {
  if (!ts) return "";
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

Page({
  data: {
    list: [],
    quickInput: "",
    todayCount: 0,
    weekCount: 0
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const all = await listItems();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const weekStart = todayStart - ((new Date().getDay() || 7) - 1) * 86400000;
    const todayCount = all.filter((x) => x.createdAt >= todayStart).length;
    const weekCount = all.filter((x) => x.createdAt >= weekStart).length;
    const list = all.map((item) => {
      const pi = getPlatformInfo(item.sourcePlatform);
      return {
        ...item,
        platformEmoji: pi.emoji,
        platformBg: pi.bg,
        timeStr: formatTime(item.createdAt)
      };
    });
    this.setData({ list, todayCount, weekCount });
  },

  onQuickInput(e) {
    this.setData({ quickInput: e.detail.value });
  },

  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        if (res.data) this.setData({ quickInput: res.data });
      },
      fail: () => {
        wx.showToast({ title: "读取剪贴板失败", icon: "none" });
      }
    });
  },

  openVoice() {
    wx.showToast({ title: "语音功能即将上线", icon: "none" });
  },

  detectPlatform(url) {
    if (!url) return "other";
    const lower = url.toLowerCase();
    if (lower.includes("douyin.com") || lower.includes("iesdouyin.com")) return "douyin";
    if (lower.includes("xiaohongshu.com") || lower.includes("xhslink.com")) return "xiaohongshu";
    if (lower.includes("weibo.com")) return "weibo";
    if (lower.includes("taobao.com") || lower.includes("tmall.com")) return "taobao";
    return "other";
  },

  async parseByCloud(url) {
    const app = getApp();
    const env = app && app.globalData ? app.globalData.cloudEnv : "";
    if (!url || !wx.cloud || !env || env === "your-cloud-env-id") return null;
    try {
      const res = await wx.cloud.callFunction({ name: "parseLinkMeta", data: { url } });
      if (!res || !res.result || !res.result.success) return null;
      return res.result.data || null;
    } catch (e) {
      return null;
    }
  },

  async saveQuickItem() {
    const { quickInput } = this.data;
    if (!quickInput.trim()) {
      wx.showToast({ title: "请输入链接或想法", icon: "none" });
      return;
    }
    const isUrl = /^https?:\/\//i.test(quickInput.trim());
    const quickUrl = isUrl ? quickInput.trim() : "";
    const quickNotes = isUrl ? "" : quickInput.trim();
    let sourcePlatform = this.detectPlatform(quickUrl);
    let coverImage = "";
    let title = quickNotes ? quickNotes.slice(0, 20) : "链接灵感";

    wx.showLoading({ title: "保存中..." });
    const cloudParsed = await this.parseByCloud(quickUrl);
    if (cloudParsed) {
      sourcePlatform = cloudParsed.sourcePlatform || sourcePlatform;
      coverImage = cloudParsed.coverImage || coverImage;
      if (!quickNotes) title = cloudParsed.title || title;
    }
    await addItem({ title, sourceUrl: quickUrl, sourcePlatform, coverImage, notes: quickNotes, tags: [], status: "inbox" });
    wx.hideLoading();
    wx.showToast({ title: "已保存", icon: "success" });
    this.setData({ quickInput: "" });
    this.loadData();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  goCategory() {
    wx.navigateTo({ url: "/pages/category/category" });
  },

  goSearch() {
    wx.navigateTo({ url: "/pages/search/search" });
  },

  goProfile() {
    wx.navigateTo({ url: "/pages/profile/profile" });
  }
});
