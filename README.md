# ARKVOID · Babylon.js World Runtime

A clean Babylon.js rebuild of Arkvoid's persistent world. This is an independent application, not a Three.js patch.

## Run
- Node.js 22+
- `npm install`
- `npm run dev`
- `npm run typecheck && npm test && npm run build`

Copy `.env.example` to `.env.local` to configure the optional Supabase connection.

## Included
Babylon.js scene/runtime, procedural Celestial Frontier environment, third-person camera and movement, touch joystick, Pearl interface, four-hour world clock, Dawn/Dusk Breath interactions, named resident dialogue adapter, optional Supabase RPC/Edge Function integration, responsive rendering quality governor, cloud/canopy/lantern motion, local GLB and PBR-texture manifest, and GitHub Actions CI.

## Add your art
Drop licensed GLB and PBR texture files under `public/assets/`, then list them in `public/assets/asset-manifest.json`. The runtime loads environment models, replaces procedural character silhouettes when GLBs arrive, switches the declared idle/walk animation groups, and assigns texture maps to the matching PBR materials. See `public/assets/models/README.md` and `public/assets/textures/README.md`.

## Art status
The code-generated scene is a bootable visual foundation, not photorealistic AAA final art. Final character rigs, authored environment meshes, calibrated texture sets, facial performance, authored motion and physical-device graphics validation are required for the final AAA bar.

See `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, and `docs/ART_PIPELINE.md`.
