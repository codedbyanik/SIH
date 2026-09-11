import { useMemo, useState, useEffect, useRef } from "react";
import {
  Map,
  MapPin,
  Layers,
  Navigation,
  AlertTriangle,
  ShieldAlert,
  Droplets,
  Mountain,
  Info,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";


// ============================================================
// BACKEND
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000";


// ============================================================
// WAYANAD LOCATION STRUCTURE
// ============================================================

const locations = {
  Kerala: {
    Wayanad: [
      "Mundakkai",
      "Chooralmala",
      "Meppadi",
      "Vythiri",
      "Kalpetta",
    ],
  },
};


// ============================================================
// FALLBACK ZONES
// ============================================================

const fallbackZones = [
  {
    id: 1,
    name: "Mundakkai",
    district: "Wayanad",
    state: "Kerala",
    risk: "Advisory",
    type: "Landslide",
    rainfall: "0 mm",
    rainfall_mm: 0,
    risk_score: 0,
    description:
      "Monitoring rainfall, soil moisture, terrain and river proximity.",
    lat: 11.648,
    lng: 76.123,
  },

  {
    id: 2,
    name: "Chooralmala",
    district: "Wayanad",
    state: "Kerala",
    risk: "Advisory",
    type: "Landslide",
    rainfall: "0 mm",
    rainfall_mm: 0,
    risk_score: 0,
    description:
      "Monitoring rainfall, soil moisture, terrain and river proximity.",
    lat: 11.651,
    lng: 76.126,
  },

  {
    id: 3,
    name: "Meppadi",
    district: "Wayanad",
    state: "Kerala",
    risk: "Advisory",
    type: "Landslide",
    rainfall: "0 mm",
    rainfall_mm: 0,
    risk_score: 0,
    description:
      "Monitoring rainfall, soil moisture, terrain and river proximity.",
    lat: 11.656,
    lng: 76.137,
  },

  {
    id: 4,
    name: "Vythiri",
    district: "Wayanad",
    state: "Kerala",
    risk: "Advisory",
    type: "Landslide",
    rainfall: "0 mm",
    rainfall_mm: 0,
    risk_score: 0,
    description:
      "Monitoring rainfall, soil moisture, terrain and river proximity.",
    lat: 11.585,
    lng: 76.085,
  },

  {
    id: 5,
    name: "Kalpetta",
    district: "Wayanad",
    state: "Kerala",
    risk: "Advisory",
    type: "Landslide",
    rainfall: "0 mm",
    rainfall_mm: 0,
    risk_score: 0,
    description:
      "Monitoring rainfall, soil moisture, terrain and river proximity.",
    lat: 11.609,
    lng: 76.082,
  },
];


// ============================================================
// NORMALIZE LIVE BACKEND ZONES
//
// The live endpoint can return the risk data without the map
// coordinates used by the Leaflet markers. Keep the backend
// values, but restore the known Wayanad coordinates by zone name.
// ============================================================

const knownZoneCoordinates = {
  Mundakkai: { lat: 11.648, lng: 76.123 },
  Chooralmala: { lat: 11.651, lng: 76.126 },
  Meppadi: { lat: 11.656, lng: 76.137 },
  Vythiri: { lat: 11.585, lng: 76.085 },
  Kalpetta: { lat: 11.609, lng: 76.082 },
};

function normalizeMapZones(zones) {
  return (Array.isArray(zones) ? zones : []).map((zone, index) => {
    const name =
      zone?.name ||
      zone?.zone ||
      zone?.location ||
      zone?.village ||
      `Zone ${index + 1}`;

    const known = knownZoneCoordinates[name];

    const lat = Number(
      zone?.lat ??
      zone?.latitude ??
      known?.lat
    );

    const lng = Number(
      zone?.lng ??
      zone?.longitude ??
      known?.lng
    );

    return {
      ...zone,
      id: zone?.id ?? index + 1,
      name,
      district: zone?.district || "Wayanad",
      state: zone?.state || "Kerala",
      lat,
      lng,
    };
  }).filter(
    (zone) =>
      Number.isFinite(zone.lat) &&
      Number.isFinite(zone.lng)
  );
}


// ============================================================
// RISK MARKER
// ============================================================

function getRiskIcon(risk = "Advisory") {
  return L.divIcon({
    className: "",

    html: `
      <span class="official-riskmap-marker official-risk-${String(
        risk
      ).toLowerCase()}"></span>
    `,

    iconSize: [22, 22],

    iconAnchor: [11, 11],

    popupAnchor: [0, -12],
  });
}


// ============================================================
// MAP AUTO FIT
// ============================================================

function MapAutoFit({ zones }) {
  const map = useMap();

  useEffect(() => {
    if (!zones || zones.length === 0) {
      map.setView([11.62, 76.11], 11);
      return;
    }

    const points = zones
      .filter(
        (zone) =>
          Number.isFinite(Number(zone.lat)) &&
          Number.isFinite(Number(zone.lng))
      )
      .map((zone) => [
        Number(zone.lat),
        Number(zone.lng),
      ]);

    if (points.length === 0) {
      map.setView([11.62, 76.11], 11);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    map.fitBounds(points, {
      padding: [35, 35],
    });
  }, [map, zones]);

  return null;
}


// ============================================================
// RISK DESCRIPTION
// ============================================================

function getRiskDescription(zone, isHindi) {
  if (isHindi) {
    if (zone.risk === "Critical") {
      return "बहुत उच्च जोखिम का संकेत। वर्षा संचय और अन्य जोखिम संकेतकों की तत्काल निगरानी आवश्यक है।";
    }

    if (zone.risk === "High") {
      return "उच्च जोखिम का संकेत। वर्षा और क्षेत्रीय परिस्थितियों की लगातार निगरानी करें।";
    }

    if (zone.risk === "Moderate") {
      return "मध्यम जोखिम का संकेत। बदलती वर्षा और मिट्टी की स्थिति पर नजर रखें।";
    }

    return "वर्तमान संकेतकों के आधार पर सामान्य निगरानी जारी रखें।";
  }

  if (zone.risk === "Critical") {
    return "Very high hazard signal. Immediate monitoring of rainfall accumulation and local conditions is recommended.";
  }

  if (zone.risk === "High") {
    return "High hazard signal. Continue close monitoring of rainfall and local conditions.";
  }

  if (zone.risk === "Moderate") {
    return "Moderate hazard signal. Monitor changing rainfall and soil conditions.";
  }

  return "Continue routine monitoring based on the current indicators.";
}


// ============================================================
// USER LOCATION MARKER
// ============================================================

function UserLocationMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(
      [position.lat, position.lng],
      14,
      { animate: true }
    );
  }, [map, position]);

  const userIcon = L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:50%;
        background:#1976d2;
        border:3px solid white;
        box-shadow:0 1px 8px rgba(0,0,0,.35);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker
      position={[
        position.lat,
        position.lng,
      ]}
      icon={userIcon}
    >
      <Popup>
        <strong>
          Your Current Location
        </strong>
        <br />
        {position.lat.toFixed(5)},{" "}
        {position.lng.toFixed(5)}
      </Popup>
    </Marker>
  );
}


// ============================================================
// AUTOMATIC ALERT ENGINE HELPERS
// ============================================================

function getMLHazardLevel(score) {
  const value = Number(score ?? 0);

  if (value >= 0.85) return "Critical";
  if (value >= 0.70) return "High";
  if (value >= 0.40) return "Moderate";
  if (value >= 0.15) return "Elevated";
  return "Low";
}

function getMLHazardPriority(level) {
  return {
    Low: 0,
    Elevated: 1,
    Moderate: 2,
    High: 3,
  }[level] ?? 0;
}

function getAlertMessage(level, isHindi) {
  if (isHindi) {
    if (level === "Critical") {
      return "अत्यंत उच्च ML खतरा संकेत मिला है। तत्काल कार्रवाई करें, सुरक्षित ऊंचे स्थान पर जाएं और स्थानीय अधिकारियों के निर्देशों का पालन करें।";
    }
    if (level === "High") {
      return "उच्च ML खतरा संकेत मिला है। संवेदनशील क्षेत्रों की तत्काल निगरानी बढ़ाएं और स्थानीय अधिकारियों के निर्देशों का पालन करें।";
    }
    if (level === "Moderate") {
      return "मध्यम ML खतरा संकेत मिला है। वर्षा, मिट्टी और स्थानीय परिस्थितियों की निगरानी बढ़ाएं।";
    }
    return "ML संकेत सलाहकारी स्तर पर है। नियमित निगरानी जारी रखें और स्थानीय चेतावनियों का पालन करें।";
  }

  if (level === "Critical") {
    return "Critical rainfall warning. Take immediate action, move to a safe elevated location, and follow local authority instructions.";
  }
  if (level === "High") {
    return "High rainfall warning. Increase preparedness immediately and follow local authority instructions.";
  }
  if (level === "Moderate") {
    return "Moderate rainfall warning. Increase monitoring of rainfall, soil and local conditions.";
  }
  return "Advisory rainfall warning. Continue routine monitoring and follow local advisories.";
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function RiskMap() {
  const { isHindi } = useOfficialLanguage();


  // ==========================================================
  // LOCATION STATE
  // ==========================================================

  const [state, setState] =
    useState("Kerala");

  const [district, setDistrict] =
    useState("Wayanad");

  const [village, setVillage] =
    useState("Mundakkai");


  // ==========================================================
  // MAP STATE
  // ==========================================================

  const [selectedZoneId, setSelectedZoneId] =
    useState(null);

  const [layer, setLayer] =
    useState("All");


  // ==========================================================
  // BACKEND RISK DATA
  // ==========================================================

  const [riskZones, setRiskZones] =
    useState(fallbackZones);


  // ==========================================================
  // DATA MODE
  //
  // live
  // replay
  // imd
  // ==========================================================

  const [dataSource, setDataSource] =
    useState("live");


  // ==========================================================
  // RAINFALL SIMULATION
  // ==========================================================

  const [simRainfall, setSimRainfall] =
    useState(null);


  // ==========================================================
  // BACKEND TIMESTAMP
  // ==========================================================

  const [dataTimestamp, setDataTimestamp] =
    useState(null);


  // ==========================================================
  // BACKEND CONNECTION
  // ==========================================================

  const [backendOnline, setBackendOnline] =
    useState(false);


  // ==========================================================
  // REPLAY STATE
  // ==========================================================

  const [replayRunning, setReplayRunning] =
    useState(false);

  const [replayTimestamp, setReplayTimestamp] =
    useState(null);

  const [replayError, setReplayError] =
    useState(null);

  // ==========================================================
  // FUTURE RISK FORECAST
  // ==========================================================

  const [forecastZones, setForecastZones] =
    useState([]);

  const [forecastLoading, setForecastLoading] =
    useState(false);

  const [forecastError, setForecastError] =
    useState(null);

  // ==========================================================
  // USER CURRENT LOCATION
  // ==========================================================
  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [locating, setLocating] =
    useState(false);

  const [locationError, setLocationError] =
    useState(null);

  // ==========================================================
  // AUTOMATIC ALERT ENGINE
  // ==========================================================

  const [automaticAlert, setAutomaticAlert] =
    useState(null);

  const lastAlertKeyRef = useRef(null);


  // ==========================================================
  // SELECTED ZONE
  // The panel always derives the selected zone from the latest
  // riskZones data, so replay updates are reflected immediately.
  // ==========================================================

  const selectedZone = useMemo(() => {
    if (!riskZones || riskZones.length === 0) {
      return null;
    }

    if (selectedZoneId !== null && selectedZoneId !== undefined) {
      const byId = riskZones.find(
        (zone) =>
          Number(zone.id) === Number(selectedZoneId)
      );

      if (byId) {
        return byId;
      }
    }

    const byVillage = riskZones.find(
      (zone) =>
        String(zone.name).toLowerCase() ===
        String(village).toLowerCase()
    );

    return byVillage || riskZones[0] || null;
  }, [riskZones, selectedZoneId, village]);


  // ==========================================================
  // REPLAY START
  // ==========================================================

  const startReplay = async () => {
    try {
      setReplayError(null);

      const response = await fetch(
        `${API_BASE}/api/replay/start`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to start historical replay."
        );
      }

      // Switch map to replay mode.
      setSimRainfall(null);
      setDataSource("replay");

      // Backend may say already_running.
      setReplayRunning(true);

      if (data?.status === "already_running") {
        console.log(
          "Historical replay already running."
        );
      }
    } catch (error) {
      console.error(
        "Replay start error:",
        error
      );

      setReplayError(
        error?.message ||
          "Unable to start historical replay."
      );

      setReplayRunning(false);
    }
  };


  // ==========================================================
  // REPLAY STOP
  // ==========================================================

  const stopReplay = async () => {
    try {
      await fetch(
        `${API_BASE}/api/replay/stop`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "Replay stop error:",
        error
      );
    }

    setReplayRunning(false);
  };


  // ==========================================================
  // REPLAY RESET
  // ==========================================================

  const resetReplay = async () => {
    try {
      await fetch(
        `${API_BASE}/api/replay/reset`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "Replay reset error:",
        error
      );
    }

    setReplayRunning(false);
    setReplayTimestamp(null);
    setDataTimestamp(null);
    setReplayError(null);
    setSelectedZoneId(null);

    // Return to live mode.
    setSimRainfall(null);
    setDataSource("live");
  };


  // ==========================================================
  // FETCH RISK DATA
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchZones = async () => {
      try {
        let url;

        // ----------------------------------------------------
        // Simulation
        // ----------------------------------------------------

        if (simRainfall !== null) {
          url =
            `${API_BASE}/api/simulate` +
            `?rainfall_mm=${simRainfall}`;
        }

        // ----------------------------------------------------
        // Live / Replay / IMD
        // ----------------------------------------------------

        else {
          url =
            `${API_BASE}/api/risk-map` +
            `?source=${dataSource}`;
        }


        const response = await fetch(
          url
        );


        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }


        const data =
          await response.json();


        if (cancelled) {
          return;
        }


        const zones = normalizeMapZones(data?.zones);


        if (zones.length > 0) {
          setRiskZones(zones);


          setSelectedZoneId(
            (currentId) => {
              if (currentId === null || currentId === undefined) {
                return zones[0]?.id ?? null;
              }

              const matchingZone = zones.find(
                (zone) =>
                  Number(zone.id) ===
                  Number(currentId)
              );

              return matchingZone?.id ?? zones[0]?.id ?? null;
            }
          );
        }


        const timestamp =
          data?.live_timestamp ||
          data?.timestamp ||
          null;


        setDataTimestamp(
          timestamp
        );


        if (dataSource === "replay") {
          setReplayTimestamp(
            timestamp
          );
        }


        setBackendOnline(true);

      } catch (error) {
        if (!cancelled) {
          console.error(
            "Backend not reachable:",
            error
          );

          setBackendOnline(false);
        }
      }
    };


    fetchZones();


    let interval = null;


    // --------------------------------------------------------
    // LIVE
    //
    // Existing live behaviour preserved.
    // --------------------------------------------------------

    if (
      simRainfall === null &&
      dataSource === "live"
    ) {
      interval = setInterval(
        fetchZones,
        3000
      );
    }


    // --------------------------------------------------------
    // HISTORICAL REPLAY
    //
    // Replay advances quickly, so poll every 1 second.
    // --------------------------------------------------------

    if (
      simRainfall === null &&
      dataSource === "replay"
    ) {
      interval = setInterval(
        fetchZones,
        1000
      );
    }


    // --------------------------------------------------------
    // IMD
    // --------------------------------------------------------

    if (
      simRainfall === null &&
      dataSource === "imd"
    ) {
      interval = setInterval(
        fetchZones,
        5000
      );
    }


    return () => {
      cancelled = true;


      if (interval) {
        clearInterval(interval);
      }
    };

  }, [
    dataSource,
    simRainfall,
  ]);


  // ==========================================================
  // CHECK REPLAY STATUS
  // ==========================================================

  useEffect(() => {
    if (dataSource !== "replay") {
      return;
    }


    let cancelled = false;


    const checkReplayStatus =
      async () => {
        try {
          const response =
            await fetch(
              `${API_BASE}/api/replay/status`
            );


          if (!response.ok) {
            return;
          }


          const data =
            await response.json();


          if (cancelled) {
            return;
          }


          setReplayRunning(
            Boolean(data?.running)
          );


          if (data?.timestamp) {
            setReplayTimestamp(
              data.timestamp
            );
          }

        } catch (error) {
          console.error(
            "Replay status error:",
            error
          );
        }
      };


    checkReplayStatus();


    const interval =
      setInterval(
        checkReplayStatus,
        1000
      );


    return () => {
      cancelled = true;
      clearInterval(interval);
    };

  }, [dataSource]);


  // ==========================================================
  // FETCH FUTURE RISK FORECAST
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    // Forecast mode is meaningful for live/current conditions.
    // Do not overwrite the historical replay state with live forecast data.
    if (dataSource !== "live" || simRainfall !== null) {
      setForecastZones([]);
      setForecastError(null);
      setForecastLoading(false);
      return undefined;
    }

    const fetchForecast = async () => {
      try {
        setForecastLoading(true);

        const response = await fetch(
          `${API_BASE}/api/forecast-risk`
        );

        if (!response.ok) {
          throw new Error(
            `Forecast API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        const zones = Array.isArray(data?.zones)
          ? data.zones
          : [];

        setForecastZones(zones);
        setForecastError(null);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Forecast fetch error:",
            error
          );
          setForecastError(
            error?.message ||
              "Unable to load future risk forecast."
          );
        }
      } finally {
        if (!cancelled) {
          setForecastLoading(false);
        }
      }
    };

    fetchForecast();

    // Forecast data does not need the 1-second replay polling rate.
    // Refresh periodically while live mode is active.
    const interval = setInterval(
      fetchForecast,
      60000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [dataSource, simRainfall]);


  // ==========================================================
  // SELECTED ZONE FORECAST
  // ==========================================================

  const selectedForecast = useMemo(() => {
    if (!selectedZone || forecastZones.length === 0) {
      return null;
    }

    return (
      forecastZones.find(
        (zone) =>
          Number(zone.id) === Number(selectedZone.id)
      ) ||
      forecastZones.find(
        (zone) =>
          String(zone.name).toLowerCase() ===
          String(selectedZone.name).toLowerCase()
      ) ||
      null
    );
  }, [selectedZone, forecastZones]);


  // ==========================================================
  // LOCATION SELECTORS
  // ==========================================================

  const districts =
    useMemo(() => {
      return Object.keys(
        locations[state] || {}
      );
    }, [state]);


  const villages =
    useMemo(() => {
      return (
        locations[state]?.[
          district
        ] || []
      );
    }, [
      state,
      district,
    ]);


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredZones =
    layer === "All"
      ? riskZones
      : riskZones.filter(
          (zone) =>
            zone.type === layer
        );


  // ==========================================================
  // LOCATION HANDLERS
  // ==========================================================

  const handleStateChange = (
    value
  ) => {
    setState(value);


    const firstDistrict =
      Object.keys(
        locations[value] || {}
      )[0];


    setDistrict(
      firstDistrict || ""
    );


    const firstVillage =
      locations[value]?.[
        firstDistrict
      ]?.[0];


    setVillage(
      firstVillage || ""
    );


    setSelectedZoneId(null);
  };


  const handleDistrictChange = (
    value
  ) => {
    setDistrict(value);


    const firstVillage =
      locations[state]?.[
        value
      ]?.[0];


    setVillage(
      firstVillage || ""
    );


    setSelectedZoneId(null);
  };


  // ==========================================================
  // LOCATE USER'S CURRENT LOCATION
  // ==========================================================

  const locateArea = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(
        isHindi
          ? "इस ब्राउज़र में लोकेशन उपलब्ध नहीं है।"
          : "Location is not supported by this browser."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCurrentLocation({ lat, lng });

        const toRadians = (value) =>
          (value * Math.PI) / 180;

        const distanceKm = (lat1, lng1, lat2, lng2) => {
          const R = 6371;
          const dLat = toRadians(lat2 - lat1);
          const dLng = toRadians(lng2 - lng1);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
              Math.cos(toRadians(lat2)) *
              Math.sin(dLng / 2) ** 2;

          return (
            2 *
            R *
            Math.atan2(
              Math.sqrt(a),
              Math.sqrt(1 - a)
            )
          );
        };

        const nearest = riskZones
          .filter(
            (zone) =>
              Number.isFinite(Number(zone.lat)) &&
              Number.isFinite(Number(zone.lng))
          )
          .map((zone) => ({
            zone,
            distance: distanceKm(
              lat,
              lng,
              Number(zone.lat),
              Number(zone.lng)
            ),
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (nearest && nearest.distance <= 30) {
          setSelectedZoneId(nearest.zone.id);
          setVillage(nearest.zone.name);
          setDistrict("Wayanad");
          setState("Kerala");
          setLocationError(null);
        } else {
          setSelectedZoneId(null);
          setLocationError(
            isHindi
              ? "आपका वर्तमान स्थान निगरानी क्षेत्र से बाहर है।"
              : "Your current location is outside the monitored Wayanad area."
          );
        }

        setLocating(false);
      },
      (error) => {
        setLocating(false);

        let message =
          "Unable to get your location. Please allow location access in the browser.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access and try again.";
        } else if (error.code === 2) {
          message =
            "Your location could not be determined. Please try again.";
        } else if (error.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setLocationError(
          isHindi
            ? "लोकेशन प्राप्त नहीं हो सकी।"
            : message
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  };


  // ==========================================================
  // RISK SUMMARY
  // ==========================================================

  const riskSummary =
    useMemo(() => {
      return {
        total:
          riskZones.length,

        critical:
          riskZones.filter(
            (zone) =>
              zone.risk ===
              "Critical"
          ).length,

        high:
          riskZones.filter(
            (zone) =>
              zone.risk ===
              "High"
          ).length,

        moderate:
          riskZones.filter(
            (zone) =>
              zone.risk ===
              "Moderate"
          ).length,

        advisory:
          riskZones.filter(
            (zone) =>
              zone.risk ===
              "Advisory"
          ).length,
      };
    }, [riskZones]);


  // ==========================================================
  // AUTOMATIC ALERT ENGINE
  //
  // The automatic alert is driven by the ML hazard score,
  // not merely by the V4 zone risk label.
  // <0.70 does not trigger an emergency alert.
  // 0.70-0.849 = High, >=0.85 = Critical.
  // The siren is intentionally handled only by Citizen Alerts.
  // ==========================================================

  const automaticAlertCandidate = useMemo(() => {
    // Once the user starts a simulation above 50 mm, always show
    // the ML assessment card. Only High/Critical will be forwarded
    // as an emergency alert to the Citizen side.
    if (
      simRainfall === null ||
      Number(simRainfall) < 0 ||
      !riskZones ||
      riskZones.length === 0
    ) {
      return null;
    }

    const candidates = riskZones
      .map((zone) => {
        const score = Number(
          zone?.ml_prediction?.ml_hazard_score ?? 0
        );

        if (!Number.isFinite(score)) return null;

        const rainfallMm = Number(simRainfall);

        const level =
          rainfallMm >= 140
            ? "Critical"
            : rainfallMm >= 80
              ? "High"
              : rainfallMm >= 50
                ? "Moderate"
                : "Advisory";

        return { zone, score, level };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const priority = {
          Critical: 4,
          High: 3,
          Moderate: 2,
          Advisory: 1,
        };

        if (priority[b.level] !== priority[a.level]) {
          return priority[b.level] - priority[a.level];
        }

        return b.score - a.score;
      })[0] || null;

    return candidates;
  }, [riskZones, simRainfall]);


  useEffect(() => {
    if (!automaticAlertCandidate) {
      setAutomaticAlert(null);
      lastAlertKeyRef.current = null;
      return;
    }

    const { zone, score, level } =
      automaticAlertCandidate;

    const simulationValue =
      simRainfall !== null
        ? Number(simRainfall)
        : null;

    const alertKey = [
      dataSource,
      simulationValue ?? "live",
      zone.id,
      level,
      Math.round(score * 1000),
    ].join(":");

    setAutomaticAlert({
      zone,
      score,
      level,
      simulationValue,
      message: getAlertMessage(level, isHindi),
      timestamp: new Date(),
    });

    if (
      lastAlertKeyRef.current !== alertKey
    ) {
      lastAlertKeyRef.current = alertKey;

      // Every simulation above 50 mm is sent to the Citizen
      // notification system. The ML score determines the level:
      // Advisory, Moderate, High, or Critical.
      // Citizen siren remains reserved for High/Critical.

      // Automatically notify the Citizen portal.
      try {
        const payload = {
          id: `AUTO-${Date.now()}`,
          source: "official-risk-map",
          event: "ML_RAINFALL_NOTIFICATION",
          severity: level,
          level,
          zone: zone.name,
          zoneId: zone.id,
          district: zone.district || "Wayanad",
          state: zone.state || "Kerala",
          riskScore: Number(zone.risk_score ?? 0),
          mlHazardScore: score,
          simulationRainfall: simulationValue,
          dataSource,
          message:
            getAlertMessage(level, false),
          timestamp: new Date().toISOString(),
        };

        window.localStorage.setItem(
          "sih_citizen_alert_event",
          JSON.stringify(payload)
        );

        window.dispatchEvent(
          new CustomEvent(
            "sih-citizen-alert",
            { detail: payload }
          )
        );
      } catch (error) {
        console.warn(
          "Citizen alert bridge unavailable:",
          error
        );
      }

    }
  }, [
    automaticAlertCandidate,
    simRainfall,
    dataSource,
    isHindi,
  ]);


  // ==========================================================
  // FORMAT REPLAY TIME
  // ==========================================================

  const formattedReplayTime =
    replayTimestamp
      ? new Date(
          replayTimestamp
        ).toLocaleString(
          "en-IN",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )
      : "Waiting for replay data";


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main
      className="official-page risk-map-page"
      id="main-content"
    >

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="page-hero">

        <div className="page-container">

          <div className="gov-badge">

            <ShieldAlert size={16} />

            {isHindi
              ? "भारत सरकार आपदा प्रबंधन पहल"
              : "Government of India Disaster Management Initiative"}

          </div>


          <h1>

            {isHindi
              ? "बाढ़ और भूस्खलन जोखिम मानचित्र"
              : "Flood & Landslide Risk Map"}

          </h1>


          <p>

            {isHindi
              ? "वायनाड के संवेदनशील क्षेत्रों में वर्षा, मिट्टी, भू-भाग और नदी निकटता के आधार पर जोखिम की निगरानी करें।"
              : "Monitor hazard risk across vulnerable Wayanad zones using rainfall, soil moisture, terrain and river proximity."}

          </p>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="risk-content">

        <div className="page-container">


          {/* =================================================
              LOCATION FILTER
          ================================================== */}

          <div className="risk-toolbar">

            <div>

              <div className="section-label">

                {isHindi
                  ? "जोखिम आकलन"
                  : "RISK ASSESSMENT"}

              </div>


              <h2>

                {isHindi
                  ? "स्थान के अनुसार जोखिम देखें"
                  : "Explore Risk by Location"}

              </h2>


              <p>

                {isHindi
                  ? "उपलब्ध नवीनतम जोखिम जानकारी देखने के लिए अपना स्थान चुनें।"
                  : "Select a monitored Wayanad location to view the latest risk information."}

              </p>

            </div>


            <div className="location-controls">


              {/* STATE */}

              <div className="control-group">

                <label>
                  {isHindi
                    ? "राज्य"
                    : "State"}
                </label>


                <select
                  value={state}
                  onChange={(e) =>
                    handleStateChange(
                      e.target.value
                    )
                  }
                >

                  {Object.keys(
                    locations
                  ).map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* DISTRICT */}

              <div className="control-group">

                <label>
                  {isHindi
                    ? "जिला"
                    : "District"}
                </label>


                <select
                  value={district}
                  onChange={(e) =>
                    handleDistrictChange(
                      e.target.value
                    )
                  }
                >

                  {districts.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* VILLAGE */}

              <div className="control-group">

                <label>
                  {isHindi
                    ? "गांव / वार्ड"
                    : "Village / Ward"}
                </label>


                <select
                  value={village}
                  onChange={(e) => {
                    const value = e.target.value;

                    setVillage(value);

                    const matchingZone = riskZones.find(
                      (zone) =>
                        String(zone.name).toLowerCase() ===
                        String(value).toLowerCase()
                    );

                    if (matchingZone) {
                      setSelectedZoneId(matchingZone.id);
                    }
                  }}
                >

                  {villages.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* LOCATE CURRENT AREA */}

              <button
                className="primary-btn"
                onClick={locateArea}
                disabled={locating}
                style={{
                  whiteSpace: "nowrap",
                  minWidth: "150px",
                  width: "150px",
                  height: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                title={
                  isHindi
                    ? "अपने वर्तमान स्थान का उपयोग करें"
                    : "Use your current location"
                }
              >
                <Navigation size={17} />

                {locating
                  ? isHindi
                    ? "लोकेशन..."
                    : "Locating..."
                  : isHindi
                    ? "वर्तमान स्थान"
                    : "Locate Area"}
              </button>

              {locationError && (
                <div
                  style={{
                    marginTop: "7px",
                    fontSize: "12px",
                    lineHeight: 1.35,
                    color: "#b42318",
                    maxWidth: "260px",
                  }}
                >
                  {locationError}
                </div>
              )}

            </div>

          </div>


          {/* =================================================
              DEMO / DATA CONTROLS
          ================================================== */}

          <div
            style={{
              padding:
                "18px 20px",
              margin:
                "0 0 20px 0",
              background:
                "#fff",
              border:
                "1px solid #e2e2e2",
              borderRadius:
                "10px",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >

            {/* =================================================
                TOP CONTROL ROW
            ================================================== */}

            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                alignItems:
                  "center",
                gap:
                  "10px",
              }}
            >


              {/* -------------------------------------------------
                  LIVE
              -------------------------------------------------- */}

              <button
                onClick={() => {

                  // Stop replay if necessary.
                  if (replayRunning) {
                    stopReplay();
                  }

                  setSimRainfall(null);
                  setReplayError(null);
                  setDataSource("live");
                  setSelectedZoneId(null);
                  setAutomaticAlert(null);
                  // Keep the five Wayanad markers visible while the live
                  // endpoint refreshes; the next response replaces these
                  // with the live risk values.
                  setRiskZones(fallbackZones);

                }}
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "7px",
                  padding:
                    "9px 15px",
                  borderRadius:
                    "7px",
                  border:
                    "1px solid #ccc",
                  background:
                    simRainfall === null &&
                    dataSource === "live"
                      ? "#1d4ed8"
                      : "#f5f5f5",
                  color:
                    simRainfall === null &&
                    dataSource === "live"
                      ? "#fff"
                      : "#333",
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                  fontSize:
                    "14px",
                }}
              >

                <Droplets size={16} />

                {isHindi
                  ? "लाइव डेटा"
                  : "Live Data"}

              </button>


              {/* -------------------------------------------------
                  START HISTORICAL REPLAY
              -------------------------------------------------- */}

              {!replayRunning && (

                <button
                  onClick={
                    startReplay
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    padding:
                      "9px 15px",
                    borderRadius:
                      "7px",
                    border:
                      "1px solid #ccc",
                    background:
                      dataSource ===
                      "replay"
                        ? "#c2410c"
                        : "#f97316",
                    color:
                      "#fff",
                    cursor:
                      "pointer",
                    fontWeight:
                      700,
                    fontSize:
                      "14px",
                  }}
                >

                  <Play size={16} />

                  {isHindi
                    ? "ऐतिहासिक रीप्ले शुरू करें"
                    : "Start Historical Replay"}

                </button>

              )}


              {/* -------------------------------------------------
                  STOP REPLAY
              -------------------------------------------------- */}

              {replayRunning && (

                <button
                  onClick={
                    stopReplay
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    padding:
                      "9px 15px",
                    borderRadius:
                      "7px",
                    border:
                      "1px solid #991b1b",
                    background:
                      "#b91c1c",
                    color:
                      "#fff",
                    cursor:
                      "pointer",
                    fontWeight:
                      700,
                    fontSize:
                      "14px",
                  }}
                >

                  <Square size={15} />

                  {isHindi
                    ? "रीप्ले रोकें"
                    : "Stop Replay"}

                </button>

              )}


              {/* -------------------------------------------------
                  RESET
              -------------------------------------------------- */}

              {dataSource ===
                "replay" && (

                <button
                  onClick={
                    resetReplay
                  }
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    padding:
                      "9px 14px",
                    borderRadius:
                      "7px",
                    border:
                      "1px solid #ccc",
                    background:
                      "#f5f5f5",
                    color:
                      "#333",
                    cursor:
                      "pointer",
                    fontWeight:
                      600,
                    fontSize:
                      "14px",
                  }}
                >

                  <RotateCcw
                    size={15}
                  />

                  {isHindi
                    ? "रीसेट"
                    : "Reset"}

                </button>

              )}


              {/* -------------------------------------------------
                  IMD VALIDATION
              -------------------------------------------------- */}

              <button
                onClick={() => {

                  if (replayRunning) {
                    stopReplay();
                  }

                  setSimRainfall(null);
                  setReplayError(null);
                  setDataSource("imd");

                }}
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "7px",
                  padding:
                    "9px 14px",
                  borderRadius:
                    "7px",
                  border:
                    "1px solid #ccc",
                  background:
                    simRainfall === null &&
                    dataSource === "imd"
                      ? "#b91c1c"
                      : "#f5f5f5",
                  color:
                    simRainfall === null &&
                    dataSource === "imd"
                      ? "#fff"
                      : "#333",
                  cursor:
                    "pointer",
                  fontWeight:
                    600,
                  fontSize:
                    "14px",
                }}
              >

                <ShieldAlert
                  size={15}
                />

                {isHindi
                  ? "30 जुलाई 2024 सत्यापन"
                  : "30 Jul 2024 Validation"}

              </button>

            </div>


            {/* =================================================
                REPLAY STATUS
            ================================================== */}

            {dataSource ===
              "replay" && (

              <div
                style={{
                  marginTop:
                    "14px",
                  padding:
                    "12px 14px",
                  borderRadius:
                    "8px",
                  background:
                    replayRunning
                      ? "#fff7ed"
                      : "#f8fafc",
                  border:
                    replayRunning
                      ? "1px solid #fed7aa"
                      : "1px solid #e2e8f0",
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  alignItems:
                    "center",
                  gap:
                    "14px",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "8px",
                    fontSize:
                      "13px",
                    fontWeight:
                      700,
                  }}
                >

                  <span
                    style={{
                      width:
                        "9px",
                      height:
                        "9px",
                      borderRadius:
                        "50%",
                      background:
                        replayRunning
                          ? "#f97316"
                          : "#64748b",
                      display:
                        "inline-block",
                    }}
                  />

                  {replayRunning
                    ? isHindi
                      ? "ऐतिहासिक रीप्ले चल रहा है"
                      : "HISTORICAL REPLAY RUNNING"
                    : isHindi
                    ? "रीप्ले पूर्ण"
                    : "REPLAY COMPLETE"}

                </div>


                <div
                  style={{
                    fontSize:
                      "13px",
                    color:
                      "#475569",
                  }}
                >

                  <strong>
                    {isHindi
                      ? "ऐतिहासिक समय:"
                      : "Historical Time:"}
                  {" "}

                  {formattedReplayTime}
                  </strong>

                </div>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================== */}

            {replayError && (

              <div
                style={{
                  marginTop:
                    "12px",
                  padding:
                    "10px 12px",
                  borderRadius:
                    "7px",
                  background:
                    "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  color:
                    "#991b1b",
                  fontSize:
                    "13px",
                }}
              >

                {replayError}

              </div>

            )}


            {/* =================================================
                RAINFALL SIMULATOR
            ================================================== */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px",
                marginTop:
                  "14px",
                paddingTop:
                  "14px",
                borderTop:
                  "1px solid #eee",
              }}
            >

              <label
                style={{
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                  whiteSpace:
                    "nowrap",
                }}
              >

                {isHindi
                  ? "वर्षा सिमुलेशन:"
                  : "Simulate rainfall:"}

              </label>


              <input
                type="range"
                min="0"
                max="250"
                value={
                  simRainfall ??
                  50
                }
                onChange={(e) => {

                  if (replayRunning) {
                    stopReplay();
                  }

                  setDataSource(
                    "live"
                  );

                  setSimRainfall(
                    Number(
                      e.target.value
                    )
                  );

                }}
                style={{
                  flex: 1,
                }}
              />


              <span
                style={{
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                  minWidth:
                    "60px",
                }}
              >

                {simRainfall !== null
                  ? `${simRainfall} mm`
                  : isHindi
                  ? "बंद"
                  : "off"}

              </span>

            </div>


            {/* =================================================
                STATUS
            ================================================== */}

            <div
              style={{
                marginTop:
                  "12px",
                fontSize:
                  "13px",
                color:
                  "#666",
              }}
            >

              {!backendOnline ? (

                <>

                  <span
                    style={{
                      color:
                        "#b91c1c",
                      fontWeight:
                        700,
                    }}
                  >
                    ●
                  </span>

                  {" "}

                  {isHindi
                    ? "बैकएंड कनेक्शन लंबित"
                    : "Backend connection pending"}

                </>

              ) : dataSource ===
                "replay" ? (

                <>

                  <span
                    style={{
                      color:
                        replayRunning
                          ? "#f97316"
                          : "#64748b",
                      fontWeight:
                        700,
                    }}
                  >
                    ●
                  </span>

                  {" "}

                  {replayRunning
                    ? isHindi
                      ? "ऐतिहासिक डेटा रीप्ले सक्रिय"
                      : "Historical replay active"
                    : isHindi
                    ? "ऐतिहासिक रीप्ले पूरा हुआ"
                    : "Historical replay completed"}

                </>

              ) : dataSource ===
                "live" &&
                simRainfall ===
                  null ? (

                dataTimestamp ? (

                  <>

                    <span
                      style={{
                        color:
                          "#16a34a",
                        fontWeight:
                          700,
                      }}
                    >
                      ●
                    </span>

                    {" "}

                    {isHindi
                      ? "लाइव डेटा समय:"
                      : "Live data as of:"}

                    {" "}

                    <strong>
                      {new Date(
                        dataTimestamp
                      ).toLocaleString()}
                    </strong>

                  </>

                ) : (

                  <>
                    {isHindi
                      ? "लाइव डेटा सक्रिय"
                      : "Live data active"}
                  </>

                )

              ) : dataSource ===
                "imd" ? (

                <>
                  {isHindi
                    ? "30 जुलाई 2024 घटना सत्यापन मोड"
                    : "30 Jul 2024 event validation mode"}
                </>

              ) : (

                <>
                  {isHindi
                    ? "सिमुलेटेड वर्षा परिदृश्य"
                    : "Simulated rainfall scenario"}
                </>

              )}

            </div>

          </div>


          {/* =================================================
              AUTOMATIC ALERT ENGINE
          ================================================== */}

          {automaticAlert && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                margin: "0 0 20px 0",
                padding: "16px 18px",
                borderRadius: "10px",
                border:
                  automaticAlert.level === "Critical"
                    ? "2px solid #991b1b"
                    : automaticAlert.level === "High"
                      ? "2px solid #dc2626"
                      : automaticAlert.level === "Moderate"
                        ? "2px solid #d97706"
                        : "2px solid #2563eb",
                background:
                  automaticAlert.level === "Critical"
                    ? "#fef2f2"
                    : automaticAlert.level === "High"
                      ? "#fff1f2"
                      : automaticAlert.level === "Moderate"
                        ? "#fff7ed"
                        : "#eff6ff",
                boxShadow:
                  automaticAlert.level === "Critical"
                    ? "0 4px 22px rgba(153,27,27,.20)"
                    : automaticAlert.level === "High"
                      ? "0 4px 18px rgba(185,28,28,.16)"
                      : "0 2px 10px rgba(0,0,0,.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background:
                        automaticAlert.level === "Critical"
                          ? "#991b1b"
                          : automaticAlert.level === "High"
                            ? "#b91c1c"
                            : automaticAlert.level === "Moderate"
                              ? "#c2410c"
                              : "#d97706",
                      color: "#fff",
                    }}
                  >
                    <ShieldAlert size={21} />
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "15px",
                          color: "#0f172a",
                        }}
                      >
                        {isHindi
                          ? automaticAlert.level === "Critical"
                            ? "अत्यंत उच्च खतरा सक्रिय"
                            : automaticAlert.level === "High"
                              ? "उच्च जोखिम चेतावनी"
                              : "स्वचालित ML आकलन"
                          : automaticAlert.level === "Critical"
                            ? "CRITICAL ALERT ACTIVE"
                            : automaticAlert.level === "High"
                              ? "HIGH RISK WARNING"
                              : "AUTOMATIC ML ASSESSMENT"}
                      </strong>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "4px 8px",
                          borderRadius: "999px",
                          background:
                            automaticAlert.level === "Critical"
                            ? "#991b1b"
                            : automaticAlert.level === "High"
                              ? "#b91c1c"
                              : automaticAlert.level === "Moderate"
                                ? "#c2410c"
                                : "#d97706",
                          color: "#fff",
                        }}
                      >
                        {automaticAlert.level}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "5px",
                      }}
                    >
                      {automaticAlert.zone.name}
                      {" • "}
                      {isHindi
                        ? "ML खतरा संकेत"
                        : "ML Hazard Signal"}{" "}
                      {Math.round(
                        automaticAlert.score * 100
                      )}/100
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "#475569",
                      }}
                    >
                      {automaticAlert.message}
                    </p>

                    {automaticAlert.simulationValue !== null && (
                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {isHindi
                          ? `सिमुलेशन: ${automaticAlert.simulationValue} mm वर्षा`
                          : `Simulation: ${automaticAlert.simulationValue} mm rainfall`}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setVillage(
                        automaticAlert.zone.name
                      );
                      setSelectedZoneId(
                        automaticAlert.zone.id
                      );
                    }}
                    style={{
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      color: "#1d4ed8",
                      borderRadius: "7px",
                      padding: "6px 9px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {isHindi
                      ? "क्षेत्र देखें"
                      : "View Area"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "12px",
                  paddingTop: "11px",
                  borderTop: "1px solid rgba(148,163,184,.28)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/shelters";
                  }}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#334155",
                    borderRadius: "7px",
                    padding: "7px 10px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {isHindi
                    ? "निकटतम सुरक्षित आश्रय देखें"
                    : "View Nearest Safe Shelters"}
                </button>

                <span
                  style={{
                    alignSelf: "center",
                    fontSize: "10px",
                    color: "#64748b",
                  }}
                >
                  {isHindi
                    ? "यह चेतावनी ML संकेत के आधार पर स्वतः उत्पन्न हुई है।"
                    : "This warning was generated automatically from the ML hazard signal."}
                </span>
              </div>
            </div>
          )}


          {/* =================================================
              MAP SECTION
          ================================================== */}

          <div className="map-layout">


            {/* =================================================
                MAP
            ================================================== */}

            <div className="map-card">

              <div className="map-header">

                <div>

                  <h2>
                    {isHindi
                      ? "वायनाड क्षेत्रीय जोखिम मानचित्र"
                      : "Wayanad Regional Risk Map"}
                  </h2>

                  <span>

                    {dataSource ===
                      "replay"

                      ? isHindi
                        ? "30 जुलाई 2024 ऐतिहासिक घटना का डेटा रीप्ले"
                        : "Historical replay of the 30 Jul 2024 event"

                      : isHindi
                      ? "निगरानी किए गए पांच संवेदनशील क्षेत्रों का वर्तमान जोखिम"
                      : "Current risk across five monitored Wayanad zones"}

                  </span>

                </div>


                {/* LAYER SELECT */}

                <label
                  className="layer-btn"
                  htmlFor="map-layer-select"
                >

                  <Layers size={17} />


                  <select
                    id="map-layer-select"
                    className="layer-select"
                    value={layer}
                    onChange={(e) =>
                      setLayer(
                        e.target.value
                      )
                    }
                    aria-label={
                      isHindi
                        ? "मानचित्र क्षेत्र चुनें"
                        : "Select map zone"
                    }
                  >

                    <option value="All">
                      {isHindi
                        ? "सभी क्षेत्र"
                        : "All Zones"}
                    </option>


                    <option value="Flood">
                      {isHindi
                        ? "बाढ़"
                        : "Flood"}
                    </option>


                    <option value="Landslide">
                      {isHindi
                        ? "भूस्खलन"
                        : "Landslide"}
                    </option>


                    <option value="Weather">
                      {isHindi
                        ? "मौसम"
                        : "Weather"}
                    </option>

                  </select>

                </label>

              </div>


              {/* MAP */}

              <div className="demo-map">

                <MapContainer
                  center={[
                    11.62,
                    76.11,
                  ]}
                  zoom={11}
                  scrollWheelZoom={
                    true
                  }
                  style={{
                    height:
                      "100%",
                    width:
                      "100%",
                  }}
                >

                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />


                  <MapAutoFit
                    zones={
                      filteredZones
                    }
                  />

                  {currentLocation && (
                    <UserLocationMarker
                      position={currentLocation}
                    />
                  )}


                  {filteredZones.map(
                    (zone) => (

                      <Marker
                        key={
                          zone.id
                        }
                        position={[
                          Number(
                            zone.lat
                          ),
                          Number(
                            zone.lng
                          ),
                        ]}
                        icon={getRiskIcon(
                          zone.risk ||
                            "Advisory"
                        )}
                        eventHandlers={{
                          click:
                            () =>
                              setSelectedZoneId(
                                zone.id
                              ),
                        }}
                      >

                        <Popup>

                          <strong>
                            {zone.name}
                          </strong>

                          <br />

                          Wayanad,
                          Kerala

                          <br />

                          {isHindi
                            ? "जोखिम"
                            : "Risk"}
                          :{" "}
                          {zone.risk ||
                            "Advisory"}

                          <br />

                          {isHindi
                            ? "स्कोर"
                            : "Score"}
                          :{" "}
                          {Number(
                            zone.risk_score ??
                              0
                          ).toFixed(
                            3
                          )}

                          <br />

                          {isHindi
                            ? "वर्षा"
                            : "Rainfall"}
                          :{" "}

                          {Number(
                            zone.rainfall_mm ??
                              0
                          ).toFixed(
                            1
                          )}

                          {" "}mm

                        </Popup>

                      </Marker>

                    )
                  )}

                </MapContainer>

              </div>


              {/* MAP LEGEND */}

              <div className="map-legend">

                <strong>

                  {isHindi
                    ? "जोखिम स्तर"
                    : "Risk Level"}

                </strong>


                <span>

                  <i className="legend-dot critical"></i>

                  {isHindi
                    ? "गंभीर"
                    : "Critical"}

                </span>


                <span>

                  <i className="legend-dot high"></i>

                  {isHindi
                    ? "उच्च"
                    : "High"}

                </span>


                <span>

                  <i className="legend-dot moderate"></i>

                  {isHindi
                    ? "मध्यम"
                    : "Moderate"}

                </span>


                <span>

                  <i className="legend-dot advisory"></i>

                  {isHindi
                    ? "सलाह"
                    : "Advisory"}

                </span>

              </div>

            </div>


            {/* =================================================
                RIGHT SIDE PANEL
            ================================================== */}

            <aside className="risk-side-panel">


              <div className="panel-heading">

                <div className="panel-icon">

                  <MapPin size={20} />

                </div>


                <div>

                  <div className="section-label">

                    {isHindi
                      ? "चयनित क्षेत्र"
                      : "SELECTED AREA"}

                  </div>


                  <h2>

                    {selectedZone
                      ? selectedZone.name
                      : village}

                  </h2>

                </div>

              </div>


              {selectedZone ? (

                <>


                  {/* =================================================
                      RISK STATUS
                  ================================================== */}

                  <div
                    className={`risk-status status-${String(
                      selectedZone.risk ||
                        "Advisory"
                    ).toLowerCase()}`}
                  >

                    <AlertTriangle
                      size={20}
                    />


                    <div>

                      <small>

                        {isHindi
                          ? "वर्तमान जोखिम स्तर"
                          : "Current Risk Level"}

                      </small>


                      <strong>

                        {isHindi
                          ? selectedZone.risk ===
                            "Critical"
                            ? "गंभीर"
                            : selectedZone.risk ===
                              "High"
                            ? "उच्च"
                            : selectedZone.risk ===
                              "Moderate"
                            ? "मध्यम"
                            : "सलाह"

                          : String(
                              selectedZone.risk ||
                                "Advisory"
                            ).toUpperCase()}

                      </strong>

                    </div>

                  </div>


                  {/* AREA LOCATION */}

                  <div className="area-location">

                    {selectedZone.name},
                    Wayanad,
                    Kerala

                  </div>


                  {/* DESCRIPTION */}

                  <div className="risk-description">

                    <Info size={17} />

                    <p>

                      {getRiskDescription(
                        selectedZone,
                        isHindi
                      )}

                    </p>

                  </div>


                  {/* MAIN METRICS */}

                  <div className="risk-metrics">

                    <div>

                      <Droplets
                        size={18}
                      />

                      <span>

                        {isHindi
                          ? "वर्षा"
                          : "Rainfall"}

                      </span>


                      <strong>

                        {Number(
                          selectedZone.rainfall_mm ??
                            0
                        ).toFixed(
                          1
                        )}

                        {" "}mm

                      </strong>

                    </div>


                    <div>

                      <Mountain
                        size={18}
                      />

                      <span>

                        {isHindi
                          ? "जोखिम स्कोर"
                          : "Risk Score"}

                      </span>


                      <strong>

                        {Number(
                          selectedZone.risk_score ??
                            0
                        ).toFixed(
                          3
                        )}

                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      FUTURE RISK FORECAST
                  ================================================== */}

                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px",
                      border: "1px solid #dbeafe",
                      borderRadius: "10px",
                      background: "#f8fbff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "13px",
                          color: "#0f172a",
                        }}
                      >
                        {isHindi
                          ? "भविष्य जोखिम पूर्वानुमान"
                          : "Future Risk Forecast"}
                      </strong>

                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "4px 7px",
                          borderRadius: "999px",
                          background: "#e0f2fe",
                          color: "#0369a1",
                        }}
                      >
                        {isHindi ? "6/12/24 घंटे" : "6 / 12 / 24 H"}
                      </span>
                    </div>

                    {dataSource === "live" && simRainfall === null ? (
                      forecastLoading && !selectedForecast ? (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            padding: "8px 0",
                          }}
                        >
                          {isHindi
                            ? "पूर्वानुमान लोड हो रहा है..."
                            : "Loading future risk forecast..."}
                        </div>
                      ) : selectedForecast?.forecast ? (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                              gap: "8px",
                            }}
                          >
                            {[6, 12, 24].map((hours) => {
                              const item =
                                selectedForecast.forecast?.[`${hours}h`];
                              const risk =
                                item?.risk || "Advisory";
                              const score = Number(
                                item?.risk_score ?? 0
                              );

                              
                              const mlHazardScore = Number(
                                item?.ml_prediction?.ml_hazard_score ?? 0
                              );

                              const mlAvailable =
                                item?.ml_prediction?.available === true;

                              const riskClass = String(
                                risk
                              ).toLowerCase();

                              return (
                                <div
                                  key={hours}
                                  style={{
                                    padding: "9px 7px",
                                    borderRadius: "8px",
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    textAlign: "center",
                                  }}
                                >
                                  <small
                                    style={{
                                      display: "block",
                                      color: "#64748b",
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      marginBottom: "5px",
                                    }}
                                  >
                                    {hours}h
                                  </small>

                                  <strong
                                    className={`status-${riskClass}`}
                                    style={{
                                      display: "block",
                                      fontSize: "11px",
                                      fontWeight: 800,
                                    }}
                                  >
                                    {isHindi
                                      ? risk === "Critical"
                                        ? "गंभीर"
                                        : risk === "High"
                                          ? "उच्च"
                                          : risk === "Moderate"
                                            ? "मध्यम"
                                            : "सलाह"
                                      : risk}
                                  </strong>

                                  <span
                                    style={{
                                      display: "block",
                                      marginTop: "5px",
                                      fontSize: "11px",
                                      color: "#334155",
                                      fontWeight: 800,
                                    }}
                                  >
                                    {`Risk Index: ${Math.round(
                                      Math.max(0, Math.min(1, score)) * 100
                                    )}/100`}
                                  </span>

                                  <span
                                    style={{
                                      display: "block",
                                      marginTop: "4px",
                                      fontSize: "10px",
                                      color: mlAvailable
                                        ? "#475569"
                                        : "#94a3b8",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {`ML Hazard Signal: ${
                                      !mlAvailable
                                        ? "Unavailable"
                                        : mlHazardScore >= 0.70
                                          ? "High"
                                          : mlHazardScore >= 0.40
                                            ? "Moderate"
                                            : mlHazardScore >= 0.15
                                              ? "Elevated"
                                              : "Low"
                                    }`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "10px",
                              color: "#64748b",
                              textAlign: "center",
                            }}
                          >
                            {isHindi
                              ? "जोखिम सूचकांक: 0 = कम जोखिम, 100 = अधिकतम जोखिम"
                              : "Risk Index: 0 = lowest risk, 100 = highest risk"}
                          </div>

                          {(() => {
                            const currentScore = Number(
                              selectedForecast?.current?.risk_score ??
                                selectedZone.risk_score ??
                                0
                            );

                            const futureItems = [6, 12, 24]
                              .map((hours) => ({
                                hours,
                                item:
                                  selectedForecast.forecast?.[
                                    `${hours}h`
                                  ],
                              }))
                              .filter(
                                ({ item }) => item
                              );

                            const escalation = futureItems.find(
                              ({ item }) =>
                                Number(item?.risk_score ?? 0) >
                                currentScore + 0.05
                            );

                            const highest = futureItems.reduce(
                              (best, current) =>
                                Number(
                                  current.item?.risk_score ?? 0
                                ) >
                                Number(
                                  best?.item?.risk_score ?? 0
                                )
                                  ? current
                                  : best,
                              null
                            );

                            return (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "9px 10px",
                                  borderRadius: "7px",
                                  background: escalation
                                    ? "#fff7ed"
                                    : "#f0fdf4",
                                  border: escalation
                                    ? "1px solid #fed7aa"
                                    : "1px solid #bbf7d0",
                                  fontSize: "11px",
                                  color: "#475569",
                                }}
                              >
                                <strong
                                  style={{
                                    color: escalation
                                      ? "#c2410c"
                                      : "#166534",
                                  }}
                                >
                                  {escalation
                                    ? isHindi
                                      ? `⚠ जोखिम ${escalation.hours} घंटे में बढ़ने की संभावना`
                                      : `⚠ Risk escalation expected within ${escalation.hours} hours`
                                    : isHindi
                                      ? `पूर्वानुमान स्थिर है${highest ? ` • अधिकतम: ${highest.item.risk}` : ""}`
                                      : `Forecast is currently stable${highest ? ` • Highest forecast: ${highest.item.risk}` : ""}`}
                                </strong>
                              </div>
                            );
                          })()}

                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "10px",
                              color: "#64748b",
                            }}
                          >
                            {isHindi
                              ? "पूर्वानुमानित वर्षा और वर्तमान स्थितियों के आधार पर"
                              : "Based on forecast rainfall and current conditions"}
                          </div>

                          <div
                            style={{
                              marginTop: "6px",
                              fontSize: "10px",
                              lineHeight: 1.45,
                              color: "#64748b",
                            }}
                          >
                            {isHindi
                              ? "ML संकेत वर्तमान वर्षा, मिट्टी की नमी और भू-भाग से बनता है। भविष्य का जोखिम पूर्वानुमानित वर्षा से अलग गणना किया जाता है।"
                              : "ML signal uses current observed rainfall, soil moisture and terrain. Future forecast risk is calculated separately from forecast rainfall."}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontSize: "12px",
                            color: forecastError
                              ? "#b91c1c"
                              : "#64748b",
                            padding: "8px 0",
                          }}
                        >
                          {forecastError
                            ? isHindi
                              ? "पूर्वानुमान उपलब्ध नहीं है।"
                              : "Future forecast is temporarily unavailable."
                            : isHindi
                              ? "इस क्षेत्र के लिए पूर्वानुमान उपलब्ध नहीं है।"
                              : "No future forecast available for this zone."}
                        </div>
                      )
                    ) : (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          lineHeight: 1.5,
                        }}
                      >
                        {isHindi
                          ? "भविष्य का पूर्वानुमान लाइव डेटा मोड में उपलब्ध है। ऐतिहासिक रीप्ले में वर्तमान जोखिम विकास दिखाया जाता है।"
                          : "Future forecast is shown in Live Data mode. Historical Replay displays the evolving risk around the 30 Jul 2024 event."}
                      </div>
                    )}
                  </div>


                  {/* =================================================
                      RAINFALL WINDOWS
                  ================================================== */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap:
                        "10px",
                      marginTop:
                        "14px",
                    }}
                  >

                    {/* 1H */}

                    <div
                      style={{
                        padding:
                          "12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        background:
                          "#f8fafc",
                      }}
                    >

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#64748b",
                          marginBottom:
                            "5px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                        }}
                      >

                        {isHindi
                          ? "1 घंटे की वर्षा"
                          : "1h Rainfall"}

                      </small>


                      <strong>

                        {Number(
                          selectedZone
                            .rainfall_windows
                            ?.rain_1h ??
                            0
                        ).toFixed(
                          1
                        )}

                        {" "}mm

                      </strong>

                    </div>


                    {/* 3H */}

                    <div
                      style={{
                        padding:
                          "12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        background:
                          "#f8fafc",
                      }}
                    >

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#64748b",
                          marginBottom:
                            "5px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                        }}
                      >

                        {isHindi
                          ? "3 घंटे की वर्षा"
                          : "3h Rainfall"}

                      </small>


                      <strong>

                        {Number(
                          selectedZone
                            .rainfall_windows
                            ?.rain_3h ??
                            0
                        ).toFixed(
                          1
                        )}

                        {" "}mm

                      </strong>

                    </div>


                    {/* 6H */}

                    <div
                      style={{
                        padding:
                          "12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        background:
                          "#f8fafc",
                      }}
                    >

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#64748b",
                          marginBottom:
                            "5px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                        }}
                      >

                        {isHindi
                          ? "6 घंटे की वर्षा"
                          : "6h Rainfall"}

                      </small>


                      <strong>

                        {Number(
                          selectedZone
                            .rainfall_windows
                            ?.rain_6h ??
                            0
                        ).toFixed(
                          1
                        )}

                        {" "}mm

                      </strong>

                    </div>


                    {/* 24H */}

                    <div
                      style={{
                        padding:
                          "12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        background:
                          "#f8fafc",
                      }}
                    >

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#64748b",
                          marginBottom:
                            "5px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                        }}
                      >

                        {isHindi
                          ? "24 घंटे की वर्षा"
                          : "24h Rainfall"}

                      </small>


                      <strong>

                        {Number(
                          selectedZone
                            .rainfall_windows
                            ?.rain_24h ??
                            0
                        ).toFixed(
                          1
                        )}

                        {" "}mm

                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      TERRAIN / HYDROLOGY
                  ================================================== */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap:
                        "10px",
                      marginTop:
                        "10px",
                    }}
                  >

                    {/* SLOPE */}

                    <div
                      style={{
                        padding:
                          "12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        background:
                          "#f8fafc",
                      }}
                    >

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#64748b",
                          marginBottom:
                            "5px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                        }}
                      >

                        {isHindi
                          ? "ढलान"
                          : "Slope"}

                      </small>


                      <strong>

                        {Number(
                          selectedZone.slope_deg ??
                            0
                        ).toFixed(
                          2
                        )}

                        °

                      </strong>

                    </div>


                    {/* RIVER */}

                    <div
                      style={{
                        padding:
                          "12px",
                        border:
                          "1px solid #e2e8f0",
                        borderRadius:
                          "8px",
                        background:
                          "#f8fafc",
                      }}
                    >

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#64748b",
                          marginBottom:
                            "5px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                        }}
                      >

                        {isHindi
                          ? "नदी से दूरी"
                          : "River Distance"}

                      </small>


                      <strong>

                        {Number(
                          selectedZone.distance_to_river_m ??
                            0
                        ).toFixed(
                          1
                        )}

                        {" "}m

                      </strong>

                    </div>

                  </div>


                  {/* =================================================
                      MODEL COMPONENTS
                  ================================================== */}

                  <div
                    style={{
                      marginTop:
                        "14px",
                      paddingTop:
                        "14px",
                      borderTop:
                        "1px solid #e2e8f0",
                    }}
                  >

                    <strong
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "10px",
                        fontSize:
                          "13px",
                        color:
                          "#0f172a",
                      }}
                    >

                      {isHindi
                        ? "मॉडल घटक"
                        : "Model Components"}

                    </strong>


                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(0, 1fr))",
                        gap:
                          "8px",
                      }}
                    >

                      {/* SHORT TERM */}

                      <div
                        style={{
                          padding:
                            "9px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "7px",
                        }}
                      >

                        <small>

                          {isHindi
                            ? "अल्पकालिक वर्षा"
                            : "Short-term Rain"}

                        </small>


                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "3px",
                          }}
                        >

                          {Number(
                            selectedZone
                              .short_term_rainfall_component ??
                              0
                          ).toFixed(
                            3
                          )}

                        </strong>

                      </div>


                      {/* ANTECEDENT */}

                      <div
                        style={{
                          padding:
                            "9px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "7px",
                        }}
                      >

                        <small>

                          {isHindi
                            ? "पिछली वर्षा"
                            : "Antecedent Rain"}

                        </small>


                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "3px",
                          }}
                        >

                          {Number(
                            selectedZone
                              .antecedent_rainfall_component ??
                              0
                          ).toFixed(
                            3
                          )}

                        </strong>

                      </div>


                      {/* SOIL */}

                      <div
                        style={{
                          padding:
                            "9px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "7px",
                        }}
                      >

                        <small>

                          {isHindi
                            ? "मिट्टी"
                            : "Soil"}

                        </small>


                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "3px",
                          }}
                        >

                          {Number(
                            selectedZone
                              .soil_component ??
                              0
                          ).toFixed(
                            3
                          )}

                        </strong>

                      </div>


                      {/* TERRAIN */}

                      <div
                        style={{
                          padding:
                            "9px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "7px",
                        }}
                      >

                        <small>

                          {isHindi
                            ? "भू-भाग"
                            : "Terrain"}

                        </small>


                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "3px",
                          }}
                        >

                          {Number(
                            selectedZone
                              .terrain_component ??
                              0
                          ).toFixed(
                            3
                          )}

                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      RECOMMENDED ACTION
                  ================================================== */}

                  <div className="recommended-action">

                    <strong>

                      {isHindi
                        ? "अनुशंसित कार्रवाई"
                        : "Recommended Action"}

                    </strong>


                    <p>

                      {isHindi

                        ? selectedZone.risk ===
                          "Critical"

                          ? "तत्काल सतर्कता बढ़ाएं और स्थानीय अधिकारियों के निर्देशों का पालन करें।"

                          : selectedZone.risk ===
                            "High"

                          ? "उच्च निगरानी बनाए रखें और संवेदनशील क्षेत्रों की स्थिति पर नजर रखें।"

                          : selectedZone.risk ===
                            "Moderate"

                          ? "सावधानी बनाए रखें और वर्षा तथा मिट्टी की स्थिति की निगरानी करें।"

                          : "सामान्य निगरानी जारी रखें और आधिकारिक चेतावनियों पर ध्यान दें।"


                        : selectedZone.risk ===
                          "Critical"

                        ? "Increase preparedness immediately and follow local authority instructions."

                        : selectedZone.risk ===
                          "High"

                        ? "Maintain close monitoring and watch vulnerable areas."

                        : selectedZone.risk ===
                          "Moderate"

                        ? "Remain cautious and monitor rainfall and soil conditions."

                        : "Continue routine monitoring and follow official warnings."

                      }

                    </p>

                  </div>

                </>

              ) : (

                <div className="empty-selection">

                  <Map size={32} />


                  <strong>

                    {isHindi
                      ? "स्थान चुनें"
                      : "Select a location"}

                  </strong>


                  <p>

                    {isHindi
                      ? "मानचित्र से कोई क्षेत्र चुनें या स्थान चयनकर्ता का उपयोग करके वर्तमान जोखिम जानकारी देखें।"
                      : "Choose an area from the map or use the location selector to view its current risk information."}

                  </p>

                </div>

              )}

            </aside>

          </div>


          {/* =================================================
              RISK SUMMARY
          ================================================== */}

          <div className="risk-summary">

            <div>

              <span className="summary-number">

                {riskSummary.total}

              </span>


              <span>

                {isHindi
                  ? "निगरानी क्षेत्र"
                  : "Monitored Areas"}

              </span>

            </div>


            <div>

              <span className="summary-number">

                {riskSummary.critical}

              </span>


              <span>

                {isHindi
                  ? "गंभीर जोखिम"
                  : "Critical Risk"}

              </span>

            </div>


            <div>

              <span className="summary-number">

                {riskSummary.high}

              </span>


              <span>

                {isHindi
                  ? "उच्च जोखिम"
                  : "High Risk"}

              </span>

            </div>


            <div>

              <span className="summary-number">

                {riskSummary.moderate}

              </span>


              <span>

                {isHindi
                  ? "मध्यम जोखिम"
                  : "Moderate Risk"}

              </span>

            </div>


            <div>

              <span className="summary-number">

                {riskSummary.advisory}

              </span>


              <span>

                {isHindi
                  ? "सलाह"
                  : "Advisory"}

              </span>

            </div>

          </div>


          {/* =================================================
              INFORMATION
          ================================================== */}

          <div className="map-info">

            <Info size={20} />


            <div>

              <strong>

                {isHindi
                  ? "जोखिम मानचित्र के बारे में"
                  : "About the Risk Map"}

              </strong>


              <p>

                {isHindi
                  ? "यह जोखिम मानचित्र वायनाड के चयनित क्षेत्रों के लिए वर्षा, मिट्टी की नमी, भू-भाग और नदी निकटता जैसे संकेतकों का उपयोग करता है। ऐतिहासिक रीप्ले सुविधा 30 जुलाई 2024 की घटना से पहले की परिस्थितियों को प्रदर्शित करती है। स्वचालित चेतावनी इंजन ML खतरा संकेत Elevated, Moderate या High होने पर स्क्रीन पर चेतावनी दिखाता है। यह SIH परियोजना प्रदर्शन के लिए बनाया गया प्रोटोटाइप है। आपातकाल के दौरान हमेशा आधिकारिक सरकारी चेतावनियों और निर्देशों का पालन करें।"

                  : "This prototype risk map uses rainfall, soil moisture, terrain and river proximity indicators for selected Wayanad zones. The historical replay demonstrates how the risk conditions evolved around the 30 Jul 2024 event. The automatic alert engine raises an on-screen warning when the ML hazard signal reaches Elevated, Moderate or High. It is intended for SIH project demonstration and decision-support prototyping. Always follow official government warnings and instructions during an emergency."}

              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


export default RiskMap;