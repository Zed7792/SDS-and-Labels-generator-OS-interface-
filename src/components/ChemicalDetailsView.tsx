import React, { useState } from 'react';
import {
  ArrowLeft,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  FileText,
  ShieldAlert,
  Flame,
  Activity,
  HeartPulse,
  Eye,
  Hand,
  Wind,
  Shield,
  PhoneCall,
  Save,
  Trash2,
} from 'lucide-react';
import { Chemical, GhsPictogramId, GhsSignalWord } from '../types';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogram } from './GhsPictogram';
import { NfpaDiamond } from './NfpaDiamond';
import { HmisBar } from './HmisBar';

export const ChemicalDetailsView: React.FC = () => {
  const {
    selectedChemical,
    setSelectedChemicalId,
    setCurrentView,
    updateChemical,
    approveChemical,
    deleteChemical,
  } = useChemicals();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Chemical | null>(selectedChemical);

  if (!selectedChemical) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">No chemical selected.</p>
        <button
          onClick={() => setCurrentView('library')}
          className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
        >
          Return to Chemical Library
        </button>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditForm(JSON.parse(JSON.stringify(selectedChemical)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editForm) {
      updateChemical(editForm.id, editForm);
      setIsEditing(false);
    }
  };

  const current = isEditing && editForm ? editForm : selectedChemical;

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('library')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Back to Chemical Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {current.productName}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  current.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {current.status === 'approved' ? 'Approved for Use' : 'Requires EHS Review'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {current.manufacturer} • Product Code: <strong className="text-slate-700">{current.productCode}</strong> • CAS: <strong className="font-mono text-slate-700">{current.casNumber}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {current.status === 'requires_review' && (
            <button
              onClick={() => approveChemical(current.id)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Record</span>
            </button>
          )}

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedChemicalId(current.id);
              setCurrentView('add_chemical');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Edit / Print Label</span>
          </button>
        </div>
      </div>

      {/* Grid of Structured Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols): Product Info + GHS + Emergency */}
        <div className="lg:col-span-2 space-y-5">
          {/* SECTION 1: Product Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>1. Product Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Product Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.productName || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, productName: e.target.value } : null)}
                    className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-900"
                  />
                ) : (
                  <span className="font-bold text-slate-900">{current.productName}</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Manufacturer:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.manufacturer || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, manufacturer: e.target.value } : null)}
                    className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-900"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">{current.manufacturer}</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Product Code:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.productCode || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, productCode: e.target.value } : null)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono font-semibold"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-800">{current.productCode}</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-medium block">CAS Number:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.casNumber || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, casNumber: e.target.value } : null)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono"
                  />
                ) : (
                  <span className="font-mono font-bold text-slate-800">{current.casNumber}</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Physical State:</span>
                {isEditing ? (
                  <select
                    value={editForm?.physicalState || 'Liquid'}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, physicalState: e.target.value as any } : null)}
                    className="w-full p-1.5 border border-slate-300 rounded font-semibold"
                  >
                    <option value="Liquid">Liquid</option>
                    <option value="Gas">Gas</option>
                    <option value="Solid">Solid</option>
                    <option value="Slurry">Slurry</option>
                    <option value="Powder">Powder</option>
                  </select>
                ) : (
                  <span className="font-semibold text-slate-800">{current.physicalState}</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 font-medium block">SDS Revision Date:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm?.sdsRevisionDate || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, sdsRevisionDate: e.target.value } : null)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono"
                  />
                ) : (
                  <span className="font-mono font-semibold text-slate-800">{current.sdsRevisionDate || 'Not Available'}</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: GHS Classification */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>2. Globally Harmonized System (GHS)</span>
            </h2>

            {/* Signal Word and Pictograms */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block mb-1">GHS Signal Word:</span>
                <span
                  className={`inline-block text-xs font-black uppercase px-3 py-1 rounded shadow-xs tracking-wider ${
                    current.signalWord === 'DANGER'
                      ? 'bg-red-600 text-white'
                      : current.signalWord === 'WARNING'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {current.signalWord}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">Assigned GHS Pictograms:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(current.pictograms || []).map((p) => (
                    <GhsPictogram key={p} id={p} size={36} showLabel />
                  ))}
                  {(!current.pictograms || current.pictograms.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No pictograms assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Hazard Classes */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">Hazard Classes & Categories:</span>
              <div className="flex flex-wrap gap-1.5">
                {current.hazardClasses.map((hc, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-medium"
                  >
                    {hc}
                  </span>
                ))}
              </div>
            </div>

            {/* H-Statements */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">Hazard Statements (H-Statements):</span>
              <div className="space-y-1.5">
                {current.hStatements.map((h) => (
                  <div key={h.code} className="text-xs bg-slate-50 p-2 rounded border border-slate-200 flex items-start gap-2">
                    <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded text-[11px]">
                      {h.code}
                    </span>
                    <span className="text-slate-800 font-medium">{h.statement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* P-Statements */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">Precautionary Statements (P-Statements):</span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {current.pStatements.map((p, idx) => (
                  <div key={`${p.code}-${idx}`} className="text-xs bg-slate-50 p-2 rounded border border-slate-200 flex items-start gap-2">
                    <span className="font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                      {p.code}
                    </span>
                    <div className="flex-1">
                      <span className="text-slate-800">{p.statement}</span>
                      {p.type && (
                        <span className="ml-2 text-[10px] text-slate-500 uppercase font-semibold">
                          [{p.type}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: Emergency Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>3. Emergency Information & First Aid Measures</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Wind className="w-3.5 h-3.5 text-blue-600" />
                  Inhalation Response:
                </span>
                <p className="text-slate-700 leading-relaxed">{current.emergency.firstAidInhalation}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Hand className="w-3.5 h-3.5 text-amber-600" />
                  Skin Contact Response:
                </span>
                <p className="text-slate-700 leading-relaxed">{current.emergency.firstAidSkin}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  Eye Contact Response:
                </span>
                <p className="text-slate-700 leading-relaxed">{current.emergency.firstAidEye}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <HeartPulse className="w-3.5 h-3.5 text-red-600" />
                  Ingestion Response:
                </span>
                <p className="text-slate-700 leading-relaxed">{current.emergency.firstAidIngestion}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg">
                <span className="font-bold text-red-950 block mb-0.5">Fire Response (Section 5):</span>
                <p className="text-slate-800">{current.emergency.fireResponse}</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                <span className="font-bold text-amber-950 block mb-0.5">Accidental Release / Spill (Section 6):</span>
                <p className="text-slate-800">{current.emergency.spillResponse}</p>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-950 block mb-0.5">24/7 Emergency Contact Hotline:</span>
                <p className="text-blue-900 font-bold">{current.emergency.emergencyContact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): NFPA 704 + HMIS + PPE */}
        <div className="space-y-5">
          {/* SECTION 3: NFPA 704 Diamond */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Flame className="w-4 h-4 text-red-600" />
              <span>NFPA 704 Standard Rating</span>
            </h2>

            <div className="flex flex-col items-center justify-center py-2">
              <NfpaDiamond rating={current.nfpa} size={130} showLegend />
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Standard 4-quadrant system for first responders and emergency fire crews.
            </div>
          </div>

          {/* SECTION 4: HMIS III Rating */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>HMIS® III Workplace Rating</span>
            </h2>

            <div className="flex flex-col items-center justify-center py-2">
              <HmisBar rating={current.hmis} width={200} showLegend />
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Workplace label standard indicating chronic health, flammability, and physical hazards.
            </div>
          </div>

          {/* SECTION: PPE Personal Protective Equipment */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Mandatory PPE Requirements</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Eye Protection:</span>
                  <span className="text-slate-600">{current.ppe.eye}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                  <Hand className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Hand Protection:</span>
                  <span className="text-slate-600">{current.ppe.hand}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Respiratory Protection:</span>
                  <span className="text-slate-600">{current.ppe.respiratory}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Body Protection:</span>
                  <span className="text-slate-600">{current.ppe.body}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Foot Protection:</span>
                  <span className="text-slate-600">{current.ppe.foot}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
