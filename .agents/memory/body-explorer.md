---
name: Body Explorer hotspots
description: How the BodyReference anatomy page is built (illustration + clickable hotspots) and the constraint on hotspot coordinates
---

# Body Explorer (BodyReference.tsx)

The anatomy page (`/body-reference`, `/explorer`) shows ONE generated cartoon
full-body illustration (`@assets/generated_images/systems/_body.png`) with
absolutely-positioned clickable `<button>` hotspots overlaid. Each hotspot maps
to a system id in `medicalData.SYSTEMS` and opens the existing drill-down panel
(`activeSystemId` + `drillPath`). Per-system illustrations
(`@assets/generated_images/systems/<id>.png`) are shown as the panel header art.

**Why this design:** the original version stacked all 11 systems' hand-coded SVG
organ paths on one silhouette in the same coordinate space — overlapping shapes,
fighting click targets, "cluttered and unclickable." The user explicitly wanted a
real illustration that is itself clickable (not cards).

**How to apply / constraint:** hotspot coordinates in the `HOTSPOTS` array are
percentages tied to the EXACT composition of `_body.png`. The image renders
`h-full w-auto object-contain` inside a relatively-positioned inline-block box, so
percentages scale with the rendered image. If the body illustration is ever
regenerated, cropped, or its aspect ratio changes, every hotspot must be
recalibrated against the new art or the dots will drift off the organs.

`@assets/*` is aliased in BOTH `vite.config.ts` (runtime) and `tsconfig.json`
(types) — needed for the png imports to resolve.
