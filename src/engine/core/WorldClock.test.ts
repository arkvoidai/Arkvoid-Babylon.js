import test from "node:test";
import assert from "node:assert/strict";
import { getWorldClock, WORLD_DAY_LENGTH_MS, WORLD_EPOCH_MS } from "./WorldClock";
test("a celestial day lasts four real hours", () => {
  assert.equal(getWorldClock(WORLD_EPOCH_MS).day, 1);
  assert.equal(getWorldClock(WORLD_EPOCH_MS + WORLD_DAY_LENGTH_MS).day, 2);
});
test("world lighting phases cover dawn, day, dusk and night", () => {
  const at = (h: number) => getWorldClock(WORLD_EPOCH_MS + h / 24 * WORLD_DAY_LENGTH_MS).phase;
  assert.equal(at(6), "dawn"); assert.equal(at(12), "day"); assert.equal(at(18), "dusk"); assert.equal(at(22), "night");
});
