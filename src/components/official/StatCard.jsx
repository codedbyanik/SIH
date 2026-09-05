/* =========================================================
   StatCard
   Reusable metric card used on the Official Dashboard and
   other summary sections (Shelters, Preparedness, etc).
   ========================================================= */

export default function StatCard({ icon: Icon, label, value, delta, tone = "neutral" }) {
  return (
    <div className={`official-stat-card official-stat-tone-${tone}`}>
      <div className="official-stat-top">
        <span className="official-stat-label">{label}</span>
        {Icon && (
          <span className="official-stat-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
      </div>

      <div className="official-stat-value">{value}</div>

      {delta && <div className="official-stat-delta">{delta}</div>}
    </div>
  );
}
