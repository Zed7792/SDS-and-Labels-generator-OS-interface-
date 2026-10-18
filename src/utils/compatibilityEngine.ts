import { Chemical } from '../types';

export type CompatibilityStatus = 'INCOMPATIBLE' | 'CONDITIONAL' | 'COMPATIBLE' | 'SAME_PRODUCT';
export type ReactionSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'NEGLIGIBLE';

export type ReactivityGroup =
  | 'STRONG_MINERAL_ACID'
  | 'STRONG_OXIDIZING_ACID'
  | 'ORGANIC_ACID'
  | 'STRONG_BASE_CAUSTIC'
  | 'FLAMMABLE_HYDROCARBON'
  | 'ALCOHOL_SOLVENT'
  | 'STRONG_OXIDIZER'
  | 'WATER_REACTIVE'
  | 'SULFIDE_REACTIVE'
  | 'AMMONIUM_SALT'
  | 'INERT_MINERAL'
  | 'CRYOGENIC_INERT'
  | 'CRYOGENIC_FLAMMABLE'
  | 'BIOCIDE_ORGANIC';

export interface CompatibilityResult {
  chemA: Chemical;
  chemB: Chemical;
  status: CompatibilityStatus;
  severity: ReactionSeverity;
  score: number; // 0 (catastrophic) to 100 (completely safe)
  headline: string;
  chemicalMechanisms: string;
  reactions: {
    heatGeneration: boolean;
    heatDetails?: string;
    fireRisk: boolean;
    fireDetails?: string;
    toxicGas: boolean;
    toxicGases?: string[];
    flammableGas: boolean;
    flammableGases?: string[];
    splatteringOrPolymerization: boolean;
    corrosionOfContainer: boolean;
  };
  regulatoryRequirements: {
    minimumSeparationDistance: string; // e.g. "Minimum 20 ft (6.1 m) or 1-hour liquid-tight fire barrier"
    containmentRule: string; // e.g. "Dedicated secondary containment berm (110% volume) with isolated sump"
    oshaCitation: string;
    nfpaCitation: string;
    epaGroupPair: string;
  };
  emergencyProtocol: {
    ergGuideNumber: string;
    firstAction: string;
    fireExtinguisherProhibition?: string;
    neutralizationAgent?: string;
    isolationDistance: string;
  };
  handlingPpe: string[];
}

export interface StorageBayAuditResult {
  bayName: string;
  chemicals: Chemical[];
  totalPairCount: number;
  incompatiblePairCount: number;
  conditionalPairCount: number;
  compatiblePairCount: number;
  complianceScore: number; // 0 - 100%
  overallRating: 'CRITICAL_RISK' | 'HIGH_RISK' | 'CAUTION_REQUIRED' | 'OPTIMAL_SAFE';
  violations: {
    chemA: Chemical;
    chemB: Chemical;
    headline: string;
    severity: ReactionSeverity;
    directive: string;
  }[];
  recommendations: string[];
}

/**
 * Maps a Chemical entity to its primary and secondary EPA/NOAA Reactivity Groups.
 */
export function getReactivityGroups(chem: Chemical): ReactivityGroup[] {
  const name = `${chem.productName} ${chem.chemicalName} ${chem.notes || ''}`.toLowerCase();
  const cas = chem.casNumber || '';
  const hazardClasses = (chem.hazardClasses || []).map(h => h.toLowerCase()).join(' ');
  const groups: ReactivityGroup[] = [];

  // Strong Mineral Acids
  if (
    cas === '7647-01-0' || // Hydrochloric
    name.includes('hydrochloric') ||
    name.includes('sulfuric acid') ||
    name.includes('hydrofluoric') ||
    (chem.nfpa?.special === 'ACID' && name.includes('acid'))
  ) {
    groups.push('STRONG_MINERAL_ACID');
  }

  // Strong Oxidizing Acids (Nitric, Perchloric)
  if (name.includes('nitric acid') || cas === '7697-37-2' || name.includes('perchloric')) {
    groups.push('STRONG_OXIDIZING_ACID');
  }

  // Organic Acids
  if (name.includes('acetic acid') || name.includes('citric acid') || name.includes('formic acid')) {
    groups.push('ORGANIC_ACID');
  }

  // Caustics / Strong Bases
  if (
    name.includes('sodium hydroxide') ||
    name.includes('caustic soda') ||
    name.includes('potassium hydroxide') ||
    name.includes('lime') ||
    chem.nfpa?.special === 'ALK'
  ) {
    groups.push('STRONG_BASE_CAUSTIC');
  }

  // Strong Oxidizers
  if (
    name.includes('ammonium persulfate') ||
    name.includes('sodium hypochlorite') ||
    name.includes('hydrogen peroxide') ||
    name.includes('bleach') ||
    name.includes('chlorite') ||
    name.includes('gel breaker') ||
    chem.nfpa?.special === 'OX'
  ) {
    groups.push('STRONG_OXIDIZER');
  }

  // Flammable Hydrocarbons
  if (
    cas === '8002-05-9' || // Crude Oil
    name.includes('crude oil') ||
    name.includes('diesel') ||
    name.includes('xylene') ||
    name.includes('toluene') ||
    name.includes('petroleum') ||
    (hazardClasses.includes('flammable liquids') && !name.includes('methanol') && !name.includes('alcohol'))
  ) {
    groups.push('FLAMMABLE_HYDROCARBON');
  }

  // Alcohols / Solvents
  if (
    cas === '67-56-1' || // Methanol
    name.includes('methanol') ||
    name.includes('alcohol') ||
    name.includes('isopropanol') ||
    name.includes('glycol')
  ) {
    groups.push('ALCOHOL_SOLVENT');
  }

  // Water-Reactive Substances
  if (
    chem.nfpa?.special === 'W' ||
    name.includes('calcium carbide') ||
    name.includes('sodium metal') ||
    hazardClasses.includes('in contact with water emits flammable gas')
  ) {
    groups.push('WATER_REACTIVE');
  }

  // Sulfides & Sulfide Scavengers
  if (name.includes('sulfide') || name.includes('h2s scavenger') || name.includes('iron sulfide')) {
    groups.push('SULFIDE_REACTIVE');
  }

  // Ammonium Salts
  if (cas === '12125-02-9' || name.includes('ammonium chloride') || name.includes('ammonium')) {
    if (!groups.includes('STRONG_OXIDIZER')) {
      groups.push('AMMONIUM_SALT');
    }
  }

  // Cryogenic Gases
  if (cas === '7727-37-9' || name.includes('liquid nitrogen') || name.includes('ln2')) {
    groups.push('CRYOGENIC_INERT');
  }
  if (cas === '1333-74-0' || name.includes('liquid hydrogen')) {
    groups.push('CRYOGENIC_FLAMMABLE');
  }

  // Inerts & Mineral Powders
  if (
    name.includes('cenosphere') ||
    name.includes('portland cement') ||
    name.includes('silica gel') ||
    name.includes('barite') ||
    name.includes('bentonite')
  ) {
    groups.push('INERT_MINERAL');
  }

  // Fallback defaults based on GHS pictograms & physical state
  if (groups.length === 0) {
    if (chem.pictograms?.includes('flame')) groups.push('FLAMMABLE_HYDROCARBON');
    else if (chem.pictograms?.includes('corrosion')) groups.push('STRONG_MINERAL_ACID');
    else groups.push('INERT_MINERAL');
  }

  return groups;
}

/**
 * Calculates chemical pairwise compatibility following NOAA Chemical Reactivity Worksheet (CRW4),
 * EPA Incompatibility Chart (EPA-600/2-80-076), and OSHA 1910.106 / NFPA 400.
 */
export function evaluatePairCompatibility(chemA: Chemical, chemB: Chemical): CompatibilityResult {
  if (chemA.id === chemB.id) {
    return {
      chemA,
      chemB,
      status: 'SAME_PRODUCT',
      severity: 'NEGLIGIBLE',
      score: 100,
      headline: 'Self-Comparison (Identical Chemical Product)',
      chemicalMechanisms: 'Identical products may be stored in the same secondary containment or tank battery without cross-reactivity.',
      reactions: {
        heatGeneration: false,
        fireRisk: false,
        toxicGas: false,
        flammableGas: false,
        splatteringOrPolymerization: false,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'None (Same Product)',
        containmentRule: 'Standard NFPA 30 / EPA secondary containment for single product type.',
        oshaCitation: '29 CFR 1910.1200 HazCom',
        nfpaCitation: 'NFPA 400 Chapter 6',
        epaGroupPair: 'Identical',
      },
      emergencyProtocol: {
        ergGuideNumber: 'Standard ERG',
        firstAction: 'Refer to individual product SDS.',
        isolationDistance: 'Standard operational perimeter',
      },
      handlingPpe: ['Standard facility PPE', 'Hard hat & safety footwear'],
    };
  }

  const groupsA = getReactivityGroups(chemA);
  const groupsB = getReactivityGroups(chemB);

  const hasGroup = (g: ReactivityGroup) => groupsA.includes(g) || groupsB.includes(g);
  const hasBoth = (g1: ReactivityGroup, g2: ReactivityGroup) =>
    (groupsA.includes(g1) && groupsB.includes(g2)) || (groupsA.includes(g2) && groupsB.includes(g1));

  // 1. Strong Mineral Acid + Strong Base/Caustic (e.g. HCl + NaOH)
  if (hasBoth('STRONG_MINERAL_ACID', 'STRONG_BASE_CAUSTIC')) {
    return {
      chemA,
      chemB,
      status: 'INCOMPATIBLE',
      severity: 'CRITICAL',
      score: 5,
      headline: 'PROHIBITED CO-STORAGE: Violent Exothermic Neutralization & Boiling',
      chemicalMechanisms:
        'Mixing mineral acid with strong caustic generates an extremely violent neutralization reaction (ΔH = -57.3 kJ/mol). The localized temperature surge rapidly exceeds 100°C, causing instantaneous boiling, thermal expansion, violent splattering of boiling corrosive slurry, and dense acid/caustic aerosol fumes.',
      reactions: {
        heatGeneration: true,
        heatDetails: 'Intense exotherm (ΔH ≈ -57 kJ/mol). Flash steam generation and boiling surge.',
        fireRisk: false,
        toxicGas: true,
        toxicGases: ['Corrosive HCl / caustic aerosol vapor mist'],
        flammableGas: false,
        splatteringOrPolymerization: true,
        corrosionOfContainer: true,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Minimum 20 feet (6.1 m) or 1-hour liquid-tight fire barrier wall (NFPA 400 6.2.1.9).',
        containmentRule: 'Strictly segregated 110% secondary containment berms. Forbidden to share common floor drains or trenches.',
        oshaCitation: 'OSHA 1910.1200 / 1910.1450 & CFR 1910.106',
        nfpaCitation: 'NFPA 400 (Hazardous Materials Code) § 6.2.1.9.3.2',
        epaGroupPair: 'EPA Group 1 (Acids, Mineral) vs Group 10 (Caustics)',
      },
      emergencyProtocol: {
        ergGuideNumber: '154 (Substances - Toxic and/or Corrosive)',
        firstAction: 'Do NOT co-mingle runoff. Do not attempt direct neutralization of large uncontained pools without cooling deluge.',
        isolationDistance: 'Immediate evacuation perimeter: 100 meters downwind.',
        neutralizationAgent: 'Controlled dilution with copious cold water or buffered spill kit.',
      },
      handlingPpe: [
        'Level B / C Chemical splash suit (Viton or heavy PVC)',
        'Full face shield with tight chemical splash goggles',
        'Heavy neoprene or butyl rubber gauntlet gloves',
        'Acid/alkali-resistant steel toe safety boots',
      ],
    };
  }

  // 2. Strong Mineral Acid + Strong Oxidizer / Hypochlorite (e.g. HCl + Bleach)
  if (
    hasBoth('STRONG_MINERAL_ACID', 'STRONG_OXIDIZER') ||
    (hasGroup('STRONG_MINERAL_ACID') && (chemA.productName.toLowerCase().includes('bleach') || chemB.productName.toLowerCase().includes('bleach') || chemA.productName.toLowerCase().includes('hypochlorite') || chemB.productName.toLowerCase().includes('hypochlorite')))
  ) {
    return {
      chemA,
      chemB,
      status: 'INCOMPATIBLE',
      severity: 'CRITICAL',
      score: 0,
      headline: 'LETHAL TOXIC GAS GENERATION: Deadly Chlorine Gas (Cl2) Ejection',
      chemicalMechanisms:
        'Acidification of hypochlorite solutions or persulfate oxidizers drives instantaneous chemical reduction, liberating lethal yellow-green Chlorine gas (Cl2) and hypochlorous acid vapor. Chlorine gas is a severe pulmonary irritant and choking agent causing acute chemical pulmonary edema and rapid fatality at concentrations > 30 ppm.',
      reactions: {
        heatGeneration: true,
        heatDetails: 'Rapid exotherm with vigorous effervescence and pressure spike.',
        fireRisk: true,
        fireDetails: 'Chlorine is a powerful oxidizer that can initiate combustion of organic materials.',
        toxicGas: true,
        toxicGases: ['Lethal Chlorine Gas (Cl2)', 'Hydrogen Chloride (HCl)', 'Dichlorine Monoxide (Cl2O)'],
        flammableGas: false,
        splatteringOrPolymerization: true,
        corrosionOfContainer: true,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Strict physical isolation: Minimum 30 feet (9.1 m) with separate exhaust ventilation.',
        containmentRule: 'Independent acid-proof berm and dedicated oxidizer containment. Prohibited from sharing ventilation ducts.',
        oshaCitation: 'OSHA 1910.119 Process Safety Management (PSM Highly Hazardous Chemicals)',
        nfpaCitation: 'NFPA 400 § 15.3 (Oxidizers) & NFPA 1 (Fire Code)',
        epaGroupPair: 'EPA Group 1 (Acids) vs EPA Group 64 (Oxidizing Agents)',
      },
      emergencyProtocol: {
        ergGuideNumber: '124 (Gases - Toxic and/or Corrosive - Oxidizing)',
        firstAction: 'Sound facility EOC toxic gas alarm. Immediate upwind evacuation. Deploy gas detection sensors.',
        isolationDistance: 'Immediate downwind isolation: 300 meters; Night evacuation: 800 meters.',
        neutralizationAgent: 'Dilute sodium bisulfite or thiosulfate neutralizer under SCBA protection.',
      },
      handlingPpe: [
        'Positive-pressure SCBA (Self-Contained Breathing Apparatus)',
        'Level A Fully Encapsulated Vapor-Protective Hazmat Suit',
        'Chlorine gas personal detector with audible alarm',
      ],
    };
  }

  // 3. Strong Oxidizer + Flammable Hydrocarbon / Alcohol (e.g. Ammonium Persulfate + Crude Oil/Diesel/Methanol)
  if (
    (hasGroup('STRONG_OXIDIZER') && hasGroup('FLAMMABLE_HYDROCARBON')) ||
    (hasGroup('STRONG_OXIDIZER') && hasGroup('ALCOHOL_SOLVENT'))
  ) {
    return {
      chemA,
      chemB,
      status: 'INCOMPATIBLE',
      severity: 'CRITICAL',
      score: 10,
      headline: 'CATASTROPHIC EXPLOSION & FIRE: Rapid Deflagration Hazard',
      chemicalMechanisms:
        'Strong oxidizers (persulfates, peroxides, hypochlorites) dramatically reduce the activation energy of flammable liquid hydrocarbons and alcohols. Contact initiates rapid exothermic oxidation, thermal autoignition, and catastrophic deflagration or vapor cloud explosion (BLEVE) without an external spark.',
      reactions: {
        heatGeneration: true,
        heatDetails: 'Extreme thermal output with rapid runaway reaction.',
        fireRisk: true,
        fireDetails: 'Immediate ignition. Self-sustaining combustion requiring specialized foam suppression.',
        toxicGas: true,
        toxicGases: ['Carbon Monoxide (CO)', 'Sulfur Dioxide (SO2)', 'Dense Carbon Black & Hydrocarbon Vapors'],
        flammableGas: false,
        splatteringOrPolymerization: true,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Minimum 25 feet (7.6 m) or 2-hour rated fire wall (OSHA 1910.106(d)(5)).',
        containmentRule: 'Liquid-tight containment berms with explosion-proof Class 1 Div 1 electrical ratings.',
        oshaCitation: 'OSHA 29 CFR 1910.106 (Flammable and Combustible Liquids)',
        nfpaCitation: 'NFPA 30 (Flammable Liquids) § 9.5 & NFPA 400 § 15.2',
        epaGroupPair: 'EPA Group 64 (Oxidizers) vs EPA Group 26 (Hydrocarbons) / Group 4 (Alcohols)',
      },
      emergencyProtocol: {
        ergGuideNumber: '128 (Flammable Liquids - Water-Immiscible) / 140 (Oxidizers)',
        firstAction: 'Activate deluge foam system (AFFF / AR-AFFF). Cut electrical breakers to zone.',
        fireExtinguisherProhibition: 'Do NOT use Halon or dry chemical solely; requires copious cooling water deluge or foam blanket.',
        isolationDistance: 'Immediate fire evacuation radius: 800 meters in all directions.',
      },
      handlingPpe: [
        'Flame-retardant anti-static Nomex coveralls',
        'Multi-gas / Organic vapor respirator with particulate filter',
        'Chemical-resistant nitrile/Viton gloves with thermal underlayer',
        'Conductive static-dissipating safety boots',
      ],
    };
  }

  // 4. Strong Acid + Sulfides / Cyanides (e.g. HCl + Iron Sulfide / H2S scavenger)
  if (hasBoth('STRONG_MINERAL_ACID', 'SULFIDE_REACTIVE')) {
    return {
      chemA,
      chemB,
      status: 'INCOMPATIBLE',
      severity: 'CRITICAL',
      score: 0,
      headline: 'LETHAL TOXIC GAS EMISSION: Hydrogen Sulfide (H2S) Evolution',
      chemicalMechanisms:
        'Mineral acid contact with metallic sulfides or spent sulfide scavengers liberates toxic Hydrogen Sulfide (H2S) gas instantaneously (FeS + 2HCl → FeCl2 + H2S↑). H2S paralyses the olfactory nerve instantly, causing rapid respiratory arrest ("knockdown") and death at > 100 ppm.',
      reactions: {
        heatGeneration: true,
        heatDetails: 'Moderate exotherm with vigorous gas evolution.',
        fireRisk: true,
        fireDetails: 'H2S gas is flammable and forms explosive mixtures with air (LEL 4.0% - UEL 44.0%).',
        toxicGas: true,
        toxicGases: ['Lethal Hydrogen Sulfide (H2S)', 'Sulfur Dioxide (SO2) if ignited'],
        flammableGas: true,
        flammableGases: ['H2S (Highly Flammable Gas)'],
        splatteringOrPolymerization: false,
        corrosionOfContainer: true,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Minimum 25 feet (7.6 m) physical separation with continuous H2S monitoring.',
        containmentRule: 'Isolated containment bay with gas scrubber and caustic backup drenching.',
        oshaCitation: 'OSHA 1910.1000 Table Z-2 (H2S PEL 20 ppm ceiling) & OSHA PSM',
        nfpaCitation: 'NFPA 400 § 6.2.1.9',
        epaGroupPair: 'EPA Group 1 (Acids) vs EPA Group 72 (Inorganic Sulfides)',
      },
      emergencyProtocol: {
        ergGuideNumber: '117 (Gases - Toxic - Flammable - Extreme Hazard)',
        firstAction: 'Activate facility H2S sirens. Evacuate crosswind and upwind. Don SCBA before any rescue attempt.',
        isolationDistance: 'Evacuate 500 meters downwind.',
      },
      handlingPpe: [
        'Continuous personal H2S monitor (alarm set at 5 ppm)',
        'Positive-pressure SCBA',
        'Acid-resistant neoprene gloves & face shield',
      ],
    };
  }

  // 5. Water-Reactive Substance + Aqueous Liquid / Water-based Slurry
  if (hasGroup('WATER_REACTIVE')) {
    return {
      chemA,
      chemB,
      status: 'INCOMPATIBLE',
      severity: 'CRITICAL',
      score: 15,
      headline: 'DANGEROUS WHEN WET: Hydrogen Gas Generation & Spontaneous Ignition',
      chemicalMechanisms:
        'Water-reactive compounds react vigorously with moisture, aqueous solutions, or cement slurry wash-water, evolving flammable Hydrogen gas (H2) or Acetylene (C2H2) while producing intense heat sufficient to ignite the generated gas.',
      reactions: {
        heatGeneration: true,
        heatDetails: 'Vigorous exotherm exceeding ignition temperatures of emitted gases.',
        fireRisk: true,
        fireDetails: 'Hydrogen gas has an extreme flammability range (4% to 75% in air).',
        toxicGas: false,
        flammableGas: true,
        flammableGases: ['Hydrogen Gas (H2)', 'Acetylene (C2H2)'],
        splatteringOrPolymerization: true,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Must be stored in a dry, humidity-controlled, sprinkler-free warehouse.',
        containmentRule: 'Elevated pallets in watertight dry storage bays. Water fire sprinklers strictly prohibited.',
        oshaCitation: 'OSHA 1910.1200 HazCom (Water-Reactive Class)',
        nfpaCitation: 'NFPA 400 § 14 (Water-Reactive Materials - Class W-1/W-2)',
        epaGroupPair: 'EPA Group 74 (Water-Reactive) vs Aqueous Systems',
      },
      emergencyProtocol: {
        ergGuideNumber: '138 (Substances - Water-Reactive - Emits Flammable Gases)',
        firstAction: 'Do NOT use water or aqueous foam. Smother fire with Class D dry powder or dry sand.',
        fireExtinguisherProhibition: 'STRICTLY FORBIDDEN: Water, foam, Halon.',
        isolationDistance: 'Isolation radius: 150 meters.',
      },
      handlingPpe: [
        'Dry, non-absorbent protective gauntlet gloves',
        'Full face shield & safety glasses',
        'Anti-static cotton flame-resistant coveralls',
      ],
    };
  }

  // 6. Strong Mineral Acid + Flammable Hydrocarbon / Alcohol (e.g. HCl + Xylenes / Methanol)
  if (
    (hasGroup('STRONG_MINERAL_ACID') && hasGroup('FLAMMABLE_HYDROCARBON')) ||
    (hasGroup('STRONG_MINERAL_ACID') && hasGroup('ALCOHOL_SOLVENT'))
  ) {
    return {
      chemA,
      chemB,
      status: 'CONDITIONAL',
      severity: 'HIGH',
      score: 45,
      headline: 'CONDITIONAL CO-STORAGE: Acid Vapor Corrosion & Flammable Vapor Risk',
      chemicalMechanisms:
        'Acid vapors severely accelerate corrosive degradation of steel drums, valves, and gaskets holding flammable solvents. In the event of a simultaneous spill, acidic conditions can catalyze solvent degradation, exothermic esterification, and increase vapor pressure, raising fire risk.',
      reactions: {
        heatGeneration: false,
        fireRisk: true,
        fireDetails: 'Corrosive failure of solvent storage vessels can cause major liquid fuel pool fires.',
        toxicGas: true,
        toxicGases: ['Acidic solvent vapors', 'Hydrogen Chloride vapor'],
        flammableGas: false,
        splatteringOrPolymerization: false,
        corrosionOfContainer: true,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Minimum 20 ft (6.1 m) physical separation or non-combustible partition wall.',
        containmentRule: 'Dedicated independent secondary containment berms. No shared drain sumps allowed.',
        oshaCitation: 'OSHA 1910.106(d)(5)(vi) & NFPA 30 § 9.5',
        nfpaCitation: 'NFPA 400 § 6.2.1',
        epaGroupPair: 'EPA Group 1 (Acids) vs EPA Group 26 (Hydrocarbons)',
      },
      emergencyProtocol: {
        ergGuideNumber: '128 / 154',
        firstAction: 'Deploy universal poly-spill barrier. Avoid contact between acidic runoff and flammable pool.',
        isolationDistance: '50 meters perimeter.',
      },
      handlingPpe: [
        'Multi-gas/vapor cartridge respirator with acid gas pre-filter',
        'Viton/Butyl chemical barrier gloves',
        'Splash apron and face shield',
      ],
    };
  }

  // 7. Flammable Hydrocarbon + Alcohol Solvent (e.g. Crude Oil / Diesel + Methanol)
  if (hasGroup('FLAMMABLE_HYDROCARBON') && hasGroup('ALCOHOL_SOLVENT')) {
    return {
      chemA,
      chemB,
      status: 'CONDITIONAL',
      severity: 'MODERATE',
      score: 65,
      headline: 'COMPATIBLE WITH SEGREGATED FIRE SUPPRESSION: Flammable Liquids',
      chemicalMechanisms:
        'Both are flammable liquids with low flash points. Chemically mutually miscible without sudden violent runaway reactions, but co-storage compounds fire loading and requires polar-solvent alcohol-resistant fire foam (AR-AFFF) rather than standard hydrocarbon foam.',
      reactions: {
        heatGeneration: false,
        fireRisk: true,
        fireDetails: 'Combined flammable vapor accumulation. Requires AR-AFFF fire suppression.',
        toxicGas: false,
        flammableGas: false,
        splatteringOrPolymerization: false,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Co-storage in approved flammable liquid storage room (NFPA 30 Class I/II rules).',
        containmentRule: 'Continuous spark-proof Class 1 Div 1 ventilation and 110% containment curb.',
        oshaCitation: 'OSHA 1910.106(d) Flammable Storage Requirements',
        nfpaCitation: 'NFPA 30 Flammable and Combustible Liquids Code § 9.4',
        epaGroupPair: 'EPA Group 26 vs EPA Group 4 (Miscible Flammables)',
      },
      emergencyProtocol: {
        ergGuideNumber: '128 / 131',
        firstAction: 'Eliminate all ignition sources. Deploy AR-AFFF alcohol-resistant foam.',
        isolationDistance: '50 meters minimum isolation radius.',
      },
      handlingPpe: [
        'Anti-static flame-retardant coveralls',
        'Conductive footwear',
        'Organic vapor respirator',
        'Nitrile/neoprene gloves',
      ],
    };
  }

  // 8. Cryogenic Flammable + Cryogenic Inert (e.g. Liquid H2 + Liquid N2)
  if (hasBoth('CRYOGENIC_FLAMMABLE', 'CRYOGENIC_INERT')) {
    return {
      chemA,
      chemB,
      status: 'CONDITIONAL',
      severity: 'MODERATE',
      score: 70,
      headline: 'CRYOGENIC STORAGE: Rapid Phase Change & Asphyxiation / Flammability',
      chemicalMechanisms:
        'Liquid nitrogen can safely serve as an inert purge blanket for liquid hydrogen systems. However, cryogenic temperatures (-196°C to -253°C) cause extreme metal embrittlement, and volumetric expansion ratios (> 1:694) present extreme overpressurization risks if pressure relief valves freeze.',
      reactions: {
        heatGeneration: false,
        fireRisk: true,
        fireDetails: 'Liquid Hydrogen is extraordinarily flammable with invisible flame.',
        toxicGas: false,
        flammableGas: true,
        flammableGases: ['Hydrogen Boil-Off Gas (H2)'],
        splatteringOrPolymerization: false,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Minimum 20 feet (6.1 m) between cryogenic dewars with outdoor open-air pad.',
        containmentRule: 'Open air ventilated skid with dual burst discs and cryogenic relief valves.',
        oshaCitation: 'OSHA 1910.103 (Hydrogen) & CGA P-12',
        nfpaCitation: 'NFPA 55 Compressed Gases and Cryogenic Fluids Code',
        epaGroupPair: 'Cryogenic Systems',
      },
      emergencyProtocol: {
        ergGuideNumber: '115 (Gases - Flammable - Cryogenic) / 120 (Inert Cryogenic)',
        firstAction: 'Check cryogenic frost lines and relief valves. Never touch frost-covered fittings.',
        isolationDistance: '100 meters downwind.',
      },
      handlingPpe: [
        'Cryogenic thermal insulated gloves (EN 511 rated)',
        'Full cryogenic face shield and safety glasses',
        'Closed-cuff thermal leather boots',
      ],
    };
  }

  // 9. Alcohol (Methanol) + Inert Gas (Liquid Nitrogen)
  if (hasBoth('ALCOHOL_SOLVENT', 'CRYOGENIC_INERT')) {
    return {
      chemA,
      chemB,
      status: 'COMPATIBLE',
      severity: 'LOW',
      score: 95,
      headline: 'COMPATIBLE: Safe Inert Gas Blanketing for Flammable Solvent',
      chemicalMechanisms:
        'Nitrogen gas is widely used as a safety blanket in oilfield chemical storage tanks to displace oxygen and keep flammable methanol vapors below the lower explosive limit (LEL). Non-reactive and highly recommended for tank head-space inerting.',
      reactions: {
        heatGeneration: false,
        fireRisk: false,
        toxicGas: false,
        flammableGas: false,
        splatteringOrPolymerization: false,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Standard tank piping connection with reverse flow check valve.',
        containmentRule: 'Confined space oxygen sensor required in indoor rooms to prevent nitrogen asphyxiation.',
        oshaCitation: 'OSHA 1910.146 Confined Spaces (Oxygen deficiency alert)',
        nfpaCitation: 'NFPA 69 Standard on Explosion Prevention Systems',
        epaGroupPair: 'Inert Gas / Solvent Blanketing',
      },
      emergencyProtocol: {
        ergGuideNumber: '120 / 131',
        firstAction: 'Verify oxygen level is > 19.5% before personnel enter storage vault.',
        isolationDistance: 'Standard perimeter.',
      },
      handlingPpe: ['Standard facility PPE', 'Continuous O2 oxygen deficiency monitor'],
    };
  }

  // 10. Inert Minerals (Portland Cement + Cenospheres + Silica Gel)
  if (groupsA.includes('INERT_MINERAL') && groupsB.includes('INERT_MINERAL')) {
    return {
      chemA,
      chemB,
      status: 'COMPATIBLE',
      severity: 'NEGLIGIBLE',
      score: 100,
      headline: 'COMPATIBLE: Safe Co-Storage of Cementing Powders & Mineral Additives',
      chemicalMechanisms:
        'Both materials are non-combustible inorganic powders commonly co-stored and dry-blended in oilfield cementing operations. No cross-chemical reaction occurs under dry conditions.',
      reactions: {
        heatGeneration: false,
        fireRisk: false,
        toxicGas: false,
        flammableGas: false,
        splatteringOrPolymerization: false,
        corrosionOfContainer: false,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'No physical separation distance required. Safe for adjacent rack storage.',
        containmentRule: 'Dry, weather-tight warehouse to prevent moisture-induced caking or hydration.',
        oshaCitation: 'OSHA 1910.1000 Nuisance Particulates Table Z-1',
        nfpaCitation: 'NFPA 652 (Combustible Dust Standard - Non-combustible minerals exempt)',
        epaGroupPair: 'EPA Group 98 (Inorganic Minerals)',
      },
      emergencyProtocol: {
        ergGuideNumber: 'Non-regulated in ERG',
        firstAction: 'Vacuum or sweep with dust suppressant. Avoid generating airborne dust clouds.',
        isolationDistance: 'None',
      },
      handlingPpe: ['N95 particulate respirator during bulk hopper transfer', 'Safety glasses with side shields', 'Work gloves'],
    };
  }

  // 11. Strong Acid + Inert Mineral (e.g. HCl + Cenospheres or Silica Gel)
  if (hasBoth('STRONG_MINERAL_ACID', 'INERT_MINERAL')) {
    return {
      chemA,
      chemB,
      status: 'CONDITIONAL',
      severity: 'LOW',
      score: 75,
      headline: 'CONDITIONAL: Segregate Acid Liquids from Dry Bulk Cementing Powders',
      chemicalMechanisms:
        'While silica gel and aluminosilicate cenospheres are largely acid-resistant, liquid mineral acids can react exothermically with alkaline cement components (calcium oxide / silicate) in Portland cement, releasing heat and hardening the powder into an unpumpable solid.',
      reactions: {
        heatGeneration: false,
        fireRisk: false,
        toxicGas: false,
        flammableGas: false,
        splatteringOrPolymerization: false,
        corrosionOfContainer: true,
      },
      regulatoryRequirements: {
        minimumSeparationDistance: 'Store dry bulk powder sacks on elevated pallets isolated from acid liquid berms.',
        containmentRule: 'Acid tanks must have independent 110% liquid berm to prevent acid flooding into dry bag warehouse.',
        oshaCitation: 'OSHA 1910.1200 HazCom',
        nfpaCitation: 'NFPA 400 § 6.2',
        epaGroupPair: 'EPA Group 1 vs EPA Group 98',
      },
      emergencyProtocol: {
        ergGuideNumber: '154',
        firstAction: 'Contain liquid acid runoff with sand dikes away from dry powder pallets.',
        isolationDistance: '25 meters',
      },
      handlingPpe: ['Chemical splash goggles', 'Rubber acid boots', 'PVC gauntlets'],
    };
  }

  // Default: Compatible or standard safe co-storage
  return {
    chemA,
    chemB,
    status: 'COMPATIBLE',
    severity: 'LOW',
    score: 90,
    headline: 'COMPATIBLE: Standard Industrial Co-Storage Permitted',
    chemicalMechanisms:
      'No hazardous cross-reactivity, violent exotherm, or toxic gas evolution identified between these chemical classes under standard ambient warehouse storage conditions (15°C to 35°C).',
    reactions: {
      heatGeneration: false,
      fireRisk: false,
      toxicGas: false,
      flammableGas: false,
      splatteringOrPolymerization: false,
      corrosionOfContainer: false,
    },
    regulatoryRequirements: {
      minimumSeparationDistance: 'Maintain standard 3-foot (1 m) aisle access clearance.',
      containmentRule: 'Standard facility secondary containment or spill pallet.',
      oshaCitation: 'OSHA 1910.1200 General Duty Clause',
      nfpaCitation: 'NFPA 400 Chapter 6 General Requirements',
      epaGroupPair: 'Compatible Chemical Groupings',
    },
    emergencyProtocol: {
      ergGuideNumber: 'Refer to specific product SDS',
      firstAction: 'Deploy standard universal absorbent spill pillows and isolate damaged packaging.',
      isolationDistance: 'Standard 15-meter work perimeter.',
    },
    handlingPpe: ['Standard chemical safety glasses', 'Industrial nitrile gloves', 'Steel-toe safety footwear'],
  };
}

/**
 * Evaluates a storage bay or container zone containing multiple chemicals.
 */
export function auditStorageBay(bayName: string, chemicals: Chemical[]): StorageBayAuditResult {
  if (chemicals.length < 2) {
    return {
      bayName,
      chemicals,
      totalPairCount: 0,
      incompatiblePairCount: 0,
      conditionalPairCount: 0,
      compatiblePairCount: chemicals.length,
      complianceScore: 100,
      overallRating: 'OPTIMAL_SAFE',
      violations: [],
      recommendations: ['Add at least two chemicals to evaluate co-storage interactions.'],
    };
  }

  const violations: StorageBayAuditResult['violations'] = [];
  let incompatibleCount = 0;
  let conditionalCount = 0;
  let compatibleCount = 0;
  let totalPairs = 0;
  let scoreSum = 0;

  for (let i = 0; i < chemicals.length; i++) {
    for (let j = i + 1; j < chemicals.length; j++) {
      totalPairs++;
      const result = evaluatePairCompatibility(chemicals[i], chemicals[j]);
      scoreSum += result.score;

      if (result.status === 'INCOMPATIBLE') {
        incompatibleCount++;
        violations.push({
          chemA: chemicals[i],
          chemB: chemicals[j],
          headline: result.headline,
          severity: result.severity,
          directive: `URGENT ACTION: Immediately separate "${chemicals[i].productName}" from "${chemicals[j].productName}". ${result.regulatoryRequirements.minimumSeparationDistance}`,
        });
      } else if (result.status === 'CONDITIONAL') {
        conditionalCount++;
      } else {
        compatibleCount++;
      }
    }
  }

  const rawScore = totalPairs > 0 ? Math.round(scoreSum / totalPairs) : 100;
  // If there is even one critical incompatible pair, cap score at 40
  const finalScore = incompatibleCount > 0 ? Math.min(rawScore, 40 - incompatibleCount * 5) : rawScore;
  const clampedScore = Math.max(0, Math.min(100, finalScore));

  let overallRating: StorageBayAuditResult['overallRating'] = 'OPTIMAL_SAFE';
  if (clampedScore < 35 || incompatibleCount > 1) {
    overallRating = 'CRITICAL_RISK';
  } else if (clampedScore < 60 || incompatibleCount === 1) {
    overallRating = 'HIGH_RISK';
  } else if (clampedScore < 85 || conditionalCount > 0) {
    overallRating = 'CAUTION_REQUIRED';
  }

  const recommendations: string[] = [];
  if (incompatibleCount > 0) {
    recommendations.push(
      `CRITICAL DEFICIENCY: Found ${incompatibleCount} prohibited chemical pair(s) in "${bayName}". Physical separation must be executed immediately per OSHA 1910.106 and NFPA 400.`
    );
    recommendations.push(
      'Verify secondary containment berms are physically segregated and do not drain into a shared sump.'
    );
  }
  if (conditionalCount > 0) {
    recommendations.push(
      `CONDITIONAL STORAGE: ${conditionalCount} pair(s) require isolated spill sumps, vapor barriers, or dedicated Class 1 Div 1 ventilation.`
    );
  }
  if (incompatibleCount === 0 && conditionalCount === 0) {
    recommendations.push(
      `ALL CHEMICALLY COMPATIBLE: All ${totalPairs} evaluated chemical combinations in "${bayName}" are safe for co-storage under standard warehouse operations.`
    );
  }

  return {
    bayName,
    chemicals,
    totalPairCount: totalPairs,
    incompatiblePairCount: incompatibleCount,
    conditionalPairCount: conditionalCount,
    compatiblePairCount: compatibleCount,
    complianceScore: clampedScore,
    overallRating,
    violations,
    recommendations,
  };
}

/**
 * Standard industry preset test scenarios for rapid one-click demonstration
 */
export const PRESET_COMPATIBILITY_SCENARIOS = [
  {
    id: 'acid-caustic',
    title: 'Well Matrix Acid vs Caustic Neutralizer',
    description: 'Hydrochloric Acid 32% + Sodium Hydroxide 50% (Violent Exothermic Neutralization & Boiling)',
    chemAId: 'chem-010', // Hydrochloric Acid 32%
    chemBName: 'Sodium Hydroxide 50% (Caustic Neutralizer)',
    chemBCas: '1310-73-2',
    chemBGroup: 'STRONG_BASE_CAUSTIC',
    isCustomB: true,
  },
  {
    id: 'acid-bleach',
    title: 'Stimulation Acid vs Hypochlorite Biocide',
    description: 'Hydrochloric Acid 32% + Sodium Hypochlorite 12% (Deadly Chlorine Gas Cl2 Release)',
    chemAId: 'chem-010', // Hydrochloric Acid 32%
    chemBName: 'Sodium Hypochlorite 12% (Biocide Bleach)',
    chemBCas: '7681-52-9',
    chemBGroup: 'STRONG_OXIDIZER',
    isCustomB: true,
  },
  {
    id: 'oxidizer-flammable',
    title: 'Gel Breaker Oxidizer vs Wellhead Crude Oil',
    description: 'Ammonium Persulfate (Oxidizer) + Crude Oil (Catastrophic Spontaneous Fire & Deflagration)',
    chemAId: 'chem-008', // Crude Oil
    chemBName: 'Ammonium Persulfate (Gel Breaker / Oxidizer)',
    chemBCas: '7727-54-0',
    chemBGroup: 'STRONG_OXIDIZER',
    isCustomB: true,
  },
  {
    id: 'solvent-acid',
    title: 'Aromatic Solvent vs Mineral Acid',
    description: 'Xylenes (Solvent) + Hydrochloric Acid 32% (Container Degradation & Fire Loading)',
    chemAId: 'chem-006', // Xylenes
    chemBId: 'chem-010', // Hydrochloric Acid 32%
  },
  {
    id: 'inert-minerals',
    title: 'Cementing Additive Safe Co-Storage',
    description: 'Norcem Portland Cement + Cenospheres (Safe Compatible Co-Storage & Blending)',
    chemAId: 'chem-002', // Norcem Portland Cement
    chemBId: 'chem-001', // Cenospheres
  },
  {
    id: 'blanketing-safe',
    title: 'Hydrate Inhibitor Blanketing',
    description: 'Methanol + Liquid Nitrogen (Safe Inert Gas Tank Blanketing)',
    chemAId: 'chem-009', // Methanol
    chemBId: 'chem-005', // Liquid Nitrogen
  },
];

export const MOCK_ADDITIONAL_OILFIELD_CHEMICALS: Chemical[] = [
  {
    id: 'chem-naoh-50',
    productName: 'Sodium Hydroxide 50% Solution',
    chemicalName: 'Caustic Soda Liquid',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'OS-CS-50',
    casNumber: '1310-73-2',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-08-01',
    lastReviewedDate: '2024-08-01',
    lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Lead)',
    status: 'approved',
    signalWord: 'DANGER',
    pictograms: ['corrosion'],
    hazardClasses: ['Skin corrosion (Category 1A)', 'Corrosive to metals (Category 1)'],
    hStatements: [
      { code: 'H314', statement: 'Causes severe skin burns and eye damage.', type: 'hazard' },
      { code: 'H290', statement: 'May be corrosive to metals.', type: 'hazard' },
    ],
    pStatements: [
      { code: 'P280', statement: 'Wear protective gloves/clothing/eye protection.', type: 'prevention' },
      { code: 'P301+P330+P331', statement: 'IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.', type: 'response' },
    ],
    nfpa: { health: 3, flammability: 0, instability: 1, special: 'ALK' },
    hmis: { health: 3, flammability: 0, physicalHazard: 1, ppeCode: 'J' },
    emergency: {
      firstAidInhalation: 'Move to fresh air.',
      firstAidSkin: 'Flush with water for 20 minutes.',
      firstAidEye: 'Continuous eye irrigation for 30 minutes.',
      firstAidIngestion: 'Rinse mouth with water. Do not induce vomiting.',
      fireResponse: 'Non-combustible. Emits toxic sodium oxide fumes in fire.',
      spillResponse: 'Neutralize with dilute citric or acetic acid. Vacuum.',
      storageHandling: 'Store in dedicated alkali-resistant nickel or polyethylene tanks.',
      emergencyContact: 'OILSERV EOC: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678',
    },
    ppe: {
      eye: 'Chemical splash goggles and face shield',
      hand: 'Neoprene or nitrile gauntlets',
      respiratory: 'Alkali mist respirator',
      body: 'Alkali-resistant PVC suit',
      foot: 'Chemical rubber boots',
    },
    version: '1.0',
    createdAt: '2024-08-01T08:00:00Z',
    updatedAt: '2024-08-01T08:00:00Z',
  },
  {
    id: 'chem-naocl-12',
    productName: 'Sodium Hypochlorite 12% (Industrial Biocide)',
    chemicalName: 'Hypochlorous acid sodium salt',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'OS-BIO-12',
    casNumber: '7681-52-9',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-08-05',
    lastReviewedDate: '2024-08-05',
    lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Lead)',
    status: 'approved',
    signalWord: 'DANGER',
    pictograms: ['corrosion', 'environment'],
    hazardClasses: ['Skin corrosion (Category 1B)', 'Hazardous to aquatic environment - Acute (Category 1)'],
    hStatements: [
      { code: 'H314', statement: 'Causes severe skin burns and eye damage.', type: 'hazard' },
      { code: 'H400', statement: 'Very toxic to aquatic life.', type: 'hazard' },
    ],
    pStatements: [
      { code: 'P273', statement: 'Avoid release to the environment.', type: 'prevention' },
      { code: 'P280', statement: 'Wear protective gloves/clothing/eye protection.', type: 'prevention' },
    ],
    nfpa: { health: 3, flammability: 0, instability: 1, special: 'OX' },
    hmis: { health: 3, flammability: 0, physicalHazard: 1, ppeCode: 'J' },
    emergency: {
      firstAidInhalation: 'Move to fresh air. Oxygen if breathing difficult.',
      firstAidSkin: 'Flush with water for 15 minutes.',
      firstAidEye: 'Irrigate with water for 20 minutes.',
      firstAidIngestion: 'Rinse mouth. Drink milk or water.',
      fireResponse: 'Non-combustible. Liberates chlorine gas in heat and contact with acids.',
      spillResponse: 'Absorb with vermiculite. Do NOT use sawdust or organic absorbents.',
      storageHandling: 'Store in cool, vented, dark containers away from acids.',
      emergencyContact: 'OILSERV EOC: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678',
    },
    ppe: {
      eye: 'Splash goggles',
      hand: 'Nitrile or PVC gloves',
      respiratory: 'Chlorine cartridge respirator',
      body: 'Splash apron',
      foot: 'Safety boots',
    },
    version: '1.0',
    createdAt: '2024-08-05T08:00:00Z',
    updatedAt: '2024-08-05T08:00:00Z',
  },
  {
    id: 'chem-persulfate',
    productName: 'Ammonium Persulfate (Gel Breaker / Oxidizer)',
    chemicalName: 'Diammonium peroxodisulfate',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'OS-BRK-APS',
    casNumber: '7727-54-0',
    physicalState: 'Powder',
    sdsRevisionDate: '2024-08-10',
    lastReviewedDate: '2024-08-10',
    lastReviewedBy: 'Marcus Thorne, PE',
    status: 'approved',
    signalWord: 'DANGER',
    pictograms: ['flame-over-circle', 'health-hazard', 'exclamation-mark'],
    hazardClasses: [
      'Oxidizing solids (Category 3)',
      'Respiratory sensitization (Category 1)',
      'Skin sensitization (Category 1)',
    ],
    hStatements: [
      { code: 'H272', statement: 'May intensify fire; oxidizer.', type: 'hazard' },
      { code: 'H334', statement: 'May cause allergy or asthma symptoms if inhaled.', type: 'hazard' },
    ],
    pStatements: [
      { code: 'P210', statement: 'Keep away from heat, hot surfaces, sparks, open flames.', type: 'prevention' },
      { code: 'P220', statement: 'Keep away from clothing and other combustible materials.', type: 'prevention' },
    ],
    nfpa: { health: 2, flammability: 0, instability: 1, special: 'OX' },
    hmis: { health: 2, flammability: 0, physicalHazard: 1, ppeCode: 'F' },
    emergency: {
      firstAidInhalation: 'Move to fresh air.',
      firstAidSkin: 'Wash with soap and water.',
      firstAidEye: 'Rinse with water for 15 minutes.',
      firstAidIngestion: 'Rinse mouth. Drink plenty of water.',
      fireResponse: 'Flood with water. Do NOT use chemical smothering agents solely.',
      spillResponse: 'Sweep into clean plastic containers. Keep away from combustible absorbents.',
      storageHandling: 'Store in dry oxidizer cabinet away from fuels and reducers.',
      emergencyContact: 'OILSERV EOC: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678',
    },
    ppe: {
      eye: 'Dust goggles',
      hand: 'Nitrile gloves',
      respiratory: 'P100 particulate respirator',
      body: 'Standard coveralls',
      foot: 'Safety boots',
    },
    version: '1.0',
    createdAt: '2024-08-10T08:00:00Z',
    updatedAt: '2024-08-10T08:00:00Z',
  },
  {
    id: 'chem-diesel-2',
    productName: 'Diesel Fuel No. 2 (Rig Fuel / Base Oil)',
    chemicalName: 'Distillates (petroleum), hydrotreated middle',
    manufacturer: 'OILSERV Energy Ltd',
    productCode: 'OS-DSL-02',
    casNumber: '68476-34-6',
    physicalState: 'Liquid',
    sdsRevisionDate: '2024-08-12',
    lastReviewedDate: '2024-08-12',
    lastReviewedBy: 'Dr. Sarah Vance, CSP (HSE Lead)',
    status: 'approved',
    signalWord: 'WARNING',
    pictograms: ['flame', 'health-hazard'],
    hazardClasses: ['Flammable liquids (Category 3)', 'Aspiration hazard (Category 1)'],
    hStatements: [
      { code: 'H226', statement: 'Flammable liquid and vapor.', type: 'hazard' },
      { code: 'H304', statement: 'May be fatal if swallowed and enters airways.', type: 'hazard' },
    ],
    pStatements: [
      { code: 'P210', statement: 'Keep away from heat, sparks, open flames. No smoking.', type: 'prevention' },
    ],
    nfpa: { health: 1, flammability: 2, instability: 0, special: '' },
    hmis: { health: 1, flammability: 2, physicalHazard: 0, ppeCode: 'H' },
    emergency: {
      firstAidInhalation: 'Move to fresh air.',
      firstAidSkin: 'Wash with soap and water.',
      firstAidEye: 'Flush with water.',
      firstAidIngestion: 'Do not induce vomiting. Seek medical attention.',
      fireResponse: 'Use dry chemical, foam, or CO2. Water spray may be ineffective.',
      spillResponse: 'Dike and pump with explosion-proof equipment.',
      storageHandling: 'Store in grounded bulk tanks with secondary containment.',
      emergencyContact: 'OILSERV EOC: +234-1-234-5678',
      emergencyPhone: '+234-1-234-5678',
    },
    ppe: {
      eye: 'Safety glasses',
      hand: 'Nitrile gloves',
      respiratory: 'Organic vapor mask if mist occurs',
      body: 'Anti-static coveralls',
      foot: 'Conductive safety boots',
    },
    version: '1.0',
    createdAt: '2024-08-12T08:00:00Z',
    updatedAt: '2024-08-12T08:00:00Z',
  },
];
