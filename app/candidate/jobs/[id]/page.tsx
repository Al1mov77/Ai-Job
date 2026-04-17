"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useJobStore } from "@/app/store/jobStore";
import { useAuthStore } from "@/app/store/authStore";
import Link from "next/link";
import { toast } from "sonner";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentJob: job, isLoading, error, fetchJobById, applyToJob } = useJobStore();
  const { user } = useAuthStore();
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobById(Number(id));
    }
  }, [id, fetchJobById]);

  const handleApply = async () => {
    if (!job || !user) {
      toast.error("Please log in to apply");
      return;
    }
    
    setIsApplying(true);
    const success = await applyToJob(job.id, Number(user.id));
    
    if (success) {
      toast.success("Application submitted successfully!");
    } else {
      toast.error("Failed to submit application");
    }
    setIsApplying(false);
  };

  if (isLoading && !job) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Job Not Found</h2>
        <p className="text-gray-400 mb-8">{error || "The job opportunity you are looking for might have been removed."}</p>
        <button onClick={() => router.push('/candidate/jobs')} className="px-6 py-3 bg-blue-600 rounded-xl font-bold">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur-md px-8 py-3">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">AIJob</Link>
            <nav className="hidden md:flex gap-6 text-sm">
              <Link href="/candidate/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
              <Link href="/candidate/jobs" className="text-blue-400 transition">Talent</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
              U
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition mb-6 md:mb-10 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="text-sm">Back to opportunities</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 md:mb-12 gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-blue-600/20 flex items-center justify-center text-3xl md:text-4xl font-bold text-blue-400 shadow-2xl flex-shrink-0">
              {job.title.charAt(0)}
            </div>
            <div>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-2xl md:text-4xl font-black">{job.title}</h1>
                <span className="px-3 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] md:text-xs font-bold border border-blue-500/20 uppercase tracking-widest">
                  Match Pending
                </span>
              </div>
              <p className="text-lg md:text-xl text-gray-400 font-medium">Organization #{job.organizationId} • {job.location}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition font-bold text-sm">
              Save
            </button>
            <button 
              onClick={handleApply}
              disabled={isApplying}
              className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              {isApplying ? "Applying..." : "Apply Now"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            { label: "Salary", value: `$${(job.salaryMin/1000).toFixed(0)}k - $${(job.salaryMax/1000).toFixed(0)}k`, icon: <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Type", value: job.jobType, icon: <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Level", value: job.experienceLevel, icon: <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
            { label: "Required", value: `${job.experienceRequired}Y`, icon: <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                {stat.icon}
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-sm md:text-base font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8 md:space-y-12">
            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-6 md:w-1.5 md:h-8 bg-blue-500 rounded-full" />
                Description
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-lg whitespace-pre-wrap">
                {job.description}
              </p>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Organization Info</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Organization #{job.organizationId} is a verified partner. Registered on {new Date(job.createdAt).toLocaleDateString()}.
              </p>
              <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm font-bold">
                View Profile
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
