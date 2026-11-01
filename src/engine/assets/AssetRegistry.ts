import { Scene, SceneLoader, TransformNode } from "@babylonjs/core";
import "@babylonjs/loaders/glTF/2.0";
export interface LoadedAsset { root:TransformNode; dispose():void; }
export class AssetRegistry {
  constructor(private readonly scene:Scene){}
  async loadGlb(path:string,parent?:TransformNode):Promise<LoadedAsset|null>{
    if(!path.startsWith("/assets/")||path.includes(".."))throw new Error("GLB paths must remain inside public/assets.");
    const slash=path.lastIndexOf("/");
    try{
      const imported=await SceneLoader.ImportMeshAsync("",path.slice(0,slash+1),path.slice(slash+1),this.scene);
      const root=new TransformNode("asset-root-"+path.slice(slash+1),this.scene);
      imported.meshes.forEach(mesh=>{if(mesh!==root)mesh.parent=root;});
      if(parent)root.parent=parent;
      return {
        root,
        dispose(){
          root.dispose(false,true);
          imported.animationGroups.forEach(group=>group.dispose());
        }
      };
    }catch(error){
      console.warn("Optional Arkvoid GLB failed to load; procedural art remains active.",path,error);
      return null;
    }
  }
}
