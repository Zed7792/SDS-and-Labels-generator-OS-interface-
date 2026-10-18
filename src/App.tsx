import React from 'react';
import { ChemicalProvider, useChemicals } from './context/ChemicalContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { ChemicalLibraryView } from './components/ChemicalLibraryView';
import { ChemicalDetailsView } from './components/ChemicalDetailsView';
import { AddChemicalView } from './components/AddChemicalView';
import { WorkflowSubmissionView } from './components/WorkflowSubmissionView';
import { CreateHubView } from './components/CreateHubView';
import { CreateMixtureView } from './components/CreateMixtureView';
import { AddProductBasicView } from './components/AddProductBasicView';
import { CreateSdsView } from './components/CreateSdsView';
import { SdsLibraryView } from './components/SdsLibraryView';
import { CompatibilityCheckerView } from './components/CompatibilityCheckerView';

const MainContent: React.FC = () => {
  const { currentView } = useChemicals();

  switch (currentView) {
    case 'compatibility_checker':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <CompatibilityCheckerView />
        </div>
      );
    case 'sds_library':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <SdsLibraryView />
        </div>
      );
    case 'create_sds':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <CreateSdsView />
        </div>
      );
    case 'add_product_basic':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <AddProductBasicView />
        </div>
      );
    case 'create_hub':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <CreateHubView />
        </div>
      );
    case 'create_mixture':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <CreateMixtureView />
        </div>
      );
    case 'workflow_submission':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <WorkflowSubmissionView />
        </div>
      );
    case 'add_chemical':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <AddChemicalView />
        </div>
      );
    case 'library':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <ChemicalLibraryView />
        </div>
      );
    case 'details':
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <ChemicalDetailsView />
        </div>
      );
    case 'dashboard':
    default:
      return (
        <div className="p-5 sm:p-7 max-w-[1440px] mx-auto w-full">
          <DashboardView />
        </div>
      );
  }
};

export default function App() {
  return (
    <ChemicalProvider>
      <div className="min-h-screen bg-[#f4f6f8] flex text-slate-900 font-sans antialiased">
        {/* Left Dark Steel Sidebar (Matching Image 1) */}
        <Sidebar />

        {/* Right Main Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
          {/* Top Breadcrumb & Sub-Header Bar (Matching Image 1 & 2) */}
          <TopNav />

          {/* Dynamic Content Area */}
          <main className="flex-1">
            <MainContent />
          </main>
        </div>
      </div>
    </ChemicalProvider>
  );
}
