"use client";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";

type AiTool = "ask" | "cv" | "skillgap" | "improve" | "coverletter" | "message";

export default function AiToolsTab() {
  const [activeTool, setActiveTool] = useState<AiTool>("ask");
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form states
  const [prompt, setPrompt] = useState("");
  const [cvText, setCvText] = useState("");
  const [userId, setUserId] = useState(user?.id || "");
  const [jobId, setJobId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Professional");
  const [extraContext, setExtraContext] = useState("");

  const handleAiAction = async (tool: AiTool) => {
    setIsLoading(true);
    setResult(null);
    try {
      let res;
      switch (tool) {
        case "ask":
          res = await axiosInstance.post("/Ai/ask", { prompt });
          break;
        case "cv":
          res = await axiosInstance.post("/Ai/analyze-cv", { 
            userId: parseInt(userId as string) || null, 
            cvText,
            applyToProfile: false,
            syncSkills: false
          });
          break;
        case "skillgap":
          if (!userId || !jobId) {
            toast.error("User ID and Job ID are required");
            setIsLoading(false);
            return;
          }
          res = await axiosInstance.get(`/Ai/skill-gap/${userId}/${jobId}`);
          break;
        case "improve":
          res = await axiosInstance.post("/Ai/improve-job", {
            title: jobTitle,
            description: jobDesc,
            applyToJob: false
          });
          break;
        case "coverletter":
          res = await axiosInstance.post("/Ai/draft-cover-letter", {
            userId: parseInt(userId as string),
            jobId: parseInt(jobId as string),
            tone,
            extraContext
          });
          break;
        case "message":
          res = await axiosInstance.post("/Ai/draft-message", {
            userId: parseInt(userId as string),
            jobId: jobId ? parseInt(jobId as string) : null,
            recipientName,
            purpose,
            tone,
            extraContext
          });
          break;
      }

      const responseData = res?.data;
      if (responseData?.statusCode && responseData.statusCode !== 200) {
        toast.error(responseData.description?.[0] || "AI Service error");
        setResult({ error: true, message: responseData.description?.[0] || "Service unavailable" });
      } else {
        setResult(responseData?.data || responseData);
        toast.success("AI response received!");
      }
    } catch (err: any) {
      console.error("AI Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get AI response";
      toast.error(errorMessage);
      setResult({ error: true, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case "ask":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Ask AI Anything</h3>
              <p className="text-gray-400 text-sm mb-6">Get answers to career questions, industry insights, or general help.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="How can I improve my frontend skills?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-32 resize-none text-white"
              />
              <button
                onClick={() => handleAiAction("ask")}
                disabled={isLoading || !prompt.trim()}
                className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                Get Answer
              </button>
            </div>
            {result && (
              <div className={`rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 border ${result.error ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-600/10 border-blue-500/20'}`}>
                <h4 className={`font-bold mb-2 flex items-center gap-2 ${result.error ? 'text-red-400' : 'text-blue-400'}`}>
                   {result.error ? (
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   ) : (
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                   )}
                  {result.error ? "System Notice" : "AI Suggestion"}
                </h4>
                <p className={`${result.error ? 'text-red-300' : 'text-gray-200'} whitespace-pre-wrap leading-relaxed`}>
                  {result.error ? result.message : (typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
                </p>
              </div>
            )}
          </div>
        );
      case "cv":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Analyze CV</h3>
              <p className="text-gray-400 text-sm mb-6">Upload your CV text to get a professional breakdown and improvement tips.</p>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-64 resize-none text-white text-sm"
              />
              <button
                onClick={() => handleAiAction("cv")}
                disabled={isLoading || !cvText.trim()}
                className="mt-4 px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                Analyze Now
              </button>
            </div>
            {result && result.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  System Notice
                </h4>
                <p className="text-red-300 text-sm">{result.message}</p>
              </div>
            )}
            {result && !result.error && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h4 className="text-lg font-bold">{result.fullName || "Analysis Result"}</h4>
                    <p className="text-sm text-gray-500">{result.experienceYears} Years of Experience</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-sm text-blue-400 uppercase tracking-widest mb-3">Professional Summary</h5>
                    <p className="text-gray-300 text-sm leading-relaxed">{result.professionalSummary}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-emerald-400 uppercase tracking-widest mb-3">Top Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.skills?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-rose-400 uppercase tracking-widest mb-3">Improvement Areas</h5>
                  <ul className="space-y-2">
                    {result.howToImprove?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      case "skillgap":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Skill Gap Analysis</h3>
              <p className="text-gray-400 text-sm mb-6">See how well you match a specific job and what skills you're missing.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Your User ID"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                />
                <input 
                  type="number"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="Target Job ID"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button
                onClick={() => handleAiAction("skillgap")}
                disabled={isLoading || !userId || !jobId}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                Calculate Match Score
              </button>
            </div>
            {result && result.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  System Notice
                </h4>
                <p className="text-red-300 text-sm">{result.message}</p>
              </div>
            )}
            {result && !result.error && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path className="stroke-white/5" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="stroke-orange-500 transition-all duration-1000" strokeWidth="3" strokeDasharray={`${result.matchScore}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-3xl font-black">{result.matchScore}%</span>
                  </div>
                  <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Overall Match Score</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-tighter">Matching Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.matchingSkills?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-rose-400 mb-3 uppercase tracking-tighter">Missing Skills (Gap)</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <h5 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-tighter">AI Recommendations</h5>
                    <p className="text-gray-300 text-sm leading-relaxed">{result.recommendations}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "improve":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Improve Job Posting</h3>
              <p className="text-gray-400 text-sm mb-6">Let AI enhance your job title and description to attract better candidates.</p>
              <div className="space-y-4">
                <input 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Current Job Title"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                />
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste current job description..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-48 resize-none text-white text-sm"
                />
                <button
                  onClick={() => handleAiAction("improve")}
                  disabled={isLoading || !jobTitle.trim() || !jobDesc.trim()}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                  Optimize Job Listing
                </button>
              </div>
            </div>
            {result && result.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  System Notice
                </h4>
                <p className="text-red-300 text-sm">{result.message}</p>
              </div>
            )}
            {result && !result.error && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Improved Title</h4>
                  <p className="text-xl font-bold">{result.improvedTitle}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Improved Description</h4>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {result.improvedDescription}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Suggested Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedSkills?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Suggested Benefits</h5>
                    <div className="flex flex-wrap gap-2">
                       {result.suggestedBenefits?.map((b: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "coverletter":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Draft Cover Letter</h3>
              <p className="text-gray-400 text-sm mb-6">AI will write a personalized cover letter based on your profile and the job description.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="number"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="Job ID"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                />
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-[#05070b] border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                >
                  <option value="Professional">Professional</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Creative">Creative</option>
                  <option value="Concise">Concise</option>
                </select>
              </div>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="Any extra info you want to include (e.g., 'mention my interest in sustainability')"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-24 resize-none text-white text-sm mb-4"
              />
              <button
                onClick={() => handleAiAction("coverletter")}
                disabled={isLoading || !jobId}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                Draft Cover Letter
              </button>
            </div>
            {result && result.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  System Notice
                </h4>
                <p className="text-red-300 text-sm">{result.message}</p>
              </div>
            )}
            {result && !result.error && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <h4 className="font-bold text-gray-400">Draft Result</h4>
                  <button onClick={() => {navigator.clipboard.writeText(result.content); toast.success("Copied to clipboard!");}} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">Copy Content</button>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                  {result.content}
                </div>
              </div>
            )}
          </div>
        );
      case "message":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Draft Outreach Message</h3>
              <p className="text-gray-400 text-sm mb-6">AI will draft a perfect message for recruiters, colleagues, or networking.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name (e.g. John Doe)"
                  className="bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                />
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-[#05070b] border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 text-white"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What is the purpose of this message?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 h-24 resize-none text-white text-sm mb-4"
              />
              <button
                onClick={() => handleAiAction("message")}
                disabled={isLoading || !recipientName.trim() || !purpose.trim()}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                Generate Message
              </button>
            </div>
            {result && result.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  System Notice
                </h4>
                <p className="text-red-300 text-sm">{result.message}</p>
              </div>
            )}
            {result && !result.error && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <h4 className="font-bold text-gray-400">Generated Message</h4>
                  <button onClick={() => {navigator.clipboard.writeText(result.content); toast.success("Copied to clipboard!");}} className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest">Copy Text</button>
                </div>
                {result.subject && <p className="font-bold mb-4 text-white">Subject: {result.subject}</p>}
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                  {result.content}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-64 shrink-0">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden sticky top-24">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">AI Intelligence Suite</h2>
          </div>
          <div className="p-2 space-y-1">
            <button onClick={() => {setActiveTool("ask"); setResult(null);}} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTool === "ask" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20" : "text-gray-400 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              Quick Ask
            </button>
            <button onClick={() => {setActiveTool("cv"); setResult(null);}} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTool === "cv" ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20" : "text-gray-400 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Analyze CV
            </button>
            <button onClick={() => {setActiveTool("skillgap"); setResult(null);}} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTool === "skillgap" ? "bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/20" : "text-gray-400 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Skill Gap
            </button>
            <button onClick={() => {setActiveTool("improve"); setResult(null);}} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTool === "improve" ? "bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20" : "text-gray-400 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Improve Job
            </button>
            <button onClick={() => {setActiveTool("coverletter"); setResult(null);}} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTool === "coverletter" ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20" : "text-gray-400 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Cover Letter
            </button>
            <button onClick={() => {setActiveTool("message"); setResult(null);}} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTool === "message" ? "bg-sky-600 text-white font-bold shadow-lg shadow-sky-600/20" : "text-gray-400 hover:bg-white/5"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Draft Message
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {renderToolContent()}
      </div>
    </div>
  );
}
