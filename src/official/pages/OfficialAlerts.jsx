import { useMemo, useState } from "react";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { alerts as mockAlerts } from "../data/officialMockData.js";

const SEVERITIES = ["Critical", "High", "Moderate", "Low"];
const STATUSES = ["Active", "Monitoring", "Resolved"];

export default function OfficialAlerts() {
  const { isHindi, t } = useOfficialLanguage();

  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const filtered = useMemo(() => {
    let result = mockAlerts.filter((alert) => {
      const location = isHindi ? alert.locationHi : alert.locationEn;
      const matchesQuery =
        query.trim() === "" ||
        alert.id.toLowerCase().includes(query.toLowerCase()) ||
        location.toLowerCase().includes(query.toLowerCase()) ||
        alert.type.toLowerCase().includes(query.toLowerCase());

      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;

      return matchesQuery && matchesSeverity && matchesStatus;
    });

    result = result.sort((a, b) => (sortDesc ? b.issued.localeCompare(a.issued) : a.issued.localeCompare(b.issued)));

    return result;
  }, [query, severityFilter, statusFilter, sortDesc, isHindi]);

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("alertsPageTitle")}</h1>
          <p className="official-page-subtitle">{t("alertsPageSubtitle")}</p>
        </div>
        <button type="button" className="official-primary-button">
          <Plus size={16} aria-hidden="true" />
          {t("createAlert")}
        </button>
      </div>

      <section className="official-panel">
        <div className="official-filter-bar">
          <div className="official-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder={t("searchAlertsPlaceholder")}
              aria-label={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="official-select"
            aria-label={t("severity")}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">{t("allSeverities")}</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {t(s.toLowerCase())}
              </option>
            ))}
          </select>

          <select
            className="official-select"
            aria-label={t("status")}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s.toLowerCase())}
              </option>
            ))}
          </select>

          <button type="button" className="official-sort-button" onClick={() => setSortDesc((v) => !v)}>
            <ArrowUpDown size={14} aria-hidden="true" />
            {t("issued")}
          </button>
        </div>

        <div className="official-table-wrap">
          <table className="official-table">
            <thead>
              <tr>
                <th>{t("alertId")}</th>
                <th>{t("type")}</th>
                <th>{t("location")}</th>
                <th>{t("severity")}</th>
                <th>{t("issued")}</th>
                <th>{t("status")}</th>
                <th className="official-table-action-col">{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id}>
                  <td className="official-table-mono">{alert.id}</td>
                  <td>{alert.type}</td>
                  <td>{isHindi ? alert.locationHi : alert.locationEn}</td>
                  <td>
                    <StatusBadge label={t(alert.severity.toLowerCase())} tone={alert.severity.toLowerCase()} />
                  </td>
                  <td>{alert.issued}</td>
                  <td>
                    <StatusBadge label={t(alert.status.toLowerCase())} tone={alert.status.toLowerCase()} />
                  </td>
                  <td className="official-table-action-col">
                    <button type="button" className="official-table-link" onClick={() => setSelectedAlert(alert)}>
                      {t("view")}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="official-table-empty">
                    {t("noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedAlert && (
        <div className="official-modal-scrim" role="presentation" onClick={() => setSelectedAlert(null)}>
          <div
            className="official-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-detail-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="official-modal-head">
              <h2 id="alert-detail-heading">{selectedAlert.id}</h2>
              <StatusBadge label={t(selectedAlert.severity.toLowerCase())} tone={selectedAlert.severity.toLowerCase()} />
            </div>

            <dl className="official-detail-list">
              <div>
                <dt>{t("type")}</dt>
                <dd>{selectedAlert.type}</dd>
              </div>
              <div>
                <dt>{t("location")}</dt>
                <dd>{isHindi ? selectedAlert.locationHi : selectedAlert.locationEn}</dd>
              </div>
              <div>
                <dt>{t("issued")}</dt>
                <dd>{selectedAlert.issued}</dd>
              </div>
              <div>
                <dt>{t("status")}</dt>
                <dd>
                  <StatusBadge label={t(selectedAlert.status.toLowerCase())} tone={selectedAlert.status.toLowerCase()} />
                </dd>
              </div>
              <div>
                <dt>{t("rainfall")}</dt>
                <dd>{selectedAlert.rainfall}</dd>
              </div>
              <div>
                <dt>{t("waterLevel")}</dt>
                <dd>{selectedAlert.waterLevel}</dd>
              </div>
            </dl>

            <button type="button" className="official-primary-button" onClick={() => setSelectedAlert(null)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
