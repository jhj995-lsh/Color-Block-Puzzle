import { UI_COPY } from "./config.js";

export function getOverlayView(state, settings) {
  const screen = state.overlayScreen || "play";

  if (!state.overlayScreen) {
    return {
      screen,
      hidden: true,
      markup: "",
    };
  }

  if (state.overlayScreen === "explain") {
    return {
      screen,
      hidden: false,
      markup: `
      <section class="overlay-card overlay-card--explain">
        <p class="overlay-eyebrow">玩法说明</p>
        <h2>十字方向上连到两个以上同色方块就能消除得分</h2>
        <p>手机端保留原规则，只把界面和触控区域重新排布。推荐先从竖屏开始体验。</p>
        <button class="overlay-button overlay-button--primary" data-overlay-action="dismiss-explain">继续</button>
      </section>
    `,
    };
  }

  if (state.overlayScreen === "start") {
    return {
      screen,
      hidden: false,
      markup: `
      <section class="overlay-card overlay-card--start">
        <p class="overlay-eyebrow">${settings.label}</p>
        <h2>${UI_COPY.title}</h2>
        <p>当前开局会使用 <strong>${settings.board.cols}×${settings.board.rows}</strong> 盘面，局时 <strong>${settings.maxTime}</strong> 秒。</p>
        <div class="overlay-actions">
          <button class="overlay-button overlay-button--primary" data-overlay-action="start-game">开始</button>
          <button class="overlay-button" data-overlay-action="open-leaderboard">排行榜</button>
        </div>
      </section>
    `,
    };
  }

  if (state.overlayScreen === "leaderboard") {
    const items = state.leaderboard.length
      ? state.leaderboard
          .map(
            (entry, index) => `
              <li class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}</span>
                <strong>${entry.score}</strong>
                <span>${entry.date || "-"}</span>
              </li>
            `
          )
          .join("")
      : `<li class="leaderboard-empty">暂无成绩，先开一局试试。</li>`;

    return {
      screen,
      hidden: false,
      markup: `
      <section class="overlay-card overlay-card--leaderboard">
        <p class="overlay-eyebrow">本地排行榜</p>
        <h2>TOP 5</h2>
        <ol class="leaderboard-list">${items}</ol>
        <button class="overlay-button" data-overlay-action="close-leaderboard">返回</button>
      </section>
    `,
    };
  }

  return {
    screen,
    hidden: false,
    markup: `
    <section class="overlay-card overlay-card--gameover">
      <p class="overlay-eyebrow">本局结束</p>
      <h2>得分 ${state.score}</h2>
      <p>当前棋盘维持 ${state.boardPreset === "portrait" ? "竖屏" : "横屏"} 档位，新开一局会按当前方向重新选盘。</p>
      <div class="overlay-actions">
        <button class="overlay-button overlay-button--primary" data-overlay-action="restart-game">再来一局</button>
        <button class="overlay-button" data-overlay-action="open-leaderboard">排行榜</button>
      </div>
    </section>
  `,
  };
}

export function shouldReplaceOverlay(previousView, nextView) {
  if (!previousView) {
    return true;
  }

  return (
    previousView.screen !== nextView.screen ||
    previousView.hidden !== nextView.hidden ||
    previousView.markup !== nextView.markup
  );
}
