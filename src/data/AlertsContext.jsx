import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { wayanadLocations, WAYANAD_STATE, WAYANAD_DISTRICT } from "./locationData.js";
import { VILLAGE_NAME_HI } from "../official/data/officialMockData.js";

/* =========================================================
   ALERTS CONTEXT — single shared source of truth for alerts
   created through the Official Portal's "Create Alert" flow.

   - Official → Live Alerts reads this list (merged with the
     existing prototype alerts) and can add to it.
   - Citizen → Alerts reads the same list so newly created
     official alerts show up automatically, with no hardcoded
     edits required.
   - Persisted to localStorage so it survives page refreshes
     and works across routes without a backend.
   - The shape below is intentionally simple/flat so a real
     backend/API can replace this provider later without
     requiring changes to the pages that consume it.
   ========================================================= */

const STORAGE_KEY = "sih_official_created_alerts";

// Only the 5 prototype locations already used across the app.
export const ALERT_LOCATIONS = wayanadLocations.map((location) => location.name);

export const ALERT_TYPES = [
  "Flash Flood Warning",
  "Landslide Warning",
  "Heavy Rainfall Advisory",
  "Weather Advisory",
];

export const ALERT_SEVERITIES = ["Critical", "High", "Moderate", "Low"];
export const ALERT_STATUSES = ["Active", "Monitoring", "Resolved"];

const AlertsContext = createContext(null);

function loadStoredAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatClockTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function AlertsProvider({ children }) {
  const [createdAlerts, setCreatedAlerts] = useState(loadStoredAlerts);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createdAlerts));
    } catch {
      // localStorage may be unavailable (e.g. private browsing) — the
      // alert still works for this session, it just won't persist.
    }
  }, [createdAlerts]);

  const addAlert = useCallback(({ location, type, severity, status, message }) => {
    const now = new Date();

    const alert = {
      id: `OA-${now.getTime()}`,
      location,
      locationEn: `${WAYANAD_STATE} · ${location}`,
      locationHi: `केरल · ${VILLAGE_NAME_HI[location] || location}`,
      type,
      severity,
      status,
      message,
      district: WAYANAD_DISTRICT,
      state: WAYANAD_STATE,
      issued: formatClockTime(now),
      createdAt: now.getTime(),
      source: "official",
    };

    setCreatedAlerts((current) => [alert, ...current]);

    return alert;
  }, []);

  return (
    <AlertsContext.Provider value={{ createdAlerts, addAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlertsStore() {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error("useAlertsStore must be used inside an AlertsProvider");
  }

  return context;
}
