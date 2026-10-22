---
name: SPBU POS & Thermal Engine
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5e3f3c'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#936e6a'
  outline-variant: '#e8bcb7'
  surface-tint: '#c00014'
  primary: '#bb0013'
  on-primary: '#ffffff'
  primary-container: '#e71520'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4ab'
  secondary: '#245eaa'
  on-secondary: '#ffffff'
  secondary-container: '#7aacfd'
  on-secondary-container: '#003f7e'
  tertiary: '#006b32'
  on-tertiary: '#ffffff'
  tertiary-container: '#008740'
  on-tertiary-container: '#f7fff3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#00468c'
  tertiary-fixed: '#78fc9c'
  tertiary-fixed-dim: '#5adf82'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005225'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  display-currency:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  thermal-mono:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-mobile: 0.75rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for front-line fuel operators, cashier attendants, and supervisor kiosks at Indonesian energy filling stations. The operating environment is high-throughput, tactile, and subject to intense direct sunlight, oil mist, and hurried customer turnover. The interface demands immediate legibility, infallible physical feedback, and ergonomic touch targets that accommodate one-handed operation on ruggedized Android terminals or tablet mounts.

The aesthetic blends **Modern Industrial Utility** with **Tabular Commercial Ergonomics**. Drawing inspiration from standard 58mm/80mm thermal paper receipts, physical fuel dispenser displays, and corporate identity standards, the visual tone conveys institutional reliability, precision, and operational speed. It deliberately avoids decorative softness in favor of crisp boundaries, high contrast ratios, functional mono-spaced data alignments, and distinct hardware status telemetry (Bluetooth printer link, paper roll status, and dispenser pump assignments).

## Colors

The palette establishes immediate functional distinction across fast-paced fueling operations:

- **Primary Red (`#ED1C24`)**: The principal action and brand anchor. Used for immediate transaction commits, primary action triggers ("Cetak Struk", "Bayar"), and urgent warnings (dispenser offline, paper empty).
- **Secondary Blue (`#004C97`)**: Represents systemic stability, corporate verification, and hardware connectivity. Applied to active Bluetooth telemetry badges, nozzle assignment selectors, and shift reconciliation controls.
- **Tertiary Green (`#00A651`)**: Used exclusively for verified states, positive cash balance matching, "Pasti Pas" validation banners, and successful thermal print spool confirmations.
- **Slate Dark Neutral (`#0F172A`)**: The heavy, unyielding structural tone used for high-contrast tabular typography, dark mode display toggles, numeric keypad faces, and high-readability price banners.
- **Surface & Receipt Canvas (`#F8FAFC` to `#FFFFFF`)**: A cool, crisp white paper base mimicking thermal receipt stock, framed by subtle neutral borders (`#E2E8F0`) to maintain clear element grouping under outdoor sun glare.

## Typography

The typographic hierarchy is split by function: **Plus Jakarta Sans** delivers swift, authoritative readability for total transaction amounts, station identifiers, and modal actions, while **IBM Plex Sans** anchors high-density operational data, unit volumes (Liters), fuel product tags (Pertalite, Pertamax, Dexlite), and operator credentials.

For the thermal receipt preview and hardware print stream representation, enforce tabular numbers (`font-variant-numeric: tabular-nums`) and monospace alignment to reflect the mechanical physical print head of ESC/POS 58mm printers. All price totals must use bold weights to prevent ambiguity under fast-paced ambient forecourt conditions.

## Layout & Spacing

The system implements a rigid 12-column grid on POS tablets and desktop cash counters, transitioning into an ergonomic stacked single-column flow on handheld mobile terminals.

- **Handheld Terminals (360px – 480px)**: 0.75rem outer margins, 0.5rem gutters. The lower half of the screen is strictly preserved for an oversized 3x4 tactile keypad or preset quick-denomination buttons (Rp 20.000, Rp 50.000, Rp 100.000, Full Tank).
- **POS Tablet Countertop (768px – 1024px)**: Split viewport. The left 7 columns house the pump selector, nozzle state, volume/price calculator, and payment method selector. The right 5 columns represent the live ESC/POS thermal receipt canvas with print/cut controls pinned at the base.
- **Component Padding Rhythm**: Internal card paddings follow a modular 0.5rem (`space-sm`) and 1rem (`space-md`) cadence, optimizing screen real estate to prevent off-screen scrolling during live transactions.

## Elevation & Depth

To guarantee visibility under severe tropical daylight, depth is conveyed through **structured structural borders and crisp tonal offsets** rather than heavy diffused ambient shadows:

- **Flat Substrate (Level 0)**: Background canvases sit on `#F1F5F9`.
- **Card Tier (Level 1)**: Pure white `#FFFFFF` surface containers framed by a crisp 1px solid border (`#E2E8F0`). Subtle drop-shadow: `0 1px 3px rgba(15, 23, 42, 0.08)`.
- **Active / Focused Interactive Components (Level 2)**: Keypad buttons, active fuel grade cards, and nozzle monitors utilize an elevated state: `0 4px 6px -1px rgba(15, 23, 42, 0.12)`, anchored by a 2px high-contrast active rim in Primary Red or Secondary Blue.
- **Thermal Receipt Container**: Designed as an inset physical sheet with a top perforated or jagged edge indicator, cast over a low-contrast dark outline to distinguish on-screen interactive UI from the immutable printed receipt.
- **Critical Action Drawers & Print Modals (Level 3)**: Pinned full-width sheets with `0 10px 15px -3px rgba(15, 23, 42, 0.20)`, ensuring cashier concentration is isolated to finalizing cash settlement or paper changes.

## Shapes

The design system uses **Level 2 (Rounded)** curvature. 

- Core input containers, keypad tiles, list items, and standard push buttons leverage an 8px (`0.5rem`) corner radius. This balances industrial structure with contemporary touchscreen affordance.
- Compact metadata badges, fuel category chips (e.g., "RON 92", "SOLAR"), and Bluetooth hardware status indicators leverage pill radii for immediate glanceable identification.
- Receipt preview surfaces retain square or minimally rounded 4px edges with simulated thermal paper rip-perforations at top and bottom boundaries.

## Components

### Buttons
- **Primary Transactional Action**: Full-width `#ED1C24` background, white bold text, 48px to 56px minimum touch target height. Displays immediate tactile depression (`active:scale-[0.98]`) with an optional vibrating haptic cue.
- **Secondary Hardware / Utility Action**: Outlined `#004C97` or slate container with clear iconography (e.g., "Hubungkan Printer", "Buka Cash Drawer").
- **Keypad Tile Button**: High-contrast slate or white block (`min-h-[52px]`), heavy border, bold center-aligned numbers with sub-labels for rapid entry.

### Chips & Fuel Selectors
- **Fuel Grade Chips**: Segmented selectors mapped to station fuels: Pertalite (Green-tint `#00A651`), Pertamax (Blue-tint `#004C97`), Pertamax Turbo (Red-tint `#ED1C24`), Dexlite (Forest-tint). Selected state displays a thick 2px border and filled status indicator.
- **Printer Status Chip**: Dynamic badge indicating connectivity: Green dot ("Siap Mencetak"), Yellow pulsing dot ("Menghubungkan Bluetooth"), Red dot ("Kertas Habis / Putus").

### Lists & Transaction Logs
- High-density rows with alternating neutral surface fills (`#FFFFFF` to `#F8FAFC`).
- Numerical figures (Liter, Rupiah, Plat Nomor) are right-aligned with fixed-width tabular formatting for visual reconciliation against dispenser meters.

### Input Fields & Keypad Displays
- **Currency & Volume Display**: Prominent full-width readouts with left-anchored currency prefix (`Rp`) and right-anchored numerical total in bold display styling (`Plus Jakarta Sans 32px`).
- **Vehicle Plate (Nopol) Input**: Capitalized, mono-spaced input container with quick keyboard presets for common regional codes (e.g., B, D, L, W, DK).

### Cards & Thermal Receipt Sheet
- **Receipt Preview Card**: High-contrast white container framed with simulated 58mm printer roll margins. Monospaced tabular breakdown displaying SPBU ID, Nomor Selang, Jenis BBM, Liter, Harga/liter, Total, and operator sign-off ("Terima Kasih dan Selamat Jalan").
- **Hardware Telemetry Card**: Houses printer battery life, paper roll percentage, and signal strength with direct "Test Print" action.