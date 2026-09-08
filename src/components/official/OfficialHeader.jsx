import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Accessibility, Minus, Plus, RotateCcw, X, Type } from "lucide-react";
import { useOfficialLanguage } from "../../official/i18n/useOfficialLanguage.js";

/* =========================================================
   OfficialHeader
   Single header for the Official Portal, visually aligned
   with the Citizen Portal branding (project logo + Smart
   Disaster Management identity) and exposing every existing
   accessibility control through one Accessibility button.
   Rendered exactly once per page — on the login screen by
   itself, and inside OfficialLayout for authenticated pages.
   ========================================================= */

export default function OfficialHeader({ compact = false }) {
  const { isHindi, changeLanguage, increaseFont, decreaseFont, resetFont, t } = useOfficialLanguage();

  const [a11yOpen, setA11yOpen] = useState(false);
  const a11yRef = useRef(null);

  useEffect(() => {
    if (!a11yOpen) return undefined;

    const handleClickOutside = (e) => {
      if (a11yRef.current && !a11yRef.current.contains(e.target)) {
        setA11yOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setA11yOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [a11yOpen]);

  return (
    <header className="official-header" role="banner">
      {/* National tricolor accent strip */}
      <div className="official-tricolor-strip" aria-hidden="true" />

      {/* Top strip */}
      <div className="official-header-strip">
        <div className="official-header-strip-inner">
          <div className="official-gov-identity">
            <span>{t("smartDisasterManagement")}</span>
            <span aria-hidden="true">|</span>
            <span>{t("earlyWarningSystemShort")}</span>
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

            {/* =====================================
                ACCESSIBILITY (single button + menu)
            ===================================== */}
            <div className="official-a11y-wrap" ref={a11yRef}>
              <button
                type="button"
                className={`official-strip-tool official-accessibility-button ${a11yOpen ? "is-active" : ""}`}
                aria-haspopup="true"
                aria-expanded={a11yOpen}
                aria-controls="official-a11y-panel"
                aria-label={t("accessibility")}
                title={t("accessibility")}
                onClick={() => setA11yOpen((open) => !open)}
              >
                <Accessibility size={14} aria-hidden="true" />
                <span>{t("accessibility")}</span>
              </button>

              {a11yOpen && (
                <div
                  id="official-a11y-panel"
                  className="official-a11y-panel"
                  role="region"
                  aria-label={t("accessibilityOptions")}
                >
                  <div className="official-a11y-panel-head">
                    <span>{t("accessibilityOptions")}</span>
                    <button
                      type="button"
                      className="official-a11y-close"
                      onClick={() => setA11yOpen(false)}
                      aria-label={t("close")}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="official-a11y-option">
                    <span className="official-a11y-option-label">
                      <Type size={16} aria-hidden="true" />
                      {t("fontSize")}
                    </span>

                    <div className="official-a11y-font-group">
                      <button type="button" onClick={decreaseFont} aria-label={t("decrease")}>
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={resetFont} aria-label={t("reset")}>
                        <RotateCcw size={12} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={increaseFont} aria-label={t("increase")}>
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="official-a11y-note">{t("preferencesSaved")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Branding — matches Citizen Portal */}
      <div className={`official-header-brand ${compact ? "is-compact" : ""}`}>
        <div className="official-header-brand-inner">
          <div className="official-brand-left">
            <img
              src="/assets/images/logo.png"
              alt="Smart Disaster Management and Flash Flood Early Warning System"
              className="official-logo"
            />
            <div className="official-brand-text">
              <div className="official-brand-hindi">{t("brandTitleMain")}</div>
              <div className="official-brand-english">{t("brandTitleSub")}</div>
              <div className="official-brand-system">{t("systemName")}</div>
              <div className="official-brand-division">{t("brandTagline")}</div>
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
