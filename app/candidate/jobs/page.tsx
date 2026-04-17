"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useJobStore, JobType, ExperienceLevel } from "@/app/store/jobStore";

export default function JobsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    Location: "",
    JobType: "" as JobType | "",
    ExperienceLevel: "" as ExperienceLevel | "",
    SalaryMin: 120,
  });
  
  const { jobs, isLoading, error, fetchJobs } = useJobStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs({
        Title: searchTerm || undefined,
        Location: filters.Location || undefined,
        JobType: (filters.JobType as JobType) || undefined,
        ExperienceLevel: (filters.ExperienceLevel as ExperienceLevel) || undefined,
        SalaryMin: filters.SalaryMin > 120 ? filters.SalaryMin * 1000 : undefined
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, searchTerm, fetchJobs]);

  const toggleJobType = (type: JobType) => {
    setFilters(prev => ({
      ...prev,
      JobType: prev.JobType === type ? "" : type
    }));
  };

  const toggleLevel = (level: ExperienceLevel) => {
    setFilters(prev => ({
      ...prev,
      ExperienceLevel: prev.ExperienceLevel === level ? "" : level
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur-md px-8 py-3">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">AIJob</Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/candidate/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
              <Link href="/candidate/jobs" className="text-blue-400 border-b-2 border-blue-400 pb-1">Talent</Link>
              <a href="#" className="text-gray-400 hover:text-white transition">Enterprise</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 w-64 transition-all" 
                placeholder="Search opportunities..." 
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5 transition">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold cursor-pointer ring-2 ring-white/10">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-12 px-4 md:px-8 max-w-[1440px] mx-auto flex flex-col md:flex-row gap-8 md:gap-12">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div className="md:block">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Curated<br className="hidden md:block"/>Opportunities</h1>
            <p className="text-gray-500 text-sm">AI-driven matching based on your professional graph.</p>
          </div>

          <div className="hidden md:block space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-700 bg-white/5 text-blue-500 focus:ring-blue-500/20" 
                    checked={filters.Location === "Remote"}
                    onChange={(e) => setFilters(prev => ({ ...prev, Location: e.target.checked ? "Remote" : "" }))}
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition">Remote First</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-700 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                    checked={filters.Location === "San Francisco"}
                    onChange={(e) => setFilters(prev => ({ ...prev, Location: e.target.checked ? "San Francisco" : "" }))}
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition">San Francisco, CA</span>
                </label>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Job Type</h3>
              <div className="flex flex-wrap gap-2">
                {(["FullTime", "PartTime", "Remote", "Hybrid"] as JobType[]).map(type => (
                  <button 
                    key={type}
                    onClick={() => toggleJobType(type)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-medium transition ${filters.JobType === type ? "bg-blue-500 border-blue-500 text-white" : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Salary</h3>
              </div>
              <input 
                type="range" 
                min="120" 
                max="450" 
                value={filters.SalaryMin} 
                onChange={(e) => setFilters(prev => ({ ...prev, SalaryMin: parseInt(e.target.value) }))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
              />
              <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-bold uppercase">
                <span>$120k</span>
                <span className="text-blue-400">${filters.SalaryMin}k+</span>
                <span>$450k+</span>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Level</h3>
              <div className="flex flex-wrap gap-2">
                {(["Junior", "Middle", "Senior"] as ExperienceLevel[]).map(level => (
                  <button 
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-medium transition ${filters.ExperienceLevel === level ? "bg-blue-500 border-blue-500 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </section>

            <button 
              onClick={() => setFilters({ Location: "", JobType: "", ExperienceLevel: "", SalaryMin: 120 })}
              className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-bold transition-all"
            >
              Clear All Filters
            </button>
          </div>
          
          <button className="md:hidden w-full py-3 bg-white/5 border border-white/10 rounded-lg text-sm font-bold transition-all">
            Show All Filters
          </button>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <p className="text-sm text-gray-400">
              {isLoading ? "Fetching opportunities..." : `Showing ${jobs.length} high-match roles`}
            </p>
            <div className="hidden md:flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button className="p-1.5 rounded-md hover:bg-white/5 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button className="p-1.5 rounded-md bg-white/10 text-white shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white/[0.03] border border-white/[0.08] rounded-2xl h-40 w-full" />
              ))
            ) : error ? (
              <div className="p-12 text-center border border-red-500/20 bg-red-500/5 rounded-2xl text-red-400">
                <p>{error}</p>
                <button onClick={() => fetchJobs()} className="mt-4 text-sm font-bold underline">Try again</button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-20 text-center text-gray-500">
                No jobs found at the moment.
              </div>
            ) : (
              jobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                  className="group bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 md:p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl md:text-2xl font-bold text-blue-400 flex-shrink-0">
                      {job.title.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                        <h2 className="text-lg md:text-xl font-bold group-hover:text-blue-400 transition">{job.title}</h2>
                        {job.jobType === 'Remote' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            REMOTE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 font-medium text-sm mb-3">Organization #{job.organizationId} • {job.location}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {job.jobType}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          {job.experienceLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-none border-white/5 pt-4 md:pt-0">
                    <div className="md:mb-4 text-left md:text-right">
                      <p className="hidden md:block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Match Index</p>
                      <p className="text-2xl md:text-3xl font-black text-blue-500">--%</p>
                    </div>
                    <button className="px-5 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors shadow-xl">
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="relative z-10 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Auto-Pilot</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                  Let AIJob submit your profile to roles above 95% match automatically.
                </p>
                <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all">
                  Enable
                </button>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:bg-white/[0.05] transition-all">
              <div className="relative z-10 text-center md:text-left text-sm">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Insights</h3>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                  See how your skills compare to the market demand.
                </p>
                <button className="w-full md:w-auto px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-all">
                  Report
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-white/10 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-xl font-bold mb-6">AIJob</p>
          <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Help Center</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-xs text-gray-600">© 2024 AIJob Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
