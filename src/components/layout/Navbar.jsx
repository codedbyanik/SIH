import { NavLink, Link } from "react-router-dom";

import {
  Home,
  Bell,
  Map,
  ShieldCheck,
  ClipboardCheck,
  Siren,
  Menu,
  X,
  Accessibility,
} from "lucide-react";

import { useState } from "react";

import { useLanguage } from "../../LanguageContext.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { language } = useLanguage();

  const isHindi = language === "hi";

  const navItems = [
    {
      name: {
        en: "Home",
        hi: "होम",
      },
      path: "/",
      icon: Home,
    },
    {
      name: {
        en: "Alerts",
        hi: "अलर्ट",
      },
      path: "/alerts",
      icon: Bell,
    },
    {
      name: {
        en: "Risk Map",
        hi: "जोखिम मानचित्र",
      },
      path: "/risk-map",
      icon: Map,
    },
    {
      name: {
        en: "Safe Shelters",
        hi: "सुरक्षित आश्रय",
      },
      path: "/shelters",
      icon: ShieldCheck,
    },
    {
      name: {
        en: "Preparedness",
        hi: "तैयारी",
      },
      path: "/preparedness",
      icon: ClipboardCheck,
    },
    {
      name: {
        en: "Emergency Help",
        hi: "आपातकालीन सहायता",
      },
      path: "/emergency",
      icon: Siren,
    },
  ];

  // =========================================
  // OPEN EXISTING ACCESSIBILITY PANEL
  // =========================================
  const openAccessibility = () => {
    const accessibilityButton =
      document.querySelector(
        ".site-header .accessibility-button"
      );

    if (accessibilityButton) {
      accessibilityButton.click();
    }
  };

  return (
    <nav className="navbar">

      <div className="container navbar-container">

        {/* =========================================
            DESKTOP NAVIGATION
        ========================================= */}

        <div className="desktop-nav">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={17}
                  aria-hidden="true"
                />

                <span>
                  {isHindi
                    ? item.name.hi
                    : item.name.en}
                </span>
              </NavLink>
            );
          })}

        </div>


        {/* =========================================
            MOBILE ACCESSIBILITY BUTTON
            LEFT SIDE
        ========================================= */}

        <button
          type="button"
          className="mobile-accessibility-button"
          onClick={openAccessibility}
          aria-label={
            isHindi
              ? "पहुंच-योग्यता विकल्प"
              : "Accessibility options"
          }
          title={
            isHindi
              ? "पहुंच-योग्यता विकल्प"
              : "Accessibility options"
          }
        >
          <Accessibility
            size={22}
            aria-hidden="true"
          />
        </button>


        {/* =========================================
            MOBILE MENU BUTTON
            RIGHT SIDE
        ========================================= */}

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() =>
            setMenuOpen((open) => !open)
          }
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
            <X
              size={24}
              aria-hidden="true"
            />
          ) : (
            <Menu
              size={24}
              aria-hidden="true"
            />
          )}
        </button>

      </div>


      {/* =========================================
          MOBILE NAVIGATION PANEL
      ========================================= */}

      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className="mobile-nav"
        >

          {/* -----------------------------------------
              NAVIGATION LINKS
          ----------------------------------------- */}

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() =>
                  setMenuOpen(false)
                }
                className={({ isActive }) =>
                  `mobile-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >

                <Icon
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  {isHindi
                    ? item.name.hi
                    : item.name.en}
                </span>

              </NavLink>
            );
          })}


          {/* -----------------------------------------
              OFFICIAL LOGIN
              ONLY INSIDE MOBILE MENU
          ----------------------------------------- */}

          <Link
            to="/official/login"
            className="mobile-official-login"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            <ShieldCheck
              size={18}
              aria-hidden="true"
            />

            <span>
              {isHindi
                ? "आधिकारिक लॉगिन"
                : "Official Login"}
            </span>
          </Link>

        </div>
      )}

    </nav>
  );
}