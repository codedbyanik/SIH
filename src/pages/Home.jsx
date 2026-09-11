import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ShieldAlert, CloudRain, Droplets, Mountain, Waves, Activity, Map, Radio, Siren, Home as HomeIcon, Phone, ArrowRight, CheckCircle2, AlertTriangle, Clock3, Loader2 } from "lucide-react";
import { useLanguage } from "../LanguageContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const LOCATIONS = ["Mundakkai", "Chooralmala", "Meppadi", "Vythiri", "Kalpetta"];

const riskIndex = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n <= 1 ? n * 100 : n));
};

const rainValue = (value) => {
  if (typeof value === "number") return value;
  const match = String(value ?? "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const riskColor = (risk) => {
  if (risk === "Critical") return "#b91c1c";
  if (risk === "High") return "#dc2626";
  if (risk === "Moderate") return "#d97706";
  return "#15803d";
};

const riskHindi = (risk) => ({ Critical: "गंभीर", High: "उच्च", Moderate: "मध्यम", Advisory: "सलाह" }[risk] || risk);

function soilAverage(soil) {
  if (!soil) return null;
  const keys = ["soil_moisture_0_7cm", "soil_moisture_7_28cm", "soil_moisture_28_100cm", "soil_moisture_100_255cm"];
  const values = keys.map(k => Number(soil[k])).filter(Number.isFinite);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function actionForRisk(risk, hi) {
  if (risk === "Critical") return hi ? "तुरंत सुरक्षित स्थान पर जाएं और आधिकारिक निकासी निर्देशों का पालन करें।" : "Move to a safe location immediately and follow official evacuation instructions.";
  if (risk === "High") return hi ? "निचले क्षेत्रों और जलधाराओं से बचें तथा निकासी के लिए तैयार रहें।" : "Avoid low-lying areas and water channels and be prepared to evacuate.";
  if (risk === "Moderate") return hi ? "बदलती वर्षा और स्थानीय परिस्थितियों पर नजर रखें।" : "Monitor changing rainfall and local conditions.";
  return hi ? "सामान्य सावधानी रखें और आधिकारिक चेतावनियों पर नजर रखें।" : "Continue normal precautions and follow official advisories.";
}

function Home() {
  const { language } = useLanguage();
  const hi = language === "hi";
  const [location, setLocation] = useState({ state: "Kerala", district: "Wayanad", village: "" });
  const [zones, setZones] = useState([]);
  const [forecastZones, setForecastZones] = useState([]);
  const [checked, setChecked] = useState(false);
  const [riskLoading, setRiskLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [riskError, setRiskError] = useState(null);
  const [forecastError, setForecastError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  const selectedZone = useMemo(() => zones.find(z => String(z.name).toLowerCase() === location.village.toLowerCase()) || null, [zones, location.village]);
  const selectedForecast = useMemo(() => selectedZone ? (forecastZones.find(z => Number(z.id) === Number(selectedZone.id)) || forecastZones.find(z => String(z.name).toLowerCase() === String(selectedZone.name).toLowerCase())) : null, [forecastZones, selectedZone]);
  const currentRisk = selectedZone?.risk || null;
  const soil = soilAverage(selectedZone?.soil_moisture);

  const fetchRisk = async () => {
    try {
      setRiskLoading(true);
      const r = await fetch(`${API_BASE}/api/risk-map?source=live`);
      if (!r.ok) throw new Error(`Risk API ${r.status}`);
      const data = await r.json();
      setZones(Array.isArray(data?.zones) ? data.zones : []);
      setTimestamp(data?.live_timestamp || data?.timestamp || null);
      setRiskError(null);
    } catch (e) {
      console.error(e);
      setRiskError(hi ? "वर्तमान जोखिम डेटा उपलब्ध नहीं है।" : "Current risk data is unavailable.");
    } finally { setRiskLoading(false); }
  };

  const fetchForecast = async () => {
    try {
      setForecastLoading(true);
      const r = await fetch(`${API_BASE}/api/forecast-risk`);
      if (!r.ok) throw new Error(`Forecast API ${r.status}`);
      const data = await r.json();
      setForecastZones(Array.isArray(data?.zones) ? data.zones : []);
      setForecastError(null);
    } catch (e) {
      console.error(e);
      setForecastError(hi ? "भविष्य का पूर्वानुमान उपलब्ध नहीं है।" : "Future forecast is unavailable.");
    } finally { setForecastLoading(false); }
  };

  useEffect(() => {
    fetchRisk(); fetchForecast();
    const a = setInterval(fetchRisk, 30000);
    const b = setInterval(fetchForecast, 60000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  const forecastItems = [6, 12, 24].map(hours => ({ hours, item: selectedForecast?.forecast?.[`${hours}h`] || null }));
  const currentScore = Number(selectedForecast?.current?.risk_score ?? selectedZone?.risk_score ?? 0);
  const escalation = forecastItems.find(x => x.item && Number(x.item.risk_score ?? 0) > currentScore + 0.05);
  const timeText = timestamp ? new Date(timestamp).toLocaleString(hi ? "hi-IN" : "en-IN", { dateStyle: "short", timeStyle: "short" }) : null;

  const t = {
    gov: hi ? "भारत सरकार आपदा प्रबंधन पहल" : "Government of India Disaster Management Initiative",
    title: hi ? "अचानक बाढ़" : "Flash Flood", early: hi ? "पूर्व चेतावनी" : "Early Warning", system: hi ? "प्रणाली" : "System",
    desc: hi ? "पहाड़ी क्षेत्रों में सुरक्षित समुदायों के लिए स्थानीय बाढ़ जोखिम की जानकारी और समय पर चेतावनी।" : "Hyper-local flash-flood risk information and timely warnings for safer communities in hilly regions.",
    live: hi ? "वास्तविक समय निगरानी" : "Real-time monitoring", alerts: hi ? "स्थान-आधारित अलर्ट" : "Location-based alerts", prep: hi ? "आपातकालीन तैयारी" : "Emergency preparedness",
    check: hi ? "अपने क्षेत्र का जोखिम जांचें" : "Check Your Area Risk", select: hi ? "अपना क्षेत्र चुनें और वर्तमान तथा भविष्य का जोखिम देखें।" : "Select your area to view current and future risk.",
    state: hi ? "राज्य" : "State", district: hi ? "जिला" : "District", area: hi ? "क्षेत्र / गांव" : "Area / Village", selectArea: hi ? "क्षेत्र चुनें" : "Select Area", checkRisk: hi ? "जोखिम जांचें" : "Check Risk",
    current: hi ? "वर्तमान स्थिति" : "CURRENT SITUATION", status: hi ? "क्षेत्र जोखिम स्थिति" : "Area Risk Status", liveData: hi ? "लाइव डेटा" : "LIVE DATA", currentRisk: hi ? "वर्तमान जोखिम स्तर" : "Current Risk Level", index: hi ? "जोखिम सूचकांक" : "Risk Index",
    recommendation: hi ? "अनुशंसित कार्रवाई" : "Recommended Action", rainfall: hi ? "वर्षा" : "Rainfall", soil: hi ? "मिट्टी की नमी" : "Soil Moisture", slope: hi ? "ढलान" : "Slope", river: hi ? "नदी से दूरी" : "River Distance",
    last3: hi ? "पिछले 3 घंटे" : "Last 3 hours", average: hi ? "वर्तमान औसत रीडिंग" : "Current average reading", future: hi ? "भविष्य जोखिम पूर्वानुमान" : "Future Risk Forecast", riskEsc: hi ? "जोखिम बढ़ने की संभावना" : "Risk escalation expected", stable: hi ? "पूर्वानुमान फिलहाल स्थिर है" : "Forecast is currently stable", forecastLoading: hi ? "भविष्य का जोखिम पूर्वानुमान लोड हो रहा है..." : "Loading future risk forecast...",
    services: hi ? "नागरिक सेवाएं" : "CITIZEN SERVICES", need: hi ? "आपको क्या चाहिए?" : "What Do You Need?", viewAlerts: hi ? "अलर्ट देखें" : "View Alerts", shelter: hi ? "सुरक्षित आश्रय खोजें" : "Find Safe Shelter", map: hi ? "जोखिम मानचित्र देखें" : "Explore Risk Map", emergency: hi ? "आपातकालीन सहायता" : "Emergency Help"
  };

  return <main className="home-page" id="main-content">
    <section className="hero-section"><div className="container"><div className="hero-content">
      <div className="hero-text">
        <div className="official-badge"><ShieldAlert size={16}/><span>{t.gov}</span></div>
        <h1>{t.title}<span>{t.early}</span><span>{t.system}</span></h1>
        <p>{t.desc}</p>
        <div className="hero-highlights"><div className="hero-highlight"><CheckCircle2 size={17}/><span>{t.live}</span></div><div className="hero-highlight"><CheckCircle2 size={17}/><span>{t.alerts}</span></div><div className="hero-highlight"><CheckCircle2 size={17}/><span>{t.prep}</span></div></div>
      </div>
      <div className="location-card"><div className="card-heading"><div className="card-icon"><MapPin size={24}/></div><div><h2>{t.check}</h2><p>{t.select}</p></div></div>
        <div className="location-form">
          <div className="form-group"><label>{t.state}</label><select value="Kerala" disabled><option>Kerala</option></select></div>
          <div className="form-group"><label>{t.district}</label><select value="Wayanad" disabled><option>Wayanad</option></select></div>
          <div className="form-group"><label>{t.area}</label><select value={location.village} onChange={e=>{setLocation({...location,village:e.target.value});setChecked(false);}}><option value="">{t.selectArea}</option>{LOCATIONS.map(x=><option key={x}>{x}</option>)}</select></div>
          <button type="button" className="check-risk-button" onClick={()=>location.village ? setChecked(true) : alert(hi ? "कृपया अपना क्षेत्र चुनें।" : "Please select your area.")} disabled={riskLoading || !zones.length}>{riskLoading ? <Loader2 size={18}/> : <Activity size={18}/>}<span>{t.checkRisk}</span><ArrowRight size={17}/></button>
        </div>
      </div>
    </div></div></section>

    <section className="risk-section"><div className="container">
      <div className="section-heading"><div><div className="section-label">{t.current}</div><h2>{t.status}</h2></div><div className="demo-indicator"><span></span>{t.liveData}</div></div>
      {!checked || !selectedZone ? <div className="risk-status-card"><div className="risk-status-main"><div className="risk-status-icon"><MapPin size={25}/></div><div><span>{t.currentRisk}</span><h3>{riskLoading ? "Loading..." : riskError || (hi ? "ऊपर अपना क्षेत्र चुनें" : "Select your area above")}</h3></div></div><div className="risk-time"><Clock3 size={14}/>{timeText || "--"}</div></div> : <>
        <div className="risk-status-card"><div className="risk-status-main"><div className="risk-status-icon"><AlertTriangle size={25}/></div><div><span>{t.currentRisk}</span><h3>{hi ? riskHindi(currentRisk) : currentRisk}</h3><p>{location.village}, Wayanad, Kerala • {t.index}: {riskIndex(selectedZone.risk_score)}/100</p></div></div><div className="risk-time"><Clock3 size={14}/>{timeText || "Updated"}</div></div>
        {(currentRisk === "High" || currentRisk === "Critical") && <div style={{marginTop:12,padding:14,borderRadius:10,background:currentRisk === "Critical" ? "#fef2f2" : "#fff7ed",border:"1px solid #fed7aa",display:"flex",alignItems:"center",gap:12}}><Siren size={22}/><div style={{flex:1}}><strong>{hi ? "फ्लैश फ्लड चेतावनी" : "Flash Flood Warning"}</strong><p style={{margin:"4px 0 0",fontSize:13}}>{location.village} • {currentRisk}</p></div><Link to="/alerts" className="card-link">{t.viewAlerts}<ArrowRight size={15}/></Link></div>}
        <div className="recommendation-card"><div className="recommendation-icon"><Siren size={20}/></div><div><strong>{t.recommendation}</strong><p>{actionForRisk(currentRisk,hi)}</p></div></div>
        <div className="indicator-grid">
          <div className="indicator-card"><div className="indicator-top"><div className="indicator-icon"><CloudRain size={20}/></div>{t.rainfall}</div><strong>{rainValue(selectedZone.rainfall_windows?.rain_3h).toFixed(1)} mm</strong><p>{t.last3}</p></div>
          <div className="indicator-card"><div className="indicator-top"><div className="indicator-icon"><Droplets size={20}/></div>{t.soil}</div><strong>{soil == null ? "--" : soil.toFixed(2)}</strong><p>{t.average}</p></div>
          <div className="indicator-card"><div className="indicator-top"><div className="indicator-icon"><Mountain size={20}/></div>{t.slope}</div><strong>{Number(selectedZone.slope_deg ?? 0).toFixed(1)}°</strong><p>{hi ? "भू-भाग संकेतक" : "Terrain indicator"}</p></div>
          <div className="indicator-card"><div className="indicator-top"><div className="indicator-icon"><Waves size={20}/></div>{t.river}</div><strong>{Number(selectedZone.distance_to_river_m ?? 0).toFixed(0)} m</strong><p>{hi ? "निकटतम नदी" : "Nearest river"}</p></div>
        </div>

        <div style={{marginTop:16,padding:16,border:"1px solid #dbeafe",borderRadius:12,background:"#f8fbff"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><strong>{t.future}</strong><span style={{fontSize:10,fontWeight:700,padding:"5px 8px",borderRadius:999,background:"#e0f2fe",color:"#0369a1"}}>6 / 12 / 24 H</span></div>
          {forecastLoading && !selectedForecast ? <div style={{padding:"10px 0",color:"#64748b",fontSize:13}}>{t.forecastLoading}</div> : selectedForecast?.forecast ? <><div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:9}}>{forecastItems.map(({hours,item})=>{const r=item?.risk || "Advisory";return <div key={hours} style={{padding:"11px 8px",borderRadius:9,background:"#fff",border:"1px solid #e2e8f0",textAlign:"center"}}><small style={{display:"block",color:"#64748b",fontWeight:700,marginBottom:6}}>{hours}h</small><strong style={{display:"block",color:riskColor(r),fontSize:13}}>{hi ? riskHindi(r) : r}</strong><span style={{display:"block",marginTop:6,fontSize:11,fontWeight:800,color:"#334155"}}>{t.index}: {riskIndex(item?.risk_score)}/100</span></div>})}</div><div style={{marginTop:10,padding:10,borderRadius:8,background:escalation?"#fff7ed":"#f0fdf4",border:escalation?"1px solid #fed7aa":"1px solid #bbf7d0",fontSize:12,color:escalation?"#c2410c":"#166534"}}><strong>{escalation ? `⚠ ${t.riskEsc} ${escalation.hours}h` : t.stable}</strong></div><div style={{marginTop:8,fontSize:10,color:"#64748b"}}>{hi ? "पूर्वानुमानित वर्षा और वर्तमान परिस्थितियों के आधार पर" : "Based on forecast rainfall and current conditions"}</div></> : <div style={{padding:"10px 0",color:"#64748b",fontSize:12}}>{forecastError || (hi ? "पूर्वानुमान उपलब्ध नहीं है।" : "Forecast unavailable.")}</div>}
        </div>
      </>}
    </div></section>

    <section className="monitoring-section"><div className="container"><div className="section-heading"><div><div className="section-label">{hi ? "लाइव निगरानी" : "LIVE MONITORING"}</div><h2>{hi ? "एक नज़र में स्थिति" : "Situation at a Glance"}</h2></div></div><div className="monitoring-grid">
      <Link to="/alerts" className="monitor-card"><div className="monitor-icon"><CloudRain size={25}/></div><h3>{hi?"वर्षा निगरानी":"Rainfall Monitoring"}</h3><p>{hi?"हाल की वर्षा और बदलती परिस्थितियों की निगरानी करें।":"Monitor recent rainfall and changing conditions."}</p><span className="card-link">{t.viewAlerts}<ArrowRight size={15}/></span></Link>
      <Link to="/risk-map" className="monitor-card"><div className="monitor-icon"><Map size={25}/></div><h3>{hi?"जोखिम मानचित्र":"Risk Map"}</h3><p>{hi?"वायनाड के निगरानी क्षेत्रों में जोखिम देखें।":"Explore flash-flood risk across monitored Wayanad areas."}</p><span className="card-link">{t.map}<ArrowRight size={15}/></span></Link>
      <Link to="/risk-map" className="monitor-card"><div className="monitor-icon"><Radio size={25}/></div><h3>{hi?"पर्यावरणीय निगरानी":"Environmental Monitoring"}</h3><p>{hi?"उपलब्ध पर्यावरणीय संकेतकों की स्थिति देखें।":"View available environmental monitoring indicators."}</p><span className="card-link">{hi?"निगरानी देखें":"View Monitoring"}<ArrowRight size={15}/></span></Link>
    </div></div></section>

    <section className="quick-section"><div className="container"><div className="section-heading"><div><div className="section-label">{t.services}</div><h2>{t.need}</h2></div></div><div className="quick-grid">
      <Link to="/alerts" className="quick-card"><div className="quick-icon"><ShieldAlert size={24}/></div><div><h3>{t.viewAlerts}</h3><p>{hi?"अपने क्षेत्र की सक्रिय बाढ़ चेतावनियां देखें।":"Check active flood warnings for your area."}</p></div><span>{t.viewAlerts}<ArrowRight size={15}/></span></Link>
      <Link to="/shelters" className="quick-card"><div className="quick-icon"><HomeIcon size={24}/></div><div><h3>{t.shelter}</h3><p>{hi?"निकटतम सुरक्षित आश्रय और निकासी केंद्र खोजें।":"Locate nearby safe shelters and evacuation centres."}</p></div><span>{hi?"आश्रय खोजें":"Find Shelter"}<ArrowRight size={15}/></span></Link>
      <Link to="/risk-map" className="quick-card"><div className="quick-icon"><Map size={24}/></div><div><h3>{t.map}</h3><p>{hi?"अपने आसपास के जोखिम क्षेत्रों को देखें।":"View risk zones around you."}</p></div><span>{hi?"मानचित्र देखें":"Explore Map"}<ArrowRight size={15}/></span></Link>
      <Link to="/emergency" className="quick-card"><div className="quick-icon"><Phone size={24}/></div><div><h3>{t.emergency}</h3><p>{hi?"आपातकालीन संपर्क और सहायता प्राप्त करें।":"Access emergency contacts and assistance."}</p></div><span>{hi?"सहायता प्राप्त करें":"Get Help"}<ArrowRight size={15}/></span></Link>
    </div></div></section>
  </main>;
}

export default Home;
