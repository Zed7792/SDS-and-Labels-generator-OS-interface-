export type GhsSignalWord = 'DANGER' | 'WARNING' | 'NONE';

export type GhsPictogramId =
  | 'flame'
  | 'flame-over-circle'
  | 'exploding-bomb'
  | 'corrosion'
  | 'gas-cylinder'
  | 'skull-and-crossbones'
  | 'exclamation-mark'
  | 'health-hazard'
  | 'environment';

export type ChemicalStatus = 'approved' | 'requires_review' | 'under_review' | 'draft' | 'rejected' | 'archived';

export type LabelSize = '4x6' | '3x5' | '2x4' | '8.5x11' | 'letter';

export type ValidationStatus = 'complete' | 'missing' | 'requires_verification';

export interface GhsStatement {
  code: string;
  statement: string;
  category?: string;
  type?: 'hazard' | 'general' | 'prevention' | 'response' | 'storage' | 'disposal' | 'General' | 'Health' | 'Physical' | 'Environmental' | 'Prevention' | 'Response' | 'Storage' | 'Disposal';
}

export type HStatement = GhsStatement;
export type PStatement = GhsStatement;

export interface NfpaRating {
  health: number; // 0-4
  flammability: number; // 0-4
  instability: number; // 0-4
  special: string; // '', 'W', 'OX', 'SA', 'ACID', 'ALK', 'COR'
}

export interface HmisRating {
  health: number; // 0-4
  isChronic?: boolean; // chronic health hazard asterisk
  flammability: number; // 0-4
  physicalHazard: number; // 0-4
  ppeCode: string; // 'A' through 'K', 'X'
}

export interface PpeRequirements {
  eye: string;
  hand: string;
  respiratory: string;
  body: string;
  foot: string;
}

export interface EmergencyInfo {
  firstAidInhalation: string;
  firstAidSkin: string;
  firstAidEye: string;
  firstAidIngestion: string;
  fireResponse: string;
  spillResponse: string;
  storageHandling: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface Chemical {
  id: string;
  productName: string;
  manufacturer: string;
  productCode: string;
  casNumber: string;
  physicalState: 'Liquid' | 'Gas' | 'Solid' | 'Slurry' | 'Powder' | 'Aerosol';
  sdsRevisionDate: string;
  sdsId?: string;
  status: ChemicalStatus;
  lastReviewedDate: string;
  lastReviewedBy: string;
  createdAt: string;
  updatedAt: string;

  // GHS Classification
  signalWord: GhsSignalWord;
  pictograms: GhsPictogramId[];
  hazardClasses: string[];
  hStatements: GhsStatement[];
  pStatements: GhsStatement[];

  // Industrial Standard Ratings
  nfpa: NfpaRating;
  hmis: HmisRating;

  // Personal Protective Equipment
  ppe: PpeRequirements;

  // Emergency Response & First Aid
  emergency: EmergencyInfo;

  // Extended Oil & Gas / Enterprise Fields
  chemicalName?: string;
  osCode?: string;
  quantity?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  substancesIdentity?: string;
  supplierAddress?: string;
  fromSdsLibrary?: boolean;

  // Notes and Compliance
  notes?: string;
  version?: string;
  aiExtracted?: boolean;

  // Phase 2: Approval Workflow
  approvalWorkflow?: ApprovalWorkflow;
}

export interface LabelConfig {
  id: string;
  chemicalId: string;
  version: string;
  labelSize: LabelSize;
  orientation: 'landscape' | 'portrait';
  batchNumber: string;
  containerSize?: string;
  fillDate: string;
  expiryDate?: string;
  showGhs: boolean;
  showNfpa: boolean;
  showHmis: boolean;
  showPpe: boolean;
  showEmergency: boolean;
  showQr: boolean;
  showBatchLot: boolean;
  customHeader?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ValidationItem {
  id: string;
  category: string;
  field: string;
  status: ValidationStatus;
  message: string;
  valueDescription?: string;
}

export interface SdsRecord {
  id: string;
  chemicalId?: string;
  chemicalName: string;
  manufacturer: string;
  revisionDate: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'verified' | 'extracted' | 'pending';
  rawText?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  chemicalId?: string;
  chemicalName: string;
  action: string;
  user: string;
  role: string;
  details: string;
  type: 'create' | 'update' | 'ai_extract' | 'approve' | 'reject' | 'label_generated' | 'version_bump';
}

export interface CompanySettings {
  companyName: string;
  facilityName: string;
  facilityId: string;
  facilityAddress: string;
  ehsDepartment: string;
  emergencyHotline24: string;
  chemtrecContractNumber: string;
  defaultLabelSize: LabelSize;
  strictOshaValidation: boolean;
  requireDualSignoff: boolean;
}

export interface ExtractedFieldComparison {
  key: string;
  section: string;
  label: string;
  value: any;
  status: 'extracted' | 'not_found' | 'modified';
  originalValue?: any;
}

// ==========================================
// PHASE 1: TEMPLATES, SIZES & ORIENTATION
// ==========================================

export type LabelOrientation = 'landscape' | 'portrait';
export type LabelDimensionUnit = 'in' | 'mm' | 'cm';
export type LabelSizePreset = '6x4' | '4x3' | '8x6' | '10x8' | 'a6' | 'a5' | 'a4' | 'custom';

export type TemplateType =
  | 'oilserv_standard'
  | 'standard_ghs'
  | 'small_container'
  | 'drum'
  | 'ibc_tank'
  | 'secondary_container'
  | 'waste'
  | 'custom';

export type TemplateStatus = 'active' | 'draft' | 'archived';

export interface TemplateComponentsConfig {
  companyLogo: boolean;
  productName: boolean;
  chemicalName: boolean;
  casNumber: boolean;
  signalWord: boolean;
  ghsPictograms: boolean;
  hazardStatements: boolean;
  precautionaryStatements: boolean;
  ppe: boolean;
  nfpaDiamond: boolean;
  hmis: boolean;
  supplier: boolean;
  emergencyPhone: boolean;
  batchLot: boolean;
  manufacturingDate: boolean;
  expiryDate: boolean;
  qrCode: boolean;
  qrCaption: boolean;
  sdsRevision: boolean;
  emergencyInfo: boolean;
  customText: boolean;
  controlledFooter: boolean;
}

export interface LabelTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  sizePreset: LabelSizePreset;
  width: number;
  height: number;
  unit: LabelDimensionUnit;
  orientation: LabelOrientation;
  isSystemTemplate: boolean;
  status: TemplateStatus;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usedCount: number;
  components: TemplateComponentsConfig;
}

// ==========================================
// WORKFLOW & REVISION CONTROL (PHASES 2-4)
// ==========================================

export type LabelStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'SUPERSEDED'
  | 'OBSOLETE';

export interface ComplianceChecklist {
  productIdentification: boolean;
  ghsPictogramsAssigned: boolean;
  signalWordSelected: boolean;
  hazardStatementsAccurate: boolean;
  precautionaryStatementsVerified: boolean;
  ppeRequirementsSpecified: boolean;
  emergencyPhoneActive: boolean;
  sdsRevisionLinked: boolean;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'draft_created' | 'submitted_for_approval' | 'approved' | 'rejected' | 'reopened';
  user: string;
  role: string;
  timestamp: string;
  comments?: string;
  rejectionReason?: string;
  requiredChanges?: string;
  complianceChecklist?: ComplianceChecklist;
  signatureHash?: string;
}

export interface ApprovalWorkflow {
  status: ChemicalStatus;
  submittedBy?: string;
  submittedAt?: string;
  submissionNotes?: string;
  reviewerName?: string;
  reviewerRole?: string;
  reviewedAt?: string;
  approvalComments?: string;
  rejectionReason?: string;
  requiredChanges?: string;
  signatureHash?: string;
  checklist?: ComplianceChecklist;
  history: ApprovalHistoryEntry[];
}

export type UserRole = 'preparer' | 'hse_lead' | 'compliance_director' | 'admin';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  email: string;
}

export interface LabelRevision {
  id: string;
  labelId: string;
  revisionNumber: string; // e.g. 'REV 00', 'REV 01'
  version: string; // e.g. '1.0', '2.0'
  status: LabelStatus;
  changeSummary?: string;
  chemicalDataSnapshot: any;
  layoutSnapshot: any;
  createdBy: string;
  createdAt: string;
  submittedBy?: string;
  submittedAt?: string;
  reviewer?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalComment?: string;
  rejectionReason?: string;
}

export interface LabelRecord {
  id: string;
  labelId: string; // Permanent formatted ID: e.g. LBL-CEN-000241
  chemicalId: string;
  productName: string;
  chemicalName: string;
  templateId: string;
  currentRevisionId: string;
  currentRevision: string;
  status: LabelStatus;
  size: string;
  orientation: LabelOrientation;
  sdsRevision: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface MixtureComponent {
  id: string;
  substanceId?: string;
  substanceName: string;
  casNumber?: string;
  concentration: number;
  hazardClasses?: string[];
  pictograms?: GhsPictogramId[];
}

export interface ChemicalMixture {
  id: string;
  mixtureName: string;
  casNumber?: string;
  oilservCode?: string;
  intendedUse?: string;
  description?: string;
  supplier?: string;
  supplierAddress?: string;
  emergencyPhone?: string;
  components: MixtureComponent[];
  totalConcentration: number;
  status: ChemicalStatus;
  createdAt: string;
  updatedAt: string;
}

export type AppView =
  | 'dashboard'
  | 'library'
  | 'details'
  | 'add_chemical'
  | 'templates'
  | 'label_studio'
  | 'sds_library'
  | 'settings'
  | 'ai_review'
  | 'workflow_submission'
  | 'create_hub'
  | 'create_mixture'
  | 'add_product_basic'
  | 'create_sds'
  | 'compatibility_checker';


