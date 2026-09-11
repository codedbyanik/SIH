import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Map,
  Home as HomeIcon,
  ClipboardCheck,
  Siren,
  FileBarChart,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useOfficialLanguage } from "../../official/i18n/useOfficialLanguage.js";
import { useOfficialAuth } from "../../official/context/OfficialAuthContext.jsx";
import { useNavigate } from "react-router-dom";

/* =========================================================
   OfficialSidebar
   Single left navigation for authenticated Official Portal
   pages. Rendered once by OfficialLayout. Collapses to an
   off-canvas drawer on smaller screens.
   ========================================================= */

export default function OfficialSidebar({ isOpen, onClose }) {
  const { t } = useOfficialLanguage();
  const { logout, user } = useOfficialAuth();
  const navigate = useNavigate();

  const mainItems = [
    { to: "/official/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/official/alerts", label: t("liveAlerts"), icon: Bell },
    { to: "/official/risk-map", label: t("riskMap"), icon: Map },
    { to: "/official/shelters", label: t("safeShelters"), icon: HomeIcon },
    { to: "/official/preparedness", label: t("preparedness"), icon: ClipboardCheck },
    { to: "/official/emergency", label: t("emergencyManagement"), icon: Siren },
    { to: "/official/reports", label: t("reports"), icon: FileBarChart },
    { to: "/official/users", label: t("officialsUsers"), icon: Users },
  ];

  const systemItems = [{ to: "/official/settings", label: t("settings"), icon: Settings }];

  const handleLogout = () => {
    logout();
    navigate("/official/login", { replace: true });
  };

  const renderLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={onClose}
      className={({ isActive }) => `official-sidebar-link ${isActive ? "is-active" : ""}`}
    >
      <item.icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <>
      {isOpen && (
        <div
          className="official-sidebar-scrim"
          onClick={onClose}
          role="presentation"
        />
      )}

      <aside
        id="official-sidebar"
        className={`official-sidebar ${isOpen ? "is-open" : ""}`}
        aria-label={t("officialPortal")}
      >
        <div className="official-sidebar-head">
          <span className="official-sidebar-title">{t("officialPortal")}</span>
          <button
            type="button"
            className="official-sidebar-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="official-sidebar-nav">
          <div className="official-sidebar-section">
            <span className="official-sidebar-heading">{t("mainMenu")}</span>
            {mainItems.map(renderLink)}
          </div>

          <div className="official-sidebar-section">
            <span className="official-sidebar-heading">{t("system")}</span>
            {systemItems.map(renderLink)}
          </div>
        </nav>

        <div className="official-sidebar-user">
          <div className="official-sidebar-user-info">
            <span className="official-sidebar-user-name">{user?.name || t("administrator")}</span>
            <span className="official-sidebar-user-role">{t("authorizedOfficial")}</span>
          </div>
          <button type="button" className="official-sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}