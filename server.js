const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
// 从环境变量获取端口，默认为3000
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    // 添加安全相关的HTTP头
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "no-referrer");
    // 添加 HSTS 头，强制使用 HTTPS
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=86400; includeSubDomains" // 一天
    );

    // 更新CSP配置，允许必要的资源加载
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        // 允许内联样式和从安全源加载的样式
        "style-src 'self' 'unsafe-inline'",
        // 允许内联脚本和从安全源加载的脚本
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        // 允许图片加载
        "img-src 'self' data: https:",
        // 允许字体加载
        "font-src 'self' data:",
        // 允许连接到API
        "connect-src 'self' https:",
        // 允许加载frame
        "frame-src 'self'",
        // 允许加载worker
        "worker-src 'self' blob:",
        // 允许manifest
        "manifest-src 'self'",
      ].join("; ")
    );

    // 禁用缓存源码映射文件
    const url = parse(req.url, true);
    if (url.pathname.endsWith(".map")) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    handle(req, res, url);
  }).listen(port, (err) => {
    if (err) throw err;

    // 根据环境显示适当的URL
    if (process.env.NODE_ENV === "production") {
      // 使用环境变量中的域名或默认生产域名
      const prodDomain =
        process.env.NEXT_PUBLIC_APP_URL || "https://ws.shinyway.com";
      console.log(`> Ready on ${prodDomain} (PORT=${port})`);

      // 添加额外的生产环境启动日志，方便调试
      console.log(`> NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`> 服务器内部监听地址: http://localhost:${port}`);
    } else {
      console.log(`> Ready on http://localhost:${port}`);
    }
  });
});
