# Data contract

The Babylon client is a presentation/runtime replacement. It keeps the existing Supabase project as the source of truth and calls only the following public interfaces when configured:

| RPC / function | Purpose | Client behavior |
|---|---|---|
| `world_now()` | Server world clock | Sync offset at boot, every ten minutes and on focus |
| `gather(p_kind, p_quality)` | Authenticated Breath gathering | Calls only with an active session; server determines the result |
| `save_position(p_area, p_pos)` | Save player location | Not invoked until the current Home Reach area/position mapping is connected |
| `mistral-npc` Edge Function | Resident conversation | Sends `npcId` and `message`; server verifies JWT, enforces quota and calls Mistral |

The browser receives only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. RLS and RPC authorization remain server-side. Mistral keys and service-role keys must only be stored in Supabase Edge Function secrets.

This repository does not create a fresh database schema. It connects to the existing Arkvoid Supabase project. Apply new database migrations only after reviewing them against that project's migration history.
