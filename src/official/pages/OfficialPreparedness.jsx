import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { preparedness } from "../data/officialMockData.js";

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  steady: Minus,
};

export default function OfficialPreparedness() {
  const { isHindi, t } = useOfficialLanguage();

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("preparednessTitle")}</h1>
          <p className="official-page-subtitle">{t("preparednessSubtitle")}</p>
        </div>
      </div>

      <section className="official-panel official-preparedness-score">
        <div>
          <span className="official-score-label">{t("overallScore")}</span>
          <span className="official-score-value">{preparedness.overallScore}%</span>
        </div>
        <div className="official-score-ring" style={{ "--score": preparedness.overallScore }} aria-hidden="true" />
      </section>

      <section className="official-panel">
        <div className="official-panel-head">
          <h2>{t("preparednessTitle")}</h2>
        </div>

        <div className="official-preparedness-categories">
          {preparedness.categories.map((cat) => (
            <div key={cat.id} className="official-preparedness-category">
              <div className="official-preparedness-category-head">
                <span>{isHindi ? cat.labelHi : cat.labelEn}</span>
                <span>{cat.score}%</span>
              </div>
              <div className="official-progress-bar">
                <div className="official-progress-fill" style={{ width: `${cat.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="official-panel">
        <div className="official-panel-head">
          <h2>{t("districtPreparedness")}</h2>
        </div>

        <div className="official-table-wrap">
          <table className="official-table">
            <thead>
              <tr>
                <th>{t("district")}</th>
                <th>{t("overallScore")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {preparedness.districts.map((d) => {
                const TrendIcon = TREND_ICON[d.trend];
                return (
                  <tr key={d.id}>
                    <td>{isHindi ? d.nameHi : d.nameEn}</td>
                    <td>{d.score}%</td>
                    <td>
                      <span className={`official-trend official-trend-${d.trend}`}>
                        <TrendIcon size={14} aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
