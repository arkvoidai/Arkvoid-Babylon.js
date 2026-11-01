# Arkvoid Constitution — Babylon Runtime

## Product
Arkvoid is a persistent world you walk through in a browser. The first world is Celestial Frontier: porcelain islands above a cloud sea, joined by stone paths and gates. A world day advances over four real hours. Residents have identities, dialogue and memory. Players gather Dawn Breath and Dusk Breath and grow through Realms. This is the product itself, not a marketing page or dashboard.

## Experience law
- The world is the dominant surface. Keep interface language short and contextual.
- At most two persistent controls: the Orb and one contextual action, plus a mobile thumb joystick.
- No roadmap, diagnostics, fake functionality, placeholder feature cards or lore dumps in the player interface.
- A feature without an implementation must not appear as an active control.
- The company site remains separate.

## Art direction — Pearl
Warm pearl, porcelain, pale stone, natural greens, restrained timber and small bronze details. Orange and violet are carried by light, never large saturated fills. No cyberpunk, neon HUD, purple-blue gradients or generic dashboard styling.

Core palette: #FBFAF7, #F4F1EA, #ECE8F4, #17141F, #4A4658, #8A8598, #FF7A1A, #7C5CFF.

## Stack
- Babylon.js 9.33.1 is the only 3D renderer.
- React 18 + strict TypeScript; Vite.
- Zustand for low-frequency UI state.
- Supabase JS v2 for authenticated persistence and server RPC.
- GLB/glTF for authored runtime assets.
- One Babylon canvas, one scene and one engine-owned render loop.
- No Three.js, React Three Fiber, second renderer or per-frame React state.

## Runtime rules
- World update logic remains outside React.
- Use shared analytic terrain height for the current island and player movement.
- Every resource-owning system must have a disposal path.
- Optional assets must never block world boot.
- The world remains usable without Supabase configuration.
- Never place provider secrets or Supabase service-role keys in VITE variables.

## Performance targets (not measured claims)
Target stable 30 FPS on mid-range phones and 60 FPS on desktop where hardware permits. Adapt render scale when sustained frame rate drops. Bound foliage, cloud instances and full-detail resident rigs. Pause rendering while hidden. Dispose scene and GPU resources on exit. Measure before increasing detail.

## Quality honesty
Procedural geometry is bootable foundation art. It is not final photorealistic character art, scanned terrain, facial animation or AAA authored environment. Do not describe it as such until those assets and captures exist.
