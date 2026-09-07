import { useMemo, useState } from "react";
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
  "West Bengal": {
    Darjeeling: [
      {
        name: "Darjeeling Town Community Hall",
        type: "Emergency Shelter",
        address: "Chowrasta Road, Darjeeling",
        distance: "1.2 km",
        capacity: 250,
        available: 84,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "First Aid", "Accessible"],

        // Demo coordinates
        lat: 27.041,
        lng: 88.2663,
        village: "Darjeeling Town",
      },
      {
        name: "Darjeeling Municipal Relief Centre",
        type: "Relief Centre",
        address: "Lebong Cart Road, Darjeeling",
        distance: "2.8 km",
        capacity: 180,
        available: 42,
        status: "Available",
        phone: "1070",
        facilities: ["Drinking Water", "Medical Aid"],

        lat: 27.0365,
        lng: 88.258,
        village: "Darjeeling Town",
      },
      {
        name: "Ghoom Community Centre",
        type: "Emergency Shelter",
        address: "Ghoom, Darjeeling",
        distance: "5.1 km",
        capacity: 120,
        available: 12,
        status: "Limited",
        phone: "112",
        facilities: ["Drinking Water", "Accessible"],

        lat: 27.005,
        lng: 88.262,
        village: "Darjeeling Town",
      },
    ],

    Kalimpong: [
      {
        name: "Kalimpong Community Hall",
        type: "Emergency Shelter",
        address: "Rishi Road, Kalimpong",
        distance: "1.5 km",
        capacity: 200,
        available: 75,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "First Aid", "Accessible"],

        lat: 27.06,
        lng: 88.47,
        village: "Kalimpong Town",
      },
    ],
  },

  Sikkim: {
    Gangtok: [
      {
        name: "Gangtok Community Relief Centre",
        type: "Emergency Shelter",
        address: "Development Area, Gangtok",
        distance: "1.8 km",
        capacity: 300,
        available: 96,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "Medical Aid", "Accessible"],

        lat: 27.3389,
        lng: 88.6065,
        village: "Gangtok",
      },
      {
        name: "Tadong Relief Centre",
        type: "Relief Centre",
        address: "Tadong, Gangtok",
        distance: "4.2 km",
        capacity: 150,
        available: 18,
        status: "Limited",
        phone: "1070",
        facilities: ["Drinking Water", "First Aid"],

        lat: 27.316,
        lng: 88.604,
        village: "Gangtok",
      },
    ],

    Mangan: [
      {
        name: "Mangan Community Shelter",
        type: "Emergency Shelter",
        address: "Mangan Main Road",
        distance: "1.1 km",
        capacity: 160,
        available: 60,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "First Aid"],

        lat: 27.508,
        lng: 88.533,
        village: "Mangan",
      },
    ],
  },

  Uttarakhand: {
    Dehradun: [
      {
        name: "Dehradun Emergency Relief Centre",
        type: "Emergency Shelter",
        address: "Rajpur Road, Dehradun",
        distance: "2.1 km",
        capacity: 350,
        available: 110,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "Medical Aid", "Accessible"],

        lat: 30.3165,
        lng: 78.0322,
        village: "Dehradun",
      },
    ],

    Nainital: [
      {
        name: "Nainital Community Shelter",
        type: "Emergency Shelter",
        address: "Mallital, Nainital",
        distance: "1.7 km",
        capacity: 220,
        available: 48,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "First Aid"],

        lat: 29.3919,
        lng: 79.4542,
        village: "Nainital",
      },
    ],
  },

  Himachal: {
    Shimla: [
      {
        name: "Shimla Disaster Relief Centre",
        type: "Emergency Shelter",
        address: "Circular Road, Shimla",
        distance: "1.9 km",
        capacity: 280,
        available: 72,
        status: "Available",
        phone: "112",
        facilities: ["Drinking Water", "Medical Aid", "Accessible"],

        lat: 31.1048,
        lng: 77.1734,
        village: "Shimla",
      },
    ],

    Kullu: [
      {
        name: "Kullu Emergency Shelter",
        type: "Emergency Shelter",
        address: "Dhalpur, Kullu",
        distance: "2.4 km",
        capacity: 240,
        available: 36,
        status: "Limited",
        phone: "112",
        facilities: ["Drinking Water", "First Aid"],

        lat: 31.9584,
        lng: 77.1089,
        village: "Kullu",
      },
    ],
  },
};

const villageOptions = {
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

const translations = {
  en: {
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

    findShelters: "Use My Location",

    locating: "Locating...",

    availableCentres: "AVAILABLE CENTRES",

    nearby: "Nearby Safe Shelters",

    showing: "Showing shelters around",

    showingLocation: "Showing shelters nearest to your location",

    searchPlaceholder: "Search shelters...",

    demoTitle: "Demo Shelter Information",

    demoText:
      "Shelter availability shown here is demonstration data. During an actual emergency, follow official evacuation instructions from local authorities.",

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

    findShelters: "मेरी लोकेशन का उपयोग करें",

    locating: "लोकेशन खोजी जा रही है...",

    availableCentres: "उपलब्ध केंद्र",

    nearby: "पास के सुरक्षित आश्रय केंद्र",

    showing: "आश्रय केंद्र दिखाए जा रहे हैं",

    showingLocation: "आपकी लोकेशन के निकटतम आश्रय केंद्र",

    searchPlaceholder: "आश्रय केंद्र खोजें...",

    demoTitle: "डेमो आश्रय केंद्र जानकारी",

    demoText:
      "यहाँ दिखाई गई आश्रय केंद्र की उपलब्धता प्रदर्शन के लिए है। वास्तविक आपातकाल में स्थानीय अधिकारियों के आधिकारिक निकासी निर्देशों का पालन करें।",

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


// ----------------------------------------------------
// Calculate distance between two GPS coordinates
// ----------------------------------------------------

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};


// ----------------------------------------------------
// Get all shelters from the database
// ----------------------------------------------------

const getAllShelters = () => {
  const allShelters = [];

  Object.entries(shelterData).forEach(
    ([state, districts]) => {
      Object.entries(districts).forEach(
        ([district, shelters]) => {
          shelters.forEach((shelter) => {
            allShelters.push({
              ...shelter,
              state,
              district,
            });
          });
        }
      );
    }
  );

  return allShelters;
};


function Shelters() {
  const { language } = useLanguage();

  const t = translations[language] || translations.en;

  const [state, setState] = useState("West Bengal");

  const [district, setDistrict] =
    useState("Darjeeling");

  const [village, setVillage] =
    useState("Darjeeling Town");

  const [search, setSearch] = useState("");

  const [locating, setLocating] = useState(false);

  const [userLocation, setUserLocation] =
    useState(null);


  const districts =
    Object.keys(villageOptions[state] || {});

  const villages =
    villageOptions[state]?.[district] || [];


  // ----------------------------------------------------
  // Get user's location
  // ----------------------------------------------------

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat =
          position.coords.latitude;

        const userLng =
          position.coords.longitude;

        const allShelters =
          getAllShelters();

        // Calculate distance to every shelter
        const sheltersWithDistance =
          allShelters.map((shelter) => ({
            ...shelter,

            actualDistance:
              calculateDistance(
                userLat,
                userLng,
                shelter.lat,
                shelter.lng
              ),
          }));


        // Find nearest shelter
        const nearestShelter =
          sheltersWithDistance.reduce(
            (nearest, shelter) =>
              shelter.actualDistance <
              nearest.actualDistance
                ? shelter
                : nearest
          );


        // Store user's GPS location
        setUserLocation({
          lat: userLat,
          lng: userLng,
        });


        // Automatically select nearest shelter's area
        setState(nearestShelter.state);

        setDistrict(nearestShelter.district);

        setVillage(nearestShelter.village);

        setSearch("");

        setLocating(false);
      },

      (error) => {
        setLocating(false);

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          alert(
            "Location permission was denied. Please allow location access."
          );
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          alert(
            "Your location is currently unavailable."
          );
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          alert(
            "Location request timed out. Please try again."
          );
        } else {
          alert(
            "Unable to determine your location."
          );
        }
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0,
      }
    );
  };


  // ----------------------------------------------------
  // State change
  // ----------------------------------------------------

  const handleStateChange = (value) => {
    setState(value);

    const firstDistrict =
      Object.keys(
        villageOptions[value]
      )[0];

    setDistrict(firstDistrict);

    setVillage(
      villageOptions[value][firstDistrict][0]
    );

    setSearch("");

    // Manual selection = stop GPS sorting
    setUserLocation(null);
  };


  // ----------------------------------------------------
  // District change
  // ----------------------------------------------------

  const handleDistrictChange = (value) => {
    setDistrict(value);

    setVillage(
      villageOptions[state][value][0]
    );

    setSearch("");

    // Manual selection = stop GPS sorting
    setUserLocation(null);
  };


  // ----------------------------------------------------
  // Village change
  // ----------------------------------------------------

  const handleVillageChange = (value) => {
    setVillage(value);

    // Manual selection = stop GPS sorting
    setUserLocation(null);
  };


  // ----------------------------------------------------
  // Get shelters
  // ----------------------------------------------------

  const shelters = useMemo(() => {
    const data =
      shelterData[state]?.[district] || [];


    // Normal manually selected location
    if (!userLocation) {
      return data.filter((shelter) =>
        `${shelter.name} ${shelter.address}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }


    // GPS mode
    // Calculate actual distance from user
    const sheltersWithDistance =
      data.map((shelter) => ({
        ...shelter,

        actualDistance:
          calculateDistance(
            userLocation.lat,
            userLocation.lng,
            shelter.lat,
            shelter.lng
          ),
      }));


    // Sort nearest → farthest
    sheltersWithDistance.sort(
      (a, b) =>
        a.actualDistance -
        b.actualDistance
    );


    // Search
    return sheltersWithDistance.filter(
      (shelter) =>
        `${shelter.name} ${shelter.address}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [
    state,
    district,
    search,
    userLocation,
  ]);


  // ----------------------------------------------------
  // Translate shelter type
  // ----------------------------------------------------

  const translateType = (type) => {
    if (language !== "hi") return type;

    if (type === "Emergency Shelter")
      return t.emergencyShelter;

    if (type === "Relief Centre")
      return t.reliefCentre;

    return type;
  };


  // ----------------------------------------------------
  // Translate status
  // ----------------------------------------------------

  const translateStatus = (status) => {
    if (language !== "hi") return status;

    if (status === "Available")
      return t.available;

    if (status === "Limited")
      return t.limited;

    return status;
  };


  // ----------------------------------------------------
  // Translate facilities
  // ----------------------------------------------------

  const translateFacility = (facility) => {
    if (language !== "hi")
      return facility;

    const facilityMap = {
      "Drinking Water":
        t.drinkingWater,

      "First Aid":
        t.firstAid,

      "Medical Aid":
        t.medicalAid,

      Accessible:
        t.accessible,
    };

    return (
      facilityMap[facility] ||
      facility
    );
  };


  return (
    <main
      className="shelters-page"
      id="main-content"
    >

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


              {/* STATE */}

              <div className="shelter-control">

                <label>{t.state}</label>

                <select
                  value={state}
                  onChange={(e) =>
                    handleStateChange(
                      e.target.value
                    )
                  }
                >

                  {Object.keys(
                    villageOptions
                  ).map((item) => (

                    <option
                      key={item}
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>


              {/* DISTRICT */}

              <div className="shelter-control">

                <label>{t.district}</label>

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
                      >
                        {item}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* VILLAGE */}

              <div className="shelter-control">

                <label>{t.village}</label>

                <select
                  value={village}
                  onChange={(e) =>
                    handleVillageChange(
                      e.target.value
                    )
                  }
                >

                  {villages.map(
                    (item) => (

                      <option
                        key={item}
                      >
                        {item}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* USE MY LOCATION */}

              <button
                className="shelter-locate-btn"
                onClick={getMyLocation}
                disabled={locating}
              >

                <Navigation
                  size={17}
                />

                {locating
                  ? t.locating
                  : t.findShelters}

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

                {userLocation ? (
                  <>
                    {t.showingLocation}
                  </>
                ) : (
                  <>
                    {t.showing}{" "}

                    <strong>
                      {village}
                    </strong>
                    ,{" "}

                    {district},{" "}
                    {state}.
                  </>
                )}

              </p>

            </div>


            {/* SEARCH */}

            <div className="shelter-search">

              <Search size={17} />

              <input
                type="text"
                placeholder={
                  t.searchPlaceholder
                }
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* DEMO NOTICE */}

          <div className="shelter-demo-notice">

            <ShieldCheck size={18} />

            <div>

              <strong>
                {t.demoTitle}
              </strong>

              <p>
                {t.demoText}
              </p>

            </div>

          </div>


          {/* SHELTERS */}

          <div className="shelter-list">

            {shelters.length === 0 ? (

              <div className="no-shelters">

                <MapPin size={35} />

                <h3>
                  {t.noShelters}
                </h3>

                <p>
                  {t.noSheltersText}
                </p>

              </div>

            ) : (

              shelters.map(
                (shelter, index) => (

                  <article
                    className="shelter-card"
                    key={`${shelter.name}-${index}`}
                  >


                    {/* MAIN INFO */}

                    <div className="shelter-card-main">

                      <div className="shelter-icon">

                        <MapPin
                          size={23}
                        />

                      </div>


                      <div className="shelter-details">

                        <div className="shelter-type">

                          {translateType(
                            shelter.type
                          )}

                        </div>


                        <h3>
                          {shelter.name}
                        </h3>


                        <p className="shelter-address">

                          <MapPin
                            size={15}
                          />

                          {shelter.address}

                        </p>


                        <div className="shelter-meta">


                          {/* DISTANCE */}

                          <span>

                            <Navigation
                              size={15}
                            />

                            {userLocation
                              ? `${shelter.actualDistance.toFixed(
                                  1
                                )} km`
                              : shelter.distance}

                          </span>


                          {/* CAPACITY */}

                          <span>

                            <Users
                              size={15}
                            />

                            {t.capacity}:{" "}
                            {shelter.capacity}

                          </span>


                          {/* STATUS */}

                          <span
                            className={
                              shelter.status ===
                              "Available"
                                ? "available"
                                : "limited"
                            }
                          >

                            {translateStatus(
                              shelter.status
                            )}

                          </span>

                        </div>

                      </div>

                    </div>


                    {/* CAPACITY */}

                    <div className="shelter-availability">

                      <div className="availability-heading">

                        <span>
                          {t.availableCapacity}
                        </span>

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

                        {shelter.available}{" "}
                        {t.placesAvailable}

                      </small>

                    </div>


                    {/* FACILITIES */}

                    <div className="shelter-facilities">

                      <strong>
                        {t.facilities}
                      </strong>


                      <div>

                        {shelter.facilities.map(
                          (facility) => (

                            <span
                              key={facility}
                            >

                              {facility ===
                                "Drinking Water" && (
                                <Droplets
                                  size={14}
                                />
                              )}


                              {facility ===
                                "First Aid" && (
                                <HeartPulse
                                  size={14}
                                />
                              )}


                              {facility ===
                                "Medical Aid" && (
                                <HeartPulse
                                  size={14}
                                />
                              )}


                              {facility ===
                                "Accessible" && (
                                <Accessibility
                                  size={14}
                                />
                              )}


                              {translateFacility(
                                facility
                              )}

                            </span>

                          )
                        )}

                      </div>

                    </div>


                    {/* ACTION BUTTONS */}

                    <div className="shelter-actions">


                      {/* GOOGLE MAPS */}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          shelter.address
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="directions-btn"
                      >

                        <Navigation
                          size={16}
                        />

                        {t.directions}

                      </a>


                      {/* CALL */}

                      <a
                        href={`tel:${shelter.phone}`}
                        className="call-btn"
                      >

                        <Phone
                          size={16}
                        />

                        {shelter.phone}

                      </a>

                    </div>

                  </article>

                )
              )

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