const STORAGE_KEY = "inspiration_items_v1";

function getItems() {
  const raw = wx.getStorageSync(STORAGE_KEY);
  if (!raw) return [];
  return raw;
}

function saveItems(items) {
  wx.setStorageSync(STORAGE_KEY, items);
}

function createItem(data) {
  const now = Date.now();
  return {
    id: String(now),
    title: data.title || "未命名灵感",
    sourcePlatform: data.sourcePlatform || "other",
    sourceUrl: data.sourceUrl || "",
    notes: data.notes || "",
    tags: data.tags || [],
    status: data.status || "inbox",
    createdAt: now,
    updatedAt: now
  };
}

module.exports = {
  getItems,
  saveItems,
  createItem
};
