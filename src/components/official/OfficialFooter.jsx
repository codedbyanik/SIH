import { useOfficialLanguage } from "../../official/i18n/useOfficialLanguage.js";

/* =========================================================
   OfficialFooter
   Single restrained footer for the Official Portal.
   Rendered once by OfficialLayout.
   ========================================================= */

export default function OfficialFooter() {
  const { isHindi, t } = useOfficialLanguage();

  return (
    <footer className="official-footer">
      <div className="official-footer-inner">
        <div className="official-footer-col">
          <strong>{t("systemName")}</strong>
          <span>{isHindi ? "स्मार्ट आपदा प्रबंधन पहल" : "Smart Disaster Management Initiative"}</span>
          <span>{isHindi ? "पूर्व चेतावनी एवं जोखिम निगरानी" : "Early Warning & Risk Monitoring"}</span>
        </div>

        <div className="official-footer-col official-footer-col-right">
          <strong>{t("officialPortal")}</strong>
          <span>{isHindi ? "अधिकृत आपदा प्रबंधन कर्मी" : "Authorized Disaster Management Personnel"}</span>
          <span>{isHindi ? "सुरक्षित आपदा प्रबंधन प्रणाली" : "Secure Disaster Management System"}</span>
        </div>
      </div>

      <div className="official-footer-bottom">
        <span>{isHindi ? "© 2026 स्मार्ट आपदा प्रबंधन" : "© 2026 Smart Disaster Management"}</span>
        <span>{t("systemName")}</span>
        <span>{isHindi ? "स्मार्ट इंडिया हैकाथॉन 2026 | SIH26192" : "Smart India Hackathon 2026 | SIH26192"}</span>
      </div>
    </footer>
  );
}
