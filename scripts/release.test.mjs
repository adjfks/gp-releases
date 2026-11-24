import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRelease } from "../docs/release.js";
const fixture = () => ({
  tag_name: "v0.0.6",
  draft: false,
  prerelease: false,
  assets: [
    ["macos-arm64-GuanPan_0.0.6_aarch64.dmg", 10],
    ["macos-x64-GuanPan_0.0.6_x64.dmg", 11],
    ["windows-x64-GuanPan_0.0.6_x64-setup.exe", 200],
  ].map(([name, size]) => ({
    name,
    size: size * 1024 * 1024,
    browser_download_url: `https://github.com/adjfks/gp-releases/releases/download/v0.0.6/${name}`,
  })),
});
test("正式 Release 匹配三个架构及格式、版本和体积", () => {
  const release = parseRelease(fixture());
  assert.equal(release.version, "v0.0.6");
  assert.equal(Object.keys(release.downloads).length, 3);
  assert.equal(release.downloads.windows.size, "200.0 MB");
  assert.equal(release.downloads["mac-arm"].format, "DMG");
});
test("缺失、重复、空文件保留相应平台备用入口", () => {
  const data = fixture();
  data.assets.pop();
  data.assets.push({ ...data.assets[0] });
  data.assets[1].size = 0;
  assert.deepEqual(parseRelease(data).downloads, {});
});
test("拒绝不可信下载地址，不把外部数据变成任意链接", () => {
  for (const url of [
    "javascript:alert(1)",
    "https://example.com/a.exe",
    "https://github.com/adjfks/gp-releases/releases/download/v0.0.6/../../evil",
    "https://github.com/adjfks/gp-releases/releases/download/v0.0.6/wrong.exe",
  ]) {
    const data = fixture();
    data.assets[2].browser_download_url = url;
    assert.equal(parseRelease(data).downloads.windows, undefined);
  }
});
test("草稿、预发布、错误结构不冒充正式版本", () => {
  for (const data of [
    null,
    {},
    { ...fixture(), draft: true },
    { ...fixture(), prerelease: true },
    { ...fixture(), tag_name: "nightly" },
  ])
    assert.throws(() => parseRelease(data));
});

test("官网功能卡与模块说明逐项一致，更新失败时仍可打开最新发布页", async () => {
  const { readFile } = await import("node:fs/promises");
  const { screens } = await import("../docs/screens.js");
  const html = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
  const cards = [...html.matchAll(/<article class="feature-card" id="page-([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.deepEqual(cards.map(([, id]) => id), Object.keys(screens));
  for (const [, id, markup] of cards) {
    for (const text of Object.values(screens[id])) assert.ok(markup.includes(text), id);
  }
  assert.match(html, /data-download="windows"\s+href="https:\/\/github\.com\/adjfks\/gp-releases\/releases\/latest"/);
});
