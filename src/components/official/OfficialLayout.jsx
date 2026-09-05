import { useState } from "react";
import { Outlet } from "react-router-dom";
import OfficialHeader from "./OfficialHeader.jsx";
import OfficialSidebar from "./OfficialSidebar.jsx";
import OfficialTopbar from "./OfficialTopbar.jsx";
import OfficialFooter from "./OfficialFooter.jsx";

/* =========================================================
   OfficialLayout
   The ONE layout shell for every authenticated Official
   Portal page. Renders the government header, sidebar,
   topbar and footer exactly once; individual pages only
   render their own content via <Outlet />.
   ========================================================= */

export default function OfficialLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="official-shell">
      <OfficialHeader compact />

      <div className="official-body">
        <OfficialSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="official-main">
          <OfficialTopbar onMenuClick={() => setSidebarOpen(true)} />

          <main id="official-main-content" className="official-content">
            <Outlet />
          </main>

          <OfficialFooter />
        </div>
      </div>
    </div>
  );
}
