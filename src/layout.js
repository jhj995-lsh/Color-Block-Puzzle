export const BOARD_PRESETS = {
  portrait: {
    name: "portrait",
    label: "竖屏盘面",
    stage: {
      width: 402,
      height: 430,
    },
    board: {
      x: 3,
      y: 40,
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
      width: 874,
      height: 360,
    },
    board: {
      x: 191,
      y: 12,
      cols: 22,
      rows: 15,
      cell: 22.4,
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

export function getViewportProfile(width, height) {
  const portraitMatch =
    height >= width &&
    Math.abs(width - 402) <= 8 &&
    Math.abs(height - 874) <= 20;
  if (portraitMatch) {
    return "iphone17-standard-portrait";
  }

  const landscapeMatch =
    width > height &&
    Math.abs(width - 874) <= 20 &&
    Math.abs(height - 402) <= 8;
  if (landscapeMatch) {
    return "iphone17-standard-landscape";
  }

  return "generic-mobile";
}

export function fitStageFrame({
  presetName,
  viewportWidth,
  viewportHeight,
  safeAreaTop = 0,
  safeAreaBottom = 0,
  chromeMode = "menu",
}) {
  const settings = getBoardSettings(presetName);
  const aspect = getStageRatio(presetName);
  const chromePadding =
    chromeMode === "immersive-portrait"
      ? { horizontal: 6, top: 10, bottom: 10 }
      : chromeMode === "immersive-landscape"
        ? { horizontal: 12, top: 8, bottom: 8 }
        : { horizontal: 16, top: 16, bottom: 16 };
  const availableHeight = Math.max(
    1,
    viewportHeight - safeAreaTop - safeAreaBottom - chromePadding.top - chromePadding.bottom
  );
  const availableWidth = Math.max(1, viewportWidth - chromePadding.horizontal * 2);
  const width = Math.min(settings.stage.width, availableWidth, availableHeight * aspect);

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(width / aspect)),
    aspect,
    maxWidth: settings.stage.width,
  };
}
