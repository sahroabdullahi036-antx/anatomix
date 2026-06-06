---
name: Body Explorer layered viewer
description: How the "almost 3D" anatomy viewer in BodyReference.tsx is built (layer stack, peel, zoom, highlight)
---

# Body Explorer layered viewer

The Body Explorer is an aligned 2D layer stack (NOT real 3D), per a user decision: BOTH peelable layers AND tap-to-zoom-and-highlight on the same figure. The user explicitly dropped separate per-part images.

## Assets
- 12 aligned full-body PNGs at `attached_assets/generated_images/layers/{male,female}_{skin,muscle,skeleton,organs,circulatory,nervous}.png`, 768x1408 (9:16), transparent bg, one consistent flat-vector textbook style, identical standing pose/scale per gender so they register when stacked.
- Loaded via `import.meta.glob` keyed `${gender}_${layer}`.
- The old per-part (106) and per-system (12) image folders were DELETED (`generated_images/parts`, `generated_images/systems`) — do not re-add or depend on them.

## Peel model (the core math)
- `depth` is continuous 0..5 (index into LAYER_ORDER skin->muscle->skeleton->organs->circulatory->nervous).
- `opacityFor(i) = clamp(i - depth + 1, 0, 1)`; `z-index = LAYER_ORDER.length - i` so outer layers sit on top and fade out as depth grows, while deeper layers stay opacity 1 and show through transparent regions (the depth feel).
- Layer chips set integer depth; a range slider sets continuous depth.
- Size anchor: the FIRST AVAILABLE layer renders in-flow (block, h-full w-auto); the rest are absolute `inset-0 object-contain`. Anchor = `LAYER_ORDER.find(layerSrc)` so the figure keeps dimensions even if a layer is missing (don't hardcode index 0 as anchor).

## Tap-to-zoom + highlight
- Tapping a system dot sets `activeSystemId`, zooms the figure wrapper (`scale(1.7)`, `transform-origin` at the system's % hotspot), sets `depth = LAYER_ORDER.indexOf(SYSTEM_LAYER[id])`, and draws a pulsing highlight ring at the hotspot.
- HOTSPOTS_MALE / HOTSPOTS_FEMALE hold per-gender %coords; SYSTEM_LAYER maps each of the 12 systems to its primary layer.

## inverseFilter boundary rule (important)
- The figure wrapper has `filter: inverseFilter` which (composed with the App-root palette filter) renders its whole subtree in true colors. So elements INSIDE the wrapper (layer imgs, hotspot dots, tooltip, highlight ring) must NOT apply `inverseFilter` again — doing so double-applies and shifts colors.
- Elements OUTSIDE the wrapper that need true SYSTEM_COLORS (breadcrumb heading, layer chip swatches, right-panel list dots, panel headings) DO keep `inverseFilter`.
