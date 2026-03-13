export const BOARD_PRESETS = {
  portrait: {
    name: "portrait",
    label: "竖屏盘面",
    stage: {
      width: 432,
      height: 600,
    },
    board: {
      x: 18,
      y: 120,
      cols: 18,
      rows: 12,
      cell: 22,
      radius: 7,
    },
    fillRatio: 0.64,
    minPlayableSpaces: 8,
    maxTime: 110,
    missPenalty: 10,
  },
  landscape: {
    name: "landscape",
    label: "横屏盘面",
    stage: {
      width: 660,
      height: 480,
    },
    board: {
      x: 43,
      y: 55,
      cols: 22,
      rows: 15,
      cell: 25,
      radius: 5,
    },
    fillRatio: 0.56,
    minPlayableSpaces: 12,
    maxTime: 120,
    missPenalty: 10,
  },
};

export function resolveLayoutMode(width, height) {
  return height >= width ? "portrait" : "landscape";
}

export function getDefaultBoardPreset(layoutMode) {
  return layoutMode === "landscape" ? "landscape" : "portrait";
}

export function getBoardSettings(presetName) {
  return BOARD_PRESETS[presetName] || BOARD_PRESETS.portrait;
}

export function getStageRatio(presetName) {
  const settings = getBoardSettings(presetName);
  return settings.stage.width / settings.stage.height;
}

export function fitStageFrame({
  presetName,
  viewportHeight,
  stageShellWidth,
  shellPaddingTop = 0,
  shellPaddingBottom = 0,
  shellGap = 12,
  topHeight = 0,
  statusHeight = 0,
  controlsHeight = 0,
  controlsVisible = true,
}) {
  const settings = getBoardSettings(presetName);
  const aspect = getStageRatio(presetName);
  const visibleSections = controlsVisible ? 4 : 3;
  const reservedHeight =
    shellPaddingTop +
    shellPaddingBottom +
    topHeight +
    statusHeight +
    controlsHeight +
    Math.max(0, visibleSections - 1) * shellGap;
  const availableHeight = Math.max(1, viewportHeight - reservedHeight);
  const availableWidth = Math.max(1, stageShellWidth);
  const width = Math.min(settings.stage.width, availableWidth, availableHeight * aspect);

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(width / aspect)),
    aspect,
    maxWidth: settings.stage.width,
  };
}
