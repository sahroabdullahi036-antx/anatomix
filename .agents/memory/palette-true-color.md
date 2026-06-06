---
name: Palette true-color exemption
description: How to keep fixed colors/images from shifting under the global App palette filter in the v2 Body Explorer
---

The whole app is wrapped in a CSS `filter` from `usePalette()` (App.tsx) built by `buildFilter()` (invert/hue-rotate/saturate/brightness). This recolors EVERYTHING beneath it.

To make an element show its TRUE color regardless of palette, apply `inverseFilter` (from `usePalette()`, computed by `invertFilter()` in ThemeContext) to it, OR put it inside a wrapper that has `filter: inverseFilter`. The inverse reverses function order and applies each function's inverse, cancelling the parent filter on that subtree.

**Why:** Body Explorer system colors and anatomy images must stay anatomically correct and NOT change when the user switches palettes.

**How to apply:** Any NEW element that uses a fixed hex (e.g. `SYSTEM_COLORS`) or an anatomy image must get `filter: inverseFilter`. Dots/labels inside the zoom figure wrapper already inherit it because that wrapper carries the inverse filter; standalone spots (breadcrumb label, header image, list thumbnails, colored heading) each need it explicitly. Easy to miss — grep `SYSTEM_COLORS` after edits.

The palette swatch previews in AccountSettings live inside the same App-root filter, so a swatch showing palette X via `swatchFilter(X)` gets double-filtered (active palette on top of X) and looks wrong. Fix: combine as `[swatchFilter(X), inverseFilter].filter(f=>f && f!=="none").join(" ") || "none"` so the active filter is cancelled and only X's true color shows. Drop `none` tokens or the CSS filter list is invalid.

Part/system images live in `attached_assets/generated_images/{systems,parts}/<id>.png`, loaded via `import.meta.glob`, keyed by filename id (= part/system id). Missing image falls back gracefully to a colored dot / system image.

## Palette names must match the rendered hue
Each palette in `PALETTES` (ThemeContext) is just a `hue-rotate(...) saturate(...)` filter applied over a fixed blue-grey base (swatch accent `#4a6080`, hue ~216 deg). The label is NOT independent of the filter: the displayed color = base hue shifted by the hue-rotate. Picking a hue-rotate value without checking against the base produced totally wrong names (e.g. "emerald" rendered magenta, "violet" rendered green, "crimson" rendered teal).

**Why:** user complained palette names were inaccurate.

**How to apply:** when adding/renaming a palette, compute the actual result by applying the CSS `hue-rotate`/`saturate` matrices to the base accent and read off the resulting hue (do this in code_execution, not by eye). The CSS hue-rotate matrix is the SVG feColorMatrix spec form; a +deg shift is roughly linear, so solve numerically for the deg that lands on the target hue, then name by the result. Light mode prepends `invert(1) hue-rotate(180deg)` (LIGHT_BASE) but names are judged in dark mode (default).
