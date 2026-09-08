import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./LanguageContext.jsx";
import { LocationProvider } from "./LocationContext.jsx";
import { AlertsProvider } from "./data/AlertsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <LocationProvider>
        <AlertsProvider>
          <App />
        </AlertsProvider>
      </LocationProvider>
    </LanguageProvider>
  </StrictMode>
);