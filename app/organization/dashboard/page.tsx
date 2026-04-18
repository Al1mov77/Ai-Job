"use client";
import { useAuthStore } from "@/app/store/authStore";
import { useJobStore } from "@/app/store/jobStore";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import NotificationsTab from "@/components/dashboard/NotificationsTab";
import MessagesTab from "@/components/dashboard/MessagesTab";
import AiToolsTab from "@/components/dashboard/AiToolsTab";

interface Organization {
  id: number;
  name: string;
  description: string;
  type: string;
  location: string;
  logoUrl?: string;
  userId: number;
}

interface PostItem {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  repostCount: number;
}

function OrganizationDashboardPage() {
  const { user, logout } = useAuthStore();
  const { createJob } = useJobStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("feed");
  const [myOrganization, setMyOrganization] = useState<Organization | null>(null);
  const [isOrgLoading, setIsOrgLoading] = useState(true);

  // Feed/Post State
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Vacancy State
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    salaryMin: 50000,
    salaryMax: 150000,
    location: "Remote",
    jobType: "FullTime",
    experienceLevel: "Middle",
    experienceRequired: 2,
    categoryId: 1
  });

  // Org Setup State
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: "",
    description: "",
    type: "Technology",
    location: "",
  });

  useEffect(() => {
    fetchMyOrganization();
  }, []);

  useEffect(() => {
    if (activeTab === "feed") {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchMyOrganization = async () => {
    setIsOrgLoading(true);
    try {
      const res = await axiosInstance.get("/Organization/mine");
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setMyOrganization(data[0]);
      } else if (data && !Array.isArray(data) && data.id) {
        setMyOrganization(data);
      }
    } catch (err) {
      console.error("Failed to load organization:", err);
    } finally {
      setIsOrgLoading(false);
    }
  };

  const handleSetupOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingUp(true);
    try {
      const res = await axiosInstance.post("/Organization", orgForm);
      const data = res.data?.data || res.data;
      setMyOrganization(data);
      toast.success("Organization profile created!");
    } catch (err) {
      toast.error("Failed to setup organization");
    } finally {
      setIsSettingUp(false);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/Post");
      setPosts(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setIsPosting(true);
    try {
      await axiosInstance.post("/Post", { content: postContent });
      setPostContent("");
      toast.success("Update shared successfully!");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myOrganization) return;
    setIsCreatingJob(true);
    const success = await createJob({
      ...jobForm,
      organizationId: myOrganization.id
    });
    if (success) {
      toast.success("Vacancy posted successfully!");
      setActiveTab("feed");
      setJobForm({
        title: "",
        description: "",
        salaryMin: 50000,
        salaryMax: 150000,
        location: "Remote",
        jobType: "FullTime",
        experienceLevel: "Middle",
        experienceRequired: 2,
        categoryId: 1
      });
    } else {
      toast.error("Failed to post vacancy");
    }
    setIsCreatingJob(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const userInitials = (myOrganization?.name || user?.fullName || "O").split(" ").map(n => n[0]).join("").slice(0, 2);

  if (isOrgLoading) {
    return (
      <div className="min-h-screen bg-[#05070b] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">Authenticating identity...</p>
      </div>
    );
  }

  if (!myOrganization && activeTab !== "messages" && activeTab !== "notifications") {
    return (
      <div className="min-h-screen bg-[#05070b] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8 mx-auto">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 10h1m4 0h1m-5-4h1m4 0h1" /></svg>
          </div>
          <h1 className="text-3xl font-black text-center mb-4">Complete Organization Profile</h1>
          <form onSubmit={handleSetupOrg} className="space-y-6">
            <input 
              required
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none"
              placeholder="Organization Name"
              value={orgForm.name}
              onChange={e => setOrgForm({...orgForm, name: e.target.value})}
            />
            <input 
              required
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none"
              placeholder="Location"
              value={orgForm.location}
              onChange={e => setOrgForm({...orgForm, location: e.target.value})}
            />
            <textarea 
              required
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none h-32"
              placeholder="Description..."
              value={orgForm.description}
              onChange={e => setOrgForm({...orgForm, description: e.target.value})}
            />
            <button disabled={isSettingUp} className="w-full py-4 bg-blue-600 rounded-2xl font-black">
              {isSettingUp ? "Creating..." : "Setup Profile"}
            </button>
          </form>
          <button onClick={handleLogout} className="w-full py-4 text-gray-500 hover:text-white transition mt-4 text-sm font-bold">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#05070b]/95 backdrop-blur-md px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-400">AIJob</Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <button 
                onClick={() => setActiveTab("feed")}
                className={activeTab === "feed" || activeTab === "vacancy" ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-400 hover:text-white transition"}
              >
                Dashboard
              </button>
              <Link href="/candidate/jobs" className="text-gray-400 hover:text-white transition">Talent Market</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold">{myOrganization?.name || user?.fullName}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{myOrganization?.type || "Organization"}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-sm font-black ring-2 ring-white/10">
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 flex flex-col md:flex-row max-w-7xl mx-auto min-h-screen">
        <aside className="hidden lg:flex flex-col w-64 fixed top-20 bottom-0 border-r border-white/10 p-6 space-y-2">
          <button onClick={() => setActiveTab("feed")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${activeTab === "feed" ? "bg-blue-500/10 text-blue-400 font-medium" : "text-gray-400 hover:bg-white/5"}`}>Feed</button>
          <button onClick={() => setActiveTab("vacancy")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${activeTab === "vacancy" ? "bg-blue-500/10 text-blue-400 font-medium" : "text-gray-400 hover:bg-white/5"}`}>Post Vacancy</button>
          <button onClick={() => setActiveTab("messages")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${activeTab === "messages" ? "bg-blue-500/10 text-blue-400 font-medium" : "text-gray-400 hover:bg-white/5"}`}>Messages</button>
          <button onClick={() => setActiveTab("notifications")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${activeTab === "notifications" ? "bg-blue-500/10 text-blue-400 font-medium" : "text-gray-400 hover:bg-white/5"}`}>Notifications</button>
          <button onClick={() => setActiveTab("ai")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${activeTab === "ai" ? "bg-blue-500/10 text-blue-400 font-medium" : "text-gray-400 hover:bg-white/5"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Ai Tools
          </button>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition font-bold">Sign Out</button>
        </aside>

        <main className="flex-1 lg:ml-64 p-6 md:p-10">
          {activeTab === "feed" && (
            <div className="max-w-2xl mx-auto space-y-8">
              <section>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                  <textarea 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share an update..."
                    className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-600 resize-none"
                  />
                  <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                    <button onClick={handleCreatePost} disabled={isPosting || !postContent.trim()} className="px-6 py-2 bg-blue-600 rounded-xl text-sm font-bold disabled:opacity-50">Post</button>
                  </div>
                </div>

                <div className="space-y-6">
                  {isLoading ? <p>Loading...</p> : posts.map(post => (
                    <article key={post.id} className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6">
                      <p className="font-bold text-sm mb-2">{myOrganization?.name || "Member"}</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "vacancy" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-black mb-8">Post a Vacancy</h2>
                <form onSubmit={handleCreateJob} className="space-y-6">
                  <input required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none" placeholder="Title" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="bg-[#05070b] border border-white/10 p-4 rounded-2xl outline-none" value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})}>
                      <option value="FullTime">Full Time</option><option value="PartTime">Part Time</option><option value="Remote">Remote</option>
                    </select>
                    <select className="bg-[#05070b] border border-white/10 p-4 rounded-2xl outline-none" value={jobForm.experienceLevel} onChange={e => setJobForm({...jobForm, experienceLevel: e.target.value})}>
                      <option value="Junior">Junior</option><option value="Middle">Middle</option><option value="Senior">Senior</option>
                    </select>
                  </div>
                  <textarea required className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none h-40" placeholder="Description..." value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                  <button disabled={isCreatingJob} className="w-full py-4 bg-blue-600 rounded-2xl font-black">{isCreatingJob ? "Publishing..." : "Post Vacancy"}</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "ai" && <AiToolsTab />}
        </main>
      </div>
    </div>
  );
}

export default withProtectedRoute(OrganizationDashboardPage, "Organization");
