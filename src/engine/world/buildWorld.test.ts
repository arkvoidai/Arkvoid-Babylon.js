import test from "node:test";
import assert from "node:assert/strict";
import { terrainHeightAt } from "./buildWorld";

test("the Home Reach height function is finite throughout the intended island radius",()=>{
  for(let x=-40;x<=40;x+=4)for(let z=-40;z<=40;z+=4){
    assert.ok(Number.isFinite(terrainHeightAt(x,z)));
  }
});

test("the island edge falls below the centre plateau",()=>{
  assert.ok(terrainHeightAt(43,0)<terrainHeightAt(0,0));
});
