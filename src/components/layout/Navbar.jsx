import { Link, NavLink } from "react-router-dom";
import { Home, Bell, Map, ShieldCheck, ClipboardCheck, Siren, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../LanguageContext.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { language } = useLanguage();

  const isHindi = language === "hi";

  const navItems = [
    {
      name: { en: "Home", hi: "होम" },
      path: "/",
      icon: Home,
    },
    {
      name: { en: "Alerts", hi: "अलर्ट" },
      path: "/alerts",
      icon: Bell,
    },
    {
      name: { en: "Risk Map", hi: "जोखिम मानचित्र" },
      path: "/risk-map",
      icon: Map,
    },
    {
      name: { en: "Safe Shelters", hi: "सुरक्षित आश्रय" },
      path: "/shelters",
      icon: ShieldCheck,
    },
    {
      name: { en: "Preparedness", hi: "तैयारी" },
      path: "/preparedness",
      icon: ClipboardCheck,
    },
    {
      name: { en: "Emergency Help", hi: "आपातकालीन सहायता" },
      path: "/emergency",
      icon: Siren,
    },
  ];

  return (
    <nav className="navbar">

      <div className="container navbar-container">

        {/* =========================================
            DESKTOP NAVIGATION (HORIZONTAL)
        ========================================= */}
        <div className="desktop-nav">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={17} aria-hidden="true" />
              {isHindi ? item.name.hi : item.name.en}
            </NavLink>
          ))}

        </div>

        

        {/* =========================================
            MOBILE MENU BUTTON
        ========================================= */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={
            menuOpen
              ? isHindi
                ? "मेनू बंद करें"
                : "Close navigation menu"
              : isHindi
                ? "नेविगेशन मेनू खोलें"
                : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>

      {/* =========================================
          MOBILE NAVIGATION
      ========================================= */}
      {menuOpen && (
        <div id="mobile-nav-panel" className="mobile-nav">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `mobile-nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <item.icon size={18} aria-hidden="true" />
              {isHindi ? item.name.hi : item.name.en}
            </NavLink>
          ))}

          <Link
            to="/official/login"
            onClick={() => setMenuOpen(false)}
            className="mobile-official-login"
          >
            {isHindi
              ? "आधिकारिक लॉगिन"
              : "Official Login"}
          </Link>

        </div>
      )}

    </nav>
  );
}
