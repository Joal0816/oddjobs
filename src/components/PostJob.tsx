'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PlusCircle, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { Job } from '@/types';

export const PostJob: React.FC = () => {
  const { postJob, setActiveTab } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Job['category']>('Web Development');
  const [jobType, setJobType] = useState<Job['jobType']>('Gig');
  const [budget, setBudget] = useState(500);
  const [budgetUnit, setBudgetUnit] = useState<Job['budgetUnit']>('job');
  const [location, setLocation] = useState('MSU-IIT Campus');
  const [schedule, setSchedule] = useState('Flexible');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('Laravel, Tailwind CSS, Blade');
  const [deadline, setDeadline] = useState('Oct 20, 2026');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    postJob({
      title,
      category,
      jobType,
      budget: Number(budget),
      budgetUnit,
      location,
      schedule,
      description,
      skills,
      deadline,
      image: image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80'
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 text-white w-full selection:bg-amber-500 selection:text-black">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Student Workforce</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Post a Task or Gig
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Publish a task for MSU-IIT students. Agree on terms, track progress, and pay upon approved completion.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('jobs')}
          className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1 py-1 px-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Graphic Designer for College Week, Event Photographer, Math Tutor..."
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        {/* Category & Job Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Job['category'])}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="Web Development">Web Development</option>
              <option value="Photography">Photography</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Academic Tutoring">Academic Tutoring</option>
              <option value="Event Support">Event Support</option>
              <option value="Errands & Logistics">Errands & Logistics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Job Type *
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as Job['jobType'])}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="Gig">Gig (One-time)</option>
              <option value="Part-time">Part-time</option>
              <option value="Recurring">Recurring</option>
            </select>
          </div>
        </div>

        {/* Budget & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Budget (₱ PHP) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-amber-400 font-bold">₱</span>
              <input
                type="number"
                required
                min={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-2.5 text-xs sm:text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Budget Rate *
            </label>
            <select
              value={budgetUnit}
              onChange={(e) => setBudgetUnit(e.target.value as Job['budgetUnit'])}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-all"
            >
              <option value="job">Per Job / Project</option>
              <option value="day">Per Day</option>
              <option value="hour">Per Hour</option>
            </select>
          </div>
        </div>

        {/* Location & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Location / Campus Area *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. MSU-IIT Gym, CASS, Remote"
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Schedule / Turnaround *
            </label>
            <input
              type="text"
              required
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Flexible, 4 hours, Weekends"
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Target Completion Deadline
          </label>
          <input
            type="text"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g. Oct 25, 2026 or Flexible"
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Task Scope & Requirements *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what needs to be done, specific deliverables, and expectations..."
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Required Skills (comma separated)
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. Laravel, MySQL, Figma, Photography"
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Banner Cover Image Preset */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Cover Photo Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '💻 Code / Laptop', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80' },
              { label: '📷 Camera / Photo', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' },
              { label: '🎨 Design / Creative', url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80' },
            ].map(preset => (
              <button
                type="button"
                key={preset.label}
                onClick={() => setImage(preset.url)}
                className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  image === preset.url
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            By posting, you agree to student workforce safety policies. Hired applicants automatically initiate a binding Digital Job Agreement with safe milestone recording.
          </span>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl amber-glow-btn text-black font-bold text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>Publish Task to Marketplace</span>
        </button>
      </form>
    </div>
  );
};