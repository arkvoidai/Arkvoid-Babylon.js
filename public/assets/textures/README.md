# PBR texture slots and manifest

Add material folders beneath this directory. Use:
- baseColor/albedo
- OpenGL tangent-space normal
- metallicRoughness (G = roughness, B = metallic)
- optional ambientOcclusion

Example:
- `/assets/textures/porcelain/baseColor.png`
- `/assets/textures/porcelain/normal.png`
- `/assets/textures/porcelain/metallicRoughness.png`

Then add paths to `materials` in `public/assets/asset-manifest.json`:

```json
{
  "materials": {
    "porcelain": {
      "baseColor": "/assets/textures/porcelain/baseColor.png",
      "normal": "/assets/textures/porcelain/normal.png",
      "metallicRoughness": "/assets/textures/porcelain/metallicRoughness.png",
      "uScale": 1,
      "vScale": 1
    }
  }
}
```

Supported material keys: porcelain, stone, cliff, path, moss, leaf, deepLeaf, timber and bronze. Paths outside `/assets/` are ignored. PNG, JPG and WebP maps load directly. KTX2/Basis files need the decoder path configured for the specific deployment before adding them to this manifest.
