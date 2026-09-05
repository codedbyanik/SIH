import { useState } from "react";
import { Eye, RefreshCw, Download, FileBarChart } from "lucide-react";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { reports } from "../data/officialMockData.js";

export default function OfficialReports() {
  const { isHindi, t } = useOfficialLanguage();
  const [generatingId, setGeneratingId] = useState(null);

  const handleGenerate = (id) => {
    setGeneratingId(id);
    window.setTimeout(() => setGeneratingId(null), 900);
  };

  return (
    <div className="official-page">
      <div className="official-page-head">
        <div>
          <h1>{t("reportsTitle")}</h1>
          <p className="official-page-subtitle">{t("reportsSubtitle")}</p>
        </div>
      </div>

      <section className="official-panel">
        <div className="official-table-wrap">
          <table className="official-table">
            <thead>
              <tr>
                <th>{t("reportName")}</th>
                <th>{t("frequency")}</th>
                <th>{t("lastGenerated")}</th>
                <th className="official-table-action-col">{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <span className="official-report-name">
                      <FileBarChart size={15} aria-hidden="true" />
                      {isHindi ? report.nameHi : report.nameEn}
                    </span>
                  </td>
                  <td>{report.frequency}</td>
                  <td>{report.lastGenerated}</td>
                  <td className="official-table-action-col">
                    <div className="official-report-actions">
                      <button type="button" className="official-icon-text-button" title={t("view")}>
                        <Eye size={14} aria-hidden="true" />
                        {t("view")}
                      </button>
                      <button
                        type="button"
                        className="official-icon-text-button"
                        onClick={() => handleGenerate(report.id)}
                        title={t("generate")}
                      >
                        <RefreshCw size={14} className={generatingId === report.id ? "official-spin" : ""} aria-hidden="true" />
                        {generatingId === report.id ? t("loading") : t("generate")}
                      </button>
                      <button type="button" className="official-icon-text-button" title={t("download")}>
                        <Download size={14} aria-hidden="true" />
                        {t("download")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
