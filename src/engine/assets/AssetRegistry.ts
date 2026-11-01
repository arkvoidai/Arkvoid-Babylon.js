import {
  AnimationGroup, PBRMaterial, Scene, SceneLoader, Texture, TransformNode, Vector3
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
import type { WorldMaterials } from "@/engine/world/buildWorld";

export interface LoadedAsset {
  root: TransformNode;
  animationGroups: AnimationGroup[];
  dispose(): void;
}
export interface AssetTransform {
  path: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  idle?: string;
  walk?: string;
}
export interface AssetManifest {
  environment?: AssetTransform[];
  characters?: Partial<Record<"wanderer" | "meilin" | "yue" | "sylva", AssetTransform>>;
  materials?: Partial<Record<"porcelain" | "stone" | "cliff" | "path" | "moss" | "leaf" | "deepLeaf" | "timber" | "bronze", {
    baseColor?: string;
    normal?: string;
    metallicRoughness?: string;
    ambientOcclusion?: string;
    uScale?: number;
    vScale?: number;
  }>>;
}
export interface CharacterAssetTarget {
  root: TransformNode;
  setFallbackVisible(value: boolean): void;
  setAnimations(idle: AnimationGroup | undefined, walk: AnimationGroup | undefined): void;
}
const isLocalAsset = (path: string): boolean =>
  path.startsWith("/assets/") && !path.includes("..") && path.toLowerCase().endsWith(".glb");
const isTexturePath = (path: string): boolean =>
  path.startsWith("/assets/") && !path.includes("..");
function applyTransform(root: TransformNode, config: AssetTransform): void {
  root.position.copyFrom(Vector3.FromArray(config.position ?? [0, 0, 0]));
  root.rotation.copyFrom(Vector3.FromArray(config.rotation ?? [0, 0, 0]));
  if (typeof config.scale === "number") root.scaling.setAll(config.scale);
  else if (config.scale) root.scaling.copyFrom(Vector3.FromArray(config.scale));
}
function useTexture(path: string | undefined, scene: Scene, assign: (texture: Texture) => void, label: string): void {
  if (!path) return;
  if (!isTexturePath(path)) {
    console.warn("Arkvoid texture path was rejected:", path);
    return;
  }
  const texture = new Texture(path, scene, false, false, Texture.TRILINEAR_SAMPLINGMODE);
  texture.name = "arkvoid-" + label;
  assign(texture);
}

export class AssetRegistry {
  constructor(private readonly scene: Scene) {}
  async loadGlb(path: string, parent?: TransformNode): Promise<LoadedAsset | null> {
    if (!isLocalAsset(path)) throw new Error("GLB paths must be local .glb files inside public/assets.");
    const slash = path.lastIndexOf("/");
    try {
      const imported = await SceneLoader.ImportMeshAsync("", path.slice(0, slash + 1), path.slice(slash + 1), this.scene);
      const root = new TransformNode("asset-root-" + path.slice(slash + 1), this.scene);
      imported.meshes.forEach(mesh => { mesh.parent = root; });
      if (parent) root.parent = parent;
      return {
        root,
        animationGroups: imported.animationGroups,
        dispose() {
          imported.animationGroups.forEach(group => group.dispose());
          root.dispose(false, true);
        }
      };
    } catch (error) {
      console.warn("Optional Arkvoid GLB failed to load; procedural art remains active.", path, error);
      return null;
    }
  }
  applyMaterialManifest(manifest: AssetManifest, materials: WorldMaterials): void {
    for (const [key, maps] of Object.entries(manifest.materials ?? {})) {
      const material = materials[key as keyof WorldMaterials];
      if (!(material instanceof PBRMaterial)) continue;
      useTexture(maps.baseColor, this.scene, value => { material.albedoTexture = value; }, key + "-base-color");
      useTexture(maps.normal, this.scene, value => { material.bumpTexture = value; }, key + "-normal");
      useTexture(maps.metallicRoughness, this.scene, value => { material.metallicTexture = value; }, key + "-metallic-roughness");
      useTexture(maps.ambientOcclusion, this.scene, value => { material.ambientTexture = value; }, key + "-ambient-occlusion");
      for (const texture of [material.albedoTexture, material.bumpTexture, material.metallicTexture, material.ambientTexture]) {
        if (texture) {
          texture.uScale = maps.uScale ?? 1;
          texture.vScale = maps.vScale ?? 1;
        }
      }
    }
  }
  async loadManifest(
    targets: Partial<Record<"wanderer" | "meilin" | "yue" | "sylva", CharacterAssetTarget>>,
    materials: WorldMaterials,
  ): Promise<LoadedAsset[]> {
    let manifest: AssetManifest;
    try {
      const response = await fetch("/assets/asset-manifest.json", { cache: "no-cache" });
      if (!response.ok) return [];
      manifest = await response.json() as AssetManifest;
    } catch {
      return [];
    }
    this.applyMaterialManifest(manifest, materials);
    const loaded: LoadedAsset[] = [];
    for (const config of manifest.environment ?? []) {
      if (!config || !isLocalAsset(config.path)) continue;
      const asset = await this.loadGlb(config.path);
      if (!asset) continue;
      applyTransform(asset.root, config);
      loaded.push(asset);
    }
    for (const [id, config] of Object.entries(manifest.characters ?? {})) {
      if (!config || !isLocalAsset(config.path)) continue;
      const target = targets[id as keyof typeof targets];
      if (!target) continue;
      const asset = await this.loadGlb(config.path, target.root);
      if (!asset) continue;
      applyTransform(asset.root, config);
      const idle = asset.animationGroups.find(group => group.name === config.idle) ??
        (config.idle ? undefined : asset.animationGroups[0]);
      const walk = config.walk ? asset.animationGroups.find(group => group.name === config.walk) : undefined;
      target.setAnimations(idle, walk);
      target.setFallbackVisible(false);
      loaded.push(asset);
    }
    return loaded;
  }
}
