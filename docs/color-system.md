# Premium Color System

Beauty-booking platform color palette and usage guidelines. Aligned with Fresha, Planity, Styleseat, Airbnb, and GlossGenius.

**Current brand:** The app uses the **Purple + Black** charte. See [charte-graphique-purple-black.md](./charte-graphique-purple-black.md) for the full guideline. The sections below describe token usage (primary is now premium purple; secondary = black).

---

## 1. Primary (Premium Purple)

- **CTA:** `primary-500` (default), `primary-600` (hover)
- **Backgrounds:** `primary-50` for subtle tints
- **Borders:** `primary-100`, `primary-200`
- **Text on primary:** white

| Shade | Usage |
|-------|--------|
| 50 | Tints, tag/chip backgrounds |
| 100–200 | Borders, dividers on primary surfaces |
| 500 | Main CTA (Book Now, primary buttons) |
| 600 | CTA hover |
| 700–900 | Strong emphasis, links on light bg |

**WCAG:** Ensure `primary-500` on white and white on `primary-500` meet AA (4.5:1 small text, 3:1 large). Adjust toward `primary-600` if needed.

---

## 2. Neutral

- **Text:** primary = `neutral-900`, secondary = `neutral-600`, muted = `neutral-500`, disabled = `neutral-400`
- **Surfaces:** page = `neutral-50`, cards = white, hover = `neutral-50` / `neutral-100`
- **Borders:** default = `neutral-200`, subtle = `neutral-100`, strong = `neutral-300`
- **Disabled:** bg or text = `neutral-400`

| Shade | Usage |
|-------|--------|
| 50 | Page background, surface-page |
| 100 | Hover surfaces, dividers, chip bg |
| 200 | Default borders, card borders |
| 300 | Strong borders, outline buttons |
| 400 | Placeholder, disabled text |
| 500 | Muted text, secondary content |
| 600 | Secondary text |
| 700–900 | Primary text, headings |

---

## 3. Functional Colors

### Success (green)
- **Base:** `success-500`
- **Hover:** `success-600`
- **Tint bg:** `success-50`
- **Badge:** `bg-success-100` + `text-success-700`

### Warning (soft amber)
- **Base:** `warning-500`
- **Hover:** `warning-600`
- **Tint bg:** `warning-50`
- **Badge:** `bg-warning-100` + `text-warning-800`

### Error (gentle red)
- **Base:** `error-500`
- **Hover:** `error-600`
- **Tint bg:** `error-50`
- **Badge:** `bg-error-100` + `text-error-700`
- **Use for:** Destructive buttons, form validation errors

### Info (calm blue)
- **Base:** `info-500`
- **Hover:** `info-600`
- **Tint bg:** `info-50`
- **Badge:** `bg-info-100` + `text-info-700`

---

## 4. Surface Colors

| Token | Tailwind | Usage |
|-------|----------|--------|
| Page | `surface-page` / `neutral-50` | Body, main background |
| Card | `surface-card` / `white` | Cards, panels |
| Sidebar | `surface-sidebar` / `white` | Sidebars, nav panels |
| Overlay | `bg-surface-overlay/50` | Modals, backdrops |

---

## 5. UI Tokens

| Token | Class / value | Usage |
|-------|----------------|--------|
| Border | `border-neutral-200` | Default borders |
| Divider | `border-neutral-100` or `neutral-200` | Separators, list dividers |
| Focus ring | `ring-primary-500` | Focus visible state |
| Disabled button | `neutral-300` bg, `neutral-500` text (or `opacity-50`) | Disabled controls |
| Muted text | `text-neutral-500` or `text-muted-foreground` | Secondary text |
| Chip/tag bg | `bg-neutral-100` or `bg-primary-50` | Tags, badges, pills |

---

## 6. Component Color Mapping

### Buttons
- **Primary:** `bg-primary-500` hover `bg-primary-600`, text white
- **Secondary:** `border-neutral-200` (or primary-tinted: `bg-primary-50` `text-primary-600` hover `bg-primary-100`)
- **Ghost:** `text-neutral-600` hover `bg-neutral-100`
- **Destructive:** `bg-error-500` hover `bg-error-600`, text white

### Cards
- **Background:** `bg-white`
- **Border:** `border-neutral-100` or `border-neutral-200`
- **Shadow:** `shadow-sm` or `shadow-soft`

### Text
- **Primary:** `text-neutral-900`
- **Secondary:** `text-neutral-600`
- **Muted:** `text-neutral-500`

### Inputs
- **Border:** `border-neutral-300`
- **Focus:** `ring-primary-500`
- **Placeholder:** `placeholder-neutral-400`
- **Error state:** `border-error-500` `ring-error-500`

### Tags / Chips
- **Default:** `bg-primary-50` `text-primary-700`
- **Success:** `bg-success-50` `text-success-700`
- **Error:** `bg-error-50` `text-error-700`
- **Warning:** `bg-warning-50` `text-warning-800`
- **Info:** `bg-info-50` `text-info-700`

### Ratings
- **Filled stars:** `success-500` (or accent/amber for gold)

### Alerts / Toasts
- **Success:** bg `success-50`, border `success-200`
- **Error:** bg `error-50`, border `error-200`
- **Warning:** bg `warning-50`, border `warning-200`
- **Info:** bg `info-50`, border `info-200`

---

## 7. Typography

- **Body:** Inter (sans)
- **Headings:** Playfair Display (display)
- Optional: tabular numbers for data/tables via `font-feature-settings` or a mono for codes.

---

## 8. Future: Dark Mode

Dark mode is not implemented. When added:

- Mirror `:root` CSS variables in `.dark` (e.g. `--background`, `--foreground`, `--border`).
- Use inverted neutrals for surfaces and text.
- Primary buttons: consider `primary-400` on dark backgrounds for better contrast.
- Keep functional colors (success, warning, error, info) with adjusted shades for dark bg.
