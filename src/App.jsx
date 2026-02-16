import { useState, useMemo, useEffect, useRef } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from '@vercel/analytics/next';

const SCHEDULE_DATA = [
  // Birth
  { vaccine: "Hepatitis B", shortName: "HepB", age: "Birth", ageSort: 0, type: "routine", brand: "Engerix B / HB Vax II", route: "IM", notes: "Give within 24 hours of birth (must be within 7 days). No catch-up required if missed." },
  // 6 weeks
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "6 weeks", ageSort: 1, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Diphtheria, tetanus, pertussis, hepatitis B, polio, Haemophilus influenzae type b." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "6 weeks", ageSort: 1, type: "routine", brand: "Prevenar 20", route: "IM", notes: "From Sep 2025, Prevenar 20 replaces Prevenar 13 for all children <18 years." },
  { vaccine: "Rotavirus", shortName: "Rota", age: "6 weeks", ageSort: 1, type: "routine", brand: "Rotarix", route: "Oral", notes: "Dose 1 must be given by 14 weeks + 6 days of age. Cannot be given after this window." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "6 weeks", ageSort: 1, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander infants. Prophylactic paracetamol recommended." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "6 weeks", ageSort: 1, type: "recommended", brand: "Bexsero", route: "IM", notes: "Recommended for ALL infants <2 years. Not NIP-funded for non-Indigenous children â€” available via private prescription (~$110â€“135/dose). State-funded in SA, QLD, NT. Prophylactic paracetamol recommended." },
  // 4 months
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "4 months", ageSort: 2, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Second dose of the hexavalent combination vaccine." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "4 months", ageSort: 2, type: "routine", brand: "Prevenar 20", route: "IM", notes: "Second dose of pneumococcal conjugate vaccine." },
  { vaccine: "Rotavirus", shortName: "Rota", age: "4 months", ageSort: 2, type: "routine", brand: "Rotarix", route: "Oral", notes: "Dose 2 must be given by 24 weeks of age. Series cannot be started or continued after age limits." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "4 months", ageSort: 2, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander infants. Prophylactic paracetamol recommended." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "4 months", ageSort: 2, type: "recommended", brand: "Bexsero", route: "IM", notes: "Recommended for ALL infants <2 years. Not NIP-funded for non-Indigenous children. State-funded in SA, QLD, NT. Prophylactic paracetamol recommended." },
  // 6 months
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "6 months", ageSort: 3, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Third dose of the hexavalent combination vaccine." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "6 months", ageSort: 3, type: "at-risk", brand: "Prevenar 20", route: "IM", notes: "Additional dose for Aboriginal & Torres Strait Islander children and children with specified medical risk conditions." },
  { vaccine: "Influenza", shortName: "Flu", age: "6 monthsâ€“5 years", ageSort: 3.5, type: "routine", brand: "Various", route: "IM", notes: "Annual vaccination. First year: 2 doses â‰¥4 weeks apart for children <9 years. One dose annually thereafter." },
  // 12 months
  { vaccine: "Meningococcal ACWY", shortName: "MenACWY", age: "12 months", ageSort: 4, type: "routine", brand: "Nimenrix / MenQuadfi", route: "IM", notes: "Single dose at 12 months. Protects against serogroups A, C, W and Y." },
  { vaccine: "MMR", shortName: "MMR", age: "12 months", ageSort: 4, type: "routine", brand: "M-M-R II / Priorix", route: "SC", notes: "Measles, mumps and rubella. First dose." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "12 months", ageSort: 4, type: "routine", brand: "Prevenar 20", route: "IM", notes: "Booster dose (3rd routine dose). From Sep 2025, all Aboriginal & Torres Strait Islander children in all states/territories receive 4-dose schedule." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "12 months", ageSort: 4, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander children. Catch-up available for ATSI children <2 years." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "12 months", ageSort: 4, type: "recommended", brand: "Bexsero", route: "IM", notes: "Booster dose recommended for ALL children. Not NIP-funded for non-Indigenous children. State-funded in SA, QLD, NT." },
  // 18 months
  { vaccine: "Hib", shortName: "Hib", age: "18 months", ageSort: 5, type: "routine", brand: "ActHIB / PedvaxHIB", route: "IM", notes: "Haemophilus influenzae type b booster dose." },
  { vaccine: "DTPa", shortName: "DTPa", age: "18 months", ageSort: 5, type: "routine", brand: "Infanrix / Tripacel", route: "IM", notes: "Diphtheria, tetanus, acellular pertussis booster." },
  { vaccine: "MMRV", shortName: "MMRV", age: "18 months", ageSort: 5, type: "routine", brand: "Priorix-Tetra", route: "SC", notes: "Measles, mumps, rubella and varicella (chickenpox). Second MMR dose + first varicella dose." },
  { vaccine: "Varicella (2nd dose)", shortName: "VZV2", age: "18 months+", ageSort: 5.5, type: "recommended", brand: "Varilrix", route: "SC", notes: "A 2nd dose of varicella vaccine is recommended for all children 12m to <14y, â‰¥4 weeks after first dose (MMRV at 18m). Not NIP-funded. Reduces risk of breakthrough varicella. Can be given at any age from 19 months to 13 years." },
  { vaccine: "Hepatitis A", shortName: "HepA", age: "18 months", ageSort: 5, type: "indigenous", brand: "Vaqta Paed / Havrix Junior", route: "IM", notes: "Aboriginal and Torres Strait Islander children in QLD, NT, SA, WA. First dose of 2-dose schedule." },
  // 4 years
  { vaccine: "DTPa-IPV", shortName: "DTPa-IPV", age: "4 years", ageSort: 6, type: "routine", brand: "Infanrix IPV / Quadracel", route: "IM", notes: "Diphtheria, tetanus, pertussis and polio booster before starting school." },
  { vaccine: "Hepatitis A", shortName: "HepA", age: "4 years", ageSort: 6, type: "indigenous", brand: "Vaqta Paed / Havrix Junior", route: "IM", notes: "Aboriginal and Torres Strait Islander children in QLD, NT, SA, WA. Second dose." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "4 years", ageSort: 6, type: "at-risk", brand: "Prevenar 20", route: "IM", notes: "Catch-up doses available for some children. Refer to Immunisation Handbook." },
  // School - Year 7
  { vaccine: "HPV", shortName: "HPV", age: "Year 7 (12â€“13 yrs)", ageSort: 7, type: "routine", brand: "Gardasil 9", route: "IM", notes: "2 doses, 6â€“12 months apart. 3 doses required if starting â‰¥15 years or certain medical conditions." },
  { vaccine: "dTpa", shortName: "dTpa", age: "Year 7 (12â€“13 yrs)", ageSort: 7, type: "routine", brand: "Boostrix", route: "IM", notes: "Reduced antigen diphtheria, tetanus and pertussis booster for adolescents." },
  // School - Year 10
  { vaccine: "Meningococcal ACWY", shortName: "MenACWY", age: "Year 10 (15â€“16 yrs)", ageSort: 8, type: "routine", brand: "Nimenrix / MenQuadfi", route: "IM", notes: "Adolescent dose. School-based program." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "15â€“19 years", ageSort: 8.5, type: "recommended", brand: "Bexsero", route: "IM", notes: "2 doses (8 weeks apart) recommended for all healthy adolescents 15â€“19 years. Not NIP-funded. Available via private prescription (~$110â€“135/dose). Also recommended for 15â€“24y in close quarters, smokers, military recruits." },
  // Pregnancy
  { vaccine: "Influenza", shortName: "Flu", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Various", route: "IM", notes: "Recommended during each pregnancy, any trimester." },
  { vaccine: "Pertussis (dTpa)", shortName: "dTpa", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Boostrix", route: "IM", notes: "Recommended each pregnancy, ideally 20â€“32 weeks. Provides passive antibody protection to newborn." },
  { vaccine: "RSV (Abrysvo)", shortName: "RSV", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Abrysvo", route: "IM", notes: "NIP-funded from Feb 2025. Single dose recommended from 28 weeks gestation (up to 36w, or later if missed). Provides passive RSV protection to infant for ~6 months via transplacental antibodies. Only Abrysvo is approved for pregnancy â€” do NOT use Arexvy." },
  // Infant RSV â€” state-funded
  { vaccine: "Nirsevimab (RSV mAb)", shortName: "Nirsev", age: "Infants (seasonal)", ageSort: 0.5, type: "state", brand: "Beyfortus", route: "IM", notes: "Long-acting monoclonal antibody (not a vaccine). State/territory-funded â€” eligibility and timing vary by jurisdiction. Given to infants whose mothers did not receive Abrysvo, or <2 weeks after maternal vaccination, or with medical risk factors for severe RSV. Single dose; seasonal programs typically Aprâ€“Sep." },
  // Older adults
  { vaccine: "Influenza", shortName: "Flu", age: "â‰¥65 years", ageSort: 10, type: "routine", brand: "Various (enhanced)", route: "IM", notes: "Annual vaccination. Enhanced or adjuvanted formulations recommended." },
  { vaccine: "Shingles (Herpes Zoster)", shortName: "Zoster", age: "â‰¥65 years", ageSort: 10, type: "routine", brand: "Shingrix", route: "IM", notes: "Non-Indigenous adults. 2 doses, 2â€“6 months apart. If previously had Zostavax via NIP, wait 5 years." },
  { vaccine: "Shingles (Herpes Zoster)", shortName: "Zoster", age: "â‰¥50 years (ATSI)", ageSort: 9.5, type: "indigenous", brand: "Shingrix", route: "IM", notes: "Aboriginal and Torres Strait Islander adults â‰¥50 years. 2 doses, 2â€“6 months apart." },
  { vaccine: "Pneumococcal (13vPCV)", shortName: "PCV13", age: "â‰¥70 years", ageSort: 11, type: "routine", brand: "Prevenar 13", route: "IM", notes: "Non-Indigenous adults. Adult program still uses 13vPCV (20vPCV not yet NIP-funded for adults). Followed by 23vPPV." },
  { vaccine: "Pneumococcal", shortName: "PCV", age: "â‰¥50 years (ATSI)", ageSort: 9.5, type: "indigenous", brand: "Prevenar 13 + Pneumovax 23", route: "IM", notes: "Aboriginal and Torres Strait Islander adults. 13vPCV then 23vPPV 12 months later." },
];

const AGE_GROUPS = [
  "Birth", "Infants (seasonal)", "6 weeks", "4 months", "6 months", "6 monthsâ€“5 years",
  "12 months", "18 months", "18 months+", "4 years",
  "Year 7 (12â€“13 yrs)", "Year 10 (15â€“16 yrs)", "15â€“19 years",
  "Pregnancy",
  "â‰¥50 years (ATSI)", "â‰¥65 years", "â‰¥70 years"
];

const TYPES = {
  routine: { label: "NIP Routine", color: "#0D6E3F", bg: "#E8F5EE" },
  indigenous: { label: "Aboriginal & TSI", color: "#9B4D13", bg: "#FEF0E4" },
  "at-risk": { label: "At-Risk / Medical", color: "#1D4ED8", bg: "#E6EFFF" },
  recommended: { label: "Recommended (not funded)", color: "#7C3AED", bg: "#F3EEFF" },
  state: { label: "State/Territory funded", color: "#B45309", bg: "#FEF3C7" },
};

const STATES = {
  ALL: "All states/territories",
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
};

// State-specific funding for vaccines not universally funded on NIP
const STATE_FUNDING = {
  MenB: ["SA", "QLD", "NT"], // MenB for all infants (non-Indigenous)
  HepA: ["QLD", "NT", "SA", "WA"], // HepA for ATSI children
  Nirsev: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"], // All states have RSV programs
};

// Check if a vaccine is funded in a specific state
function isFundedInState(vaccine, state) {
  if (state === "ALL") return true;
  
  // Routine and at-risk are NIP-funded everywhere
  if (vaccine.type === "routine" || vaccine.type === "at-risk") return true;
  
  // Indigenous vaccines are NIP-funded everywhere for ATSI people
  // But HepA is only in certain states
  if (vaccine.type === "indigenous") {
    if (vaccine.shortName === "HepA") {
      return STATE_FUNDING.HepA.includes(state);
    }
    return true; // Other indigenous vaccines (MenB, Zoster, PCV) are funded everywhere
  }
  
  // State-funded and recommended vaccines - check specific state funding
  if (vaccine.shortName === "MenB" && vaccine.type === "recommended") {
    return STATE_FUNDING.MenB.includes(state);
  }
  
  if (vaccine.shortName === "Nirsev") {
    return STATE_FUNDING.Nirsev.includes(state);
  }
  
  // VZV2 and adolescent MenB are recommended everywhere but not funded anywhere
  return false;
}

// Timeline shows individual antigens, mapping through combination vaccines
const TIMELINE_ANTIGENS = [
  { label: "Hep B",     key: "HepB" },
  { label: "DTPa",      key: "DTPa" },
  { label: "IPV",       key: "IPV" },
  { label: "Hib",       key: "Hib" },
  { label: "PCV",       key: "PCV" },
  { label: "Rotavirus", key: "Rota" },
  { label: "RSV",       key: "RSV" },
  { label: "MenB",      key: "MenB" },
  { label: "Influenza", key: "Flu" },
  { label: "MenACWY",   key: "MenACWY" },
  { label: "MMR",       key: "MMR" },
  { label: "Varicella",  key: "VZV" },
  { label: "Hep A",     key: "HepA" },
  { label: "HPV",       key: "HPV" },
  { label: "dTpa",      key: "dTpa" },
];

// Which antigens are in each scheduled vaccine, keyed by shortName
const COMBO_MAP = {
  "HepB":     ["HepB"],
  "6-in-1":   ["HepB", "DTPa", "IPV", "Hib"],   // DTPa-HepB-IPV-Hib (Infanrix hexa)
  "PCV20":    ["PCV"],
  "Rota":     ["Rota"],
  "MenB":     ["MenB"],
  "Flu":      ["Flu"],
  "MenACWY":  ["MenACWY"],
  "MMR":      ["MMR"],
  "Hib":      ["Hib"],
  "DTPa":     ["DTPa"],
  "MMRV":     ["MMR", "VZV"],                     // MMR + Varicella
  "HepA":     ["HepA"],
  "DTPa-IPV": ["DTPa", "IPV"],                    // DTPa + Polio booster
  "HPV":      ["HPV"],
  "dTpa":     ["dTpa"],
  "PCV13":    ["PCV"],
  "PCV":      ["PCV"],
  "VZV2":     ["VZV"],                                 // 2nd varicella dose
  "RSV":      ["RSV"],                                 // Abrysvo maternal
  "Nirsev":   ["RSV"],                                 // Nirsevimab infant mAb
  "Zoster":   [],                                      // not shown on childhood timeline
};

// Multivalent vaccine display names for legend
const MULTIVALENT_LEGEND = [
  { combo: "Infanrix hexa / Vaxelis", contains: "DTPa + Hep B + IPV + Hib", ages: "6w, 4m, 6m" },
  { combo: "MMRV (Priorix-Tetra)", contains: "MMR + Varicella", ages: "18m" },
  { combo: "DTPa-IPV (Infanrix IPV)", contains: "DTPa + IPV", ages: "4y" },
];

// For expanding combo vaccines into individual component cards
const COMPONENT_EXPAND = {
  "DTPa-HepB-IPV-Hib": [
    { vaccine: "Diphtheria, Tetanus, Pertussis", shortName: "DTPa", notes: "Contained in hexavalent vaccine (Infanrix hexa / Vaxelis)" },
    { vaccine: "Hepatitis B", shortName: "HepB", notes: "Contained in hexavalent vaccine (Infanrix hexa / Vaxelis)" },
    { vaccine: "Polio (IPV)", shortName: "IPV", notes: "Inactivated polio. Contained in hexavalent vaccine (Infanrix hexa / Vaxelis)" },
    { vaccine: "Haemophilus influenzae type b", shortName: "Hib", notes: "Contained in hexavalent vaccine (Infanrix hexa / Vaxelis)" },
  ],
  "MMRV": [
    { vaccine: "Measles, Mumps, Rubella", shortName: "MMR", notes: "Contained in MMRV (Priorix-Tetra). Second MMR dose." },
    { vaccine: "Varicella (Chickenpox)", shortName: "VZV", notes: "Contained in MMRV (Priorix-Tetra). First varicella dose." },
  ],
  "DTPa-IPV": [
    { vaccine: "Diphtheria, Tetanus, Pertussis", shortName: "DTPa", notes: "Pre-school booster. Contained in DTPa-IPV (Infanrix IPV / Quadracel)" },
    { vaccine: "Polio (IPV)", shortName: "IPV", notes: "Pre-school booster. Contained in DTPa-IPV (Infanrix IPV / Quadracel)" },
  ],
};

function expandScheduleData(data) {
  const expanded = [];
  data.forEach(item => {
    const components = COMPONENT_EXPAND[item.vaccine];
    if (components) {
      components.forEach(comp => {
        expanded.push({
          ...item,
          vaccine: comp.vaccine,
          shortName: comp.shortName,
          notes: comp.notes,
          _comboSource: item.vaccine,
          _comboBrand: item.brand,
        });
      });
    } else {
      expanded.push(item);
    }
  });
  return expanded;
}

// Non-linear axis: birthâ€“18m gets ~60% of the visual width
const TIMELINE_AGES = [
  { label: "Birth", x: 0, pct: 0 },
  { label: "6w",    x: 6, pct: 9 },
  { label: "4m",    x: 16, pct: 22 },
  { label: "6m",    x: 24, pct: 35 },
  { label: "12m",   x: 48, pct: 48 },
  { label: "18m",   x: 72, pct: 60 },
  { label: "4y",    x: 192, pct: 73 },
  { label: "Yr7",   x: 576, pct: 83 },
  { label: "Yr10",  x: 720, pct: 92 },
  { label: "15â€“19y", x: 750, pct: 100 },
];

const VACCINE_DETAILS = {
  "Hepatitis B": {
    diseases: "Hepatitis B virus infection â€” can cause chronic liver disease, cirrhosis and liver cancer",
    contraindications: "Anaphylaxis to previous dose or any vaccine component (yeast)",
    schedule: "Birth dose + 3 further doses at 6w, 4m, 6m (as part of hexavalent)"
  },
  "DTPa-HepB-IPV-Hib": {
    diseases: "Diphtheria, tetanus, pertussis, hepatitis B, polio, Hib meningitis/epiglottitis",
    contraindications: "Anaphylaxis to previous dose or component. Encephalopathy within 7 days of pertussis vaccine.",
    schedule: "3 primary doses at 6 weeks, 4 months, 6 months"
  },
  "Pneumococcal (20vPCV)": {
    diseases: "Invasive pneumococcal disease â€” meningitis, bacteraemia, pneumonia, otitis media",
    contraindications: "Anaphylaxis to previous PCV dose or component including diphtheria toxoid (CRM197)",
    schedule: "Routine: 6w, 4m, 12m. ATSI/at-risk: additional dose at 6m (3+1 schedule)"
  },
  Rotavirus: {
    diseases: "Severe gastroenteritis in infants and young children",
    contraindications: "History of intussusception. SCID. Anaphylaxis to previous dose.",
    schedule: "2 doses: 6w and 4m. Strict age limits â€“ dose 1 by 14 weeks + 6 days, dose 2 by 24 weeks + 6 days"
  },
  "Meningococcal B": {
    diseases: "Invasive meningococcal disease (serogroup B) â€” meningitis, septicaemia",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "Recommended for ALL infants <2 years: 6w, 4m, 12m. Also recommended for adolescents 15â€“19y (2 doses, 8w apart). NIP-funded for ATSI infants and medical at-risk. State-funded in SA, QLD, NT. Prophylactic paracetamol recommended in children <2 years."
  },
  "Meningococcal ACWY": {
    diseases: "Invasive meningococcal disease (serogroups A, C, W, Y)",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "12 months (routine) + Year 10 school program. Additional doses for at-risk groups."
  },
  "Varicella (2nd dose)": {
    diseases: "Varicella (chickenpox) â€” prevents breakthrough varicella infection after single-dose vaccination",
    contraindications: "Pregnancy. Severe immunocompromise. Anaphylaxis to neomycin or gelatin.",
    schedule: "Recommended for all children 12m to <14y, â‰¥4 weeks after first varicella dose (MMRV at 18m). Not NIP-funded. Monovalent varicella vaccine (Varilrix) used. 2 doses give >90% protection vs ~70% with single dose."
  },
  "RSV (Abrysvo)": {
    diseases: "Respiratory syncytial virus (RSV) â€” bronchiolitis, pneumonia in infants. Leading cause of hospitalisation in infants <6 months.",
    contraindications: "Anaphylaxis to previous dose or component. Do NOT use Arexvy (only approved for â‰¥50 years, contraindicated in pregnancy).",
    schedule: "NIP-funded from Feb 2025. Single dose from 28 weeks gestation (ideally by 36w). Infant protection via transplacental antibodies. ~57% reduction in hospitalisation for severe RSV in infants <6 months. Recommended in each pregnancy."
  },
  "Nirsevimab (RSV mAb)": {
    diseases: "RSV prevention in infants â€” long-acting monoclonal antibody (not a vaccine)",
    contraindications: "Hypersensitivity to nirsevimab or excipients. Not a vaccine â€” provides passive immunity only.",
    schedule: "State/territory-funded (not NIP). Single IM dose. For infants whose mothers did not receive Abrysvo, or vaccinated <2w before birth, or with medical risk factors. Seasonal programs vary by jurisdiction (typically Aprâ€“Sep). Also for high-risk children <24m entering 2nd RSV season."
  },
  MMR: {
    diseases: "Measles, mumps, rubella",
    contraindications: "Pregnancy. Severe immunocompromise. Anaphylaxis to neomycin or gelatin.",
    schedule: "Dose 1 at 12 months, Dose 2 at 18 months (as MMRV)"
  },
  MMRV: {
    diseases: "Measles, mumps, rubella, varicella (chickenpox)",
    contraindications: "Pregnancy. Severe immunocompromise. Anaphylaxis to neomycin or gelatin.",
    schedule: "Single dose at 18 months. Should not be used as dose 1 due to higher febrile seizure risk."
  },
  Hib: {
    diseases: "Haemophilus influenzae type b â€” meningitis, epiglottitis, septicaemia",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "Primary series in hexavalent (6w, 4m, 6m) + standalone booster at 18 months"
  },
  DTPa: {
    diseases: "Diphtheria, tetanus, pertussis",
    contraindications: "Anaphylaxis to previous dose. Encephalopathy within 7 days of pertussis vaccine.",
    schedule: "Booster at 18 months, then DTPa-IPV at 4 years, dTpa at Year 7 and in pregnancy"
  },
  HPV: {
    diseases: "HPV-related cancers â€” cervical, oropharyngeal, anal, penile, vaginal, vulvar. Genital warts.",
    contraindications: "Anaphylaxis to previous dose or yeast. Not recommended in pregnancy (defer).",
    schedule: "Year 7: 2 doses 6â€“12 months apart. If â‰¥15 years at first dose or immunocompromised: 3 doses."
  },
  "Hepatitis A": {
    diseases: "Hepatitis A virus infection",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "ATSI children in QLD, NT, SA, WA: dose 1 at 18 months, dose 2 at 4 years"
  },
  Influenza: {
    diseases: "Influenza (seasonal flu) â€” can cause severe respiratory illness, hospitalisation",
    contraindications: "Anaphylaxis to previous influenza vaccine. Age <6 months.",
    schedule: "Annual. NIP-funded: 6mâ€“<5y, â‰¥65y, pregnancy, ATSI â‰¥6m, medical at-risk"
  },
  "Pertussis (dTpa)": {
    diseases: "Pertussis (whooping cough) â€” passive antibody transfer to protect newborns",
    contraindications: "Anaphylaxis to previous dose. Encephalopathy within 7 days of pertussis vaccine.",
    schedule: "Each pregnancy, ideally 20â€“32 weeks gestation. Can be given up to delivery."
  },
};

function TypeBadge({ type }) {
  const t = TYPES[type];
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      color: t.color,
      background: t.bg,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap"
    }}>{t.label}</span>
  );
}

function VaccineCard({ item, onClick, selectedState }) {
  const t = TYPES[item.type];
  const isFunded = isFundedInState(item, selectedState);
  
  return (
    <button
      onClick={() => onClick(item)}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        background: "#fff",
        border: `1.5px solid ${t.color}22`,
        borderLeft: `4px solid ${t.color}`,
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontFamily: "inherit",
        marginBottom: "8px",
        opacity: isFunded ? 1 : 0.5,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 2px 12px ${t.color}18`; e.currentTarget.style.borderColor = `${t.color}44`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${t.color}22`; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a2e" }}>{item.vaccine}</span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <TypeBadge type={item.type} />
          {selectedState !== "ALL" && !isFunded && (
            <span style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "3px",
              background: "#fee",
              color: "#c33",
              fontWeight: 600,
            }}>
              Not funded in {STATES[selectedState].split(' ')[0]}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
        {item.brand} Â· {item.route}
      </div>
      {item._comboSource && (
        <div style={{
          fontSize: "11px", color: "#8B6914", marginTop: "6px",
          background: "#FFF8E7", padding: "3px 8px", borderRadius: "4px",
          display: "inline-block"
        }}>
          ðŸ§¬ Given as <strong>{item._comboSource}</strong> ({item._comboBrand})
        </div>
      )}
    </button>
  );
}

function Modal({ item, onClose }) {
  if (!item) return null;
  const t = TYPES[item.type];
  const details = VACCINE_DETAILS[item.vaccine] || {};
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      backdropFilter: "blur(4px)"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "16px", maxWidth: "520px", width: "100%",
        maxHeight: "85vh", overflow: "auto", padding: "28px", position: "relative",
        boxShadow: "0 24px 48px rgba(0,0,0,0.2)"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "12px", right: "16px", background: "none",
          border: "none", fontSize: "22px", cursor: "pointer", color: "#999", fontFamily: "inherit"
        }}>âœ•</button>
        <div style={{ borderLeft: `4px solid ${t.color}`, paddingLeft: "14px", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", color: "#1a1a2e", fontFamily: "'DM Serif Display', Georgia, serif" }}>{item.vaccine}</h3>
          <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
            {item.age} Â· {item.brand} Â· {item.route}
          </div>
          <div style={{ marginTop: "8px" }}><TypeBadge type={item.type} /></div>
        </div>
        <div style={{ fontSize: "14px", lineHeight: 1.65, color: "#333" }}>
          <p style={{ margin: "0 0 14px" }}>{item.notes}</p>
          {details.diseases && (
            <div style={{ marginBottom: "14px" }}>
              <strong style={{ color: "#1a1a2e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Diseases prevented</strong>
              <p style={{ margin: "4px 0 0", color: "#555" }}>{details.diseases}</p>
            </div>
          )}
          {details.schedule && (
            <div style={{ marginBottom: "14px" }}>
              <strong style={{ color: "#1a1a2e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Schedule</strong>
              <p style={{ margin: "4px 0 0", color: "#555" }}>{details.schedule}</p>
            </div>
          )}
          {details.contraindications && (
            <div style={{ marginBottom: "14px" }}>
              <strong style={{ color: "#1a1a2e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contraindications</strong>
              <p style={{ margin: "4px 0 0", color: "#555" }}>{details.contraindications}</p>
            </div>
          )}
          {(item.shortName === "MenB" && item.type === "recommended") && (
            <div style={{ marginBottom: "14px", background: "#FFF8E7", padding: "10px 12px", borderRadius: "6px" }}>
              <strong style={{ color: "#8B6914", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>State funding</strong>
              <p style={{ margin: "4px 0 0", color: "#555", fontSize: "13px" }}>
                State-funded for all infants in <strong>SA, QLD, NT</strong>. Not funded in NSW, VIC, WA, TAS, ACT (private prescription required).
              </p>
            </div>
          )}
          {item.shortName === "HepA" && item.type === "indigenous" && (
            <div style={{ marginBottom: "14px", background: "#FFF8E7", padding: "10px 12px", borderRadius: "6px" }}>
              <strong style={{ color: "#8B6914", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>State funding</strong>
              <p style={{ margin: "4px 0 0", color: "#555", fontSize: "13px" }}>
                NIP-funded for Aboriginal & Torres Strait Islander children in <strong>QLD, NT, SA, WA</strong> only. Not funded in NSW, VIC, TAS, ACT.
              </p>
            </div>
          )}
          {item.shortName === "Nirsev" && (
            <div style={{ marginBottom: "14px", background: "#FFF8E7", padding: "10px 12px", borderRadius: "6px" }}>
              <strong style={{ color: "#8B6914", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>State funding</strong>
              <p style={{ margin: "4px 0 0", color: "#555", fontSize: "13px" }}>
                All states/territories have RSV programs, but eligibility criteria, seasonal timing, and age limits vary by jurisdiction. Check your local program.
              </p>
            </div>
          )}
        </div>
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #eee", fontSize: "11px", color: "#999" }}>
          Source: Australian Immunisation Handbook Â· NIP Schedule Jan 2026
        </div>
      </div>
    </div>
  );
}

function Timeline({ viewMode = "combo", onSelect, stateFilter = "ALL", ageFilter = "All ages", typeFilter = "all" }) {
  const scrollRef = useRef(null);
  
  // In combo mode: show vaccine products as administered
  // In components mode: show individual antigens
  const COMBO_VACCINES = [
    { label: "Hep B",     key: "HepB" },
    { label: "Nirsevimab", key: "Nirsev" },
    { label: ["DTPa-HepB-", "IPV-Hib"],    key: "6-in-1" },
    { label: "PCV",       key: "PCV20" },
    { label: "Rotavirus", key: "Rota" },
    { label: "MenB",      key: "MenB" },
    { label: "Influenza", key: "Flu" },
    { label: "MenACWY",   key: "MenACWY" },
    { label: "MMR",       key: "MMR" },
    { label: "Hib",       key: "Hib" },
    { label: "DTPa",      key: "DTPa" },
    { label: "MMRV",      key: "MMRV" },
    { label: ["Varicella", "(2nd dose)"], key: "VZV2" },
    { label: "Hep A",     key: "HepA" },
    { label: "DTPa-IPV",  key: "DTPa-IPV" },
    { label: "HPV",       key: "HPV" },
    { label: "dTpa",      key: "dTpa" },
  ];

  const rows = viewMode === "components" ? TIMELINE_ANTIGENS : COMBO_VACCINES;
  const W = 920;
  const H = rows.length * 38 + 66;
  const left = 115;
  const right = W - 30;

  const xScale = (weeks) => {
    const ages = TIMELINE_AGES;
    if (weeks <= ages[0].x) return left + (ages[0].pct / 100) * (right - left);
    if (weeks >= ages[ages.length - 1].x) return left + (ages[ages.length - 1].pct / 100) * (right - left);
    for (let i = 0; i < ages.length - 1; i++) {
      if (weeks >= ages[i].x && weeks <= ages[i + 1].x) {
        const t = (weeks - ages[i].x) / (ages[i + 1].x - ages[i].x);
        const pct = ages[i].pct + t * (ages[i + 1].pct - ages[i].pct);
        return left + (pct / 100) * (right - left);
      }
    }
    return left;
  };

  const weekMap = { 0: 0, 0.5: 3, 1: 6, 2: 16, 3: 24, 3.5: 26, 4: 48, 5: 72, 5.5: 76, 6: 192, 7: 576, 8: 720, 8.5: 750 };

  // Components mode: map through COMBO_MAP to find all doses containing this antigen
  const getDotsForAntigen = (antigenKey) => {
    const dots = [];
    const seen = new Set();
    SCHEDULE_DATA.forEach(d => {
      if (d.ageSort > 8.5) return;
      const antigens = COMBO_MAP[d.shortName] || [];
      if (antigens.includes(antigenKey)) {
        const x = weekMap[d.ageSort] || 0;
        const dedupKey = `${x}-${d.type}`;
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          const isCombo = antigens.length > 1;
          // Check if this vaccine matches filters
          const matchesAge = ageFilter === "All ages" || d.age === ageFilter;
          const matchesType = typeFilter === "all" || d.type === typeFilter;
          const isFunded = isFundedInState(d, stateFilter);
          const visible = matchesAge && matchesType;
          dots.push({ x, type: d.type, isCombo, vaccine: d, visible, isFunded });
        }
      }
    });
    return dots;
  };

  // Combo mode: direct shortName match
  const getDotsForCombo = (shortName) => {
    const dots = [];
    const seen = new Set();
    SCHEDULE_DATA.forEach(d => {
      if (d.ageSort > 8.5) return;
      if (d.shortName === shortName) {
        const x = weekMap[d.ageSort] || 0;
        const dedupKey = `${x}-${d.type}`;
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          // Check if this vaccine matches filters
          const matchesAge = ageFilter === "All ages" || d.age === ageFilter;
          const matchesType = typeFilter === "all" || d.type === typeFilter;
          const isFunded = isFundedInState(d, stateFilter);
          const visible = matchesAge && matchesType;
          dots.push({ x, type: d.type, isCombo: false, vaccine: d, visible, isFunded });
        }
      }
    });
    return dots;
  };

  return (
    <div ref={scrollRef} style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: "820px", width: "100%", height: "auto" }}>
        {/* Age axis */}
        {TIMELINE_AGES.map((a, i) => (
          <g key={i}>
            <line x1={xScale(a.x)} y1={36} x2={xScale(a.x)} y2={H - 10} stroke="#e0e0e0" strokeWidth={1} />
            <text x={xScale(a.x)} y={22} textAnchor="middle" fontSize="14" fill="#555" fontFamily="system-ui" fontWeight="600">{a.label}</text>
          </g>
        ))}
        {/* Rows */}
        {rows.map((row, i) => {
          const y = 56 + i * 38;
          const dots = viewMode === "components" ? getDotsForAntigen(row.key) : getDotsForCombo(row.key);
          const handleLabelClick = onSelect ? () => {
            // In combo mode, match by shortName; in components mode, find any item containing this antigen
            let item;
            if (viewMode === "combo") {
              item = SCHEDULE_DATA.find(d => d.shortName === row.key);
            } else {
              item = SCHEDULE_DATA.find(d => {
                const antigens = COMBO_MAP[d.shortName] || [];
                return antigens.includes(row.key) && antigens.length === 1;
              }) || SCHEDULE_DATA.find(d => {
                const antigens = COMBO_MAP[d.shortName] || [];
                return antigens.includes(row.key);
              });
            }
            if (item) onSelect(item);
          } : undefined;
          return (
            <g key={row.key}>
              <g onClick={handleLabelClick} style={{ cursor: onSelect ? "pointer" : "default" }}>
                {Array.isArray(row.label) ? (
                  <text x={left - 10} y={y - 3} textAnchor="end" fontSize="12" fill={onSelect ? "#2d2b55" : "#333"} fontFamily="system-ui" fontWeight="600" textDecoration="underline" style={{ textDecorationColor: "#ccc" }}>
                    {row.label.map((line, li) => (
                      <tspan key={li} x={left - 10} dy={li === 0 ? 0 : 14}>{line}</tspan>
                    ))}
                  </text>
                ) : (
                  <text x={left - 10} y={y + 5} textAnchor="end" fontSize="14" fill={onSelect ? "#2d2b55" : "#333"} fontFamily="system-ui" fontWeight="600" textDecoration="underline" style={{ textDecorationColor: "#ccc" }}>
                    {row.label}
                  </text>
                )}
              </g>
              <line x1={left} y1={y} x2={right} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              {(() => {
                // Group dots by x position for offset when stacked
                const grouped = {};
                dots.forEach((d, j) => {
                  const key = d.x;
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push({ ...d, j });
                });
                return dots.map((d, j) => {
                  const siblings = grouped[d.x];
                  const idx = siblings.findIndex(s => s.j === j);
                  const offset = siblings.length > 1 ? (idx - (siblings.length - 1) / 2) * 9 : 0;
                  
                  // Calculate opacity based on filters
                  let dotOpacity = 0.9;
                  if (!d.visible) {
                    dotOpacity = 0.15; // Very faded if age/type don't match
                  } else if (stateFilter !== "ALL" && !d.isFunded) {
                    dotOpacity = 0.35; // Moderately faded if not funded in selected state
                  }
                  
                  return (
                    <g key={j}>
                      <circle cx={xScale(d.x) + offset} cy={y} r={6.5}
                        fill={TYPES[d.type].color} opacity={dotOpacity} />
                      {d.isCombo && (
                        <circle cx={xScale(d.x) + offset} cy={y} r={6.5}
                          fill="none" stroke="#fff" strokeWidth={2} opacity={dotOpacity * 0.9} />
                      )}
                    </g>
                  );
                });
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PregnancyTimeline({ onSelect }) {
  const W = 700;
  const H = 200;
  const left = 115;
  const right = W - 30;
  const span = right - left;

  // Gestational weeks 0â€“40
  const wkToX = (wk) => left + (wk / 40) * span;
  const ticks = [0, 8, 16, 20, 24, 28, 32, 36, 40];

  const vaccines = [
    { label: "Influenza", color: TYPES.routine.color, startWk: 0, endWk: 40, noteY: 60, note: "Any trimester", shortName: "Flu" },
    { label: "Pertussis (dTpa)", color: TYPES.routine.color, startWk: 20, endWk: 32, noteY: 100, note: "Ideally 20â€“32 wks", shortName: "dTpa", idealStart: 20, idealEnd: 32, extendEnd: 40 },
    { label: "RSV (Abrysvo)", color: TYPES.routine.color, startWk: 28, endWk: 36, noteY: 140, note: "28â€“36 wks (NIP-funded)", shortName: "RSV", idealStart: 28, idealEnd: 36, extendEnd: 40 },
  ];

  const handleClick = (shortName) => {
    if (!onSelect) return;
    const item = SCHEDULE_DATA.find(d => d.shortName === shortName && d.age === "Pregnancy");
    if (item) onSelect(item);
  };

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: "600px", width: "100%", height: "auto" }}>
        {/* Gestational age axis */}
        {ticks.map(wk => (
          <g key={wk}>
            <line x1={wkToX(wk)} y1={38} x2={wkToX(wk)} y2={H - 10} stroke="#e8e8e8" strokeWidth={1} />
            <text x={wkToX(wk)} y={24} textAnchor="middle" fontSize="12" fill="#888" fontFamily="system-ui" fontWeight="500">
              {wk === 0 ? "Conception" : wk === 40 ? "Birth" : `${wk}w`}
            </text>
          </g>
        ))}

        {/* Vaccine bars */}
        {vaccines.map((v, i) => {
          const y = v.noteY;
          const barH = 22;
          return (
            <g key={i} onClick={() => handleClick(v.shortName)} style={{ cursor: onSelect ? "pointer" : "default" }}>
              {/* Extended range (lighter) if applicable */}
              {v.extendEnd && (
                <rect x={wkToX(v.endWk)} y={y - barH / 2} width={wkToX(v.extendEnd) - wkToX(v.endWk)} height={barH}
                  rx={4} fill={v.color} opacity={0.15} />
              )}
              {/* Primary recommended window */}
              <rect x={wkToX(v.startWk)} y={y - barH / 2} width={wkToX(v.endWk) - wkToX(v.startWk)} height={barH}
                rx={4} fill={v.color} opacity={0.25} />
              {/* Label */}
              <text x={left - 10} y={y + 5} textAnchor="end" fontSize="13" fill={onSelect ? "#2d2b55" : "#333"}
                fontFamily="system-ui" fontWeight="600" textDecoration="underline" style={{ textDecorationColor: "#ccc" }}>
                {v.label}
              </text>
              {/* Timing note */}
              <text x={(wkToX(v.startWk) + wkToX(v.endWk)) / 2} y={y + 4} textAnchor="middle"
                fontSize="11" fill={v.color} fontFamily="system-ui" fontWeight="600">
                {v.note}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ReferenceCards({ onSelect }) {
  const vaccines = [...new Set(SCHEDULE_DATA.map(d => d.vaccine))];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
      {vaccines.map(v => {
        const item = SCHEDULE_DATA.find(d => d.vaccine === v);
        const details = VACCINE_DETAILS[v];
        const t = TYPES[item.type];
        return (
          <button key={v} onClick={() => onSelect(item)} style={{
            textAlign: "left", padding: "16px", background: "#fff",
            border: `1px solid #e8e8e8`, borderRadius: "10px", cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s ease"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
              <strong style={{ fontSize: "14px", color: "#1a1a2e" }}>{v}</strong>
              <TypeBadge type={item.type} />
            </div>
            {details && (
              <p style={{ fontSize: "12px", color: "#777", margin: "8px 0 0", lineHeight: 1.5 }}>
                {details.diseases?.slice(0, 100)}{details.diseases?.length > 100 ? "â€¦" : ""}
              </p>
            )}
            <div style={{ fontSize: "11px", color: t.color, marginTop: "8px", fontWeight: 600 }}>
              View details â†’
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "What vaccines does my child need in Australia?",
      a: "The NIP provides free vaccines from birth through adolescence. Key vaccines include: Hepatitis B (birth), hexavalent DTPa-HepB-IPV-Hib (6w, 4m, 6m), Pneumococcal PCV20 (6w, 4m, 12m), Rotavirus (6w, 4m), MMR (12m), MMRV (18m), and boosters at 4 years. School programs provide HPV and dTpa in Year 7, and MenACWY in Year 10. Additionally, Meningococcal B and a second varicella dose are recommended for all children but not NIP-funded (purple badges on the schedule)."
    },
    {
      q: "What changed in the NIP from September 2025 / January 2026?",
      a: "Prevenar 20 (20vPCV) replaced Prevenar 13 for all children under 18, covering 7 additional pneumococcal serotypes. The 4-dose (3+1) PCV schedule was expanded to all Aboriginal and Torres Strait Islander children nationally (previously only QLD, NT, SA, WA). Pneumovax 23 (23vPPV) is no longer required for children receiving 20vPCV."
    },
    {
      q: "Are there extra vaccines for Aboriginal and Torres Strait Islander children?",
      a: "Yes. Meningococcal B (Bexsero) is NIP-funded at 6 weeks, 4 months and 12 months. Hepatitis A is funded in QLD, NT, SA, WA at 18 months and 4 years. Additional pneumococcal doses are funded. Prophylactic paracetamol is recommended with Bexsero in children under 2."
    },
    {
      q: "What vaccines are recommended in pregnancy?",
      a: "Three vaccines are recommended in every pregnancy: Pertussis (dTpa/Boostrix) at 20â€“32 weeks gestation to provide passive antibody protection to the newborn. Influenza vaccine at any trimester. RSV vaccine (Abrysvo) from 28 weeks gestation â€” NIP-funded from February 2025. Abrysvo provides passive RSV protection to the infant for approximately 6 months. Only Abrysvo is approved for pregnancy â€” Arexvy must NOT be used."
    },
    {
      q: "What about nirsevimab (Beyfortus) for RSV?",
      a: "Nirsevimab is a long-acting monoclonal antibody (not a vaccine) that protects infants against RSV. It is state/territory-funded â€” not on the NIP. It is given to eligible infants whose mothers did not receive Abrysvo, who were vaccinated less than 2 weeks before delivery, or who have medical risk factors for severe RSV. Seasonal programs typically run Aprilâ€“September but eligibility and timing vary by jurisdiction."
    },
    {
      q: "What about Meningococcal B (Bexsero) for non-Indigenous children?",
      a: "Bexsero is recommended by ATAGI for ALL infants under 2 years and ALL adolescents 15â€“19 years â€” but is not NIP-funded for non-Indigenous children. It is state-funded in SA, QLD, and NT. In Victoria and other states, parents need a private prescription (~$110â€“135 per dose). MenB is the most common serogroup causing invasive meningococcal disease in Australia."
    },
    {
      q: "Should my child have a second varicella dose?",
      a: "Yes â€” ATAGI recommends a 2nd dose of varicella vaccine for all children aged 12 months to under 14 years. However, the 2nd dose is NOT NIP-funded. A single dose (given as MMRV at 18 months) provides ~70% protection, while 2 doses give >90% protection and significantly reduce breakthrough varicella. The 2nd dose can be given â‰¥4 weeks after the first, using monovalent varicella vaccine (Varilrix)."
    },
    {
      q: "What if my child missed a vaccine dose?",
      a: "Vaccine series never need to be restarted, regardless of how long ago the last dose was given. The National Immunisation Catch-up Calculator (NICC) at immunisationhandbook.health.gov.au can generate a personalised catch-up plan. Free NIP catch-up is available for people under 20, and HPV up to age 25."
    },
    {
      q: "Do vaccine schedules vary between states and territories?",
      a: "Yes, significantly for some vaccines. Meningococcal B is state-funded for all infants in SA, QLD, and NT but not in Victoria, NSW, WA, ACT, or Tasmania. Nirsevimab (RSV mAb) is state/territory-funded but eligibility criteria, seasonal timing, and catch-up age limits vary by jurisdiction. Hepatitis A is funded for Aboriginal & Torres Strait Islander children in QLD, NT, SA, and WA only. Always check your local state/territory schedule and the Australian Immunisation Handbook."
    },
    {
      q: "Is the Rotavirus vaccine time-critical?",
      a: "Yes â€” it has strict age limits. Dose 1 (Rotarix) must be given by 14 weeks of age, and dose 2 by 24 weeks of age. The series cannot be started or continued beyond these windows due to a small increased risk of intussusception with later doses."
    },
  ];

  return (
    <div>
      {faqs.map((f, i) => (
        <div key={i} style={{ borderBottom: "1px solid #eee" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", textAlign: "left", padding: "16px 0", background: "none",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px"
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a2e", lineHeight: 1.4 }}>{f.q}</span>
            <span style={{ fontSize: "20px", color: "#999", flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
          </button>
          {open === i && (
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#555", lineHeight: 1.65, paddingRight: "24px" }}>{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Patient Schedule Calculator
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// ageSort â†’ weeks since birth (childhood + adult)
const AGESORT_WEEKS = {
  0: 0,       // Birth
  0.5: 3,     // Nirsevimab seasonal
  1: 6,       // 6 weeks
  2: 16,      // 4 months
  3: 24,      // 6 months
  3.5: 26,    // Flu starts (6mâ€“5y)
  4: 48,      // 12 months
  5: 72,      // 18 months
  5.5: 76,    // 18m+ (VZV 2nd dose)
  6: 192,     // 4 years
  7: 576,     // Year 7 (~12y)
  8: 720,     // Year 10 (~15y)
  8.5: 750,   // 15â€“19y MenB
  // 9 = pregnancy â€” handled separately
  9.5: 2600,  // â‰¥50y ATSI
  10: 3380,   // â‰¥65y
  11: 3640,   // â‰¥70y
};

function formatRelativeWeeks(weeks) {
  const abs = Math.abs(weeks);
  if (abs < 1.5) return "this week";
  if (abs < 8) return `${Math.round(abs)} weeks`;
  if (abs < 30) return `${Math.round(abs / 4.33)} months`;
  return `${(abs / 52).toFixed(1)} years`;
}

function formatNextDueTiming(weeksFromNow) {
  if (weeksFromNow < 8) return `in ${Math.round(weeksFromNow)} weeks`;
  if (weeksFromNow < 52) return `in ${Math.round(weeksFromNow / 4.33)} months`;
  const totalMonths = Math.round(weeksFromNow / 4.33);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (weeksFromNow < 104) {
    // under 2 years: show years + months
    if (months === 0) return `in ${years} year${years !== 1 ? "s" : ""}`;
    return `in ${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
  }
  // 2+ years: years only
  return `in ${years} year${years !== 1 ? "s" : ""}`;
}

function formatDate(date) {
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function formatAgeAtDate(dobDate, targetDate) {
  const weeks = (targetDate - dobDate) / (1000 * 60 * 60 * 24 * 7);
  if (weeks < 2) return `${Math.round(weeks * 7)}d`;
  if (weeks < 20) return `${Math.round(weeks)}w`;
  if (weeks < 100) return `${Math.round(weeks / 4.33)}m`;
  const years = weeks / 52;
  return years < 2 ? `${Math.round(years * 12)}m` : `${Math.floor(years)}y`;
}

function PatientSection({ stateFilter, setStateFilter, onSelectVaccine }) {
  const [dob, setDob] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dobDate = useMemo(() => {
    if (!dob) return null;
    const d = new Date(dob);
    return isNaN(d) ? null : d;
  }, [dob]);

  const ageWeeks = useMemo(() => {
    if (!dobDate) return null;
    return (today - dobDate) / (1000 * 60 * 60 * 24 * 7);
  }, [dobDate]);

  const schedule = useMemo(() => {
    if (!dobDate) return { overdue: [], upcoming: [], nextDue: null };
    const byKey = {};
    SCHEDULE_DATA.forEach(d => {
      if (d.ageSort === 9) return;
      const key = `${d.shortName}-${d.ageSort}`;
      if (!byKey[key]) byKey[key] = [];
      byKey[key].push(d);
    });
    const WINDOW_WEEKS = 8.7;
    const overdue = [], upcoming = [], future = [];
    Object.values(byKey).forEach(variants => {
      const chosen = variants.find(v => isFundedInState(v, stateFilter)) || variants[0];
      const isFunded = isFundedInState(chosen, stateFilter);
      const dueWeeks = AGESORT_WEEKS[chosen.ageSort];
      if (dueWeeks === undefined) return;
      const dueDate = new Date(dobDate.getTime() + dueWeeks * 7 * 24 * 60 * 60 * 1000);
      const weeksFromNow = (dueDate - today) / (1000 * 60 * 60 * 24 * 7);
      const entry = { ...chosen, dueDate, weeksFromNow, isFunded };
      if (weeksFromNow >= 0) future.push(entry); // all future vaccines
      if (weeksFromNow < -WINDOW_WEEKS || weeksFromNow > WINDOW_WEEKS) return;
      if (weeksFromNow < 0) overdue.push(entry);
      else upcoming.push(entry);
    });
    const byDate = (a, b) => a.dueDate - b.dueDate;
    overdue.sort(byDate);
    upcoming.sort(byDate);
    future.sort(byDate);
    // nextDue: earliest future vaccine not already in the upcoming window
    // If upcoming is non-empty, it's the first upcoming; else first beyond window
    const nextDue = future.length > 0 ? future[0] : null;
    return { overdue, upcoming, nextDue };
  }, [dobDate, stateFilter]);

  // â”€â”€ PDF generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadJsPDF = () => new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(window.jspdf); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf);
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });

  const generatePDF = async () => {
    if (!dobDate) return;
    setPdfLoading(true);
    try {
      const jspdfModule = await loadJsPDF();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210; const H = 297;
      const ML = 18; const MR = 18; const CW = W - ML - MR;

      // â”€â”€ helpers â”€â”€
      const hex2rgb = h => {
        const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
        return [r, g, b];
      };
      const setFill = hex => { const [r,g,b] = hex2rgb(hex); doc.setFillColor(r,g,b); };
      const setStroke = hex => { const [r,g,b] = hex2rgb(hex); doc.setDrawColor(r,g,b); };
      const setTextColor = hex => { const [r,g,b] = hex2rgb(hex); doc.setTextColor(r,g,b); };

      const ageDisplay = ageWeeks < 0 ? "Not yet born"
        : ageWeeks < 20 ? `${Math.round(ageWeeks)} weeks`
        : ageWeeks < 100 ? `${Math.round(ageWeeks / 4.33)} months`
        : `${Math.floor(ageWeeks / 52)}y ${Math.floor((ageWeeks % 52) / 4.33)}m`;

      const stateName = stateFilter === "ALL" ? "All states/territories" : STATES[stateFilter];
      const todayStr = formatDate(today);

      // â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setFill("#1a1a2e"); doc.rect(0, 0, W, 42, "F");
      // Subtle accent stripe
      setFill("#2d2b55"); doc.rect(0, 38, W, 4, "F");

      setTextColor("#FFFFFF");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Immunisation Schedule", ML, 16);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 210, 230);
      doc.text("National Immunisation Program \u00B7 Australia", ML, 23);

      // Generated date (right-aligned)
      doc.setFontSize(8);
      doc.setTextColor(150, 165, 190);
      doc.text(`Generated ${todayStr}`, W - MR, 16, { align: "right" });
      doc.text("nip.terrific.website", W - MR, 21, { align: "right" });

      // â”€â”€ PATIENT CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setFill("#F4F6FB"); doc.roundedRect(ML, 48, CW, 22, 3, 3, "F");
      setFill("#1a1a2e"); doc.rect(ML, 48, 4, 22, "F");

      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      setTextColor("#888888");
      doc.text("DATE OF BIRTH", ML + 10, 55);
      doc.text("CURRENT AGE", ML + 65, 55);
      doc.text("STATE / TERRITORY", ML + 120, 55);

      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      setTextColor("#1a1a2e");
      doc.text(formatDate(dobDate), ML + 10, 64);
      doc.text(ageDisplay, ML + 65, 64);
      doc.setFontSize(11);
      doc.text(stateName, ML + 120, 64);

      // â”€â”€ SECTION RENDERER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      let y = 80;
      const PAGE_BOTTOM = 272;
      const ROW_H = 16;
      const SECTION_HEADER_H = 10;

      const checkPageBreak = (neededH) => {
        if (y + neededH > PAGE_BOTTOM) {
          doc.addPage();
          y = 20;
        }
      };

      const drawSectionHeader = (title, count, color) => {
        checkPageBreak(SECTION_HEADER_H + 4);
        const [r,g,b] = hex2rgb(color);
        doc.setFillColor(r, g, b, 0.12);
        setFill(color);
        doc.setFillColor(r, g, b);
        doc.rect(ML, y, CW, SECTION_HEADER_H, "F");

        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(title, ML + 5, y + 6.8);

        // Count: white text right-aligned on header bar
        const countStr = String(count);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(countStr, ML + CW - 4, y + 6.8, { align: "right" });
        y += SECTION_HEADER_H + 3;
      };

      const TYPE_LABELS = {
        routine: "NIP Routine",
        indigenous: "Aboriginal & TSI",
        "at-risk": "At-Risk",
        recommended: "Recommended",
        state: "State-funded",
      };

      const drawVaccineRow = (item, isLast) => {
        checkPageBreak(ROW_H + 2);
        const tc = TYPES[item.type].color;
        const [tr,tg,tb] = hex2rgb(tc);

        // Row background
        setFill(isLast ? "#FAFAFA" : "#FFFFFF");
        doc.rect(ML, y, CW, ROW_H, "F");
        // Left colour bar
        doc.setFillColor(tr, tg, tb);
        doc.rect(ML, y, 3, ROW_H, "F");

        // Vaccine name
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        setTextColor("#1a1a2e");
        doc.text(item.vaccine, ML + 7, y + 6.2);

        // Type badge
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const typeLabel = TYPE_LABELS[item.type] || item.type;
        const tlw = doc.getTextWidth(typeLabel);
        const bx2 = ML + 7;
        doc.setFillColor(tr, tg, tb, 0.12);
        doc.setFillColor(Math.min(255, tr + 180), Math.min(255, tg + 180), Math.min(255, tb + 180));
        doc.roundedRect(bx2, y + 7.5, tlw + 5, 5, 1.2, 1.2, "F");
        doc.setTextColor(tr, tg, tb);
        doc.text(typeLabel, bx2 + 2.5, y + 11.5);

        // Private script warning
        if (!item.isFunded && stateFilter !== "ALL") {
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          const px = bx2 + tlw + 9;
          doc.setFillColor(255, 235, 235);
          const pw = doc.getTextWidth("Private script") + 5;
          doc.roundedRect(px, y + 7.5, pw, 5, 1.2, 1.2, "F");
          doc.setTextColor(180, 30, 30);
          doc.text("Private script", px + 2.5, y + 11.5);
        }

        // Brand + route (grey, right side of name area)
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        setTextColor("#888888");
        doc.text(`${item.brand} \u00B7 ${item.route}`, ML + 7, y + 14);

        // Due date info (right-aligned)
        const isOverdue = item.weeksFromNow < 0;
        const dueColor = isOverdue ? "#c0392b" : "#1D4ED8";
        const [dr,dg,db] = hex2rgb(dueColor);
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.setTextColor(dr, dg, db);
        const timing = isOverdue
          ? `Due ${formatRelativeWeeks(item.weeksFromNow)} ago`
          : item.weeksFromNow < 1 ? "Due this week"
          : `Due in ${formatRelativeWeeks(item.weeksFromNow)}`;
        doc.text(timing, ML + CW - 1, y + 6.2, { align: "right" });

        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        setTextColor("#999999");
        const dateDetail = isOverdue
          ? `Was due ${formatDate(item.dueDate)} \u00B7 age ${formatAgeAtDate(dobDate, item.dueDate)}`
          : `${formatDate(item.dueDate)} \u00B7 age ${formatAgeAtDate(dobDate, item.dueDate)}`;
        doc.text(dateDetail, ML + CW - 1, y + 11.5, { align: "right" });

        // Bottom rule
        setStroke("#EEEEEE");
        doc.setLineWidth(0.2);
        doc.line(ML + 3, y + ROW_H, ML + CW, y + ROW_H);

        y += ROW_H;
      };

      // Draw overdue section
      if (schedule.overdue.length > 0) {
        drawSectionHeader("Recently due \u2014 confirm in AIR", schedule.overdue.length, "#c0392b");
        schedule.overdue.forEach((item, i) => drawVaccineRow(item, i === schedule.overdue.length - 1));
        y += 6;
      }

      // Draw upcoming section
      if (schedule.upcoming.length > 0) {
        drawSectionHeader("Due in next 2 months", schedule.upcoming.length, "#1D4ED8");
        schedule.upcoming.forEach((item, i) => drawVaccineRow(item, i === schedule.upcoming.length - 1));
        y += 6;
      }

      // â”€â”€ NEXT VACCINE DUE (beyond the 2-month window) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const nextBeyond = schedule.nextDue && schedule.nextDue.weeksFromNow > 8.7 ? schedule.nextDue : null;
      if (nextBeyond) {
        checkPageBreak(22);
        // Banner background
        setFill("#F4F6FB");
        doc.roundedRect(ML, y, CW, 18, 3, 3, "F");
        setFill("#2d2b55");
        doc.roundedRect(ML, y, 4, 18, 2, 2, "F");
        doc.rect(ML + 2, y, 2, 18, "F"); // square off left edge

        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        setTextColor("#888888");
        doc.text("NEXT VACCINE DUE", ML + 10, y + 5.5);

        doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        setTextColor("#1a1a2e");
        doc.text(nextBeyond.vaccine, ML + 10, y + 13);

        // Date + timing right-aligned
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        setTextColor("#2d2b55");
        doc.text(formatDate(nextBeyond.dueDate), ML + CW - 2, y + 9, { align: "right" });

        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        setTextColor("#888888");
        const wfn = nextBeyond.weeksFromNow;
        const timing = formatNextDueTiming(wfn);
        doc.text(timing, ML + CW - 2, y + 15, { align: "right" });

        y += 24;
      }

      // â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Footer on last page
      const footerY = H - 22;
      setStroke("#E0E0E0");
      doc.setLineWidth(0.3);
      doc.line(ML, footerY - 2, W - MR, footerY - 2);

      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
      setTextColor("#c0392b");
      doc.text("Always verify immunisation history in AIR before administering.", ML, footerY + 2);

      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      setTextColor("#AAAAAA");
      doc.text(`Data source: Australian Immunisation Handbook & NIP Schedule (Jan 2026)  \u00B7  nip.terrific.website`, ML, footerY + 7);

      doc.setFont("helvetica", "italic"); doc.setFontSize(7);
      setTextColor("#BBBBBB");
      doc.text("Dr Marc Theilhaber \u00B7 Dept of Respiratory Medicine \u00B7 Monash Children's Hospital", ML, footerY + 12);

      // Page numbers on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal"); doc.setFontSize(7);
        setTextColor("#BBBBBB");
        doc.text(`Page ${i} of ${pageCount}`, W - MR, footerY + 2, { align: "right" });
      }

      // Save
      const safeDob = dob.replace(/-/g, "");
      doc.save(`NIP-schedule-${safeDob}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate PDF. Please check your internet connection.");
    } finally {
      setPdfLoading(false);
    }
  };
  // â”€â”€ end PDF generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const stateName = stateFilter === "ALL" ? "all states" : STATES[stateFilter];

  const rowStyle = (color, bg) => ({
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "12px 16px", borderRadius: "8px", marginBottom: "6px",
    background: bg, border: `1px solid ${color}22`, gap: "12px",
    cursor: "pointer",
  });

  const VaccineRow = ({ item, showStatus }) => {
    const t = TYPES[item.type];
    return (
      <div onClick={() => onSelectVaccine(item)} style={rowStyle(t.color, "#fff")}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a2e" }}>{item.vaccine}</span>
            <TypeBadge type={item.type} />
            {!item.isFunded && stateFilter !== "ALL" && (
              <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "#fee", color: "#c33", fontWeight: 600 }}>
                Private script
              </span>
            )}
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>
            {item.brand} Â· {item.route}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: showStatus === "overdue" ? "#c0392b" : "#1D4ED8" }}>
            {showStatus === "overdue"
              ? `Due ${formatRelativeWeeks(item.weeksFromNow)} ago`
              : item.weeksFromNow < 1
              ? "Due this week"
              : `Due in ${formatRelativeWeeks(item.weeksFromNow)}`}
          </div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
            {showStatus === "overdue"
              ? `Was due ${formatDate(item.dueDate)} \u00B7 age ${formatAgeAtDate(dobDate, item.dueDate)}`
              : `${formatDate(item.dueDate)} \u00B7 age ${formatAgeAtDate(dobDate, item.dueDate)}`}
          </div>
        </div>
      </div>
    );
  };

  const SectionBlock = ({ title, items, status, color, bg, icon }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: "28px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px",
          paddingBottom: "8px", borderBottom: `2px solid ${color}`
        }}>
          <span style={{ fontSize: "18px" }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color }}>{title}</h3>
          <span style={{
            marginLeft: "auto", fontSize: "12px", fontWeight: 700,
            background: bg, color, padding: "2px 8px", borderRadius: "12px"
          }}>{items.length}</span>
        </div>
        {items.map((item, i) => <VaccineRow key={i} item={item} showStatus={status} />)}
      </div>
    );
  };

  const totalCount = schedule.overdue.length + schedule.upcoming.length;

  return (
    <section>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>My Patient</h2>
      <p style={{ color: "#777", fontSize: "14px", margin: "0 0 24px" }}>
        Enter a date of birth to see vaccines recently due or coming up in the next 2 months.
      </p>

      {/* DOB Input */}
      <div style={{
        background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8",
        padding: "20px 24px", marginBottom: "28px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              style={{
                padding: "9px 12px", borderRadius: "8px", border: "1px solid #d0d0d0",
                fontSize: "14px", fontFamily: "inherit", color: "#1a1a2e",
                background: "#FAFAF8", cursor: "pointer"
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
              State / Territory
            </label>
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              style={{
                padding: "9px 12px", borderRadius: "8px", border: "1px solid #d0d0d0",
                fontSize: "13px", background: "#FAFAF8", color: "#333",
                fontFamily: "inherit", cursor: "pointer"
              }}
            >
              {Object.entries(STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {dobDate && ageWeeks !== null && (
            <div style={{ paddingTop: "4px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Current Age</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>
                {ageWeeks < 0 ? "Not yet born"
                  : ageWeeks < 20 ? `${Math.round(ageWeeks)} weeks`
                  : ageWeeks < 100 ? `${Math.round(ageWeeks / 4.33)} months`
                  : `${Math.floor(ageWeeks / 52)} years, ${Math.floor((ageWeeks % 52) / 4.33)} months`}
              </div>
            </div>
          )}
          {dobDate && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              {schedule.overdue.length > 0 && (
                <div style={{ textAlign: "center", background: "#fff0f0", borderRadius: "8px", padding: "8px 14px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#c0392b" }}>{schedule.overdue.length}</div>
                  <div style={{ fontSize: "11px", color: "#c0392b", fontWeight: 600 }}>Recently due</div>
                </div>
              )}
              {schedule.upcoming.length > 0 && (
                <div style={{ textAlign: "center", background: "#eff6ff", borderRadius: "8px", padding: "8px 14px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#1D4ED8" }}>{schedule.upcoming.length}</div>
                  <div style={{ fontSize: "11px", color: "#1D4ED8", fontWeight: 600 }}>Due soon</div>
                </div>
              )}
              {/* PDF Download Button */}
              <button
                onClick={generatePDF}
                disabled={pdfLoading}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 18px",
                  background: pdfLoading ? "#e8e8e8" : "linear-gradient(135deg, #1a1a2e 0%, #2d2b55 100%)",
                  color: pdfLoading ? "#999" : "#fff",
                  border: "none", borderRadius: "10px",
                  fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                  cursor: pdfLoading ? "not-allowed" : "pointer",
                  boxShadow: pdfLoading ? "none" : "0 4px 12px rgba(26,26,46,0.3)",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!pdfLoading) e.currentTarget.style.boxShadow = "0 6px 18px rgba(26,26,46,0.45)"; }}
                onMouseLeave={e => { if (!pdfLoading) e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,26,46,0.3)"; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {pdfLoading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          )}
        </div>
      </div>

      {!dobDate && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#bbb", fontSize: "15px" }}>
          Enter a date of birth above to see the patient's immunisation schedule
        </div>
      )}

      {dobDate && totalCount === 0 && (
        <p style={{ color: "#999", textAlign: "center", padding: "32px 0" }}>No vaccines due or recently due in this 2-month window.</p>
      )}

      {dobDate && totalCount > 0 && (
        <>
          <SectionBlock
            title="Recently due â€” confirm in AIR" items={schedule.overdue} status="overdue"
            color="#c0392b" bg="#fff0f0" icon={"âš ï¸"}
          />
          <SectionBlock
            title="Due in next 2 months" items={schedule.upcoming} status="upcoming"
            color="#1D4ED8" bg="#eff6ff" icon={"ðŸ“…"}
          />
        </>
      )}

      {dobDate && (() => {
        const nextBeyond = schedule.nextDue && schedule.nextDue.weeksFromNow > 8.7 ? schedule.nextDue : null;
        if (!nextBeyond) return null;
        const wfn = nextBeyond.weeksFromNow;
        const timing = formatNextDueTiming(wfn);
        return (
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            background: "#fff", borderRadius: "10px",
            border: "1px solid #e0e4f0",
            borderLeft: "4px solid #2d2b55",
            padding: "14px 18px", marginBottom: "20px",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>
                Next vaccine due
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>
                {nextBeyond.vaccine}
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                {nextBeyond.brand} Â· {nextBeyond.route}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#2d2b55" }}>
                {formatDate(nextBeyond.dueDate)}
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                {timing}
              </div>
            </div>
          </div>
        );
      })()}

      {dobDate && (
        <p style={{ fontSize: "11px", color: "#bbb", marginTop: "8px", lineHeight: 1.6 }}>
          This tool does not account for vaccines already given. Always verify the patient's immunisation history in AIR before administering. Tap any vaccine for full details.
        </p>
      )}
    </section>
  );
}

export default function AustralianNIPSchedule() {
  const [ageFilter, setAgeFilter] = useState("All ages");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [activeSection, setActiveSection] = useState("schedule");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("combo"); // "combo" or "components"

  const filtered = useMemo(() => {
    const source = viewMode === "components" ? expandScheduleData(SCHEDULE_DATA) : SCHEDULE_DATA;
    return source.filter(d => {
      if (ageFilter !== "All ages" && d.age !== ageFilter) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      return true;
    });
  }, [ageFilter, typeFilter, viewMode]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(d => {
      if (!groups[d.age]) groups[d.age] = [];
      groups[d.age].push(d);
    });
    return Object.entries(groups).sort((a, b) => {
      const aSort = SCHEDULE_DATA.find(d => d.age === a[0])?.ageSort ?? 99;
      const bSort = SCHEDULE_DATA.find(d => d.age === b[0])?.ageSort ?? 99;
      return aSort - bSort;
    });
  }, [filtered]);

  const selectedAgeGroup = useMemo(() => {
    if (ageFilter === "All ages") return null;
    return grouped.find(([age]) => age === ageFilter);
  }, [grouped, ageFilter]);

  const selectStyle = {
    padding: "8px 12px", borderRadius: "8px", border: "1px solid #d0d0d0",
    fontSize: "13px", background: "#fff", color: "#333", fontFamily: "inherit",
    cursor: "pointer", minWidth: "140px"
  };

  const navBtn = (id, label) => (
    <button
      onClick={() => setActiveSection(id)}
      style={{
        padding: "8px 16px", borderRadius: "20px", border: "none",
        background: activeSection === id ? "#1a1a2e" : "transparent",
        color: activeSection === id ? "#fff" : "#666",
        fontSize: "13px", fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s ease",
        whiteSpace: "nowrap"
      }}
    >{label}</button>
  );

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      background: "#FAFAF8",
      minHeight: "100vh",
      color: "#1a1a2e"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d2b55 50%, #1a1a2e 100%)",
        color: "#fff", padding: "48px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          pointerEvents: "none"
        }} />
        <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, marginBottom: "12px" }}>
            National Immunisation Program Â· January 2026
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 400,
            margin: "0 0 14px",
            lineHeight: 1.15
          }}>
            Australian Childhood<br />Immunisation Schedule
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.8, maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
            A clearer way to see NIP-funded vaccines from birth through adulthood, including Aboriginal and Torres Strait Islander programs, state-funded programs, and recommended but unfunded vaccines.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            {Object.entries(TYPES).map(([key, val]) => (
              <span key={key} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "12px", opacity: 0.9
              }}>
                <span style={{
                  width: "10px", height: "10px", borderRadius: "3px",
                  background: val.color, display: "inline-block"
                }} />
                {val.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e8e8e8", padding: "10px 24px",
        display: "flex", justifyContent: "center", gap: "4px",
        overflowX: "auto", WebkitOverflowScrolling: "touch"
      }}>
        {navBtn("schedule", "Schedule by Age")}
        {navBtn("patient", "My Patient")}
        {navBtn("reference", "Vaccine Reference")}
        {navBtn("faq", "FAQ")}
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Schedule by Age */}
        {activeSection === "schedule" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Schedule by Age</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Overview of all childhood vaccines. Tap any card below for full details.</p>

            {/* Filter controls - state and type only */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#888", fontWeight: 600, marginBottom: "8px" }}>
                Filter by:
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={selectStyle}>
                  {Object.entries(STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
                  <option value="all">All types</option>
                  {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            {/* Age group tabs */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", color: "#888", fontWeight: 600, marginBottom: "10px" }}>
                Select age group:
              </div>
              <div style={{
                display: "flex", gap: "6px", flexWrap: "wrap", padding: "4px",
                background: "#f8f8f6", borderRadius: "10px", border: "1px solid #e8e8e8"
              }}>
                <button
                  onClick={() => setAgeFilter("All ages")}
                  style={{
                    padding: "8px 14px", borderRadius: "6px", border: "none",
                    background: ageFilter === "All ages" ? "#1a1a2e" : "transparent",
                    color: ageFilter === "All ages" ? "#fff" : "#666",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                >All ages</button>
                {AGE_GROUPS.map(age => (
                  <button
                    key={age}
                    onClick={() => setAgeFilter(age)}
                    style={{
                      padding: "8px 14px", borderRadius: "6px", border: "none",
                      background: ageFilter === age ? "#1a1a2e" : "transparent",
                      color: ageFilter === age ? "#fff" : "#666",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", transition: "all 0.15s ease",
                      whiteSpace: "nowrap"
                    }}
                  >{age}</button>
                ))}
              </div>
            </div>

            {/* View mode toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "#888", fontWeight: 600 }}>View as:</span>
              <div style={{
                display: "inline-flex", borderRadius: "8px", border: "1px solid #d0d0d0",
                overflow: "hidden"
              }}>
                {[["combo", "Combination vaccines"], ["components", "Individual antigens"]].map(([val, label]) => (
                  <button key={val} onClick={() => setViewMode(val)} style={{
                    padding: "7px 14px", border: "none", fontSize: "13px", fontWeight: 600,
                    fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s ease",
                    background: viewMode === val ? "#1a1a2e" : "#fff",
                    color: viewMode === val ? "#fff" : "#555",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Timeline overview */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "16px", overflow: "hidden", marginBottom: "12px" }}>
              <Timeline 
                viewMode={viewMode} 
                onSelect={setSelectedItem}
                stateFilter={stateFilter}
                ageFilter={ageFilter}
                typeFilter={typeFilter}
              />
            </div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              {Object.entries(TYPES).map(([key, val]) => (
                <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#666" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: val.color, display: "inline-block" }} />
                  {val.label}
                </span>
              ))}
              {viewMode === "components" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#666" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#0D6E3F", display: "inline-block", border: "2px solid #fff", boxShadow: "0 0 0 1px #ccc" }} />
                  Given as combination vaccine
                </span>
              )}
            </div>
            
            {/* Filter status indicator */}
            {(stateFilter !== "ALL" || ageFilter !== "All ages" || typeFilter !== "all") && (
              <div style={{ 
                background: "#FFF8E7", 
                border: "1px solid #F4D89D",
                borderRadius: "8px", 
                padding: "8px 12px", 
                marginBottom: "16px",
                fontSize: "12px",
                color: "#8B6914",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span style={{ fontWeight: 600 }}>â„¹ï¸ Filters active:</span>
                <span>
                  {stateFilter !== "ALL" && `Showing funding for ${STATES[stateFilter]} â€¢ `}
                  {ageFilter !== "All ages" && `Age: ${ageFilter} â€¢ `}
                  {typeFilter !== "all" && `Type: ${TYPES[typeFilter].label} â€¢ `}
                  Faded dots = not funded or filtered out
                </span>
              </div>
            )}

            {/* Pregnancy timeline */}
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", margin: "24px 0 10px" }}>
              Vaccines in Pregnancy
            </h3>
            <p style={{ fontSize: "13px", color: "#777", margin: "0 0 12px", lineHeight: 1.5 }}>
              Timing windows by gestational age. Darker bars = recommended window. Lighter extensions = can still be given if missed.
            </p>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "16px", overflow: "hidden", marginBottom: "16px" }}>
              <PregnancyTimeline onSelect={setSelectedItem} />
            </div>

            {/* Multivalent vaccine legend â€” only in components view */}
            {viewMode === "components" && (
              <div style={{
                background: "#f8f8f6", borderRadius: "8px", padding: "12px 16px",
                marginBottom: "28px", fontSize: "13px", color: "#555", lineHeight: 1.7
              }}>
                <strong style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#888" }}>Combination vaccines</strong>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "6px" }}>
                  {MULTIVALENT_LEGEND.map((m, i) => (
                    <span key={i}>
                      <strong style={{ color: "#333" }}>{m.combo}</strong>{" "}
                      <span style={{ color: "#777" }}>({m.ages})</span>
                      <br />
                      <span style={{ fontSize: "12px" }}>Contains: {m.contains}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {viewMode === "combo" && <div style={{ marginBottom: "12px" }} />}

            {grouped.length === 0 && (
              <p style={{ color: "#999", fontSize: "14px", padding: "32px 0", textAlign: "center" }}>No vaccines match your current filters.</p>
            )}

            {/* Show vaccines for selected age group */}
            {selectedAgeGroup && (
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{
                  fontSize: "18px", fontWeight: 700, color: "#1a1a2e",
                  margin: "0 0 14px", padding: "0 0 10px",
                  borderBottom: "2px solid #2d2b55"
                }}>{selectedAgeGroup[0]}</h3>
                {selectedAgeGroup[1].map((item, i) => (
                  <VaccineCard key={i} item={item} onClick={setSelectedItem} selectedState={stateFilter} />
                ))}
              </div>
            )}

            {/* Show all ages when "All ages" is selected */}
            {ageFilter === "All ages" && grouped.map(([age, items]) => (
              <div key={age} style={{ marginBottom: "28px" }}>
                <h3 style={{
                  fontSize: "16px", fontWeight: 700, color: "#1a1a2e",
                  margin: "0 0 10px", padding: "0 0 8px",
                  borderBottom: "2px solid #2d2b55", display: "inline-block"
                }}>{age}</h3>
                {items.map((item, i) => (
                  <VaccineCard key={i} item={item} onClick={setSelectedItem} selectedState={stateFilter} />
                ))}
              </div>
            ))}
          </section>
        )}

        {/* Reference */}
        {activeSection === "reference" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Vaccine Reference Cards</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Everything about each vaccine in one place â€” schedule, notes and contraindications.</p>
            <ReferenceCards onSelect={setSelectedItem} />
          </section>
        )}

        {/* FAQ */}
        {activeSection === "faq" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Frequently Asked Questions</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Common questions about childhood immunisation in Australia.</p>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "4px 20px" }}>
              <FAQ />
            </div>
          </section>
        )}

        {/* My Patient */}
        {activeSection === "patient" && (
          <PatientSection stateFilter={stateFilter} setStateFilter={setStateFilter} onSelectVaccine={setSelectedItem} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "24px", fontSize: "12px", color: "#999",
        borderTop: "1px solid #e8e8e8", lineHeight: 1.6
      }}>
        <p style={{ margin: "0 0 4px" }}>
          Data sourced from the{" "}
          <a href="https://www.health.gov.au/topics/immunisation/when-to-get-vaccinated/national-immunisation-program-schedule" target="_blank" rel="noopener" style={{ color: "#0D6E3F" }}>
            NIP Schedule
          </a>{" "}and{" "}
          <a href="https://immunisationhandbook.health.gov.au" target="_blank" rel="noopener" style={{ color: "#0D6E3F" }}>
            Australian Immunisation Handbook
          </a>{" "}(Jan 2026).
        </p>
        <p style={{ margin: "0 0 8px" }}>Built to support, not replace, clinical judgment. For informational purposes only.</p>
        <p style={{ margin: 0, borderTop: "1px solid #eee", paddingTop: "10px", fontWeight: 600, color: "#777", lineHeight: 1.8 }}>
          Dr Marc Theilhaber<br />
          Dept of Respiratory Medicine Â· Monash Children's Hospital
        </p>
      </footer>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
