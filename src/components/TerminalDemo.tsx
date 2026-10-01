'use client';

import React from 'react';
import { Terminal, ShieldCheck, FileCheck2, Coins } from 'lucide-react';

export const TerminalDemo: React.FC = () => {
  return (
    <div className="w-full my-8 p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 text-xs">
      <div className="flex items-center space-x-2 text-zinc-400 mb-4 pb-3 border-b border-zinc-800">
        <Terminal className="w-4 h-4 text-amber-400" />
        <span className="font-mono text-xs text-white">oddjobs platform workflow</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px]">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold">1. Verified Auth</span>
          </div>
          <p className="text-zinc-400">@g.msuiit.edu.ph institutional identity</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center space-x-1.5 text-amber-400 mb-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span className="font-bold">2. Digital Agreement</span>
          </div>
          <p className="text-zinc-400">Escrow locked before work starts</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center space-x-1.5 text-sky-400 mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span className="font-bold">3. Instant Payout</span>
          </div>
          <p className="text-zinc-400">Deliverable approved & released</p>
        </div>
      </div>
    </div>
  );
};
