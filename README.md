# ARKVOID · Babylon.js World Runtime

A clean Babylon.js rebuild of Arkvoid's persistent world. This is an independent application, not a Three.js patch.

## Run
- Node.js 22+
- `npm install`
- `npm run dev`
- `npm run typecheck && npm test && npm run build`

Copy `.env.example` to `.env.local` to configure the optional Supabase connection.

## Included
Babylon.js scene/runtime, procedural Celestial Frontier environment, third-person camera and movement, touch joystick, Pearl UI, four-hour world clock, Dawn/Dusk Breath interaction, resident dialogue adapter, optional Supabase RPC/Edge Function adapters, GLB asset registry, and CI.

## Art status
The code-generated scene is a bootable visual foundation, not photorealistic AAA final art. Final character rigs, environment meshes, PBR material scans, facial animation, authored motion and texture sets are intentionally left as asset drop-in work.

See `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, and `docs/ART_PIPELINE.md`.
