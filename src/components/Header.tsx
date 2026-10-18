import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  FlaskConical,
  PlusCircle,
  Tag,
  FileText,
  Building2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    chemicals,
    companySettings,
    sdsRecords,
  } = useChemicals();

  const requiringReview = chemicals.filter((c) => c.status === 'requires_review').length;
  const missingSds = chemicals.filter((c) => !c.sdsRevisionDate && !c.sdsId).length;

  interface NavItem {
    id: any;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Chemical Library', icon: FlaskConical, badge: chemicals.length },
    { id: 'add_chemical', label: 'Add Chemical / SDS', icon: PlusCircle },
    { id: 'label_studio', label: 'Label Studio', icon: Tag },
    { id: 'sds_library', label: 'SDS Library', icon: FileText, badge: sdsRecords.length },
    { id: 'settings', label: 'Company Settings', icon: Building2 },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      {/* Top utility strip for industrial facility and compliance banner */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="tracking-wide uppercase text-[11px] font-bold">OSHA HazCom 2012 / UN GHS Rev 10 Certified</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden md:inline text-slate-300">
            Facility: <strong className="text-white font-semibold">{companySettings.facilityName}</strong> ({companySettings.facilityId})
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          {requiringReview > 0 && (
            <button
              onClick={() => setCurrentView('library')}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>{requiringReview} chemical{requiringReview > 1 ? 's' : ''} require review</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-emerald-400">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Safety Engine: Online</span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between py-2.5 gap-2.5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-inner shadow-amber-300/40 group-hover:bg-amber-400 transition-colors">
              <FlaskConical className="w-5 h-5 text-slate-950 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Chemical Label Studio
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                  HSE ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Industrial Chemical Management & Safety Label Builder
              </p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-slate-900 text-amber-400'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
