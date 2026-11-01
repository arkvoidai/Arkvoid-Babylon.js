# Architecture

React mounts the experience and creates the Babylon runtime once. Babylon owns the engine, scene, render loop, camera, materials, meshes and teardown. React receives low-frequency UI events and clock snapshots only.

- app/WorldExperience.tsx — runtime lifecycle and UI callbacks
- engine/ArkvoidRuntime.ts — engine, scene, camera, lighting, loop and interactions
- engine/actors — player avatar and camera-relative movement
- engine/world — materials, terrain, architecture, foliage, cloud sea
- engine/core — deterministic four-hour world clock
- engine/assets — optional GLB loader restricted to local public assets
- net — optional Supabase RPC and resident Edge Function adapters
- state — small UI-facing store
- ui — Pearl gate, Orb, action pill, dialogue and mobile joystick

The runtime is disposed on unmount. Resize and visibility handlers are removed during teardown. The engine pauses while the browser tab is hidden.

Movement uses the camera yaw as its basis and bounded island coordinates. Terrain height is shared with the rendered ground. The GLB registry allows local /assets/ paths only and catches optional-asset load errors without stopping the world.

Supabase is optional in local development. Signed-in users can use the world clock, gather RPC and resident function. Without a session, the environment can be explored as a temporary guest; local guest actions are not represented as server-persisted progression.
