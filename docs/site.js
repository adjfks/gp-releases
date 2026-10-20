import { API_URL, parseRelease } from "./release.js";
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
      if (!a) continue;
      a.href = download.url;
      a.textContent = `下载 ${download.format}  ↓`;
      a.setAttribute(
        "aria-label",
        `下载 ${names[key]} ${release.version} ${download.format} 安装包`,
      );
      document.querySelector(`[data-size="${key}"]`).textContent =
        `${release.version} · ${download.size}${key === "windows" ? " · 含 WebView2 运行环境" : ""}`;
    }
    const complete = Boolean(release.downloads.windows);
    status.textContent = `${release.version} 正式版${complete ? " · Windows 当前版可下载，Mac 暂缓更新" : " · Windows 附件暂不可用，请前往发布页查看"}`;
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
