import React, { useState, useEffect } from 'react';
import {
  Send,
  Clock,
  Check,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogramId } from '../types';

type WorkflowStep = 'submit' | 'review' | 'approved';

export const AddProductBasicView: React.FC = () => {
  const { addChemical, setCurrentView, currentUser, setSelectedChemicalId } = useChemicals();

  // Workflow Step State (3 Phases)
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('submit');

  // Form Fields (10 Essential Fields matching attached image)
  const [productName, setProductName] = useState('');
  const [oilservCode, setOilservCode] = useState('');
  const [casNumber, setCasNumber] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Default dates
  const todayStr = '2026-10-10';
  const threeYearsLaterStr = '2029-10-09';
  const [sdsAddedDate, setSdsAddedDate] = useState(todayStr);
  const [sdsReviewDate, setSdsReviewDate] = useState(threeYearsLaterStr);

  // Supplier SDS file upload state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  // Review comments & created chemical id
  const [reviewComments, setReviewComments] = useState('');
  const [createdChemicalId, setCreatedChemicalId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-calculate Expiry Date (3 years from manufacturing date)
  useEffect(() => {
    if (manufacturingDate) {
      try {
        const [year, month, day] = manufacturingDate.split('-').map(Number);
        if (year && month && day) {
          const expYear = year + 3;
          const expMonthStr = String(month).padStart(2, '0');
          const expDayStr = String(day).padStart(2, '0');
          setExpiryDate(`${expYear}-${expMonthStr}-${expDayStr}`);
        }
      } catch (e) {
        // keep existing
      }
    }
  }, [manufacturingDate]);

  // Auto-calculate SDS Review Date (3 years from SDS Added Date)
  useEffect(() => {
    if (sdsAddedDate) {
      try {
        const [year, month, day] = sdsAddedDate.split('-').map(Number);
        if (year && month && day) {
          const revYear = year + 3;
          const revMonthStr = String(month).padStart(2, '0');
          const revDay = day > 1 ? day - 1 : day;
          const revDayStr = String(revDay).padStart(2, '0');
          setSdsReviewDate(`${revYear}-${revMonthStr}-${revDayStr}`);
        }
      } catch (e) {
        // keep existing
      }
    }
  }, [sdsAddedDate]);

  // Handle Mock File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    }
  };

  // Phase 1 Submission: Submit for Review
  const handleSubmitForReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productName.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }
    if (!oilservCode.trim()) {
      setErrorMsg('Oilserv Code is required.');
      return;
    }
    if (!casNumber.trim()) {
      setErrorMsg('CAS Number is required.');
      return;
    }
    if (!storageLocation.trim()) {
      setErrorMsg('Storage Location is required.');
      return;
    }
    if (!batchNumber.trim()) {
      setErrorMsg('Batch Number is required.');
      return;
    }
    if (!manufacturingDate) {
      setErrorMsg('Manufacturing Date is required.');
      return;
    }

    // Advance to Phase 2 (Review Basic Information)
    setCurrentStep('review');
  };

  // Phase 2: Approve Basic Information
  const handleApproveProduct = () => {
    // Add chemical to system
    const defaultPictograms: GhsPictogramId[] = ['flame', 'gas-cylinder', 'exclamation-mark'];
    const newChem = addChemical({
      productName: productName.trim(),
      manufacturer: 'OILSERV Energy Ltd',
      productCode: oilservCode.trim(),
      casNumber: casNumber.trim(),
      physicalState: 'Liquid',
      sdsRevisionDate: sdsAddedDate || '2026-10-10',
      status: 'approved',
      lastReviewedDate: '2026-10-10',
      lastReviewedBy: currentUser.name || 'Dr. Sarah Vance, CSP',
      signalWord: 'WARNING',
      pictograms: defaultPictograms,
      hazardClasses: ['Flammable Liquid Cat. 2', 'Acute Toxicity Cat. 4'],
      hStatements: [
        { code: 'H225', text: 'Highly flammable liquid and vapor.', category: 'physical' },
        { code: 'H302', text: 'Harmful if swallowed.', category: 'health' },
      ],
      pStatements: [
        { code: 'P210', text: 'Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking.', category: 'prevention' },
        { code: 'P280', text: 'Wear protective gloves/protective clothing/eye protection/face protection.', category: 'prevention' },
      ],
      nfpa: { health: 2, flammability: 3, instability: 0, special: '' },
      hmis: { health: 2, flammability: 3, physicalHazard: 0, ppeCode: 'H' },
      ppe: {
        eye: 'Indirect Vent Chemical Goggles',
        hand: 'Heavy Nitrile / Neoprene Gloves',
        respiratory: 'Half-mask Organic Vapor Respirator (OV/P100)',
        body: 'Flame-Retardant Cotton / Nomex Coveralls',
        foot: 'Steel-toe Chemical-Resistant Rubber Boots',
      },
      emergency: {
        firstAidInhalation: 'Move victim to fresh air. Provide oxygen if breathing is labored.',
        firstAidSkin: 'Flush skin with copious water for at least 15 minutes. Remove contaminated clothing.',
        firstAidEye: 'Rinse cautiously with water for several minutes. Seek immediate medical attention.',
        firstAidIngestion: 'Do NOT induce vomiting. Rinse mouth thoroughly and seek medical advice.',
        fireResponse: 'Use dry chemical, CO2, water spray or alcohol-resistant foam.',
        spillResponse: 'Absorb with inert material (vermiculite, dry sand) and transfer to dedicated container.',
        storageHandling: `Store in ${storageLocation || 'Zone A Hazmat Warehouse'}. Keep secondary container grounded.`,
        emergencyContact: 'OILSERV Emergency Operations Center (EOC)',
        emergencyPhone: '+234-1-234-5678 / CHEMTREC +1-800-424-9300',
      },
      notes: `Basic product details approved. Batch: ${batchNumber}. Storage: ${storageLocation}. Mfg Date: ${manufacturingDate}. Expiry: ${expiryDate}. Reviewer comments: ${reviewComments || 'Approved based on standard 10-field basic information submission.'}`,
    });

    setCreatedChemicalId(newChem.id);
    setSelectedChemicalId(newChem.id);
    setCurrentStep('approved');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 px-3 space-y-6">
      {/* Top Banner Message when in Review or Approved */}
      {currentStep === 'review' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-amber-950">
              Phase 2: Review Basic Information Active
            </span>
            <span>
              Basic product details have been drafted. As HSE Specialist (or logged in role: <strong>{currentUser.name}</strong>), you can inspect the 10 fields below and complete the sign-off.
            </span>
          </div>
        </div>
      )}

      {currentStep === 'approved' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-emerald-950">
              Phase 3: Basic Information Approved & Listed!
            </span>
            <span>
              <strong>{productName}</strong> ({oilservCode}) is now officially listed in the OILSERV chemical inventory & SDS Library.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP CARD: Basic Information Approval Workflow (3 Phases Stepper) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-7 tracking-tight">
          Basic Information Approval Workflow
        </h2>

        {/* 3 Phases Stepper */}
        <div className="flex items-center justify-center max-w-lg mx-auto">
          {/* STEP 1: Submit Basic Information */}
          <div className="flex flex-col items-center text-center w-28 sm:w-32">
            <button
              type="button"
              onClick={() => {
                if (currentStep !== 'approved') setCurrentStep('submit');
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentStep === 'submit'
                  ? 'bg-[#2563eb] text-white shadow-sm ring-4 ring-blue-100'
                  : 'bg-[#2563eb] text-white'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
            <span
              className={`text-[11px] sm:text-xs mt-2 font-medium leading-tight ${
                currentStep === 'submit' ? 'text-[#2563eb] font-semibold' : 'text-slate-600'
              }`}
            >
              Submit Basic Information
            </span>
          </div>

          {/* CONNECTOR LINE 1 */}
          <div
            className={`h-0.5 flex-1 mx-2 transition-colors ${
              currentStep === 'review' || currentStep === 'approved'
                ? 'bg-[#2563eb]'
                : 'bg-slate-200'
            }`}
          />

          {/* STEP 2: Review Basic Information */}
          <div className="flex flex-col items-center text-center w-28 sm:w-32">
            <button
              type="button"
              onClick={() => {
                if (productName && oilservCode) setCurrentStep('review');
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentStep === 'review'
                  ? 'bg-amber-500 text-white shadow-sm ring-4 ring-amber-100'
                  : currentStep === 'approved'
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
            </button>
            <span
              className={`text-[11px] sm:text-xs mt-2 font-medium leading-tight ${
                currentStep === 'review'
                  ? 'text-amber-600 font-semibold'
                  : currentStep === 'approved'
                  ? 'text-slate-600'
                  : 'text-slate-400'
              }`}
            >
              Review Basic Information
            </span>
          </div>

          {/* CONNECTOR LINE 2 */}
          <div
            className={`h-0.5 flex-1 mx-2 transition-colors ${
              currentStep === 'approved' ? 'bg-[#2563eb]' : 'bg-slate-200'
            }`}
          />

          {/* STEP 3: Basic Information Approved */}
          <div className="flex flex-col items-center text-center w-28 sm:w-32">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentStep === 'approved'
                  ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
            </div>
            <span
              className={`text-[11px] sm:text-xs mt-2 font-medium leading-tight ${
                currentStep === 'approved' ? 'text-emerald-600 font-semibold' : 'text-slate-400'
              }`}
            >
              Basic Information Approved
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CARD: Basic Product Information Form (Matching Image 1) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Basic Product Information
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Complete these 10 essential fields to get your product listed in the SDS Library. You can add the full 16-element SDS later by clicking on the product.
          </p>
        </div>

        <form onSubmit={handleSubmitForReview} className="space-y-4">
          {/* Row 1: Product Name & Oilserv Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Oilserv Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={oilservCode}
                onChange={(e) => setOilservCode(e.target.value)}
                placeholder="Enter Oilserv code"
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Row 2: CAS Number & Storage Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CAS Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={casNumber}
                onChange={(e) => setCasNumber(e.target.value)}
                placeholder="Enter CAS number"
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Storage Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="Enter storage location"
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Row 3: Batch Number & Manufacturing Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Batch Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="Enter batch number"
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Manufacturing Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  disabled={currentStep === 'approved'}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 4: Expiry Date & SDS Added Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-calculated as 3 years from manufacturing date
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SDS Added Date
              </label>
              <input
                type="date"
                value={sdsAddedDate}
                onChange={(e) => setSdsAddedDate(e.target.value)}
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Row 5: SDS Review Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SDS Review Date
              </label>
              <input
                type="date"
                value={sdsReviewDate}
                onChange={(e) => setSdsReviewDate(e.target.value)}
                disabled={currentStep === 'approved'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-calculated as 3 years from SDS added date
              </p>
            </div>
          </div>

          {/* Row 6: Upload Supplier SDS (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Upload Supplier SDS (Optional)
            </label>

            <label className="block border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition-all">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={currentStep === 'approved'}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
                  <FileText className="w-4 h-4" />
                  <span>{uploadedFile.name} ({uploadedFile.size})</span>
                  <span className="text-emerald-600 font-bold ml-1">✓ Attached</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to upload supplier SDS file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PDF, DOC, or DOCX (MAX. 10MB)
                  </p>
                </>
              )}
            </label>

            <p className="text-[11px] text-slate-400 mt-1.5">
              Upload the supplier's SDS document. This will be viewable in the SDS Library after approval.
            </p>
          </div>

          {/* Phase 2: Review Form Section */}
          {currentStep === 'review' && (
            <div className="pt-4 border-t border-slate-200 space-y-3 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-700">
                HSE Reviewer Sign-Off Comments (Optional)
              </label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={2}
                placeholder="Enter HSE compliance notes, verified SDS authenticity, or handling instructions..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 resize-none"
              />
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('create_hub')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* If in Submit Phase */}
            {currentStep === 'submit' && (
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Submit for Review
              </button>
            )}

            {/* If in Review Phase */}
            {currentStep === 'review' && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentStep('submit')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Edit Information
                </button>
                <button
                  type="button"
                  onClick={handleApproveProduct}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve & Certify Product</span>
                </button>
              </div>
            )}

            {/* If in Approved Phase */}
            {currentStep === 'approved' && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setProductName('');
                    setOilservCode('');
                    setCasNumber('');
                    setStorageLocation('');
                    setBatchNumber('');
                    setManufacturingDate('');
                    setUploadedFile(null);
                    setCurrentStep('submit');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Add Another Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('library')}
                  className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View in Labels Library</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
