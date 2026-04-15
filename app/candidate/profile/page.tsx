"use client";
import { useAuthStore } from "@/app/store/authStore";
import { withProtectedRoute } from "@/lib/protectedRoute";
import Link from "next/link";

function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-semibold">My Profile</div>
          <Link href="/candidate/dashboard" className="text-gray-300 hover:text-white text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Profile Information</h1>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <p className="text-lg font-medium mt-1">{user?.fullName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Email Address</label>
                <p className="text-lg font-medium mt-1">{user?.email}</p>
              </div>

              {user?.phoneNumber && (
                <div>
                  <label className="text-sm text-gray-400">Phone Number</label>
                  <p className="text-lg font-medium mt-1">{user.phoneNumber}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400">Role</label>
                <p className="text-lg font-medium mt-1">{user?.role}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">User ID</label>
                <p className="text-lg font-medium mt-1 text-gray-400 text-sm break-all">{user?.id}</p>
              </div>
            </div>
          </div>

          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-md transition">
            Edit Profile (Coming Soon)
          </button>
        </div>
      </main>
    </div>
  );
}

export default withProtectedRoute(ProfilePage, "Candidate");
