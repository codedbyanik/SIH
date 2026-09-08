import { MapPin, Navigation, Pencil } from "lucide-react";

import { useLanguage } from "../../LanguageContext.jsx";
import { useActiveLocation } from "../../LocationContext.jsx";

/**
 * Shows the app's current active location (📍 Village, District, State).
 * If the active location is a "nearest available" match rather than an
 * exact one, a short note makes that clear instead of implying the
 * nearest data location IS the user's exact location.
 */
function LocationBadge({ className = "" }) {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const { activeLocation, changeLocation } = useActiveLocation();

  if (!activeLocation) return null;

  const { resolved, matchType, distanceKm, scope, entered } = activeLocation;

  const changeLabel = isHindi ? "स्थान बदलें" : "Change Location";

  return (
    <div className={`location-badge ${className}`}>
      <div className="location-badge-main">
        <MapPin size={16} />
        <span className="location-badge-text">
          {resolved.village}, {resolved.district}, {resolved.state}
        </span>
      </div>

      {matchType === "nearest" && (
        <div className="location-badge-note">
          <Navigation size={13} />
          <span>
            {isHindi ? "निकटतम उपलब्ध डेटा" : "Nearest available data"}
            {entered?.village ? ` — ${isHindi ? "आपका स्थान" : "your area"}: ${entered.village}` : ""}
          </span>
        </div>
      )}

      {scope === "gps" && typeof distanceKm === "number" && (
        <div className="location-badge-note">
          <Navigation size={13} />
          <span>
            {distanceKm} {isHindi ? "किमी दूर" : "km away"}
          </span>
        </div>
      )}

      <button type="button" className="location-badge-change" onClick={changeLocation}>
        <Pencil size={13} />
        {changeLabel}
      </button>
    </div>
  );
}

export default LocationBadge;
