# FFEWS — Flash Flood Early Warning System

A web platform built for **Smart India Hackathon (SIH)** that provides early warning
and disaster-preparedness information for flash floods and landslides in hilly
regions. The project ships two isolated portals in a single React app:

- **Citizen Portal** — public-facing site for checking local risk, live alerts,
  nearby shelters, preparedness guides, and emergency contacts.
- **Official Portal** — authenticated dashboard for government/disaster-management
  officials to monitor districts, manage alerts, shelters, and reports.

> ⚠️ This is a hackathon/student project. Authentication, data, and maps are
> demo/mock implementations meant to showcase the UX and workflow — **not**
> production-grade or connected to live sensor/weather feeds.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Official Portal Demo Login](#official-portal-demo-login)
- [Routing Overview](#routing-overview)
- [Notes & Limitations](#notes--limitations)
- [Roadmap Ideas](#roadmap-ideas)

---

## Features

### Citizen Portal
- **Home** — risk-check widget (state/district/village), quick facts, and
  navigation into all citizen features.
- **Alerts** — live-style flash flood / landslide / weather alert feed with
  severity levels and expandable details.
- **Risk Map** — interactive map (Leaflet/OpenStreetMap) with color-coded
  markers for flood, landslide, and weather risk zones across monitored
  hill districts (Darjeeling, Kurseong, Kalimpong, Gangtok, Manali, etc.).
- **Shelters** — searchable list of nearby relief shelters with capacity,
  facilities (water, medical, accessibility), and contact info.
- **Preparedness** — checklist-style guidance on emergency kits, evacuation
  planning, and staying informed.
- **Emergency** — one-tap access to emergency service contact numbers
  (police, ambulance, fire, disaster helpline).
- **Accessibility & Localization** — English/Hindi language toggle, font-size
  scaling, high-contrast mode, and reduced-motion mode, all persisted via
  `localStorage` (`LanguageContext`).
- **Tricolor government theme** — saffron/white/green accent styling used
  consistently across headers/footers to signal an official initiative.

### Official Portal (`/official/*`)
- **Login** — demo authentication gate (see [credentials](#official-portal-demo-login)).
- **Dashboard** — summary stat cards and situational overview.
- **Alerts management**, **Risk Map** (district-level, real coordinates),
  **Shelters**, **Preparedness**, **Emergency**, **Reports**, **Users**, and
  **Settings** pages.
- **Protected routing** — all pages under `/official` (except login) require
  an authenticated session (`ProtectedRoute` + `OfficialAuthContext`).
- **Own i18n layer** (`officialTranslations.js`) and design system
  (`official.css`) separate from the citizen portal, matched with the same
  tricolor government theme.

---

## Tech Stack

| Layer            | Technology |
|-------------------|-----------|
| Framework          | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Routing            | [React Router v7](https://reactrouter.com/) |
| Maps               | [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) (OpenStreetMap tiles) |
| Icons              | [lucide-react](https://lucide.dev/) |
| i18n               | [i18next](https://www.i18next.com/) / [react-i18next](https://react.i18next.com/) (official portal) + custom `LanguageContext` (citizen portal) |
| Linting            | ESLint 10 (flat config) with React Hooks / React Refresh plugins |
| Styling            | Plain CSS (`index.css`, `official.css`) with CSS custom properties for theming |

---

## Project Structure

```
SIH BACKUP/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── public/
│   ├── assets/images/state-emblem.png
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx                     # App entry point
    ├── App.jsx                      # Route definitions (citizen + official)
    ├── LanguageContext.jsx          # Citizen portal i18n + accessibility settings
    ├── index.css                    # Global / citizen portal styles
    │
    ├── components/
    │   ├── layout/                  # Citizen portal shell
    │   │   ├── Header.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   └── official/                # Official portal shell + shared UI
    │       ├── OfficialHeader.jsx
    │       ├── OfficialSidebar.jsx
    │       ├── OfficialTopbar.jsx
    │       ├── OfficialFooter.jsx
    │       ├── OfficialLayout.jsx
    │       ├── ProtectedRoute.jsx
    │       ├── StatCard.jsx
    │       └── StatusBadge.jsx
    │
    ├── pages/                       # Citizen portal pages
    │   ├── Home.jsx
    │   ├── Alerts.jsx
    │   ├── RiskMap.jsx
    │   ├── Shelters.jsx
    │   ├── Preparedness.jsx
    │   └── Emergency.jsx
    │
    └── official/                    # Official portal (isolated module)
        ├── context/
        │   └── OfficialAuthContext.jsx   # Demo auth (localStorage session)
        ├── data/
        │   └── officialMockData.js       # Mock districts/stats/alerts data
        ├── i18n/
        │   ├── officialTranslations.js
        │   └── useOfficialLanguage.js
        ├── styles/
        │   └── official.css              # Official portal design system
        └── pages/
            ├── OfficialLogin.jsx
            ├── OfficialDashboard.jsx
            ├── OfficialAlerts.jsx
            ├── OfficialRiskMap.jsx
            ├── OfficialShelters.jsx
            ├── OfficialPreparedness.jsx
            ├── OfficialEmergency.jsx
            ├── OfficialReports.jsx
            ├── OfficialUsers.jsx
            └── OfficialSettings.jsx
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (recommended: latest LTS)
- npm (comes with Node.js)

### Installation

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
```

### Run the development server

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) — open it in
your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Available Scripts

| Script            | Description |
|--------------------|-------------|
| `npm run dev`      | Start the Vite dev server with hot module reload |
| `npm run build`    | Production build (output to `dist/`) |
| `npm run preview`  | Serve the production build locally for a quick smoke test |
| `npm run lint`     | Run ESLint across the project |

---

## Official Portal Demo Login

The Official Portal uses a **frontend-only, hard-coded demo login** — there is
no backend/API involved. Credentials and session state are stored in
`localStorage` purely so the session survives a page refresh during a demo.

```
URL:      /official/login
ID:       admin@ffews.gov.in
Password: Admin@123
```

> 🔒 Do not reuse this pattern for anything beyond a demo — it is **not**
> secure authentication.

---

## Routing Overview

| Path                        | Portal   | Description |
|------------------------------|----------|-------------|
| `/`                          | Citizen  | Home / risk-check |
| `/alerts`                    | Citizen  | Live alerts feed |
| `/risk-map`                  | Citizen  | Interactive risk map |
| `/shelters`                  | Citizen  | Shelter directory |
| `/preparedness`              | Citizen  | Preparedness guide |
| `/emergency`                 | Citizen  | Emergency contacts |
| `/official/login`            | Official | Login screen |
| `/official/dashboard`        | Official | Overview dashboard (protected) |
| `/official/alerts`           | Official | Alert management (protected) |
| `/official/risk-map`         | Official | District risk map (protected) |
| `/official/shelters`         | Official | Shelter management (protected) |
| `/official/preparedness`     | Official | Preparedness content (protected) |
| `/official/emergency`        | Official | Emergency ops (protected) |
| `/official/reports`          | Official | Reports (protected) |
| `/official/users`            | Official | User management (protected) |
| `/official/settings`         | Official | Settings (protected) |

All `/official/*` routes (other than `/official/login`) are wrapped in
`ProtectedRoute`, which redirects unauthenticated users back to the login page.

---

## Notes & Limitations

- **No backend** — all alerts, shelter, and district data are static/mock
  data (`officialMockData.js` and in-page constants), not live sensor feeds.
- **Demo authentication only** — see [above](#official-portal-demo-login).
- Two rounds of enhancements are documented in
  [`README-real-map.md`](./README-real-map.md): swapping fake map visuals for
  real Leaflet/OpenStreetMap maps, and adding a tricolor government theme to
  the Official Portal to match the Citizen Portal.
- Built and tested primarily for modern desktop/mobile browsers; no
  automated test suite is included yet.

---

## Roadmap Ideas

- Connect to real hydrological/weather APIs for live risk scoring.
- Replace demo auth with a real backend (JWT/session-based) and role-based
  access control for officials.
- Push notifications / SMS alerts for citizens in high-risk zones.
- Persist shelter occupancy and reports to a real database.
- Add automated tests (unit + e2e) and CI.

---

## License

No license has been specified for this project yet. Add a `LICENSE` file if
you intend to open-source it.
