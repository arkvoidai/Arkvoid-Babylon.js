# Production Art Pipeline

## Procedural foundation
The initial scene is generated from code so Arkvoid can run without downloaded models or textures. This gives a working base for camera, scale, movement, interaction and lighting. It is not a final realism pass.

## Character GLB locations
- public/assets/characters/wanderer/model.glb
- public/assets/characters/meilin/model.glb
- public/assets/characters/yue/model.glb
- public/assets/characters/sylva/model.glb

Deliverables should have believable adult anatomy, distinct facial features and silhouettes, authored PBR skin/hair/cloth/metal, clean rigs, named bones, retargetable clips, idle/walk/turn/interact/talk/gesture animations, mobile LODs and a clear license.

Suggested workflow: Blender → GLB/glTF. Apply transforms, pack textures, remove unused data, validate skeleton and clips, and preview in Babylon Sandbox.

## Environment GLB locations
- public/assets/world/home-reach/sanctuary.glb
- public/assets/world/home-reach/bridges.glb
- public/assets/world/home-reach/cliffs.glb
- public/assets/world/home-reach/vegetation.glb
- public/assets/world/home-reach/props.glb

Keep collision proxies or analytic collision separate from detailed render meshes. Instance repeated structures and stream distant regions only when needed.

## PBR texture convention
Store texture sets under public/assets/textures/<material-name>/:
- baseColor / albedo
- normal (OpenGL convention)
- metallicRoughness
- ambientOcclusion (optional)
- height (optional)

Prefer KTX2/Basis Universal for shipping. Start with 1K mobile maps and 2K desktop hero materials. Record source and license in docs/ASSET_LICENSES.md.

## Quality bar
Photorealistic AAA art requires designed environment meshes, material calibration, realistic character models, facial animation, bespoke motion, authored props, atmospheric depth and careful art direction. Procedural fallbacks are deliberately not presented as a substitute.
