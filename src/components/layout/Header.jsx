import { useEffect, useRef, useState } from "react";
import {
  Search,
  Accessibility,
  Volume2,
  VolumeX,
  Contrast,
  Waves,
  Type,
  X,
} from "lucide-react";

import { useLanguage } from "../../LanguageContext.jsx";

export default function Header() {
  const {
    language,
    changeLanguage,
    increaseFont,
    decreaseFont,
    resetFont,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
  } = useLanguage();

  const isHindi = language === "hi";

  const [a11yOpen, setA11yOpen] = useState(false);
  const a11yRef = useRef(null);

  // ================================
  // CLOSE ACCESSIBILITY PANEL ON
  // OUTSIDE CLICK / ESCAPE
  // ================================
  useEffect(() => {
    if (!a11yOpen) return;

    const handleClickOutside = (e) => {
      if (a11yRef.current && !a11yRef.current.contains(e.target)) {
        setA11yOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setA11yOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [a11yOpen]);

  // ================================
  // SCREEN READER
  // ================================
  const speakPage = () => {
    if (!("speechSynthesis" in window)) {
      alert(
        isHindi
          ? "इस ब्राउज़र में स्क्रीन रीडर समर्थित नहीं है।"
          : "Screen reader is not supported by this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const mainContent = document.getElementById("main-content");

    const text = mainContent
      ? mainContent.innerText
      : document.body.innerText;

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = isHindi ? "hi-IN" : "en-IN";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  };

  // ================================
  // STOP SCREEN READER
  // ================================
  const stopScreenReader = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // ================================
  // SKIP TO MAIN CONTENT
  // ================================
  const handleSkipToContent = (e) => {
    e.preventDefault();

    const mainContent = document.getElementById("main-content");

    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");

      mainContent.focus();

      mainContent.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <header className="site-header">
      {/* =========================================
          NATIONAL TRICOLOR ACCENT STRIP
      ========================================= */}
      <div className="tricolor-strip" aria-hidden="true" />

      {/* =========================================
          GOVERNMENT TOP BAR
      ========================================= */}
      <div className="gov-bar">
        <div className="container gov-bar-content">

          {/* Government Identity */}
          <div className="gov-identity">
            <span>भारत सरकार</span>
            <span>|</span>
            <span>Government of India</span>
          </div>

          {/* Government Tools */}
          <div className="gov-tools">

            {/* Skip to Main Content */}
            <a
              href="#main-content"
              onClick={handleSkipToContent}
            >
              {isHindi
                ? "मुख्य सामग्री पर जाएं"
                : "Skip to Main Content"}
            </a>

            {/* Hindi */}
            <button
              type="button"
              className={`language-button ${
                isHindi ? "active" : ""
              }`}
              onClick={() => changeLanguage("hi")}
            >
              हिन्दी
            </button>

            {/* English */}
            <button
              type="button"
              className={`language-button ${
                !isHindi ? "active" : ""
              }`}
              onClick={() => changeLanguage("en")}
            >
              English
            </button>

          </div>
        </div>
      </div>

      {/* =========================================
          MAIN BRANDING
      ========================================= */}
      <div className="branding">
        <div className="container branding-content">

          {/* Left Branding */}
          <div className="brand-section">

            {/* Government Emblem */}
            <img
              src="/assets/images/state-emblem.png"
              alt={
                isHindi
                  ? "भारत का राजकीय चिन्ह"
                  : "State Emblem of India"
              }
              className="state-emblem"
            />

            {/* Branding Text */}
            <div className="brand-text">

              {/* Hindi Department Name */}
              <div className="hindi-title">
                गृह मंत्रालय
              </div>

              {/* Official English Department Name */}
              <div className="english-title">
                MINISTRY OF HOME AFFAIRS
              </div>

              {/* Project Name */}
              <div className="project-title">
                {isHindi
                  ? "अचानक बाढ़ पूर्व चेतावनी प्रणाली"
                  : "Flash Flood Early Warning System"}
              </div>

              {/* Division */}
              <div className="project-subtitle">
                {isHindi
                  ? "आपदा प्रबंधन प्रभाग"
                  : "Disaster Management Division"}
              </div>

            </div>
          </div>

          {/* Right Branding Actions */}
          <div className="brand-actions">

            {/* Search */}
            <button
              type="button"
              className="search-button"
              aria-label={
                isHindi
                  ? "खोजें"
                  : "Search"
              }
              title={
                isHindi
                  ? "खोजें"
                  : "Search"
              }
            >
              <Search size={20} />
            </button>

            {/* Accessibility */}
            <div className="a11y-wrap" ref={a11yRef}>
              <button
                type="button"
                className={`accessibility-button ${a11yOpen ? "is-active" : ""}`}
                aria-haspopup="true"
                aria-expanded={a11yOpen}
                aria-controls="a11y-panel"
                onClick={() => setA11yOpen((open) => !open)}
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
                <Accessibility size={19} />
                <span>
                  {isHindi
                    ? "पहुंच-योग्यता"
                    : "Accessibility"}
                </span>
              </button>

              {a11yOpen && (
                <div
                  id="a11y-panel"
                  className="a11y-panel"
                  role="region"
                  aria-label={
                    isHindi
                      ? "पहुंच-योग्यता विकल्प"
                      : "Accessibility options"
                  }
                >
                  <div className="a11y-panel-head">
                    <span>
                      {isHindi ? "पहुंच-योग्यता विकल्प" : "Accessibility Options"}
                    </span>
                    <button
                      type="button"
                      className="a11y-close"
                      onClick={() => setA11yOpen(false)}
                      aria-label={isHindi ? "बंद करें" : "Close"}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Text size */}
                  <div className="a11y-option">
                    <span className="a11y-option-label">
                      <Type size={16} aria-hidden="true" />
                      {isHindi ? "टेक्स्ट आकार" : "Text Size"}
                    </span>
                    <div className="a11y-font-group">
                      <button type="button" onClick={decreaseFont} aria-label={isHindi ? "छोटा करें" : "Decrease"}>
                        A-
                      </button>
                      <button type="button" onClick={resetFont} aria-label={isHindi ? "सामान्य" : "Reset"}>
                        A
                      </button>
                      <button type="button" onClick={increaseFont} aria-label={isHindi ? "बड़ा करें" : "Increase"}>
                        A+
                      </button>
                    </div>
                  </div>

                  {/* High contrast */}
                  <button
                    type="button"
                    className="a11y-toggle-row"
                    onClick={toggleHighContrast}
                    aria-pressed={highContrast}
                  >
                    <span className="a11y-option-label">
                      <Contrast size={16} aria-hidden="true" />
                      {isHindi ? "उच्च कंट्रास्ट मोड" : "High Contrast Mode"}
                    </span>
                    <span className={`a11y-switch ${highContrast ? "is-on" : ""}`}>
                      <span className="a11y-switch-dot" />
                    </span>
                  </button>

                  {/* Reduce motion */}
                  <button
                    type="button"
                    className="a11y-toggle-row"
                    onClick={toggleReduceMotion}
                    aria-pressed={reduceMotion}
                  >
                    <span className="a11y-option-label">
                      <Waves size={16} aria-hidden="true" />
                      {isHindi ? "गति कम करें" : "Reduce Motion"}
                    </span>
                    <span className={`a11y-switch ${reduceMotion ? "is-on" : ""}`}>
                      <span className="a11y-switch-dot" />
                    </span>
                  </button>

                  {/* Screen reader */}
                  <div className="a11y-option">
                    <span className="a11y-option-label">
                      <Volume2 size={16} aria-hidden="true" />
                      {isHindi ? "पृष्ठ पढ़ें" : "Read Page Aloud"}
                    </span>
                    <div className="a11y-font-group">
                      <button type="button" onClick={speakPage} aria-label={isHindi ? "पढ़ना शुरू करें" : "Start reading"}>
                        <Volume2 size={14} />
                      </button>
                      <button type="button" onClick={stopScreenReader} aria-label={isHindi ? "पढ़ना बंद करें" : "Stop reading"}>
                        <VolumeX size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="a11y-note">
                    {isHindi
                      ? "आपकी प्राथमिकताएं इस डिवाइस पर सुरक्षित रहती हैं।"
                      : "Your preferences are saved on this device."}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
