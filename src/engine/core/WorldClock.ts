export const WORLD_DAY_LENGTH_MS = 4 * 60 * 60 * 1000;
export const WORLD_EPOCH_MS = Date.UTC(2026, 0, 1);
export type WorldPhase = "night" | "dawn" | "day" | "dusk";
export interface WorldClockState {
  timestamp: number; day: number; hour: number; minute: number; phase: WorldPhase; progress: number;
}
let serverOffsetMs = 0;
export function setWorldClockOffset(offsetMs: number): void {
  if (Number.isFinite(offsetMs)) serverOffsetMs = offsetMs;
}
export function getWorldClock(nowMs = Date.now()): WorldClockState {
  const timestamp = Math.floor(nowMs + serverOffsetMs);
  const elapsed = timestamp - WORLD_EPOCH_MS;
  const day = Math.floor(elapsed / WORLD_DAY_LENGTH_MS) + 1;
  const elapsedInDay = ((elapsed % WORLD_DAY_LENGTH_MS) + WORLD_DAY_LENGTH_MS) % WORLD_DAY_LENGTH_MS;
  const progress = elapsedInDay / WORLD_DAY_LENGTH_MS;
  const minutes = progress * 1440;
  const hour = Math.floor(minutes / 60);
  const minute = Math.floor(minutes % 60);
  let phase: WorldPhase = "night";
  if (hour >= 5 && hour < 8) phase = "dawn";
  else if (hour >= 8 && hour < 17) phase = "day";
  else if (hour >= 17 && hour < 20) phase = "dusk";
  return { timestamp, day, hour, minute, phase, progress };
}
export function formatWorldTime(value: WorldClockState): string {
  return (value.hour % 12 || 12) + ":" + String(value.minute).padStart(2, "0") + (value.hour >= 12 ? " PM" : " AM");
}
