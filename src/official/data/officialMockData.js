/* =========================================================
   OFFICIAL PORTAL — CENTRALIZED MOCK DATA
   All demo data for the Official Government Portal lives
   here so pages stay presentation-only.
   ========================================================= */

export const systemStatus = {
  overall: { key: "operational", en: "All systems operational", hi: "सभी प्रणालियाँ चालू हैं" },
  items: [
    { id: "rainfall", labelEn: "Rainfall Monitoring", labelHi: "वर्षा निगरानी", status: "normal" },
    { id: "river", labelEn: "River Level Monitoring", labelHi: "नदी जल स्तर निगरानी", status: "warning" },
    { id: "sensors", labelEn: "Sensor Network", labelHi: "सेंसर नेटवर्क", status: "normal" },
    { id: "comms", labelEn: "Communication Network", labelHi: "संचार नेटवर्क", status: "normal" },
  ],
};

export const dashboardStats = [
  { id: "activeAlerts", value: "27", deltaEn: "+4 today", deltaHi: "+4 आज", tone: "info" },
  { id: "criticalAlerts", value: "06", deltaEn: "2 require action", deltaHi: "2 पर कार्रवाई आवश्यक", tone: "critical" },
  { id: "districts", value: "184", deltaEn: "Across 14 states", deltaHi: "14 राज्यों में", tone: "neutral" },
  { id: "shelters", value: "1,248", deltaEn: "92% operational", deltaHi: "92% चालू", tone: "safe" },
  { id: "peopleAtRisk", value: "48.6K", deltaEn: "Under monitoring", deltaHi: "निगरानी में", tone: "warning" },
  { id: "responseTeams", value: "86", deltaEn: "Currently deployed", deltaHi: "वर्तमान में तैनात", tone: "neutral" },
];

export const alerts = [
  { id: "FFEW-26091", locationEn: "Assam · Dibrugarh", locationHi: "असम · डिब्रूगढ़", severity: "Critical", issued: "14:02", status: "Active", district: "Dibrugarh", state: "Assam", type: "Flash Flood Warning", rainfall: "112 mm", waterLevel: "Rising" },
  { id: "FFEW-26090", locationEn: "Bihar · Darbhanga", locationHi: "बिहार · दरभंगा", severity: "High", issued: "13:47", status: "Active", district: "Darbhanga", state: "Bihar", type: "River Overflow Alert", rainfall: "84 mm", waterLevel: "Rising" },
  { id: "FFEW-26089", locationEn: "West Bengal · Jalpaiguri", locationHi: "पश्चिम बंगाल · जलपाईगुड़ी", severity: "High", issued: "13:21", status: "Monitoring", district: "Jalpaiguri", state: "West Bengal", type: "Flash Flood Watch", rainfall: "76 mm", waterLevel: "Steady" },
  { id: "FFEW-26088", locationEn: "Uttarakhand · Haridwar", locationHi: "उत्तराखंड · हरिद्वार", severity: "Moderate", issued: "12:58", status: "Monitoring", district: "Haridwar", state: "Uttarakhand", type: "Landslide Advisory", rainfall: "41 mm", waterLevel: "Steady" },
  { id: "FFEW-26087", locationEn: "Kerala · Wayanad", locationHi: "केरल · वायनाड", severity: "Critical", issued: "12:30", status: "Active", district: "Wayanad", state: "Kerala", type: "Flash Flood Warning", rainfall: "138 mm", waterLevel: "Rising rapidly" },
  { id: "FFEW-26086", locationEn: "Assam · Barpeta", locationHi: "असम · बारपेटा", severity: "Moderate", issued: "11:52", status: "Resolved", district: "Barpeta", state: "Assam", type: "River Overflow Alert", rainfall: "38 mm", waterLevel: "Receding" },
  { id: "FFEW-26085", locationEn: "Himachal Pradesh · Kullu", locationHi: "हिमाचल प्रदेश · कुल्लू", severity: "High", issued: "11:10", status: "Active", district: "Kullu", state: "Himachal Pradesh", type: "Cloudburst Alert", rainfall: "97 mm", waterLevel: "Rising" },
  { id: "FFEW-26084", locationEn: "Odisha · Mayurbhanj", locationHi: "ओडिशा · मयूरभंज", severity: "Low", issued: "10:44", status: "Monitoring", district: "Mayurbhanj", state: "Odisha", type: "Rainfall Advisory", rainfall: "22 mm", waterLevel: "Normal" },
  { id: "FFEW-26083", locationEn: "Bihar · Supaul", locationHi: "बिहार · सुपौल", severity: "Critical", issued: "10:05", status: "Active", district: "Supaul", state: "Bihar", type: "Flash Flood Warning", rainfall: "126 mm", waterLevel: "Rising rapidly" },
  { id: "FFEW-26082", locationEn: "Assam · Lakhimpur", locationHi: "असम · लखीमपुर", severity: "Moderate", issued: "09:38", status: "Resolved", district: "Lakhimpur", state: "Assam", type: "River Overflow Alert", rainfall: "35 mm", waterLevel: "Receding" },
];

export const districts = [
  { id: 1, nameEn: "Dibrugarh", nameHi: "डिब्रूगढ़", state: "Assam", risk: "Critical", rainfall: "112 mm", riverLevel: "Rising", population: "1.3M", lat: 27.4845, lng: 94.9019 },
  { id: 2, nameEn: "Darbhanga", nameHi: "दरभंगा", state: "Bihar", risk: "High", rainfall: "84 mm", riverLevel: "Rising", population: "1.9M", lat: 26.1542, lng: 85.8918 },
  { id: 3, nameEn: "Jalpaiguri", nameHi: "जलपाईगुड़ी", state: "West Bengal", risk: "High", rainfall: "76 mm", riverLevel: "Steady", population: "0.9M", lat: 26.5541, lng: 88.7288 },
  { id: 4, nameEn: "Haridwar", nameHi: "हरिद्वार", state: "Uttarakhand", risk: "Moderate", rainfall: "41 mm", riverLevel: "Steady", population: "0.7M", lat: 29.9457, lng: 78.1642 },
  { id: 5, nameEn: "Wayanad", nameHi: "वायनाड", state: "Kerala", risk: "Critical", rainfall: "138 mm", riverLevel: "Rising rapidly", population: "0.4M", lat: 11.7151, lng: 76.1271 },
  { id: 6, nameEn: "Barpeta", nameHi: "बारपेटा", state: "Assam", risk: "Moderate", rainfall: "38 mm", riverLevel: "Receding", population: "0.6M", lat: 26.3223, lng: 91.0060 },
  { id: 7, nameEn: "Kullu", nameHi: "कुल्लू", state: "Himachal Pradesh", risk: "High", rainfall: "97 mm", riverLevel: "Rising", population: "0.2M", lat: 31.9579, lng: 77.1089 },
  { id: 8, nameEn: "Mayurbhanj", nameHi: "मयूरभंज", state: "Odisha", risk: "Low", rainfall: "22 mm", riverLevel: "Normal", population: "1.1M", lat: 21.9156, lng: 86.3962 },
];

export const shelters = [
  { id: "SH-1042", nameEn: "Govt. Higher Secondary School", nameHi: "सरकारी उच्चतर माध्यमिक विद्यालय", district: "Dibrugarh", state: "Assam", capacity: 400, occupancy: 340, status: "Operational", facilities: ["Medical Aid", "Food", "Drinking Water", "Sanitation"], contact: "+91 98765 43210" },
  { id: "SH-1041", nameEn: "Community Hall, Darbhanga", nameHi: "सामुदायिक भवन, दरभंगा", district: "Darbhanga", state: "Bihar", capacity: 250, occupancy: 250, status: "At Capacity", facilities: ["Food", "Drinking Water"], contact: "+91 98765 22110" },
  { id: "SH-1040", nameEn: "Panchayat Bhavan", nameHi: "पंचायत भवन", district: "Jalpaiguri", state: "West Bengal", capacity: 180, occupancy: 96, status: "Operational", facilities: ["Medical Aid", "Sanitation"], contact: "+91 91234 55667" },
  { id: "SH-1039", nameEn: "Government Degree College", nameHi: "राजकीय स्नातक महाविद्यालय", district: "Haridwar", state: "Uttarakhand", capacity: 500, occupancy: 120, status: "Operational", facilities: ["Medical Aid", "Food", "Drinking Water", "Sanitation", "Power Backup"], contact: "+91 90000 11223" },
  { id: "SH-1038", nameEn: "District Sports Complex", nameHi: "जिला खेल परिसर", district: "Wayanad", state: "Kerala", capacity: 600, occupancy: 580, status: "Operational", facilities: ["Medical Aid", "Food", "Drinking Water"], contact: "+91 88888 99001" },
  { id: "SH-1037", nameEn: "Primary Health Centre Annex", nameHi: "प्राथमिक स्वास्थ्य केंद्र एनेक्स", district: "Kullu", state: "Himachal Pradesh", capacity: 150, occupancy: 0, status: "Unavailable", facilities: ["Under Maintenance"], contact: "+91 99887 76655" },
  { id: "SH-1036", nameEn: "Municipal Marriage Hall", nameHi: "नगरपालिका विवाह भवन", district: "Barpeta", state: "Assam", capacity: 300, occupancy: 40, status: "Operational", facilities: ["Food", "Drinking Water", "Sanitation"], contact: "+91 97654 32109" },
];

export const preparedness = {
  overallScore: 78,
  categories: [
    { id: "response", labelEn: "Response Readiness", labelHi: "प्रतिक्रिया तत्परता", score: 82 },
    { id: "supplies", labelEn: "Emergency Supplies", labelHi: "आपातकालीन आपूर्ति", score: 74 },
    { id: "comms", labelEn: "Communication Readiness", labelHi: "संचार तत्परता", score: 88 },
    { id: "evacuation", labelEn: "Evacuation Preparedness", labelHi: "निकासी तैयारी", score: 69 },
    { id: "training", labelEn: "Training Status", labelHi: "प्रशिक्षण स्थिति", score: 75 },
  ],
  districts: [
    { id: 1, nameEn: "Dibrugarh", nameHi: "डिब्रूगढ़", score: 84, trend: "up" },
    { id: 2, nameEn: "Darbhanga", nameHi: "दरभंगा", score: 61, trend: "down" },
    { id: 3, nameEn: "Jalpaiguri", nameHi: "जलपाईगुड़ी", score: 77, trend: "steady" },
    { id: 4, nameEn: "Haridwar", nameHi: "हरिद्वार", score: 90, trend: "up" },
    { id: 5, nameEn: "Wayanad", nameHi: "वायनाड", score: 58, trend: "down" },
  ],
};

export const incidents = [
  { id: "INC-3391", titleEn: "River embankment breach", titleHi: "नदी तटबंध का टूटना", location: "Dibrugarh, Assam", severity: "Critical", status: "In Progress", team: "NDRF Team 4", updated: "5 min ago", timeline: [
    { time: "13:40", en: "Breach reported by field sensor", hi: "फील्ड सेंसर द्वारा टूटने की सूचना" },
    { time: "13:48", en: "Response team dispatched", hi: "प्रतिक्रिया दल रवाना" },
    { time: "14:02", en: "Evacuation of low-lying wards started", hi: "निचले वार्डों की निकासी शुरू" },
  ]},
  { id: "INC-3390", titleEn: "Cloudburst triggered landslide", titleHi: "बादल फटने से भूस्खलन", location: "Kullu, Himachal Pradesh", severity: "High", status: "In Progress", team: "SDRF Kullu", updated: "22 min ago", timeline: [
    { time: "11:10", en: "Landslide reported blocking NH-3", hi: "एनएच-3 अवरुद्ध करने वाला भूस्खलन दर्ज" },
    { time: "11:25", en: "Road clearance team mobilised", hi: "सड़क सफाई दल जुटाया गया" },
  ]},
  { id: "INC-3389", titleEn: "Shelter overcapacity", titleHi: "आश्रय की क्षमता से अधिक भीड़", location: "Darbhanga, Bihar", severity: "Moderate", status: "Monitoring", team: "District Admin", updated: "1 hr ago", timeline: [
    { time: "12:55", en: "Community Hall reached full capacity", hi: "सामुदायिक भवन पूर्ण क्षमता पर पहुंचा" },
    { time: "13:10", en: "Overflow shelter identified nearby", hi: "पास में अतिरिक्त आश्रय चिन्हित" },
  ]},
  { id: "INC-3388", titleEn: "Communication tower outage", titleHi: "संचार टावर बाधित", location: "Wayanad, Kerala", severity: "High", status: "Resolved", team: "BSNL Field Unit", updated: "3 hr ago", timeline: [
    { time: "09:15", en: "Tower lost power due to flooding", hi: "बाढ़ के कारण टावर की बिजली गई" },
    { time: "10:40", en: "Backup generator restored service", hi: "बैकअप जनरेटर से सेवा बहाल" },
  ]},
];

export const officials = [
  { id: "OFF-001", name: "Rajesh Kumar", role: "District Magistrate", department: "Disaster Management", location: "Dibrugarh, Assam", status: "Active", lastActive: "2 min ago", access: "Administrator" },
  { id: "OFF-002", name: "Priya Sharma", role: "Emergency Response Officer", department: "NDRF Coordination", location: "Darbhanga, Bihar", status: "Active", lastActive: "10 min ago", access: "Editor" },
  { id: "OFF-003", name: "Anil Menon", role: "Field Sensor Analyst", department: "Monitoring & Sensors", location: "Wayanad, Kerala", status: "Active", lastActive: "1 hr ago", access: "Viewer" },
  { id: "OFF-004", name: "Sunita Devi", role: "Shelter Coordinator", department: "Relief Operations", location: "Jalpaiguri, West Bengal", status: "Inactive", lastActive: "2 days ago", access: "Editor" },
  { id: "OFF-005", name: "Vikram Singh", role: "Communications Officer", department: "Public Information", location: "Haridwar, Uttarakhand", status: "Active", lastActive: "35 min ago", access: "Editor" },
  { id: "OFF-006", name: "Meera Nair", role: "Regional Coordinator", department: "Disaster Management", location: "Kullu, Himachal Pradesh", status: "Active", lastActive: "18 min ago", access: "Administrator" },
];

export const reports = [
  { id: "RPT-001", nameEn: "Daily Alert Report", nameHi: "दैनिक अलर्ट रिपोर्ट", frequency: "Daily", lastGenerated: "Today, 06:00" },
  { id: "RPT-002", nameEn: "District Risk Report", nameHi: "जिला जोखिम रिपोर्ट", frequency: "Weekly", lastGenerated: "2 days ago" },
  { id: "RPT-003", nameEn: "Shelter Status Report", nameHi: "आश्रय स्थिति रिपोर्ट", frequency: "Daily", lastGenerated: "Today, 08:30" },
  { id: "RPT-004", nameEn: "Response Operations Report", nameHi: "प्रतिक्रिया संचालन रिपोर्ट", frequency: "Weekly", lastGenerated: "5 days ago" },
  { id: "RPT-005", nameEn: "Preparedness Assessment Report", nameHi: "तैयारी आकलन रिपोर्ट", frequency: "Monthly", lastGenerated: "3 weeks ago" },
];
