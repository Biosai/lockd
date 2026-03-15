# Lockd Brand Guidelines

> The trust layer for crypto.

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Logo](#logo)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Iconography](#iconography)
7. [Voice & Tone](#voice--tone)
8. [Usage Rules](#usage-rules)
9. [Asset Inventory](#asset-inventory)

---

## Brand Overview

**Lockd** is the trust layer for crypto — a protocol that replaces banks, lawyers, and escrow services with deterministic smart contracts.

### Brand Personality

| Trait          | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| **Trustworthy** | Security is not a feature, it's the foundation                  |
| **Minimal**     | Every element earns its place — no decoration for decoration    |
| **Technical**   | Built for people who value precision and transparency           |
| **Accessible**  | Complex infrastructure, simple experience                       |
| **Confident**   | Quiet assurance, not loud promises                              |

### Tagline

**Primary**: "The trust layer for crypto"
**Secondary**: "Lock crypto for anyone. Get it back if unclaimed."

---

## Logo

### The Mark

The Lockd logo mark is a stylized padlock — representing security, protection, and trustless escrow. The lock's rounded shackle and clean body convey approachability without compromising the sense of safety.

### Logo Variants

| File                         | Usage                                      |
| ---------------------------- | ------------------------------------------ |
| `logo-mark.svg`              | Primary icon — emerald green with white lock (app icon, favicon) |
| `logo-mark-transparent.svg`  | Green lock on transparent background (overlays, watermarks) |
| `logo-mark-white.svg`        | White lock on transparent (dark backgrounds, photography overlays) |
| `logo-mark-dark.svg`         | Dark lock on transparent (light backgrounds, print) |
| `logo-full-color.svg`        | Full logo — green mark + dark wordmark (primary usage) |
| `logo-full-on-dark.svg`      | Full logo — green mark + white wordmark (dark backgrounds) |
| `logo-full-white.svg`        | Full logo — all white (dark photography, video overlays) |
| `logo-wordmark.svg`          | Text "Lockd" only (inline text references) |
| `favicon.svg`                | 32x32 favicon — green square with white lock |

### Minimum Size

- **Logo mark only**: Minimum 24px height
- **Full logo (mark + wordmark)**: Minimum 32px height
- **Clear space**: Always maintain a minimum clear space equal to the height of the lock shackle on all sides

### Logo Construction

The logo mark uses a **512x512** viewBox with:
- Rounded rectangle container: `rx="128"` (25% corner radius)
- Lock shackle: 40px stroke, rounded caps
- Lock body: `rx="48"` rounded rectangle
- Keyhole: Circle + rounded rectangle, centered

---

## Color Palette

### Primary Colors

| Name              | Hex       | HSL                  | RGB              | Usage                     |
| ----------------- | --------- | -------------------- | ---------------- | ------------------------- |
| **Emerald**       | `#10B981` | `160, 84%, 39%`     | `16, 185, 129`   | Primary brand color, CTAs, logo background |
| **Dark Navy**     | `#030711` | `224, 71%, 4%`      | `3, 7, 17`       | Dark mode background, primary text on light |
| **White**         | `#FAFAFA` | `0, 0%, 98%`        | `250, 250, 250`  | Light mode background, text on dark |

### Gradient

| Name                 | From        | To          | Usage                              |
| -------------------- | ----------- | ----------- | ---------------------------------- |
| **Brand Gradient**   | `#34D399`   | `#2DD4BF`   | Accent text, highlights, decorative elements |

CSS:
```css
background: linear-gradient(135deg, #34D399, #2DD4BF);
```

Tailwind:
```html
<span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
```

### Extended Palette

#### Light Mode

| Role              | Hex       | HSL                  | CSS Variable            |
| ----------------- | --------- | -------------------- | ----------------------- |
| Background        | `#FFFFFF` | `0, 0%, 100%`       | `--background`          |
| Foreground        | `#0A0A0A` | `0, 0%, 3.9%`       | `--foreground`          |
| Card              | `#FFFFFF` | `0, 0%, 100%`       | `--card`                |
| Card Foreground   | `#0A0A0A` | `0, 0%, 3.9%`       | `--card-foreground`     |
| Primary           | `#10B981` | `160, 84%, 39%`     | `--primary`             |
| Primary Foreground| `#FAFAFA` | `0, 0%, 98%`        | `--primary-foreground`  |
| Secondary         | `#F5F5F5` | `0, 0%, 96.1%`      | `--secondary`           |
| Muted             | `#F5F5F5` | `0, 0%, 96.1%`      | `--muted`               |
| Muted Foreground  | `#737373` | `0, 0%, 45.1%`      | `--muted-foreground`    |
| Border            | `#E5E5E5` | `0, 0%, 89.8%`      | `--border`              |
| Destructive       | `#EF4444` | `0, 84.2%, 60.2%`   | `--destructive`         |

#### Dark Mode

| Role              | Hex       | HSL                  | CSS Variable            |
| ----------------- | --------- | -------------------- | ----------------------- |
| Background        | `#030711` | `224, 71%, 4%`       | `--background`          |
| Foreground        | `#E2E8F0` | `213, 31%, 91%`      | `--foreground`          |
| Card              | `#030711` | `224, 71%, 4%`       | `--card`                |
| Card Foreground   | `#E2E8F0` | `213, 31%, 91%`      | `--card-foreground`     |
| Primary           | `#10B981` | `160, 84%, 39%`      | `--primary`             |
| Primary Foreground| `#FAFAFA` | `0, 0%, 98%`         | `--primary-foreground`  |
| Secondary         | `#1E293B` | `215, 28%, 17%`      | `--secondary`           |
| Muted             | `#1E293B` | `215, 28%, 17%`      | `--muted`               |
| Muted Foreground  | `#94A3B8` | `215, 20%, 65%`      | `--muted-foreground`    |
| Border            | `#1E293B` | `215, 28%, 17%`      | `--border`              |
| Destructive       | `#7F1D1D` | `0, 62.8%, 30.6%`    | `--destructive`         |

### Color Hierarchy

1. **Emerald `#10B981`** — Reserved for primary actions, the logo, and trust signals. Use sparingly to preserve impact.
2. **Dark Navy `#030711`** — The default canvas in dark mode. Conveys depth and focus.
3. **White `#FAFAFA`** — Text on dark, backgrounds on light. Clean and breathable.
4. **Slate tones** (`#94A3B8`, `#64748B`, `#1E293B`) — Supporting text, borders, subtle UI.
5. **Red `#EF4444`** — Destructive actions only. Never decorative.
6. **Brand Gradient** — Accent and emphasis. Headlines, highlights, marketing. Never for body text.

---

## Typography

### Primary Font: Geist Sans

**Geist Sans** by Vercel is the primary typeface. It's a modern geometric sans-serif designed for interfaces — clean, highly legible, and optimized for screens.

- **Source**: [vercel.com/font](https://vercel.com/font)
- **CSS variable**: `var(--font-geist-sans)`
- **Fallback stack**: `'Inter', system-ui, -apple-system, sans-serif`

### Monospace Font: Geist Mono

**Geist Mono** is used for code, addresses, transaction hashes, and technical data.

- **CSS variable**: `var(--font-geist-mono)`
- **Fallback stack**: `'JetBrains Mono', 'Fira Code', monospace`

### Type Scale

| Role            | Size   | Weight | Tracking       | Usage                               |
| --------------- | ------ | ------ | -------------- | ----------------------------------- |
| Display         | 72px   | 700    | -2px           | Hero headlines, banners             |
| Heading 1       | 48px   | 700    | -1.5px         | Page titles                         |
| Heading 2       | 36px   | 700    | -1px           | Section titles                      |
| Heading 3       | 24px   | 600    | -0.5px         | Subsection titles                   |
| Body Large      | 20px   | 400    | 0              | Introductory paragraphs             |
| Body            | 16px   | 400    | 0              | Default body text                   |
| Body Small      | 14px   | 400    | 0              | Secondary text, captions            |
| Label           | 12px   | 500    | 0.5px          | Form labels, tags, badges           |
| Mono            | 14px   | 400    | 0              | Addresses, hashes, code             |

### Typography Rules

- **Headlines** always use `font-weight: 700` with negative letter-spacing (tracking-tight)
- **Body text** uses `font-weight: 400` with default letter-spacing
- **Never** use more than 2 font weights on a single screen
- **Line height**: 1.5 for body, 1.2 for headlines
- **Maximum line length**: 65 characters for body text

---

## Spacing & Layout

### Border Radius

| Token   | Value   | CSS Variable                 | Usage                |
| ------- | ------- | ---------------------------- | -------------------- |
| `sm`    | 6px     | `calc(var(--radius) - 4px)`  | Small chips, badges  |
| `md`    | 8px     | `calc(var(--radius) - 2px)`  | Inputs, buttons      |
| `lg`    | 10px    | `var(--radius)`              | Cards, containers    |
| `xl`    | 16px    | —                            | Modals, large panels |
| `full`  | 9999px  | —                            | Pills, avatars       |

The logo mark uses 25% corner radius (128px on 512px), which translates to `rx="8"` on the 32px favicon.

### Grid & Spacing

- **Base unit**: 4px
- **Common spacings**: 8, 12, 16, 20, 24, 32, 48, 64, 96
- **Page max-width**: 1280px (Tailwind `max-w-7xl`)
- **Section padding**: 64px vertical on desktop, 32px on mobile
- **Card padding**: 24px (Tailwind `p-6`)

---

## Iconography

### Style

- **Stroke-based** icons (not filled) for UI elements
- **2px stroke** width at 24px icon size
- **Rounded** line caps and joins
- Consistent with [Lucide Icons](https://lucide.dev) (the project's icon library)

### Product Icons

Each Lockd product has an associated metaphor:

| Product              | Icon Metaphor       | Color       |
| -------------------- | ------------------- | ----------- |
| Lockd Payments       | Lock / Shield       | Emerald     |
| Lockd Inheritance    | Key / Clock         | Emerald     |
| Lockd Certify        | File / Check        | Emerald     |

---

## Voice & Tone

### Brand Voice

| Attribute       | Do                                     | Don't                                  |
| --------------- | -------------------------------------- | -------------------------------------- |
| **Direct**      | "Lock funds. Set a deadline. Done."    | "Our innovative platform enables..."  |
| **Technical**   | "Deterministic smart contract escrow"  | "Magic internet money locker"         |
| **Reassuring**  | "Funds return automatically if unclaimed" | "Don't worry, it's probably safe"  |
| **Honest**      | "On-chain, verifiable, no middleman"   | "The world's most secure platform"    |
| **Inclusive**    | "Send to any wallet address"           | "For advanced DeFi power users"       |

### Writing Rules

1. **Lead with the action**, not the feature: "Lock crypto for anyone" not "Lockd offers a locking feature"
2. **Use the present tense**: "Funds return to you" not "Funds will be returned"
3. **Be specific**: "Auto-refund after 30 days" not "Automatic protection"
4. **Avoid jargon** where a plain word works: "send" not "initiate a transfer"
5. **Never use "trust us"** — the protocol is trustless for a reason

---

## Usage Rules

### Do

- Use the logo mark at sufficient size with clear space
- Place the green mark on white or dark navy backgrounds
- Use the full-white variant on photography or busy backgrounds
- Maintain the aspect ratio of all logo variants
- Use the brand gradient for emphasis and delight

### Don't

- Don't recolor the emerald — `#10B981` is the only approved green
- Don't rotate, skew, or distort the logo
- Don't add effects (drop shadows, glows, bevels) to the logo
- Don't place the green logo on similarly-saturated backgrounds
- Don't use the gradient for body text or large surfaces
- Don't recreate the logo with a different typeface
- Don't use the logo mark smaller than 24px

### Accessibility

- All text must meet **WCAG 2.1 AA** contrast ratios (4.5:1 for body text, 3:1 for large text)
- Primary emerald `#10B981` on dark navy `#030711` achieves **7.2:1** contrast
- White `#FAFAFA` on dark navy `#030711` achieves **18.1:1** contrast
- Never rely on color alone to convey meaning — always pair with text or icons

---

## Asset Inventory

### Logo Files (`brand/`)

```
brand/
├── logo-mark.svg                # Primary icon (green bg + white lock)
├── logo-mark-transparent.svg    # Green lock, no background
├── logo-mark-white.svg          # White lock, no background
├── logo-mark-dark.svg           # Dark lock, no background
├── logo-full-color.svg          # Full logo for light backgrounds
├── logo-full-on-dark.svg        # Full logo for dark backgrounds
├── logo-full-white.svg          # All-white full logo
├── logo-wordmark.svg            # "Lockd" text only
├── favicon.svg                  # 32x32 favicon
├── banner-dark.svg              # 1200x630 banner (dark)
├── banner-light.svg             # 1200x630 banner (light)
├── og-image.svg                 # 1200x630 Open Graph image
└── BRAND-GUIDELINES.md          # This file
```

### Quick Reference

| Element           | Value                                           |
| ----------------- | ----------------------------------------------- |
| Primary Color     | `#10B981` — Emerald                             |
| Dark Background   | `#030711` — Dark Navy                           |
| Light Background  | `#FFFFFF` — White                               |
| Brand Gradient    | `#34D399` → `#2DD4BF` (emerald → teal)         |
| Primary Font      | Geist Sans (700 for headlines, 400 for body)    |
| Mono Font         | Geist Mono                                      |
| Border Radius     | 10px (base `--radius`)                          |
| Logo Corner Radius| 25% of container size                           |
| Favicon           | 32x32, 8px corner radius                        |
| Banner Size       | 1200 x 630 (OG image standard)                  |
| Minimum Logo Size | 24px (mark only), 32px (full logo)              |

---

*Last updated: March 2026*
