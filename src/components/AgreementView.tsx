'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Coins, 
  ExternalLink, 
  Send, 
  UserCheck, 
  AlertTriangle, 
  X, 
  Star,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AgreementView: React.FC = () => {
  const { 
    agreements, 
    completeAgreement, 
    confirmPayment, 
    disputeAgreement, 
    applications, 
    createAgreement, 
    jobs, 
    currentUser,
    openReviewModal,
    reviews,
    setActiveTab: setAppTab 
  } = useApp();
  
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'agreements' | 'applications'>('agreements');
  const [disputeModalAgrId, setDisputeModalAgrId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Generate Agreement Modal State
  const [selectedAppForAgreement, setSelectedAppForAgreement] = useState<typeof applications[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Cash on Campus' | 'Simulated Protected Payment'>('Simulated Protected Payment');
  const [deliverables, setDeliverables] = useState<string[]>([
    'Completed task deliverables according to specifications',
    'Submission of proof or project assets',
    'Final review and signoff'
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [revisionTerms, setRevisionTerms] = useState('Up to 2 rounds of revisions within 3 days.');

  const pendingApps = applications.filter(a => a.status === 'pending');

  const handleOpenAgreementModal = (app: typeof applications[0]) => {
    setSelectedAppForAgreement(app);
    setPaymentMethod('Simulated Protected Payment');
    setDeliverables([
      'Completed task deliverables according to specifications',
      'Submission of proof or project assets',
      'Final review and signoff'
    ]);
  };

  const handleConfirmGenerateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForAgreement) return;

    createAgreement(
      selectedAppForAgreement.jobId,
      selectedAppForAgreement,
      deliverables,
      revisionTerms,
      paymentMethod
    );
    setSelectedAppForAgreement(null);
    setActiveTab('agreements');
  };

  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim()) return;
    setDeliverables(prev => [...prev, newDeliverableInput.trim()]);
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const handleWorkSubmit = (agrId: string) => {
    if (!submissionUrl.trim()) return;
    completeAgreement(agrId, submissionUrl, submissionNotes.trim() || 'Work submitted according to agreed deliverables.');
    setSubmissionUrl('');
    setSubmissionNotes('');
  };

  const handleConfirmAndPay = (agr: typeof agreements[0]) => {
    confirmPayment(agr.id);
    try {
      confetti({ particleCount: 80, spread: 60 });
    } catch {}

    openReviewModal({
      agreementId: agr.id,
      toUserId: agr.workerId,
      toUserName: agr.workerName,
      jobTitle: agr.jobTitle,
    });
  };

  const handleOpenDispute = (agrId: string) => {
    setDisputeModalAgrId(agrId);
    setDisputeReason('');
  };

  const submitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalAgrId) return;
    disputeAgreement(disputeModalAgrId, disputeReason.trim() || 'Work does not meet agreed specifications or timeline.');
    setDisputeModalAgrId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28 text-white w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs uppercase font-extrabold tracking-wider">Escrow & Milestone System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Digital Agreements
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Formal deliverables, milestone escrow, work submissions, and payouts.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs">
          <button
            onClick={() => setActiveTab('agreements')}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'agreements'
                ? 'bg-amber-400 text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Agreements ({agreements.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-amber-400 text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Applications ({pendingApps.length})
          </button>
        </div>
      </div>

      {/* Applications View */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {pendingApps.length === 0 ? (
            <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center text-zinc-400 text-xs">
              <p className="font-semibold text-zinc-300">No pending proposals right now.</p>
              <p className="mt-1">When students apply to your campus tasks, they will appear here for your review.</p>
            </div>
          ) : (
            pendingApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="p-5 sm:p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {job?.title || 'Campus Task'}
                      </span>
                      <h3 className="font-bold text-base text-white mt-1.5">{app.applicantName}</h3>
                      <p className="text-xs text-zinc-400">{app.applicantCourse} • Rating: {app.applicantRating} ★</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-black text-amber-400">₱{app.proposedPrice.toLocaleString()}</span>
                      <p className="text-[11px] text-zinc-400">Est. {app.estimatedTime}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 text-xs text-zinc-300">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Proposal Pitch:</span>
                    &ldquo;{app.proposal}&rdquo;
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleOpenAgreementModal(app)}
                      className="amber-glow-btn px-4 py-2 rounded-xl text-black font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <UserCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Accept & Generate Agreement</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Agreements View */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          {agreements.map((agr) => {
            const isCompleted = agr.status === 'completed';
            const isSubmitted = agr.status === 'work_submitted';
            const isDisputed = agr.status === 'disputed';
            const isActive = agr.status === 'active';

            return (
              <div key={agr.id} className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
                {/* Header Bar */}
                <div className="p-5 bg-zinc-900/90 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white leading-tight">{agr.jobTitle}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Client: <strong className="text-white">{agr.requesterName}</strong> • Student: <strong className="text-amber-400">{agr.workerName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center space-x-1.5 ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isSubmitted
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : isDisputed
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isDisputed ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span className="uppercase text-[10px] tracking-wider">
                        {agr.status.replace('_', ' ')}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Agreement Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Financial & Deadline Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Agreed Escrow</span>
                      <span className="text-base font-black text-amber-400">₱{agr.agreedPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Deadline</span>
                      <span className="text-zinc-200 font-medium">{agr.deadline}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Payment Mode</span>
                      <span className="text-zinc-200 font-medium">{agr.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Escrow Status</span>
                      <span className={`font-semibold capitalize ${
                        agr.paymentStatus === 'released' || agr.paymentStatus === 'paid'
                          ? 'text-emerald-400'
                          : agr.paymentStatus === 'held'
                          ? 'text-amber-400'
                          : 'text-zinc-300'
                      }`}>
                        {agr.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Deliverables Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Scope & Agreed Deliverables
                    </h4>
                    <ul className="space-y-1.5">
                      {agr.deliverables.map((item, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submission Preview if exists */}
                  {agr.submittedWorkUrl && (
                    <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-400">Submitted Deliverable Proof</span>
                        <a
                          href={agr.submittedWorkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-300 hover:text-white flex items-center space-x-1 underline cursor-pointer"
                        >
                          <span>Open Submission</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {agr.submissionNotes && (
                        <p className="text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                          &ldquo;{agr.submissionNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Dispute Banner if disputed */}
                  {isDisputed && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
                      <div>
                        <span className="font-bold block">Dispute Under Campus Arbitration</span>
                        <span className="text-zinc-400">{agr.submissionNotes || 'Funds secured in platform escrow pending admin mediation.'}</span>
                      </div>
                      <button
                        onClick={() => setAppTab('admin')}
                        className="text-amber-400 font-semibold hover:underline cursor-pointer flex-shrink-0 ml-3"
                      >
                        Admin Desk →
                      </button>
                    </div>
                  )}

                  {/* Actions according to status */}
                  <div className="pt-3 border-t border-zinc-800/80">
                    {/* Active: Submit Work */}
                    {isActive && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                          <span>Submit Deliverable (Student Worker)</span>
                          <button
                            onClick={() => handleOpenDispute(agr.id)}
                            className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                          >
                            Report Issue
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Project URL (e.g. Google Drive, GitHub repo, Figma...)"
                          value={submissionUrl}
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                        <textarea
                          rows={2}
                          placeholder="Summary notes for the client..."
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleWorkSubmit(agr.id)}
                            className="amber-glow-btn px-4 py-2 rounded-xl text-black font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Deliverable</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submitted: Approve & Release */}
                    {isSubmitted && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-zinc-300">
                          Student has submitted deliverables. Review the submission before releasing escrow.
                        </p>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleOpenDispute(agr.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            Request Revision
                          </button>
                          <button
                            onClick={() => handleConfirmAndPay(agr)}
                            className="amber-glow-btn px-4 py-2 rounded-xl text-black font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                          >
                            <Coins className="w-4 h-4" />
                            <span>Approve & Release ₱{agr.agreedPrice.toLocaleString()}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Completed */}
                    {isCompleted && (() => {
                      const existingReview = reviews.find(
                        r => r.jobId === agr.id && r.fromUserId === currentUser.id
                      );
                      const isRequester = currentUser.id === agr.requesterId;
                      const counterpartId = isRequester ? agr.workerId : agr.requesterId;
                      const counterpartName = isRequester ? agr.workerName : agr.requesterName;

                      return (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl gap-3">
                          <div className="flex items-center space-x-2 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>Escrow released successfully. Agreement complete!</span>
                          </div>
                          <div>
                            {existingReview ? (
                              <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>Rated: {existingReview.rating}★</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  openReviewModal({
                                    agreementId: agr.id,
                                    toUserId: counterpartId,
                                    toUserName: counterpartName,
                                    jobTitle: agr.jobTitle
                                  });
                                }}
                                className="amber-glow-btn px-3.5 py-1.5 rounded-xl text-black font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-sm"
                              >
                                <Star className="w-3.5 h-3.5 fill-black" />
                                <span>Leave Rating</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Agreement Modal */}
      {selectedAppForAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101015] border border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="font-bold text-white text-base">Generate Job Agreement</h4>
              </div>
              <button 
                onClick={() => setSelectedAppForAgreement(null)} 
                className="text-zinc-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Worker:</span>
                <h5 className="font-bold text-sm text-white">{selectedAppForAgreement.applicantName}</h5>
                <p className="text-[11px] text-zinc-400">{selectedAppForAgreement.applicantCourse}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-400">₱{selectedAppForAgreement.proposedPrice.toLocaleString()}</span>
                <p className="text-[10px] text-zinc-400">Est. {selectedAppForAgreement.estimatedTime}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmGenerateAgreement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {([
                    { id: 'Simulated Protected Payment', label: 'Platform Escrow' },
                    { id: 'GCash', label: 'GCash' },
                    { id: 'Cash on Campus', label: 'Cash on Campus' }
                  ] as const).map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Scope & Deliverables Checklist
                </label>
                <div className="space-y-1.5 mb-2">
                  {deliverables.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs">
                      <span className="text-zinc-200 truncate mr-2">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(i)}
                        className="text-zinc-500 hover:text-rose-400 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add deliverable milestone..."
                    value={newDeliverableInput}
                    onChange={(e) => setNewDeliverableInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Revision Terms
                </label>
                <input
                  type="text"
                  value={revisionTerms}
                  onChange={(e) => setRevisionTerms(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="submit"
                  className="flex-1 amber-glow-btn py-3 rounded-xl font-bold text-xs text-black cursor-pointer shadow-md"
                >
                  Create & Lock Agreement
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAppForAgreement(null)}
                  className="px-4 py-3 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalAgrId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101015] border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-bold text-white text-base">Open Dispute Mediation</h4>
              </div>
              <button 
                onClick={() => setDisputeModalAgrId(null)} 
                className="text-zinc-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Reason for dispute
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the issue with deliverables, timeline, or specifications..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Submit Dispute to Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDisputeModalAgrId(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
