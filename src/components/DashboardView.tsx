import React from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Clock,
  ArrowRight,
  PlusCircle,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  ChevronRight,
  GitCompare,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogram } from './GhsPictogram';

export const DashboardView: React.FC = () => {
  const {
    chemicals,
    setSelectedChemicalId,
    setCurrentView,
  } = useChemicals();

  // Metrics
  const totalChemicals = chemicals.length;
  const approvedChemicals = chemicals.filter((c) => c.status === 'approved').length;
  const requiringReview = chemicals.filter((c) => c.status === 'requires_review').length;
  const complianceRate = totalChemicals > 0 ? Math.round((approvedChemicals / totalChemicals) * 100) : 100;

  // Recently added chemicals (last 5)
  const recentlyAdded = [...chemicals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleSelectAndNavigate = (id: string, view: 'details' | 'add_chemical') => {
    setSelectedChemicalId(id);
    setCurrentView(view);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            <span>Industrial Hazard Communications & HazCom Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Operational Chemical Inventory & Label Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Centralized chemical classification, GHS/NFPA/HMIS compliance validation, and high-durability safety label generation for industrial facilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-quick-add-chem"
            onClick={() => setCurrentView('create_hub')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New</span>
          </button>
          <button
            id="btn-quick-view-library"
            onClick={() => setCurrentView('library')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Labels Library</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards (Phase 1 Focused) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Labels */}
        <div
          onClick={() => setCurrentView('library')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Labels</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalChemicals}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>In active inventory</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Approved Labels */}
        <div
          onClick={() => setCurrentView('library')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Labels</span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">{approvedChemicals}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {complianceRate}% compliance verified
          </div>
        </div>

        {/* Requiring Review */}
        <div
          onClick={() => setCurrentView('library')}
          className={`bg-white border rounded-lg p-4 shadow-xs transition-all cursor-pointer group ${
            requiringReview > 0 ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Requiring Review</span>
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${requiringReview > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
            {requiringReview}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">
            Pending HSE safety signoff
          </div>
        </div>

        {/* GHS HazCom Ready */}
        <div
          onClick={() => setCurrentView('library')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">HazCom Readiness</span>
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 tracking-tight">{complianceRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            OSHA 1910.1200 standard
          </div>
        </div>
      </div>

      {/* Main Grid: Recently Added Chemicals & Industrial Hazard Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added Chemicals Table / List (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recently Added & Active Chemical Labels
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('library')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Full Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentlyAdded.map((chem) => (
              <div
                key={chem.id}
                className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                      onClick={() => handleSelectAndNavigate(chem.id, 'details')}
                    >
                      {chem.productName}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                      {chem.productCode}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{chem.manufacturer}</span>
                    <span>•</span>
                    <span className="font-mono">CAS: {chem.casNumber}</span>
                    <span>•</span>
                    <span>State: {chem.physicalState}</span>
                  </div>

                  {/* Hazard mini badges */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* Signal word badge */}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        chem.signalWord === 'DANGER'
                          ? 'bg-red-600 text-white'
                          : chem.signalWord === 'WARNING'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {chem.signalWord}
                    </span>

                    {/* Pictograms */}
                    <div className="flex items-center gap-1">
                      {(chem.pictograms || []).slice(0, 6).map((p) => (
                        <GhsPictogram key={p} id={p} size={22} />
                      ))}
                    </div>

                    {/* Status badge */}
                    <span
                      className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        chem.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : chem.status === 'requires_review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {chem.status === 'approved' ? 'Approved' : 'Requires Review'}
                    </span>
                  </div>
                </div>

                {/* Quick actions for chemical */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleSelectAndNavigate(chem.id, 'details')}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleSelectAndNavigate(chem.id, 'add_chemical')}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Label</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Facility Compliance & Quick Label Creator */}
        <div className="space-y-4">
          {/* Compliance Readiness Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>HSE Regulatory Status</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">GHS Label Readiness</span>
                  <span className="text-slate-900">{approvedChemicals}/{totalChemicals} Labels</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${complianceRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Approved for Use</span>
                  <span className="text-slate-900">{approvedChemicals} of {totalChemicals}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${complianceRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-0.5">Mandatory OSHA 1910.1200 Notice:</p>
              <p className="text-[11px] leading-relaxed">
                All secondary containers, bulk drums, and transfer vessels must be marked with verified GHS labels before shift dispatch.
              </p>
            </div>
          </div>

          {/* Quick Label Creator Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
              <Tag className="w-4 h-4 text-slate-600" />
              <span>Quick Label Generator</span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Create, customize, and print standardized GHS & NFPA secondary container labels formatted for industrial drums, carboys, and bottles.
            </p>
            <button
              onClick={() => setCurrentView('add_chemical')}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Label</span>
            </button>
          </div>

          {/* Compatibility Checker Quick Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-5 shadow-xs border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <GitCompare className="w-4 h-4 text-[#ea580c]" />
                <span>Compatibility Checker</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#ea580c] text-white">
                GHS / EPA
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Verify safe co-storage distances and avoid dangerous exotherm, toxic gas, or deflagration risks across oilfield chemicals.
            </p>
            <button
              onClick={() => setCurrentView('compatibility_checker')}
              className="w-full py-2 px-3 bg-[#ea580c] hover:bg-[#f25100] text-white font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Launch Matrix & Checker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
