import React, { useState } from 'react';
import {
  Building2,
  Shield,
  PhoneCall,
  Save,
  Clock,
  CheckCircle2,
  Lock,
  FileCheck,
  History,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';

export const CompanySettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    auditLogs,
  } = useChemicals();

  const [form, setForm] = useState(companySettings);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Facility safety settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Company & Facility HSE Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure legal entity identifiers, emergency response hotlines, and HazCom compliance enforcement.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (cols 7): Facility Configuration Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Facility & Legal Responsibility</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Company / Operating Entity:</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Facility Name:</label>
                <input
                  type="text"
                  value={form.facilityName}
                  onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">EPA / OSHA Facility Identifier:</label>
                <input
                  type="text"
                  value={form.facilityId}
                  onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">EHS Department Division:</label>
                <input
                  type="text"
                  value={form.ehsDepartment}
                  onChange={(e) => setForm({ ...form, ehsDepartment: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-600 font-medium block mb-1">Physical Facility Address:</label>
                <input
                  type="text"
                  value={form.facilityAddress}
                  onChange={(e) => setForm({ ...form, facilityAddress: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 pt-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Emergency Dispatch & CHEMTREC Credentials</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">24-Hour Emergency Dispatch Hotline:</label>
                <input
                  type="text"
                  value={form.emergencyHotline24}
                  onChange={(e) => setForm({ ...form, emergencyHotline24: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-bold text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">CHEMTREC / Transport Contract #:</label>
                <input
                  type="text"
                  value={form.chemtrecContractNumber}
                  onChange={(e) => setForm({ ...form, chemtrecContractNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Default Label Format:</label>
                <select
                  value={form.defaultLabelSize}
                  onChange={(e) => setForm({ ...form, defaultLabelSize: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="4x6">4" × 6" Drum (Standard)</option>
                  <option value="3x5">3" × 5" Canister</option>
                  <option value="2x4">2" × 4" Secondary Bottle</option>
                  <option value="8.5x11">8.5" × 11" Bay Placard</option>
                </select>
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 pt-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Compliance Protocols & Dual Sign-Off</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="font-bold text-slate-900">Strict OSHA 1910.1200 HazCom Validation</div>
                  <div className="text-[11px] text-slate-500">
                    Blocks printing unless all 11 required safety fields are verified.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.strictOshaValidation}
                  onChange={(e) => setForm({ ...form, strictOshaValidation: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="font-bold text-slate-900">Dual Sign-Off Requirement</div>
                  <div className="text-[11px] text-slate-500">
                    Requires two independent certified EHS reviews for Class 1 acute toxins & explosives.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.requireDualSignoff}
                  onChange={(e) => setForm({ ...form, requireDualSignoff: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-2xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Facility Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right (cols 5): Live Audit Trail Log */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              <span>Enterprise EHS Audit Log</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Immutable Trail</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            All chemical classifications, label prints, version increments, and approvals are recorded for regulatory audit inspections.
          </p>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50/60 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-700 font-medium">
                  Chemical: <strong className="text-slate-900">{log.chemicalName}</strong>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">{log.details}</p>
                <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>By: <strong className="text-slate-700">{log.user}</strong> ({log.role})</span>
                  <span className="font-mono">{new Date(log.timestamp).toISOString().split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
