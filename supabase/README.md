# Supabase connection

This Babylon client is designed to keep using the existing Arkvoid Supabase project. Its current data contract is documented in ../docs/DATA_CONTRACT.md.

The Mistral resident Edge Function is preserved at functions/mistral-npc/index.ts. Deploy it with the Supabase CLI or Dashboard and set MISTRAL_API_KEY as an Edge Function secret. The browser must never receive that key.

This repository intentionally does not invent a second base schema. Review the original project's migration history before using db push from a fresh checkout; the Babylon repo is a renderer/application rebuild, not a replacement database.
