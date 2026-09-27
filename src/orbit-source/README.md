# Orbit source

These two files are copied without edits from Link9060/Resonant-Orbit, commit
`b5fa5899aad0062fcfc09e93dc5f3fc1cf06da8f`:

- `src/lib/particle-renderer.ts`
- `src/lib/orbit-spatial.ts`

CinematicStage uses the same balanced density (.72), particle size (1.02),
layered shell generator, motion, projection, and front/back orbit paths.
Only the host viewport, scale, and fade timing are adapted to the cinematic.
No extra RAF or second onscreen canvas is created.
