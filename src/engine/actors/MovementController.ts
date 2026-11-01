import { ArcRotateCamera, Vector2, Vector3 } from "@babylonjs/core";
export class MovementController {
  private readonly keys = new Set<string>();
  private readonly velocity = new Vector3();
  private readonly desired = new Vector3();
  private readonly joystick = new Vector2();
  private readonly down = (event: KeyboardEvent) => {
    const key=event.key.toLowerCase();
    if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(key)){
      this.keys.add(key); event.preventDefault();
    }
  };
  private readonly up = (event: KeyboardEvent) => this.keys.delete(event.key.toLowerCase());
  private readonly clear = () => { this.keys.clear(); this.joystick.set(0,0); };
  constructor(private readonly camera: ArcRotateCamera, private readonly actor: {root: {position: Vector3;rotation: Vector3}; update(dt:number,moving:boolean):void}, private readonly heightAt:(x:number,z:number)=>number) {
    window.addEventListener("keydown",this.down,{passive:false});
    window.addEventListener("keyup",this.up);
    window.addEventListener("blur",this.clear);
  }
  setJoystick(x:number,y:number):void{this.joystick.set(x,y);}
  update(dt:number):void{
    const forward=Number(this.keys.has("s")||this.keys.has("arrowdown"))-Number(this.keys.has("w")||this.keys.has("arrowup"))-this.joystick.y;
    const strafe=Number(this.keys.has("d")||this.keys.has("arrowright"))-Number(this.keys.has("a")||this.keys.has("arrowleft"))+this.joystick.x;
    const fx=-Math.sin(this.camera.alpha),fz=-Math.cos(this.camera.alpha);
    const rx=Math.cos(this.camera.alpha),rz=-Math.sin(this.camera.alpha);
    this.desired.set(fx*forward+rx*strafe,0,fz*forward+rz*strafe);
    const length=this.desired.length();
    if(length>1)this.desired.scaleInPlace(1/length);
    const speed=this.joystick.length()>.04?4.1:5;
    const blend=Math.min(1,dt*11);
    this.velocity.x+=(this.desired.x*speed-this.velocity.x)*blend;
    this.velocity.z+=(this.desired.z*speed-this.velocity.z)*blend;
    const p=this.actor.root.position;
    const nx=p.x+this.velocity.x*dt,nz=p.z+this.velocity.z*dt;
    if(Math.sqrt(nx*nx+nz*nz)<40.2){p.x=nx;p.z=nz;}else this.velocity.scaleInPlace(.7);
    p.y=this.heightAt(p.x,p.z);
    const moving=Math.abs(this.velocity.x)+Math.abs(this.velocity.z)>.2;
    if(moving)this.actor.root.rotation.y=Math.atan2(this.velocity.x,this.velocity.z)+Math.PI;
    this.actor.update(dt,moving);
  }
  dispose():void{
    window.removeEventListener("keydown",this.down);window.removeEventListener("keyup",this.up);
    window.removeEventListener("blur",this.clear);this.clear();
  }
}
