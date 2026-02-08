import { useState, useMemo, useEffect, useRef } from "react";

const SCHEDULE_DATA = [
  // Birth
  { vaccine: "Hepatitis B", shortName: "HepB", age: "Birth", ageSort: 0, type: "routine", brand: "Engerix B / HB Vax II", route: "IM", notes: "Give within 24 hours of birth (must be within 7 days). No catch-up required if missed." },
  // 6 weeks
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "6 weeks", ageSort: 1, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Diphtheria, tetanus, pertussis, hepatitis B, polio, Haemophilus influenzae type b." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "6 weeks", ageSort: 1, type: "routine", brand: "Prevenar 20", route: "IM", notes: "From Sep 2025, Prevenar 20 replaces Prevenar 13 for all children <18 years." },
  { vaccine: "Rotavirus", shortName: "Rota", age: "6 weeks", ageSort: 1, type: "routine", brand: "Rotarix", route: "Oral", notes: "Dose 1 must be given by 14 weeks of age. Cannot be given after this window." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "6 weeks", ageSort: 1, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander infants. Prophylactic paracetamol recommended." },
  // 4 months
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "4 months", ageSort: 2, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Second dose of the hexavalent combination vaccine." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "4 months", ageSort: 2, type: "routine", brand: "Prevenar 20", route: "IM", notes: "Second dose of pneumococcal conjugate vaccine." },
  { vaccine: "Rotavirus", shortName: "Rota", age: "4 months", ageSort: 2, type: "routine", brand: "Rotarix", route: "Oral", notes: "Dose 2 must be given by 24 weeks of age. Series cannot be started or continued after age limits." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "4 months", ageSort: 2, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander infants. Prophylactic paracetamol recommended." },
  // 6 months
  { vaccine: "DTPa-HepB-IPV-Hib", shortName: "6-in-1", age: "6 months", ageSort: 3, type: "routine", brand: "Infanrix hexa / Vaxelis", route: "IM", notes: "Third dose of the hexavalent combination vaccine." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "6 months", ageSort: 3, type: "at-risk", brand: "Prevenar 20", route: "IM", notes: "Additional dose for Aboriginal & Torres Strait Islander children and children with specified medical risk conditions." },
  { vaccine: "Influenza", shortName: "Flu", age: "6 months–5 years", ageSort: 3.5, type: "routine", brand: "Various", route: "IM", notes: "Annual vaccination. First year: 2 doses ≥4 weeks apart for children <9 years. One dose annually thereafter." },
  // 12 months
  { vaccine: "Meningococcal ACWY", shortName: "MenACWY", age: "12 months", ageSort: 4, type: "routine", brand: "Nimenrix / MenQuadfi", route: "IM", notes: "Single dose at 12 months. Protects against serogroups A, C, W and Y." },
  { vaccine: "MMR", shortName: "MMR", age: "12 months", ageSort: 4, type: "routine", brand: "M-M-R II / Priorix", route: "SC", notes: "Measles, mumps and rubella. First dose." },
  { vaccine: "Pneumococcal (20vPCV)", shortName: "PCV20", age: "12 months", ageSort: 4, type: "routine", brand: "Prevenar 20", route: "IM", notes: "Booster dose (3rd routine dose). From Sep 2025, all Aboriginal & Torres Strait Islander children in all states/territories receive 4-dose schedule." },
  { vaccine: "Meningococcal B", shortName: "MenB", age: "12 months", ageSort: 4, type: "indigenous", brand: "Bexsero", route: "IM", notes: "Aboriginal and Torres Strait Islander children. Catch-up available for ATSI children <2 years." },
  // 18 months
  { vaccine: "Hib", shortName: "Hib", age: "18 months", ageSort: 5, type: "routine", brand: "ActHIB", route: "IM", notes: "Haemophilus influenzae type b booster dose." },
  { vaccine: "DTPa", shortName: "DTPa", age: "18 months", ageSort: 5, type: "routine", brand: "Infanrix / Tripacel", route: "IM", notes: "Diphtheria, tetanus, acellular pertussis booster." },
  { vaccine: "MMRV", shortName: "MMRV", age: "18 months", ageSort: 5, type: "routine", brand: "Priorix-Tetra / ProQuad", route: "SC", notes: "Measles, mumps, rubella and varicella (chickenpox). Second MMR dose + first varicella dose." },
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
  // Pregnancy
  { vaccine: "Influenza", shortName: "Flu", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Various", route: "IM", notes: "Recommended during each pregnancy, any trimester." },
  { vaccine: "Pertussis (dTpa)", shortName: "dTpa", age: "Pregnancy", ageSort: 9, type: "routine", brand: "Boostrix", route: "IM", notes: "Recommended each pregnancy, ideally 28–32 weeks but can be given up until delivery. Provides passive antibody protection to newborn." },
  // Older adults
  { vaccine: "Influenza", shortName: "Flu", age: "≥65 years", ageSort: 10, type: "routine", brand: "Various (enhanced)", route: "IM", notes: "Annual vaccination. Enhanced or adjuvanted formulations recommended." },
  { vaccine: "Shingles (Herpes Zoster)", shortName: "Zoster", age: "≥65 years", ageSort: 10, type: "routine", brand: "Shingrix", route: "IM", notes: "Non-Indigenous adults. 2 doses, 2–6 months apart. If previously had Zostavax via NIP, wait 5 years." },
  { vaccine: "Shingles (Herpes Zoster)", shortName: "Zoster", age: "≥50 years (ATSI)", ageSort: 9.5, type: "indigenous", brand: "Shingrix", route: "IM", notes: "Aboriginal and Torres Strait Islander adults ≥50 years. 2 doses, 2–6 months apart." },
  { vaccine: "Pneumococcal (13vPCV)", shortName: "PCV13", age: "≥70 years", ageSort: 11, type: "routine", brand: "Prevenar 13", route: "IM", notes: "Non-Indigenous adults. Adult program still uses 13vPCV (20vPCV not yet NIP-funded for adults). Followed by 23vPPV." },
  { vaccine: "Pneumococcal", shortName: "PCV", age: "≥50 years (ATSI)", ageSort: 9.5, type: "indigenous", brand: "Prevenar 13 + Pneumovax 23", route: "IM", notes: "Aboriginal and Torres Strait Islander adults. 13vPCV then 23vPPV 12 months later." },
];

const AGE_GROUPS = [
  "Birth", "6 weeks", "4 months", "6 months", "6 months–5 years",
  "12 months", "18 months", "4 years",
  "Year 7 (12–13 yrs)", "Year 10 (15–16 yrs)",
  "Pregnancy",
  "≥50 years (ATSI)", "≥65 years", "≥70 years"
];

const TYPES = {
  routine: { label: "NIP Routine", color: "#0D6E3F", bg: "#E8F5EE" },
  indigenous: { label: "Aboriginal & TSI", color: "#9B4D13", bg: "#FEF0E4" },
  "at-risk": { label: "At-Risk / Medical", color: "#1D4ED8", bg: "#E6EFFF" },
};

const TIMELINE_VACCINES = [
  "HepB", "6-in-1", "PCV20", "Rota", "MenB", "Flu", "MenACWY", "MMR", "Hib", "DTPa", "MMRV", "HepA", "DTPa-IPV", "HPV", "dTpa"
];

const TIMELINE_AGES = [
  { label: "Birth", x: 0 },
  { label: "6w", x: 6 },
  { label: "4m", x: 16 },
  { label: "6m", x: 24 },
  { label: "12m", x: 48 },
  { label: "18m", x: 72 },
  { label: "4y", x: 192 },
  { label: "Yr7", x: 576 },
  { label: "Yr10", x: 720 },
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
    schedule: "2 doses: 6w and 4m. Strict age limits — dose 1 by 14 weeks, dose 2 by 24 weeks"
  },
  "Meningococcal B": {
    diseases: "Invasive meningococcal disease (serogroup B) — meningitis, septicaemia",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "ATSI: 6w, 4m, 12m. Prophylactic paracetamol recommended with each dose in children <2 years."
  },
  "Meningococcal ACWY": {
    diseases: "Invasive meningococcal disease (serogroups A, C, W, Y)",
    contraindications: "Anaphylaxis to previous dose or component",
    schedule: "12 months (routine) + Year 10 school program. Additional doses for at-risk groups."
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
    schedule: "Each pregnancy, ideally 28–32 weeks gestation. Can be given up to delivery."
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

function VaccineCard({ item, onClick }) {
  const t = TYPES[item.type];
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
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 2px 12px ${t.color}18`; e.currentTarget.style.borderColor = `${t.color}44`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${t.color}22`; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a2e" }}>{item.vaccine}</span>
        <TypeBadge type={item.type} />
      </div>
      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
        {item.brand} · {item.route}
      </div>
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
        </div>
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #eee", fontSize: "11px", color: "#999" }}>
          Source: Australian Immunisation Handbook · NIP Schedule Jan 2026
        </div>
      </div>
    </div>
  );
}

function Timeline() {
  const scrollRef = useRef(null);
  const vaccines = TIMELINE_VACCINES;
  const W = 900;
  const H = vaccines.length * 32 + 50;
  const left = 90;
  const right = W - 30;
  const maxWeeks = 780;
  const xScale = (w) => left + (w / maxWeeks) * (right - left);

  const getDotsForVaccine = (shortName) => {
    return SCHEDULE_DATA
      .filter(d => d.shortName === shortName && d.ageSort <= 8)
      .map(d => {
        const weekMap = { 0: 0, 1: 6, 2: 16, 3: 24, 3.5: 26, 4: 48, 5: 72, 6: 192, 7: 576, 8: 720 };
        return { x: weekMap[d.ageSort] || 0, type: d.type };
      });
  };

  return (
    <div ref={scrollRef} style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: "800px", width: "100%", height: "auto" }}>
        {/* Age axis */}
        {TIMELINE_AGES.map((a, i) => (
          <g key={i}>
            <line x1={xScale(a.x)} y1={30} x2={xScale(a.x)} y2={H - 10} stroke="#e0e0e0" strokeWidth={1} />
            <text x={xScale(a.x)} y={20} textAnchor="middle" fontSize="11" fill="#888" fontFamily="system-ui">{a.label}</text>
          </g>
        ))}
        {/* Vaccine rows */}
        {vaccines.map((v, i) => {
          const y = 50 + i * 32;
          const dots = getDotsForVaccine(v);
          return (
            <g key={v}>
              <text x={left - 8} y={y + 5} textAnchor="end" fontSize="11" fill="#444" fontFamily="system-ui" fontWeight="500">{v}</text>
              <line x1={left} y1={y} x2={right} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              {dots.map((d, j) => (
                <circle key={j} cx={xScale(d.x)} cy={y} r={5.5}
                  fill={TYPES[d.type].color} opacity={0.85} />
              ))}
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
      a: "The NIP provides free vaccines from birth through adolescence. Key vaccines include: Hepatitis B (birth), hexavalent DTPa-HepB-IPV-Hib (6w, 4m, 6m), Pneumococcal PCV20 (6w, 4m, 12m), Rotavirus (6w, 4m), MMR (12m), MMRV (18m), and boosters at 4 years. School programs provide HPV and dTpa in Year 7, and MenACWY in Year 10."
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
      a: "Pertussis (dTpa/Boostrix) is recommended each pregnancy at 28–32 weeks gestation (can be given up to delivery) to provide passive antibody protection to the newborn. Influenza vaccine is recommended each pregnancy at any trimester. COVID-19 vaccination is also recommended."
    },
    {
      q: "What if my child missed a vaccine dose?",
      a: "Vaccine series never need to be restarted, regardless of how long ago the last dose was given. The National Immunisation Catch-up Calculator (NICC) at immunisationhandbook.health.gov.au can generate a personalised catch-up plan. Free NIP catch-up is available for people under 20, and HPV up to age 25."
    },
    {
      q: "Do vaccine schedules vary between states and territories?",
      a: "There can be slight variations. For example, some states fund additional vaccines beyond the NIP (e.g., Queensland funds MenB for all infants). BCG availability varies between jurisdictions. Always check your local state/territory immunisation schedule."
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

export default function AustralianNIPSchedule() {
  const [ageFilter, setAgeFilter] = useState("All ages");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("schedule");
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = useMemo(() => {
    return SCHEDULE_DATA.filter(d => {
      if (ageFilter !== "All ages" && d.age !== ageFilter) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      return true;
    });
  }, [ageFilter, typeFilter]);

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
        background: "linear-gradient(135deg, #0D3B2E 0%, #1a5c47 50%, #0D3B2E 100%)",
        color: "#fff", padding: "48px 24px 40px", textAlign: "center",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)",
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
            A clearer way to see NIP-funded vaccines from birth through adulthood, including Aboriginal and Torres Strait Islander programs.
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
        {navBtn("timeline", "Visual Timeline")}
        {navBtn("reference", "Vaccine Reference")}
        {navBtn("faq", "FAQ")}
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Schedule by Age */}
        {activeSection === "schedule" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Schedule by Age</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Filter by age group or recommendation type. Tap any vaccine for full details.</p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
              <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} style={selectStyle}>
                <option>All ages</option>
                {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
              </select>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
                <option value="all">All types</option>
                {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {grouped.length === 0 && (
              <p style={{ color: "#999", fontSize: "14px", padding: "32px 0", textAlign: "center" }}>No vaccines match your current filters.</p>
            )}

            {grouped.map(([age, items]) => (
              <div key={age} style={{ marginBottom: "28px" }}>
                <h3 style={{
                  fontSize: "16px", fontWeight: 700, color: "#1a1a2e",
                  margin: "0 0 10px", padding: "0 0 8px",
                  borderBottom: "2px solid #0D3B2E", display: "inline-block"
                }}>{age}</h3>
                {items.map((item, i) => (
                  <VaccineCard key={i} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            ))}
          </section>
        )}

        {/* Timeline */}
        {activeSection === "timeline" && (
          <section>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, margin: "0 0 6px" }}>Visual Timeline</h2>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 20px" }}>Each row is a vaccine. Dots mark individual doses across the age axis.</p>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8", padding: "16px", overflow: "hidden" }}>
              <Timeline />
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
              {Object.entries(TYPES).map(([key, val]) => (
                <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#666" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: val.color, display: "inline-block" }} />
                  {val.label}
                </span>
              ))}
            </div>
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
        <p style={{ margin: 0 }}>Built to support, not replace, clinical judgment. For informational purposes only.</p>
      </footer>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
