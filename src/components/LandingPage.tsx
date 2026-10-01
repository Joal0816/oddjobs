'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  PlusCircle, 
  MapPin, 
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { CampusReviews } from './CampusReviews';

export const LandingPage: React.FC = () => {
  const { 
    setActiveTab, 
    setSelectedJob, 
    jobs, 
    currentUser, 
    isAuthenticated, 
    openAuthModal, 
    logout 
  } = useApp();

  const featuredJobs = jobs.slice(0, 3);

  return (
    <div className="relative min-h-screen w-full bg-[#08080a] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Background Graphic Asset with subtle gradient overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
        style={{ backgroundImage: `url('/hero-bg.jpeg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#08080a] via-[#08080a]/80 to-[#08080a]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-zinc-800/60 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto w-full py-4">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('landing')}
          >
            <div className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(255,140,0,0.4)] group-hover:scale-105 transition-transform duration-200">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-black/90">
                <Image 
                  src="/logo-circle.png" 
                  alt="oddJobs Logo" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
              oddJobs <span className="text-amber-400 text-xs font-mono font-normal ml-1">MSU-IIT</span>
            </span>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-zinc-400">
            <button 
              onClick={() => setActiveTab('jobs')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Browse Gigs
            </button>
            <button 
              onClick={() => setActiveTab('agreement')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Agreements & Escrow
            </button>
            <button 
              onClick={() => setActiveTab('connect')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Peer Collab
            </button>
          </nav>

          {/* Right User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2.5">
                <div 
                  onClick={() => setActiveTab('profile')} 
                  className="flex items-center space-x-2 cursor-pointer group px-2.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-amber-500/50">
                    <Image 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors hidden sm:inline max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                >
                  <span>Find Gigs</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="amber-glow-btn px-4 py-2 rounded-full text-xs font-bold text-black flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 max-w-7xl mx-auto w-full py-12 sm:py-16">
        <div className="max-w-3xl mb-12 sm:mb-16">
          {/* Campus Verified Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Exclusively for Mindanao State University - Iligan Institute of Technology</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Where campus talent meets <span className="text-amber-400">real opportunities</span>.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed max-w-2xl">
            The secure peer gig marketplace for MSU-IIT students, organizations, and faculty. Find flexible gigs, build your portfolio, and get paid safely with platform escrow.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3.5 items-center">
            <button
              onClick={() => setActiveTab('jobs')}
              className="amber-glow-btn px-7 py-3.5 rounded-full text-black font-bold text-sm sm:text-base flex items-center space-x-2 shadow-[0_4px_24px_rgba(255,140,0,0.45)] cursor-pointer"
            >
              <Search className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Browse Campus Gigs</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal('signin');
                else setActiveTab('post');
              }}
              className="px-6 py-3.5 rounded-full text-zinc-200 hover:text-white font-semibold text-sm sm:text-base bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 flex items-center space-x-2 transition-all cursor-pointer backdrop-blur-md"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Post a Gig / Task</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800/80 max-w-lg">
            <div>
              <p className="text-xl sm:text-2xl font-black text-amber-400">₱240K+</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Paid to Students</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Verified Institutional IDs</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">0%</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Escrow Default Rate</p>
            </div>
          </div>
        </div>

        {/* 3-Step Workflow: How It Works */}
        <section className="my-14 sm:my-20">
          <div className="mb-8">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block mb-1">
              Simple & Reliable
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How oddJobs Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-white mb-2">Browse & Apply</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Discover verified gigs across software, photography, graphic design, and tutoring tailored to your student schedule.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-amber-400">
                <span>View listings</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-white mb-2">Lock Agreement & Escrow</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Agreed deliverables and pricing are formally logged. The requester funds platform escrow so payment is 100% guaranteed.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-sky-400">
                <span>Protected milestone system</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-white mb-2">Deliver & Get Paid</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Submit your completed work link. Once the client approves, funds are immediately released directly to your GCash or campus handoff.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-emerald-400">
                <span>Instant payout signoff</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Campus Gigs Preview */}
        <section className="my-14 sm:my-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block mb-1">
                Open Opportunities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Featured Campus Gigs
              </h2>
            </div>

            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>View all ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {featuredJobs.map(job => (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setActiveTab('jobs');
                }}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-lg cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {job.category}
                    </span>
                    <span className="text-xs font-black text-amber-400">
                      ₱{job.budget.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center space-x-1 truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <span className="font-semibold text-white group-hover:text-amber-400 flex items-center space-x-1">
                    <span>Apply</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <CampusReviews />

        {/* Clean Call To Action */}
        <section className="my-16 sm:my-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to take on campus gigs or hire trusted peers?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Join hundreds of MSU-IIT students building verified portfolios and completing gigs right here on campus.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => setActiveTab('jobs')}
              className="amber-glow-btn px-6 py-3 rounded-full text-black font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg cursor-pointer"
            >
              <span>Explore All Gigs</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </section>
      </main>

      {/* Clean Platform Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/70 bg-[#07070a] px-4 sm:px-8 py-10 pb-28 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm">oddJobs</span>
            <span className="text-zinc-600">•</span>
            <span>Mindanao State University - Iligan Institute of Technology</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <button onClick={() => setActiveTab('jobs')} className="hover:text-amber-400 transition-colors">Browse Gigs</button>
            <button onClick={() => setActiveTab('agreement')} className="hover:text-amber-400 transition-colors">Agreements</button>
            <button onClick={() => setActiveTab('connect')} className="hover:text-amber-400 transition-colors">Peer Collab</button>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">© 2026 Technopreneurship Capstone</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
