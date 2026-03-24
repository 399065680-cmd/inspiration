const STORAGE_KEY = "inspiration_items_v1";

function getItems() {
  const raw = wx.getStorageSync(STORAGE_KEY);
  if (!raw) return [];
  return raw;
}

function saveItems(items) {
  wx.setStorageSync(STORAGE_KEY, items);
}

function isCloudReady() {
  const app = getApp ? getApp() : null;
  const env = app && app.globalData ? app.globalData.cloudEnv : "";
  return Boolean(wx.cloud && env && env !== "your-cloud-env-id");
}

function normalizeCloudItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title || "未命名灵感",
    sourcePlatform: item.sourcePlatform || "other",
    sourceUrl: item.sourceUrl || "",
    coverImage: item.coverImage || "",
    notes: item.notes || "",
    tags: item.tags || [],
    status: item.status || "inbox",
    createdAt: item.createdAt || Date.now(),
    updatedAt: item.updatedAt || Date.now()
  };
}

function createItem(data) {
  const now = Date.now();
  return {
    id: String(now),
    title: data.title || (data.notes ? data.notes.slice(0, 18) : "未命名灵感"),
    sourcePlatform: data.sourcePlatform || "other",
    sourceUrl: data.sourceUrl || "",
    coverImage: data.coverImage || "",
    notes: data.notes || "",
    tags: data.tags || [],
    status: data.status || "inbox",
    createdAt: now,
    updatedAt: now
  };
}

async function listItems() {
  if (!isCloudReady()) {
    return getItems().sort((a, b) => b.updatedAt - a.updatedAt);
  }
  try {
    const db = wx.cloud.database();
    const res = await db.collection("inspirations").orderBy("updatedAt", "desc").get();
    const list = (res.data || []).map(normalizeCloudItem);
    saveItems(list);
    return list;
  } catch (e) {
    return getItems().sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

async function addItem(data) {
  const item = createItem(data);
  if (!isCloudReady()) {
    const all = getItems();
    all.push(item);
    saveItems(all);
    return item;
  }
  try {
    const db = wx.cloud.database();
    await db.collection("inspirations").add({ data: item });
    const latest = await listItems();
    return latest.find((x) => x.id === item.id) || item;
  } catch (e) {
    const all = getItems();
    all.push(item);
    saveItems(all);
    return item;
  }
}

async function getItemById(id) {
  if (!isCloudReady()) {
    return getItems().find((x) => x.id === id) || null;
  }
  try {
    const db = wx.cloud.database();
    const res = await db.collection("inspirations").where({ id }).limit(1).get();
    const item = normalizeCloudItem((res.data || [])[0]);
    return item || null;
  } catch (e) {
    return getItems().find((x) => x.id === id) || null;
  }
}

async function updateItem(id, patch) {
  const updated = {
    ...patch,
    updatedAt: Date.now()
  };
  if (!isCloudReady()) {
    const all = getItems();
    const idx = all.findIndex((x) => x.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], ...updated };
    saveItems(all);
    return all[idx];
  }
  try {
    const db = wx.cloud.database();
    await db.collection("inspirations").where({ id }).update({ data: updated });
    return await getItemById(id);
  } catch (e) {
    const all = getItems();
    const idx = all.findIndex((x) => x.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], ...updated };
    saveItems(all);
    return all[idx];
  }
}

async function removeItem(id) {
  if (!isCloudReady()) {
    const all = getItems().filter((x) => x.id !== id);
    saveItems(all);
    return true;
  }
  try {
    const db = wx.cloud.database();
    await db.collection("inspirations").where({ id }).remove();
    const local = getItems().filter((x) => x.id !== id);
    saveItems(local);
    return true;
  } catch (e) {
    const all = getItems().filter((x) => x.id !== id);
    saveItems(all);
    return true;
  }
}

module.exports = {
  getItems,
  saveItems,
  createItem,
  listItems,
  addItem,
  getItemById,
  updateItem,
  removeItem
};
