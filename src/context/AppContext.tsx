'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Job, User, Application, DigitalAgreement, DisputeCase, VerificationItem, Review } from '@/types';
import { 
  CURRENT_USER, 
  STUDENT_DEMO, 
  REQUESTER_DEMO, 
  ADMIN_DEMO, 
  DEMO_ACCOUNTS, 
  INITIAL_JOBS, 
  INITIAL_AGREEMENTS,
  INITIAL_DISPUTES,
  INITIAL_VERIFICATIONS,
  INITIAL_REVIEWS
} from '@/data/mockData';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  demoAccounts: User[];
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password?: string) => { success: boolean; message?: string };
  registerUser: (userData: Partial<User> & { password?: string }) => void;
  logout: () => void;
  switchAccount: (roleOrId: string) => void;
  toast: ToastMessage | null;
  showToast: (toast: { type?: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => void;
  hideToast: () => void;
  jobs: Job[];
  savedJobIds: string[];
  applications: Application[];
  agreements: DigitalAgreement[];
  disputes: DisputeCase[];
  verifications: VerificationItem[];
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  reviewModalState: { isOpen: boolean; agreementId?: string; toUserId: string; toUserName: string; jobTitle: string } | null;
  openReviewModal: (params: { agreementId?: string; toUserId: string; toUserName: string; jobTitle: string }) => void;
  closeReviewModal: () => void;
  activeTab: 'landing' | 'home' | 'jobs' | 'post' | 'connect' | 'agreement' | 'profile' | 'admin';
  setActiveTab: (tab: 'landing' | 'home' | 'jobs' | 'post' | 'connect' | 'agreement' | 'profile' | 'admin') => void;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  toggleSaveJob: (jobId: string) => void;
  postJob: (job: Omit<Job, 'id' | 'postedAt' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'applicantCount' | 'status'>) => void;
  applyToJob: (jobId: string, proposal: string, proposedPrice: number, estimatedTime: string) => boolean;
  createAgreement: (jobId: string, applicant: Application, deliverables: string[], revisionTerms: string, paymentMethod: 'GCash' | 'Cash on Campus' | 'Simulated Protected Payment') => void;
  completeAgreement: (agreementId: string, submissionUrl: string, notes: string) => void;
  confirmPayment: (agreementId: string) => void;
  disputeAgreement: (agreementId: string, reason: string) => void;
  resolveDispute: (disputeId: string, resolution: 'release_worker' | 'refund_requester' | 'split') => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string) => void;
  requestStudentVerification: (idNumber: string) => void;
  verifyStudent: (studentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job_1']);
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'app_1',
      jobId: 'job_1',
      applicantId: 'user_charles',
      applicantName: 'Charles Caballes',
      applicantAvatar: STUDENT_DEMO.avatar,
      applicantCourse: 'BS Computer Applications - 3rd Year',
      applicantRating: 4.9,
      proposal: 'Hi! I have 2+ years building Laravel APIs and Blade frontends. Built several IIT project systems.',
      proposedPrice: 800,
      estimatedTime: '2 days',
      status: 'pending',
      appliedAt: '2h ago'
    }
  ]);
  const [agreements, setAgreements] = useState<DigitalAgreement[]>(INITIAL_AGREEMENTS);
  const [disputes, setDisputes] = useState<DisputeCase[]>(INITIAL_DISPUTES);
  const [verifications, setVerifications] = useState<VerificationItem[]>(INITIAL_VERIFICATIONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    agreementId?: string;
    toUserId: string;
    toUserName: string;
    jobTitle: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'landing' | 'home' | 'jobs' | 'post' | 'connect' | 'agreement' | 'profile' | 'admin'>('landing');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const showToast = useCallback((toastData: { type?: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string }) => {
    setToast({
      id: `toast_${Date.now()}`,
      type: toastData.type || 'info',
      title: toastData.title,
      message: toastData.message
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oddjobs_saved_ids');
      if (saved) setSavedJobIds(JSON.parse(saved));

      const localJobs = localStorage.getItem('oddjobs_jobs');
      if (localJobs) setJobs(JSON.parse(localJobs));

      const storedUser = localStorage.getItem('oddjobs_current_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      const storedReviews = localStorage.getItem('oddjobs_reviews');
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }

      const storedAuth = localStorage.getItem('oddjobs_is_authenticated');
      if (storedAuth !== null) {
        setIsAuthenticated(storedAuth === 'true');
      } else {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const openAuthModal = useCallback((tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    try {
      localStorage.setItem('oddjobs_current_user', JSON.stringify(user));
      localStorage.setItem('oddjobs_is_authenticated', 'true');
    } catch {}

    const roleName = user.role === 'admin' 
      ? 'Campus Moderator' 
      : user.role === 'requester' || user.role === 'organization'
      ? 'Campus Requester' 
      : 'Student Worker';

    showToast({
      type: 'success',
      title: `Welcome back, ${user.name}!`,
      message: `Signed in as ${roleName} (${user.email})`
    });
  }, [showToast]);

  const loginWithCredentials = useCallback((email: string, password?: string): { success: boolean; message?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const hasPassword = Boolean(password && password.length > 0);
    // Silent check on password for non-demo logins
    void hasPassword;

    // Check pre-configured demo accounts
    const matchedDemo = DEMO_ACCOUNTS.find(acc => acc.email.toLowerCase() === trimmedEmail);
    if (matchedDemo) {
      login(matchedDemo);
      return { success: true };
    }

    // Check custom registered users from localStorage
    try {
      const storedUsersRaw = localStorage.getItem('oddjobs_registered_users');
      if (storedUsersRaw) {
        const registeredUsers: User[] = JSON.parse(storedUsersRaw);
        const found = registeredUsers.find(u => u.email.toLowerCase() === trimmedEmail);
        if (found) {
          login(found);
          return { success: true };
        }
      }
    } catch {}

    // If it is an institutional or valid email, auto-create a user session
    if (trimmedEmail.includes('@')) {
      const isMSU = trimmedEmail.endsWith('@g.msuiit.edu.ph');
      const emailPrefix = trimmedEmail.split('@')[0];
      const cleanName = emailPrefix
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: cleanName || 'MSU-IIT Student',
        avatar: isMSU
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        university: 'MSU-IIT',
        campus: 'Mindanao State University - Iligan Institute of Technology',
        course: 'BS Computer Applications',
        yearLevel: '3rd Year',
        email: trimmedEmail,
        isVerified: isMSU,
        role: 'student',
        rating: 5.0,
        reviewCount: 1,
        completedJobsCount: 0,
        skills: ['Laravel', 'Web Development', 'Student Collaboration'],
        bio: `${cleanName} at MSU-IIT. Ready for campus gigs, tasks, and oddjobs!`,
        availability: 'Available',
        interests: ['Tech', 'Campus Life', 'Startups']
      };

      try {
        const storedUsersRaw = localStorage.getItem('oddjobs_registered_users');
        const list: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        list.push(newUser);
        localStorage.setItem('oddjobs_registered_users', JSON.stringify(list));
      } catch {}

      login(newUser);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Please provide a valid institutional email or select a Demo Account.' 
    };
  }, [login]);

  const registerUser = useCallback((userData: Partial<User> & { password?: string }) => {
    const isMSU = (userData.email || '').toLowerCase().endsWith('@g.msuiit.edu.ph');
    const role = userData.role || 'student';

    const defaultAvatar = role === 'admin'
      ? ADMIN_DEMO.avatar
      : role === 'requester' || role === 'organization'
      ? REQUESTER_DEMO.avatar
      : STUDENT_DEMO.avatar;

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name || 'MSU-IIT Scholar',
      avatar: userData.avatar || defaultAvatar,
      university: userData.university || 'MSU-IIT',
      campus: userData.campus || 'Mindanao State University - Iligan Institute of Technology',
      course: userData.course || (role === 'requester' ? 'Campus Organization' : 'BS Computer Applications'),
      yearLevel: userData.yearLevel || (role === 'requester' ? 'Campus Unit' : '1st Year'),
      email: userData.email || 'student@g.msuiit.edu.ph',
      isVerified: isMSU,
      role: role,
      rating: 5.0,
      reviewCount: 0,
      completedJobsCount: 0,
      skills: userData.skills || ['Campus Task Assistance', 'Google Workspace', 'Communication'],
      bio: userData.bio || `Active member of the MSU-IIT campus community. Ready for odd jobs and collaborative projects.`,
      availability: 'Available',
      interests: ['Campus Life', 'Tech', 'Networking', 'Learning']
    };

    try {
      const storedUsersRaw = localStorage.getItem('oddjobs_registered_users');
      const list: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      list.push(newUser);
      localStorage.setItem('oddjobs_registered_users', JSON.stringify(list));
    } catch {}

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);

    try {
      localStorage.setItem('oddjobs_current_user', JSON.stringify(newUser));
      localStorage.setItem('oddjobs_is_authenticated', 'true');
    } catch {}

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    showToast({
      type: 'success',
      title: 'Registration Successful!',
      message: `Welcome, ${newUser.name}! Your account is now active.`
    });
  }, [showToast]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('oddjobs_is_authenticated', 'false');
    } catch {}

    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been signed out of oddJobs. Sign in anytime to post or apply.'
    });
  }, [showToast]);

  const switchAccount = useCallback((roleOrId: string) => {
    let target = STUDENT_DEMO;
    let personaDetails = '🎓 Student: Charles Caballes (BSCA 3rd Year) • Can browse jobs, apply to gigs, and submit deliverables.';
    if (roleOrId === 'requester' || roleOrId === 'org_ssc' || roleOrId === 'organization') {
      target = REQUESTER_DEMO;
      personaDetails = '🏛️ Campus Requester: Supreme Student Council • Can commission gigs, review work, and release escrow.';
    } else if (roleOrId === 'admin' || roleOrId === 'admin_msuiit') {
      target = ADMIN_DEMO;
      personaDetails = '🛡️ Moderator / Admin: MSU-IIT Student Affairs • Can verify student IDs and arbitrate dispute cases.';
    } else if (roleOrId === 'student' || roleOrId === 'user_charles') {
      target = STUDENT_DEMO;
      personaDetails = '🎓 Student: Charles Caballes (BSCA 3rd Year) • Can browse jobs, apply to gigs, and submit deliverables.';
    } else {
      const found = DEMO_ACCOUNTS.find(acc => acc.id === roleOrId);
      if (found) {
        target = found;
        personaDetails = `Switched to ${target.name} (${target.role})`;
      }
    }

    login(target);
    showToast({
      type: 'info',
      title: `Switched Persona: ${target.name}`,
      message: personaDetails
    });
  }, [login, showToast]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('oddjobs_saved_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const postJob = (newJobData: Omit<Job, 'id' | 'postedAt' | 'requesterId' | 'requesterName' | 'requesterAvatar' | 'applicantCount' | 'status'>) => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      showToast({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in with your MSU-IIT account or a Demo account to post gigs.'
      });
      return;
    }

    const newJob: Job = {
      ...newJobData,
      id: `job_${Date.now()}`,
      postedAt: 'Just now',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterOrg: currentUser.role === 'requester' ? currentUser.name : currentUser.university,
      status: 'open',
      applicantCount: 0,
    };
    const updated = [newJob, ...jobs];
    setJobs(updated);
    try {
      localStorage.setItem('oddjobs_jobs', JSON.stringify(updated));
    } catch {}

    showToast({
      type: 'success',
      title: 'Job Posted Successfully!',
      message: `"${newJob.title}" is now visible to MSU-IIT students.`
    });

    setActiveTab('jobs');
  };

  const applyToJob = (jobId: string, proposal: string, proposedPrice: number, estimatedTime: string): boolean => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      showToast({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in with your MSU-IIT account to apply for campus tasks.'
      });
      return false;
    }

    const newApp: Application = {
      id: `app_${Date.now()}`,
      jobId,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantAvatar: currentUser.avatar,
      applicantCourse: `${currentUser.course} - ${currentUser.yearLevel}`,
      applicantRating: currentUser.rating,
      proposal,
      proposedPrice,
      estimatedTime,
      status: 'pending',
      appliedAt: 'Just now'
    };
    setApplications(prev => [newApp, ...prev]);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j));

    showToast({
      type: 'success',
      title: 'Application Submitted!',
      message: `Your proposal of ₱${proposedPrice.toLocaleString()} was sent to the requester.`
    });
    return true;
  };

  const createAgreement = (
    jobId: string,
    applicant: Application,
    deliverables: string[],
    revisionTerms: string,
    paymentMethod: 'GCash' | 'Cash on Campus' | 'Simulated Protected Payment'
  ) => {
    const targetJob = jobs.find(j => j.id === jobId);
    const newAgreement: DigitalAgreement = {
      id: `agr_${Date.now()}`,
      jobId,
      jobTitle: targetJob?.title || 'Job Agreement',
      requesterId: targetJob?.requesterId || currentUser.id,
      requesterName: targetJob?.requesterName || currentUser.name,
      workerId: applicant.applicantId,
      workerName: applicant.applicantName,
      agreedPrice: applicant.proposedPrice,
      currency: 'PHP',
      deadline: targetJob?.deadline || 'Flexible',
      deliverables,
      revisionTerms,
      paymentMethod,
      paymentStatus: paymentMethod === 'Simulated Protected Payment' ? 'held' : 'pending',
      status: 'active',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setAgreements(prev => [newAgreement, ...prev]);
    setApplications(prev => prev.map(a => a.id === applicant.id ? { ...a, status: 'accepted' } : a));
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'in_progress' } : j));
    
    showToast({
      type: 'success',
      title: 'Digital Agreement Created!',
      message: `Agreement between ${targetJob?.requesterName || currentUser.name} and ${applicant.applicantName} is now active.`
    });

    setActiveTab('agreement');
  };

  const completeAgreement = (agreementId: string, submissionUrl: string, notes: string) => {
    setAgreements(prev => prev.map(a => a.id === agreementId ? {
      ...a,
      status: 'work_submitted',
      submittedWorkUrl: submissionUrl,
      submissionNotes: notes
    } : a));

    showToast({
      type: 'success',
      title: 'Deliverables Submitted!',
      message: 'The requester has been notified to review and release payment.'
    });
  };

  const confirmPayment = (agreementId: string) => {
    setAgreements(prev => prev.map(a => a.id === agreementId ? {
      ...a,
      status: 'completed',
      paymentStatus: 'released'
    } : a));

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    showToast({
      type: 'success',
      title: 'Payment Confirmed & Released!',
      message: 'Escrow payment released to student worker. Agreement complete!'
    });
  };

  const disputeAgreement = (agreementId: string, reason: string) => {
    const targetAgr = agreements.find(a => a.id === agreementId);

    setAgreements(prev => prev.map(a => a.id === agreementId ? {
      ...a,
      status: 'disputed',
      paymentStatus: 'held',
      submissionNotes: reason
    } : a));

    // File case directly into Admin chamber
    const newDispute: DisputeCase = {
      id: `disp_${Date.now()}`,
      jobTitle: targetAgr?.jobTitle || 'MSU-IIT Campus Gig Dispute',
      jobId: targetAgr?.jobId || 'job_prev_1',
      agreementId,
      requesterName: targetAgr?.requesterName || 'Campus Requester',
      workerName: targetAgr?.workerName || 'Student Worker',
      amount: targetAgr?.agreedPrice || 500,
      reason: reason.length > 35 ? `${reason.slice(0, 35)}...` : reason,
      evidence: reason,
      filedAt: 'Just now',
      status: 'pending'
    };

    setDisputes(prev => [newDispute, ...prev]);

    showToast({
      type: 'warning',
      title: 'Dispute Case Filed',
      message: 'MSU-IIT Campus Moderator & Arbitration desk has been notified.'
    });
  };

  const resolveDispute = (disputeId: string, resolution: 'release_worker' | 'refund_requester' | 'split') => {
    const targetDisp = disputes.find(d => d.id === disputeId);
    let note = '';
    if (resolution === 'release_worker') {
      note = 'Admin released 100% of escrow to worker (deliverables satisfied).';
    } else if (resolution === 'refund_requester') {
      note = 'Admin issued full refund to requester (cancellation upheld).';
    } else {
      note = 'Admin mediated 50/50 mutual settlement between parties.';
    }

    setDisputes(prev => prev.map(d => {
      if (d.id !== disputeId) return d;
      return {
        ...d,
        status: resolution === 'split' ? 'split' : 'resolved',
        resolutionNote: note
      };
    }));

    // If linked to an agreement, sync agreement status
    if (targetDisp?.agreementId) {
      setAgreements(prev => prev.map(a => {
        if (a.id !== targetDisp.agreementId) return a;
        return {
          ...a,
          status: 'completed',
          paymentStatus: resolution === 'refund_requester' ? 'paid' : 'released',
          submissionNotes: `Arbitration settled by Campus Admin: ${note}`
        };
      }));
    }

    if (resolution !== 'refund_requester') {
      try {
        confetti({ particleCount: 75, spread: 65 });
      } catch {}
    }

    showToast({
      type: 'success',
      title: 'Dispute Case Resolved',
      message: note
    });
  };

  const approveVerification = (id: string) => {
    setVerifications(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: 'approved' };
      }
      return v;
    }));

    const matched = verifications.find(v => v.id === id);
    if (matched && (matched.studentId === currentUser.id || matched.email === currentUser.email)) {
      const updated = { ...currentUser, isVerified: true };
      setCurrentUser(updated);
      try {
        localStorage.setItem('oddjobs_current_user', JSON.stringify(updated));
      } catch {}
    }

    showToast({
      type: 'success',
      title: 'Student Badge Approved',
      message: `${matched?.studentName || 'Student'} verified as authentic MSU-IIT scholar.`
    });
  };

  const rejectVerification = (id: string) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
    showToast({
      type: 'info',
      title: 'Verification Marked Rejected',
      message: 'Student record rejected. Resubmission requested.'
    });
  };

  const requestStudentVerification = (idNumber: string) => {
    const updatedUser = { ...currentUser, isVerified: true };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('oddjobs_current_user', JSON.stringify(updatedUser));
    } catch {}

    const newVerif: VerificationItem = {
      id: `ver_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      course: currentUser.course,
      idNumber,
      email: currentUser.email,
      status: 'approved',
      submittedAt: 'Just now'
    };

    setVerifications(prev => [newVerif, ...prev.filter(v => v.studentId !== currentUser.id && v.email !== currentUser.email)]);

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    showToast({
      type: 'success',
      title: 'Student Status Verified!',
      message: `ID ${idNumber} confirmed. Verified MSU-IIT badge awarded.`
    });
  };

  const verifyStudent = (studentId: string) => {
    if (studentId === currentUser.id) {
      requestStudentVerification('2023-01824');
    }
  };

  const openReviewModal = useCallback((params: {
    agreementId?: string;
    toUserId: string;
    toUserName: string;
    jobTitle: string;
  }) => {
    setReviewModalState({
      isOpen: true,
      ...params
    });
  }, []);

  const closeReviewModal = useCallback(() => {
    setReviewModalState(null);
  }, []);

  const addReview = useCallback((reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: 'Just now',
      fromUserId: reviewData.fromUserId || currentUser.id,
      fromUserName: reviewData.fromUserName || currentUser.name,
      fromUserAvatar: reviewData.fromUserAvatar || currentUser.avatar,
      role: reviewData.role || (currentUser.role === 'requester' || currentUser.role === 'organization' ? 'requester' : 'student')
    };

    setReviews(prev => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem('oddjobs_reviews', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const targetUserId = reviewData.toUserId;
    // Recalculate average rating for target user
    setReviews(currentReviews => {
      const allForTarget = [newReview, ...currentReviews.filter(r => r.toUserId === targetUserId)];
      const avgRating = Number((allForTarget.reduce((sum, r) => sum + r.rating, 0) / allForTarget.length).toFixed(1));
      
      if (currentUser.id === targetUserId) {
        setCurrentUser(curr => {
          const updated = {
            ...curr,
            rating: avgRating,
            reviewCount: (curr.reviewCount || 0) + 1
          };
          try {
            localStorage.setItem('oddjobs_current_user', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      const matchedDemo = DEMO_ACCOUNTS.find(d => d.id === targetUserId);
      if (matchedDemo) {
        matchedDemo.rating = avgRating;
        matchedDemo.reviewCount = (matchedDemo.reviewCount || 0) + 1;
      }

      return currentReviews;
    });

    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    showToast({
      type: 'success',
      title: 'Review & Rating Recorded! ★',
      message: `Your ${reviewData.rating}-star review for ${reviewData.toUserName || 'user'} has been submitted.`
    });

    setReviewModalState(null);
  }, [currentUser, showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        demoAccounts: DEMO_ACCOUNTS,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithCredentials,
        registerUser,
        logout,
        switchAccount,
        toast,
        showToast,
        hideToast,
        jobs,
        savedJobIds,
        applications,
        agreements,
        disputes,
        verifications,
        reviews,
        addReview,
        reviewModalState,
        openReviewModal,
        closeReviewModal,
        activeTab,
        setActiveTab,
        selectedJob,
        setSelectedJob,
        toggleSaveJob,
        postJob,
        applyToJob,
        createAgreement,
        completeAgreement,
        confirmPayment,
        disputeAgreement,
        resolveDispute,
        approveVerification,
        rejectVerification,
        requestStudentVerification,
        verifyStudent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
