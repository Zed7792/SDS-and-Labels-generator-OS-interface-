import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Edit3,
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Chemical } from '../types';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogram } from './GhsPictogram';
import { GeneratedLabelPreview } from './GeneratedLabelPreview';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ApprovalWorkflowModal } from './ApprovalWorkflowModal';

export const ChemicalLibraryView: React.FC = () => {
  const {
    chemicals,
    setSelectedChemicalId,
    setCurrentView,
    activeLabelConfig,
    companySettings,
    currentUser,
    submitForApproval,
    approveChemicalWorkflow,
    rejectChemicalWorkflow,
    reopenChemicalDraft,
  } = useChemicals();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingChemical, setViewingChemical] = useState<Chemical | null>(null);
  const [workflowChemical, setWorkflowChemical] = useState<Chemical | null>(null);

  // Filtered chemical list
  const filteredChemicals = useMemo(() => {
    return chemicals.filter((chem) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        chem.productName.toLowerCase().includes(q) ||
        (chem.chemicalName && chem.chemicalName.toLowerCase().includes(q)) ||
        chem.casNumber.toLowerCase().includes(q) ||
        chem.productCode.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && chem.status === 'approved') ||
        (statusFilter === 'under_review' && (chem.status === 'under_review' || chem.status === 'requires_review')) ||
        (statusFilter === 'draft' && chem.status === 'draft') ||
        (statusFilter === 'rejected' && chem.status === 'rejected');

      return matchesSearch && matchesStatus;
    });
  }, [chemicals, searchQuery, statusFilter]);

  // Metric stats
  const totalLabels = chemicals.length;
  const approvedCount = chemicals.filter((c) => c.status === 'approved').length;
  const underReviewCount = chemicals.filter((c) => c.status === 'under_review' || c.status === 'requires_review').length;
  const draftAndRevisionsCount = chemicals.filter((c) => c.status === 'draft' || c.status === 'rejected').length;

  const handleView = (chem: Chemical) => {
    setSelectedChemicalId(chem.id);
    setViewingChemical(chem);
  };

  const handleModify = (chem: Chemical) => {
    setSelectedChemicalId(chem.id);
    setCurrentView('add_chemical');
  };

  return (
    <div className="space-y-6">
      {/* 1. Four Metric Cards Row (Matching Phase 2 HSE Workflow) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Labels */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Inventory
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {totalLabels}
          </div>
        </div>

        {/* Card 2: Approved Labels */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Approved (Field Ready)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {approvedCount}
          </div>
        </div>

        {/* Card 3: Under Review */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Under HSE Review
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">
            {underReviewCount}
          </div>
        </div>

        {/* Card 4: Drafts & Revisions */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Drafts & Revisions
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1">
            {draftAndRevisionsCount}
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar (Matching Image 1) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Search & Filter Labels
          </h2>
          <span className="text-xs text-slate-400">
            Governed by ISO 9001 / OSHA 1910.1200 dual sign-off lifecycle
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, CAS # or code..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 cursor-pointer font-medium"
            >
              <option value="all">All Statuses ({chemicals.length})</option>
              <option value="approved">Approved ({approvedCount})</option>
              <option value="under_review">Under Review ({underReviewCount})</option>
              <option value="draft">Draft</option>
              <option value="rejected">Revision Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. 3-Column Grid of Label Cards (Matching Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChemicals.map((chem) => {
          const isWarning = chem.signalWord === 'WARNING';
          const isDanger = chem.signalWord === 'DANGER';

          return (
            <div
              key={chem.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              {/* Card Header: Product & Pills */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-950 leading-snug">
                      {chem.productName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {chem.chemicalName || chem.casNumber}
                    </p>
                  </div>

                  {/* Pills on top right */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <ApprovalStatusBadge status={chem.status} size="sm" />

                    {chem.fromSdsLibrary !== false && (
                      <span className="border border-emerald-500 text-emerald-600 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                        From SDS Library
                      </span>
                    )}
                  </div>
                </div>

                {/* GHS Pictograms Section */}
                <div className="my-6 flex items-center gap-2 flex-wrap">
                  {(chem.pictograms || []).slice(0, 6).map((pic) => (
                    <GhsPictogram key={pic} id={pic} size={(chem.pictograms?.length || 0) > 4 ? 34 : 40} />
                  ))}
                  {(!chem.pictograms || chem.pictograms.length === 0) && (
                    <span className="text-xs text-slate-400 italic">
                      No GHS Pictograms
                    </span>
                  )}
                </div>

                {/* Signal Word Badge */}
                <div className="mb-4">
                  {isWarning && (
                    <span className="bg-amber-500 text-white font-bold text-xs px-2.5 py-1 rounded tracking-wider uppercase inline-block">
                      WARNING
                    </span>
                  )}
                  {isDanger && (
                    <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded tracking-wider uppercase inline-block">
                      DANGER
                    </span>
                  )}
                  {!isWarning && !isDanger && (
                    <span className="bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1 rounded tracking-wider uppercase inline-block">
                      {chem.signalWord || 'INFO'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <button
                    onClick={() => handleView(chem)}
                    className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleModify(chem)}
                    className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Modify</span>
                  </button>
                </div>

                {/* Phase 2: Workflow Action Button */}
                {chem.status === 'under_review' && (
                  <button
                    onClick={() => setWorkflowChemical(chem)}
                    className="w-full mb-2 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Review & Sign-Off</span>
                  </button>
                )}
                {chem.status === 'draft' && (
                  <button
                    onClick={() => setWorkflowChemical(chem)}
                    className="w-full mb-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submit for Review</span>
                  </button>
                )}
                {chem.status === 'rejected' && (
                  <button
                    onClick={() => setWorkflowChemical(chem)}
                    className="w-full mb-2 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Revisions Required — Act</span>
                  </button>
                )}
                {chem.status === 'approved' && (
                  <button
                    onClick={() => setWorkflowChemical(chem)}
                    className="w-full mb-2 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sign-Off Cert & History</span>
                  </button>
                )}

                {/* Card Footer */}
                <div className="text-[11px] text-slate-400">
                  Last updated: {chem.lastReviewedDate || '2024-07-28'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChemicals.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg p-8">
          <p className="text-slate-500 text-sm">No labels matching your search query.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs text-blue-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* 4. Full View Modal (Matching Image 3 High-Fidelity Label Preview) */}
      {viewingChemical && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 my-8">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 mb-4 gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-lg text-slate-900">
                  Container Label Preview
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                  OSHA 1910.1200 / GHS Compliant
                </span>
                <ApprovalStatusBadge status={viewingChemical.status} size="sm" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setWorkflowChemical(viewingChemical);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approval & Audit Workflow</span>
                </button>

                <button
                  onClick={() => {
                    handleModify(viewingChemical);
                    setViewingChemical(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Label</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#f25100] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </button>

                <button
                  onClick={() => setViewingChemical(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content: The Exact Image 3 Label Preview */}
            <div className="flex justify-center overflow-x-auto py-2">
              <GeneratedLabelPreview
                chemical={viewingChemical}
                config={activeLabelConfig}
                settings={companySettings}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Approval Workflow & Compliance Sign-Off Modal */}
      {workflowChemical && (
        <ApprovalWorkflowModal
          chemical={chemicals.find((c) => c.id === workflowChemical.id) || workflowChemical}
          currentUser={currentUser}
          isOpen={Boolean(workflowChemical)}
          onClose={() => setWorkflowChemical(null)}
          onSubmitForApproval={submitForApproval}
          onApprove={approveChemicalWorkflow}
          onReject={rejectChemicalWorkflow}
          onReopenDraft={reopenChemicalDraft}
          onNavigateToStudio={() => {
            setSelectedChemicalId(workflowChemical.id);
            setWorkflowChemical(null);
            setCurrentView('add_chemical');
          }}
        />
      )}
    </div>
  );
};
