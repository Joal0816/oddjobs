'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck } from 'lucide-react';
import { CAMPUS_TESTIMONIALS } from '@/data/mockData';

export const CampusReviews: React.FC = () => {
  // Show top 3 authentic campus testimonials
  const featuredTestimonials = CAMPUS_TESTIMONIALS.slice(0, 3);

  return (
    <section className="mt-16 sm:mt-24 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">Campus Trust & Reputation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verified Experiences
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Real feedback from MSU-IIT students and student organizations completing gigs with protected escrow.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs text-zinc-300">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <span className="font-bold text-white">4.9/5.0</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">100% Payout Rate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {featuredTestimonials.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              {/* Header with Avatar & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-amber-500/40">
                    <Image
                      src={item.reviewerAvatar}
                      alt={item.reviewerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">
                      {item.reviewerName}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {item.department}
                    </p>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(Math.max(1, Math.min(5, Math.round(item.rating || 5))))].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p className="text-xs text-zinc-300 leading-relaxed italic mb-4">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            {/* Gig Info Footer */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 truncate max-w-[160px]">
                {item.gigTitle}
              </span>
              <span className="font-bold text-amber-400 flex-shrink-0">
                ₱{item.payoutAmount.toLocaleString()} paid
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
