import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
interface Props { onVector(x:number,y:number):void; }
export function TouchJoystick({onVector}:Props){
  const ref=useRef<HTMLDivElement>(null);
  const active=useRef<number|null>(null);
  const [offset,setOffset]=useState({x:0,y:0});
  const update=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const rect=ref.current?.getBoundingClientRect();if(!rect)return;
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,max=rect.width*.34;
    const dx=event.clientX-cx,dy=event.clientY-cy,d=Math.sqrt(dx*dx+dy*dy),ratio=d>max?max/d:1;
    const x=dx*ratio,y=dy*ratio;setOffset({x,y});onVector(x/max,y/max);
  };
  const end=()=>{active.current=null;setOffset({x:0,y:0});onVector(0,0);};
  return <div ref={ref} className="touch-joystick" aria-label="Movement control"
    onPointerDown={event=>{event.preventDefault();event.stopPropagation();active.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);update(event);}}
    onPointerMove={event=>{if(active.current!==event.pointerId)return;event.preventDefault();event.stopPropagation();update(event);}}
    onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
    <div className="joystick-track"/><div className="joystick-thumb" style={{transform:"translate3d("+offset.x+"px,"+offset.y+"px,0)"}}/>
  </div>;
}
