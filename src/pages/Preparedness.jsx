import {
  ShieldCheck,
  Backpack,
  Radio,
  Droplets,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useLanguage } from "../LanguageContext.jsx";

const preparednessItems = [
  {
    icon: Backpack,
    title: {
      en: "Emergency Kit",
      hi: "आपातकालीन किट",
    },
    description: {
      en: "Keep essential supplies ready for at least 72 hours during an emergency.",
      hi: "आपातकाल के दौरान कम से कम 72 घंटे के लिए आवश्यक सामान तैयार रखें।",
    },
    items: [
      {
        en: "Drinking water",
        hi: "पीने का पानी",
      },
      {
        en: "First-aid supplies",
        hi: "प्राथमिक उपचार सामग्री",
      },
      {
        en: "Torch and extra batteries",
        hi: "टॉर्च और अतिरिक्त बैटरियाँ",
      },
      {
        en: "Essential medicines",
        hi: "आवश्यक दवाइयाँ",
      },
      {
        en: "Dry food",
        hi: "सूखा भोजन",
      },
    ],
  },

  {
    icon: Radio,
    title: {
      en: "Stay Informed",
      hi: "जानकारी से अपडेट रहें",
    },
    description: {
      en: "Follow official alerts and local authorities for timely emergency information.",
      hi: "समय पर आपातकालीन जानकारी के लिए आधिकारिक अलर्ट और स्थानीय अधिकारियों के निर्देशों का पालन करें।",
    },
    items: [
      {
        en: "Monitor official alerts",
        hi: "आधिकारिक अलर्ट पर नज़र रखें",
      },
      {
        en: "Keep your phone charged",
        hi: "अपना फोन चार्ज रखें",
      },
      {
        en: "Follow local authorities",
        hi: "स्थानीय अधिकारियों के निर्देशों का पालन करें",
      },
      {
        en: "Keep emergency contacts saved",
        hi: "आपातकालीन संपर्क नंबर सुरक्षित रखें",
      },
      {
        en: "Use a battery-powered radio if available",
        hi: "यदि उपलब्ध हो तो बैटरी से चलने वाला रेडियो इस्तेमाल करें",
      },
    ],
  },

  {
    icon: MapPin,
    title: {
      en: "Know Your Route",
      hi: "अपना मार्ग जानें",
    },
    description: {
      en: "Know the safest route to higher ground and the nearest designated shelter.",
      hi: "ऊँचे सुरक्षित स्थान और निकटतम निर्धारित आश्रय स्थल तक जाने का सबसे सुरक्षित मार्ग जानें।",
    },
    items: [
      {
        en: "Identify nearby shelters",
        hi: "निकटतम आश्रय स्थलों की पहचान करें",
      },
      {
        en: "Avoid low-lying areas",
        hi: "निचले इलाकों से बचें",
      },
      {
        en: "Know alternate routes",
        hi: "वैकल्पिक मार्गों की जानकारी रखें",
      },
      {
        en: "Share your plan with family",
        hi: "अपनी योजना परिवार के साथ साझा करें",
      },
      {
        en: "Keep important documents accessible",
        hi: "महत्वपूर्ण दस्तावेज़ आसानी से उपलब्ध रखें",
      },
    ],
  },
];

function Preparedness() {
  const { language } = useLanguage();

  const t = (text) => text[language] || text.en;

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="gov-badge">
            <ShieldCheck size={16} />

            {language === "hi"
              ? "भारत सरकार आपदा प्रबंधन पहल"
              : "Government of India Disaster Management Initiative"}
          </div>

          <h1>
            {language === "hi"
              ? "आपदा से तैयारी"
              : "Disaster Preparedness"}
          </h1>

          <p>
            {language === "hi"
              ? "बाढ़, भूस्खलन या किसी अन्य आपात स्थिति से पहले खुद को और अपने परिवार को तैयार रखें।"
              : "Prepare yourself and your family before a flood, landslide or other emergency occurs."}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="content-section">
        <div className="container">
          <div className="section-heading">
            <span>
              {language === "hi" ? "तैयार रहें" : "BE PREPARED"}
            </span>

            <h2>
              {language === "hi"
                ? "आपात स्थिति से पहले तैयारी करें"
                : "Prepare Before an Emergency"}
            </h2>

            <p>
              {language === "hi"
                ? "कुछ सरल तैयारियाँ अचानक आने वाली बाढ़, भूस्खलन और खराब मौसम के दौरान आपकी और आपके परिवार की सुरक्षा में मदद कर सकती हैं।"
                : "A few simple preparations can help protect you and your family during sudden floods, landslides and severe weather."}
            </p>
          </div>

          <div className="preparedness-grid">
            {preparednessItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="preparedness-card"
                  key={item.title.en}
                >
                  <div className="card-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{t(item.title)}</h3>

                  <p>{t(item.description)}</p>

                  <ul>
                    {item.items.map((point) => (
                      <li key={point.en}>
                        <CheckCircle2 size={16} />

                        <span>{t(point)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before Flood */}
      <section className="preparedness-light">
        <div className="container">
          <div className="section-heading">
            <span>
              {language === "hi" ? "बाढ़ से सुरक्षा" : "FLOOD SAFETY"}
            </span>

            <h2>
              {language === "hi"
                ? "बाढ़ से पहले क्या करें"
                : "What To Do Before a Flood"}
            </h2>
          </div>

          <div className="safety-list">
            <div className="safety-item">
              <CheckCircle2 size={20} />

              <div>
                <h3>
                  {language === "hi"
                    ? "कीमती सामान को ऊँचे स्थान पर रखें"
                    : "Move valuables to a higher place"}
                </h3>

                <p>
                  {language === "hi"
                    ? "महत्वपूर्ण दस्तावेज़, इलेक्ट्रॉनिक सामान और अन्य कीमती वस्तुओं को संभावित पानी के नुकसान से बचाएँ।"
                    : "Protect important documents, electronics and other valuable belongings from possible water damage."}
                </p>
              </div>
            </div>

            <div className="safety-item">
              <CheckCircle2 size={20} />

              <div>
                <h3>
                  {language === "hi"
                    ? "आपातकालीन बैग तैयार रखें"
                    : "Prepare an emergency bag"}
                </h3>

                <p>
                  {language === "hi"
                    ? "पानी, भोजन, दवाइयाँ, पहचान दस्तावेज़, टॉर्च और अन्य आवश्यक सामान तैयार रखें।"
                    : "Keep water, food, medicines, identification documents, torch and other essentials ready."}
                </p>
              </div>
            </div>

            <div className="safety-item">
              <CheckCircle2 size={20} />

              <div>
                <h3>
                  {language === "hi"
                    ? "अपने निकासी मार्ग की जानकारी रखें"
                    : "Know your evacuation route"}
                </h3>

                <p>
                  {language === "hi"
                    ? "निकटतम सुरक्षित आश्रय स्थल और ऊँचे स्थान तक जाने वाले मार्गों की पहचान करें।"
                    : "Identify the nearest safe shelter and routes leading to higher ground."}
                </p>
              </div>
            </div>

            <div className="safety-item">
              <CheckCircle2 size={20} />

              <div>
                <h3>
                  {language === "hi"
                    ? "अपडेट रहें"
                    : "Stay updated"}
                </h3>

                <p>
                  {language === "hi"
                    ? "आधिकारिक चेतावनियाँ देखें और स्थानीय अधिकारियों के निर्देशों का पालन करें।"
                    : "Check official warnings and follow instructions from local authorities."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important warning */}
      <section className="emergency-strip" style={{ background: "#FFF4E6" }}>
        <div className="container emergency-content">
          <div className="emergency-icon">
            <AlertTriangle size={24} />
          </div>

          <div>
            <h3>
              {language === "hi"
                ? "आपात स्थिति के दौरान"
                : "During an Emergency"}
            </h3>

            <p>
              {language === "hi"
                ? "स्थिति खतरनाक होने तक इंतज़ार न करें। आधिकारिक निकासी निर्देशों का पालन करें और सुरक्षित स्थान पर जाएँ।"
                : "Do not wait until conditions become dangerous. Follow official evacuation instructions and move to a safe location."}
            </p>
          </div>

          <button
            className="dark-button"
            onClick={() => (window.location.href = "/emergency")}
          >
            <Phone size={18} />

            {language === "hi"
              ? "आपातकालीन सहायता"
              : "Emergency Help"}
          </button>
        </div>
      </section>

      {/* Quick checklist */}
      <section className="content-section">
        <div className="container">
          <div className="section-heading">
            <span>
              {language === "hi"
                ? "त्वरित चेकलिस्ट"
                : "QUICK CHECKLIST"}
            </span>

            <h2>
              {language === "hi"
                ? "क्या आपका परिवार तैयार है?"
                : "Is Your Family Prepared?"}
            </h2>
          </div>

          <div className="checklist-grid">
            <div className="checklist-card">
              <Droplets size={22} />

              <h3>
                {language === "hi" ? "पानी" : "Water"}
              </h3>

              <p>
                {language === "hi"
                  ? "पर्याप्त पीने का पानी उपलब्ध रखें।"
                  : "Keep sufficient drinking water available."}
              </p>
            </div>

            <div className="checklist-card">
              <Backpack size={22} />

              <h3>
                {language === "hi"
                  ? "आपातकालीन किट"
                  : "Emergency Kit"}
              </h3>

              <p>
                {language === "hi"
                  ? "आवश्यक आपातकालीन सामान एक साथ रखें।"
                  : "Keep essential emergency supplies together."}
              </p>
            </div>

            <div className="checklist-card">
              <MapPin size={22} />

              <h3>
                {language === "hi"
                  ? "सुरक्षित स्थान"
                  : "Safe Location"}
              </h3>

              <p>
                {language === "hi"
                  ? "अपने निकटतम सुरक्षित आश्रय स्थल और निकासी मार्ग की जानकारी रखें।"
                  : "Know your nearest safe shelter and evacuation route."}
              </p>
            </div>

            <div className="checklist-card">
              <Phone size={22} />

              <h3>
                {language === "hi"
                  ? "आपातकालीन संपर्क"
                  : "Emergency Contacts"}
              </h3>

              <p>
                {language === "hi"
                  ? "महत्वपूर्ण आपातकालीन नंबर आसानी से उपलब्ध रखें।"
                  : "Keep important emergency numbers easily accessible."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Preparedness;