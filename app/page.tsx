"use client"
import Image from "next/image"
import img1 from "./assets/1.png"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "./store/authStore"

export default function Home() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, loadFromStorage, user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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
    setMounted(true)
  }, [])

  const reviews = [
    {
      name: "Alex Johnson",
      role: "Senior Developer",
      company: "Google",
      text: "AIJob completely transformed my job search. The AI understood my exact skillset and matched me with roles I never would have found on my own. Landed my dream job in 2 weeks!",
      stars: 5,
      avatar: "AJ",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      name: "Maria Santos",
      role: "Product Designer",
      company: "Figma",
      text: "Unlike other platforms, AIJob actually understands what I'm looking for. The culture-fit analysis was spot-on — every recommendation felt personally curated for me.",
      stars: 5,
      avatar: "MS",
      gradient: "from-purple-500 to-pink-400",
    },
    {
      name: "David Chen",
      role: "Data Scientist",
      company: "Netflix",
      text: "Way better than LinkedIn search. The AI-powered matching saved me hundreds of hours. I got 3 offers within the first month — all perfect fits for my career goals.",
      stars: 5,
      avatar: "DC",
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      name: "Sophie Williams",
      role: "Engineering Manager",
      company: "Stripe",
      text: "The clean UI and incredibly accurate matches make AIJob my go-to platform. The team dynamics insights helped me find a company where I truly belong.",
      stars: 5,
      avatar: "SW",
      gradient: "from-orange-500 to-amber-400",
    },
    {
      name: "Liam O'Brien",
      role: "Frontend Engineer",
      company: "Vercel",
      text: "Saved me tons of time during my job search. The pre-vetted assessments meant companies already knew my skills. No more repetitive coding tests!",
      stars: 5,
      avatar: "LO",
      gradient: "from-rose-500 to-red-400",
    },
    {
      name: "Emma Zhang",
      role: "ML Engineer",
      company: "OpenAI",
      text: "The career trajectory analysis is incredible. AIJob didn't just find me a job — it found me the next step in my career. The salary insights were also amazingly accurate.",
      stars: 5,
      avatar: "EZ",
      gradient: "from-indigo-500 to-violet-400",
    },
    {
      name: "James Park",
      role: "DevOps Lead",
      company: "AWS",
      text: "I was skeptical about AI job matching, but AIJob blew me away. The platform found opportunities that aligned perfectly with my values and work style preferences.",
      stars: 4,
      avatar: "JP",
      gradient: "from-sky-500 to-blue-400",
    },
    {
      name: "Aisha Patel",
      role: "iOS Developer",
      company: "Apple",
      text: "From signup to offer in just 10 days. AIJob's intelligent matching is leagues ahead of anything else. The interview prep suggestions were incredibly helpful too.",
      stars: 5,
      avatar: "AP",
      gradient: "from-fuchsia-500 to-purple-400",
    },
  ]

  const row1 = reviews.slice(0, 4)
  const row2 = reviews.slice(4, 8)

  return (
    <>
      <main className="min-h-screen bg-[#05070b] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.25),transparent_60%)]" />

        <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">AIJob</div>

          <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            <Link className="hover:text-white" href={mounted && isAuthenticated() ? (user?.role === "Organization" ? "/organization/dashboard" : "/candidate/dashboard") : "/auth/login"}>Dashboard</Link>
            <a className="hover:text-white" href="#">Talent</a>
            <a className="hover:text-white" href="#">Enterprise</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <input
              className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500"
              placeholder="Search careers..."
            />
            {mounted && (
              <Link href={isAuthenticated() ? (user?.role === "Organization" ? "/organization/dashboard" : "/candidate/dashboard") : "/auth/login"}>
                <img className="rounded-[50%] w-7 h-7 cursor-pointer" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5TPu3HoTZkTyxzVY6h3fuKo-nPU85G5u4Vw&s" alt="" />
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col gap-1"
          >
            <span className="w-5 h-[2px] bg-white" />
            <span className="w-5 h-[2px] bg-white" />
            <span className="w-5 h-[2px] bg-white" />
          </button>
        </header>

        {open && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4 text-gray-300">
            <a href="#">Dashboard</a>
            <a href="#">Talent</a>
            <a href="#">Enterprise</a>
          </div>
        )}

        <section className="relative z-10 text-center px-6 mt-20">
          <div className="inline-block text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-gray-300">
            NEXT-GEN CAREER INTELLIGENCE
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Find work that
            <br />
            <span className="text-blue-500">actually fits.</span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            AIJob leverages deep career intelligence to move beyond keywords.
            Discover roles curated specifically for your trajectory, skills, and values.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={handleStart} className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-200">
              Start My Curation →
            </button>
            <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-md text-sm font-medium hover:bg-white/10">
              Hire for Your Team
            </button>
          </div>
        </section>

        <section className="relative z-10 px-6 mt-20 grid md:grid-cols-2 gap-10 items-center">
          <img className="rounded-2xl" src="https://images.stockcake.com/public/0/9/6/096012ad-9712-4e07-8f74-9e435d91e76f_large/glowing-cyber-intelligence-stockcake.jpg" alt="" />

          <div>
            <p className="text-blue-400 text-xs mb-2">FOR ENTERPRISE</p>
            <h2 className="text-2xl md:text-4xl font-bold">Build teams that stick.</h2>
            <p className="text-gray-400 mt-4 text-sm">
              Hiring isn&apos;t just about filling seats. AIJob analyzes team dynamics and technical requirements.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-300">
              <li>• Pre-vetted technical assessments</li>
              <li>• Automated culture-fit screening</li>
              <li>• Real-time talent market data</li>
            </ul>

            <button className="mt-6 bg-white text-black px-5 py-2 rounded-md text-sm">
              Learn More
            </button>
          </div>
        </section>

        {/* ═══════════ ENHANCED TESTIMONIALS SECTION ═══════════ */}
        <section className="relative z-10 mt-32 pb-8">
          {/* Decorative background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.12),transparent_60%)]" />

          {/* Section Header */}
          <div className="text-center mb-14 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 tracking-wider font-medium">TRUSTED BY THOUSANDS</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Loved by professionals
            </h3>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
              See why top talent across the world chooses AIJob to power their career growth
            </p>
          </div>

          {/* Marquee Row 1 — scrolls left */}
          <div className="reviews-marquee-wrapper mb-5">
            <div className="reviews-marquee">
              {[...row1, ...row1, ...row1].map((r, i) => (
                <ReviewCard key={`r1-${i}`} review={r} />
              ))}
            </div>
          </div>

          {/* Marquee Row 2 — scrolls right */}
          <div className="reviews-marquee-wrapper">
            <div className="reviews-marquee reverse">
              {[...row2, ...row2, ...row2].map((r, i) => (
                <ReviewCard key={`r2-${i}`} review={r} />
              ))}
            </div>
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#05070b] to-transparent z-20" />
          <div className="pointer-events-none absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#05070b] to-transparent z-20" />
        </section>

        <footer className="relative z-10 mt-24 py-10 text-center text-gray-500 text-sm">
          AIJob © 2026
        </footer>

        <style jsx>{`
          .reviews-marquee-wrapper {
            overflow: hidden;
            position: relative;
            width: 100%;
          }
          .reviews-marquee {
            display: flex;
            gap: 1.25rem;
            width: max-content;
            animation: marquee-left 40s linear infinite;
          }
          .reviews-marquee.reverse {
            animation: marquee-right 40s linear infinite;
          }
          .reviews-marquee-wrapper:hover .reviews-marquee {
            animation-play-state: paused;
          }
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-33.333%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </main>

      <footer className="relative z-10 border-t bg-[#05070b] p-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.15),transparent_70%)]" />

        <div className="relative px-6 py-12 max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-sm">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">AIJob</h3>
            <p className="text-gray-400">
              Smarter job discovery powered by AI. Find work that actually fits your skills and goals.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-white">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Updates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-white">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-white">Stay updated</h4>
            <div className="flex items-center gap-2">
              <input
                placeholder="Email"
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm outline-none focus:border-blue-500"
              />
              <button className="px-4 py-2 bg-blue-500 rounded-md text-sm hover:bg-blue-600">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 px-6 py-6 text-center text-gray-500 text-xs">
          © 2026 AIJob. All rights reserved.
        </div>
      </footer>
    </>
  )
}

/* ═══════════ REVIEW CARD COMPONENT ═══════════ */
interface ReviewData {
  name: string
  role: string
  company: string
  text: string
  stars: number
  avatar: string
  gradient: string
}

function ReviewCard({ review }: { review: ReviewData }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`

    // Move glow
    const glow = card.querySelector('.review-glow') as HTMLElement
    if (glow) {
      glow.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(99,102,241,0.2), transparent 60%)`
    }
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
    const glow = card.querySelector('.review-glow') as HTMLElement
    if (glow) {
      glow.style.background = 'transparent'
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="review-card group"
      style={{
        minWidth: '340px',
        maxWidth: '340px',
        transition: 'transform 0.2s ease-out, box-shadow 0.3s ease',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 h-full hover:border-blue-500/30 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] transition-all duration-300">
        {/* Glow overlay */}
        <div className="review-glow absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300" />

        {/* Content */}
        <div className="relative z-10">
          {/* Stars */}
          <div className="flex gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < review.stars ? 'text-amber-400' : 'text-gray-700'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Review text */}
          <p className="text-sm text-gray-300 leading-relaxed mb-5 whitespace-normal">
            &ldquo;{review.text}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
              {review.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{review.name}</p>
              <p className="text-xs text-gray-500">{review.role} · {review.company}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}