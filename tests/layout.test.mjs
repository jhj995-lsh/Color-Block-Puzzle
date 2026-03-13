import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_PRESETS,
  fitStageFrame,
  getBoardSettings,
  getDefaultBoardPreset,
  resolveLayoutMode,
} from "../src/layout.js";

test("resolveLayoutMode prefers portrait when height is greater than width", () => {
  assert.equal(resolveLayoutMode(393, 852), "portrait");
});

test("resolveLayoutMode prefers landscape when width is greater than height", () => {
  assert.equal(resolveLayoutMode(852, 393), "landscape");
});

test("getDefaultBoardPreset mirrors the current layout mode", () => {
  assert.equal(getDefaultBoardPreset("portrait"), "portrait");
  assert.equal(getDefaultBoardPreset("landscape"), "landscape");
});

test("portrait board settings use the mobile 18x12 tuned preset", () => {
  const portrait = getBoardSettings("portrait");
  assert.equal(portrait.board.cols, 18);
  assert.equal(portrait.board.rows, 12);
  assert.equal(portrait.fillRatio, 0.64);
  assert.equal(portrait.minPlayableSpaces, 8);
  assert.equal(portrait.maxTime, 110);
  assert.equal(portrait.missPenalty, 10);
});

test("landscape board settings keep the original 22x15 preset", () => {
  const landscape = getBoardSettings("landscape");
  assert.equal(landscape.board.cols, 22);
  assert.equal(landscape.board.rows, 15);
  assert.equal(landscape.fillRatio, 0.56);
  assert.equal(landscape.minPlayableSpaces, 12);
  assert.equal(landscape.maxTime, 120);
  assert.equal(landscape.missPenalty, 10);
});

test("board preset registry exposes both portrait and landscape entries", () => {
  assert.deepEqual(Object.keys(BOARD_PRESETS).sort(), ["landscape", "portrait"]);
});

test("fitStageFrame keeps the portrait stage within the available viewport", () => {
  const frame = fitStageFrame({
    presetName: "portrait",
    viewportHeight: 852,
    stageShellWidth: 361,
    shellPaddingTop: 32,
    shellPaddingBottom: 24,
    shellGap: 12,
    topHeight: 140,
    statusHeight: 48,
    controlsHeight: 48,
    controlsVisible: true,
  });

  assert.equal(frame.width <= 361, true);
  assert.equal(frame.height <= 852, true);
  assert.equal(frame.width / frame.height > 0.7, true);
  assert.equal(frame.width / frame.height < 0.73, true);
});

test("fitStageFrame shrinks the landscape stage when vertical space is limited", () => {
  const frame = fitStageFrame({
    presetName: "landscape",
    viewportHeight: 393,
    stageShellWidth: 820,
    shellPaddingTop: 12,
    shellPaddingBottom: 12,
    shellGap: 10,
    topHeight: 96,
    statusHeight: 48,
    controlsHeight: 48,
    controlsVisible: true,
  });

  assert.equal(frame.width < BOARD_PRESETS.landscape.stage.width, true);
  assert.equal(frame.height < BOARD_PRESETS.landscape.stage.height, true);
  assert.equal(frame.height <= 393, true);
});
