import React, { useState } from 'react';
import {
  Plus,
  FileText,
  Tag,
  FlaskConical,
  Check,
  Upload,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';

export const CreateHubView: React.FC = () => {
  const { setCurrentView } = useChemicals();
  const [modalInfo, setModalInfo] = useState<{ title: string; message: string; actionText?: string; targetView?: any } | null>(null);

  const handleCreateProduct = () => {
    setCurrentView('add_product_basic');
  };

  const handleCreateSds = () => {
    setCurrentView('create_sds');
  };

  const handleUploadPdf = (target: string) => {
    if (target === 'product') {
      setCurrentView('add_product_basic');
    } else if (target === 'sds') {
      setCurrentView('create_sds');
    } else if (target === 'label') {
      setCurrentView('add_chemical');
    } else if (target === 'mixture') {
      setCurrentView('create_mixture');
    } else {
      setModalInfo({
        title: 'Upload SDS PDF to Auto-fill',
        message: 'Upload your manufacturer SDS document to automatically extract GHS pictograms, H/P statements, and hazard classifications.',
        actionText: 'Open Label Generator with AI Auto-fill',
        targetView: 'add_chemical',
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-2">
      {/* Centered Subtitle */}
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-slate-600 text-sm sm:text-base font-normal">
          Choose an option to get started with adding a new product to the system
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* CARD 1: Create New Product (Orange Glow & Hover matching symbol #ea580c / #f97316) */}
        <div
          onClick={handleCreateProduct}
          className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#ea580c] hover:ring-2 hover:ring-[#ea580c]/40 hover:shadow-2xl hover:shadow-orange-500/20 hover:bg-orange-50/15 transform hover:scale-[1.04] hover:-translate-y-2 transition-all duration-300 ease-out p-6 flex flex-col justify-between items-center text-center cursor-pointer z-10 hover:z-30"
        >
          <div className="flex flex-col items-center w-full">
            {/* Orange Circle Icon */}
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5 text-[#f97316] group-hover:scale-110 group-hover:bg-orange-100 group-hover:text-[#ea580c] transition-all duration-300">
              <Plus className="w-10 h-10 stroke-[2.5]" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#ea580c] group-hover:text-[#c2410c] mb-2 tracking-tight transition-colors">
              Create New Product
            </h2>

            {/* Description */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 min-h-[42px]">
              Start with basic product information to quickly add a new product to the system.
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 text-left w-full my-2 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Product Name & Codes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Location & Batch Details</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Manufacturing & Expiry Dates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Quick Approval Process</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full space-y-2.5 mt-6 pt-4 border-t border-slate-100"
          >
            <button
              onClick={handleCreateProduct}
              className="w-full py-2.5 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Start Basic Info
            </button>
            <button
              onClick={() => handleUploadPdf('product')}
              className="w-full py-2 px-4 border border-orange-200 text-orange-600 hover:bg-orange-50 font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-orange-600" />
              <span>Upload PDF to Auto-fill</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Create SDS Sheet (Blue Glow & Hover matching symbol #2563eb / #3b82f6) */}
        <div
          onClick={handleCreateSds}
          className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#2563eb] hover:ring-2 hover:ring-[#2563eb]/40 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-blue-50/15 transform hover:scale-[1.04] hover:-translate-y-2 transition-all duration-300 ease-out p-6 flex flex-col justify-between items-center text-center cursor-pointer z-10 hover:z-30"
        >
          <div className="flex flex-col items-center w-full">
            {/* Blue Circle Icon */}
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5 text-[#3b82f6] group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-[#2563eb] transition-all duration-300">
              <FileText className="w-9 h-9 stroke-[2]" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#2563eb] group-hover:text-blue-700 mb-2 tracking-tight transition-colors">
              Create SDS Sheet
            </h2>

            {/* Description */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 min-h-[42px]">
              Create a comprehensive Safety Data Sheet (SDS) with all 16 required sections for regulatory compliance.
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 text-left w-full my-2 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Complete SDS Elements 1-16</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Approval Workflow Process</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Regulatory Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Export to SDS Library</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full space-y-2.5 mt-6 pt-4 border-t border-slate-100"
          >
            <button
              onClick={handleCreateSds}
              className="w-full py-2.5 px-4 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Start SDS Sheet
            </button>
            <button
              onClick={() => handleUploadPdf('sds')}
              className="w-full py-2 px-4 border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload PDF to Auto-fill</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Create Label (Green Glow & Hover matching symbol #16a34a / #22c55e) */}
        <div
          onClick={() => setCurrentView('add_chemical')}
          className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#16a34a] hover:ring-2 hover:ring-[#16a34a]/40 hover:shadow-2xl hover:shadow-emerald-500/20 hover:bg-emerald-50/15 transform hover:scale-[1.04] hover:-translate-y-2 transition-all duration-300 ease-out p-6 flex flex-col justify-between items-center text-center cursor-pointer z-10 hover:z-30"
        >
          <div className="flex flex-col items-center w-full">
            {/* Green Circle Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5 text-[#22c55e] group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-[#16a34a] transition-all duration-300">
              <Tag className="w-9 h-9 stroke-[2]" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#16a34a] group-hover:text-emerald-700 mb-2 tracking-tight transition-colors">
              Create Label
            </h2>

            {/* Description */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 min-h-[42px]">
              Generate GHS-compliant chemical labels with hazard statements, precautionary statements, and safety information.
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 text-left w-full my-2 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>GHS Hazard & Precautionary Statements</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Auto-fill from SDS Library</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Label Preview & Printing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Workflow Approval Process</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full space-y-2.5 mt-6 pt-4 border-t border-slate-100"
          >
            <button
              id="btn-card-create-label"
              onClick={() => setCurrentView('add_chemical')}
              className="w-full py-2.5 px-4 bg-[#16a34a] hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Create New Label
            </button>
            <button
              onClick={() => handleUploadPdf('label')}
              className="w-full py-2 px-4 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upload PDF to Auto-fill</span>
            </button>
          </div>
        </div>

        {/* CARD 4: Create Mixture (Purple Glow & Hover matching symbol #7c3aed / #8b5cf6) */}
        <div
          onClick={() => setCurrentView('create_mixture')}
          className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#7c3aed] hover:ring-2 hover:ring-[#7c3aed]/40 hover:shadow-2xl hover:shadow-purple-500/20 hover:bg-purple-50/15 transform hover:scale-[1.04] hover:-translate-y-2 transition-all duration-300 ease-out p-6 flex flex-col justify-between items-center text-center cursor-pointer z-10 hover:z-30"
        >
          <div className="flex flex-col items-center w-full">
            {/* Purple Circle Icon */}
            <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-5 text-[#8b5cf6] group-hover:scale-110 group-hover:bg-purple-100 group-hover:text-[#7c3aed] transition-all duration-300">
              <FlaskConical className="w-9 h-9 stroke-[2]" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#7c3aed] group-hover:text-purple-700 mb-2 tracking-tight transition-colors">
              Create Mixture
            </h2>

            {/* Description */}
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 min-h-[42px]">
              Create a chemical mixture with 2+ substances and auto-calculated hazard classification.
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 text-left w-full my-2 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Select from Chemical Database</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Set Concentration Percentages</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Auto-Calculate Hazards</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5-Step Approval Workflow</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full space-y-2.5 mt-6 pt-4 border-t border-slate-100"
          >
            <button
              id="btn-card-create-mixture"
              onClick={() => setCurrentView('create_mixture')}
              className="w-full py-2.5 px-4 bg-[#7c3aed] hover:bg-purple-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Create New Mixture
            </button>
            <button
              onClick={() => handleUploadPdf('mixture')}
              className="w-full py-2 px-4 border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>Upload PDF to Auto-fill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Text */}
      <div className="text-center mt-10">
        <p className="text-slate-500 text-xs sm:text-sm">
          All options include approval workflows and integration with the OILSERV chemical management system
        </p>
      </div>

      {/* Info Modal for previewing options */}
      {modalInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{modalInfo.title}</h3>
              </div>
              <button
                onClick={() => setModalInfo(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {modalInfo.message}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setModalInfo(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              {modalInfo.actionText && (
                <button
                  onClick={() => {
                    const target = modalInfo.targetView;
                    setModalInfo(null);
                    if (target) setCurrentView(target);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{modalInfo.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
