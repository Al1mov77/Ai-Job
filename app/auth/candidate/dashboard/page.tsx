"use client";
import { useAuthStore } from "@/app/store/authStore";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";

function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-semibold">AIJob - Candidate Dashboard</div>
          <div className="flex items-center gap-4">
            <Link href="/candidate/profile" className="text-gray-300 hover:text-white">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.fullName}!</h1>
          <p className="text-gray-400">Your personalized job recommendations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Profile Strength</h3>
            <p className="text-3xl font-bold text-blue-500">85%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Saved Jobs</h3>
            <p className="text-3xl font-bold text-blue-500">12</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Applications</h3>
            <p className="text-3xl font-bold text-blue-500">3</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </main>
    </div>
  );
}

export default withProtectedRoute(DashboardPage);
