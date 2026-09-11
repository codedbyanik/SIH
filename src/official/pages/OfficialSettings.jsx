import { useState } from "react";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { useOfficialAuth } from "../context/OfficialAuthContext.jsx";

export default function OfficialSettings() {
  const { isHindi, changeLanguage, fontSize, increaseFont, decreaseFont, resetFont, t } = useOfficialLanguage();
  const { user } = useOfficialAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoLogout, setAutoLogout] = useState(true);

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("settingsTitle")}</h1>
          <p className="official-page-subtitle">{t("settingsSubtitle")}</p>
        </div>
      </div>

      <div className="official-settings-grid">
        <section className="official-panel">
          <h2>{t("profile")}</h2>
          <dl className="official-detail-list official-detail-list-stacked">
            <div>
              <dt>{t("name")}</dt>
              <dd>{user?.name || t("administrator")}</dd>
            </div>
            <div>
              <dt>{t("role")}</dt>
              <dd>{t("authorizedOfficial")}</dd>
            </div>
            <div>
              <dt>{t("officialIdEmail")}</dt>
              <dd>{user?.id}</dd>
            </div>
          </dl>
        </section>

        <section className="official-panel">
          <h2>{t("language")}</h2>
          <div className="official-lang-switch official-lang-switch-block" role="group" aria-label={t("language")}>
            <button type="button" className={!isHindi ? "is-active" : ""} onClick={() => changeLanguage("en")}>
              {t("english")}
            </button>
            <button type="button" className={isHindi ? "is-active" : ""} onClick={() => changeLanguage("hi")}>
              {t("hindi")}
            </button>
          </div>
        </section>

        <section className="official-panel">
          <h2>{t("fontSize")}</h2>
          <div className="official-font-settings">
            <button type="button" className="official-secondary-button" onClick={decreaseFont}>
              A-
            </button>
            <span className="official-font-value">{fontSize}%</span>
            <button type="button" className="official-secondary-button" onClick={increaseFont}>
              A+
            </button>
            <button type="button" className="official-link-button" onClick={resetFont}>
              {t("close") === "Close" ? "Reset" : "रीसेट करें"}
            </button>
          </div>
        </section>

        <section className="official-panel">
          <h2>{t("notificationPrefs")}</h2>
          <label className="official-toggle-row">
            <span>{t("emailAlerts")}</span>
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
          </label>
          <label className="official-toggle-row">
            <span>{t("smsAlerts")}</span>
            <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
          </label>
        </section>

        <section className="official-panel">
          <h2>{t("sessionSettings")}</h2>
          <label className="official-toggle-row">
            <span>{t("autoLogout")}</span>
            <input type="checkbox" checked={autoLogout} onChange={(e) => setAutoLogout(e.target.checked)} />
          </label>
        </section>

        <section className="official-panel">
          <h2>{t("security")}</h2>
          <p className="official-muted-text">
            {isHindi
              ? "यह एक डेमो प्रोजेक्ट है — यहां कोई वास्तविक सुरक्षा तंत्र लागू नहीं है।"
              : "This is a demo project — no production-grade security is implemented here."}
          </p>
        </section>
      </div>
    </div>
  );
}
