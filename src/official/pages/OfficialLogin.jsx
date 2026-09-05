import { useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, KeyRound } from "lucide-react";
import OfficialHeader from "../../components/official/OfficialHeader.jsx";
import { useOfficialAuth, DEMO_CREDENTIALS } from "../context/OfficialAuthContext.jsx";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";

/* =========================================================
   OfficialLogin
   Standalone route (not wrapped by OfficialLayout — no
   sidebar/topbar on this page). Renders exactly one
   OfficialHeader and one login card.
   ========================================================= */

export default function OfficialLogin() {
  const { isAuthenticated, login } = useOfficialAuth();
  const { t } = useOfficialLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [officialId, setOfficialId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/official/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Simulated network delay for a realistic demo login experience
    window.setTimeout(() => {
      const result = login(officialId, password);
      setSubmitting(false);

      if (result.success) {
        navigate("/official/dashboard", { replace: true });
      } else {
        setError(t("invalidCredentials"));
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    setOfficialId(DEMO_CREDENTIALS.id);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  };

  return (
    <div className="official-login-page">
      <OfficialHeader />

      <main id="main-content" className="official-login-main">
        <div className="official-login-grid">
          {/* LEFT — institutional context */}
          <section className="official-login-info">
            <span className="official-portal-badge">{t("officialPortal")}</span>
            <h1>{t("officialLogin")}</h1>
            <p className="official-login-desc">{t("officialLoginDesc")}</p>

            <div className="official-login-notice">
              <ShieldAlert size={18} aria-hidden="true" />
              <div>
                <strong>{t("authRequired")}</strong>
                <p>{t("authRequiredDesc")}</p>
              </div>
            </div>

            <p className="official-login-secure-note">{t("secureInfo")}</p>
          </section>

          {/* RIGHT — login card */}
          <section className="official-login-card" aria-labelledby="official-login-heading">
            <div className="official-login-card-head">
              <span className="official-login-icon">
                <Lock size={20} aria-hidden="true" />
              </span>
              <span className="official-login-card-eyebrow">{t("officialPortal")}</span>
              <h2 id="official-login-heading">{t("officialLogin")}</h2>
            </div>

            <form className="official-login-form" onSubmit={handleSubmit} noValidate>
              <div className="official-form-field">
                <label htmlFor="official-id">{t("officialIdEmail")}</label>
                <input
                  id="official-id"
                  type="text"
                  autoComplete="username"
                  value={officialId}
                  onChange={(e) => setOfficialId(e.target.value)}
                  required
                />
              </div>

              <div className="official-form-field">
                <label htmlFor="official-password">{t("password")}</label>
                <div className="official-password-wrap">
                  <input
                    id="official-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="official-password-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="official-form-row">
                <label className="official-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>{t("rememberMe")}</span>
                </label>

                <button type="button" className="official-link-button">
                  {t("forgotPassword")}
                </button>
              </div>

              {error && (
                <p className="official-form-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="official-submit-button" disabled={submitting}>
                {submitting ? t("signingIn") : t("signIn")}
              </button>
            </form>

            <div className="official-demo-section">
              <span className="official-demo-label">{t("demoLogin")}</span>
              <button type="button" className="official-demo-button" onClick={fillDemoCredentials}>
                <KeyRound size={14} aria-hidden="true" />
                {t("useDemoCredentials")}
              </button>
            </div>

            <Link to="/" className="official-back-link">
              <ArrowLeft size={14} aria-hidden="true" />
              {t("backToCitizen")}
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
