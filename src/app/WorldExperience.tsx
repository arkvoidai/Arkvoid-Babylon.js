import { useCallback, useEffect, useRef, useState } from "react";
import { createArkvoidRuntime, type ArkvoidRuntime, type ResidentInfo, type RuntimeContext, type RuntimeStats } from "@/engine/ArkvoidRuntime";
import { formatWorldTime, getWorldClock, setWorldClockOffset } from "@/engine/core/WorldClock";
import { gatherBreath, speakToResident, syncWorldClock } from "@/net/worldService";
import { useWorldStore } from "@/state/worldStore";
import { PearlHud } from "@/ui/PearlHud";

const initialStats:RuntimeStats={fps:0,day:1,time:formatWorldTime(getWorldClock()),phase:getWorldClock().phase};
const initialContext:RuntimeContext={label:"Gather Dawn",kind:"gather"};
export function WorldExperience(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const runtimeRef=useRef<ArkvoidRuntime|null>(null);
  const [entered,setEntered]=useState(false);
  const [ready,setReady]=useState(false);
  const [context,setContext]=useState(initialContext);
  const [stats,setStats]=useState(initialStats);
  const [dialogue,setDialogue]=useState<ResidentInfo|null>(null);
  const [message,setMessage]=useState("");
  const [orbOpen,setOrbOpen]=useState(false);
  const breath=useWorldStore(state=>state.breath);
  const addBreath=useWorldStore(state=>state.addBreath);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    let active=true;
    try{
      const runtime=createArkvoidRuntime(canvas,{
        onReady:()=>{if(active)setReady(true);},
        onContext:value=>{if(active)setContext(value);},
        onResident:value=>{if(active)setDialogue(value);},
        onGather:async kind=>{
          const result=await gatherBreath(kind);if(!active)return;
          if(result.ok)addBreath(kind,result.gain);setMessage(result.message);
        },
        onStats:value=>{if(active)setStats(value);},
        onMessage:value=>{if(active)setMessage(value);}
      });
      runtimeRef.current=runtime;
      const sync=async()=>{const offset=await syncWorldClock();if(active&&offset!==null)setWorldClockOffset(offset);};
      void sync();
      const interval=window.setInterval(()=>void sync(),10*60*1000);
      const focus=()=>{if(document.visibilityState==="visible")void sync();};
      window.addEventListener("focus",focus);
      return ()=>{
        active=false;window.clearInterval(interval);window.removeEventListener("focus",focus);
        runtime.dispose();runtimeRef.current=null;
      };
    }catch(error){
      console.error("Arkvoid Babylon runtime failed to initialize.",error);
      setMessage("The world could not be opened on this device.");
    }
    return ()=>{active=false;runtimeRef.current?.dispose();runtimeRef.current=null;};
  },[addBreath]);

  const enter=useCallback(()=>{runtimeRef.current?.enter();setEntered(true);},[]);
  const interact=useCallback(()=>runtimeRef.current?.interact(),[]);
  const sendDialogue=useCallback(async(text:string)=>{
    if(!dialogue)return;
    const reply=await speakToResident(dialogue.id,text);
    setDialogue(current=>current?{...current,line:reply}:current);
  },[dialogue]);

  return <main className="world-shell">
    <canvas ref={canvasRef} className="world-canvas" aria-label="Arkvoid interactive world"/>
    <div className="world-vignette"/>
    <PearlHud entered={entered&&ready} context={context} stats={stats} breath={breath} dialogue={dialogue}
      message={message} orbOpen={orbOpen} onEnter={enter} onAction={interact}
      onOrbToggle={()=>setOrbOpen(value=>!value)} onCloseDialogue={()=>setDialogue(null)}
      onSendDialogue={sendDialogue} onMove={(x,y)=>runtimeRef.current?.setMoveVector(x,y)}/>
    {entered&&!ready&&<div className="boot-state" aria-live="polite"><span className="boot-mark"/><span>{message||"Preparing the world"}</span></div>}
  </main>;
}
