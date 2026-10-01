'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  MapPin, 
  Clock, 
  Coins, 
  Bookmark, 
  PlusCircle, 
  Briefcase, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Send, 
  ArrowRight
} from 'lucide-react';
import { Job } from '@/types';
import Image from 'next/image';

export const JobListings: React.FC = () => {
  const { 
    jobs, 
    savedJobIds, 
    toggleSaveJob, 
    applyToJob, 
    setActiveTab, 
    selectedJob, 
    setSelectedJob 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalJob, setModalJob] = useState<Job | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [customBid, setCustomBid] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState('1-2 days');
  const [hasApplied, setHasApplied] = useState(false);

  // Sync selectedJob from Landing or other views
  useEffect(() => {
    if (selectedJob) {
      handleOpenDetailModal(selectedJob);
    }
  }, [selectedJob]);

  const categories = [
    'All',
    'Web Development',
    'Graphic Design',
    'Photography',
    'Academic Tutoring',
    'Event Support',
    'Errands & Logistics'
  ];

  const quickPrompts = [
    'Available immediately on campus',
    'Experienced with similar projects',
    'Can deliver initial draft in 24 hours',
    'Flexible with schedule and revisions'
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenDetailModal = (job: Job) => {
    setModalJob(job);
    setCustomBid(job.budget);
    setProposalText('');
    setEstimatedTime(job.schedule || '1-2 days');
    setHasApplied(false);
  };

  const handleCloseModal = () => {
    setModalJob(null);
    setSelectedJob(null);
    setHasApplied(false);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalJob) return;

    const ok = applyToJob(
      modalJob.id,
      proposalText.trim() || 'Ready to deliver quality results for this campus gig promptly.',
      customBid || modalJob.budget,
      estimatedTime
    );
    if (ok) {
      setHasApplied(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 text-white w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs uppercase font-extrabold tracking-wider">Campus Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Browse Campus Gigs
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified gigs from MSU-IIT students, organizations, and university departments.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('post')}
          className="amber-glow-btn px-4 py-2.5 rounded-full text-black font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Post a Task</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by gig title, skills (Laravel, Figma, Math...), or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black font-bold shadow-sm'
                    : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Gigs Count */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 px-1">
        <span>Showing <strong className="text-white">{filteredJobs.length}</strong> available gigs</span>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center text-zinc-400 text-xs">
            <p className="font-semibold text-zinc-300">No gigs match your search or filter.</p>
            <p className="mt-1">Try searching different keywords or resetting the category.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            return (
              <div
                key={job.id}
                onClick={() => handleOpenDetailModal(job)}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-lg cursor-pointer"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {job.category}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSaved ? 'text-amber-400 bg-amber-500/15' : 'text-zinc-500 hover:text-white'
                      }`}
                      title={isSaved ? 'Saved' : 'Save Gig'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {job.title}
                  </h3>

                  {/* Requester Info */}
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                      <Image
                        src={job.requesterAvatar}
                        alt={job.requesterName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-zinc-400 truncate">
                      {job.requesterOrg || job.requesterName}
                    </span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-zinc-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {job.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-amber-400 font-extrabold flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>₱{job.budget.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">/{job.budgetUnit}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center space-x-2 mt-0.5">
                      <span className="flex items-center space-x-0.5">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>{job.location}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{job.postedAt}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetailModal(job);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-800 group-hover:bg-amber-400 group-hover:text-black transition-all cursor-pointer shadow-sm"
                  >
                    View & Apply
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clean Detail & Application Modal */}
      {modalJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div 
            className="w-full max-w-xl bg-[#0f0f14] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {modalJob.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium px-2 py-0.5 rounded-full bg-zinc-800">
                    {modalJob.jobType}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {modalJob.title}
                </h2>
                <div className="text-lg font-black text-amber-400 mt-1">
                  ₱{modalJob.budget.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">/{modalJob.budgetUnit}</span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Requester Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-amber-500/40">
                    <Image
                      src={modalJob.requesterAvatar}
                      alt={modalJob.requesterName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>{modalJob.requesterName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    </h4>
                    <p className="text-[11px] text-zinc-400">{modalJob.requesterOrg || 'MSU-IIT Unit'}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-zinc-400">
                  <span className="font-semibold text-emerald-400">Verified Requester</span>
                </div>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Location</span>
                  <div className="flex items-center space-x-1 text-zinc-200 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{modalJob.location}</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Schedule</span>
                  <div className="flex items-center space-x-1 text-zinc-200 mt-0.5 truncate">
                    <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{modalJob.schedule}</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Deadline</span>
                  <div className="flex items-center space-x-1 text-zinc-200 mt-0.5 truncate">
                    <Calendar className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{modalJob.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Task Description */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60">
                  {modalJob.description}
                </p>
              </div>

              {/* Skills Needed */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {modalJob.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-amber-300 border border-amber-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Form */}
              <div className="pt-4 border-t border-zinc-800">
                {hasApplied ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Application Submitted!</h4>
                      <p className="text-xs text-zinc-300 mt-1">
                        Your proposal was sent to the requester. You can track agreement status in the Agreements tab.
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-3 pt-1">
                      <button
                        onClick={() => {
                          handleCloseModal();
                          setActiveTab('agreement');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-black hover:bg-amber-300 transition-colors cursor-pointer"
                      >
                        View Agreements & Applications
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Apply to this Gig</span>
                    </h4>

                    {/* Quick prompts */}
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProposalText(prev => prev ? `${prev} ${p}` : p)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-amber-500/15 hover:text-amber-300 border border-zinc-800 text-zinc-400 transition-colors cursor-pointer"
                        >
                          + {p}
                        </button>
                      ))}
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        required
                        placeholder="Briefly state your qualifications and availability for this task..."
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">Your Proposed Rate (₱)</label>
                        <input
                          type="number"
                          min={50}
                          required
                          value={customBid}
                          onChange={(e) => setCustomBid(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">Delivery Time</label>
                        <select
                          value={estimatedTime}
                          onChange={(e) => setEstimatedTime(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Same day / Within 8 hrs">Same day / Within 8 hrs</option>
                          <option value="1-2 days">1-2 days</option>
                          <option value="3-5 days">3-5 days</option>
                          <option value="Flexible / As agreed">Flexible / As agreed</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full amber-glow-btn py-3 rounded-xl font-bold text-xs text-black flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                    >
                      <span>Submit Proposal for ₱{customBid.toLocaleString()}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
