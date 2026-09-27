# ARROW cinematic: 41-item implementation review

The September 26 video review mixed visual defects, reported intermittent failures,
and new direction. This change implements every requested treatment. It does not
claim that a physical iPhone crash is verified fixed without testing that phone.

## Architecture

- One 49-second clock drives scene boundaries, CSS animation times, canvas effects,
  and progress. No scene timeouts or independent canvas animation loops remain in
  the active experience. Visibility changes pause the clock.
- One persistent canvas, capped at 2.5 million pixels on desktop / 1.1 million
  on touch devices. Seeded particles, arrow geometry and the glow sprite are
  prepared before activation. No viewport-sized blur/filter/blend layers.
- One rotation owner for the flying arrow. Static brand marks always point up.
- One stylesheet, replacing the accumulated overlapping repair rules.
- Existing unused prototype components remain in the repository but are not
  imported by the active experience or included in its bundle.

## Item mapping

| Review item | Implemented treatment |
| --- | --- |
| 1. Sideways ignition arrow | Canvas craft always starts at −90°, with no delayed CSS rotation. |
| 2. Horizontal launch streak | Trail uses the same rotated canvas coordinates as the arrow. |
| 3. Stalled buildup | 2.8-second convergence, visible inward pull, then a short compression hold. |
| 4. Blurring title | Shards sampled from actual ARROW letter silhouettes dissolve inward. |
| 5. Thick shockwave hoops | Constant-width 1.25 / 0.65 px canvas strokes; no scaled borders. |
| 6. Rings overpower craft | Two short-lived thin rings; bright arrow and accelerating trail remain distinct. |
| 7. Detached lower-right glow | Every impact light is explicitly centered on the blast origin. |
| 8. Lingering beam | Beam decays exponentially; blast scene lasts only 2.2 seconds. |
| 9. Slow launch | Accelerating 1.25-second flight after the initial 100 ms hit. |
| 10. Craft over headline | Direction flyby stays at the right margin outside the text. |
| 11. Chaos caption crowding | Visualization and caption have separate layout regions. |
| 12. Weak organization payoff | Same words travel into five named destinations with visible connections. |
| 13. Tiny explanatory copy | Shorter descriptions; 14 px phone body text, larger headings and readable label plates. |
| 14. Faint Atlas connections | Brighter progressive links with thicker main relationships. |
| 15. Flat RAVIN disk | Shaded spherical core, internal orbit rings, incoming/outgoing context pulse. |
| 16. Faint Relay tower | Explicit braced SVG tower, shared beacon coordinates and outbound packets. |
| 17. Waypoint label pileup | Separated starting labels shrink and disappear individually before arrival. |
| 18. Weak route | Bright growing route, highlighted milestones, next-action callout and craft traversal. |
| 19. Dark Orbit | Brighter sphere points, bounded geometry, glow and visible connected destinations. |
| 20. Orbit/title collision | Sphere rendered inside measured visual region above the caption. |
| 21. Sideways ending logo | All stationary brand marks use the same upward orientation. |
| 22. Mobile crashes | Replaced risky compositing stack with one bounded canvas; physical-iPhone confirmation remains required. |
| 23. Boom performance spike | Preallocated effect data and cached glow texture; no new effect canvas at the boom. |
| 24. Inconsistent runs | Seeded, time-derived effects, a full clock reset and remounted scene animations. |
| 25. Competing rotations | Flying craft angle is calculated only by canvas drawing; curves match direction at module boundaries. |
| 26. Mobile composition | Dedicated portrait and short-landscape regions, safe-area spacing and resize observation. |
| 27. Inward collapse | Surrounding arrows swirl and compress toward the hero before impact. |
| 28. Compression hold | Inward collapse finishes before the boom; short stillness at maximum compression. |
| 29. Explosion sequence | Central burst, thin pressure rings, radial debris, then accelerating launch. |
| 30. Strong acceleration | Nonlinear flight displacement with speed-responsive trail. |
| 31. Camera recoil | Short damped recoil drawn inside the canvas; no transformed viewport. |
| 32. Responsive trail | Trail grows with launch speed and disappears with the craft. |
| 33. Foreground depth | A small subset of longer/thicker streaks gives depth without increasing density. |
| 34. Crisp DIRECTION reveal | Brief opacity/scale reveal; no blurred headline or central flyby. |
| 35. Words organize into destinations | Atlas / RAVIN / Relay / Orbit / Waypoint positions persist through the organization animation. |
| 36. Distinct module actions | Connecting map, processing core, broadcasting tower, selected route, connected world. |
| 37. Connected flight | Persistent canvas craft follows curves with shared endpoint positions and tangents. |
| 38. Orbit climax | Sphere rotation, sequential destination illumination, then pullback into the brand reveal. |
| 39. Shorter holds | Sequence ends at 49 seconds instead of 89.5 seconds after activation. |
| 40. Deliberate mobile version | Fewer labels, fewer particles, capped DPR, larger relative subjects, dedicated landscape composition. |
| 41. Impact within budget | Timing, contrast, acceleration and bounded geometry provide scale without huge raster effects. |

## Validation

- Production Vite build and four clock regression tests pass.
- Local Chromium: every scene at 1440×900, 390×844 (DPR 3), 320×568,
  844×390 and 768×1024; replay, second ignition, skip and reduced motion checked.
- Caption/visual region separation, visible UI bounds, one canvas, and pixel
  budget are asserted. Screenshots are generated for visual inspection.
- A normal-speed Chromium phone-viewport comparison found the longest recorded
  boom frame changed from approximately 116.7 ms to 16.8 ms. Both runs had ~16.7 ms
  median frames. This is one software-rendered container run, not a physical
  device benchmark or evidence that every Safari crash is resolved.
- Local WebKit execution was blocked by missing system libraries and the
  environment's dependency-install restrictions. The Pages workflow runs both
  Chromium and WebKit tests before building/deploying and retains screenshots.

## Physical-device follow-up

On the affected iPhone/Safari version: play through the boom and all modules,
replay twice, rotate during the boom, background/foreground the page, and check
that the tab remains alive. Linux WebKit emulation does not reproduce iOS memory
limits or its GPU process exactly.

## Follow-up: September 26, 8:58 PM recording

The new recording still shows the production CSS version (PR #1 is unmerged),
including its sideways first frame and detached lower-right flare. The review
branch already removes those sources. This follow-up makes its centered pulse
cover the viewport, sends a single pressure front beyond the screen, lengthens
foreground ejecta, accelerates launch over 1.02 seconds, and carries a continuous
speed tunnel into the Direction reveal. The plume uses a precomputed fading
texture, without a hard rectangular tail. Surface/particle caps are unchanged.

The stronger burst's local normal-speed phone-viewport check recorded a 16.8 ms
maximum frame, with no long tasks. Chromium layout/playback checks passed. The
branch workflow also checks WebKit before any subsequent publishing.
