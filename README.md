# 灵感收集器（微信小程序）

一个用于记录抖音、小红书等平台灵感的小程序 MVP。

## 当前功能

- 链接/文字快速记录灵感
- 自动识别来源平台（抖音、小红书、其他）
- 标签记录（逗号分隔）
- 状态流转（收集箱、待执行、已完成）
- 搜索与筛选（关键词、平台、状态）
- 云开发同步（云端优先，本地兜底）

## 本地运行

1. 打开微信开发者工具
2. 导入本项目目录
3. `AppID` 可先使用测试号（或在 `project.config.json` 替换为你自己的）
4. 直接编译运行

## 开启云开发同步

1. 在微信开发者工具中开通云开发环境，拿到环境 ID
2. 打开 `app.js`，把 `cloudEnv` 改成你的环境 ID
3. 在云数据库创建集合：`inspirations`
4. 集合权限建议先设为“仅创建者可读写”
5. 重新编译后，新增/编辑/删除会自动同步到云端

## 开启真实链接解析（标题/封面）

1. 在微信开发者工具中右键上传并部署云函数：`cloudfunctions/parseLinkMeta`
2. 云函数环境变量中按需配置：
   - `PARSE_API_URL`：你自己的解析接口地址（POST）
   - `PARSE_API_TOKEN`：解析接口鉴权 token（可选）
3. 解析接口返回 JSON 示例：

```json
{
  "title": "视频标题",
  "sourcePlatform": "douyin",
  "coverImage": "https://example.com/cover.jpg"
}
```

4. 前端保存时会先调用云函数拿真实解析数据；若解析失败，自动回退本地兜底，不影响记录流程

## 同步到 GitHub

在项目目录执行：

```bash
git init
git add .
git commit -m "feat: 初始化灵感收集器微信小程序 MVP"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

## 下一步建议

- 增加微信分享导入能力
- 做 AI 自动标签与摘要
