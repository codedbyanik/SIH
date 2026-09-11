import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ShieldAlert,
  MapPinned,
  Home as HomeIcon,
  Users2,
  Truck,
  Siren,
  Map,
  ClipboardList,
  FileBarChart,
} from "lucide-react";
import StatCard from "../../components/official/StatCard.jsx";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { useOfficialAuth } from "../context/OfficialAuthContext.jsx";

const API_BASE = "http://127.0.0.1:5000";

const STAT_ICONS = {
  activeAlerts: Bell,
  criticalAlerts: ShieldAlert,
  districts: MapPinned,
  shelters: HomeIcon,
  peopleAtRisk: Users2,
  responseTeams: Truck,
};

const STAT_LABEL_KEYS = {
  activeAlerts: "activeAlerts",
  criticalAlerts: "criticalAlerts",
  districts: "monitoredDistricts",
  shelters: "operationalShelters",
  peopleAtRisk: "peopleAtRisk",
  responseTeams: "responseTeams",
};

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "goodMorning";
  if (hour < 17) return "goodAfternoon";
  return "goodEvening";
}

function normalizeSeverity(value) {
  return String(value || "").trim().toLowerCase();
}

function formatIssued(value) {
  if (!value) return "—";

  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch {
    // Keep the backend value if it is already a display string.
  }

  return String(value);
}

function getStatusLabel(isHindi, status) {
  if (isHindi) {
    return status === "normal" ? "सामान्य" : "चेतावनी";
  }

  return status === "normal" ? "Normal" : "Warning";
}

function getRiskStatus(riskZones) {
  const hasCritical = riskZones.some(
    (zone) => normalizeSeverity(zone.risk) === "critical"
  );

  const hasHigh = riskZones.some(
    (zone) => normalizeSeverity(zone.risk) === "high"
  );

  if (hasCritical || hasHigh) return "warning";
  return "normal";
}

function getSystemStatus(isHindi, backendOnline, riskZones) {
  const riskStatus = getRiskStatus(riskZones);

  return [
    {
      id: "weather-feed",
      labelEn: "Live weather feed",
      labelHi: "लाइव मौसम डेटा",
      status: backendOnline ? "normal" : "warning",
    },
    {
      id: "risk-engine",
      labelEn: "Risk assessment engine",
      labelHi: "जोखिम आकलन इंजन",
      status: backendOnline ? riskStatus : "warning",
    },
    {
      id: "alert-engine",
      labelEn: "Alert monitoring",
      labelHi: "अलर्ट निगरानी",
      status: backendOnline ? "normal" : "warning",
    },
  ];
}

export default function OfficialDashboard() {
  const { isHindi, t } = useOfficialLanguage();
  const { user } = useOfficialAuth();

  const [riskZones, setRiskZones] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [riskResponse, alertsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/risk-map?source=live`, {
            cache: "no-store",
          }),
          fetch(`${API_BASE}/api/alerts`, {
            cache: "no-store",
          }),
        ]);

        if (!riskResponse.ok) {
          throw new Error("Risk API unavailable");
        }

        const riskData = await riskResponse.json();

        let alertsData = [];
        if (alertsResponse.ok) {
          const parsedAlerts = await alertsResponse.json();
          alertsData = Array.isArray(parsedAlerts) ? parsedAlerts : [];
        }

        if (!mounted) return;

        setRiskZones(Array.isArray(riskData.zones) ? riskData.zones : []);
        setRecentAlerts(alertsData);
        setBackendOnline(true);
        setLastUpdated(
          riskData.live_timestamp ||
            new Date().toISOString()
        );
      } catch (error) {
        console.error("Official dashboard backend error:", error);

        if (!mounted) return;

        setBackendOnline(false);
        setRiskZones([]);
        setRecentAlerts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    const interval = window.setInterval(loadDashboard, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const criticalCount = riskZones.filter(
      (zone) => normalizeSeverity(zone.risk) === "critical"
    ).length;

    const activeCount = riskZones.filter((zone) => {
      const risk = normalizeSeverity(zone.risk);
      return risk === "high" || risk === "critical";
    }).length;

    const districtCount =
      riskZones.length > 0
        ? new Set(
            riskZones.map(
              (zone) => zone.district || "Wayanad"
            )
          ).size
        : 0;

    return [
      {
        id: "activeAlerts",
        value: loading ? "…" : activeCount,
        deltaEn: "High/Critical monitored zones",
        deltaHi: "उच्च/गंभीर जोखिम वाले क्षेत्र",
        tone: activeCount > 0 ? "warning" : "operational",
      },
      {
        id: "criticalAlerts",
        value: loading ? "…" : criticalCount,
        deltaEn: "Current critical zones",
        deltaHi: "वर्तमान गंभीर जोखिम क्षेत्र",
        tone: criticalCount > 0 ? "critical" : "operational",
      },
      {
        id: "districts",
        value: loading ? "…" : districtCount || "—",
        deltaEn: "Wayanad monitoring scope",
        deltaHi: "वायनाड निगरानी क्षेत्र",
        tone: "operational",
      },
      {
        id: "shelters",
        value: "—",
        deltaEn: "Live capacity data unavailable",
        deltaHi: "लाइव क्षमता डेटा उपलब्ध नहीं",
        tone: "neutral",
      },
      {
        id: "peopleAtRisk",
        value: "—",
        deltaEn: "Exposure data not connected",
        deltaHi: "एक्सपोज़र डेटा कनेक्ट नहीं है",
        tone: "neutral",
      },
      {
        id: "responseTeams",
        value: "—",
        deltaEn: "Response-team registry not connected",
        deltaHi: "रिस्पॉन्स टीम रजिस्ट्री कनेक्ट नहीं है",
        tone: "neutral",
      },
    ];
  }, [riskZones, loading]);

  const systemStatus = useMemo(
    () => getSystemStatus(isHindi, backendOnline, riskZones),
    [isHindi, backendOnline, riskZones]
  );

  const allSystemsNormal = systemStatus.every(
    (item) => item.status === "normal"
  );

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("dashboard")}</h1>
          <p className="official-greeting">
            {t(greetingKey())}, {user?.name || t("administrator")}
          </p>
          <p className="official-page-subtitle">
            {t("dashboardSubtitle")}
          </p>
        </div>
      </div>

      {/* System status */}
      <section
        className="official-panel"
        aria-labelledby="system-status-heading"
      >
        <div className="official-panel-head">
          <h2 id="system-status-heading">{t("systemStatus")}</h2>

          <StatusBadge
            label={
              allSystemsNormal
                ? t("allOperational")
                : isHindi
                  ? "ध्यान आवश्यक"
                  : "Attention required"
            }
            tone={allSystemsNormal ? "operational" : "warning"}
          />
        </div>

        <div className="official-status-grid">
          {systemStatus.map((item) => (
            <div className="official-status-item" key={item.id}>
              <span>
                {isHindi ? item.labelHi : item.labelEn}
              </span>

              <StatusBadge
                label={getStatusLabel(isHindi, item.status)}
                tone={item.status}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Backend status */}
      {!backendOnline && (
        <div
          className="official-panel"
          role="status"
          style={{ marginBottom: "16px" }}
        >
          <strong>
            {isHindi
              ? "बैकएंड से कनेक्शन उपलब्ध नहीं है।"
              : "Backend connection unavailable."}
          </strong>
          <p style={{ margin: "6px 0 0" }}>
            {isHindi
              ? "डैशबोर्ड लाइव जोखिम डेटा प्राप्त नहीं कर पा रहा है।"
              : "The dashboard cannot currently retrieve live risk data."}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <section
        className="official-stat-grid"
        aria-label={t("dashboard")}
      >
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            icon={STAT_ICONS[stat.id]}
            label={t(STAT_LABEL_KEYS[stat.id])}
            value={stat.value}
            delta={isHindi ? stat.deltaHi : stat.deltaEn}
            tone={stat.tone}
          />
        ))}
      </section>

      {/* Recent alerts + Quick actions */}
      <div className="official-dashboard-columns">
        <section
          className="official-panel official-panel-grow"
          aria-labelledby="recent-alerts-heading"
        >
          <div className="official-panel-head">
            <h2 id="recent-alerts-heading">
              {t("recentAlerts")}
            </h2>

            <Link
              to="/official/alerts"
              className="official-link-button"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="official-table-wrap">
            <table className="official-table">
              <thead>
                <tr>
                  <th>{t("alertId")}</th>
                  <th>{t("location")}</th>
                  <th>{t("severity")}</th>
                  <th>{t("issued")}</th>
                  <th>{t("status")}</th>
                  <th className="official-table-action-col">
                    {t("action")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAlerts.length > 0 ? (
                  recentAlerts.slice(0, 6).map((alert) => {
                    const severity = normalizeSeverity(
                      alert.severity
                    );

                    const status = normalizeSeverity(
                      alert.status
                    );

                    return (
                      <tr key={alert.id}>
                        <td className="official-table-mono">
                          {alert.id}
                        </td>

                        <td>
                          {isHindi
                            ? alert.locationHi ||
                              alert.locationEn ||
                              "—"
                            : alert.locationEn ||
                              alert.locationHi ||
                              "—"}
                        </td>

                        <td>
                          <StatusBadge
                            label={t(severity || "advisory")}
                            tone={severity || "advisory"}
                          />
                        </td>

                        <td>
                          {formatIssued(alert.issued)}
                        </td>

                        <td>
                          <StatusBadge
                            label={t(status || "active")}
                            tone={status || "active"}
                          />
                        </td>

                        <td className="official-table-action-col">
                          <Link
                            to="/official/alerts"
                            className="official-table-link"
                          >
                            {t("view")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "24px",
                      }}
                    >
                      {loading
                        ? isHindi
                          ? "लाइव अलर्ट लोड हो रहे हैं..."
                          : "Loading live alerts..."
                        : isHindi
                          ? "कोई लाइव अलर्ट उपलब्ध नहीं है।"
                          : "No live alerts available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {lastUpdated && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "0.78rem",
                opacity: 0.7,
              }}
            >
              {isHindi ? "अंतिम अपडेट: " : "Last update: "}
              {formatIssued(lastUpdated)}
            </p>
          )}
        </section>

        {/* Quick actions */}
        <section
          className="official-panel official-quick-actions"
          aria-labelledby="quick-actions-heading"
        >
          <h2 id="quick-actions-heading">
            {t("quickActions")}
          </h2>

          <div className="official-quick-action-list">
            <Link
              to="/official/alerts"
              className="official-quick-action"
            >
              <Siren size={18} aria-hidden="true" />
              <span>{t("issueAlert")}</span>
            </Link>

            <Link
              to="/official/shelters"
              className="official-quick-action"
            >
              <HomeIcon size={18} aria-hidden="true" />
              <span>{t("manageShelters")}</span>
            </Link>

            <Link
              to="/official/risk-map"
              className="official-quick-action"
            >
              <Map size={18} aria-hidden="true" />
              <span>{t("viewRiskMap")}</span>
            </Link>

            <Link
              to="/official/emergency"
              className="official-quick-action"
            >
              <ClipboardList size={18} aria-hidden="true" />
              <span>{t("incidentManagement")}</span>
            </Link>

            <Link
              to="/official/reports"
              className="official-quick-action"
            >
              <FileBarChart size={18} aria-hidden="true" />
              <span>{t("reports")}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
