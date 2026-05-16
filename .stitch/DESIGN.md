---
name: Regards Perdus
stitch_project: projects/1262521103381763072
stitch_design_system: assets/fbcc798efcef42df84b547d6f79473be
concept: The Cinematic Gaze
color_mode: dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c8c7be'
  outline: '#929189'
  outline-variant: '#474741'
  primary: '#ffffff'
  on-primary: '#31302d'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  custom-cream: '#f5f2ed'
  custom-charcoal: '#121212'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
  bilingual-subtext:
    fontFamily: EB Garamond
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  margin-desktop: 80px
  margin-mobile: 24px
  gutter: 32px
  section-gap: 160px
  stack-sm: 8px
  stack-md: 24px
rounded:
  all: 0
---

## Brand & Style
The design system is anchored in the concept of "The Cinematic Gaze"—an approach that treats the browser window as a viewfinder. The brand personality is quiet, intellectual, and observational, mirroring the "lost looks" (Regards Perdus) of travel photography.

The visual style is **Minimalist Editorial**. It prioritizes high-resolution imagery by using deep, immersive backgrounds to eliminate peripheral visual noise. Borrowing from high-end fashion and art publications, the system employs generous "negative space" not as empty room, but as a structural element to guide the eye. Every interaction is designed to feel intentional and slow, evoking the tactile quality of a physical photo book.

## Colors
This design system operates on a **default dark mode** to maximize the perceived contrast and vibrancy of photography.

- **Neutral (Deep Charcoal):** The primary canvas is an off-black (#121212), which prevents the "harshness" of pure black while providing a void-like depth.
- **Primary (Soft Cream):** Used for primary text and core UI elements. This warm white (#F5F2ED) provides a softer, more sophisticated contrast than stark white.
- **Secondary (Muted Gold):** Reserved for interactive highlights, subtle borders, or "active" states. Used sparingly to maintain a sense of luxury.
- **Surface:** A slightly lighter charcoal (#1A1A1A) used for cards or secondary containers to create subtle depth without relying on shadows.

## Typography
A classic serif-and-sans pairing to balance historical weight with modern clarity.

- **EB Garamond** for all narrative elements, headings, and the bilingual French translations. Classical proportions lend the site an authoritative, literary feel.
- **Hanken Grotesk** for the utilitarian tasks—metadata, navigation, labels. Sharp, contemporary geometry provides a functional counterpoint to the serif.

**Bilingual strategy:** For EN/FR content, the primary language (EN) uses `body-md` in Soft Cream. The secondary language (FR) appears immediately below or beside it using `bilingual-subtext` in EB Garamond at 60% opacity to denote it as a translation while maintaining editorial rhythm.

## Layout & Spacing
A **Fixed 12-Column Grid** for desktop, centered within the viewport. Spacing is intentionally over-sized to create an atmosphere of calm.

- **Hero sequence:** Images frequently break the grid, using full-bleed or 10-column widths to emphasize scale.
- **Asymmetric balance:** Use offset columns (e.g., text spanning columns 2–5, image spanning 7–12) to mimic a physical photography monograph.
- **Section gaps:** Vertical rhythm uses large `section-gap` units (160px), ensuring chapters have visual breathing room.
- **Bilingual stacking:** Related EN/FR text blocks group with `stack-sm` (8px); distinct paragraphs use `stack-md` (24px).

## Elevation & Depth
Rejects heavy shadows in favor of **Tonal Layering** and **Line-based Depth**.

- **Surfaces:** Depth via slightly lighter `#1A1A1A` backgrounds.
- **Ghost border:** 1px solid borders in low-opacity Cream (10–15%) to define image containers or navigation.
- **Transitions:** Soft opacity fades, not physical movement, to keep the cinematic feel.
- **Backdrop blur:** Heavy 20px blur on charcoal for overlays (mobile menu) so photography underneath stays present.

## Shapes
**Sharp (0)** corner radius everywhere. Every element—image containers, buttons, inputs—has 90-degree corners, evoking the edges of a printed photograph and the architectural quality of the grid. No rounded corners.

## Components
- **Buttons:** "Text links" or "ghost buttons". Primary buttons: 1px Soft Cream border + `label-caps` text. Hover fills with Soft Cream and Off-Black text.
- **Chips/tags:** Minimalist tags for Location/Year. 1px border, no background, `label-caps`.
- **Image cards:** No padding, no shadows. Image fills the container. Captions below in `bilingual-subtext`.
- **Input fields:** Single 1px bottom border in Muted Gold. No background. Labels in `label-caps`.
- **Bilingual toggle:** Discreet header switch using `label-caps`. Active language underlined with a 1px Muted Gold stroke.
- **Navigation:** Top-aligned, persistent, minimal. Wide letter-spacing for legibility and elegance.

## Notes
- This design system was generated by Stitch with no UI/UX guidance from the team (features-only prompts). Treat it as the v1 source of truth.
- The Stitch project is at `projects/1262521103381763072`; the design system asset is at `assets/fbcc798efcef42df84b547d6f79473be`.
- Generated screens (HTML + screenshots) live in `.stitch/designs/`.
