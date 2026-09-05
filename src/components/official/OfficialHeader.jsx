import { ShieldCheck, Accessibility } from "lucide-react";
import { useOfficialLanguage } from "../../official/i18n/useOfficialLanguage.js";

/* =========================================================
   OfficialHeader
   Single institutional identity header for the Official
   Portal: Government of India strip + Ministry branding.
   Rendered exactly once per page — on the login screen by
   itself, and inside OfficialLayout for authenticated pages.
   ========================================================= */

export default function OfficialHeader({ compact = false }) {
  const { isHindi, changeLanguage, t } = useOfficialLanguage();

  return (
    <header className="official-header" role="banner">
      {/* National tricolor accent strip */}
      <div className="official-tricolor-strip" aria-hidden="true" />

      {/* Government top strip */}
      <div className="official-header-strip">
        <div className="official-header-strip-inner">
          <div className="official-gov-identity">
            <span>{t("govOfIndiaHindi")}</span>
            <span aria-hidden="true">|</span>
            <span>{t("govOfIndia")}</span>
          </div>

          <div className="official-header-strip-tools">
            <button
              type="button"
              className={`official-lang-pill ${isHindi ? "is-active" : ""}`}
              onClick={() => changeLanguage("hi")}
            >
              {t("hindi")}
            </button>
            <button
              type="button"
              className={`official-lang-pill ${!isHindi ? "is-active" : ""}`}
              onClick={() => changeLanguage("en")}
            >
              {t("english")}
            </button>
            <button type="button" className="official-strip-tool" aria-label={t("accessibility")} title={t("accessibility")}>
              <Accessibility size={14} aria-hidden="true" />
              <span>{t("accessibility")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ministry branding */}
      <div className={`official-header-brand ${compact ? "is-compact" : ""}`}>
        <div className="official-header-brand-inner">
          <div className="official-brand-left">
            <img
              src="/assets/images/state-emblem.png"
              alt={isHindi ? "भारत का राजकीय चिन्ह" : "State Emblem of India"}
              className="official-emblem"
            />
            <div className="official-brand-text">
              <div className="official-brand-hindi">{t("ministryHindi")}</div>
              <div className="official-brand-english">{t("ministry")}</div>
              <div className="official-brand-system">{t("systemName")}</div>
              <div className="official-brand-division">{t("division")}</div>
            </div>
          </div>

          <div className="official-secure-indicator">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{t("secureGovPortal")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
