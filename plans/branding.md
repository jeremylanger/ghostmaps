# Ghost Maps — "Phantom Protocol" Brand System

## Aesthetic Direction

Inspired by **Tron: Legacy (2010)** — luminous grid lines, light bleeding through darkness, existing inside a system but being untraceable. A stealth HUD for navigating the real world privately.

**Core principle:** The UI should feel like you're operating from inside the grid. Dark, sharp, atmospheric. Privacy isn't a feature — it's the visual language.

**Tagline options:**
- "They can't track what they can't see."
- "Zero-knowledge maps. Zero compromise."
- "The map that doesn't map you."

---

## Color Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Base | Void | `#080c14` | Page/app background |
| Surface | Panel | `#0d1420` | Cards, panels, overlays |
| Border | Edge | `#1a2535` | Subtle borders, dividers |
| Primary | Cyan Glow | `#00e5ff` | Primary actions, active states, glow effects |
| Secondary | Lavender | `#8b7ec8` | Secondary text, inactive states |
| Accent | Coral | `#ff3d5a` | Alerts, destructive actions, errors |
| Text Primary | Bone | `#e8e6e1` | Primary text |
| Text Secondary | Blue Gray | `#6b7a8d` | Secondary/muted text |
| Success | Phosphor | `#00ff9d` | Success states, open status |
| Warning | Amber | `#f59e0b` | Warnings, star ratings |

### Glow Effects
- Primary glow: `0 0 12px rgba(0, 229, 255, 0.3)` (subtle)
- Primary glow strong: `0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.1)` (emphasis)
- Panel shadow: `0 4px 24px rgba(0, 0, 0, 0.5)` (depth)

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / Headers | **JetBrains Mono** or **Space Mono** | 700 | Monospace. "Inside the machine" feel |
| Body | **Atkinson Hyperlegible** | 400, 700 | Highly readable, accessible, clean |
| Data / Mono | **JetBrains Mono** | 400 | Wallet addresses, distances, stats |

### Scale
- Display: 24px / 700
- H1: 20px / 700
- H2: 16px / 700
- Body: 14px / 400
- Small: 12px / 400
- Micro: 10px / 600 (badges, labels)

---

## Logo

- **Primary logo:** Cyan circuit-ghost — angular geometric ghost silhouette with circuit traces, partially dissolving/fragmenting on one side. Files: `client/public/logo.png`
- **Favicon:** Simplified solid version for small sizes. File: `client/public/favicon.png`
- **Colors:** Electric cyan `#00e5ff` on void black `#080c14`
- **Character:** Angular, technical, not cute. A presence that can't be tracked.

---

## Map Style

- **Dark basemap** (MapTiler Dark Matter, Toner, or custom dark style)
- Roads as thin luminous lines (cyan tint)
- Water in deep navy/black
- Buildings as subtle dark shapes
- POI labels minimal, light text
- User location: pulsing cyan radar ring
- POI markers: cyan-outlined circles with glow on hover
- Selected marker: brighter glow, larger, ring pulse
- Route line: cyan with glow effect

---

## Component Strategy

### shadcn/ui (themed to Phantom Protocol)
Use for standard UI infrastructure — the 80% that should "just work":
- Button, Dialog, DropdownMenu, Input, Sheet (bottom panels)
- Form elements (textarea, select, checkbox)
- Tooltip, Badge, Separator

### Custom components (the signature 20%)
Build custom for the moments that define the brand:
- **Search bar** — glowing cyan border, dark glass background, scan-line shimmer on loading
- **Map markers** — pulsing radar dots, glow halos
- **Navigation HUD** — top overlay with Tron-style turn cards, glowing edge lines
- **Panel transitions** — "decloak" slide-in animations
- **Loading states** — radar sweep, scan-line effects
- **Location pulse** — expanding ring animation

---

## Signature Details

- Subtle noise/grain texture overlay on panels (very low opacity)
- Glow bloom on interactive elements
- "Decloak" animation for panels appearing (slight scale + opacity + blur)
- Scan-line effect on loading states
- Borders that glow on hover/focus
- Monospace for all data values (distances, ETAs, addresses)
- Status text is blunt and direct: "0 data collected. 0 searches tracked."

---

## What This Is NOT

- Not cute or playful (no bouncing, no rounded-cute)
- Not generic dark mode (no gray-on-darker-gray)
- Not cyberpunk chaos (clean, precise, intentional)
- Not purple gradients on white (the old Vite-era non-brand)
- Not Google Maps with a dark coat of paint
