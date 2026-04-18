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
      const settingsPromise = axiosInstance.put("/UserSettings/me", {
        theme: settings.theme,
        brandColor: settings.brandColor,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        language: settings.language
      });

      if (profileId) {
        const [firstName, ...lastNameParts] = settings.fullName.split(" ");
        const lastName = lastNameParts.join(" ");
        await axiosInstance.put(`/UserProfile/${profileId}`, {
          firstName,
          lastName,
          headline: "Member",
          about: "",
          location: "",
          photoUrl: "",
          backgroundPhotoUrl: ""
        });
      }

      await settingsPromise;
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.fullName = settings.fullName;
        localStorage.setItem("user", JSON.stringify(userData));
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
    <div className="min-h-screen bg-[#05070b] text-white font-sans">
      <header className="border-b border-white/10 px-6 py-4 bg-[#05070b]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">My Profile</div>
          <Link href="/candidate/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
               <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {isEditing ? "Edit Your Settings" : "Account Overview"}
            </h1>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", value: settings.fullName || user?.fullName },
                  { label: "Email Address", value: user?.email },
                  { label: "Default Theme", value: settings.theme, capitalize: true },
                  { label: "Interface Language", value: settings.language, uppercase: true },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.1] hover:border-blue-500/30 transition-colors">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold block mb-1">{item.label}</label>
                    <p className={`text-lg font-medium ${item.capitalize ? 'capitalize' : item.uppercase ? 'uppercase' : ''}`}>{item.value || "Not set"}</p>
                  </div>
                ))}
                
                <div className="sm:col-span-2 pt-6 border-t border-white/10">
                  <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Notification Preferences</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <div className={`w-2 h-2 rounded-full ${settings.emailNotifications ? 'bg-emerald-400 blur-[2px]' : 'bg-red-400'}`} />
                      <span className="text-xs font-medium">Email: {settings.emailNotifications ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <div className={`w-2 h-2 rounded-full ${settings.pushNotifications ? 'bg-emerald-400 blur-[2px]' : 'bg-red-400'}`} />
                      <span className="text-xs font-medium">Push: {settings.pushNotifications ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateSettings} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    >
                      <option value="light">Light</option>
                      <option value="dark" className="bg-[#05070b]">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="ru" className="bg-[#05070b]">Russian</option>
                      <option value="uz">Uzbek</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Brand Color</label>
                    <div className="flex gap-4">
                      <input
                        type="color"
                        value={settings.brandColor}
                        onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                        className="w-14 h-11 bg-white/5 border border-white/10 rounded-xl p-1 outline-none cursor-pointer overflow-hidden"
                      />
                      <input 
                        type="text" 
                        value={settings.brandColor}
                        readOnly
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/30 transition-all cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-200 block">Email Notifications</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Updates sent to your inbox</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/30 transition-all cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-200 block">Push Notifications</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Browser & system alerts</span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all border border-white/10 active:scale-[0.98]"
                  >
                    Discard Changes
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">My Activity</h2>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{posts.length} Posts Total</span>
            </div>
            
            {posts.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                   <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <p className="text-gray-500 font-medium">No posts shared yet.</p>
                <Link href="/candidate/dashboard" className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-4 inline-block hover:underline">Start posting →</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.07] transition-all group overflow-hidden">
                    <p className="text-gray-200 mb-6 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
                    {post.imageUrl && (
                      <div className="rounded-xl overflow-hidden mb-6 border border-white/10 shadow-2xl transition-transform group-hover:scale-[1.01]">
                        <img src={post.imageUrl} alt="" className="w-full object-cover max-h-96" />
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-gray-300">{post.likeCount || 0}</span>
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Likes</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-gray-300">{post.repostCount || 0}</span>
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Reposts</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0a0e1a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black mb-6 shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform">
              {(settings.fullName || user?.fullName)?.[0]}
            </div>
            <h3 className="text-2xl font-black mb-1">{settings.fullName || user?.fullName}</h3>
            <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">{user?.role || "Global Candidate"}</p>
            
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 group/item">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover/item:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-xs text-gray-400 font-medium truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 group/item">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-emerald-500/20 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover/item:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <span className="text-xs font-mono text-gray-600">{user?.id?.substring(0, 16)}...</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 px-1">Global Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                <p className="text-2xl font-black text-white">{posts.length}</p>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-1">Posts</p>
              </div>
              <div className="text-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                <p className="text-2xl font-black text-white">4.9</p>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-1">Score</p>
              </div>
              <div className="text-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                <p className="text-2xl font-black text-white">12</p>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-1">Network</p>
              </div>
              <div className="text-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                <p className="text-2xl font-black text-white">k+</p>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-1">Reach</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">AI Optimization</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-4">Your profile is currently 85% optimized for recruiters in your region.</p>
            <button className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-blue-500/20">Analyze CV →</button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default withProtectedRoute(ProfilePage, "Candidate");
