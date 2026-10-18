import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Save,
  Printer,
  ChevronLeft,
  Search,
  CheckCircle2,
  LayoutTemplate,
  Maximize2,
  RotateCw,
  Sliders,
  Layers,
  FileText,
  Ruler,
  ArrowLeftRight,
  ArrowUpDown,
  X,
  ExternalLink,
  Filter,
  ChevronDown,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  Chemical,
  GhsPictogramId,
  GhsSignalWord,
  NfpaRating,
  HmisRating,
  GhsStatement,
  LabelTemplate,
  LabelSizePreset,
  LabelOrientation,
  LabelDimensionUnit,
} from '../types';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogram, PICTOGRAM_META } from './GhsPictogram';
import { NfpaDiamond } from './NfpaDiamond';
import { HmisBar, PPE_CODE_DESCRIPTIONS } from './HmisBar';
import { PpeIconBadge, PPE_ITEMS, PpeItemId } from './PpeIconBadge';
import { GeneratedLabelPreview } from './GeneratedLabelPreview';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ApprovalWorkflowModal } from './ApprovalWorkflowModal';
import { GHS_H_STATEMENTS, GHS_P_STATEMENTS } from '../data/ghsStatements';
import { SAMPLE_SDS_TEXTS } from '../data/sampleSdsFiles';
import { PRESET_DIMENSIONS, UNIT_CONVERSIONS } from '../data/defaultTemplates';

type ActiveTab = 'basic' | 'ghs' | 'hp' | 'ppe' | 'nfpa' | 'hmis' | 'supplemental';

// Ordered GHS Pictogram grid matching official UNECE GHS01-GHS09 specification
const GHS_SELECTION_ITEMS: {
  id: GhsPictogramId;
  code: string;
  name: string;
  desc: string;
  file: string;
}[] = [
  { id: 'exploding-bomb', code: 'GHS01', name: 'Explosive', desc: 'Explosives, self-reactives, organic peroxides', file: 'ghs-01-explosive.png' },
  { id: 'flame', code: 'GHS02', name: 'Flammable', desc: 'Flammable gases, liquids, and solids', file: 'ghs-02-flammable.png' },
  { id: 'flame-over-circle', code: 'GHS03', name: 'Oxidizing', desc: 'Oxidizing gases, liquids, and solids', file: 'ghs-03-oxidizing.png' },
  { id: 'gas-cylinder', code: 'GHS04', name: 'Compressed Gas', desc: 'Gases under pressure (cylinder)', file: 'ghs-04-compressed-gas.png' },
  { id: 'corrosion', code: 'GHS05', name: 'Corrosive', desc: 'Corrosive to metals, skin burns, eye damage', file: 'ghs-05-corrosive.png' },
  { id: 'skull-and-crossbones', code: 'GHS06', name: 'Toxic', desc: 'Acute toxicity (fatal or toxic)', file: 'ghs-06-toxic.png' },
  { id: 'exclamation-mark', code: 'GHS07', name: 'Harmful / Irritant', desc: 'Skin & eye irritant, acute toxicity (harmful)', file: 'ghs-07-harmful.png' },
  { id: 'health-hazard', code: 'GHS08', name: 'Health Hazard', desc: 'Carcinogen, mutagenicity, target organ hazard', file: 'ghs-08-health-hazard.png' },
  { id: 'environment', code: 'GHS09', name: 'Environmental', desc: 'Aquatic toxicity, environmental hazards', file: 'ghs-09-environmental.png' },
];

interface TemplateTypeOption {
  id: string;
  label: string;
  sizePreset: LabelSizePreset;
  orientation: LabelOrientation;
  w: number;
  h: number;
  ratingSystem?: 'nfpa' | 'hmis' | 'both';
  components?: {
    ghsPictograms?: boolean;
    hazardStatements?: boolean;
    precautionaryStatements?: boolean;
    nfpaDiamond?: boolean;
    hmis?: boolean;
    ppe?: boolean;
    emergencyInfo?: boolean;
    qrCode?: boolean;
    batchLot?: boolean;
  };
}

const TEMPLATE_TYPE_OPTIONS: TemplateTypeOption[] = [
  { id: 'all', label: 'All Types', sizePreset: '6x4', orientation: 'landscape', w: 6, h: 4, ratingSystem: 'both' },
  { id: 'oilserv_standard', label: 'OILSERV Standard', sizePreset: '6x4', orientation: 'landscape', w: 6, h: 4, ratingSystem: 'both' },
  { id: 'standard_ghs', label: 'Standard GHS', sizePreset: '6x4', orientation: 'landscape', w: 6, h: 4, ratingSystem: 'both' },
  { id: 'small_container', label: 'Small Container', sizePreset: '4x3', orientation: 'landscape', w: 4, h: 3, ratingSystem: 'hmis' },
  { id: 'chemical_drum', label: 'Chemical Drum', sizePreset: '8x6', orientation: 'landscape', w: 8, h: 6, ratingSystem: 'both' },
  { id: 'ibc_tank', label: 'IBC / Tank', sizePreset: '10x8', orientation: 'landscape', w: 10, h: 8, ratingSystem: 'both' },
  { id: 'secondary_container', label: 'Secondary Container', sizePreset: '4x3', orientation: 'landscape', w: 4, h: 3, ratingSystem: 'hmis' },
  { id: 'chemical_waste', label: 'Chemical Waste', sizePreset: '8x6', orientation: 'landscape', w: 8, h: 6, ratingSystem: 'both' },
  { id: 'custom', label: 'Custom Templates', sizePreset: 'custom', orientation: 'landscape', w: 6, h: 4 },
];

export const AddChemicalView: React.FC = () => {
  const {
    chemicals,
    selectedChemicalId,
    addChemical,
    updateChemical,
    setSelectedChemicalId,
    setCurrentView,
    startAiReview,
    companySettings,
    activeLabelConfig,
    addAuditLog,
    templates,
    activeTemplateId,
    activeTemplate,
    setActiveTemplateId,
    currentUser,
    submitForApproval,
    approveChemicalWorkflow,
    rejectChemicalWorkflow,
    reopenChemicalDraft,
  } = useChemicals();

  // Active form tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  // Template Type, Sizing & Orientation State (Combined Image 1 + 2)
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all');
  const [selectedTypeName, setSelectedTypeName] = useState<string>('All Types');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false);

  const [labelSizePreset, setLabelSizePreset] = useState<LabelSizePreset>('6x4');
  const [labelOrientation, setLabelOrientation] = useState<LabelOrientation>('landscape');
  const [labelWidth, setLabelWidth] = useState<number>(6.0);
  const [labelHeight, setLabelHeight] = useState<number>(4.0);
  const [labelUnit, setLabelUnit] = useState<LabelDimensionUnit>('in');
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Active components checklist (Image 2 bottom row)
  const [activeComponents, setActiveComponents] = useState({
    ghsPictograms: true,
    hazardStatements: true,
    precautionaryStatements: true,
    nfpaDiamond: true,
    hmis: true,
    ppe: true,
    emergencyInfo: true,
    qrCode: true,
    batchLot: true,
  });

  const toggleComponent = (key: keyof typeof activeComponents) => {
    setActiveComponents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectType = (option: TemplateTypeOption) => {
    setSelectedTypeId(option.id);
    setSelectedTypeName(option.label);
    setIsTypeDropdownOpen(false);

    setLabelSizePreset(option.sizePreset);
    setLabelOrientation(option.orientation);

    let w = option.w;
    let h = option.h;
    if (labelUnit !== 'in') {
      w = UNIT_CONVERSIONS.convert(w, 'in', labelUnit);
      h = UNIT_CONVERSIONS.convert(h, 'in', labelUnit);
    }
    setLabelWidth(+w.toFixed(2));
    setLabelHeight(+h.toFixed(2));

    if (option.ratingSystem) {
      setRatingSystem(option.ratingSystem);
    }

    if (option.components) {
      setActiveComponents((prev) => ({
        ...prev,
        ...option.components,
      }));
    }
  };

  // Rating display system on demand: 'nfpa' | 'hmis' | 'both'
  const [ratingSystem, setRatingSystem] = useState<'nfpa' | 'hmis' | 'both'>('both');

  // Search & custom inputs for H & P statements
  const [hSearch, setHSearch] = useState('');
  const [pSearch, setPSearch] = useState('');
  const [customHInput, setCustomHInput] = useState('');
  const [customPInput, setCustomPInput] = useState('');

  // Check if editing an existing chemical
  const existingChem = chemicals.find((c) => c.id === selectedChemicalId);

  // Form State
  const [formData, setFormData] = useState({
    productName: existingChem?.productName || 'LIQUID HYDROGEN',
    chemicalName: existingChem?.chemicalName || 'LN2',
    casNumber: existingChem?.casNumber || '7727-37-9',
    osCode: existingChem?.productCode || existingChem?.osCode || 'N002',
    quantity: existingChem?.quantity || '30 M3',
    batchNumber: existingChem?.batchNumber || 'LN2-2024-001',
    manufacturingDate: existingChem?.manufacturingDate || '2024-09-18',
    expiryDate: existingChem?.expiryDate || '2025-10-23',
    supplier: existingChem?.manufacturer || 'OILSERV Energy Ltd',
    emergencyPhone: existingChem?.emergency?.emergencyPhone || '+234-1-234-5678',
    substancesIdentity: existingChem?.substancesIdentity || '',
    supplierAddress: existingChem?.supplierAddress || 'cal gaz. hassi meseaoud .',
    physicalState: existingChem?.physicalState || 'Gas',

    // GHS
    signalWord: (existingChem?.signalWord || 'WARNING') as GhsSignalWord,
    pictograms: (existingChem?.pictograms || ['flame', 'gas-cylinder', 'exclamation-mark', 'environment']) as GhsPictogramId[],

    // H & P Statements matching PDF sample
    hStatements: existingChem?.hStatements || [
      { code: 'H412', statement: 'Harmful to aquatic life with long lasting effects' },
      { code: 'H411', statement: 'Toxic to aquatic life with long lasting effects' },
      { code: 'H304', statement: 'May be fatal if swallowed and enters airways' },
      { code: 'H315', statement: 'Causes skin irritation' },
      { code: 'H319', statement: 'Causes serious eye irritation' },
    ],
    pStatements: existingChem?.pStatements || [
      { code: 'P301+P310', statement: 'IF SWALLOWED: Immediately call a POISON CENTER/doctor' },
      { code: 'P305+P351+P338', statement: 'IF IN EYES: Rinse cautiously with water for several minutes' },
      { code: 'P370+P378', statement: 'In case of fire: Use appropriate media to extinguish' },
      { code: 'P210', statement: 'Keep away from heat, hot surfaces, sparks, open flames and other ignition sources' },
      { code: 'P273', statement: 'Avoid release to the environment' },
    ],

    // PPE selected IDs
    selectedPpe: ['eye', 'foot', 'hand', 'clothing', 'scba'] as PpeItemId[],

    // NFPA 704
    nfpa: existingChem?.nfpa || { health: 3, flammability: 1, instability: 1, special: 'SA' },

    // HMIS III
    hmis: existingChem?.hmis || {
      health: 3,
      isChronic: false,
      flammability: 1,
      physicalHazard: 1,
      ppeCode: 'H',
    },

    // Supplemental
    customHeader: existingChem?.notes || 'SAFETY IS PARAMOUNT. STRICTLY FOLLOW HANDLING & STORAGE PROTOCOLS FOR COMPRESSED AND LIQUEFIED GASES.',
  });

  // Sync if selectedChemicalId changes
  useEffect(() => {
    if (existingChem) {
      setFormData({
        productName: existingChem.productName || '',
        chemicalName: existingChem.chemicalName || '',
        casNumber: existingChem.casNumber || '',
        osCode: existingChem.productCode || existingChem.osCode || '',
        quantity: existingChem.quantity || '',
        batchNumber: existingChem.batchNumber || '',
        manufacturingDate: existingChem.manufacturingDate || '2024-09-18',
        expiryDate: existingChem.expiryDate || '2025-10-23',
        supplier: existingChem.manufacturer || 'OILSERV Energy Ltd',
        emergencyPhone: existingChem.emergency?.emergencyPhone || '+234-1-234-5678',
        substancesIdentity: existingChem.substancesIdentity || '',
        supplierAddress: existingChem.supplierAddress || 'cal gaz. hassi meseaoud .',
        physicalState: existingChem.physicalState || 'Gas',
        signalWord: existingChem.signalWord || 'WARNING',
        pictograms: existingChem.pictograms || ['flame', 'gas-cylinder'],
        hStatements: existingChem.hStatements || [],
        pStatements: existingChem.pStatements || [],
        selectedPpe: ['eye', 'foot', 'hand', 'clothing', 'scba'],
        nfpa: existingChem.nfpa || { health: 3, flammability: 1, instability: 1, special: 'SA' },
        hmis: existingChem.hmis || {
          health: existingChem.nfpa?.health || 3,
          isChronic: false,
          flammability: existingChem.nfpa?.flammability || 1,
          physicalHazard: existingChem.nfpa?.instability || 1,
          ppeCode: 'H',
        },
        customHeader: existingChem.notes || '',
      });
    }
  }, [selectedChemicalId]);

  const handleTextChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const [pictogramLimitMsg, setPictogramLimitMsg] = useState<string | null>(null);

  const togglePictogram = (id: GhsPictogramId) => {
    setFormData((prev) => {
      const exists = prev.pictograms.includes(id);
      if (exists) {
        setPictogramLimitMsg(null);
        return {
          ...prev,
          pictograms: prev.pictograms.filter((p) => p !== id),
        };
      }
      if (prev.pictograms.length >= 6) {
        setPictogramLimitMsg(
          'Maximum of 6 hazard pictograms reached (OSHA 1910.1200 / GHS specification). Please deselect one to choose another.'
        );
        return prev;
      }
      setPictogramLimitMsg(null);
      return {
        ...prev,
        pictograms: [...prev.pictograms, id],
      };
    });
  };

  const togglePpe = (id: PpeItemId) => {
    setFormData((prev) => {
      const exists = prev.selectedPpe.includes(id);
      let updated: PpeItemId[];
      if (exists) {
        updated = prev.selectedPpe.filter((item) => item !== id);
      } else {
        if (prev.selectedPpe.length >= 10) return prev;
        updated = [...prev.selectedPpe, id];
      }
      return { ...prev, selectedPpe: updated };
    });
  };

  const toggleHStatement = (code: string, statementText: string) => {
    setFormData((prev) => {
      const exists = prev.hStatements.some((h) => h.code === code);
      if (exists) {
        return {
          ...prev,
          hStatements: prev.hStatements.filter((h) => h.code !== code),
        };
      } else {
        if (prev.hStatements.length >= 10) return prev;
        return {
          ...prev,
          hStatements: [...prev.hStatements, { code, statement: statementText, type: 'hazard' }],
        };
      }
    });
  };

  const togglePStatement = (code: string, statementText: string) => {
    setFormData((prev) => {
      const exists = prev.pStatements.some((p) => p.code === code);
      if (exists) {
        return {
          ...prev,
          pStatements: prev.pStatements.filter((p) => p.code !== code),
        };
      } else {
        if (prev.pStatements.length >= 10) return prev;
        return {
          ...prev,
          pStatements: [...prev.pStatements, { code, statement: statementText, type: 'prevention' }],
        };
      }
    });
  };

  const addCustomH = () => {
    if (!customHInput.trim()) return;
    const nextCode = `H-CUST-${formData.hStatements.length + 1}`;
    setFormData((prev) => ({
      ...prev,
      hStatements: [...prev.hStatements, { code: nextCode, statement: customHInput.trim(), type: 'hazard' }],
    }));
    setCustomHInput('');
  };

  const addCustomP = () => {
    if (!customPInput.trim()) return;
    const nextCode = `P-CUST-${formData.pStatements.length + 1}`;
    setFormData((prev) => ({
      ...prev,
      pStatements: [...prev.pStatements, { code: nextCode, statement: customPInput.trim(), type: 'prevention' }],
    }));
    setCustomPInput('');
  };

  const handleOrientationChange = (newOrientation: LabelOrientation) => {
    if (newOrientation === labelOrientation) return;
    setLabelOrientation(newOrientation);
    // Automatically swap width and height
    const prevW = labelWidth;
    const prevH = labelHeight;
    setLabelWidth(prevH);
    setLabelHeight(prevW);
  };

  const handlePresetSelect = (preset: LabelSizePreset) => {
    setLabelSizePreset(preset);
    if (preset === 'custom') return;

    const presetInfo = PRESET_DIMENSIONS[preset];
    if (!presetInfo) return;

    let w = presetInfo.widthIn;
    let h = presetInfo.heightIn;

    if (labelUnit !== 'in') {
      w = UNIT_CONVERSIONS.convert(w, 'in', labelUnit);
      h = UNIT_CONVERSIONS.convert(h, 'in', labelUnit);
    }

    if (labelOrientation === 'portrait') {
      if (w > h) {
        const tmp = w;
        w = h;
        h = tmp;
      }
    } else {
      if (h > w) {
        const tmp = w;
        w = h;
        h = tmp;
      }
    }

    setLabelWidth(+w.toFixed(2));
    setLabelHeight(+h.toFixed(2));
    setSizeError(null);
  };

  const handleDimensionChange = (valStr: string, isWidth: boolean) => {
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) {
      setSizeError('Width and height must be positive numbers greater than 0.');
    } else {
      setSizeError(null);
    }

    if (isWidth) {
      setLabelWidth(isNaN(num) ? 0 : num);
    } else {
      setLabelHeight(isNaN(num) ? 0 : num);
    }
    setLabelSizePreset('custom');
  };

  const handleUnitChange = (newUnit: LabelDimensionUnit) => {
    if (newUnit === labelUnit) return;
    const convertedW = UNIT_CONVERSIONS.convert(labelWidth, labelUnit, newUnit);
    const convertedH = UNIT_CONVERSIONS.convert(labelHeight, labelUnit, newUnit);
    setLabelUnit(newUnit);
    setLabelWidth(convertedW);
    setLabelHeight(convertedH);
  };

  const handleSave = () => {
    if (!formData.productName.trim()) {
      alert('Please provide a Product Name.');
      setActiveTab('basic');
      return;
    }

    const workflow = {
      status: 'under_review' as const,
      submittedBy: currentUser.name,
      submittedAt: new Date().toISOString(),
      submissionNotes: 'Submitted for HSE safety review and field release.',
      history: [
        ...(existingChem?.approvalWorkflow?.history || []),
        {
          id: `appr-${Date.now()}-sub`,
          action: 'submitted_for_approval' as const,
          user: currentUser.name,
          role: currentUser.roleTitle,
          timestamp: new Date().toISOString(),
          comments: 'Label submitted for HSE review and field sign-off.',
        },
      ],
    };

    const payload = {
      productName: formData.productName,
      chemicalName: formData.chemicalName,
      manufacturer: formData.supplier || 'OILSERV Energy Ltd',
      productCode: formData.osCode || 'N002',
      casNumber: formData.casNumber || 'N/A',
      physicalState: formData.physicalState as any,
      sdsRevisionDate: new Date().toISOString().split('T')[0],
      status: 'under_review' as const,
      approvalWorkflow: workflow,
      lastReviewedDate: new Date().toISOString().split('T')[0],
      lastReviewedBy: 'Pending HSE Lead Review',
      signalWord: formData.signalWord,
      pictograms: formData.pictograms,
      hazardClasses: [],
      hStatements: formData.hStatements,
      pStatements: formData.pStatements,
      nfpa: formData.nfpa,
      hmis: formData.hmis,
      ppe: {
        eye: 'Eye Protection (Safety Glasses/Goggles)',
        hand: 'Hand Protection (Safety Gloves)',
        respiratory: 'Respiratory Protection (Gas Mask/Respirator)',
        body: 'Protective Clothing (Coveralls/Full Body Suit)',
        foot: 'Safety Footwear (Safety Boots)',
      },
      emergency: {
        firstAidInhalation: 'Move victim to fresh air. Provide artificial respiration if needed.',
        firstAidSkin: 'Flush thoroughly with soap and water.',
        firstAidEye: 'Irrigate thoroughly with water for 15 minutes.',
        firstAidIngestion: 'Rinse mouth. Seek immediate emergency care.',
        fireResponse: 'Use dry chemical, foam, or water fog.',
        spillResponse: 'Dike with non-combustible absorbent material.',
        storageHandling: formData.supplierAddress,
        emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
        emergencyPhone: formData.emergencyPhone,
      },
      quantity: formData.quantity,
      batchNumber: formData.batchNumber,
      manufacturingDate: formData.manufacturingDate,
      expiryDate: formData.expiryDate,
      substancesIdentity: formData.substancesIdentity,
      supplierAddress: formData.supplierAddress,
      fromSdsLibrary: true,
      notes: formData.customHeader,
      version: existingChem?.version || '1.0',
    };

    let targetId = existingChem?.id;
    if (existingChem) {
      updateChemical(existingChem.id, payload);
    } else {
      const created = addChemical(payload);
      targetId = created.id;
    }

    if (targetId) {
      setSelectedChemicalId(targetId);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setCurrentView('workflow_submission');
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  // Grouped H statements
  const groupedHStatements = useMemo(() => {
    const q = hSearch.toLowerCase().trim();
    const physical: { code: string; statement: string }[] = [];
    const health: { code: string; statement: string }[] = [];
    const environmental: { code: string; statement: string }[] = [];
    const supplemental: { code: string; statement: string }[] = [];

    Object.entries(GHS_H_STATEMENTS).forEach(([code, item]) => {
      if (q && !code.toLowerCase().includes(q) && !item.statement.toLowerCase().includes(q)) {
        return;
      }
      if (code.startsWith('EUH')) {
        supplemental.push({ code, statement: item.statement });
      } else {
        const match = code.match(/^H(\d{3})/);
        const num = match ? parseInt(match[1], 10) : 0;
        if (num >= 200 && num < 300) {
          physical.push({ code, statement: item.statement });
        } else if (num >= 300 && num < 400) {
          health.push({ code, statement: item.statement });
        } else if (num >= 400 && num < 500) {
          environmental.push({ code, statement: item.statement });
        } else {
          supplemental.push({ code, statement: item.statement });
        }
      }
    });

    return { physical, health, environmental, supplemental };
  }, [hSearch]);

  // Grouped P statements
  const groupedPStatements = useMemo(() => {
    const q = pSearch.toLowerCase().trim();
    const general: { code: string; statement: string }[] = [];
    const prevention: { code: string; statement: string }[] = [];
    const response: { code: string; statement: string }[] = [];
    const storage: { code: string; statement: string }[] = [];
    const disposal: { code: string; statement: string }[] = [];

    Object.entries(GHS_P_STATEMENTS).forEach(([code, item]) => {
      if (q && !code.toLowerCase().includes(q) && !item.statement.toLowerCase().includes(q)) {
        return;
      }
      if (item.type === 'general') {
        general.push({ code, statement: item.statement });
      } else if (item.type === 'prevention') {
        prevention.push({ code, statement: item.statement });
      } else if (item.type === 'response') {
        response.push({ code, statement: item.statement });
      } else if (item.type === 'storage') {
        storage.push({ code, statement: item.statement });
      } else if (item.type === 'disposal') {
        disposal.push({ code, statement: item.statement });
      }
    });

    return { general, prevention, response, storage, disposal };
  }, [pSearch]);

  // Live chemical preview object
  const liveChemical: Partial<Chemical> = {
    productName: formData.productName,
    chemicalName: formData.chemicalName,
    manufacturer: formData.supplier,
    productCode: formData.osCode,
    casNumber: formData.casNumber,
    signalWord: formData.signalWord,
    pictograms: formData.pictograms,
    hStatements: formData.hStatements,
    pStatements: formData.pStatements,
    nfpa: formData.nfpa,
    hmis: formData.hmis,
    batchNumber: formData.batchNumber,
    manufacturingDate: formData.manufacturingDate,
    expiryDate: formData.expiryDate,
    quantity: formData.quantity,
    supplierAddress: formData.supplierAddress,
    emergency: {
      emergencyPhone: formData.emergencyPhone,
    } as any,
    notes: formData.customHeader,
    sdsRevisionDate: formData.manufacturingDate,
    status: existingChem ? existingChem.status : 'draft',
    approvalWorkflow: existingChem ? existingChem.approvalWorkflow : undefined,
  };

  const fallbackChemical: Chemical = {
    id: 'draft-temp',
    productName: formData.productName || 'New Chemical Product',
    chemicalName: formData.chemicalName || '',
    casNumber: formData.casNumber || '',
    productCode: formData.osCode || '',
    quantity: formData.quantity || '',
    batchNumber: formData.batchNumber || '',
    manufacturingDate: formData.manufacturingDate || new Date().toISOString().split('T')[0],
    expiryDate: formData.expiryDate || '',
    manufacturer: formData.supplier || 'OILSERV Energy Ltd',
    emergency: {
      emergencyPhone: formData.emergencyPhone || '+234-1-234-5678',
      storageHandling: formData.supplierAddress,
      emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
      firstAidInhalation: 'Move victim to fresh air. Provide artificial respiration if needed.',
      firstAidSkin: 'Flush thoroughly with soap and water.',
      firstAidEye: 'Irrigate thoroughly with water for 15 minutes.',
      firstAidIngestion: 'Rinse mouth. Seek immediate emergency care.',
      fireResponse: 'Use dry chemical, foam, or water fog.',
      spillResponse: 'Dike with non-combustible absorbent material.',
    },
    substancesIdentity: formData.substancesIdentity,
    supplierAddress: formData.supplierAddress,
    physicalState: (formData.physicalState as any) || 'Liquid',
    signalWord: formData.signalWord,
    pictograms: formData.pictograms,
    hazardClasses: [],
    hStatements: formData.hStatements,
    pStatements: formData.pStatements,
    nfpa: formData.nfpa,
    hmis: formData.hmis,
    status: 'draft',
    version: '1.0',
    sdsRevisionDate: formData.manufacturingDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ppe: {
      eye: 'Eye Protection (Safety Glasses/Goggles)',
      hand: 'Hand Protection (Safety Gloves)',
      respiratory: 'Respiratory Protection (Gas Mask/Respirator)',
      body: 'Protective Clothing (Coveralls/Full Body Suit)',
      foot: 'Safety Footwear (Safety Boots)',
    },
    lastReviewedDate: new Date().toISOString().split('T')[0],
    lastReviewedBy: currentUser.name,
  };

  const activeChemicalForModal = existingChem || fallbackChemical;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Action Buttons: Submit Label, Print Label, Workflow & Audit History */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Print Label"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Label</span>
        </button>

        <button
          type="button"
          onClick={() => setIsWorkflowModalOpen(true)}
          className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Workflow and Audit History"
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Workflow and Audit History</span>
        </button>

        <button
          id="btn-submit-chemical-label"
          type="button"
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          title="Submit Label"
        >
          <Send className="w-4 h-4" />
          <span>{saveSuccess ? 'Submitting...' : 'Submit Label'}</span>
        </button>
      </div>

      {/* ================= UNIFIED LABEL TEMPLATE, SIZING & ORIENTATION BAR (IMAGE 1 + 2 COMBINED) ================= */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-4 sm:p-5 space-y-4">
        {/* Top Controls Row: Template Type Dropdown (Image 1), Orientation (Image 2), Size Presets (Image 2), Physical Dimensions (Image 2) */}
        <div className="flex flex-wrap lg:flex-nowrap items-start lg:items-center gap-4 xl:gap-6">
          {/* 1. Template Type Dropdown (Matching Image 1) */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Template Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex items-center justify-between gap-3 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 hover:border-slate-400 focus:outline-none cursor-pointer shadow-2xs min-w-[170px]"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTypeName}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dark Dropdown Menu directly matching Image 1 */}
              {isTypeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTypeDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-56 bg-[#636363] text-white rounded-md shadow-xl border border-slate-500/50 py-1 z-50 text-xs font-medium divide-y divide-slate-500/30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-0.5">
                      {TEMPLATE_TYPE_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectType(item)}
                          className={`w-full text-left px-3.5 py-2 hover:bg-[#505050] transition-colors flex items-center justify-between cursor-pointer ${
                            selectedTypeId === item.id ? 'bg-[#484848] text-amber-300 font-bold' : 'text-slate-100'
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedTypeId === item.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Label Orientation (Matching Image 2) */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Label Orientation
            </label>
            <div className="flex items-center bg-[#f0f4f8] p-1 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => handleOrientationChange('landscape')}
                className={`py-1 px-3 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  labelOrientation === 'landscape'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Landscape</span>
              </button>
              <button
                type="button"
                onClick={() => handleOrientationChange('portrait')}
                className={`py-1 px-3 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  labelOrientation === 'portrait'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Portrait</span>
              </button>
            </div>
          </div>

          {/* 3. Size Presets (Matching Image 2) */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Size Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['6x4', '4x3', '8x6', '10x8', 'a6', 'a5', 'a4', 'custom'] as LabelSizePreset[]).map((preset) => {
                const isActive = labelSizePreset === preset;
                const labelName = PRESET_DIMENSIONS[preset]?.name || preset.toUpperCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {labelName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Physical Dimensions (Matching Image 2) */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Physical Dimensions ({labelUnit.toUpperCase()})
            </label>
            <div className="flex items-center gap-2">
              <div className="relative w-20">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  W
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={labelWidth}
                  onChange={(e) => handleDimensionChange(e.target.value, true)}
                  className="w-full pl-6 pr-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                />
              </div>
              <span className="text-slate-400 font-bold text-xs">×</span>
              <div className="relative w-20">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  H
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={labelHeight}
                  onChange={(e) => handleDimensionChange(e.target.value, false)}
                  className="w-full pl-6 pr-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                />
              </div>
              <select
                value={labelUnit}
                onChange={(e) => handleUnitChange(e.target.value as LabelDimensionUnit)}
                className="py-1 px-2 text-xs font-bold bg-white border border-slate-300 rounded-md text-slate-700 focus:border-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="in">in (inch)</option>
                <option value="mm">mm (millimeter)</option>
                <option value="cm">cm (centimeter)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Validation Error Banner */}
        {sizeError && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{sizeError}</span>
          </div>
        )}

        {/* Bottom Row: Template Components (Matching Image 2) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            TEMPLATE COMPONENTS:
          </span>
          {[
            { key: 'ghsPictograms', label: 'GHS Pictograms' },
            { key: 'hazardStatements', label: 'H Statements' },
            { key: 'precautionaryStatements', label: 'P Statements' },
            { key: 'nfpaDiamond', label: 'NFPA 704' },
            { key: 'hmis', label: 'HMIS® III' },
            { key: 'ppe', label: 'PPE Icons' },
            { key: 'emergencyInfo', label: 'Emergency' },
            { key: 'qrCode', label: 'QR Code' },
            { key: 'batchLot', label: 'Batch / Lot' },
          ].map(({ key, label }) => {
            const isEnabled = activeComponents[key as keyof typeof activeComponents] !== false;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleComponent(key as keyof typeof activeComponents)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                  isEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200 line-through hover:bg-slate-200'
                }`}
                title={`Toggle ${label}`}
              >
                <span>{isEnabled ? '✓' : '✕'}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CARD 1: FORM SELECTION TABS (MATCHING IMAGES 1, 2, 3, 4) ================= */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Tab Headers Navigation */}
        <div className="flex items-center border-b border-slate-200 overflow-x-auto bg-slate-50/60 px-4 pt-3 gap-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'basic'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Basic Information *
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ghs')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ghs'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            GHS Hazards *
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hp')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hp'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            H & P Statements *
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ppe')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ppe'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            PPE *
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nfpa')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'nfpa'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            NFPA
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hmis')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hmis'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            HMIS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supplemental')}
            className={`px-4 py-2 text-xs font-bold rounded-t-md transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'supplemental'
                ? 'bg-white text-blue-600 border-t-2 border-x border-slate-200 border-t-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Supplemental Info
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6">
          {/* TAB 1: BASIC INFORMATION (MATCHING IMAGE 1) */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleTextChange('productName', e.target.value)}
                    placeholder="e.g., Crude Oil"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chemical Name *
                  </label>
                  <input
                    type="text"
                    value={formData.chemicalName}
                    onChange={(e) => handleTextChange('chemicalName', e.target.value)}
                    placeholder="e.g., Petroleum, crude oil"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CAS Number *
                  </label>
                  <input
                    type="text"
                    value={formData.casNumber}
                    onChange={(e) => handleTextChange('casNumber', e.target.value)}
                    placeholder="e.g., CAS No. 8002-05-9"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    OS Code
                  </label>
                  <input
                    type="text"
                    value={formData.osCode}
                    onChange={(e) => handleTextChange('osCode', e.target.value)}
                    placeholder="e.g., C402"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => handleTextChange('quantity', e.target.value)}
                    placeholder="e.g., 10 Liters, 500 kg"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => handleTextChange('batchNumber', e.target.value)}
                    placeholder="e.g., BATCH-2024-001"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) => handleTextChange('manufacturingDate', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleTextChange('expiryDate', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => handleTextChange('supplier', e.target.value)}
                    placeholder="OILSERV Energy Ltd"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleTextChange('emergencyPhone', e.target.value)}
                    placeholder="+234-1-234-5678"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identity of Contributing Substances (if mixture)
                </label>
                <textarea
                  rows={2}
                  value={formData.substancesIdentity}
                  onChange={(e) => handleTextChange('substancesIdentity', e.target.value)}
                  placeholder="e.g., Benzene (CAS 71-43-2), Toluene (CAS 108-88-3)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier Address
                </label>
                <textarea
                  rows={2}
                  value={formData.supplierAddress}
                  onChange={(e) => handleTextChange('supplierAddress', e.target.value)}
                  placeholder="Complete supplier address"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: GHS HAZARDS (MATCHING IMAGE 2) */}
          {activeTab === 'ghs' && (
            <div className="space-y-6">
              {/* Signal Word */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Signal Word
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="signalWord"
                      value="DANGER"
                      checked={formData.signalWord === 'DANGER'}
                      onChange={() => handleTextChange('signalWord', 'DANGER')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-red-600">DANGER</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="signalWord"
                      value="WARNING"
                      checked={formData.signalWord === 'WARNING'}
                      onChange={() => handleTextChange('signalWord', 'WARNING')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-amber-600">WARNING</span>
                  </label>
                </div>
              </div>

              {/* Hazard Pictograms Grid (3 x 3) */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Hazard Pictograms (Select up to 6 pictograms)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formData.pictograms.length === 4 ? (
                        <span className="text-blue-700 font-semibold flex items-center gap-1">
                          <span>♦ 4 Selected: Rendered in Diamond layout</span>
                        </span>
                      ) : formData.pictograms.length >= 5 ? (
                        <span className="text-purple-700 font-semibold flex items-center gap-1">
                          <span>▮ {formData.pictograms.length} Selected: Rendered in Vertical Rectangle layout</span>
                        </span>
                      ) : (
                        <span>Select all applicable GHS diamond visual warnings</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        formData.pictograms.length >= 6
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {formData.pictograms.length} / 6 Selected
                    </span>
                  </div>
                </div>

                {pictogramLimitMsg && (
                  <div className="mb-3.5 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{pictogramLimitMsg}</div>
                    <button
                      type="button"
                      onClick={() => setPictogramLimitMsg(null)}
                      className="text-amber-600 hover:text-amber-900 font-bold ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {GHS_SELECTION_ITEMS.map((item) => {
                    const isSelected = formData.pictograms.includes(item.id);
                    const isMaxReached = !isSelected && formData.pictograms.length >= 6;
                    return (
                      <div
                        key={item.id}
                        onClick={() => togglePictogram(item.id)}
                        className={`p-3.5 rounded-lg border transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 shadow-2xs cursor-pointer'
                            : isMaxReached
                            ? 'border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed'
                            : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                        }`}
                        title={
                          isMaxReached
                            ? 'Maximum of 6 pictograms reached. Deselect one first.'
                            : undefined
                        }
                      >
                        {/* Radio / Check Circle */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Red Diamond Pictogram */}
                        <div className="flex-shrink-0">
                          <GhsPictogram id={item.id} size={42} />
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.code}
                            </span>
                            <span className="text-xs font-bold text-slate-900 leading-tight">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                            {item.desc}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                            {item.file}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: H & P STATEMENTS (MATCHING IMAGE 3) */}
          {activeTab === 'hp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Red Hazard Statements */}
              <div className="border border-red-200 rounded-lg overflow-hidden flex flex-col bg-white">
                {/* Header Red Banner */}
                <div className="bg-red-600 text-white p-3 text-center">
                  <div className="font-bold text-sm leading-tight">
                    Hazard Statements (H-Statements)
                  </div>
                  <div className="text-[11px] text-red-100 mt-0.5">
                    Select up to 10 statements
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col space-y-3">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={hSearch}
                      onChange={(e) => setHSearch(e.target.value)}
                      placeholder="Search H-Statements..."
                      className="w-full pl-9 pr-3 py-1.5 border border-red-200 rounded-md text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="text-xs font-bold text-red-600">
                    Click to Select H-Statements ({formData.hStatements.length}/10 selected)
                  </div>

                  {/* Scrollable list of categories */}
                  <div className="border border-slate-200 rounded-md overflow-y-auto max-h-[360px] divide-y divide-slate-100 text-xs">
                    {/* Category 1: Physical hazard */}
                    {groupedHStatements.physical.length > 0 && (
                      <div>
                        <div className="bg-red-100/70 text-red-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          200 - 299 Physical hazard
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedHStatements.physical.map((item) => {
                            const isSelected = formData.hStatements.some((h) => h.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => toggleHStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-red-50/70 border border-red-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-red-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 2: Health hazard */}
                    {groupedHStatements.health.length > 0 && (
                      <div>
                        <div className="bg-red-100/70 text-red-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          300 - 399 Health hazard
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedHStatements.health.map((item) => {
                            const isSelected = formData.hStatements.some((h) => h.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => toggleHStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-red-50/70 border border-red-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-red-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 3: Environmental hazard */}
                    {groupedHStatements.environmental.length > 0 && (
                      <div>
                        <div className="bg-red-100/70 text-red-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          400 - 499 Environmental hazard
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedHStatements.environmental.map((item) => {
                            const isSelected = formData.hStatements.some((h) => h.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => toggleHStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-red-50/70 border border-red-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-red-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 4: Supplemental & EU CLP Hazards */}
                    {groupedHStatements.supplemental.length > 0 && (
                      <div>
                        <div className="bg-red-100/70 text-red-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          Supplemental & EU CLP Hazard Statements (EUH)
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedHStatements.supplemental.map((item) => {
                            const isSelected = formData.hStatements.some((h) => h.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => toggleHStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-red-50/70 border border-red-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-red-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Custom H Statement */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Or Add Custom H-Statement
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customHInput}
                        onChange={(e) => setCustomHInput(e.target.value)}
                        placeholder="Enter custom hazard statement..."
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={addCustomH}
                        className="w-8 h-8 rounded-md bg-red-500 hover:bg-red-600 text-white flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Blue Precautionary Statements */}
              <div className="border border-blue-200 rounded-lg overflow-hidden flex flex-col bg-white">
                {/* Header Blue Banner */}
                <div className="bg-blue-600 text-white p-3 text-center">
                  <div className="font-bold text-sm leading-tight">
                    Precautionary Statements (P-Statements)
                  </div>
                  <div className="text-[11px] text-blue-100 mt-0.5">
                    Select up to 10 statements
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col space-y-3">
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={pSearch}
                      onChange={(e) => setPSearch(e.target.value)}
                      placeholder="Search P-Statements..."
                      className="w-full pl-9 pr-3 py-1.5 border border-blue-200 rounded-md text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="text-xs font-bold text-blue-600">
                    Click to Select P-Statements ({formData.pStatements.length}/10 selected)
                  </div>

                  {/* Scrollable list of categories */}
                  <div className="border border-slate-200 rounded-md overflow-y-auto max-h-[360px] divide-y divide-slate-100 text-xs">
                    {/* Category 1: General */}
                    {groupedPStatements.general.length > 0 && (
                      <div>
                        <div className="bg-blue-100/70 text-blue-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          100 - 199 General
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedPStatements.general.map((item) => {
                            const isSelected = formData.pStatements.some((p) => p.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => togglePStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-blue-50/70 border border-blue-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-blue-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 2: Prevention */}
                    {groupedPStatements.prevention.length > 0 && (
                      <div>
                        <div className="bg-blue-100/70 text-blue-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          200 - 299 Prevention
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedPStatements.prevention.map((item) => {
                            const isSelected = formData.pStatements.some((p) => p.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => togglePStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-blue-50/70 border border-blue-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-blue-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 3: Response */}
                    {groupedPStatements.response.length > 0 && (
                      <div>
                        <div className="bg-blue-100/70 text-blue-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          300 - 399 Response
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedPStatements.response.map((item) => {
                            const isSelected = formData.pStatements.some((p) => p.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => togglePStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-blue-50/70 border border-blue-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-blue-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 4: Storage */}
                    {groupedPStatements.storage.length > 0 && (
                      <div>
                        <div className="bg-blue-100/70 text-blue-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          400 - 499 Storage
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedPStatements.storage.map((item) => {
                            const isSelected = formData.pStatements.some((p) => p.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => togglePStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-blue-50/70 border border-blue-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-blue-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 5: Disposal */}
                    {groupedPStatements.disposal.length > 0 && (
                      <div>
                        <div className="bg-blue-100/70 text-blue-900 font-bold px-3 py-1.5 sticky top-0 text-[11px]">
                          500 - 599 Disposal
                        </div>
                        <div className="p-1 space-y-1">
                          {groupedPStatements.disposal.map((item) => {
                            const isSelected = formData.pStatements.some((p) => p.code === item.code);
                            return (
                              <div
                                key={item.code}
                                onClick={() => togglePStatement(item.code, item.statement)}
                                className={`p-2 rounded-md flex items-start gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-blue-50/70 border border-blue-300' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                                </div>
                                <div>
                                  <strong className="text-blue-600 font-bold mr-1.5">{item.code}</strong>
                                  <span className="text-slate-800">{item.statement}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Custom P Statement */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Or Add Custom P-Statement
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customPInput}
                        onChange={(e) => setCustomPInput(e.target.value)}
                        placeholder="Enter custom precautionary statement..."
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addCustomP}
                        className="w-8 h-8 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PPE (MATCHING IMAGE 4) */}
          {activeTab === 'ppe' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-3">
                  Select Applicable PPE (Maximum 10 selections)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {PPE_ITEMS.map((item) => {
                    const isSelected = formData.selectedPpe.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => togglePpe(item.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3.5 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {/* Radio / Check Circle */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Circular Icon Badge */}
                        <PpeIconBadge id={item.id} size={32} />

                        {/* Text Label */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-800">
                            {item.title} ({item.subtitle})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NFPA 704 */}
          {activeTab === 'nfpa' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-4xl items-center">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">
                    Health Hazard (Blue: 0-4)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={formData.nfpa.health}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nfpa: { ...prev.nfpa, health: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-600 mb-1">
                    Flammability (Red: 0-4)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={formData.nfpa.flammability}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nfpa: { ...prev.nfpa, flammability: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-600 mb-1">
                    Instability / Reactivity (Yellow: 0-4)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={formData.nfpa.instability}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nfpa: { ...prev.nfpa, instability: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Special Hazard (White: SA, ACID, ALK, W, COR, OX)
                  </label>
                  <input
                    type="text"
                    value={formData.nfpa.special}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nfpa: { ...prev.nfpa, special: e.target.value.toUpperCase() },
                      }))
                    }
                    placeholder="e.g., SA, ACID"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-600 mb-3">Live NFPA 704 Diamond</span>
                <NfpaDiamond rating={formData.nfpa} size={110} />
              </div>
            </div>
          )}

          {/* TAB 6: HMIS (IN FRONT OF NFPA / SELECTABLE ON DEMAND) */}
          {activeTab === 'hmis' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-4xl items-start">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">
                    Health Hazard (Blue: 0-4)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={formData.hmis.health}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hmis: { ...prev.hmis, health: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.hmis.isChronic || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hmis: { ...prev.hmis, isChronic: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span>Chronic Health Hazard (*)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-600 mb-1">
                    Flammability (Red: 0-4)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={formData.hmis.flammability}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hmis: { ...prev.hmis, flammability: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-600 mb-1">
                    Physical Hazard (Orange: 0-4)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={formData.hmis.physicalHazard}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hmis: { ...prev.hmis, physicalHazard: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Personal Protection Index (A to K, or X)
                  </label>
                  <select
                    value={formData.hmis.ppeCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hmis: { ...prev.hmis, ppeCode: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                  >
                    {Object.entries(PPE_CODE_DESCRIPTIONS).map(([code, desc]) => (
                      <option key={code} value={code}>
                        {code} — {desc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating System Preference for Label */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Rating System to Display on Label:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setRatingSystem('nfpa')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                        ratingSystem === 'nfpa'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      NFPA 704 Diamond
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSystem('hmis')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                        ratingSystem === 'hmis'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      HMIS® III Rating Bar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingSystem('both')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                        ratingSystem === 'both'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Both (Side-by-side / In front)
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-600 mb-3">Live HMIS® III Bar</span>
                <HmisBar rating={formData.hmis} width={180} showLegend />
              </div>
            </div>
          )}

          {/* TAB 7: SUPPLEMENTAL INFO */}
          {activeTab === 'supplemental' && (
            <div className="space-y-4 max-w-4xl">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Label Footer & Safety Protocol Warning
                </label>
                <textarea
                  rows={3}
                  value={formData.customHeader}
                  onChange={(e) => handleTextChange('customHeader', e.target.value)}
                  placeholder="SAFETY IS PARAMOUNT. STRICTLY FOLLOW HANDLING & STORAGE PROTOCOLS FOR COMPRESSED AND LIQUEFIED GASES."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CARD 2: LIVE LABEL PREVIEW ON THE SAME PAGE (MATCHING IMAGES 1, 2, 3, 4 & PDF) ================= */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assign GHS Hazards
            </h2>
            <p className="text-xs text-slate-500">
              Select all hazards that apply to this product based on the Safety Data Sheet (SDS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Live Canvas:</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Auto-updating
            </span>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div className="p-6 bg-slate-100/70 flex justify-center items-center overflow-x-auto">
          <GeneratedLabelPreview
            chemical={liveChemical}
            ratingSystem={ratingSystem}
            onRatingSystemChange={setRatingSystem}
            selectedPpeItems={formData.selectedPpe}
            templateWidth={labelWidth}
            templateHeight={labelHeight}
            templateUnit={labelUnit}
            templateOrientation={labelOrientation}
            templateName={selectedTypeName}
            templateId={selectedTypeId}
            showGhs={activeComponents.ghsPictograms}
            showNfpa={activeComponents.nfpaDiamond}
            showHmis={activeComponents.hmis}
            showPpe={activeComponents.ppe}
            showEmergency={activeComponents.emergencyInfo}
            showQr={activeComponents.qrCode}
            showBatchLot={activeComponents.batchLot}
          />
        </div>
      </div>

      {/* Approval Workflow & Audit Log Modal */}
      <ApprovalWorkflowModal
        chemical={activeChemicalForModal}
        currentUser={currentUser}
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onSubmitForApproval={(chemId, notes, submitter) => {
          if (!existingChem) {
            handleSave();
          } else {
            submitForApproval(chemId, notes, submitter);
          }
        }}
        onApprove={approveChemicalWorkflow}
        onReject={rejectChemicalWorkflow}
        onReopenDraft={reopenChemicalDraft}
      />
    </div>
  );
};
