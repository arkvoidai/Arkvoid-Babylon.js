import {
  Color3, Mesh, MeshBuilder, PBRMaterial, Scene, ShadowGenerator, StandardMaterial,
  VertexData
} from "@babylonjs/core";

export interface WorldMaterials {
  porcelain: PBRMaterial; stone: PBRMaterial; cliff: PBRMaterial; path: PBRMaterial;
  moss: PBRMaterial; leaf: PBRMaterial; deepLeaf: PBRMaterial; timber: PBRMaterial;
  bronze: PBRMaterial; cloud: StandardMaterial; glow: StandardMaterial;
}
function pbr(scene: Scene, name: string, color: Color3, roughness: number, metallic = 0): PBRMaterial {
  const material = new PBRMaterial(name, scene);
  material.albedoColor = color; material.roughness = roughness; material.metallic = metallic;
  material.environmentIntensity = 0.75;
  return material;
}
export function createWorldMaterials(scene: Scene): WorldMaterials {
  const porcelain = pbr(scene, "porcelain", new Color3(.79, .78, .74), .38);
  porcelain.clearCoat.isEnabled = true; porcelain.clearCoat.intensity = .16; porcelain.clearCoat.roughness = .38;
  const stone = pbr(scene, "weathered-limestone", new Color3(.56, .55, .51), .88);
  const cliff = pbr(scene, "basalt-cliff", new Color3(.25, .27, .28), .95);
  const path = pbr(scene, "walkway-stone", new Color3(.64, .62, .57), .8);
  const moss = pbr(scene, "moss", new Color3(.19, .29, .22), .94);
  const leaf = pbr(scene, "canopy-green", new Color3(.22, .37, .26), .84);
  const deepLeaf = pbr(scene, "deep-canopy", new Color3(.12, .23, .17), .9);
  const timber = pbr(scene, "dark-timber", new Color3(.25, .18, .13), .72);
  const bronze = pbr(scene, "aged-bronze", new Color3(.47, .32, .16), .36, .68);
  const cloud = new StandardMaterial("cloud-softness", scene);
  cloud.diffuseColor = new Color3(.91, .92, .92); cloud.emissiveColor = new Color3(.12, .14, .17);
  cloud.alpha = .68; cloud.backFaceCulling = false;
  const glow = new StandardMaterial("lantern-emission", scene);
  glow.diffuseColor = new Color3(1, .63, .34); glow.emissiveColor = new Color3(1, .35, .1);
  glow.disableLighting = true;
  return { porcelain, stone, cliff, path, moss, leaf, deepLeaf, timber, bronze, cloud, glow };
}
export function terrainHeightAt(x: number, z: number): number {
  const radius = Math.sqrt(x*x + z*z);
  const t = Math.max(0, Math.min(1, (radius - 35) / 9));
  const edge = t*t*(3-2*t);
  const undulation = Math.sin(x*.105)*.23 + Math.cos(z*.092)*.21 + Math.sin((x+z)*.19)*.1;
  return 2.15 + undulation - edge*4.8;
}
function seed(n: number): number { const v = Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); }

export function buildWorld(scene: Scene, shadows: ShadowGenerator): WorldMaterials {
  const m = createWorldMaterials(scene);
  // Radial triangulation keeps the terrain entirely inside the floating island's rim.
  const segments = 128;
  const rings = 54;
  const positions: number[] = [0, terrainHeightAt(0, 0), 0];
  const colors: number[] = [.57, .59, .52, 1];
  const indices: number[] = [];
  const vegetation = new Color3(.53, .57, .48);
  const rimStone = new Color3(.67, .65, .6);
  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = (ring / rings) * 43.8;
    const edgeBlend = Math.max(0, Math.min(1, (radius - 30) / 13.8));
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(x, terrainHeightAt(x, z), z);
      const tint = Color3.Lerp(vegetation, rimStone, edgeBlend);
      const variation = (Math.sin(x * .38) + Math.cos(z * .34)) * .012;
      colors.push(
        Math.max(0, tint.r + variation),
        Math.max(0, tint.g + variation),
        Math.max(0, tint.b + variation),
        1
      );
    }
  }
  const firstRing = 1;
  for (let segment = 0; segment < segments; segment += 1) {
    const current = firstRing + segment;
    const next = firstRing + ((segment + 1) % segments);
    indices.push(0, next, current);
  }
  for (let ring = 1; ring < rings; ring += 1) {
    const inner = 1 + (ring - 1) * segments;
    const outer = inner + segments;
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      const a = inner + segment;
      const b = inner + next;
      const c = outer + segment;
      const d = outer + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const terrainData = new VertexData();
  terrainData.positions = positions;
  terrainData.indices = indices;
  terrainData.normals = normals;
  terrainData.colors = colors;
  const ground = new Mesh("home-reach-ground", scene);
  terrainData.applyToMesh(ground, true);
  const terrainMaterial = new StandardMaterial("terrain-vertex-colour", scene);
  terrainMaterial.diffuseColor = Color3.White();
  terrainMaterial.specularColor = new Color3(.14, .14, .14);
  terrainMaterial.specularPower = 48;
  ground.useVertexColors = true;
  ground.material = terrainMaterial;
  ground.receiveShadows = true;

  const islandBase = MeshBuilder.CreateCylinder("floating-island-mass", {
    height: 29, diameterTop: 88, diameterBottom: 22, tessellation: 96
  }, scene);
  islandBase.position.y = -17.1; islandBase.material = m.cliff; islandBase.receiveShadows = true;
  const lowerShelf = MeshBuilder.CreateCylinder("island-rock-shelf", {
    height: 2, diameterTop: 76, diameterBottom: 57, tessellation: 80
  }, scene);
  lowerShelf.position.y = -8; lowerShelf.material = m.stone;

  const rim = MeshBuilder.CreateTorus("moss-rim", { diameter: 85, thickness: 1.1, tessellation: 96 }, scene);
  rim.position.y = -1.55; rim.scaling.y = .45; rim.material = m.moss;

  const steppingStone = MeshBuilder.CreateBox("walkway-stone-source", { width: 1.15, height: .2, depth: 1.45 }, scene);
  steppingStone.material = m.path;
  steppingStone.isVisible = false;
  for (let index = 0; index < 20; index += 1) {
    const z = 8 - index * .72;
    const x = Math.sin(index * .39) * .2;
    const stone = steppingStone.createInstance("sanctuary-walkway-" + index);
    stone.position.set(x, terrainHeightAt(x, z) + .11, z);
    stone.rotation.y = Math.sin(index * .61) * .045;
    stone.scaling.set(.82 + (index % 3) * .08, 1, 1);
  }

  // A quiet stepped sanctuary with timber lintels and a restrained bronze crown.
  const deck = MeshBuilder.CreateBox("sanctuary-foundation", { width: 13, height: .72, depth: 9.4 }, scene);
  deck.position.set(0, 2.45, -8); deck.material = m.stone; deck.receiveShadows = true;
  const floor = MeshBuilder.CreateBox("sanctuary-floor", { width: 10.6, height: .25, depth: 7.2 }, scene);
  floor.position.set(0, 2.93, -8); floor.material = m.path;
  for (const [i, x] of [-4.25,-2.1,2.1,4.25].entries()) {
    for (const z of [-10.3,-5.7]) {
      const col = MeshBuilder.CreateCylinder("sanctuary-pillar-"+i+"-"+z, { height: 3.8, diameterTop: .28, diameterBottom: .48, tessellation: 16 }, scene);
      col.position.set(x, 4.9, z); col.material = m.porcelain; shadows.addShadowCaster(col);
      const capital = MeshBuilder.CreateBox("pillar-capital-"+i+"-"+z, { size: .72 }, scene);
      capital.position.set(x, 6.85, z); capital.material = m.bronze;
    }
  }
  const beam = MeshBuilder.CreateBox("sanctuary-beam", { width: 11, height: .42, depth: .45 }, scene);
  beam.position.set(0, 6.95, -8); beam.material = m.timber;
  const roof = MeshBuilder.CreateCylinder("sanctuary-roof", { height: 1.15, diameterTop: 4.5, diameterBottom: 12.8, tessellation: 4 }, scene);
  roof.position.set(0, 7.8, -8); roof.rotation.y = Math.PI/4; roof.material = m.porcelain; roof.receiveShadows = true;
  const roof2 = MeshBuilder.CreateCylinder("sanctuary-upper-roof", { height: .75, diameterTop: 1.2, diameterBottom: 5.4, tessellation: 4 }, scene);
  roof2.position.set(0, 8.75, -8); roof2.rotation.y = Math.PI/4; roof2.material = m.timber;
  const finial = MeshBuilder.CreateCylinder("sanctuary-finial", { height: 1.1, diameterTop: .04, diameterBottom: .28, tessellation: 12 }, scene);
  finial.position.set(0, 9.65, -8); finial.material = m.bronze;

  const gate = MeshBuilder.CreateBox("garden-gate-header", { width: 5.2, height: .55, depth: .7 }, scene);
  gate.position.set(19, 4.65, 5); gate.material = m.timber;
  for (const side of [-1,1]) {
    const post = MeshBuilder.CreateBox("garden-gate-post-"+side, { width: .72, height: 4.5, depth: .72 }, scene);
    post.position.set(19+side*2.1, 2.2, 5); post.material = m.porcelain;
  }
  for (let n=0; n<6; n++) {
    const step = MeshBuilder.CreateBox("sanctuary-step-"+n, { width: 4.2+n*.32, height: .18, depth: .58 }, scene);
    step.position.set(0, 2.22+n*.14, .3-n*.72); step.material = m.path;
  }

  // Instanced foliage: shared meshes keep the island's draw-call count bounded.
  const trunk = MeshBuilder.CreateCylinder("tree-trunk-source", { height: 3.4, diameterTop: .17, diameterBottom: .4, tessellation: 8 }, scene);
  trunk.isVisible = false; trunk.material = m.timber;
  const crown = MeshBuilder.CreateSphere("tree-crown-source", { diameter: 3.5, segments: 8 }, scene);
  crown.isVisible = false; crown.material = m.leaf;
  const crownTop = MeshBuilder.CreateSphere("tree-crown-top-source", { diameter: 2.65, segments: 8 }, scene);
  crownTop.isVisible = false; crownTop.material = m.deepLeaf;
  let treeCount = 0;
  for (let i=0; i<42; i++) {
    const a = seed(i+3)*Math.PI*2; const r = 20+seed(i+30)*16;
    const x = Math.cos(a)*r; const z = Math.sin(a)*r;
    if (Math.abs(x)<8 && z<-2 && z>-19) continue;
    const y = terrainHeightAt(x,z); const scale = .62+seed(i+90)*.62;
    const t = trunk.createInstance("tree-trunk-"+treeCount);
    t.position.set(x,y+1.7*scale,z); t.scaling.set(scale,scale,scale);
    const c = crown.createInstance("tree-crown-"+treeCount);
    c.position.set(x,y+4.0*scale,z); c.scaling.set(scale,scale*.92,scale);
    const ct = crownTop.createInstance("tree-crown-top-"+treeCount);
    ct.position.set(x,y+5.1*scale,z); ct.scaling.set(scale*.78,scale*.72,scale*.78);
    treeCount++;
  }
  for (let i=0; i<32; i++) {
    const a=seed(i+201)*Math.PI*2; const r=25+seed(i+301)*16;
    const x=Math.cos(a)*r; const z=Math.sin(a)*r;
    const rock=MeshBuilder.CreateIcoSphere("island-boulder-"+i,{radius:.55+seed(i+401)*.65,subdivisions:1},scene);
    rock.position.set(x,terrainHeightAt(x,z)+.1,z); rock.scaling.y=.4+seed(i+501)*.5;
    rock.rotation.set(seed(i+601),seed(i+701)*Math.PI*2,seed(i+801)); rock.material=m.stone;
  }
  // Soft cloud banks, instanced from one low-poly puff.
  const puff=MeshBuilder.CreateSphere("cloud-puff-source",{diameter:1,segments:7},scene);
  puff.material=m.cloud; puff.isVisible=false;
  for(let i=0;i<118;i++){
    const a=seed(i+901)*Math.PI*2; const r=65+seed(i+1001)*118;
    const inst=puff.createInstance("cloud-bank-"+i);
    const s=9+seed(i+1101)*17;
    inst.position.set(Math.cos(a)*r,-22+seed(i+1201)*7,Math.sin(a)*r);
    inst.scaling.set(s*1.4,s*.36,s); inst.isPickable=false;
  }
  const farIslands=[[-92,-5,-65],[105,-4,-46],[-75,-9,98],[98,-10,91]];
  farIslands.forEach(([x,y,z],i)=>{
    const rock=MeshBuilder.CreateCylinder("distant-island-"+i,{height:18+i*2,diameterTop:25+i*3,diameterBottom:5,tessellation:24},scene);
    rock.position.set(x,y,z); rock.material=m.cliff;
    const cap=MeshBuilder.CreateCylinder("distant-island-cap-"+i,{height:1.1,diameter:25+i*3,tessellation:24},scene);
    cap.position.set(x,y+9+i,z); cap.material=m.moss;
  });
  for (let i=0;i<12;i++) {
    const x=-18+i*3.2; const lantern=MeshBuilder.CreateSphere("spirit-lantern-"+i,{diameter:.13,segments:8},scene);
    lantern.position.set(x,terrainHeightAt(x, -2)+2.4+(i%3)*.4,-2); lantern.material=m.glow; lantern.isPickable=false;
  }
  return m;
}

export function createDynamicAvatar(scene: Scene, id: string, colors: { robe: Color3; trim: Color3; hair: Color3 }): { root: Mesh; update(dt: number, moving: boolean): void; dispose(): void } {
  const root = new Mesh(id+"-root",scene);
  const visual = new Mesh(id+"-visual",scene); visual.parent=root;
  const robe = pbr(scene,id+"-robe",colors.robe,.83);
  const hair = pbr(scene,id+"-hair",colors.hair,.9);
  const skin = pbr(scene,id+"-skin",new Color3(.72,.56,.46),.9);
  const trim = pbr(scene,id+"-trim",colors.trim,.4,.34);
  const torso=MeshBuilder.CreateCylinder(id+"-robe-body",{height:1.35,diameterTop:.48,diameterBottom:.9,tessellation:18},scene);
  torso.parent=visual; torso.position.y=.9; torso.material=robe;
  const inner=MeshBuilder.CreateCylinder(id+"-inner-robe",{height:1.18,diameterTop:.34,diameterBottom:.67,tessellation:16},scene);
  inner.parent=visual; inner.position.set(0,.95,-.015); inner.material=scene.getMaterialByName("porcelain") ?? robe;
  const head=MeshBuilder.CreateSphere(id+"-head",{diameter:.56,segments:16},scene);
  head.parent=visual; head.position.y=1.83; head.material=skin;
  const hairCap=MeshBuilder.CreateSphere(id+"-hair-cap",{diameter:.62,segments:16},scene);
  hairCap.parent=visual; hairCap.position.set(0,2.02,.025); hairCap.scaling.y=.72; hairCap.material=hair;
  const arms: Mesh[]=[];
  for(const side of [-1,1]){
    const eye=MeshBuilder.CreateSphere(id+"-eye-"+side,{diameter:.07,segments:8},scene);
    eye.parent=visual; eye.position.set(side*.13,1.86,-.265); eye.material=trim;
    const lock=MeshBuilder.CreateCylinder(id+"-lock-"+side,{height:.7,diameterTop:.08,diameterBottom:.15,tessellation:8},scene);
    lock.parent=visual; lock.position.set(side*.24,1.55,-.08); lock.material=hair;
    const arm=MeshBuilder.CreateCylinder(id+"-sleeve-"+side,{height:.83,diameterTop:.18,diameterBottom:.27,tessellation:10},scene);
    arm.parent=visual; arm.position.set(side*.47,1.07,0); arm.rotation.z=side*-.35; arm.material=robe; arms.push(arm);
  }
  const collar=MeshBuilder.CreateTorus(id+"-collar",{diameter:.58,thickness:.06,tessellation:24},scene);
  collar.parent=visual; collar.position.y=1.52; collar.rotation.x=Math.PI/2; collar.material=trim;
  const belt=MeshBuilder.CreateCylinder(id+"-belt",{height:.1,diameter:.72,tessellation:16},scene);
  belt.parent=visual; belt.position.y=.95; belt.material=trim;
  visual.getChildMeshes().forEach(mesh=>{mesh.metadata={residentId:id};});
  let elapsed=0;
  return {
    root,
    update(dt,moving){
      elapsed+=dt*(moving?8:1.2);
      visual.position.y=moving?Math.abs(Math.sin(elapsed))*.035:Math.sin(elapsed)*.008;
      visual.rotation.z=moving?Math.sin(elapsed*.5)*.016:0;
      arms.forEach((arm,index)=>{arm.rotation.x=moving?Math.sin(elapsed+index*Math.PI)*.13:0;});
    },
    dispose(){root.dispose(false,false);[robe,hair,skin,trim].forEach(v=>v.dispose());}
  };
}
