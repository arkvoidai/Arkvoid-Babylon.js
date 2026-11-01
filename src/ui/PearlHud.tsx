import { useState } from "react";
import { ArrowUpRight, Compass, Moon, Sparkles, Sun, X } from "lucide-react";
import type { RuntimeContext, RuntimeStats, ResidentInfo } from "@/engine/ArkvoidRuntime";
import type { BreathBalance } from "@/state/worldStore";
import { TouchJoystick } from "./TouchJoystick";

interface Props {
  entered:boolean;context:RuntimeContext;stats:RuntimeStats;breath:BreathBalance;
  dialogue:ResidentInfo|null;message:string;orbOpen:boolean;
  onEnter():void;onAction():void;onOrbToggle():void;onCloseDialogue():void;
  onSendDialogue(text:string):Promise<void>;onMove(x:number,y:number):void;
}
function Gate({onEnter}:{onEnter():void}){
  return <div className="gate-overlay"><section className="gate-card">
    <div className="gate-mark"><span/><span/><span/></div><p className="gate-kicker">ARKVOID</p>
    <h1>Celestial<br/><em>Frontier</em></h1><div className="gate-rule"/>
    <p className="gate-subtitle">A world between light and silence.</p>
    <button className="enter-button" onClick={onEnter}>Enter world <ArrowUpRight size={17}/></button>
  </section><div className="gate-coordinate">HOME REACH <span>·</span> THE CLOUD SEA</div></div>;
}
function Orb({stats,open,onClick}:{stats:RuntimeStats;open:boolean;onClick():void}){
  const Icon=stats.phase==="night"||stats.phase==="dusk"?Moon:Sun;
  return <button className={"world-orb"+(open?" is-open":"")} onClick={onClick} aria-label="World details">
    <span className="orb-ring"/><Icon size={18}/><span className="orb-time">{stats.time}</span>
  </button>;
}
function OrbSheet({stats,breath,onClose}:{stats:RuntimeStats;breath:BreathBalance;onClose():void}){
  return <section className="orb-sheet glass-panel">
    <div className="sheet-head"><span className="eyebrow">CELESTIAL FRONTIER</span><button className="icon-button" onClick={onClose} aria-label="Close"><X size={16}/></button></div>
    <div className="sheet-time"><span className="sheet-day">DAY {stats.day}</span><strong>{stats.time}</strong><span className="sheet-phase">{stats.phase}</span></div>
    <div className="breath-row">
      <div className="breath-value dawn"><Sun size={15}/><span>Dawn Breath</span><strong>{breath.dawn}</strong></div>
      <div className="breath-value dusk"><Moon size={15}/><span>Dusk Breath</span><strong>{breath.dusk}</strong></div>
    </div>
    <div className="sheet-foot"><span>REALM</span><strong>Stillness · Stage 1</strong></div>
  </section>;
}
function Dialogue({resident,onClose,onSend}:{resident:ResidentInfo;onClose():void;onSend(text:string):Promise<void>}){
  const [value,setValue]=useState("");const [busy,setBusy]=useState(false);
  const submit=async()=>{const text=value.trim();if(!text||busy)return;setBusy(true);await onSend(text);setValue("");setBusy(false);};
  return <div className="dialogue-wrap"><section className="dialogue-panel glass-panel">
    <div className="dialogue-head"><div><span className="eyebrow">RESIDENT</span><h2>{resident.name}</h2><p>{resident.role}</p></div>
      <button className="icon-button" onClick={onClose} aria-label="Close conversation"><X size={17}/></button></div>
    <blockquote>“{resident.line}”</blockquote>
    <form onSubmit={event=>{event.preventDefault();void submit();}}>
      <input value={value} onChange={event=>setValue(event.target.value)} maxLength={280} placeholder="Speak quietly…"/>
      <button className="send-button" disabled={!value.trim()||busy} type="submit" aria-label="Send"><ArrowUpRight size={17}/></button>
    </form>
  </section></div>;
}
export function PearlHud(props:Props){
  const [messageOpen,setMessageOpen]=useState(false);
  const Icon=props.stats.phase==="dawn"||props.stats.phase==="day"?Sun:Moon;
  return <>
    <div className="brand-lockup"><div className="brand-symbol"><span/><span/><span/></div><div><strong>ARKVOID</strong><small>CELESTIAL FRONTIER</small></div></div>
    {props.entered&&<>
      <div className="world-topline"><div className="location-chip"><Compass size={13}/><span>HOME REACH</span></div><div className="world-presence"><span className="presence-dot"/> THE WORLD IS QUIET</div></div>
      <Orb stats={props.stats} open={props.orbOpen} onClick={props.onOrbToggle}/>
      {props.orbOpen&&<OrbSheet stats={props.stats} breath={props.breath} onClose={props.onOrbToggle}/>}
      <button className="context-action" onClick={props.onAction}>
        {props.context.kind==="resident"?<Compass size={17}/>:<Sparkles size={17}/>}
        <span>{props.context.label}</span><span className="action-key">↵</span>
      </button>
      <TouchJoystick onVector={props.onMove}/>
      {props.message&&<button className="world-message" onClick={()=>setMessageOpen(v=>!v)}><Icon size={13}/><span>{messageOpen?props.message:props.message.length>46?props.message.slice(0,46)+"…":props.message}</span></button>}
    </>}
    {!props.entered&&<Gate onEnter={props.onEnter}/>}
    {props.dialogue&&<Dialogue resident={props.dialogue} onClose={props.onCloseDialogue} onSend={props.onSendDialogue}/>}
  </>;
}
