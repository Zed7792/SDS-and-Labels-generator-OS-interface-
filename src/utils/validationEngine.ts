import { Chemical, ValidationItem, ValidationStatus } from '../types';

export interface ValidationSummary {
  items: ValidationItem[];
  overallStatus: ValidationStatus;
  completeCount: number;
  missingCount: number;
  requiresVerificationCount: number;
  canPublish: boolean;
  complianceNotice: string;
}

export function validateChemicalLabel(chemical: Chemical | null): ValidationSummary {
  const items: ValidationItem[] = [];

  if (!chemical) {
    return {
      items: [],
      overallStatus: 'missing',
      completeCount: 0,
      missingCount: 11,
      requiresVerificationCount: 0,
      canPublish: false,
      complianceNotice: 'No chemical selected for label generation.',
    };
  }

  // 1. Product Identifier
  if (chemical.productName && chemical.productName.trim().length > 2) {
    items.push({
      id: 'val-prod-id',
      category: 'GHS Core Identifier',
      field: 'Product Identifier',
      status: 'complete',
      message: 'Product name and chemical identifier explicitly declared.',
      valueDescription: chemical.productName,
    });
  } else {
    items.push({
      id: 'val-prod-id',
      category: 'GHS Core Identifier',
      field: 'Product Identifier',
      status: 'missing',
      message: 'Mandatory product identifier is missing or blank.',
    });
  }

  // 2. Signal Word
  if (chemical.signalWord === 'DANGER' || chemical.signalWord === 'WARNING') {
    items.push({
      id: 'val-signal-word',
      category: 'GHS Core Identifier',
      field: 'Signal Word',
      status: 'complete',
      message: `Standard GHS signal word '${chemical.signalWord}' assigned.`,
      valueDescription: chemical.signalWord,
    });
  } else if (chemical.signalWord === 'NONE') {
    items.push({
      id: 'val-signal-word',
      category: 'GHS Core Identifier',
      field: 'Signal Word',
      status: 'requires_verification',
      message: 'Signal word is set to NONE. Verify if product is non-hazardous under OSHA HazCom.',
      valueDescription: 'NONE (Non-classified)',
    });
  } else {
    items.push({
      id: 'val-signal-word',
      category: 'GHS Core Identifier',
      field: 'Signal Word',
      status: 'missing',
      message: 'Signal word has not been defined.',
    });
  }

  // 3. GHS Pictograms
  if (chemical.pictograms && chemical.pictograms.length > 0) {
    items.push({
      id: 'val-pictograms',
      category: 'GHS Visual Warnings',
      field: 'GHS Pictograms',
      status: 'complete',
      message: `${chemical.pictograms.length} standard GHS diamond pictogram(s) configured.`,
      valueDescription: chemical.pictograms.join(', '),
    });
  } else if (chemical.signalWord === 'DANGER' || chemical.signalWord === 'WARNING') {
    items.push({
      id: 'val-pictograms',
      category: 'GHS Visual Warnings',
      field: 'GHS Pictograms',
      status: 'missing',
      message: 'Product is classified as hazardous but has no GHS pictograms assigned.',
    });
  } else {
    items.push({
      id: 'val-pictograms',
      category: 'GHS Visual Warnings',
      field: 'GHS Pictograms',
      status: 'requires_verification',
      message: 'No pictograms assigned. Confirm whether chemical hazards require pictograms.',
    });
  }

  // 4. H-statements
  if (chemical.hStatements && chemical.hStatements.length > 0) {
    items.push({
      id: 'val-h-statements',
      category: 'GHS Hazard Declarations',
      field: 'H-Statements (Hazard)',
      status: 'complete',
      message: `${chemical.hStatements.length} controlled GHS hazard statement(s) populated.`,
      valueDescription: `${chemical.hStatements.length} statements`,
    });
  } else if (chemical.signalWord === 'DANGER' || chemical.signalWord === 'WARNING') {
    items.push({
      id: 'val-h-statements',
      category: 'GHS Hazard Declarations',
      field: 'H-Statements (Hazard)',
      status: 'missing',
      message: 'Mandatory hazard statements are missing for hazardous chemical.',
    });
  } else {
    items.push({
      id: 'val-h-statements',
      category: 'GHS Hazard Declarations',
      field: 'H-Statements (Hazard)',
      status: 'requires_verification',
      message: 'No H-statements entered. Verify non-hazard classification.',
    });
  }

  // 5. P-statements
  if (chemical.pStatements && chemical.pStatements.length > 0) {
    items.push({
      id: 'val-p-statements',
      category: 'GHS Hazard Declarations',
      field: 'P-Statements (Precautionary)',
      status: 'complete',
      message: `${chemical.pStatements.length} precautionary statement(s) (Prevention, Response, Storage, Disposal).`,
      valueDescription: `${chemical.pStatements.length} statements`,
    });
  } else {
    items.push({
      id: 'val-p-statements',
      category: 'GHS Hazard Declarations',
      field: 'P-Statements (Precautionary)',
      status: 'missing',
      message: 'Mandatory GHS precautionary statements are missing.',
    });
  }

  // 6. Manufacturer Information
  if (chemical.manufacturer && chemical.manufacturer.trim().length > 3) {
    items.push({
      id: 'val-manufacturer',
      category: 'Entity Responsibility',
      field: 'Manufacturer / Supplier',
      status: 'complete',
      message: 'Responsible legal supplier / manufacturer is identified.',
      valueDescription: chemical.manufacturer,
    });
  } else {
    items.push({
      id: 'val-manufacturer',
      category: 'Entity Responsibility',
      field: 'Manufacturer / Supplier',
      status: 'missing',
      message: 'Manufacturer or responsible party name is required by OSHA HazCom.',
    });
  }

  // 7. Emergency Contact
  if (chemical.emergency?.emergencyContact || chemical.emergency?.emergencyPhone) {
    const contactStr = chemical.emergency.emergencyPhone || chemical.emergency.emergencyContact;
    items.push({
      id: 'val-emergency',
      category: 'Emergency Dispatch',
      field: 'Emergency Contact',
      status: 'complete',
      message: '24/7 Emergency response telephone number provided.',
      valueDescription: contactStr,
    });
  } else {
    items.push({
      id: 'val-emergency',
      category: 'Emergency Dispatch',
      field: 'Emergency Contact',
      status: 'missing',
      message: '24-hour emergency response hotline is mandatory for transport & handling labels.',
    });
  }

  // 8. NFPA 704 Information
  if (chemical.nfpa && typeof chemical.nfpa.health === 'number' && typeof chemical.nfpa.flammability === 'number') {
    const isComplete = chemical.nfpa.health > 0 || chemical.nfpa.flammability > 0 || chemical.nfpa.instability > 0;
    items.push({
      id: 'val-nfpa',
      category: 'Industrial Standard Ratings',
      field: 'NFPA 704 Rating',
      status: isComplete ? 'complete' : 'requires_verification',
      message: isComplete
        ? `NFPA ratings specified (H:${chemical.nfpa.health} F:${chemical.nfpa.flammability} I:${chemical.nfpa.instability} S:${chemical.nfpa.special || 'None'}).`
        : 'NFPA 704 values are all zero; verify if accurate or unpopulated.',
      valueDescription: `H:${chemical.nfpa.health} F:${chemical.nfpa.flammability} I:${chemical.nfpa.instability}`,
    });
  } else {
    items.push({
      id: 'val-nfpa',
      category: 'Industrial Standard Ratings',
      field: 'NFPA 704 Rating',
      status: 'missing',
      message: 'NFPA 704 diamond ratings are incomplete.',
    });
  }

  // 9. HMIS Information
  if (chemical.hmis && typeof chemical.hmis.health === 'number' && chemical.hmis.ppeCode) {
    items.push({
      id: 'val-hmis',
      category: 'Industrial Standard Ratings',
      field: 'HMIS Rating & PPE Code',
      status: 'complete',
      message: `HMIS III rating active (H:${chemical.hmis.health} F:${chemical.hmis.flammability} P:${chemical.hmis.physicalHazard} PPE:${chemical.hmis.ppeCode}).`,
      valueDescription: `PPE Code ${chemical.hmis.ppeCode}`,
    });
  } else {
    items.push({
      id: 'val-hmis',
      category: 'Industrial Standard Ratings',
      field: 'HMIS Rating & PPE Code',
      status: 'requires_verification',
      message: 'HMIS rating or personal protection letter code is incomplete.',
    });
  }

  // 10. SDS Availability
  if (chemical.sdsRevisionDate || chemical.sdsId) {
    items.push({
      id: 'val-sds-avail',
      category: 'Safety Data Documentation',
      field: 'SDS Availability',
      status: 'complete',
      message: 'Safety Data Sheet record is linked and available in registry.',
      valueDescription: chemical.sdsId ? `ID: ${chemical.sdsId}` : 'Document Linked',
    });
  } else {
    items.push({
      id: 'val-sds-avail',
      category: 'Safety Data Documentation',
      field: 'SDS Availability',
      status: 'missing',
      message: 'No active Safety Data Sheet (SDS) document associated with this chemical.',
    });
  }

  // 11. SDS Revision Date
  if (chemical.sdsRevisionDate) {
    const revYear = parseInt(chemical.sdsRevisionDate.substring(0, 4), 10);
    const currentYear = new Date().getFullYear();
    const isOld = !isNaN(revYear) && currentYear - revYear > 3;

    if (isOld) {
      items.push({
        id: 'val-sds-date',
        category: 'Safety Data Documentation',
        field: 'SDS Revision Date',
        status: 'requires_verification',
        message: `SDS revision date (${chemical.sdsRevisionDate}) exceeds 3 years. Verification with manufacturer recommended under OSHA 1910.1200.`,
        valueDescription: chemical.sdsRevisionDate,
      });
    } else {
      items.push({
        id: 'val-sds-date',
        category: 'Safety Data Documentation',
        field: 'SDS Revision Date',
        status: 'complete',
        message: `SDS revision date is current (${chemical.sdsRevisionDate}).`,
        valueDescription: chemical.sdsRevisionDate,
      });
    }
  } else {
    items.push({
      id: 'val-sds-date',
      category: 'Safety Data Documentation',
      field: 'SDS Revision Date',
      status: 'missing',
      message: 'SDS revision date is missing from chemical record.',
    });
  }

  const completeCount = items.filter((i) => i.status === 'complete').length;
  const missingCount = items.filter((i) => i.status === 'missing').length;
  const requiresVerificationCount = items.filter((i) => i.status === 'requires_verification').length;

  let overallStatus: ValidationStatus = 'complete';
  if (missingCount > 0) {
    overallStatus = 'missing';
  } else if (requiresVerificationCount > 0) {
    overallStatus = 'requires_verification';
  }

  const canPublish = missingCount === 0;

  return {
    items,
    overallStatus,
    completeCount,
    missingCount,
    requiresVerificationCount,
    canPublish,
    complianceNotice:
      'NOTICE: Chemical Label Studio facilitates industrial HazCom compliance. Per OSHA and international standards, human EHS specialist verification is required before operational affixing. Never claim that an AI-generated label is legally compliant automatically.',
  };
}
