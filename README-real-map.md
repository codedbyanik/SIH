# SIH — Real maps + Official Portal tricolor theme

This is your full project with two rounds of changes applied:

1. Real maps in both the Citizen and Official portals (replacing the
   dummy/fake map visuals).
2. A tricolor (saffron/white/green) government accent theme added
   throughout the Official Portal, to match the Citizen Portal.

## Install

```
npm install
npm run dev
```

`leaflet` and `react-leaflet` (v5, matching your React 19 setup) were
added to `package.json` — a normal `npm install` pulls them in.

## 1. Real maps

### Citizen Portal — `src/pages/RiskMap.jsx`
- Real OpenStreetMap `<MapContainer>` instead of the old fake `x%`/`y%`
  marker layout.
- Real coordinates added for all 5 zones (Darjeeling Town, Kurseong,
  Kalimpong, Gangtok, Manali).
- Markers colored using your existing risk-severity CSS variables
  (`--critical`, `--high-risk`, `--warning`, `--safe`).
- Existing layer filter (All/Flood/Landslide/Weather) and side-panel
  selection still work exactly as before.

### Official Portal — `src/official/pages/OfficialRiskMap.jsx`
- Real map replacing the abstract grid of 3-letter district cells,
  covering all 8 monitored districts.
- Real coordinates added to `src/official/data/officialMockData.js`.
- Markers colored with the portal's existing `--official-danger` /
  `--official-warning` / `--official-green-success` variables.

## 2. Official Portal tricolor theme

The Citizen Portal already had a saffron/white/green government theme
(a thin strip above the header, an accent line under the branding row,
a green top border on the footer, tricolor-flavored nav states). The
Official Portal had none of this — it was plain navy/blue only. Added:

- **`src/components/official/OfficialHeader.jsx` +
  `src/official/styles/official.css`**: a new `.official-tricolor-strip`
  — the same thin saffron/white/green bar, now above the Official
  Portal's government identity strip. Since `OfficialHeader` is the one
  shared component rendered on both the login screen and every
  authenticated page, this shows up everywhere automatically.
- A matching 3px tricolor accent line under the ministry branding row
  (`.official-header-brand::after`), mirroring the Citizen Portal's
  `.branding::after`.
- **Sidebar** (`.official-sidebar`): a 3px tricolor strip along the very
  top edge, plus a green left-edge accent on the active nav link
  (`.official-sidebar-link.is-active`) so the "you are here" state
  reads consistently with the Citizen navbar's green active state.
- **Footer** (`.official-footer`): a 4px green top border, matching the
  Citizen footer's green top border.

I kept this restrained and used the Official Portal's *own* existing
saffron/green variables (`--official-saffron`, `--official-green`) —
already defined in `official.css` but barely used before — rather than
pulling in the Citizen Portal's separate color variables or its
lighter, rounded-pill visual style. The goal was "add the tricolor
government theme," not "make the dashboard look like the citizen site."
The institutional navy/blue dashboard look, sidebar layout, and data
density are all untouched.

## Verified

- All `.jsx`/`.js` files parse without syntax errors.
- All relative imports resolve to real files.
- `eslint` shows the same pre-existing issues as before these changes
  (a couple of `react-refresh/only-export-components` notes and one
  unused variable in `Alerts.jsx`) — nothing new introduced.

Note: I couldn't run a full `npm install && npm run build` in this
environment (no network access, and the bundled `node_modules` only has
Windows-native binaries). Please run it once locally as a final check.
