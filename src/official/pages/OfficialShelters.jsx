import { useEffect, useMemo, useState } from "react";
import { Search, Phone, Home as HomeIcon, CheckCircle2, AlertTriangle, XCircle, Plus, Eye } from "lucide-react";
import StatCard from "../../components/official/StatCard.jsx";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
const mockShelters = [
  {
    id: "WY-SH-001",
    nameEn: "Mundakkai Community Shelter",
    nameHi: "मुंडक्कई सामुदायिक आश्रय",
    state: "Kerala",
    district: "Wayanad",
    village: "Mundakkai",
    address: "Mundakkai, Wayanad, Kerala",
    capacity: 300,
    occupancy: 180,
    status: "Operational",
    facilities: ["Drinking Water", "First Aid", "Accessible"],
    contact: "112",
  },
  {
    id: "WY-SH-002",
    nameEn: "Chooralmala Relief Centre",
    nameHi: "चूरलमाला राहत केंद्र",
    state: "Kerala",
    district: "Wayanad",
    village: "Chooralmala",
    address: "Chooralmala, Wayanad, Kerala",
    capacity: 250,
    occupancy: 165,
    status: "Operational",
    facilities: ["Drinking Water", "Medical Aid"],
    contact: "112",
  },
  {
    id: "WY-SH-003",
    nameEn: "Meppadi Community Shelter",
    nameHi: "मेप्पाडी सामुदायिक आश्रय",
    state: "Kerala",
    district: "Wayanad",
    village: "Meppadi",
    address: "Meppadi, Wayanad, Kerala",
    capacity: 400,
    occupancy: 240,
    status: "Operational",
    facilities: ["Drinking Water", "First Aid", "Accessible"],
    contact: "112",
  },
  {
    id: "WY-SH-004",
    nameEn: "Vythiri Relief Centre",
    nameHi: "वायनाड वायथिरी राहत केंद्र",
    state: "Kerala",
    district: "Wayanad",
    village: "Vythiri",
    address: "Vythiri, Wayanad, Kerala",
    capacity: 280,
    occupancy: 210,
    status: "At Capacity",
    facilities: ["Drinking Water", "First Aid"],
    contact: "112",
  },
  {
    id: "WY-SH-005",
    nameEn: "Kalpetta Emergency Shelter",
    nameHi: "कलपेट्टा आपातकालीन आश्रय",
    state: "Kerala",
    district: "Wayanad",
    village: "Kalpetta",
    address: "Kalpetta, Wayanad, Kerala",
    capacity: 500,
    occupancy: 280,
    status: "Operational",
    facilities: ["Drinking Water", "Medical Aid", "Accessible"],
    contact: "112",
  },
];

const SHELTER_STORAGE_KEY = "sih_shelters";

const EMPTY_FORM = {
  nameEn: "",
  nameHi: "",
  state: "Kerala",
  district: "Wayanad",
  village: "",
  address: "",
  capacity: "",
  occupancy: "0",
  status: "Operational",
  facilities: "",
  contact: "112",
};

export default function OfficialShelters() {
  const { isHindi, t } = useOfficialLanguage();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdShelters, setCreatedShelters] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SHELTER_STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setCreatedShelters(saved);
    } catch {
      setCreatedShelters([]);
    }
  }, []);

  const allShelters = useMemo(
    () => [...mockShelters, ...createdShelters],
    [createdShelters]
  );

  const totals = useMemo(() => {
    return {
      total: allShelters.length,
      operational: allShelters.filter((s) => s.status === "Operational").length,
      atCapacity: allShelters.filter((s) => s.status === "At Capacity").length,
      unavailable: allShelters.filter((s) => s.status === "Unavailable").length,
    };
  }, [allShelters]);

  const filtered = useMemo(() => {
    return allShelters.filter((s) => {
      const name = isHindi ? (s.nameHi || s.nameEn) : s.nameEn;
      const matchesQuery =
        query.trim() === "" ||
        name.toLowerCase().includes(query.toLowerCase()) ||
        s.district.toLowerCase().includes(query.toLowerCase()) ||
        s.state.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [allShelters, query, statusFilter, isHindi]);

  const updateForm = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
  };

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormError("");
  };

  const handleCreateShelter = (e) => {
    e.preventDefault();

    const capacity = Number(form.capacity);
    const occupancy = Number(form.occupancy);

    if (
      !form.nameEn.trim() ||
      !form.state.trim() ||
      !form.district.trim() ||
      !form.address.trim() ||
      !Number.isFinite(capacity) ||
      capacity <= 0 ||
      !Number.isFinite(occupancy) ||
      occupancy < 0 ||
      occupancy > capacity
    ) {
      setFormError("Please enter valid shelter details and capacity.");
      return;
    }

    const newShelter = {
      id: `SH-${Date.now()}`,
      nameEn: form.nameEn.trim(),
      nameHi: form.nameHi.trim() || form.nameEn.trim(),
      state: form.state.trim(),
      district: form.district.trim(),
      village: form.village.trim(),
      address: form.address.trim(),
      capacity,
      occupancy,
      status: form.status,
      facilities: form.facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      contact: form.contact.trim() || "112",
      createdAt: new Date().toISOString(),
      source: "official-portal",
    };

    const next = [...createdShelters, newShelter];
    setCreatedShelters(next);
    localStorage.setItem(SHELTER_STORAGE_KEY, JSON.stringify(next));

    setSelectedShelter(newShelter);
    closeCreateModal();
  };

  const availableCapacity = (shelter) =>
    Math.max(0, Number(shelter.capacity || 0) - Number(shelter.occupancy || 0));

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("sheltersTitle")}</h1>
          <p className="official-page-subtitle">{t("sheltersSubtitle")}</p>
        </div>

        <button
          type="button"
          className="official-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={16} aria-hidden="true" />
          Add Shelter
        </button>
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
          {filtered.map((s) => {
            const available = availableCapacity(s);
            const capacity = Number(s.capacity || 0);
            const occupancyPercent =
              capacity > 0 ? Math.min(100, Math.round((Number(s.occupancy || 0) / capacity) * 100)) : 0;

            return (
              <article className="official-shelter-card" key={s.id}>
                <div className="official-shelter-card-head">
                  <h3>{isHindi ? (s.nameHi || s.nameEn) : s.nameEn}</h3>
                  <StatusBadge
                    label={
                      s.status === "Operational"
                        ? t("operational")
                        : s.status === "At Capacity"
                          ? t("atCapacity")
                          : t("unavailable")
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
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                  <span>
                    {s.occupancy || 0} / {capacity} ({t("occupancy")})
                  </span>
                </div>

                <div className="official-shelter-facilities">
                  {(s.facilities || []).map((f) => (
                    <span key={f} className="official-facility-chip">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="official-shelter-contact">
                  <Phone size={14} aria-hidden="true" />
                  <span>{s.contact}</span>
                </div>

                <button
                  type="button"
                  className="official-secondary-button"
                  style={{ marginTop: "12px", width: "100%" }}
                  onClick={() => setSelectedShelter(s)}
                >
                  <Eye size={15} aria-hidden="true" />
                  View Capacity & Details
                </button>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <p className="official-muted-text">{t("noResults")}</p>
          )}
        </div>
      </section>

      {selectedShelter && (
        <div
          className="official-modal-scrim"
          role="presentation"
          onClick={() => setSelectedShelter(null)}
        >
          <div
            className="official-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shelter-detail-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="official-modal-head">
              <div>
                <h2 id="shelter-detail-heading">
                  {isHindi
                    ? (selectedShelter.nameHi || selectedShelter.nameEn)
                    : selectedShelter.nameEn}
                </h2>
                <p className="official-page-subtitle">
                  {selectedShelter.district}, {selectedShelter.state}
                </p>
              </div>

              <StatusBadge
                label={
                  selectedShelter.status === "Operational"
                    ? t("operational")
                    : selectedShelter.status === "At Capacity"
                      ? t("atCapacity")
                      : t("unavailable")
                }
                tone={selectedShelter.status.toLowerCase()}
              />
            </div>

            <dl className="official-detail-list">
              <div>
                <dt>Capacity</dt>
                <dd>{selectedShelter.capacity} people</dd>
              </div>
              <div>
                <dt>Occupied</dt>
                <dd>{selectedShelter.occupancy || 0} people</dd>
              </div>
              <div>
                <dt>Available</dt>
                <dd>{availableCapacity(selectedShelter)} places</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{selectedShelter.address}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{selectedShelter.contact}</dd>
              </div>
              <div>
                <dt>Facilities</dt>
                <dd>{(selectedShelter.facilities || []).join(", ") || "—"}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="official-primary-button"
              onClick={() => setSelectedShelter(null)}
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div
          className="official-modal-scrim"
          role="presentation"
          onClick={closeCreateModal}
        >
          <div
            className="official-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-shelter-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="official-modal-head">
              <h2 id="create-shelter-heading">Add New Shelter</h2>
            </div>

            <form className="official-login-form" onSubmit={handleCreateShelter}>
              {formError && <p className="official-form-error">{formError}</p>}

              <div className="official-form-field">
                <label htmlFor="shelter-name-en">Shelter Name</label>
                <input
                  id="shelter-name-en"
                  className="official-select"
                  value={form.nameEn}
                  onChange={updateForm("nameEn")}
                  placeholder="e.g. Meppadi Community Shelter"
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-name-hi">Shelter Name (Hindi, optional)</label>
                <input
                  id="shelter-name-hi"
                  className="official-select"
                  value={form.nameHi}
                  onChange={updateForm("nameHi")}
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-state">State</label>
                <input
                  id="shelter-state"
                  className="official-select"
                  value={form.state}
                  onChange={updateForm("state")}
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-district">District</label>
                <input
                  id="shelter-district"
                  className="official-select"
                  value={form.district}
                  onChange={updateForm("district")}
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-village">Village / Ward</label>
                <input
                  id="shelter-village"
                  className="official-select"
                  value={form.village}
                  onChange={updateForm("village")}
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-address">Address</label>
                <input
                  id="shelter-address"
                  className="official-select"
                  value={form.address}
                  onChange={updateForm("address")}
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-capacity">Total Capacity</label>
                <input
                  id="shelter-capacity"
                  className="official-select"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={updateForm("capacity")}
                  placeholder="e.g. 500"
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-occupancy">Currently Occupied</label>
                <input
                  id="shelter-occupancy"
                  className="official-select"
                  type="number"
                  min="0"
                  value={form.occupancy}
                  onChange={updateForm("occupancy")}
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-status">Status</label>
                <select
                  id="shelter-status"
                  className="official-select"
                  value={form.status}
                  onChange={updateForm("status")}
                >
                  <option value="Operational">Operational</option>
                  <option value="At Capacity">At Capacity</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-facilities">Facilities</label>
                <input
                  id="shelter-facilities"
                  className="official-select"
                  value={form.facilities}
                  onChange={updateForm("facilities")}
                  placeholder="Drinking Water, First Aid, Accessible"
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="shelter-contact">Contact Number</label>
                <input
                  id="shelter-contact"
                  className="official-select"
                  value={form.contact}
                  onChange={updateForm("contact")}
                />
              </div>

              <div className="official-modal-actions">
                <button
                  type="button"
                  className="official-secondary-button"
                  onClick={closeCreateModal}
                >
                  {t("cancel")}
                </button>
                <button type="submit" className="official-primary-button">
                  <Plus size={15} aria-hidden="true" />
                  Add Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
