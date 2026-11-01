import { create } from "zustand";
export interface BreathBalance { dawn:number; dusk:number; }
interface WorldStore {
  breath:BreathBalance;
  addBreath(kind:"dawn"|"dusk",amount:number):void;
  setBreath(balance:BreathBalance):void;
}
export const useWorldStore=create<WorldStore>(set=>({
  breath:{dawn:0,dusk:0},
  addBreath:(kind,amount)=>set(state=>({breath:{...state.breath,[kind]:state.breath[kind]+Math.max(0,amount)}})),
  setBreath:breath=>set({breath})
}));
