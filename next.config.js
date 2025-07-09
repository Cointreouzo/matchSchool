/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // 禁用生产环境的源码映射
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/7.x/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "ezbxmlqgfrkeymlstool.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 添加以下配置排除 .archive 目录
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  experimental: {
    // 确保启用类型化路由
    typedRoutes: false,
  },
  // 将 outputFileTracingExcludes 移到顶层配置中
  outputFileTracingExcludes: {
    "*": [".archive/**/*", "src/app/api/pdf-thumbnail/**/*"],
  },
  // 添加路由忽略规则
  transpilePackages: [],
  // 添加选项来防止重复路由
  onDemandEntries: {
    // 缓存页面的时间（以毫秒为单位）
    maxInactiveAge: 60 * 60 * 1000,
    // 同时保持活动的页面数量
    pagesBufferLength: 5,
  },
  // 确保API请求不会自动附加外部域名
  assetPrefix: "",
  basePath: "",
  // 添加 webpack 配置来处理服务端模块和正则表达式兼容性
  webpack: (config, { isServer }) => {
    // 只在客户端构建时排除服务端日志模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
      };

      // 排除服务端日志器模块
      config.externals = config.externals || [];
      config.externals.push({
        "./logger-server": "commonjs ./logger-server",
        winston: "commonjs winston",
        "winston-daily-rotate-file": "commonjs winston-daily-rotate-file",
      });
    }

    return config;
  },
  // 添加重写规则，使用内部API路由而不是重定向
  rewrites: async () => {
    return [
      // 移除外部代理，使用内部API路由
      // 确保只有一条控制台路由
      {
        source: "/:path*",
        destination: "/:path*",
        has: [
          {
            type: "header",
            key: "x-next-cache-tag",
            value: "rewrite-test",
          },
        ],
      },
    ];
  },
  // 添加代理配置
  async headers() {
    return [
      {
        // 为所有API路由添加CORS头
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
