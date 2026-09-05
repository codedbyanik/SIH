import { useMemo, useState } from "react";
import { Search, Phone, Home as HomeIcon, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import StatCard from "../../components/official/StatCard.jsx";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { shelters } from "../data/officialMockData.js";

export default function OfficialShelters() {
  const { isHindi, t } = useOfficialLanguage();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totals = useMemo(() => {
    return {
      total: shelters.length,
      operational: shelters.filter((s) => s.status === "Operational").length,
      atCapacity: shelters.filter((s) => s.status === "At Capacity").length,
      unavailable: shelters.filter((s) => s.status === "Unavailable").length,
    };
  }, []);

  const filtered = useMemo(() => {
    return shelters.filter((s) => {
      const name = isHindi ? s.nameHi : s.nameEn;
      const matchesQuery =
        query.trim() === "" ||
        name.toLowerCase().includes(query.toLowerCase()) ||
        s.district.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, isHindi]);

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("sheltersTitle")}</h1>
          <p className="official-page-subtitle">{t("sheltersSubtitle")}</p>
        </div>
      </div>

      <section className="official-stat-grid official-stat-grid-compact">
        <StatCard icon={HomeIcon} label={t("totalShelters")} value={totals.total} tone="neutral" />
        <StatCard icon={CheckCircle2} label={t("operational")} value={totals.operational} tone="safe" />
        <StatCard icon={AlertTriangle} label={t("atCapacity")} value={totals.atCapacity} tone="warning" />
        <StatCard icon={XCircle} label={t("unavailable")} value={totals.unavailable} tone="critical" />
      </section>

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

          <select
            className="official-select"
            aria-label={t("status")}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="Operational">{t("operational")}</option>
            <option value="At Capacity">{t("atCapacity")}</option>
            <option value="Unavailable">{t("unavailable")}</option>
          </select>
        </div>

        <div className="official-card-grid">
          {filtered.map((s) => (
            <article className="official-shelter-card" key={s.id}>
              <div className="official-shelter-card-head">
                <h3>{isHindi ? s.nameHi : s.nameEn}</h3>
                <StatusBadge
                  label={
                    s.status === "Operational" ? t("operational") : s.status === "At Capacity" ? t("atCapacity") : t("unavailable")
                  }
                  tone={s.status.toLowerCase()}
                />
              </div>

              <p className="official-shelter-location">
                {s.district}, {s.state}
              </p>

              <div className="official-shelter-occupancy">
                <div className="official-occupancy-bar">
                  <div
                    className="official-occupancy-fill"
                    style={{ width: `${Math.min(100, Math.round((s.occupancy / s.capacity) * 100))}%` }}
                  />
                </div>
                <span>
                  {s.occupancy} / {s.capacity} ({t("occupancy")})
                </span>
              </div>

              <div className="official-shelter-facilities">
                {s.facilities.map((f) => (
                  <span key={f} className="official-facility-chip">
                    {f}
                  </span>
                ))}
              </div>

              <div className="official-shelter-contact">
                <Phone size={14} aria-hidden="true" />
                <span>{s.contact}</span>
              </div>
            </article>
          ))}

          {filtered.length === 0 && <p className="official-muted-text">{t("noResults")}</p>}
        </div>
      </section>
    </div>
  );
}
