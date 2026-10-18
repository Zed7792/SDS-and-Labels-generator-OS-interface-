import React, { useState } from 'react';
import {
  Home,
  PlusCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  GitCompare,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, chemicals, sdsRecords } = useChemicals();
  const [collapsed, setCollapsed] = useState(false);

  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'sds_library',
      label: 'SDS Library',
      icon: FileText,
      badge: sdsRecords?.length || chemicals.length,
    },
    {
      id: 'compatibility_checker',
      label: 'Compatibility Checker',
      icon: GitCompare,
      badge: 'GHS',
    },
    {
      id: 'create_hub',
      label: 'Create New',
      icon: PlusCircle,
    },
    {
      id: 'library',
      label: 'Labels Library',
      icon: Eye,
      badge: chemicals.length,
    },
  ];

  return (
    <aside
      className={`bg-[#374756] text-white flex flex-col transition-all duration-200 select-none flex-shrink-0 z-30 shadow-md ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* 1. Header with OILSERV CSMS and Collapse toggle */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-600/40">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-black text-lg tracking-wider text-white whitespace-nowrap">
              OILSERV CSMS
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors ml-auto cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Primary Navigation: Home, Create New Label, Labels Library */}
      <div className="p-3 flex-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-1.5">
          {mainNavItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-slate-600/40'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-300'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-200 text-slate-800' : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Badge / Facility Indicator */}
        {!collapsed && (
          <div className="pt-4 border-t border-slate-600/30 mt-4">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50 text-[11px] text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="font-bold text-white leading-tight truncate">OILSERV Energy Ltd</div>
                <div className="text-[10px] text-slate-400 truncate">Port Harcourt Operations</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
