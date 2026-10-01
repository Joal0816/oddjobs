'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Heart, 
  Star, 
  Bookmark, 
  MapPin, 
  Clock, 
  Coins, 
  Bell, 
  CheckCircle2, 
  Send, 
  Sparkles,
  Info
} from 'lucide-react';
import Image from 'next/image';

export const SwipeHome: React.FC = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    openAuthModal, 
    jobs, 
    savedJobIds, 
    toggleSaveJob, 
    applyToJob, 
    setActiveTab 
  } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState('1-2 days');
  const [feedbackAction, setFeedbackAction] = useState<'pass' | 'star' | 'like' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Touch and pointer drag gestures
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });

  const activeJob = jobs[currentIndex % jobs.length];
  const nextJob = jobs[(currentIndex + 1) % jobs.length];
  const isSaved = savedJobIds.includes(activeJob?.id);

  const handleNext = useCallback((action: 'pass' | 'star' | 'like') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setFeedbackAction(action);
    setDragOffset({ x: 0, y: 0 });

    setTimeout(() => {
      setFeedbackAction(null);
      setCurrentIndex(prev => (prev + 1) % jobs.length);
      setIsTransitioning(false);
    }, 280);
  }, [isTransitioning, jobs.length]);

  const handleOpenApply = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    if (activeJob) {
      setProposedPrice(activeJob.budget);
      setShowApplyModal(true);
    }
  }, [activeJob, isAuthenticated, openAuthModal]);

  // Touch & Pointer handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isTransitioning || showApplyModal) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 75;
    if (dragOffset.x > threshold) {
      // Swiped right -> Open apply modal or like
      handleOpenApply();
      setDragOffset({ x: 0, y: 0 });
    } else if (dragOffset.x < -threshold) {
      // Swiped left -> Pass
      handleNext('pass');
    } else if (dragOffset.y < -threshold && Math.abs(dragOffset.x) < threshold) {
      // Swiped up -> Star / Save
      if (activeJob) toggleSaveJob(activeJob.id);
      handleNext('star');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Keyboard navigation shortcuts: Left Arrow = Pass, Right Arrow = Like/Apply, Up/Space = Bookmark
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs/modals
      if (showApplyModal) {
        if (e.key === 'Escape') {
          setShowApplyModal(false);
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNext('pass');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleOpenApply();
      } else if (e.key === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        if (activeJob) {
          toggleSaveJob(activeJob.id);
          handleNext('star');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showApplyModal, handleNext, handleOpenApply, activeJob, toggleSaveJob]);

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;
    const ok = applyToJob(activeJob.id, proposalText || 'Ready and available for this campus gig!', proposedPrice, estimatedTime);
    if (ok) {
      setShowApplyModal(false);
      setProposalText('');
      handleNext('like');
    }
  };

  const quickPrompts = [
    '⚡ Can start today on MSU-IIT campus',
    '🛠️ Experienced in these skills',
    '🎓 Top student ratings'
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-24 pt-3 px-4 flex flex-col items-center justify-between max-w-md mx-auto w-full selection:bg-amber-500 selection:text-black">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between py-1.5">
        {/* Brand Logo - Circular Icon + Logotype */}
        <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={() => setActiveTab('landing')}>
          <div className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(255,140,0,0.5)]">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-black/90">
              <Image 
                src="/logo-circle.png" 
                alt="oddJobs Circular Logo" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
          <div className="relative w-28 h-9">
            <Image 
              src="/logo.png" 
              alt="oddJobs Logo" 
              fill 
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
        </div>

        {/* User Status / Notification & Avatar */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('jobs')}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-amber-500/40 transition-colors relative cursor-pointer"
            title="Browse All Jobs"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </button>

          <div 
            onClick={() => setActiveTab('profile')}
            className="relative cursor-pointer ring-2 ring-amber-500/50 hover:ring-amber-400 rounded-full transition-all"
            title="View Student Profile"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                fill 
                className="object-cover"
              />
            </div>
            {currentUser.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 bg-black rounded-full absolute -bottom-0.5 -right-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* Greeting Header */}
      <div className="w-full text-left py-1">
        <p className="text-xs text-zinc-400">
          {isAuthenticated ? 'Welcome back,' : 'Welcome to oddJobs,'}
        </p>
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isAuthenticated ? currentUser.name : 'MSU-IIT Explorer'}
          </h2>
          <span className="text-xl">👋</span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          {currentUser.role === 'admin' 
            ? 'Campus Moderator session active • Monitoring campus gigs and disputes.' 
            : currentUser.role === 'requester'
            ? 'Campus Requester session • Discovering student talent and commissioning tasks.'
            : 'Swipe left to pass, right to apply, or up to save.'}
        </p>
      </div>

      {/* Main Tinder-style Card Stack */}
      <div className="relative w-full aspect-[4/5] max-h-[490px] my-auto flex items-center justify-center select-none">
        {/* Background stack card preview */}
        {nextJob && (
          <div className="absolute inset-x-3 top-2 bottom-0 bg-[#121218] rounded-3xl border border-zinc-800/80 scale-[0.96] opacity-50 translate-y-2 pointer-events-none overflow-hidden">
            <div className="relative w-full h-[45%] opacity-40">
              <Image src={nextJob.image} alt="" fill className="object-cover" />
            </div>
          </div>
        )}

        {/* Front Active Card */}
        {activeJob && (
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            style={
              isDragging ? {
                transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.08}deg)`,
                cursor: 'grabbing'
              } : undefined
            }
            className={`relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900/95 to-[#101015] border border-zinc-800 card-swipe-shadow flex flex-col justify-between transform-gpu cursor-grab ${
              isDragging ? 'transition-none select-none' : 'transition-all duration-300'
            } ${
              feedbackAction === 'pass' 
                ? '-translate-x-36 -rotate-12 opacity-0' 
                : feedbackAction === 'like' 
                ? 'translate-x-36 rotate-12 opacity-0' 
                : feedbackAction === 'star' 
                ? '-translate-y-12 scale-105 opacity-80 ring-4 ring-amber-400' 
                : !isDragging ? 'translate-x-0 rotate-0 opacity-100' : ''
            }`}
          >
            {/* Visual Stamp Badges on Swipe or Live Drag */}
            {(feedbackAction === 'pass' || (isDragging && dragOffset.x < -35)) && (
              <div className="absolute top-8 right-8 z-30 px-5 py-2 border-4 border-rose-500 text-rose-500 rounded-2xl font-black text-2xl uppercase tracking-wider rotate-12 animate-in zoom-in-75 pointer-events-none">
                PASS
              </div>
            )}
            {(feedbackAction === 'like' || (isDragging && dragOffset.x > 35)) && (
              <div className="absolute top-8 left-8 z-30 px-5 py-2 border-4 border-emerald-400 text-emerald-400 rounded-2xl font-black text-2xl uppercase tracking-wider -rotate-12 animate-in zoom-in-75 pointer-events-none">
                APPLY
              </div>
            )}
            {(feedbackAction === 'star' || (isDragging && dragOffset.y < -35 && Math.abs(dragOffset.x) < 35)) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-6 py-3 bg-black/80 border-2 border-amber-400 text-amber-400 rounded-2xl font-black text-xl uppercase tracking-widest animate-in zoom-in-90 flex items-center space-x-2 pointer-events-none">
                <Star className="w-6 h-6 fill-current" />
                <span>SAVED!</span>
              </div>
            )}

            {/* Top Media / Photo Section */}
            <div className="relative w-full h-[46%] cursor-pointer" onClick={handleOpenApply}>
              <Image 
                src={activeJob.image} 
                alt={activeJob.title} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101015] via-transparent to-black/50" />

              {/* Bookmark Save Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveJob(activeJob.id);
                  handleNext('star');
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(255,170,0,0.7)]' 
                    : 'bg-black/60 text-white/90 hover:text-white border border-white/20'
                }`}
                title="Bookmark Task"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>

              {/* Job Type Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black shadow-md">
                  {activeJob.jobType}
                </span>
              </div>
            </div>

            {/* Bottom Details Section */}
            <div className="p-5 flex-1 flex flex-col justify-between text-left">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {activeJob.title}
                </h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  {activeJob.category} • <span className="text-zinc-300">{activeJob.requesterOrg || activeJob.requesterName}</span>
                </p>

                {/* Key Meta Badges */}
                <div className="flex flex-wrap gap-2 items-center my-3 text-xs font-semibold text-zinc-300">
                  <div className="flex items-center space-x-1 bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-700/60">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{activeJob.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-xl border border-amber-500/30">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>₱{activeJob.budget.toLocaleString()}/{activeJob.budgetUnit}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-700/60">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeJob.schedule}</span>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                  {activeJob.description}
                </p>
              </div>

              {/* Skills Tag Pills */}
              <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                {activeJob.skills.slice(0, 3).map((skill, i) => (
                  <span 
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700/60"
                  >
                    {skill}
                  </span>
                ))}
                {activeJob.skills.length > 3 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/60 text-zinc-400">
                    +{activeJob.skills.length - 3}
                  </span>
                )}

                <button
                  onClick={handleOpenApply}
                  className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-0.5 cursor-pointer underline underline-offset-2"
                >
                  <Info className="w-3.5 h-3.5 mr-0.5" />
                  <span>Apply Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swipe Action Controls (X, Star, Heart) */}
      <div className="flex items-center justify-center space-x-6 py-3">
        {/* Pass / Discard Button */}
        <button
          onClick={() => handleNext('pass')}
          className="w-14 h-14 rounded-full bg-zinc-900 border border-rose-500/40 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-[0_4px_18px_rgba(244,63,94,0.25)] active:scale-90 cursor-pointer"
          title="Pass Job (or press ← Left Arrow)"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Super / Save Star Button */}
        <button
          onClick={() => {
            if (activeJob) toggleSaveJob(activeJob.id);
            handleNext('star');
          }}
          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
            isSaved
              ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(255,180,0,0.5)]'
              : 'bg-zinc-900 border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black shadow-[0_4px_16px_rgba(255,180,0,0.2)]'
          }`}
          title="Bookmark or Favorite (or press ↑ / Space)"
        >
          <Star className="w-5 h-5 fill-current" />
        </button>

        {/* Apply / Like Heart Button */}
        <button
          onClick={handleOpenApply}
          className="w-14 h-14 rounded-full bg-zinc-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_4px_18px_rgba(16,185,129,0.25)] active:scale-90 cursor-pointer"
          title="Apply to Job (or press → Right Arrow)"
        >
          <Heart className="w-6 h-6 fill-current stroke-[2]" />
        </button>
      </div>

      {/* Keyboard Shortcut Indicator Badge */}
      <div className="flex items-center justify-center space-x-2 text-[10px] text-zinc-500 mb-2">
        <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">←</span>
        <span>Pass</span>
        <span className="text-zinc-700">•</span>
        <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">↑ / Space</span>
        <span>Save</span>
        <span className="text-zinc-700">•</span>
        <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">→</span>
        <span>Apply</span>
      </div>

      {/* Quick Apply Proposal Modal */}
      {showApplyModal && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13131a] rounded-3xl border border-zinc-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-wider">Quick Proposal</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Apply to {activeJob.title}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Budget: <span className="text-amber-400 font-semibold">₱{activeJob.budget.toLocaleString()}</span> ({activeJob.budgetUnit})
            </p>

            {/* Quick Prompts */}
            <div className="mb-3">
              <span className="text-[10px] text-zinc-400 block mb-1">Quick prompts:</span>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProposalText(prev => prev ? `${prev} ${p}` : p)}
                    className="text-[10px] bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 px-2 py-0.5 rounded-lg border border-zinc-700 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Pitch / Proposal
                </label>
                <textarea
                  required
                  rows={3}
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="I can help with this task! I am an MSU-IIT student with experience in..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Proposed Rate (₱)
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. 1-2 days"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full amber-glow-btn py-3 rounded-xl font-bold text-xs sm:text-sm text-black flex items-center justify-center space-x-1.5 shadow-lg mt-2 cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Send Proposal & Apply</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};