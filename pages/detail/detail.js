const { getItems, saveItems } = require("../../utils/store");

Page({
  data: {
    item: null,
    tagsInput: ""
  },

  onLoad(options) {
    this.id = options.id;
    this.loadItem();
  },

  loadItem() {
    const all = getItems();
    const item = all.find((x) => x.id === this.id);
    if (!item) {
      wx.showToast({ title: "记录不存在", icon: "none" });
      setTimeout(() => wx.navigateBack(), 400);
      return;
    }
    this.setData({ item, tagsInput: item.tags.join(",") });
  },

  onTitleInput(e) {
    this.updateField("title", e.detail.value);
  },

  onUrlInput(e) {
    const url = e.detail.value.trim();
    let sourcePlatform = "other";
    if (url.includes("douyin.com")) sourcePlatform = "douyin";
    if (url.includes("xiaohongshu.com")) sourcePlatform = "xiaohongshu";
    this.updateField("sourceUrl", url);
    this.updateField("sourcePlatform", sourcePlatform);
  },

  onNotesInput(e) {
    this.updateField("notes", e.detail.value);
  },

  onTagsInput(e) {
    this.setData({ tagsInput: e.detail.value });
  },

  updateField(key, value) {
    const item = { ...this.data.item, [key]: value };
    this.setData({ item });
  },

  setStatus(e) {
    this.updateField("status", e.currentTarget.dataset.value);
  },

  saveEdit() {
    const all = getItems();
    const idx = all.findIndex((x) => x.id === this.id);
    if (idx < 0) return;
    const tags = this.data.tagsInput
      .split(/[,\n，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    all[idx] = {
      ...this.data.item,
      tags,
      updatedAt: Date.now()
    };
    saveItems(all);
    wx.showToast({ title: "已更新", icon: "success" });
  },

  deleteItem() {
    wx.showModal({
      title: "确认删除",
      content: "删除后无法恢复，是否继续？",
      success: (res) => {
        if (!res.confirm) return;
        const all = getItems().filter((x) => x.id !== this.id);
        saveItems(all);
        wx.showToast({ title: "已删除", icon: "success" });
        setTimeout(() => wx.navigateBack(), 300);
      }
    });
  }
});
