'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Users, 
  FileText, 
  User as UserIcon, 
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import Image from 'next/image';

type TabType = 'landing' | 'home' | 'jobs' | 'post' | 'connect' | 'agreement' | 'profile' | 'admin' | 'compute';

export const BottomDock: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isAuthenticated } = useApp();

  const baseTabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Find Gigs', icon: Search },
    { id: 'home', label: 'Swipe', icon: Sparkles },
    { id: 'post', label: 'Post Gig', icon: PlusSquare },
    { id: 'connect', label: 'Collab', icon: Users },
    { id: 'agreement', label: 'Agreements', icon: FileText },
    { id: 'compute', label: 'Cloud', icon: Cpu },
  ];

  if (currentUser.role === 'admin') {
    baseTabs.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  baseTabs.push({ id: 'profile', label: 'Profile', icon: UserIcon });

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-40 flex justify-center px-2 sm:px-4 pointer-events-none">
      <nav 
        aria-label="Bottom Navigation"
        className="pointer-events-auto flex items-center space-x-0.5 sm:space-x-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-[#101016]/95 border border-zinc-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.12)] backdrop-blur-xl max-w-full overflow-x-auto scrollbar-none"
      >
        {baseTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isProfile = tab.id === 'profile';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center px-2 sm:px-3.5 py-1 rounded-full transition-all duration-150 group cursor-pointer ${
                isActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isProfile && isAuthenticated ? (
                <div className={`relative w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden transition-transform group-hover:scale-105 ${
                  isActive ? 'ring-2 ring-amber-400' : 'ring-1 ring-zinc-700'
                }`}>
                  <Image 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              ) : (
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-amber-400 stroke-[2.5]' : 'stroke-[1.75]'
                }`} />
              )}

              <span className="text-[10px] mt-0.5 tracking-tight hidden sm:block whitespace-nowrap">
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -bottom-0.5 shadow-[0_0_8px_rgba(255,180,0,0.9)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
