const { addItem } = require("../../utils/store");

Page({
  data: {
    title: "",
    sourceUrl: "",
    sourcePlatform: "other",
    notes: "",
    tagsInput: ""
  },

  onUrlInput(e) {
    const url = e.detail.value.trim();
    let sourcePlatform = "other";
    if (url.includes("douyin.com")) sourcePlatform = "douyin";
    if (url.includes("xiaohongshu.com")) sourcePlatform = "xiaohongshu";
    this.setData({ sourceUrl: url, sourcePlatform });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  onTagsInput(e) {
    this.setData({ tagsInput: e.detail.value });
  },

  async saveAs(status) {
    const { title, sourceUrl, sourcePlatform, notes, tagsInput } = this.data;
    const tags = tagsInput
      .split(/[,\n，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    await addItem({ title, sourceUrl, sourcePlatform, notes, tags, status });
    wx.showToast({ title: "已保存并同步", icon: "success" });
    setTimeout(() => wx.navigateBack(), 300);
  },

  saveInbox() {
    this.saveAs("inbox");
  },

  saveTodo() {
    this.saveAs("todo");
  }
});
