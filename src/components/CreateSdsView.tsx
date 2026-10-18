import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  FlaskConical,
  HeartPulse,
  Flame,
  CloudRain,
  Package,
  Shield,
  TestTube,
  Zap,
  Skull,
  Sprout,
  Trash2,
  Truck,
  Scale,
  Info,
  CheckCircle2,
  Check,
  Send,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Download,
  Printer,
  X,
  FileCheck,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  Save,
  HelpCircle,
  QrCode,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  AlertOctagon,
  Copy,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogram } from './GhsPictogram';
import { GhsPictogramId } from '../types';

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

export type RegulatoryFramework = 'OSHA_HAZCOM' | 'UN_GHS' | 'EU_REACH';
export type PropertyStatus = 'Available' | 'Not available' | 'Not applicable' | 'Not determined';
export type SdsDataOrigin = 'Supplier SDS Original' | 'Laboratory Verified' | 'HSE Formulated';
export type OilGasApplication =
  | 'Well Servicing'
  | 'Drilling Fluids / Mud Support'
  | 'Cementing Operations'
  | 'Acidizing & Well Stimulation'
  | 'Chemical Storage & Tank Farm'
  | 'Industrial Maintenance & Rig Wash';

export interface IngredientEntry {
  id: string;
  name: string;
  casNumber: string;
  ecNumber: string;
  concentration: string;
  classification: string;
  scl: string;
  isTradeSecret: boolean;
}

export interface ExposureLimitEntry {
  id: string;
  substance: string;
  limitType: 'OSHA PEL' | 'ACGIH TLV' | 'NIOSH REL' | 'EU OEL' | 'Other';
  value: string;
  unit: 'ppm' | 'mg/m³' | 'mg/l' | 'fibers/cm³';
  jurisdiction: string;
}

export interface PhysicalPropertyEntry {
  id: string;
  name: string;
  status: PropertyStatus;
  value: string;
  unit: string;
  remarks: string;
}

export interface TransportFrameworkEntry {
  framework: 'DOT (49 CFR)' | 'ADR / RID' | 'IMDG Code' | 'IATA / ICAO';
  unNumber: string;
  shippingName: string;
  hazardClass: string;
  packingGroup: string;
  marinePollutant: boolean;
  specialPrecautions: string;
}

// Incompatibility Matrix Reference Data
export interface IncompatibilityGroup {
  name: string;
  examples: string[];
  incompatibleWith: string[];
  hazardOutcome: string;
}

const INCOMPATIBILITY_GROUPS: IncompatibilityGroup[] = [
  {
    name: 'Strong Mineral Acids (HCl, H2SO4, HF)',
    examples: ['Hydrochloric Acid 15-28%', 'Hydrofluoric Acid', 'Sulfuric Acid'],
    incompatibleWith: ['Strong Caustics / Bases', 'Cyanides', 'Sulfides', 'Hypochlorites', 'Active Metals (Zn, Al, Mg)'],
    hazardOutcome: 'Violent exothermic reaction, boiling/spattering, generation of lethal toxic gases (HCN, H2S, Cl2, H2).',
  },
  {
    name: 'Strong Caustics / Bases (NaOH, KOH)',
    examples: ['Sodium Hydroxide 50%', 'Potassium Hydroxide', 'Ammonium Hydroxide'],
    incompatibleWith: ['Strong Mineral Acids', 'Chlorinated Hydrocarbons', 'Aluminum / Zinc Equipment', 'Organic Peroxides'],
    hazardOutcome: 'Extreme heat generation, generation of hydrogen gas, corrosive spatter.',
  },
  {
    name: 'Strong Oxidizers (H2O2, Chlorates, Nitrates)',
    examples: ['Hydrogen Peroxide 35-50%', 'Sodium Hypochlorite', 'Ammonium Nitrate'],
    incompatibleWith: ['Flammable Liquids & Solvents', 'Hydrazine derivatives', 'Powdered Metals', 'Sulfur'],
    hazardOutcome: 'Spontaneous combustion, rapid acceleration of fires, explosive violent decomposition.',
  },
  {
    name: 'Flammable Hydrocarbons & Solvents',
    examples: ['Diesel Fuel', 'Xylene', 'Toluene', 'Methanol', 'Acetone'],
    incompatibleWith: ['Strong Oxidizers', 'Concentrated Nitric Acid', 'Liquid Oxygen', 'Halogens'],
    hazardOutcome: 'Fire, vapor flash explosions, violent combustion.',
  },
  {
    name: 'Corrosion Inhibitor Amines & Surfactants',
    examples: ['Quaternary Ammonium Compounds', 'Ethoxylated Alkylphenols', 'Fatty Acid Imidazolines'],
    incompatibleWith: ['Strong Anionic polymers', 'Strong Oxidizers', 'Concentrated Nitric Acid'],
    hazardOutcome: 'Phase separation, precipitation, loss of corrosion inhibition, exothermic decomposition.',
  },
];

// All Available GHS Pictograms
const ALL_GHS_PICTOGRAMS: { id: GhsPictogramId; name: string }[] = [
  { id: 'flame', name: 'Flammable (GHS02)' },
  { id: 'corrosion', name: 'Corrosive (GHS05)' },
  { id: 'exclamation-mark', name: 'Harmful / Irritant (GHS07)' },
  { id: 'health-hazard', name: 'Health Hazard / Carcinogen (GHS08)' },
  { id: 'environment', name: 'Environmental Hazard (GHS09)' },
  { id: 'gas-cylinder', name: 'Gas Under Pressure (GHS04)' },
  { id: 'skull-and-crossbones', name: 'Acute Toxicity / Fatal (GHS06)' },
  { id: 'flame-over-circle', name: 'Oxidizer (GHS03)' },
  { id: 'exploding-bomb', name: 'Explosive (GHS01)' },
];

// Physical properties standard checklist
const DEFAULT_PHYSICAL_PROPERTIES: PhysicalPropertyEntry[] = [
  { id: 'phys_state', name: 'Physical state', status: 'Available', value: 'Liquid', unit: '', remarks: 'Mobile homogeneous liquid at 20 °C' },
  { id: 'phys_colour', name: 'Colour', status: 'Available', value: 'Dark Amber to Brown', unit: '', remarks: 'Clear, no suspended particulate' },
  { id: 'phys_odour', name: 'Odour', status: 'Available', value: 'Characteristic Pungent Amine', unit: '', remarks: 'Noticeable threshold ~ 1.5 ppm' },
  { id: 'phys_ph', name: 'pH', status: 'Available', value: '2.5 - 3.5', unit: '', remarks: '10% aqueous dispersion at 25 °C' },
  { id: 'phys_melting', name: 'Melting point / freezing point', status: 'Available', value: '-15', unit: '°C', remarks: 'Pour point tested via ASTM D97' },
  { id: 'phys_boiling', name: 'Boiling point / boiling range', status: 'Available', value: '110 - 145', unit: '°C', remarks: 'Initial boiling point ASTM D86' },
  { id: 'phys_flash', name: 'Flash point', status: 'Available', value: '38', unit: '°C', remarks: 'Pensky-Martens Closed Cup (ASTM D93)' },
  { id: 'phys_flammability', name: 'Flammability (solid, gas)', status: 'Not applicable', value: '', unit: '', remarks: 'Liquid formulation' },
  { id: 'phys_flam_limits', name: 'Lower and upper explosion / flammability limits', status: 'Available', value: 'LEL 1.2% | UEL 7.8%', unit: '% vol', remarks: 'Vapor phase in air' },
  { id: 'phys_autoignition', name: 'Auto-ignition temperature', status: 'Available', value: '390', unit: '°C', remarks: 'DIN 51794' },
  { id: 'phys_decomposition', name: 'Decomposition temperature', status: 'Available', value: '> 220', unit: '°C', remarks: 'Thermal breakdown begins' },
  { id: 'phys_viscosity', name: 'Kinematic viscosity', status: 'Available', value: '18.5', unit: 'cSt', remarks: 'Measured at 40 °C (ASTM D445)' },
  { id: 'phys_solubility', name: 'Solubility in water', status: 'Available', value: 'Dispersible / Completely Soluble', unit: '', remarks: 'Forms stable emulsion in 15% HCl' },
  { id: 'phys_partition', name: 'Partition coefficient: n-octanol/water (log Kow)', status: 'Available', value: '2.85', unit: '', remarks: 'Calculated value for active amine' },
  { id: 'phys_vapor_pressure', name: 'Vapour pressure', status: 'Available', value: '1.2', unit: 'kPa', remarks: 'At 20 °C' },
  { id: 'phys_density', name: 'Density / Relative density', status: 'Available', value: '1.025', unit: 'g/cm³', remarks: 'Specific gravity at 20 °C (ASTM D1298)' },
  { id: 'phys_vapor_density', name: 'Relative vapour density', status: 'Available', value: '3.4', unit: 'Air = 1', remarks: 'Heavier than air' },
  { id: 'phys_particle', name: 'Particle characteristics', status: 'Not applicable', value: '', unit: '', remarks: 'Liquid formulation, no nanoparticles' },
];

// Sample Industrial Datasets for Oil & Gas Operations
const OIL_GAS_PRESETS = [
  {
    id: 'acid_inhibitor',
    name: 'OILSERV OS-INHIB 300 (High-Temp Acid Corrosion Inhibitor)',
    application: 'Acidizing & Well Stimulation' as OilGasApplication,
    identifier: 'OILSERV OS-INHIB 300 (High-Temp Acid Corrosion Inhibitor)\nUN 2924 | Oilserv Code: OS-CHEM-ACI300',
    uses: 'Corrosion inhibition in matrix acidizing and coiled tubing stimulation up to 300°F (149°C) in live 15% - 28% HCl.\nRestrictions: Do not use in potable water delivery systems.',
    supplier: 'OILSERV Energy & Chemical Solutions Ltd.\nTrans-Amadi Industrial Layout, Port Harcourt, Rivers State, Nigeria.\nEmail: ehs-compliance@oilserv.com | Tel: +234-84-239000',
    emergencyPhone: 'OILSERV 24/7 EOC: +234-1-234-5678 | CHEMTREC International: +1-703-527-3887',
    signalWord: 'DANGER',
    pictograms: ['flame', 'corrosion', 'skull-and-crossbones', 'health-hazard', 'environment'] as GhsPictogramId[],
    hCodes: ['H226', 'H301', 'H311', 'H314', 'H318', 'H335', 'H373', 'H411'],
    pCodes: ['P210', 'P260', 'P280', 'P301+P310', 'P303+P361+P353', 'P305+P351+P338', 'P310', 'P501'],
    otherHazards: 'Vapors are heavier than air. Rapid heating in confined wellhead piping may generate toxic nitrogen oxides.',
  },
  {
    id: 'drilling_lubricant',
    name: 'OILSERV DRILL-MUD ULTRA (Synthetic Drilling Ester Lubricant)',
    application: 'Drilling Fluids / Mud Support' as OilGasApplication,
    identifier: 'OILSERV DRILL-MUD ULTRA (Synthetic Ester Extreme-Pressure Lubricant)\nOilserv Code: OS-CHEM-DMU800',
    uses: 'Torque and drag reducer for extended reach drilling (ERD) in synthetic oil-based mud (SOBM) and water-based mud (WBM).\nRestrictions: Not intended for downhole food-grade pipelines.',
    supplier: 'OILSERV Energy & Chemical Solutions Ltd.\nPort Harcourt Operational Base, Nigeria.\nEmail: drilling-fluids@oilserv.com | Tel: +234-84-239100',
    emergencyPhone: 'OILSERV 24/7 EOC: +234-1-234-5678 | CHEMTREC: +1-800-424-9300',
    signalWord: 'WARNING',
    pictograms: ['exclamation-mark', 'environment'] as GhsPictogramId[],
    hCodes: ['H315', 'H319', 'H412'],
    pCodes: ['P264', 'P273', 'P280', 'P302+P352', 'P305+P351+P338'],
    otherHazards: 'Spills cause severe slip hazards on drill rig floors and rotary tables.',
  },
  {
    id: 'rig_wash',
    name: 'OILSERV RIG-KLEEN HD (Heavy-Duty Biodegradable Rig Cleaner)',
    application: 'Industrial Maintenance & Rig Wash' as OilGasApplication,
    identifier: 'OILSERV RIG-KLEEN HD (Heavy-Duty Rig Wash & Tank Degreaser)\nOilserv Code: OS-CHEM-RKHD100',
    uses: 'Rig floor degreasing, offshore mud pit cleaning, drill collar pipe washing, and engine skid washdown.\nRestrictions: Do not mix with concentrated mineral acids.',
    supplier: 'OILSERV Energy & Chemical Solutions Ltd.\nPort Harcourt & Lagos Facilities, Nigeria.\nEmail: ehs-compliance@oilserv.com | Tel: +234-84-239000',
    emergencyPhone: 'OILSERV 24/7 EOC: +234-1-234-5678 | CHEMTREC: +1-800-424-9300',
    signalWord: 'WARNING',
    pictograms: ['corrosion', 'exclamation-mark'] as GhsPictogramId[],
    hCodes: ['H315', 'H318', 'H335'],
    pCodes: ['P261', 'P280', 'P305+P351+P338', 'P310'],
    otherHazards: 'Alkaline formulation may react with light alloys (aluminum/zinc) producing hydrogen traces.',
  },
];

// ==========================================
// 2. SDS 16-SECTION METADATA CONFIG
// ==========================================

export interface SdsSectionDef {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  fieldCount: number;
  description: string;
}

export const SDS_SECTIONS: SdsSectionDef[] = [
  { id: 1, title: '1. Identification of the substance/mixture and of the company/undertaking', shortTitle: '1. Identification', icon: FileText, fieldCount: 5, description: 'Product identifier, recommended uses, supplier details & emergency response' },
  { id: 2, title: '2. Hazards identification', shortTitle: '2. Hazards identification', icon: AlertTriangle, fieldCount: 4, description: 'GHS classification, pictograms, signal word, H & P statements' },
  { id: 3, title: '3. Composition/information on ingredients', shortTitle: '3. Composition / Ingredients', icon: FlaskConical, fieldCount: 4, description: 'Chemical identities, CAS/EC numbers, concentration ranges & trade secrets' },
  { id: 4, title: '4. First-aid measures', shortTitle: '4. First-aid measures', icon: HeartPulse, fieldCount: 3, description: 'Routes of exposure (inhalation, eye, skin, ingestion) & immediate treatment' },
  { id: 5, title: '5. Fire-fighting measures', shortTitle: '5. Fire-fighting measures', icon: Flame, fieldCount: 3, description: 'Extinguishing media, combustion hazards, SCBA & firefighter precautions' },
  { id: 6, title: '6. Accidental release measures', shortTitle: '6. Accidental release measures', icon: CloudRain, fieldCount: 4, description: 'Personal precautions, containment dikes, spill cleanup & environmental safety' },
  { id: 7, title: '7. Handling and storage', shortTitle: '7. Handling & storage', icon: Package, fieldCount: 3, description: 'Safe handling, static grounding, storage conditions & chemical incompatibility' },
  { id: 8, title: '8. Exposure controls/personal protection', shortTitle: '8. Exposure controls / PPE', icon: Shield, fieldCount: 4, description: 'OEL/PEL/TLV parameters, engineering ventilation & personal protective equipment' },
  { id: 9, title: '9. Physical and chemical properties', shortTitle: '9. Physical & chemical properties', icon: TestTube, fieldCount: 18, description: 'Flash point, pH, boiling point, density, viscosity, solubility, LEL/UEL' },
  { id: 10, title: '10. Stability and reactivity', shortTitle: '10. Stability & reactivity', icon: Zap, fieldCount: 6, description: 'Chemical stability, incompatible materials, conditions to avoid & decomposition' },
  { id: 11, title: '11. Toxicological information', shortTitle: '11. Toxicological information', icon: Skull, fieldCount: 6, description: 'Acute toxicity (LD50/LC50), skin/eye effects, carcinogenicity & STOT' },
  { id: 12, title: '12. Ecological information', shortTitle: '12. Ecological information', icon: Sprout, fieldCount: 6, description: 'Aquatic toxicity, biodegradation, bioaccumulation (BCF) & soil mobility' },
  { id: 13, title: '13. Disposal considerations', shortTitle: '13. Disposal considerations', icon: Trash2, fieldCount: 3, description: 'RCRA waste treatment, contaminated drum handling & legal precautions' },
  { id: 14, title: '14. Transport information', shortTitle: '14. Transport information', icon: Truck, fieldCount: 7, description: 'UN number, proper shipping name, class, packing group, IMDG/IATA/DOT' },
  { id: 15, title: '15. Regulatory information', shortTitle: '15. Regulatory information', icon: Scale, fieldCount: 3, description: 'OSHA, TSCA, SARA Title III 311/312/313, REACH, environmental regulations' },
  { id: 16, title: '16. Other information', shortTitle: '16. Other information', icon: Info, fieldCount: 5, description: 'Revision date, version history, abbreviations key & legal disclaimer' },
];

export const CreateSdsView: React.FC = () => {
  const { addChemical, setCurrentView, currentUser, setSelectedChemicalId } = useChemicals();

  // Mode Selection: Mode A (Overview / Accordions) vs Mode B (Full SDS Form)
  const [displayMode, setDisplayMode] = useState<'overview' | 'form'>('form');

  // Active section in Form Mode (1 to 16)
  const [activeSectionId, setActiveSectionId] = useState<number>(1);

  // Accordion expanded state in Overview Mode
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  // Search filter query across all sections/subsections
  const [searchQuery, setSearchQuery] = useState('');

  // Regulatory Framework selection
  const [framework, setFramework] = useState<RegulatoryFramework>('OSHA_HAZCOM');

  // Target Oil & Gas Application
  const [application, setApplication] = useState<OilGasApplication>('Acidizing & Well Stimulation');

  // Data Origin tracking
  const [dataOrigin, setDataOrigin] = useState<SdsDataOrigin>('HSE Formulated');

  // Active SDS Header Information
  const [productIdentifier, setProductIdentifier] = useState('OILSERV OS-INHIB 300 (High-Temp Acid Corrosion Inhibitor)');
  const [otherIdentifiers, setOtherIdentifiers] = useState('CAS: Mixture | EC: Mixture | Oilserv Code: OS-CHEM-ACI300 | UN 2924');
  const [recommendedUses, setRecommendedUses] = useState('Matrix acidizing corrosion inhibitor for coiled tubing and wellbore stimulation up to 300°F (149°C).');
  const [supplierDetails, setSupplierDetails] = useState('OILSERV Energy & Chemical Solutions Ltd.\nPlot 14 Trans-Amadi Industrial Layout, Port Harcourt, Rivers State, Nigeria.\nTel: +234-84-239000 | Email: ehs-compliance@oilserv.com');
  const [emergencyPhone, setEmergencyPhone] = useState('OILSERV 24/7 EOC: +234-1-234-5678 | CHEMTREC Global: +1-800-424-9300');

  // Section 2: GHS Label Elements
  const [classificationText, setClassificationText] = useState('Flammable Liquid Category 3 (H226)\nAcute Toxicity Oral Category 3 (H301)\nSkin Corrosion Category 1B (H314)\nSerious Eye Damage Category 1 (H318)\nSTOT SE 3 (Respiratory Tract Irritation) (H335)\nAquatic Chronic Category 2 (H411)');
  const [signalWord, setSignalWord] = useState<'DANGER' | 'WARNING' | 'No Signal Word'>('DANGER');
  const [selectedPictograms, setSelectedPictograms] = useState<GhsPictogramId[]>(['flame', 'corrosion', 'skull-and-crossbones', 'health-hazard', 'environment']);
  const [hStatements, setHStatements] = useState('H226: Flammable liquid and vapour.\nH301: Toxic if swallowed.\nH311: Toxic in contact with skin.\nH314: Causes severe skin burns and eye damage.\nH318: Causes serious eye damage.\nH335: May cause respiratory irritation.\nH411: Toxic to aquatic life with long lasting effects.');
  const [pStatements, setPStatements] = useState('P210: Keep away from heat, hot surfaces, sparks, open flames. No smoking.\nP260: Do not breathe mists/vapours.\nP280: Wear protective gloves/clothing/eye protection/face protection.\nP301+P310: IF SWALLOWED: Immediately call a POISON CENTER or doctor.\nP303+P361+P353: IF ON SKIN: Take off immediately all contaminated clothing. Rinse skin with water.\nP305+P351+P338: IF IN EYES: Rinse cautiously with water for several minutes.\nP501: Dispose of contents/container in accordance with local/federal regulations.');
  const [otherHazards, setOtherHazards] = useState('Vapors may form explosive air mixtures. May release toxic amine and sulfur oxide fumes upon intense heating.');

  // Section 3: Ingredients Repeatable Table
  const [isMixture, setIsMixture] = useState(true);
  const [ingredients, setIngredients] = useState<IngredientEntry[]>([
    { id: 'ing-1', name: 'Alkyl Pyridine Quaternary Ammonium Salt', casNumber: '68909-18-2', ecNumber: '272-689-0', concentration: '35 - 50% w/w', classification: 'Acute Tox. 3 (H301), Skin Corr. 1B (H314)', scl: 'None', isTradeSecret: false },
    { id: 'ing-2', name: 'Propargyl Alcohol (Ethynylcarbinol)', casNumber: '107-19-7', ecNumber: '203-471-2', concentration: '10 - 20% w/w', classification: 'Flam. Liq. 3 (H226), Acute Tox. 2 (H300), Skin Corr. 1B', scl: 'None', isTradeSecret: false },
    { id: 'ing-3', name: 'Methanol (Methyl Alcohol)', casNumber: '67-56-1', ecNumber: '200-659-6', concentration: '15 - 25% w/w', classification: 'Flam. Liq. 2 (H225), Acute Tox. 3 (H301), STOT SE 1', scl: 'STOT SE 1 >= 10%', isTradeSecret: false },
    { id: 'ing-4', name: 'Non-ionic Surfactant & Demulsifier Base', casNumber: 'Proprietary', ecNumber: 'Polymer', concentration: '5 - 15% w/w', classification: 'Eye Irrit. 2 (H319)', scl: 'None', isTradeSecret: true },
  ]);

  // Section 4: First Aid
  const [faInhalation, setFaInhalation] = useState('Move victim to fresh air immediately. If not breathing, administer artificial respiration. If breathing is difficult, administer medical oxygen by certified personnel. Seek immediate medical assistance.');
  const [faSkin, setFaSkin] = useState('Immediately flush skin with running water for at least 15 minutes while removing contaminated coveralls and chemical footwear. Treat burns medically. Wash garments before reuse.');
  const [faEye, setFaEye] = useState('Immediately rinse eyes with stream of water for at least 20 minutes, holding eyelids retracted. Remove contact lenses if present and easy to do. Obtain urgent emergency ophthalmological evaluation.');
  const [faIngestion, setFaIngestion] = useState('Never give anything by mouth to an unconscious person. Do NOT induce vomiting due to chemical burn aspiration risk. Rinse mouth with water. Immediately contact emergency dispatch.');
  const [faSymptoms, setFaSymptoms] = useState('Acute: Burning pain to mouth, throat, eyes and skin. Inhalation causes dizziness, cough, chemical pneumonitis. Delayed: Severe corneal injury, delayed pulmonary edema.');
  const [faMedicalNotes, setFaMedicalNotes] = useState('Contains methanol (antidote: fomepizole or ethanol under critical care monitoring). Treat chemical burns with neutral saline copious irrigation.');

  // Section 5: Fire-fighting
  const [fireSuitable, setFireSuitable] = useState('Alcohol-resistant foam (AR-AFFF), carbon dioxide (CO2), dry chemical powder, water fog for cooling.');
  const [fireUnsuitable, setFireUnsuitable] = useState('Solid straight water stream — may scatter flammable liquid and spread blaze.');
  const [fireHazards, setFireHazards] = useState('Flammable liquid and vapor. Vapors are heavier than air and may flash back. Combustion produces toxic hydrogen cyanide (traces), nitrogen oxides (NOx), carbon monoxide, hydrogen chloride.');
  const [firePpe, setFirePpe] = useState('Positive-pressure NIOSH-certified self-contained breathing apparatus (SCBA) and structural firefighter turnout gear. Cool fire-exposed storage drums with water spray from protected location.');

  // Section 6: Accidental Release
  const [relPersonal, setRelPersonal] = useState('Evacuate non-essential personnel. Eliminate all ignition sources (no smoking, spark-producing tools, hot work). Wear chemical-resistant suit, neoprene boots, nitrile gauntlets, and full-face respirator with OV/Acid Gas cartridge.');
  const [relEnvironmental, setRelEnvironmental] = useState('Prevent spillage from entering rig cellars, mud pits, storm drains, or offshore marine water. Construct containment berm with non-combustible earthen barriers.');
  const [relCleanup, setRelCleanup] = useState('Soak up spillage with inert non-combustible absorbent (sand, vermiculite, diatomaceous earth). Collect with non-sparking explosion-proof vacuum or shovels into grounded UN-certified DOT drums.');

  // Section 7: Handling and Storage
  const [handlingPrecautions, setHandlingPrecautions] = useState('Ensure mechanical explosion-proof local exhaust. Ground and electrically bond all container transfer hoses during pumping. Avoid misting and breathing vapors. Wash thoroughly with soap and water after handling.');
  const [storageConditions, setStorageConditions] = useState('Store in dedicated hazardous materials chemical warehouse (Zone 1/2 rated). Keep container upright, sealed and stored between 15°C and 35°C away from strong oxidizers and mineral bases. Secondary containment required (110% drum capacity).');
  const [specificEndUses, setSpecificEndUses] = useState('Well stimulation acid corrosion inhibitor for oilfield pumping service units.');

  // Section 8: Exposure Controls & PPE
  const [exposureLimits, setExposureLimits] = useState<ExposureLimitEntry[]>([
    { id: 'el-1', substance: 'Methanol (CAS 67-56-1)', limitType: 'OSHA PEL', value: '200', unit: 'ppm', jurisdiction: 'US OSHA (29 CFR 1910.1000)' },
    { id: 'el-2', substance: 'Methanol (CAS 67-56-1)', limitType: 'ACGIH TLV', value: '250', unit: 'ppm', jurisdiction: 'ACGIH (STEL - Skin Notation)' },
    { id: 'el-3', substance: 'Propargyl Alcohol (CAS 107-19-7)', limitType: 'ACGIH TLV', value: '1', unit: 'ppm', jurisdiction: 'ACGIH (TWA - Skin Notation)' },
    { id: 'el-4', substance: 'Propargyl Alcohol (CAS 107-19-7)', limitType: 'NIOSH REL', value: '1', unit: 'ppm', jurisdiction: 'NIOSH (10-hr TWA)' },
  ]);
  const [ppeEye, setPpeEye] = useState('Tight-fitting indirect vent chemical splash goggles with full-face shield (ANSI Z87.1 / EN 166).');
  const [ppeHand, setPpeHand] = useState('Heavy-duty butyl rubber or Chem-Resist neoprene gauntlet gloves (> 480 min breakthrough time, EN 374 Type A).');
  const [ppeSkin, setPpeSkin] = useState('Antistatic, chemical-resistant coveralls (Tychem 4000 or equivalent), neoprene safety boots with steel toe.');
  const [ppeRespiratory, setPpeRespiratory] = useState('Full-face air-purifying respirator equipped with combination Multi-Gas/Vapor and P100 particulate cartridge. Supplied-air respirator (SAR) for confined tank entries.');
  const [engineeringControls, setEngineeringControls] = useState('Explosion-proof mechanical ventilation maintaining airborne concentrations below PEL/TLV. Certified emergency safety shower and eyewash station within 10 seconds access.');

  // Section 9: Physical & Chemical Properties
  const [physicalProps, setPhysicalProps] = useState<PhysicalPropertyEntry[]>(DEFAULT_PHYSICAL_PROPERTIES);

  // Section 10: Stability & Reactivity
  const [reactivity, setReactivity] = useState('Non-reactive under normal ambient conditions. May polymerize violently if heated above 120°C in the presence of strong alkalis.');
  const [chemicalStability, setChemicalStability] = useState('Stable under recommended storage temperatures (15°C - 35°C) and sealed container conditions.');
  const [hazardousReactions, setHazardousReactions] = useState('Vigorous exothermic reaction when brought into contact with strong oxidizers or caustic solutions.');
  const [conditionsAvoid, setConditionsAvoid] = useState('Excessive heat, sparks, open flames, hot rig manifolds, and direct solar UV radiation.');
  const [incompatibleMaterials, setIncompatibleMaterials] = useState('Strong mineral bases (Sodium Hydroxide, Potassium Hydroxide), concentrated oxidizers (Nitric acid, Hydrogen Peroxide, Sodium Hypochlorite), active metals (Aluminum, Zinc).');
  const [decompositionProducts, setDecompositionProducts] = useState('Thermal breakdown in fire releases carbon monoxide, carbon dioxide, hydrogen chloride, nitrogen oxides (NOx), and traces of hydrogen cyanide.');

  // Section 11: Toxicological Information
  const [toxRoutes, setToxRoutes] = useState('Inhalation, dermal absorption, eye contact, and accidental oral ingestion.');
  const [toxAcute, setToxAcute] = useState('Oral LD50 (Rat): ~ 180 mg/kg (estimated from components)\nDermal LD50 (Rabbit): ~ 450 mg/kg\nInhalation LC50 (Rat, 4h): 3.2 mg/l (vapor/mist)');
  const [toxSkinCorrosion, setToxSkinCorrosion] = useState('Category 1B Corrosive: Causes severe chemical burns, necrosis, and irreversible scarring.');
  const [toxEyeDamage, setToxEyeDamage] = useState('Category 1: Causes permanent corneal opacity and blindness.');
  const [toxCarcinogenicity, setToxCarcinogenicity] = useState('None of the components are listed as known or suspected human carcinogens by IARC, NTP, or OSHA.');
  const [toxStot, setToxStot] = useState('STOT-SE: May cause respiratory tract irritation and central nervous system depression. STOT-RE: Ingestion of methanol may cause irreversible optic nerve damage.');

  // Section 12: Ecological Information
  const [ecoToxicity, setEcoToxicity] = useState('Fish (Oncorhynchus mykiss) LC50 (96h): 14.5 mg/l\nDaphnia magna EC50 (48h): 6.8 mg/l\nAlgae (Pseudokirchneriella) ErC50 (72h): 3.2 mg/l (Toxic to aquatic organisms with long-lasting effects).');
  const [ecoBiodegradability, setEcoBiodegradability] = useState('Partially biodegradable. Active organic solvent carriers biodegrade > 75% in 28 days (OECD 301D). Quaternary amine salts are persistent in anaerobic sediment.');
  const [ecoBioaccumulative, setEcoBioaccumulative] = useState('Low bioaccumulation potential (calculated BCF < 50 for primary components).');
  const [ecoMobility, setEcoMobility] = useState('Moderate to high mobility in soil. Leaches into groundwater if spilled onto unprotected unpaved wellsite pad.');

  // Section 13: Disposal Considerations
  const [disposalWaste, setDisposalWaste] = useState('Dispose of in certified hazardous waste incineration facility in compliance with US EPA RCRA (D001 Ignitable, D002 Corrosive) and local environmental regulations. Do not discharge into rig cellars or municipal sewers.');
  const [disposalPackaging, setDisposalPackaging] = useState('Empty drums contain flammable/toxic residues. Decontaminate by approved triple rinsing. Puncture and scrap only in authorized metal reconditioning facilities.');

  // Section 14: Transport Information
  const [transportFrameworks, setTransportFrameworks] = useState<TransportFrameworkEntry[]>([
    { framework: 'DOT (49 CFR)', unNumber: 'UN 2924', shippingName: 'FLAMMABLE LIQUID, CORROSIVE, N.O.S. (Methanol, Alkyl Pyridine Quaternary Salt)', hazardClass: '3 (8)', packingGroup: 'PG III', marinePollutant: true, specialPrecautions: 'ERG Guide 132. Cargo Aircraft Only.' },
    { framework: 'ADR / RID', unNumber: 'UN 2924', shippingName: 'FLAMMABLE LIQUID, CORROSIVE, N.O.S. (Methanol, Alkyl Pyridine Quaternary Salt)', hazardClass: '3 (8)', packingGroup: 'PG III', marinePollutant: true, specialPrecautions: 'Tunnel restriction code: (D/E)' },
    { framework: 'IMDG Code', unNumber: 'UN 2924', shippingName: 'FLAMMABLE LIQUID, CORROSIVE, N.O.S. (Methanol, Alkyl Pyridine Quaternary Salt)', hazardClass: '3 (8)', packingGroup: 'PG III', marinePollutant: true, specialPrecautions: 'EmS: F-E, S-C. Stowage Category: A. Clear of living quarters.' },
    { framework: 'IATA / ICAO', unNumber: 'UN 2924', shippingName: 'FLAMMABLE LIQUID, CORROSIVE, N.O.S. (Methanol, Alkyl Pyridine Quaternary Salt)', hazardClass: '3 (8)', packingGroup: 'PG III', marinePollutant: true, specialPrecautions: 'Passenger Aircraft: Forbidden. Cargo Aircraft Only: Max 60 L.' },
  ]);

  // Section 15: Regulatory Information
  const [regSafety, setRegSafety] = useState('TSCA: All active chemical ingredients are listed on the US TSCA 8(b) Inventory.\nOSHA Status: Defined as Hazardous Chemical under 29 CFR 1910.1200.\nSARA 302: No chemicals subject to EPCRA Section 302.\nSARA 311/312: Flammable, Acute Toxicity, Skin Corrosion, Eye Damage, STOT SE.\nSARA 313: Methanol (CAS 67-56-1) reportable (1.0% de minimis).\nCERCLA RQ: Methanol = 5000 lbs (2270 kg).\nCalifornia Prop 65: WARNING: This product can expose you to Methanol, known to the State of California to cause birth defects.');
  const [regSafetyAssessment, setRegSafetyAssessment] = useState('A Chemical Safety Assessment (CSA) has been conducted by OILSERV Corporate Technical Services for well servicing applications.');

  // Section 16: Other Information
  const [revisionNumber, setRevisionNumber] = useState('4.2');
  const [revisionDate, setRevisionDate] = useState('2026-10-10');
  const [preparedBy, setPreparedBy] = useState('Dr. Sarah Vance, CSP (Corporate HSE Director, OILSERV Energy Ltd)');
  const [abbreviations, setAbbreviations] = useState('GHS = Globally Harmonized System\nOSHA = Occupational Safety and Health Administration\nPEL = Permissible Exposure Limit\nTLV = Threshold Limit Value\nSTEL = Short Term Exposure Limit\nSCBA = Self-Contained Breathing Apparatus\nERD = Extended Reach Drilling\nCAS = Chemical Abstracts Service');
  const [disclaimer, setDisclaimer] = useState('The information contained in this Safety Data Sheet is believed to be accurate and represents the best current knowledge available to OILSERV Energy Ltd. Operators and handling personnel must make their own investigations to verify suitability for their specific downhole and rig operations.');

  // Modals & UI States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isIncompatibilityModalOpen, setIsIncompatibilityModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Load / Save Draft Persistence
  useEffect(() => {
    const saved = localStorage.getItem('cls_sds_draft_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.productIdentifier) setProductIdentifier(parsed.productIdentifier);
      } catch (e) {
        // fallback
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draftPayload = {
      productIdentifier,
      otherIdentifiers,
      recommendedUses,
      supplierDetails,
      emergencyPhone,
      classificationText,
      signalWord,
      selectedPictograms,
      hStatements,
      pStatements,
      otherHazards,
      ingredients,
      exposureLimits,
      physicalProps,
      transportFrameworks,
      revisionNumber,
      revisionDate,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('cls_sds_draft_v2', JSON.stringify(draftPayload));
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  // Section completion calculator
  const sectionCompletions: Record<number, { isComplete: boolean; filledCount: number; totalCount: number }> = useMemo(() => {
    const status: Record<number, { isComplete: boolean; filledCount: number; totalCount: number }> = {};

    status[1] = {
      filledCount: [productIdentifier, otherIdentifiers, recommendedUses, supplierDetails, emergencyPhone].filter(Boolean).length,
      totalCount: 5,
      isComplete: Boolean(productIdentifier && recommendedUses && supplierDetails && emergencyPhone),
    };
    status[2] = {
      filledCount: [classificationText, signalWord, selectedPictograms.length > 0 ? 'yes' : '', hStatements].filter(Boolean).length,
      totalCount: 4,
      isComplete: Boolean(classificationText && signalWord && selectedPictograms.length > 0 && hStatements),
    };
    status[3] = {
      filledCount: ingredients.length > 0 ? 4 : 0,
      totalCount: 4,
      isComplete: ingredients.length > 0,
    };
    status[4] = {
      filledCount: [faInhalation, faSkin, faEye].filter(Boolean).length,
      totalCount: 3,
      isComplete: Boolean(faInhalation && faSkin && faEye),
    };
    status[5] = {
      filledCount: [fireSuitable, fireHazards, firePpe].filter(Boolean).length,
      totalCount: 3,
      isComplete: Boolean(fireSuitable && fireHazards && firePpe),
    };
    status[6] = {
      filledCount: [relPersonal, relEnvironmental, relCleanup].filter(Boolean).length,
      totalCount: 3,
      isComplete: Boolean(relPersonal && relEnvironmental && relCleanup),
    };
    status[7] = {
      filledCount: [handlingPrecautions, storageConditions, specificEndUses].filter(Boolean).length,
      totalCount: 3,
      isComplete: Boolean(handlingPrecautions && storageConditions),
    };
    status[8] = {
      filledCount: [exposureLimits.length > 0 ? 'yes' : '', ppeEye, ppeHand, ppeRespiratory].filter(Boolean).length,
      totalCount: 4,
      isComplete: Boolean(exposureLimits.length > 0 && ppeEye && ppeHand && ppeRespiratory),
    };
    status[9] = {
      filledCount: physicalProps.filter((p) => p.status === 'Available' && Boolean(p.value.trim())).length,
      totalCount: physicalProps.length,
      isComplete: physicalProps.filter((p) => p.status === 'Available' && Boolean(p.value.trim())).length >= 10,
    };
    status[10] = {
      filledCount: [reactivity, chemicalStability, hazardousReactions, conditionsAvoid, incompatibleMaterials, decompositionProducts].filter(Boolean).length,
      totalCount: 6,
      isComplete: Boolean(chemicalStability && conditionsAvoid && incompatibleMaterials),
    };
    status[11] = {
      filledCount: [toxRoutes, toxAcute, toxSkinCorrosion, toxEyeDamage, toxCarcinogenicity, toxStot].filter(Boolean).length,
      totalCount: 6,
      isComplete: Boolean(toxRoutes && toxAcute && toxSkinCorrosion),
    };
    status[12] = {
      filledCount: [ecoToxicity, ecoBiodegradability, ecoBioaccumulative].filter(Boolean).length,
      totalCount: 3,
      isComplete: Boolean(ecoToxicity && ecoBiodegradability),
    };
    status[13] = {
      filledCount: [disposalWaste, disposalPackaging].filter(Boolean).length,
      totalCount: 2,
      isComplete: Boolean(disposalWaste && disposalPackaging),
    };
    status[14] = {
      filledCount: transportFrameworks.length > 0 ? 7 : 0,
      totalCount: 7,
      isComplete: transportFrameworks.length > 0,
    };
    status[15] = {
      filledCount: [regSafety, regSafetyAssessment].filter(Boolean).length,
      totalCount: 2,
      isComplete: Boolean(regSafety),
    };
    status[16] = {
      filledCount: [revisionNumber, revisionDate, preparedBy, abbreviations, disclaimer].filter(Boolean).length,
      totalCount: 5,
      isComplete: Boolean(revisionNumber && revisionDate && preparedBy),
    };

    return status;
  }, [
    productIdentifier, otherIdentifiers, recommendedUses, supplierDetails, emergencyPhone,
    classificationText, signalWord, selectedPictograms, hStatements,
    ingredients, faInhalation, faSkin, faEye, fireSuitable, fireHazards, firePpe,
    relPersonal, relEnvironmental, relCleanup, handlingPrecautions, storageConditions, specificEndUses,
    exposureLimits, ppeEye, ppeHand, ppeRespiratory, physicalProps,
    reactivity, chemicalStability, hazardousReactions, conditionsAvoid, incompatibleMaterials, decompositionProducts,
    toxRoutes, toxAcute, toxSkinCorrosion, toxEyeDamage, toxCarcinogenicity, toxStot,
    ecoToxicity, ecoBiodegradability, ecoBioaccumulative, disposalWaste, disposalPackaging,
    transportFrameworks, regSafety, regSafetyAssessment, revisionNumber, revisionDate, preparedBy, abbreviations, disclaimer,
  ]);

  const completedSectionsCount = useMemo(() => {
    return Object.values(sectionCompletions).filter((s) => s.isComplete).length;
  }, [sectionCompletions]);

  const completionPercentage = Math.round((completedSectionsCount / 16) * 100);

  // Filter sections by search query in Mode A
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SDS_SECTIONS;
    const q = searchQuery.toLowerCase();
    return SDS_SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Load Oil & Gas Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = OIL_GAS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setProductIdentifier(preset.identifier);
    setApplication(preset.application);
    setRecommendedUses(preset.uses);
    setSupplierDetails(preset.supplier);
    setEmergencyPhone(preset.emergencyPhone);
    setSignalWord(preset.signalWord as any);
    setSelectedPictograms(preset.pictograms);
    setOtherHazards(preset.otherHazards);
    handleSaveDraft();
  };

  // Toggle GHS Pictogram in Section 2
  const handleTogglePictogram = (picId: GhsPictogramId) => {
    setSelectedPictograms((prev) =>
      prev.includes(picId) ? prev.filter((p) => p !== picId) : [...prev, picId]
    );
  };

  // Add / Remove Ingredients in Section 3
  const handleAddIngredient = () => {
    const newIng: IngredientEntry = {
      id: `ing-${Date.now()}`,
      name: '',
      casNumber: '',
      ecNumber: '',
      concentration: '1 - 5% w/w',
      classification: 'Acute Tox. 4',
      scl: 'None',
      isTradeSecret: false,
    };
    setIngredients([...ingredients, newIng]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleUpdateIngredient = (id: string, field: keyof IngredientEntry, val: any) => {
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: val } : ing))
    );
  };

  // Add / Remove Exposure Limits in Section 8
  const handleAddExposureLimit = () => {
    const newEl: ExposureLimitEntry = {
      id: `el-${Date.now()}`,
      substance: '',
      limitType: 'OSHA PEL',
      value: '',
      unit: 'ppm',
      jurisdiction: 'OSHA (29 CFR 1910.1000)',
    };
    setExposureLimits([...exposureLimits, newEl]);
  };

  const handleRemoveExposureLimit = (id: string) => {
    setExposureLimits(exposureLimits.filter((el) => el.id !== id));
  };

  const handleUpdateExposureLimit = (id: string, field: keyof ExposureLimitEntry, val: any) => {
    setExposureLimits(
      exposureLimits.map((el) => (el.id === id ? { ...el, [field]: val } : el))
    );
  };

  // Update Section 9 physical property
  const handleUpdatePhysicalProperty = (id: string, field: keyof PhysicalPropertyEntry, val: any) => {
    setPhysicalProps(
      physicalProps.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Export JSON
  const handleExportJson = () => {
    const exportObject = {
      sdsId: `SDS-OS-${Date.now()}`,
      framework,
      application,
      dataOrigin,
      productIdentifier,
      otherIdentifiers,
      recommendedUses,
      supplierDetails,
      emergencyPhone,
      classification: {
        text: classificationText,
        signalWord,
        pictograms: selectedPictograms,
        hazardStatements: hStatements,
        precautionaryStatements: pStatements,
        otherHazards,
      },
      ingredients,
      firstAid: { inhalation: faInhalation, skin: faSkin, eye: faEye, ingestion: faIngestion, symptoms: faSymptoms, notes: faMedicalNotes },
      fireFighting: { suitable: fireSuitable, unsuitable: fireUnsuitable, hazards: fireHazards, ppe: firePpe },
      accidentalRelease: { personal: relPersonal, environmental: relEnvironmental, cleanup: relCleanup },
      handlingAndStorage: { handling: handlingPrecautions, storage: storageConditions, endUses: specificEndUses },
      exposureControls: { limits: exposureLimits, ppeEye, ppeHand, ppeSkin, ppeRespiratory, engineering: engineeringControls },
      physicalProperties: physicalProps,
      stabilityAndReactivity: { reactivity, stability: chemicalStability, reactions: hazardousReactions, conditionsToAvoid: conditionsAvoid, incompatibleMaterials, decompositionProducts },
      toxicological: { routes: toxRoutes, acute: toxAcute, skinCorrosion: toxSkinCorrosion, eyeDamage: toxEyeDamage, carcinogenicity: toxCarcinogenicity, stot: toxStot },
      ecological: { toxicity: ecoToxicity, biodegradability: ecoBiodegradability, bioaccumulation: ecoBioaccumulative, soilMobility: ecoMobility },
      disposal: { waste: disposalWaste, packaging: disposalPackaging },
      transport: transportFrameworks,
      regulatory: { regulations: regSafety, assessment: regSafetyAssessment },
      otherInfo: { revisionNumber, revisionDate, preparedBy, abbreviations, disclaimer },
      exportTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OILSERV_SDS_${productIdentifier.split(' ')[0]}_16Section.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows = [
      ['Section Number', 'Section Title', 'Key Parameter / Subsection', 'Value / Specification', 'Status'],
      ['1', 'Identification', 'Product Identifier', `"${productIdentifier.replace(/"/g, '""')}"`, 'Available'],
      ['1', 'Identification', 'Supplier', `"${supplierDetails.replace(/"/g, '""')}"`, 'Available'],
      ['1', 'Identification', 'Emergency Contact', `"${emergencyPhone.replace(/"/g, '""')}"`, 'Available'],
      ['2', 'Hazards Identification', 'Signal Word', signalWord, 'Available'],
      ['2', 'Hazards Identification', 'Assigned GHS Pictograms', selectedPictograms.join('; '), 'Available'],
      ['2', 'Hazards Identification', 'Classification', `"${classificationText.replace(/"/g, '""')}"`, 'Available'],
      ...ingredients.map((ing) => ['3', 'Composition', `Ingredient: ${ing.name}`, `CAS ${ing.casNumber} | Conc: ${ing.concentration}`, 'Available']),
      ...exposureLimits.map((el) => ['8', 'Exposure Controls', `OEL: ${el.substance}`, `${el.limitType}: ${el.value} ${el.unit} (${el.jurisdiction})`, 'Available']),
      ...physicalProps.map((p) => ['9', 'Physical & Chemical Properties', p.name, `${p.value} ${p.unit} - ${p.remarks}`, p.status]),
      ['14', 'Transport Information', 'UN Number & Class', `${transportFrameworks[0]?.unNumber || 'UN 2924'} - Class ${transportFrameworks[0]?.hazardClass || '3(8)'}`, 'Available'],
      ['16', 'Other Information', 'Revision & Author', `Rev ${revisionNumber} on ${revisionDate} by ${preparedBy}`, 'Available'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OILSERV_SDS_Summary_${productIdentifier.split(' ')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Completed SDS Record to Platform
  const handleSubmitSdsToPlatform = () => {
    const cleanProdName = productIdentifier.split('\n')[0].replace('Product Identifier:', '').trim();

    const createdChem = addChemical({
      productName: cleanProdName || 'OILSERV Industrial Well Chemical',
      manufacturer: 'OILSERV Energy & Chemical Solutions Ltd',
      productCode: 'OS-CHEM-SDS16',
      casNumber: ingredients[0]?.casNumber || 'Mixture',
      physicalState: (physicalProps.find((p) => p.id === 'phys_state')?.value as any) || 'Liquid',
      sdsRevisionDate: revisionDate,
      status: 'under_review',
      lastReviewedDate: revisionDate,
      lastReviewedBy: currentUser.name || 'HSE Compliance Lead',
      signalWord: signalWord === 'No Signal Word' ? 'WARNING' : signalWord,
      pictograms: selectedPictograms,
      hazardClasses: [
        'Flammable Liquid Cat. 3',
        'Acute Toxicity Cat. 3',
        'Skin Corrosion Cat. 1B',
        'STOT SE Cat. 3',
        'Aquatic Chronic Cat. 2',
      ],
      hStatements: [
        { code: 'H226', text: 'Flammable liquid and vapour.', category: 'physical' },
        { code: 'H301', text: 'Toxic if swallowed.', category: 'health' },
        { code: 'H314', text: 'Causes severe skin burns and eye damage.', category: 'health' },
        { code: 'H335', text: 'May cause respiratory irritation.', category: 'health' },
      ],
      pStatements: [
        { code: 'P210', text: 'Keep away from heat, hot surfaces, sparks, open flames. No smoking.', category: 'prevention' },
        { code: 'P280', text: 'Wear protective gloves/clothing/eye protection.', category: 'prevention' },
        { code: 'P301+P310', text: 'IF SWALLOWED: Immediately call a POISON CENTER or doctor.', category: 'response' },
      ],
      nfpa: { health: 3, flammability: 2, instability: 1, special: 'COR' },
      hmis: { health: 3, flammability: 2, physicalHazard: 1, ppeCode: 'H' },
      ppe: {
        eye: ppeEye,
        hand: ppeHand,
        respiratory: ppeRespiratory,
        body: ppeSkin,
        foot: 'Steel-Toe Chemical Safety Boots (EN ISO 20345 S5)',
      },
      emergency: {
        firstAidInhalation: faInhalation,
        firstAidSkin: faSkin,
        firstAidEye: faEye,
        firstAidIngestion: faIngestion,
        fireResponse: fireSuitable,
        spillResponse: relCleanup,
        storageHandling: storageConditions,
        emergencyContact: 'OILSERV Emergency Operations Center (EOC)',
        emergencyPhone: emergencyPhone,
      },
      notes: `GHS 16-Section Safety Data Sheet verified. Operational domain: ${application}. Sections completed: ${completedSectionsCount}/16. Regulatory baseline: ${framework}.`,
    });

    setSelectedChemicalId(createdChem.id);
    setSubmitSuccess(true);
  };

  const activeSectionMeta = SDS_SECTIONS.find((s) => s.id === activeSectionId) || SDS_SECTIONS[0];

  return (
    <div className="w-full max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-4 space-y-6 select-none bg-slate-50/50 min-h-screen">
      {/* Toast: Draft Saved */}
      {draftSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">SDS Draft saved locally to platform storage</span>
        </div>
      )}

      {/* Success Banner */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                Safety Data Sheet Successfully Submitted for HSE Authorization!
              </span>
              <span className="text-xs text-emerald-800">
                All 16 GHS sections, physical values, transport frameworks, and toxicological indices have been committed to the inventory.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-1.5 bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Preview Document & QR
            </button>
            <button
              onClick={() => setCurrentView('library')}
              className="px-4 py-1.5 bg-[#ea580c] hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Go to Labels Library
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER & OILSERV CORPORATE BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('create_hub')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title="Return to Creation Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  GHS Safety Data Sheet (SDS) 16-Section Module
                </h1>
                <span className="bg-orange-50 text-[#ea580c] text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  OILSERV CORPORATE EHS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upstream Oil & Gas Well Servicing, Drilling Fluids, Cementing & Acidizing Safety Compliance
              </p>
            </div>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => setIsIncompatibilityModalOpen(true)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
              <span>Incompatibility Guide</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export structured JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export CSV Summary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span>Preview Full SDS</span>
            </button>
          </div>
        </div>

        {/* Configurations Bar: Framework, Domain & Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Regulatory Framework Switcher */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Regulatory Framework Target
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as RegulatoryFramework)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c] cursor-pointer"
            >
              <option value="OSHA_HAZCOM">OSHA HazCom 2012 (29 CFR 1910.1200 - USA)</option>
              <option value="UN_GHS">UN GHS Rev 10 (International Harmonized)</option>
              <option value="EU_REACH">EU REACH / CLP Regulation (EC No 1272/2008)</option>
            </select>
          </div>

          {/* Oil & Gas Application */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Oil & Gas Operational Domain
            </label>
            <select
              value={application}
              onChange={(e) => setApplication(e.target.value as OilGasApplication)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c] cursor-pointer"
            >
              <option value="Well Servicing">Well Servicing & Wellbore Prep</option>
              <option value="Drilling Fluids / Mud Support">Drilling Fluids / Mud Support</option>
              <option value="Cementing Operations">Cementing Operations & Slurry</option>
              <option value="Acidizing & Well Stimulation">Acidizing & Well Stimulation</option>
              <option value="Chemical Storage & Tank Farm">Chemical Storage & Tank Farm</option>
              <option value="Industrial Maintenance & Rig Wash">Industrial Maintenance & Rig Wash</option>
            </select>
          </div>

          {/* Quick Presets Auto-Loader */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Load Operational Sample Preset
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadPreset(e.target.value);
              }}
              defaultValue=""
              className="w-full text-xs bg-amber-50/60 border border-amber-200 rounded-lg p-2 text-amber-900 focus:outline-none focus:ring-2 focus:ring-[#ea580c] cursor-pointer font-medium"
            >
              <option value="" disabled>
                -- Select Industry Formula Sample --
              </option>
              {OIL_GAS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data Origin & Provenance */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Data Source & Provenance
            </label>
            <select
              value={dataOrigin}
              onChange={(e) => setDataOrigin(e.target.value as SdsDataOrigin)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c] cursor-pointer"
            >
              <option value="HSE Formulated">HSE Formulated & Certified</option>
              <option value="Supplier SDS Original">Supplier SDS Document Original</option>
              <option value="Laboratory Verified">Third-Party Laboratory Verified</option>
            </select>
          </div>
        </div>

        {/* Progress Metric & Mode Tabs Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDisplayMode('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>Mode A: SDS Overview (16 Accordions)</span>
            </button>

            <button
              onClick={() => setDisplayMode('form')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Mode B: Full SDS Form (Structured Form)</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600">
              Data Completion: <strong className="text-slate-900">{completedSectionsCount} of 16 Sections</strong>
            </span>
            <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  completedSectionsCount === 16 ? 'bg-emerald-500' : 'bg-[#ea580c]'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span
              className={`text-xs font-bold ${
                completedSectionsCount === 16 ? 'text-emerald-600' : 'text-[#ea580c]'
              }`}
            >
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE A: SDS OVERVIEW (16 ACCORDION PANELS)                */}
      {/* ======================================================== */}
      {displayMode === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search & Bulk Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SDS sections, properties, or subsections..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const all: Record<number, boolean> = {};
                  SDS_SECTIONS.forEach((s) => (all[s.id] = true));
                  setExpandedSections(all);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={() => setExpandedSections({})}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* 16 Accordion Panels */}
          <div className="space-y-2.5">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isExpanded = Boolean(expandedSections[sec.id]);
              const comp = sectionCompletions[sec.id] || { isComplete: false, filledCount: 0, totalCount: sec.fieldCount };

              return (
                <div
                  key={sec.id}
                  className={`bg-white rounded-xl border transition-all ${
                    comp.isComplete
                      ? 'border-emerald-200 shadow-2xs'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Header of Accordion */}
                  <div
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        [sec.id]: !prev[sec.id],
                      }))
                    }
                    className={`p-4 flex items-center justify-between gap-3 cursor-pointer select-none rounded-xl transition-colors ${
                      isExpanded ? 'bg-slate-50/80 border-b border-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          comp.isComplete
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-50 text-[#ea580c]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 truncate">
                            {sec.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {sec.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Completion status pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          comp.isComplete
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {comp.isComplete ? '✓ Populated' : `${comp.filledCount}/${comp.totalCount} Fields`}
                      </span>

                      {/* Jump to Form Edit button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSectionId(sec.id);
                          setDisplayMode('form');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#ea580c] hover:bg-orange-50 rounded-md border border-orange-200 transition-colors"
                      >
                        Edit in Form
                      </button>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Body of Accordion */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 text-xs text-slate-700 bg-white rounded-b-xl space-y-3">
                      {sec.id === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><strong>1.1 Product Identifier:</strong> <p className="text-slate-600 whitespace-pre-line mt-0.5">{productIdentifier}</p></div>
                          <div><strong>1.2 Other Identifiers:</strong> <p className="text-slate-600 mt-0.5">{otherIdentifiers}</p></div>
                          <div><strong>1.3 Recommended Use:</strong> <p className="text-slate-600 mt-0.5">{recommendedUses}</p></div>
                          <div><strong>1.4 & 1.5 Supplier & EOC:</strong> <p className="text-slate-600 whitespace-pre-line mt-0.5">{supplierDetails}</p></div>
                        </div>
                      )}

                      {sec.id === 2 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <strong>Signal Word:</strong>
                            <span className={`px-2 py-0.5 rounded text-white font-bold text-[10px] ${signalWord === 'DANGER' ? 'bg-red-600' : 'bg-amber-500'}`}>
                              {signalWord}
                            </span>
                          </div>
                          <div><strong>Assigned GHS Pictograms:</strong>
                            <div className="flex items-center gap-2 my-2 flex-wrap">
                              {selectedPictograms.map((pic) => (
                                <GhsPictogram key={pic} id={pic} size={36} showLabel />
                              ))}
                            </div>
                          </div>
                          <div><strong>Classification:</strong> <p className="text-slate-600 whitespace-pre-line">{classificationText}</p></div>
                        </div>
                      )}

                      {sec.id === 3 && (
                        <div>
                          <strong>Chemical Formulation ({ingredients.length} active ingredients):</strong>
                          <div className="mt-2 overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-[11px] text-left">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <tr>
                                  <th className="p-2">Chemical Name</th>
                                  <th className="p-2">CAS Number</th>
                                  <th className="p-2">Concentration</th>
                                  <th className="p-2">Trade Secret</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ingredients.map((ing) => (
                                  <tr key={ing.id} className="border-b border-slate-100">
                                    <td className="p-2 font-medium">{ing.name}</td>
                                    <td className="p-2 font-mono">{ing.casNumber}</td>
                                    <td className="p-2">{ing.concentration}</td>
                                    <td className="p-2">{ing.isTradeSecret ? 'Yes (Protected)' : 'No'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {sec.id === 7 && (
                        <div className="space-y-1">
                          <p><strong>Storage Requirements:</strong> {storageConditions}</p>
                          <p><strong>Incompatibility Warning:</strong> {incompatibleMaterials}</p>
                        </div>
                      )}

                      {sec.id === 8 && (
                        <div className="space-y-2">
                          <p><strong>Occupational Limits:</strong> {exposureLimits.map((l) => `${l.substance} [${l.limitType}: ${l.value} ${l.unit}]`).join(' | ')}</p>
                          <p><strong>PPE Eye:</strong> {ppeEye}</p>
                          <p><strong>PPE Hand:</strong> {ppeHand}</p>
                          <p><strong>PPE Respiratory:</strong> {ppeRespiratory}</p>
                        </div>
                      )}

                      {sec.id === 9 && (
                        <div>
                          <strong>Key Numerical Values:</strong>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {physicalProps.slice(0, 6).map((p) => (
                              <div key={p.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                                <span className="text-slate-500 block">{p.name}</span>
                                <span className="font-bold text-slate-800">{p.value || 'N/A'} {p.unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sec.id === 14 && (
                        <div className="space-y-1">
                          <p><strong>Primary UN:</strong> {transportFrameworks[0]?.unNumber || 'UN 2924'} - {transportFrameworks[0]?.shippingName}</p>
                          <p><strong>Hazard Class & PG:</strong> Class {transportFrameworks[0]?.hazardClass} | Packing Group {transportFrameworks[0]?.packingGroup}</p>
                        </div>
                      )}

                      {sec.id !== 1 && sec.id !== 2 && sec.id !== 3 && sec.id !== 7 && sec.id !== 8 && sec.id !== 9 && sec.id !== 14 && (
                        <p className="text-slate-600">
                          Section data initialized. Click <strong>Edit in Form</strong> above to inspect and edit all subsections.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE B: FULL SDS FORM (DETAILED SECTION-BY-SECTION)       */}
      {/* ======================================================== */}
      {displayMode === 'form' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 16 Section Selector Pills / Buttons Grid (Green when finished) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Select GHS Section to Edit:
              </h2>
              <span className="text-[11px] text-slate-400">
                Completed sections are highlighted in green
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {SDS_SECTIONS.map((sec) => {
                const isActive = sec.id === activeSectionId;
                const isComplete = sectionCompletions[sec.id]?.isComplete;

                let colorClasses = 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                if (isActive) {
                  colorClasses = isComplete
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : 'bg-[#ea580c] text-white border-[#ea580c] ring-2 ring-orange-300';
                } else if (isComplete) {
                  colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100';
                }

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`p-2.5 rounded-lg border text-[11px] font-semibold text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer min-h-[58px] ${colorClasses}`}
                  >
                    <span className="truncate w-full">{sec.shortTitle}</span>
                    <span className="text-[9px] font-normal opacity-90">
                      {isComplete ? '✓ Finished' : `Sec ${sec.id}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE SECTION FORM CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
            {/* Section Banner Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ea580c] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {activeSectionId}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeSectionMeta.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeSectionMeta.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    sectionCompletions[activeSectionId]?.isComplete
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {sectionCompletions[activeSectionId]?.isComplete ? '✓ Section Completed' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* SECTION 1: IDENTIFICATION */}
            {activeSectionId === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1.1 Product Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productIdentifier}
                    onChange={(e) => setProductIdentifier(e.target.value)}
                    placeholder="Enter formal product trade name and chemical codes..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1.2 Other Means of Identification (CAS, EC, Oilserv Code, Synonyms)
                  </label>
                  <input
                    type="text"
                    value={otherIdentifiers}
                    onChange={(e) => setOtherIdentifiers(e.target.value)}
                    placeholder="CAS numbers, EC index, internal chemical codes..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1.3 Recommended Use and Restrictions on Use <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={recommendedUses}
                    onChange={(e) => setRecommendedUses(e.target.value)}
                    placeholder="Operational oilfield service applications, prohibitions, and non-recommended uses..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1.4 Details of the Supplier (Company, Address, Phone, Email) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={supplierDetails}
                      onChange={(e) => setSupplierDetails(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1.5 24/7 Emergency Telephone Number <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: HAZARDS IDENTIFICATION */}
            {activeSectionId === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2.1 Classification of the Substance or Mixture (GHS / OSHA HazCom 2012) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={classificationText}
                    onChange={(e) => setClassificationText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>

                {/* GHS Label Elements */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2.2 GHS Label Elements
                  </h4>

                  {/* Signal Word */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Signal Word:
                    </label>
                    <div className="flex items-center gap-2">
                      {(['DANGER', 'WARNING', 'No Signal Word'] as const).map((word) => (
                        <button
                          key={word}
                          type="button"
                          onClick={() => setSignalWord(word)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            signalWord === word
                              ? word === 'DANGER'
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : word === 'WARNING'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Pictograms Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Assigned GHS Pictograms (Click to toggle):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {ALL_GHS_PICTOGRAMS.map((pic) => {
                        const isSelected = selectedPictograms.includes(pic.id);
                        return (
                          <button
                            key={pic.id}
                            type="button"
                            onClick={() => handleTogglePictogram(pic.id)}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white border-orange-500 ring-2 ring-orange-200 shadow-xs'
                                : 'bg-white/60 border-slate-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <GhsPictogram id={pic.id} size={36} />
                            <span className="text-[10px] font-medium text-slate-800 text-center">
                              {pic.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hazard Statements (H-codes) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hazard Statements (H-Statements):
                    </label>
                    <textarea
                      rows={3}
                      value={hStatements}
                      onChange={(e) => setHStatements(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>

                  {/* Precautionary Statements (P-codes) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Precautionary Statements (P-Statements):
                    </label>
                    <textarea
                      rows={3}
                      value={pStatements}
                      onChange={(e) => setPStatements(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2.3 Other Hazards (Non-GHS Classified, Static Accumulator, H2S Potential)
                  </label>
                  <textarea
                    rows={2}
                    value={otherHazards}
                    onChange={(e) => setOtherHazards(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: COMPOSITION (REPEATABLE INGREDIENT TABLE) */}
            {activeSectionId === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isMixture}
                        onChange={() => setIsMixture(false)}
                        className="text-[#ea580c]"
                      />
                      <span>3.1 Single Substance</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={isMixture}
                        onChange={() => setIsMixture(true)}
                        className="text-[#ea580c]"
                      />
                      <span>3.2 Chemical Mixture (Multiple Ingredients)</span>
                    </label>
                  </div>

                  <button
                    onClick={handleAddIngredient}
                    className="px-3 py-1.5 bg-[#ea580c] hover:bg-orange-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3">Chemical Name</th>
                        <th className="p-3">CAS Number</th>
                        <th className="p-3">EC / Index</th>
                        <th className="p-3">Concentration (%)</th>
                        <th className="p-3">Classification</th>
                        <th className="p-3">Trade Secret?</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ingredients.map((ing) => (
                        <tr key={ing.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                              placeholder="Ingredient name..."
                              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={ing.casNumber}
                              onChange={(e) => handleUpdateIngredient(ing.id, 'casNumber', e.target.value)}
                              placeholder="e.g. 67-56-1"
                              className="w-28 text-xs p-1.5 bg-white border border-slate-200 rounded font-mono"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={ing.ecNumber}
                              onChange={(e) => handleUpdateIngredient(ing.id, 'ecNumber', e.target.value)}
                              placeholder="EC number"
                              className="w-24 text-xs p-1.5 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={ing.concentration}
                              onChange={(e) => handleUpdateIngredient(ing.id, 'concentration', e.target.value)}
                              placeholder="e.g. 10 - 20%"
                              className="w-28 text-xs p-1.5 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={ing.classification}
                              onChange={(e) => handleUpdateIngredient(ing.id, 'classification', e.target.value)}
                              placeholder="Flam. Liq. 2"
                              className="w-36 text-xs p-1.5 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={ing.isTradeSecret}
                              onChange={(e) => handleUpdateIngredient(ing.id, 'isTradeSecret', e.target.checked)}
                              className="rounded text-[#ea580c] cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleRemoveIngredient(ing.id)}
                              className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete ingredient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 4: FIRST-AID MEASURES */}
            {activeSectionId === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4.1 Inhalation Emergency Actions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={faInhalation}
                      onChange={(e) => setFaInhalation(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4.1 Skin Contact Actions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={faSkin}
                      onChange={(e) => setFaSkin(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4.1 Eye Contact Protocol <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={faEye}
                      onChange={(e) => setFaEye(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4.1 Ingestion Protocol <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={faIngestion}
                      onChange={(e) => setFaIngestion(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4.2 Most Important Symptoms and Effects (Acute & Delayed)
                  </label>
                  <textarea
                    rows={2}
                    value={faSymptoms}
                    onChange={(e) => setFaSymptoms(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4.3 Indication of Immediate Medical Attention & Notes to Attending Physician
                  </label>
                  <textarea
                    rows={2}
                    value={faMedicalNotes}
                    onChange={(e) => setFaMedicalNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
              </div>
            )}

            {/* SECTION 5: FIRE-FIGHTING */}
            {activeSectionId === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5.1 Suitable Extinguishing Media <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={fireSuitable}
                      onChange={(e) => setFireSuitable(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5.1 Unsuitable Extinguishing Media <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={fireUnsuitable}
                      onChange={(e) => setFireUnsuitable(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5.2 Specific Hazards Arising from Combustion & Thermal Breakdown
                  </label>
                  <textarea
                    rows={2}
                    value={fireHazards}
                    onChange={(e) => setFireHazards(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5.3 Special Protective Equipment and Precautions for Firefighters (SCBA, Turnout)
                  </label>
                  <textarea
                    rows={2}
                    value={firePpe}
                    onChange={(e) => setFirePpe(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SECTION 6: ACCIDENTAL RELEASE */}
            {activeSectionId === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6.1 Personal Precautions, Protective Equipment and Emergency Procedures <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={relPersonal}
                    onChange={(e) => setRelPersonal(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6.2 Environmental Precautions (Containment Berms, Waterway Protection) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={relEnvironmental}
                    onChange={(e) => setRelEnvironmental(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6.3 Methods and Materials for Containment and Cleaning Up <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={relCleanup}
                    onChange={(e) => setRelCleanup(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SECTION 7: HANDLING AND STORAGE */}
            {activeSectionId === 7 && (
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
                    <AlertOctagon className="w-4 h-4 text-[#ea580c] shrink-0" />
                    <span>Check storage compatibility against chemical groups using the platform guide.</span>
                  </div>
                  <button
                    onClick={() => setIsIncompatibilityModalOpen(true)}
                    className="px-3 py-1 bg-[#ea580c] hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    Open Incompatibility Guide
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    7.1 Precautions for Safe Handling (Static Bonding, Vapor Extraction) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={handlingPrecautions}
                    onChange={(e) => setHandlingPrecautions(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    7.2 Conditions for Safe Storage, Including Incompatibilities <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={storageConditions}
                    onChange={(e) => setStorageConditions(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    7.3 Specific End Use(s)
                  </label>
                  <input
                    type="text"
                    value={specificEndUses}
                    onChange={(e) => setSpecificEndUses(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SECTION 8: EXPOSURE CONTROLS & PERSONAL PROTECTION */}
            {activeSectionId === 8 && (
              <div className="space-y-5">
                {/* Repeatable Exposure Limits Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800">
                      8.1 Occupational Exposure Limit Values (PEL / TLV / REL / OEL):
                    </label>
                    <button
                      onClick={handleAddExposureLimit}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                      <span>Add Limit</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Substance Name</th>
                          <th className="p-2.5">Limit Standard</th>
                          <th className="p-2.5">Value</th>
                          <th className="p-2.5">Unit</th>
                          <th className="p-2.5">Jurisdiction / Source</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {exposureLimits.map((el) => (
                          <tr key={el.id}>
                            <td className="p-2">
                              <input
                                type="text"
                                value={el.substance}
                                onChange={(e) => handleUpdateExposureLimit(el.id, 'substance', e.target.value)}
                                placeholder="Chemical name..."
                                className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={el.limitType}
                                onChange={(e) => handleUpdateExposureLimit(el.id, 'limitType', e.target.value)}
                                className="text-xs p-1.5 bg-white border border-slate-200 rounded"
                              >
                                <option value="OSHA PEL">OSHA PEL</option>
                                <option value="ACGIH TLV">ACGIH TLV</option>
                                <option value="NIOSH REL">NIOSH REL</option>
                                <option value="EU OEL">EU OEL</option>
                                <option value="Other">Other</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={el.value}
                                onChange={(e) => handleUpdateExposureLimit(el.id, 'value', e.target.value)}
                                placeholder="e.g. 200"
                                className="w-20 text-xs p-1.5 bg-white border border-slate-200 rounded font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={el.unit}
                                onChange={(e) => handleUpdateExposureLimit(el.id, 'unit', e.target.value)}
                                className="text-xs p-1.5 bg-white border border-slate-200 rounded"
                              >
                                <option value="ppm">ppm</option>
                                <option value="mg/m³">mg/m³</option>
                                <option value="mg/l">mg/l</option>
                                <option value="fibers/cm³">fibers/cm³</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={el.jurisdiction}
                                onChange={(e) => handleUpdateExposureLimit(el.id, 'jurisdiction', e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => handleRemoveExposureLimit(el.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PPE Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      8.2 Eye and Face Protection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ppeEye}
                      onChange={(e) => setPpeEye(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      8.2 Hand Protection (Glove Material, Breakthrough Time) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ppeHand}
                      onChange={(e) => setPpeHand(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      8.2 Skin and Body Protection (Coveralls, Boots) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ppeSkin}
                      onChange={(e) => setPpeSkin(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      8.2 Respiratory Protection (Filter Class, Cartridge Type) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ppeRespiratory}
                      onChange={(e) => setPpeRespiratory(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: PHYSICAL AND CHEMICAL PROPERTIES (STRUCTURED 18-ROW TABLE) */}
            {activeSectionId === 9 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Record exact experimental values with standard units, testing conditions (ASTM/DIN), and applicability status.
                </p>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3 w-1/4">Physical / Chemical Property</th>
                        <th className="p-3 w-32">Status</th>
                        <th className="p-3 w-36">Value</th>
                        <th className="p-3 w-28">Unit</th>
                        <th className="p-3">Test Condition / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {physicalProps.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-800">
                            {p.name}
                          </td>
                          <td className="p-2.5">
                            <select
                              value={p.status}
                              onChange={(e) => handleUpdatePhysicalProperty(p.id, 'status', e.target.value)}
                              className="w-full text-[11px] p-1 bg-white border border-slate-200 rounded"
                            >
                              <option value="Available">Available</option>
                              <option value="Not available">Not available</option>
                              <option value="Not applicable">Not applicable</option>
                              <option value="Not determined">Not determined</option>
                            </select>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={p.value}
                              disabled={p.status !== 'Available'}
                              onChange={(e) => handleUpdatePhysicalProperty(p.id, 'value', e.target.value)}
                              placeholder={p.status === 'Available' ? 'Value' : p.status}
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded font-mono disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={p.unit}
                              disabled={p.status !== 'Available'}
                              onChange={(e) => handleUpdatePhysicalProperty(p.id, 'unit', e.target.value)}
                              placeholder="Unit"
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={p.remarks}
                              onChange={(e) => handleUpdatePhysicalProperty(p.id, 'remarks', e.target.value)}
                              placeholder="Test conditions..."
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 10: STABILITY AND REACTIVITY */}
            {activeSectionId === 10 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10.1 Reactivity <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={reactivity}
                      onChange={(e) => setReactivity(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10.2 Chemical Stability <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={chemicalStability}
                      onChange={(e) => setChemicalStability(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10.3 Possibility of Hazardous Reactions
                    </label>
                    <textarea
                      rows={2}
                      value={hazardousReactions}
                      onChange={(e) => setHazardousReactions(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10.4 Conditions to Avoid (Heat, Sparks, Direct UV) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={conditionsAvoid}
                      onChange={(e) => setConditionsAvoid(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950">
                      10.5 Incompatible Materials (Chemical Incompatibility Integration) *
                    </label>
                    <button
                      onClick={() => setIsIncompatibilityModalOpen(true)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-md cursor-pointer"
                    >
                      Browse Incompatibility Matrix
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={incompatibleMaterials}
                    onChange={(e) => setIncompatibleMaterials(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    10.6 Hazardous Decomposition Products
                  </label>
                  <textarea
                    rows={2}
                    value={decompositionProducts}
                    onChange={(e) => setDecompositionProducts(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SECTION 11: TOXICOLOGICAL */}
            {activeSectionId === 11 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11.1 Likely Routes of Exposure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={toxRoutes}
                      onChange={(e) => setToxRoutes(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11.1 Acute Numerical Toxicity (LD50 / LC50) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={toxAcute}
                      onChange={(e) => setToxAcute(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11.1 Skin Corrosion / Irritation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={toxSkinCorrosion}
                      onChange={(e) => setToxSkinCorrosion(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11.1 Serious Eye Damage / Eye Irritation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={toxEyeDamage}
                      onChange={(e) => setToxEyeDamage(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11.1 Carcinogenicity (IARC, NTP, OSHA Status)
                    </label>
                    <input
                      type="text"
                      value={toxCarcinogenicity}
                      onChange={(e) => setToxCarcinogenicity(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11.1 Specific Target Organ Toxicity (STOT-SE / STOT-RE)
                    </label>
                    <input
                      type="text"
                      value={toxStot}
                      onChange={(e) => setToxStot(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 12: ECOLOGICAL */}
            {activeSectionId === 12 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    12.1 Ecotoxicity (Aquatic Fish LC50, Daphnia EC50, Algae ErC50) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={ecoToxicity}
                    onChange={(e) => setEcoToxicity(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    12.2 Persistence and Degradability (OECD 301 Tests) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={ecoBiodegradability}
                    onChange={(e) => setEcoBiodegradability(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      12.3 Bioaccumulative Potential (BCF, Log Kow)
                    </label>
                    <input
                      type="text"
                      value={ecoBioaccumulative}
                      onChange={(e) => setEcoBioaccumulative(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      12.4 Mobility in Soil (Koc)
                    </label>
                    <input
                      type="text"
                      value={ecoMobility}
                      onChange={(e) => setEcoMobility(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 13: DISPOSAL */}
            {activeSectionId === 13 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    13.1 Waste Treatment Methods (EPA RCRA Codes, Incineration, Prohibitions) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={disposalWaste}
                    onChange={(e) => setDisposalWaste(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    13.1 Contaminated Packaging & Drum Decontamination <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={disposalPackaging}
                    onChange={(e) => setDisposalPackaging(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SECTION 14: TRANSPORT (MULTI-FRAMEWORK TABLE) */}
            {activeSectionId === 14 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Multimodal transport specifications conforming to DOT 49 CFR, ADR / RID, IMDG Code, and IATA / ICAO DGR.
                </p>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3 w-32">Framework</th>
                        <th className="p-3 w-28">14.1 UN No.</th>
                        <th className="p-3">14.2 Proper Shipping Name</th>
                        <th className="p-3 w-24">14.3 Class</th>
                        <th className="p-3 w-20">14.4 PG</th>
                        <th className="p-3 w-24">Marine Poll.?</th>
                        <th className="p-3">14.6 Special Precautions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transportFrameworks.map((tf, idx) => (
                        <tr key={tf.framework} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-800">{tf.framework}</td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={tf.unNumber}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTransportFrameworks((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, unNumber: val } : t))
                                );
                              }}
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded font-mono"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={tf.shippingName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTransportFrameworks((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, shippingName: val } : t))
                                );
                              }}
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={tf.hazardClass}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTransportFrameworks((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, hazardClass: val } : t))
                                );
                              }}
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={tf.packingGroup}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTransportFrameworks((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, packingGroup: val } : t))
                                );
                              }}
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={tf.marinePollutant}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTransportFrameworks((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, marinePollutant: checked } : t))
                                );
                              }}
                              className="rounded text-[#ea580c] cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={tf.specialPrecautions}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTransportFrameworks((prev) =>
                                  prev.map((t, i) => (i === idx ? { ...t, specialPrecautions: val } : t))
                                );
                              }}
                              className="w-full text-xs p-1 bg-white border border-slate-200 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 15: REGULATORY */}
            {activeSectionId === 15 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    15.1 Safety, Health and Environmental Regulations (OSHA, TSCA, SARA, REACH, Prop 65) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={regSafety}
                    onChange={(e) => setRegSafety(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    15.2 Chemical Safety Assessment Status
                  </label>
                  <input
                    type="text"
                    value={regSafetyAssessment}
                    onChange={(e) => setRegSafetyAssessment(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* SECTION 16: OTHER INFORMATION */}
            {activeSectionId === 16 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Revision Version <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={revisionNumber}
                      onChange={(e) => setRevisionNumber(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Last Revision <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={revisionDate}
                      onChange={(e) => setRevisionDate(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Prepared By (HSE Specialist) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key to Abbreviations & Acronyms
                  </label>
                  <textarea
                    rows={3}
                    value={abbreviations}
                    onChange={(e) => setAbbreviations(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legal Disclaimer & Operational Warranty
                  </label>
                  <textarea
                    rows={3}
                    value={disclaimer}
                    onChange={(e) => setDisclaimer(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* FORM FOOTER NAVIGATION CONTROLS */}
            <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSectionId > 1) setActiveSectionId(activeSectionId - 1);
                  }}
                  disabled={activeSectionId === 1}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Section</span>
                </button>

                {activeSectionId < 16 && (
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(activeSectionId + 1)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitSdsToPlatform}
                  className="px-5 py-2 bg-[#ea580c] hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit SDS Sheet for HSE Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CHEMICAL INCOMPATIBILITY GUIDE MODAL                   */}
      {/* ======================================================== */}
      {isIncompatibilityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  OILSERV Chemical Incompatibility Matrix & Storage Safety Guide
                </span>
              </div>
              <button
                onClick={() => setIsIncompatibilityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              <p className="text-slate-600 leading-relaxed">
                Refer to this industrial safety matrix to specify verified storage segregations in <strong>Section 7</strong> and incompatible substances in <strong>Section 10.5</strong> without automatic conjecture.
              </p>

              <div className="space-y-3">
                {INCOMPATIBILITY_GROUPS.map((grp) => (
                  <div key={grp.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {grp.name}
                      </span>
                      <button
                        onClick={() => {
                          setIncompatibleMaterials(
                            (prev) => (prev ? `${prev}; ${grp.incompatibleWith.join(', ')}` : grp.incompatibleWith.join(', '))
                          );
                          setIsIncompatibilityModalOpen(false);
                        }}
                        className="text-[11px] font-semibold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy to Section 10.5</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <strong>Examples:</strong> {grp.examples.join(', ')}
                    </p>
                    <p className="text-[11px] text-red-700 font-medium">
                      <strong>Incompatible with:</strong> {grp.incompatibleWith.join(', ')}
                    </p>
                    <p className="text-[11px] text-slate-600 bg-amber-100/60 p-2 rounded border border-amber-200">
                      <strong>Reaction Hazard:</strong> {grp.hazardOutcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsIncompatibilityModalOpen(false);
                  setCurrentView('compatibility_checker');
                }}
                className="px-4 py-2 bg-[#ea580c] hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Full Compatibility Checker & Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsIncompatibilityModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FULL DOCUMENT PRINTABLE PREVIEW WITH QR CODE           */}
      {/* ======================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-[#ea580c]" />
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  Standard GHS 16-Section Safety Data Sheet Preview
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {framework.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body (Printable Formal Layout) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-800 bg-white">
              {/* Header Box with OILSERV Identity & QR */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#ea580c] tracking-wider uppercase">
                      OILSERV ENERGY
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-600">CHEMICAL SAFETY DIVISION</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                    SAFETY DATA SHEET
                  </h1>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Conforms to {framework === 'OSHA_HAZCOM' ? 'OSHA HazCom 2012 (29 CFR 1910.1200)' : framework === 'EU_REACH' ? 'EU REACH / CLP Regulation' : 'UN GHS Rev 10'}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                    <p><strong>Product:</strong> {productIdentifier.split('\n')[0]}</p>
                    <p><strong>Revision:</strong> Rev {revisionNumber} ({revisionDate}) | Supersedes: 15/09/2024</p>
                  </div>
                </div>

                {/* QR Code Verification Badge */}
                <div className="flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center shrink-0">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center shadow-2xs">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 mt-1">
                    DIGITAL SDS QR
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">
                    OS-VERIFY-2026
                  </span>
                </div>
              </div>

              {/* SECTION 1 */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 1: Identification
                </h3>
                <div className="p-3 bg-slate-50 rounded space-y-1">
                  <p><strong>Product Identifier:</strong> {productIdentifier}</p>
                  <p><strong>Other Identifiers:</strong> {otherIdentifiers}</p>
                  <p><strong>Recommended Use:</strong> {recommendedUses}</p>
                  <p><strong>Supplier:</strong> {supplierDetails}</p>
                  <p><strong>24/7 Emergency Phone:</strong> {emergencyPhone}</p>
                </div>
              </div>

              {/* SECTION 2 */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 2: Hazard(s) Identification
                </h3>
                <div className="p-3 bg-slate-50 rounded space-y-2">
                  <p><strong>Classification:</strong> {classificationText}</p>
                  <div className="flex items-center gap-3">
                    <strong>Signal Word:</strong>
                    <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded">
                      {signalWord}
                    </span>
                  </div>
                  <div>
                    <strong className="block mb-1">GHS Pictograms:</strong>
                    <div className="flex items-center gap-2">
                      {selectedPictograms.map((p) => (
                        <GhsPictogram key={p} id={p} size={32} />
                      ))}
                    </div>
                  </div>
                  <p><strong>Hazard Statements:</strong> <span className="whitespace-pre-line">{hStatements}</span></p>
                  <p><strong>Precautionary Statements:</strong> <span className="whitespace-pre-line">{pStatements}</span></p>
                  <p><strong>Other Hazards:</strong> {otherHazards}</p>
                </div>
              </div>

              {/* SECTION 3 */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 3: Composition / Information on Ingredients
                </h3>
                <div className="p-3 bg-slate-50 rounded">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 font-bold text-slate-700">
                        <th className="text-left py-1">Component</th>
                        <th className="text-left py-1">CAS Number</th>
                        <th className="text-left py-1">EC Number</th>
                        <th className="text-left py-1">Concentration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((ing) => (
                        <tr key={ing.id} className="border-b border-slate-200">
                          <td className="py-1">{ing.name}</td>
                          <td className="py-1 font-mono">{ing.casNumber}</td>
                          <td className="py-1">{ing.ecNumber}</td>
                          <td className="py-1">{ing.concentration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4 & 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 4: First-Aid Measures
                  </h3>
                  <div className="p-3 bg-slate-50 rounded space-y-1 text-[11px]">
                    <p><strong>Inhalation:</strong> {faInhalation}</p>
                    <p><strong>Skin:</strong> {faSkin}</p>
                    <p><strong>Eye:</strong> {faEye}</p>
                    <p><strong>Ingestion:</strong> {faIngestion}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 5: Fire-Fighting Measures
                  </h3>
                  <div className="p-3 bg-slate-50 rounded space-y-1 text-[11px]">
                    <p><strong>Extinguishing Media:</strong> {fireSuitable}</p>
                    <p><strong>Combustion Hazards:</strong> {fireHazards}</p>
                    <p><strong>Firefighter Equipment:</strong> {firePpe}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 6 & 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 6: Accidental Release Measures
                  </h3>
                  <div className="p-3 bg-slate-50 rounded space-y-1 text-[11px]">
                    <p><strong>Personal Precautions:</strong> {relPersonal}</p>
                    <p><strong>Environmental:</strong> {relEnvironmental}</p>
                    <p><strong>Cleanup:</strong> {relCleanup}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 7: Handling and Storage
                  </h3>
                  <div className="p-3 bg-slate-50 rounded space-y-1 text-[11px]">
                    <p><strong>Handling:</strong> {handlingPrecautions}</p>
                    <p><strong>Storage:</strong> {storageConditions}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 8 & 9 */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 8: Exposure Controls / Personal Protection
                </h3>
                <div className="p-3 bg-slate-50 rounded space-y-1">
                  <p><strong>Limits:</strong> {exposureLimits.map((l) => `${l.substance} (${l.limitType}: ${l.value} ${l.unit})`).join(' | ')}</p>
                  <p><strong>Eye:</strong> {ppeEye} | <strong>Hand:</strong> {ppeHand} | <strong>Skin:</strong> {ppeSkin}</p>
                  <p><strong>Respiratory:</strong> {ppeRespiratory}</p>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 9: Physical and Chemical Properties
                </h3>
                <div className="p-3 bg-slate-50 rounded grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {physicalProps.filter((p) => p.status === 'Available').map((p) => (
                    <div key={p.id}>
                      <span className="text-slate-500">{p.name}:</span>{' '}
                      <strong>{p.value} {p.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 10 to 16 Condensed Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 10: Stability & Reactivity
                  </h3>
                  <div className="p-3 bg-slate-50 rounded text-[11px] space-y-1">
                    <p><strong>Stability:</strong> {chemicalStability}</p>
                    <p><strong>Incompatible:</strong> {incompatibleMaterials}</p>
                    <p><strong>Decomposition:</strong> {decompositionProducts}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 11: Toxicological Information
                  </h3>
                  <div className="p-3 bg-slate-50 rounded text-[11px] space-y-1">
                    <p><strong>Acute Toxicity:</strong> {toxAcute}</p>
                    <p><strong>Skin / Eye:</strong> {toxSkinCorrosion} / {toxEyeDamage}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 12: Ecological Information
                  </h3>
                  <div className="p-3 bg-slate-50 rounded text-[11px] space-y-1">
                    <p><strong>Toxicity:</strong> {ecoToxicity}</p>
                    <p><strong>Biodegradability:</strong> {ecoBiodegradability}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                    SECTION 13: Disposal Considerations
                  </h3>
                  <div className="p-3 bg-slate-50 rounded text-[11px] space-y-1">
                    <p><strong>Methods:</strong> {disposalWaste}</p>
                    <p><strong>Packaging:</strong> {disposalPackaging}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 14: Transport Information
                </h3>
                <div className="p-3 bg-slate-50 rounded text-[11px] space-y-1">
                  {transportFrameworks.map((tf) => (
                    <p key={tf.framework}>
                      <strong>{tf.framework}:</strong> {tf.unNumber} {tf.shippingName} (Class {tf.hazardClass}, PG {tf.packingGroup})
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm bg-slate-900 text-white px-3 py-1 rounded">
                  SECTION 15 & 16: Regulatory & Other Information
                </h3>
                <div className="p-3 bg-slate-50 rounded text-[11px] space-y-1">
                  <p><strong>Regulations:</strong> {regSafety}</p>
                  <p><strong>Prepared By:</strong> {preparedBy} | <strong>Rev Date:</strong> {revisionDate}</p>
                  <p className="italic text-slate-500 pt-1 border-t border-slate-200">{disclaimer}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                16-Section Safety Data Sheet generated under OILSERV HSE protocols
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleSubmitSdsToPlatform();
                  }}
                  className="px-5 py-2 bg-[#ea580c] hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Document for Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
