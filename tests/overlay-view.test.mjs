import test from "node:test";
import assert from "node:assert/strict";

import { getOverlayView, shouldReplaceOverlay } from "../src/overlay-view.js";

const portraitSettings = {
  label: "竖屏盘面",
  board: {
    cols: 18,
    rows: 12,
  },
  maxTime: 110,
};

test("same explain overlay snapshot does not request another DOM replacement", () => {
  const state = {
    overlayScreen: "explain",
    leaderboard: [],
    score: 0,
    boardPreset: "portrait",
  };

  const first = getOverlayView(state, portraitSettings);
  const second = getOverlayView(state, portraitSettings);

  assert.equal(shouldReplaceOverlay(first, second), false);
});

test("moving from explain to start requests a DOM replacement", () => {
  const explainState = {
    overlayScreen: "explain",
    leaderboard: [],
    score: 0,
    boardPreset: "portrait",
  };
  const startState = {
    overlayScreen: "start",
    leaderboard: [],
    score: 0,
    boardPreset: "portrait",
  };

  const explainView = getOverlayView(explainState, portraitSettings);
  const startView = getOverlayView(startState, portraitSettings);

  assert.equal(shouldReplaceOverlay(explainView, startView), true);
});

test("leaderboard overlay markup reflects the current local scores", () => {
  const leaderboardState = {
    overlayScreen: "leaderboard",
    leaderboard: [
      { score: 99, date: "2026-03-13" },
      { score: 66, date: "2026-03-12" },
    ],
    score: 0,
    boardPreset: "portrait",
  };

  const view = getOverlayView(leaderboardState, portraitSettings);

  assert.equal(view.hidden, false);
  assert.match(view.markup, /99/);
  assert.match(view.markup, /2026-03-13/);
});
