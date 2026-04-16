"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";

interface UserProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  headline: string;
  about: string;
  location: string;
  photoUrl: string;
  backgroundPhotoUrl: string;
}

interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  skillName?: string;
  proficiencyLevel?: string;
}

interface UserExperience {
  id: number;
  userId: number;
  companyName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrentStatus: boolean;
}

interface ProfileData extends UserProfile {
  skills: UserSkill[];
  experience: UserExperience[];
}

export default function ProfilePage() {
  const { id } = useParams();
  const userId = typeof id === "string" ? parseInt(id, 10) : 0;
  const { isLoggedIn, user, logout } = useAuthStore();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const { data: profile, isLoading, isError } = useQuery<ProfileData>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const [profileRes, skillsRes, expRes] = await Promise.all([
        axiosInstance.get(`/UserProfile/by-user/${userId}`).catch(e => ({ data: { data: null } })),
        axiosInstance.get(`/UserSkill/by-user/${userId}`).catch(e => ({ data: { data: [] } })),
        axiosInstance.get(`/UserExperience/by-user/${userId}`).catch(e => ({ data: { data: [] } })),
      ]);

      const info = profileRes.data?.data || {
        firstName: `User ${userId}`,
        lastName: "",
        headline: "Member",
        about: "Loading or no about information available.",
        photoUrl: "",
        backgroundPhotoUrl: ""
      };

      return {
        ...info,
        skills: skillsRes.data?.data || [],
        experience: expRes.data?.data || [],
      };
    },
    enabled: !!userId,
  });

  const { data: userPosts } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => axiosInstance.get('/Post').then(r => r.data?.data?.filter((p: any) => p.userId === userId) || []),
    enabled: !!userId,
  });

  const { data: connections } = useQuery({
    queryKey: ["userConnections"],
    // Returns all connections for the authenticated user
    queryFn: () => axiosInstance.get('/Connection/all').then(r => r.data?.data || []),
    enabled: isLoggedIn,
  });

  const postCount = userPosts?.length || 0;
  // Based on the accessible API endpoints:
  const followersCount = connections?.filter((c: any) => c.addresseeId === userId && c.status === 'Accepted').length || 0;
  const followingCount = connections?.filter((c: any) => c.requesterId === userId && c.status === 'Accepted').length || 0;

  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to connect!");
      router.push("/auth/login");
      return;
    }
    setIsFollowing(true);
    try {
      await axiosInstance.post(`/Connection/send/${userId}`);
      toast.success(`Connection request sent to ${profile?.firstName}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send connection request.");
      setIsFollowing(false);
    }
  };

  const getInitials = (first = "A", last = "B") => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const myInitials = (user?.fullName || "G").split(" ").map((n) => n[0]).join("").slice(0, 2);

  const sidebarItems = [
    { id: "feed", label: "Feed", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>, link: "/candidate/dashboard" },
    { id: "profile", label: "Profile", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, link: "#" },
  ];

  return (
    <div className="min-h-screen bg-[#05070c] text-white font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#05070c]/90 backdrop-blur-md px-8 py-3">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-white">AIJob</Link>
            <nav className="hidden md:flex gap-6 text-sm">
              <Link href="/candidate/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
              <a href="#" className="text-gray-400 hover:text-white">Talent</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold cursor-pointer">
              {myInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 w-full flex">
        <aside className="hidden lg:flex flex-col w-64 fixed top-16 left-0 bottom-0 border-r border-white/5 bg-[#0a0e14] p-5">
          <div className="mb-8 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex flex-shrink-0 items-center justify-center text-xs font-bold shadow-lg">
              {myInitials}
            </div>
            <div>
              <h2 className="text-sm font-semibold truncate w-32">{user?.fullName || "Guest"}</h2>
              <p className="text-xs text-gray-500 truncate w-32">{user?.role || "Visitor"}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id || (item.id === 'profile') // Highlight profile since we are on it
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 min-h-screen pb-12 w-full bg-[#05070c]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-medium">Loading profile...</p>
            </div>
          ) : (
            <div className="max-w-[1200px] mx-auto p-6 md:p-10 w-full flex flex-col xl:flex-row gap-6 items-start">
              
              {/* Main Content Column */}
              <div className="flex-1 w-full space-y-6">
                {/* Banner & Header Card */}
                <div className="relative rounded-2xl bg-[#0e121a] border border-white/5 overflow-hidden shadow-xl">
                  {/* Banner image or gradient placeholder */}
                  <div className={`h-40 md:h-52 w-full ${profile?.backgroundPhotoUrl ? '' : 'bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40'}`}>
                    {profile?.backgroundPhotoUrl && (
                      <img src={profile.backgroundPhotoUrl} alt="Banner" className="w-full h-full object-cover opacity-60" />
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="px-6 pb-6 lg:px-10 lg:pb-8 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-6 gap-4">
                      {/* Avatar */}
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#05070c] p-2 flex-shrink-0 z-10 border-4 border-[#05070c] relative">
                        {profile?.photoUrl ? (
                          <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-4xl font-bold shadow-inner">
                            {getInitials(profile?.firstName, profile?.lastName)}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#05070c] rounded-full z-20"></span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                          onClick={handleFollow}
                          disabled={isFollowing}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-600/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                          {isFollowing ? "Pending" : "Follow"}
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-medium text-sm transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          Message
                        </button>
                      </div>
                    </div>

                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        {profile?.firstName} {profile?.lastName}
                      </h1>
                      <p className="text-blue-400 font-medium text-base md:text-lg mt-1 mb-2">
                        {profile?.headline || "Member"}
                      </p>
                      {profile?.location && (
                        <p className="text-gray-500 text-sm flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real Stats fetched from API */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white mb-1">{postCount}</span>
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">POSTS</span>
                  </div>
                  <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white mb-1">{followersCount}</span>
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">FOLLOWERS</span>
                  </div>
                  <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white mb-1">{followingCount}</span>
                    <span className="text-xs font-semibold text-gray-500 tracking-wider">FOLLOWING</span>
                  </div>
                </div>

                {/* About section */}
                <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
                  <h3 className="flex items-center gap-2 text-base font-bold text-white mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </div>
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {profile?.about || "This user hasn't added a description yet."}
                  </p>
                </div>

                {/* Experience section */}
                <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-6 md:p-8 shadow-lg">
                  <h3 className="flex items-center gap-2 text-base font-bold text-white mb-6">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" /></svg>
                    </div>
                    Experience
                  </h3>
                  
                  {(!profile?.experience || profile.experience.length === 0) ? (
                    <p className="text-gray-500 text-sm italic">No experience added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.experience.map((exp) => (
                        <div key={exp.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition w-full flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#05070c] flex items-center justify-center flex-shrink-0 shadow-inner">
                            <span className="text-lg font-bold text-gray-400">{exp.companyName.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{exp.companyName}</h4>
                            <p className="text-blue-400 text-sm mb-1">{exp.title}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(exp.startDate).getFullYear()} — {exp.isCurrentStatus ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : "Present"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                
                {/* Skills */}
                <div className="bg-[#0e121a] border border-white/5 rounded-2xl p-6 shadow-lg">
                  <h3 className="flex items-center gap-2 text-base font-bold text-white mb-5">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    </div>
                    Skills
                  </h3>
                  
                  {(!profile?.skills || profile.skills.length === 0) ? (
                    <p className="text-gray-500 text-sm italic">No skills added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <div key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 font-medium whitespace-nowrap hover:border-blue-500/30 transition-colors cursor-default hover:text-blue-100">
                          {skill.skillName || `Skill #${skill.skillId}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
