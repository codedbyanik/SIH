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
import { systemStatus, dashboardStats, alerts } from "../data/officialMockData.js";

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

export default function OfficialDashboard() {
  const { isHindi, t } = useOfficialLanguage();
  const { user } = useOfficialAuth();

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("dashboard")}</h1>
          <p className="official-greeting">
            {t(greetingKey())}, {user?.name || t("administrator")}
          </p>
          <p className="official-page-subtitle">{t("dashboardSubtitle")}</p>
        </div>
      </div>

      {/* System status */}
      <section className="official-panel" aria-labelledby="system-status-heading">
        <div className="official-panel-head">
          <h2 id="system-status-heading">{t("systemStatus")}</h2>
          <StatusBadge label={t("allOperational")} tone="operational" />
        </div>

        <div className="official-status-grid">
          {systemStatus.items.map((item) => (
            <div className="official-status-item" key={item.id}>
              <span>{isHindi ? item.labelHi : item.labelEn}</span>
              <StatusBadge
                label={isHindi ? (item.status === "normal" ? "सामान्य" : "चेतावनी") : item.status === "normal" ? "Normal" : "Warning"}
                tone={item.status}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stat cards */}
      <section className="official-stat-grid" aria-label={t("dashboard")}>
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

      <div className="official-dashboard-columns">
        {/* Recent alerts table */}
        <section className="official-panel official-panel-grow" aria-labelledby="recent-alerts-heading">
          <div className="official-panel-head">
            <h2 id="recent-alerts-heading">{t("recentAlerts")}</h2>
            <Link to="/official/alerts" className="official-link-button">
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
                  <th className="official-table-action-col">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 6).map((alert) => (
                  <tr key={alert.id}>
                    <td className="official-table-mono">{alert.id}</td>
                    <td>{isHindi ? alert.locationHi : alert.locationEn}</td>
                    <td>
                      <StatusBadge label={t(alert.severity.toLowerCase())} tone={alert.severity.toLowerCase()} />
                    </td>
                    <td>{alert.issued}</td>
                    <td>
                      <StatusBadge label={t(alert.status.toLowerCase())} tone={alert.status.toLowerCase()} />
                    </td>
                    <td className="official-table-action-col">
                      <Link to="/official/alerts" className="official-table-link">
                        {t("view")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick actions */}
        <section className="official-panel official-quick-actions" aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading">{t("quickActions")}</h2>

          <div className="official-quick-action-list">
            <Link to="/official/alerts" className="official-quick-action">
              <Siren size={18} aria-hidden="true" />
              <span>{t("issueAlert")}</span>
            </Link>
            <Link to="/official/shelters" className="official-quick-action">
              <HomeIcon size={18} aria-hidden="true" />
              <span>{t("manageShelters")}</span>
            </Link>
            <Link to="/official/risk-map" className="official-quick-action">
              <Map size={18} aria-hidden="true" />
              <span>{t("viewRiskMap")}</span>
            </Link>
            <Link to="/official/emergency" className="official-quick-action">
              <ClipboardList size={18} aria-hidden="true" />
              <span>{t("incidentManagement")}</span>
            </Link>
            <Link to="/official/reports" className="official-quick-action">
              <FileBarChart size={18} aria-hidden="true" />
              <span>{t("reports")}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
