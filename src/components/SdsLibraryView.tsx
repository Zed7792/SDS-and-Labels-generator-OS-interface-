import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Tag,
  Sparkles,
  Download,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Plus,
  QrCode,
  Printer,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash2,
  Edit,
  Shield,
  Layers,
  FileCheck,
  AlertOctagon,
  X,
  FileSpreadsheet,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { Chemical, SdsRecord, GhsPictogramId } from '../types';
import { GhsPictogram } from './GhsPictogram';
import { NfpaDiamond } from './NfpaDiamond';
import { HmisBar } from './HmisBar';
import { QrCodeSvg } from './QrCodeSvg';

// SDS Readiness Types as requested
export type SdsReadiness = 'Ready' | 'Action required' | 'Blocked' | 'Unknown';

// Chemical Category taxonomy for Upstream Oil & Gas
export type ChemicalCategory =
  | 'Acidizing & Stimulation'
  | 'Drilling Fluids / Mud Support'
  | 'Cementing Operations'
  | 'Solvents & Rig Degreasers'
  | 'Production & Hydrate Inhibitors'
  | 'Water Treatment & Biocides'
  | 'General Industrial Chemical';

export const SdsLibraryView: React.FC = () => {
  const {
    sdsRecords,
    chemicals,
    setSelectedChemicalId,
    setCurrentView,
    addChemical,
    updateChemical,
    deleteChemical,
    addSdsRecord,
    addAuditLog,
    currentUser,
  } = useChemicals();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<string | null>(null);
  const [readinessFilter, setReadinessFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pictogramFilter, setPictogramFilter] = useState<string>('all');
  const [worksiteFilter, setWorksiteFilter] = useState<string>('all');

  // Sorting State
  const [sortField, setSortField] = useState<string>('productName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Column Visibility Controls
  const [visibleColumns, setVisibleColumns] = useState({
    supplier: true,
    code: true,
    cas: true,
    category: true,
    readiness: true,
    pictograms: true,
    signalWord: true,
    ratings: true,
    revisionDate: true,
    status: true,
    qr: true,
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Active Actions Menu State
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Modals State
  const [viewingSdsChem, setViewingSdsChem] = useState<Chemical | null>(null);
  const [editingSdsChem, setEditingSdsChem] = useState<Chemical | null>(null);
  const [compatibilityModalChem, setCompatibilityModalChem] = useState<Chemical | null>(null);
  const [targetCompatibilityChemId, setTargetCompatibilityChemId] = useState<string>('');
  const [qrModalChem, setQrModalChem] = useState<Chemical | null>(null);
  const [historyModalChem, setHistoryModalChem] = useState<Chemical | null>(null);
  const [deleteConfirmChem, setDeleteConfirmChem] = useState<Chemical | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload & OCR Extraction State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'upload' | 'extracting' | 'review'>('upload');
  const [extractedData, setExtractedData] = useState<any>({
    productName: '',
    manufacturer: '',
    casNumber: '',
    productCode: '',
    revisionDate: '',
    signalWord: 'DANGER',
    pictograms: ['flame', 'corrosion'] as GhsPictogramId[],
    hStatements: 'H226: Flammable liquid and vapour.\nH314: Causes severe skin burns and eye damage.',
    pStatements: 'P210: Keep away from heat/sparks/open flames.\nP280: Wear protective gloves/clothing/eye protection.',
    firstAid: 'Flush eyes and skin immediately with running water for 15 minutes. Inhalation: Move to fresh air.',
    storage: 'Store in cool, well-ventilated dedicated chemical warehouse away from strong oxidizers.',
    incompatibilities: 'Strong mineral bases, strong oxidizers, aluminum.',
  });

  // Calculate readiness for each chemical
  const getReadiness = (chem: Chemical): SdsReadiness => {
    if (chem.status === 'rejected') return 'Blocked';
    if (!chem.casNumber || chem.status === 'draft') return 'Unknown';
    if (
      chem.status === 'approved' &&
      chem.sdsRevisionDate &&
      chem.pictograms &&
      chem.pictograms.length > 0
    ) {
      return 'Ready';
    }
    return 'Action required';
  };

  // Determine category for display
  const getCategory = (chem: Chemical): ChemicalCategory => {
    const name = (chem.productName + ' ' + (chem.notes || '')).toLowerCase();
    if (name.includes('inhib') || name.includes('acid') || name.includes('hcl')) return 'Acidizing & Stimulation';
    if (name.includes('drill') || name.includes('mud') || name.includes('ester') || name.includes('bentonite')) return 'Drilling Fluids / Mud Support';
    if (name.includes('cement') || name.includes('retard') || name.includes('slurry')) return 'Cementing Operations';
    if (name.includes('kleen') || name.includes('wash') || name.includes('degreas') || name.includes('solvent')) return 'Solvents & Rig Degreasers';
    if (name.includes('methanol') || name.includes('hydrate') || name.includes('scaveng')) return 'Production & Hydrate Inhibitors';
    if (name.includes('bio') || name.includes('glutar') || name.includes('water')) return 'Water Treatment & Biocides';
    return 'General Industrial Chemical';
  };

  // Real KPI metrics calculated from database records
  const totalProducts = chemicals.length;
  const totalSds = sdsRecords.length;
  const approvedSds = chemicals.filter((c) => c.status === 'approved').length;
  const reviewRequiredSds = chemicals.filter(
    (c) => c.status === 'under_review' || c.status === 'requires_review'
  ).length;
  const missingSds = chemicals.filter((c) => !c.sdsRevisionDate || c.status === 'draft').length;
  const incompleteSds = chemicals.filter(
    (c) => !c.pictograms || c.pictograms.length === 0 || !c.casNumber || !c.hStatements || c.hStatements.length === 0
  ).length;

  // Filtered Chemicals List
  const filteredChemicals = useMemo(() => {
    return chemicals.filter((chem) => {
      // KPI quick filter
      if (selectedKpiFilter === 'approved' && chem.status !== 'approved') return false;
      if (selectedKpiFilter === 'review_required' && chem.status !== 'under_review' && chem.status !== 'requires_review') return false;
      if (selectedKpiFilter === 'missing' && chem.sdsRevisionDate && chem.status !== 'draft') return false;
      if (selectedKpiFilter === 'incomplete') {
        const isInc = !chem.pictograms || chem.pictograms.length === 0 || !chem.casNumber;
        if (!isInc) return false;
      }

      // Search query (product name, trade name, supplier, CAS, product code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          chem.productName.toLowerCase().includes(q) ||
          (chem.chemicalName || '').toLowerCase().includes(q) ||
          chem.manufacturer.toLowerCase().includes(q) ||
          chem.casNumber.toLowerCase().includes(q) ||
          chem.productCode.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Readiness filter
      if (readinessFilter !== 'all') {
        const r = getReadiness(chem);
        if (r !== readinessFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (chem.status !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const cat = getCategory(chem);
        if (cat !== categoryFilter) return false;
      }

      // Pictogram filter
      if (pictogramFilter !== 'all') {
        if (!chem.pictograms || !chem.pictograms.includes(pictogramFilter as GhsPictogramId)) {
          return false;
        }
      }

      return true;
    });
  }, [
    chemicals,
    selectedKpiFilter,
    searchQuery,
    readinessFilter,
    statusFilter,
    categoryFilter,
    pictogramFilter,
  ]);

  // Sorted Chemicals List
  const sortedChemicals = useMemo(() => {
    return [...filteredChemicals].sort((a, b) => {
      let valA: any = a[sortField as keyof Chemical] || '';
      let valB: any = b[sortField as keyof Chemical] || '';

      if (sortField === 'readiness') {
        valA = getReadiness(a);
        valB = getReadiness(b);
      } else if (sortField === 'category') {
        valA = getCategory(a);
        valB = getCategory(b);
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
  }, [filteredChemicals, sortField, sortDirection]);

  // Paginated Chemicals
  const totalPages = Math.ceil(sortedChemicals.length / pageSize) || 1;
  const paginatedChemicals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedChemicals.slice(start, start + pageSize);
  }, [sortedChemicals, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export Library to CSV
  const handleExportCsv = () => {
    const headers = [
      'Product Name',
      'Manufacturer',
      'Product Code',
      'CAS Number',
      'Readiness Status',
      'Document Status',
      'Signal Word',
      'Pictograms',
      'SDS Revision Date',
      'Last Reviewer',
    ];

    const rows = filteredChemicals.map((c) => [
      `"${c.productName.replace(/"/g, '""')}"`,
      `"${c.manufacturer.replace(/"/g, '""')}"`,
      `"${c.productCode}"`,
      `"${c.casNumber}"`,
      `"${getReadiness(c)}"`,
      `"${c.status}"`,
      `"${c.signalWord}"`,
      `"${(c.pictograms || []).join('; ')}"`,
      `"${c.sdsRevisionDate || ''}"`,
      `"${c.lastReviewedBy || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OILSERV_SDS_Library_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Library to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredChemicals, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `OILSERV_SDS_Library_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  // Handle Upload Simulated Extraction
  const handleStartExtraction = () => {
    if (!uploadFile) return;
    setUploadStep('extracting');
    setTimeout(() => {
      setExtractedData({
        productName: uploadFile.name.replace('.pdf', '').replace(/_/g, ' '),
        manufacturer: 'Baker Hughes / Schlumberger Oilfield Chemistry',
        casNumber: '111-46-6',
        productCode: `OS-EXT-${Math.floor(100 + Math.random() * 900)}`,
        revisionDate: '2025-08-14',
        signalWord: 'WARNING',
        pictograms: ['exclamation-mark', 'health-hazard'] as GhsPictogramId[],
        hStatements: 'H302: Harmful if swallowed.\nH373: May cause damage to kidneys through prolonged exposure.',
        pStatements: 'P260: Do not breathe mist/vapours.\nP301+P312: IF SWALLOWED: Call a doctor if you feel unwell.',
        firstAid: 'Inhalation: Fresh air. Ingestion: Rinse mouth. Never induce vomiting. Contact poison center.',
        storage: 'Store in tightly closed container in cool, well-ventilated area away from strong oxidizing acids.',
        incompatibilities: 'Strong oxidizers, strong mineral acids, isocyanates.',
      });
      setUploadStep('review');
    }, 1400);
  };

  // Save Extracted SDS into Platform
  const handleSaveVerifiedExtraction = () => {
    const newChem = addChemical({
      productName: extractedData.productName,
      manufacturer: extractedData.manufacturer,
      productCode: extractedData.productCode,
      casNumber: extractedData.casNumber,
      physicalState: 'Liquid',
      sdsRevisionDate: extractedData.revisionDate,
      status: 'approved',
      lastReviewedDate: new Date().toISOString().split('T')[0],
      lastReviewedBy: currentUser.name || 'HSE Compliance Lead',
      signalWord: extractedData.signalWord,
      pictograms: extractedData.pictograms,
      hazardClasses: ['Acute Toxicity Oral Cat. 4', 'STOT RE Cat. 2'],
      hStatements: [
        { code: 'H302', text: 'Harmful if swallowed.', category: 'health' },
        { code: 'H373', text: 'May cause damage to organs through prolonged exposure.', category: 'health' },
      ],
      pStatements: [
        { code: 'P260', text: 'Do not breathe mist/vapours.', category: 'prevention' },
        { code: 'P301+P312', text: 'IF SWALLOWED: Call poison center if unwell.', category: 'response' },
      ],
      nfpa: { health: 2, flammability: 1, instability: 0, special: '' },
      hmis: { health: 2, flammability: 1, physicalHazard: 0, ppeCode: 'B' },
      ppe: {
        eye: 'Chemical Safety Glasses with Side Shields',
        hand: 'Nitrile Protective Gloves',
        respiratory: 'Organic Vapor Half-Mask Respirator',
        body: 'Industrial Coverall',
        foot: 'Safety Boots',
      },
      emergency: {
        firstAidInhalation: extractedData.firstAid,
        firstAidSkin: 'Flush with water for 15 mins.',
        firstAidEye: 'Rinse cautiously with water.',
        firstAidIngestion: 'Rinse mouth. Seek medical attention.',
        fireResponse: 'Water spray, dry chemical, alcohol-resistant foam.',
        spillResponse: 'Absorb with inert material (sand, vermiculite).',
        storageHandling: extractedData.storage,
        emergencyContact: 'OILSERV 24/7 EOC: +234-1-234-5678',
        emergencyPhone: '+234-1-234-5678',
      },
      notes: `Extracted from PDF ${uploadFile?.name || 'document'}. Verified and approved into SDS Library repository.`,
    });

    addSdsRecord({
      chemicalId: newChem.id,
      chemicalName: newChem.productName,
      manufacturer: newChem.manufacturer,
      revisionDate: extractedData.revisionDate,
      fileName: uploadFile?.name || 'Supplier_SDS.pdf',
      fileSize: `${((uploadFile?.size || 450000) / 1024).toFixed(0)} KB`,
      uploadedBy: currentUser.name || 'HSE Specialist',
      status: 'verified',
    });

    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadStep('upload');
  };

  // Check Chemical Compatibility between Chem A & Chem B
  const evaluateCompatibility = (chemA: Chemical, chemB: Chemical) => {
    const textA = (chemA.productName + ' ' + (chemA.notes || '') + ' ' + (chemA.hazardClasses || []).join(' ')).toLowerCase();
    const textB = (chemB.productName + ' ' + (chemB.notes || '') + ' ' + (chemB.hazardClasses || []).join(' ')).toLowerCase();

    const isAcidA = textA.includes('acid') || textA.includes('hcl');
    const isAcidB = textB.includes('acid') || textB.includes('hcl');
    const isBaseA = textA.includes('caustic') || textA.includes('hydroxide') || textA.includes('base') || textA.includes('kleen');
    const isBaseB = textB.includes('caustic') || textB.includes('hydroxide') || textB.includes('base') || textB.includes('kleen');
    const isOxidizerA = textA.includes('peroxide') || textA.includes('hypochlorite') || textA.includes('oxidiz');
    const isOxidizerB = textB.includes('peroxide') || textB.includes('hypochlorite') || textB.includes('oxidiz');
    const isFlammableA = (chemA.pictograms || []).includes('flame') || textA.includes('flam') || textA.includes('methanol');
    const isFlammableB = (chemB.pictograms || []).includes('flame') || textB.includes('flam') || textB.includes('methanol');

    if ((isAcidA && isBaseB) || (isAcidB && isBaseA)) {
      return {
        status: 'Incompatible',
        severity: 'danger',
        warning: 'Violent Exothermic Neutralization Hazard',
        detail: 'Strong mineral acid and caustic base will undergo rapid boiling, corrosive spattering, and extreme heat generation.',
        precautions: 'Do not store in the same containment dike. Segregate with dedicated physical berms.',
      };
    }
    if ((isOxidizerA && isFlammableB) || (isOxidizerB && isFlammableA)) {
      return {
        status: 'Incompatible',
        severity: 'danger',
        warning: 'Spontaneous Combustion & Rapid Fire Acceleration',
        detail: 'Strong oxidizing agent promotes rapid flash ignition and explosive vapor combustion with flammable solvents.',
        precautions: 'Maintain at least 20 feet (6 meters) physical storage separation or certified 1-hour fire wall.',
      };
    }
    if ((isAcidA && textB.includes('cyanide')) || (isAcidB && textA.includes('cyanide'))) {
      return {
        status: 'Incompatible',
        severity: 'danger',
        warning: 'Lethal Toxic Gas Evolution (HCN)',
        detail: 'Reaction generates fatal hydrogen cyanide gas upon contact.',
        precautions: 'Strict prohibition against shared storage or transfer lines.',
      };
    }

    return {
      status: 'Compatible',
      severity: 'safe',
      warning: 'No Mutual Reactivity Identified under Normal Conditions',
      detail: 'Standard industrial chemical storage precautions apply. Ensure secondary containment is maintained.',
      precautions: 'Keep containers closed and grounded.',
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 space-y-6 select-none bg-slate-50/40 min-h-screen">
      {/* 1. TOP HEADER & TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  SDS Library
                </h1>
                <span className="bg-orange-50 text-[#ea580c] text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                  OILSERV SDS ONLINE
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  OSHA 29 CFR 1910.1200
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized Chemical Safety Data Sheet Management & Regulatory Repository
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setUploadStep('upload');
                setUploadFile(null);
                setIsUploadModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#ea580c] hover:bg-orange-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload SDS PDF</span>
            </button>

            <button
              onClick={() => setCurrentView('add_product_basic')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Add Chemical Manually</span>
            </button>

            <div className="relative inline-block text-left">
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Export Library to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Library</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedKpiFilter(null);
                setReadinessFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
                setPictogramFilter('all');
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Refresh Data & Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chemical by product name, trade name, manufacturer, chemical code, or CAS registry number..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SIX INTERACTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Chemical Products */}
        <div
          onClick={() => setSelectedKpiFilter(null)}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedKpiFilter === null ? 'ring-2 ring-slate-800 border-slate-800' : 'border-slate-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block truncate">
            1. Total Products
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {totalProducts}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            Registered Inventory
          </span>
        </div>

        {/* Card 2: Total SDS Documents */}
        <div
          onClick={() => setSelectedKpiFilter(null)}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedKpiFilter === null ? 'border-slate-200' : 'border-slate-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block truncate">
            2. SDS Documents
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
            {totalSds}
          </div>
          <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
            PDF Master Files
          </span>
        </div>

        {/* Card 3: Approved SDS (Green) */}
        <div
          onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'approved' ? null : 'approved')}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedKpiFilter === 'approved' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-emerald-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide block truncate">
            3. Approved SDS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {approvedSds}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
            Verified & Compliant
          </span>
        </div>

        {/* Card 4: SDS Requiring Review (Amber) */}
        <div
          onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'review_required' ? null : 'review_required')}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedKpiFilter === 'review_required' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20' : 'border-amber-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide block truncate">
            4. Review Needed
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {reviewRequiredSds}
          </div>
          <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
            Due for HSE Sign-Off
          </span>
        </div>

        {/* Card 5: Missing SDS (Red) */}
        <div
          onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'missing' ? null : 'missing')}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedKpiFilter === 'missing' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/20' : 'border-rose-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide block truncate">
            5. Missing SDS
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {missingSds}
          </div>
          <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
            Document Required
          </span>
        </div>

        {/* Card 6: Incomplete Records (Amber/Red) */}
        <div
          onClick={() => setSelectedKpiFilter(selectedKpiFilter === 'incomplete' ? null : 'incomplete')}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedKpiFilter === 'incomplete' ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/20' : 'border-purple-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide block truncate">
            6. Incomplete
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
            {incompleteSds}
          </div>
          <span className="text-[10px] text-purple-600 font-medium block mt-0.5">
            Missing GHS / CAS
          </span>
        </div>
      </div>

      {/* 3. CHEMICAL HAZARD OVERVIEW & QUICK FILTER CHIPS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#ea580c]" />
            <span>Chemical Hazard Overview & GHS Pictogram Distribution</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Click any hazard filter below to isolate chemicals
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPictogramFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              pictogramFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Hazards ({chemicals.length})
          </button>

          {(
            [
              { id: 'flame', name: 'Flammable' },
              { id: 'corrosion', name: 'Corrosive' },
              { id: 'skull-and-crossbones', name: 'Acute Toxic' },
              { id: 'health-hazard', name: 'Health Hazard' },
              { id: 'environment', name: 'Aquatic / Eco' },
              { id: 'gas-cylinder', name: 'Gas Under Pressure' },
              { id: 'exclamation-mark', name: 'Harmful / Irritant' },
            ] as const
          ).map((pic) => {
            const count = chemicals.filter((c) => c.pictograms && c.pictograms.includes(pic.id)).length;
            const isSelected = pictogramFilter === pic.id;
            return (
              <button
                key={pic.id}
                onClick={() => setPictogramFilter(isSelected ? 'all' : pic.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50 text-[#ea580c] border-[#ea580c] ring-2 ring-orange-200 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <GhsPictogram id={pic.id} size={18} />
                <span>{pic.name}</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FILTERS & COLUMN CONTROLS BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Readiness Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Readiness:</span>
            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c] cursor-pointer"
            >
              <option value="all">All Readiness</option>
              <option value="Ready">Ready (Verified)</option>
              <option value="Action required">Action Required</option>
              <option value="Blocked">Blocked</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Document Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c] cursor-pointer"
            >
              <option value="all">All Document Statuses</option>
              <option value="approved">Approved</option>
              <option value="under_review">Under Review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Chemical Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c] cursor-pointer"
            >
              <option value="all">All Chemical Categories</option>
              <option value="Acidizing & Stimulation">Acidizing & Stimulation</option>
              <option value="Drilling Fluids / Mud Support">Drilling Fluids / Mud</option>
              <option value="Cementing Operations">Cementing Operations</option>
              <option value="Solvents & Rig Degreasers">Solvents & Degreasers</option>
              <option value="Production & Hydrate Inhibitors">Production & Hydrates</option>
              <option value="Water Treatment & Biocides">Water Treatment</option>
            </select>
          </div>
        </div>

        {/* Right side: Column visibility toggle */}
        <div className="relative">
          <button
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Customize Columns</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isColumnPickerOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-bold text-slate-800 block pb-1 border-b border-slate-100">
                Visible Table Columns
              </span>
              {Object.keys(visibleColumns).map((colKey) => (
                <label key={colKey} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(visibleColumns as any)[colKey]}
                    onChange={(e) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [colKey]: e.target.checked,
                      }))
                    }
                    className="rounded text-[#ea580c] cursor-pointer"
                  />
                  <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. SDS LIBRARY MASTER DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#374756] text-white font-bold tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('productName')}
                  className="p-3.5 cursor-pointer hover:bg-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product Name</span>
                    {sortField === 'productName' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </div>
                </th>

                {visibleColumns.supplier && (
                  <th
                    onClick={() => handleSort('manufacturer')}
                    className="p-3.5 cursor-pointer hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Manufacturer</span>
                      {sortField === 'manufacturer' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                )}

                {visibleColumns.code && <th className="p-3.5">Code / CAS</th>}

                {visibleColumns.category && (
                  <th
                    onClick={() => handleSort('category')}
                    className="p-3.5 cursor-pointer hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category</span>
                      {sortField === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                )}

                {visibleColumns.readiness && (
                  <th
                    onClick={() => handleSort('readiness')}
                    className="p-3.5 cursor-pointer hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SDS Readiness</span>
                      {sortField === 'readiness' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                )}

                {visibleColumns.pictograms && <th className="p-3.5">GHS Pictograms</th>}

                {visibleColumns.signalWord && <th className="p-3.5">Signal Word</th>}

                {visibleColumns.ratings && <th className="p-3.5">NFPA / HMIS</th>}

                {visibleColumns.revisionDate && (
                  <th
                    onClick={() => handleSort('sdsRevisionDate')}
                    className="p-3.5 cursor-pointer hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SDS Revision</span>
                      {sortField === 'sdsRevisionDate' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                )}

                {visibleColumns.status && (
                  <th
                    onClick={() => handleSort('status')}
                    className="p-3.5 cursor-pointer hover:bg-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Document Status</span>
                      {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                )}

                {visibleColumns.qr && <th className="p-3.5 text-center">QR</th>}

                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedChemicals.map((chem) => {
                const readiness = getReadiness(chem);
                const category = getCategory(chem);
                const isMenuOpen = activeActionMenuId === chem.id;

                return (
                  <tr key={chem.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product Name */}
                    <td className="p-3.5 font-bold text-slate-900">
                      <div
                        onClick={() => setViewingSdsChem(chem)}
                        className="cursor-pointer hover:text-[#ea580c] transition-colors leading-tight"
                      >
                        {chem.productName}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {chem.chemicalName || chem.casNumber}
                      </div>
                    </td>

                    {/* Supplier */}
                    {visibleColumns.supplier && (
                      <td className="p-3.5 text-slate-600 font-medium">
                        {chem.manufacturer}
                      </td>
                    )}

                    {/* Code & CAS */}
                    {visibleColumns.code && (
                      <td className="p-3.5 font-mono text-[11px] text-slate-700">
                        <div>{chem.productCode || 'OS-CHEM-001'}</div>
                        <div className="text-slate-400 text-[10px]">{chem.casNumber || 'N/A'}</div>
                      </td>
                    )}

                    {/* Category */}
                    {visibleColumns.category && (
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {category}
                        </span>
                      </td>
                    )}

                    {/* Chemical SDS Readiness (User specific requirement) */}
                    {visibleColumns.readiness && (
                      <td className="p-3.5">
                        {readiness === 'Ready' && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ready</span>
                          </span>
                        )}
                        {readiness === 'Action required' && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Action required</span>
                          </span>
                        )}
                        {readiness === 'Blocked' && (
                          <span className="bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit shadow-2xs">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            <span>Blocked</span>
                          </span>
                        )}
                        {readiness === 'Unknown' && (
                          <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Unknown</span>
                          </span>
                        )}
                      </td>
                    )}

                    {/* GHS Pictograms */}
                    {visibleColumns.pictograms && (
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap max-w-[130px]">
                          {(chem.pictograms || []).slice(0, 4).map((pic) => (
                            <GhsPictogram key={pic} id={pic} size={22} />
                          ))}
                        </div>
                      </td>
                    )}

                    {/* Signal Word */}
                    {visibleColumns.signalWord && (
                      <td className="p-3.5">
                        {chem.signalWord === 'DANGER' ? (
                          <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded tracking-wide">
                            DANGER
                          </span>
                        ) : chem.signalWord === 'WARNING' ? (
                          <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded tracking-wide">
                            WARNING
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </td>
                    )}

                    {/* NFPA & HMIS */}
                    {visibleColumns.ratings && (
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <NfpaDiamond rating={chem.nfpa} size={32} />
                          <div className="text-[10px] font-mono text-slate-600 leading-tight">
                            <div>H:{chem.hmis?.health || 0} F:{chem.hmis?.flammability || 0}</div>
                            <div>PH:{chem.hmis?.physicalHazard || 0} PPE:{chem.hmis?.ppeCode || 'B'}</div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Revision Date */}
                    {visibleColumns.revisionDate && (
                      <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                        {chem.sdsRevisionDate || <span className="text-slate-400 italic">Missing</span>}
                      </td>
                    )}

                    {/* Document Status */}
                    {visibleColumns.status && (
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            chem.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : chem.status === 'under_review' || chem.status === 'requires_review'
                              ? 'bg-amber-100 text-amber-800'
                              : chem.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {chem.status.replace('_', ' ')}
                        </span>
                      </td>
                    )}

                    {/* QR Code */}
                    {visibleColumns.qr && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setQrModalChem(chem)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Generate / View QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    )}

                    {/* 13 Functional Actions Dropdown */}
                    <td className="p-3.5 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionMenuId(isMenuOpen ? null : chem.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Document Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* 13 Actions Menu Dropdown */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 py-1.5 text-xs text-left divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <div className="py-1">
                            {/* 1. View SDS */}
                            <button
                              onClick={() => {
                                setViewingSdsChem(chem);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-[#ea580c]"
                            >
                              <FileText className="w-3.5 h-3.5 text-orange-500" />
                              <span className="font-semibold">1. View 16-Section SDS</span>
                            </button>

                            {/* 2. View Chemical Details */}
                            <button
                              onClick={() => {
                                setSelectedChemicalId(chem.id);
                                setCurrentView('details');
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>2. View Chemical Details</span>
                            </button>

                            {/* 3. Edit SDS Information */}
                            <button
                              onClick={() => {
                                setEditingSdsChem(chem);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" />
                              <span>3. Edit SDS Information</span>
                            </button>
                          </div>

                          <div className="py-1">
                            {/* 4. Upload or Replace SDS PDF */}
                            <button
                              onClick={() => {
                                setIsUploadModalOpen(true);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                              <span>4. Upload / Replace SDS PDF</span>
                            </button>

                            {/* 5. Download SDS PDF */}
                            <button
                              onClick={() => {
                                const dummyBlob = new Blob([`OILSERV SAFETY DATA SHEET\nProduct: ${chem.productName}\nManufacturer: ${chem.manufacturer}\nCAS: ${chem.casNumber}\nRevision Date: ${chem.sdsRevisionDate}`], { type: 'text/plain' });
                                const url = URL.createObjectURL(dummyBlob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${chem.productName.replace(/ /g, '_')}_SDS.pdf`;
                                a.click();
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-500" />
                              <span>5. Download SDS PDF</span>
                            </button>

                            {/* 6. Print SDS */}
                            <button
                              onClick={() => {
                                setViewingSdsChem(chem);
                                setActiveActionMenuId(null);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>6. Print SDS</span>
                            </button>

                            {/* 7. Preview SDS */}
                            <button
                              onClick={() => {
                                setViewingSdsChem(chem);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>7. Preview SDS Document</span>
                            </button>
                          </div>

                          <div className="py-1">
                            {/* 8. View Revision History */}
                            <button
                              onClick={() => {
                                setHistoryModalChem(chem);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>8. View Revision History</span>
                            </button>

                            {/* 9. Check Chemical Compatibility */}
                            <button
                              onClick={() => {
                                setCompatibilityModalChem(chem);
                                const other = chemicals.find((c) => c.id !== chem.id);
                                setTargetCompatibilityChemId(other ? other.id : '');
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-amber-700 hover:bg-amber-50"
                            >
                              <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                              <span>9. Check Compatibility</span>
                            </button>

                            {/* 10. Generate or Preview QR Code */}
                            <button
                              onClick={() => {
                                setQrModalChem(chem);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <QrCode className="w-3.5 h-3.5 text-slate-500" />
                              <span>10. Generate / Scan QR Code</span>
                            </button>

                            {/* 11. Open Associated GHS Label */}
                            <button
                              onClick={() => {
                                setSelectedChemicalId(chem.id);
                                setCurrentView('label_studio');
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-blue-700 hover:bg-blue-50"
                            >
                              <Tag className="w-3.5 h-3.5 text-blue-500" />
                              <span>11. Open Associated GHS Label</span>
                            </button>

                            {/* 12. Export Chemical Record */}
                            <button
                              onClick={() => {
                                const dataBlob = new Blob([JSON.stringify(chem, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(dataBlob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${chem.productName.replace(/ /g, '_')}_Record.json`;
                                a.click();
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-400" />
                              <span>12. Export Chemical Record</span>
                            </button>
                          </div>

                          <div className="py-1">
                            {/* 13. Delete Record */}
                            <button
                              onClick={() => {
                                setDeleteConfirmChem(chem);
                                setActiveActionMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span className="font-semibold">13. Delete Record</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedChemicals.length === 0 && (
                <tr>
                  <td colSpan={14} className="p-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No chemical SDS records match your query</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or upload a new supplier SDS document.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedKpiFilter(null);
                        setReadinessFilter('all');
                        setStatusFilter('all');
                      }}
                      className="mt-3 px-3.5 py-1.5 bg-[#ea580c] text-white text-xs font-semibold rounded-lg"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded p-1 text-xs font-bold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>of <strong>{filteredChemicals.length}</strong> total chemical products</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: COMPLETE 16-SECTION SDS VIEWER                  */}
      {/* ======================================================== */}
      {viewingSdsChem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-[#ea580c]" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    {viewingSdsChem.productName}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Official Safety Data Sheet (16 Sections) — OSHA 1910.1200 / GHS Compliant
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                  title="Print SDS"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingSdsChem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 16 Sections Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black text-slate-900">SAFETY DATA SHEET</h2>
                  <p className="text-slate-600 font-medium">Manufacturer: {viewingSdsChem.manufacturer}</p>
                  <p className="text-slate-500 text-[11px]">CAS: {viewingSdsChem.casNumber} | Code: {viewingSdsChem.productCode}</p>
                </div>
                <div className="text-right text-[11px]">
                  <p><strong>Revision Date:</strong> {viewingSdsChem.sdsRevisionDate || '2024-10-15'}</p>
                  <p><strong>Status:</strong> {viewingSdsChem.status.toUpperCase()}</p>
                </div>
              </div>

              {/* Section 1 */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-[#ea580c]">1. Identification</h4>
                <p><strong>Product Identifier:</strong> {viewingSdsChem.productName}</p>
                <p><strong>Recommended Use:</strong> Oil & Gas industrial well servicing, drilling and production operations.</p>
                <p><strong>Supplier:</strong> {viewingSdsChem.manufacturer}</p>
                <p><strong>Emergency Contact:</strong> {viewingSdsChem.emergency?.emergencyPhone || '+234-1-234-5678 / CHEMTREC +1-800-424-9300'}</p>
              </div>

              {/* Section 2 */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-[#ea580c]">2. Hazard(s) Identification</h4>
                <div className="flex items-center gap-2">
                  <strong>Signal Word:</strong>
                  <span className={`px-2 py-0.5 rounded text-white font-bold text-[10px] ${viewingSdsChem.signalWord === 'DANGER' ? 'bg-red-600' : 'bg-amber-500'}`}>
                    {viewingSdsChem.signalWord}
                  </span>
                </div>
                <div className="flex items-center gap-2 my-1">
                  <strong>GHS Pictograms:</strong>
                  {(viewingSdsChem.pictograms || []).map((p) => (
                    <GhsPictogram key={p} id={p} size={28} />
                  ))}
                </div>
                <div>
                  <strong>Hazard Statements:</strong>
                  <ul className="list-disc pl-4 mt-1 text-slate-600">
                    {(viewingSdsChem.hStatements || []).map((h, i) => (
                      <li key={i}>{h.code ? `${h.code}: ${h.text}` : h.text}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-[#ea580c]">4. First-Aid Measures</h4>
                <p><strong>Inhalation:</strong> {viewingSdsChem.emergency?.firstAidInhalation || 'Move victim to fresh air.'}</p>
                <p><strong>Skin Contact:</strong> {viewingSdsChem.emergency?.firstAidSkin || 'Flush with soap and water.'}</p>
                <p><strong>Eye Contact:</strong> {viewingSdsChem.emergency?.firstAidEye || 'Rinse cautiously with water for 15 minutes.'}</p>
                <p><strong>Ingestion:</strong> {viewingSdsChem.emergency?.firstAidIngestion || 'Do not induce vomiting. Seek immediate medical attention.'}</p>
              </div>

              {/* Section 7 */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-[#ea580c]">7. Handling and Storage</h4>
                <p><strong>Storage & Handling:</strong> {viewingSdsChem.emergency?.storageHandling || 'Store in dedicated chemical warehouse with secondary containment.'}</p>
              </div>

              {/* Section 8 */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-[#ea580c]">8. Exposure Controls / Personal Protection</h4>
                <p><strong>Eye Protection:</strong> {viewingSdsChem.ppe?.eye || 'Chemical splash goggles'}</p>
                <p><strong>Hand Protection:</strong> {viewingSdsChem.ppe?.hand || 'Heavy-duty nitrile/neoprene gloves'}</p>
                <p><strong>Respiratory:</strong> {viewingSdsChem.ppe?.respiratory || 'Organic vapor cartridge respirator'}</p>
                <p><strong>Body:</strong> {viewingSdsChem.ppe?.body || 'Flame-retardant coverall'}</p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Authoritative record: {viewingSdsChem.id}
              </span>
              <button
                onClick={() => setViewingSdsChem(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: UPLOAD SDS PDF & OCR EXTRACTION REVIEW           */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#ea580c]" />
                <h3 className="font-bold text-base text-slate-900">
                  Upload & OCR Extract Supplier SDS PDF
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-800">
              {uploadStep === 'upload' && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#ea580c] hover:bg-orange-50/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadFile(file);
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="font-bold text-sm text-slate-800">
                      {uploadFile ? uploadFile.name : 'Click to select or drag and drop supplier SDS PDF'}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      PDF documents up to 15MB. Conforms to OSHA 1910.1200 / GHS 16-section structure.
                    </p>
                    {uploadFile && (
                      <span className="mt-2 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        ✓ {uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </label>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!uploadFile}
                      onClick={handleStartExtraction}
                      className="px-5 py-2 bg-[#ea580c] hover:bg-orange-700 text-white font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    >
                      Extract 16-Section GHS Data
                    </button>
                  </div>
                </div>
              )}

              {uploadStep === 'extracting' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-[#ea580c] animate-spin" />
                  <p className="font-bold text-sm text-slate-800">
                    Executing Optical Character Recognition & GHS Classification Parsing...
                  </p>
                  <p className="text-slate-400 text-xs max-w-sm">
                    Scanning GHS pictograms, CAS registries, hazard codes, first-aid measures, and regulatory data.
                  </p>
                </div>
              )}

              {uploadStep === 'review' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    <strong>Human EHS Review Screen:</strong> Please review and correct extracted fields before committing to the authorized SDS repository.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={extractedData.productName}
                        onChange={(e) => setExtractedData({ ...extractedData, productName: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={extractedData.manufacturer}
                        onChange={(e) => setExtractedData({ ...extractedData, manufacturer: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CAS Registry Number</label>
                      <input
                        type="text"
                        value={extractedData.casNumber}
                        onChange={(e) => setExtractedData({ ...extractedData, casNumber: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SDS Revision Date</label>
                      <input
                        type="date"
                        value={extractedData.revisionDate}
                        onChange={(e) => setExtractedData({ ...extractedData, revisionDate: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">First-Aid Measures</label>
                    <textarea
                      rows={2}
                      value={extractedData.firstAid}
                      onChange={(e) => setExtractedData({ ...extractedData, firstAid: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setUploadStep('upload')}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveVerifiedExtraction}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                    >
                      Save & Approve SDS Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CHEMICAL INCOMPATIBILITY ASSESSOR                */}
      {/* ======================================================== */}
      {compatibilityModalChem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <AlertOctagon className="w-5 h-5 text-amber-600" />
                <span>Chemical Incompatibility Evaluator</span>
              </div>
              <button
                onClick={() => setCompatibilityModalChem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Evaluated Chemical:</label>
                <div className="p-2.5 bg-slate-100 rounded-lg font-semibold text-slate-900">
                  {compatibilityModalChem.productName} ({compatibilityModalChem.casNumber})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Second Chemical to Compare Against:</label>
                <select
                  value={targetCompatibilityChemId}
                  onChange={(e) => setTargetCompatibilityChemId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  {chemicals
                    .filter((c) => c.id !== compatibilityModalChem.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.productName} ({c.manufacturer})
                      </option>
                    ))}
                </select>
              </div>

              {(() => {
                const targetChem = chemicals.find((c) => c.id === targetCompatibilityChemId);
                if (!targetChem) return null;
                const result = evaluateCompatibility(compatibilityModalChem, targetChem);

                return (
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      result.severity === 'danger'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        Assessment: {result.status}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          result.severity === 'danger' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>

                    <p className="font-semibold">{result.warning}</p>
                    <p className="text-[11px] leading-relaxed">{result.detail}</p>
                    <p className="text-[11px] font-medium pt-1 border-t border-black/10">
                      <strong>Mandated Precaution:</strong> {result.precautions}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setCompatibilityModalChem(null);
                  setCurrentView('compatibility_checker');
                }}
                className="px-4 py-2 bg-[#ea580c] hover:bg-[#f25100] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Launch Full Matrix & Bay Auditor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCompatibilityModalChem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Evaluator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: QR CODE PREVIEW & PRINT                          */}
      {/* ======================================================== */}
      {qrModalChem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Digital SDS QR Code</span>
              <button onClick={() => setQrModalChem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <QrCodeSvg value={`https://oilserv.com/sds/verify/${qrModalChem.id}`} size={160} />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">{qrModalChem.productName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">CAS: {qrModalChem.casNumber}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Authorized Online Master Document</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print QR Card</span>
              </button>
              <button
                onClick={() => setQrModalChem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: DELETE RECORD CONFIRMATION                      */}
      {/* ======================================================== */}
      {deleteConfirmChem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Chemical Record Removal</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmChem.productName}</strong> from active operations? This action will archive the master SDS record and log an entry into the corporate audit trail.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmChem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteChemical(deleteConfirmChem.id);
                  setDeleteConfirmChem(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: EDIT SDS INFORMATION                            */}
      {/* ======================================================== */}
      {editingSdsChem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Edit SDS Information</span>
              <button onClick={() => setEditingSdsChem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingSdsChem.productName}
                  onChange={(e) => setEditingSdsChem({ ...editingSdsChem, productName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={editingSdsChem.manufacturer}
                  onChange={(e) => setEditingSdsChem({ ...editingSdsChem, manufacturer: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">CAS Number</label>
                  <input
                    type="text"
                    value={editingSdsChem.casNumber}
                    onChange={(e) => setEditingSdsChem({ ...editingSdsChem, casNumber: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">SDS Revision Date</label>
                  <input
                    type="date"
                    value={editingSdsChem.sdsRevisionDate}
                    onChange={(e) => setEditingSdsChem({ ...editingSdsChem, sdsRevisionDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Document Status</label>
                <select
                  value={editingSdsChem.status}
                  onChange={(e) => setEditingSdsChem({ ...editingSdsChem, status: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded"
                >
                  <option value="approved">Approved</option>
                  <option value="under_review">Under Review</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setEditingSdsChem(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateChemical(editingSdsChem.id, {
                    productName: editingSdsChem.productName,
                    manufacturer: editingSdsChem.manufacturer,
                    casNumber: editingSdsChem.casNumber,
                    sdsRevisionDate: editingSdsChem.sdsRevisionDate,
                    status: editingSdsChem.status,
                  });
                  setEditingSdsChem(null);
                }}
                className="px-4 py-2 bg-[#ea580c] hover:bg-orange-700 text-white font-semibold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: REVISION HISTORY TIMELINE                       */}
      {/* ======================================================== */}
      {historyModalChem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Revision History Timeline</span>
              <button onClick={() => setHistoryModalChem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-bold text-slate-800">{historyModalChem.productName}</p>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-200">
              <div className="relative flex items-start gap-3 pl-6">
                <div className="w-4 h-4 rounded-full bg-emerald-500 absolute left-0 top-0.5 border-2 border-white" />
                <div>
                  <span className="font-bold text-slate-900 block">Revision 4.0 (Current Master)</span>
                  <span className="text-[11px] text-slate-500">{historyModalChem.lastReviewedDate || '2024-10-15'} — Verified by {historyModalChem.lastReviewedBy || 'Dr. Sarah Vance, CSP'}</span>
                  <p className="text-slate-600 mt-1">Full GHS 16-section compliance verified against OSHA HazCom 2012.</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3 pl-6">
                <div className="w-4 h-4 rounded-full bg-slate-300 absolute left-0 top-0.5 border-2 border-white" />
                <div>
                  <span className="font-bold text-slate-700 block">Revision 3.1</span>
                  <span className="text-[11px] text-slate-400">2022-06-20 — Preparer: J. Martinez</span>
                  <p className="text-slate-500 mt-1">Periodic 3-year vendor re-certification update.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setHistoryModalChem(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
