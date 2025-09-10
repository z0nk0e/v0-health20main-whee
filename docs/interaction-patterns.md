# Interaction Patterns

- Search micro-interactions
  - Autocomplete with animated dropdown and ARIA roles (`role=listbox`, `role=option`).
  - Thin animated header progress bar during searches.
  - Sonar pulse overlay while searching; staggered reveal of results.
  - URL sync for back/forward nav: `?q=<drug>&r=<radius>`.
  - Variable reward toasts at 3/7/15 searches (localStorage key `rx_search_count`).

- Navigation
  - Breadcrumbs computed from path segments via [`healf-main/components/breadcrumbs.tsx`](file:///workspaces/v0-health20main-whee/healf-main/components/breadcrumbs.tsx).
  - Added Home/Back links on auth screens.

- Conversion helpers
  - Signup: added social proof subtitle; prominent Home/Back escape.
  - Subscription: trust line under title (secure PayPal checkout • no hidden fees • cancel anytime).

- Accessibility & tokens
  - Uses existing Tailwind tokens and `tailwindcss-animate` for subtle animations.
  - Inputs preserve focus-visible rings; suggestion list uses ARIA attributes.

## Usage

- Breadcrumbs: import and render `<Breadcrumbs />` in page headers.
- Search URL sync: call `onSearch` from `SearchInterface` or push `?q`/`r` via router; component reads `defaultQuery` and hydrates.
- Achievement toasts: Toaster already wired in `Providers`.
