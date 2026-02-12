import { useState, useMemo, useEffect, useRef } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Version tracking
const SITE_VERSION = "Feb 2026";  // Last code update
const SCHEDULE_VERSION = "Jan 2026";  // Last NIP schedule data revision

const SCHEDULE_DATA = [
  // Birth
  { vaccine: "Hepatitis B", shortName: "HepB", age: "Birth", ageSort: 0, type: "routine", brand: "Engerix B / HB Vax II", route: "IM", notes: "Give within 24 hours of birth (must be within 7 days). No catch-up required if missed." },
  // 6 weeks
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "6 weeks", ageSort: 1, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Diphtheria, tetanus, pertussis, hepatitis B, polio, Haemophilus influenzae type b." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "6 weeks", ageSort: 1, type: "routine", brand: "Prevenar 20", route: "IM", notes: "From Sep 2025, Prevenar 20 replaces Prevenar 13 for all children <18 years." },
  { vaccine: "Rotavirus", shortName: "Rota", age: "6 weeks", ageSort: 1, type: "routine", brand: "Rotarix", route: "Oral", notes: "Dose 1 must be given by 14 weeks + 6 days of age. Cannot be given after this window." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "6 weeks", ageSort: 1, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander infants. Prophylactic paracetamol recommended." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "6 weeks", ageSort: 1, type: "recommended", brand: "Bexsero", route: "IM", notes: "Recommended for ALL infants <2 years. Not NIP-funded for non-Indigenous children — available via private prescription (~$110–135/dose). State-funded in SA, QLD, NT. Prophylactic paracetamol recommended." },
  // 4 months
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "4 months", ageSort: 2, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Second dose of the hexavalent combination vaccine." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "4 months", ageSort: 2, type: "routine", brand: "Prevenar 20", route: "IM", notes: "Second dose of pneumococcal conjugate vaccine." },
  { vaccine: "Rotavirus", shortName: "Rota", age: "4 months", ageSort: 2, type: "routine", brand: "Rotarix", route: "Oral", notes: "Dose 2 must be given by 24 weeks of age. Series cannot be started or continued after age limits." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "4 months", ageSort: 2, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander infants. Prophylactic paracetamol recommended." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "4 months", ageSort: 2, type: "recommended", brand: "Bexsero", route: "IM", notes: "Recommended for ALL infants <2 years. Not NIP-funded for non-Indigenous children. State-funded in SA, QLD, NT. Prophylactic paracetamol recommended." },
  // 6 months
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "6 months", ageSort: 3, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Third dose of the hexavalent combination vaccine." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "6 months", ageSort: 3, type: "at-risk", brand: "Prevenar 20", route: "IM", notes: "Additional dose for Aboriginal & Torres Strait Islander children and children with specified medical risk conditions." },
  { vaccine: "Influenza", shortName: "Flu", age: "6 months–5 years", ageSort: 3.5, type: "routine", brand: "Various", route: "IM", notes: "Annual vaccination. First year: 2 doses ≥4 weeks apart for children <9 years. One dose annually thereafter." },
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
  { vaccine: "Varicella (2nd dose)", shortName: "VZV2", age: "18 months+", ageSort: 5.5, type: "recommended", brand: "Varilrix", route: "SC", notes: "A 2nd dose of varicella vaccine is recommended for all children 12m to <14y, ≥4 weeks after first dose (MMRV at 18m). Not NIP-funded. Reduces risk of breakthrough varicella. Can be given at any age from 19 months to 13 years." },
  { vaccine: "Hepatitis A", shortName: "HepA", age: "18 months", ageSort: 5, type: "indigenous", brand: "Vaqta Paed / Havrix Junior", route: "IM", notes: "Aboriginal and Torres Strait Islander children in QLD, NT, SA, WA. First dose of 2-dose schedule." },
  // 4 years
  { vaccine: "DTPa-IPV", shortName: "DTPa-IPV", age: "4 years", ageSort: 6, type: "routine", brand: "Infanrix IPV / Quadracel", route: "IM", notes: "Diphtheria, tetanus, pertussis and polio booster before starting school." },
  { vaccine: "Hepatitis A", shortName: "HepA", age: "4 years", ageSort: 6, type: "indigenous", brand: "Vaqta Paed / Havrix Junior", route: "IM", notes: "Aboriginal and Torres Strait Islander children in QLD, NT, SA, WA. Second dose." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "4 years", ageSort: 6, type: "at-risk", brand: "Prevenar 20", route: "IM", notes: "Catch-up doses available for some children. Refer to Immunisation Handbook." },
  // School - Year 7
  { vaccine: "HPV", shortName: "HPV", age: "Year 7 (12–13 yrs)", ageSort: 7, type: "routine", brand: "Gardasil 9", route: "IM", notes: "2 doses, 6–12 months apart. 3 doses required if starting ≥15 years or certain medical conditions." },
  { vaccine: "dTpa", shortName: "dTpa", age: "Year 7 (12–13 yrs)", ageSort: 7, type: "routine", brand: "Boostrix", route: "IM", notes: "Reduced antigen diphtheria, tetanus and pertussis booster for adolescents." },
  // School - Year 10
  { vaccine: "Meningococcal ACWY", shortName: "MenACWY", age: "Year 10 (15–16 yrs)", ageSort: 8, type: "routine", brand: "Nimenrix / MenQuadfi", route: "IM", notes: "Adolescent dose. School-based program." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "15–19 years", ageSort: 8.5, type: "recommended", brand: "Bexsero", route: "IM", notes: "2 doses (8 weeks apart) recommended for all healthy adolescents 15–19 years. Not NIP-funded. Available via private prescription (~$110–135/dose). Also recommended for 15–24y in close quarters, smokers, military recruits." },
  // Pregnancy
  { vaccine: "Influenza", shortName: "Flu", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Various", route: "IM", notes: "Recommended during each pregnancy, any trimester." },
  { vaccine: "Pertussis (dTpa)", shortName: "dTpa", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Boostrix", route: "IM", notes: "Recommended each pregnancy, ideally 20–32 weeks. Provides passive antibody protection to newborn." },
  { vaccine: "RSV (Abrysvo)", shortName: "RSV", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Abrysvo", route: "IM", notes: "NIP-funded from Feb 2025. Single dose recommended from 28 weeks gestation (up to 36w, or later if missed). Provides passive RSV protection to infant for ~6 months via transplacental antibodies. Only Abrysvo is approved for pregnancy — do NOT use Arexvy." },
  // Infant RSV — state-funded
  { vaccine: "Nirsevimab (RSV mAb)", shortName: "Nirsev", age: "Infants (seasonal)", ageSort: 0.5, type: "state", brand: "Beyfortus", route: "IM", notes: "Long-acting monoclonal antibody (not a vaccine). State/territory-funded — eligibility and timing vary by jurisdiction. Given to infants whose mothers did not receive Abrysvo, or <2 weeks after maternal vaccination, or with medical risk factors for severe RSV. Single dose; seasonal programs typically Apr–Sep." },
  // Older adults
  { vaccine: "Influenza", shortName: "Flu", age: "≥65 years", ageSort: 10, type: "routine", brand: "Various (enhanced)", route: "IM", notes: "Annual vaccination. Enhanced or adjuvanted formulations recommended." },
  { vaccine: "Shingles (Herpes Zoster)", shortName: "Zoster", age: "≥65 years", ageSort: 10, type: "routine", brand: "Shingrix", route: "IM", notes: "Non-Indigenous adults. 2 doses, 2–6 months apart. If previously had Zostavax via NIP, wait 5 years." },
  { vaccine: "Shingles (Herpes Zoster)", shortName: "Zoster", age: "≥50 years (ATSI)", ageSort: 9.5, type: "indigenous", brand: "Shingrix", route: "IM", notes: "Aboriginal and Torres Strait Islander adults ≥50 years. 2 doses, 2–6 months apart." },
  { vaccine: "Pneumococcal (13vPCV)", shortName: "PCV13", age: "≥70 years", ageSort: 11, type: "routine", brand: "Prevenar 13", route: "IM", notes: "Non-Indigenous adults. Adult program still uses 13vPCV (20vPCV not yet NIP-funded for adults). Followed by 23vPPV." },
  { vaccine: "Pneumococcal", shortName: "PCV", age: "≥50 years (ATSI)", ageSort: 9.5, type: "indigenous", brand: "Prevenar 13 + Pneumovax 23", route: "IM", notes: "Aboriginal and Torres Strait Islander adults. 13vPCV then 23vPPV 12 months later." },
];

const AGE_GROUPS = [
  "Birth", "Infants (seasonal)", "6 weeks", "4 months", "6 months", "6 months–5 years",
  "12 months", "18 months", "18 months+", "4 years",
  "Year 7 (12–13 yrs)", "Year 10 (15–16 yrs)", "15–19 years",
  "Pregnancy",
  "≥50 years (ATSI)", "≥65 years", "≥70 years"
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

// Non-linear axis: birth–18m gets ~60% of the visual width
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
  { label: "15–19y", x: 750, pct: 100 },
];

const VACCINE_DETAILS = {
  "Hepatitis B": {
    diseases: "Hepatitis B virus infection — can cause chronic liver disease, cirrhosis and liver cancer",
    contraindications: "Anaphylaxis to previous dose or any vaccine component (yeast)",
    schedule: "Birth dose + 3 further doses at 6w, 4m, 6m (as part of hexavalent)"
  },
  "DTPa-HepB-IPV-Hib": {
    diseases: "Diphtheria, tetanus, pertussis, hepatitis B, polio, Hib meningitis/epiglottitis",
    contraindications: "Anaphylaxis to previous dose or component. Encephalopathy within 7 days of pertussis vaccine.",
    schedule: "3 primary doses at 6 weeks, 4 months, 6 months"
  },
  "Pneumococcal (20vPCV)": {
    diseases: "Invasive pneumococcal disease — meningitis, bacteraemia, pneumonia, otitis media",
    contraindications: "Anaphylaxis to previous PCV dose or component including diphtheria toxoid (CRM197)",
    schedule: "Routine: 6w, 4m, 12m. ATSI/at-risk: additional dose at 6m (3+1 schedule)"
  },
  Rotavirus: {
    diseases: "Severe gastroenteritis in infants and young children",
    contraindications: "History of intussusception. SCID. Anaphylaxis to previous dose.",
    schedule: "2 doses: 6w and 4m. Strict age limits – dose 1 by 14 weeks + 6 days, dose 2 by 24 weeks + 6 days"
  },
  "Meningococcal B": {
    diseases: "Invasive meningococcal disease (serogroup B) — meningitis, septicaemia",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "Recommended for ALL infants <2 years: 6w, 4m, 12m. Also recommended for adolescents 15–19y (2 doses, 8w apart). NIP-funded for ATSI infants and medical at-risk. State-funded in SA, QLD, NT. Prophylactic paracetamol recommended in children <2 years."
  },
  "Meningococcal ACWY": {
    diseases: "Invasive meningococcal disease (serogroups A, C, W, Y)",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "12 months (routine) + Year 10 school program. Additional doses for at-risk groups."
  },
  "Varicella (2nd dose)": {
    diseases: "Varicella (chickenpox) — prevents breakthrough varicella infection after single-dose vaccination",
    contraindications: "Pregnancy. Severe immunocompromise. Anaphylaxis to neomycin or gelatin.",
    schedule: "Recommended for all children 12m to <14y, ≥4 weeks after first varicella dose (MMRV at 18m). Not NIP-funded. Monovalent varicella vaccine (Varilrix) used. 2 doses give >90% protection vs ~70% with single dose."
  },
  "RSV (Abrysvo)": {
    diseases: "Respiratory syncytial virus (RSV) — bronchiolitis, pneumonia in infants. Leading cause of hospitalisation in infants <6 months.",
    contraindications: "Anaphylaxis to previous dose or component. Do NOT use Arexvy (only approved for ≥50 years, contraindicated in pregnancy).",
    schedule: "NIP-funded from Feb 2025. Single dose from 28 weeks gestation (ideally by 36w). Infant protection via transplacental antibodies. ~57% reduction in hospitalisation for severe RSV in infants <6 months. Recommended in each pregnancy."
  },
  "Nirsevimab (RSV mAb)": {
    diseases: "RSV prevention in infants — long-acting monoclonal antibody (not a vaccine)",
    contraindications: "Hypersensitivity to nirsevimab or excipients. Not a vaccine — provides passive immunity only.",
    schedule: "State/territory-funded (not NIP). Single IM dose. For infants whose mothers did not receive Abrysvo, or vaccinated <2w before birth, or with medical risk factors. Seasonal programs vary by jurisdiction (typically Apr–Sep). Also for high-risk children <24m entering 2nd RSV season."
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
    diseases: "Haemophilus influenzae type b — meningitis, epiglottitis, septicaemia",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "Primary series in hexavalent (6w, 4m, 6m) + standalone booster at 18 months"
  },
  DTPa: {
    diseases: "Diphtheria, tetanus, pertussis",
    contraindications: "Anaphylaxis to previous dose. Encephalopathy within 7 days of pertussis vaccine.",
    schedule: "Booster at 18 months, then DTPa-IPV at 4 years, dTpa at Year 7 and in pregnancy"
  },
  HPV: {
    diseases: "HPV-related cancers — cervical, oropharyngeal, anal, penile, vaginal, vulvar. Genital warts.",
    contraindications: "Anaphylaxis to previous dose or yeast. Not recommended in pregnancy (defer).",
    schedule: "Year 7: 2 doses 6–12 months apart. If ≥15 years at first dose or immunocompromised: 3 doses."
  },
  "Hepatitis A": {
    diseases: "Hepatitis A virus infection",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "ATSI children in QLD, NT, SA, WA: dose 1 at 18 months, dose 2 at 4 years"
  },
  Influenza: {
    diseases: "Influenza (seasonal flu) — can cause severe respiratory illness, hospitalisation",
    contraindications: "Anaphylaxis to previous influenza vaccine. Age <6 months.",
    schedule: "Annual. NIP-funded: 6m–<5y, ≥65y, pregnancy, ATSI ≥6m, medical at-risk"
  },
  "Pertussis (dTpa)": {
    diseases: "Pertussis (whooping cough) — passive antibody transfer to protect newborns",
    contraindications: "Anaphylaxis to previous dose. Encephalopathy within 7 days of pertussis vaccine.",
    schedule: "Each pregnancy, ideally 20–32 weeks gestation. Can be given up to delivery."
  },
};

// ─────────────────────────────────────────────────────
// Catch-up Scheduler Data + Logic
// ─────────────────────────────────────────────────────

const CATCHUP_SERIES = [
  {
    id: "sixInOne",
    name: "6-in-1 (DTPa-HepB-IPV-Hib)",
    shortName: "6-in-1",
    brand: "Infanrix hexa / Vaxelis",
    type: "routine",
    route: "IM",
    maxDoses: 3,
    minIntervalWeeks: 4,
    minAgeFirstDoseWeeks: 6,
    routineAges: [6, 16, 24], // 6w, 4m, 6m
    note: "Complete all 3 doses regardless of age at presentation. Min 4 weeks between doses.",
    boosterNote: "DTPa booster needed at 18m (if ≥6m since dose 3). DTPa-IPV pre-school booster at 4y.",
  },
  {
    id: "PCV",
    name: "Pneumococcal (PCV20)",
    shortName: "PCV20",
    brand: "Prevenar 20",
    type: "routine",
    route: "IM",
    ageDependentDoses: true, // computed at runtime
    minIntervalWeeks: 8,
    minAgeFirstDoseWeeks: 6,
    routineAges: [6, 16, 52], // 6w, 4m, 12m (booster)
    note: "Doses depend on age at first presentation. Min 8 weeks between doses in catch-up. ATSI and at-risk children <7m need 4 doses (add 1).",
  },
  {
    id: "Rota",
    name: "Rotavirus",
    shortName: "Rotarix",
    brand: "Rotarix",
    type: "routine",
    route: "Oral",
    maxDoses: 2,
    minIntervalWeeks: 4,
    minAgeFirstDoseWeeks: 6,
    routineAges: [6, 16], // 6w, 4m
    hardCutoffDose1Weeks: 14 + 6/7, // 14w 6d
    hardCutoffAllDosesWeeks: 24,
    note: "STRICT AGE LIMITS: Dose 1 must be given by 14 weeks 6 days. All doses must complete by 24 weeks.",
    warning: true,
  },
  {
    id: "MMR",
    name: "MMR",
    shortName: "MMR",
    brand: "M-M-R II / Priorix",
    type: "routine",
    route: "SC",
    maxDoses: 2,
    minIntervalWeeks: 4,
    minAgeFirstDoseWeeks: 52, // 12 months
    routineAges: [52, 72], // 12m, 18m
    isLive: true,
    note: "Dose 1 from 12 months. Dose 2 ideally at 18m as MMRV (adds varicella). Min 4 weeks between doses.",
  },
  {
    id: "VZV",
    name: "Varicella (Chickenpox)",
    shortName: "VZV",
    brand: "Varilrix / Priorix-Tetra",
    type: "recommended",
    route: "SC",
    maxDoses: 2,
    minIntervalWeeks: 4,
    minAgeFirstDoseWeeks: 52,
    routineAges: [72, 76], // 18m for dose 1 (MMRV), 18m+ for dose 2
    isLive: true,
    note: "2nd dose recommended but not NIP-funded (cost to patient). Min 4 weeks after first dose (usually given as MMRV at 18m).",
  },
  {
    id: "MenACWY",
    name: "Meningococcal ACWY",
    shortName: "MenACWY",
    brand: "Nimenrix / MenQuadfi",
    type: "routine",
    route: "IM",
    maxDoses: 1,
    minAgeFirstDoseWeeks: 52,
    routineAges: [52], // 12m
    note: "Single catch-up dose if 12m dose missed. Separate Year 10 school dose is routine.",
  },
  {
    id: "MenB",
    name: "Meningococcal B",
    shortName: "MenB",
    brand: "Bexsero",
    type: "recommended",
    route: "IM",
    maxDoses: 3, // infant series; adolescents need only 2
    minIntervalWeeks: null, // Age-dependent - see getMinIntervalForMenB()
    minAgeFirstDoseWeeks: 6,
    routineAges: [6, 16, 52], // 6w, 4m, 12m (ATSI schedule)
    ageDependentDoses: true,
    ageDependentInterval: true, // Flag to use age-based interval calculation
    isLive: false,
    note: "Infant series (< 2y): 3 doses. Adolescents 15–19y: 2 doses. Not NIP-funded except ATSI and some states (SA, QLD, NT for all infants). Private cost ~$110-135/dose. Intervals: 6w for <6m, 8w for 6-23m, 4w for ≥2y.",
  },
  {
    id: "HepA",
    name: "Hepatitis A",
    shortName: "HepA",
    brand: "Vaqta Paed / Havrix Junior",
    type: "indigenous",
    route: "IM",
    maxDoses: 2,
    minIntervalWeeks: 24, // 6 months
    minAgeFirstDoseWeeks: 72, // 18 months
    routineAges: [72, 192], // 18m, 4y
    statesOnly: ["QLD","NT","SA","WA"],
    note: "ATSI children in QLD, NT, SA, WA only. 2 doses at least 6 months apart.",
  },
  {
    id: "HPV",
    name: "HPV (Gardasil 9)",
    shortName: "HPV",
    brand: "Gardasil 9",
    type: "routine",
    route: "IM",
    ageDependentDoses: true,
    minIntervalWeeks: 24, // 6 months (2-dose schedule)
    minAgeFirstDoseWeeks: 624, // 12y — Year 7 context
    maxAgeWeeks: 1352, // 26 years (26 * 52)
    routineAges: [624, 650], // Year 7, 6 months later
    note: "< 15y at first dose: 2 doses min 6 months apart. ≥ 15y or immunocompromised: 3 doses (0, 4–8w, 6m). NIP-funded catch-up to age 26 (up to and including 25 years).",
  },
  {
    id: "dTpa",
    name: "dTpa booster",
    shortName: "dTpa",
    brand: "Boostrix",
    type: "routine",
    route: "IM",
    maxDoses: 1,
    minAgeFirstDoseWeeks: 624, // Year 7 (12y)
    routineAges: [624], // Year 7
    note: "Single adolescent booster (Year 7 school program). Separate to pregnancy dTpa.",
  },
];

function addWeeks(date, weeks) {
  return new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
}

function ageInWeeks(dob, at) {
  return (at - dob) / (7 * 24 * 60 * 60 * 1000);
}

function getPCVRequiredDoses(ageWeeksAtFirst) {
  // Standard NIP catch-up (non-ATSI, non-at-risk).
  // ATSI and at-risk children get 4 doses (<7m) — enter extra dose manually.
  if (ageWeeksAtFirst < 7 * 4)    return 3; // < 7m: 2 primary + 1 booster
  if (ageWeeksAtFirst < 12 * 4)   return 3; // 7–11m: 2 primary + 1 booster
  if (ageWeeksAtFirst < 24 * 4)   return 2; // 12–23m: 2 doses
  return 1;                                  // ≥24m: 1 dose
}

function getMenBRequiredDoses(ageWeeksAtFirst) {
  if (ageWeeksAtFirst < 12 * 4) return 3;   // infants < 12m: 3 doses
  if (ageWeeksAtFirst < 24 * 4) return 2;   // 12–23m: 2 doses
  if (ageWeeksAtFirst < 52 * 15) return 2;  // 2y–15y: 2 doses
  return 2;                                  // adolescents: 2 doses
}

function getHPVRequiredDoses(ageWeeksAtFirst) {
  return ageWeeksAtFirst < 15 * 52 ? 2 : 3;
}

function getRequiredDosesForSeries(series, ageWeeks, dosesGiven, state) {
  if (series.ageDependentDoses) {
    const ageAtFirstDose = dosesGiven === 0 ? ageWeeks : (state?.ageAtFirstDose || ageWeeks);
    if (series.id === "PCV") return getPCVRequiredDoses(ageAtFirstDose);
    if (series.id === "MenB") return getMenBRequiredDoses(ageAtFirstDose);
    if (series.id === "HPV") return getHPVRequiredDoses(ageAtFirstDose);
  }
  return series.maxDoses;
}

function calcCatchupSchedule(dobDate, seriesStates, stateFilter, isATSI, hasMedicalRisk) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentAgeWeeks = ageInWeeks(dobDate, today);

  const visits = {};
  const warnings = [];
  const complete = [];
  const notYetDue = [];

  const addToVisit = (date, vaccine) => {
    const key = date.toISOString().slice(0, 10);
    if (!visits[key]) visits[key] = { date: new Date(date), vaccines: [] };
    visits[key].vaccines.push(vaccine);
  };

  CATCHUP_SERIES.forEach(series => {
    // Filter by state funding
    if (series.statesOnly && stateFilter !== "ALL" && !series.statesOnly.includes(stateFilter)) return;
    
    // Filter by type
    if (series.type === "indigenous" && !isATSI) return;
    if (series.type === "at-risk" && !hasMedicalRisk) return;

    const state = seriesStates[series.id] || { dosesGiven: 0, lastDoseDate: null };
    const { dosesGiven } = state;
    const lastDoseDate = state.lastDoseDate ? new Date(state.lastDoseDate) : null;

    // KEY FIX: If the child hasn't started this series and hasn't yet reached the minimum
    // age for the first dose, it's not behind — it's simply not due yet. Don't schedule years ahead.
    if (dosesGiven === 0 && series.minAgeFirstDoseWeeks && currentAgeWeeks < series.minAgeFirstDoseWeeks) {
      const dueDate = addWeeks(dobDate, series.minAgeFirstDoseWeeks);
      notYetDue.push({
        id: series.id,
        name: series.name,
        type: series.type,
        brand: series.brand,
        dueDate,
        ageLabel: formatAgeAtVisit(dobDate, dueDate),
      });
      return;
    }
    
    // Check maximum age for catch-up (e.g., HPV only to age 26)
    if (dosesGiven === 0 && series.maxAgeWeeks && currentAgeWeeks > series.maxAgeWeeks) {
      return; // Too old for this vaccine, skip it
    }

    let ageAtFirstDoseWeeks;
    if (dosesGiven > 0 && lastDoseDate) {
      const minInterv = (series.minIntervalWeeks || 4) * (dosesGiven - 1);
      ageAtFirstDoseWeeks = ageInWeeks(dobDate, lastDoseDate) - minInterv;
    } else {
      ageAtFirstDoseWeeks = currentAgeWeeks;
    }

    let requiredDoses = series.maxDoses || 1;
    if (series.ageDependentDoses) {
      if (series.id === "PCV") requiredDoses = getPCVRequiredDoses(dosesGiven === 0 ? currentAgeWeeks : ageAtFirstDoseWeeks);
      if (series.id === "MenB") requiredDoses = getMenBRequiredDoses(dosesGiven === 0 ? currentAgeWeeks : ageAtFirstDoseWeeks);
      if (series.id === "HPV") requiredDoses = getHPVRequiredDoses(dosesGiven === 0 ? currentAgeWeeks : ageAtFirstDoseWeeks);
    }

    if (series.id === "Rota") {
      if (dosesGiven === 0 && currentAgeWeeks > series.hardCutoffDose1Weeks) {
        warnings.push({ id: series.id, name: series.name, type: "cutoff",
          msg: "Cannot start — too old. Dose 1 must be given by 14 weeks 6 days." });
        return;
      }
      if (dosesGiven === 1) {
        const dose2Cutoff = addWeeks(dobDate, series.hardCutoffAllDosesWeeks);
        if (today >= dose2Cutoff) {
          warnings.push({ id: series.id, name: series.name, type: "cutoff",
            msg: "Cannot give dose 2 — too old. All doses must complete by 24 weeks." });
          return;
        }
      }
    }

    if (dosesGiven >= requiredDoses) {
      complete.push({ id: series.id, name: series.name, type: series.type, dosesGiven, requiredDoses });
      return;
    }

    let prevDate = lastDoseDate || today;

    for (let i = dosesGiven; i < requiredDoses; i++) {
      let earliest = new Date(prevDate);

      if (i > 0 || lastDoseDate) {
        // Use age-dependent interval for MenB
        let minInterval = series.minIntervalWeeks || 4;
        if (series.ageDependentInterval && series.id === "MenB") {
          const ageAtThisDose = ageInWeeks(dobDate, earliest);
          minInterval = getMinIntervalForMenB(ageAtThisDose);
        }
        const minAfterPrev = addWeeks(prevDate, minInterval);
        if (minAfterPrev > earliest) earliest = minAfterPrev;
      }

      // Enforce routine schedule ages — don't give dose i before the routine schedule would
      if (series.routineAges && series.routineAges[i] !== undefined) {
        const routineMinAge = addWeeks(dobDate, series.routineAges[i]);
        if (routineMinAge > earliest) earliest = routineMinAge;
      }

      if (series.id === "HPV" && requiredDoses === 3) {
        if (i === 1) {
          const minD1 = lastDoseDate ? addWeeks(lastDoseDate, 4) : addWeeks(today, 4);
          if (minD1 > earliest) earliest = minD1;
        }
        if (i === 2) {
          const dose1Date = lastDoseDate ? addWeeks(lastDoseDate, -(dosesGiven - 1) * 8) : today;
          const sixMonthsFromD1 = addWeeks(dose1Date, 24);
          if (sixMonthsFromD1 > earliest) earliest = sixMonthsFromD1;
        }
      }

      if (series.id === "Rota") {
        const cutoff = addWeeks(dobDate, series.hardCutoffAllDosesWeeks);
        if (earliest >= cutoff) {
          warnings.push({ id: series.id, name: series.name, type: "cutoff",
            msg: `Dose ${i + 1} cannot be scheduled — would fall after 24-week age limit.` });
          break;
        }
      }

      if (earliest < today) earliest = new Date(today);

      const isToday = earliest.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
      
      // Check if this dose is scheduled at its routine age (not accelerated catch-up)
      const ageAtDose = ageInWeeks(dobDate, earliest);
      const routineAge = series.routineAges && series.routineAges[i];
      const isRoutineAge = routineAge && Math.abs(ageAtDose - routineAge) < 1; // within 1 week of routine age
      
      // Determine if this vaccine is funded for this child
      const isFunded = isSeriesFunded(series, stateFilter, isATSI, hasMedicalRisk);

      addToVisit(earliest, {
        seriesId: series.id,
        name: series.name,
        brand: series.brand,
        doseNum: i + 1,
        totalDoses: requiredDoses,
        type: series.type,
        route: series.route,
        isToday,
        isRoutineAge,
        isLive: series.isLive || false,
        isFunded,
      });

      prevDate = earliest;
    }
  });

  // After scheduling catch-up doses, add any vaccines that become newly due at visit ages
  // (e.g., MMR and MenACWY at 12 months)
  const visitDates = Object.keys(visits).map(k => new Date(k));
  visitDates.forEach(visitDate => {
    const ageAtVisit = ageInWeeks(dobDate, visitDate);
    
    CATCHUP_SERIES.forEach(series => {
      // Filter by type and state
      if (series.type === "indigenous" && !isATSI) return;
      if (series.type === "at-risk" && !hasMedicalRisk) return;
      if (series.statesOnly && stateFilter !== "ALL" && !series.statesOnly.includes(stateFilter)) return;
      
      // Check maximum age for catch-up
      if (series.maxAgeWeeks && currentAgeWeeks > series.maxAgeWeeks) return;
      
      // Skip if already scheduled for this visit
      const visitKey = visitDate.toISOString().slice(0, 10);
      const alreadyScheduled = visits[visitKey]?.vaccines.some(d => d.seriesId === series.id);
      if (alreadyScheduled) return;
      
      // Skip if series already complete
      const st = seriesStates[series.id];
      const dosesGiven = st?.dosesGiven || 0;
      const requiredDoses = getRequiredDosesForSeries(series, ageAtVisit, dosesGiven, st);
      if (dosesGiven >= requiredDoses) return;
      
      // Check if this vaccine becomes newly due at this age (not overdue, just due)
      // Use the routine schedule age, not the minimum age (e.g., VZV is 12m min but 18m routine)
      const routineAge = series.routineAges && series.routineAges[0];
      const ageToCheck = routineAge || series.minAgeFirstDoseWeeks;
      if (ageAtVisit >= ageToCheck && ageAtVisit < ageToCheck + 8) { // within 8 weeks of becoming due
        // This is a newly-due vaccine at this visit - add dose 1
        if (dosesGiven === 0) {
          const isToday = visitDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
          const isFunded = isSeriesFunded(series, stateFilter, isATSI, hasMedicalRisk);
          addToVisit(visitDate, {
            seriesId: series.id,
            name: series.name,
            brand: series.brand,
            doseNum: 1,
            totalDoses: requiredDoses,
            type: series.type,
            route: series.route,
            isToday,
            newlyDue: true, // mark as newly due, not catch-up
            isLive: series.isLive || false,
            isFunded,
          });
        }
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // POST-PROCESSING: Apply 4-injection limit and live vaccine spacing rules
  // ────────────────────────────────────────────────────────────────────────
  
  // Step 1: Split visits with >4 injectable vaccines
  const splitVisitsForInjectionLimit = () => {
    const visitDates = Object.keys(visits).sort((a, b) => new Date(a) - new Date(b));
    
    for (const dateKey of visitDates) {
      const visit = visits[dateKey];
      const injectables = visit.vaccines.filter(v => v.route === "IM" || v.route === "SC");
      
      if (injectables.length <= 4) continue;
      
      // Keep first 4 injectables, move rest to new visit
      const toKeep = injectables.slice(0, 4);
      const toMove = injectables.slice(4);
      
      // Remove moved vaccines from current visit
      visit.vaccines = visit.vaccines.filter(v => 
        v.route === "Oral" || toKeep.some(k => k.seriesId === v.seriesId && k.doseNum === v.doseNum)
      );
      
      // Schedule moved vaccines to earliest safe date (4 weeks after current visit)
      const currentDate = new Date(dateKey);
      const nextEarliest = addWeeks(currentDate, 4);
      
      toMove.forEach(vaccine => {
        // Find when this vaccine can actually be given based on its series rules
        const series = CATCHUP_SERIES.find(s => s.id === vaccine.seriesId);
        if (!series) return;
        
        let targetDate = new Date(nextEarliest);
        
        // If this is not the first dose, respect minimum interval from previous dose
        if (vaccine.doseNum > 1) {
          // Find the previous dose date
          let prevDoseDate = null;
          for (const vd of Object.keys(visits).sort((a, b) => new Date(a) - new Date(b))) {
            const prevVaccine = visits[vd].vaccines.find(v => 
              v.seriesId === vaccine.seriesId && v.doseNum === vaccine.doseNum - 1
            );
            if (prevVaccine) {
              prevDoseDate = new Date(vd);
              break;
            }
          }
          
          if (prevDoseDate) {
            let minInterval = series.minIntervalWeeks || 4;
            if (series.ageDependentInterval && series.id === "MenB") {
              const ageAtDose = ageInWeeks(dobDate, targetDate);
              minInterval = getMinIntervalForMenB(ageAtDose);
            }
            const minDate = addWeeks(prevDoseDate, minInterval);
            if (minDate > targetDate) targetDate = minDate;
          }
        }
        
        // Respect routine ages
        if (series.routineAges && series.routineAges[vaccine.doseNum - 1] !== undefined) {
          const routineDate = addWeeks(dobDate, series.routineAges[vaccine.doseNum - 1]);
          if (routineDate > targetDate) targetDate = routineDate;
        }
        
        if (targetDate < today) targetDate = new Date(today);
        
        const newDateKey = targetDate.toISOString().slice(0, 10);
        addToVisit(targetDate, { ...vaccine, isToday: newDateKey === today.toISOString().slice(0, 10) });
      });
    }
  };
  
  // Step 2: Enforce live vaccine spacing (same day or ≥4 weeks apart)
  const enforceLiveVaccineSpacing = () => {
    const visitDates = Object.keys(visits).sort((a, b) => new Date(a) - new Date(b));
    
    for (let i = 0; i < visitDates.length; i++) {
      const dateKey1 = visitDates[i];
      const visit1 = visits[dateKey1];
      const liveVaccines1 = visit1.vaccines.filter(v => v.isLive);
      
      if (liveVaccines1.length === 0) continue;
      
      // Check all subsequent visits within 4 weeks
      for (let j = i + 1; j < visitDates.length; j++) {
        const dateKey2 = visitDates[j];
        const date1 = new Date(dateKey1);
        const date2 = new Date(dateKey2);
        const weeksBetween = (date2 - date1) / (1000 * 60 * 60 * 24 * 7);
        
        if (weeksBetween >= 4) break; // Far enough apart
        
        const visit2 = visits[dateKey2];
        const liveVaccines2 = visit2.vaccines.filter(v => v.isLive);
        
        if (liveVaccines2.length === 0) continue;
        
        // We have live vaccines <4 weeks apart. Try to combine to same visit if possible.
        const visit1Injectables = visit1.vaccines.filter(v => v.route === "IM" || v.route === "SC");
        const visit2Injectables = visit2.vaccines.filter(v => v.route === "IM" || v.route === "SC");
        
        // Can we move visit2's live vaccines to visit1?
        if (visit1Injectables.length + liveVaccines2.length <= 4) {
          // Yes! Move them
          liveVaccines2.forEach(vaccine => {
            visit1.vaccines.push({ ...vaccine, isToday: dateKey1 === today.toISOString().slice(0, 10) });
          });
          visit2.vaccines = visit2.vaccines.filter(v => !v.isLive);
          if (visit2.vaccines.length === 0) delete visits[dateKey2];
        } else {
          // Can't combine. Push visit2 to ≥4 weeks after visit1
          const minDate = addWeeks(date1, 4);
          liveVaccines2.forEach(vaccine => {
            // Remove from visit2
            visit2.vaccines = visit2.vaccines.filter(v => 
              !(v.seriesId === vaccine.seriesId && v.doseNum === vaccine.doseNum)
            );
            
            // Add to new visit at safe date
            let targetDate = new Date(minDate);
            const series = CATCHUP_SERIES.find(s => s.id === vaccine.seriesId);
            
            // Respect routine ages
            if (series && series.routineAges && series.routineAges[vaccine.doseNum - 1] !== undefined) {
              const routineDate = addWeeks(dobDate, series.routineAges[vaccine.doseNum - 1]);
              if (routineDate > targetDate) targetDate = routineDate;
            }
            
            if (targetDate < today) targetDate = new Date(today);
            const newDateKey = targetDate.toISOString().slice(0, 10);
            addToVisit(targetDate, { ...vaccine, isToday: newDateKey === today.toISOString().slice(0, 10) });
          });
          
          if (visit2.vaccines.length === 0) delete visits[dateKey2];
        }
      }
    }
  };
  
  // Apply post-processing
  splitVisitsForInjectionLimit();
  enforceLiveVaccineSpacing();
  // Run split again in case live vaccine moves created new >4 visits
  splitVisitsForInjectionLimit();

  const sortedVisits = Object.values(visits).sort((a, b) => a.date - b.date);
  return { visits: sortedVisits, warnings, complete, notYetDue };
}

function formatVisitDate(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const diffDays = Math.round((date - today) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 14) return `In ${diffDays} days`;
  if (diffDays < 84) return `In ${Math.round(diffDays / 7)} weeks`;
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function formatAgeAtVisit(dobDate, visitDate) {
  const weeks = ageInWeeks(dobDate, visitDate);
  if (weeks < 2) return `${Math.round(weeks * 7)}d old`;
  if (weeks < 20) return `${Math.round(weeks)}w old`;
  if (weeks < 100) return `${Math.round(weeks / 4.33)}m old`;
  const yrs = Math.floor(weeks / 52);
  const mths = Math.floor((weeks % 52) / 4.33);
  return mths > 0 ? `${yrs}y ${mths}m old` : `${yrs}y old`;
}

// Calculate minimum interval for MenB based on child's age at the dose
function getMinIntervalForMenB(ageWeeks) {
  if (ageWeeks < 26) return 6; // <6 months: 6 weeks
  if (ageWeeks < 104) return 8; // 6-23 months: 8 weeks
  return 4; // ≥2 years: 4 weeks
}

// Determine if a vaccine series is NIP-funded for this child
function isSeriesFunded(series, stateFilter, isATSI, hasMedicalRisk) {
  // Routine vaccines are always NIP-funded
  if (series.type === "routine") {
    // Check state restrictions (e.g., HepA only in certain states)
    if (series.statesOnly && stateFilter !== "ALL" && !series.statesOnly.includes(stateFilter)) {
      return false;
    }
    return true;
  }
  
  // Indigenous vaccines are NIP-funded for ATSI children in specified states
  if (series.type === "indigenous") {
    if (!isATSI) return false;
    if (series.statesOnly && stateFilter !== "ALL" && !series.statesOnly.includes(stateFilter)) {
      return false;
    }
    return true;
  }
  
  // At-risk vaccines are NIP-funded for children with medical risk
  if (series.type === "at-risk") {
    return hasMedicalRisk;
  }
  
  // Recommended vaccines - check specific state funding
  if (series.type === "recommended") {
    if (series.id === "MenB") {
      // MenB is NIP-funded for ATSI, state-funded in SA/QLD/NT for all
      if (isATSI) return true;
      if (stateFilter !== "ALL" && ["SA", "QLD", "NT"].includes(stateFilter)) return true;
      return false; // Private cost elsewhere
    }
    // VZV dose 2 and adolescent MenB are not funded anywhere
    return false;
  }
  
  return false;
}

function CatchupSection({ stateFilter, setStateFilter }) {
  const [dob, setDob] = useState(() => {
    try {
      return sessionStorage.getItem("catchup_dob") || "";
    } catch { return ""; }
  });
  const [seriesStates, setSeriesStates] = useState(() => {
    try {
      const saved = sessionStorage.getItem("catchup_series");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [showComplete, setShowComplete] = useState(false);
  const [showNotYetDue, setShowNotYetDue] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isATSI, setIsATSI] = useState(() => {
    try {
      return sessionStorage.getItem("catchup_isATSI") === "true";
    } catch { return false; }
  });
  const [hasMedicalRisk, setHasMedicalRisk] = useState(() => {
    try {
      return sessionStorage.getItem("catchup_medicalRisk") === "true";
    } catch { return false; }
  });

  // Persist ATSI and medical risk flags
  useEffect(() => {
    try {
      sessionStorage.setItem("catchup_isATSI", String(isATSI));
    } catch {}
  }, [isATSI]);
  
  useEffect(() => {
    try {
      sessionStorage.setItem("catchup_medicalRisk", String(hasMedicalRisk));
    } catch {}
  }, [hasMedicalRisk]);

  // Persist dob to sessionStorage
  useEffect(() => {
    try {
      if (dob) sessionStorage.setItem("catchup_dob", dob);
      else sessionStorage.removeItem("catchup_dob");
    } catch {}
  }, [dob]);

  // Persist seriesStates to sessionStorage
  useEffect(() => {
    try {
      if (Object.keys(seriesStates).length > 0) {
        sessionStorage.setItem("catchup_series", JSON.stringify(seriesStates));
      } else {
        sessionStorage.removeItem("catchup_series");
      }
    } catch {}
  }, [seriesStates]);

  const resetAll = () => {
    setDob("");
    setSeriesStates({});
    setIsATSI(false);
    setHasMedicalRisk(false);
    try {
      sessionStorage.removeItem("catchup_dob");
      sessionStorage.removeItem("catchup_series");
      sessionStorage.removeItem("catchup_isATSI");
      sessionStorage.removeItem("catchup_medicalRisk");
    } catch {}
  };

  const dobDate = useMemo(() => {
    if (!dob) return null;
    const d = new Date(dob); d.setHours(0,0,0,0);
    return isNaN(d) ? null : d;
  }, [dob]);

  const today = new Date(); today.setHours(0,0,0,0);
  const currentAgeWeeks = dobDate ? ageInWeeks(dobDate, today) : null;

  const result = useMemo(() => {
    if (!dobDate) return null;
    try {
      return calcCatchupSchedule(dobDate, seriesStates, stateFilter, isATSI, hasMedicalRisk);
    } catch (error) {
      console.error("Error calculating catch-up schedule:", error);
      return { visits: [], warnings: [{ id: "error", name: "Calculation Error", type: "error", msg: error.message || "An error occurred calculating the schedule" }], complete: [], notYetDue: [] };
    }
  }, [dobDate, seriesStates, stateFilter, isATSI, hasMedicalRisk]);

  const setDoses = (id, n) => setSeriesStates(prev => ({ ...prev, [id]: { ...prev[id], dosesGiven: n, lastDoseDate: n === 0 ? null : (prev[id]?.lastDoseDate || null) } }));
  const setLastDate = (id, val) => setSeriesStates(prev => ({ ...prev, [id]: { ...prev[id], lastDoseDate: val || null } }));

  const ageLabel = currentAgeWeeks === null ? null
    : currentAgeWeeks < 0 ? "Not yet born"
    : currentAgeWeeks < 20 ? `${Math.round(currentAgeWeeks)} weeks`
    : currentAgeWeeks < 100 ? `${Math.round(currentAgeWeeks / 4.33)} months`
    : `${Math.floor(currentAgeWeeks / 52)}y ${Math.floor((currentAgeWeeks % 52) / 4.33)}m`;

  const DosePills = ({ id, max }) => {
    const given = seriesStates[id]?.dosesGiven ?? 0;
    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#888", fontWeight: 600, marginRight: "4px" }}>Doses given:</span>
        {Array.from({ length: max + 1 }, (_, n) => (
          <button key={n} onClick={() => setDoses(id, n)} style={{
            width: "28px", height: "28px", borderRadius: "50%", border: "none",
            background: given === n ? "#1a1a2e" : "#f0f0f0",
            color: given === n ? "#fff" : "#555",
            fontSize: "12px", fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.12s",
          }}>{n}</button>
        ))}
      </div>
    );
  };

  const getMaxForSeries = (series) => {
    const aw = currentAgeWeeks || 0;
    const minStart = series.minAgeFirstDoseWeeks || 0;
    if (aw < minStart) return 0;
    // Max doses the child could plausibly have received by current age,
    // using minimum intervals as the baseline (most aggressive schedule).
    const interval = series.minIntervalWeeks || 4;
    const possibleByAge = Math.floor((aw - minStart) / interval) + 1;
    // Hard cap at the series maximum
    const seriesMax = series.id === "PCV" ? 3
      : series.id === "MenB" ? 3
      : series.id === "HPV" ? 3
      : (series.maxDoses || 2);
    return Math.min(possibleByAge, seriesMax);
  };

  // ── PDF generation ────────────────────────────────────────────────────────
  const loadJsPDF = () => new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(window.jspdf); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf);
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });

  const generatePDF = async () => {
    if (!dobDate || !result) return;
    setPdfLoading(true);
    try {
      const jspdfModule = await loadJsPDF();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210; const ML = 18; const MR = 18; const CW = W - ML - MR;

      const hex2rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
      const setFill = hex => { const [r,g,b] = hex2rgb(hex); doc.setFillColor(r,g,b); };
      const setStroke = hex => { const [r,g,b] = hex2rgb(hex); doc.setDrawColor(r,g,b); };
      const setTC = hex => { const [r,g,b] = hex2rgb(hex); doc.setTextColor(r,g,b); };

      const stateName = stateFilter === "ALL" ? "All states/territories" : STATES[stateFilter];
      const todayStr = today.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

      // Header
      setFill("#1a1a2e"); doc.rect(0, 0, W, 42, "F");
      setFill("#2d2b55"); doc.rect(0, 38, W, 4, "F");
      doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(18);
      doc.text("Catch-up Immunisation Schedule", ML, 16);
      doc.setFontSize(11); doc.setFont("helvetica","normal");
      doc.setTextColor(200,210,230); doc.text("National Immunisation Program \u00B7 Australia", ML, 23);
      doc.setFontSize(8); doc.setTextColor(150,165,190);
      doc.text(`Generated ${todayStr}`, W - MR, 16, { align: "right" });
      doc.text("nip.terrific.website", W - MR, 21, { align: "right" });

      // Patient card
      setFill("#F4F6FB"); doc.roundedRect(ML, 48, CW, 22, 3, 3, "F");
      setFill("#1a1a2e"); doc.rect(ML, 48, 4, 22, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(136,136,136);
      doc.text("DATE OF BIRTH", ML+10, 55);
      doc.text("CURRENT AGE", ML+65, 55);
      doc.text("STATE / TERRITORY", ML+120, 55);
      doc.setFont("helvetica","bold"); doc.setFontSize(13); setTC("#1a1a2e");
      doc.text(dobDate.toLocaleDateString("en-AU", { day:"numeric", month:"short", year:"numeric" }), ML+10, 64);
      doc.text(ageLabel || "—", ML+65, 64);
      doc.setFontSize(11); doc.text(stateName, ML+120, 64);

      let y = 80;
      const PAGE_BOTTOM = 272;
      const ROW_H = 18;

      const checkPage = (need) => { if (y + need > PAGE_BOTTOM) { doc.addPage(); y = 20; } };

      // Vaccines received overview
      const receivedVaccines = Object.entries(seriesStates)
        .filter(([id, state]) => state.dosesGiven > 0)
        .map(([id, state]) => {
          const series = CATCHUP_SERIES.find(s => s.id === id);
          return { series, state };
        })
        .filter(item => item.series); // Only include series we recognize

      if (receivedVaccines.length > 0) {
        checkPage(16 + receivedVaccines.length * 6);
        setFill("#F0F9FF"); doc.roundedRect(ML, y, CW, 10, 2, 2, "F");
        setStroke("#BFDBFE"); doc.setLineWidth(0.5); doc.roundedRect(ML, y, CW, 10, 2, 2, "S");
        doc.setFont("helvetica","bold"); doc.setFontSize(9); setTC("#0369A1");
        doc.text(`Vaccines Already Received (${receivedVaccines.length} series)`, ML+5, y+6.5);
        y += 12;

        // List received vaccines
        receivedVaccines.forEach((item, i) => {
          checkPage(6);
          doc.setFont("helvetica","normal"); doc.setFontSize(8); setTC("#555555");
          const doseText = item.state.dosesGiven === 1 ? "1 dose" : `${item.state.dosesGiven} doses`;
          const dateText = item.state.lastDoseDate 
            ? ` (last: ${new Date(item.state.lastDoseDate).toLocaleDateString("en-AU", { day:"numeric", month:"short", year:"numeric" })})`
            : "";
          doc.text(`\u2022  ${item.series.name}: ${doseText}${dateText}`, ML+5, y+4);
          y += 6;
        });
        y += 6;
      }

      const drawVisitHeader = (label, dateStr, ageStr, color) => {
        checkPage(14);
        const [r,g,b] = hex2rgb(color);
        doc.setFillColor(r,g,b); doc.rect(ML, y, CW, 10, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
        doc.text(label, ML+5, y+7);
        doc.setFont("helvetica","normal"); doc.setFontSize(8);
        doc.text(dateStr, ML+CW/2, y+7, { align: "center" });
        doc.text(ageStr, ML+CW-2, y+7, { align: "right" });
        y += 12;
      };

      const TYPE_LABELS = { routine:"NIP Routine", indigenous:"Aboriginal & TSI", "at-risk":"At-Risk", recommended:"Recommended", state:"State-funded" };

      const drawVaccineRow = (vac) => {
        checkPage(ROW_H);
        const tc = TYPES[vac.type].color;
        const [tr,tg,tb] = hex2rgb(tc);
        setFill("#FAFAFA"); doc.rect(ML, y, CW, ROW_H, "F");
        doc.setFillColor(tr,tg,tb); doc.rect(ML, y, 3, ROW_H, "F");
        setStroke("#EEEEEE"); doc.setLineWidth(0.2); doc.line(ML+3, y+ROW_H, ML+CW, y+ROW_H);

        doc.setFont("helvetica","bold"); doc.setFontSize(10); setTC("#1a1a2e");
        doc.text(vac.name, ML+7, y+6.5);

        const typeLabel = TYPE_LABELS[vac.type] || vac.type;
        doc.setFontSize(7); doc.setFont("helvetica","bold");
        const tlw = doc.getTextWidth(typeLabel);
        doc.setFillColor(Math.min(255,tr+175), Math.min(255,tg+175), Math.min(255,tb+175));
        doc.roundedRect(ML+7, y+8.5, tlw+5, 5, 1, 1, "F");
        doc.setTextColor(tr,tg,tb); doc.text(typeLabel, ML+9.5, y+12.5);
        
        // Add $ indicator for non-funded vaccines
        if (!vac.isFunded) {
          const dollarX = ML+7 + tlw + 8;
          doc.setFillColor(254, 226, 226); // #fee2e2
          doc.roundedRect(dollarX, y+8.5, 7, 5, 1, 1, "F");
          doc.setTextColor(220, 38, 38); // #dc2626
          doc.setFont("helvetica","bold");
          doc.text("$", dollarX+2, y+12.5);
        }

        doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(136,136,136);
        doc.text(`${vac.brand} \u00B7 ${vac.route}`, ML+7, y+15.5);

        doc.setFont("helvetica","bold"); doc.setFontSize(9); setTC("#1a1a2e");
        doc.text(`Dose ${vac.doseNum}/${vac.totalDoses}`, ML+CW-2, y+8, { align: "right" });

        y += ROW_H;
      };

      if (result.warnings.length > 0) {
        checkPage(12);
        setFill("#c0392b"); doc.rect(ML, y, CW, 9, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
        doc.text("Warnings", ML+5, y+6.5);
        y += 11;
        result.warnings.forEach(w => {
          checkPage(12);
          setFill("#FFF5F5"); doc.rect(ML, y, CW, 11, "F");
          doc.setFont("helvetica","bold"); doc.setFontSize(8); setTC("#c0392b");
          const labelText = `${w.name}: `;
          doc.text(labelText, ML+5, y+7.5);
          const labelWidth = doc.getTextWidth(labelText);
          doc.setFont("helvetica","normal");
          doc.text(w.msg, ML+5+labelWidth, y+7.5);
          y += 13;
        });
      }

      // Split visits into catch-up and routine
      const firstRoutineIndex = result.visits.findIndex(visit => 
        visit.vaccines.every(v => v.isRoutineAge || v.newlyDue)
      );
      const catchupVisits = firstRoutineIndex > 0 ? result.visits.slice(0, firstRoutineIndex) : result.visits;
      const routineVisits = firstRoutineIndex > 0 ? result.visits.slice(firstRoutineIndex) : [];

      // Catch-up visits
      if (catchupVisits.length > 0) {
        checkPage(14);
        setFill("#1a1a2e"); doc.rect(ML, y, CW, 10, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
        doc.text(`Catch-up schedule — ${catchupVisits.length} ${catchupVisits.length === 1 ? "visit" : "visits"} needed`, ML+5, y+6.8);
        y += 14;
        
        catchupVisits.forEach((visit, vi) => {
          const isToday = visit.date.toISOString().slice(0,10) === today.toISOString().slice(0,10);
          const dateStr = isToday ? "Today" : visit.date.toLocaleDateString("en-AU", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
          drawVisitHeader(
            `Visit ${vi + 1}`,
            dateStr,
            formatAgeAtVisit(dobDate, visit.date),
            isToday ? "#1a1a2e" : "#2d2b55"
          );
          visit.vaccines.forEach(drawVaccineRow);
          y += 4;
        });
      }

      // "Back on schedule" banner
      if (routineVisits.length > 0) {
        checkPage(16);
        y += 2;
        setFill("#f0f9ff"); doc.roundedRect(ML, y, CW, 12, 2, 2, "F");
        setStroke("#bfdbfe"); doc.setLineWidth(0.5); doc.roundedRect(ML, y, CW, 12, 2, 2, "S");
        doc.setFont("helvetica","bold"); doc.setFontSize(8); setTC("#0369a1");
        doc.text("\u25BA  Back on routine NIP schedule", ML+5, y+7.5);
        y += 16;
      }

      // Routine visits
      if (routineVisits.length > 0) {
        checkPage(14);
        setFill("#1a1a2e"); doc.rect(ML, y, CW, 10, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
        doc.text(`Next routine ${routineVisits.length === 1 ? "visit" : "visits"}`, ML+5, y+6.8);
        y += 14;
        
        routineVisits.forEach((visit, vi) => {
          const isToday = visit.date.toISOString().slice(0,10) === today.toISOString().slice(0,10);
          const dateStr = isToday ? "Today" : visit.date.toLocaleDateString("en-AU", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
          const visitNum = catchupVisits.length + vi + 1;
          drawVisitHeader(
            `Visit ${visitNum}`,
            dateStr,
            formatAgeAtVisit(dobDate, visit.date),
            isToday ? "#1a1a2e" : "#2d2b55"
          );
          visit.vaccines.forEach(drawVaccineRow);
          y += 4;
        });
      }

      if (result.complete.length > 0) {
        checkPage(14);
        y += 4;
        setFill("#0D6E3F"); doc.rect(ML, y, CW, 9, "F");
        doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
        doc.text(`Up to date (${result.complete.length} series)`, ML+5, y+6.5);
        y += 11;
        const names = result.complete.map(s => s.name).join("  \u2022  ");
        doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(80,80,80);
        const lines = doc.splitTextToSize(names, CW - 6);
        lines.forEach(line => { checkPage(8); doc.text(line, ML+4, y+5); y += 7; });
        y += 4;
      }

      // Scheduling rules note at end of content
      checkPage(22);
      y += 8;
      const boxWidth = CW * 0.5;
      const boxX = ML + (CW - boxWidth) / 2; // Center it
      setFill("#F4F6FB"); doc.roundedRect(boxX, y, boxWidth, 18, 3, 3, "F");
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(80,80,80);
      doc.text("Schedule split to max 4 injectable vaccines per visit.", boxX+4, y+6);
      doc.text("Live vaccines: same day or 4+ weeks apart.", boxX+4, y+11);
      doc.text("$ = Not NIP-funded (private cost).", boxX+4, y+16);


      // Footer
      const H = 297; const footerY = H - 25;
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        setStroke("#E0E0E0"); doc.setLineWidth(0.3); doc.line(ML, footerY-2, W-MR, footerY-2);
        doc.setFont("helvetica","bold"); doc.setFontSize(7.5); setTC("#c0392b");
        doc.text("Always verify immunisation history in AIR before administering.", ML, footerY+2);
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(170,170,170);
        doc.text(`Data: Australian Immunisation Handbook & NIP Schedule (${SCHEDULE_VERSION})  \u00B7  nip.terrific.website`, ML, footerY+7);
        doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(200,200,200);
        doc.text(`Schedule data: ${SCHEDULE_VERSION} \u00B7 Site version: ${SITE_VERSION}`, ML, footerY+11);
        doc.setFont("helvetica","italic"); doc.setFontSize(7); doc.setTextColor(187,187,187);
        doc.text("Dr Marc Theilhaber \u00B7 Dept of Respiratory Medicine \u00B7 Monash Children\u2019s Hospital", ML, footerY+15);
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(187,187,187);
        doc.text(`Page ${i} of ${pageCount}`, W-MR, footerY+2, { align: "right" });
      }

      doc.save(`NIP-catchup-${dob.replace(/-/g,"")}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Could not generate PDF. Please check your internet connection.");
    } finally {
      setPdfLoading(false);
    }
  };
  // ── end PDF ───────────────────────────────────────────────────────────────

  // Only show series that are relevant for the child's age and state/type
  const relevantSeries = useMemo(() => {
    if (!dobDate) return CATCHUP_SERIES;
    return CATCHUP_SERIES.filter(series => {
      // Filter by type: routine always shown, indigenous/at-risk/recommended only if applicable
      if (series.type === "routine") {
        // Always show routine vaccines
      } else if (series.type === "indigenous") {
        if (!isATSI) return false; // Only show for ATSI children
      } else if (series.type === "at-risk") {
        if (!hasMedicalRisk) return false; // Only show for medical risk
      } else if (series.type === "recommended") {
        // Show recommended vaccines (MenB, VZV2) - these are ATAGI recommended
        // Could add a separate toggle if wanted, but for now always show
      }
      
      // Filter by state funding
      if (series.statesOnly && stateFilter !== "ALL" && !series.statesOnly.includes(stateFilter)) return false;
      
      // Check maximum age for catch-up (e.g., HPV funded to age 26)
      const aw = currentAgeWeeks || 0;
      if (series.maxAgeWeeks && aw > series.maxAgeWeeks) return false;
      
      // Show series if: already started, OR child has reached/passed the minimum age for it
      const given = seriesStates[series.id]?.dosesGiven ?? 0;
      if (given > 0) return true;
      if (!series.minAgeFirstDoseWeeks) return true;
      return aw >= series.minAgeFirstDoseWeeks;
    });
  }, [dobDate, currentAgeWeeks, stateFilter, seriesStates, isATSI, hasMedicalRisk]);

  return (
    <section>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>
        Catch-up Calculator
      </h2>
      <p style={{ color: "#777", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.6 }}>
        Enter the child's date of birth and how many doses of each vaccine they've received.
        The calculator generates a catch-up schedule with minimum safe intervals — only for vaccines the child is old enough to receive.
        Always verify against AIR.
      </p>

      {/* DOB + State row */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "20px 24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Date of Birth</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)}
              max={today.toISOString().split("T")[0]}
              style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #d0d0d0", fontSize: "14px", fontFamily: "inherit", color: "#1a1a2e", background: "#FAFAF8", cursor: "pointer" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>State / Territory</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid #d0d0d0", fontSize: "13px", background: "#FAFAF8", color: "#333", fontFamily: "inherit", cursor: "pointer" }}>
              {Object.entries(STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {/* ATSI and Medical Risk checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#333", cursor: "pointer" }}>
              <input type="checkbox" checked={isATSI} onChange={e => setIsATSI(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }} />
              <span style={{ fontWeight: 600 }}>Aboriginal & Torres Strait Islander child</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#333", cursor: "pointer" }}>
              <input type="checkbox" checked={hasMedicalRisk} onChange={e => setHasMedicalRisk(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }} />
              <span style={{ fontWeight: 600 }}>Medical risk conditions</span>
            </label>
          </div>
          {ageLabel && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Current Age</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>{ageLabel}</div>
            </div>
          )}
          {/* Action buttons row — show when there's any data */}
          {(dob || Object.keys(seriesStates).length > 0) && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Reset button */}
              <button onClick={resetAll} style={{
                padding: "10px 16px",
                background: "transparent",
                color: "#999",
                border: "1px solid #d0d0d0",
                borderRadius: "8px",
                fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.color = "#c0392b"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d0d0"; e.currentTarget.style.color = "#999"; }}
              >
                Reset
              </button>
              {/* PDF button — only show when there's something to print */}
              {dobDate && result && (result.visits.length > 0 || result.complete.length > 0) && (
                <button onClick={generatePDF} disabled={pdfLoading} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 18px",
                  background: pdfLoading ? "#e8e8e8" : "linear-gradient(135deg, #1a1a2e 0%, #2d2b55 100%)",
                  color: pdfLoading ? "#999" : "#fff",
                  border: "none", borderRadius: "10px",
                  fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                  cursor: pdfLoading ? "not-allowed" : "pointer",
                  boxShadow: pdfLoading ? "none" : "0 4px 12px rgba(26,26,46,0.3)",
                  transition: "all 0.2s ease", whiteSpace: "nowrap",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {pdfLoading ? "Generating..." : "Download PDF"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!dobDate ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#bbb", fontSize: "15px" }}>
          Enter a date of birth above to begin
        </div>
      ) : (
        <>
          {/* Series cards — only age-appropriate ones */}
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>Vaccines received</h3>
          <p style={{ fontSize: "13px", color: "#888", margin: "0 0 16px" }}>
            Only vaccines due at this child's age are shown. Set doses to 0 if not yet started.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "10px", marginBottom: "32px" }}>
            {relevantSeries.map(series => {
              const given = seriesStates[series.id]?.dosesGiven ?? 0;
              const lastDate = seriesStates[series.id]?.lastDoseDate || "";
              const maxPills = getMaxForSeries(series);
              const t = TYPES[series.type];
              const isRotaCutoff = series.id === "Rota" && currentAgeWeeks > series.hardCutoffDose1Weeks;
              return (
                <div key={series.id} style={{
                  background: "#fff", borderRadius: "10px",
                  border: `1.5px solid ${t.color}22`,
                  borderLeft: `4px solid ${isRotaCutoff ? "#c0392b" : t.color}`,
                  padding: "14px 16px",
                  opacity: isRotaCutoff ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e", marginBottom: "2px" }}>{series.name}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>{series.brand} · {series.route}</div>
                    </div>
                    <TypeBadge type={series.type} />
                  </div>
                  {isRotaCutoff ? (
                    <div style={{ fontSize: "12px", color: "#c0392b", fontWeight: 600, background: "#fff0f0", padding: "6px 10px", borderRadius: "6px" }}>
                      Cannot start — child is too old (max 14w 6d)
                    </div>
                  ) : (
                    <>
                      <DosePills id={series.id} max={maxPills} />
                      {given > 0 && (
                        <div style={{ marginTop: "10px" }}>
                          <label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Date of last dose (optional)</label>
                          <input type="date" value={lastDate} onChange={e => setLastDate(series.id, e.target.value)}
                            max={today.toISOString().split("T")[0]}
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d0d0d0", fontSize: "13px", fontFamily: "inherit", background: "#FAFAF8", color: "#333", width: "100%", boxSizing: "border-box" }} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Results */}
          {result && (
            <>
              {/* Info box about catch-up rules */}
              <div style={{
                background: "#f0f9ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#0369a1",
                lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 700, marginBottom: "6px", fontSize: "13px" }}>ℹ️ Catch-up schedule rules</div>
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  <li>Maximum 4 injectable vaccines per visit — large catch-up schedules are split across multiple visits</li>
                  <li>Live vaccines (MMR, Varicella) must be given same day OR ≥4 weeks apart</li>
                  <li><strong>$</strong> = Not NIP-funded (private cost to patient)</li>
                  <li>Always verify immunisation history in AIR before administering</li>
                </ul>
              </div>
              
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  {result.warnings.map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "#fff8f0", border: "1px solid #f4d090", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
                      <div>
                        <strong style={{ fontSize: "13px", color: "#8B4513" }}>{w.name}:</strong>
                        <span style={{ fontSize: "13px", color: "#8B4513" }}> {w.msg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Visit timeline */}
              {result.visits.length === 0 && result.warnings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", background: "#f0faf4", borderRadius: "12px", border: "1px solid #b7e5c6", marginBottom: "16px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#0D6E3F" }}>Up to date for age</div>
                  <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>All age-appropriate vaccines are complete.</div>
                </div>
              ) : result.visits.length > 0 ? (
                <>
                  {(() => {
                    // Split visits into catch-up (accelerated) and routine (back on schedule)
                    const firstRoutineIndex = result.visits.findIndex(visit => 
                      visit.vaccines.every(v => v.isRoutineAge || v.newlyDue)
                    );
                    const catchupVisits = firstRoutineIndex > 0 ? result.visits.slice(0, firstRoutineIndex) : result.visits;
                    const routineVisits = firstRoutineIndex > 0 ? result.visits.slice(firstRoutineIndex) : [];
                    
                    return (
                      <>
                        {/* Catch-up visits section */}
                        {catchupVisits.length > 0 && (
                          <>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" }}>
                              Catch-up schedule — {catchupVisits.length} {catchupVisits.length === 1 ? "visit" : "visits"} needed
                            </h3>
                            <div style={{ position: "relative" }}>
                              <div style={{ position: "absolute", left: "19px", top: "28px", bottom: "28px", width: "2px", background: "#e0e4f0", zIndex: 0 }} />
                              {catchupVisits.map((visit, vi) => {
                      const isToday = visit.date.toISOString().slice(0,10) === today.toISOString().slice(0,10);
                      return (
                        <div key={vi} style={{ display: "flex", gap: "16px", marginBottom: "16px", position: "relative", zIndex: 1 }}>
                          <div style={{
                            width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                            background: isToday ? "#1a1a2e" : "#fff",
                            border: `2px solid ${isToday ? "#1a1a2e" : "#c0cce0"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: 700, color: isToday ? "#fff" : "#2d2b55",
                          }}>{vi + 1}</div>
                          <div style={{
                            flex: 1, background: "#fff", borderRadius: "10px",
                            border: `1px solid ${isToday ? "#2d2b55" : "#e8e8e8"}`,
                            borderTop: `3px solid ${isToday ? "#1a1a2e" : "#e0e4f0"}`,
                            padding: "14px 16px",
                            boxShadow: isToday ? "0 2px 12px rgba(26,26,46,0.08)" : "none",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                              <div>
                                <div style={{ fontSize: "16px", fontWeight: 700, color: isToday ? "#1a1a2e" : "#2d2b55" }}>
                                  {isToday ? "Today's visit" : formatVisitDate(visit.date)}
                                </div>
                                {!isToday && (
                                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                                    {visit.date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                                  </div>
                                )}
                              </div>
                              <span style={{ fontSize: "12px", color: "#888", background: "#f4f6fb", padding: "4px 10px", borderRadius: "12px", fontWeight: 600 }}>
                                {formatAgeAtVisit(dobDate, visit.date)}
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {visit.vaccines.map((vac, vi2) => {
                                const t = TYPES[vac.type];
                                return (
                                  <div key={vi2} style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "8px 12px", borderRadius: "7px",
                                    background: t.bg, border: `1px solid ${t.color}22`,
                                  }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>{vac.name}</span>
                                      <span style={{ fontSize: "12px", color: "#777", marginLeft: "8px" }}>Dose {vac.doseNum}/{vac.totalDoses}</span>
                                      {!vac.isFunded && (
                                        <span style={{ 
                                          fontSize: "11px", 
                                          fontWeight: 700, 
                                          color: "#dc2626", 
                                          marginLeft: "6px",
                                          padding: "2px 5px",
                                          background: "#fee2e2",
                                          borderRadius: "3px"
                                        }}>$</span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap" }}>{vac.brand} · {vac.route}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                          </>
                        )}
                        
                        {/* Back on schedule banner */}
                        {routineVisits.length > 0 && (
                          <div style={{
                            marginTop: catchupVisits.length > 0 ? "20px" : "0",
                            marginBottom: "16px",
                            padding: "10px 14px",
                            background: "#f0f9ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            fontSize: "13px",
                            color: "#0369a1",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}>
                            <span>ℹ️</span>
                            <span>Back on routine NIP schedule</span>
                          </div>
                        )}
                        
                        {/* Routine visits section */}
                        {routineVisits.length > 0 && (
                          <>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" }}>
                              Next routine {routineVisits.length === 1 ? "visit" : "visits"}
                            </h3>
                            <div style={{ position: "relative" }}>
                              <div style={{ position: "absolute", left: "19px", top: "28px", bottom: "28px", width: "2px", background: "#e0e4f0", zIndex: 0 }} />
                              {routineVisits.map((visit, vi) => {
                                const isToday = visit.date.toISOString().slice(0,10) === today.toISOString().slice(0,10);
                                const visitNum = catchupVisits.length + vi + 1; // Continue numbering from catchup visits
                                return (
                                  <div key={vi} style={{ display: "flex", gap: "16px", marginBottom: "16px", position: "relative", zIndex: 1 }}>
                                    <div style={{
                                      width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                                      background: isToday ? "#1a1a2e" : "#fff",
                                      border: `2px solid ${isToday ? "#1a1a2e" : "#c0cce0"}`,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: "13px", fontWeight: 700, color: isToday ? "#fff" : "#2d2b55",
                                    }}>{visitNum}</div>
                                    <div style={{
                                      flex: 1, background: "#fff", borderRadius: "10px",
                                      border: `1px solid ${isToday ? "#2d2b55" : "#e8e8e8"}`,
                                      borderTop: `3px solid ${isToday ? "#1a1a2e" : "#e0e4f0"}`,
                                      padding: "14px 16px",
                                      boxShadow: isToday ? "0 2px 12px rgba(26,26,46,0.08)" : "none",
                                    }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                                        <div>
                                          <div style={{ fontSize: "16px", fontWeight: 700, color: isToday ? "#1a1a2e" : "#2d2b55" }}>
                                            {isToday ? "Today's visit" : formatVisitDate(visit.date)}
                                          </div>
                                          {!isToday && (
                                            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                                              {visit.date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                                            </div>
                                          )}
                                        </div>
                                        <span style={{ fontSize: "12px", color: "#888", background: "#f4f6fb", padding: "4px 10px", borderRadius: "12px", fontWeight: 600 }}>
                                          {formatAgeAtVisit(dobDate, visit.date)}
                                        </span>
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {visit.vaccines.map((vac, vi2) => {
                                          const t = TYPES[vac.type];
                                          return (
                                            <div key={vi2} style={{
                                              display: "flex", alignItems: "center", gap: "10px",
                                              padding: "8px 12px", borderRadius: "7px",
                                              background: t.bg, border: `1px solid ${t.color}22`,
                                            }}>
                                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                                              <div style={{ flex: 1 }}>
                                                <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>{vac.name}</span>
                                                <span style={{ fontSize: "12px", color: "#777", marginLeft: "8px" }}>Dose {vac.doseNum}/{vac.totalDoses}</span>
                                                {!vac.isFunded && (
                                                  <span style={{ 
                                                    fontSize: "11px", 
                                                    fontWeight: 700, 
                                                    color: "#dc2626", 
                                                    marginLeft: "6px",
                                                    padding: "2px 5px",
                                                    background: "#fee2e2",
                                                    borderRadius: "3px"
                                                  }}>$</span>
                                                )}
                                              </div>
                                              <div style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap" }}>{vac.brand} · {vac.route}</div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : null}

              {/* Complete + not-yet-due disclosures */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
                {result.complete.length > 0 && (
                  <div>
                    <button onClick={() => setShowComplete(p => !p)} style={{
                      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                      fontSize: "13px", color: "#0D6E3F", fontWeight: 600, padding: "0", display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <span style={{ transform: showComplete ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s", fontSize: "10px" }}>▶</span>
                      ✓ {result.complete.length} series up to date
                    </button>
                    {showComplete && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", paddingLeft: "18px" }}>
                        {result.complete.map(s => (
                          <span key={s.id} style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "16px", background: "#f0faf4", color: "#0D6E3F", border: "1px solid #b7e5c6", fontWeight: 600 }}>
                            ✓ {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {result.notYetDue && result.notYetDue.length > 0 && (
                  <div>
                    <button onClick={() => setShowNotYetDue(p => !p)} style={{
                      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                      fontSize: "13px", color: "#888", fontWeight: 600, padding: "0", display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <span style={{ transform: showNotYetDue ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s", fontSize: "10px" }}>▶</span>
                      {result.notYetDue.length} series not yet due
                    </button>
                    {showNotYetDue && (
                      <div style={{ marginTop: "8px", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {result.notYetDue.map(s => {
                          const t = TYPES[s.type];
                          return (
                            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "8px", background: "#f8f8f8", border: "1px solid #eee" }}>
                              <div>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>{s.name}</span>
                                <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "8px" }}>{s.brand}</span>
                              </div>
                              <span style={{ fontSize: "11px", color: "#888", background: "#f0f0f0", padding: "3px 8px", borderRadius: "10px", fontWeight: 600, whiteSpace: "nowrap" }}>
                                Due from {s.ageLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p style={{ fontSize: "11px", color: "#bbb", marginTop: "24px", lineHeight: 1.6 }}>
                Minimum intervals shown — longer intervals are equally valid. Consult the Australian Immunisation Handbook for complex scenarios including immunocompromised patients.
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}

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
        {item.brand} · {item.route}
      </div>
      {item._comboSource && (
        <div style={{
          fontSize: "11px", color: "#8B6914", marginTop: "6px",
          background: "#FFF8E7", padding: "3px 8px", borderRadius: "4px",
          display: "inline-block"
        }}>
          🧬 Given as <strong>{item._comboSource}</strong> ({item._comboBrand})
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
        }}>✕</button>
        <div style={{ borderLeft: `4px solid ${t.color}`, paddingLeft: "14px", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", color: "#1a1a2e", fontFamily: "'DM Serif Display', Georgia, serif" }}>{item.vaccine}</h3>
          <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
            {item.age} · {item.brand} · {item.route}
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
          Source: Australian Immunisation Handbook · NIP Schedule {SCHEDULE_VERSION}
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

  // Gestational weeks 0–40
  const wkToX = (wk) => left + (wk / 40) * span;
  const ticks = [0, 8, 16, 20, 24, 28, 32, 36, 40];

  const vaccines = [
    { label: "Influenza", color: TYPES.routine.color, startWk: 0, endWk: 40, noteY: 60, note: "Any trimester", shortName: "Flu" },
    { label: "Pertussis (dTpa)", color: TYPES.routine.color, startWk: 20, endWk: 32, noteY: 100, note: "Ideally 20–32 wks", shortName: "dTpa", idealStart: 20, idealEnd: 32, extendEnd: 40 },
    { label: "RSV (Abrysvo)", color: TYPES.routine.color, startWk: 28, endWk: 36, noteY: 140, note: "28–36 wks (NIP-funded)", shortName: "RSV", idealStart: 28, idealEnd: 36, extendEnd: 40 },
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
                {details.diseases?.slice(0, 100)}{details.diseases?.length > 100 ? "…" : ""}
              </p>
            )}
            <div style={{ fontSize: "11px", color: t.color, marginTop: "8px", fontWeight: 600 }}>
              View details →
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
      a: "Three vaccines are recommended in every pregnancy: Pertussis (dTpa/Boostrix) at 20–32 weeks gestation to provide passive antibody protection to the newborn. Influenza vaccine at any trimester. RSV vaccine (Abrysvo) from 28 weeks gestation — NIP-funded from February 2025. Abrysvo provides passive RSV protection to the infant for approximately 6 months. Only Abrysvo is approved for pregnancy — Arexvy must NOT be used."
    },
    {
      q: "What about nirsevimab (Beyfortus) for RSV?",
      a: "Nirsevimab is a long-acting monoclonal antibody (not a vaccine) that protects infants against RSV. It is state/territory-funded — not on the NIP. It is given to eligible infants whose mothers did not receive Abrysvo, who were vaccinated less than 2 weeks before delivery, or who have medical risk factors for severe RSV. Seasonal programs typically run April–September but eligibility and timing vary by jurisdiction."
    },
    {
      q: "What about Meningococcal B (Bexsero) for non-Indigenous children?",
      a: "Bexsero is recommended by ATAGI for ALL infants under 2 years and ALL adolescents 15–19 years — but is not NIP-funded for non-Indigenous children. It is state-funded in SA, QLD, and NT. In Victoria and other states, parents need a private prescription (~$110–135 per dose). MenB is the most common serogroup causing invasive meningococcal disease in Australia."
    },
    {
      q: "Should my child have a second varicella dose?",
      a: "Yes — ATAGI recommends a 2nd dose of varicella vaccine for all children aged 12 months to under 14 years. However, the 2nd dose is NOT NIP-funded. A single dose (given as MMRV at 18 months) provides ~70% protection, while 2 doses give >90% protection and significantly reduce breakthrough varicella. The 2nd dose can be given ≥4 weeks after the first, using monovalent varicella vaccine (Varilrix)."
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
      a: "Yes — it has strict age limits. Dose 1 (Rotarix) must be given by 14 weeks of age, and dose 2 by 24 weeks of age. The series cannot be started or continued beyond these windows due to a small increased risk of intussusception with later doses."
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

// ----------------------------------------------
// Patient Schedule Calculator
// ----------------------------------------------

// ageSort → weeks since birth (childhood + adult)
const AGESORT_WEEKS = {
  0: 0,       // Birth
  0.5: 3,     // Nirsevimab seasonal
  1: 6,       // 6 weeks
  2: 16,      // 4 months
  3: 24,      // 6 months
  3.5: 26,    // Flu starts (6m–5y)
  4: 52,      // 12 months
  5: 72,      // 18 months
  5.5: 76,    // 18m+ (VZV 2nd dose)
  6: 192,     // 4 years
  7: 576,     // Year 7 (~12y)
  8: 720,     // Year 10 (~15y)
  8.5: 750,   // 15–19y MenB
  // 9 = pregnancy — handled separately
  9.5: 2600,  // ≥50y ATSI
  10: 3380,   // ≥65y
  11: 3640,   // ≥70y
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
  const [dob, setDob] = useState(() => {
    try {
      return sessionStorage.getItem("patient_dob") || "";
    } catch { return ""; }
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Persist dob to sessionStorage
  useEffect(() => {
    try {
      if (dob) sessionStorage.setItem("patient_dob", dob);
      else sessionStorage.removeItem("patient_dob");
    } catch {}
  }, [dob]);

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

  // -- PDF generation ----------------------------------------------------
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

      // -- helpers --
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

      // -- HEADER ------------------------------------------------------
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

      // -- PATIENT CARD -------------------------------------------------
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

      // -- SECTION RENDERER ----------------------------------------------
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

      // -- NEXT VACCINE DUE (beyond the 2-month window) ---------------------
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

      // -- FOOTER -------------------------------------------------------
      // Footer on last page
      const footerY = H - 25;
      setStroke("#E0E0E0");
      doc.setLineWidth(0.3);
      doc.line(ML, footerY - 2, W - MR, footerY - 2);

      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
      setTextColor("#c0392b");
      doc.text("Always verify immunisation history in AIR before administering.", ML, footerY + 2);

      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      setTextColor("#AAAAAA");
      doc.text(`Data source: Australian Immunisation Handbook & NIP Schedule (${SCHEDULE_VERSION})  \u00B7  nip.terrific.website`, ML, footerY + 7);

      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
      setTextColor("#CCCCCC");
      doc.text(`Schedule data: ${SCHEDULE_VERSION} \u00B7 Site version: ${SITE_VERSION}`, ML, footerY + 11);

      doc.setFont("helvetica", "italic"); doc.setFontSize(7);
      setTextColor("#BBBBBB");
      doc.text("Dr Marc Theilhaber \u00B7 Dept of Respiratory Medicine \u00B7 Monash Children's Hospital", ML, footerY + 15);

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
  // -- end PDF generation ------------------------------------------------

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
            {item.brand} · {item.route}
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
            title="Recently due — confirm in AIR" items={schedule.overdue} status="overdue"
            color="#c0392b" bg="#fff0f0" icon={"⚠️"}
          />
          <SectionBlock
            title="Due in next 2 months" items={schedule.upcoming} status="upcoming"
            color="#1D4ED8" bg="#eff6ff" icon={"📅"}
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
                {nextBeyond.brand} · {nextBeyond.route}
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
  const [openAgeGroups, setOpenAgeGroups] = useState(null); // null = all open; Set = explicit

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
            National Immunisation Program · January 2026
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
        {navBtn("catchup", "Catch-up Calculator")}
        {navBtn("reference", "Vaccine Reference")}
        {navBtn("faq", "FAQ")}
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Schedule by Age */}
        {activeSection === "schedule" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Schedule by Age</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Overview of all childhood vaccines. Tap any card below for full details.</p>

            {/* Filter dropdowns */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#888", fontWeight: 600, marginBottom: "8px" }}>
                Filter by:
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={selectStyle}>
                  {Object.entries(STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} style={selectStyle}>
                  <option>All ages</option>
                  {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
                  <option value="all">All types</option>
                  {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
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
                <span style={{ fontWeight: 600 }}>ℹ️ Filters active:</span>
                <span>
                  {stateFilter !== "ALL" && `Showing funding for ${STATES[stateFilter]} • `}
                  {ageFilter !== "All ages" && `Age: ${ageFilter} • `}
                  {typeFilter !== "all" && `Type: ${TYPES[typeFilter].label} • `}
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

            {/* Multivalent vaccine legend — only in components view */}
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

            {grouped.map(([age, items]) => {
              const isOpen = openAgeGroups === null || openAgeGroups.has(age);
              const toggle = () => {
                setOpenAgeGroups(prev => {
                  const base = prev === null ? new Set(grouped.map(([a]) => a)) : new Set(prev);
                  if (base.has(age)) base.delete(age); else base.add(age);
                  return base;
                });
              };
              return (
                <div key={age} style={{ marginBottom: "12px" }}>
                  <button onClick={toggle} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "0 0 8px", marginBottom: isOpen ? "10px" : "0",
                    borderBottom: `2px solid ${isOpen ? "#2d2b55" : "#e0e0e0"}`,
                    width: "100%", textAlign: "left", fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" style={{
                      flexShrink: 0,
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "#2d2b55",
                    }}>
                      <polyline points="3,2 9,6 3,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontSize: "16px", fontWeight: 700, color: "#1a1a2e",
                    }}>{age}</span>
                    <span style={{
                      marginLeft: "auto",
                      fontSize: "11px", fontWeight: 700,
                      padding: "2px 8px", borderRadius: "12px",
                      background: isOpen ? "#1a1a2e" : "#e8e8e8",
                      color: isOpen ? "#fff" : "#888",
                      transition: "all 0.2s",
                    }}>{items.length}</span>
                  </button>
                  {isOpen && items.map((item, i) => (
                    <VaccineCard key={i} item={item} onClick={setSelectedItem} selectedState={stateFilter} />
                  ))}
                </div>
              );
            })}
          </section>
        )}

        {/* Reference */}
        {activeSection === "reference" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Vaccine Reference Cards</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Everything about each vaccine in one place — schedule, notes and contraindications.</p>
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

        {/* Catch-up Calculator */}
        {activeSection === "catchup" && (
          <CatchupSection stateFilter={stateFilter} setStateFilter={setStateFilter} />
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
          </a>{" "}({SCHEDULE_VERSION}).
        </p>
        <p style={{ margin: "0 0 8px" }}>Built to support, not replace, clinical judgment. For informational purposes only.</p>
        <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#aaa" }}>
          Schedule data: {SCHEDULE_VERSION} · Site version: {SITE_VERSION}
        </p>
        <p style={{ margin: 0, borderTop: "1px solid #eee", paddingTop: "10px", fontWeight: 600, color: "#777", lineHeight: 1.8 }}>
          Dr Marc Theilhaber<br />
          Dept of Respiratory Medicine · Monash Children's Hospital
        </p>
      </footer>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
