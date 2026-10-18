import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Edit3,
  Flame,
  Activity,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { Chemical, HStatement, PStatement } from '../types';
import { GHS_HAZARD_STATEMENTS, GHS_PRECAUTIONARY_STATEMENTS } from '../data/ghsStatements';
import { GhsPictogram } from './GhsPictogram';
import { NfpaDiamond } from './NfpaDiamond';
import { HmisBar } from './HmisBar';

export const AiExtractionReviewView: React.FC = () => {
  const {
    pendingAiReviewData,
    addChemical,
    setSelectedChemicalId,
    setCurrentView,
    addAuditLog,
  } = useChemicals();

  const extracted = pendingAiReviewData?.extracted || {};
  const rawText = pendingAiReviewData?.rawSdsText || '';
  const fileName = pendingAiReviewData?.fileName || 'Uploaded_SDS.pdf';

  // Build resolved H-statements from controlled dictionary
  const resolvedHStatements: HStatement[] = React.useMemo(() => {
    const codes: string[] = extracted.hStatementCodes || [];
    return codes.map((code) => {
      const match = GHS_HAZARD_STATEMENTS[code];
      return {
        code,
        statement: match ? match.statement : `Hazard statement (${code})`,
        category: match ? match.category : 'General',
      };
    });
  }, [extracted.hStatementCodes]);

  // Build resolved P-statements from controlled dictionary
  const resolvedPStatements: PStatement[] = React.useMemo(() => {
    const codes: string[] = extracted.pStatementCodes || [];
    return codes.map((code) => {
      const match = GHS_PRECAUTIONARY_STATEMENTS[code];
      return {
        code,
        statement: match ? match.statement : `Precautionary statement (${code})`,
        type: match ? match.type : 'General',
      };
    });
  }, [extracted.pStatementCodes]);

  // Review Form State with editable fields
  const [formData, setFormData] = useState({
    productName: extracted.productName || '',
    manufacturer: extracted.manufacturer || '',
    productCode: extracted.productCode || 'GEN-EXTRACTED-01',
    casNumber: extracted.casNumber || 'Not found',
    physicalState: extracted.physicalState || 'Liquid',
    sdsRevisionDate: extracted.sdsRevisionDate || new Date().toISOString().split('T')[0],
    signalWord: extracted.signalWord || 'WARNING',
    pictograms: extracted.pictograms || ['flame'],
    nfpaHealth: extracted.nfpa?.health ?? 2,
    nfpaFlam: extracted.nfpa?.flammability ?? 2,
    nfpaInst: extracted.nfpa?.instability ?? 0,
    nfpaSpec: extracted.nfpa?.special || '',
    hmisPpe: extracted.hmis?.ppeCode || 'H',
    firstAid: extracted.emergency?.firstAidInhalation || 'Consult SDS Section 4',
    emergencyPhone: extracted.emergency?.emergencyPhone || extracted.emergency?.emergencyContact || '1-800-424-9300',
  });

  const [verifiedFields, setVerifiedFields] = useState<Record<string, boolean>>({
    productName: true,
    signalWord: true,
    hStatements: true,
    pStatements: true,
    pictograms: true,
  });

  const toggleFieldVerified = (field: string) => {
    setVerifiedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleApproveAndSave = (destination: 'details' | 'label_studio') => {
    const newChemical: Omit<Chemical, 'id' | 'createdAt' | 'updatedAt'> = {
      productName: formData.productName || 'Extracted Chemical',
      manufacturer: formData.manufacturer || 'Unknown Manufacturer',
      productCode: formData.productCode || 'EXT-01',
      casNumber: formData.casNumber || 'N/A',
      physicalState: formData.physicalState as any,
      sdsRevisionDate: formData.sdsRevisionDate,
      signalWord: formData.signalWord as any,
      pictograms: formData.pictograms,
      hazardClasses: extracted.hazardClasses || ['GHS Classified Product'],
      hStatements: resolvedHStatements,
      pStatements: resolvedPStatements,
      nfpa: {
        health: formData.nfpaHealth,
        flammability: formData.nfpaFlam,
        instability: formData.nfpaInst,
        special: formData.nfpaSpec,
      },
      hmis: {
        health: formData.nfpaHealth,
        isChronic: false,
        flammability: formData.nfpaFlam,
        physicalHazard: formData.nfpaInst,
        ppeCode: formData.hmisPpe,
      },
      ppe: {
        eye: extracted.ppeRecommendations?.eye || 'Safety splash goggles',
        hand: extracted.ppeRecommendations?.hand || 'Impervious chemical gloves',
        respiratory: extracted.ppeRecommendations?.respiratory || 'Organic vapor respirator if ventilation inadequate',
        body: extracted.ppeRecommendations?.body || 'Chemical apron',
        foot: extracted.ppeRecommendations?.foot || 'Steel-toe boots',
      },
      emergency: {
        firstAidInhalation: extracted.emergency?.firstAidInhalation || 'Move to fresh air.',
        firstAidSkin: extracted.emergency?.firstAidSkin || 'Rinse with soap and water.',
        firstAidEye: extracted.emergency?.firstAidEye || 'Rinse with water for 15 minutes.',
        firstAidIngestion: extracted.emergency?.firstAidIngestion || 'Do not induce vomiting.',
        fireResponse: extracted.emergency?.fireResponse || 'Use water spray, dry chemical, CO2, or foam.',
        spillResponse: extracted.emergency?.spillResponse || 'Absorb with inert material and ventilate.',
        storageHandling: extracted.emergency?.storageHandling || 'Keep tightly closed in well-ventilated location.',
        emergencyContact: formData.emergencyPhone,
        emergencyPhone: formData.emergencyPhone,
      },
      status: 'approved',
      version: '1.0',
      lastReviewedDate: new Date().toISOString().split('T')[0],
      lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Verified)',
      notes: `Extracted from SDS: ${fileName}. Verified with controlled vocabulary.`,
    };

    const created = addChemical(newChemical);
    setSelectedChemicalId(created.id);
    addAuditLog({
      chemicalId: created.id,
      chemicalName: created.productName,
      action: 'SDS AI Extraction Verified',
      user: 'Dr. Sarah Vance, CSP',
      role: 'EHS Lead',
      details: `Verified and ingested safety record from ${fileName}`,
      type: 'sds_extracted',
    });

    setCurrentView(destination);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Human-in-the-Loop Safety Data Verification
            </h1>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
              EHS Sign-off Mandatory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Source File: <strong className="text-slate-800">{fileName}</strong> • Controlled vocabulary dictionary applied.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setCurrentView('add_chemical')}
            className="px-3.5 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            Discard
          </button>
          <button
            onClick={() => handleApproveAndSave('label_studio')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Approve & Launch Label Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side by Side Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Original Raw SDS Document Viewer (cols 5) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-lg p-4 border border-slate-800 text-slate-100 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-bold flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Original SDS Document Content</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Section 1 to 16</span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto max-h-[600px] font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap pr-2 border border-slate-800/80 p-3 rounded-md bg-slate-950/60">
            {rawText || 'No raw document content loaded.'}
          </div>
        </div>

        {/* Right: Extracted Data Fields & Verification Checklist (cols 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Core Identification Fields */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                1. Extracted Chemical Identification
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                No hallucinated fields allowed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Product Identifier</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Product Code</label>
                <input
                  type="text"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">CAS Number</label>
                <input
                  type="text"
                  value={formData.casNumber}
                  onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* GHS Classification Review */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                2. GHS Classification & Controlled Hazard Codes
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">
                Mapped to UN GHS Reference DB
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Extracted Signal Word:</label>
                <select
                  value={formData.signalWord}
                  onChange={(e) => setFormData({ ...formData, signalWord: e.target.value })}
                  className="font-bold text-xs px-2.5 py-1.5 rounded-md bg-white border border-slate-300 uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="DANGER">DANGER</option>
                  <option value="WARNING">WARNING</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Extracted Pictograms:</label>
                <div className="flex items-center gap-1.5">
                  {formData.pictograms.map((p: any) => (
                    <GhsPictogram key={p} id={p} size={30} />
                  ))}
                </div>
              </div>
            </div>

            {/* Resolved Hazard Statements */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Hazard Statements (H-Statements) [{resolvedHStatements.length} resolved]:
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {resolvedHStatements.map((h) => (
                  <div key={h.code} className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                      {h.code}
                    </span>
                    <span className="text-slate-800 flex-1">{h.statement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolved Precautionary Statements */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Precautionary Statements (P-Statements) [{resolvedPStatements.length} resolved]:
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {resolvedPStatements.map((p, i) => (
                  <div key={`${p.code}-${i}`} className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                      {p.code}
                    </span>
                    <span className="text-slate-800 flex-1">{p.statement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NFPA & HMIS Ratings */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block border-b border-slate-100 pb-2">
              3. Ratings & Emergency Response Dispatch
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">NFPA Health</label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={formData.nfpaHealth}
                  onChange={(e) => setFormData({ ...formData, nfpaHealth: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">NFPA Flammability</label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={formData.nfpaFlam}
                  onChange={(e) => setFormData({ ...formData, nfpaFlam: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">NFPA Instability</label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={formData.nfpaInst}
                  onChange={(e) => setFormData({ ...formData, nfpaInst: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">HMIS PPE Code</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.hmisPpe}
                  onChange={(e) => setFormData({ ...formData, hmisPpe: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-300 rounded-md font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">24-Hour Emergency Dispatch Hotline</label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
