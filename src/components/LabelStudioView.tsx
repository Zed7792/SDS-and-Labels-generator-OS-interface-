import React, { useState } from 'react';
import {
  Save,
  Printer,
  Download,
  FileCode,
  GitBranch,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  Maximize2,
} from 'lucide-react';
import { LabelSize } from '../types';
import { useChemicals } from '../context/ChemicalContext';
import { LabelPreview } from './LabelPreview';
import { ValidationPanel } from './ValidationPanel';

export const LabelStudioView: React.FC = () => {
  const {
    chemicals,
    selectedChemical,
    setSelectedChemicalId,
    activeLabelConfig,
    setActiveLabelConfig,
    saveLabel,
    createNewVersion,
    companySettings,
    addAuditLog,
  } = useChemicals();

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChemicalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedChemicalId(id);
    setActiveLabelConfig((prev) => ({
      ...prev,
      chemicalId: id,
    }));
  };

  const handleSizeChange = (size: LabelSize) => {
    setActiveLabelConfig((prev) => ({ ...prev, labelSize: size }));
  };

  const toggleOption = (key: keyof typeof activeLabelConfig) => {
    setActiveLabelConfig((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    saveLabel(activeLabelConfig);
    showToast(`Label v${activeLabelConfig.version} successfully saved to facility repository!`);
  };

  const handleCreateNewVersion = () => {
    if (!selectedChemical) return;
    const newVer = createNewVersion(selectedChemical.id, activeLabelConfig.version);
    setActiveLabelConfig((prev) => ({
      ...prev,
      version: newVer,
    }));
    showToast(`Created new compliant revision: Version ${newVer}`);
  };

  const handlePrint = () => {
    addAuditLog({
      chemicalId: selectedChemical?.id,
      chemicalName: selectedChemical?.productName || 'Unknown',
      action: 'Label Printed',
      user: 'Dr. Sarah Vance, CSP',
      role: 'EHS Specialist',
      details: `Printed ${activeLabelConfig.labelSize} label for Batch ${activeLabelConfig.batchNumber}`,
      type: 'label_generated',
    });
    window.print();
  };

  const handleDownload = () => {
    // Export label data specification as JSON file for industrial thermal printer integration (Zebra ZPL / Avery)
    const labelData = {
      config: activeLabelConfig,
      chemical: selectedChemical,
      company: companySettings,
      exportedAt: new Date().toISOString(),
      standard: 'OSHA HazCom 2012 / UN GHS Rev 10',
    };
    const blob = new Blob([JSON.stringify(labelData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Label_${selectedChemical?.productCode || 'Chemical'}_${activeLabelConfig.labelSize}_v${activeLabelConfig.version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded print manifest & thermal printer specification!');
  };

  if (!selectedChemical) {
    return (
      <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
        <p className="text-slate-500">Please select a chemical first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Safety Label Studio
            </h1>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
              v{activeLabelConfig.version}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure, validate, and produce OSHA 1910.1200 / GHS Rev 10 high-durability container labels.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-save-label"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Label</span>
          </button>

          <button
            id="btn-new-version"
            onClick={handleCreateNewVersion}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md border border-slate-300 shadow-2xs transition-colors"
            title="Create New Version (+0.1 bump)"
          >
            <GitBranch className="w-3.5 h-3.5 text-slate-600" />
            <span>New Version</span>
          </button>

          <button
            id="btn-download-label"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-md border border-slate-300 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Manifest</span>
          </button>

          <button
            id="btn-print-label"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Pre-Publishing Compliance Validation Panel */}
      <ValidationPanel
        chemical={selectedChemical}
        onPublishApproved={() => {
          showToast('Certified compliance sign-off recorded. Label ready for dispatch.');
        }}
      />

      {/* Workspace: Left Controls & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Panel (cols 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Chemical Selection */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Target Chemical Product:
            </label>
            <select
              value={selectedChemical.id}
              onChange={handleChemicalChange}
              className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {chemicals.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.productName} ({c.productCode})
                </option>
              ))}
            </select>
          </div>

          {/* Label Size Selection */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Label Dimensions & Substrate:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '4x6', label: '4" × 6" Drum', desc: '55-gal Drum / Tote' },
                { id: '3x5', label: '3" × 5" Canister', desc: 'Carboys & Pails' },
                { id: '2x4', label: '2" × 4" Bottle', desc: 'Secondary Vessels' },
                { id: '8.5x11', label: '8.5" × 11" Placard', desc: 'Bay Safety Board' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => handleSizeChange(sz.id as LabelSize)}
                  className={`p-2.5 rounded-md border text-left transition-all ${
                    activeLabelConfig.labelSize === sz.id
                      ? 'border-blue-600 bg-blue-50/60 text-blue-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{sz.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{sz.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Visibility Toggles */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Mandatory & Modular Visual Toggles:
            </span>

            <div className="space-y-1.5 text-xs">
              {[
                { key: 'showGhs', label: 'GHS Signal & Pictograms', sub: 'OSHA 1910.1200 Mandatory' },
                { key: 'showNfpa', label: 'NFPA 704 Diamond', sub: 'Emergency Response Hazard Rating' },
                { key: 'showHmis', label: 'HMIS® III Workplace Bar', sub: 'Employee Safety & Chronic Hazards' },
                { key: 'showPpe', label: 'PPE Requirements Icons', sub: 'Eye, Hand, Respirator, Foot' },
                { key: 'showEmergency', label: '24/7 Emergency Hotline', sub: 'CHEMTREC & Facility EOC' },
                { key: 'showQr', label: 'Direct SDS QR Code', sub: 'Instant mobile phone scan' },
                { key: 'showBatchLot', label: 'Batch / Lot & Fill Date', sub: 'Traceability & Shelf Life' },
              ].map((item) => {
                const isChecked = !!(activeLabelConfig as any)[item.key];
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.sub}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOption(item.key as any)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Operational Batch & Container Details */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Batch & Container Metadata:
            </span>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Batch / Lot Number:</label>
              <input
                type="text"
                value={activeLabelConfig.batchNumber}
                onChange={(e) => setActiveLabelConfig(prev => ({ ...prev, batchNumber: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Container Type & Volume:</label>
              <input
                type="text"
                value={activeLabelConfig.containerSize}
                onChange={(e) => setActiveLabelConfig(prev => ({ ...prev, containerSize: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-md font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Fill / Dispensing Date:</label>
              <input
                type="date"
                value={activeLabelConfig.fillDate}
                onChange={(e) => setActiveLabelConfig(prev => ({ ...prev, fillDate: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-md font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 font-medium block mb-1">Custom Header Warning:</label>
              <input
                type="text"
                value={activeLabelConfig.customHeader || ''}
                onChange={(e) => setActiveLabelConfig(prev => ({ ...prev, customHeader: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-md font-semibold text-[11px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="HAZARDOUS CHEMICAL WORKPLACE LABEL"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Panel (cols 8) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full bg-white border border-slate-200 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center min-h-[520px] overflow-x-auto shadow-xs">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-4 px-1 border-b border-slate-100 pb-2">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Live Container Label Canvas ({activeLabelConfig.labelSize})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Production-Ready Vector Layout
              </span>
            </div>

            {/* Enforced Dimension & Layout Label Preview Component */}
            <LabelPreview
              chemical={selectedChemical}
              config={activeLabelConfig}
              settings={companySettings}
              ratingSystem={
                activeLabelConfig.showNfpa && activeLabelConfig.showHmis
                  ? 'both'
                  : activeLabelConfig.showHmis
                  ? 'hmis'
                  : 'nfpa'
              }
              onRatingSystemChange={(sys) => {
                if (sys === 'both') {
                  setActiveLabelConfig((prev) => ({ ...prev, showNfpa: true, showHmis: true }));
                } else if (sys === 'nfpa') {
                  setActiveLabelConfig((prev) => ({ ...prev, showNfpa: true, showHmis: false }));
                } else {
                  setActiveLabelConfig((prev) => ({ ...prev, showNfpa: false, showHmis: true }));
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
