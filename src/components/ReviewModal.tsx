'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Star, ShieldCheck, X, Sparkles, Send, MessageSquare } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { reviewModalState, closeReviewModal, addReview, currentUser } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  if (!reviewModalState || !reviewModalState.isOpen) {
    return null;
  }

  const { toUserId, toUserName, jobTitle, agreementId } = reviewModalState;

  const quickPills = [
    '⚡ Lightning Fast Turnaround',
    '🎯 Exceeded Deliverables',
    '🤝 Clear & Prompt Communication',
    '💎 Production-Ready Quality',
    '⭐ Highly Recommended Peer',
  ];

  const handleAddQuickTag = (tag: string) => {
    setComment(prev => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev} ${tag}` : tag;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      jobId: agreementId || 'job_prev_1',
      jobTitle: jobTitle || 'Campus Task Delivery',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar,
      toUserId,
      toUserName,
      rating,
      comment: comment.trim(),
      role: currentUser.role === 'requester' || currentUser.role === 'organization' ? 'requester' : 'student',
    });

    setComment('');
    setRating(5);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return '5.0 - Exceptional & Flawless! 🌟';
      case 4:
        return '4.0 - Very Good & Exceeded Expectations 👍';
      case 3:
        return '3.0 - Met Agreed Deliverables 👌';
      case 2:
        return '2.0 - Needed Several Revisions ⚠️';
      case 1:
        return '1.0 - Deliverables Incomplete / Unsatisfactory ❌';
      default:
        return 'Select Star Rating';
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121218] border border-amber-500/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 relative z-10">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">Campus Signoff & Review</h3>
              <p className="text-[11px] text-zinc-400 font-medium">MSU-IIT Verified Peer Rating System</p>
            </div>
          </div>
          <button
            onClick={closeReviewModal}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target summary banner */}
        <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Reviewing Party</span>
            <h4 className="font-bold text-sm text-white">{toUserName}</h4>
            <p className="text-[11px] text-zinc-400 truncate max-w-[280px]">Task: {jobTitle}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
            Escrow Released
          </span>
        </div>

        {/* Star Rating Section */}
        <div className="space-y-2 text-center py-2 relative z-10">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Select Campus Rating
          </label>
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeRating;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer group"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                        : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-amber-300 font-semibold h-4 transition-all">
            {getRatingLabel(activeRating)}
          </p>
        </div>

        {/* Quick Tag Recommendations */}
        <div className="space-y-1.5 relative z-10">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Campus Commendations:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPills.map((pill, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleAddQuickTag(pill)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:text-amber-300 text-zinc-400 transition-colors cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Testimonial / Feedback *</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your experience with this student worker or campus organization..."
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={closeReviewModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              className="amber-glow-btn px-5 py-2 rounded-xl text-xs font-bold text-black flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Submit Verified Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
