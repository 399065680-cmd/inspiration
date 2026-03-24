const { getItems } = require("../../utils/store");

Page({
  data: { totalCount: 0, inboxCount: 0, todoCount: 0, doneCount: 0 },

  onShow() {
    const all = getItems();
    this.setData({
      totalCount: all.length,
      inboxCount: all.filter((x) => x.status === "inbox").length,
      todoCount: all.filter((x) => x.status === "todo").length,
      doneCount: all.filter((x) => x.status === "done").length
    });
  },

  goHome() { wx.navigateBack(); },
  goCategory() { wx.navigateTo({ url: "/pages/category/category" }); },
  goSearch() { wx.navigateTo({ url: "/pages/search/search" }); }
});
