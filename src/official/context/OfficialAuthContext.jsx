import { createContext, useContext, useEffect, useState } from "react";

/* =========================================================
   OFFICIAL PORTAL — DEMO AUTHENTICATION CONTEXT
   Frontend-only demo authentication for this student project.
   This is NOT production-grade security. Credentials and
   sessions are stored in localStorage purely to survive
   page refreshes during the demo.
   ========================================================= */

const OfficialAuthContext = createContext(null);

const STORAGE_KEY = "official_auth_session";

// Demo credentials for the Official Portal
export const DEMO_CREDENTIALS = {
  id: "admin@ffews.gov.in",
  password: "Admin@123",
};

const DEMO_USER = {
  name: "Administrator",
  role: "Authorized Official",
  id: DEMO_CREDENTIALS.id,
};

export function OfficialAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (id, password) => {
    if (id.trim().toLowerCase() === DEMO_CREDENTIALS.id.toLowerCase() && password === DEMO_CREDENTIALS.password) {
      setUser(DEMO_USER);
      return { success: true };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <OfficialAuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </OfficialAuthContext.Provider>
  );
}

export function useOfficialAuth() {
  const context = useContext(OfficialAuthContext);
  if (!context) {
    throw new Error("useOfficialAuth must be used inside an OfficialAuthProvider");
  }
  return context;
}
