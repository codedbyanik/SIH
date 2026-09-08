import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

import { useLanguage } from "../../LanguageContext.jsx";
import { useActiveLocation } from "../../LocationContext.jsx";
import { locationHierarchy } from "../../data/locationData.js";

function LocationGate() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const navigate = useNavigate();

  const {
    activeLocation,
    selectLocation,
    selectLocationByCoords,
    cancelChangeLocation,
  } = useActiveLocation();

  const [state, setState] = useState(activeLocation?.entered?.state || "");
  const [district, setDistrict] = useState(activeLocation?.entered?.district || "");
  const [village, setVillage] = useState(activeLocation?.entered?.village || "");

  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [locating, setLocating] = useState(false);

  const districts = useMemo(() => {
    return Object.keys(locationHierarchy[state] || {});
  }, [state]);

  const villages = useMemo(() => {
    return locationHierarchy[state]?.[district] || [];
  }, [state, district]);

  const t = {
    heading: isHindi ? "अपना स्थान चुनें" : "Select Your Location",
    subheading: isHindi
      ? "जोखिम, अलर्ट और आश्रय जानकारी देखने के लिए अपना स्थान चुनें।"
      : "Choose your location to view risk, alert and shelter information for your area.",
    state: isHindi ? "राज्य" : "State",
    selectState: isHindi ? "राज्य चुनें" : "Select State",
    district: isHindi ? "जिला" : "District",
    selectDistrict: isHindi ? "जिला चुनें" : "Select District",
    village: isHindi ? "गांव / वार्ड" : "Village / Ward",
    selectVillage: isHindi ? "गांव / वार्ड चुनें" : "Select Village / Ward",
    confirm: isHindi ? "स्थान की पुष्टि करें" : "Confirm Location",
    useMyLocation: isHindi ? "मेरी लोकेशन का उपयोग करें" : "Use My Location",
    locating: isHindi ? "लोकेशन खोजी जा रही है..." : "Locating...",
    invalid: isHindi
      ? "कृपया एक मान्य राज्य, जिला और गांव / वार्ड चुनें।"
      : "Please select a valid State, District and Village / Ward.",
    noData: isHindi
      ? "इस स्थान के लिए वर्तमान में कोई डेटा उपलब्ध नहीं है।"
      : "No data is currently available for this location.",
    yourLocation: isHindi ? "आपका स्थान" : "Your Location",
    dataNearby: isHindi ? "पास उपलब्ध डेटा" : "Data available nearby",
    usingExact: isHindi
      ? "इस स्थान का सटीक डेटा उपलब्ध है।"
      : "Exact data is available for this location.",
    sameDistrict: isHindi
      ? "आपके जिले में निकटतम उपलब्ध डेटा दिखाया जा रहा है।"
      : "Showing the nearest available data within your district.",
    sameState: isHindi
      ? "आपके राज्य में निकटतम उपलब्ध डेटा दिखाया जा रहा है।"
      : "Showing the nearest available data within your state.",
    awayGps: isHindi ? "किमी दूर (आपकी वर्तमान लोकेशन से)" : "km away (from your current location)",
    continue: isHindi ? "जारी रखें" : "Continue",
    geoUnsupported: isHindi
      ? "आपका ब्राउज़र लोकेशन सुविधा का समर्थन नहीं करता।"
      : "Geolocation is not supported by your browser.",
    geoDenied: isHindi
      ? "लोकेशन एक्सेस अस्वीकृत कर दिया गया। कृपया अनुमति दें।"
      : "Location permission was denied. Please allow location access.",
    geoFailed: isHindi
      ? "आपकी लोकेशन प्राप्त नहीं की जा सकी।"
      : "We couldn't determine your location.",
  };

  const handleStateChange = (value) => {
    setState(value);
    setDistrict("");
    setVillage("");
    setError(null);
    setResult(null);
  };

  const handleDistrictChange = (value) => {
    setDistrict(value);
    setVillage("");
    setError(null);
    setResult(null);
  };

  const handleVillageChange = (value) => {
    setVillage(value);
    setError(null);
    setResult(null);
  };

  const handleConfirm = () => {
    if (!state || !district || !village) {
      setError(t.invalid);
      setResult(null);
      return;
    }

    const outcome = selectLocation({ state, district, village });

    if (outcome.status === "invalid") {
      setError(t.invalid);
      setResult(null);
      return;
    }

    if (outcome.status === "no-data") {
      setError(t.noData);
      setResult(null);
      return;
    }

    setError(null);
    setResult(outcome);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError(t.geoUnsupported);
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const outcome = selectLocationByCoords(
          position.coords.latitude,
          position.coords.longitude
        );

        setLocating(false);

        if (outcome.status === "no-data") {
          setError(t.noData);
          return;
        }

        setState(outcome.resolved.state);
        setDistrict(outcome.resolved.district);
        setVillage(outcome.resolved.village);
        setResult(outcome);
      },
      (geoError) => {
        setLocating(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(t.geoDenied);
        } else {
          setError(t.geoFailed);
        }
      }
    );
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="location-gate-overlay">
      <div className="location-card location-gate-card">
        {activeLocation && (
          <button
            type="button"
            className="location-gate-close"
            onClick={cancelChangeLocation}
            aria-label={isHindi ? "बंद करें" : "Close"}
          >
            <X size={18} />
          </button>
        )}

        <div className="card-heading">
          <div className="card-icon">
            <MapPin size={24} />
          </div>

          <div>
            <h2>{t.heading}</h2>
            <p>{t.subheading}</p>
          </div>
        </div>

        {!result ? (
          <div className="location-form">
            <div className="form-group">
              <label>{t.state}</label>
              <select value={state} onChange={(e) => handleStateChange(e.target.value)}>
                <option value="">{t.selectState}</option>
                {Object.keys(locationHierarchy).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t.district}</label>
              <select
                value={district}
                disabled={!state}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                <option value="">{t.selectDistrict}</option>
                {districts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t.village}</label>
              <select
                value={village}
                disabled={!district}
                onChange={(e) => handleVillageChange(e.target.value)}
              >
                <option value="">{t.selectVillage}</option>
                {villages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="location-gate-error">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="button" className="check-risk-button" onClick={handleConfirm}>
              <span>{t.confirm}</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="location-gate-secondary-button"
              onClick={handleUseMyLocation}
              disabled={locating}
            >
              {locating ? <Loader2 size={17} className="location-gate-spin" /> : <Navigation size={17} />}
              <span>{locating ? t.locating : t.useMyLocation}</span>
            </button>
          </div>
        ) : (
          <div className="location-form">
            <div className="location-gate-result">
              <div className="location-gate-result-row">
                <MapPin size={16} />
                <div>
                  <small>{t.yourLocation}</small>
                  <strong>
                    {result.status === "exact" && result.scope !== "gps"
                      ? `${village}, ${district}, ${state}`
                      : `${village || ""}${village ? ", " : ""}${district}, ${state}`}
                  </strong>
                </div>
              </div>

              {result.status === "exact" && result.scope !== "gps" && (
                <div className="location-gate-note location-gate-note-success">
                  <CheckCircle2 size={16} />
                  <span>{t.usingExact}</span>
                </div>
              )}

              {result.status === "nearest" && (
                <div className="location-gate-result-row">
                  <Navigation size={16} />
                  <div>
                    <small>{t.dataNearby}</small>
                    <strong>
                      {result.resolved.village}, {result.resolved.district}, {result.resolved.state}
                    </strong>
                    <p className="location-gate-note">
                      {result.scope === "state" ? t.sameState : t.sameDistrict}
                    </p>
                  </div>
                </div>
              )}

              {result.scope === "gps" && (
                <div className="location-gate-result-row">
                  <Navigation size={16} />
                  <div>
                    <small>{t.dataNearby}</small>
                    <strong>
                      {result.resolved.village}, {result.resolved.district}, {result.resolved.state}
                    </strong>
                    <p className="location-gate-note">
                      {result.distanceKm} {t.awayGps}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button type="button" className="check-risk-button" onClick={handleContinue}>
              <span>{t.continue}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationGate;
