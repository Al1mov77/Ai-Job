"use client";
import { useAuthStore } from "@/app/store/authStore";
import { withProtectedRoute } from "@/lib/protectedRoute";
import Link from "next/link";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface UserSettings {
  fullName: string;
  theme: string;
  brandColor: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
}

function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    fullName: user?.fullName || "",
    theme: "dark",
    brandColor: "#3b82f6",
    emailNotifications: true,
    pushNotifications: true,
    language: "en",
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [settingsRes, postsRes, profileRes] = await Promise.all([
        axiosInstance.get("/UserSettings/me"),
        axiosInstance.get("/Post"),
        axiosInstance.get(`/UserProfile/by-user/${user.id}`).catch(() => ({ data: { data: null } }))
      ]);

      if (settingsRes.data?.data) {
        setSettings(prev => ({ 
          ...prev, 
          ...settingsRes.data.data,
          fullName: user?.fullName || "" 
        }));
      }

      if (profileRes.data?.data) {
        setProfileId(profileRes.data.data.id);
      }

      if (postsRes.data?.data) {
        const userPosts = postsRes.data.data.filter((p: any) => p.userId.toString() === user?.id);
        setPosts(userPosts);
      }
    } catch (err) {
      console.error("Failed to fetch profile data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update User Settings
      const settingsPromise = axiosInstance.put("/UserSettings/me", {
        theme: settings.theme,
        brandColor: settings.brandColor,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        language: settings.language
      });

      // Update Profile (Name) if profileId exists
      if (profileId) {
        const [firstName, ...lastNameParts] = settings.fullName.split(" ");
        const lastName = lastNameParts.join(" ");
        await axiosInstance.put(`/UserProfile/${profileId}`, {
          firstName,
          lastName,
          // usually required fields
          headline: "Member",
          about: "",
          location: "",
          photoUrl: "",
          backgroundPhotoUrl: ""
        });
      }

      await settingsPromise;
      toast.success("Profile and settings updated successfully!");
      setIsEditing(false);
      
      // Update local storage user name if needed
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.fullName = settings.fullName;
        localStorage.setItem("user", JSON.stringify(userData));
        // You might need to reload the page or update the global store here
        // to reflect the name change globally.
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-semibold">My Profile</div>
          <Link href="/candidate/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Profile Information
              </h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium border border-white/10"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Full Name</label>
                    <p className="text-lg font-medium mt-1 text-gray-200">{settings.fullName || user?.fullName}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Email</label>
                    <p className="text-lg font-medium mt-1 text-gray-200">{user?.email}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Theme</label>
                    <p className="text-lg font-medium mt-1 capitalize text-gray-200">{settings.theme}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Language</label>
                    <p className="text-lg font-medium mt-1 uppercase text-gray-200">{settings.language}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Notification Preferences</h3>
                  <div className="flex gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${settings.emailNotifications ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      Email: {settings.emailNotifications ? "ON" : "OFF"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${settings.pushNotifications ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      Push: {settings.pushNotifications ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark" className="bg-[#05070b]">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="ru" className="bg-[#05070b]">Russian</option>
                      <option value="uz">Uzbek</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Brand Color</label>
                    <input
                      type="color"
                      value={settings.brandColor}
                      onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-11 p-1 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">Push Notifications</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-lg transition-all border border-white/10"
                  >
                    Discard
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold px-2">My Posts</h2>
            {posts.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <p className="text-gray-500 italic">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                    <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
                    {post.imageUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                        <img src={post.imageUrl} alt="" className="w-full object-cover max-h-80" />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <span>{post.likeCount || 0} Likes</span>
                        <span>{post.repostCount || 0} Reposts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
              {(settings.fullName || user?.fullName)?.[0]}
            </div>
            <h3 className="text-xl font-bold mb-1">{settings.fullName || user?.fullName}</h3>
            <p className="text-sm text-blue-400 mb-4">{user?.role}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ID: {user?.id}
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm font-semibold mb-4 text-gray-200">Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <p className="text-xl font-bold">{posts.length}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Posts</p>
              </div>
              <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <p className="text-xl font-bold">128</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Views</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withProtectedRoute(ProfilePage);