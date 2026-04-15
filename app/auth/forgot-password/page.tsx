"use client";
import Image from "next/image";
import img2 from "@/app/assets/2.png";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white relative overflow-hidden flex items-center justify-center">
      <Image src={img2} alt="Background" fill quality={100} priority className="absolute inset-0 object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-lg border border-white/10 bg-[#05070b]/80 backdrop-blur p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email and we&apos;ll send you a reset link
          </p>
          {sent ? (
            <div className="px-4 py-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              If an account with that email exists, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
                />
              </div>
              <button type="submit" className="w-full px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition text-sm">
                Send Reset Link
              </button>
            </form>
          )}
          <p className="text-center text-gray-400 text-sm mt-6">
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
