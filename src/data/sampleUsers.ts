import { CurrentUser, ComplianceChecklist } from '../types';

export const ENTERPRISE_USERS: CurrentUser[] = [
  {
    id: 'usr-001',
    name: 'Dr. Sarah Vance, CSP',
    role: 'hse_lead',
    roleTitle: 'Corporate HSE Lead & Safety Specialist',
    department: 'Corporate HSE & Chemical Safety Management',
    email: 'sarah.vance@oilserv.com',
  },
  {
    id: 'usr-002',
    name: 'Marcus Thorne, PE',
    role: 'compliance_director',
    roleTitle: 'Operations & Regulatory Compliance Director',
    department: 'Global Operations & Compliance Directorate',
    email: 'marcus.thorne@oilserv.com',
  },
  {
    id: 'usr-003',
    name: 'J. Martinez',
    role: 'preparer',
    roleTitle: 'Lab Technician & Chemical Safety Preparer',
    department: 'Drilling Fluids & Well Services Lab',
    email: 'j.martinez@oilserv.com',
  },
];

export const DEFAULT_COMPLIANCE_CHECKLIST: ComplianceChecklist = {
  productIdentification: true,
  ghsPictogramsAssigned: true,
  signalWordSelected: true,
  hazardStatementsAccurate: true,
  precautionaryStatementsVerified: true,
  ppeRequirementsSpecified: true,
  emergencyPhoneActive: true,
  sdsRevisionLinked: true,
};
