import { useMemo, useState } from "react";
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
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useLanguage } from "../LanguageContext.jsx";

const locations = {
  "West Bengal": {
    Darjeeling: ["Darjeeling Town", "Kurseong", "Mirik"],
    Kalimpong: ["Kalimpong Town", "Pedong"],
  },
  Sikkim: {
    Gangtok: ["Gangtok", "Rumtek"],
    Mangan: ["Mangan", "Chungthang"],
  },
  Uttarakhand: {
    Dehradun: ["Dehradun", "Mussoorie"],
    Nainital: ["Nainital", "Bhimtal"],
  },
  Himachal: {
    Shimla: ["Shimla", "Mashobra"],
    Kullu: ["Kullu", "Manali"],
  },
};

const riskZones = [
  {
    id: 1,
    name: "Darjeeling Town",
    district: "Darjeeling",
    state: "West Bengal",
    risk: "High",
    type: "Flood",
    rainfall: "86 mm",
    description: "Heavy rainfall and rising water levels detected.",
    lat: 27.041,
    lng: 88.2663,
  },
  {
    id: 2,
    name: "Kurseong",
    district: "Darjeeling",
    state: "West Bengal",
    risk: "High",
    type: "Landslide",
    rainfall: "72 mm",
    description: "Unstable slopes with high soil moisture.",
    lat: 26.8817,
    lng: 88.2822,
  },
  {
    id: 3,
    name: "Kalimpong",
    district: "Kalimpong",
    state: "West Bengal",
    risk: "Moderate",
    type: "Flood",
    rainfall: "61 mm",
    description: "Moderate rainfall with increasing water levels.",
    lat: 27.0669,
    lng: 88.4726,
  },
  {
    id: 4,
    name: "Gangtok",
    district: "Gangtok",
    state: "Sikkim",
    risk: "Advisory",
    type: "Weather",
    rainfall: "48 mm",
    description: "Changing weather conditions being monitored.",
    lat: 27.3389,
    lng: 88.6065,
  },
  {
    id: 5,
    name: "Manali",
    district: "Kullu",
    state: "Himachal",
    risk: "Moderate",
    type: "Landslide",
    rainfall: "55 mm",
    description: "Slope stability requires continued monitoring.",
    lat: 32.2432,
    lng: 77.1892,
  },
];

// Colored marker icon matching the portal's existing risk-severity classes
// (.risk-critical / .risk-high / .risk-moderate / .risk-advisory in index.css)
function getRiskIcon(risk) {
  return L.divIcon({
    className: "",
    html: `<span class="leaflet-risk-marker risk-${risk.toLowerCase()}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function RiskMap() {
  const { language } = useLanguage();

  const [state, setState] = useState("West Bengal");
  const [district, setDistrict] = useState("Darjeeling");
  const [village, setVillage] = useState("Darjeeling Town");
  const [selectedZone, setSelectedZone] = useState(null);
  const [layer, setLayer] = useState("All");

  const isHindi = language === "hi";

  const districts = useMemo(() => {
    return Object.keys(locations[state] || {});
  }, [state]);

  const villages = useMemo(() => {
    return locations[state]?.[district] || [];
  }, [state, district]);

  const filteredZones = riskZones.filter((zone) => {
    if (layer === "All") return true;
    return zone.type === layer;
  });

  const handleStateChange = (value) => {
    setState(value);

    const firstDistrict = Object.keys(locations[value])[0];
    setDistrict(firstDistrict);

    const firstVillage = locations[value][firstDistrict][0];
    setVillage(firstVillage);
    setSelectedZone(null);
  };

  const handleDistrictChange = (value) => {
    setDistrict(value);
    setVillage(locations[state][value][0]);
    setSelectedZone(null);
  };

  const locateArea = () => {
    const found = riskZones.find(
      (zone) =>
        zone.name === village &&
        zone.district === district &&
        zone.state === state
    );

    setSelectedZone(found || null);
  };

  return (
    <main className="risk-map-page" id="main-content">
      {/* PAGE HEADER */}
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
              ? "संवेदनशील क्षेत्रों में क्षेत्रवार बाढ़, भूस्खलन और मौसम संबंधी जोखिम की जानकारी देखें।"
              : "Explore area-wise flood, landslide and weather risk information across vulnerable regions."}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="risk-content">
        <div className="page-container">
          {/* LOCATION FILTER */}
          <div className="risk-toolbar">
            <div>
              <div className="section-label">
                {isHindi ? "जोखिम आकलन" : "RISK ASSESSMENT"}
              </div>

              <h2>
                {isHindi
                  ? "स्थान के अनुसार जोखिम देखें"
                  : "Explore Risk by Location"}
              </h2>

              <p>
                {isHindi
                  ? "उपलब्ध नवीनतम जोखिम जानकारी देखने के लिए अपना स्थान चुनें।"
                  : "Select your location to view the latest available risk information."}
              </p>
            </div>

            <div className="location-controls">
              <div className="control-group">
                <label>{isHindi ? "राज्य" : "State"}</label>

                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {Object.keys(locations).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label>{isHindi ? "जिला" : "District"}</label>

                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  {districts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label>{isHindi ? "गांव / वार्ड" : "Village / Ward"}</label>

                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                >
                  {villages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <button className="primary-btn" onClick={locateArea}>
                <Navigation size={17} />

                {isHindi ? "क्षेत्र खोजें" : "Locate Area"}
              </button>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="map-layout">
            <div className="map-card">
              <div className="map-header">
                <div>
                  <h2>
                    {isHindi ? "क्षेत्रीय जोखिम मानचित्र" : "Regional Risk Map"}
                  </h2>

                  <span>
                    {isHindi
                      ? "निगरानी किए गए बाढ़ और भूस्खलन जोखिम क्षेत्रों को दिखाया जा रहा है"
                      : "Showing monitored flood and landslide risk zones"}
                  </span>
                </div>

                <label className="layer-btn" htmlFor="map-layer-select">
                  <Layers size={17} />

                  <select
                    id="map-layer-select"
                    className="layer-select"
                    value={layer}
                    onChange={(e) => setLayer(e.target.value)}
                    aria-label={
                      isHindi ? "मानचित्र परत चुनें" : "Select map layer"
                    }
                  >
                    <option value="All">
                      {isHindi ? "सभी परतें" : "All Layers"}
                    </option>
                    <option value="Flood">
                      {isHindi ? "बाढ़" : "Flood"}
                    </option>
                    <option value="Landslide">
                      {isHindi ? "भूस्खलन" : "Landslide"}
                    </option>
                    <option value="Weather">
                      {isHindi ? "मौसम" : "Weather"}
                    </option>
                  </select>
                </label>
              </div>

              {/* REGIONAL RISK MAP */}
              <div className="demo-map">
                <MapContainer
                  center={[22.5, 77.0]}
                  zoom={4.5}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {filteredZones.map((zone) => (
                    <Marker
                      key={zone.id}
                      position={[zone.lat, zone.lng]}
                      icon={getRiskIcon(zone.risk)}
                      eventHandlers={{
                        click: () => setSelectedZone(zone),
                      }}
                    >
                      <Popup>
                        <strong>{zone.name}</strong>
                        <br />
                        {zone.district}, {zone.state}
                        <br />
                        {isHindi ? "जोखिम" : "Risk"}: {zone.risk}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* MAP LEGEND */}
              <div className="map-legend">
                <strong>{isHindi ? "जोखिम स्तर" : "Risk Level"}</strong>

                <span>
                  <i className="legend-dot critical"></i>
                  {isHindi ? "गंभीर" : "Critical"}
                </span>

                <span>
                  <i className="legend-dot high"></i>
                  {isHindi ? "उच्च" : "High"}
                </span>

                <span>
                  <i className="legend-dot moderate"></i>
                  {isHindi ? "मध्यम" : "Moderate"}
                </span>

                <span>
                  <i className="legend-dot advisory"></i>
                  {isHindi ? "सलाह" : "Advisory"}
                </span>
              </div>
            </div>

            {/* RIGHT SIDE PANEL */}
            <aside className="risk-side-panel">
              <div className="panel-heading">
                <div className="panel-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <div className="section-label">
                    {isHindi ? "चयनित क्षेत्र" : "SELECTED AREA"}
                  </div>

                  <h2>
                    {selectedZone ? selectedZone.name : village}
                  </h2>
                </div>
              </div>

              {selectedZone ? (
                <>
                  <div
                    className={`risk-status status-${selectedZone.risk.toLowerCase()}`}
                  >
                    <AlertTriangle size={20} />

                    <div>
                      <small>
                        {isHindi
                          ? "वर्तमान जोखिम स्तर"
                          : "Current Risk Level"}
                      </small>

                      <strong>
                        {isHindi
                          ? selectedZone.risk === "High"
                            ? "उच्च"
                            : selectedZone.risk === "Moderate"
                              ? "मध्यम"
                              : selectedZone.risk === "Advisory"
                                ? "सलाह"
                                : selectedZone.risk.toUpperCase()
                          : selectedZone.risk.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  <div className="area-location">
                    {selectedZone.district}, {selectedZone.state}
                  </div>

                  <div className="risk-description">
                    <Info size={17} />

                    <p>{selectedZone.description}</p>
                  </div>

                  <div className="risk-metrics">
                    <div>
                      <Droplets size={18} />

                      <span>
                        {isHindi ? "वर्षा" : "Rainfall"}
                      </span>

                      <strong>{selectedZone.rainfall}</strong>
                    </div>

                    <div>
                      <Mountain size={18} />

                      <span>
                        {isHindi ? "खतरे का प्रकार" : "Hazard Type"}
                      </span>

                      <strong>
                        {isHindi
                          ? selectedZone.type === "Flood"
                            ? "बाढ़"
                            : selectedZone.type === "Landslide"
                              ? "भूस्खलन"
                              : "मौसम"
                          : selectedZone.type}
                      </strong>
                    </div>
                  </div>

                  <div className="recommended-action">
                    <strong>
                      {isHindi
                        ? "अनुशंसित कार्रवाई"
                        : "Recommended Action"}
                    </strong>

                    <p>
                      {isHindi
                        ? "सतर्क रहें और आधिकारिक निर्देशों का पालन करें। संवेदनशील निचले क्षेत्रों और अस्थिर ढलानों से बचें।"
                        : "Stay alert and follow official instructions. Avoid vulnerable low-lying areas and unstable slopes."}
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

          {/* RISK SUMMARY */}
          <div className="risk-summary">
            <div>
              <span className="summary-number">5</span>

              <span>
                {isHindi ? "निगरानी किए गए क्षेत्र" : "Monitored Areas"}
              </span>
            </div>

            <div>
              <span className="summary-number">2</span>

              <span>
                {isHindi ? "उच्च जोखिम" : "High Risk"}
              </span>
            </div>

            <div>
              <span className="summary-number">2</span>

              <span>
                {isHindi ? "मध्यम जोखिम" : "Moderate Risk"}
              </span>
            </div>

            <div>
              <span className="summary-number">1</span>

              <span>
                {isHindi ? "सलाह" : "Advisory"}
              </span>
            </div>
          </div>

          {/* INFORMATION */}
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
                  ? "यहां दिखाई गई जोखिम जानकारी परियोजना प्रदर्शन के लिए डेमो निगरानी डेटा है। आपातकाल के दौरान हमेशा आधिकारिक सरकारी चेतावनियों और निर्देशों का पालन करें।"
                  : "Risk information shown here is demo monitoring data for project demonstration purposes. Always follow official government warnings and instructions during an emergency."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RiskMap;