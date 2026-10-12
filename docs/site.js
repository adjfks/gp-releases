import { API_URL, parseRelease } from "./release.js";
const tabs = [...document.querySelectorAll("[data-tab]")];
const tablist = document.querySelector('[role="tablist"]');
if (tablist) tablist.hidden = false;
function selectTab(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(`panel-${item.dataset.tab}`).hidden = !selected;
  }
  const index = tabs.indexOf(tab);
  document
    .querySelectorAll(".sidebar-item")
    .forEach((el, i) => el.classList.toggle("selected", i === index));
  if (tab.dataset.tab === "timeline") moveCursor();
  if (focus) tab.focus();
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let target;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      target = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      selectTab(tabs[target], true);
    }
  });
}
for (const row of document.querySelectorAll("[data-volumes]")) {
  for (const value of row.dataset.volumes.split(",").map(Number)) {
    const bar = document.createElement("i");
    bar.style.height = `${(value / 44) * 100}%`;
    if (value > 30) bar.className = "peak";
    row.append(bar);
  }
}
const slider = document.querySelector(".demo-slider input");
function moveCursor() {
  const chart = document.querySelector(".timeline-demo");
  const label = chart.querySelector(".timeline-row>strong");
  const width = label.getBoundingClientRect().width;
  chart.querySelector(".shared-cursor").style.left =
    `calc(${width}px + (100% - ${width}px) * ${Number(slider.value) / 100})`;
}
slider?.addEventListener("input", moveCursor);
window.addEventListener("resize", moveCursor);
// 示例图表只在页面内展示；下载元数据仅来自公开 GitHub Release，不接触个人复盘。
const status = document.getElementById("release-status");
async function loadRelease() {
  status.textContent = "正在获取最新版本与安装包信息…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(API_URL, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw Error("版本查询失败");
    const release = parseRelease(await response.json());
    document
      .querySelectorAll("[data-release-link]")
      .forEach((a) => (a.href = release.url));
    const names = {
      "mac-arm": "Mac Apple Silicon",
      "mac-intel": "Mac Intel",
      windows: "Windows x64",
    };
    for (const [key, download] of Object.entries(release.downloads)) {
      const a = document.querySelector(`[data-download="${key}"]`);
      a.href = download.url;
      a.textContent = `下载 ${download.format}  ↓`;
      a.setAttribute(
        "aria-label",
        `下载 ${names[key]} ${release.version} ${download.format} 安装包`,
      );
      document.querySelector(`[data-size="${key}"]`).textContent =
        `${release.version} · ${download.size}${key === "windows" ? " · 含 WebView2 运行环境" : ""}`;
    }
    const complete = Object.keys(release.downloads).length === 3;
    status.textContent = `${release.version} 正式版${complete ? " · 点击下方按钮下载安装包" : " · 部分附件暂不可用，可前往发布页查看"}`;
    status.dataset.error = String(!complete);
  } catch {
    status.textContent =
      "暂时无法读取最新版本，以下入口仍可前往 GitHub 发布页下载。";
    status.dataset.error = "true";
  } finally {
    clearTimeout(timeout);
  }
}
void loadRelease();
