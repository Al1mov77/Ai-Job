"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { UserRole } from "@/app/types/auth";

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  allowedRole?: UserRole
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      useAuthStore.getState().loadFromStorage();

      const timer = setTimeout(() => {
        const { accessToken, user } = useAuthStore.getState();

        if (!accessToken) {
          router.push("/auth/login");
          return;
        }

        if (allowedRole && user?.role !== allowedRole) {
          const redirect =
            user?.role === "Organization"
              ? "/organization/dashboard"
              : "/candidate/dashboard";
          router.push(redirect);
          return;
        }

        setIsLoading(false);
      }, 50);

      return () => clearTimeout(timer);
    });

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#05070b]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
