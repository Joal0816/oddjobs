'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronDown, Check } from 'lucide-react';

export const QuickPersonaSwitcher: React.FC = () => {
  const { currentUser, switchAccount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const personas = [
    {
      id: 'user_charles',
      roleKey: 'student',
      label: 'Student',
      name: 'Charles Caballes',
      subtext: 'BSCA 3rd Year',
      emoji: '🎓',
    },
    {
      id: 'org_ssc',
      roleKey: 'requester',
      label: 'Campus Requester',
      name: 'Supreme Student Council',
      subtext: 'MSU-IIT Org',
      emoji: '🏛️',
    },
    {
      id: 'admin_msuiit',
      roleKey: 'admin',
      label: 'Campus Admin',
      name: 'Student Affairs',
      subtext: 'Arbitrator & Moderator',
      emoji: '🛡️',
    }
  ];

  const activePersona = personas.find(
    p => p.id === currentUser.id || p.roleKey === currentUser.role
  ) || personas[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className="fixed bottom-20 right-4 sm:right-6 z-40 select-none text-xs"
    >
      {isOpen && (
        <div className="mb-2 w-64 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-xl p-1.5 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800/80">
            Switch Active Role
          </div>
          {personas.map((persona) => {
            const isActive = currentUser.id === persona.id || currentUser.role === persona.roleKey;
            return (
              <button
                key={persona.id}
                onClick={() => {
                  switchAccount(persona.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-base flex-shrink-0">{persona.emoji}</span>
                  <div className="truncate">
                    <p className="font-semibold text-xs text-white leading-tight">{persona.name}</p>
                    <p className="text-[10px] text-zinc-400 leading-tight">{persona.label} • {persona.subtext}</p>
                  </div>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger Button - Clean & Unobtrusive */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white shadow-lg backdrop-blur-md transition-all cursor-pointer group"
      >
        <span className="text-sm">{activePersona.emoji}</span>
        <span className="text-[11px] font-medium text-zinc-200 group-hover:text-amber-300">
          {activePersona.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
