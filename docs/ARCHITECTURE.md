# Architecture

React mounts the experience and creates the Babylon runtime once. Babylon owns the engine, scene, render loop, camera, materials, meshes and teardown. React receives low-frequency UI events and clock snapshots only.

- app/WorldExperience.tsx — runtime lifecycle and UI callbacks
- engine/ArkvoidRuntime.ts — engine, scene, camera, lighting, loop and interactions
- engine/actors — player actor and camera-relative movement
- engine/world — PBR materials, radial island terrain, architecture, instanced foliage and cloud sea
- engine/core — deterministic four-hour world clock
- engine/assets — local-only GLB loader, manifest parser, transform/animation wiring and PBR texture assignment
- net — optional Supabase RPC and resident Edge Function client
- state — small UI-facing store
- ui — Pearl gate, Orb, contextual action, resident dialogue and mobile joystick

React does not own the render loop. A single Babylon scene is disposed on unmount, along with input listeners, observers, imported GLBs, animation groups, materials and the engine. Rendering pauses while the browser tab is hidden.

Movement uses camera yaw as its basis and bounded island coordinates. Terrain height is shared between the rendered island and character movement. Cloud banks, canopy crowns and lanterns receive low-amplitude procedural motion in the Babylon loop.

## Asset manifest

The app reads `/assets/asset-manifest.json` on boot. Optional environment GLBs, character GLBs and PBR maps are applied only when their paths are listed. Every GLB must be local to `public/assets/`; arbitrary remote model URLs are rejected. Procedural character silhouettes remain visible if a character model is missing or fails to load.

## World data

Supabase is optional in local development. Signed-in users can use the server world clock, gather RPC and Mistral resident Edge Function. Without a session, the world remains explorable as a temporary guest; guest actions are not represented as persisted progression. Provider keys remain in Edge Function secrets.
