import { Chemical } from '../types';

export const SAMPLE_CHEMICALS: Chemical[] = [
  {
    id: 'chem-001',
    productName: 'Cenospheres, All Grades',
    chemicalName: 'Ceramic Microspheres',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'C401',
    casNumber: '93924-19-7',
    physicalState: 'Powder',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-001',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Lead)',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-28T14:30:00Z',
    signalWord: 'WARNING',
    pictograms: ['corrosion'],
    fromSdsLibrary: true,
    batchNumber: 'BATCH-2024-CEN',
    quantity: '500 kg',
    manufacturingDate: '2024-06-15',
    expiryDate: '2026-06-15',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Corrosive to metals (Category 1)',
      'Skin irritation (Category 2)'
    ],
    hStatements: [
      { code: 'H290', statement: 'May be corrosive to metals.', category: 'Corrosive to metals', type: 'hazard' },
      { code: 'H315', statement: 'Causes skin irritation.', category: 'Skin corrosion/irritation', type: 'hazard' },
      { code: 'H319', statement: 'Causes serious eye irritation.', category: 'Serious eye damage', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P260', statement: 'Do not breathe dust/fume/gas/mist/vapors/spray.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'prevention' },
      { code: 'P305+P351+P338', statement: 'IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses if present and easy to do.', type: 'response' },
      { code: 'P403', statement: 'Store in a well-ventilated place.', type: 'storage' }
    ],
    nfpa: {
      health: 1,
      flammability: 0,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 1,
      isChronic: false,
      flammability: 0,
      physicalHazard: 0,
      ppeCode: 'E'
    },
    ppe: {
      eye: 'Safety glasses with side shields or dust goggles.',
      hand: 'Standard protective industrial work gloves.',
      respiratory: 'N95 particulate respirator during bulk handling.',
      body: 'Standard protective coveralls.',
      foot: 'Steel-toe safety boots.'
    },
    emergency: {
      firstAidInhalation: 'Remove victim to fresh air. Rinse mouth with water.',
      firstAidSkin: 'Wash thoroughly with soap and water.',
      firstAidEye: 'Rinse eyes thoroughly with copious water.',
      firstAidIngestion: 'Drink water to dilute. Do NOT induce vomiting.',
      fireResponse: 'Non-combustible. Use media suitable for surrounding fire.',
      spillResponse: 'Vacuum or sweep up using dust suppressant. Avoid generating airborne dust.',
      storageHandling: 'Store in dry place in tightly closed packaging. Keep bags dry.',
      emergencyContact: 'OILSERV HSE 24/7 Hotline: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Lightweight additive used in cementing and drilling fluids formulation.',
    version: '1.0'
  },
  {
    id: 'chem-002',
    productName: 'Norcem Portland Cements',
    chemicalName: 'Portland Cement',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'C402',
    casNumber: '65997-15-1',
    physicalState: 'Powder',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-002',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Marcus Thorne, PE',
    createdAt: '2024-07-02T10:00:00Z',
    updatedAt: '2024-07-28T11:15:00Z',
    signalWord: 'DANGER',
    pictograms: ['corrosion', 'health-hazard'],
    fromSdsLibrary: true,
    batchNumber: 'CEM-2024-NOR',
    quantity: '1,000 kg',
    manufacturingDate: '2024-05-10',
    expiryDate: '2025-05-10',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Skin corrosion/irritation (Category 1)',
      'Serious eye damage (Category 1)',
      'Specific target organ toxicity - single exposure (Category 3, Respiratory irritation)',
      'Carcinogenicity (Category 1A - Quartz/Silica)'
    ],
    hStatements: [
      { code: 'H314', statement: 'Causes severe skin burns and eye damage.', category: 'Skin corrosion/irritation', type: 'hazard' },
      { code: 'H318', statement: 'Causes serious eye damage.', category: 'Serious eye damage', type: 'hazard' },
      { code: 'H335', statement: 'May cause respiratory irritation.', category: 'STOT Single Exposure', type: 'hazard' },
      { code: 'H350', statement: 'May cause cancer through prolonged inhalation of respirable crystalline silica.', category: 'Carcinogenicity', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P260', statement: 'Do not breathe dust.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'prevention' },
      { code: 'P301+P330+P331', statement: 'IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.', type: 'response' },
      { code: 'P305+P351+P338', statement: 'IF IN EYES: Rinse cautiously with water for several minutes.', type: 'response' },
      { code: 'P403+P233', statement: 'Store in a well-ventilated place. Keep container tightly closed.', type: 'storage' }
    ],
    nfpa: {
      health: 2,
      flammability: 0,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 2,
      isChronic: true,
      flammability: 0,
      physicalHazard: 0,
      ppeCode: 'H'
    },
    ppe: {
      eye: 'Tight-fitting chemical splash goggles.',
      hand: 'Heavy-duty waterproof alkali-resistant gloves.',
      respiratory: 'NIOSH approved N95 or P100 particulate respirator.',
      body: 'Long-sleeved impervious coveralls.',
      foot: 'Waterproof steel-toe work boots.'
    },
    emergency: {
      firstAidInhalation: 'Move to fresh air. If irritation persists, consult physician.',
      firstAidSkin: 'Wash skin with water and neutral soap immediately. Treat chemical burns.',
      firstAidEye: 'Flush immediately with copious water for at least 20 minutes.',
      firstAidIngestion: 'Rinse mouth. Drink plenty of water. Do not induce vomiting.',
      fireResponse: 'Non-combustible. Material hardens when in contact with water.',
      spillResponse: 'Collect dry material using HEPA vacuum or shovel into containers. Avoid water.',
      storageHandling: 'Store in moisture-free dry silos or pallets protected from rain and humidity.',
      emergencyContact: 'OILSERV Emergency Operations: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Standard API Class G oil well cement for deepwater casing isolation.',
    version: '2.1'
  },
  {
    id: 'chem-003',
    productName: 'Silica gel, grade 60',
    chemicalName: 'Silicon Dioxide',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'C403',
    casNumber: '7631-86-9',
    physicalState: 'Powder',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-003',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Lead)',
    createdAt: '2024-07-03T11:00:00Z',
    updatedAt: '2024-07-28T09:45:00Z',
    signalWord: 'WARNING',
    pictograms: ['corrosion'],
    fromSdsLibrary: true,
    batchNumber: 'SIL-60-2024',
    quantity: '250 kg',
    manufacturingDate: '2024-06-01',
    expiryDate: '2027-06-01',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Corrosive to metals (Category 1)',
      'Eye irritation (Category 2)'
    ],
    hStatements: [
      { code: 'H290', statement: 'May be corrosive to metals.', category: 'Corrosive to metals', type: 'hazard' },
      { code: 'H319', statement: 'Causes serious eye irritation.', category: 'Serious eye damage', type: 'hazard' },
      { code: 'H335', statement: 'May cause respiratory irritation.', category: 'STOT Single Exposure', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P261', statement: 'Avoid breathing dust.', type: 'prevention' },
      { code: 'P280', statement: 'Wear eye protection/face protection.', type: 'prevention' },
      { code: 'P305+P351+P338', statement: 'IF IN EYES: Rinse cautiously with water for several minutes.', type: 'response' }
    ],
    nfpa: {
      health: 1,
      flammability: 0,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 1,
      isChronic: false,
      flammability: 0,
      physicalHazard: 0,
      ppeCode: 'B'
    },
    ppe: {
      eye: 'Safety glasses with side shields.',
      hand: 'Nitrile laboratory gloves.',
      respiratory: 'Dust mask in enclosed spaces.',
      body: 'Standard laboratory coat or work coverall.',
      foot: 'Closed safety toe footwear.'
    },
    emergency: {
      firstAidInhalation: 'Move person to fresh air.',
      firstAidSkin: 'Wash with water and soap.',
      firstAidEye: 'Irrigate thoroughly with water.',
      firstAidIngestion: 'Rinse mouth with water.',
      fireResponse: 'Use extinguishing measures appropriate to local circumstances.',
      spillResponse: 'Avoid dust generation. Sweep and shovel into suitable containers.',
      storageHandling: 'Keep in tightly closed container. Highly hygroscopic.',
      emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Desiccant and chromatography medium for gas dehydration analysis.',
    version: '1.0'
  },
  {
    id: 'chem-004',
    productName: 'Liquid Hydrogen',
    chemicalName: '(LN₂)',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'LN2-2024-001',
    casNumber: '1333-74-0',
    physicalState: 'Gas',
    sdsRevisionDate: '2024-09-18',
    sdsId: 'sds-004',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'J. Martinez (EHS Specialist)',
    createdAt: '2024-07-04T14:00:00Z',
    updatedAt: '2024-07-28T16:20:00Z',
    signalWord: 'WARNING',
    pictograms: ['gas-cylinder', 'flame', 'exclamation-mark', 'environment'],
    fromSdsLibrary: true,
    batchNumber: 'LN2-2024-001',
    quantity: '30 M³',
    manufacturingDate: '2024-09-18',
    expiryDate: '2025-10-23',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Flammable gases (Category 1)',
      'Gases under pressure (Refrigerated liquefied gas)',
      'Hazardous to aquatic environment, chronic (Category 2)',
      'Aspiration hazard (Category 1)'
    ],
    hStatements: [
      { code: 'H411', statement: 'Very toxic to aquatic organisms, causing long-lasting harm (detailed: May affect whole ecosystem).', category: 'Aquatic Hazard', type: 'hazard' },
      { code: 'H304', statement: 'May be fatal if swallowed and enters airways.', category: 'Aspiration hazard', type: 'hazard' },
      { code: 'H315/H319', statement: '(Irritant, simplified language): Avoid skin and eye contact. Can cause pain, redness, and severe injury.', category: 'Skin/Eye Irritation', type: 'hazard' },
      { code: 'H319', statement: 'Causes serious eye irritation.', category: 'Eye Irritation', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P301+ P310: IF SWALLOWED', statement: 'DO NOT induce vomiting. Call POISON CENTER immediately.', type: 'response' },
      { code: 'P305: IF IN EYES', statement: 'Rinse with water. Remove contact lenses if present and easy to do. (Clearer P305)', type: 'response' },
      { code: 'P370: FIRE', statement: 'Use specialized dry chemical, foam, or water mist. Keep distance! (P370-P378 detailed)', type: 'response' },
      { code: 'STORAGE', statement: 'Store in a well-ventilated place. Keep container tightly closed. Protect from sunlight. Keep away from heat/sparks/open flames. (More comprehensive P403/P410)', type: 'storage' },
      { code: 'P280: HANDLING', statement: 'Use only outdoors or in a well-ventilated area. Wear PPE. Do not release to environment. (Clearer P271)', type: 'prevention' }
    ],
    nfpa: {
      health: 3,
      flammability: 1,
      instability: 1,
      special: 'SA'
    },
    hmis: {
      health: 3,
      isChronic: false,
      flammability: 1,
      physicalHazard: 1,
      ppeCode: 'K'
    },
    ppe: {
      eye: 'Full-Face Shield and Cryogenic Goggles.',
      hand: 'Cryogenic Safety Gloves.',
      respiratory: 'Insulated Protective Suit with SCBA.',
      body: 'Safety Helmet and Thermal Insulated Suit.',
      foot: 'Cryogenic boots with metatarsal protection.'
    },
    emergency: {
      firstAidInhalation: 'Move victim to fresh air. Cryogenic vapors cause rapid asphyxiation. Provide artificial respiration or oxygen if needed.',
      firstAidSkin: 'In case of cryogenic frostbite, warm gently with warm water (not hot). Do not rub frozen parts. Seek emergency medical attention.',
      firstAidEye: 'Immediately flush eyes with gentle stream of lukewarm water for at least 20 minutes.',
      firstAidIngestion: 'Not a probable route of exposure. Cryogenic temperatures cause instant destruction of tissue.',
      fireResponse: 'Extremely flammable gas. Stop gas flow before attempting to extinguish flame. Use fine water spray to cool cryogenic tanks.',
      spillResponse: 'Evacuate area immediately. Shut off all ignition sources. Disperse vapor clouds with fine water spray. Do not spray water directly on liquid spill.',
      storageHandling: 'Store in certified vacuum-jacketed cryogenic dewars and bulk tanks equipped with dual relief valves.',
      emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Cryogenic liquefied gas container for high-pressure gas lifting operations. Matches Oilserv Energy Solutions official hazard placard format.',
    version: '1.0'
  },
  {
    id: 'chem-005',
    productName: 'Liquid Nitrogen (LN2)',
    chemicalName: 'Cryogenic Liquid Nitrogen',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'LN2-02',
    casNumber: '7727-37-9',
    physicalState: 'Gas',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-005',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Dr. Sarah Vance, CSP',
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-07-28T15:00:00Z',
    signalWord: 'WARNING',
    pictograms: ['gas-cylinder'],
    fromSdsLibrary: true,
    batchNumber: 'LN2-BULK-02',
    quantity: '20,000 Liters',
    manufacturingDate: '2024-07-10',
    expiryDate: '2025-07-10',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Gases under pressure (Refrigerated liquefied gas)',
      'Simple Asphyxiants'
    ],
    hStatements: [
      { code: 'H281', statement: 'Contains refrigerated gas; may cause cryogenic burns or injury.', category: 'Gases under pressure', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P282', statement: 'Wear cold insulating gloves and either face shield or eye protection.', type: 'prevention' },
      { code: 'P336+P315', statement: 'Thaw frosted parts with lukewarm water. Do not rub affected area. Get immediate medical advice/attention.', type: 'response' },
      { code: 'P403', statement: 'Store in a well-ventilated place.', type: 'storage' }
    ],
    nfpa: {
      health: 3,
      flammability: 0,
      instability: 0,
      special: 'SA'
    },
    hmis: {
      health: 3,
      isChronic: false,
      flammability: 0,
      physicalHazard: 0,
      ppeCode: 'K'
    },
    ppe: {
      eye: 'Cryogenic full face shield with safety goggles.',
      hand: 'Loose-fitting cryogenic safety gloves.',
      respiratory: 'Self-contained breathing apparatus in enclosed vessels.',
      body: 'Cryogenic insulated apron.',
      foot: 'Leather safety boots without laces.'
    },
    emergency: {
      firstAidInhalation: 'Move victim to fresh air. If not breathing, give CPR. Asphyxiant danger.',
      firstAidSkin: 'Flush frostbitten tissue with lukewarm water. Do not rub.',
      firstAidEye: 'Flush with water for 15 minutes. Urgent hospital transport.',
      firstAidIngestion: 'Immediate emergency hospital transfer.',
      fireResponse: 'Non-flammable. Cool container with water spray from protected location.',
      spillResponse: 'Evacuate area. Do not spray water on liquid nitrogen leak.',
      storageHandling: 'Store in dedicated vented cryogenic tanks with pressure relief devices.',
      emergencyContact: 'OILSERV Dispatch: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Used for well purging, gas lift startup, and pipeline displacement.',
    version: '1.0'
  },
  {
    id: 'chem-006',
    productName: 'Xylenes',
    chemicalName: 'Dimethylbenzene, Mixed Isomers',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'C405',
    casNumber: '1330-20-7',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-006',
    status: 'under_review',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Marcus Thorne, PE',
    createdAt: '2024-07-06T13:00:00Z',
    updatedAt: '2024-07-28T10:00:00Z',
    signalWord: 'DANGER',
    pictograms: ['flame', 'health-hazard', 'exclamation-mark'],
    fromSdsLibrary: true,
    batchNumber: 'XYL-2024-09',
    quantity: '200 Liters',
    manufacturingDate: '2024-06-20',
    expiryDate: '2026-06-20',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Flammable liquids (Category 3)',
      'Acute toxicity, Dermal (Category 4)',
      'Acute toxicity, Inhalation (Category 4)',
      'Skin irritation (Category 2)',
      'Aspiration hazard (Category 1)'
    ],
    hStatements: [
      { code: 'H226', statement: 'Flammable liquid and vapor.', category: 'Flammable liquids', type: 'hazard' },
      { code: 'H304', statement: 'May be fatal if swallowed and enters airways.', category: 'Aspiration hazard', type: 'hazard' },
      { code: 'H312', statement: 'Harmful in contact with skin.', category: 'Acute toxicity, dermal', type: 'hazard' },
      { code: 'H315', statement: 'Causes skin irritation.', category: 'Skin corrosion/irritation', type: 'hazard' },
      { code: 'H332', statement: 'Harmful if inhaled.', category: 'Acute toxicity, inhalation', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P210', statement: 'Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'prevention' },
      { code: 'P301+P310', statement: 'IF SWALLOWED: Immediately call a POISON CENTER or doctor/physician.', type: 'response' },
      { code: 'P331', statement: 'Do NOT induce vomiting.', type: 'response' },
      { code: 'P403+P235', statement: 'Store in a well-ventilated place. Keep cool.', type: 'storage' }
    ],
    nfpa: {
      health: 2,
      flammability: 3,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 2,
      isChronic: true,
      flammability: 3,
      physicalHazard: 0,
      ppeCode: 'H'
    },
    ppe: {
      eye: 'Chemical splash goggles.',
      hand: 'Viton or PVA chemical-resistant gloves.',
      respiratory: 'Organic vapor cartridge respirator.',
      body: 'Flame-resistant anti-static coveralls.',
      foot: 'Conductive steel-toe safety boots.'
    },
    emergency: {
      firstAidInhalation: 'Move to fresh air. Administer oxygen if breathing is labored.',
      firstAidSkin: 'Wash thoroughly with soap and water.',
      firstAidEye: 'Flush with water for 15 minutes holding eyelids open.',
      firstAidIngestion: 'DO NOT INDUCE VOMITING due to chemical pneumonitis risk. Seek emergency care.',
      fireResponse: 'Use dry chemical, foam, or carbon dioxide. Cool tanks with water spray.',
      spillResponse: 'Eliminate ignition sources. Absorb with non-combustible material.',
      storageHandling: 'Store in grounded flammable liquid storage cabinet.',
      emergencyContact: 'OILSERV Emergency Hotline: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Solvent wash for asphaltene and paraffin remediation.',
    version: '1.2'
  },
  {
    id: 'chem-007',
    productName: 'Ammonium chloride',
    chemicalName: 'Sal Ammoniac',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'C406',
    casNumber: '12125-02-9',
    physicalState: 'Solid',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-007',
    status: 'draft',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Dr. Sarah Vance, CSP',
    createdAt: '2024-07-07T08:30:00Z',
    updatedAt: '2024-07-28T14:10:00Z',
    signalWord: 'WARNING',
    pictograms: ['exclamation-mark'],
    fromSdsLibrary: true,
    batchNumber: 'NH4CL-2024',
    quantity: '1,000 kg',
    manufacturingDate: '2024-06-05',
    expiryDate: '2026-06-05',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Acute toxicity, Oral (Category 4)',
      'Eye irritation (Category 2)'
    ],
    hStatements: [
      { code: 'H302', statement: 'Harmful if swallowed.', category: 'Acute toxicity, oral', type: 'hazard' },
      { code: 'H319', statement: 'Causes serious eye irritation.', category: 'Eye irritation', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P264', statement: 'Wash hands thoroughly after handling.', type: 'prevention' },
      { code: 'P280', statement: 'Wear eye protection/face protection.', type: 'prevention' },
      { code: 'P305+P351+P338', statement: 'IF IN EYES: Rinse cautiously with water for several minutes.', type: 'response' }
    ],
    nfpa: {
      health: 2,
      flammability: 0,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 2,
      isChronic: false,
      flammability: 0,
      physicalHazard: 0,
      ppeCode: 'B'
    },
    ppe: {
      eye: 'Safety glasses with side protection.',
      hand: 'Rubber or nitrile gloves.',
      respiratory: 'Particulate respirator in dusty conditions.',
      body: 'Standard industrial work clothing.',
      foot: 'Safety shoes.'
    },
    emergency: {
      firstAidInhalation: 'Move to fresh air.',
      firstAidSkin: 'Wash with soap and water.',
      firstAidEye: 'Rinse with water for at least 15 minutes.',
      firstAidIngestion: 'Rinse mouth. Drink water. Seek medical advice.',
      fireResponse: 'Non-combustible. Toxic fumes of ammonia and hydrogen chloride emitted in heat.',
      spillResponse: 'Sweep up carefully and place into sealed containers.',
      storageHandling: 'Store in dry place. Keep container tightly sealed.',
      emergencyContact: 'OILSERV HSE Hotline: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Clay stabilizer and completion brine component.',
    version: '1.0'
  },
  {
    id: 'chem-008',
    productName: 'Crude Oil',
    chemicalName: 'Petroleum, crude oil',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'C402',
    casNumber: '8002-05-9',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-008',
    status: 'rejected',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Marcus Thorne, PE',
    createdAt: '2024-07-08T10:00:00Z',
    updatedAt: '2024-07-28T16:00:00Z',
    signalWord: 'DANGER',
    pictograms: ['flame', 'health-hazard'],
    fromSdsLibrary: true,
    batchNumber: 'BATCH-2024-001',
    quantity: '10 Liters, 500 kg',
    manufacturingDate: '2024-07-01',
    expiryDate: '2026-07-01',
    substancesIdentity: 'Benzene (CAS 71-43-2), Toluene (CAS 108-88-3), H2S (CAS 7783-06-4)',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Flammable liquids (Category 2)',
      'Carcinogenicity (Category 1B)',
      'Germ cell mutagenicity (Category 1B)',
      'Aspiration hazard (Category 1)'
    ],
    hStatements: [
      { code: 'H225', statement: 'Highly flammable liquid and vapor.', category: 'Flammable liquids', type: 'hazard' },
      { code: 'H304', statement: 'May be fatal if swallowed and enters airways.', category: 'Aspiration hazard', type: 'hazard' },
      { code: 'H340', statement: 'May cause genetic defects.', category: 'Germ cell mutagenicity', type: 'hazard' },
      { code: 'H350', statement: 'May cause cancer (Benzene component).', category: 'Carcinogenicity', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P201', statement: 'Obtain special instructions before use.', type: 'prevention' },
      { code: 'P210', statement: 'Keep away from heat, hot surfaces, sparks, open flames. No smoking.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'prevention' },
      { code: 'P301+P310', statement: 'IF SWALLOWED: Immediately call a POISON CENTER or doctor/physician.', type: 'response' },
      { code: 'P331', statement: 'Do NOT induce vomiting.', type: 'response' }
    ],
    nfpa: {
      health: 2,
      flammability: 3,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 2,
      isChronic: true,
      flammability: 3,
      physicalHazard: 0,
      ppeCode: 'H'
    },
    ppe: {
      eye: 'Chemical splash goggles.',
      hand: 'Heavy nitrile or neoprene chemical gauntlets.',
      respiratory: 'Multi-gas / organic vapor cartridge with H2S sensor.',
      body: 'Flame-retardant anti-static overalls.',
      foot: 'Conductive steel-toe boots.'
    },
    emergency: {
      firstAidInhalation: 'Move to fresh air. Watch for hydrogen sulfide asphyxiation.',
      firstAidSkin: 'Wash with copious soap and water.',
      firstAidEye: 'Flush with water for 15 minutes.',
      firstAidIngestion: 'Do not induce vomiting. Immediate emergency call.',
      fireResponse: 'Use dry chemical, foam, or water spray.',
      spillResponse: 'Deploy containment booms and absorbent barriers.',
      storageHandling: 'Store in explosion-proof bulk tanks with vapor recovery.',
      emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Sample from Delta Production Platform wellhead test separator.',
    version: '1.0'
  },
  {
    id: 'chem-009',
    productName: 'Methanol (Hydrate Inhibitor Grade)',
    chemicalName: 'Methyl Alcohol',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'APX-MEOH-998',
    casNumber: '67-56-1',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-009',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Dr. Sarah Vance, CSP',
    createdAt: '2024-07-09T08:00:00Z',
    updatedAt: '2024-07-28T14:30:00Z',
    signalWord: 'DANGER',
    pictograms: ['flame', 'skull-and-crossbones', 'health-hazard'],
    fromSdsLibrary: true,
    batchNumber: 'MEOH-2024-11',
    quantity: '5,000 Liters',
    manufacturingDate: '2024-06-18',
    expiryDate: '2026-06-18',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Flammable liquids (Category 2)',
      'Acute toxicity, Oral (Category 3)',
      'Acute toxicity, Dermal (Category 3)',
      'Specific target organ toxicity - single exposure (Category 1, Optic nerve/CNS)'
    ],
    hStatements: [
      { code: 'H225', statement: 'Highly flammable liquid and vapor.', category: 'Flammable liquids', type: 'hazard' },
      { code: 'H301', statement: 'Toxic if swallowed.', category: 'Acute toxicity, oral', type: 'hazard' },
      { code: 'H311', statement: 'Toxic in contact with skin.', category: 'Acute toxicity, dermal', type: 'hazard' },
      { code: 'H370', statement: 'Causes damage to organs (Eyes, Central Nervous System).', category: 'STOT Single Exposure', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P210', statement: 'Keep away from heat, hot surfaces, sparks, open flames. No smoking.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'prevention' },
      { code: 'P301+P310', statement: 'IF SWALLOWED: Immediately call a POISON CENTER or doctor/physician.', type: 'response' },
      { code: 'P403+P235', statement: 'Store in a well-ventilated place. Keep cool.', type: 'storage' }
    ],
    nfpa: {
      health: 3,
      flammability: 3,
      instability: 0,
      special: ''
    },
    hmis: {
      health: 3,
      isChronic: true,
      flammability: 3,
      physicalHazard: 0,
      ppeCode: 'H'
    },
    ppe: {
      eye: 'Chemical splash goggles with face shield.',
      hand: 'Butyl rubber gauntlet gloves.',
      respiratory: 'Supplied air respirator in confined spaces.',
      body: 'Anti-static chemical coveralls.',
      foot: 'Conductive steel-toe boots.'
    },
    emergency: {
      firstAidInhalation: 'Move to fresh air. Provide CPR if not breathing.',
      firstAidSkin: 'Flush with copious water for 15 minutes.',
      firstAidEye: 'Irrigate eyes with gentle stream for 20 minutes.',
      firstAidIngestion: 'Rinse mouth. Seek immediate emergency medical care with fomepizole/ethanol protocol.',
      fireResponse: 'Use alcohol-resistant foam, dry chemical, or CO2.',
      spillResponse: 'Dike with non-combustible material. Use explosion-proof pumps.',
      storageHandling: 'Store in dedicated Class IB flammable room with flame arresters.',
      emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Subsea flowline hydrate prevention injection fluid.',
    version: '1.2'
  },
  {
    id: 'chem-010',
    productName: 'Hydrochloric Acid 32%',
    chemicalName: 'Well Stimulation Grade Acid',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'GWS-ACID-32',
    casNumber: '7647-01-0',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-07-28',
    sdsId: 'sds-010',
    status: 'approved',
    lastReviewedDate: '2024-07-28',
    lastReviewedBy: 'Marcus Thorne, PE',
    createdAt: '2024-07-10T10:00:00Z',
    updatedAt: '2024-07-28T11:15:00Z',
    signalWord: 'DANGER',
    pictograms: ['corrosion', 'exclamation-mark'],
    fromSdsLibrary: true,
    batchNumber: 'HCL-32-2024',
    quantity: '10,000 Liters',
    manufacturingDate: '2024-07-05',
    expiryDate: '2025-07-05',
    supplierAddress: 'Plot 10, Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    hazardClasses: [
      'Corrosive to metals (Category 1)',
      'Skin corrosion/irritation (Category 1B)',
      'Serious eye damage (Category 1)',
      'Specific target organ toxicity - single exposure (Category 3, Respiratory irritation)'
    ],
    hStatements: [
      { code: 'H290', statement: 'May be corrosive to metals.', category: 'Corrosive to metals', type: 'hazard' },
      { code: 'H314', statement: 'Causes severe skin burns and eye damage.', category: 'Skin corrosion/irritation', type: 'hazard' },
      { code: 'H335', statement: 'May cause respiratory irritation.', category: 'STOT Single Exposure', type: 'hazard' }
    ],
    pStatements: [
      { code: 'P260', statement: 'Do not breathe vapor.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/protective clothing/eye protection/face protection.', type: 'prevention' },
      { code: 'P301+P330+P331', statement: 'IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.', type: 'response' },
      { code: 'P305+P351+P338', statement: 'IF IN EYES: Rinse cautiously with water for several minutes.', type: 'response' },
      { code: 'P406', statement: 'Store in a corrosion resistant container with a resistant inner liner.', type: 'storage' }
    ],
    nfpa: {
      health: 3,
      flammability: 0,
      instability: 1,
      special: 'ACID'
    },
    hmis: {
      health: 3,
      isChronic: false,
      flammability: 0,
      physicalHazard: 1,
      ppeCode: 'J'
    },
    ppe: {
      eye: 'Tight-fitting chemical splash goggles with acid face shield.',
      hand: 'Heavy-duty neoprene acid gauntlets.',
      respiratory: 'Acid gas cartridge respirator or supplied air line.',
      body: 'Acid-resistant PVC slicker suit.',
      foot: 'Acid-resistant steel-toe boots.'
    },
    emergency: {
      firstAidInhalation: 'Move victim to fresh air. Provide humidified oxygen if coughing.',
      firstAidSkin: 'Deluge skin with emergency shower for at least 20 minutes.',
      firstAidEye: 'Irrigate continuously for 30 minutes. Transport to emergency ophthalmic center.',
      firstAidIngestion: 'Rinse mouth. DO NOT induce vomiting. Give small sips of water.',
      fireResponse: 'Non-combustible. Reacts with metals producing explosive hydrogen gas.',
      spillResponse: 'Neutralize with lime slurry or soda ash. Absorb with inert material.',
      storageHandling: 'Store in rubber-lined steel or cross-linked polyethylene tanks.',
      emergencyContact: 'OILSERV Emergency Response: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678'
    },
    notes: 'Well matrix acidizing fluid for carbonate reservoir stimulation.',
    version: '2.0'
  }
];
