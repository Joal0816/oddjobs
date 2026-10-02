'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { LandingPage } from '@/components/LandingPage';
import { SwipeHome } from '@/components/SwipeHome';
import { JobListings } from '@/components/JobListings';
import { RandomConnect } from '@/components/RandomConnect';
import { PostJob } from '@/components/PostJob';
import { AgreementView } from '@/components/AgreementView';
import { ProfileView } from '@/components/ProfileView';
import { AdminDashboard } from '@/components/AdminDashboard';
import { EdgeCloudConsole } from '@/components/EdgeCloudConsole';
import { BottomDock } from '@/components/BottomDock';
import { AuthModal } from '@/components/AuthModal';
import { Toast } from '@/components/Toast';
import { ReviewModal } from '@/components/ReviewModal';
import { QuickPersonaSwitcher } from '@/components/QuickPersonaSwitcher';

export default function MainApp() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#08080a] text-foreground flex flex-col relative selection:bg-amber-500 selection:text-black">
      {/* Dynamic View rendering */}
      {activeTab === 'landing' && <LandingPage />}
      {activeTab === 'home' && <SwipeHome />}
      {activeTab === 'jobs' && <JobListings />}
      {activeTab === 'connect' && <RandomConnect />}
      {activeTab === 'post' && <PostJob />}
      {activeTab === 'agreement' && <AgreementView />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'admin' && <AdminDashboard />}
      {activeTab === 'compute' && <EdgeCloudConsole />}

      {/* Floating Demo Persona Switcher (Student / Requester / Admin) */}
      <QuickPersonaSwitcher />

      {/* Floating Bottom Navigation Capsule Dock */}
      <BottomDock />

      {/* Instant Review & Rating Modal */}
      <ReviewModal />

      {/* Functional Auth Modal (Sign In / Sign Up) */}
      <AuthModal />

      {/* Global Interactive Notification Toasts */}
      <Toast />
    </div>
  );
}
