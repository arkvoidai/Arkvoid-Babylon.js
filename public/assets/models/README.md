# GLB model slots and manifest

Put optimized licensed GLB files under these paths:

- `/assets/characters/wanderer/model.glb`
- `/assets/characters/meilin/model.glb`
- `/assets/characters/yue/model.glb`
- `/assets/characters/sylva/model.glb`
- `/assets/world/home-reach/sanctuary.glb`
- `/assets/world/home-reach/bridges.glb`
- `/assets/world/home-reach/vegetation.glb`

Then edit `public/assets/asset-manifest.json`. Example:

```json
{
  "environment": [
    {
      "path": "/assets/world/home-reach/sanctuary.glb",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": 1
    }
  ],
  "characters": {
    "wanderer": {
      "path": "/assets/characters/wanderer/model.glb",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": 1,
      "idle": "Idle",
      "walk": "Walk"
    },
    "meilin": {
      "path": "/assets/characters/meilin/model.glb",
      "scale": 1,
      "idle": "Idle"
    }
  }
}
```

Character origin should be at the feet, local up should be +Y, and forward should be -Z. Use real-world scale: an adult character should be approximately 1.6–2.0 units tall. The optional model replaces the procedural silhouette only after it loads successfully. The runtime switches the selected idle/walk animation groups; names are case-sensitive.

Keep rigs and animation naming consistent across exports. Optimize mesh/material count, provide mobile LODs, and record licenses in `docs/ASSET_LICENSES.md`.
