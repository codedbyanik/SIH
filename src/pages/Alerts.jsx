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

  const [alerts, setAlerts] = useState([]);

  const [systemAlerts, setSystemAlerts] = useState(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("sih_system_alerts") || "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [emergencyAlert, setEmergencyAlert] = useState(null);

  const [filter, setFilter] = useState("All");

  const [expandedAlert, setExpandedAlert] = useState(null);

  const [newAlert, setNewAlert] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(
    "Connecting..."
  );

  const [loading, setLoading] = useState(true);

  const [backendOnline, setBackendOnline] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:5000";


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
     LIVE ALERTS FROM BACKEND
     ======================================================= */

  const fetchAlerts = async (showNotification = false) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/alerts`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Alert API returned ${response.status}`);
      }

      const data = await response.json();

      const normalized = Array.isArray(data)
        ? data.map((alert) => ({
            ...alert,
            id: alert.id ?? Date.now(),
            severity: alert.severity || "Advisory",
            type: alert.type || "Flash Flood Watch",
            locationEn:
              alert.locationEn ||
              `${alert.state || "Kerala"} · ${alert.district || "Wayanad"}`,
            locationHi:
              alert.locationHi ||
              `केरल · ${alert.district || "वायनाड"}`,
            location:
              language === "hi"
                ? alert.locationHi ||
                  `केरल · ${alert.district || "वायनाड"}`
                : alert.locationEn ||
                  `${alert.state || "Kerala"} · ${alert.district || "Wayanad"}`,
            time: alert.issued || "Just now",
            validUntil: "Active",
            message:
              alert.severity === "Critical"
                ? "Critical flash-flood conditions detected. Immediate attention is required in the affected area."
                : alert.severity === "High"
                ? "Elevated flash-flood risk detected. Closely monitor rainfall and local conditions."
                : alert.severity === "Moderate"
                ? "Moderate hazard conditions detected. Continue monitoring rainfall and local conditions."
                : "Current indicators require routine monitoring.",
            action:
              alert.severity === "Critical"
                ? "Move to higher ground immediately and follow official emergency instructions."
                : alert.severity === "High"
                ? "Avoid river banks, streams and low-lying areas and be prepared to move to a safe location."
                : alert.severity === "Moderate"
                ? "Stay alert, monitor changing conditions and keep emergency supplies ready."
                : "Continue routine monitoring and follow official advisories.",
            rainfall: alert.rainfall || "Not available",
            rainfallPeriod: "Current monitoring",
            soilMoisture: "Not available",
            waterLevel: alert.waterLevel || "Not available",
            slopeStability: "Not available",
            source: "Integrated Flash Flood Monitoring System",
            sensorStatus: "Active",
          }))
        : [];

      setAlerts(normalized);
      setBackendOnline(true);
      setLoading(false);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      if (showNotification) {
        setNewAlert(true);
      }
    } catch (error) {
      console.error("Failed to fetch live alerts:", error);
      setBackendOnline(false);
      setLoading(false);
      setLastUpdated("Connection unavailable");
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* =======================================================
     RISK MAP -> CITIZEN ALERT BRIDGE
     ======================================================= */

  useEffect(() => {
    const getSeverity = (payload) => {
      const mm = Number(
        payload?.simulationRainfall ??
        payload?.rainfall ??
        0
      );

      if (mm >= 140) return "Critical";
      if (mm >= 80) return "High";
      if (mm >= 50) return "Moderate";
      return "Advisory";
    };

    const getMessage = (severity) => {
      if (severity === "Critical") {
        return "Critical rainfall conditions detected. Move to a safe elevated location immediately and follow local authority instructions.";
      }
      if (severity === "High") {
        return "High rainfall warning. Increase preparedness immediately and avoid low-lying areas, streams and river banks.";
      }
      if (severity === "Moderate") {
        return "Moderate rainfall conditions detected. Stay alert and follow official local advisories.";
      }
      return "Advisory rainfall conditions detected. Continue routine monitoring and follow official advisories.";
    };

    const normalize = (payload) => {
      const rainfall = Number(
        payload?.simulationRainfall ??
        payload?.rainfall ??
        0
      );
      const severity = getSeverity(payload);

      return {
        ...payload,
        id: payload?.id || `AUTO-${Date.now()}`,
        severity,
        type: severity === "Critical" || severity === "High"
          ? "Flash Flood Warning"
          : "Flash Flood Watch",
        zone: payload?.zone || payload?.location || "Wayanad",
        district: payload?.district || "Wayanad",
        state: payload?.state || "Kerala",
        simulationRainfall: rainfall,
        mlHazardScore: Number(
          payload?.mlHazardScore ??
          payload?.ml_hazard_score ??
          0
        ),
        timestamp: payload?.timestamp || new Date().toISOString(),
        message: payload?.message || getMessage(severity),
      };
    };

    const toCitizenCard = (payload) => {
      const a = normalize(payload);
      return {
        ...a,
        id: a.id,
        severity: a.severity,
        locationEn: `${a.state} · ${a.zone}`,
        locationHi: `केरल · ${a.zone}`,
        location:
          language === "hi"
            ? `केरल · ${a.zone}`
            : `${a.state} · ${a.zone}`,
        time: "Just now",
        validUntil: "Active",
        validUntilText: "Active",
        rainfall: `${a.simulationRainfall.toFixed(0)} mm`,
        rainfallPeriod: "Simulated rainfall scenario",
        soilMoisture: "Integrated model",
        waterLevel: "Monitoring",
        slopeStability:
          a.severity === "Critical"
            ? "Critical"
            : a.severity === "High"
              ? "High Risk"
              : a.severity === "Moderate"
                ? "Moderate"
                : "Monitoring",
        action:
          a.severity === "Critical"
            ? "Move to higher ground immediately and follow official emergency instructions."
            : a.severity === "High"
              ? "Avoid low-lying areas, streams and river banks and prepare to move to safety."
              : a.severity === "Moderate"
                ? "Stay alert, monitor official updates and be prepared to move if conditions worsen."
                : "Continue routine monitoring and follow official advisories.",
        source: "Smart India Hackathon Flash Flood ML System",
        sensorStatus: "Active",
        systemGenerated: true,
      };
    };

    const playAirRaidSiren = (severity) => {
      if (severity !== "High" && severity !== "Critical") return;

      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

        const master = ctx.createGain();
        master.gain.setValueAtTime(
          severity === "Critical" ? 0.18 : 0.14,
          now
        );
        master.connect(ctx.destination);

        const cycles = severity === "Critical" ? 5 : 3;

        for (let i = 0; i < cycles; i += 1) {
          const startAt = now + i * 0.95;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(430, startAt);
          osc.frequency.exponentialRampToValueAtTime(
            920,
            startAt + 0.42
          );
          osc.frequency.exponentialRampToValueAtTime(
            430,
            startAt + 0.82
          );

          gain.gain.setValueAtTime(0, startAt);
          gain.gain.linearRampToValueAtTime(
            0.70,
            startAt + 0.06
          );
          gain.gain.linearRampToValueAtTime(
            0,
            startAt + 0.88
          );

          osc.connect(gain);
          gain.connect(master);
          osc.start(startAt);
          osc.stop(startAt + 0.9);
        }

        window.setTimeout(() => {
          try {
            master.disconnect();
            ctx.close();
          } catch (_) {}
        }, cycles * 950 + 700);
      } catch (error) {
        console.warn("Citizen alert siren unavailable:", error);
      }
    };

    const receive = (payload, playSound = true) => {
      const rainfall = Number(
        payload?.simulationRainfall ??
        payload?.rainfall ??
        0
      );

      if (!Number.isFinite(rainfall) || rainfall < 0) return;

      const normalized = normalize(payload);
      const card = toCitizenCard(normalized);

      setSystemAlerts((current) => {
        const next = [
          card,
          ...current.filter(
            (item) => String(item.id) !== String(card.id)
          ),
        ].slice(0, 50);

        try {
          window.localStorage.setItem(
            "sih_system_alerts",
            JSON.stringify(next)
          );
        } catch {}

        return next;
      });

      setAlerts((current) => [
        card,
        ...current.filter(
          (item) => String(item.id) !== String(card.id)
        ),
      ]);

      setEmergencyAlert(normalized);
      setNewAlert(true);

      if (playSound) {
        playAirRaidSiren(normalized.severity);
      }
    };

    const handleCitizenAlert = (event) => {
      receive(event?.detail || {}, true);
    };

    const handleStorage = (event) => {
      if (
        event.key === "sih_citizen_alert_event" &&
        event.newValue
      ) {
        try {
          receive(JSON.parse(event.newValue), true);
        } catch {}
      }

      if (
        event.key === "sih_system_alerts" &&
        event.newValue
      ) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed)) {
            setSystemAlerts(parsed);
            setAlerts((current) => {
              const ids = new Set(
                parsed.map((item) => String(item.id))
              );
              return [
                ...parsed,
                ...current.filter(
                  (item) => !ids.has(String(item.id))
                ),
              ];
            });
          }
        } catch {}
      }
    };

    window.addEventListener(
      "sih-citizen-alert",
      handleCitizenAlert
    );
    window.addEventListener(
      "storage",
      handleStorage
    );

    // Restore the latest event if Citizen Alerts was opened after
    // the Risk Map generated it. No siren is played on page load.
    try {
      const saved =
        window.localStorage.getItem(
          "sih_citizen_alert_event"
        );

      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = normalize(parsed);
        const card = toCitizenCard(normalized);

        setEmergencyAlert(normalized);
        setSystemAlerts((current) => [
          card,
          ...current.filter(
            (item) => String(item.id) !== String(card.id)
          ),
        ]);
        setAlerts((current) => [
          card,
          ...current.filter(
            (item) => String(item.id) !== String(card.id)
          ),
        ]);
      }
    } catch {}

    return () => {
      window.removeEventListener(
        "sih-citizen-alert",
        handleCitizenAlert
      );
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  useEffect(() => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) => ({
        ...alert,
        location:
          language === "hi"
            ? alert.locationHi || alert.location
            : alert.locationEn || alert.location,
      }))
    );
  }, [language]);

  const refreshAlerts = async () => {
    setNewAlert(false);
    await fetchAlerts(true);
  };


  /* =======================================================
     FILTER
     ======================================================= */

  const displayedAlerts = [
    ...systemAlerts,
    ...alerts,
  ].filter(
    (alert, index, list) =>
      index ===
      list.findIndex(
        (item) => String(item.id) === String(alert.id)
      )
  );

  const filteredAlerts =
    filter === "All"
      ? displayedAlerts
      : displayedAlerts.filter(
          (alert) =>
            alert.severity === filter
        );


  /* =======================================================
     COUNTS
     ======================================================= */

  const criticalCount =
    displayedAlerts.filter(
      (alert) =>
        alert.severity === "Critical"
    ).length;


  const highCount =
    displayedAlerts.filter(
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

      {emergencyAlert && (
        <div
          className="citizen-emergency-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-live="assertive"
          aria-label="Flash flood notification"
        >
          <div
            className="citizen-emergency-card"
            data-severity={String(
              emergencyAlert.severity || "Advisory"
            ).toLowerCase()}
          >
            <div className="citizen-emergency-icon">
              <AlertTriangle size={42} strokeWidth={2.2} />
            </div>

            <div className="citizen-emergency-kicker">
              {emergencyAlert.severity === "Critical"
                ? t("CRITICAL EMERGENCY", "अत्यंत गंभीर आपातकाल")
                : emergencyAlert.severity === "High"
                  ? t("HIGH RISK WARNING", "उच्च जोखिम चेतावनी")
                  : emergencyAlert.severity === "Moderate"
                    ? t("MODERATE RISK WARNING", "मध्यम जोखिम चेतावनी")
                    : t("ADVISORY", "सावधानी")}
            </div>

            <h2>
              {emergencyAlert.severity === "Critical"
                ? t("FLASH FLOOD ALERT", "अचानक बाढ़ चेतावनी")
                : emergencyAlert.severity === "High"
                  ? t("FLASH FLOOD WARNING", "अचानक बाढ़ चेतावनी")
                  : emergencyAlert.severity === "Moderate"
                    ? t("FLASH FLOOD WARNING", "अचानक बाढ़ चेतावनी")
                    : t("FLASH FLOOD ADVISORY", "अचानक बाढ़ परामर्श")}
            </h2>

            <div className="citizen-emergency-severity">
              {String(
                emergencyAlert.severity || "Advisory"
              ).toUpperCase()}{" "}
              {t("RISK LEVEL", "जोखिम स्तर")}
            </div>

            <div className="citizen-emergency-location">
              <MapPin size={21} />
              <span>
                {emergencyAlert.zone || "Wayanad"} ·{" "}
                {emergencyAlert.district || "Wayanad"}
              </span>
            </div>

            <div className="citizen-emergency-stats">
              <div>
                <span>{t("RAINFALL", "वर्षा")}</span>
                <strong>
                  {Number(
                    emergencyAlert.simulationRainfall || 0
                  ).toFixed(0)} mm
                </strong>
              </div>
              <div>
                <span>{t("ML HAZARD SIGNAL", "ML खतरा संकेत")}</span>
                <strong>
                  {Math.round(
                    Number(
                      emergencyAlert.mlHazardScore || 0
                    ) * 100
                  )}/100
                </strong>
              </div>
            </div>

            <div className="citizen-emergency-message">
              <strong>
                {emergencyAlert.severity === "Critical"
                  ? t("IMMEDIATE ACTION REQUIRED", "तुरंत कार्रवाई आवश्यक")
                  : emergencyAlert.severity === "High"
                    ? t("IMMEDIATE PREPAREDNESS REQUIRED", "तुरंत तैयारी आवश्यक")
                    : emergencyAlert.severity === "Moderate"
                      ? t("PREPAREDNESS ADVISED", "तैयारी की सलाह")
                      : t("MONITORING ADVISED", "निगरानी की सलाह")}
              </strong>
              <p>
                {emergencyAlert.message}
              </p>
            </div>

            <button
              type="button"
              className="citizen-emergency-ack"
              onClick={() => setEmergencyAlert(null)}
            >
              <Bell size={19} />
              {t(
                "ACKNOWLEDGE NOTIFICATION",
                "सूचना स्वीकार करें"
              )}
            </button>

            <div className="citizen-emergency-footer">
              {t(
                "Smart India Hackathon 2026 · Integrated Flash Flood Monitoring System",
                "स्मार्ट इंडिया हैकाथॉन 2026 · एकीकृत अचानक बाढ़ निगरानी प्रणाली"
              )}
            </div>
          </div>
        </div>
      )}

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

                {backendOnline
                  ? t(
                      "Monitoring Active",
                      "निगरानी सक्रिय"
                    )
                  : t(
                      "Backend Offline",
                      "बैकएंड ऑफ़लाइन"
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

          {loading ? (
            <div className="no-alerts">
              <RefreshCw size={34} className="alerts-loading-icon" />
              <h3>
                {t(
                  "Loading live alerts...",
                  "लाइव चेतावनियाँ लोड हो रही हैं..."
                )}
              </h3>
              <p>
                {t(
                  "Connecting to the integrated monitoring backend.",
                  "एकीकृत निगरानी बैकएंड से कनेक्ट किया जा रहा है।"
                )}
              </p>
            </div>
          ) : (
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
                      {language === "hi"
                        ? alert.locationHi || alert.location
                        : alert.locationEn || alert.location}
                    </span>

                  </div>


                  {/* MESSAGE */}

                  <div className="alert-message">
                    {language === "hi"
                      ? alert.severity === "Critical"
                        ? "गंभीर अचानक बाढ़ की स्थिति का संकेत मिला है। प्रभावित क्षेत्र में तत्काल सावधानी आवश्यक है।"
                        : alert.severity === "High"
                        ? "अचानक बाढ़ के बढ़े हुए जोखिम का संकेत मिला है। वर्षा और स्थानीय परिस्थितियों की लगातार निगरानी करें।"
                        : alert.severity === "Moderate"
                        ? "मध्यम खतरे की स्थिति का संकेत मिला है। वर्षा और स्थानीय परिस्थितियों की निगरानी जारी रखें।"
                        : "वर्तमान संकेतकों के आधार पर नियमित निगरानी जारी रखें।"
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
                        ? alert.severity === "Critical"
                          ? "तुरंत ऊँचे स्थान पर जाएँ और आधिकारिक आपातकालीन निर्देशों का पालन करें।"
                          : alert.severity === "High"
                          ? "नदी किनारों, जलधाराओं और निचले क्षेत्रों से बचें तथा सुरक्षित स्थान पर जाने के लिए तैयार रहें।"
                          : alert.severity === "Moderate"
                          ? "सतर्क रहें, बदलती परिस्थितियों पर नज़र रखें और आपातकालीन सामान तैयार रखें।"
                          : "नियमित निगरानी जारी रखें और आधिकारिक सलाह का पालन करें।"
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

                      {t(
                        "Status: Active",
                        "स्थिति: सक्रिय"
                      )}

                    </span>

                  </div>

                </article>

              );

            })}

            </div>
          )}


          {/* =================================================
              NO ALERTS
              ================================================= */}

          {!loading && filteredAlerts.length === 0 && (

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

        .alerts-loading-icon {
          animation: alerts-spin 1s linear infinite;
        }

        @keyframes alerts-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
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


      <style>{`
        .citizen-emergency-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          background: rgba(9, 18, 28, 0.94);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
        }

        .citizen-emergency-card {
          width: min(720px, 94vw);
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px 34px 24px;
          box-sizing: border-box;
          border: 1px solid #d8e0e7;
          border-top: 7px solid #2563eb;
          border-radius: 10px;
          background: #fff;
          color: #172b3a;
          box-shadow: 0 24px 70px rgba(0,0,0,.45);
        }

        .citizen-emergency-card[data-severity="moderate"] {
          border-top-color: #d97706;
        }
        .citizen-emergency-card[data-severity="high"] {
          border-top-color: #dc2626;
        }
        .citizen-emergency-card[data-severity="critical"] {
          border-top-color: #991b1b;
        }

        .citizen-emergency-icon {
          width: 62px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          margin-bottom: 16px;
        }

        .citizen-emergency-card[data-severity="moderate"] .citizen-emergency-icon {
          color: #b45309;
          background: #fffbeb;
          border-color: #fcd34d;
        }
        .citizen-emergency-card[data-severity="high"] .citizen-emergency-icon {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fecaca;
        }
        .citizen-emergency-card[data-severity="critical"] .citizen-emergency-icon {
          color: #991b1b;
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .citizen-emergency-kicker {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .10em;
          margin-bottom: 7px;
        }
        .citizen-emergency-card[data-severity="moderate"] .citizen-emergency-kicker {
          color: #b45309;
        }
        .citizen-emergency-card[data-severity="high"] .citizen-emergency-kicker {
          color: #b91c1c;
        }
        .citizen-emergency-card[data-severity="critical"] .citizen-emergency-kicker {
          color: #991b1b;
        }

        .citizen-emergency-card h2 {
          margin: 0;
          font-size: clamp(29px, 5vw, 46px);
          line-height: 1.05;
          font-weight: 850;
          letter-spacing: -.02em;
        }

        .citizen-emergency-severity {
          display: inline-flex;
          margin: 15px 0 13px;
          padding: 7px 12px;
          border-radius: 4px;
          color: #fff;
          background: #2563eb;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: .06em;
        }
        .citizen-emergency-card[data-severity="moderate"] .citizen-emergency-severity {
          background: #d97706;
        }
        .citizen-emergency-card[data-severity="high"] .citizen-emergency-severity {
          background: #dc2626;
        }
        .citizen-emergency-card[data-severity="critical"] .citizen-emergency-severity {
          background: #991b1b;
        }

        .citizen-emergency-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #34495e;
          font-size: 18px;
          font-weight: 750;
          margin-bottom: 20px;
        }

        .citizen-emergency-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 19px;
        }

        .citizen-emergency-stats > div {
          padding: 14px 15px;
          border: 1px solid #dce3e8;
          border-radius: 6px;
          background: #f6f8fa;
        }

        .citizen-emergency-stats span {
          display: block;
          margin-bottom: 6px;
          color: #667786;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .07em;
        }

        .citizen-emergency-stats strong {
          color: #172b3a;
          font-size: 20px;
          font-weight: 850;
        }

        .citizen-emergency-message {
          padding: 15px 17px;
          margin-bottom: 20px;
          border-left: 4px solid #2563eb;
          background: #fafafa;
        }
        .citizen-emergency-card[data-severity="moderate"] .citizen-emergency-message {
          border-left-color: #d97706;
        }
        .citizen-emergency-card[data-severity="high"] .citizen-emergency-message {
          border-left-color: #dc2626;
        }
        .citizen-emergency-card[data-severity="critical"] .citizen-emergency-message {
          border-left-color: #991b1b;
        }

        .citizen-emergency-message strong {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .citizen-emergency-message p {
          margin: 0;
          color: #526474;
          font-size: 14px;
          line-height: 1.55;
        }

        .citizen-emergency-ack {
          width: 100%;
          min-height: 52px;
          border: 1px solid #1d4ed8;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          color: #fff;
          background: #2563eb;
          font-size: 15px;
          font-weight: 800;
        }
        .citizen-emergency-card[data-severity="moderate"] .citizen-emergency-ack {
          background: #d97706;
          border-color: #b45309;
        }
        .citizen-emergency-card[data-severity="high"] .citizen-emergency-ack {
          background: #dc2626;
          border-color: #b91c1c;
        }
        .citizen-emergency-card[data-severity="critical"] .citizen-emergency-ack {
          background: #991b1b;
          border-color: #7f1d1d;
        }

        .citizen-emergency-footer {
          margin-top: 13px;
          text-align: center;
          color: #7a8995;
          font-size: 10px;
        }

        @media (max-width: 680px) {
          .citizen-emergency-overlay { padding: 10px; }
          .citizen-emergency-card { padding: 23px 17px 19px; }
          .citizen-emergency-stats { grid-template-columns: 1fr; }
          .citizen-emergency-card h2 { font-size: 33px; }
        }
      `}</style>
    </main>
  );
}


export default Alerts;