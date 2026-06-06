---
name: Dashboard tile two-tone coloring
description: Why dashboard module tiles use two specific blue shades and how the global palette filter interacts with them
---
Dashboard MODULES tiles (client/src/pages/v2/Dashboard.tsx) use two constants: TILE for every standard tile and MP_TILE (a lighter, more saturated shade) for the Multiplayer tile only.

**Rule:** Both TILE and MP_TILE must stay on the same blue hue (~216, matching base accent #4a6080).

**Why:** The whole app is wrapped in a single CSS hue-rotate palette filter (App.tsx). If a tile is authored in a different hue, the global filter rotates it to an off-color. Keeping both tile colors on the blue base hue means the filter recolors them in lockstep for every palette, so the Multiplayer tile stays a distinct-but-harmonious shade in all 20 palettes instead of only in blue.

**How to apply:** When changing tile colors or adding a tile that must be visually distinct, pick a different lightness/saturation of the SAME blue base hue, never a different hue.
