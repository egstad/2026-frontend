# Styles Architecture

This directory contains the complete SCSS architecture for the design system, organized following atomic design principles and modern CSS methodologies.

## Structure

```
assets/styles/
├── _global.scss         # Main import file for Nuxt
├── _vars.scss          # SCSS variables (breakpoints, etc.)
├── _mixins.scss        # SCSS mixins and functions
├── foundations/        # Design system foundations
└── atoms/             # Component-level styles
```

## How It Works

All styles are consolidated through `_global.scss`, which forwards all foundation tokens and component styles. This file is automatically included by Nuxt via `vite.css.preprocessorOptions.scss.additionalData`, making all design tokens and styles available throughout the application.

## Design System Layers

### Foundations (`foundations/`)

Core design tokens and base styles that establish the visual foundation:

- **reset.scss** - CSS reset and baseline styles
- **units.scss** - Spacing and sizing scale
- **color.scss** - Color palette and semantic colors
- **layout.scss** - Layout-related properties
- **typography.scss** - Typography scale and font properties
- **effects.scss** - Visual effects (border radius, etc.)
- **motion.scss** - Animation and transition properties

### Atoms (`atoms/`)

Component-level styles for individual UI elements:

- **buttons.scss** - Button component styling
- **inputs.scss** - Form input component styling

## Usage

Design tokens are available as CSS custom properties throughout the application:

```scss
.example {
  padding: var(--unit-small);
  background: var(--background-primary);
  color: var(--foreground-primary);
  border-radius: var(--radii-small);
  transition: var(--transition-fast);
}
```

## Extending

When adding new styles:

1. **Foundations**: Add new design tokens to appropriate foundation files
2. **Components**: Create new files in `atoms/` for component styles
3. **Update**: Add new files to `_global.scss` and relevant README files
