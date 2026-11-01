# Asset pipeline

## Characters
Use Blender to export licensed GLB/glTF characters to:
- /assets/characters/wanderer/model.glb
- /assets/characters/meilin/model.glb
- /assets/characters/yue/model.glb
- /assets/characters/sylva/model.glb

Each asset should have distinct adult anatomy, face, hair, clothing silhouette, physically based materials, clean named rig bones, idle/walk/turn/interact/talk/gesture clips, mobile LODs, and a license record.

## Environment
Add region packs below /assets/world/home-reach/. Prefer separate GLBs for landmark structures, bridges, cliffs, foliage clusters and set dressing. Keep analytic collision independent of dense render geometry.

## Textures
Use /assets/textures/<material>/ with baseColor, OpenGL normal, metallicRoughness and optional AO/height maps. Convert production sets to KTX2/Basis for browser delivery. Start with 1K phone maps and 2K desktop hero materials.

## Free-first authoring
Blender is the primary authoring/conversion tool. Poly Haven provides CC0 PBR/HDRI assets; Quaternius offers CC0 stylized/rigged character packs. Check the specific license for each downloaded file and record it before committing. A coherent curated style is more valuable than a large unreviewed asset collection.
