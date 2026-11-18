---
name: Warm Editorial Sanctuary
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#e5bdbe'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#303032'
  outline: '#ac8889'
  outline-variant: '#5c3f41'
  surface-tint: '#ffb2b6'
  primary: '#ffb2b6'
  on-primary: '#68001a'
  primary-container: '#ff5169'
  on-primary-container: '#5b0016'
  inverse-primary: '#be0038'
  secondary: '#ffd798'
  on-secondary: '#422c00'
  secondary-container: '#feb300'
  on-secondary-container: '#6a4800'
  tertiary: '#62dca3'
  on-tertiary: '#003823'
  tertiary-container: '#1aa570'
  on-tertiary-container: '#00311e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb2b6'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#920029'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#ffba35'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#80f9bd'
  tertiary-fixed-dim: '#62dca3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005234'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  margin: 1.25rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an intimate, nocturnal editorial atmosphere tailored for discovery, hospitality, and retreat. It merges the warmth and narrative elegance of luxury travel publishing with the focused utility of a high-end mobile experience.

### Core Character & Atmosphere
- **Intimate Retreat:** Rich charcoal-slate baselines replace harsh pitch-black, preventing stark contrast fatigue and invoking the ambient quiet of evening hospitality.
- **Warm Editorial Polish:** Fluid layouts and generous proportional typography offer curated, boutique storytelling rather than utilitarian aggregate listings.
- **Tactile Softness:** Layered surfaces, rounded structural containers, and amber accents evoke low ambient lamplight and tactile comfort.

### Target Audience & Emotional Impact
Designed for discerning travelers and hosts seeking architectural beauty, authenticity, and visual repose. The interface should feel calming, prestigious, and welcoming—like stepping into a dimly lit, bespoke hotel lounge where every visual detail is considered.

## Colors

The palette balances dark foundational planes with warm, incandescent accents.

### Palette Architecture
- **Primary Accent (`#FF385C` - Vibrant Coral Rose):** Directs immediate visual action, reservation commitments, active favorites, and primary interactions.
- **Secondary Accent (`#FFB400` - Amber Gold):** Used sparingly for guest ratings, exclusive sanctuary badges, host achievements, and warm atmospheric highlights.
- **Dark Surface Hierarchy:**
  - `Canvas (#121214)`: Base background underpinning screens.
  - `Subtle (#1A1A1E)`: Primary card shells, bottom navigation dock, and recessed inputs.
  - `Raised (#24242A)`: Modals, bottom sheets, snackbars, and elevated filter panels.
  - `Highlight (#2E2E36)`: Subtle structural borders, divider rules, and active states.
- **Crisp Typography Tiers:**
  - `Primary Text (#F4F4F6)`: Headlines, titles, active labels, and primary values.
  - `Secondary Text (#A1A1AA)`: Descriptions, metadata, location tags, and dates.
  - `Muted Text (#71717A)`: Captions, disabled indicators, and structural placeholder text.

## Typography

The typographic hierarchy utilizes Plus Jakarta Sans exclusively across all roles. Its geometric balance and organic geometric terminals soften the starkness of a dark UI, delivering high legibility with an editorial personality.

### Application Rules
- **Display & Headlines:** Use negative letter spacing on titles above 20px to lock headings tight and create an authentic editorial feel.
- **Body & Longform:** Maintain relaxed line heights (`1.5` to `1.6`) in `body-lg` and `body-md` to ensure effortless reading against `#121214`.
- **Labels & Overlines:** Use `label-sm` in uppercase with wider tracking (`0.06em`) for room categories, amenity tags, and superhost flags.

## Layout & Spacing

A mobile-first fluid layout model calibrated for handheld touch dynamics and comfortable reading distances.

### Layout Rhythm
- **Columns & Margins:** Fluid 4-column structure for mobile viewports with `1.25rem` screen edge padding. Expands to 8 columns with `2rem` margins on larger viewports.
- **Vertical Spacing:** Section containers are spaced using multiples of `1.5rem` (`space-lg`) and `2rem` (`space-xl`) to give photography breathing room.
- **Horizontal Immersion:** Media carousels break outside outer margins with negative offsets to provide full-bleed edge bleed swiping.

## Elevation & Depth

Visual hierarchy relies on layered tonal surfaces combined with razor-thin structural borders, rather than muddy drop shadows.

### Tonal Stratification
- **Level 0 (Canvas):** `#121214` - Raw page background.
- **Level 1 (Card Baseline):** `#1A1A1E` with a 1px solid border of `#2E2E36`.
- **Level 2 (Floating Overlays):** `#24242A` for search pillbars, date floaters, and guest steppers with a subtle warm-tinted shadow: `0 8px 24px rgba(0, 0, 0, 0.45)`.
- **Level 3 (Modal / Bottom Sheet):** `#24242A` accented by a top outline stroke of `#2E2E36` and deep backdrop veil `rgba(18, 18, 20, 0.8)`.

### Border Discipline
All card surfaces and floating panels feature explicit 1px boundary lines rendered in `#2E2E36` to retain edge precision on OLED and high-contrast displays.

## Shapes

The interface embraces a balanced curvature model centered on an 8px base grid (`roundness: 2`).

### Corner Radius Allocation
- **Standard UI Elements (`0.5rem` / 8px):** Input fields, compact card media frames, steppers, and notification snacks.
- **Large Structural Containers (`1rem` / 16px):** Bottom sheet top corners, property gallery tiles, and modular booking surfaces.
- **Interactive Capsules:** Filter tags, category selectors, and primary pill actions use full radius curves to signal direct touch feedback.

## Components

### Buttons & Interactive Controls
- **Primary Reservation Action:** Full-width pill or 12px rounded button in `#FF385C` with crisp white text (`#F4F4F6`). Focus and press states shift luminance slightly deeper without losing saturation.
- **Secondary Surface Action:** Background in `#24242A`, border in `#2E2E36`, text in `#F4F4F6`.
- **Ghost Action:** Borderless, subtle text in `#A1A1AA`, transitioning to `#F4F4F6` when pressed.

### Cards & Sanctuary Showcases
- **Listing Shells:** Structured on `#1A1A1E` background, enclosed with a 1px `#2E2E36` border and 16px corner radius.
- **Image Gallery Aspect:** 4:3 or 1:1 rounded ratio with a faint inner gradient scrim (`rgba(18, 18, 20, 0.35)`) at the base for price readability.
- **Metadata Layout:** Bold pricing in `#F4F4F6`, location and distance in `#A1A1AA`, and rating display paired with an amber `#FFB400` star glyph.

### Dark Bottom Sheets
- **Backdrop:** Dimmed with `rgba(18, 18, 20, 0.85)` supporting a blur filter.
- **Sheet Architecture:** `#24242A` fill, bordered along the top edge by `#2E2E36`. Top header incorporates a centered drag handle: 36px wide, 4px high, colored `#71717A` with 9999px radius.

### Dark Snackbars & Toasts
- **Surface:** `#24242A` floating pill or 8px rounded container.
- **Border:** 1px stroke of `#2E2E36` with high-contrast text (`#F4F4F6`).
- **Icons:** Accented using `#FF385C` for alerts or `#FFB400` for confirmations.

### Dark Segmented Switches
- **Track Base:** Recessed `#1A1A1E` pill container with 4px inner padding.
- **Active Segment:** Elevated `#2E2E36` pill with `#F4F4F6` text and an instant, soft spring slide animation.
- **Inactive Segment:** Text in `#71717A`, shifting to `#A1A1AA` on hover.

### Guest Steppers
- **Frame:** `#1A1A1E` pill capsule with `#2E2E36` border.
- **Buttons:** Circular 32px touch targets with a `#24242A` fill and `#F4F4F6` operator icons (+/-).
- **Disabled State:** Opacity drops to `0.3` with text colored `#71717A` when minimum value is reached.

### Switches & Badges
- **Toggle Switches:** Unchecked track in `#2E2E36` with a `#71717A` thumb; checked track in `#FF385C` with a crisp `#F4F4F6` thumb.
- **Sanctuary Badges:** Pill-shaped capsules using 10% `#FFB400` tint as fill, `#FFB400` border at 40% opacity, and bright amber gold text for superhost/verified status tags.