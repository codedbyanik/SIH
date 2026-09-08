import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const [fontSize, setFontSize] = useState(
    Number(localStorage.getItem("fontSize")) || 100
  );

  const [highContrast, setHighContrast] = useState(
    localStorage.getItem("highContrast") === "true"
  );

  const [reduceMotion, setReduceMotion] = useState(
    localStorage.getItem("reduceMotion") === "true"
  );

  // Language settings
  useEffect(() => {
    localStorage.setItem("language", language);

    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  // Font-size settings — applied as a page-wide zoom so the control
  // scales every page/layout (citizen and official) consistently,
  // including elements that don't use rem-based font sizes, while
  // keeping buttons/forms/nav usable since everything scales together.
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);

    document.body.style.zoom = `${fontSize}%`;
  }, [fontSize]);

  // High contrast mode
  useEffect(() => {
    localStorage.setItem("highContrast", highContrast);
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // Reduced motion
  useEffect(() => {
    localStorage.setItem("reduceMotion", reduceMotion);
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  const increaseFont = () => {
    setFontSize((size) => Math.min(size + 10, 130));
  };

  const decreaseFont = () => {
    setFontSize((size) => Math.max(size - 10, 80));
  };

  const resetFont = () => {
    setFontSize(100);
  };

  const changeLanguage = (lang) => {
    if (lang === "en" || lang === "hi") {
      setLanguage(lang);
    }
  };

  const toggleHighContrast = () => {
    setHighContrast((value) => !value);
  };

  const toggleReduceMotion = () => {
    setReduceMotion((value) => !value);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        fontSize,
        increaseFont,
        decreaseFont,
        resetFont,
        highContrast,
        toggleHighContrast,
        reduceMotion,
        toggleReduceMotion,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside a LanguageProvider"
    );
  }

  return context;
}