# 访客地图

页尾采用 [MapMyVisitors](https://mapmyvisitors.com/) 的交互式世界地图。站点所有者在官方后台为 `https://cozy000000.github.io/` 创建插件，并提供了嵌入代码；当前使用的是本站独立统计，不是参考网站的编号。

- [本站统计页面](https://mapmyvisitors.com/web/1c8ic)
- 配置：`_data/profile.yml` → `visitorMap.scriptUrl` 和 `visitorMap.statsUrl`
- 插件编号：`psXlrltPiDhoSHRqH7qVZdD0RPri7_n9JTaOkzyuadE`
- 脚本使用 HTTPS；保留提供的 `cl=ffffff` 和自适应宽度 `w=a`。页尾最大宽度为 520px，地图随屏幕宽度缩放。

插件编号是公开嵌入参数，不是账号密码。需要更换时，从 [官方创建页面](https://mapmyvisitors.com/add/) 登录并为本站生成 Map Widget，把脚本地址和统计页链接写回配置。

## 展示与统计行为

地图随页面自动加载。脚本放在隔离的 iframe 文档 `public/visitor-map.html` 内，避免第三方 jQuery、样式和 DOM ID 与 React 页面冲突；重试会整体更换该文档。它使用实际 HTML 地址，兼容插件旧版 jQuery 的相对协议请求，并通过 CSP 将请求升级为 HTTPS。点击地图或标题旁的 MapMyVisitors 链接，在新标签页打开本站统计。

仅使用 `map.js` 交互插件，不同时加载提供的 `map.png` 图片计数器，以免产生额外统计请求。切换深浅色模式和调整窗口宽度不会重新加载插件。重新打开页面或手动重试会发起新请求，最终访问量如何去重由 MapMyVisitors 决定。

加载完成以地图数据渲染为准，不把脚本下载完成误判为地图就绪。网络错误或 12 秒超时会显示提示和手动重试；不自动反复请求。迟到的地图数据仍可恢复显示。服务故障只影响地图区域，不影响主页正文。

地图位置由服务根据访问者 IP 推断，代理或 VPN 会影响结果。新编号的历史数据独立保存，没有导入旧 ClustrMaps 或 Flag Counter 记录。

## 本地检查

浏览器自动化测试模拟第三方脚本及延迟数据，覆盖首次加载、失败重试、超时后恢复、旧请求清理、主题切换和手机宽度；不向真实统计服务提交测试浏览量。真实插件的人工接入检查可能计入少量验证访问，不能把这些记录当作自然访客。

2026-09-28 已在本地 Chrome 中验证真实插件：1440px／375px、深浅两种主题均显示世界地图和访问统计，无横向溢出、请求失败或脚本错误。在同一页面切换这些状态时，`map.js` 只请求一次，未请求 `map.png`。截图为忽略提交的 `output/site-review/mapmyvisitors-<width>-<theme>.png`；请求及布局记录见同目录的 `mapmyvisitors-real-check.json`。这次检查验证本地构建，不代表已发布到 GitHub Pages。

把 `visitorMap` 设为 `null` 可以关闭这个模块。

## 历史服务

原 ClustrMaps 脚本在先前检查中无法建立 TLS 连接，直接套用原编号到 MapMyVisitors 也未被接受，随后临时改为 Flag Counter `YywQ`。本次以所有者提供的新 MapMyVisitors 编号替换；运行代码不再请求旧服务。先前的配置仍可从 Git 历史查阅。
