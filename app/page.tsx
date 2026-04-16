"use client"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "./store/authStore"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useLanguageStore } from "./store/languageStore"
import { translations } from "./locales/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"

import candidateCard from "./assets/candidate-card.png"

export default function Home() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, loadFromStorage, user } = useAuthStore()
  const { currentLanguage, loadLanguage } = useLanguageStore()
  const [mounted, setMounted] = useState(false)
  const t = translations[currentLanguage]
  const router = useRouter()
  
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  const handleStart = () => {
    if (isAuthenticated()) {
      const dash = user?.role === "Organization" ? "/organization/dashboard" : "/candidate/dashboard"
      router.push(dash)
    } else {
      router.push("/auth/login")
    }
  }

  useEffect(() => {
    loadFromStorage()
    loadLanguage()
    setMounted(true)
  }, [])

  const reviews = [
    { name: "Alex Johnson", role: "Senior Developer", company: "Google", text: "AIJob completely transformed my job search. The AI understood my exact skillset and matched me with roles I never would have found on my own.", stars: 5, avatar: "AJ", gradient: "from-blue-500 to-cyan-400" },
    { name: "Maria Santos", role: "Product Designer", company: "Figma", text: "Unlike other platforms, AIJob actually understands what I'm looking for. The culture-fit analysis was spot-on.", stars: 5, avatar: "MS", gradient: "from-purple-500 to-pink-400" },
    { name: "David Chen", role: "Data Scientist", company: "Netflix", text: "Way better than LinkedIn search. The AI-powered matching saved me hundreds of hours. 3 offers in the first month!", stars: 5, avatar: "DC", gradient: "from-emerald-500 to-teal-400" },
  ]

  return (
    <div className="bg-[#05070b] text-white selection:bg-blue-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#05070b]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent"
        >
          AIJob
        </motion.div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400 items-center">
          <Link className="hover:text-white transition" href="/candidate/dashboard">{t.nav.platform}</Link>
          <a className="hover:text-white transition" href="#features">{t.nav.features}</a>
          <a className="hover:text-white transition" href="#talent">{t.nav.talent}</a>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <LanguageSwitcher />
          {mounted && (
            isAuthenticated() ? (
              <Link href={user?.role === "Organization" ? "/organization/dashboard" : "/candidate/dashboard"}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full rounded-full bg-[#05070b] flex items-center justify-center text-xs font-bold">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/auth/login" className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition whitespace-nowrap">
                {t.nav.signIn}
              </Link>
            )
          )}
        </motion.div>
      </nav>

      <section ref={targetRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Glowing Orb Background */}
        <motion.div 
          style={{ y, opacity, scale }}
          className="absolute inset-x-0 top-0 flex justify-center z-0 pointer-events-none"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-900/20 to-transparent blur-[120px] opacity-60"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: -5 }}
          animate={{ opacity: 1, y: -40, rotate: -2 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="absolute right-[5%] top-[20%] hidden xl:block z-10 w-[300px]"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-1 shadow-2xl">
            <Image src={candidateCard} alt="Floating Card" className="rounded-xl" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-blue-400 mb-8 uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {t.hero.badge}
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">
            {t.hero.titleStart} <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {t.hero.titleFit}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={handleStart}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-bold transition overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative">{t.hero.buttonStart} →</span>
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition">
              {t.hero.buttonHire}
            </button>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
        </motion.div>
      </section>

      <section className="relative z-10 py-20 border-y border-white/5 bg-[#0e121a]/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { key: "talent", label: "Active Talent", value: "128k+" },
            { key: "companies", label: "Companies", value: "540+" },
            { key: "matches", label: "AI Matches", value: "1.2M" },
            { key: "success", label: "Success Rate", value: "94%" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-black mb-1 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{t.stats[stat.key as keyof typeof t.stats] || stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">{t.bento.title}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t.bento.sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-auto md:h-[600px]">
            {/* Feature 1: Large */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-7 relative group rounded-3xl bg-[#0e121a] border border-white/10 p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                  </div>
                    <h3 className="text-2xl font-bold mb-4">{t.bento.f1.title}</h3>
                    <p className="text-gray-400 max-w-sm">{t.bento.f1.desc}</p>
                  </div>
                  <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 italic text-sm text-gray-500">
                    &ldquo;{t.bento.f1.quote}&rdquo;
                  </div>
              </div>
            </motion.div>

            {/* Feature 2: Small */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-5 relative group rounded-3xl bg-gradient-to-br from-[#121826] to-[#0e121a] border border-white/10 p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.bento.f2.title}</h3>
              <p className="text-gray-400">{t.bento.f2.desc}</p>
            </motion.div>

            {/* Feature 3: Small */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-5 relative group rounded-3xl bg-[#0e121a] border border-white/10 p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.bento.f3.title}</h3>
              <p className="text-gray-400">{t.bento.f3.desc}</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-7 relative group rounded-3xl bg-gradient-to-tr from-[#0e121a] to-[#1a1f2e] border border-white/10 p-8 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 blur-3xl bg-indigo-500 group-hover:opacity-20 transition" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 text-indigo-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t.bento.f4.title}</h3>
                  <p className="text-gray-400 max-w-sm">{t.bento.f4.desc}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tighter">{t.journey.title}</h2>
            <p className="text-gray-500">{t.journey.sub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent hidden md:block" />
            
            {[
              { title: t.journey.s1.title, desc: t.journey.s1.desc },
              { title: t.journey.s2.title, desc: t.journey.s2.desc },
              { title: t.journey.s3.title, desc: t.journey.s3.desc },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 p-8 rounded-3xl bg-[#05070b] border border-white/10 text-center group hover:border-blue-500 transition"
              >
                <div className="w-14 h-14 rounded-full bg-white text-black text-xl font-black flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                  {i + 1}
                </div>
                <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tighter">Trusted by the best.</h2>
        </div>
        
        <div className="flex gap-10 whitespace-nowrap animate-marquee-left hover:pause py-10">
          {[...reviews, ...reviews].map((review, i) => (
            <div key={i} className="inline-block w-[350px] p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center font-bold text-xs`}>{review.avatar}</div>
                <div>
                  <div className="font-bold text-sm">{review.name}</div>
                  <div className="text-gray-500 text-xs">{review.role} @ {review.company}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm italic leading-relaxed whitespace-normal">&ldquo;{review.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-b from-blue-600 to-indigo-700 p-12 md:p-20 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),transparent_100%)]" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">{t.cta.title}</h2>
            <button 
              onClick={handleStart}
              className="px-10 py-5 bg-white text-blue-600 rounded-full font-black text-lg hover:scale-105 transition shadow-xl"
            >
              {t.cta.button}
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 bg-[#05070b] border-t border-white/5 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-4">
            <div className="text-xl font-black">AIJob</div>
            <p className="text-gray-500 leading-relaxed">Intelligence for the modern workforce. Built for the era of talent.</p>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white uppercase tracking-widest text-[10px]">Product</h5>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#">Network</a></li>
              <li><a href="#">Feed</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white uppercase tracking-widest text-[10px]">Resources</h5>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#">Blog</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white uppercase tracking-widest text-[10px]">Connect</h5>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition cursor-pointer">𝕏</div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition cursor-pointer">in</div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-left {
          display: flex;
          animation: marquee-left 30s linear infinite;
          width: max-content;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}