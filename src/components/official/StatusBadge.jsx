/* =========================================================
   StatusBadge
   Small labeled pill used for severity / status / risk level
   across the Official Portal (alerts, shelters, incidents…).
   ========================================================= */

const TONE_MAP = {
  critical: "official-badge-critical",
  high: "official-badge-high",
  moderate: "official-badge-moderate",
  low: "official-badge-low",
  active: "official-badge-critical",
  monitoring: "official-badge-moderate",
  resolved: "official-badge-safe",
  operational: "official-badge-safe",
  "at capacity": "official-badge-moderate",
  unavailable: "official-badge-muted",
  warning: "official-badge-moderate",
  normal: "official-badge-safe",
  "in progress": "official-badge-moderate",
  inactive: "official-badge-muted",
};

export default function StatusBadge({ label, tone }) {
  const key = (tone || label || "").toString().toLowerCase();
  const toneClass = TONE_MAP[key] || "official-badge-muted";

  return (
    <span className={`official-badge ${toneClass}`}>
      <span className="official-badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
