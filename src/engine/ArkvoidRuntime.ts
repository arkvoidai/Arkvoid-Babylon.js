import {
  ArcRotateCamera, Color3, Color4, DefaultRenderingPipeline, DirectionalLight, Engine,
  HemisphericLight, PointerEventTypes, Scene, ShadowGenerator, Vector3
} from "@babylonjs/core";
import { createDynamicAvatar, buildWorld, terrainHeightAt } from "@/engine/world/buildWorld";\nimport { AssetRegistry, type LoadedAsset } from "@/engine/assets/AssetRegistry";
import { MovementController } from "@/engine/actors/MovementController";
import { QualityGovernor } from "@/engine/QualityGovernor";
import { formatWorldTime, getWorldClock } from "@/engine/core/WorldClock";

export interface ResidentInfo { id:string; name:string; role:string; line:string; }
export interface RuntimeContext { label:string; kind:"resident"|"gather"; }
export interface RuntimeStats { fps:number; day:number; time:string; phase:string; }
export interface RuntimeCallbacks {
  onReady():void; onContext(value:RuntimeContext):void; onResident(value:ResidentInfo):void;
  onGather(kind:"dawn"|"dusk"):void; onStats(value:RuntimeStats):void; onMessage(value:string):void;
}
export interface ArkvoidRuntime {
  enter():void; interact():void; setMoveVector(x:number,y:number):void;
  getPosition():{x:number;z:number}; dispose():void;
}
interface ResidentActor { info:ResidentInfo; rig:ReturnType<typeof createDynamicAvatar>; }
const mobile = () => matchMedia("(pointer: coarse)").matches || innerWidth < 760;

export function createArkvoidRuntime(canvas:HTMLCanvasElement,callbacks:RuntimeCallbacks):ArkvoidRuntime {
  const isMobile=mobile();
  const engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:false});
  engine.setHardwareScalingLevel(1/(Math.min(devicePixelRatio||1,isMobile?1.5:2)));
  const scene=new Scene(engine);
  scene.clearColor=new Color4(.67,.75,.8,1);
  scene.fogMode=Scene.FOGMODE_EXP2; scene.fogDensity=.00115; scene.fogColor=new Color3(.7,.75,.78);
  scene.skipPointerMovePicking=true; scene.collisionsEnabled=false;

  const camera=new ArcRotateCamera("world-camera",-Math.PI*.72,1.12,25,new Vector3(0,3,0),scene);
  camera.lowerRadiusLimit=9;camera.upperRadiusLimit=43;camera.lowerBetaLimit=.58;camera.upperBetaLimit=1.45;
  camera.panningSensibility=0;camera.wheelPrecision=55;camera.inertia=.82;camera.attachControl(canvas,true);

  const sky=new HemisphericLight("sky-fill",new Vector3(0,1,0),scene);
  sky.intensity=.8;sky.diffuse=new Color3(.9,.88,.83);sky.groundColor=new Color3(.25,.28,.3);
  const sun=new DirectionalLight("celestial-sun",new Vector3(-.4,-1,.3),scene);
  sun.position=new Vector3(-42,72,38);sun.intensity=2.1;sun.diffuse=new Color3(1,.86,.7);
  const shadows=new ShadowGenerator(isMobile?768:1536,sun);
  shadows.usePercentageCloserFiltering=true;shadows.bias=.0005;shadows.normalBias=.02;
  let pipeline:DefaultRenderingPipeline|null=null;
  try {
    pipeline=new DefaultRenderingPipeline("arkvoid-composite",true,scene,[camera]);
    pipeline.fxaaEnabled=true;pipeline.bloomEnabled=!isMobile;
    pipeline.bloomThreshold=1.2;pipeline.bloomWeight=.16;pipeline.bloomKernel=48;
    pipeline.imageProcessingEnabled=true;pipeline.imageProcessing.contrast=1.07;
    pipeline.imageProcessing.exposure=1.02;pipeline.imageProcessing.toneMappingEnabled=true;
  } catch (error) { console.warn("Optional post processing was disabled.",error); }

  const materials=buildWorld(scene,shadows);
  const player=createDynamicAvatar(scene,"wanderer",{
    robe:new Color3(.24,.33,.31),trim:new Color3(.66,.48,.26),hair:new Color3(.1,.09,.1)
  });
  player.root.position.set(0,terrainHeightAt(0,12),12);
  player.root.setEnabled(false);
  shadows.addShadowCaster(player.root,true);

  const defs:ResidentInfo[]=[
    {id:"meilin",name:"Meilin",role:"Keeper of the Dawn Terrace",line:"The air is clear today. Stay a little."},
    {id:"yue",name:"Yue",role:"Watcher of the Garden Gate",line:"The garden keeps a quieter path after sunset."},
    {id:"sylva",name:"Sylva",role:"Warden of the Cloud Orchard",line:"Some things grow only when no one is watching."}
  ];
  const positions=[[5.4,-3],[18.5,5],[-17,8]] as const;
  const palettes=[
    [new Color3(.46,.32,.29),new Color3(.76,.56,.27),new Color3(.12,.1,.12)],
    [new Color3(.29,.35,.45),new Color3(.6,.54,.75),new Color3(.13,.11,.15)],
    [new Color3(.27,.4,.32),new Color3(.63,.5,.28),new Color3(.19,.13,.1)]
  ] as const;
  const residents:ResidentActor[]=defs.map((info,index)=>{
    const palette=palettes[index];
    const rig=createDynamicAvatar(scene,info.id,{robe:palette[0],trim:palette[1],hair:palette[2]});
    rig.root.position.set(positions[index][0],terrainHeightAt(positions[index][0],positions[index][1]),positions[index][1]);
    rig.root.setEnabled(false);shadows.addShadowCaster(rig.root,true);
    return {info,rig};
  });
  let entered=false,disposed=false,lastContext="",statsTimer=0,atmosphereTimer=0,worldMotionTime=0;
  const mover=new MovementController(camera,player,terrainHeightAt);
  const target=new Vector3(0,3,12);
  const assetRegistry=new AssetRegistry(scene);
  const loadedAssets:LoadedAsset[]=[];
  const characterTargets={
    wanderer:player,meilin:residents[0].rig,yue:residents[1].rig,sylva:residents[2].rig
  };
  void assetRegistry.loadManifest(characterTargets,materials).then(assets=>{
    if(disposed){assets.forEach(asset=>asset.dispose());return;}
    loadedAssets.push(...assets);
  }).catch(error=>console.warn("Optional Arkvoid asset manifest could not be applied.",error));
  const cloudMotion=scene.meshes.filter(mesh=>mesh.name.startsWith("cloud-bank-")).map((mesh,index)=>({
    mesh,baseX:mesh.position.x,baseY:mesh.position.y,baseZ:mesh.position.z,phase:index*.37
  }));
  const canopyMotion=scene.meshes.filter(mesh=>mesh.name.startsWith("tree-crown-"));
  const lanternMotion=scene.meshes.filter(mesh=>mesh.name.startsWith("spirit-lantern-")).map((mesh,index)=>({
    mesh,baseY:mesh.position.y,phase:index*.61
  }));
  const nearestResident=():ResidentActor|null=>{
    if(!entered)return null;
    let nearest:ResidentActor|null=null;let distance=5.7;
    for(const resident of residents){
      const d=Vector3.Distance(player.root.position,resident.rig.root.position);
      if(d<distance){nearest=resident;distance=d;}
    }
    return nearest;
  };
  const updateContext=()=>{
    const resident=nearestResident();
    const value:RuntimeContext=resident
      ?{label:"Speak with "+resident.info.name,kind:"resident"}
      :{label:player.root.position.x>10?"Gather Dusk":"Gather Dawn",kind:"gather"};
    const key=value.kind+value.label;
    if(key!==lastContext){lastContext=key;callbacks.onContext(value);}
  };
  const enter=()=>{
    if(entered||disposed)return;
    entered=true;player.root.setEnabled(true);residents.forEach(r=>r.rig.root.setEnabled(true));
    target.copyFrom(player.root.position);target.y+=1.3;camera.setTarget(target);
    callbacks.onMessage("The world is listening.");callbacks.onReady();updateContext();
  };
  const interact=()=>{
    if(!entered||disposed)return;
    const resident=nearestResident();
    if(resident){callbacks.onResident(resident.info);return;}
    callbacks.onGather(player.root.position.x>10?"dusk":"dawn");
  };
  const pointerObserver=scene.onPointerObservable.add(info=>{
    if(info.type!==PointerEventTypes.POINTERDOWN||!entered)return;
    const result=scene.pick(scene.pointerX,scene.pointerY);
    const residentId=result?.pickedMesh?.metadata?.residentId as string|undefined;
    const resident=residents.find(item=>item.info.id===residentId);
    if(resident)callbacks.onResident(resident.info);
  });
  const updateAtmosphere=()=>{
    const clock=getWorldClock();
    const angle=clock.progress*Math.PI*2-Math.PI/2;
    const daylight=Math.max(0,Math.min(1,(Math.sin(angle)+.12)*1.2));
    if(clock.phase==="dawn"||clock.phase==="dusk"){
      sun.diffuse.copyFrom(new Color3(1,.62,.41));
      scene.clearColor.copyFrom(new Color4(.72,.68,.69,1));
      scene.fogColor.copyFrom(new Color3(.72,.65,.65));
    }else if(clock.phase==="night"){
      sun.diffuse.copyFrom(new Color3(.29,.34,.54));
      scene.clearColor.copyFrom(new Color4(.22,.25,.37,1));
      scene.fogColor.copyFrom(new Color3(.25,.28,.39));
    }else{
      sun.diffuse.copyFrom(new Color3(1,.9,.77));
      scene.clearColor.copyFrom(new Color4(.64,.74,.8,1));
      scene.fogColor.copyFrom(new Color3(.7,.76,.79));
    }
    sun.intensity=.16+daylight*2.2;
    sun.direction.set(Math.cos(angle),-Math.max(.24,Math.sin(angle)),Math.sin(angle)).normalize();
    sky.intensity=.26+daylight*.65;
    sky.diffuse.copyFrom(clock.phase==="night"?new Color3(.35,.4,.59):clock.phase==="dusk"?new Color3(.61,.54,.74):new Color3(.91,.9,.87));
    scene.fogDensity=clock.phase==="night"?.0018:.0011;
  };
  const quality=new QualityGovernor(engine,pipeline,isMobile);
  const render=()=>{
    if(disposed)return;
    const dt=Math.min(engine.getDeltaTime()/1000,.05);
    worldMotionTime+=dt;
    cloudMotion.forEach(cloud=>{
      cloud.mesh.position.set(
        cloud.baseX+Math.sin(worldMotionTime*.035+cloud.phase)*.85,
        cloud.baseY+Math.sin(worldMotionTime*.19+cloud.phase)*.3,
        cloud.baseZ+Math.cos(worldMotionTime*.028+cloud.phase)*.55
      );
    });
    canopyMotion.forEach((mesh,index)=>{mesh.rotation.z=Math.sin(worldMotionTime*.32+index*.73)*.014;});
    lanternMotion.forEach(({mesh,baseY,phase})=>{
      mesh.position.y=baseY+Math.sin(worldMotionTime*.8+phase)*.12;
      mesh.scaling.setAll(1+Math.sin(worldMotionTime*1.4+phase)*.12);
    });
    if(entered){
      mover.update(dt);
      target.set(player.root.position.x,player.root.position.y+1.4,player.root.position.z);
      camera.target.copyFrom(target);
      updateContext();
    }
    residents.forEach(r=>r.rig.update(dt,false));
    quality.update(dt);statsTimer+=dt;atmosphereTimer+=dt;
    if(atmosphereTimer>1){atmosphereTimer=0;updateAtmosphere();}
    if(statsTimer>1){
      statsTimer=0;const clock=getWorldClock();
      callbacks.onStats({fps:Math.round(engine.getFps()),day:clock.day,time:formatWorldTime(clock),phase:clock.phase});
    }
    scene.render();
  };
  const resize=()=>engine.resize();
  const visibility=()=>{
    if(document.visibilityState==="visible"&&!disposed)engine.runRenderLoop(render);
    else engine.stopRenderLoop(render);
  };
  engine.runRenderLoop(render);window.addEventListener("resize",resize);
  document.addEventListener("visibilitychange",visibility);

  return {
    enter,interact,setMoveVector:(x,y)=>mover.setJoystick(x,y),
    getPosition:()=>({x:player.root.position.x,z:player.root.position.z}),
    dispose(){
      if(disposed)return;disposed=true;
      window.removeEventListener("resize",resize);document.removeEventListener("visibilitychange",visibility);
      scene.onPointerObservable.remove(pointerObserver);mover.dispose();
      loadedAssets.forEach(asset=>asset.dispose());loadedAssets.length=0;
      player.dispose();residents.forEach(r=>r.rig.dispose());scene.dispose();engine.dispose();
    }
  };
}
