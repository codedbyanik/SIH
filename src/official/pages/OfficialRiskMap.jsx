import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StatusBadge from "../../components/official/StatusBadge.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { districts } from "../data/officialMockData.js";

const RISK_ORDER = ["Critical", "High", "Moderate", "Low"];

// Colored marker matching the official portal's existing
// .official-risk-critical / -high / -moderate / -low classes
function getOfficialRiskIcon(risk) {
  return L.divIcon({
    className: "",
    html: `<span class="official-riskmap-marker official-risk-${risk.toLowerCase()}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

export default function OfficialRiskMap() {
  const { isHindi, t } = useOfficialLanguage();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(districts[0]);

  const filtered = useMemo(() => {
    return districts.filter((d) => {
      const name = isHindi ? d.nameHi : d.nameEn;
      return (
        query.trim() === "" ||
        name.toLowerCase().includes(query.toLowerCase()) ||
        d.state.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [query, isHindi]);

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("riskMapTitle")}</h1>
          <p className="official-page-subtitle">{t("riskMapSubtitle")}</p>
        </div>
      </div>

      <div className="official-riskmap-layout">
        <section className="official-panel official-riskmap-list">
          <div className="official-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder={t("search")}
              aria-label={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <ul className="official-district-list">
            {filtered.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={`official-district-item ${selected?.id === d.id ? "is-selected" : ""}`}
                  onClick={() => setSelected(d)}
                >
                  <span className={`official-risk-dot official-risk-${d.risk.toLowerCase()}`} aria-hidden="true" />
                  <span className="official-district-name">
                    {isHindi ? d.nameHi : d.nameEn}
                    <span className="official-district-state">{d.state}</span>
                  </span>
                  <StatusBadge label={t(d.risk.toLowerCase())} tone={d.risk.toLowerCase()} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="official-panel official-riskmap-visual" aria-label={t("riskMapTitle")}>
          <div className="official-riskmap-map">
            <MapContainer
              center={[23.5, 84.5]}
              zoom={5}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {districts.map((d) => (
                <Marker
                  key={d.id}
                  position={[d.lat, d.lng]}
                  icon={getOfficialRiskIcon(d.risk)}
                  eventHandlers={{
                    click: () => setSelected(d),
                  }}
                >
                  <Popup>
                    <strong>{isHindi ? d.nameHi : d.nameEn}</strong>
                    <br />
                    {d.state}
                    <br />
                    {t(d.risk.toLowerCase())}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="official-riskmap-legend" aria-label={t("legend")}>
            {RISK_ORDER.map((r) => (
              <span key={r} className="official-legend-item">
                <span className={`official-risk-dot official-risk-${r.toLowerCase()}`} aria-hidden="true" />
                {t(r.toLowerCase())}
              </span>
            ))}
          </div>
        </section>

        <section className="official-panel official-riskmap-details">
          {selected ? (
            <>
              <h2>{isHindi ? selected.nameHi : selected.nameEn}</h2>
              <StatusBadge label={t(selected.risk.toLowerCase())} tone={selected.risk.toLowerCase()} />

              <dl className="official-detail-list official-detail-list-stacked">
                <div>
                  <dt>{t("state")}</dt>
                  <dd>{selected.state}</dd>
                </div>
                <div>
                  <dt>{t("rainfall")}</dt>
                  <dd>{selected.rainfall}</dd>
                </div>
                <div>
                  <dt>{t("riverLevel")}</dt>
                  <dd>{selected.riverLevel}</dd>
                </div>
                <div>
                  <dt>{t("population")}</dt>
                  <dd>{selected.population}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="official-muted-text">{t("selectDistrict")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
