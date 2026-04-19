# Design System Specification: The Focused Scholar

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Academic Sanctuary."** 

In the high-stakes environment of online examinations, the UI must act as a calming, authoritative presence. We are moving away from the "clinical spreadsheet" aesthetic of legacy platforms and toward a "High-End Editorial" experience. This system balances the rigor of academia with the fluidity of modern SaaS.

To break the "template" look, we utilize **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, boxed-in grids, we use expansive white space and overlapping surface layers. This creates an interface that feels curated and premium, rather than merely functional.

---

## 2. Colors & Surface Philosophy
The palette is anchored by sophisticated forest and emerald greens, balanced by a range of cool, lithic neutrals.

### The Color Tokens (Material Design Convention)
- **Primary (Action):** `#006d4a` (Deep Emerald) | **On-Primary:** `#e6ffee`
- **Primary Container (Accent):** `#69f6b8` | **On-Primary Container:** `#005a3c`
- **Surface (Base):** `#f7f9fb`
- **Surface Container Lowest (Cards):** `#ffffff`
- **Surface Container Low (Sections):** `#f0f4f7`
- **Surface Container High (Modals):** `#e3e9ed`
- **Secondary (Utility):** `#526075` | **Tertiary (Focus):** `#2d676d`

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, designers must use background color shifts. A `surface-container-low` sidebar sitting against a `surface` background provides all the definition a user needs without the visual noise of a 1px line.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper. 
- Use `surface_container_low` for the main dashboard background.
- Use `surface_container_lowest` (Pure White) for the primary content cards.
- This "Natural Lift" creates a high-end feel that mimics physical layers rather than digital boxes.

### The "Glass & Gradient" Rule
For floating elements like "Time Remaining" sticky widgets or header bars, use **Glassmorphism**. Apply a semi-transparent `surface` color with a `backdrop-blur` of 12px. For primary CTAs, use a subtle linear gradient from `primary` (#006d4a) to `primary_dim` (#005f40) to add "soul" and depth.

---

## 3. Typography
We use a dual-typeface system to bridge the gap between "Premium Magazine" and "Data-Driven Dashboard."

- **Headlines & Display (Manrope):** Chosen for its geometric precision and modern personality. It commands authority in exam titles and candidate names.
- **Body & Labels (Inter):** The gold standard for legibility. Used for exam questions and complex data tables to ensure zero fatigue during long testing sessions.

### Typography Scale
- **Display LG (Manrope - 3.5rem):** Reserved for hero stats or welcome screens.
- **Headline SM (Manrope - 1.5rem):** Standard for page titles.
- **Title MD (Inter - 1.125rem):** For card headings and section titles.
- **Body LG (Inter - 1rem):** The primary font size for exam questions to ensure maximum readability.
- **Label MD (Inter - 0.75rem):** For metadata, table headers, and tags.

---

## 4. Elevation & Depth
This system rejects traditional "Drop Shadows" in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking." A card (`surface_container_lowest`) placed on a section (`surface_container_low`) creates a soft, natural lift.
- **Ambient Shadows:** When an element must float (e.g., a dropdown), use a shadow with a 24px blur and only 6% opacity. The shadow color should be tinted with `on_surface` (#2c3437) rather than pure black to keep the light "organic."
- **The Ghost Border:** If a container requires extra definition (e.g., a search input), use a "Ghost Border": the `outline_variant` token at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Cards & Tables
- **Cards:** Use `xl` (1.5rem) border-radius. No borders. Use vertical white space (32px+) to separate content within the card.
- **Tables:** Forbid the use of vertical or horizontal divider lines. Separate rows using a subtle background shift on hover or by using `surface_container_low` for the header row and `surface_container_lowest` for the body.

### Buttons
- **Primary:** `xl` (1.5rem) rounded corners. Gradient fill (Primary to Primary Dim). White text.
- **Secondary:** Tonal fill using `primary_container`. High contrast, soft appearance.
- **Tertiary:** No background. Bold `primary` text. Use for low-emphasis actions like "Cancel" or "View Details."

### Inputs & Fields
- **Search/Text Fields:** Large `md` (0.75rem) or `lg` (1rem) rounding. Background should be `surface_container_highest` to create an "etched" look into the surface.
- **Checkboxes/Radios:** Use `primary` for selected states. Ensure the "checked" icon is the high-contrast `on_primary` color.

### Chips (Badges)
- Use `full` (9999px) rounding.
- For "Status" chips (e.g., "Completed"), use `primary_container` with `on_primary_container` text. This provides a soft, "high-end" emerald glow rather than a harsh green.

---

## 6. Do's and Don'ts

### Do:
- **Do** use generous padding (32px, 48px) to let the typography breathe.
- **Do** use the `xl` (1.5rem) border radius for all main containers to maintain the "Soft Professionalism" vibe.
- **Do** use color shifts to indicate hierarchy.
- **Do** ensure exam questions use `body-lg` (Inter) for accessibility.

### Don't:
- **Don't** use 1px solid borders to separate dashboard modules.
- **Don't** use traditional "Material Design" high-elevation shadows; keep it flat and layered.
- **Don't** use pure black (#000000) for text. Always use `on_surface` (#2c3437) to maintain a premium, lithic feel.
- **Don't** clutter the screen. If a piece of data isn't vital to the examination process, move it to a "Details" layer.

---
**Director's Note:** Every pixel must feel intentional. If you find yourself adding a line to "fix" a layout, instead try adjusting the background tone or the white space. True premium design is about what you leave out.