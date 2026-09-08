import { useMemo, useState } from "react";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { alerts as mockAlerts } from "../data/officialMockData.js";
import {
  useAlertsStore,
  ALERT_LOCATIONS,
  ALERT_TYPES,
  ALERT_SEVERITIES,
  ALERT_STATUSES,
} from "../../data/AlertsContext.jsx";

const SEVERITIES = ALERT_SEVERITIES;
const STATUSES = ALERT_STATUSES;

const EMPTY_FORM = { location: "", type: "", severity: "", status: "", message: "" };

export default function OfficialAlerts() {
  const { isHindi, t } = useOfficialLanguage();
  const { createdAlerts, addAlert } = useAlertsStore();

  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(false);

  // Newly created alerts (from Create Alert) plus the existing
  // prototype alerts — a single combined list, no duplicate system.
  const allAlerts = useMemo(() => [...createdAlerts, ...mockAlerts], [createdAlerts]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormError(false);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const updateForm = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();

    if (!form.location || !form.type || !form.severity || !form.status) {
      setFormError(true);
      return;
    }

    addAlert(form);
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
    setFormError(false);
  };

  const filtered = useMemo(() => {
    let result = allAlerts.filter((alert) => {
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
  }, [allAlerts, query, severityFilter, statusFilter, sortDesc, isHindi]);

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("alertsPageTitle")}</h1>
          <p className="official-page-subtitle">{t("alertsPageSubtitle")}</p>
        </div>
        <button type="button" className="official-primary-button" onClick={openCreateModal}>
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

      {showCreateModal && (
        <div className="official-modal-scrim" role="presentation" onClick={closeCreateModal}>
          <div
            className="official-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-alert-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="official-modal-head">
              <h2 id="create-alert-heading">{t("createAlertModalTitle")}</h2>
            </div>

            <form className="official-login-form" onSubmit={handleCreateAlert}>
              {formError && <p className="official-form-error">{t("fillRequiredFields")}</p>}

              <div className="official-form-field">
                <label htmlFor="alert-location">{t("location")}</label>
                <select
                  id="alert-location"
                  className="official-select"
                  value={form.location}
                  onChange={updateForm("location")}
                >
                  <option value="">{t("selectLocation")}</option>
                  {ALERT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="official-form-field">
                <label htmlFor="alert-type">{t("alertType")}</label>
                <select
                  id="alert-type"
                  className="official-select"
                  value={form.type}
                  onChange={updateForm("type")}
                >
                  <option value="">{t("selectType")}</option>
                  {ALERT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="official-form-field">
                <label htmlFor="alert-severity">{t("severity")}</label>
                <select
                  id="alert-severity"
                  className="official-select"
                  value={form.severity}
                  onChange={updateForm("severity")}
                >
                  <option value="">{t("selectSeverity")}</option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {t(s.toLowerCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="official-form-field">
                <label htmlFor="alert-status">{t("status")}</label>
                <select
                  id="alert-status"
                  className="official-select"
                  value={form.status}
                  onChange={updateForm("status")}
                >
                  <option value="">{t("selectStatus")}</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(s.toLowerCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="official-form-field">
                <label htmlFor="alert-message">{t("message")}</label>
                <textarea
                  id="alert-message"
                  className="official-select"
                  rows={3}
                  value={form.message}
                  onChange={updateForm("message")}
                />
              </div>

              <div className="official-modal-actions">
                <button type="button" className="official-secondary-button" onClick={closeCreateModal}>
                  {t("cancel")}
                </button>
                <button type="submit" className="official-primary-button">
                  {t("createAlert")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
