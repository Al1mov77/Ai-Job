"use client";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { axiosInstance, publicAxiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import NotificationsTab from "@/components/dashboard/NotificationsTab";

interface PostFeedItem {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  repostOfPostId?: number;
  repostSourceUserId?: number;
  likeCount: number;
  likedByMe: boolean;
  repostCount: number;
}

interface CommentItem {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
}

const recommendedPeople = [
  { name: "Marcus Thorne", role: "Cloud Architect", avatar: "MT", gradient: "from-blue-500 to-cyan-400" },
  { name: "Elena Vance", role: "Product Designer", avatar: "EV", gradient: "from-purple-500 to-pink-400" },
  { name: "David Kovic", role: "Backend Engineer", avatar: "DK", gradient: "from-emerald-500 to-teal-400" },
  { name: "Aria Kim", role: "Data Scientist", avatar: "AK", gradient: "from-orange-500 to-amber-400" },
  { name: "Leo Torres", role: "DevOps Engineer", avatar: "LT", gradient: "from-rose-500 to-red-400" },
];

const marketBriefing = [
  { category: "SEMICONDUCTORS", title: "Nvidia reports record growth as AI infrastructure demand peaks.", time: "12 min ago", reads: "142 reads" },
  { category: "REMOTE WORK", title: "New policy shifts in Silicon Valley: The hybrid model evolution.", time: "1 hour ago", reads: "89 reads" },
  { category: "FUNDING", title: "OpenAI competitors secure $2B in Series C rounds this week.", time: "3 hours ago", reads: "256 reads" },
];

const gradients = [
  "from-blue-500 to-cyan-400",
  "from-purple-500 to-pink-400",
  "from-emerald-500 to-teal-400",
  "from-orange-500 to-amber-400",
  "from-rose-500 to-red-400",
  "from-indigo-500 to-violet-400",
  "from-sky-500 to-blue-400",
  "from-fuchsia-500 to-purple-400",
];

function DashboardPage() {
  const { user, logout, loadFromStorage, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("feed");
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<PostFeedItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [showImageInput, setShowImageInput] = useState(false);
  const [postError, setPostError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentsData, setCommentsData] = useState<Record<number, CommentItem[]>>({});
  const [isLoadingComments, setIsLoadingComments] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<number, boolean>>({});
  const [commentErrors, setCommentErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
    fetchFeed();
  }, []);

  const isLoggedIn = mounted && isAuthenticated();

  const fetchFeed = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await axiosInstance.get("/Post");
      if (res.data?.data) {
        setPosts(res.data.data);
      } else if (Array.isArray(res.data)) {
        setPosts(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load feed:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleCreatePost = async () => {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    if (!postContent.trim()) return;
    setIsPosting(true);
    setPostError("");

    try {
      await axiosInstance.post("/Post", {
        content: postContent,
        imageUrl: postImageUrl || "",
      });

      setPostContent("");
      setPostImageUrl("");
      setShowImageInput(false);
      await fetchFeed();
      toast.success("Post created successfully!");
    } catch (err: any) {
      console.error("Failed to create post:", err);
      setPostError(err.response?.data?.description?.[0] || err.response?.data?.message || "Failed to create post");
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    try {
      const res = await axiosInstance.post(`/Post/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likedByMe: !p.likedByMe,
            likeCount: p.likedByMe ? Math.max(0, (p.likeCount || 1) - 1) : (p.likeCount || 0) + 1,
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to like post:", err);
      toast.error("Error liking post");
    }
  };

  const handleRepost = async (postId: number) => {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    try {
      await axiosInstance.post(`/Post/${postId}/repost`);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, repostCount: (p.repostCount || 0) + 1 };
        }
        return p;
      }));
      toast.success("Post reposted!");
    } catch (err) {
      console.error("Failed to repost:", err);
      toast.error("Failed to repost");
    }
  };

  const handleToggleComments = async (postId: number) => {
    const isExpanding = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: isExpanding }));

    if (isExpanding) {
      setIsLoadingComments(prev => ({ ...prev, [postId]: true }));
      setCommentErrors(prev => ({ ...prev, [postId]: "" }));
      try {
        const res = await axiosInstance.get(`/Post/${postId}/comments`);
        if (res.data?.statusCode === 403 || res.data?.statusCode === 400 || res.data?.statusCode === 500) {
          setCommentErrors(prev => ({ ...prev, [postId]: res.data?.description?.[0] || "Cannot load comments" }));
        } else if (res.data?.data) {
          setCommentsData(prev => ({ ...prev, [postId]: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setIsLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleSubmitComment = async (postId: number) => {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await axiosInstance.post(`/Post/${postId}/comments`, { content });
      const newComment = res.data?.data;
      if (newComment) {
        setCommentsData(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        toast.success("Comment added!");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await axiosInstance.delete(`/Post/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted successfully!");
      setActiveDropdown(null);
    } catch (err: any) {
      console.error("Failed to delete post:", err);
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  const formatNumber = (num?: number) => {
    if (num == null) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  };

  const getAvatarForUser = (userId: number) => {
    return gradients[userId % gradients.length];
  };

  const userInitials = (user?.fullName || "G").split(" ").map(n => n[0]).join("").slice(0, 2);

  const sidebarItems = [
    { id: "feed", label: "Feed", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
    { id: "jobs", label: "Jobs", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { id: "applications", label: "Applications", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: "messages", label: "Messages", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
    { id: "notifications", label: "Notifications", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
    { id: "profile", label: "Profile", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur-md px-8 py-3">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">AIJob</Link>
            <nav className="hidden md:flex gap-6 text-sm">
              <Link href="/candidate/dashboard" className="text-blue-400 border-b-2 border-blue-400 pb-1">Dashboard</Link>
              <a href="#" className="text-gray-400 hover:text-white">Talent</a>
              <a href="#" className="text-gray-400 hover:text-white">Enterprise</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 w-64" placeholder="Search talent..." />
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold cursor-pointer">
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 w-full flex">
        <aside className="hidden lg:flex flex-col w-64 fixed top-16 left-0 bottom-0 border-r border-white/10 p-5">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white">AIJob Platform</h2>
            <p className="text-xs text-gray-500">Professional Network</p>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "profile") {
                    router.push("/candidate/profile");
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === item.id
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-sm font-medium hover:from-blue-500 hover:to-blue-400 transition-all">
            Post a Job
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="mt-2 w-full px-4 py-2.5 text-red-400 text-sm hover:bg-red-500/10 rounded-lg transition"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="mt-2 w-full block text-center px-4 py-2.5 text-blue-400 text-sm hover:bg-blue-500/10 rounded-lg transition"
            >
              Sign In
            </Link>
          )}
        </aside>

        <main className="flex-1 lg:ml-64 min-h-screen w-full">
          <div className="flex gap-10 p-6 lg:p-10 w-full min-w-0">
            <div className="flex-1 min-w-0">
              {activeTab === 'notifications' ? (
                <NotificationsTab />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Curated Feed</h1>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">AI RELEVANCE ACTIVE</span>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {userInitials}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share an insight or update with your network..."
                        className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none resize-none min-h-[60px]"
                        rows={2}
                      />
                      {showImageInput && (
                        <input
                          value={postImageUrl}
                          onChange={(e) => setPostImageUrl(e.target.value)}
                          placeholder="Paste image URL..."
                          className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>
                  {postError && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      {postError}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex gap-2">
                      <button onClick={() => setShowImageInput(!showImageInput)} className={`p-2 rounded-lg transition ${showImageInput ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5 text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={isPosting || !postContent.trim()}
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                    >
                      {isPosting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" className="block bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6 text-center hover:border-blue-500/30 transition-all group">
                  <p className="text-gray-400 text-sm mb-2">Want to share your thoughts?</p>
                  <span className="text-blue-400 font-medium text-sm group-hover:text-blue-300 transition">Sign in to create a post →</span>
                </Link>
              )}

              {isLoadingPosts ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-gray-500 text-sm">Loading feed...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
                  <p className="text-gray-500 text-sm">Be the first to share something with the community!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {posts.map((post) => (
                    <article key={post.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.15] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/candidate/profile/${post.userId}`}>
                            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarForUser(post.userId)} flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition`}>
                              U{post.userId}
                            </div>
                          </Link>
                          <div>
                            <Link href={`/candidate/profile/${post.userId}`}>
                              <p className="text-sm font-semibold text-white hover:underline cursor-pointer">User #{post.userId}</p>
                            </Link>
                            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                        {user?.id === post.userId.toString() && (
                          <div className="relative">
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                              className="p-1 rounded hover:bg-white/5 text-gray-500 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                            </button>
                            
                            {activeDropdown === post.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-[#0a0e1a] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  Delete post
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

                      {post.imageUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-white/[0.06]">
                          <img src={post.imageUrl} alt="" className="w-full max-h-96 object-cover" />
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-3 border-t border-white/[0.06]">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 transition text-sm ${post.likedByMe ? 'text-rose-400' : 'text-gray-500 hover:text-rose-400'}`}
                        >
                          <svg className="w-4 h-4" fill={post.likedByMe ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {formatNumber(post.likeCount)}
                        </button>
                        <button 
                          onClick={() => handleToggleComments(post.id)}
                          className={`flex items-center gap-2 transition text-sm ${expandedComments[post.id] ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          Comments
                        </button>
                        <button
                          onClick={() => handleRepost(post.id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-emerald-400 transition text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          {formatNumber(post.repostCount)}
                        </button>
                      </div>

                      {expandedComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                          {isLoadingComments[post.id] ? (
                            <div className="py-4 text-center text-sm text-gray-500">Loading comments...</div>
                          ) : commentErrors[post.id] ? (
                            <div className="py-4 text-center text-sm text-red-400 bg-red-400/10 rounded-lg border border-red-400/20">
                              {commentErrors[post.id]}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {(commentsData[post.id] || []).length === 0 ? (
                                <p className="text-xs text-gray-500 italic">No comments yet. Be the first!</p>
                              ) : (
                                (commentsData[post.id] || []).map((comment) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarForUser(comment.userId)} flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                                      U{comment.userId}
                                    </div>
                                    <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2.5 flex-1">
                                      <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-xs font-semibold text-white">User #{comment.userId}</span>
                                        <span className="text-[10px] text-gray-500">{timeAgo(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-sm text-gray-300">{comment.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}

                          {isLoggedIn ? (
                            <div className="mt-5 flex gap-3 items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {userInitials}
                              </div>
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={commentInputs[post.id] || ""}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSubmitComment(post.id);
                                  }}
                                  placeholder="Write a comment..."
                                  className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-200 transition-colors"
                                  disabled={isSubmittingComment[post.id]}
                                />
                                <button
                                  onClick={() => handleSubmitComment(post.id)}
                                  disabled={!commentInputs[post.id]?.trim() || isSubmittingComment[post.id]}
                                  className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                                >
                                  {isSubmittingComment[post.id] ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-white/30 rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-5 text-center px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-xs text-gray-400 mb-2">Want to join the discussion?</p>
                              <Link href="/auth/login" className="inline-block text-xs font-medium text-blue-400 hover:text-blue-300">
                                Sign in to reply
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            <aside className="hidden xl:block w-80 flex-shrink-0 space-y-5">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Curated for you</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300">View all</button>
                </div>
                <div className="space-y-4">
                  {recommendedPeople.map((person, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${person.gradient} flex items-center justify-center text-xs font-bold`}>
                          {person.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{person.name}</p>
                          <p className="text-xs text-gray-500">{person.role}</p>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
                  <h3 className="text-sm font-semibold">Market Briefing</h3>
                </div>
                <div className="space-y-4">
                  {marketBriefing.map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                      <p className="text-[10px] font-semibold text-blue-400 tracking-wider mb-1">{item.category}</p>
                      <p className="text-sm text-gray-300 group-hover:text-white transition leading-snug">{item.title}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{item.time} · {item.reads}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-2 space-y-2 text-[10px] text-gray-600">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a href="#" className="hover:text-gray-400">About</a>
                  <a href="#" className="hover:text-gray-400">Accessibility</a>
                  <a href="#" className="hover:text-gray-400">Help Center</a>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a href="#" className="hover:text-gray-400">Privacy & Terms</a>
                  <a href="#" className="hover:text-gray-400">Ad Choices</a>
                </div>
                <p>© 2026 AIJob Platform</p>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0e1a]/95 backdrop-blur-md px-4 py-2">
        <div className="flex justify-around">
          {sidebarItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "profile") {
                  router.push("/candidate/profile");
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center gap-1 p-2 ${activeTab === item.id ? 'text-blue-400' : 'text-gray-500'}`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
