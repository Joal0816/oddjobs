'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  Scale,
  FileCheck,
  DollarSign,
  UserX,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    jobs, 
    agreements, 
    currentUser, 
    switchAccount, 
    disputes, 
    verifications, 
    resolveDispute, 
    approveVerification, 
    rejectVerification,
    showToast 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'disputes' | 'verifications' | 'agreements' | 'canvas'>('overview');

  const handleApprove = (id: string) => {
    approveVerification(id);
  };

  const handleReject = (id: string) => {
    rejectVerification(id);
  };

  const pendingDisputesCount = disputes.filter(d => d.status === 'pending').length;
  const pendingVerifsCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 text-white w-full selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs uppercase font-extrabold tracking-wider">Campus Moderator & Trust Board</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Admin & Safety Dashboard
          </h2>
          <p className="text-xs text-zinc-400">
            Oversee MSU-IIT student identity verifications, dispute resolutions, and technopreneurship metrics.
          </p>
        </div>

        {/* Tab Navigation Chips */}
        <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'disputes' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Disputes</span>
            {pendingDisputesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'disputes' ? 'bg-black text-amber-400' : 'bg-rose-500 text-white'}`}>
                {pendingDisputesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'verifications' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Verifications</span>
            {pendingVerifsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'verifications' ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'}`}>
                {pendingVerifsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('agreements')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'agreements' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Agreements
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'canvas' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            BMC Scope
          </button>
        </div>
      </div>

      {/* Moderator Role Context Banner */}
      <div className="mb-6 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          {currentUser.role === 'admin' ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          )}
          <span className="text-zinc-400">Current Session:</span>
          <span className="font-bold text-white">{currentUser.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            currentUser.role === 'admin' 
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
            {currentUser.role === 'admin' ? 'Official Campus Moderator' : `${currentUser.role} (Previewing)`}
          </span>
        </div>

        {currentUser.role !== 'admin' && (
          <button
            onClick={() => switchAccount('admin')}
            className="px-3 py-1 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-black transition-colors cursor-pointer flex items-center space-x-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Switch to Admin Account</span>
          </button>
        )}
      </div>

      {/* OVERVIEW / METRICS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Jobs</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{jobs.length}</p>
              <span className="text-[10px] text-emerald-400 font-medium">Campus demand healthy</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Digital Agreements</span>
              <p className="text-2xl font-black text-white mt-1">{agreements.length}</p>
              <span className="text-[10px] text-sky-400 font-medium">Binding terms tracked</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Verified Students</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {verifications.filter(v => v.status === 'approved').length + 26}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium">MSU-IIT Accounts</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Disputes</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{pendingDisputesCount}</p>
              <span className="text-[10px] text-zinc-400 font-medium">In arbitration review</span>
            </div>
          </div>

          {/* Phase 4 MVP Milestone Target Card */}
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900/40 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Technopreneurship MVP Milestone (BCA172)</h4>
              </div>
              <span className="text-xs font-extrabold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                Target: 10 Campus Transactions
              </span>
            </div>
            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              Validation Criteria: Complete 10 structured peer-to-peer student transactions within MSU-IIT (with verified identity and signed Digital Job Agreements) to validate market density and retention before external city rollout.
            </p>
            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[45%]" />
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-400 mt-2">
              <span className="font-semibold text-zinc-200">5 completed milestone agreements</span>
              <span className="text-amber-400 font-bold">50% toward campus pilot goal</span>
            </div>
          </div>

          {/* Quick Shortcuts to Admin Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveTab('disputes')}
              className="glass-panel p-5 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer group flex items-start space-x-3.5"
            >
              <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  Dispute Resolution Chamber
                </h5>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Review reported delivery issues, release escrow payments, or mediate student refunds.
                </p>
                <span className="text-xs text-amber-400 font-semibold mt-2 inline-block">
                  {pendingDisputesCount} pending cases →
                </span>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('verifications')}
              className="glass-panel p-5 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer group flex items-start space-x-3.5"
            >
              <div className="p-3 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  MSU-IIT Student Identity Queue
                </h5>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Approve institutional email domains (@g.msuiit.edu.ph) and student ID credentials.
                </p>
                <span className="text-xs text-sky-400 font-semibold mt-2 inline-block">
                  {pendingVerifsCount} pending applications →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTES RESOLUTION TAB (Proposal Requirement #5) */}
      {activeTab === 'disputes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Dispute & Mediation Center</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Structured admin review for cancelled tasks, unfulfilled specs, and held payments.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
              {pendingDisputesCount} Action Required
            </span>
          </div>

          <div className="space-y-4">
            {disputes.map(dispute => (
              <div 
                key={dispute.id}
                className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-400">[{dispute.id}]</span>
                      <h4 className="font-bold text-sm text-white">{dispute.jobTitle}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Requester: <span className="text-zinc-200 font-semibold">{dispute.requesterName}</span> • Worker: <span className="text-zinc-200 font-semibold">{dispute.workerName}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-amber-400">₱{dispute.amount.toLocaleString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      dispute.status === 'pending'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : dispute.status === 'split'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {dispute.status === 'pending' ? 'Under Review' : dispute.status === 'split' ? '50/50 Settled' : 'Resolved'}
                    </span>
                  </div>
                </div>

                {/* Evidence & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] uppercase font-semibold block mb-0.5">Dispute Reason</span>
                    <span className="text-rose-400 font-semibold">{dispute.reason}</span>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase font-semibold block mb-0.5">Reported Evidence & Notes</span>
                    <p className="text-zinc-300 leading-relaxed">{dispute.evidence}</p>
                  </div>
                </div>

                {dispute.resolutionNote && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-medium">
                    ✓ Resolution Record: {dispute.resolutionNote}
                  </div>
                )}

                {/* Admin Quick Resolution Action Toolbar */}
                {dispute.status === 'pending' ? (
                  <div className="pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 block mb-2 font-semibold">
                      Admin Quick Resolution Actions:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => resolveDispute(dispute.id, 'release_worker')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Release 100% to Worker ({dispute.workerName})</span>
                      </button>

                      <button
                        onClick={() => resolveDispute(dispute.id, 'refund_requester')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Refund Requester ({dispute.requesterName})</span>
                      </button>

                      <button
                        onClick={() => resolveDispute(dispute.id, 'split')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Split 50/50 Settlement</span>
                      </button>

                      <button
                        onClick={() => showToast({
                          type: 'warning',
                          title: 'Campus Sanction Issued',
                          message: `Official compliance record logged against ${dispute.requesterName}.`
                        })}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer flex items-center space-x-1 ml-auto"
                      >
                        <UserX className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Issue Sanction</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATIONS TAB */}
      {activeTab === 'verifications' && (
        <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Institutional Identity Queue</h3>
              <p className="text-xs text-zinc-400">Verification gate for @g.msuiit.edu.ph domain emails & student ID numbers</p>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              {pendingVerifsCount} pending approval
            </span>
          </div>

          <div className="divide-y divide-zinc-800">
            {verifications.map(item => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{item.studentName}</span>
                    <span className="font-mono text-zinc-400 text-[11px] bg-zinc-800 px-2 py-0.5 rounded">
                      ID: {item.idNumber}
                    </span>
                  </div>
                  <p className="text-zinc-400 mt-0.5">{item.course} • <span className="text-sky-400">{item.email}</span></p>
                  <span className="text-[10px] text-zinc-500">Submitted {item.submittedAt}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center space-x-1 cursor-pointer shadow-sm transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Badge</span>
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 font-medium flex items-center space-x-1 cursor-pointer transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      item.status === 'approved' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.status === 'approved' ? '✓ Verified Student' : 'Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGREEMENTS AUDIT LOG TAB */}
      {activeTab === 'agreements' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Digital Job Agreements Audit Log</span>
              </h3>
              <p className="text-xs text-zinc-400">Contractual terms, deliverables signoffs, and payment milestones</p>
            </div>
            <span className="text-xs text-zinc-400 font-semibold">{agreements.length} Total Records</span>
          </div>

          <div className="space-y-3">
            {agreements.map(agr => (
              <div key={agr.id} className="glass-panel p-4 rounded-2xl border border-zinc-800 text-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">{agr.id}</span>
                    <h4 className="font-bold text-sm text-white">{agr.jobTitle}</h4>
                    <p className="text-zinc-400 mt-0.5">
                      Requester: <span className="text-zinc-200">{agr.requesterName}</span> → Worker: <span className="text-zinc-200">{agr.workerName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-amber-400 text-sm">₱{agr.agreedPrice.toLocaleString()}</span>
                    <p className="text-[10px] text-zinc-400 capitalize">{agr.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      agr.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : agr.status === 'work_submitted'
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {agr.status.replace('_', ' ')}
                    </span>
                    <span className="text-zinc-400">Payment: <strong className="text-white capitalize">{agr.paymentStatus}</strong></span>
                  </div>
                  <span className="text-zinc-500">Created: {agr.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BMC CANVAS TAB */}
      {activeTab === 'canvas' && (
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 text-xs text-zinc-300 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Business Model Canvas (BCA172 Scope)</h3>
              <p className="text-xs text-zinc-400">OddJobs Technopreneurship MVP validation roadmap</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-xs border border-amber-500/30">
              MSU-IIT Initial Market
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-2 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Key Partners</span>
              </h4>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                • MSU-IIT student councils, college orgs, & student clubs<br />
                • Campus offices needing event / document assistance<br />
                • Local small businesses around Iligan City (print shops, cafes)<br />
                • GCash & campus cash transaction channels
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Value Propositions</span>
              </h4>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                • <strong>Student Workers:</strong> Safe, campus-verified gig discovery without Facebook noise; verifiable portfolio & reputation.<br />
                • <strong>Requesters:</strong> Affordable, rapid student help with structured Digital Job Agreements preventing miscommunications.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-amber-400 uppercase text-[11px] mb-2 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Trust & Safety</span>
              </h4>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                • Mandatory @g.msuiit.edu.ph verification<br />
                • 2-way rating & review system<br />
                • Transparent Digital Job Agreements<br />
                • Integrated Admin Dispute Arbitration Chamber
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};