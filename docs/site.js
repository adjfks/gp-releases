import { API_URL, parseRelease } from "./release.js";
import { screens } from "./screens.js";
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

// 真实界面截图切换；网络失败保留原图与原始图片链接。
const screen = document.getElementById("feature-screen");
const screenLink = document.getElementById("screen-link");
const cards = [...document.querySelectorAll("[data-screen]")];
let selected = 0;
const imageStatus = document.getElementById("screen-status");
let request = 0;
function selectScreen(card) {
  const id = card.dataset.screen,
    item = screens[id],
    token = ++request;
  imageStatus.textContent = `正在读取${item.name}截图…`;
  document.getElementById("screen-preview").setAttribute("aria-busy", "true");
  const pending = new Image();
  pending.onload = () => {
    if (token !== request) return;
    selected = cards.indexOf(card);
    screen.src = pending.src;
    screen.alt = `${item.name}实际应用界面截图`;
    screenLink.href = pending.src;
    screenLink.dataset.zoom = item.name;
    screenLink.setAttribute("aria-label", `放大查看${item.name}截图`);
    document.querySelector(".screen-count").textContent =
      `${String(selected + 1).padStart(2, "0")} / 13`;
    document.querySelector(".screen-name").textContent = item.name;
    document.getElementById("screen-title").textContent = item.title;
    document.getElementById("screen-copy").textContent = item.description;
    document.querySelector(".screen-tags").textContent = item.tags;
    cards.forEach((c) => c.setAttribute("aria-pressed", String(c === card)));
    imageStatus.textContent = `已显示${item.name}截图`;
    document.getElementById("screen-preview").removeAttribute("aria-busy");
    document
      .getElementById("screen-preview")
      .scrollIntoView({
        behavior: motion.matches ? "instant" : "smooth",
        block: "start",
      });
  };
  pending.onerror = () => {
    if (token !== request) return;
    imageStatus.textContent = `${item.name}截图暂未加载成功，保留当前截图，请再次点击重试。`;
    document.getElementById("screen-preview").removeAttribute("aria-busy");
  };
  pending.src = `./assets/screenshots/${id}.png`;
}
cards.forEach((card) =>
  card.addEventListener("click", () => selectScreen(card)),
);
const dialog = document.getElementById("image-dialog"),
  dialogImage = document.getElementById("dialog-image");
let imageTrigger;
document.querySelectorAll("[data-zoom]").forEach((link) =>
  link.addEventListener("click", (event) => {
    if (!dialog.showModal) return;
    event.preventDefault();
    imageTrigger = link;
    document.getElementById("image-dialog-title").textContent =
      link.dataset.zoom + " · 实际界面";
    dialogImage.src = link.href;
    dialogImage.alt = link.dataset.zoom + "实际界面截图";
    dialog.showModal();
  }),
);
document
  .getElementById("close-image")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => imageTrigger?.focus());
// 渐进增强：不劫持滚轮，不循环播放，不影响无 JS 阅读。
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;
const parallax = document.querySelector("[data-parallax]");
function updateMotion() {
  frame = 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector(".reading-progress").style.transform =
    `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  if (motion.matches) {
    parallax.style.transform = "none";
    return;
  }
  const progress = Math.min(1, Math.max(0, window.scrollY / 800));
  parallax.style.transform = `perspective(1800px) rotateX(${(1 - progress) * 5}deg) translateY(${(1 - progress) * 24}px)`;
}
window.addEventListener(
  "scroll",
  () => {
    if (!frame) frame = requestAnimationFrame(updateMotion);
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  if (!frame) frame = requestAnimationFrame(updateMotion);
});
motion.addEventListener("change", updateMotion);
updateMotion();
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!motion.matches)
            entry.target.animate(
              [
                { opacity: 0.25, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
            );
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll("[data-reveal]")
    .forEach((el) => observer.observe(el));
}
