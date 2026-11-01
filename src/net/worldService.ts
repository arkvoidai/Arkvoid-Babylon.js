import { getSupabase } from "./supabase";
export interface GatherResult { ok:boolean; gain:number; message:string; }
export async function syncWorldClock():Promise<number|null>{
  const client=getSupabase();if(!client)return null;
  try{
    const started=Date.now();const {data,error}=await client.rpc("world_now");const finished=Date.now();
    if(error||!data)return null;
    const server=Date.parse(String(data));return Number.isFinite(server)?server-(started+finished)/2:null;
  }catch{return null;}
}
export async function gatherBreath(kind:"dawn"|"dusk"):Promise<GatherResult>{
  const client=getSupabase();
  if(!client)return {ok:true,gain:1,message:"A quiet breath gathers around you."};
  try{
    const {data:session}=await client.auth.getSession();
    if(!session.session)return {ok:true,gain:1,message:"A quiet breath gathers around you."};
    const {data,error}=await client.rpc("gather",{p_kind:kind,p_quality:1});
    if(error)return {ok:false,gain:0,message:"The breath is resting. Try again shortly."};
    const result=data as {status?:string;gain?:number}|null;
    if(result?.status!=="ok")return {ok:false,gain:0,message:"The breath has not settled yet."};
    return {ok:true,gain:Math.max(0,Number(result.gain??0)),message:"Your breath has been gathered."};
  }catch{return {ok:false,gain:0,message:"The connection is quiet. Try again shortly."};}
}
export async function speakToResident(id:string,message:string):Promise<string>{
  const fallback="The clouds move slowly today. There is no need to hurry.";
  const client=getSupabase();if(!client)return fallback;
  try{
    const {data:session}=await client.auth.getSession();if(!session.session)return fallback;
    const {data,error}=await client.functions.invoke("mistral-npc",{body:{npcId:id,message}});
    if(error)return fallback;
    const value=data as {reply?:string;message?:string}|null;
    return value?.reply??value?.message??fallback;
  }catch{return fallback;}
}
