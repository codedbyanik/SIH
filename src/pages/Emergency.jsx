import {
  Phone,
  ShieldAlert,
  Ambulance,
  Flame,
  Building2,
  HeartPulse,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { useLanguage } from "../LanguageContext.jsx";

const Emergency = () => {
  const { language } = useLanguage();

  const isHindi = language === "hi";

  const emergencyServices = [
    {
      icon: Phone,
      number: "112",
      title: isHindi
        ? "राष्ट्रीय आपातकालीन नंबर"
        : "National Emergency Number",
      description: isHindi
        ? "पुलिस, अग्निशमन, चिकित्सा और अन्य तत्काल आपात स्थितियों के लिए।"
        : "For police, fire, medical and other immediate emergencies.",
    },
    {
      icon: Ambulance,
      number: "108",
      title: isHindi
        ? "आपातकालीन चिकित्सा सेवा"
        : "Emergency Medical Services",
      description: isHindi
        ? "एम्बुलेंस और तत्काल चिकित्सा सहायता के लिए कॉल करें।"
        : "Call for ambulance and urgent medical assistance.",
    },
    {
      icon: Flame,
      number: "101",
      title: isHindi ? "अग्निशमन एवं बचाव" : "Fire & Rescue",
      description: isHindi
        ? "आग, बचाव और संबंधित आपातकालीन स्थितियों की सूचना दें।"
        : "Report fires, rescue situations and related emergencies.",
    },
    {
      icon: ShieldAlert,
      number: "1077",
      title: isHindi
        ? "वायनाड जिला आपातकालीन संचालन केंद्र"
        : "Wayanad District Emergency Operations Centre",
      description: isHindi
        ? "बाढ़, भूस्खलन और अन्य आपदाओं के दौरान जिला आपदा सहायता के लिए।"
        : "For district disaster assistance during floods, landslides and other emergencies.",
    },
  ];

  return (
    <main id="main-content" className="emergency-page">
      {/* Hero */}
      <section className="emergency-hero">
        <div className="emergency-hero-container">

          <div className="gov-badge">
            <ShieldAlert size={17} />
            {isHindi
              ? "भारत सरकार आपदा प्रबंधन पहल"
              : "Government of India Disaster Management Initiative"}
          </div>

          <h1>
            {isHindi ? "आपातकालीन " : "Emergency "}
            <span>{isHindi ? "सहायता" : "Help"}</span>
          </h1>

          <p>
            {isHindi
              ? "वायनाड में आपातकालीन सेवाओं, जिला आपदा सहायता और महत्वपूर्ण संपर्कों तक तुरंत पहुंच प्राप्त करें।"
              : "Get immediate access to emergency services, district disaster assistance and important contacts in Wayanad."}
          </p>

        </div>
      </section>

      {/* Emergency Warning */}
      <section className="emergency-warning">
        <div className="warning-icon">
          <ShieldAlert size={28} />
        </div>

        <div>
          <h2>
            {isHindi ? "आपातकाल की स्थिति में" : "In an Emergency"}
          </h2>

          <p>
            {isHindi
              ? "यदि आप तत्काल खतरे में हैं, तो सुरक्षित स्थान पर जाएं और उचित आपातकालीन सेवा से संपर्क करें।"
              : "If you are in immediate danger, move to a safe location and contact the appropriate emergency service."}
          </p>
        </div>

        <a href="tel:112" className="emergency-call-button">
          <Phone size={18} />
          {isHindi ? "112 पर कॉल करें" : "Call 112"}
        </a>
      </section>

      {/* Emergency Numbers */}
      <section className="emergency-section">
        <div className="section-heading">
          <span>
            {isHindi ? "आपातकालीन संपर्क" : "EMERGENCY CONTACTS"}
          </span>

          <h2>{isHindi ? "महत्वपूर्ण नंबर" : "Important Numbers"}</h2>

          <p>
            {isHindi
              ? "वायनाड में तत्काल सहायता की आवश्यकता होने पर इन आपातकालीन नंबरों को आसानी से उपलब्ध रखें।"
              : "Keep these emergency numbers accessible when you need immediate assistance in Wayanad."}
          </p>
        </div>

        <div className="emergency-grid">
          {emergencyServices.map((service) => {
            const Icon = service.icon;

            return (
              <div
                className="emergency-card"
                key={service.number}
              >
                <div className="emergency-card-icon">
                  <Icon size={25} />
                </div>

                <div className="emergency-number">
                  {service.number}
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <a
                  href={`tel:${service.number}`}
                  className="call-link"
                >
                  {isHindi ? "अभी कॉल करें" : "Call Now"}
                  <ArrowRight size={16} />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Disaster Assistance */}
      <section className="assistance-section">
        <div className="assistance-content">
          <div className="assistance-icon">
            <Building2 size={26} />
          </div>

          <div>
            <span>
              {isHindi ? "वायनाड आपदा सहायता" : "WAYANAD DISASTER ASSISTANCE"}
            </span>

            <h2>
              {isHindi
                ? "आपदा के दौरान सहायता चाहिए?"
                : "Need Help During a Disaster?"}
            </h2>

            <p>
              {isHindi
                ? "आधिकारिक निर्देशों का पालन करें, निर्धारित सुरक्षित स्थानों की ओर जाएं और बाढ़ प्रभावित या भूस्खलन संभावित क्षेत्रों से बचें।"
                : "Follow official instructions, move towards designated safe locations and avoid flood-affected or landslide-prone areas."}
            </p>
          </div>
        </div>

        <a href="/shelters" className="assistance-button">
          {isHindi ? "सुरक्षित आश्रय खोजें" : "Find Safe Shelter"}
          <ArrowRight size={17} />
        </a>
      </section>

      {/* Safety Information */}
      <section className="safety-section">
        <div className="section-heading">
          <span>{isHindi ? "सुरक्षा पहले" : "SAFETY FIRST"}</span>

          <h2>
            {isHindi ? "आपको क्या करना चाहिए" : "What You Should Do"}
          </h2>
        </div>

        <div className="safety-grid">
          <div className="safety-item">
            <div className="safety-icon">
              <MapPin size={21} />
            </div>

            <div>
              <h3>{isHindi ? "सुरक्षित स्थान पर जाएं" : "Move to Safety"}</h3>

              <p>
                {isHindi
                  ? "ऊंचे और सुरक्षित स्थान पर जाएं तथा आधिकारिक निकासी निर्देशों का पालन करें।"
                  : "Move to higher, safer ground and follow official evacuation instructions."}
              </p>
            </div>
          </div>

          <div className="safety-item">
            <div className="safety-icon">
              <HeartPulse size={21} />
            </div>

            <div>
              <h3>
                {isHindi ? "जरूरतमंदों की मदद करें" : "Help Those in Need"}
              </h3>

              <p>
                {isHindi
                  ? "जब सुरक्षित हो, तब बच्चों, बुजुर्गों और दिव्यांग लोगों की सहायता करें।"
                  : "Assist children, elderly people and people with disabilities when it is safe to do so."}
              </p>
            </div>
          </div>

          <div className="safety-item">
            <div className="safety-icon">
              <ShieldAlert size={21} />
            </div>

            <div>
              <h3>
                {isHindi
                  ? "आधिकारिक अलर्ट का पालन करें"
                  : "Follow Official Alerts"}
              </h3>

              <p>
                {isHindi
                  ? "केरल राज्य आपदा प्रबंधन प्राधिकरण और वायनाड जिला प्रशासन की आधिकारिक चेतावनियों पर भरोसा करें।"
                  : "Rely on official warnings from Kerala State Disaster Management Authority and Wayanad district administration."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Emergency;