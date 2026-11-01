import { createClient, type SupabaseClient } from "@supabase/supabase-js";
const url=import.meta.env.VITE_SUPABASE_URL?.trim()??"";
const anon=import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()??"";
let client:SupabaseClient|null|undefined;
export function getSupabase():SupabaseClient|null{
  if(client!==undefined)return client;
  if(!url||!anon){client=null;return null;}
  client=createClient(url,anon,{auth:{
    persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,
    storageKey:"arkvoid.auth",flowType:"pkce"
  }});
  return client;
}
export function isSupabaseConfigured():boolean{return Boolean(url&&anon);}
