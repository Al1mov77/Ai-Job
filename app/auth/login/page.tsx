"use client";
import Image from "next/image";
import img2 from "@/app/assets/2.png";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#05070b]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [networkError, setNetworkError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError, isAuthenticated, loadFromStorage, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated()) {
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        const dashboardUrl =
          user?.role === "Organization"
            ? "/organization/dashboard"
            : "/candidate/dashboard";
        router.push(dashboardUrl);
      }
    }
  }, [mounted, isAuthenticated, user, router, searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      newErrors.email = "Invalid email address";
    }

    if (password.length < 1) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setNetworkError("");

    if (!validateForm()) return;

    try {
      await login({ email, password });
      toast.success("Successfully logged in!");
      const redirect = searchParams.get("redirect");
      const { user: currentUser } = useAuthStore.getState();
      if (redirect) {
        router.push(redirect);
      } else {
        const dashboardUrl =
          currentUser?.role === "Organization"
            ? "/organization/dashboard"
            : "/candidate/dashboard";
        router.push(dashboardUrl);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to log in.");
      if (err.message === "Network Error" || !err.response) {
        setNetworkError(
          "Cannot connect to server. Please check if API is available."
        );
      }
    }
  };

  if (mounted && isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05070b]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white relative overflow-hidden flex items-center justify-center">
      <Image
        src={img2}
        alt="Background"
        fill
        quality={100}
        priority
        className="absolute inset-0 object-cover"
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-lg border border-white/10 bg-[#05070b]/80 backdrop-blur p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm md:text-base mb-6">
            Enter your credentials to access your dashboard
          </p>

          {searchParams.get("registered") === "true" && (
            <div className="px-4 py-2 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-4">
              Account created successfully! Please sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {error && (
              <div className="px-4 py-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error.message}
              </div>
            )}

            {networkError && (
              <div className="px-4 py-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {networkError}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-white/5"
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 mt-6 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition text-sm md:text-base"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
