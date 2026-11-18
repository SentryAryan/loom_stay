---
name: Warm Editorial Sanctuary Mobile
colors:
  surface: '#fbf8ff'
  surface-dim: '#f2d3d3'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#F8FAFC'
  surface-container: '#F1F5F9'
  surface-container-high: '#E2E8F0'
  surface-container-highest: '#fbdbdc'
  on-surface: '#0F172A'
  on-surface-variant: '#64748B'
  inverse-surface: '#303035'
  inverse-on-surface: '#f2eff6'
  outline: '#CBD5E1'
  outline-variant: '#F1F5F9'
  surface-tint: '#be0038'
  primary: '#ba0036'
  on-primary: '#ffffff'
  primary-container: '#e21e4a'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb2b6'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#feb300'
  on-secondary-container: '#6a4800'
  tertiary: '#545c72'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c748b'
  on-tertiary-container: '#fefcff'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#FEE2E2'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb2b6'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#920029'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#ffba35'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#fbf8ff'
  on-background: '#1b1b20'
  surface-variant: '#e4e1e8'
  success: '#10B981'
  success-container: '#D1FAE5'
  warning: '#F59E0B'
  warning-container: '#FEF3C7'
  info: '#3B82F6'
  info-container: '#DBEAFE'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.02em
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
  margin: 1rem
  margin-tablet: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
---

## Brand & Style

The design system establishes a warm, aspirational, and deeply trustworthy mobile travel booking experience tailored for iOS and Android. It pairs the warmth of an editorial interior journal with the tactile ergonomics of native handheld interfaces. 

- **Design Philosophy:** Tactile Human-Centric Minimalism. The interface acts as a quiet, linen-and-glass mat for photography and experiential discovery, balancing soft tactile controls with instantaneous transactional feedback.
- **Target Audience:** Design-conscious travelers and vacation rental hosts who expect crisp information density, effortless one-thumb ergonomics, and tactile native polish.
- **Emotional Response:** Inspires wanderlust, evokes domestic ease, and instills absolute security during checkout and navigation.

## Colors

The color palette centers on clean, warm whites and soft blush-neutral tones balanced by vibrant action tones and structured ink slates:

- **Primary Coral (`#FF385C`):** Drives vital conversion moments, tab indicators, active state highlights, and primary booking triggers.
- **Secondary Warm Gold (`#FFB400`):** Reserved for star ratings, Superhost seals, and quality badges.
- **Tertiary Dark Neutral (`#0F172A`):** Replaces harsh black with deep inky slate for typography, active segment selectors, dark floating feedback pills, and crisp icons.
- **Neutral & Containers:** `#FBF8FF` and `#FFFFFF` establish warm, inviting page foundations, while `#F8FAFC`, `#F1F5F9`, and `#E2E8F0` provide surface separation without heavy borders.
- **Status & Semantics:**
  - `success` (`#10B981` / `#D1FAE5`): Booking confirmations and verified amenities.
  - `warning` (`#F59E0B` / `#FEF3C7`): Urgent inventory warnings and cancellation thresholds.
  - `error` (`#EF4444` / `#FEE2E2`): Form validation errors and transaction issues.
  - `info` (`#3B82F6` / `#DBEAFE`): Guest instructions and check-in updates.

## Typography

Typography relies on **Plus Jakarta Sans** for its friendly geometry, open apertures, and excellent legibility across compact mobile screens:

- **Mobile Viewport Rhythms:** Headline levels automatically throttle to their mobile counterparts (`display-lg-mobile`) to prevent orphan words and awkward line wrapping.
- **Tabular Numerics:** Pricing tiers, dates, and stepper readouts must enforce tabular figure styling (`font-feature-settings: "tnum"`) to avoid horizontal shifts during real-time updates.
- **Micro-Labels & Metadata:** All compact UI labels (`label-sm`, `label-md`) use positive letter spacing (`0.01em` to `0.02em`) with medium to bold weights to stay crisp under bright ambient sunlight.

## Layout & Spacing

A strict 4px/8px incremental grid governs handheld ergonomics across iOS and Android viewports:

- **Touch Hit Target Enclosure:** All touch controls (stepper buttons, filter pills, tab triggers, and check targets) must provide a minimum interactive envelope of `44px × 44px` on iOS and `48px × 48px` on Android.
- **Canvas Margins:** Screen margins default to `16px` (`margin`) on phones, scaling to `24px` or `32px` on tablets and wide foldables.
- **Edge-to-Edge & Safe Areas:** Full-bleed card carousels ignore outer canvas margins with negative offsets, while floating bars, snackbars, and bottom drawers strictly include `env(safe-area-inset-bottom)` plus `12px` to prevent overlap with native gesture home indicators.

## Elevation & Depth

Visual hierarchy uses soft diffused ambient illumination, semi-transparent frosted scrims, and subtle structural boundaries:

- **Backdrop Scrim:** Layered modal overlays utilize `rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(8px)`.
- **Level 1 (Subtle Containers & Surface Badges):** Zero shadow; defined strictly by a `1px` border of `#E2E8F0` or a surface shift to `#F8FAFC`.
- **Level 2 (Pills, Chips & Steppers):** `box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Floating Bars, Toasts & Segment Thumbs):** `box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Bottom Sheets & Modals):** `box-shadow: 0 -8px 32px rgba(15, 23, 42, 0.08)`, combined with an upper border stroke of `1px solid rgba(226, 232, 240, 0.8)`.

## Shapes

The design system applies a rounded shape language (`roundedness: 2`) with contextual pill-shaped extensions:

- **Pill Elements (`rounded-full` / `9999px`):** Used on all interactive buttons, filter chips, segmented controls, guest steppers, floating search pills, and badges.
- **Sheets & Modals (`rounded-xl` / `1.5rem` / `24px`):** Applied to the top edges of draggable bottom sheets and floating alert dialogs.
- **Inputs & Cards (`rounded-lg` / `1rem` / `16px`):** Applied to text fields, preview carousels, and amenity cards.

## Components

### 1. Feedback & Status

#### Toasts & Snackbars
- **Container:** Floating horizontal capsule (`min-height: 48px`, max-width `calc(100vw - 32px)`), positioned floating above bottom tab bars (`safe-area + 76px`) or sticky reservation footers.
- **Variants:**
  - *Dark Capsule (Default):* Background `#0F172A`, text `#FFFFFF`, leading `18px` icon, trailing interactive action (e.g., "Undo" in `#FF385C` bold `label-md`).
  - *Light Capsule:* Background `#FFFFFF`, border `1px solid #E2E8F0`, elevation Level 3, text `#0F172A`, trailing action in `#FF385C`.
- **Dismissal:** Automatically fades out after 4 seconds; swipeable horizontally; pauses on press-and-hold.

#### Badges & Status Pills
- **Dot Badge:** `8px × 8px` solid `#FF385C` circle with `2px` white outline cutout, anchored to the top-right of navigation icons.
- **Unread Counter Badge:** Height `18px`, min-width `18px`, padding `0 5px`, fully pill-rounded. Background `#FF385C`, text `#FFFFFF`, styled with `label-sm`. Values above 99 display as `99+`.
- **Superhost & Verification Badge:** Height `24px`, padding `0 10px`, pill-shaped. Background `#FFF8F7`, border `1px solid #FFB400`, leading `14px` star icon in `#FFB400`, text `label-sm` in `#0F172A`.
- **Active / Instant Book Badge:** Soft background `#D1FAE5`, text `#065F46`, leading `12px` bolt icon.

---

### 2. Interactive Controls & Forms

#### Guest Steppers
- **Anatomy:** Horizontal control pairing label/sublabel on the left with a `(-) [count] (+)` cluster on the right.
- **Buttons:** `36px × 36px` circular pill buttons, border `1px solid #CBD5E1`, background `#FFFFFF`, active press down-scale (`0.94`).
- **Disabled State:** When value meets limits (e.g., 0 guests), border shifts to `#F1F5F9`, icon to `#CBD5E1`, and pointer events are disabled.
- **Display:** Min-width `32px`, centered number in `headline-md`, tabular figure spacing.

#### Segmented Controls
- **Track:** Height `44px`, background `#F1F5F9`, rounded `full`, padding `4px`.
- **Sliding Thumb:** Pill-shaped white surface (`#FFFFFF`), elevation Level 2, spring-animated sliding transition between options (e.g., "Stays" vs "Experiences" or "List" vs "Map").
- **Labels:** `label-md`. Selected label is `#0F172A` (weight `700`); unselected label is `#64748B` (weight `500`).

#### Filter Chips & Tags
- **Height & Sizing:** `36px` height, pill-rounded (`9999px`), padding `0 16px`.
- **Outline (Unselected):** Background `#FFFFFF`, border `1px solid #CBD5E1`, label `#0F172A`.
- **Selected:** Background `#0F172A`, border `1px solid #0F172A`, text `#FFFFFF`. Optional leading checkmark or count bubble in `#FF385C`.
- **Dismissible Tag:** Trailing `14px` cross icon with dedicated `24px` tap target.

#### Switch Toggles & Checkbox Rows
- **Switch Toggle:** Track `50px × 30px` (rounded full), thumb `26px` circle in white with Level 2 shadow. Active track in `#0F172A` (or `#FF385C` for Instant Book); inactive track in `#E2E8F0`. Hit target padded to `48px`.
- **Checkbox Row:** Full row touch target (`min-height: 52px`), title in `body-lg`, optional supporting detail in `body-sm` (`#64748B`). Checkbox box is `22px × 22px` (`rounded: 6px`, border `2px solid #CBD5E1`), transitioning to `#0F172A` with white checkmark when checked.

#### Mobile Text Fields & Search Pills
- **Floating Search Pill:** Height `52px`, pill-shaped, background `#FFFFFF`, border `1px solid #E2E8F0`, Level 2 shadow. Leading search glyph, stacked query summary ("Where to? • Any week • Add guests"), trailing circular filter button.
- **Form Text Field:** Container height `56px`, `rounded-lg` (`12px`), background `#FFFFFF`, border `1px solid #CBD5E1`. Floating label rests at `body-md` and scales to `label-sm` (`#64748B`, top `8px`) upon focus or content.
- **Actions:** Trailing circular clear button (`18px`) appears on entry; trailing visibility toggle for secure fields.

---

### 3. Overlays & Navigation

#### Bottom Sheet Drawers
- **Anatomy:**
  - Drag handle (`36px × 4px`, `#CBD5E1`, rounded `full`) centered at top with `10px` top padding.
  - Sticky header with `headline-lg` title and right-aligned circular dismiss button (`32px × 32px`, `#F1F5F9`).
  - Scrollable content body with fade mask at base.
  - Sticky bottom action bar with `16px` padding and safe-area margin. Contains left-aligned "Clear all" button and right-aligned primary coral pill ("Show 120+ stays").
- **Detents:** Half-sheet (`55% vh`) for quick filters and guest selection; full-sheet (`92% vh`) for date pickers and detailed amenities.
- **Scrim:** `#0F172A` at `45%` opacity with `8px` backdrop blur.

#### Bottom Navigation Bar
- **Dimensions:** Height `56px` + `env(safe-area-inset-bottom)`.
- **Surface:** `#FFFFFF` background with top hairline stroke `1px solid #E2E8F0`.
- **5-Tab Layout:** Even distribution across 5 tabs (Explore, Wishlists, Trips, Messages, Profile).
- **Tab State:**
  - *Active:* Icon and text label rendered in `#FF385C` with spring bounce on select.
  - *Inactive:* Icon and text rendered in `#64748B`.
  - *Badging:* Support for unread numeric pill or coral dot badge anchored to tab icon top-right.

#### Action Sheets & Modal Alerts
- **Modal Alert:** Centered dialog, width `calc(100% - 48px)`, max-width `360px`, rounded `24px`, background `#FFFFFF`, padding `24px`. Title in `headline-lg`, body in `body-md` (`#64748B`). Primary action stacked above secondary ghost button.
- **Action Sheet:** Anchored to bottom edge with `12px` side margins, stacked pill options with `1px` inner dividers, separate floating "Cancel" pill container at the base.