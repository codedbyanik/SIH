import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";

const API_BASE = "http://127.0.0.1:5000";
const INCIDENT_STORAGE_KEY = "sih_emergency_incidents";

const EMPTY_FORM = {
  title: "",
  location: "",
  severity: "Moderate",
  status: "Reported",
  type: "Other Emergency",
  team: "",
  description: "",
};

const SEVERITIES = ["Critical", "High", "Moderate", "Advisory"];
const STATUSES = ["Reported", "In Progress", "Resolved"];
const TYPES = [
  "Illegal Activity",
  "Flash Flood",
  "Landslide",
  "Rescue Request",
  "Blocked Route",
  "Medical Emergency",
  "Other Emergency",
];

const INITIAL_INCIDENTS = [
  {
    id: "INC-001",
    titleEn: "Flood-related emergency response",
    titleHi: "बाढ़ संबंधी आपातकालीन प्रतिक्रिया",
    location: "Mundakkai, Wayanad",
    severity: "High",
    status: "In Progress",
    type: "Flash Flood",
    team: "Wayanad Response Team",
    updated: "System monitored",
    source: "system",
    description: "Incident generated from the live flood-risk monitoring system.",
    timeline: [
      { time: "System", en: "Live monitoring detected elevated emergency risk.", hi: "लाइव मॉनिटरिंग ने बढ़े हुए आपातकालीन जोखिम का पता लगाया।" },
      { time: "Response", en: "Response team notification recorded.", hi: "प्रतिक्रिया टीम की सूचना दर्ज की गई।" },
    ],
  },
];

function makeIncidentFromAlert(alert) {
  const location =
    alert.locationEn ||
    alert.location ||
    "Wayanad";

  const severity = SEVERITIES.includes(alert.severity)
    ? alert.severity
    : "Moderate";

  const critical = severity === "Critical" || severity === "High";

  return {
    id: `AUTO-${String(alert.id || Date.now())}`,
    titleEn:
      alert.type === "Flash Flood Warning"
        ? "Automatic flash-flood emergency record"
        : "Automatic emergency risk record",
    titleHi:
      alert.type === "Flash Flood Warning"
        ? "स्वचालित फ्लैश-फ्लड आपातकालीन रिकॉर्ड"
        : "स्वचालित आपातकालीन जोखिम रिकॉर्ड",
    location,
    severity,
    status: critical ? "In Progress" : "Reported",
    type: alert.type || "Other Emergency",
    team: "Wayanad Emergency Response",
    updated: alert.issued || new Date().toLocaleString(),
    source: "system",
    description:
      "Automatically recorded from the live disaster-monitoring system. This is a system event, not a claim of criminal activity.",
    timeline: [
      {
        time: "Automatic",
        en: "Live monitoring event recorded.",
        hi: "लाइव मॉनिटरिंग घटना दर्ज की गई।",
      },
      {
        time: "Risk engine",
        en: `Current severity: ${severity}.`,
        hi: `वर्तमान गंभीरता: ${severity}।`,
      },
    ],
  };
}

function readStoredIncidents() {
  try {
    const raw = localStorage.getItem(INCIDENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredIncidents(items) {
  localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(items));
}

export default function OfficialEmergency() {
  const { isHindi, t } = useOfficialLanguage();

  const [expandedId, setExpandedId] = useState(null);
  const [manualIncidents, setManualIncidents] = useState(readStoredIncidents);
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const loadLiveIncidents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to load alerts");

      const data = await response.json();
      const alerts = Array.isArray(data) ? data : data.alerts || [];

      setLiveIncidents(alerts.map(makeIncidentFromAlert));
      setBackendOnline(true);
      setLastUpdated(new Date().toISOString());
    } catch {
      setBackendOnline(false);
      setLiveIncidents([]);
    }
  };

  useEffect(() => {
    loadLiveIncidents();
    const timer = setInterval(loadLiveIncidents, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sync = () => setManualIncidents(readStoredIncidents());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const incidents = useMemo(() => {
    const combined = [...manualIncidents, ...liveIncidents];

    if (combined.length === 0) return INITIAL_INCIDENTS;

    const seen = new Set();
    return combined.filter((incident) => {
      if (seen.has(incident.id)) return false;
      seen.add(incident.id);
      return true;
    });
  }, [manualIncidents, liveIncidents]);

  const totals = useMemo(
    () => ({
      total: incidents.length,
      critical: incidents.filter((i) => i.severity === "Critical").length,
      active: incidents.filter((i) => i.status !== "Resolved").length,
      automatic: incidents.filter((i) => i.source === "system").length,
    }),
    [incidents]
  );

  const updateForm = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleCreateIncident = (event) => {
    event.preventDefault();

    if (!form.title || !form.location || !form.severity || !form.status) {
      setFormError("Please fill all required fields.");
      return;
    }

    const now = new Date();

    const incident = {
      id: `INC-${Date.now()}`,
      titleEn: form.title,
      titleHi: form.title,
      location: form.location,
      severity: form.severity,
      status: form.status,
      type: form.type,
      team: form.team || "Not assigned",
      updated: now.toLocaleString(),
      source: "official",
      description: form.description || "Incident recorded by an authorized official.",
      timeline: [
        {
          time: now.toLocaleTimeString(),
          en: "Incident recorded by an authorized official.",
          hi: "अधिकृत अधिकारी द्वारा घटना दर्ज की गई।",
        },
      ],
    };

    const updated = [incident, ...manualIncidents];
    setManualIncidents(updated);
    saveStoredIncidents(updated);

    setExpandedId(incident.id);
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const updateIncidentStatus = (id, status) => {
    const updated = manualIncidents.map((incident) =>
      incident.id === id
        ? {
            ...incident,
            status,
            updated: new Date().toLocaleString(),
            timeline: [
              ...(incident.timeline || []),
              {
                time: new Date().toLocaleTimeString(),
                en: `Status updated to ${status}.`,
                hi: `स्थिति ${status} में अपडेट की गई।`,
              },
            ],
          }
        : incident
    );

    setManualIncidents(updated);
    saveStoredIncidents(updated);
  };

  const deleteManualIncident = (id) => {
    const updated = manualIncidents.filter((incident) => incident.id !== id);
    setManualIncidents(updated);
    saveStoredIncidents(updated);

    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("emergencyTitle")}</h1>
          <p className="official-page-subtitle">
            {isHindi
              ? "आपातकालीन घटनाओं और सिस्टम द्वारा स्वतः दर्ज जोखिम घटनाओं की निगरानी"
              : "Monitor emergency events and automatically recorded system incidents"}
          </p>
        </div>

        <button
          type="button"
          className="official-primary-button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setFormError("");
            setShowCreateModal(true);
          }}
        >
          <Plus size={16} />
          {isHindi ? "घटना दर्ज करें" : "Record Incident"}
        </button>
      </div>

      <section className="official-stats-grid">
        <div className="official-stat-card">
          <AlertTriangle size={20} />
          <div>
            <span>{isHindi ? "कुल घटनाएँ" : "Total Incidents"}</span>
            <strong>{totals.total}</strong>
          </div>
        </div>

        <div className="official-stat-card">
          <ShieldAlert size={20} />
          <div>
            <span>{isHindi ? "गंभीर घटनाएँ" : "Critical Incidents"}</span>
            <strong>{totals.critical}</strong>
          </div>
        </div>

        <div className="official-stat-card">
          <Clock3 size={20} />
          <div>
            <span>{isHindi ? "सक्रिय घटनाएँ" : "Active Incidents"}</span>
            <strong>{totals.active}</strong>
          </div>
        </div>

        <div className="official-stat-card">
          <CheckCircle2 size={20} />
          <div>
            <span>{isHindi ? "स्वतः दर्ज" : "Automatically Recorded"}</span>
            <strong>{totals.automatic}</strong>
          </div>
        </div>
      </section>

      <section className="official-panel">
        <div className="official-panel-head">
          <div>
            <h2>{isHindi ? "आपातकालीन घटनाएँ" : "Emergency Incidents"}</h2>
            <p className="official-page-subtitle">
              {backendOnline
                ? isHindi
                  ? "लाइव मॉनिटरिंग सिस्टम से स्वतः अपडेट हो रहा है"
                  : "Automatically updated from the live monitoring system"
                : isHindi
                ? "लाइव बैकएंड कनेक्शन उपलब्ध नहीं है"
                : "Live backend connection unavailable"}
            </p>
          </div>

          <span style={{ fontSize: 12, color: backendOnline ? "#16803c" : "#9a3412" }}>
            ● {backendOnline ? "LIVE" : "OFFLINE"}
            {lastUpdated ? ` • ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
          </span>
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

                    <span className="official-incident-location">
                      <MapPin size={13} />
                      {incident.location}
                    </span>
                  </div>

                  <div className="official-incident-badges">
                    <StatusBadge
                      label={t(incident.severity.toLowerCase())}
                      tone={incident.severity.toLowerCase()}
                    />
                    <StatusBadge
                      label={
                        incident.status === "In Progress"
                          ? t("inProgress")
                          : incident.status === "Resolved"
                          ? t("resolved")
                          : incident.status
                      }
                      tone={
                        incident.status === "In Progress"
                          ? "inprogress"
                          : incident.status.toLowerCase()
                      }
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="official-incident-body">
                    <div className="official-incident-meta">
                      <span>
                        <Users size={14} aria-hidden="true" />
                        {" "}
                        {t("assignedTeam")}: <strong>{incident.team}</strong>
                      </span>

                      <span>
                        {isHindi ? "प्रकार" : "Type"}: <strong>{incident.type}</strong>
                      </span>

                      <span>{incident.updated}</span>
                    </div>

                    <p style={{ margin: "12px 0", color: "#52606d", fontSize: 13 }}>
                      {incident.description}
                    </p>

                    <h4>{t("timeline")}</h4>

                    <ol className="official-timeline">
                      {(incident.timeline || []).map((step, idx) => (
                        <li key={idx}>
                          <span className="official-timeline-time">{step.time}</span>
                          <span>{isHindi ? step.hi : step.en}</span>
                        </li>
                      ))}
                    </ol>

                    {incident.source === "official" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        {STATUSES.map((status) => (
                          <button
                            key={status}
                            type="button"
                            className="official-secondary-button"
                            onClick={() => updateIncidentStatus(incident.id, status)}
                          >
                            {status}
                          </button>
                        ))}

                        <button
                          type="button"
                          className="official-secondary-button"
                          onClick={() => deleteManualIncident(incident.id)}
                          style={{ marginLeft: "auto" }}
                        >
                          {isHindi ? "हटाएँ" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          border: "1px solid #dbe2e7",
          background: "#f8fafc",
          borderRadius: 7,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <strong style={{ color: "#334155" }}>
          {isHindi ? "महत्वपूर्ण:" : "Important:"}
        </strong>{" "}
        {isHindi
          ? "सिस्टम द्वारा स्वतः दर्ज घटना का अर्थ केवल यह है कि मॉनिटरिंग सिस्टम ने एक घटना या जोखिम दर्ज किया है। इसे स्वतः किसी व्यक्ति या संगठन की आपराधिक/अवैध गतिविधि का प्रमाण नहीं माना जाता।"
          : "An automatically recorded event means the monitoring system detected or recorded an emergency condition. It is not, by itself, proof of illegal or criminal activity by any person or organization."}
      </div>

      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(620px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 10,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  {isHindi ? "नई आपातकालीन घटना" : "Record New Incident"}
                </h2>
                <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 12 }}>
                  {isHindi
                    ? "अधिकृत अधिकारी द्वारा दर्ज घटना"
                    : "Incident recorded by an authorized official"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident}>
              <div style={{ display: "grid", gap: 12 }}>
                <label>
                  Incident / Activity *
                  <input
                    value={form.title}
                    onChange={updateForm("title")}
                    placeholder="e.g. Suspected illegal dumping near river"
                    style={inputStyle}
                  />
                </label>

                <label>
                  Location *
                  <input
                    value={form.location}
                    onChange={updateForm("location")}
                    placeholder="Village / ward / area"
                    style={inputStyle}
                  />
                </label>

                <label>
                  Type
                  <select value={form.type} onChange={updateForm("type")} style={inputStyle}>
                    {TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label>
                    Severity
                    <select
                      value={form.severity}
                      onChange={updateForm("severity")}
                      style={inputStyle}
                    >
                      {SEVERITIES.map((severity) => (
                        <option key={severity}>{severity}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      value={form.status}
                      onChange={updateForm("status")}
                      style={inputStyle}
                    >
                      {STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Assigned Team
                  <input
                    value={form.team}
                    onChange={updateForm("team")}
                    placeholder="Response / police / medical team"
                    style={inputStyle}
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={form.description}
                    onChange={updateForm("description")}
                    placeholder="Record factual observations only."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </label>

                {formError && (
                  <div style={{ color: "#b91c1c", fontSize: 12 }}>{formError}</div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    className="official-secondary-button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    {isHindi ? "रद्द करें" : "Cancel"}
                  </button>

                  <button type="submit" className="official-primary-button">
                    <Plus size={16} />
                    {isHindi ? "घटना दर्ज करें" : "Record Incident"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 5,
  padding: "9px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 5,
  boxSizing: "border-box",
  fontSize: 13,
  background: "#fff",
  color: "#1e293b",
};
