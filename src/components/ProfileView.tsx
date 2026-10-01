'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  GraduationCap, 
  MapPin, 
  Sparkles,
  ArrowRight,
  Building2,
  Lock,
  LogOut,
  UserCheck,
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import Image from 'next/image';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    requestStudentVerification,
    setActiveTab: setAppTab, 
    openAuthModal, 
    switchAccount, 
    logout,
    demoAccounts,
    reviews
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'reviews' | 'verification'>('profile');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'worker' | 'requester'>('all');
  const [studentIdInput, setStudentIdInput] = useState('2023-01824');
  const [submittedForVerification, setSubmittedForVerification] = useState(false);

  const handleRequestVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedForVerification(true);
    requestStudentVerification(studentIdInput.trim() || '2023-01824');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Campus Moderator',
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          icon: ShieldAlert,
          title: 'MSU-IIT Administration & Moderation'
        };
      case 'requester':
      case 'organization':
        return {
          label: 'Campus Requester / Org',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: Building2,
          title: 'Mindanao State University - Iligan Institute of Technology'
        };
      case 'student':
      default:
        return {
          label: 'Student Worker',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: GraduationCap,
          title: 'MSU-IIT Verified Student Worker'
        };
    }
  };

  // If user is currently signed out
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 pb-28 text-white w-full selection:bg-amber-500 selection:text-black">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-zinc-800 text-center relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">Sign In to oddJobs</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            Connect your MSU-IIT institutional account (`@g.msuiit.edu.ph`) to access campus gigs, digital agreements, and verified credentials.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full sm:w-auto amber-glow-btn px-7 py-3 rounded-full text-black font-extrabold text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
            >
              <span>Sign In with Campus Email</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm cursor-pointer transition-colors"
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-500 mb-3 font-semibold uppercase tracking-wider">
              Or test immediately with a demo account:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {demoAccounts.map(demo => (
                <button
                  key={demo.id}
                  onClick={() => switchAccount(demo.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <span>{demo.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-amber-400">({demo.role})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleBadge(currentUser.role);
  const RoleIcon = roleInfo.icon;

  // Filter reviews addressed to current user
  const userReviews = reviews.filter(r => r.toUserId === currentUser.id);
  const workerReviews = userReviews.filter(r => r.role === 'requester'); // Received when acting as worker
  const requesterReviews = userReviews.filter(r => r.role === 'student'); // Received when acting as requester

  const displayedReviews = userReviews.filter(r => {
    if (reviewFilter === 'worker') return r.role === 'requester';
    if (reviewFilter === 'requester') return r.role === 'student';
    return true;
  });

  const totalReviewsCount = userReviews.length;
  const avgCalculated = totalReviewsCount > 0
    ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : currentUser.rating.toFixed(1);

  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  userReviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 text-white w-full selection:bg-amber-500 selection:text-black">
      
      {/* Account Switcher & Control Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 text-xs">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-400">Active Account:</span>
          <span className="font-bold text-white">{currentUser.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.badgeClass}`}>
            {roleInfo.label}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Demo Switchers */}
          <div className="hidden sm:flex items-center space-x-1">
            {demoAccounts.map(demo => {
              const isActive = currentUser.id === demo.id;
              return (
                <button
                  key={demo.id}
                  onClick={() => switchAccount(demo.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                  }`}
                  title={`Switch to ${demo.name} (${demo.role})`}
                >
                  {demo.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => openAuthModal('signin')}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            Switch Account
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Profile Card Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 relative overflow-hidden mb-6 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10 text-center sm:text-left">
          <div className="relative">
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-amber-500/60 shadow-xl">
              <Image 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                fill 
                className="object-cover" 
              />
            </div>
            {currentUser.isVerified && (
              <span className="absolute bottom-1 right-1 bg-sky-500 text-black p-1 rounded-full shadow-md" title="MSU-IIT Verified">
                <CheckCircle2 className="w-4 h-4 fill-sky-400 stroke-black" />
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
              
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.badgeClass}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleInfo.label}</span>
              </span>

              {currentUser.isVerified ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified MSU-IIT</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span>Verification Pending</span>
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-1.5 flex items-center justify-center sm:justify-start space-x-1.5">
              <RoleIcon className="w-4 h-4 text-amber-400" />
              <span>{currentUser.course} ({currentUser.yearLevel})</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{currentUser.university}</span>
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 max-w-xl leading-relaxed">
              {currentUser.bio}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-zinc-800">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
                <div className="text-base sm:text-lg font-black text-amber-400 flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{currentUser.rating}</span>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Rating</span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
                <div className="text-base sm:text-lg font-black text-white">
                  {currentUser.completedJobsCount}
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  {currentUser.role === 'requester' ? 'Gigs Commissioned' : 'Gigs Completed'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center">
                <div className="text-base sm:text-lg font-black text-emerald-400">
                  100%
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Campus Trust</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'profile' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          {currentUser.role === 'requester' ? 'Organization Overview' : currentUser.role === 'admin' ? 'Admin Profile' : 'Skills & Availability'}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'reviews' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <span>Reviews & Ratings</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'reviews' ? 'bg-amber-400 text-black font-black' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {totalReviewsCount}
          </span>
        </button>

        {currentUser.role === 'student' && (
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'verification' ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            University ID Verification
          </button>
        )}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
              {currentUser.role === 'requester' ? 'Accredited Capabilities & Domains' : 'Marketplace Skill Badges'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/90 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
              Random Connect Interests & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-sky-950/40 text-sky-400 border border-sky-500/30 text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Role specific quick action banner */}
          {currentUser.role === 'admin' ? (
            <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Campus Moderator & Arbitration Chamber</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">Manage student ID verifications, escrow disputes, and policy violations.</p>
              </div>
              <button
                onClick={() => setAppTab('admin')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-black transition-colors flex items-center space-x-1 cursor-pointer shadow-md"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : currentUser.role === 'requester' ? (
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Post a New Campus Gig</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">Recruit vetted MSU-IIT student talent for campus events and tasks.</p>
              </div>
              <button
                onClick={() => setAppTab('post')}
                className="amber-glow-btn px-4 py-2 rounded-xl text-xs font-bold text-black transition-colors flex items-center space-x-1 cursor-pointer shadow-md"
              >
                <span>+ Post a Task</span>
              </button>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Campus Moderator Board</h4>
                <p className="text-xs text-zinc-400">View ID verifications queue and dispute arbitration chamber.</p>
              </div>
              <button
                onClick={() => setAppTab('admin')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>Open Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Overall Rating & Breakdown Card */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-zinc-800 shadow-xl bg-gradient-to-br from-zinc-900/90 via-[#121218] to-zinc-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              {/* Score Box */}
              <div className="md:col-span-5 text-center md:text-left md:border-r border-zinc-800 md:pr-6 space-y-2.5">
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                  Campus Trust Rating
                </span>
                
                <div className="flex items-baseline justify-center md:justify-start space-x-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">{avgCalculated}</span>
                  <span className="text-zinc-500 text-lg font-bold">/ 5.0</span>
                </div>
                
                {/* Gold Stars */}
                <div className="flex items-center justify-center md:justify-start space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(Number(avgCalculated))
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-zinc-400">
                  Based on <span className="text-white font-bold">{totalReviewsCount}</span> verified campus reviews
                </p>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Verified Escrow Completed</span>
                </div>
              </div>

              {/* Star Progress Bars */}
              <div className="md:col-span-7 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = starCounts[stars] || 0;
                  const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1 w-12 text-zinc-400 font-semibold flex-shrink-0">
                        <span>{stars}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex-1 h-2.5 rounded-full bg-zinc-800/80 overflow-hidden relative border border-zinc-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400 w-8 text-right font-mono flex-shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 font-semibold mr-1">Filter:</span>
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-amber-500 text-black font-bold shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All Reviews ({userReviews.length})
              </button>
              <button
                onClick={() => setReviewFilter('worker')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'worker'
                    ? 'bg-amber-500 text-black font-bold shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Received as Worker ({workerReviews.length})
              </button>
              <button
                onClick={() => setReviewFilter('requester')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'requester'
                    ? 'bg-amber-500 text-black font-bold shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Received as Requester ({requesterReviews.length})
              </button>
            </div>
          </div>

          {/* Review Cards List */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-zinc-800 text-center text-zinc-400 text-xs">
                No reviews found under this filter. Complete campus gigs or agreements to collect verified ratings!
              </div>
            ) : (
              displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-md hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-500/40 flex-shrink-0">
                        <Image
                          src={rev.fromUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={rev.fromUserName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-white">{rev.fromUserName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium">
                            {rev.role === 'requester' ? 'Campus Requester' : 'Student Worker'}
                          </span>
                        </div>
                        {rev.jobTitle && (
                          <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                            Gig: {rev.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1">{rev.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Campus Transaction</span>
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      MSU-IIT Escrow Signed Off
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-sky-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-base text-white">MSU-IIT Student Verification</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            OddJobs uses verified university credentials to protect students from scams, guarantee trust for campus organizations, and maintain accountability.
          </p>

          <form onSubmit={handleRequestVerification} className="space-y-4 max-w-md pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Institutional Email (@g.msuiit.edu.ph)
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Student ID Number
              </label>
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="202X-XXXXX"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="amber-glow-btn px-6 py-2.5 rounded-xl text-black font-bold text-xs cursor-pointer shadow-md"
            >
              {submittedForVerification || currentUser.isVerified ? 'Verified Automatically ✓' : 'Verify Student Status'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
