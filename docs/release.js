export const RELEASES_URL =
  "https://github.com/adjfks/gp-releases/releases/latest";
export const API_URL =
  "https://api.github.com/repos/adjfks/gp-releases/releases/latest";
const specs = {
  "mac-arm": [/^macos-arm64-.*\.dmg$/, "DMG"],
  "mac-intel": [/^macos-x64-.*\.dmg$/, "DMG"],
  windows: [/^windows-x64-.*\.exe$/, "EXE"],
};
export function parseRelease(data) {
  if (
    !data ||
    data.draft ||
    data.prerelease ||
    !/^v\d+\.\d+\.\d+$/.test(data.tag_name) ||
    !Array.isArray(data.assets)
  )
    throw Error("正式版本信息无效");
  const url = `https://github.com/adjfks/gp-releases/releases/tag/${data.tag_name}`;
  const prefix = `https://github.com/adjfks/gp-releases/releases/download/${data.tag_name}/`;
  const downloads = {};
  for (const [key, [pattern, format]] of Object.entries(specs)) {
    const matches = data.assets.filter(
      (a) => typeof a.name === "string" && pattern.test(a.name),
    );
    if (matches.length !== 1) continue;
    const a = matches[0];
    if (
      typeof a.browser_download_url !== "string" ||
      !a.browser_download_url.startsWith(prefix) ||
      !Number.isFinite(a.size) ||
      a.size <= 0
    )
      continue;
    const parsed = new URL(a.browser_download_url);
    if (
      parsed.hostname !== "github.com" ||
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    )
      continue;
    if (
      decodeURIComponent(parsed.pathname) !==
      `/adjfks/gp-releases/releases/download/${data.tag_name}/${a.name}`
    )
      continue;
    downloads[key] = {
      url: a.browser_download_url,
      format,
      size: `${(a.size / 1024 / 1024).toFixed(1)} MB`,
    };
  }
  return { version: data.tag_name, url, downloads };
}
