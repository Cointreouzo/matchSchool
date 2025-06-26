import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用React严格模式
  reactStrictMode: true,
  
  // 图片域名配置
  images: {
    domains: [],
  },
  
  // 编译器配置
  compiler: {
    // 🚀 生产环境移除console日志，保留重要的错误和警告
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info']
    } : false,
  },
  
  // 构建优化配置
  experimental: {
    webpackBuildWorker: true, // 启用 webpack 构建 worker 提升构建性能
  },
  
  // 开发环境配置 - 可根据需要调整
  ...(process.env.NODE_ENV === 'development' && {
    // 开发环境特定配置
    // 注意: buildActivity 已在新版本中弃用，Next.js会自动处理构建指示器
  }),
  
  // 生产环境配置
  ...(process.env.NODE_ENV === 'production' && {
    // 生产环境特定配置
    poweredByHeader: false, // 移除 X-Powered-By 头部
    compress: true, // 启用响应压缩
  }),
};

export default nextConfig;
