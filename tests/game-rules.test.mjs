import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  renderStateToText,
  restartGame,
  syncLayoutMode,
} from "../src/game-rules.js";

test("createInitialState includes mobile shell fields", () => {
  const state = createInitialState("portrait");

  assert.equal(state.layoutMode, "portrait");
  assert.equal(state.boardPreset, "portrait");
  assert.equal(state.overlayScreen, "explain");
  assert.equal(state.statusMessage.length > 0, true);
});

test("restartGame locks the current layout into the round preset", () => {
  const state = createInitialState("portrait");

  restartGame(state);

  assert.equal(state.boardPreset, "portrait");
  assert.equal(state.grid.length, 12);
  assert.equal(state.grid[0].length, 18);
  assert.equal(state.timeLeft, 110);
  assert.equal(state.overlayScreen, null);
});

test("syncLayoutMode only updates the active board preset before a round starts", () => {
  const state = createInitialState("portrait");

  syncLayoutMode(state, "landscape");
  assert.equal(state.layoutMode, "landscape");
  assert.equal(state.boardPreset, "landscape");

  restartGame(state);
  syncLayoutMode(state, "portrait");

  assert.equal(state.layoutMode, "portrait");
  assert.equal(state.boardPreset, "landscape");
});

test("renderStateToText reports layout, preset, overlay, and mobile controls", () => {
  const state = createInitialState("portrait");
  const payload = JSON.parse(renderStateToText(state));

  assert.equal(payload.layoutMode, "portrait");
  assert.equal(payload.boardPreset, "portrait");
  assert.equal(payload.overlayScreen, "explain");
  assert.deepEqual(Object.keys(payload.controls).sort(), [
    "audioLabel",
    "colorblindLabel",
    "pauseLabel",
    "restartLabel",
  ]);
});
