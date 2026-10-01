'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  GraduationCap, 
  Building2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    authModalTab, 
    closeAuthModal, 
    loginWithCredentials, 
    registerUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(authModalTab);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [role, setRole] = useState<'student' | 'requester'>('student');
  const [course, setCourse] = useState('BS Computer Applications');
  const [signUpPassword, setSignUpPassword] = useState('');

  useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMsg('');
  }, [authModalTab, authModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleAppendDomain = (isSignUp: boolean) => {
    const domain = '@g.msuiit.edu.ph';
    if (isSignUp) {
      const clean = signUpEmail.split('@')[0];
      setSignUpEmail(`${clean}${domain}`);
    } else {
      const clean = signInEmail.split('@')[0];
      setSignInEmail(`${clean}${domain}`);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!signInEmail.trim()) {
      setErrorMsg('Please enter your institutional email.');
      return;
    }
    const res = loginWithCredentials(signInEmail, signInPassword);
    if (!res.success) {
      setErrorMsg(res.message || 'Invalid credentials.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMsg('Please enter a valid institutional email.');
      return;
    }
    registerUser({
      name: fullName.trim(),
      email: signUpEmail.trim().toLowerCase(),
      role: role,
      course: role === 'requester' ? 'Campus Requester' : course,
      university: 'MSU-IIT',
      yearLevel: role === 'requester' ? 'Campus Unit' : '3rd Year',
      password: signUpPassword
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div 
        className="w-full max-w-md bg-[#0f0f14] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">MSU-IIT Campus Auth</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {activeTab === 'signin' ? 'Welcome back' : 'Join oddJobs'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {activeTab === 'signin' 
              ? 'Sign in to access your gigs, agreements, and campus payouts.'
              : 'Create your campus account with your @g.msuiit.edu.ph email.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Campus Email</label>
                <button
                  type="button"
                  onClick={() => handleAppendDomain(false)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
                >
                  + @g.msuiit.edu.ph
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@g.msuiit.edu.ph"
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full amber-glow-btn py-3 rounded-xl font-bold text-xs text-black flex items-center justify-center space-x-2 shadow-lg mt-2 cursor-pointer"
            >
              <span>Sign In to oddJobs</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">Institutional Email</label>
                <button
                  type="button"
                  onClick={() => handleAppendDomain(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300"
                >
                  + @g.msuiit.edu.ph
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="student@g.msuiit.edu.ph"
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-colors cursor-pointer ${
                    role === 'student'
                      ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Student Worker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('requester')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-colors cursor-pointer ${
                    role === 'requester'
                      ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Requester / Org</span>
                </button>
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">College Course</label>
                <input
                  type="text"
                  placeholder="e.g. BS Computer Applications"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={signUpPassword}
                onChange={e => setSignUpPassword(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full amber-glow-btn py-3 rounded-xl font-bold text-xs text-black flex items-center justify-center space-x-2 shadow-lg mt-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* Quick Start */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <p className="text-[11px] font-semibold text-zinc-400 mb-2.5">
            Quick Start
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setSignInEmail('charles.caballes@g.msuiit.edu.ph');
                setSignInPassword('password123');
              }}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-left transition-colors cursor-pointer group"
            >
              <p className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">
                Student
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                Charles C.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSignInEmail('ssc@g.msuiit.edu.ph');
                setSignInPassword('password123');
              }}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-left transition-colors cursor-pointer group"
            >
              <p className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">
                Requester
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                SSC MSU-IIT
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSignInEmail('admin@g.msuiit.edu.ph');
                setSignInPassword('password123');
              }}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-left transition-colors cursor-pointer group"
            >
              <p className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">
                Admin
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                Moderator
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
