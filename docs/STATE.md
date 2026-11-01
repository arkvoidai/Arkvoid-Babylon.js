# Babylon rebuild state

## Built in this branch
- Clean React 18, TypeScript and Vite scaffold with Babylon.js as the only renderer.
- A Babylon engine, single world scene and engine-owned render loop.
- Generated Home Reach island, cliff mass, sanctuary, garden gate, floating cloud sea, far islands, trees, rocks and lantern accents.
- Procedural resident/player silhouettes, third-person camera, keyboard movement and touch joystick.
- Four-hour world clock with dawn/day/dusk/night atmosphere states.
- Pearl gate, contextual action, Breath Orb and resident conversation UI.
- Optional Supabase world clock, gather RPC and Mistral resident function adapters.
- Optional local GLB loader, asset folder conventions, CI and architecture notes.

## Decisions
- The old Three.js renderer is not carried into this repository.
- Babylon.js is pinned to 9.33.1 for reproducible installs.
- Existing world vocabulary, Home Reach, sanctuary, resident identities and Pearl visual language are retained.
- Home Reach uses procedural geometry until authored assets are supplied.
- Supabase remains optional; provider secrets stay in Edge Function secrets, never in browser variables.
- Local guest gathering is temporary client state and is not represented as persisted progression.

## Known limits
- Procedural avatars are not production rigged character models and do not include face performance or authored animation clips.
- The environment is not scanned or hand-authored photorealistic AAA art.
- Region streaming, multiplayer presence, full schedule-driven resident simulation, account/character onboarding, KTX2 texture packaging and production asset integration remain follow-on work.
- Physical Android and desktop GPU performance captures have not been made.
- Build/typecheck/test are configured in CI but have not yet been run in this environment.

## Verification
Run `npm install`, `npm run typecheck`, `npm test`, and `npm run build`. Follow the physical-device checklist in PERFORMANCE.md before increasing graphics defaults.
