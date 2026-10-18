import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Send,
  FileCheck,
  Lock,
  RotateCcw,
  UserCheck,
  Printer,
  History,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Chemical, ComplianceChecklist, CurrentUser } from '../types';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { DEFAULT_COMPLIANCE_CHECKLIST } from '../data/sampleUsers';

interface ApprovalWorkflowModalProps {
  chemical: Chemical;
  currentUser: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
  onSubmitForApproval: (chemicalId: string, notes: string, submitter: CurrentUser) => void;
  onApprove: (
    chemicalId: string,
    reviewerNotes: string,
    checklist: ComplianceChecklist,
    reviewer: CurrentUser
  ) => void;
  onReject: (
    chemicalId: string,
    rejectionReason: string,
    requiredChanges: string,
    reviewer: CurrentUser
  ) => void;
  onReopenDraft: (chemicalId: string, reason: string) => void;
  onNavigateToStudio?: () => void;
}

export const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  chemical,
  currentUser,
  isOpen,
  onClose,
  onSubmitForApproval,
  onApprove,
  onReject,
  onReopenDraft,
  onNavigateToStudio,
}) => {
  if (!isOpen) return null;

  const currentStatus = chemical.status || 'draft';
  const isApproved = currentStatus === 'approved';
  const isUnderReview = currentStatus === 'under_review' || currentStatus === 'requires_review';
  const isDraft = currentStatus === 'draft';
  const isRejected = currentStatus === 'rejected';

  // Active Tab: 'action' | 'checklist' | 'history'
  const [activeTab, setActiveTab] = useState<'action' | 'checklist' | 'history'>(
    isUnderReview ? 'action' : isApproved ? 'history' : 'action'
  );

  // Form states
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState(
    'Hazard statements and emergency response info verified against supplier SDS. Compliant with OSHA HazCom 2012 / GHS Rev 10.'
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [requiredChanges, setRequiredChanges] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);

  // Compliance checklist interactive state
  const [checklist, setChecklist] = useState<ComplianceChecklist>(() => {
    return (
      chemical.approvalWorkflow?.checklist || {
        ...DEFAULT_COMPLIANCE_CHECKLIST,
        // Calculate preflight checks
        productIdentification: Boolean(chemical.productName && chemical.casNumber),
        ghsPictogramsAssigned: Boolean(chemical.pictograms && chemical.pictograms.length > 0),
        signalWordSelected: Boolean(chemical.signalWord && chemical.signalWord !== 'NONE'),
        hazardStatementsAccurate: Boolean(chemical.hStatements && chemical.hStatements.length > 0),
        precautionaryStatementsVerified: Boolean(chemical.pStatements && chemical.pStatements.length > 0),
        ppeRequirementsSpecified: Boolean(chemical.ppe && (chemical.ppe.eye || chemical.ppe.hand)),
        emergencyPhoneActive: Boolean(chemical.emergency && chemical.emergency.emergencyPhone),
        sdsRevisionLinked: Boolean(chemical.sdsRevisionDate),
      }
    );
  });

  const toggleChecklistItem = (key: keyof ComplianceChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitForApproval(chemical.id, submissionNotes.trim() || 'Submitted for safety review and sign-off.', currentUser);
    onClose();
  };

  const handleApprove = () => {
    onApprove(chemical.id, approvalNotes.trim(), checklist, currentUser);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason explaining why the label was not approved.');
      return;
    }
    onReject(chemical.id, rejectionReason.trim(), requiredChanges.trim(), currentUser);
    onClose();
  };

  const handleReopen = () => {
    onReopenDraft(chemical.id, reopenReason.trim() || 'Reopened as editable draft for specification update.');
    onClose();
  };

  const workflow = chemical.approvalWorkflow;
  const historyList = workflow?.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold truncate">{chemical.productName}</h2>
                <ApprovalStatusBadge status={currentStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Code: {chemical.productCode || 'N/A'} • CAS: {chemical.casNumber} • Approval Management System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-3 cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Acting User Bar */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>
              Acting User: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.roleTitle})
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            {currentUser.department}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('action')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'action'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Workflow Actions</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Compliance Checklist</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                allChecksPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {Object.values(checklist).filter(Boolean).length}/8
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Sign-off History</span>
            {historyList.length > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                {historyList.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: WORKFLOW ACTIONS */}
          {activeTab === 'action' && (
            <div className="space-y-5">
              {/* STATE 1: DRAFT OR REJECTED -> SUBMIT FOR APPROVAL */}
              {(isDraft || isRejected) && (
                <div className="space-y-4">
                  {isRejected && (
                    <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                        <AlertOctagon className="w-4 h-4 text-rose-600" />
                        <span>Previous Review: Revisions Requested</span>
                      </div>
                      <p className="text-xs text-rose-700">
                        {workflow?.rejectionReason || 'The reviewer requested corrections before this label can be approved.'}
                      </p>
                      {workflow?.requiredChanges && (
                        <div className="text-[11px] bg-white/80 p-2 rounded border border-rose-200 mt-2 text-rose-800 font-medium">
                          <strong>Required Changes:</strong> {workflow.requiredChanges}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                      Ready to Submit for Safety Review?
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Submitting this label will notify Corporate HSE Specialists to conduct compliance verification under OSHA HazCom 2012 / UN GHS Rev 10 protocols.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[11px]">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Product Code</span>
                        <strong className="text-slate-800 font-medium">{chemical.productCode || 'N/A'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Signal Word</span>
                        <strong className="text-slate-800 font-medium">{chemical.signalWord}</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Pictograms</span>
                        <strong className="text-slate-800 font-medium">{chemical.pictograms?.length || 0} selected</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">H-Statements</span>
                        <strong className="text-slate-800 font-medium">{chemical.hStatements?.length || 0} assigned</strong>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Submission Notes / Change Summary (Optional)
                        </label>
                        <textarea
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          placeholder="e.g. Updated classification to match 2024 revision 3 SDS. Added cryogenic handling PPE requirements."
                          rows={3}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Safety Approval</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* STATE 2: UNDER REVIEW -> APPROVE OR REJECT */}
              {isUnderReview && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 text-amber-900">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-amber-800">
                        Pending EHS / Quality Safety Sign-off
                      </h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        This chemical label is in the official review queue. Verify the GHS classification, safety statements, and emergency contacts before applying authorization.
                      </p>
                      {workflow?.submissionNotes && (
                        <div className="mt-2 text-[11px] bg-white/80 p-2 rounded border border-amber-200 text-amber-800">
                          <strong>Submitter Notes:</strong> {workflow.submissionNotes}
                        </div>
                      )}
                      {workflow?.submittedBy && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          Submitted by {workflow.submittedBy} on {new Date(workflow.submittedAt || '').toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checklist summary alert */}
                  {!allChecksPassed && (
                    <div className="bg-amber-50/60 border border-amber-300 p-3 rounded-md flex items-center justify-between text-xs text-amber-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Some compliance checklist items are not marked verified.</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('checklist')}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Inspect Checklist
                      </button>
                    </div>
                  )}

                  {!showRejectForm ? (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        EHS Specialist Sign-Off Verification
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Approval / Sign-off Comments
                        </label>
                        <textarea
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          rows={2}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md flex items-center justify-between text-xs text-emerald-800">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600" />
                          <span>Digital Signature Stamp:</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                          OS-EHS-SIG-{(chemical.id || '000').toUpperCase().replace('CHEM-', '')}-2026
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(true)}
                          className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-semibold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Request Revisions / Reject</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleApprove}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Authorize Label</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* REJECT FORM */
                    <div className="bg-rose-50/70 p-4 rounded-lg border border-rose-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                          <AlertOctagon className="w-4 h-4 text-rose-600" />
                          <span>Request Corrections / Reject Label</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(false)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-rose-900 mb-1">
                          Rejection Reason *
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Missing corrosion hazard pictogram; incorrect CAS number."
                          className="w-full text-xs p-2 bg-white border border-rose-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-rose-900 mb-1">
                          Specific Corrective Actions Required
                        </label>
                        <textarea
                          value={requiredChanges}
                          onChange={(e) => setRequiredChanges(e.target.value)}
                          placeholder="List exact fields or statements that the preparer must adjust before re-submitting."
                          rows={2}
                          className="w-full text-xs p-2 bg-white border border-rose-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Confirm Rejection</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STATE 3: APPROVED -> VIEW CERTIFICATE OR REOPEN DRAFT */}
              {isApproved && (
                <div className="space-y-4">
                  {/* Official Certificate Box */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-xl border border-emerald-200 shadow-xs relative overflow-hidden">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                            Official Compliance Sign-Off
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          Certified for Operational & Field Dispatch
                        </h3>
                        <p className="text-xs text-slate-600 max-w-lg">
                          This chemical hazard specification has been reviewed and approved in compliance with OSHA HazCom 1910.1200 and UN GHS Revision 10.
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-inner flex-shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-emerald-200/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authorized By</span>
                        <strong className="text-slate-800 font-bold block">{chemical.lastReviewedBy || 'Dr. Sarah Vance, CSP'}</strong>
                        <span className="text-[10px] text-slate-500">Corporate HSE Division</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sign-Off Date</span>
                        <strong className="text-slate-800 font-bold block">
                          {chemical.lastReviewedDate || new Date().toISOString().split('T')[0]}
                        </strong>
                        <span className="text-[10px] text-slate-500">HazCom Compliance Log</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Signature Hash</span>
                        <strong className="font-mono text-[11px] text-emerald-700 block">
                          {workflow?.signatureHash || `OS-SIG-${chemical.id.toUpperCase().replace('CHEM-', '')}-OK`}
                        </strong>
                        <span className="text-[10px] text-emerald-600 font-medium">Verified Authentic</span>
                      </div>
                    </div>

                    {workflow?.approvalComments && (
                      <div className="mt-3 text-xs bg-white/80 p-2.5 rounded border border-emerald-200 text-slate-700">
                        <strong>Reviewer Note:</strong> {workflow.approvalComments}
                      </div>
                    )}
                  </div>

                  {/* Actions for Approved label */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {!showReopenForm ? (
                      <button
                        type="button"
                        onClick={() => setShowReopenForm(true)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reopen as Editable Draft</span>
                      </button>
                    ) : (
                      <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">
                          Reason for Reopening (Requires subsequent re-approval):
                        </span>
                        <input
                          type="text"
                          value={reopenReason}
                          onChange={(e) => setReopenReason(e.target.value)}
                          placeholder="e.g. Updated batch formulation, revision of supplier emergency number."
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowReopenForm(false)}
                            className="px-2.5 py-1 text-xs text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleReopen}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded"
                          >
                            Confirm Reopen
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {onNavigateToStudio && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToStudio();
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Open in Label Studio</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPLIANCE CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    OSHA HazCom 2012 / UN GHS Rev 10 Mandatory Elements
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review each compliance checkpoint. All items must pass before official field distribution is sanctioned.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      allChecksPassed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {allChecksPassed ? '100% Compliant' : 'Verification Incomplete'}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white overflow-hidden">
                {/* 1 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.productIdentification}
                      onChange={() => toggleChecklistItem('productIdentification')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        1. Product Identification & CAS Registry
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {chemical.productName} (CAS: {chemical.casNumber})
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.productIdentification ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 2 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.ghsPictogramsAssigned}
                      onChange={() => toggleChecklistItem('ghsPictogramsAssigned')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        2. GHS Hazard Pictograms Assigned
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {(chemical.pictograms?.length || 0) > 0
                          ? `${chemical.pictograms?.length || 0} pictograms configured with red diamond borders`
                          : 'No pictograms assigned'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.ghsPictogramsAssigned ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 3 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.signalWordSelected}
                      onChange={() => toggleChecklistItem('signalWordSelected')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        3. Signal Word Compliance
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Current: <strong className="uppercase font-mono">{chemical.signalWord}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.signalWordSelected ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 4 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.hazardStatementsAccurate}
                      onChange={() => toggleChecklistItem('hazardStatementsAccurate')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        4. Hazard Statements (H-Codes) Complete
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {chemical.hStatements.length} hazard statements registered
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.hazardStatementsAccurate ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 5 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.precautionaryStatementsVerified}
                      onChange={() => toggleChecklistItem('precautionaryStatementsVerified')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        5. Precautionary Statements (P-Codes) Verified
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {chemical.pStatements.length} statements covering prevention, response, storage & disposal
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.precautionaryStatementsVerified ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 6 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.ppeRequirementsSpecified}
                      onChange={() => toggleChecklistItem('ppeRequirementsSpecified')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        6. Personal Protective Equipment (PPE) Matrix
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Eye, hand, body, respiratory & footwear specifications present
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.ppeRequirementsSpecified ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 7 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.emergencyPhoneActive}
                      onChange={() => toggleChecklistItem('emergencyPhoneActive')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        7. 24/7 Emergency Dispatch Hotlines Active
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {chemical.emergency.emergencyPhone || 'CHEMTREC / EOC Active'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.emergencyPhoneActive ? 'PASS' : 'FAIL'}
                  </span>
                </label>

                {/* 8 */}
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.sdsRevisionLinked}
                      onChange={() => toggleChecklistItem('sdsRevisionLinked')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        8. Source SDS Revision Date Verified
                      </span>
                      <span className="text-[11px] text-slate-500">
                        SDS Date: {chemical.sdsRevisionDate || '2024-07-28'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {checklist.sdsRevisionLinked ? 'PASS' : 'FAIL'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Chronological Approval & Sign-Off History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full tamper-evident record of all workflow state changes, submitters, reviewers, timestamps, and digital verification keys.
                </p>
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-8 bg-white border border-slate-200 rounded-lg">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No prior approval history recorded for this chemical.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submitting or approving this record will begin the permanent sign-off trail.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historyList.map((entry, idx) => {
                    const isApprove = entry.action === 'approved';
                    const isReject = entry.action === 'rejected';
                    const isSubmit = entry.action === 'submitted_for_approval';

                    let iconColor = 'bg-blue-600 text-white';
                    let IconComponent = Send;
                    if (isApprove) {
                      iconColor = 'bg-emerald-600 text-white';
                      IconComponent = CheckCircle2;
                    } else if (isReject) {
                      iconColor = 'bg-rose-600 text-white';
                      IconComponent = AlertOctagon;
                    }

                    return (
                      <div key={entry.id || idx} className="relative group">
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${iconColor} flex items-center justify-center shadow-xs text-[10px]`}
                        >
                          <IconComponent className="w-3 h-3" />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-slate-900 capitalize">
                              {entry.action.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600">
                            <strong>{entry.user}</strong> <span className="text-slate-400">({entry.role})</span>
                          </div>

                          {entry.comments && (
                            <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
                              {entry.comments}
                            </div>
                          )}

                          {entry.rejectionReason && (
                            <div className="mt-2 text-xs bg-rose-50 p-2 rounded border border-rose-200 text-rose-800 font-medium">
                              <strong>Reason:</strong> {entry.rejectionReason}
                            </div>
                          )}

                          {entry.signatureHash && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono">
                              <Lock className="w-3 h-3" />
                              <span>Signature Hash: {entry.signatureHash}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>OILSERV Dual-Signoff HSE Chemical Management Portal</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
