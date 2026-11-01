import type { Engine, DefaultRenderingPipeline } from "@babylonjs/core";
export class QualityGovernor {
  private elapsed=0; private lowSamples=0; private tier:"high"|"balanced"|"lite";
  constructor(private engine:Engine,private pipeline:DefaultRenderingPipeline|null,private mobile:boolean){
    this.tier=mobile?"balanced":"high";this.apply();
  }
  update(dt:number):void{
    this.elapsed+=dt;if(this.elapsed<3)return;this.elapsed=0;
    const fps=this.engine.getFps();
    if(fps<29)this.lowSamples++;else this.lowSamples=Math.max(0,this.lowSamples-1);
    if(this.lowSamples>=3&&this.tier!=="lite"){this.tier="lite";this.apply();}
    else if(fps>52&&this.lowSamples===0&&this.tier==="lite"&&!this.mobile){this.tier="balanced";this.apply();}
  }
  private apply():void{
    const scale=this.tier==="high"?1:this.tier==="balanced"?.78:.62;
    this.engine.setHardwareScalingLevel(1/scale);
    if(this.pipeline){this.pipeline.fxaaEnabled=this.tier!=="lite";this.pipeline.bloomEnabled=this.tier==="high";this.pipeline.bloomWeight=.16;}
  }
}
