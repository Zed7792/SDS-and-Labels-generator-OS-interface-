import React from 'react';
import { ArrowLeft, Home, AlertTriangle, Save, Plus, Send, FlaskConical, FileText, GitCompare } from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { RoleSwitcherBar } from './RoleSwitcherBar';

interface TopNavProps {
  onSave?: () => void;
  isSaving?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ onSave, isSaving }) => {
  const { currentView, setCurrentView, currentUser, setCurrentUser } = useChemicals();

  const getViewTitle = () => {
    switch (currentView) {
      case 'compatibility_checker':
        return 'Chemical Compatibility Checker — Safe Storage & Segregation Matrix';
      case 'workflow_submission':
        return 'Label Submission & Approval Workflow';
      case 'sds_library':
        return 'SDS Library — Centralized Chemical Safety Management';
      case 'library':
        return 'Labels Library';
      case 'create_hub':
        return 'Add New Product';
      case 'add_product_basic':
        return 'Add New Product - Basic Information';
      case 'create_sds':
        return 'Create SDS Sheet';
      case 'create_mixture':
        return 'Create New Mixture';
      case 'add_chemical':
        return 'Create New GHS Label';
      case 'details':
        return 'Chemical Details & Safety Specifications';
      case 'dashboard':
      default:
        return 'Chemical Safety Management System';
    }
  };

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'compatibility_checker':
        return 'Compatibility Checker';
      case 'workflow_submission':
        return 'Approval Workflow';
      case 'sds_library':
        return 'SDS Library';
      case 'library':
        return 'Labels Library';
      case 'create_hub':
        return 'Add New Product';
      case 'add_product_basic':
        return 'Add New Product - Basic Information';
      case 'create_sds':
        return 'Create SDS Sheet';
      case 'create_mixture':
        return 'Create New Mixture';
      case 'add_chemical':
        return 'Create New Label';
      case 'details':
        return 'Chemical Details';
      case 'dashboard':
      default:
        return 'Home';
    }
  };

  const handleBack = () => {
    if (currentView === 'workflow_submission') {
      setCurrentView('library');
    } else if (
      currentView === 'create_mixture' ||
      currentView === 'add_product_basic' ||
      currentView === 'create_sds'
    ) {
      setCurrentView('create_hub');
    } else if (currentView === 'add_chemical') {
      setCurrentView('create_hub');
    } else if (currentView === 'create_hub') {
      setCurrentView('dashboard');
    } else if (currentView === 'details') {
      setCurrentView('library');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleTopNavSubmit = () => {
    if (onSave) {
      onSave();
    } else {
      const btn = document.getElementById('btn-submit-chemical-label');
      if (btn) (btn as HTMLButtonElement).click();
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 select-none">
      {/* 1. Thin Breadcrumb Bar */}
      <div className="px-6 py-1.5 flex items-center gap-2.5 text-xs text-slate-500 border-b border-slate-100">
        <button
          onClick={handleBack}
          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>

        <span className="text-slate-300">/</span>

        <span className="font-medium text-slate-700">{getBreadcrumbTitle()}</span>
      </div>

      {/* 2. Main Title Banner with Red Warning Triangle and Actions */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Badge Icon depending on currentView */}
          {currentView === 'compatibility_checker' ? (
            <div className="w-7 h-7 rounded-md bg-[#ea580c] flex items-center justify-center text-white shadow-xs">
              <GitCompare className="w-4 h-4" />
            </div>
          ) : currentView === 'sds_library' ? (
            <div className="w-7 h-7 rounded-md bg-[#ea580c] flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
          ) : currentView === 'create_sds' ? (
            <div className="w-7 h-7 rounded-md bg-[#2563eb] flex items-center justify-center text-white shadow-xs">
              <Send className="w-4 h-4" />
            </div>
          ) : currentView === 'add_product_basic' ? (
            <div className="w-6 h-6 rounded bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              1
            </div>
          ) : currentView === 'create_mixture' ? (
            <div className="w-7 h-7 rounded-md bg-[#8b5cf6] flex items-center justify-center text-white shadow-xs">
              <FlaskConical className="w-4 h-4" />
            </div>
          ) : currentView === 'create_hub' ? null : (
            <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-xs">
              <AlertTriangle className="w-4 h-4 fill-amber-500 text-transparent" />
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {getViewTitle()}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Phase 2: Role Switcher Bar */}
          <RoleSwitcherBar currentUser={currentUser} onSelectUser={setCurrentUser} />

          {currentView === 'library' && (
            <button
              onClick={() => setCurrentView('create_hub')}
              className="bg-[#f25100] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
