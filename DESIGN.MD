---
name: Tripgroup
version: 1.0.0
author: Jules
---

# DESIGN.MD

## Philosophy
- **Editorial**: High-contrast typography, large headings, and a focus on whitespace.
- **Atmospheric**: Use of gradients, blurs, and subtle animations to create a sense of depth and travel.
- **Minimalist**: Clean interfaces with essential information only, using glassmorphism for layering.

## Color Palette
- **Brand**: `#FF6321` (High-energy orange)
- **Background**: `#050505` (Deep black)
- **Surface**: `rgba(255, 255, 255, 0.05)` (Glass effect)
- **Border**: `rgba(255, 255, 255, 0.1)` (Subtle separation)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `rgba(255, 255, 255, 0.4)` (Micro-labels and secondary info)

## Typography
- **Serif (Headings)**: "Playfair Display", serif. Used for editorial titles and emphasis.
- **Sans (Body)**: "Inter", sans-serif. Used for general interface and body text.
- **Mono (Meta)**: "JetBrains Mono", monospace. Used for micro-labels, budgets, and timestamps.

## Spacing & Grid
- **Base Unit**: 4px
- **Border Grid**: 40px x 40px background grid pattern.
- **Margins**: 24px (Mobile) / 48px+ (Desktop)

## Components

### Glass Card
- **Background**: `white/5` with `backdrop-blur-md`.
- **Border**: `white/10`.
- **Radius**: `1.5rem` (24px).
- **Hover**: Increase border opacity and add subtle brand-colored shadow.

### Editorial Title
- **Font**: Serif, Italic.
- **Style**: Tight tracking, leading `0.85`.
- **Effect**: Gradient from `white` to `white/20`.

### Micro Label
- **Font**: Mono.
- **Style**: Uppercase, wide tracking (`0.4em`), `10px` size.
- **Color**: `white/40`.

## Animations
- **Float**: 6s ease-in-out infinite vertical motion.
- **Transitions**: 300ms ease-in-out for hover states.
- **Entrance**: Fade and slide up (using Framer Motion).

## AI Instructions
- Use Tailwind CSS 4 for styling.
- Maintain the high-contrast, dark-mode aesthetic.
- Prioritize `Playfair Display` for brand-heavy elements and `Inter` for functional UI.
- Use `motion/react` (Framer Motion) for all state transitions and entrances.
