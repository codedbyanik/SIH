import { useState } from "react";
import { Search } from "lucide-react";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { officials as officialsData } from "../data/officialMockData.js";

export default function OfficialUsers() {
  const { t } = useOfficialLanguage();
  const [query, setQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const filtered = officialsData.filter((o) => {
    const q = query.toLowerCase();
    return (
      query.trim() === "" ||
      o.name.toLowerCase().includes(q) ||
      o.role.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("usersTitle")}</h1>
          <p className="official-page-subtitle">{t("usersSubtitle")}</p>
        </div>
      </div>

      <section className="official-panel">
        <div className="official-filter-bar">
          <div className="official-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder={t("search")}
              aria-label={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="official-table-wrap">
          <table className="official-table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("role")}</th>
                <th>{t("department")}</th>
                <th>{t("location")}</th>
                <th>{t("status")}</th>
                <th>{t("lastActive")}</th>
                <th>{t("accessLevel")}</th>
                <th className="official-table-action-col">{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>{o.role}</td>
                  <td>{o.department}</td>
                  <td>{o.location}</td>
                  <td>
                    <StatusBadge label={o.status === "Active" ? t("active") : t("inactive")} tone={o.status.toLowerCase()} />
                  </td>
                  <td>{o.lastActive}</td>
                  <td>{o.access}</td>
                  <td className="official-table-action-col">
                    <div className="official-report-actions">
                      <button type="button" className="official-icon-text-button">
                        {t("view")}
                      </button>
                      <button type="button" className="official-icon-text-button">
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className="official-icon-text-button official-danger-text"
                        onClick={() => setConfirmingId(o.id)}
                      >
                        {t("deactivate")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {confirmingId && (
        <div className="official-modal-scrim" role="presentation" onClick={() => setConfirmingId(null)}>
          <div
            className="official-modal official-modal-narrow"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="deactivate-heading">{t("deactivate")}</h2>
            <p className="official-muted-text">
              {officialsData.find((o) => o.id === confirmingId)?.name}
            </p>
            <div className="official-modal-actions">
              <button type="button" className="official-secondary-button" onClick={() => setConfirmingId(null)}>
                {t("cancel")}
              </button>
              <button type="button" className="official-danger-button" onClick={() => setConfirmingId(null)}>
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
