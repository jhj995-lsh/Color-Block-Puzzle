import { UI_COPY } from "./config.js";
import { createAudioController } from "./audio.js";
import {
  closeLeaderboard,
  createInitialState,
  dismissExplain,
  getControlLabels,
  getDisplayBoardSettings,
  openLeaderboard,
  performClick,
  renderStateToText,
  restartGame,
  setStatusMessage,
  syncLayoutMode,
  toggleColorblind,
  togglePause,
  updateState,
} from "./game-rules.js";
import {
  fitStageFrame,
  getDefaultBoardPreset,
  getStageRatio,
  resolveLayoutMode,
} from "./layout.js";
import { getOverlayView, shouldReplaceOverlay } from "./overlay-view.js";
import { renderGame } from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const appShell = document.getElementById("app-shell");
const topHud = document.querySelector(".top-hud");
const stageShell = document.querySelector(".stage-shell");
const stageFrame = document.getElementById("stage-frame");
const overlay = document.getElementById("overlay");
const statusBar = document.getElementById("status-bar");
const controls = document.getElementById("controls");
const scoreValue = document.getElementById("hud-score");
const timeValue = document.getElementById("hud-time");
const boardValue = document.getElementById("hud-board");
const audioButton = document.getElementById("audio-toggle");
const titleValue = document.getElementById("hud-title");
const subtitleValue = document.getElementById("hud-subtitle");

const audio = createAudioController();
const state = createInitialState(resolveLayoutMode(window.innerWidth, window.innerHeight));

let lastFrameTime = 0;
let gameOverSoundPlayed = false;
let shellLayoutKey = "";
let previousOverlayView = null;

titleValue.textContent = UI_COPY.title;
subtitleValue.textContent = UI_COPY.subtitle;

function getDisplaySettings() {
  return getDisplayBoardSettings(state);
}

function getBoardCell(clientX, clientY) {
  const settings = getDisplaySettings();
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  const col = Math.floor((x - settings.board.x) / settings.board.cell);
  const row = Math.floor((y - settings.board.y) / settings.board.cell);

  if (
    col < 0 ||
    col >= settings.board.cols ||
    row < 0 ||
    row >= settings.board.rows
  ) {
    return null;
  }

  return { row, col };
}

function updateLayoutMode() {
  syncLayoutMode(state, resolveLayoutMode(window.innerWidth, window.innerHeight));
}

function syncStageFrame() {
  const preset = state.running || state.gameOver ? state.boardPreset : getDefaultBoardPreset(state.layoutMode);
  const settings = getDisplaySettings();
  const aspect = getStageRatio(preset);
  stageFrame.style.setProperty("--stage-aspect", `${aspect}`);
  stageFrame.style.setProperty("--stage-max-width", `${settings.stage.width}px`);
  appShell.dataset.layoutMode = state.layoutMode;

  const controlsVisible = !controls.hidden;
  const shellStyles = window.getComputedStyle(appShell);
  const shellGap = parseFloat(shellStyles.rowGap || shellStyles.gap || "12");
  const shellPaddingTop = parseFloat(shellStyles.paddingTop || "0");
  const shellPaddingBottom = parseFloat(shellStyles.paddingBottom || "0");
  const topHeight = topHud.getBoundingClientRect().height;
  const statusHeight = statusBar.getBoundingClientRect().height;
  const controlsHeight = controlsVisible ? controls.getBoundingClientRect().height : 0;
  const stageShellWidth = stageShell.getBoundingClientRect().width;
  const layoutKey = [
    preset,
    state.layoutMode,
    window.innerWidth,
    window.innerHeight,
    controlsVisible,
    Math.round(topHeight),
    Math.round(statusHeight),
    Math.round(controlsHeight),
    Math.round(stageShellWidth),
  ].join("|");

  if (layoutKey === shellLayoutKey) {
    return;
  }
  shellLayoutKey = layoutKey;

  const frameSize = fitStageFrame({
    presetName: preset,
    viewportHeight: window.innerHeight,
    stageShellWidth,
    shellPaddingTop,
    shellPaddingBottom,
    shellGap,
    topHeight,
    statusHeight,
    controlsHeight,
    controlsVisible,
  });

  stageFrame.style.width = `${frameSize.width}px`;
  stageFrame.style.height = `${frameSize.height}px`;
}

function renderOverlay() {
  const settings = getDisplaySettings();
  const nextView = getOverlayView(state, settings);

  appShell.dataset.overlayScreen = nextView.screen;
  overlay.hidden = nextView.hidden;

  if (shouldReplaceOverlay(previousOverlayView, nextView)) {
    overlay.innerHTML = nextView.markup;
  }

  previousOverlayView = nextView;
}

function renderHud() {
  const settings = getDisplaySettings();
  const labels = getControlLabels(state);
  scoreValue.textContent = String(state.score);
  timeValue.textContent = `${Math.ceil(state.timeLeft)}`;
  boardValue.textContent = `${settings.board.cols}×${settings.board.rows}`;
  audioButton.textContent = labels.audioLabel;
}

function renderControls() {
  const labels = getControlLabels(state);
  const hidden = Boolean(state.overlayScreen);

  controls.hidden = hidden;
  if (hidden) {
    return;
  }

  controls.querySelector('[data-control="pause"]').textContent = labels.pauseLabel;
  controls.querySelector('[data-control="colorblind"]').textContent = labels.colorblindLabel;
  controls.querySelector('[data-control="restart"]').textContent = labels.restartLabel;
}

function renderStatus() {
  statusBar.textContent = state.statusMessage;
}

function renderApp() {
  renderHud();
  renderControls();
  renderStatus();
  renderOverlay();
  syncStageFrame();
  renderGame(ctx, state);
}

function playAudio(name) {
  audio.play(name);
  state.audioEnabled = audio.isEnabled();
}

function startRound(audioName) {
  restartGame(state);
  gameOverSoundPlayed = false;
  playAudio(audioName);
  renderApp();
}

function handleOverlayAction(action) {
  if (action === "dismiss-explain") {
    dismissExplain(state);
    playAudio("button");
  } else if (action === "start-game") {
    startRound("start");
    return;
  } else if (action === "open-leaderboard") {
    openLeaderboard(state);
    playAudio("button");
  } else if (action === "close-leaderboard") {
    closeLeaderboard(state);
    playAudio("button");
  } else if (action === "restart-game") {
    startRound("button");
    return;
  }

  renderApp();
}

function handleControlAction(action) {
  if (action === "pause") {
    if (togglePause(state)) {
      playAudio("button");
    } else if (state.running && !state.gameOver) {
      playAudio("button");
    }
  } else if (action === "colorblind") {
    toggleColorblind(state);
    playAudio("button");
  } else if (action === "restart") {
    startRound("start");
    return;
  }

  renderApp();
}

function handleCanvasPress(event) {
  if (state.overlayScreen || !state.running || state.paused || state.gameOver) {
    return;
  }

  const cell = getBoardCell(event.clientX, event.clientY);
  if (!cell) {
    setStatusMessage(state, "请点在棋盘里的空白格。");
    renderApp();
    return;
  }

  const result = performClick(state, cell.row, cell.col);
  if (result.type === "success") {
    playAudio("success");
  } else if (result.type === "miss") {
    playAudio("button");
    if (state.gameOver && !gameOverSoundPlayed) {
      playAudio("gameOver");
      gameOverSoundPlayed = true;
    }
  } else if (result.type === "occupied") {
    playAudio("button");
  }

  renderApp();
}

function step(ms) {
  const wasGameOver = state.gameOver;
  updateState(state, ms / 1000);
  if (!wasGameOver && state.gameOver && !gameOverSoundPlayed) {
    playAudio("gameOver");
    gameOverSoundPlayed = true;
  }
}

function frame(now) {
  if (!lastFrameTime) {
    lastFrameTime = now;
  }

  const dt = Math.min(now - lastFrameTime, 20);
  lastFrameTime = now;
  step(dt);
  renderApp();
  window.requestAnimationFrame(frame);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    stageFrame.requestFullscreen?.().catch(() => {});
    return;
  }
  document.exitFullscreen?.().catch(() => {});
}

window.render_game_to_text = () => renderStateToText(state);
window.advanceTime = (ms) => {
  const frameStep = 1000 / 60;
  const steps = Math.max(1, Math.round(ms / frameStep));

  for (let index = 0; index < steps; index += 1) {
    step(frameStep);
  }

  renderApp();
  lastFrameTime = performance.now();
};

window.addEventListener("resize", () => {
  updateLayoutMode();
  renderApp();
});

window.addEventListener("orientationchange", () => {
  updateLayoutMode();
  renderApp();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (state.overlayScreen === "explain") {
      handleOverlayAction("dismiss-explain");
    } else if (state.overlayScreen === "start") {
      handleOverlayAction("start-game");
    } else if (state.overlayScreen === "gameover") {
      handleOverlayAction("restart-game");
    }
    return;
  }

  if (event.code === "KeyP") {
    handleControlAction("pause");
    return;
  }

  if (event.code === "KeyC") {
    handleControlAction("colorblind");
    return;
  }

  if (event.code === "KeyF") {
    toggleFullscreen();
  }
});

overlay.addEventListener("click", (event) => {
  const button = event.target.closest("[data-overlay-action]");
  if (!button) {
    return;
  }
  handleOverlayAction(button.dataset.overlayAction);
});

controls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-control]");
  if (!button) {
    return;
  }
  handleControlAction(button.dataset.control);
});

audioButton.addEventListener("click", () => {
  state.audioEnabled = audio.toggle();
  setStatusMessage(state, state.audioEnabled ? "声音已开启。" : "声音已关闭。");
  renderApp();
});

canvas.addEventListener("pointerdown", handleCanvasPress);

updateLayoutMode();
renderApp();
window.requestAnimationFrame(frame);
