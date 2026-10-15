# 观盘—你的复利日记

本地优先的 macOS / Windows 复盘桌面应用。本仓库用于官方网站、官方安装包、版本说明与更新清单，不包含桌面应用源码或个人复盘数据。

[下载最新版本](https://github.com/adjfks/gp-releases/releases/latest)

- Apple Silicon Mac：选择 macos-arm64 的 DMG。
- Intel Mac：选择 macos-x64 的 DMG。
- Windows x64：推荐 EXE，MSI 为备用。
- `.app.tar.gz`、`.sig`、`latest.json` 用于应用自动更新，无需手动下载。

从 v0.0.3 起，应用左下角支持检查、下载及安装更新。旧版本需先手动升级一次。

个人复盘和股票缓存保存在本机；升级涉及数据结构变化时先备份。免费行情源可能延迟或不可用，不构成投资建议。

当前安装包未做 Apple Developer 公证和 Windows 代码签名。自动更新另有 Tauri 签名校验。

## 官方网站

[访问观盘官网](https://adjfks.github.io/gp-releases/)

官网位于 `docs/`，以 GitHub Pages 发布 `main` 分支的 `/docs` 目录。纯 HTML / CSS / JavaScript，无需安装构建依赖；提交官网变更后自动部署。

- 逐项介绍 13 个复盘页面，展示从实际应用组件运行画面截取的 13 张截图，使用演示数据，不包含个人记录。
- 提供功能截图切换、放大查看、首屏视差、滚动渐入和阅读进度条；尊重减少动态效果设置，不劫持滚动。
- 页面访问时从 GitHub 公开 Release API 获取正式版本、文件大小和三个平台的安装包地址；发布新版安装包后无需修改官网版本号。
- 查询超时、网络失败、缺少附件或禁用 JavaScript 时保留 Release 下载入口。
- 网站不包含账户、统计追踪或个人复盘上传功能；浏览器仍会向 GitHub 请求网页和公开版本信息。
- `DESIGN.md` 记录视觉方向与交互状态。

本地检查与预览：

```sh
npm run check
npm run preview
```

预览地址为 `http://127.0.0.1:4176/`。新增文件不得包含个人数据库、备份、访问令牌或私有桌面源码。
