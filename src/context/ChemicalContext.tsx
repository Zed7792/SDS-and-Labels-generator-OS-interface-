import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Chemical,
  ChemicalStatus,
  LabelConfig,
  SdsRecord,
  AuditLogEntry,
  CompanySettings,
  LabelTemplate,
  CurrentUser,
  ComplianceChecklist,
  AppView,
} from '../types';
import { SAMPLE_CHEMICALS } from '../data/sampleChemicals';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { ENTERPRISE_USERS, DEFAULT_COMPLIANCE_CHECKLIST } from '../data/sampleUsers';

interface ChemicalContextType {
  chemicals: Chemical[];
  selectedChemicalId: string | null;
  selectedChemical: Chemical | null;
  setSelectedChemicalId: (id: string | null) => void;
  addChemical: (chemical: Omit<Chemical, 'id' | 'createdAt' | 'updatedAt'>) => Chemical;
  updateChemical: (id: string, updates: Partial<Chemical>) => void;
  deleteChemical: (id: string) => void;
  approveChemical: (id: string, reviewerNotes?: string) => void;

  // Phase 2: Role Management & Formal Approval Workflow
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  submitForApproval: (chemicalId: string, notes?: string, submitter?: CurrentUser) => void;
  approveChemicalWorkflow: (
    chemicalId: string,
    reviewerNotes: string,
    checklist: ComplianceChecklist,
    reviewer: CurrentUser
  ) => void;
  rejectChemicalWorkflow: (
    chemicalId: string,
    rejectionReason: string,
    requiredChanges: string,
    reviewer: CurrentUser
  ) => void;
  reopenChemicalDraft: (chemicalId: string, reason?: string) => void;

  // Label Studio state
  activeLabelConfig: LabelConfig;
  setActiveLabelConfig: React.Dispatch<React.SetStateAction<LabelConfig>>;
  savedLabels: LabelConfig[];
  saveLabel: (config: LabelConfig) => void;
  createNewVersion: (chemicalId: string, baseVersion: string) => string;

  // Template Management (Phase 1)
  templates: LabelTemplate[];
  activeTemplateId: string;
  activeTemplate: LabelTemplate;
  setActiveTemplateId: (id: string) => void;
  addTemplate: (template: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => LabelTemplate;
  updateTemplate: (id: string, updates: Partial<LabelTemplate>) => void;
  duplicateTemplate: (id: string, newName?: string) => LabelTemplate;
  archiveTemplate: (id: string) => void;

  // SDS Library state
  sdsRecords: SdsRecord[];
  addSdsRecord: (record: Omit<SdsRecord, 'id' | 'uploadedAt'>) => SdsRecord;

  // Audit trail
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Company settings
  companySettings: CompanySettings;
  updateCompanySettings: (updates: Partial<CompanySettings>) => void;

  // Active view navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // AI Extraction Review state
  pendingAiReviewData: any | null;
  setPendingAiReviewData: (data: any | null) => void;
  startAiReview: (extractedData: any, rawSdsText: string, fileName: string) => void;
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'OILSERV Energy Ltd',
  facilityName: 'OILSERV Energy Solutions - Port Harcourt Facility',
  facilityId: 'OS-PHC-2024 / DPR-HSE-992',
  facilityAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
  ehsDepartment: 'Corporate HSE & Chemical Safety Management Division',
  emergencyHotline24: '+234-1-234-5678 (OILSERV 24/7 EOC) / CHEMTREC: +1-800-424-9300',
  chemtrecContractNumber: 'CCN-OILSERV-2024',
  defaultLabelSize: '4x6',
  strictOshaValidation: true,
  requireDualSignoff: true,
};

const DEFAULT_LABEL_CONFIG: LabelConfig = {
  id: 'lbl-default',
  chemicalId: 'chem-004',
  version: '1.0',
  labelSize: '4x6',
  orientation: 'landscape',
  batchNumber: 'LN2-2024-001',
  containerSize: '30 M³',
  fillDate: '2024-09-18',
  expiryDate: '2025-10-23',
  showGhs: true,
  showNfpa: true,
  showHmis: true,
  showPpe: true,
  showEmergency: true,
  showQr: true,
  showBatchLot: true,
  customHeader: 'SAFETY IS PARAMOUNT. STRICTLY FOLLOW HANDLING & STORAGE PROTOCOLS FOR COMPRESSED AND LIQUEFIED GASES.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'Dr. Sarah Vance, CSP',
};

const ChemicalContext = createContext<ChemicalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHEMICALS: 'cls_chemicals_v2',
  SAVED_LABELS: 'cls_saved_labels_v2',
  SDS_RECORDS: 'cls_sds_records_v2',
  AUDIT_LOGS: 'cls_audit_logs_v2',
  SETTINGS: 'cls_settings_v2',
  TEMPLATES: 'cls_templates_v2',
  CURRENT_USER: 'cls_current_user_v2',
};

function ensureChemicalWorkflow(chem: Chemical): Chemical {
  const sanitizedChem: Chemical = {
    ...chem,
    pictograms: Array.isArray(chem.pictograms) ? chem.pictograms : [],
    hazardClasses: Array.isArray(chem.hazardClasses) ? chem.hazardClasses : [],
    hStatements: Array.isArray(chem.hStatements) ? chem.hStatements : [],
    pStatements: Array.isArray(chem.pStatements) ? chem.pStatements : [],
  };
  if (sanitizedChem.approvalWorkflow && sanitizedChem.approvalWorkflow.history?.length > 0) return sanitizedChem;
  const isApproved = chem.status === 'approved';
  const isUnderReview = chem.status === 'requires_review' || chem.status === 'under_review';
  const isRejected = chem.status === 'rejected';

  if (isApproved) {
    return {
      ...chem,
      status: 'approved',
      approvalWorkflow: {
        status: 'approved',
        reviewerName: chem.lastReviewedBy || 'Dr. Sarah Vance, CSP',
        reviewerRole: 'Corporate HSE Lead & Safety Specialist',
        reviewedAt: chem.lastReviewedDate ? `${chem.lastReviewedDate}T14:30:00Z` : '2024-07-28T14:30:00Z',
        approvalComments: 'Verified against OSHA HazCom 2012 / UN GHS Rev 10 protocols.',
        signatureHash: `OS-SIG-${chem.id.toUpperCase().replace('CHEM-', '')}-2026`,
        checklist: { ...DEFAULT_COMPLIANCE_CHECKLIST },
        history: [
          {
            id: `appr-init-${chem.id}-1`,
            action: 'submitted_for_approval',
            user: 'J. Martinez',
            role: 'Lab Technician & Chemical Safety Preparer',
            timestamp: chem.createdAt || '2024-07-05T09:00:00Z',
            comments: 'Initial SDS extraction and label draft submission.',
          },
          {
            id: `appr-init-${chem.id}-2`,
            action: 'approved',
            user: chem.lastReviewedBy || 'Dr. Sarah Vance, CSP',
            role: 'Corporate HSE Lead & Safety Specialist',
            timestamp: chem.lastReviewedDate ? `${chem.lastReviewedDate}T14:30:00Z` : '2024-07-28T14:30:00Z',
            comments: 'Full compliance review verified. Approved for operations.',
            signatureHash: `OS-SIG-${chem.id.toUpperCase().replace('CHEM-', '')}-2026`,
            complianceChecklist: { ...DEFAULT_COMPLIANCE_CHECKLIST },
          },
        ],
      },
    };
  }

  if (isUnderReview) {
    return {
      ...chem,
      status: 'under_review',
      approvalWorkflow: {
        status: 'under_review',
        submittedBy: 'J. Martinez',
        submittedAt: '2024-09-17T11:00:00Z',
        submissionNotes: 'Updated hazard statements and PPE matrix for upcoming drilling campaign.',
        checklist: { ...DEFAULT_COMPLIANCE_CHECKLIST },
        history: [
          {
            id: `appr-rev-${chem.id}-1`,
            action: 'submitted_for_approval',
            user: 'J. Martinez',
            role: 'Lab Technician & Chemical Safety Preparer',
            timestamp: '2024-09-17T11:00:00Z',
            comments: 'Updated hazard statements and PPE matrix for upcoming drilling campaign.',
          },
        ],
      },
    };
  }

  if (isRejected) {
    return {
      ...chem,
      status: 'rejected',
      approvalWorkflow: {
        status: 'rejected',
        reviewerName: 'Dr. Sarah Vance, CSP',
        reviewerRole: 'Corporate HSE Lead & Safety Specialist',
        reviewedAt: '2024-09-16T15:00:00Z',
        rejectionReason: 'Missing mandatory acute aquatic hazard pictogram and required eye protection specification.',
        requiredChanges: 'Assign environmental aquatic toxicity pictogram and specify indirect vent chemical goggles.',
        history: [
          {
            id: `appr-rej-${chem.id}-1`,
            action: 'submitted_for_approval',
            user: 'J. Martinez',
            role: 'Lab Technician',
            timestamp: '2024-09-15T10:00:00Z',
            comments: 'Draft label submitted.',
          },
          {
            id: `appr-rej-${chem.id}-2`,
            action: 'rejected',
            user: 'Dr. Sarah Vance, CSP',
            role: 'Corporate HSE Lead',
            timestamp: '2024-09-16T15:00:00Z',
            rejectionReason: 'Missing mandatory acute aquatic hazard pictogram and required eye protection specification.',
            requiredChanges: 'Assign environmental aquatic toxicity pictogram and specify indirect vent chemical goggles.',
          },
        ],
      },
    };
  }

  return {
    ...chem,
    status: 'draft',
    approvalWorkflow: {
      status: 'draft',
      history: [
        {
          id: `appr-draft-${chem.id}-1`,
          action: 'draft_created',
          user: 'J. Martinez',
          role: 'Lab Technician',
          timestamp: chem.createdAt || new Date().toISOString(),
          comments: 'Initial draft in development.',
        },
      ],
    },
  };
}

export const ChemicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Phase 2: User Role Management
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ENTERPRISE_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Label Templates state (Phase 1)
  const [templates, setTemplates] = useState<LabelTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEMPLATES;
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string>('TPL-OS-001');

  // Chemicals state
  const [chemicals, setChemicals] = useState<Chemical[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHEMICALS);
      if (saved) {
        const parsed: Chemical[] = JSON.parse(saved);
        return parsed.map(ensureChemicalWorkflow);
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_CHEMICALS.map(ensureChemicalWorkflow);
  });

  const [selectedChemicalId, setSelectedChemicalId] = useState<string | null>('chem-001');

  // Label configuration state
  const [activeLabelConfig, setActiveLabelConfig] = useState<LabelConfig>(() => {
    return {
      ...DEFAULT_LABEL_CONFIG,
      chemicalId: chemicals[0]?.id || 'chem-001',
    };
  });

  const [savedLabels, setSavedLabels] = useState<LabelConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_LABELS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // SDS records state
  const [sdsRecords, setSdsRecords] = useState<SdsRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SDS_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'sds-001',
        chemicalId: 'chem-001',
        chemicalName: 'Methanol (Industrial / Hydrate Inhibitor Grade)',
        manufacturer: 'Apex Petrochemical & Solvents LLC',
        revisionDate: '2024-10-15',
        fileName: 'Methanol_99.8_Technical_Grade_SDS_Apex.pdf',
        fileSize: '412 KB',
        uploadedAt: '2024-10-20T09:30:00Z',
        uploadedBy: 'Dr. Sarah Vance, CSP',
        status: 'verified',
      },
      {
        id: 'sds-002',
        chemicalId: 'chem-002',
        chemicalName: 'Hydrochloric Acid 32% (Well Stimulation Grade)',
        manufacturer: 'GeoWell Solutions Inc.',
        revisionDate: '2024-08-11',
        fileName: 'GeoWell_HCl_32pct_Stimulation_SDS.pdf',
        fileSize: '528 KB',
        uploadedAt: '2024-08-20T14:15:00Z',
        uploadedBy: 'Marcus Thorne, PE',
        status: 'verified',
      },
      {
        id: 'sds-003',
        chemicalId: 'chem-003',
        chemicalName: 'Triazine H2S Scavenger (Triazine 60% Solution)',
        manufacturer: 'Permian Oilfield Technologies',
        revisionDate: '2024-05-19',
        fileName: 'Triazine_H2S_Scavenger_60pct_POT.pdf',
        fileSize: '365 KB',
        uploadedAt: '2024-05-25T11:00:00Z',
        uploadedBy: 'Dr. Sarah Vance, CSP',
        status: 'verified',
      },
      {
        id: 'sds-004',
        chemicalId: 'chem-004',
        chemicalName: 'Imidazoline Corrosion Inhibitor (Oil-Soluble / Water-Dispersible)',
        manufacturer: 'IntegraChem Production Systems',
        revisionDate: '2024-03-22',
        fileName: 'IntegraChem_CI550_Imidazoline.pdf',
        fileSize: '610 KB',
        uploadedAt: '2024-04-10T16:20:00Z',
        uploadedBy: 'J. Martinez',
        status: 'extracted',
      },
    ];
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'log-001',
        timestamp: '2025-02-10T14:22:00Z',
        chemicalId: 'chem-001',
        chemicalName: 'Methanol (Industrial / Hydrate Inhibitor Grade)',
        action: 'Label Generated & Printed',
        user: 'Dr. Sarah Vance, CSP',
        role: 'HSE Lead',
        details: 'Generated 4"x6" Drum label version 1.2 with GHS, NFPA, HMIS, and CHEMTREC dispatch code.',
        type: 'label_generated',
      },
      {
        id: 'log-002',
        timestamp: '2025-02-05T11:15:00Z',
        chemicalId: 'chem-002',
        chemicalName: 'Hydrochloric Acid 32% (Well Stimulation Grade)',
        action: 'Chemical Record Approved',
        user: 'Marcus Thorne, PE',
        role: 'Operations Director',
        details: 'Approved chemical hazard classification after quarterly review with safety committee.',
        type: 'approve',
      },
      {
        id: 'log-003',
        timestamp: '2025-01-18T09:40:00Z',
        chemicalId: 'chem-004',
        chemicalName: 'Imidazoline Corrosion Inhibitor',
        action: 'Flagged for Review',
        user: 'System Compliance Agent',
        role: 'Automated Audit',
        details: 'SDS revision date older than 180 days; flagged for supplier confirmation.',
        type: 'update',
      },
    ];
  });

  // Company settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COMPANY_SETTINGS;
  });

  // Navigation & AI Review state
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [pendingAiReviewData, setPendingAiReviewData] = useState<any | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHEMICALS, JSON.stringify(chemicals));
  }, [chemicals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_LABELS, JSON.stringify(savedLabels));
  }, [savedLabels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SDS_RECORDS, JSON.stringify(sdsRecords));
  }, [sdsRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  // Template Management Actions
  const addTemplate = (data: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>) => {
    const newTpl: LabelTemplate = {
      ...data,
      id: `TPL-CST-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedCount: 0,
    };
    setTemplates((prev) => [newTpl, ...prev]);
    addAuditLog({
      chemicalName: newTpl.name,
      action: 'Template Created',
      user: newTpl.createdBy || 'HSE Specialist',
      role: 'HSE Specialist',
      details: `Created custom template ${newTpl.name} (${newTpl.id})`,
      type: 'create',
    });
    return newTpl;
  };

  const updateTemplate = (id: string, updates: Partial<LabelTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    const existing = templates.find((t) => t.id === id);
    if (existing) {
      addAuditLog({
        chemicalName: existing.name,
        action: 'Template Updated',
        user: 'HSE Specialist',
        role: 'HSE Specialist',
        details: `Updated template ${existing.name} (${id})`,
        type: 'update',
      });
    }
  };

  const duplicateTemplate = (id: string, newName?: string) => {
    const source = templates.find((t) => t.id === id) || templates[0];
    const newId = `TPL-CST-${Math.floor(100 + Math.random() * 900)}`;
    const duplicate: LabelTemplate = {
      ...source,
      id: newId,
      name: newName || `${source.name} (Custom Copy)`,
      type: 'custom',
      isSystemTemplate: false,
      status: 'active',
      version: '1.0',
      createdBy: 'Zineddine (User)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedCount: 0,
      components: { ...source.components },
    };

    setTemplates((prev) => [duplicate, ...prev]);
    addAuditLog({
      chemicalName: duplicate.name,
      action: 'Template Duplicated',
      user: 'HSE Specialist',
      role: 'HSE Specialist',
      details: `Cloned template from ${source.name} (${source.id}) into ${duplicate.id}`,
      type: 'create',
    });
    return duplicate;
  };

  const archiveTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'archived', updatedAt: new Date().toISOString() } : t))
    );
    const existing = templates.find((t) => t.id === id);
    if (existing) {
      addAuditLog({
        chemicalName: existing.name,
        action: 'Template Archived',
        user: 'HSE Specialist',
        role: 'HSE Specialist',
        details: `Archived template ${existing.name} (${id})`,
        type: 'update',
      });
    }
  };

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  // Actions
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addChemical = (data: Omit<Chemical, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChem: Chemical = {
      ...data,
      id: `chem-${Date.now()}`,
      pictograms: Array.isArray(data.pictograms) ? data.pictograms : [],
      hazardClasses: Array.isArray(data.hazardClasses) ? data.hazardClasses : [],
      hStatements: Array.isArray(data.hStatements) ? data.hStatements : [],
      pStatements: Array.isArray(data.pStatements) ? data.pStatements : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChemicals((prev) => [newChem, ...prev]);
    addAuditLog({
      chemicalId: newChem.id,
      chemicalName: newChem.productName,
      action: 'Chemical Added',
      user: 'Dr. Sarah Vance, CSP',
      role: 'EHS Specialist',
      details: `Created chemical record with status: ${newChem.status}`,
      type: 'create',
    });
    return newChem;
  };

  const updateChemical = (id: string, updates: Partial<Chemical>) => {
    setChemicals((prev) =>
      prev.map((chem) => (chem.id === id ? { ...chem, ...updates, updatedAt: new Date().toISOString() } : chem))
    );
    const chem = chemicals.find((c) => c.id === id);
    if (chem) {
      addAuditLog({
        chemicalId: id,
        chemicalName: chem.productName,
        action: 'Chemical Updated',
        user: 'Dr. Sarah Vance, CSP',
        role: 'EHS Specialist',
        details: `Updated fields: ${Object.keys(updates).join(', ')}`,
        type: 'update',
      });
    }
  };

  const deleteChemical = (id: string) => {
    const chem = chemicals.find((c) => c.id === id);
    setChemicals((prev) => prev.filter((c) => c.id !== id));
    if (chem) {
      addAuditLog({
        chemicalId: id,
        chemicalName: chem.productName,
        action: 'Chemical Deleted',
        user: 'Dr. Sarah Vance, CSP',
        role: 'EHS Lead',
        details: 'Archived / removed chemical from active operational inventory.',
        type: 'update',
      });
    }
    if (selectedChemicalId === id) {
      setSelectedChemicalId(chemicals[0]?.id || null);
    }
  };

  const approveChemical = (id: string, reviewerNotes?: string) => {
    updateChemical(id, {
      status: 'approved',
      lastReviewedDate: new Date().toISOString().split('T')[0],
      lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Lead)',
      notes: reviewerNotes || 'Human EHS specialist verified and approved.',
    });
    const chem = chemicals.find((c) => c.id === id);
    addAuditLog({
      chemicalId: id,
      chemicalName: chem ? chem.productName : 'Chemical',
      action: 'Safety Review Approved',
      user: 'Dr. Sarah Vance, CSP',
      role: 'HSE Lead',
      details: 'Chemical passed HazCom 2012 compliance review.',
      type: 'approve',
    });
  };

  // Phase 2: Dual Sign-off & Formal Approval Workflow Methods
  const submitForApproval = (chemicalId: string, notes?: string, submitter?: CurrentUser) => {
    const actingUser = submitter || currentUser;
    const now = new Date().toISOString();
    const historyEntry = {
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action: 'submitted_for_approval' as const,
      user: actingUser.name,
      role: actingUser.roleTitle,
      timestamp: now,
      comments: notes || 'Submitted for safety review and sign-off.',
    };

    setChemicals((prev) =>
      prev.map((c) => {
        if (c.id !== chemicalId) return c;
        const prevWf = c.approvalWorkflow;
        const updatedHistory = [historyEntry, ...(prevWf?.history || [])];
        return {
          ...c,
          status: 'under_review',
          updatedAt: now,
          approvalWorkflow: {
            status: 'under_review',
            submittedBy: actingUser.name,
            submittedAt: now,
            submissionNotes: notes || '',
            history: updatedHistory,
          },
        };
      })
    );

    const chem = chemicals.find((c) => c.id === chemicalId);
    addAuditLog({
      chemicalId,
      chemicalName: chem ? chem.productName : 'Chemical',
      action: 'Submitted for Safety Approval',
      user: actingUser.name,
      role: actingUser.roleTitle,
      details: notes || 'Submitted for EHS compliance verification and digital sign-off.',
      type: 'update',
    });
  };

  const approveChemicalWorkflow = (
    chemicalId: string,
    reviewerNotes: string,
    checklist: ComplianceChecklist,
    reviewer: CurrentUser
  ) => {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const signatureHash = `OS-SIG-${chemicalId.toUpperCase().replace('CHEM-', '')}-2026`;

    const historyEntry = {
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action: 'approved' as const,
      user: reviewer.name,
      role: reviewer.roleTitle,
      timestamp: now,
      comments: reviewerNotes || 'Approved in compliance with OSHA HazCom 2012 / GHS Rev 10.',
      complianceChecklist: checklist,
      signatureHash,
    };

    setChemicals((prev) =>
      prev.map((c) => {
        if (c.id !== chemicalId) return c;
        const prevWf = c.approvalWorkflow;
        const updatedHistory = [historyEntry, ...(prevWf?.history || [])];
        return {
          ...c,
          status: 'approved',
          lastReviewedDate: today,
          lastReviewedBy: `${reviewer.name} (${reviewer.roleTitle})`,
          updatedAt: now,
          approvalWorkflow: {
            ...prevWf,
            status: 'approved',
            reviewerName: reviewer.name,
            reviewerRole: reviewer.roleTitle,
            reviewedAt: now,
            approvalComments: reviewerNotes,
            signatureHash,
            checklist,
            history: updatedHistory,
          },
        };
      })
    );

    const chem = chemicals.find((c) => c.id === chemicalId);
    addAuditLog({
      chemicalId,
      chemicalName: chem ? chem.productName : 'Chemical',
      action: 'Safety Review & Sign-Off Approved',
      user: reviewer.name,
      role: reviewer.roleTitle,
      details: `Digitally authorized with signature hash ${signatureHash}. Ready for operational field use.`,
      type: 'approve',
    });
  };

  const rejectChemicalWorkflow = (
    chemicalId: string,
    rejectionReason: string,
    requiredChanges: string,
    reviewer: CurrentUser
  ) => {
    const now = new Date().toISOString();
    const historyEntry = {
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action: 'rejected' as const,
      user: reviewer.name,
      role: reviewer.roleTitle,
      timestamp: now,
      comments: rejectionReason,
      rejectionReason,
      requiredChanges,
    };

    setChemicals((prev) =>
      prev.map((c) => {
        if (c.id !== chemicalId) return c;
        const prevWf = c.approvalWorkflow;
        const updatedHistory = [historyEntry, ...(prevWf?.history || [])];
        return {
          ...c,
          status: 'rejected',
          updatedAt: now,
          approvalWorkflow: {
            ...prevWf,
            status: 'rejected',
            reviewerName: reviewer.name,
            reviewerRole: reviewer.roleTitle,
            reviewedAt: now,
            rejectionReason,
            requiredChanges,
            history: updatedHistory,
          },
        };
      })
    );

    const chem = chemicals.find((c) => c.id === chemicalId);
    addAuditLog({
      chemicalId,
      chemicalName: chem ? chem.productName : 'Chemical',
      action: 'Safety Review Rejected',
      user: reviewer.name,
      role: reviewer.roleTitle,
      details: `Revisions requested: ${rejectionReason}`,
      type: 'update',
    });
  };

  const reopenChemicalDraft = (chemicalId: string, reason?: string) => {
    const now = new Date().toISOString();
    const historyEntry = {
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action: 'reopened' as const,
      user: currentUser.name,
      role: currentUser.roleTitle,
      timestamp: now,
      comments: reason || 'Reopened as editable draft for specification adjustments.',
    };

    setChemicals((prev) =>
      prev.map((c) => {
        if (c.id !== chemicalId) return c;
        const prevWf = c.approvalWorkflow;
        const updatedHistory = [historyEntry, ...(prevWf?.history || [])];
        return {
          ...c,
          status: 'draft',
          updatedAt: now,
          approvalWorkflow: {
            ...prevWf,
            status: 'draft',
            history: updatedHistory,
          },
        };
      })
    );

    const chem = chemicals.find((c) => c.id === chemicalId);
    addAuditLog({
      chemicalId,
      chemicalName: chem ? chem.productName : 'Chemical',
      action: 'Label Reopened as Draft',
      user: currentUser.name,
      role: currentUser.roleTitle,
      details: reason || 'Reopened for updating.',
      type: 'update',
    });
  };

  const saveLabel = (config: LabelConfig) => {
    setSavedLabels((prev) => {
      const idx = prev.findIndex((l) => l.id === config.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = config;
        return next;
      }
      return [config, ...prev];
    });

    const chem = chemicals.find((c) => c.id === config.chemicalId);
    addAuditLog({
      chemicalId: config.chemicalId,
      chemicalName: chem ? chem.productName : 'Unknown Chemical',
      action: 'Label Saved',
      user: 'Dr. Sarah Vance, CSP',
      role: 'EHS Specialist',
      details: `Saved ${config.labelSize} label configuration (v${config.version}) for batch ${config.batchNumber}`,
      type: 'label_generated',
    });
  };

  const createNewVersion = (chemicalId: string, baseVersion: string) => {
    const vNum = parseFloat(baseVersion) || 1.0;
    const nextVersion = (vNum + 0.1).toFixed(1);
    updateChemical(chemicalId, { version: nextVersion });
    const chem = chemicals.find((c) => c.id === chemicalId);
    addAuditLog({
      chemicalId,
      chemicalName: chem ? chem.productName : 'Chemical',
      action: 'Version Bump',
      user: 'Dr. Sarah Vance, CSP',
      role: 'EHS Specialist',
      details: `Created new label version v${nextVersion} (migrated from v${baseVersion})`,
      type: 'version_bump',
    });
    return nextVersion;
  };

  const addSdsRecord = (record: Omit<SdsRecord, 'id' | 'uploadedAt'>) => {
    const newRecord: SdsRecord = {
      ...record,
      id: `sds-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setSdsRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateCompanySettings = (updates: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...updates }));
    addAuditLog({
      chemicalName: 'System Configuration',
      action: 'Company Settings Updated',
      user: 'Dr. Sarah Vance, CSP',
      role: 'Administrator',
      details: `Modified facility settings and compliance options`,
      type: 'update',
    });
  };

  const startAiReview = (extractedData: any, rawSdsText: string, fileName: string) => {
    setPendingAiReviewData({
      extracted: extractedData,
      rawSdsText,
      fileName,
      startedAt: new Date().toISOString(),
    });
    setCurrentView('ai_review');
  };

  const selectedChemical = chemicals.find((c) => c.id === selectedChemicalId) || chemicals[0] || null;

  return (
    <ChemicalContext.Provider
      value={{
        chemicals,
        selectedChemicalId,
        selectedChemical,
        setSelectedChemicalId,
        addChemical,
        updateChemical,
        deleteChemical,
        approveChemical,
        // Phase 2: Role Management & Formal Approval Workflow
        currentUser,
        setCurrentUser,
        submitForApproval,
        approveChemicalWorkflow,
        rejectChemicalWorkflow,
        reopenChemicalDraft,

        activeLabelConfig,
        setActiveLabelConfig,
        savedLabels,
        saveLabel,
        createNewVersion,
        // Template Management (Phase 1)
        templates,
        activeTemplateId,
        activeTemplate,
        setActiveTemplateId,
        addTemplate,
        updateTemplate,
        duplicateTemplate,
        archiveTemplate,

        sdsRecords,
        addSdsRecord,
        auditLogs,
        addAuditLog,
        companySettings,
        updateCompanySettings,
        currentView,
        setCurrentView,
        pendingAiReviewData,
        setPendingAiReviewData,
        startAiReview,
      }}
    >
      {children}
    </ChemicalContext.Provider>
  );
};

export const useChemicals = () => {
  const context = useContext(ChemicalContext);
  if (!context) {
    throw new Error('useChemicals must be used within a ChemicalProvider');
  }
  return context;
};
