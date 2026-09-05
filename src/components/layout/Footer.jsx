import { useLanguage } from "../../LanguageContext.jsx";

export default function Footer() {
  const { language } = useLanguage();

  const isHindi = language === "hi";

  return (
    <footer className="site-footer">
      {/* Main Footer */}
      <div className="container footer-content">

        {/* Department */}
        <div className="footer-section footer-about">
          <h3>
            {isHindi
              ? "फ्लैश फ्लड अर्ली वार्निंग सिस्टम"
              : "Flash Flood Early Warning System"}
          </h3>

          <p>
            {isHindi ? "गृह मंत्रालय" : "Ministry of Home Affairs"}
          </p>

          <p>
            {isHindi ? "भारत सरकार" : "Government of India"}
          </p>

          <p>
            {isHindi
              ? "आपदा प्रबंधन प्रभाग"
              : "Disaster Management Division"}
          </p>
        </div>

        {/* Citizen Services */}
        <div className="footer-section">
          <h4>
            {isHindi ? "नागरिक सेवाएं" : "Citizen Services"}
          </h4>

          <a href="/alerts">
            {isHindi ? "बाढ़ चेतावनी" : "Flood Alerts"}
          </a>

          <a href="/risk-map">
            {isHindi ? "जोखिम मानचित्र" : "Risk Map"}
          </a>

          <a href="/shelters">
            {isHindi ? "सुरक्षित आश्रय" : "Safe Shelters"}
          </a>

          <a href="/emergency">
            {isHindi ? "आपातकालीन सहायता" : "Emergency Help"}
          </a>
        </div>

        {/* Information */}
        <div className="footer-section">
          <h4>
            {isHindi ? "जानकारी" : "Information"}
          </h4>

          <a href="/preparedness">
            {isHindi ? "आपदा तैयारी" : "Disaster Preparedness"}
          </a>

          <a href="/preparedness">
            {isHindi
              ? "अक्सर पूछे जाने वाले प्रश्न"
              : "Frequently Asked Questions"}
          </a>

          <a href="/preparedness">
            {isHindi ? "सुलभता" : "Accessibility"}
          </a>

          <a href="/emergency">
            {isHindi ? "हमसे संपर्क करें" : "Contact Us"}
          </a>
        </div>

        {/* Important Links */}
        <div className="footer-section">
          <h4>
            {isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}
          </h4>

          <a
            href="https://www.india.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {isHindi ? "भारत सरकार" : "Government of India"}
          </a>

          <a
            href="https://www.mha.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {isHindi ? "गृह मंत्रालय" : "Ministry of Home Affairs"}
          </a>

          <a
            href="https://ndma.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {isHindi ? "आपदा प्रबंधन" : "Disaster Management"}
          </a>

          <a
            href="https://www.ndrf.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {isHindi
              ? "राष्ट्रीय आपदा मोचन बल"
              : "National Disaster Response Force"}
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">

          <p>
            {isHindi ? "© भारत सरकार" : "© Government of India"}
          </p>

          <p>
            {isHindi
              ? "फ्लैश फ्लड अर्ली वार्निंग सिस्टम"
              : "Flash Flood Early Warning System"}
          </p>

          <p>
            {isHindi
              ? "अंतिम अपडेट: सितंबर 2026"
              : "Last Updated: September 2026"}
          </p>

        </div>
      </div>
      <div className="prototype-banner">
  ⚠️{" "}
  {isHindi
    ? "प्रोटोटाइप — स्मार्ट इंडिया हैकाथॉन 2026 | समस्या विवरण: SIH26192"
    : "Prototype — Smart India Hackathon 2026 | Problem Statement: SIH26192"}
</div>
    </footer>
  );
}