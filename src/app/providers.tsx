"use client"

// import { SessionProvider } from "next-auth/react";
// import { AuthProvider } from '@/components/providers/auth-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <SessionProvider>
    //   <AuthProvider>
    //     {children}
    //   </AuthProvider>
    // </SessionProvider>
    <>{children}</>
  );
}
