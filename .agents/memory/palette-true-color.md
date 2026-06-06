---
name: Palette true-color exemption
description: How to keep fixed colors/images from shifting under the global App palette filter in the v2 Body Explorer
---

The whole app is wrapped in a CSS `filter` from `usePalette()` (App.tsx) built by `buildFilter()` (invert/hue-rotate/saturate/brightness). This recolors EVERYTHING beneath it.

To make an element show its TRUE color regardless of palette, apply `inverseFilter` (from `usePalette()`, computed by `invertFilter()` in ThemeContext) to it, OR put it inside a wrapper that has `filter: inverseFilter`. The inverse reverses function order and applies each function's inverse, cancelling the parent filter on that subtree.

**Why:** Body Explorer system colors and anatomy images must stay anatomically correct and NOT change when the user switches palettes.

**How to apply:** Any NEW element that uses a fixed hex (e.g. `SYSTEM_COLORS`) or an anatomy image must get `filter: inverseFilter`. Dots/labels inside the zoom figure wrapper already inherit it because that wrapper carries the inverse filter; standalone spots (breadcrumb label, header image, list thumbnails, colored heading) each need it explicitly. Easy to miss — grep `SYSTEM_COLORS` after edits.

Part/system images live in `attached_assets/generated_images/{systems,parts}/<id>.png`, loaded via `import.meta.glob`, keyed by filename id (= part/system id). Missing image falls back gracefully to a colored dot / system image.
