# Performance budgets and device validation

These are targets, not measured results. The engine adapts render scale when sustained FPS is low, caps DPR at 1.5 on touch devices, uses instancing for repeated foliage/clouds and pauses while hidden.

| Metric | Desktop target | Mid-phone target |
|---|---:|---:|
| Frame rate | 60 FPS | stable 30+ FPS |
| Render scale | up to 2 DPR | up to 1.5 DPR |
| Shadow map | 1536 | 768 |
| Bloom | adaptive on | adaptive/off under load |

Before release test Chrome at 1920×1080 and Android Chrome on a physical phone in portrait and landscape. Rotate, background/foreground the app, enter and leave ten times, check memory after ten minutes, inspect all four world phases and capture real frame-time data. Do not claim a measured budget without device captures.
