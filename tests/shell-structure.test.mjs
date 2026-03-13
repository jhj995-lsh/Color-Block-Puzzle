import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const indexHtml = fs.readFileSync(
  path.resolve("C:\\Users\\56308\\Desktop\\彩色消方块\\index.html"),
  "utf8"
);
const styleCss = fs.readFileSync(
  path.resolve("C:\\Users\\56308\\Desktop\\彩色消方块\\src\\style.css"),
  "utf8"
);

test("menu header keeps portrait controls in a single compact row", () => {
  assert.equal(indexHtml.includes('id="hud-board"'), false);
  assert.equal(indexHtml.includes(">盘面<"), false);
});

test("immersive stage no longer vertically centers the board in the viewport", () => {
  assert.equal(
    styleCss.includes('.app-shell[data-chrome-mode^="immersive"] .stage-shell {\n  min-height: 100dvh;\n  width: 100%;\n  align-items: flex-start;'),
    true
  );
});
