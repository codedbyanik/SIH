import { useState } from "react";
import { Link } from "react-router-dom";

import {
  MapPin,
  ShieldAlert,
  CloudRain,
  Droplets,
  Mountain,
  Waves,
  Activity,
  Map,
  Radio,
  Siren,
  Home as HomeIcon,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import { useLanguage } from "../LanguageContext.jsx";

function Home() {
  const { language } = useLanguage();

  const isHindi = language === "hi";

  const [location, setLocation] = useState({
    state: "",
    district: "",
    village: "",
  });

  const [riskChecked, setRiskChecked] = useState(false);

  // =====================================================
  // TRANSLATIONS
  // =====================================================

  const t = {
    governmentInitiative: isHindi
      ? "भारत सरकार आपदा प्रबंधन पहल"
      : "Government of India Disaster Management Initiative",

    flashFlood: isHindi
      ? "अचानक बाढ़"
      : "Flash Flood",

    earlyWarning: isHindi
      ? "पूर्व चेतावनी"
      : "Early Warning",

    system: isHindi
      ? "प्रणाली"
      : "System",

    heroDescription: isHindi
      ? "पहाड़ी क्षेत्रों में सुरक्षित समुदायों के लिए स्थानीय बाढ़ और भूस्खलन जोखिम की जानकारी।"
      : "Hyper-local flood and landslide risk information for safer communities in hilly regions.",

    realTimeMonitoring: isHindi
      ? "वास्तविक समय निगरानी"
      : "Real-time monitoring",

    locationAlerts: isHindi
      ? "स्थान-आधारित अलर्ट"
      : "Location-based alerts",

    emergencyPreparedness: isHindi
      ? "आपातकालीन तैयारी"
      : "Emergency preparedness",

    checkAreaRisk: isHindi
      ? "अपने क्षेत्र का जोखिम जांचें"
      : "Check Your Area Risk",

    selectLocation: isHindi
      ? "नवीनतम जोखिम स्थिति देखने के लिए अपना स्थान चुनें।"
      : "Select your location to view the latest risk status.",

    state: isHindi
      ? "राज्य"
      : "State",

    selectState: isHindi
      ? "राज्य चुनें"
      : "Select State",

    district: isHindi
      ? "जिला"
      : "District",

    selectDistrict: isHindi
      ? "जिला चुनें"
      : "Select District",

    villageWard: isHindi
      ? "गांव / वार्ड"
      : "Village / Ward",

    selectVillageWard: isHindi
      ? "गांव / वार्ड चुनें"
      : "Select Village / Ward",

    checkRisk: isHindi
      ? "जोखिम जांचें"
      : "Check Risk",

    currentSituation: isHindi
      ? "वर्तमान स्थिति"
      : "CURRENT SITUATION",

    areaRiskStatus: isHindi
      ? "क्षेत्र जोखिम स्थिति"
      : "Area Risk Status",

    demoData: isHindi
      ? "डेमो डेटा"
      : "Demo Data",

    currentRiskLevel: isHindi
      ? "वर्तमान जोखिम स्तर"
      : "Current Risk Level",

    waitingForLocation: isHindi
      ? "स्थान की प्रतीक्षा"
      : "WAITING FOR LOCATION",

    selectArea: isHindi
      ? "वर्तमान जोखिम जांचने के लिए ऊपर अपना क्षेत्र चुनें।"
      : "Select your area above to check the current risk.",

    waiting: isHindi
      ? "प्रतीक्षा"
      : "Waiting",

    highRisk: isHindi
      ? "उच्च जोखिम"
      : "HIGH RISK",

    updatedJustNow: isHindi
      ? "अभी अपडेट किया गया"
      : "Updated just now",

    recommendedAction: isHindi
      ? "अनुशंसित कार्रवाई"
      : "Recommended Action",

    recommendedMessage: isHindi
      ? "सतर्क रहें और निचले क्षेत्रों से बचें। आधिकारिक चेतावनी जारी होने पर निकासी के लिए तैयार रहें।"
      : "Stay alert and avoid low-lying areas. Be prepared to evacuate if an official warning is issued.",

    rainfall: isHindi
      ? "वर्षा"
      : "Rainfall",

    soilMoisture: isHindi
      ? "मिट्टी की नमी"
      : "Soil Moisture",

    slopeStability: isHindi
      ? "ढलान स्थिरता"
      : "Slope Stability",

    waterLevel: isHindi
      ? "जल स्तर"
      : "Water Level",

    last3Hours: isHindi
      ? "पिछले 3 घंटे"
      : "Last 3 hours",

    currentReading: isHindi
      ? "वर्तमान रीडिंग"
      : "Current reading",

    stabilityAssessment: isHindi
      ? "स्थिरता आकलन"
      : "Stability assessment",

    riverMonitoring: isHindi
      ? "नदी निगरानी"
      : "River monitoring",

    noLocationSelected: isHindi
      ? "कोई स्थान चयनित नहीं"
      : "No location selected",

    liveMonitoring: isHindi
      ? "लाइव निगरानी"
      : "LIVE MONITORING",

    situationAtGlance: isHindi
      ? "एक नज़र में स्थिति"
      : "Situation at a Glance",

    rainfallMonitoring: isHindi
      ? "वर्षा निगरानी"
      : "Rainfall Monitoring",

    rainfallDescription: isHindi
      ? "वर्षा की तीव्रता और हाल की वर्षा की निगरानी करें।"
      : "Monitor rainfall intensity and recent precipitation.",

    viewDetails: isHindi
      ? "विवरण देखें"
      : "View Details",

    riskMap: isHindi
      ? "जोखिम मानचित्र"
      : "Risk Map",

    riskMapDescription: isHindi
      ? "अपने क्षेत्र में बाढ़ और भूस्खलन के जोखिम का पता लगाएं।"
      : "Explore flood and landslide risk across your area.",

    openMap: isHindi
      ? "मानचित्र खोलें"
      : "Open Map",

    sensorNetwork: isHindi
      ? "सेंसर नेटवर्क"
      : "Sensor Network",

    sensorDescription: isHindi
      ? "उपलब्ध पर्यावरणीय निगरानी बिंदुओं की स्थिति देखें।"
      : "View status of available environmental monitoring points.",

    viewSensors: isHindi
      ? "सेंसर देखें"
      : "View Sensors",

    citizenServices: isHindi
      ? "नागरिक सेवाएं"
      : "CITIZEN SERVICES",

    whatDoYouNeed: isHindi
      ? "आपको क्या चाहिए?"
      : "What Do You Need?",

    viewAlerts: isHindi
      ? "अलर्ट देखें"
      : "View Alerts",

    alertsDescription: isHindi
      ? "सक्रिय बाढ़ और भूस्खलन चेतावनियां देखें।"
      : "Check active flood and landslide warnings.",

    findSafeShelter: isHindi
      ? "सुरक्षित आश्रय खोजें"
      : "Find Safe Shelter",

    shelterDescription: isHindi
      ? "निकटतम निकासी केंद्र खोजें।"
      : "Locate nearby evacuation centres.",

    findShelter: isHindi
      ? "आश्रय खोजें"
      : "Find Shelter",

    exploreRiskMap: isHindi
      ? "जोखिम मानचित्र देखें"
      : "Explore Risk Map",

    riskMapAroundYou: isHindi
      ? "अपने आसपास के जोखिम क्षेत्रों को देखें।"
      : "View risk zones around you.",

    exploreMap: isHindi
      ? "मानचित्र देखें"
      : "Explore Map",

    emergencyHelp: isHindi
      ? "आपातकालीन सहायता"
      : "Emergency Help",

    emergencyDescription: isHindi
      ? "आपातकालीन संपर्क और सहायता प्राप्त करें।"
      : "Access emergency contacts and assistance.",

    getHelp: isHindi
      ? "सहायता प्राप्त करें"
      : "Get Help",
  };

  // =====================================================
  // RISK CHECK
  // =====================================================

  const handleCheckRisk = () => {
    if (!location.state || !location.district || !location.village) {
      alert(
        isHindi
          ? "कृपया राज्य, जिला और गांव / वार्ड चुनें।"
          : "Please select State, District and Village / Ward."
      );
      return;
    }

    setRiskChecked(true);
  };

  return (
    <main className="home-page" id="main-content">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">

            {/* LEFT SIDE */}
            <div className="hero-text">

              <div className="official-badge">
                <ShieldAlert size={16} />

                <span>
                  {t.governmentInitiative}
                </span>
              </div>

              <h1>
                {t.flashFlood}
                <span>{t.earlyWarning}</span>
                <span>{t.system}</span>
              </h1>

              <p>
                {t.heroDescription}
              </p>

              <div className="hero-highlights">

                <div className="hero-highlight">
                  <CheckCircle2 size={17} />
                  <span>{t.realTimeMonitoring}</span>
                </div>

                <div className="hero-highlight">
                  <CheckCircle2 size={17} />
                  <span>{t.locationAlerts}</span>
                </div>

                <div className="hero-highlight">
                  <CheckCircle2 size={17} />
                  <span>{t.emergencyPreparedness}</span>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE — RISK CHECKER */}
            <div className="location-card">

              <div className="card-heading">

                <div className="card-icon">
                  <MapPin size={24} />
                </div>

                <div>
                  <h2>{t.checkAreaRisk}</h2>

                  <p>{t.selectLocation}</p>
                </div>

              </div>

              <div className="location-form">

                {/* STATE */}
                <div className="form-group">

                  <label>{t.state}</label>

                  <select
                    value={location.state}
                    onChange={(e) => {
                      setLocation({
                        state: e.target.value,
                        district: "",
                        village: "",
                      });

                      setRiskChecked(false);
                    }}
                  >
                    <option value="">
                      {t.selectState}
                    </option>

                    <option value="Uttarakhand">
                      {isHindi ? "उत्तराखंड" : "Uttarakhand"}
                    </option>

                    <option value="Himachal Pradesh">
                      {isHindi
                        ? "हिमाचल प्रदेश"
                        : "Himachal Pradesh"}
                    </option>

                    <option value="Sikkim">
                      {isHindi ? "सिक्किम" : "Sikkim"}
                    </option>

                    <option value="Arunachal Pradesh">
                      {isHindi
                        ? "अरुणाचल प्रदेश"
                        : "Arunachal Pradesh"}
                    </option>

                    <option value="Jammu and Kashmir">
                      {isHindi
                        ? "जम्मू और कश्मीर"
                        : "Jammu and Kashmir"}
                    </option>

                    <option value="West Bengal">
                      {isHindi
                        ? "पश्चिम बंगाल"
                        : "West Bengal"}
                    </option>
                  </select>

                </div>

                {/* DISTRICT */}
                <div className="form-group">

                  <label>{t.district}</label>

                  <select
                    value={location.district}
                    disabled={!location.state}
                    onChange={(e) => {
                      setLocation({
                        ...location,
                        district: e.target.value,
                        village: "",
                      });

                      setRiskChecked(false);
                    }}
                  >
                    <option value="">
                      {t.selectDistrict}
                    </option>

                    {location.state === "Uttarakhand" && (
                      <>
                        <option value="Dehradun">
                          {isHindi ? "देहरादून" : "Dehradun"}
                        </option>

                        <option value="Chamoli">
                          {isHindi ? "चमोली" : "Chamoli"}
                        </option>

                        <option value="Rudraprayag">
                          {isHindi
                            ? "रुद्रप्रयाग"
                            : "Rudraprayag"}
                        </option>

                        <option value="Pauri Garhwal">
                          {isHindi
                            ? "पौड़ी गढ़वाल"
                            : "Pauri Garhwal"}
                        </option>
                      </>
                    )}

                    {location.state === "Himachal Pradesh" && (
                      <>
                        <option value="Shimla">
                          {isHindi ? "शिमला" : "Shimla"}
                        </option>

                        <option value="Kullu">
                          {isHindi ? "कुल्लू" : "Kullu"}
                        </option>

                        <option value="Mandi">
                          {isHindi ? "मंडी" : "Mandi"}
                        </option>

                        <option value="Kangra">
                          {isHindi ? "कांगड़ा" : "Kangra"}
                        </option>
                      </>
                    )}

                    {location.state === "Sikkim" && (
                      <>
                        <option value="Gangtok">
                          {isHindi ? "गंगटोक" : "Gangtok"}
                        </option>

                        <option value="Mangan">
                          {isHindi ? "मंगन" : "Mangan"}
                        </option>

                        <option value="Namchi">
                          {isHindi ? "नामची" : "Namchi"}
                        </option>
                      </>
                    )}

                    {location.state === "Arunachal Pradesh" && (
                      <>
                        <option value="Tawang">
                          {isHindi ? "तवांग" : "Tawang"}
                        </option>

                        <option value="West Kameng">
                          {isHindi
                            ? "पश्चिम कामेंग"
                            : "West Kameng"}
                        </option>

                        <option value="East Siang">
                          {isHindi
                            ? "पूर्व सियांग"
                            : "East Siang"}
                        </option>
                      </>
                    )}

                    {location.state === "Jammu and Kashmir" && (
                      <>
                        <option value="Srinagar">
                          {isHindi ? "श्रीनगर" : "Srinagar"}
                        </option>

                        <option value="Anantnag">
                          {isHindi ? "अनंतनाग" : "Anantnag"}
                        </option>

                        <option value="Kupwara">
                          {isHindi ? "कुपवाड़ा" : "Kupwara"}
                        </option>
                      </>
                    )}

                    {location.state === "West Bengal" && (
                      <>
                        <option value="Darjeeling">
                          {isHindi
                            ? "दार्जिलिंग"
                            : "Darjeeling"}
                        </option>

                        <option value="Kalimpong">
                          {isHindi
                            ? "कालिम्पोंग"
                            : "Kalimpong"}
                        </option>

                        <option value="Jalpaiguri">
                          {isHindi
                            ? "जलपाईगुड़ी"
                            : "Jalpaiguri"}
                        </option>
                      </>
                    )}

                  </select>

                </div>

                {/* VILLAGE */}
                <div className="form-group">

                  <label>{t.villageWard}</label>

                  <select
                    value={location.village}
                    disabled={!location.district}
                    onChange={(e) => {
                      setLocation({
                        ...location,
                        village: e.target.value,
                      });

                      setRiskChecked(false);
                    }}
                  >
                    <option value="">
                      {t.selectVillageWard}
                    </option>

                    {location.district === "Dehradun" && (
                      <>
                        <option value="Doiwala">
                          {isHindi ? "डोईवाला" : "Doiwala"}
                        </option>

                        <option value="Raipur">
                          {isHindi ? "रायपुर" : "Raipur"}
                        </option>

                        <option value="Sahaspur">
                          {isHindi ? "सहसपुर" : "Sahaspur"}
                        </option>
                      </>
                    )}

                    {location.district === "Chamoli" && (
                      <>
                        <option value="Joshimath">
                          {isHindi ? "जोशीमठ" : "Joshimath"}
                        </option>

                        <option value="Gopeshwar">
                          {isHindi ? "गोपीश्वर" : "Gopeshwar"}
                        </option>

                        <option value="Karanprayag">
                          {isHindi
                            ? "कर्णप्रयाग"
                            : "Karanprayag"}
                        </option>
                      </>
                    )}

                    {location.district === "Shimla" && (
                      <>
                        <option value="Shimla Urban">
                          {isHindi
                            ? "शिमला शहरी"
                            : "Shimla Urban"}
                        </option>

                        <option value="Theog">
                          {isHindi ? "ठियोग" : "Theog"}
                        </option>

                        <option value="Rampur">
                          {isHindi ? "रामपुर" : "Rampur"}
                        </option>
                      </>
                    )}

                    {location.district === "Kullu" && (
                      <>
                        <option value="Manali">
                          {isHindi ? "मनाली" : "Manali"}
                        </option>

                        <option value="Banjar">
                          {isHindi ? "बंजार" : "Banjar"}
                        </option>

                        <option value="Bhuntar">
                          {isHindi ? "भुंतर" : "Bhuntar"}
                        </option>
                      </>
                    )}

                    {location.district === "Gangtok" && (
                      <>
                        <option value="Gangtok Urban">
                          {isHindi
                            ? "गंगटोक शहरी"
                            : "Gangtok Urban"}
                        </option>

                        <option value="Rumtek">
                          {isHindi ? "रुमटेक" : "Rumtek"}
                        </option>
                      </>
                    )}

                    {location.district === "Darjeeling" && (
                      <>
                        <option value="Darjeeling Town">
                          {isHindi
                            ? "दार्जिलिंग टाउन"
                            : "Darjeeling Town"}
                        </option>

                        <option value="Kurseong">
                          {isHindi ? "कर्सियांग" : "Kurseong"}
                        </option>
                      </>
                    )}

                  </select>

                </div>

                {/* CHECK RISK */}
                <button
                  type="button"
                  className="check-risk-button"
                  onClick={handleCheckRisk}
                >
                  <Activity size={18} />

                  <span>{t.checkRisk}</span>

                  <ArrowRight size={17} />
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CURRENT SITUATION
      ====================================================== */}
      <section className="risk-section">
        <div className="container">

          <div className="section-heading">

            <div>
              <div className="section-label">
                {t.currentSituation}
              </div>

              <h2>{t.areaRiskStatus}</h2>
            </div>

            <div className="demo-indicator">
              <span></span>
              {t.demoData}
            </div>

          </div>

          {/* RISK STATUS */}

          {!riskChecked ? (

            <div className="risk-status-card">

              <div className="risk-status-main">

                <div className="risk-status-icon">
                  <MapPin size={25} />
                </div>

                <div>
                  <span>{t.currentRiskLevel}</span>

                  <h3>{t.waitingForLocation}</h3>

                  <p>{t.selectArea}</p>
                </div>

              </div>

              <div className="risk-time">
                <Clock3 size={14} />
                {t.waiting}
              </div>

            </div>

          ) : (

            <div className="risk-status-card">

              <div className="risk-status-main">

                <div className="risk-status-icon">
                  <AlertTriangle size={25} />
                </div>

                <div>

                  <span>{t.currentRiskLevel}</span>

                  <h3>{t.highRisk}</h3>

                  <p>
                    {location.village},{" "}
                    {location.district},{" "}
                    {location.state}
                  </p>

                </div>

              </div>

              <div className="risk-time">
                <Clock3 size={14} />
                {t.updatedJustNow}
              </div>

            </div>

          )}

          {/* RECOMMENDED ACTION */}

          {riskChecked && (
            <div className="recommendation-card">

              <div className="recommendation-icon">
                <Siren size={20} />
              </div>

              <div>

                <strong>
                  {t.recommendedAction}
                </strong>

                <p>
                  {t.recommendedMessage}
                </p>

              </div>

            </div>
          )}

          {/* ENVIRONMENTAL INDICATORS */}

          <div className="indicator-grid">

            <div className="indicator-card">

              <div className="indicator-top">
                <div className="indicator-icon">
                  <CloudRain size={20} />
                </div>

                {t.rainfall}
              </div>

              <strong>
                {riskChecked ? "86 mm" : "--"}
              </strong>

              <p>
                {riskChecked
                  ? t.last3Hours
                  : t.noLocationSelected}
              </p>

            </div>

            <div className="indicator-card">

              <div className="indicator-top">
                <div className="indicator-icon">
                  <Droplets size={20} />
                </div>

                {t.soilMoisture}
              </div>

              <strong>
                {riskChecked ? "71%" : "--"}
              </strong>

              <p>
                {riskChecked
                  ? t.currentReading
                  : t.noLocationSelected}
              </p>

            </div>

            <div className="indicator-card">

              <div className="indicator-top">
                <div className="indicator-icon">
                  <Mountain size={20} />
                </div>

                {t.slopeStability}
              </div>

              <strong>
                {riskChecked
                  ? isHindi
                    ? "मध्यम"
                    : "Moderate"
                  : "--"}
              </strong>

              <p>
                {riskChecked
                  ? t.stabilityAssessment
                  : t.noLocationSelected}
              </p>

            </div>

            <div className="indicator-card">

              <div className="indicator-top">
                <div className="indicator-icon">
                  <Waves size={20} />
                </div>

                {t.waterLevel}
              </div>

              <strong>
                {riskChecked
                  ? isHindi
                    ? "बढ़ रहा है"
                    : "Rising"
                  : "--"}
              </strong>

              <p>
                {riskChecked
                  ? t.riverMonitoring
                  : t.noLocationSelected}
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          LIVE MONITORING
      ====================================================== */}
      <section className="monitoring-section">
        <div className="container">

          <div className="section-heading">

            <div>
              <div className="section-label">
                {t.liveMonitoring}
              </div>

              <h2>{t.situationAtGlance}</h2>
            </div>

          </div>

          <div className="monitoring-grid">

            <Link
              to="/alerts"
              className="monitor-card"
            >
              <div className="monitor-icon">
                <CloudRain size={25} />
              </div>

              <h3>{t.rainfallMonitoring}</h3>

              <p>{t.rainfallDescription}</p>

              <span className="card-link">
                {t.viewDetails}
                <ArrowRight size={15} />
              </span>
            </Link>

            <Link
              to="/risk-map"
              className="monitor-card"
            >
              <div className="monitor-icon">
                <Map size={25} />
              </div>

              <h3>{t.riskMap}</h3>

              <p>{t.riskMapDescription}</p>

              <span className="card-link">
                {t.openMap}
                <ArrowRight size={15} />
              </span>
            </Link>

            <Link
              to="/risk-map"
              className="monitor-card"
            >
              <div className="monitor-icon">
                <Radio size={25} />
              </div>

              <h3>{t.sensorNetwork}</h3>

              <p>{t.sensorDescription}</p>

              <span className="card-link">
                {t.viewSensors}
                <ArrowRight size={15} />
              </span>
            </Link>

          </div>

        </div>
      </section>

      {/* =====================================================
          CITIZEN SERVICES
      ====================================================== */}
      <section className="quick-section">
        <div className="container">

          <div className="section-heading">

            <div>
              <div className="section-label">
                {t.citizenServices}
              </div>

              <h2>{t.whatDoYouNeed}</h2>
            </div>

          </div>

          <div className="quick-grid">

            <Link
              to="/alerts"
              className="quick-card"
            >
              <div className="quick-icon">
                <ShieldAlert size={24} />
              </div>

              <div>
                <h3>{t.viewAlerts}</h3>

                <p>{t.alertsDescription}</p>
              </div>

              <span>
                {t.viewAlerts}
                <ArrowRight size={15} />
              </span>
            </Link>

            <Link
              to="/shelters"
              className="quick-card"
            >
              <div className="quick-icon">
                <HomeIcon size={24} />
              </div>

              <div>
                <h3>{t.findSafeShelter}</h3>

                <p>{t.shelterDescription}</p>
              </div>

              <span>
                {t.findShelter}
                <ArrowRight size={15} />
              </span>
            </Link>

            <Link
              to="/risk-map"
              className="quick-card"
            >
              <div className="quick-icon">
                <Map size={24} />
              </div>

              <div>
                <h3>{t.exploreRiskMap}</h3>

                <p>{t.riskMapAroundYou}</p>
              </div>

              <span>
                {t.exploreMap}
                <ArrowRight size={15} />
              </span>
            </Link>

            <Link
              to="/emergency"
              className="quick-card"
            >
              <div className="quick-icon">
                <Phone size={24} />
              </div>

              <div>
                <h3>{t.emergencyHelp}</h3>

                <p>{t.emergencyDescription}</p>
              </div>

              <span>
                {t.getHelp}
                <ArrowRight size={15} />
              </span>
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Home;