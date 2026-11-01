# Production Art Pipeline

## Procedural foundation
The initial scene is generated from code so Arkvoid boots without downloaded models or textures. It provides a playable foundation for scale, movement, interactions and lighting; it is not final realism art.

## Character GLB locations
- public/assets/characters/wanderer/model.glb
- public/assets/characters/meilin/model.glb
- public/assets/characters/yue/model.glb
- public/assets/characters/sylva/model.glb

Each character should have believable adult anatomy, a distinct face and silhouette, authored PBR skin/hair/cloth/metal, a clean rig with named bones, idle/walk/turn/interact/talk/gesture clips and mobile LODs. Use consistent scale and local +Y up / -Z forward. The asset manifest supports idle and walk clip names and replaces procedural characters only after the GLB loads.

Suggested workflow: Blender → GLB/glTF. Apply transforms, pack textures, remove unused data, validate skeleton and clips, and preview in Babylon Sandbox.

## Environment GLB locations
- public/assets/world/home-reach/sanctuary.glb
- public/assets/world/home-reach/bridges.glb
- public/assets/world/home-reach/cliffs.glb
- public/assets/world/home-reach/vegetation.glb
- public/assets/world/home-reach/props.glb

Environment entries can set position, rotation and scale through `public/assets/asset-manifest.json`. Keep collision proxies or analytic collision separate from detailed render meshes. Instance repeated structures and stream distant regions only when needed.

## PBR texture convention
Store texture sets under public/assets/textures/<material-name>/:
- baseColor / albedo
- normal (OpenGL convention)
- metallicRoughness (G roughness, B metallic)
- ambientOcclusion (optional)

The manifest maps these textures onto the matching Babylon PBR materials. PNG, JPG and WebP are available for direct loading. KTX2/Basis requires a deployment-specific decoder setup; configure and validate that before committing KTX2 maps. Record source and license in docs/ASSET_LICENSES.md.

## Quality bar
Photorealistic AAA art requires authored environment meshes, calibrated PBR textures, realistic rigged characters, facial animation, bespoke motion, authored props, atmospheric depth and careful art direction. Procedural fallbacks are deliberately not presented as a substitute.
