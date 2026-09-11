import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Navigation,
  Users,
  Droplets,
  HeartPulse,
  Accessibility,
  Phone,
  ShieldCheck,
  Search,
} from "lucide-react";

import { useLanguage } from "../LanguageContext.jsx";

const shelterData = {
  Kerala: {
    Wayanad: [
      {
        name: "Mundakkai Community Shelter",
        type: "Emergency Shelter",
        address: "Mundakkai, Wayanad, Kerala",
        distance: "1.0 km",
        capacity: 300,
        available: 120,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "First Aid", "Accessible"],
        village: "Mundakkai",
      },
      {
        name: "Chooralmala Relief Centre",
        type: "Relief Centre",
        address: "Chooralmala, Wayanad, Kerala",
        distance: "1.4 km",
        capacity: 250,
        available: 85,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "Medical Aid"],
        village: "Chooralmala",
      },
      {
        name: "Meppadi Community Shelter",
        type: "Emergency Shelter",
        address: "Meppadi, Wayanad, Kerala",
        distance: "2.0 km",
        capacity: 400,
        available: 160,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "First Aid", "Accessible"],
        village: "Meppadi",
      },
      {
        name: "Vythiri Relief Centre",
        type: "Relief Centre",
        address: "Vythiri, Wayanad, Kerala",
        distance: "2.5 km",
        capacity: 280,
        available: 70,
        status: "Limited",
        phone: "112",
        facilities: ["Drinking Water", "First Aid"],
        village: "Vythiri",
      },
      {
        name: "Kalpetta Emergency Shelter",
        type: "Emergency Shelter",
        address: "Kalpetta, Wayanad, Kerala",
        distance: "3.0 km",
        capacity: 500,
        available: 220,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "Medical Aid", "Accessible"],
        village: "Kalpetta",
      },
    ],
  },
};

const SHELTER_STORAGE_KEY = "sih_shelters";

const villageOptions = {
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

const translations = {
  en: {
    skip: "Skip to main content",
    initiative: "Government of India Disaster Management Initiative",
    title: "Safe Shelters",
    heroText:
      "Find nearby emergency shelters and relief centres available for communities affected by floods and landslides.",

    locator: "SHELTER LOCATOR",
    findSafe: "Find a Safe Shelter",
    locatorText:
      "Select your location to find nearby emergency shelters and relief centres.",

    state: "State",
    district: "District",
    village: "Village / Ward",
    findShelters: "Find Shelters",

    availableCentres: "AVAILABLE CENTRES",
    nearby: "Nearby Safe Shelters",
    showing: "Showing shelters around",

    searchPlaceholder: "Search shelters...",

    demoTitle: "Shelter Information",
    demoText:
      "Shelter information may include centres added by disaster management officials. During an actual emergency, follow official evacuation instructions from local authorities.",

    noShelters: "No shelters found",
    noSheltersText:
      "No shelter information is available for the selected area in this demo.",

    emergencyShelter: "Emergency Shelter",
    reliefCentre: "Relief Centre",

    available: "Available",
    limited: "Limited",

    capacity: "Capacity",
    availableCapacity: "Available Capacity",
    placesAvailable: "places currently available",

    facilities: "Facilities",
    drinkingWater: "Drinking Water",
    firstAid: "First Aid",
    medicalAid: "Medical Aid",
    accessible: "Accessible",

    directions: "Get Directions",

    emergency: "In an Emergency",
    emergencyText:
      "If you are in immediate danger, move to a safe location and contact the appropriate emergency services.",
    call112: "Call 112",
  },

  hi: {
    skip: "मुख्य सामग्री पर जाएँ",
    initiative: "भारत सरकार आपदा प्रबंधन पहल",
    title: "सुरक्षित आश्रय केंद्र",
    heroText:
      "बाढ़ और भूस्खलन से प्रभावित समुदायों के लिए पास के आपातकालीन आश्रय केंद्र और राहत केंद्र खोजें।",

    locator: "आश्रय केंद्र खोजक",
    findSafe: "सुरक्षित आश्रय केंद्र खोजें",
    locatorText:
      "पास के आपातकालीन आश्रय और राहत केंद्र खोजने के लिए अपना स्थान चुनें।",

    state: "राज्य",
    district: "जिला",
    village: "गाँव / वार्ड",
    findShelters: "आश्रय केंद्र खोजें",

    availableCentres: "उपलब्ध केंद्र",
    nearby: "पास के सुरक्षित आश्रय केंद्र",
    showing: "आश्रय केंद्र दिखाए जा रहे हैं",

    searchPlaceholder: "आश्रय केंद्र खोजें...",

    demoTitle: "आश्रय केंद्र की जानकारी",
    demoText:
      "यहाँ आश्रय केंद्र की जानकारी आपदा प्रबंधन अधिकारियों द्वारा जोड़े गए केंद्रों सहित दिखाई जा सकती है। वास्तविक आपातकाल में स्थानीय अधिकारियों के आधिकारिक निकासी निर्देशों का पालन करें।",

    noShelters: "कोई आश्रय केंद्र नहीं मिला",
    noSheltersText:
      "इस डेमो में चुने गए क्षेत्र के लिए कोई आश्रय केंद्र की जानकारी उपलब्ध नहीं है।",

    emergencyShelter: "आपातकालीन आश्रय",
    reliefCentre: "राहत केंद्र",

    available: "उपलब्ध",
    limited: "सीमित",

    capacity: "क्षमता",
    availableCapacity: "उपलब्ध क्षमता",
    placesAvailable: "स्थान वर्तमान में उपलब्ध हैं",

    facilities: "सुविधाएँ",
    drinkingWater: "पीने का पानी",
    firstAid: "प्राथमिक उपचार",
    medicalAid: "चिकित्सा सहायता",
    accessible: "सुगम",

    directions: "दिशा-निर्देश प्राप्त करें",

    emergency: "आपातकाल में",
    emergencyText:
      "यदि आप तत्काल खतरे में हैं, तो सुरक्षित स्थान पर जाएँ और संबंधित आपातकालीन सेवाओं से संपर्क करें।",
    call112: "112 पर कॉल करें",
  },
};

function Shelters() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [state, setState] = useState("Kerala");
  const [district, setDistrict] = useState("Wayanad");
  const [village, setVillage] = useState("Mundakkai");
  const [search, setSearch] = useState("");
  const [createdShelters, setCreatedShelters] = useState([]);

  useEffect(() => {
    const loadShelters = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(SHELTER_STORAGE_KEY) || "[]"
        );
        setCreatedShelters(Array.isArray(saved) ? saved : []);
      } catch {
        setCreatedShelters([]);
      }
    };

    loadShelters();

    const handleStorage = (event) => {
      if (event.key === SHELTER_STORAGE_KEY) loadShelters();
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const combinedVillageOptions = useMemo(() => {
    const result = JSON.parse(JSON.stringify(villageOptions));

    createdShelters.forEach((shelter) => {
      if (!shelter.state || !shelter.district) return;

      if (!result[shelter.state]) result[shelter.state] = {};
      if (!result[shelter.state][shelter.district]) {
        result[shelter.state][shelter.district] = [];
      }

      const village = shelter.village || "All Areas";
      if (!result[shelter.state][shelter.district].includes(village)) {
        result[shelter.state][shelter.district].push(village);
      }
    });

    return result;
  }, [createdShelters]);

  const districts = Object.keys(combinedVillageOptions[state] || {});

  const villages = combinedVillageOptions[state]?.[district] || [];

  const allCitizenShelters = useMemo(() => {
    const additions = createdShelters.map((shelter) => ({
      name: shelter.nameEn,
      type: "Emergency Shelter",
      address: shelter.address,
      distance: "—",
      capacity: Number(shelter.capacity || 0),
      available: Math.max(
        0,
        Number(shelter.capacity || 0) - Number(shelter.occupancy || 0)
      ),
      status:
        shelter.status === "Operational"
          ? "Available"
          : shelter.status === "At Capacity"
            ? "Limited"
            : "Unavailable",
      phone: shelter.contact || "112",
      facilities: shelter.facilities || [],
      state: shelter.state,
      district: shelter.district,
      village: shelter.village || "All Areas",
    }));

    return [
      ...Object.entries(shelterData).flatMap(([stateName, districtData]) =>
        Object.entries(districtData).flatMap(([districtName, items]) =>
          items.map((item) => ({
            ...item,
            state: stateName,
            district: districtName,
            village: "All Areas",
          }))
        )
      ),
      ...additions,
    ];
  }, [createdShelters]);

  const shelters = useMemo(() => {
    const data = allCitizenShelters.filter(
      (shelter) =>
        shelter.state === state &&
        shelter.district === district &&
        (
          shelter.village === "All Areas" ||
          shelter.village === village
        )
    );

    return data.filter((shelter) =>
      `${shelter.name} ${shelter.address}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [allCitizenShelters, state, district, search]);

  const handleStateChange = (value) => {
    setState(value);

    const firstDistrict = Object.keys(combinedVillageOptions[value] || {})[0];

    setDistrict(firstDistrict);
    setVillage(combinedVillageOptions[value][firstDistrict][0]);
    setSearch("");
  };

  const handleDistrictChange = (value) => {
    setDistrict(value);
    setVillage(combinedVillageOptions[state][value][0]);
    setSearch("");
  };

  const translateType = (type) => {
    if (language !== "hi") return type;

    if (type === "Emergency Shelter") return t.emergencyShelter;
    if (type === "Relief Centre") return t.reliefCentre;

    return type;
  };

  const translateStatus = (status) => {
    if (language !== "hi") return status;

    if (status === "Available") return t.available;
    if (status === "Limited") return t.limited;

    return status;
  };

  const translateFacility = (facility) => {
    if (language !== "hi") return facility;

    const facilityMap = {
      "Drinking Water": t.drinkingWater,
      "First Aid": t.firstAid,
      "Medical Aid": t.medicalAid,
      Accessible: t.accessible,
    };

    return facilityMap[facility] || facility;
  };

  return (
    <main className="shelters-page" id="main-content">

      {/* SKIP TO MAIN */}
     

      {/* HERO */}
      <section className="shelters-hero">
        <div className="shelters-container">

          <div className="gov-badge">
            <ShieldCheck size={16} />
            {t.initiative}
          </div>

          <h1>{t.title}</h1>

          <p>{t.heroText}</p>

        </div>
      </section>

      {/* MAIN */}
      <section className="shelters-content">
        <div className="shelters-container">

          {/* SEARCH PANEL */}
          <div className="shelter-search-panel">

            <div className="search-heading">

              <div className="section-label">
                {t.locator}
              </div>

              <h2>{t.findSafe}</h2>

              <p>{t.locatorText}</p>

            </div>

            <div className="shelter-controls">

              <div className="shelter-control">
                <label>{t.state}</label>

                <select
                  value={state}
                  onChange={(e) =>
                    handleStateChange(e.target.value)
                  }
                >
                  {Object.keys(villageOptions).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="shelter-control">
                <label>{t.district}</label>

                <select
                  value={district}
                  onChange={(e) =>
                    handleDistrictChange(e.target.value)
                  }
                >
                  {districts.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="shelter-control">
                <label>{t.village}</label>

                <select
                  value={village}
                  onChange={(e) =>
                    setVillage(e.target.value)
                  }
                >
                  {villages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <button
                className="shelter-locate-btn"
                onClick={() => {}}
              >
                <Navigation size={17} />
                {t.findShelters}
              </button>

            </div>

          </div>

          {/* RESULTS HEADER */}
          <div className="shelter-results-header">

            <div>
              <div className="section-label">
                {t.availableCentres}
              </div>

              <h2>{t.nearby}</h2>

              <p>
                {t.showing}{" "}
                <strong>{village}</strong>,{" "}
                {district}, {state}.
              </p>
            </div>

            <div className="shelter-search">

              <Search size={17} />

              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>

          {/* DEMO NOTICE */}
          <div className="shelter-demo-notice">

            <ShieldCheck size={18} />

            <div>
              <strong>{t.demoTitle}</strong>

              <p>{t.demoText}</p>
            </div>

          </div>

          {/* SHELTERS */}
          <div className="shelter-list">

            {shelters.length === 0 ? (

              <div className="no-shelters">
                <MapPin size={35} />

                <h3>{t.noShelters}</h3>

                <p>{t.noSheltersText}</p>
              </div>

            ) : (

              shelters.map((shelter, index) => (

                <article
                  className="shelter-card"
                  key={index}
                >

                  <div className="shelter-card-main">

                    <div className="shelter-icon">
                      <MapPin size={23} />
                    </div>

                    <div className="shelter-details">

                      <div className="shelter-type">
                        {translateType(shelter.type)}
                      </div>

                      <h3>{shelter.name}</h3>

                      <p className="shelter-address">
                        <MapPin size={15} />
                        {shelter.address}
                      </p>

                      <div className="shelter-meta">

                        <span>
                          <Navigation size={15} />
                          {shelter.distance}
                        </span>

                        <span>
                          <Users size={15} />
                          {t.capacity}: {shelter.capacity}
                        </span>

                        <span
                          className={
                            shelter.status === "Available"
                              ? "available"
                              : "limited"
                          }
                        >
                          {translateStatus(shelter.status)}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="shelter-availability">

                    <div className="availability-heading">
                      <span>{t.availableCapacity}</span>

                      <strong>
                        {shelter.available}
                      </strong>
                    </div>

                    <div className="capacity-bar">
                      <div
                        style={{
                          width: `${
                            (shelter.available /
                              shelter.capacity) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <small>
                      {shelter.available} {t.placesAvailable}
                    </small>

                  </div>

                  <div className="shelter-facilities">

                    <strong>{t.facilities}</strong>

                    <div>
                      {shelter.facilities.map(
                        (facility) => (

                          <span key={facility}>

                            {facility ===
                              "Drinking Water" && (
                              <Droplets size={14} />
                            )}

                            {facility ===
                              "First Aid" && (
                              <HeartPulse size={14} />
                            )}

                            {facility ===
                              "Medical Aid" && (
                              <HeartPulse size={14} />
                            )}

                            {facility ===
                              "Accessible" && (
                              <Accessibility size={14} />
                            )}

                            {translateFacility(facility)}

                          </span>

                        )
                      )}
                    </div>

                  </div>

                  <div className="shelter-actions">

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        shelter.address
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="directions-btn"
                    >
                      <Navigation size={16} />
                      {t.directions}
                    </a>

                    <a
                      href={`tel:${shelter.phone}`}
                      className="call-btn"
                    >
                      <Phone size={16} />
                      {shelter.phone}
                    </a>

                  </div>

                </article>

              ))

            )}

          </div>

          {/* EMERGENCY MESSAGE */}
          <div className="shelter-emergency">

            <div className="emergency-icon">
              <Phone size={20} />
            </div>

            <div>

              <strong>
                {t.emergency}
              </strong>

              <p>
                {t.emergencyText}
              </p>

            </div>

            <a href="tel:112">
              {t.call112}
            </a>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Shelters;