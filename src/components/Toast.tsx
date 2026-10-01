'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  X,
  Sparkles
} from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4200);

    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const getTheme = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40',
          glow: 'shadow-[0_10px_35px_rgba(16,185,129,0.28)]',
          badgeBg: 'bg-emerald-500/15',
          progressColor: 'bg-emerald-400',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          glow: 'shadow-[0_10px_35px_rgba(244,63,94,0.28)]',
          badgeBg: 'bg-rose-500/15',
          progressColor: 'bg-rose-400',
        };
      case 'warning':
        return {
          icon: ShieldCheck,
          iconColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          glow: 'shadow-[0_10px_35px_rgba(245,158,11,0.28)]',
          badgeBg: 'bg-amber-500/15',
          progressColor: 'bg-amber-400',
        };
      case 'info':
      default:
        return {
          icon: Sparkles,
          iconColor: 'text-sky-400',
          borderColor: 'border-sky-500/40',
          glow: 'shadow-[0_10px_35px_rgba(14,165,233,0.28)]',
          badgeBg: 'bg-sky-500/15',
          progressColor: 'bg-sky-400',
        };
    }
  };

  const theme = getTheme();
  const IconComp = theme.icon;

  return (
    <aside 
      aria-label="Notification"
      className="fixed top-5 inset-x-4 sm:inset-x-auto sm:right-6 z-[100] flex justify-center sm:justify-end pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300"
    >
      <div 
        role="status"
        aria-live="polite"
        className={`pointer-events-auto max-w-md w-full rounded-2xl glass-panel-elevated bg-[#101016]/95 border ${theme.borderColor} ${theme.glow} p-4 text-white overflow-hidden relative backdrop-blur-2xl`}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl ${theme.badgeBg} flex-shrink-0 mt-0.5 border ${theme.borderColor}`}>
            <IconComp className={`w-5 h-5 ${theme.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
              <span>{toast.title}</span>
            </h4>
            {toast.message && (
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={hideToast}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dismissal progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-zinc-800 overflow-hidden">
          <div 
            className={`h-full ${theme.progressColor} animate-[shrink_4.2s_linear_forwards]`}
          />
        </div>
      </div>
    </aside>
  );
};
