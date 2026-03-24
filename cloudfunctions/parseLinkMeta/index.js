const cloud = require("wx-server-sdk");
const https = require("https");
const http = require("http");
const { URL } = require("url");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function detectPlatform(url) {
  const lower = (url || "").toLowerCase();
  if (lower.includes("douyin.com")) return "douyin";
  if (lower.includes("xiaohongshu.com")) return "xiaohongshu";
  return "other";
}

function fallbackResult(url) {
  const platform = detectPlatform(url);
  return {
    title: "链接灵感",
    sourcePlatform: platform,
    coverImage: ""
  };
}

// 可在云函数环境变量中配置 PARSE_API_URL / PARSE_API_TOKEN
async function callParserApi(url) {
  const apiUrl = process.env.PARSE_API_URL;
  const token = process.env.PARSE_API_TOKEN || "";
  if (!apiUrl) return null;

  const header = { "content-type": "application/json" };
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  const data = await postJson(apiUrl, { url }, header);
  if (!data || (!data.coverImage && !data.title)) return null;
  return {
    title: data.title || "链接灵感",
    sourcePlatform: data.sourcePlatform || detectPlatform(url),
    coverImage: data.coverImage || ""
  };
}

function postJson(targetUrl, body, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const payload = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: `${parsed.pathname}${parsed.search}`,
      method: "POST",
      headers: {
        ...headers,
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const requestFn = parsed.protocol === "https:" ? https.request : http.request;
    const req = requestFn(options, (res) => {
      let chunks = "";
      res.on("data", (chunk) => {
        chunks += chunk;
      });
      res.on("end", () => {
        try {
          resolve(chunks ? JSON.parse(chunks) : {});
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

exports.main = async (event) => {
  const url = (event && event.url ? String(event.url) : "").trim();
  if (!url) {
    return {
      success: false,
      message: "url is required"
    };
  }

  try {
    const parsed = await callParserApi(url);
    return {
      success: true,
      data: parsed || fallbackResult(url)
    };
  } catch (e) {
    return {
      success: true,
      data: fallbackResult(url),
      debug: e.message || "parse failed"
    };
  }
};
