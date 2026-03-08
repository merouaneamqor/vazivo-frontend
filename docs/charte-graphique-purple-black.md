# Charte graphique — Purple + Black

Brand guideline for a **premium beauty–wellness booking platform** (salons, barbers, spas, nail studios).  
Direction: **Luxury · Modern SaaS · High-end · Gender-neutral · Minimal, bold, elegant.**

---

## 1. Color strategy

| Role | Color | Use |
|------|--------|-----|
| **Primary** | Premium purple | CTAs, links, focus, identity |
| **Secondary** | Pure black | Typography, nav, premium contrast |
| **Neutrals** | Soft greys | Structure, backgrounds, surfaces |
| **Functional** | Success / Warning / Error / Info | Status, alerts, validation |
| **Accent** | Violet–pink | Optional luxury gradients, lavender backgrounds |

---

## 2. Primary palette (Premium Purple)

Main brand color: rich, vibrant, luxurious (Fresha × GlossGenius). Accessible for CTAs; soft tints for backgrounds.

| Token | Hex | Usage |
|-------|-----|--------|
| primary-50 | `#faf5ff` | Tints, tag/chip backgrounds, soft sections |
| primary-100 | `#f3e8ff` | Light borders, hover surfaces |
| primary-200 | `#e9d5ff` | Borders on primary surfaces |
| primary-300 | `#d8b4fe` | Outline hover, dividers |
| primary-400 | `#c084fc` | Decorative, icons |
| primary-500 | `#8b5cf6` | **Main brand**, secondary CTA |
| primary-600 | `#7c3aed` | **Primary CTA (buttons)** |
| primary-700 | `#6d28d9` | CTA hover |
| primary-800 | `#5b21b6` | Strong emphasis |
| primary-900 | `#4c1d95` | Dark accents |
| primary-950 | `#3b0764` | Deep purple |

**Rules:**  
- CTAs: `bg-primary-600` → hover `bg-primary-700`, text white.  
- On purple backgrounds: always white text.  
- Soft backgrounds: `primary-50`, `primary-100`.

---

## 3. Black system (Secondary)

Pure black for typography, logos, nav, premium contrast. Scale from faint borders to pure black.

| Token | Hex | Usage |
|-------|-----|--------|
| black-50 | `#fafafa` | — |
| black-100 | `#f5f5f5` | — |
| black-200 | `#e5e5e5` | Faint borders |
| black-300 | `#d4d4d4` | Borders |
| black-400 | `#a3a3a3` | Muted text |
| black-500 | `#737373` | Secondary text |
| black-600 | `#525252` | Body secondary, ghost buttons |
| black-700 | `#404040` | Subtitles |
| black-800 | `#262626` | Hover on black buttons |
| black-900 | `#0a0a0a` | **Titles, primary text, nav** |

**Rules:**  
- Titles: `text-black-900`.  
- Subtitles: `text-black-700`.  
- Secondary text: `text-black-500` or `text-neutral-500`.  
- Muted: `text-black-400`.  
- Secondary (premium) button: `bg-black-900` text white → hover `bg-black-800`.

---

## 4. Neutral palette (UX foundation)

Modern SaaS grey scale for cards, dividers, inputs, layout.

| Token | Hex | Usage |
|-------|-----|--------|
| neutral-50 | `#fafafa` | Page background, surface-soft |
| neutral-100 | `#f4f4f5` | Hover surface, surface-hover |
| neutral-200 | `#e4e4e7` | Borders, dividers |
| neutral-300 | `#d4d4d8` | Input borders, outline buttons |
| neutral-400 | `#a1a1aa` | Placeholder, disabled |
| neutral-500 | `#71717a` | Muted text |
| neutral-600 | `#52525b` | Secondary text |
| neutral-700 | `#3f3f46` | — |
| neutral-800 | `#27272a` | — |
| neutral-900 | `#18181b` | — |
| neutral-950 | `#09090b` | — |

---

## 5. Functional colors

| Role | Base | Hover | Tint (bg) | Badge |
|------|------|--------|-----------|--------|
| **Success** | `#22c55e` (500) | 600 | `success-50` #f0fdf4 | bg-success-100, text-success-700 |
| **Warning** | `#f59e0b` (500) | 600 | `warning-50` #fef3c7 | bg-warning-100, text-warning-800 |
| **Error** | `#ef4444` (500) | 600 | `error-50` #fee2e2 | bg-error-100, text-error-700 |
| **Info** | `#3b82f6` (500) | 600 | `info-50` #eff6ff | bg-info-100, text-info-700 |

---

## 6. UI tokens

| Token | Value | Usage |
|-------|--------|--------|
| border-color | `border-neutral-200` / `neutral-300` | Default borders |
| surface-base | `#ffffff` | Cards, panels |
| surface-soft | `neutral-50` | Page, sections |
| surface-hover | `neutral-100` | Hover states |
| card-color | `#ffffff` | Cards |
| focus-ring | `ring-primary-500` | Focus visible |
| disabled-color | `neutral-400` or `opacity-50` | Disabled controls |
| muted-text | `neutral-500` or `black-400` | Secondary text |
| tag-background | `primary-100` + `text-primary-700` | Default tags |
| tag-premium | `border-black-300` + `text-black-700` | Premium/outline tags |

---

## 7. Gradients

| Name | Usage |
|------|--------|
| `bg-gradient-primary` | Purple → Black (hero, premium CTAs) |
| `bg-gradient-lavender-midnight` | Lavender → Midnight (ambient sections) |
| `bg-gradient-deep-purple-ink` | Deep purple → Ink (dark hero) |

Tailwind: `bg-gradient-primary`, `bg-gradient-lavender-midnight`, `bg-gradient-deep-purple-ink`.

---

## 8. Component styling rules

### Buttons

- **Primary:** `bg-primary-600 text-white` → hover `bg-primary-700`. Focus `ring-primary-500`.
- **Secondary (black):** `bg-black-900 text-white` → hover `bg-black-800`.
- **Secondary (purple tint):** `bg-primary-50 text-primary-700 border border-primary-100` → hover `bg-primary-100` (variant: `secondaryPurple`).
- **Ghost:** `text-black-600` → hover `bg-neutral-100` `text-black-900`.
- **Outline:** `border border-neutral-300 text-black-900` → hover `bg-neutral-100` `border-primary-400` `text-primary-600`.
- **Destructive:** `bg-error-500` → hover `bg-error-600`, text white.

### Cards

- Background: `bg-white` or `bg-neutral-50`.
- Border: `border-neutral-200`.
- Shadow: `shadow-sm` or `shadow-soft`.
- Text: `text-black-900` (titles), `text-black-600` / `neutral-500` (secondary).
- Optional: purple accents (border-primary-100, or icon primary-500).

### Sections

- **Light:** `bg-white` or `bg-neutral-50`.
- **Ambient:** `bg-primary-50` or `bg-lavender-50` (soft lavender).
- **Premium / hero:** `bg-black-900` or `bg-gradient-primary` / `bg-gradient-deep-purple-ink`, text white.

### Text

- Titles: `text-black-900` `font-semibold` (or `font-display`).
- Subtitles: `text-black-700`.
- Body: `text-black-900` or `text-black-600`.
- Secondary: `text-neutral-500` or `text-black-400`.
- On purple/black: `text-white`.

### Inputs

- Border: `border-neutral-300`.
- Focus: `ring-primary-500` `border-primary-500`.
- Placeholder: `placeholder-neutral-400`.
- Error: `border-error-500` `ring-error-500`.

### Badges / tags

- Default: `bg-primary-100 text-primary-700`.
- Success: `bg-success-100 text-success-700`.
- Error: `bg-error-100 text-error-700`.
- Warning: `bg-warning-100 text-warning-800`.
- Info: `bg-info-100 text-info-700`.
- Premium / outline: `border border-black-300 text-black-700`.

---

## 9. Typography

- **Sans / body:** Inter, Plus Jakarta Sans (weights 400, 500, 600, 700).
- **Display / headings:** Plus Jakarta Sans (or Inter), weight 600 for headings.
- **Weights:** Headings 600, body 400, small text 400 or 300, buttons 500 or 600.

Google Fonts import (already in use):

```html
Inter:wght@300;400;500;600;700
Plus+Jakarta+Sans:wght@400;500;600;700
```

---

## 10. Example UI blocks

### Primary CTA block

```html
<section class="rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm">
  <h2 class="text-xl font-semibold text-black-900">Book your appointment</h2>
  <p class="mt-1 text-sm text-neutral-500">Choose a time that works for you.</p>
  <button class="mt-4 bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 rounded-xl font-semibold shadow-soft hover:shadow-glow focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
    Book now
  </button>
</section>
```

### Premium black CTA block

```html
<section class="rounded-2xl bg-black-900 p-8 text-white">
  <h2 class="text-2xl font-semibold">Premium experience</h2>
  <p class="mt-2 text-white/80">Salons and barbers that match your style.</p>
  <button class="mt-6 bg-white text-black-900 hover:bg-neutral-100 px-6 py-3 rounded-xl font-semibold">
    Explore
  </button>
</section>
```

### Card with purple accent

```html
<div class="rounded-2xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
  <div class="h-2 bg-gradient-to-r from-primary-500 to-primary-700" />
  <div class="p-5">
    <h3 class="font-semibold text-black-900">Haircut & styling</h3>
    <p class="text-sm text-neutral-500 mt-1">45 min · From €35</p>
    <button class="mt-4 text-primary-600 font-semibold hover:text-primary-700">Choose</button>
  </div>
</div>
```

### Tag / badge set

```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">New</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">Confirmed</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-black-300 text-black-700">Premium</span>
```

### Input with focus

```html
<input
  type="text"
  placeholder="Search..."
  class="w-full px-4 py-3 rounded-xl border border-neutral-300 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-black-900"
/>
```

---

## 11. Tailwind config reference

Colors are defined in `tailwind.config.ts` under `theme.extend.colors`:

- `primary` (50–950, DEFAULT `#8b5cf6`)
- `black` (50–900, DEFAULT `#0a0a0a`)
- `neutral` (50–950)
- `accent` (violet-pink, 50–900)
- `success`, `warning`, `error`, `info` (50–900)
- `surface` (base, soft, hover, page, card, sidebar, overlay)

Background images:

- `bg-gradient-primary` (purple → black)
- `bg-gradient-lavender-midnight` (lavender → midnight)
- `bg-gradient-deep-purple-ink` (deep purple → ink)

Box shadow:

- `shadow-glow` uses primary purple; `shadow-glow-accent` uses accent.

---

## 12. Summary

- **Primary:** Premium purple (`primary-500` / `primary-600` / `primary-700`) for CTAs and identity.  
- **Secondary:** Black scale (`black-900` for text and premium buttons).  
- **Neutrals:** Clean greys for layout, cards, inputs.  
- **Functional:** Success, warning, error, info with tints and badges.  
- **Components:** Primary = purple CTA; secondary = black CTA; ghost/outline = black text + neutral borders; cards = white/neutral + optional purple accent.  
- **Typography:** Inter + Plus Jakarta Sans, headings 600, body 400.  
- **Gradients:** Purple → black, lavender → midnight, deep purple → ink for premium sections.

This charte ensures a **luxury, modern, gender-neutral** beauty–wellness look (Fresha × GlossGenius × Airbnb with a darker, premium twist).
