# Tailwind CSS Implementation

## Overview

This project uses Tailwind CSS 4.0 for styling. All components have been converted to use Tailwind utility classes directly in the markup, eliminating the need for component-specific style blocks.

## Configuration

- Configuration is in `tailwind.config.mjs` 
- Tailwind is integrated via Vite using `@tailwindcss/vite` plugin
- The theme uses a dark mode color scheme by default

## Color Scheme

The design system uses a consistent dark theme with the following key colors:

- **Primary**: `#6200ea` (with dark and light variants)
- **Secondary**: `#03dac6`
- **Accent**: `#bb86fc`
- **Error**: `#cf6679`
- **Dark UI colors**:
  - Background: `#121212`
  - Surface: `#1e1e1e`
  - Elevated surface: `#2d2d2d`
  - Card: `#2c2c2c`
  - Text primary: `#e1e1e1`
  - Text secondary: `#b0b0b0`

## Custom Components

Custom component styles are defined in `app.css` using `@layer components`:

- `.btn` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card component with hover effects
- `.form-input` - Styled form input

## Utilities

The project uses several custom utilities:

- Custom shadows (dark-sm, dark, dark-md, dark-lg)
- Custom gradient backgrounds
- Custom scrollbar styling

## Responsive Design

The site is fully responsive with breakpoints:
- Mobile-first approach
- md: 768px and up
- lg: 1024px and up

## Plugins

- `@tailwindcss/forms` - For better form styling
- `@tailwindcss/typography` - For rich text content styling