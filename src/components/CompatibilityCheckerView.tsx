import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ShieldCheck,
  Flame,
  Thermometer,
  Skull,
  Droplets,
  Layers,
  Search,
  Printer,
  RefreshCw,
  Info,
  ChevronRight,
  Shield,
  Building2,
  Plus,
  Trash2,
  FileSpreadsheet,
  ArrowRightLeft,
  BookOpen,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { Chemical, GhsPictogramId } from '../types';
import {
  evaluatePairCompatibility,
  auditStorageBay,
  PRESET_COMPATIBILITY_SCENARIOS,
  MOCK_ADDITIONAL_OILFIELD_CHEMICALS,
  CompatibilityResult,
  getReactivityGroups,
} from '../utils/compatibilityEngine';

export const CompatibilityCheckerView: React.FC = () => {
  const { chemicals, currentUser, companySettings } = useChemicals();

  // Combine standard chemicals with additional oilfield chemicals for high-fidelity evaluation
  const allAvailableChemicals = useMemo(() => {
    const combined = [...chemicals];
    MOCK_ADDITIONAL_OILFIELD_CHEMICALS.forEach((extra) => {
      if (!combined.some((c) => c.casNumber === extra.casNumber || c.productName === extra.productName)) {
        combined.push(extra);
      }
    });
    return combined;
  }, [chemicals]);

  // Tab State: 'pairwise' | 'matrix' | 'bay_audit' | 'guidelines'
  const [activeTab, setActiveTab] = useState<'pairwise' | 'matrix' | 'bay_audit' | 'guidelines'>('pairwise');

  // Pairwise State
  const [chemAId, setChemAId] = useState<string>(allAvailableChemicals[9]?.id || allAvailableChemicals[0]?.id || ''); // e.g. Hydrochloric Acid
  const [chemBId, setChemBId] = useState<string>('chem-naoh-50'); // Default Caustic Soda or another chemical

  // Search filter for dropdowns
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  // Matrix Filter State
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'ACIDS_BASES' | 'FLAMMABLES' | 'OXIDIZERS' | 'INERT'>('ALL');
  const [selectedCellPair, setSelectedCellPair] = useState<CompatibilityResult | null>(null);

  // Storage Bay Auditor State
  const [selectedBay, setSelectedBay] = useState<string>('bay-1');
  const [customBayName, setCustomBayName] = useState('Acid Plant Storage Berm 1');
  const [bayChemicalIds, setBayChemicalIds] = useState<string[]>([
    allAvailableChemicals[9]?.id || 'chem-010', // Hydrochloric Acid
    'chem-naocl-12', // Sodium Hypochlorite (Biocide - Bleach)
    allAvailableChemicals[7]?.id || 'chem-008', // Crude Oil
  ]);

  // Printable Certificate Modal
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Current selected chemicals for Pairwise
  const chemA = useMemo(() => {
    return allAvailableChemicals.find((c) => c.id === chemAId) || allAvailableChemicals[0];
  }, [allAvailableChemicals, chemAId]);

  const chemB = useMemo(() => {
    return allAvailableChemicals.find((c) => c.id === chemBId) || allAvailableChemicals[1] || allAvailableChemicals[0];
  }, [allAvailableChemicals, chemBId]);

  // Evaluation outcome for pairwise
  const pairResult = useMemo(() => {
    if (!chemA || !chemB) return null;
    return evaluatePairCompatibility(chemA, chemB);
  }, [chemA, chemB]);

  // Swap function
  const handleSwap = () => {
    const temp = chemAId;
    setChemAId(chemBId);
    setChemBId(temp);
  };

  // Preset scenario selection
  const handleSelectPreset = (scenarioId: string) => {
    const scenario = PRESET_COMPATIBILITY_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    if (scenario.chemAId) {
      const matchA = allAvailableChemicals.find((c) => c.id === scenario.chemAId);
      if (matchA) setChemAId(matchA.id);
    }

    if (scenario.chemBId) {
      const matchB = allAvailableChemicals.find((c) => c.id === scenario.chemBId);
      if (matchB) setChemBId(matchB.id);
    } else if (scenario.isCustomB) {
      // Find matching extra chemical
      const matchExtra = allAvailableChemicals.find((c) => c.casNumber === scenario.chemBCas);
      if (matchExtra) setChemBId(matchExtra.id);
    }
  };

  // Bay audit calculation
  const bayChemicals = useMemo(() => {
    return allAvailableChemicals.filter((c) => bayChemicalIds.includes(c.id));
  }, [allAvailableChemicals, bayChemicalIds]);

  const bayAuditResult = useMemo(() => {
    const name =
      selectedBay === 'bay-1'
        ? 'Acid Plant & Stimulation Tank Farm'
        : selectedBay === 'bay-2'
        ? 'Cementing Bulk Additives & Blending Shed'
        : selectedBay === 'bay-3'
        ? 'Drilling Mud & Solvent Warehouse'
        : selectedBay === 'bay-4'
        ? 'Hazardous Waste Staging Berm'
        : customBayName;
    return auditStorageBay(name, bayChemicals);
  }, [selectedBay, customBayName, bayChemicals]);

  // Filtered chemicals for Matrix view
  const matrixChemicals = useMemo(() => {
    return allAvailableChemicals.filter((c) => {
      if (matrixFilter === 'ALL') return true;
      const groups = getReactivityGroups(c);
      if (matrixFilter === 'ACIDS_BASES') {
        return (
          groups.includes('STRONG_MINERAL_ACID') ||
          groups.includes('STRONG_OXIDIZING_ACID') ||
          groups.includes('STRONG_BASE_CAUSTIC')
        );
      }
      if (matrixFilter === 'FLAMMABLES') {
        return groups.includes('FLAMMABLE_HYDROCARBON') || groups.includes('ALCOHOL_SOLVENT');
      }
      if (matrixFilter === 'OXIDIZERS') {
        return groups.includes('STRONG_OXIDIZER');
      }
      if (matrixFilter === 'INERT') {
        return groups.includes('INERT_MINERAL') || groups.includes('CRYOGENIC_INERT');
      }
      return true;
    });
  }, [allAvailableChemicals, matrixFilter]);

  // Helper to render GHS pictogram badge
  const renderGhsBadge = (pic: GhsPictogramId) => {
    const labelMap: Record<GhsPictogramId, string> = {
      flame: 'Flammable',
      'flame-over-circle': 'Oxidizer',
      'exploding-bomb': 'Explosive',
      corrosion: 'Corrosive',
      'gas-cylinder': 'Gas Under Pressure',
      'skull-and-crossbones': 'Acute Toxic',
      'exclamation-mark': 'Irritant',
      'health-hazard': 'Health Hazard',
      environment: 'Aquatic Hazard',
    };

    return (
      <span
        key={pic}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        {labelMap[pic] || pic}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ea580c]/10 text-[#ea580c] border border-[#ea580c]/20">
                OILSERV EHS SAFETY SYSTEM
              </span>
              <span className="text-xs text-slate-500 font-mono">OSHA 1910.106 / NFPA 400</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <GitCompare className="w-7 h-7 text-[#ea580c]" />
              Chemical Compatibility Checker
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Verify safe co-storage, segregation distances, and potential exothermic, toxic gas, or deflagration risks
              between oilfield chemicals, well stimulation acids, cementing minerals, and hydrocarbon solvents.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#ea580c]" />
              Print Co-Storage Certificate
            </button>
            <button
              onClick={() => {
                setChemAId(allAvailableChemicals[9]?.id || allAvailableChemicals[0]?.id || '');
                setChemBId('chem-naoh-50');
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Matrix
            </button>
          </div>
        </div>

        {/* 2. Primary Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pt-2">
          <button
            onClick={() => setActiveTab('pairwise')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pairwise'
                ? 'border-[#ea580c] text-[#ea580c] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Pairwise Evaluation (A vs B)
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-[#ea580c] text-[#ea580c] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Interactive N×N Co-Storage Matrix
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
              {allAvailableChemicals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bay_audit')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'bay_audit'
                ? 'border-[#ea580c] text-[#ea580c] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Storage Bay Safety Auditor
            {bayAuditResult.incompatiblePairCount > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold animate-pulse">
                {bayAuditResult.incompatiblePairCount} alert
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guidelines'
                ? 'border-[#ea580c] text-[#ea580c] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            EPA & OSHA Segregation Guidelines
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAIRWISE ANALYSIS (A vs B)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'pairwise' && pairResult && (
        <div className="space-y-6">
          {/* Quick Preset Scenarios */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Standard Oilfield Operational Scenarios (1-Click Test):
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COMPATIBILITY_SCENARIOS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 text-slate-700 hover:text-[#ea580c] transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  title={preset.description}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Product A vs Product B Selector Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* Chemical A Card */}
            <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border-2 border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-black tracking-wider uppercase">
                  Chemical A (Primary Product)
                </span>
                <span className="text-xs font-mono text-slate-500">ID: {chemA?.productCode || chemA?.id}</span>
              </div>

              {/* Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Select Chemical Product
                </label>
                <select
                  value={chemAId}
                  onChange={(e) => setChemAId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                >
                  {allAvailableChemicals.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.productName} ({c.casNumber || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chemical A Metadata */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200/60">
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">Chemical Name:</span>
                  <span className="text-slate-800 font-bold truncate max-w-[200px]">{chemA?.chemicalName}</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">CAS Number:</span>
                  <span className="font-mono font-bold text-slate-800">{chemA?.casNumber || 'Not assigned'}</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">Signal Word:</span>
                  <span
                    className={`font-black text-xs ${
                      chemA?.signalWord === 'DANGER'
                        ? 'text-red-600'
                        : chemA?.signalWord === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {chemA?.signalWord || 'NONE'}
                  </span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">Reactivity Group:</span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {getReactivityGroups(chemA).join(', ')}
                  </span>
                </div>
              </div>

              {/* Pictograms */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1.5">GHS Hazard Pictograms:</div>
                <div className="flex flex-wrap gap-1.5">
                  {chemA?.pictograms && chemA.pictograms.length > 0 ? (
                    chemA.pictograms.map((p) => renderGhsBadge(p))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No GHS pictograms assigned (Non-hazardous)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Central Swap Button */}
            <div className="lg:col-span-1 flex justify-center py-2">
              <button
                onClick={handleSwap}
                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-[#ea580c] text-white shadow-md flex items-center justify-center transition-all cursor-pointer transform hover:scale-110 active:scale-95"
                title="Swap Chemical A and Chemical B"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Chemical B Card */}
            <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border-2 border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-black tracking-wider uppercase">
                  Chemical B (Co-Stored Product)
                </span>
                <span className="text-xs font-mono text-slate-500">ID: {chemB?.productCode || chemB?.id}</span>
              </div>

              {/* Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Select Co-Stored Product
                </label>
                <select
                  value={chemBId}
                  onChange={(e) => setChemBId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                >
                  {allAvailableChemicals.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.productName} ({c.casNumber || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chemical B Metadata */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200/60">
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">Chemical Name:</span>
                  <span className="text-slate-800 font-bold truncate max-w-[200px]">{chemB?.chemicalName}</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">CAS Number:</span>
                  <span className="font-mono font-bold text-slate-800">{chemB?.casNumber || 'Not assigned'}</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">Signal Word:</span>
                  <span
                    className={`font-black text-xs ${
                      chemB?.signalWord === 'DANGER'
                        ? 'text-red-600'
                        : chemB?.signalWord === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {chemB?.signalWord || 'NONE'}
                  </span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-slate-500 font-medium">Reactivity Group:</span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {getReactivityGroups(chemB).join(', ')}
                  </span>
                </div>
              </div>

              {/* Pictograms */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1.5">GHS Hazard Pictograms:</div>
                <div className="flex flex-wrap gap-1.5">
                  {chemB?.pictograms && chemB.pictograms.length > 0 ? (
                    chemB.pictograms.map((p) => renderGhsBadge(p))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No GHS pictograms assigned (Non-hazardous)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PAIRWISE ASSESSMENT RESULT BANNER & METRICS                               */}
          {/* ========================================================================= */}
          <div
            className={`rounded-xl shadow-md border-2 p-6 transition-all ${
              pairResult.status === 'INCOMPATIBLE'
                ? 'bg-red-50/70 border-red-500 text-red-950'
                : pairResult.status === 'CONDITIONAL'
                ? 'bg-amber-50/70 border-amber-500 text-amber-950'
                : pairResult.status === 'SAME_PRODUCT'
                ? 'bg-slate-50 border-slate-300 text-slate-900'
                : 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
            }`}
          >
            {/* Top Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-5 border-current/15">
              <div className="flex items-center gap-3">
                {pairResult.status === 'INCOMPATIBLE' ? (
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md animate-bounce">
                    <AlertOctagon className="w-7 h-7" />
                  </div>
                ) : pairResult.status === 'CONDITIONAL' ? (
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        pairResult.status === 'INCOMPATIBLE'
                          ? 'bg-red-600 text-white'
                          : pairResult.status === 'CONDITIONAL'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {pairResult.status === 'INCOMPATIBLE'
                        ? 'CRITICAL INCOMPATIBILITY — DO NOT CO-STORE'
                        : pairResult.status === 'CONDITIONAL'
                        ? 'CONDITIONAL CO-STORAGE — SEGREGATION REQUIRED'
                        : pairResult.status === 'SAME_PRODUCT'
                        ? 'IDENTICAL CHEMICAL PRODUCT'
                        : 'CHEMICALLY COMPATIBLE — SAFE CO-STORAGE'}
                    </span>
                    <span className="text-xs font-bold opacity-75">
                      Severity: {pairResult.severity}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-1 leading-snug">
                    {pairResult.headline}
                  </h2>
                </div>
              </div>

              {/* Safety Score Dial */}
              <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-current/20 flex items-center gap-3 self-start md:self-auto shadow-xs">
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-slate-500">Compatibility Index</div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {pairResult.score} / 100
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white ${
                    pairResult.score >= 80
                      ? 'bg-emerald-600'
                      : pairResult.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                >
                  {pairResult.score}%
                </div>
              </div>
            </div>

            {/* Reaction Chemistry Mechanisms */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-5">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#ea580c]" />
                Reaction Chemistry & Physical Consequence Analysis:
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {pairResult.chemicalMechanisms}
              </p>
            </div>

            {/* Consequence Hazard Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
              <div
                className={`p-3 rounded-lg border text-xs font-bold flex flex-col justify-between ${
                  pairResult.reactions.heatGeneration
                    ? 'bg-red-100 border-red-300 text-red-900'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-4 h-4 flex-shrink-0" />
                  <span>Exotherm (Heat)</span>
                </div>
                <span className="text-[10px] font-normal">
                  {pairResult.reactions.heatGeneration ? 'Violent Boiling' : 'Negligible ΔH'}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-bold flex flex-col justify-between ${
                  pairResult.reactions.toxicGas
                    ? 'bg-red-100 border-red-300 text-red-900'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Skull className="w-4 h-4 flex-shrink-0" />
                  <span>Toxic Gas</span>
                </div>
                <span className="text-[10px] font-normal">
                  {pairResult.reactions.toxicGas
                    ? pairResult.reactions.toxicGases?.[0] || 'Lethal Gas'
                    : 'No Toxic Fumes'}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-bold flex flex-col justify-between ${
                  pairResult.reactions.fireRisk
                    ? 'bg-red-100 border-red-300 text-red-900'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 flex-shrink-0" />
                  <span>Fire / Deflagration</span>
                </div>
                <span className="text-[10px] font-normal">
                  {pairResult.reactions.fireRisk ? 'High Ignition Risk' : 'Non-flammable Pair'}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-bold flex flex-col justify-between ${
                  pairResult.reactions.flammableGas
                    ? 'bg-red-100 border-red-300 text-red-900'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Droplets className="w-4 h-4 flex-shrink-0" />
                  <span>Flammable Gas</span>
                </div>
                <span className="text-[10px] font-normal">
                  {pairResult.reactions.flammableGas
                    ? pairResult.reactions.flammableGases?.[0] || 'Emits H2'
                    : 'No Flammable Gas'}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-bold flex flex-col justify-between ${
                  pairResult.reactions.corrosionOfContainer
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Container Attack</span>
                </div>
                <span className="text-[10px] font-normal">
                  {pairResult.reactions.corrosionOfContainer ? 'Dissolves Drums' : 'Containers Stable'}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-bold flex flex-col justify-between ${
                  pairResult.reactions.splatteringOrPolymerization
                    ? 'bg-red-100 border-red-300 text-red-900'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                  <span>Splattering Surge</span>
                </div>
                <span className="text-[10px] font-normal">
                  {pairResult.reactions.splatteringOrPolymerization ? 'Acid Ejection' : 'No Overpressure'}
                </span>
              </div>
            </div>

            {/* Regulatory Separation Directives Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Storage Separation Rules */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#ea580c]" />
                  OSHA & NFPA Mandatory Storage Separation:
                </h4>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-bold text-slate-700">Minimum Separation Distance:</span>
                    <p className="text-slate-900 font-semibold mt-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                      {pairResult.regulatoryRequirements.minimumSeparationDistance}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Secondary Containment Mandate:</span>
                    <p className="text-slate-900 font-semibold mt-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                      {pairResult.regulatoryRequirements.containmentRule}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {pairResult.regulatoryRequirements.oshaCitation}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {pairResult.regulatoryRequirements.nfpaCitation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Emergency Response Directive */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2 border-slate-100">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  Spill Co-Mingling & Emergency Protocol:
                </h4>

                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-600">DOT ERG Guide Number:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {pairResult.emergencyProtocol.ergGuideNumber}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Immediate Spill Action:</span>
                    <p className="text-slate-900 font-medium mt-0.5">{pairResult.emergencyProtocol.firstAction}</p>
                  </div>
                  {pairResult.emergencyProtocol.fireExtinguisherProhibition && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-800 font-bold text-xs">
                      ⚠️ {pairResult.emergencyProtocol.fireExtinguisherProhibition}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-bold">Downwind Evacuation Perimeter:</span>
                    <span className="font-bold text-red-600 font-mono">
                      {pairResult.emergencyProtocol.isolationDistance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended PPE Strip */}
            <div className="mt-4 bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#ea580c] flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mandatory PPE for Simultaneous Transfer or Sampling:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pairResult.handlingPpe.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-100 border border-slate-700"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE N×N MATRIX                                             */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Filter Inventory:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'All Chemicals' },
                  { id: 'ACIDS_BASES', label: 'Acids & Caustics' },
                  { id: 'FLAMMABLES', label: 'Flammables & Solvents' },
                  { id: 'OXIDIZERS', label: 'Strong Oxidizers' },
                  { id: 'INERT', label: 'Inerts & Minerals' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMatrixFilter(f.id as any)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      matrixFilter === f.id
                        ? 'bg-[#ea580c] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-red-600 text-white flex items-center justify-center text-[10px]">
                  ✗
                </span>
                Incompatible
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  ▲
                </span>
                Conditional
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
                Compatible
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <div className="min-w-[800px] p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-slate-200 bg-slate-100 text-left text-[11px] font-black text-slate-700 uppercase w-48">
                      Product Name
                    </th>
                    {matrixChemicals.map((colChem) => (
                      <th
                        key={colChem.id}
                        className="p-2 border border-slate-200 bg-slate-50 text-center text-[10px] font-bold text-slate-700 w-24 max-w-[100px] truncate"
                        title={colChem.productName}
                      >
                        <div className="truncate">{colChem.productName}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixChemicals.map((rowChem) => (
                    <tr key={rowChem.id} className="hover:bg-slate-50/50">
                      <td className="p-2 border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 truncate max-w-[180px]">
                        {rowChem.productName}
                      </td>
                      {matrixChemicals.map((colChem) => {
                        const cellRes = evaluatePairCompatibility(rowChem, colChem);
                        const isSelf = rowChem.id === colChem.id;

                        let cellClass = 'bg-slate-100 text-slate-400';
                        let symbol = '—';

                        if (!isSelf) {
                          if (cellRes.status === 'INCOMPATIBLE') {
                            cellClass = 'bg-red-500 hover:bg-red-600 text-white cursor-pointer';
                            symbol = '✗';
                          } else if (cellRes.status === 'CONDITIONAL') {
                            cellClass = 'bg-amber-400 hover:bg-amber-500 text-white cursor-pointer';
                            symbol = '▲';
                          } else {
                            cellClass = 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer';
                            symbol = '✓';
                          }
                        }

                        return (
                          <td
                            key={colChem.id}
                            onClick={() => {
                              if (!isSelf) {
                                setSelectedCellPair(cellRes);
                              }
                            }}
                            className={`p-2 border border-slate-200 text-center font-black text-xs transition-colors ${cellClass}`}
                            title={
                              isSelf
                                ? 'Self'
                                : `${rowChem.productName} + ${colChem.productName}: ${cellRes.status}`
                            }
                          >
                            {symbol}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Drawer / Modal if cell is clicked */}
          {selectedCellPair && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#ea580c] uppercase">Selected Co-Storage Pair:</div>
                <div className="text-lg font-black">
                  {selectedCellPair.chemA.productName} <span className="text-[#ea580c]">+</span>{' '}
                  {selectedCellPair.chemB.productName}
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">{selectedCellPair.headline}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setChemAId(selectedCellPair.chemA.id);
                    setChemBId(selectedCellPair.chemB.id);
                    setActiveTab('pairwise');
                    setSelectedCellPair(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#f25100] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Inspect in Pairwise Analyzer
                </button>
                <button
                  onClick={() => setSelectedCellPair(null)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STORAGE BAY SAFETY AUDITOR                                         */}
      {/* ========================================================================= */}
      {activeTab === 'bay_audit' && (
        <div className="space-y-6">
          {/* Bay Selector & Setup */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#ea580c]" />
                  Storage Bay & Yard Co-Storage Auditor
                </h3>
                <p className="text-xs text-slate-500">
                  Select a storage facility zone, berm, or skid, and audit all co-located chemicals against mutual
                  incompatibilities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBay}
                  onChange={(e) => setSelectedBay(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                >
                  <option value="bay-1">Bay 1: Acid Plant & Stimulation Farm</option>
                  <option value="bay-2">Bay 2: Cementing Bulk Additives Shed</option>
                  <option value="bay-3">Bay 3: Drilling Mud & Solvent Warehouse</option>
                  <option value="bay-4">Bay 4: Hazardous Waste Staging Berm</option>
                  <option value="custom">Custom Specified Bay...</option>
                </select>
              </div>
            </div>

            {selectedBay === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Custom Storage Bay Name:
                </label>
                <input
                  type="text"
                  value={customBayName}
                  onChange={(e) => setCustomBayName(e.target.value)}
                  className="w-full sm:w-80 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800"
                  placeholder="e.g. Wellhead Skid Area 4"
                />
              </div>
            )}

            {/* Checkbox selector for Chemicals in this Bay */}
            <div>
              <div className="text-xs font-bold text-slate-600 uppercase mb-2">
                Chemicals Currently Stored in this Zone ({bayChemicalIds.length} Selected):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allAvailableChemicals.map((chem) => {
                  const isChecked = bayChemicalIds.includes(chem.id);
                  return (
                    <label
                      key={chem.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-orange-50/70 border-orange-300 text-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBayChemicalIds([...bayChemicalIds, chem.id]);
                          } else {
                            setBayChemicalIds(bayChemicalIds.filter((id) => id !== chem.id));
                          }
                        }}
                        className="mt-0.5 rounded text-[#ea580c] focus:ring-[#ea580c]"
                      />
                      <div className="overflow-hidden">
                        <div className="truncate font-bold">{chem.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{chem.casNumber || 'No CAS'}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audit Score & Report Card */}
          <div
            className={`rounded-xl shadow-md border-2 p-6 ${
              bayAuditResult.overallRating === 'CRITICAL_RISK'
                ? 'bg-red-50/80 border-red-500 text-red-950'
                : bayAuditResult.overallRating === 'HIGH_RISK'
                ? 'bg-amber-50/80 border-amber-500 text-amber-950'
                : bayAuditResult.overallRating === 'CAUTION_REQUIRED'
                ? 'bg-yellow-50/80 border-yellow-500 text-yellow-950'
                : 'bg-emerald-50/80 border-emerald-500 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-current/15 mb-4">
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    bayAuditResult.overallRating === 'CRITICAL_RISK'
                      ? 'bg-red-600 text-white'
                      : bayAuditResult.overallRating === 'HIGH_RISK'
                      ? 'bg-amber-600 text-white'
                      : bayAuditResult.overallRating === 'CAUTION_REQUIRED'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {bayAuditResult.overallRating === 'CRITICAL_RISK'
                    ? 'CRITICAL DEFICIENCY — PROHIBITED CO-STORAGE'
                    : bayAuditResult.overallRating === 'HIGH_RISK'
                    ? 'HIGH RISK ZONE — RELOCATION REQUIRED'
                    : bayAuditResult.overallRating === 'CAUTION_REQUIRED'
                    ? 'CONDITIONAL STORAGE'
                    : 'SAFE CO-STORAGE COMPLIANT'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1.5">{bayAuditResult.bayName}</h3>
                <p className="text-xs font-medium opacity-80">
                  Evaluated {bayAuditResult.totalPairCount} chemical pairwise interaction(s) across{' '}
                  {bayChemicals.length} co-located products.
                </p>
              </div>

              {/* Bay Score Gauge */}
              <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-current/20 flex items-center gap-3 shadow-xs">
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-slate-500">Bay Safety Score</div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {bayAuditResult.complianceScore}%
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white ${
                    bayAuditResult.complianceScore >= 80
                      ? 'bg-emerald-600'
                      : bayAuditResult.complianceScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                >
                  {bayAuditResult.complianceScore}
                </div>
              </div>
            </div>

            {/* Incompatible Violations List */}
            {bayAuditResult.violations.length > 0 ? (
              <div className="space-y-3 mb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  Identified Hazardous Incompatibilities in this Zone:
                </h4>
                <div className="space-y-2">
                  {bayAuditResult.violations.map((v, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-3.5 border border-red-200 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-red-700">
                          {v.chemA.productName} ⚠️ {v.chemB.productName}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{v.headline}</p>
                      <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        {v.directive}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-emerald-200 mb-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Zero Critical Incompatibilities Detected</div>
                  <div className="text-xs text-slate-600">
                    All chemicals assigned to this bay are chemically compatible or satisfy standard separation rules.
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-600 uppercase mb-2">
                HSE Facility Lead Corrective Action Plan:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {bayAuditResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#ea580c] flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GHS & REGULATORY REFERENCE GUIDE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#ea580c]" />
              Chemical Incompatibility Matrix & Regulatory Authority Guide
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard operating procedures for chemical storage in oilfield cementing, stimulation, and well servicing
              are derived from internationally harmonized bodies and statutory authorities:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  OSHA 29 CFR 1910.106 & 1910.1200
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Requires flammable and combustible liquids to be segregated from incompatible chemicals (especially
                  strong oxidizers and mineral acids) by either a minimum of 20 feet (6.1 m) of open space or a 1-hour
                  liquid-tight fire wall.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  NFPA 400 (Hazardous Materials Code)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Section 6.2.1 mandates strict physical segregation of incompatible materials to prevent unintentional
                  contact. Secondary containment berms must have independent drainage sumps and 110% net volume
                  capacity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  EPA Chemical Reactivity Matrix (EPA-600/2-80-076)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Categorizes hazardous substances into 34 reactive chemical families to predict hazardous binaries:
                  heat generation (H), fire (F), toxic gas release (G), and violent polymerizations (P).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  NOAA Chemical Reactivity Worksheet (CRW4)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Algorithmic pairwise reactivity engine modeling hazardous gas liberation, flash boiling surges, and
                  vessel overpressurization for emergency first responders.
                </p>
              </div>
            </div>

            {/* Quick Segregation Matrix Table */}
            <div className="pt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Universal Segregation Rules Chart
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Chemical Category</th>
                      <th className="p-2.5">Must NEVER Be Stored With</th>
                      <th className="p-2.5">Consequence</th>
                      <th className="p-2.5">Required Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="p-2.5 font-bold">Strong Mineral Acids (HCl, H2SO4)</td>
                      <td className="p-2.5 text-red-600 font-semibold">Caustics (NaOH, KOH) & Hypochlorites (Bleach)</td>
                      <td className="p-2.5">Violent exotherm, boiling splattering, lethal Chlorine gas (Cl2)</td>
                      <td className="p-2.5">Minimum 20 ft (6.1m) separation or separate fire area</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Strong Oxidizers (Persulfates, Peroxides)</td>
                      <td className="p-2.5 text-red-600 font-semibold">Flammable Liquids (Crude Oil, Diesel, Methanol)</td>
                      <td className="p-2.5">Catastrophic spontaneous combustion, vapor explosion</td>
                      <td className="p-2.5">2-hour fire wall or dedicated Class 1 Div 1 oxidizer cabinet</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Water-Reactive Solids</td>
                      <td className="p-2.5 text-red-600 font-semibold">Aqueous solutions, water sprinklers, acids</td>
                      <td className="p-2.5">Flammable Hydrogen gas evolution, autoignition</td>
                      <td className="p-2.5">Dry, sprinkler-free storage; Class D powder only</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">Cyanides & Sulfides</td>
                      <td className="p-2.5 text-red-600 font-semibold">Any acid or acidic salts</td>
                      <td className="p-2.5">Instant release of deadly Hydrogen Cyanide (HCN) or H2S gas</td>
                      <td className="p-2.5">Dedicated toxic gas scrubbers and continuous monitoring</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMAL PRINTABLE CERTIFICATE MODAL                                        */}
      {/* ========================================================================= */}
      {showCertificateModal && pairResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-300 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src="/oilserv-logo.png"
                  alt="OILSERV"
                  className="h-9 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="font-black text-slate-900 text-lg">OILSERV Energy Ltd</div>
                  <div className="text-xs text-slate-500 font-mono">
                    HSE CHEMICAL SAFETY & STORAGE COMPATIBILITY RECORD
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-500">Evaluation Date:</span>
                  <div className="font-mono font-bold text-slate-900">{new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500">HSE Technical Officer:</span>
                  <div className="font-bold text-slate-900">{currentUser.name} ({currentUser.roleTitle})</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Facility Location:</span>
                  <div className="font-bold text-slate-900">{companySettings.facilityName}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500">Permit / Certificate Ref:</span>
                  <div className="font-mono font-bold text-[#ea580c]">OS-COMPAT-{Math.floor(100000 + Math.random() * 900000)}</div>
                </div>
              </div>

              {/* Chemical Pair */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  Assessed Chemical Binary Pair:
                </div>
                <div className="grid grid-cols-2 gap-4 font-bold text-sm">
                  <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-950">
                    Product A: {pairResult.chemA.productName}
                    <div className="text-xs font-mono font-normal text-slate-600">CAS: {pairResult.chemA.casNumber || 'N/A'}</div>
                  </div>
                  <div className="p-2.5 rounded bg-purple-50 border border-purple-200 text-purple-950">
                    Product B: {pairResult.chemB.productName}
                    <div className="text-xs font-mono font-normal text-slate-600">CAS: {pairResult.chemB.casNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm uppercase">Formal Determination:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      pairResult.status === 'INCOMPATIBLE'
                        ? 'bg-red-600 text-white'
                        : pairResult.status === 'CONDITIONAL'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {pairResult.status}
                  </span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{pairResult.chemicalMechanisms}</p>
                <div className="text-slate-600 font-semibold pt-1">
                  Required Segregation: {pairResult.regulatoryRequirements.minimumSeparationDistance}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assessed & Verified By</div>
                  <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.department}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">EHS Operations Director Sign-Off</div>
                  <div className="border-b border-slate-400 pb-1 font-bold text-slate-900">Dr. Sarah Vance, CSP</div>
                  <div className="text-[10px] text-slate-500">Corporate HSE Division</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#f25100] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
