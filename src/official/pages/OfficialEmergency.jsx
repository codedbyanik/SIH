import { useState } from "react";
import { Users } from "lucide-react";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { incidents } from "../data/officialMockData.js";

export default function OfficialEmergency() {
  const { isHindi, t } = useOfficialLanguage();
  const [expandedId, setExpandedId] = useState(incidents[0]?.id ?? null);

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("emergencyTitle")}</h1>
          <p className="official-page-subtitle">{t("emergencySubtitle")}</p>
        </div>
      </div>

      <section className="official-panel">
        <div className="official-panel-head">
          <h2>{t("activeIncidents")}</h2>
        </div>

        <div className="official-incident-list">
          {incidents.map((incident) => {
            const isOpen = expandedId === incident.id;
            return (
              <article className="official-incident-card" key={incident.id}>
                <button
                  type="button"
                  className="official-incident-summary"
                  onClick={() => setExpandedId(isOpen ? null : incident.id)}
                  aria-expanded={isOpen}
                >
                  <div>
                    <span className="official-incident-id">{incident.id}</span>
                    <h3>{isHindi ? incident.titleHi : incident.titleEn}</h3>
                    <span className="official-incident-location">{incident.location}</span>
                  </div>

                  <div className="official-incident-badges">
                    <StatusBadge label={t(incident.severity.toLowerCase())} tone={incident.severity.toLowerCase()} />
                    <StatusBadge
                      label={incident.status === "In Progress" ? t("inProgress") : t(incident.status.toLowerCase())}
                      tone={incident.status.toLowerCase()}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="official-incident-body">
                    <div className="official-incident-meta">
                      <span>
                        <Users size={14} aria-hidden="true" /> {t("assignedTeam")}: <strong>{incident.team}</strong>
                      </span>
                      <span>{incident.updated}</span>
                    </div>

                    <h4>{t("timeline")}</h4>
                    <ol className="official-timeline">
                      {incident.timeline.map((step, idx) => (
                        <li key={idx}>
                          <span className="official-timeline-time">{step.time}</span>
                          <span>{isHindi ? step.hi : step.en}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
