import { GhsStatement } from '../types';

/**
 * Standard UN GHS & EU CLP Hazard Statements (H-Statements)
 * Extracted from MSDS-Europe / ToxInfo official reference (2020)
 * Upgraded with latest UN GHS Rev. 9 / 10 / 11 and EU Regulation (EU) 2023/707.
 */
export const GHS_H_STATEMENTS: Record<string, { statement: string; category: string }> = {
  "H200": {
    "statement": "Unstable explosives.",
    "category": "Explosives"
  },
  "H201": {
    "statement": "Explosive; mass explosion hazard.",
    "category": "Explosives"
  },
  "H202": {
    "statement": "Explosive, severe projection hazard.",
    "category": "Explosives"
  },
  "H203": {
    "statement": "Explosive; fire, blast or projection hazard.",
    "category": "Explosives"
  },
  "H204": {
    "statement": "Fire or projection hazard.",
    "category": "Explosives"
  },
  "H205": {
    "statement": "May mass explode in fire.",
    "category": "Explosives"
  },
  "H206": {
    "statement": "Fire, blast or projection hazard; increased risk of explosion if desensitising agent is reduced.",
    "category": "Desensitized explosives"
  },
  "H207": {
    "statement": "Fire or projection hazard; increased risk of explosion if desensitising agent is reduced.",
    "category": "Desensitized explosives"
  },
  "H208": {
    "statement": "Fire hazard; increased risk of explosion if desensitising agent is reduced.",
    "category": "Desensitized explosives"
  },
  "H220": {
    "statement": "Extremely flammable gas.",
    "category": "Flammable gases"
  },
  "H221": {
    "statement": "Flammable gas.",
    "category": "Flammable gases"
  },
  "H222": {
    "statement": "Extremely flammable aerosol.",
    "category": "Aerosols"
  },
  "H223": {
    "statement": "Flammable aerosol.",
    "category": "Aerosols"
  },
  "H224": {
    "statement": "Extremely flammable liquid and vapour.",
    "category": "Flammable liquids"
  },
  "H225": {
    "statement": "Highly flammable liquid and vapour.",
    "category": "Flammable liquids"
  },
  "H226": {
    "statement": "Flammable liquid and vapour.",
    "category": "Flammable liquids"
  },
  "H228": {
    "statement": "Flammable solid.",
    "category": "Flammable solids"
  },
  "H229": {
    "statement": "Pressurised container: May burst if heated.",
    "category": "Aerosols"
  },
  "H230": {
    "statement": "May react explosively even in the absence of air.",
    "category": "Flammable gases"
  },
  "H231": {
    "statement": "May react explosively even in the absence of air at elevated pressure and/or temperature.",
    "category": "Flammable gases"
  },
  "H232": {
    "statement": "May ignite spontaneously if exposed to air.",
    "category": "Pyrophoric gases"
  },
  "H240": {
    "statement": "Heating may cause an explosion.",
    "category": "Self-reactive substances / Organic peroxides"
  },
  "H241": {
    "statement": "Heating may cause a fire or explosion.",
    "category": "Self-reactive substances / Organic peroxides"
  },
  "H242": {
    "statement": "Heating may cause a fire.",
    "category": "Self-reactive substances / Organic peroxides"
  },
  "H250": {
    "statement": "Catches fire spontaneously if exposed to air.",
    "category": "Pyrophoric liquids / solids"
  },
  "H251": {
    "statement": "Self-heating: may catch fire.",
    "category": "Self-heating substances"
  },
  "H252": {
    "statement": "Self-heating in large quantities; may catch fire.",
    "category": "Self-heating substances"
  },
  "H260": {
    "statement": "In contact with water releases flammable gases which may ignite spontaneously.",
    "category": "Substances emitting flammable gases"
  },
  "H261": {
    "statement": "In contact with water releases flammable gases.",
    "category": "Substances emitting flammable gases"
  },
  "H270": {
    "statement": "May cause or intensify fire; oxidiser.",
    "category": "Oxidizing gases"
  },
  "H271": {
    "statement": "May cause fire or explosion; strong oxidiser.",
    "category": "Oxidizing liquids / solids"
  },
  "H272": {
    "statement": "May intensify fire; oxidiser.",
    "category": "Oxidizing liquids / solids"
  },
  "H280": {
    "statement": "Contains gas under pressure; may explode if heated.",
    "category": "Gases under pressure"
  },
  "H281": {
    "statement": "Contains refrigerated gas; may cause cryogenic burns or injury.",
    "category": "Gases under pressure"
  },
  "H290": {
    "statement": "May be corrosive to metals.",
    "category": "Corrosive to metals"
  },
  "H300": {
    "statement": "Fatal if swallowed.",
    "category": "Acute toxicity, oral"
  },
  "H301": {
    "statement": "Toxic if swallowed.",
    "category": "Acute toxicity, oral"
  },
  "H302": {
    "statement": "Harmful if swallowed.",
    "category": "Acute toxicity, oral"
  },
  "H304": {
    "statement": "May be fatal if swallowed and enters airways.",
    "category": "Aspiration hazard"
  },
  "H310": {
    "statement": "Fatal in contact with skin.",
    "category": "Acute toxicity, dermal"
  },
  "H311": {
    "statement": "Toxic in contact with skin.",
    "category": "Acute toxicity, dermal"
  },
  "H312": {
    "statement": "Harmful in contact with skin.",
    "category": "Acute toxicity, dermal"
  },
  "H314": {
    "statement": "Causes severe skin burns and eye damage.",
    "category": "Skin corrosion/irritation"
  },
  "H315": {
    "statement": "Causes skin irritation.",
    "category": "Skin corrosion/irritation"
  },
  "H317": {
    "statement": "May cause an allergic skin reaction.",
    "category": "Skin sensitisation"
  },
  "H318": {
    "statement": "Causes serious eye damage.",
    "category": "Serious eye damage/eye irritation"
  },
  "H319": {
    "statement": "Causes serious eye irritation.",
    "category": "Serious eye damage/eye irritation"
  },
  "H330": {
    "statement": "Fatal if inhaled.",
    "category": "Acute toxicity, inhalation"
  },
  "H331": {
    "statement": "Toxic if inhaled.",
    "category": "Acute toxicity, inhalation"
  },
  "H332": {
    "statement": "Harmful if inhaled.",
    "category": "Acute toxicity, inhalation"
  },
  "H334": {
    "statement": "May cause allergy or asthma symptoms or breathing difficulties if inhaled.",
    "category": "Respiratory sensitisation"
  },
  "H335": {
    "statement": "May cause respiratory irritation.",
    "category": "STOT single exposure"
  },
  "H336": {
    "statement": "May cause drowsiness or dizziness.",
    "category": "STOT single exposure"
  },
  "H340": {
    "statement": "May cause genetic defects <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "Germ cell mutagenicity"
  },
  "H341": {
    "statement": "Suspected of causing genetic defects <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "Germ cell mutagenicity"
  },
  "H350": {
    "statement": "May cause cancer <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "Carcinogenicity"
  },
  "H350i": {
    "statement": "May cause cancer by inhalation.",
    "category": "Carcinogenicity"
  },
  "H351": {
    "statement": "Suspected of causing cancer <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "Carcinogenicity"
  },
  "H360": {
    "statement": "May damage fertility or the unborn child <state specific effect if known> <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "Reproductive toxicity"
  },
  "H360F": {
    "statement": "May damage fertility.",
    "category": "Reproductive toxicity"
  },
  "H360D": {
    "statement": "May damage the unborn child.",
    "category": "Reproductive toxicity"
  },
  "H360FD": {
    "statement": "May damage fertility. May damage the unborn child.",
    "category": "Reproductive toxicity"
  },
  "H360Fd": {
    "statement": "May damage fertility. Suspected of damaging the unborn child.",
    "category": "Reproductive toxicity"
  },
  "H360Df": {
    "statement": "May damage the unborn child. Suspected of damaging fertility.",
    "category": "Reproductive toxicity"
  },
  "H361": {
    "statement": "Suspected of damaging fertility or the unborn child <state specific effect if known> <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "Reproductive toxicity"
  },
  "H361f": {
    "statement": "Suspected of damaging fertility.",
    "category": "Reproductive toxicity"
  },
  "H361d": {
    "statement": "Suspected of damaging the unborn child.",
    "category": "Reproductive toxicity"
  },
  "H361fd": {
    "statement": "Suspected of damaging fertility. Suspected of damaging the unborn child.",
    "category": "Reproductive toxicity"
  },
  "H362": {
    "statement": "May cause harm to breast-fed children.",
    "category": "Reproductive toxicity, effects on lactation"
  },
  "H370": {
    "statement": "Causes damage to organs <or state all organs affected, if known> <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "STOT single exposure"
  },
  "H371": {
    "statement": "May cause damage to organs <or state all organs affected, if known> <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "STOT single exposure"
  },
  "H372": {
    "statement": "Causes damage to organs <or state all organs affected, if known> through prolonged or repeated exposure <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "STOT repeated exposure"
  },
  "H373": {
    "statement": "May cause damage to organs <or state all organs affected, if known> through prolonged or repeated exposure <state route of exposure if it is conclusively proven that no other routes of exposure cause the hazard>.",
    "category": "STOT repeated exposure"
  },
  "H300+H310": {
    "statement": "Fatal if swallowed or in contact with skin.",
    "category": "Acute toxicity, oral and dermal"
  },
  "H300+H330": {
    "statement": "Fatal if swallowed or if inhaled.",
    "category": "Acute toxicity, oral and inhalation"
  },
  "H310+H330": {
    "statement": "Fatal in contact with skin or if inhaled.",
    "category": "Acute toxicity, dermal and inhalation"
  },
  "H300+H310+H330": {
    "statement": "Fatal if swallowed, in contact with skin or if inhaled.",
    "category": "Acute toxicity, oral, dermal and inhalation"
  },
  "H301+H311": {
    "statement": "Toxic if swallowed or in contact with skin.",
    "category": "Acute toxicity, oral and dermal"
  },
  "H301+H331": {
    "statement": "Toxic if swallowed or if inhaled.",
    "category": "Acute toxicity, oral and inhalation"
  },
  "H311+H331": {
    "statement": "Toxic in contact with skin or if inhaled.",
    "category": "Acute toxicity, dermal and inhalation"
  },
  "H301+H311+H331": {
    "statement": "Toxic if swallowed, in contact with skin or if inhaled.",
    "category": "Acute toxicity, oral, dermal and inhalation"
  },
  "H302+H312": {
    "statement": "Harmful if swallowed or in contact with skin.",
    "category": "Acute toxicity, oral and dermal"
  },
  "H302+H332": {
    "statement": "Harmful if swallowed or if inhaled.",
    "category": "Acute toxicity, oral and inhalation"
  },
  "H312+H332": {
    "statement": "Harmful in contact with skin or if inhaled.",
    "category": "Acute toxicity, dermal and inhalation"
  },
  "H302+H312+H332": {
    "statement": "Harmful if swallowed, in contact with skin or if inhaled.",
    "category": "Acute toxicity, oral, dermal and inhalation"
  },
  "H400": {
    "statement": "Very toxic to aquatic life.",
    "category": "Hazardous to the aquatic environment - Acute"
  },
  "H410": {
    "statement": "Very toxic to aquatic life with long lasting effects.",
    "category": "Hazardous to the aquatic environment - Chronic"
  },
  "H411": {
    "statement": "Toxic to aquatic life with long lasting effects.",
    "category": "Hazardous to the aquatic environment - Chronic"
  },
  "H412": {
    "statement": "Harmful to aquatic life with long lasting effects.",
    "category": "Hazardous to the aquatic environment - Chronic"
  },
  "H413": {
    "statement": "May cause long lasting harmful effects to aquatic life.",
    "category": "Hazardous to the aquatic environment - Chronic"
  },
  "H420": {
    "statement": "Harms public health and the environment by destroying ozone in the upper atmosphere.",
    "category": "Hazardous to the ozone layer"
  },
  "EUH014": {
    "statement": "Reacts violently with water.",
    "category": "Supplemental physical hazard"
  },
  "EUH018": {
    "statement": "In use may form flammable/explosive vapour-air mixture.",
    "category": "Supplemental physical hazard"
  },
  "EUH019": {
    "statement": "May form explosive peroxides.",
    "category": "Supplemental physical hazard"
  },
  "EUH029": {
    "statement": "Contact with water liberates toxic gas.",
    "category": "Supplemental health hazard"
  },
  "EUH031": {
    "statement": "Contact with acids liberates toxic gas.",
    "category": "Supplemental health hazard"
  },
  "EUH032": {
    "statement": "Contact with acids liberates very toxic gas.",
    "category": "Supplemental health hazard"
  },
  "EUH044": {
    "statement": "Risk of explosion if heated under confinement.",
    "category": "Supplemental physical hazard"
  },
  "EUH066": {
    "statement": "Repeated exposure may cause skin dryness or cracking.",
    "category": "Supplemental health hazard"
  },
  "EUH070": {
    "statement": "Toxic by eye contact.",
    "category": "Supplemental health hazard"
  },
  "EUH071": {
    "statement": "Corrosive to the respiratory tract.",
    "category": "Supplemental health hazard"
  },
  "EUH201": {
    "statement": "Contains lead. Should not be used on surfaces liable to be chewed or sucked by children.",
    "category": "Supplemental label elements"
  },
  "EUH201A": {
    "statement": "Warning! Contains lead.",
    "category": "Supplemental label elements"
  },
  "EUH202": {
    "statement": "Cyanoacrylate. Danger. Bonds skin and eyes in seconds. Keep out of the reach of children.",
    "category": "Supplemental label elements"
  },
  "EUH203": {
    "statement": "Contains chromium (VI). May produce an allergic reaction.",
    "category": "Supplemental label elements"
  },
  "EUH204": {
    "statement": "Contains isocyanates. May produce an allergic reaction.",
    "category": "Supplemental label elements"
  },
  "EUH205": {
    "statement": "Contains epoxy constituents. May produce an allergic reaction.",
    "category": "Supplemental label elements"
  },
  "EUH206": {
    "statement": "Warning! Do not use together with other products. May release dangerous gases (chlorine).",
    "category": "Supplemental label elements"
  },
  "EUH207": {
    "statement": "Warning! Contains cadmium. Dangerous fumes are formed during use. See information supplied by the manufacturer. Comply with the safety instructions.",
    "category": "Supplemental label elements"
  },
  "EUH208": {
    "statement": "Contains <name of sensitising substance>. May produce an allergic reaction.",
    "category": "Supplemental label elements"
  },
  "EUH209": {
    "statement": "Can become highly flammable in use.",
    "category": "Supplemental label elements"
  },
  "EUH209A": {
    "statement": "Can become flammable in use.",
    "category": "Supplemental label elements"
  },
  "EUH210": {
    "statement": "Safety data sheet available on request.",
    "category": "Supplemental label elements"
  },
  "EUH211": {
    "statement": "Warning! Hazardous respirable droplets may be formed when sprayed. Do not breathe spray or mist.",
    "category": "Supplemental label elements"
  },
  "EUH212": {
    "statement": "Warning! Hazardous respirable dust may be formed when used. Do not breathe dust.",
    "category": "Supplemental label elements"
  },
  "EUH380": {
    "statement": "May cause endocrine disruption in humans.",
    "category": "Endocrine Disruption - Human Health Cat 1 (EU 2023/707)"
  },
  "EUH381": {
    "statement": "Suspected of causing endocrine disruption in humans.",
    "category": "Endocrine Disruption - Human Health Cat 2 (EU 2023/707)"
  },
  "EUH401": {
    "statement": "To avoid risks to human health and the environment, comply with the instructions for use.",
    "category": "Plant protection products"
  },
  "EUH430": {
    "statement": "May cause endocrine disruption in the environment.",
    "category": "Endocrine Disruption - Environment Cat 1 (EU 2023/707)"
  },
  "EUH431": {
    "statement": "Suspected of causing endocrine disruption in the environment.",
    "category": "Endocrine Disruption - Environment Cat 2 (EU 2023/707)"
  },
  "EUH440": {
    "statement": "Accumulates in the environment and living organisms including in humans.",
    "category": "PBT - Persistent, Bioaccumulative & Toxic (EU 2023/707)"
  },
  "EUH441": {
    "statement": "Strongly accumulates in the environment and living organisms including in humans.",
    "category": "vPvB - Very Persistent & Very Bioaccumulative (EU 2023/707)"
  },
  "EUH450": {
    "statement": "Can cause long-lasting and diffuse contamination of water resources.",
    "category": "PMT - Persistent, Mobile & Toxic (EU 2023/707)"
  },
  "EUH451": {
    "statement": "Can cause very long-lasting and diffuse contamination of water resources.",
    "category": "vPvM - Very Persistent & Very Mobile (EU 2023/707)"
  }
};

/**
 * Standard UN GHS & EU CLP Precautionary Statements (P-Statements)
 * Extracted from MSDS-Europe / ToxInfo official reference (2020)
 * Upgraded with latest UN GHS Rev. 9 / 10 / 11 (including P203, P236, P316-P319, P322, P323, P354).
 */
export const GHS_P_STATEMENTS: Record<
  string,
  { statement: string; type: 'general' | 'prevention' | 'response' | 'storage' | 'disposal' }
> = {
  "P101": {
    "statement": "If medical advice is needed, have product container or label at hand.",
    "type": "general"
  },
  "P102": {
    "statement": "Keep out of reach of children.",
    "type": "general"
  },
  "P103": {
    "statement": "Read carefully and follow all instructions.",
    "type": "general"
  },
  "P201": {
    "statement": "Obtain special instructions before use.",
    "type": "prevention"
  },
  "P202": {
    "statement": "Do not handle until all safety precautions have been read and understood.",
    "type": "prevention"
  },
  "P203": {
    "statement": "Obtain, read and follow all safety instructions before use.",
    "type": "prevention"
  },
  "P210": {
    "statement": "Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. No smoking.",
    "type": "prevention"
  },
  "P211": {
    "statement": "Do not spray on an open flame or other ignition source.",
    "type": "prevention"
  },
  "P212": {
    "statement": "Avoid heating under confinement or reduction of the desensitising agent.",
    "type": "prevention"
  },
  "P220": {
    "statement": "Keep away from clothing and other combustible materials.",
    "type": "prevention"
  },
  "P222": {
    "statement": "Do not allow contact with air.",
    "type": "prevention"
  },
  "P223": {
    "statement": "Do not allow contact with water.",
    "type": "prevention"
  },
  "P230": {
    "statement": "Keep wetted with\u2026",
    "type": "prevention"
  },
  "P231": {
    "statement": "Handle and store contents under inert gas/\u2026",
    "type": "prevention"
  },
  "P232": {
    "statement": "Protect from moisture.",
    "type": "prevention"
  },
  "P233": {
    "statement": "Keep container tightly closed.",
    "type": "prevention"
  },
  "P234": {
    "statement": "Keep only in original packaging.",
    "type": "prevention"
  },
  "P235": {
    "statement": "Keep cool.",
    "type": "prevention"
  },
  "P236": {
    "statement": "Keep only in original packaging; Division ... in the transport configuration.",
    "type": "prevention"
  },
  "P240": {
    "statement": "Ground and bond container and receiving equipment.",
    "type": "prevention"
  },
  "P241": {
    "statement": "Use explosion-proof [electrical/ventilating/lighting/\u2026] equipment.",
    "type": "prevention"
  },
  "P242": {
    "statement": "Use only non-sparking tools.",
    "type": "prevention"
  },
  "P243": {
    "statement": "Take precautionary measures against static discharge.",
    "type": "prevention"
  },
  "P244": {
    "statement": "Keep valves and fittings free from oil and grease.",
    "type": "prevention"
  },
  "P250": {
    "statement": "Do not subject to grinding/shock/friction/\u2026 .",
    "type": "prevention"
  },
  "P251": {
    "statement": "Do not pierce or burn, even after use.",
    "type": "prevention"
  },
  "P260": {
    "statement": "Do not breathe dust/fume/gas/mist/vapours/spray.",
    "type": "prevention"
  },
  "P261": {
    "statement": "Avoid breathing dust/fume/gas/mist/vapours/spray.",
    "type": "prevention"
  },
  "P262": {
    "statement": "Do not get in eyes, on skin, or on clothing.",
    "type": "prevention"
  },
  "P263": {
    "statement": "Avoid contact during pregnancy and while nursing.",
    "type": "prevention"
  },
  "P264": {
    "statement": "Wash \u2026 thoroughly after handling.",
    "type": "prevention"
  },
  "P270": {
    "statement": "Do not eat, drink or smoke when using this product.",
    "type": "prevention"
  },
  "P271": {
    "statement": "Use only outdoors or in a well-ventilated area.",
    "type": "prevention"
  },
  "P272": {
    "statement": "Contaminated work clothing should not be allowed out of the workplace.",
    "type": "prevention"
  },
  "P273": {
    "statement": "Avoid release to the environment.",
    "type": "prevention"
  },
  "P280": {
    "statement": "Wear protective gloves/protective clothing/eye protection/face protection/hearing protection/\u2026",
    "type": "prevention"
  },
  "P282": {
    "statement": "Wear cold insulating gloves and either face shield or eye protection.",
    "type": "prevention"
  },
  "P283": {
    "statement": "Wear fire resistant or flame retardant clothing.",
    "type": "prevention"
  },
  "P284": {
    "statement": "[In case of inadequate ventilation] wear respiratory protection.",
    "type": "prevention"
  },
  "P231+P232": {
    "statement": "Handle and store contents under inert gas/\u2026. Protect from moisture.",
    "type": "prevention"
  },
  "P301": {
    "statement": "IF SWALLOWED:",
    "type": "response"
  },
  "P302": {
    "statement": "IF ON SKIN:",
    "type": "response"
  },
  "P303": {
    "statement": "IF ON SKIN (or hair):",
    "type": "response"
  },
  "P304": {
    "statement": "IF INHALED:",
    "type": "response"
  },
  "P305": {
    "statement": "IF IN EYES:",
    "type": "response"
  },
  "P306": {
    "statement": "IF ON CLOTHING:",
    "type": "response"
  },
  "P308": {
    "statement": "IF exposed or concerned:",
    "type": "response"
  },
  "P310": {
    "statement": "Immediately call a POISON CENTER/doctor/\u2026",
    "type": "response"
  },
  "P311": {
    "statement": "Call a POISON CENTER/doctor/\u2026",
    "type": "response"
  },
  "P312": {
    "statement": "Call a POISON CENTER/doctor/\u2026/if you feel unwell.",
    "type": "response"
  },
  "P313": {
    "statement": "Get medical advice/attention.",
    "type": "response"
  },
  "P314": {
    "statement": "Get medical advice/attention if you feel unwell.",
    "type": "response"
  },
  "P315": {
    "statement": "Get immediate medical advice/attention.",
    "type": "response"
  },
  "P316": {
    "statement": "Get emergency medical help immediately.",
    "type": "response"
  },
  "P317": {
    "statement": "Get medical help.",
    "type": "response"
  },
  "P318": {
    "statement": "if exposed or concerned, get medical advice.",
    "type": "response"
  },
  "P319": {
    "statement": "Get medical help if you feel unwell.",
    "type": "response"
  },
  "P320": {
    "statement": "Specific treatment is urgent (see \u2026 on this label).",
    "type": "response"
  },
  "P321": {
    "statement": "Specific treatment (see \u2026 on this label).",
    "type": "response"
  },
  "P322": {
    "statement": "Immediate specific treatment required, see Safety Data Sheet.",
    "type": "response"
  },
  "P323": {
    "statement": "Specific treatment, see Safety Data Sheet.",
    "type": "response"
  },
  "P330": {
    "statement": "Rinse mouth.",
    "type": "response"
  },
  "P331": {
    "statement": "Do NOT induce vomiting.",
    "type": "response"
  },
  "P332": {
    "statement": "If skin irritation occurs:",
    "type": "response"
  },
  "P333": {
    "statement": "If skin irritation or rash occurs:",
    "type": "response"
  },
  "P334": {
    "statement": "Immerse in cool water [or wrap in wet bandages].",
    "type": "response"
  },
  "P335": {
    "statement": "Brush off loose particles from skin.",
    "type": "response"
  },
  "P336": {
    "statement": "Thaw frosted parts with lukewarm water. Do no rub affected area.",
    "type": "response"
  },
  "P337": {
    "statement": "If eye irritation persists:",
    "type": "response"
  },
  "P338": {
    "statement": "Remove contact lenses, if present and easy to do. Continue rinsing.",
    "type": "response"
  },
  "P340": {
    "statement": "Remove person to fresh air and keep comfortable for breathing.",
    "type": "response"
  },
  "P342": {
    "statement": "If experiencing respiratory symptoms:",
    "type": "response"
  },
  "P351": {
    "statement": "Rinse cautiously with water for several minutes.",
    "type": "response"
  },
  "P352": {
    "statement": "Wash with plenty of water/\u2026",
    "type": "response"
  },
  "P353": {
    "statement": "Rinse skin with water [or shower].",
    "type": "response"
  },
  "P354": {
    "statement": "Immediately rinse with water for several minutes.",
    "type": "response"
  },
  "P360": {
    "statement": "Rinse immediately contaminated clothing and skin with plenty of water before removing clothes.",
    "type": "response"
  },
  "P361": {
    "statement": "Take off immediately all contaminated clothing.",
    "type": "response"
  },
  "P362": {
    "statement": "Take off contaminated clothing.",
    "type": "response"
  },
  "P363": {
    "statement": "Wash contaminated clothing before reuse.",
    "type": "response"
  },
  "P364": {
    "statement": "And wash it before reuse.",
    "type": "response"
  },
  "P370": {
    "statement": "In case of fire:",
    "type": "response"
  },
  "P371": {
    "statement": "In case of major fire and large quantities:",
    "type": "response"
  },
  "P372": {
    "statement": "Explosion risk.",
    "type": "response"
  },
  "P373": {
    "statement": "DO NOT fight fire when fire reaches explosives.",
    "type": "response"
  },
  "P375": {
    "statement": "Fight fire remotely due to the risk of explosion.",
    "type": "response"
  },
  "P376": {
    "statement": "Stop leak if safe to do so.",
    "type": "response"
  },
  "P377": {
    "statement": "Leaking gas fire: Do not extinguish, unless leak can be stopped safely.",
    "type": "response"
  },
  "P378": {
    "statement": "Use\u2026 to extinguish.",
    "type": "response"
  },
  "P380": {
    "statement": "Evacuate area.",
    "type": "response"
  },
  "P381": {
    "statement": "In case of leakage, eliminate all ignition sources.",
    "type": "response"
  },
  "P390": {
    "statement": "Absorb spillage to prevent material damage.",
    "type": "response"
  },
  "P391": {
    "statement": "Collect spillage.",
    "type": "response"
  },
  "P301+P310": {
    "statement": "IF SWALLOWED: Immediately call a POISON CENTER/doctor/\u2026",
    "type": "response"
  },
  "P301+P312": {
    "statement": "IF SWALLOWED: Call a POISON CENTER/ doctor/\u2026 if you feel unwell.",
    "type": "response"
  },
  "P301+P316": {
    "statement": "IF SWALLOWED: Get emergency medical help immediately.",
    "type": "response"
  },
  "P301+P317": {
    "statement": "IF SWALLOWED: Get medical help.",
    "type": "response"
  },
  "P301+P330+P331": {
    "statement": "IF SWALLOWED: Rinse mouth. Do NOT induce vomiting.",
    "type": "response"
  },
  "P302+P317": {
    "statement": "IF ON SKIN: Get medical help.",
    "type": "response"
  },
  "P302+P334": {
    "statement": "IF ON SKIN: Immerse in cool water or wrap in wet bandages.",
    "type": "response"
  },
  "P302+P352": {
    "statement": "IF ON SKIN: Wash with plenty of water/\u2026",
    "type": "response"
  },
  "P302+P361+P353": {
    "statement": "IF ON SKIN: Take off immediately all contaminated clothing. Rinse skin with water [or shower].",
    "type": "response"
  },
  "P303+P361+P353": {
    "statement": "IF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse skin with water [or shower].",
    "type": "response"
  },
  "P304+P340": {
    "statement": "IF INHALED: Remove person to fresh air and keep comfortable for breathing.",
    "type": "response"
  },
  "P305+P351+P338": {
    "statement": "IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses, if present and easy to do. Continue rinsing.",
    "type": "response"
  },
  "P305+P354+P338": {
    "statement": "IF IN EYES: Immediately rinse with water for several minutes. Remove contact lenses, if present and easy to do. Continue rinsing.",
    "type": "response"
  },
  "P306+P360": {
    "statement": "IF ON CLOTHING: rinse immediately contaminated clothing and skin with plenty of water before removing clothes.",
    "type": "response"
  },
  "P308+P311": {
    "statement": "IF exposed or concerned: Call a POISON CENTER/doctor/\u2026",
    "type": "response"
  },
  "P308+P313": {
    "statement": "IF exposed or concerned: Get medical advice/ attention.",
    "type": "response"
  },
  "P308+P316": {
    "statement": "IF exposed or concerned: Get emergency medical help immediately.",
    "type": "response"
  },
  "P332+P313": {
    "statement": "If skin irritation occurs: Get medical advice/attention.",
    "type": "response"
  },
  "P332+P317": {
    "statement": "If skin irritation occurs: Get medical help.",
    "type": "response"
  },
  "P333+P313": {
    "statement": "If skin irritation or rash occurs: Get medical advice/attention.",
    "type": "response"
  },
  "P333+P317": {
    "statement": "If skin irritation or rash occurs: Get medical help.",
    "type": "response"
  },
  "P337+P313": {
    "statement": "If eye irritation persists: Get medical advice/ attention.",
    "type": "response"
  },
  "P337+P317": {
    "statement": "If eye irritation persists: Get medical help.",
    "type": "response"
  },
  "P342+P311": {
    "statement": "If experiencing respiratory symptoms: Call a POISON CENTER/doctor/\u2026",
    "type": "response"
  },
  "P342+P316": {
    "statement": "If experiencing respiratory symptoms: Get emergency medical help immediately.",
    "type": "response"
  },
  "P361+P364": {
    "statement": "Take off immediately all contaminated clothing and wash it before reuse.",
    "type": "response"
  },
  "P362+P364": {
    "statement": "Take off contaminated clothing and wash it before reuse.",
    "type": "response"
  },
  "P370+P376": {
    "statement": "In case of fire: Stop leak if safe to do so.",
    "type": "response"
  },
  "P370+P378": {
    "statement": "In case of fire: Use\u2026 to extinguish.",
    "type": "response"
  },
  "P370+P380+P375": {
    "statement": "In case of fire: Evacuate area. Fight fire remotely due to the risk of explosion.",
    "type": "response"
  },
  "P371+P380+P375": {
    "statement": "In case of major fire and large quantities: Evacuate area. Fight fire remotely due to the risk of explosion.",
    "type": "response"
  },
  "P401": {
    "statement": "Store in accordance with\u2026",
    "type": "storage"
  },
  "P402": {
    "statement": "Store in a dry place.",
    "type": "storage"
  },
  "P403": {
    "statement": "Store in a well-ventilated place.",
    "type": "storage"
  },
  "P404": {
    "statement": "Store in a closed container.",
    "type": "storage"
  },
  "P405": {
    "statement": "Store locked up.",
    "type": "storage"
  },
  "P406": {
    "statement": "Store in corrosive resistant/\u2026 container with a resistant inner liner.",
    "type": "storage"
  },
  "P407": {
    "statement": "Maintain air gap between stacks or pallets.",
    "type": "storage"
  },
  "P410": {
    "statement": "Protect from sunlight.",
    "type": "storage"
  },
  "P411": {
    "statement": "Store at temperatures not exceeding \u2026 \u00b0C/ \u2026 \u00b0F.",
    "type": "storage"
  },
  "P412": {
    "statement": "Do not expose to temperatures exceeding 50 \u00b0C/ 122 \u00b0F.",
    "type": "storage"
  },
  "P413": {
    "statement": "Store bulk masses greater than \u2026 kg/\u2026 lbs at temperatures not exceeding \u2026 \u00b0C/\u2026 \u00b0F.",
    "type": "storage"
  },
  "P420": {
    "statement": "Store separately.",
    "type": "storage"
  },
  "P402+P404": {
    "statement": "Store in a dry place. Store in a closed container.",
    "type": "storage"
  },
  "P403+P233": {
    "statement": "Store in a well-ventilated place. Keep container tightly closed.",
    "type": "storage"
  },
  "P403+P235": {
    "statement": "Store in a well-ventilated place. Keep cool.",
    "type": "storage"
  },
  "P410+P403": {
    "statement": "Protect from sunlight. Store in a well-ventilated place.",
    "type": "storage"
  },
  "P410+P412": {
    "statement": "Protect from sunlight. Do not expose to temperatures exceeding 50 \u00b0C/ 122 \u00b0F.",
    "type": "storage"
  },
  "P501": {
    "statement": "Dispose of contents/container to \u2026",
    "type": "disposal"
  },
  "P502": {
    "statement": "Refer to manufacturer or supplier for information on recovery or recycling.",
    "type": "disposal"
  },
  "P503": {
    "statement": "Refer to manufacturer/ supplier/\u2026 for information on disposal/recovery/ recycling.",
    "type": "disposal"
  }
};

/**
 * Normalizes an H statement code or text against the controlled reference database.
 * Supports standard codes (H200, H301), combinations (H300+H310), and EUH statements (EUH014, EUH380).
 */
export function lookupHStatement(codeOrText: string): GhsStatement | null {
  if (!codeOrText) return null;
  const trimmed = codeOrText.trim();
  
  // Direct match
  if (GHS_H_STATEMENTS[trimmed]) {
    return {
      code: trimmed,
      statement: GHS_H_STATEMENTS[trimmed].statement,
      category: GHS_H_STATEMENTS[trimmed].category,
      type: 'hazard',
    };
  }

  // Normalized code lookup (e.g. EUH 014 -> EUH014, H-301 -> H301, H300 + H310 -> H300+H310)
  const normalizedCode = trimmed.toUpperCase().replace(/\s*\+\s*/g, '+').replace(/^(EUH)[\s\-_]?(\d{3}[A-Z]?)$/, '$1$2').replace(/^(H)[\s\-_]?(\d{3}[A-Z]?)$/, '$1$2');
  if (GHS_H_STATEMENTS[normalizedCode]) {
    return {
      code: normalizedCode,
      statement: GHS_H_STATEMENTS[normalizedCode].statement,
      category: GHS_H_STATEMENTS[normalizedCode].category,
      type: 'hazard',
    };
  }

  // Substring / text search match
  const lower = trimmed.toLowerCase();
  for (const [code, data] of Object.entries(GHS_H_STATEMENTS)) {
    if (lower === code.toLowerCase() || data.statement.toLowerCase().includes(lower) || (lower.length >= 12 && lower.includes(data.statement.toLowerCase().slice(0, 25)))) {
      return {
        code,
        statement: data.statement,
        category: data.category,
        type: 'hazard',
      };
    }
  }

  return null;
}

/**
 * Normalizes a P statement code or text against the controlled reference database.
 * Supports standard codes (P101, P280), combinations (P301+P310), and text search.
 */
export function lookupPStatement(codeOrText: string): GhsStatement | null {
  if (!codeOrText) return null;
  const trimmed = codeOrText.trim();

  // Direct match
  if (GHS_P_STATEMENTS[trimmed]) {
    return {
      code: trimmed,
      statement: GHS_P_STATEMENTS[trimmed].statement,
      type: GHS_P_STATEMENTS[trimmed].type,
    };
  }

  // Normalized code lookup (e.g. P-280 -> P280, P301 + P310 -> P301+P310)
  const normalizedCode = trimmed.toUpperCase().replace(/\s*\+\s*/g, '+').replace(/^(P)[\s\-_]?(\d{3})$/, '$1$2');
  if (GHS_P_STATEMENTS[normalizedCode]) {
    return {
      code: normalizedCode,
      statement: GHS_P_STATEMENTS[normalizedCode].statement,
      type: GHS_P_STATEMENTS[normalizedCode].type,
    };
  }

  // Substring / text search match
  const lower = trimmed.toLowerCase();
  for (const [code, data] of Object.entries(GHS_P_STATEMENTS)) {
    if (lower === code.toLowerCase() || data.statement.toLowerCase().includes(lower) || (lower.length >= 15 && lower.includes(data.statement.toLowerCase().slice(0, 25)))) {
      return {
        code,
        statement: data.statement,
        type: data.type,
      };
    }
  }

  return null;
}

export const GHS_HAZARD_STATEMENTS = GHS_H_STATEMENTS;
export const GHS_PRECAUTIONARY_STATEMENTS = GHS_P_STATEMENTS;
