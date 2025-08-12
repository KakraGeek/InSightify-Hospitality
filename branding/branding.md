# Branding Guide — InSightify (Cursor-ready)

This file defines the **core brand palette** and implementation snippets for Cursor projects. It also includes an explicit task for the AI agent to extend the palette with **matching secondary/complementary colors** for enhanced styling.

---

## 🎨 Primary Palette (from provided image)

| Role | Name | Hex | Notes | Tailwind Close Match |
|---|---|---|---|---|
| Primary Base | **Dark Navy** | `#1E293B` | Deep, trustworthy base for headers/nav/backgrounds | `slate-800` |
| Primary Accent | **Orange** | `#F97316` | Energetic accent for CTAs, highlights, chips | `orange-500` |
| Neutral Mid | **Gray** | `#94A3B8` | Secondary text, borders, muted icons | `slate-400` |
| Neutral Light | **Light Gray** | `#F1F5F9` | Surfaces, cards, page background | `slate-100` |

> Source: uploaded color palette image with labels and hex codes.

---

## ✅ Accessibility Quick Rules

- **Text on Dark Navy (`#1E293B`)**: use white `#FFFFFF` or Light Gray `#F1F5F9`.  
- **Text on Orange (`#F97316`)**: prefer Dark Navy or black for large text; ensure AA for small text.  
- **Text on Light Gray (`#F1F5F9`)**: use Dark Navy for strong contrast; Gray for secondary text.

> Aim for **WCAG 2.1 AA** contrast (4.5:1 for body text, 3:1 for large text/UI elements).

---

## 🧩 CSS Variables (app-wide)

Add to a global CSS (e.g., `src/styles/globals.css`):

```css
:root {
  --brand-navy: #1E293B;
  --brand-orange: #F97316;
  --brand-gray: #94A3B8;
  --brand-light: #F1F5F9;

  /* Semantic tokens */
  --bg-default: var(--brand-light);
  --bg-elevated: #ffffff;
  --text-primary: var(--brand-navy);
  --text-secondary: #475569; /* slate-600 */
  --border-muted: var(--brand-gray);
  --cta-bg: var(--brand-orange);
  --cta-text: #ffffff;
}

.dark {
  --bg-default: #0b1220;
  --bg-elevated: #0f172a; /* slate-900 */
  --text-primary: #E2E8F0; /* slate-200 */
  --text-secondary: #94A3B8;
  --border-muted: #334155; /* slate-700 */
  --cta-bg: #fb923c; /* orange-400 for better vibrancy on dark */
  --cta-text: #1E293B;
}
```

---

## 🛠️ Tailwind Config Extension

In `tailwind.config.ts` (or `.js`):

```ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1E293B",
          orange: "#F97316",
          gray: "#94A3B8",
          light: "#F1F5F9",
        },
      },
    },
  },
};
```

Usage examples:
```html
<button class="bg-brand-orange text-white hover:opacity-90">Primary CTA</button>
<div class="bg-brand-light text-brand-navy">Card</div>
<p class="text-brand-gray">Muted caption</p>
```

---

## 🧭 Component Usage Guidelines

- **Buttons/CTAs:** `bg-brand-orange text-white` (hover: `opacity-90` or a slightly darker orange).
- **Primary text & headings:** `text-brand-navy` on light surfaces.
- **Surfaces:** `bg-brand-light` for page/card backgrounds; use white for elevated cards.
- **Borders/Dividers:** `border-brand-gray/50` for subtle separation.
- **Links:** `text-brand-orange` with underline on hover.
- **Badges/Chips:** Orange for “live/active”, Navy outline for neutral, Gray for default.

---

## 📊 Data Viz Starter

- Positives/primary series: **Orange** `#F97316`
- Neutral series/backgrounds: **Gray** `#94A3B8` and Light Gray grid lines `#F1F5F9`
- Emphasis or baseline: **Dark Navy** `#1E293B`

---

## 🧑‍💻 Agent Task — Extend the Palette (Secondary & Complementary)

**Dear Cursor Agent, do the following now:**

1. Propose **4–6 secondary/complementary colors** that pair well with the core palette:
   - Include at least one **teal/cyan** and one **soft yellow/amber** option for UI feedback states.
   - Provide **hex values**, **usage intents** (e.g., success/info/warning/background accent), and **Tailwind-friendly names**.
   - Ensure **WCAG AA** contrast when used with `#1E293B` (dark) and `#F1F5F9` (light) backgrounds.
2. Add the approved colors under `theme.extend.colors.brand` in `tailwind.config` and mirror them as CSS variables (e.g., `--brand-teal`, `--brand-amber`, etc.).
3. Create a `docs/brand-preview.html` that renders swatches, text contrast samples, and example components (buttons, alerts, badges) using the extended palette.
4. Update component recipes so **success/info/warning/error** states use the extended, accessible colors.

> Use naming like `brand.teal`, `brand.cyan`, `brand.amber`, `brand.red`, `brand.green`, `brand-purple` with `DEFAULT`, `50–900` shades when appropriate.

---

## 📦 Deliverables for Agent (checklist)

- [ ] Proposed secondary/complementary palette (table in this doc or separate `docs/branding-extended.md`)
- [ ] Updated `tailwind.config.ts`
- [ ] Updated CSS variables
- [ ] `docs/brand-preview.html` showcase
- [ ] Notes on contrast checks and decisions

---

## 🔁 Versioning

Track updates to this file in `docs/branding.md`. Record any new color decisions, contrast notes, and component mapping so design remains consistent across repos.
