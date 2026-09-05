import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  AlertTriangle,
  CloudRain,
  MapPin,
  Clock,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  Droplets,
  Mountain,
  Waves,
  Map,
  Home,
  Phone,
  Radio,
  RefreshCw,
  Bell,
  Activity,
} from "lucide-react";

import { useLanguage } from "../LanguageContext.jsx";

/* =========================================================
   DEMO ALERT DATA
   ========================================================= */

const initialAlerts = [
  {
    id: 1,
    severity: "Critical",
    type: "Flash Flood Warning",
    location: "Darjeeling Town, Darjeeling, West Bengal",
    time: "10 minutes ago",
    validUntil: "Valid until 6:00 PM",

    message:
      "Heavy rainfall and rising water levels may cause sudden flooding in low-lying areas and near streams.",

    action:
      "Move to higher ground immediately and avoid crossing flooded roads or streams.",

    rainfall: "96 mm",
    rainfallPeriod: "Last 3 hours",

    soilMoisture: "87%",
    waterLevel: "Rising",
    slopeStability: "Critical",

    source: "Integrated Monitoring System",
    sensorStatus: "Active",
  },

  {
    id: 2,
    severity: "High",
    type: "Landslide Alert",
    location: "Kurseong, Darjeeling, West Bengal",
    time: "25 minutes ago",
    validUntil: "Valid until 8:00 PM",

    message:
      "High soil moisture and unstable slopes have increased the possibility of landslides.",

    action:
      "Avoid steep slopes and roads passing through known landslide-prone areas.",

    rainfall: "72 mm",
    rainfallPeriod: "Last 3 hours",

    soilMoisture: "81%",
    waterLevel: "Normal",
    slopeStability: "High Risk",

    source: "Slope Monitoring Network",
    sensorStatus: "Active",
  },

  {
    id: 3,
    severity: "Moderate",
    type: "Heavy Rainfall Advisory",
    location: "Kalimpong, West Bengal",
    time: "42 minutes ago",
    validUntil: "Valid until 10:00 PM",

    message:
      "Moderate to heavy rainfall is expected in the area over the next few hours.",

    action:
      "Stay indoors where possible and keep emergency supplies ready.",

    rainfall: "58 mm",
    rainfallPeriod: "Last 3 hours",

    soilMoisture: "68%",
    waterLevel: "Stable",
    slopeStability: "Moderate",

    source: "Weather Monitoring System",
    sensorStatus: "Active",
  },

  {
    id: 4,
    severity: "Advisory",
    type: "Weather Advisory",
    location: "Gangtok, Sikkim",
    time: "1 hour ago",
    validUntil: "Valid until tomorrow 8:00 AM",

    message:
      "Residents are advised to remain alert due to changing weather conditions.",

    action:
      "Monitor official alerts and avoid unnecessary travel during heavy rainfall.",

    rainfall: "34 mm",
    rainfallPeriod: "Last 3 hours",

    soilMoisture: "54%",
    waterLevel: "Normal",
    slopeStability: "Stable",

    source: "Weather Monitoring System",
    sensorStatus: "Active",
  },
];


/* =========================================================
   SEVERITY CONFIGURATION
   ========================================================= */

const severityConfig = {
  Critical: {
    className: "critical",
    icon: ShieldAlert,
  },

  High: {
    className: "high",
    icon: AlertTriangle,
  },

  Moderate: {
    className: "moderate",
    icon: CloudRain,
  },

  Advisory: {
    className: "advisory",
    icon: Info,
  },
};


/* =========================================================
   HINDI TRANSLATIONS
   ========================================================= */

const translations = {
  severity: {
    Critical: "गंभीर",
    High: "उच्च",
    Moderate: "मध्यम",
    Advisory: "सलाह",
  },

  type: {
    "Flash Flood Warning": "अचानक बाढ़ चेतावनी",
    "Landslide Alert": "भूस्खलन चेतावनी",
    "Heavy Rainfall Advisory": "भारी वर्षा सलाह",
    "Weather Advisory": "मौसम सलाह",
    "Flash Flood Watch": "अचानक बाढ़ निगरानी",
  },

  waterLevel: {
    Rising: "बढ़ रहा है",
    Normal: "सामान्य",
    Stable: "स्थिर",
  },

  slopeStability: {
    Critical: "गंभीर",
    "High Risk": "उच्च जोखिम",
    Moderate: "मध्यम",
    Stable: "स्थिर",
  },

  sensorStatus: {
    Active: "सक्रिय",
  },
};


/* =========================================================
   ALERT COMPONENT
   ========================================================= */

function Alerts() {

  const { language } = useLanguage();

  const [alerts, setAlerts] = useState(initialAlerts);

  const [filter, setFilter] = useState("All");

  const [expandedAlert, setExpandedAlert] = useState(null);

  const [newAlert, setNewAlert] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(
    "Just now"
  );


  /* =======================================================
     TRANSLATION HELPERS
     ======================================================= */

  const t = (englishText, hindiText) =>
    language === "hi" ? hindiText : englishText;


  const translateSeverity = (severity) =>
    language === "hi"
      ? translations.severity[severity] || severity
      : severity;


  const translateType = (type) =>
    language === "hi"
      ? translations.type[type] || type
      : type;


  const translateWaterLevel = (value) =>
    language === "hi"
      ? translations.waterLevel[value] || value
      : value;


  const translateSlope = (value) =>
    language === "hi"
      ? translations.slopeStability[value] || value
      : value;


  const translateSensorStatus = (value) =>
    language === "hi"
      ? translations.sensorStatus[value] || value
      : value;


  /* =======================================================
     SIMULATED LIVE ALERT
     ======================================================= */

  useEffect(() => {

    const timer = setTimeout(() => {
      setNewAlert(true);
    }, 8000);

    return () => clearTimeout(timer);

  }, []);


  /* =======================================================
     REFRESH DEMO DATA
     ======================================================= */

  const refreshAlerts = () => {

    setLastUpdated("Just now");

    setNewAlert(false);

    const simulatedAlert = {
      id: Date.now(),

      severity: "High",

      type: "Flash Flood Watch",

      location:
        "Joshimath, Chamoli, Uttarakhand",

      time: "Just now",

      validUntil:
        "Valid until 7:00 PM",

      message:
        "Increased rainfall and rising water levels have been detected. Flash flooding is possible in vulnerable areas.",

      action:
        "Remain alert, avoid river banks and low-lying areas, and be prepared to move to a designated safe shelter.",

      rainfall: "84 mm",

      rainfallPeriod:
        "Last 3 hours",

      soilMoisture: "79%",

      waterLevel: "Rising",

      slopeStability: "High Risk",

      source:
        "Integrated IoT Monitoring System",

      sensorStatus: "Active",
    };


    setAlerts((currentAlerts) => [
      simulatedAlert,
      ...currentAlerts,
    ]);

  };


  /* =======================================================
     FILTER
     ======================================================= */

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter(
          (alert) =>
            alert.severity === filter
        );


  /* =======================================================
     COUNTS
     ======================================================= */

  const criticalCount =
    alerts.filter(
      (alert) =>
        alert.severity === "Critical"
    ).length;


  const highCount =
    alerts.filter(
      (alert) =>
        alert.severity === "High"
    ).length;


  /* =======================================================
     EXPAND / COLLAPSE
     ======================================================= */

  const toggleAlert = (id) => {

    setExpandedAlert(
      expandedAlert === id
        ? null
        : id
    );

  };


  return (

    <main
      className="alerts-page"
      id="main-content"
    >

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="alerts-hero">

        <div className="page-container">

          <div className="page-heading">

            <div className="initiative-badge">

              <ShieldAlert size={16} />

              <span>
                {t(
                  "Government of India Disaster Management Initiative",
                  "भारत सरकार आपदा प्रबंधन पहल"
                )}
              </span>

            </div>


            <h1>
              {t(
                "Flood & Landslide Alerts",
                "बाढ़ और भूस्खलन चेतावनी"
              )}
            </h1>


            <p>
              {t(
                "Stay informed about active flood, landslide and extreme rainfall alerts affecting vulnerable areas.",
                "संवेदनशील क्षेत्रों को प्रभावित करने वाली बाढ़, भूस्खलन और अत्यधिक वर्षा की सक्रिय चेतावनियों से अवगत रहें।"
              )}
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ALERT SECTION
          ===================================================== */}

      <section className="alerts-section">

        <div className="page-container">


          {/* HEADER */}

          <div className="section-header">

            <div>

              <span className="section-label">

                {t(
                  "LIVE ALERTS",
                  "सक्रिय चेतावनियाँ"
                )}

              </span>


              <h2>

                {t(
                  "Active Warnings",
                  "सक्रिय चेतावनियाँ"
                )}

              </h2>


              <p>

                {t(
                  "Current disaster alerts and safety information from the integrated monitoring system.",
                  "एकीकृत निगरानी प्रणाली से वर्तमान आपदा चेतावनियाँ और सुरक्षा जानकारी।"
                )}

              </p>

            </div>


            {/* FILTER */}

            <div className="alert-filter">

              <label htmlFor="severity-filter">

                {t(
                  "Filter by severity",
                  "गंभीरता के अनुसार फ़िल्टर करें"
                )}

              </label>


              <div className="select-wrapper">

                <select
                  id="severity-filter"
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value)
                  }
                >

                  <option value="All">

                    {t(
                      "All Alerts",
                      "सभी चेतावनियाँ"
                    )}

                  </option>


                  <option value="Critical">

                    {t(
                      "Critical",
                      "गंभीर"
                    )}

                  </option>


                  <option value="High">

                    {t(
                      "High",
                      "उच्च"
                    )}

                  </option>


                  <option value="Moderate">

                    {t(
                      "Moderate",
                      "मध्यम"
                    )}

                  </option>


                  <option value="Advisory">

                    {t(
                      "Advisory",
                      "सलाह"
                    )}

                  </option>

                </select>


                <ChevronDown size={18} />

              </div>

            </div>

          </div>


          {/* =================================================
              NEW ALERT NOTIFICATION
              ================================================= */}

          {newAlert && (

            <button
              type="button"
              className="new-alert-notification"
              onClick={refreshAlerts}
            >

              <Bell size={18} />

              <span>

                {t(
                  "New alert received",
                  "नई चेतावनी प्राप्त हुई"
                )}

              </span>


              <span className="new-alert-action">

                {t(
                  "View",
                  "देखें"
                )}

              </span>

            </button>

          )}


          {/* =================================================
              SUMMARY
              ================================================= */}

          <div className="alert-summary">

            <div>

              <strong>
                {filteredAlerts.length}
              </strong>

              <span>

                {t(
                  "Active Alerts",
                  "सक्रिय चेतावनियाँ"
                )}

              </span>

            </div>


            <div>

              <strong>
                {criticalCount}
              </strong>

              <span>

                {t(
                  "Critical",
                  "गंभीर"
                )}

              </span>

            </div>


            <div>

              <strong>
                {highCount}
              </strong>

              <span>

                {t(
                  "High Risk",
                  "उच्च जोखिम"
                )}

              </span>

            </div>


            {/* LIVE STATUS */}

            <div className="live-status">

              <span className="live-dot"></span>

              <span>

                {t(
                  "Monitoring Active",
                  "निगरानी सक्रिय"
                )}

              </span>

            </div>


            {/* REFRESH */}

            <button
              type="button"
              className="refresh-button"
              onClick={refreshAlerts}
            >

              <RefreshCw size={15} />

              {t(
                "Refresh",
                "रीफ़्रेश"
              )}

            </button>

          </div>


          {/* =================================================
              ALERT LIST
              ================================================= */}

          <div className="alerts-list">

            {filteredAlerts.map((alert) => {

              const config =
                severityConfig[
                  alert.severity
                ];

              const Icon =
                config.icon;

              const isExpanded =
                expandedAlert ===
                alert.id;


              return (

                <article
                  className={`alert-card ${config.className}`}
                  key={alert.id}
                >

                  {/* ALERT HEADER */}

                  <button
                    type="button"
                    className="alert-card-button"
                    onClick={() =>
                      toggleAlert(
                        alert.id
                      )
                    }
                  >

                    <div className="alert-card-top">

                      <div
                        className={`severity-icon ${config.className}`}
                      >

                        <Icon size={23} />

                      </div>


                      <div className="alert-title">

                        <div className="severity-row">

                          <span
                            className={`severity-badge ${config.className}`}
                          >

                            {translateSeverity(
                              alert.severity
                            )}

                          </span>


                          <span className="alert-type">

                            {translateType(
                              alert.type
                            )}

                          </span>

                        </div>


                        <h3>

                          {translateType(
                            alert.type
                          )}

                        </h3>

                      </div>

                    </div>


                    <div className="expand-icon">

                      {isExpanded ? (

                        <ChevronUp size={21} />

                      ) : (

                        <ChevronDown size={21} />

                      )}

                    </div>

                  </button>


                  {/* LOCATION */}

                  <div className="alert-location">

                    <MapPin size={17} />

                    <span>
                      {alert.location}
                    </span>

                  </div>


                  {/* MESSAGE */}

                  <div className="alert-message">

                    {language === "hi"
                      ? alert.id === 1
                        ? "भारी वर्षा और बढ़ते जल स्तर के कारण निचले क्षेत्रों और जलधाराओं के पास अचानक बाढ़ आ सकती है।"
                        : alert.id === 2
                        ? "अधिक मिट्टी की नमी और अस्थिर ढलानों के कारण भूस्खलन की संभावना बढ़ गई है।"
                        : alert.id === 3
                        ? "अगले कुछ घंटों में क्षेत्र में मध्यम से भारी वर्षा होने की संभावना है।"
                        : alert.id === 4
                        ? "बदलती मौसम परिस्थितियों के कारण निवासियों को सतर्क रहने की सलाह दी जाती है।"
                        : "वर्षा और बढ़ते जल स्तर में वृद्धि दर्ज की गई है। संवेदनशील क्षेत्रों में अचानक बाढ़ संभव है।"
                      : alert.message}

                  </div>


                  {/* RECOMMENDED ACTION */}

                  <div className="recommended-action">

                    <div className="recommended-action-heading">

                      <ShieldAlert size={17} />

                      <strong>

                        {t(
                          "Recommended Action",
                          "अनुशंसित कार्रवाई"
                        )}

                      </strong>

                    </div>


                    <p>

                      {language === "hi"
                        ? alert.id === 1
                          ? "तुरंत ऊँचे स्थान पर जाएँ और बाढ़ वाली सड़कों या जलधाराओं को पार करने से बचें।"
                          : alert.id === 2
                          ? "खड़ी ढलानों और ज्ञात भूस्खलन संभावित क्षेत्रों से गुजरने वाली सड़कों से बचें।"
                          : alert.id === 3
                          ? "जहाँ संभव हो घर के अंदर रहें और आपातकालीन सामान तैयार रखें।"
                          : alert.id === 4
                          ? "आधिकारिक चेतावनियों पर नज़र रखें और भारी वर्षा के दौरान अनावश्यक यात्रा से बचें।"
                          : "सतर्क रहें, नदी किनारों और निचले क्षेत्रों से बचें और निर्धारित सुरक्षित आश्रय में जाने के लिए तैयार रहें।"
                        : alert.action}

                    </p>

                  </div>


                  {/* EXPANDED SENSOR DATA */}

                  {isExpanded && (

                    <div className="alert-details">

                      <div className="details-heading">

                        <Activity size={18} />

                        <h4>

                          {t(
                            "Environmental Indicators",
                            "पर्यावरणीय संकेतक"
                          )}

                        </h4>

                      </div>


                      <div className="sensor-grid">


                        {/* RAINFALL */}

                        <div className="sensor-card">

                          <div className="sensor-icon">

                            <CloudRain size={19} />

                          </div>


                          <div>

                            <span>

                              {t(
                                "Rainfall",
                                "वर्षा"
                              )}

                            </span>


                            <strong>
                              {alert.rainfall}
                            </strong>


                            <small>

                              {t(
                                alert.rainfallPeriod,
                                "पिछले 3 घंटे"
                              )}

                            </small>

                          </div>

                        </div>


                        {/* SOIL */}

                        <div className="sensor-card">

                          <div className="sensor-icon">

                            <Droplets size={19} />

                          </div>


                          <div>

                            <span>

                              {t(
                                "Soil Moisture",
                                "मिट्टी की नमी"
                              )}

                            </span>


                            <strong>
                              {alert.soilMoisture}
                            </strong>


                            <small>

                              {t(
                                "Current reading",
                                "वर्तमान रीडिंग"
                              )}

                            </small>

                          </div>

                        </div>


                        {/* WATER */}

                        <div className="sensor-card">

                          <div className="sensor-icon">

                            <Waves size={19} />

                          </div>


                          <div>

                            <span>

                              {t(
                                "Water Level",
                                "जल स्तर"
                              )}

                            </span>


                            <strong>

                              {translateWaterLevel(
                                alert.waterLevel
                              )}

                            </strong>


                            <small>

                              {t(
                                "River monitoring",
                                "नदी निगरानी"
                              )}

                            </small>

                          </div>

                        </div>


                        {/* SLOPE */}

                        <div className="sensor-card">

                          <div className="sensor-icon">

                            <Mountain size={19} />

                          </div>


                          <div>

                            <span>

                              {t(
                                "Slope Stability",
                                "ढलान स्थिरता"
                              )}

                            </span>


                            <strong>

                              {translateSlope(
                                alert.slopeStability
                              )}

                            </strong>


                            <small>

                              {t(
                                "Stability assessment",
                                "स्थिरता मूल्यांकन"
                              )}

                            </small>

                          </div>

                        </div>

                      </div>


                      {/* DATA SOURCE */}

                      <div className="data-source">

                        <Radio size={16} />

                        <span>

                          {t(
                            "Data source:",
                            "डेटा स्रोत:"
                          )}

                        </span>


                        <strong>
                          {alert.source}
                        </strong>


                        <span className="sensor-active">

                          ●{" "}

                          {translateSensorStatus(
                            alert.sensorStatus
                          )}

                        </span>

                      </div>

                    </div>

                  )}


                  {/* ACTION BUTTONS */}

                  <div className="alert-actions">

                    <Link
                      to="/risk-map"
                      className="alert-action primary"
                    >

                      <Map size={16} />

                      {t(
                        "View Risk Map",
                        "जोखिम मानचित्र देखें"
                      )}

                    </Link>


                    <Link
                      to="/shelters"
                      className="alert-action"
                    >

                      <Home size={16} />

                      {t(
                        "Find Safe Shelter",
                        "सुरक्षित आश्रय खोजें"
                      )}

                    </Link>

                  </div>


                  {/* FOOTER */}

                  <div className="alert-footer">

                    <span>

                      <Clock size={15} />

                      {t(
                        "Issued",
                        "जारी"
                      )}{" "}

                      {alert.time}

                    </span>


                    <span>

                      {language === "hi"
                        ? alert.validUntil
                            .replace(
                              "Valid until",
                              "मान्य"
                            )
                            .replace(
                              "tomorrow",
                              "कल"
                            )
                        : alert.validUntil}

                    </span>

                  </div>

                </article>

              );

            })}

          </div>


          {/* =================================================
              NO ALERTS
              ================================================= */}

          {filteredAlerts.length === 0 && (

            <div className="no-alerts">

              <Info size={34} />

              <h3>

                {t(
                  "No alerts found",
                  "कोई चेतावनी नहीं मिली"
                )}

              </h3>


              <p>

                {t(
                  "There are no alerts matching the selected severity.",
                  "चयनित गंभीरता से मेल खाने वाली कोई चेतावनी नहीं है।"
                )}

              </p>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          EMERGENCY BANNER
          ===================================================== */}

      <section className="emergency-banner">

        <div className="page-container">

          <div className="emergency-icon">

            <ShieldAlert size={27} />

          </div>


          <div>

            <h2>

              {t(
                "In an Emergency",
                "आपातकाल में"
              )}

            </h2>


            <p>

              {t(
                "If you are in immediate danger, move to a safe location and contact emergency services.",
                "यदि आप तत्काल खतरे में हैं, तो सुरक्षित स्थान पर जाएँ और आपातकालीन सेवाओं से संपर्क करें।"
              )}

            </p>

          </div>


          <Link
            to="/emergency"
            className="emergency-button"
          >

            <Phone size={17} />

            {t(
              "Emergency Help",
              "आपातकालीन सहायता"
            )}

          </Link>

        </div>

      </section>


      {/* =====================================================
          CSS — YOUR ORIGINAL CSS, UNCHANGED
          ===================================================== */}

      <style>{`

        .alerts-page {
          width: 100%;
          background: #f7f9fb;
          color: #172333;
        }

        .page-container {
          width: min(1064px, calc(100% - 48px));
          margin: 0 auto;
        }

        .alerts-hero {
          position: relative;
          overflow: hidden;

          background: linear-gradient(
            120deg,
            #0b3558 0%,
            #075985 55%,
            #0e6e31 130%
          );

          border-bottom: none;

          padding: 60px 0 56px;
        }

        .alerts-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            #ff8f1f 0%,
            transparent 25%,
            transparent 75%,
            #128a3e 100%
          );
          opacity: 0.18;
          pointer-events: none;
        }

        .alerts-hero::after {
          content: "";

          position: absolute;

          width: 300px;
          height: 300px;

          right: -100px;
          top: -150px;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.06);
        }

        .page-heading {
          position: relative;
          z-index: 2;

          display: flex;
          flex-direction: column;
          align-items: flex-start;

          max-width: 780px;
        }

        .initiative-badge {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          border: 1px solid rgba(255, 255, 255, 0.3);

          border-left: 4px solid #ff8f1f;

          background: rgba(255, 255, 255, 0.12);

          border-radius: 999px;

          padding: 8px 16px;

          font-size: 13px;

          font-weight: 700;

          color: #ffffff;

          line-height: 1.3;

          margin-bottom: 23px;

          box-shadow: none;
        }

        .initiative-badge svg {
          color: #ffffff;
          flex-shrink: 0;
        }

        .initiative-badge span {
          display: inline-block;
        }

        .page-heading h1 {
          margin: 0 0 14px;

          font-size: 48px;

          line-height: 1.08;

          color: #ffffff;

          font-weight: 800;

          letter-spacing: -1.3px;

          text-align: left;
        }

        .page-heading p {
          margin: 0;

          max-width: 680px;

          color: rgba(255, 255, 255, 0.88);

          font-size: 17px;

          line-height: 1.65;

          text-align: left;
        }

        .alerts-section {
          padding: 55px 0 70px;
        }

        .section-header {
          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          gap: 30px;

          margin-bottom: 27px;
        }

        .section-label {
          display: block;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 1.4px;

          color: #17649d;

          margin-bottom: 8px;
        }

        .section-header h2 {
          margin: 0 0 8px;

          font-size: 30px;

          color: #172a3c;

          font-weight: 800;

          letter-spacing: -0.5px;
        }

        .section-header p {
          color: #68798a;

          margin: 0;

          font-size: 14px;
        }

        .alert-filter {
          min-width: 220px;
        }

        .alert-filter label {
          display: block;

          font-size: 12px;

          font-weight: 700;

          color: #45586b;

          margin-bottom: 7px;
        }

        .select-wrapper {
          position: relative;
        }

        .select-wrapper select {
          width: 100%;

          appearance: none;

          border: 1px solid #cbd6e0;

          background: #ffffff;

          border-radius: 6px;

          padding: 12px 38px 12px 13px;

          font-size: 14px;

          color: #24384b;

          cursor: pointer;

          outline: none;
        }

        .select-wrapper select:focus {
          border-color: #17649d;

          box-shadow:
            0 0 0 3px rgba(23, 100, 157, 0.1);
        }

        .select-wrapper svg {
          position: absolute;

          right: 12px;

          top: 50%;

          transform: translateY(-50%);

          pointer-events: none;

          color: #607285;
        }

        .new-alert-notification {
          width: 100%;

          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 17px;

          padding: 13px 16px;

          border: 1px solid #b7d2e7;

          border-left: 4px solid #17649d;

          border-radius: 6px;

          background: #edf6fc;

          color: #124f7e;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          text-align: left;
        }

        .new-alert-action {
          margin-left: auto;

          text-decoration: underline;
        }

        .alert-summary {
          display: flex;

          align-items: center;

          gap: 35px;

          border-top: 1px solid #dce3e9;

          border-bottom: 1px solid #dce3e9;

          padding: 17px 0;

          margin-bottom: 24px;
        }

        .alert-summary > div:not(.live-status) {
          display: flex;

          align-items: baseline;

          gap: 8px;
        }

        .alert-summary strong {
          font-size: 21px;

          color: #172a3c;
        }

        .alert-summary span {
          color: #6b7b8b;

          font-size: 13px;
        }

        .live-status {
          margin-left: auto;

          display: flex;

          align-items: center;

          gap: 7px;

          color: #386047;

          font-size: 12px;

          font-weight: 700;
        }

        .live-dot {
          width: 8px;

          height: 8px;

          border-radius: 50%;

          background: #238636;

          box-shadow:
            0 0 0 4px rgba(35, 134, 54, 0.1);
        }

        .refresh-button {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          border: 1px solid #ccd6df;

          background: #ffffff;

          color: #34495c;

          border-radius: 5px;

          padding: 7px 11px;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }

        .refresh-button:hover {
          background: #f2f6f9;

          border-color: #aebdca;
        }

        .alerts-list {
          display: grid;

          gap: 18px;
        }

        .alert-card {
          position: relative;

          border: 1px solid #d4dde5;

          border-left: 5px solid #6d7d8c;

          border-radius: 7px;

          background: #ffffff;

          padding: 22px 25px 19px;

          box-shadow:
            0 3px 12px rgba(25, 50, 75, 0.045);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .alert-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 24px rgba(25, 50, 75, 0.08);
        }

        .alert-card.critical {
          border-left-color: #b42318;
        }

        .alert-card.high {
          border-left-color: #d06000;
        }

        .alert-card.moderate {
          border-left-color: #9a7a00;
        }

        .alert-card.advisory {
          border-left-color: #426783;
        }

        .alert-card-button {
          width: 100%;

          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 15px;

          border: 0;

          background: transparent;

          padding: 0;

          cursor: pointer;

          text-align: left;
        }

        .alert-card-top {
          display: flex;

          gap: 15px;

          align-items: flex-start;
        }

        .severity-icon {
          width: 47px;

          height: 47px;

          border-radius: 50%;

          display: flex;

          justify-content: center;

          align-items: center;

          flex-shrink: 0;
        }

        .severity-icon.critical {
          background: #fce9e7;

          color: #b42318;
        }

        .severity-icon.high {
          background: #fff0e0;

          color: #ad4c00;
        }

        .severity-icon.moderate {
          background: #fff7d9;

          color: #806800;
        }

        .severity-icon.advisory {
          background: #eaf2f8;

          color: #426783;
        }

        .alert-title {
          min-width: 0;
        }

        .severity-row {
          display: flex;

          align-items: center;

          gap: 9px;

          margin-bottom: 6px;

          flex-wrap: wrap;
        }

        .severity-badge {
          display: inline-flex;

          padding: 4px 9px;

          border-radius: 3px;

          font-size: 10px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.6px;
        }

        .severity-badge.critical {
          background: #fce9e7;

          color: #a01f15;
        }

        .severity-badge.high {
          background: #fff0e0;

          color: #914300;
        }

        .severity-badge.moderate {
          background: #fff7d9;

          color: #705d00;
        }

        .severity-badge.advisory {
          background: #eaf2f8;

          color: #385a72;
        }

        .alert-type {
          color: #7b8997;

          font-size: 12px;
        }

        .alert-title h3 {
          margin: 0;

          font-size: 20px;

          color: #16293a;

          font-weight: 800;
        }

        .expand-icon {
          display: flex;

          align-items: center;

          justify-content: center;

          width: 34px;

          height: 34px;

          flex-shrink: 0;

          border: 1px solid #dbe2e8;

          border-radius: 5px;

          color: #627384;

          background: #fafcfd;
        }

        .alert-location {
          display: flex;

          align-items: center;

          gap: 8px;

          margin: 18px 0 12px;

          color: #31465a;

          font-size: 14px;

          font-weight: 700;
        }

        .alert-location svg {
          color: #17649d;

          flex-shrink: 0;
        }

        .alert-message {
          color: #586a7b;

          line-height: 1.6;

          font-size: 14px;

          margin-bottom: 17px;
        }

        .recommended-action {
          background: #f4f7f9;

          border: 1px solid #e0e6eb;

          border-radius: 5px;

          padding: 13px 15px;
        }

        .recommended-action-heading {
          display: flex;

          align-items: center;

          gap: 7px;

          color: #263c50;
        }

        .recommended-action-heading svg {
          color: #17649d;
        }

        .recommended-action strong {
          font-size: 13px;
        }

        .recommended-action p {
          margin: 5px 0 0;

          color: #596a7a;

          font-size: 13px;

          line-height: 1.55;
        }

        .alert-details {
          margin-top: 18px;

          padding-top: 18px;

          border-top: 1px solid #e3e8ed;
        }

        .details-heading {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 13px;

          color: #253b50;
        }

        .details-heading svg {
          color: #17649d;
        }

        .details-heading h4 {
          margin: 0;

          font-size: 14px;
        }

        .sensor-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 10px;
        }

        .sensor-card {
          display: flex;

          gap: 10px;

          align-items: center;

          padding: 13px;

          background: #f8fafb;

          border: 1px solid #e1e7ec;

          border-radius: 6px;
        }

        .sensor-icon {
          width: 34px;

          height: 34px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          background: #eaf3f9;

          color: #17649d;

          border-radius: 6px;
        }

        .sensor-card span {
          display: block;

          color: #708090;

          font-size: 10px;

          font-weight: 600;
        }

        .sensor-card strong {
          display: block;

          margin-top: 2px;

          color: #1d3348;

          font-size: 15px;
        }

        .sensor-card small {
          display: block;

          margin-top: 2px;

          color: #8a98a5;

          font-size: 9px;
        }

        .data-source {
          display: flex;

          align-items: center;

          gap: 6px;

          flex-wrap: wrap;

          margin-top: 13px;

          color: #788694;

          font-size: 11px;
        }

        .data-source svg {
          color: #17649d;
        }

        .data-source strong {
          color: #40576b;
        }

        .sensor-active {
          color: #317346 !important;

          font-weight: 700;
        }

        .alert-actions {
          display: flex;

          gap: 9px;

          margin-top: 17px;

          padding-top: 16px;

          border-top: 1px solid #edf0f2;
        }

        .alert-action {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          min-height: 38px;

          padding: 0 13px;

          border: 1px solid #ccd7e0;

          background: #ffffff;

          color: #284258;

          border-radius: 5px;

          text-decoration: none;

          font-size: 12px;

          font-weight: 700;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .alert-action:hover {
          background: #f1f6fa;

          border-color: #aebfce;
        }

        .alert-action.primary {
          background: #174f7b;

          border-color: #174f7b;

          color: #ffffff;
        }

        .alert-action.primary:hover {
          background: #103f63;
        }

        .alert-footer {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 20px;

          border-top: 1px solid #eeeeee;

          margin-top: 15px;

          padding-top: 13px;

          color: #7b8996;

          font-size: 11px;
        }

        .alert-footer span:first-child {
          display: flex;

          align-items: center;

          gap: 5px;
        }

        .no-alerts {
          text-align: center;

          border: 1px solid #dbe2e7;

          background: #ffffff;

          border-radius: 7px;

          padding: 55px 20px;

          color: #6b7b89;
        }

        .no-alerts h3 {
          margin: 12px 0 5px;

          color: #25384a;
        }

        .no-alerts p {
          margin: 0;

          font-size: 14px;
        }

        .emergency-banner {
          background:
            linear-gradient(
              90deg,
              #fff7ed,
              #fffaf5
            );

          border-top: 1px solid #f1d7bc;

          border-bottom: 1px solid #f1d7bc;

          padding: 27px 0;
        }

        .emergency-banner .page-container {
          display: flex;

          align-items: center;

          gap: 17px;
        }

        .emergency-icon {
          width: 48px;

          height: 48px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #ffffff;

          border: 1px solid #edcfb2;

          border-radius: 6px;

          color: #b45309;

          flex-shrink: 0;
        }

        .emergency-banner h2 {
          margin: 0 0 4px;

          font-size: 19px;

          color: #6b3410;
        }

        .emergency-banner p {
          margin: 0;

          color: #805a3c;

          font-size: 13px;
        }

        .emergency-button {
          margin-left: auto;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          min-height: 43px;

          padding: 0 18px;

          background: #a94308;

          color: #ffffff;

          border-radius: 5px;

          text-decoration: none;

          font-size: 13px;

          font-weight: 800;

          white-space: nowrap;
        }

        .emergency-button:hover {
          background: #873707;
        }

        @media (max-width: 850px) {

          .page-container {
            width: min(
              100% - 34px,
              1064px
            );
          }

          .section-header {
            align-items: flex-start;

            flex-direction: column;
          }

          .alert-filter {
            width: 260px;
          }

          .sensor-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .alert-summary {
            flex-wrap: wrap;

            gap: 17px 25px;
          }

          .live-status {
            margin-left: 0;
          }

        }

        @media (max-width: 600px) {

          .page-container {
            width:
              calc(100% - 28px);
          }

          .alerts-hero {
            padding:
              42px 0 40px;
          }

          .page-heading h1 {
            font-size: 35px;

            letter-spacing: -0.8px;
          }

          .page-heading p {
            font-size: 15px;
          }

          .initiative-badge {
            font-size: 11px;
          }

          .alerts-section {
            padding:
              42px 0 55px;
          }

          .section-header h2 {
            font-size: 27px;
          }

          .alert-filter {
            width: 100%;
          }

          .alert-summary {
            align-items: flex-start;

            flex-direction: column;

            gap: 12px;
          }

          .refresh-button {
            width: 100%;

            justify-content: center;
          }

          .alert-card {
            padding:
              19px 17px 17px;
          }

          .alert-card-top {
            gap: 10px;
          }

          .severity-icon {
            width: 40px;

            height: 40px;
          }

          .alert-title h3 {
            font-size: 17px;
          }

          .alert-type {
            font-size: 11px;
          }

          .alert-location {
            align-items:
              flex-start;

            font-size: 13px;
          }

          .sensor-grid {
            grid-template-columns:
              1fr;
          }

          .alert-actions {
            flex-direction:
              column;
          }

          .alert-action {
            width: 100%;

            box-sizing: border-box;
          }

          .alert-footer {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap: 7px;
          }

          .emergency-banner
          .page-container {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .emergency-button {
            width: 100%;

            box-sizing:
              border-box;

            margin-left: 0;
          }

        }

      `}</style>

    </main>
  );
}


export default Alerts;