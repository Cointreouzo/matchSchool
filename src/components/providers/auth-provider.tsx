"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
// import { User } from "@/types/user";

interface AuthContextType {
  // user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 公共页面白名单
const PUBLIC_PATHS = ["/", "/pricing", "/docs", "/about", "/workspace-entry"];

// 判断是否是公共页面的函数
function isPublicPath(path: string | null) {
  if (!path) return false;
  return (
    PUBLIC_PATHS.includes(path) || PUBLIC_PATHS.some((p) => path.startsWith(p))
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // 判断当前页面是否是公共页面
  const isPublicPage = isPublicPath(pathname);

  useEffect(() => {
    // 此日志用于调试页面导航和认证状态的变化:
    // console.log("[AuthProvider] useEffect触发", {
    //   pathname,
    //   status,
    //   hasSession: !!session,
    //   hasUser: !!session?.user,
    //   isPublicPage,
    // });

    // 如果正在加载，不执行任何操作
    if (status === "loading") {
      // console.log("[AuthProvider] 会话状态加载中，跳过处理");
      return;
    }

    // 检查是否为公开页面
    const currentIsPublicPage =
      pathname === "/" ||
      pathname === "/workspace-entry" ||
      pathname === "/about" ||
      pathname === "/pricing" ||
      pathname === "/features" ||
      pathname === "/training" ||
      pathname?.startsWith("/docs") ||
      pathname?.startsWith("/api/");

    // 如果是公开页面，不需要重定向
    if (currentIsPublicPage && pathname !== "/workspace-entry") {
      // console.log("[AuthProvider] 公开页面，无需处理");
      return;
    }

    // 如果是登录页面且已登录，检查是否有callbackUrl
    if (pathname === "/workspace-entry" && session?.user) {
      // 检查是否刚从认证回调返回（避免重定向竞争）
      const isFromAuthCallback =
        window.location.search.includes("login_success=true") ||
        window.location.pathname.includes("/api/auth/callback/");

      if (isFromAuthCallback) {
        // console.log("[AuthProvider] 检测到来自认证回调，跳过重定向处理");
        return;
      }

      // 尝试从URL参数中获取callbackUrl
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl");

      console.log("[AuthProvider] 登录成功后重定向，callbackUrl:", callbackUrl);

      if (callbackUrl) {
        // 处理callbackUrl，确保只使用路径部分
        try {
          let redirectPath: string;

          // 如果callbackUrl是完整URL，提取路径部分
          if (callbackUrl.startsWith("http")) {
            const urlObj = new URL(callbackUrl);
            redirectPath = urlObj.pathname + urlObj.search + urlObj.hash;
          } else {
            // 如果已经是相对路径，直接使用
            redirectPath = callbackUrl;
          }

          console.log("[AuthProvider] 处理后的重定向路径:", redirectPath);

          // 使用setTimeout避免立即重定向导致的竞争条件
          setTimeout(() => {
            router.push(redirectPath);
          }, 100);
        } catch (error) {
          console.error("[AuthProvider] callbackUrl处理错误:", error);
          // 如果处理失败，回退到控制台
          setTimeout(() => {
            router.push("/console");
          }, 100);
        }
      } else {
        // 如果没有callbackUrl，重定向到控制台
        setTimeout(() => {
          router.push("/console");
        }, 100);
      }
      return;
    }

    // 添加未登录用户访问受保护页面的重定向逻辑
    if (!session?.user && !currentIsPublicPage) {
      console.log("[AuthProvider] 未登录用户访问受保护页面，重定向到登录页");
      const callbackUrl = window.location.href;
      router.push(
        `/workspace-entry?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
      return;
    }
  }, [pathname, status, session, router, isPublicPage]);

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.push("/workspace-entry");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    // user: session?.user as User | null,
    loading: status === "loading",
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
