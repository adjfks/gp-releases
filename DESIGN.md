# 观盘官网设计与交互

## 内部简报

- 用户：希望了解观盘、判断是否适合自己的 A 股复盘用户。
- 任务：快速理解产品特色，查看界面，选择匹配电脑的安装包。
- 现状：公开仓库只有 Release 与安装说明，缺少直观介绍。
- 目标：单页完成了解、功能浏览、平台选择和下载安装；无需登录。
- 成功信号：手机/桌面均可完成下载入口导航；免费接口故障不影响介绍与备用下载。
- 对象：公开官网与公开安装包；下载只保存安装器，不自动安装。
- 权限：公众可浏览；本轮授权在 gp-releases 仓库创建并发布 GitHub Pages。
- 非目标：投资建议、收益承诺、网站版交易工具、账户、收集个人复盘、公开桌面源码。
- 无待确认的产品选择。官网使用默认 GitHub Pages 域名；后续可绑定自有域名。

## 产品决策（shape）

1. 首屏一个主行动“下载观盘”，跳转到平台选择区，避免自动猜测 Mac 架构。rule/one-primary-action、rule/navigation-vs-action、rule/control-matches-cardinality。
2. 分区采用大标题、留白和分隔线；三种界面预览采用可见页签，标明示意数据。rule/structure-before-containers、rule/preserve-mental-model。
3. 下载区显示各平台，在线获取 Release 版本与真实附件；加载/异常时保留 GitHub Release 备用入口。rule/cover-reachable-states、rule/error-states-recovery、rule/loading-state-specific。
4. 下载链接写明格式和架构；说明下载不会自动安装，系统签名状态见安装说明。rule/name-object-scope-consequence。
5. 常见问题在页内折叠展开；不弹窗、不收邮箱。rule/inline-before-modal、rule/smallest-intervention。
6. 原生链接、按钮和 details；页签支持方向键/Home/End；焦点可见，减少动态偏好受尊重。rule/keyboard-complete-flow、rule/accessible-name-required、rule/no-custom-focus-bypass。

自检：适用规则 14 项，均已覆盖；无规则 ID 的产品决策 0；规则未覆盖的视觉选择：沿用产品朱红印章、纸白、墨黑与宋体大标题，由 UI 设计负责。简报的任务、目标、后果已明确。

## UI 实现指导

- 纸白 #f7f5f0 / 墨黑 #242622 / 朱红 #a93b32；中文大标题用系统宋体，正文系统黑体，不依赖远程字体。
- 顶部品牌导航 → 宣言与下载 → 可切换工作台示意 → 功能流程 → 本机数据理念 → 下载 → FAQ。
- 桌面内容最大 1180px，手机单列；预览内复杂内容在窄屏精简，完整功能描述保留。
- 动效只用于悬浮与短过渡；内容默认可见，禁用 JavaScript 仍可阅读并进入 Release。
- 免费源覆盖、分钟数据缺失、历史存档、本机迁移不等于云同步均使用真实能力描述。

## 状态范围

加载 / 成功 / 附件缺失 / 网络或限流失败 / 禁用 JavaScript / 窄屏 / 长标题均有设计。
无输入提交、无账户权限、无乐观写入和删除，不引入不相关状态。
