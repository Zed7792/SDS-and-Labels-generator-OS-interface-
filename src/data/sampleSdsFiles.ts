export interface SampleSdsDoc {
  id: string;
  name: string;
  productName: string;
  manufacturer: string;
  chemicalFormula?: string;
  casNumber: string;
  fileSize: string;
  pages: number;
  text: string;
}

export const SAMPLE_SDS_DOCS: SampleSdsDoc[] = [
  {
    id: 'sds-sample-meoh',
    name: 'Methanol_99.8_Technical_Grade_SDS_Apex.pdf',
    productName: 'Methanol (Industrial / Hydrate Inhibitor Grade)',
    manufacturer: 'Apex Petrochemical & Solvents LLC',
    chemicalFormula: 'CH3OH',
    casNumber: '67-56-1',
    fileSize: '412 KB',
    pages: 8,
    text: `SAFETY DATA SHEET (SDS)
According to OSHA Hazard Communication Standard (29 CFR 1910.1200) and UN GHS Rev 8/10
Revision Date: 15-OCT-2024 | Version 4.1 | SDS ID: APX-SDS-2024-MEOH

SECTION 1: IDENTIFICATION OF THE SUBSTANCE / MIXTURE AND OF THE COMPANY
1.1 Product Identifier:
Product Name: Methanol (Industrial / Hydrate Inhibitor Grade)
Product Code: APX-MEOH-998
CAS Number: 67-56-1
EC Number: 200-659-6
Index Number: 603-001-00-X
Synonyms: Methyl alcohol, Wood alcohol, Carbinol

1.2 Relevant Identified Uses:
Industrial chemical, natural gas hydrate inhibitor for offshore/onshore subsea pipelines, chemical feedstock, solvent.

1.3 Details of the Supplier:
Apex Petrochemical & Solvents LLC
1400 Energy Corridor Way, Suite 800, Houston, TX 77079, USA
Telephone: +1 (713) 555-0199
Email: ehs-compliance@apexpetrochem.com

1.4 Emergency Telephone:
CHEMTREC (24 Hours): 1-800-424-9300 (USA / Canada)
Apex EOC 24/7 Command: 1-888-555-APEX

SECTION 2: HAZARDS IDENTIFICATION
2.1 Classification of the Substance:
Flammable liquids: Category 2
Acute toxicity, Oral: Category 3
Acute toxicity, Dermal: Category 3
Acute toxicity, Inhalation: Category 3
Specific Target Organ Toxicity (Single Exposure): Category 1 (Central nervous system, Optic nerve, Visual organs)

2.2 GHS Label Elements:
Signal Word: DANGER
Hazard Pictograms: GHS02 (Flame), GHS06 (Skull and crossbones), GHS08 (Health hazard)

Hazard Statements:
H225: Highly flammable liquid and vapor.
H301: Toxic if swallowed.
H311: Toxic in contact with skin.
H331: Toxic if inhaled.
H370: Causes damage to organs (Central nervous system, Eyes/optic nerve).

Precautionary Statements:
Prevention:
P210: Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking.
P260: Do not breathe dust/fume/gas/mist/vapors/spray.
P280: Wear protective gloves/protective clothing/eye protection/face protection.
Response:
P301+P310: IF SWALLOWED: Immediately call a POISON CENTER or doctor/physician.
P303+P361+P353: IF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse skin with water [or shower].
P304+P340: IF INHALED: Remove person to fresh air and keep comfortable for breathing.
P308+P311: IF exposed or concerned: Call a POISON CENTER/doctor.
Storage:
P403+P235: Store in a well-ventilated place. Keep cool.
P405: Store locked up.
Disposal:
P501: Dispose of contents/container to an approved hazardous waste disposal facility in accordance with local/regional/national regulations.

SECTION 3: COMPOSITION / INFORMATION ON INGREDIENTS
Chemical Name: Methanol
CAS-No: 67-56-1
Concentration: >= 99.85 % w/w

SECTION 4: FIRST AID MEASURES
4.1 Inhalation: Remove victim to fresh air. If breathing ceases, provide artificial respiration. Administer oxygen if breathing is labored. Get immediate medical attention.
4.2 Skin Contact: Immediately flush contaminated skin with copious water for at least 15 minutes while removing contaminated clothing.
4.3 Eye Contact: Flush eyes immediately with gentle stream of water for at least 20 minutes with eyelids held apart. Seek immediate specialist care.
4.4 Ingestion: Rinse mouth. Do NOT induce vomiting unless directed by a doctor. Seek emergency medical treatment immediately. Note to physician: Methanol causes toxic metabolic acidosis and blindness. Fomepizole or ethanol therapy is recommended.

SECTION 5: FIREFIGHTING MEASURES
Suitable Extinguishing Media: Water spray, alcohol-resistant foam, dry chemical powder, or carbon dioxide (CO2).
Specific Hazards: Highly flammable. Vapor-air mixtures are explosive. Vapors are heavier than air and may flash back from distant ignition sources.

SECTION 6: ACCIDENTAL RELEASE MEASURES
Personal Precautions: Eliminate all ignition sources. Evacuate zone. Wear full SCBA and chemical-resistant protective clothing.
Environmental Precautions: Prevent material from entering watercourses, sewers, or basements.
Clean-up: Absorb with inert non-combustible material (vermiculite, sand) using non-sparking explosion-proof tools.

SECTION 7: HANDLING AND STORAGE
Handling: Ground and bond containers. Use spark-proof tools. Do not breathe vapor or mist.
Storage: Keep containers tightly closed in dry, cool, well-ventilated area away from heat and direct sunlight.

SECTION 8: EXPOSURE CONTROLS / PERSONAL PROTECTION
OSHA PEL: TWA 200 ppm (260 mg/m3)
ACGIH TLV: TWA 200 ppm, STEL 250 ppm (Skin)
PPE:
Eye: Chemical splash goggles and full face shield.
Hand: Butyl rubber gloves (breakthrough >480 min).
Respiratory: Positive-pressure SCBA or full-face supplied-air respirator.
Body: Static-dissipative flame-retardant coverall with chemical apron.
Foot: Hydrocarbon-resistant steel-toe boots.

SECTION 9: PHYSICAL AND CHEMICAL PROPERTIES
Appearance: Clear, colorless liquid.
Odor: Characteristic alcohol odor.
Boiling Point: 64.7 °C (148.5 °F)
Flash Point: 9.7 °C (49.5 °F) - Closed cup
Auto-ignition Temperature: 455 °C

SECTION 16: OTHER INFORMATION
NFPA 704 Rating: Health: 3 | Flammability: 3 | Instability: 0 | Special: None
HMIS III Rating: Health: 3* | Flammability: 3 | Physical Hazard: 0 | PPE: H`
  },
  {
    id: 'sds-sample-triazine',
    name: 'Triazine_H2S_Scavenger_60pct_POT.pdf',
    productName: 'Triazine H2S Scavenger (Triazine 60% Solution)',
    manufacturer: 'Permian Oilfield Technologies',
    casNumber: '108-74-7',
    fileSize: '365 KB',
    pages: 7,
    text: `SAFETY DATA SHEET (SDS)
OSHA HazCom 2012 / GHS Rev 8
Revision Date: 19-MAY-2024 | Version 2.4 | Product: POT-H2S-600

SECTION 1: PRODUCT & COMPANY IDENTIFICATION
Product Name: Triazine H2S Scavenger (Triazine 60% Solution)
Product Code: POT-H2S-600
CAS Number: 108-74-7
Chemical Family: Hexahydro-1,3,5-trimethyl-1,3,5-triazine aqueous solution
Manufacturer: Permian Oilfield Technologies
3200 Permian Parkway, Midland, TX 79701
24-Hour Emergency Dispatch: 1-800-444-H2S0
CHEMTREC: 1-800-424-9300

SECTION 2: HAZARD IDENTIFICATION
GHS Classification:
Corrosive to metals (Category 1)
Acute toxicity, Oral (Category 4)
Skin corrosion/irritation (Category 1C)
Skin sensitization (Category 1)
Serious eye damage (Category 1)
Carcinogenicity (Category 1B - Free formaldehyde trace)

Signal Word: DANGER
Pictograms: GHS05 (Corrosion), GHS07 (Exclamation mark), GHS08 (Health hazard)

Hazard Statements:
H302: Harmful if swallowed.
H314: Causes severe skin burns and eye damage.
H317: May cause an allergic skin reaction.
H350: May cause cancer.

Precautionary Statements:
P201: Obtain special instructions before use.
P260: Do not breathe dust/fume/gas/mist/vapors/spray.
P280: Wear protective gloves/protective clothing/eye protection/face protection.
P301+P330+P331: IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.
P305+P351+P338: IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses, if present and easy to do. Continue rinsing.
P308+P313: IF exposed or concerned: Get medical advice/attention.
P501: Dispose of contents/container to an approved hazardous waste disposal facility.

SECTION 4: FIRST AID MEASURES
Inhalation: Move to fresh air. Provide oxygen if breathing labored.
Skin: Deluge with water for 15 minutes. Wash with soap.
Eyes: Irrigate eyes with water for 20 minutes holding lids open. Immediate doctor referral.
Ingestion: Rinse mouth with water. Do not induce vomiting. Give small glass of water.

SECTION 8: PPE RECOMMENDATIONS
Eye Protection: Chemical splash goggles and face shield.
Hand Protection: Heavy nitrile or butyl gloves.
Respiratory Protection: Formaldehyde/organic vapor respirator cartridge (NIOSH).
Body Protection: Chemical apron and Tychem coveralls.
Foot Protection: Steel-toe rubber work boots.

SECTION 16: RATINGS
NFPA 704: Health: 3, Flammability: 2, Instability: 0, Special: None
HMIS: Health: 3*, Flammability: 2, Physical Hazard: 0, PPE: H`
  }
];

export const SAMPLE_SDS_TEXTS = {
  methanol: SAMPLE_SDS_DOCS[0]?.text || '',
  hydrochloricAcid: `SAFETY DATA SHEET (SDS)
According to OSHA Hazard Communication Standard (29 CFR 1910.1200)
Revision Date: 11-AUG-2024 | Version 5.0 | GeoWell Solutions Inc.

SECTION 1: IDENTIFICATION
Product Name: Hydrochloric Acid 32% (Well Stimulation Grade)
Product Code: GWS-HCL-32
Manufacturer: GeoWell Solutions Inc.
Address: 8800 Oil Center Blvd, Midland, TX 79705
Emergency Telephone: 1-800-424-9300 (CHEMTREC)

SECTION 2: HAZARDS IDENTIFICATION
Signal Word: DANGER
Pictograms: GHS05 (Corrosion), GHS04 (Gas cylinder)
Hazard Statements:
H290: May be corrosive to metals.
H314: Causes severe skin burns and eye damage.
H335: May cause respiratory irritation.

Precautionary Statements:
P260: Do not breathe dust/fume/gas/mist/vapors/spray.
P280: Wear protective gloves/clothing/eye protection/face protection.
P301+P330+P331: IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.
P303+P361+P353: IF ON SKIN: Take off immediately all contaminated clothing. Rinse skin with water.
P305+P351+P338: IF IN EYES: Rinse cautiously with water for several minutes.
P310: Immediately call a POISON CENTER or doctor.
P403+P233: Store in a well-ventilated place. Keep container tightly closed.

SECTION 3: COMPOSITION
Chemical: Hydrogen Chloride / Hydrochloric Acid
CAS Number: 7647-01-0
Concentration: 31.0 - 33.5%

SECTION 4: FIRST AID
Inhalation: Move to fresh air. Give oxygen if breathing labored.
Skin: Rinse immediately with copious water for 20 minutes.
Eyes: Irrigate eyes continuously with eyewash stream for 20 minutes.
Ingestion: Do not induce vomiting. Give water or milk of magnesia.

SECTION 8: PPE
Eye: Chemical splash goggles with full acid-resistant face shield.
Hand: Heavy neoprene or PVC gauntlet gloves.
Respiratory: Acid gas cartridge respirator or air-line respirator.
Body: Heavy acid apron and impervious suit.
Foot: Chemical-resistant rubber boots.

SECTION 16: RATINGS
NFPA 704: Health: 3 | Flammability: 0 | Instability: 1 | Special: None
HMIS III: Health: 3 | Flammability: 0 | Physical Hazard: 1 | PPE: H`,
  triazineScavenger: SAMPLE_SDS_DOCS[1]?.text || '',
};
