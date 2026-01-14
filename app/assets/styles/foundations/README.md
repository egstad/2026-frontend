# Foundations

This directory contains the core design system foundations that establish consistent styling patterns across the entire project. All foundation files are included within the global SCSS file (`_global.scss`) making their CSS custom properties available throughout the application.

## Files

### `reset.scss`

Provides a comprehensive CSS reset that normalizes browser default styles and establishes consistent baseline styling. Includes Eric Meyer's reset for removing default margins, padding, and styling, plus custom enhancements for font smoothing, box-sizing, and foundational typography settings. Sets up the basic styling foundation that other styles build upon.

### `units.scss`

Defines a comprehensive spacing and sizing scale using CSS custom properties. These units serve as the foundation for consistent spacing (padding/margin) and element dimensions throughout the design system. The scale uses intuitive naming conventions from `tiniest` to `hugest` and includes responsive scaling for desktop viewports.

### `color.scss`

Establishes the color palette using semantic naming conventions for a clean, maintainable foundation. Implements background/foreground hierarchies with clear contrast relationships and interactive color variations. Designed to scale from this succinct approach to comprehensive color systems with systematic naming (gray-10 through gray-100, etc.) and expanded semantic categories (status, surfaces, accent colors, etc.).

### `layout.scss`

Defines layout-related CSS custom properties including grid margins and gaps. Uses responsive scaling to adapt layout spacing for different viewport sizes while maintaining consistent proportions across the design system.

### `typography.scss`

Establishes the typography scale using CSS custom properties for consistent font sizes and line heights. Includes micro, caption, body, and headline levels designed to work with fluid scaling. Each level provides both size and leading values for optimal readability across the design system.

### `effects.scss`

Defines visual effects including border radius, transition durations, and easing functions. Uses the same scale as units for border radius consistency. Includes standard animation timings and easing curves for consistent motion design throughout the project.

### `motion.scss`

Establishes global transition and animation variables for consistent motion design. Includes duration scales (instant to slower), comprehensive easing functions (linear to bounce), pre-built transition combinations, and animation delays. Provides a complete motion language for smooth, purposeful animations throughout the interface.
