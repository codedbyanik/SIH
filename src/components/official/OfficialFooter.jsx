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
          <span>{isHindi ? "गृह मंत्रालय" : "Ministry of Home Affairs"}</span>
          <span>{t("govOfIndia")}</span>
          <span>{t("division")}</span>
        </div>

        <div className="official-footer-col official-footer-col-right">
          <strong>{t("officialPortal")}</strong>
          <span>{isHindi ? "अधिकृत सरकारी कर्मी" : "Authorized Government Personnel"}</span>
          <span>{isHindi ? "सुरक्षित आपदा प्रबंधन प्रणाली" : "Secure Disaster Management System"}</span>
        </div>
      </div>

      <div className="official-footer-bottom">
        <span>{isHindi ? "© भारत सरकार" : "© Government of India"}</span>
        <span>{t("systemName")}</span>
        <span>{isHindi ? "आधिकारिक सरकारी पोर्टल" : "Official Government Portal"}</span>
      </div>
    </footer>
  );
}
