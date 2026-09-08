/* =========================================================
   OFFICIAL PORTAL — CENTRALIZED MOCK DATA
   All demo data for the Official Government Portal lives
   here so pages stay presentation-only.

   Location-specific data (alerts, districts/villages, shelters,
   preparedness, incidents) is DERIVED from the single shared
   dataset in src/data/locationData.js — the same five Kerala /
   Wayanad prototype villages (Mundakkai, Chooralmala, Meppadi,
   Vythiri, Kalpetta) used by the Citizen Portal. This keeps the
   Official Portal from maintaining its own separate location
   list, and means it stays in sync automatically if the shared
   dataset is later swapped for a real backend/location API.
   ========================================================= */

import {
  wayanadLocations,
  riskZones,
  getAllShelters,
  WAYANAD_STATE,
  WAYANAD_DISTRICT,
} from "../../data/locationData.js";

export const VILLAGE_NAME_HI = {
  Mundakkai: "मुंडक्कई",
  Chooralmala: "चूरलमाला",
  Meppadi: "मेप्पाडी",
  Vythiri: "वൈथिरी",
  Kalpetta: "कल्पेट्टा",
};

const VILLAGE_POPULATION = {
  Mundakkai: "1,750",
  Chooralmala: "3,200",
  Meppadi: "9,400",
  Vythiri: "6,100",
  Kalpetta: "34,700",
};

function riverLevelForRisk(risk) {
  if (risk === "High") return "Rising rapidly";
  if (risk === "Moderate") return "Rising";
  return "Steady";
}

function alertStatusForRisk(risk) {
  if (risk === "High") return "Active";
  if (risk === "Moderate") return "Active";
  return "Monitoring";
}

export const systemStatus = {
  overall: { key: "operational", en: "All systems operational", hi: "सभी प्रणालियाँ चालू हैं" },
  items: [
    { id: "rainfall", labelEn: "Rainfall Monitoring", labelHi: "वर्षा निगरानी", status: "normal" },
    { id: "river", labelEn: "River Level Monitoring", labelHi: "नदी जल स्तर निगरानी", status: "warning" },
    { id: "sensors", labelEn: "Sensor Network", labelHi: "सेंसर नेटवर्क", status: "normal" },
    { id: "comms", labelEn: "Communication Network", labelHi: "संचार नेटवर्क", status: "normal" },
  ],
};

const highRiskCount = riskZones.filter((z) => z.risk === "High").length;
const totalShelterCount = getAllShelters().length;

export const dashboardStats = [
  { id: "activeAlerts", value: String(riskZones.length).padStart(2, "0"), deltaEn: "Across 5 villages", deltaHi: "5 गाँवों में", tone: "info" },
  { id: "criticalAlerts", value: String(highRiskCount).padStart(2, "0"), deltaEn: "Require close monitoring", deltaHi: "बारीकी से निगरानी आवश्यक", tone: "critical" },
  { id: "districts", value: "1", deltaEn: "Wayanad, Kerala", deltaHi: "वायनाड, केरल", tone: "neutral" },
  { id: "shelters", value: String(totalShelterCount), deltaEn: "All operational", deltaHi: "सभी चालू", tone: "safe" },
  { id: "peopleAtRisk", value: "12.4K", deltaEn: "Under monitoring", deltaHi: "निगरानी में", tone: "warning" },
  { id: "responseTeams", value: "6", deltaEn: "Currently deployed", deltaHi: "वर्तमान में तैनात", tone: "neutral" },
];

// =========================================================
// ALERTS — one per prototype village, derived from riskZones
// =========================================================
const ALERT_TIMES = ["14:02", "13:47", "13:21", "12:58", "12:30"];

export const alerts = riskZones.map((zone, index) => {
  const loc = wayanadLocations.find((l) => l.name === zone.name);
  return {
    id: `FFEW-2609${index + 1}`,
    locationEn: `${WAYANAD_STATE} · ${zone.name}`,
    locationHi: `केरल · ${VILLAGE_NAME_HI[zone.name] || zone.name}`,
    severity: zone.risk === "High" ? "Critical" : zone.risk === "Moderate" ? "High" : "Moderate",
    issued: ALERT_TIMES[index] || "10:00",
    status: alertStatusForRisk(zone.risk),
    district: WAYANAD_DISTRICT,
    state: WAYANAD_STATE,
    type: zone.type === "Landslide" ? "Landslide Warning" : "Flash Flood Warning",
    rainfall: `${loc.peak_rainfall_mm} mm`,
    waterLevel: riverLevelForRisk(zone.risk),
  };
});

// =========================================================
// DISTRICTS (village list consumed by the Risk Map)
// =========================================================
export const districts = riskZones.map((zone, index) => ({
  id: index + 1,
  nameEn: zone.name,
  nameHi: VILLAGE_NAME_HI[zone.name] || zone.name,
  state: WAYANAD_STATE,
  risk: zone.risk === "Advisory" ? "Low" : zone.risk,
  rainfall: zone.rainfall,
  riverLevel: riverLevelForRisk(zone.risk),
  population: VILLAGE_POPULATION[zone.name] || "—",
  lat: zone.lat,
  lng: zone.lng,
}));

// =========================================================
// SHELTERS — from the shared shelterData (one per village)
// =========================================================
export const shelters = getAllShelters().map((s, index) => ({
  id: `SH-104${index + 1}`,
  nameEn: s.name,
  nameHi: s.name,
  district: WAYANAD_DISTRICT,
  state: WAYANAD_STATE,
  capacity: s.capacity,
  occupancy: s.capacity - s.available,
  status: s.status === "Limited" ? "At Capacity" : "Operational",
  facilities: s.facilities,
  contact: s.phone,
}));

// =========================================================
// PREPAREDNESS
// =========================================================
export const preparedness = {
  overallScore: 78,
  categories: [
    { id: "response", labelEn: "Response Readiness", labelHi: "प्रतिक्रिया तत्परता", score: 82 },
    { id: "supplies", labelEn: "Emergency Supplies", labelHi: "आपातकालीन आपूर्ति", score: 74 },
    { id: "comms", labelEn: "Communication Readiness", labelHi: "संचार तत्परता", score: 88 },
    { id: "evacuation", labelEn: "Evacuation Preparedness", labelHi: "निकासी तैयारी", score: 69 },
    { id: "training", labelEn: "Training Status", labelHi: "प्रशिक्षण स्थिति", score: 75 },
  ],
  districts: riskZones.map((zone, index) => ({
    id: index + 1,
    nameEn: zone.name,
    nameHi: VILLAGE_NAME_HI[zone.name] || zone.name,
    score: zone.risk === "High" ? 58 : zone.risk === "Moderate" ? 69 : 84,
    trend: zone.risk === "High" ? "down" : zone.risk === "Moderate" ? "steady" : "up",
  })),
};

// =========================================================
// INCIDENTS — one per prototype village
// =========================================================
const INCIDENT_TEMPLATES = [
  {
    titleEn: "Landslide risk near residential zone",
    titleHi: "आवासीय क्षेत्र के पास भूस्खलन जोखिम",
    team: "NDRF Wayanad Unit",
    timeline: [
      { time: "13:40", en: "Slope movement reported by field sensor", hi: "फील्ड सेंसर द्वारा भूस्खलन की सूचना" },
      { time: "13:48", en: "Response team dispatched", hi: "प्रतिक्रिया दल रवाना" },
    ],
  },
  {
    titleEn: "Heavy rainfall triggers evacuation advisory",
    titleHi: "भारी वर्षा से निकासी परामर्श",
    team: "SDRF Chooralmala",
    timeline: [
      { time: "11:10", en: "Rainfall crosses advisory threshold", hi: "वर्षा परामर्श सीमा से अधिक" },
      { time: "11:25", en: "Local evacuation advisory issued", hi: "स्थानीय निकासी परामर्श जारी" },
    ],
  },
  {
    titleEn: "River level rising near settlement",
    titleHi: "बस्ती के पास नदी का जलस्तर बढ़ रहा",
    team: "District Admin, Meppadi",
    timeline: [
      { time: "12:55", en: "River gauge reports steady rise", hi: "नदी गेज में लगातार वृद्धि" },
      { time: "13:10", en: "Monitoring team stationed on site", hi: "निगरानी दल स्थल पर तैनात" },
    ],
  },
  {
    titleEn: "Slope monitoring sensor outage",
    titleHi: "ढलान निगरानी सेंसर बाधित",
    team: "BSNL Field Unit, Vythiri",
    timeline: [
      { time: "09:15", en: "Sensor lost connectivity", hi: "सेंसर का संपर्क टूटा" },
      { time: "10:40", en: "Backup sensor brought online", hi: "बैकअप सेंसर सक्रिय" },
    ],
  },
  {
    titleEn: "Shelter readiness check",
    titleHi: "आश्रय तत्परता जांच",
    team: "Relief Operations, Kalpetta",
    timeline: [
      { time: "08:20", en: "Routine shelter inspection completed", hi: "नियमित आश्रय निरीक्षण पूरा" },
      { time: "08:45", en: "Supplies restocked", hi: "आपूर्ति पुनः भरी गई" },
    ],
  },
];

export const incidents = riskZones.map((zone, index) => {
  const template = INCIDENT_TEMPLATES[index] || INCIDENT_TEMPLATES[0];
  return {
    id: `INC-339${index + 1}`,
    titleEn: template.titleEn,
    titleHi: template.titleHi,
    location: `${zone.name}, Wayanad, Kerala`,
    severity: zone.risk === "High" ? "Critical" : zone.risk === "Moderate" ? "High" : "Moderate",
    status: zone.risk === "High" ? "In Progress" : zone.risk === "Moderate" ? "Monitoring" : "Resolved",
    team: template.team,
    updated: ALERT_TIMES[index] ? `${ALERT_TIMES[index]}` : "recently",
    timeline: template.timeline,
  };
});

// =========================================================
// OFFICIALS — portal user accounts (not location-scoped data;
// left as representative demo accounts)
// =========================================================
export const officials = [
  { id: "OFF-001", name: "Rajesh Kumar", role: "District Magistrate", department: "Disaster Management", location: "Kalpetta, Wayanad, Kerala", status: "Active", lastActive: "2 min ago", access: "Administrator" },
  { id: "OFF-002", name: "Priya Sharma", role: "Emergency Response Officer", department: "NDRF Coordination", location: "Chooralmala, Wayanad, Kerala", status: "Active", lastActive: "10 min ago", access: "Editor" },
  { id: "OFF-003", name: "Anil Menon", role: "Field Sensor Analyst", department: "Monitoring & Sensors", location: "Mundakkai, Wayanad, Kerala", status: "Active", lastActive: "1 hr ago", access: "Viewer" },
  { id: "OFF-004", name: "Sunita Devi", role: "Shelter Coordinator", department: "Relief Operations", location: "Meppadi, Wayanad, Kerala", status: "Inactive", lastActive: "2 days ago", access: "Editor" },
  { id: "OFF-005", name: "Vikram Singh", role: "Communications Officer", department: "Public Information", location: "Vythiri, Wayanad, Kerala", status: "Active", lastActive: "35 min ago", access: "Editor" },
  { id: "OFF-006", name: "Meera Nair", role: "Regional Coordinator", department: "Disaster Management", location: "Kalpetta, Wayanad, Kerala", status: "Active", lastActive: "18 min ago", access: "Administrator" },
];

export const reports = [
  { id: "RPT-001", nameEn: "Daily Alert Report", nameHi: "दैनिक अलर्ट रिपोर्ट", frequency: "Daily", lastGenerated: "Today, 06:00" },
  { id: "RPT-002", nameEn: "Village Risk Report", nameHi: "गाँव जोखिम रिपोर्ट", frequency: "Weekly", lastGenerated: "2 days ago" },
  { id: "RPT-003", nameEn: "Shelter Status Report", nameHi: "आश्रय स्थिति रिपोर्ट", frequency: "Daily", lastGenerated: "Today, 08:30" },
  { id: "RPT-004", nameEn: "Response Operations Report", nameHi: "प्रतिक्रिया संचालन रिपोर्ट", frequency: "Weekly", lastGenerated: "5 days ago" },
  { id: "RPT-005", nameEn: "Preparedness Assessment Report", nameHi: "तैयारी आकलन रिपोर्ट", frequency: "Monthly", lastGenerated: "3 weeks ago" },
];
