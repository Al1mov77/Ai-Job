"use client";
import Image from "next/image";
import img2 from "@/app/assets/2.png";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [networkError, setNetworkError] = useState<string>("");
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      newErrors.email = "Invalid email address";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter (A-Z)";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one digit (0-9)";
    } else if (!/[^a-zA-Z0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character (!@#$%^&* etc.)";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setNetworkError("");

    if (!validateForm()) return;

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
        role: "Candidate",
      });

      router.push("/auth/login?registered=true");
    } catch (err: any) {
      console.error("Register error:", err);
      if (err.message === "Network Error" || !err.response) {
        setNetworkError(
          "Cannot connect to server. Please check if API is available at http://157.180.29.248:8090/api"
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white relative overflow-hidden flex items-center justify-center py-8">
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm md:text-base mb-6">
            Join AIJob and start your career journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 special char"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 outline-none focus:border-blue-500 text-white placeholder-gray-500 text-sm"
              />
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 mt-6 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition text-sm md:text-base"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
