import { useNavigate, useLocation } from "react-router-dom";
import { Menu, RefreshCw, LogOut, Minus, Plus } from "lucide-react";
import { useOfficialLanguage } from "../../official/i18n/useOfficialLanguage.js";
import { useOfficialAuth } from "../../official/context/OfficialAuthContext.jsx";

/* =========================================================
   OfficialTopbar
   Single topbar for authenticated Official Portal pages:
   breadcrumb, language switch, font-size controls, refresh
   and logout. Rendered once by OfficialLayout.
   ========================================================= */

const PAGE_KEY_BY_PATH = {
  "/official/dashboard": "dashboard",
  "/official/alerts": "liveAlerts",
  "/official/risk-map": "riskMap",
  "/official/shelters": "safeShelters",
  "/official/preparedness": "preparedness",
  "/official/emergency": "emergencyManagement",
  "/official/reports": "reports",
  "/official/users": "officialsUsers",
  "/official/settings": "settings",
};

export default function OfficialTopbar({ onMenuClick }) {
  const { isHindi, changeLanguage, increaseFont, decreaseFont, t } = useOfficialLanguage();
  const { logout } = useOfficialAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageKey = PAGE_KEY_BY_PATH[location.pathname] || "dashboard";

  const handleLogout = () => {
    logout();
    navigate("/official/login", { replace: true });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="official-topbar">
      <div className="official-topbar-left">
        <button
          type="button"
          className="official-menu-toggle"
          onClick={onMenuClick}
          aria-label={t("mainMenu")}
          aria-controls="official-sidebar"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="official-breadcrumb">
          <span>{t("breadcrumbHome")}</span>
          <span aria-hidden="true">/</span>
          <span className="official-breadcrumb-current">{t(pageKey)}</span>
        </nav>
      </div>

      <div className="official-topbar-right">
        <div className="official-font-controls" role="group" aria-label={t("fontSize")}>
          <button type="button" onClick={decreaseFont} aria-label="A-" title="A-">
            <Minus size={12} aria-hidden="true" />
            <span>A</span>
          </button>
          <button type="button" className="official-font-mid" disabled aria-hidden="true">
            A
          </button>
          <button type="button" onClick={increaseFont} aria-label="A+" title="A+">
            <Plus size={12} aria-hidden="true" />
            <span>A</span>
          </button>
        </div>

        <div className="official-lang-switch" role="group" aria-label={t("language")}>
          <button
            type="button"
            className={!isHindi ? "is-active" : ""}
            onClick={() => changeLanguage("en")}
          >
            {t("english")}
          </button>
          <button
            type="button"
            className={isHindi ? "is-active" : ""}
            onClick={() => changeLanguage("hi")}
          >
            {t("hindi")}
          </button>
        </div>

        <button type="button" className="official-icon-button" onClick={handleRefresh} aria-label={t("refresh")} title={t("refresh")}>
          <RefreshCw size={16} aria-hidden="true" />
        </button>

        <button type="button" className="official-logout-button" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}
