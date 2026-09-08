/**
 * locationData.js
 * ------------------------------------------------------------------
 * Single source of truth for the app's State -> District -> Village
 * hierarchy, plus the risk-zone and shelter records that are tied to
 * specific villages, and the raw environmental readings (elevation,
 * slope, distance to river, rainfall) used by the Home page.
 *
 * Prototype scope: Kerala > Wayanad > 5 villages only (Mundakkai,
 * Chooralmala, Meppadi, Vythiri, Kalpetta). This is used app-wide by
 * LocationContext / LocationGate / LocationBadge and by the Risk Map,
 * Shelters, Alerts, Preparedness and Emergency pages.
 * ------------------------------------------------------------------
 */

export const WAYANAD_STATE = "Kerala";
export const WAYANAD_DISTRICT = "Wayanad";

// =====================================================================
// STATE -> DISTRICT -> VILLAGE HIERARCHY
// =====================================================================
export const locationHierarchy = {
  [WAYANAD_STATE]: {
    [WAYANAD_DISTRICT]: [
      "Mundakkai",
      "Chooralmala",
      "Meppadi",
      "Vythiri",
      "Kalpetta",
    ],
  },
};

// =====================================================================
// RAW LOCATION DATASET
// Real coordinates + environmental readings for the 5 prototype
// villages. This is the source of truth for the Home page's
// elevation / slope / distance-to-river / rainfall indicators, and
// for deriving the risk zones and shelters below.
// =====================================================================
export const wayanadLocations = [
  {
    name: "Mundakkai",
    lat: 11.648,
    lng: 76.123,
    elevation_m: 738,
    slope_deg: 3.7,
    distance_to_river_m: 19.1,
    peak_rainfall_mm: 5.7,
    rainfall_3day_total_mm: 39.6,
  },
  {
    name: "Chooralmala",
    lat: 11.651,
    lng: 76.126,
    elevation_m: 756,
    slope_deg: 8.23,
    distance_to_river_m: 254.6,
    peak_rainfall_mm: 8.6,
    rainfall_3day_total_mm: 48.4,
  },
  {
    name: "Meppadi",
    lat: 11.656,
    lng: 76.137,
    elevation_m: 757,
    slope_deg: 12.24,
    distance_to_river_m: 171.1,
    peak_rainfall_mm: 6.7,
    rainfall_3day_total_mm: 40.0,
  },
  {
    name: "Vythiri",
    lat: 11.585,
    lng: 76.085,
    elevation_m: 789,
    slope_deg: 16.6,
    distance_to_river_m: 228.3,
    peak_rainfall_mm: 8.6,
    rainfall_3day_total_mm: 48.4,
  },
  {
    name: "Kalpetta",
    lat: 11.609,
    lng: 76.082,
    elevation_m: 753,
    slope_deg: 5.84,
    distance_to_river_m: 387.7,
    peak_rainfall_mm: 8.6,
    rainfall_3day_total_mm: 48.4,
  },
];

export function getWayanadLocationByName(name) {
  return wayanadLocations.find((location) => location.name === name) || null;
}

// =====================================================================
// RISK ZONE CLASSIFICATION
// Derived directly from the raw readings above (no invented figures):
//  - risk level: based on 3-day rainfall total
//  - hazard type: steeper slope -> Landslide, otherwise -> Flood
// =====================================================================
function classifyRisk(loc) {
  const risk =
    loc.rainfall_3day_total_mm >= 45
      ? "High"
      : loc.rainfall_3day_total_mm >= 40
        ? "Moderate"
        : "Advisory";

  const type = loc.slope_deg > 10 ? "Landslide" : "Flood";

  const description =
    type === "Landslide"
      ? `Steep slope gradient (${loc.slope_deg}\u00b0) combined with recent rainfall increases landslide risk.`
      : `Close proximity to the river (${loc.distance_to_river_m} m) combined with recent rainfall increases flood risk.`;

  return { risk, type, description };
}

export const riskZones = wayanadLocations.map((loc, index) => {
  const { risk, type, description } = classifyRisk(loc);

  return {
    id: index + 1,
    name: loc.name,
    district: WAYANAD_DISTRICT,
    state: WAYANAD_STATE,
    risk,
    type,
    rainfall: `${loc.peak_rainfall_mm} mm`,
    description,
    lat: loc.lat,
    lng: loc.lng,
  };
});

// =====================================================================
// SHELTER DATA
// One demo shelter per village (placeholder facilities/capacity, in
// the same style as the app's existing demo shelter records).
// =====================================================================
const shelterTemplates = [
  { capacity: 220, available: 96, status: "Available", facilities: ["Drinking Water", "First Aid", "Accessible"] },
  { capacity: 180, available: 42, status: "Available", facilities: ["Drinking Water", "Medical Aid"] },
  { capacity: 150, available: 18, status: "Limited", facilities: ["Drinking Water", "First Aid"] },
  { capacity: 260, available: 110, status: "Available", facilities: ["Drinking Water", "Medical Aid", "Accessible"] },
  { capacity: 130, available: 12, status: "Limited", facilities: ["Drinking Water", "Accessible"] },
];

export const shelterData = {
  [WAYANAD_STATE]: {
    [WAYANAD_DISTRICT]: wayanadLocations.map((loc, index) => {
      const template = shelterTemplates[index] || shelterTemplates[0];

      return {
        name: `${loc.name} Community Relief Centre`,
        type: "Emergency Shelter",
        address: `${loc.name}, Wayanad, Kerala`,
        distance: "1.0 km",
        capacity: template.capacity,
        available: template.available,
        status: template.status,
        phone: "112",
        facilities: template.facilities,
        lat: loc.lat,
        lng: loc.lng,
        village: loc.name,
      };
    }),
  },
};

// =====================================================================
// DISTANCE HELPER
// Simple Haversine formula — no package installed.
// =====================================================================
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

// =====================================================================
// FLATTENING HELPERS
// =====================================================================
export function getAllShelters() {
  const all = [];

  Object.entries(shelterData).forEach(([state, districts]) => {
    Object.entries(districts).forEach(([district, shelters]) => {
      shelters.forEach((shelter) => {
        all.push({ ...shelter, state, district });
      });
    });
  });

  return all;
}

export function getAllRiskZones() {
  return riskZones.map((zone) => ({
    ...zone,
    village: zone.name,
  }));
}

/**
 * Every village in the hierarchy that actually has coordinate-backed
 * data (a risk zone and/or a shelter). These are the app's real
 * "backend data points" for the nearest-location calculation.
 * Deduplicated by state|district|village, keeping the first
 * coordinate found (risk zone coordinates first, then shelters).
 */
export function getAllDataPoints() {
  const points = new Map();

  getAllRiskZones().forEach((zone) => {
    const key = `${zone.state}|${zone.district}|${zone.village}`;
    if (!points.has(key)) {
      points.set(key, {
        state: zone.state,
        district: zone.district,
        village: zone.village,
        lat: zone.lat,
        lng: zone.lng,
      });
    }
  });

  getAllShelters().forEach((shelter) => {
    const key = `${shelter.state}|${shelter.district}|${shelter.village}`;
    if (!points.has(key)) {
      points.set(key, {
        state: shelter.state,
        district: shelter.district,
        village: shelter.village,
        lat: shelter.lat,
        lng: shelter.lng,
      });
    }
  });

  return Array.from(points.values());
}

// =====================================================================
// LOCATION MATCHING
// =====================================================================

/**
 * Validate a state/district/village combination against the hierarchy.
 */
export function isValidHierarchyLocation(state, district, village) {
  const districts = locationHierarchy[state];
  if (!districts) return false;

  const villages = districts[district];
  if (!villages) return false;

  return villages.includes(village);
}

/**
 * Resolve a user-picked state/district/village against the app's real
 * data points (risk zones + shelters).
 *
 * Returns one of:
 *  - { status: "invalid" }
 *    The state/district/village combination doesn't exist in the
 *    hierarchy at all.
 *  - { status: "exact", resolved: {state,district,village}, distanceKm: 0 }
 *    The selected village itself has coordinate-backed data.
 *  - { status: "nearest", resolved: {...}, distanceKm: null | number,
 *      scope: "district" | "state" }
 *    The selected village has no data of its own; `resolved` points to
 *    the nearest available data location.
 *  - { status: "no-data" }
 *    The location is valid but there is no data anywhere in its state.
 */
export function findLocationMatch(state, district, village) {
  if (!isValidHierarchyLocation(state, district, village)) {
    return { status: "invalid" };
  }

  const dataPoints = getAllDataPoints();

  const exact = dataPoints.find(
    (p) => p.state === state && p.district === district && p.village === village
  );

  if (exact) {
    return {
      status: "exact",
      resolved: { state: exact.state, district: exact.district, village: exact.village },
      distanceKm: 0,
    };
  }

  // Same district fallback.
  const sameDistrict = dataPoints.filter(
    (p) => p.state === state && p.district === district
  );

  if (sameDistrict.length > 0) {
    return {
      status: "nearest",
      resolved: {
        state: sameDistrict[0].state,
        district: sameDistrict[0].district,
        village: sameDistrict[0].village,
      },
      distanceKm: null,
      scope: "district",
    };
  }

  // Same state fallback.
  const sameState = dataPoints.filter((p) => p.state === state);

  if (sameState.length > 0) {
    return {
      status: "nearest",
      resolved: {
        state: sameState[0].state,
        district: sameState[0].district,
        village: sameState[0].village,
      },
      distanceKm: null,
      scope: "state",
    };
  }

  return { status: "no-data" };
}

/**
 * Resolve a real GPS position (from the browser's Geolocation API)
 * to the nearest available data location, using real Haversine
 * distances against every known data point. Since this prototype only
 * has 5 Wayanad villages, this always returns the nearest of the 5 —
 * there is no "unavailable" state.
 */
export function findNearestByCoordinates(lat, lng) {
  const dataPoints = getAllDataPoints();

  if (dataPoints.length === 0) {
    return { status: "no-data" };
  }

  let nearest = null;
  let nearestDistance = Infinity;

  dataPoints.forEach((point) => {
    const distance = haversineDistanceKm(lat, lng, point.lat, point.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = point;
    }
  });

  return {
    status: "exact", // resolved directly from real device coordinates
    resolved: { state: nearest.state, district: nearest.district, village: nearest.village },
    distanceKm: Math.round(nearestDistance * 10) / 10,
    scope: "gps",
  };
}
