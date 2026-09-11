import { useLanguage } from "../../LanguageContext.jsx";

export default function Footer() {
  const { language } = useLanguage();

  const isHindi = language === "hi";

  return (
    <footer className="site-footer">
      {/* Main Footer */}
      <div className="container footer-content">

        {/* About */}
        <div className="footer-section footer-about">
          <h3>
            {isHindi
              ? "फ्लैश फ्लड अर्ली वार्निंग सिस्टम"
              : "Flash Flood Early Warning System"}
          </h3>

          <p>
            {isHindi
              ? "स्मार्ट आपदा प्रबंधन पहल"
              : "Smart Disaster Management Initiative"}
          </p>

          <p>
            {isHindi
              ? "पूर्व चेतावनी एवं जोखिम निगरानी"
              : "Early Warning & Risk Monitoring"}
          </p>

          <p>
            {isHindi
              ? "सुरक्षित समुदाय • स्मार्ट तकनीक • त्वरित प्रतिक्रिया"
              : "Safer Communities • Smart Technology • Faster Response"}
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

        {/* About This Project */}
        <div className="footer-section">
          <h4>
            {isHindi ? "इस परियोजना के बारे में" : "About This Project"}
          </h4>

          <a href="/preparedness">
            {isHindi ? "यह कैसे काम करता है" : "How It Works"}
          </a>

          <a href="/risk-map">
            {isHindi ? "जोखिम निगरानी" : "Risk Monitoring"}
          </a>

          <a href="/preparedness">
            {isHindi ? "सुरक्षा दिशानिर्देश" : "Safety Guidelines"}
          </a>

          <span className="footer-problem-statement">
            {isHindi
              ? "स्मार्ट इंडिया हैकाथॉन 2026 | समस्या विवरण: SIH26192"
              : "Smart India Hackathon 2026 | Problem Statement: SIH26192"}
          </span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">

          <p>
            {isHindi
              ? "© 2026 स्मार्ट आपदा प्रबंधन"
              : "© 2026 Smart Disaster Management"}
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
    </footer>
  );
}