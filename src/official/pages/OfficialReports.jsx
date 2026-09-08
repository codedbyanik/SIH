import { useMemo, useState } from "react";
import { Eye, RefreshCw, Download, FileBarChart } from "lucide-react";
import { useOfficialLanguage } from "../i18n/useOfficialLanguage.js";
import { reports, alerts as seedAlerts } from "../data/officialMockData.js";
import { useAlertsStore } from "../../data/AlertsContext.jsx";
import StatusBadge from "../../components/official/StatusBadge.jsx";

export default function OfficialReports() {
  const { isHindi, t } = useOfficialLanguage();
  const { createdAlerts } = useAlertsStore();

  const [generatingId, setGeneratingId] = useState(null);
  const [lastGeneratedOverrides, setLastGeneratedOverrides] = useState({});
  const [viewingReport, setViewingReport] = useState(null);

  // Single source of truth for "current alert data": the existing
  // prototype alerts plus anything created via Official → Create Alert.
  const allAlerts = useMemo(() => [...createdAlerts, ...seedAlerts], [createdAlerts]);

  const stats = useMemo(() => {
    const bySeverity = {};
    const byStatus = {};

    allAlerts.forEach((alert) => {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      byStatus[alert.status] = (byStatus[alert.status] || 0) + 1;
    });

    return { total: allAlerts.length, bySeverity, byStatus };
  }, [allAlerts]);

  const handleView = (report) => {
    setViewingReport(report);
  };

  const closeView = () => setViewingReport(null);

  const handleGenerate = (id) => {
    setGeneratingId(id);
    window.setTimeout(() => {
      setLastGeneratedOverrides((current) => ({ ...current, [id]: t("justNow") }));
      setGeneratingId(null);
    }, 900);
  };

  const buildReportFileContent = (report) => {
    const lines = [];
    const name = isHindi ? report.nameHi : report.nameEn;

    lines.push(name);
    lines.push(`${t("frequency")}: ${report.frequency}`);
    lines.push(`${t("lastGenerated")}: ${lastGeneratedOverrides[report.id] || report.lastGenerated}`);
    lines.push("");
    lines.push(`${t("totalAlerts")}: ${stats.total}`);
    lines.push("");
    lines.push(
      [t("alertId"), t("location"), t("type"), t("severity"), t("status"), t("issued")].join(",")
    );

    allAlerts.forEach((alert) => {
      const location = (isHindi ? alert.locationHi : alert.locationEn) || "";
      lines.push(
        [alert.id, `"${location}"`, `"${alert.type}"`, alert.severity, alert.status, alert.issued].join(",")
      );
    });

    return lines.join("\n");
  };

  const handleDownload = (report) => {
    const content = buildReportFileContent(report);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                  <td>{lastGeneratedOverrides[report.id] || report.lastGenerated}</td>
                  <td className="official-table-action-col">
                    <div className="official-report-actions">
                      <button
                        type="button"
                        className="official-icon-text-button"
                        title={t("view")}
                        onClick={() => handleView(report)}
                      >
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
                      <button
                        type="button"
                        className="official-icon-text-button"
                        title={t("download")}
                        onClick={() => handleDownload(report)}
                      >
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

      {viewingReport && (
        <div className="official-modal-scrim" role="presentation" onClick={closeView}>
          <div
            className="official-modal official-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-view-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="official-modal-head">
              <h2 id="report-view-heading">{t("reportViewTitle")}</h2>
            </div>

            <p className="official-report-name">
              <FileBarChart size={15} aria-hidden="true" />
              {isHindi ? viewingReport.nameHi : viewingReport.nameEn}
            </p>

            <dl className="official-detail-list">
              <div>
                <dt>{t("frequency")}</dt>
                <dd>{viewingReport.frequency}</dd>
              </div>
              <div>
                <dt>{t("lastGenerated")}</dt>
                <dd>{lastGeneratedOverrides[viewingReport.id] || viewingReport.lastGenerated}</dd>
              </div>
              <div>
                <dt>{t("totalAlerts")}</dt>
                <dd>{stats.total}</dd>
              </div>
            </dl>

            <h3 className="official-report-name">{t("alertsBySeverity")}</h3>
            <div className="official-report-actions">
              {Object.entries(stats.bySeverity).map(([severity, count]) => (
                <StatusBadge key={severity} label={`${t(severity.toLowerCase())}: ${count}`} tone={severity.toLowerCase()} />
              ))}
            </div>

            <h3 className="official-report-name">{t("alertsByStatus")}</h3>
            <div className="official-report-actions">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <StatusBadge key={status} label={`${t(status.toLowerCase())}: ${count}`} tone={status.toLowerCase()} />
              ))}
            </div>

            <h3 className="official-report-name">{t("includedAlerts")}</h3>
            <div className="official-table-wrap">
              <table className="official-table">
                <thead>
                  <tr>
                    <th>{t("alertId")}</th>
                    <th>{t("location")}</th>
                    <th>{t("severity")}</th>
                    <th>{t("status")}</th>
                    <th>{t("issued")}</th>
                  </tr>
                </thead>
                <tbody>
                  {allAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="official-table-mono">{alert.id}</td>
                      <td>{isHindi ? alert.locationHi : alert.locationEn}</td>
                      <td>
                        <StatusBadge label={t(alert.severity.toLowerCase())} tone={alert.severity.toLowerCase()} />
                      </td>
                      <td>
                        <StatusBadge label={t(alert.status.toLowerCase())} tone={alert.status.toLowerCase()} />
                      </td>
                      <td>{alert.issued}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="official-modal-actions">
              <button type="button" className="official-secondary-button" onClick={() => handleDownload(viewingReport)}>
                <Download size={14} aria-hidden="true" />
                {t("download")}
              </button>
              <button type="button" className="official-primary-button" onClick={closeView}>
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
