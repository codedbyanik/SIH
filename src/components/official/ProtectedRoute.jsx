import { Navigate, useLocation } from "react-router-dom";
import { useOfficialAuth } from "../../official/context/OfficialAuthContext.jsx";

/* =========================================================
   ProtectedRoute
   Guards all authenticated Official Portal routes. Redirects
   to /official/login when no session is present, preserving
   the originally requested location.
   ========================================================= */

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useOfficialAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/official/login" replace state={{ from: location }} />;
  }

  return children;
}
