"use client";
import Image from "next/image";
import img2 from "@/app/assets/2.png";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#05070b]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white relative overflow-hidden flex items-center justify-center">
      <Image src={img2} alt="Background" fill quality={100} priority className="absolute inset-0 object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-lg border border-white/10 bg-[#05070b]/80 backdrop-blur p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-gray-400 text-sm mb-6">Enter your new password</p>
          {done ? (
            <div>
              <div className="px-4 py-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-4">
                Password has been reset successfully!
              </div>
              <Link href="/auth/login" className="block w-full text-center px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition text-sm">
                Go to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
                />
              </div>
              {error && (
                <div className="px-4 py-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}
              <button type="submit" className="w-full px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition text-sm">
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
