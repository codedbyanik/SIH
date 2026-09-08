import { createContext, useContext, useState } from "react";
import {
  findLocationMatch,
  findNearestByCoordinates,
} from "./data/locationData.js";

const STORAGE_KEY = "activeLocation";

const LocationContext = createContext(null);

function loadStoredLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      parsed &&
      parsed.resolved &&
      parsed.resolved.state &&
      parsed.resolved.district &&
      parsed.resolved.village
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }) {
  const [activeLocation, setActiveLocation] = useState(loadStoredLocation);

  // Whether the user is actively being shown the location-selection
  // screen again (triggered by "Change Location").
  const [isChangingLocation, setIsChangingLocation] = useState(false);

  const persist = (value) => {
    setActiveLocation(value);

    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage may be unavailable (e.g. private browsing) —
      // the app still works for this session, it just won't persist.
    }
  };

  /**
   * Called when the user selects State/District/Village from the
   * location gate. Returns the match result so the calling screen can
   * show the right "exact" / "nearest" / "invalid" messaging.
   */
  const selectLocation = ({ state, district, village }) => {
    const result = findLocationMatch(state, district, village);

    if (result.status === "invalid" || result.status === "no-data") {
      return result;
    }

    persist({
      entered: { state, district, village },
      resolved: result.resolved,
      matchType: result.status, // "exact" | "nearest"
      distanceKm: result.distanceKm,
      scope: result.scope || null,
      source: "manual",
      setAt: Date.now(),
    });

    setIsChangingLocation(false);

    return result;
  };

  /**
   * Called when the user chooses "Use My Location" (browser GPS).
   */
  const selectLocationByCoords = (lat, lng) => {
    const result = findNearestByCoordinates(lat, lng);

    if (result.status === "no-data") {
      return result;
    }

    persist({
      entered: { lat, lng },
      resolved: result.resolved,
      matchType: result.status,
      distanceKm: result.distanceKm,
      scope: result.scope || null,
      source: "gps",
      setAt: Date.now(),
    });

    setIsChangingLocation(false);

    return result;
  };

  const changeLocation = () => {
    setIsChangingLocation(true);
  };

  const cancelChangeLocation = () => {
    // Only allow cancelling back out if a location is already set —
    // first-time selection is not optional.
    if (activeLocation) {
      setIsChangingLocation(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        activeLocation,
        hasLocation: Boolean(activeLocation),
        isChangingLocation,
        selectLocation,
        selectLocationByCoords,
        changeLocation,
        cancelChangeLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useActiveLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useActiveLocation must be used inside a LocationProvider");
  }

  return context;
}
