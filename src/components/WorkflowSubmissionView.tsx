import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Printer,
  FileText,
  AlertTriangle,
  Send,
  Eye,
  CheckSquare,
  Lock,
  Building2,
  User,
  Calendar,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { GeneratedLabelPreview } from './GeneratedLabelPreview';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { DEFAULT_COMPLIANCE_CHECKLIST } from '../data/sampleUsers';
import { ComplianceChecklist } from '../types';

export const WorkflowSubmissionView: React.FC = () => {
  const {
    chemicals,
    selectedChemicalId,
    setSelectedChemicalId,
    setCurrentView,
    activeLabelConfig,
    companySettings,
    currentUser,
    approveChemicalWorkflow,
  } = useChemicals();

  // Selected chemical to review
  const chemical = chemicals.find((c) => c.id === selectedChemicalId) || chemicals[0];

  const [checklist, setChecklist] = useState<ComplianceChecklist>({
    ...DEFAULT_COMPLIANCE_CHECKLIST,
  });
  const [reviewerNotes, setReviewerNotes] = useState(
    'Verified compliant with OSHA HazCom 2012 / UN GHS Rev 10 protocols. Approved for operational field use.'
  );
  const [isApproving, setIsApproving] = useState(false);
  const [justApproved, setJustApproved] = useState(false);

  if (!chemical) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Submitted Label Selected</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Please return to the Labels Library or create a new label.</p>
        <button
          onClick={() => setCurrentView('library')}
          className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-md hover:bg-slate-700 cursor-pointer"
        >
          Return to Labels Library
        </button>
      </div>
    );
  }

  const isApproved = chemical.status === 'approved' || justApproved;
  const isUnderReview = !isApproved && (chemical.status === 'under_review' || chemical.status === 'requires_review' || chemical.status === 'draft');

  const handleToggleChecklist = (key: keyof ComplianceChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApproveAndRelease = () => {
    setIsApproving(true);
    setTimeout(() => {
      approveChemicalWorkflow(
        chemical.id,
        reviewerNotes,
        checklist,
        currentUser
      );
      setIsApproving(false);
      setJustApproved(true);
    }, 400);
  };

  const handleGoToLibrary = () => {
    setSelectedChemicalId(chemical.id);
    setCurrentView('library');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('add_chemical')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Back to editor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Label Submission & Release Workflow
              </h1>
              <ApprovalStatusBadge status={isApproved ? 'approved' : 'under_review'} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Product: <span className="font-semibold text-slate-700">{chemical.productName}</span> ({chemical.productCode}) • CAS: {chemical.casNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isApproved ? (
            <button
              onClick={handleGoToLibrary}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-md flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>View in Labels Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('add_chemical')}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors cursor-pointer"
            >
              Edit Draft
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Workflow Stepper Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Label Approval Lifecycle
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1: Submitted */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                1. Label Submitted
              </div>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                {chemical.approvalWorkflow?.submittedBy || currentUser.name}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Draft successfully saved & sent for HSE sign-off
              </p>
            </div>
          </div>

          {/* Step 2: Under Review */}
          <div
            className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
              isApproved
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20 text-amber-900'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                isApproved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}
            >
              {isApproved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div>
              <div
                className={`text-xs font-bold uppercase tracking-wide ${
                  isApproved ? 'text-emerald-900' : 'text-amber-900'
                }`}
              >
                2. HSE Safety Review
              </div>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  isApproved ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {isApproved
                  ? 'Compliance verified & certified'
                  : 'Currently Under Review — Awaiting Sign-off'}
              </p>
              <p
                className={`text-[11px] mt-0.5 ${
                  isApproved ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                OSHA HazCom 2012 / UN GHS Rev 10 audit
              </p>
            </div>
          </div>

          {/* Step 3: Approved & Released */}
          <div
            className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all ${
              isApproved
                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {isApproved ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div
                className={`text-xs font-bold uppercase tracking-wide ${
                  isApproved ? 'text-emerald-900' : 'text-slate-500'
                }`}
              >
                3. Approved & Released
              </div>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  isApproved ? 'text-emerald-800 font-semibold' : 'text-slate-600'
                }`}
              >
                {isApproved
                  ? 'Released to Active Labels Library'
                  : 'Pending Review Completion'}
              </p>
              <p
                className={`text-[11px] mt-0.5 ${
                  isApproved ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                Authorized for container printing & field operations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submission Details & Sign-off Action */}
        <div className="lg:col-span-6 space-y-6">
          {/* Status Alert Banner */}
          {isApproved ? (
            <div className="bg-emerald-600 text-white rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Label Approved & Released!</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    This GHS label is officially certified and available directly in the Labels Library.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-500/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-emerald-200">Digital Signature:</span>{' '}
                  <span className="font-mono font-semibold bg-emerald-700/60 px-2 py-0.5 rounded">
                    {chemical.approvalWorkflow?.signatureHash || `OS-SIG-RELEASED-${chemical.id.toUpperCase().replace('CHEM-', '')}-2026`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGoToLibrary}
                    className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-4 py-1.5 rounded text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Go to Labels Library →
                  </button>
                  <button
                    onClick={handlePrint}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-900">
                    Label Submitted — Currently Under Review
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    This label draft has been submitted to the HSE workflow. You can verify the compliance checklist below and click <strong>Approve & Release</strong> to publish it directly to the Labels Library.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submission Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Submission Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="text-slate-400 font-medium">Submitted By</div>
                <div className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{chemical.approvalWorkflow?.submittedBy || currentUser.name}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="text-slate-400 font-medium">Facility / Org</div>
                <div className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{companySettings.companyName}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="text-slate-400 font-medium">Product Code</div>
                <div className="text-slate-800 font-mono font-semibold mt-0.5">
                  {chemical.productCode || 'N002'}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="text-slate-400 font-medium">Container Type</div>
                <div className="text-slate-800 font-semibold mt-0.5">
                  {chemical.containerType || 'Secondary Container / Drum'}
                </div>
              </div>
            </div>
          </div>

          {/* Safety Review & Sign-Off Action Card */}
          {!isApproved && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    HSE Compliance Checklist & Sign-Off
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready to Sign
                </span>
              </div>

              {/* Compliance Checklist Items */}
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.productIdentification}
                    onChange={() => handleToggleChecklist('productIdentification')}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">
                    Product Identifier & chemical name match verified SDS Section 1
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.ghsPictogramsAssigned}
                    onChange={() => handleToggleChecklist('ghsPictogramsAssigned')}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">
                    GHS Hazard Pictograms and Signal Word ({chemical.signalWord}) verified
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.hazardStatementsAccurate}
                    onChange={() => handleToggleChecklist('hazardStatementsAccurate')}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">
                    Precautionary & First Aid emergency statements fully populated
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={checklist.ppeRequirementsSpecified}
                    onChange={() => handleToggleChecklist('ppeRequirementsSpecified')}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">
                    Personal Protective Equipment (PPE) assigned to label layout
                  </span>
                </label>
              </div>

              {/* Reviewer Comments */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Safety Reviewer Sign-Off Comments:
                </label>
                <input
                  type="text"
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Sign-off Persona Notice */}
              <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-600 flex items-center justify-between border border-slate-200">
                <span className="font-medium">
                  Authorizing as: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.roleTitle})
                </span>
                <span className="text-emerald-600 font-semibold">Authorized Signer</span>
              </div>

              {/* Main Action Button */}
              <button
                type="button"
                onClick={handleApproveAndRelease}
                disabled={isApproving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{isApproving ? 'Authorizing & Releasing...' : 'Approve & Release Label'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Live Label Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Live Label Preview
                </h3>
                <span className="text-[11px] text-slate-500">
                  Container Format: {chemical.labelSize || '4x6'} Standard • {chemical.containerType || 'Secondary Container'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                  title="Print label"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Label Canvas Container */}
            <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-center overflow-x-auto min-h-[420px]">
              <div className="scale-95 origin-top">
                <GeneratedLabelPreview
                  chemical={chemical}
                  config={activeLabelConfig}
                  settings={companySettings}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>OSHA 1910.1200 / GHS Rev 10 compliant rendering</span>
              <span>Watermark updates automatically upon release</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSubmissionView;
