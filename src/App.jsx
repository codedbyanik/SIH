import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import { useActiveLocation } from "./LocationContext.jsx";
import LocationGate from "./components/location/LocationGate.jsx";

import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import RiskMap from "./pages/RiskMap";
import Shelters from "./pages/Shelters";
import Preparedness from "./pages/Preparedness";
import Emergency from "./pages/Emergency";

// Official Government Portal (isolated section)
import { OfficialAuthProvider } from "./official/context/OfficialAuthContext.jsx";
import OfficialLogin from "./official/pages/OfficialLogin.jsx";
import OfficialDashboard from "./official/pages/OfficialDashboard.jsx";
import OfficialAlerts from "./official/pages/OfficialAlerts.jsx";
import OfficialRiskMap from "./official/pages/OfficialRiskMap.jsx";
import OfficialShelters from "./official/pages/OfficialShelters.jsx";
import OfficialPreparedness from "./official/pages/OfficialPreparedness.jsx";
import OfficialEmergency from "./official/pages/OfficialEmergency.jsx";
import OfficialReports from "./official/pages/OfficialReports.jsx";
import OfficialUsers from "./official/pages/OfficialUsers.jsx";
import OfficialSettings from "./official/pages/OfficialSettings.jsx";
import OfficialLayout from "./components/official/OfficialLayout.jsx";
import ProtectedRoute from "./components/official/ProtectedRoute.jsx";
import "./official/styles/official.css";

function CitizenLayout({ children }) {
  const { hasLocation, isChangingLocation } = useActiveLocation();

  // Ask for a location once, before any citizen page is shown, and
  // again if the user explicitly asks to change it. Header/Navbar/
  // Footer stay exactly as before either way.
  const showLocationGate = !hasLocation || isChangingLocation;

  return (
    <>
      <Header />
      <Navbar />
      <main>{showLocationGate ? <LocationGate /> : children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <OfficialAuthProvider>
        <Routes>
          {/* =========================================
              CITIZEN PORTAL (unchanged)
          ========================================= */}
          <Route path="/" element={<CitizenLayout><Home /></CitizenLayout>} />
          <Route path="/alerts" element={<CitizenLayout><Alerts /></CitizenLayout>} />
          <Route path="/risk-map" element={<CitizenLayout><RiskMap /></CitizenLayout>} />
          <Route path="/shelters" element={<CitizenLayout><Shelters /></CitizenLayout>} />
          <Route path="/preparedness" element={<CitizenLayout><Preparedness /></CitizenLayout>} />
          <Route path="/emergency" element={<CitizenLayout><Emergency /></CitizenLayout>} />

          {/* =========================================
              OFFICIAL GOVERNMENT PORTAL (isolated)
          ========================================= */}
          <Route path="/official/login" element={<OfficialLogin />} />

          <Route
            path="/official"
            element={
              <ProtectedRoute>
                <OfficialLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<OfficialDashboard />} />
            <Route path="alerts" element={<OfficialAlerts />} />
            <Route path="risk-map" element={<OfficialRiskMap />} />
            <Route path="shelters" element={<OfficialShelters />} />
            <Route path="preparedness" element={<OfficialPreparedness />} />
            <Route path="emergency" element={<OfficialEmergency />} />
            <Route path="reports" element={<OfficialReports />} />
            <Route path="users" element={<OfficialUsers />} />
            <Route path="settings" element={<OfficialSettings />} />
          </Route>
        </Routes>
      </OfficialAuthProvider>
    </BrowserRouter>
  );
}

export default App;