App({
  globalData: {
    appName: "灵感收集器",
    // 替换成你自己的云开发环境 ID，例如: cloud1-xxxxx
    cloudEnv: "your-cloud-env-id"
  },

  onLaunch() {
    if (!wx.cloud) {
      return;
    }
    const env = this.globalData.cloudEnv;
    if (!env || env === "your-cloud-env-id") {
      return;
    }
    wx.cloud.init({
      env,
      traceUser: true
    });
  }
});
