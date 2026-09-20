# 访客地图

主页页尾采用 [Flag Counter](https://flagcounter.com/) 的世界地图，以旗标显示访客的国家／地区。已通过官方免注册流程生成本站独立编号 `YywQ`，未提供邮箱、密码或购买服务。

- [本站统计页面](https://info.flagcounter.com/YywQ)
- 配置：`_data/profile.yml` → `visitorMap.imageUrl` 和 `visitorMap.statsUrl`
- 原始地图尺寸：600 × 291，随页尾宽度缩放；浅色和深色模式共用同一张地图，避免切换主题产生额外请求。

## 原服务故障检查

原 `clustrmaps.com/map_v2.js` 地址在此次检查的网络中无法建立 TLS 连接。替代服务 MapMyVisitors 的旧路径返回 404；其正确的 `map.js` 接口能访问，但原编号 `WLf9b66ilDZRnTA1p3jOxQp-T_d738h0cJKCEfhFM8s` 对应的地图图片显示 `Error: Incorrect map code!`。因此仅替换域名无法恢复原统计。

本次选择可以直接生成独立地图的 Flag Counter 完成接入。新地图从接入时重新统计，没有导入原 ClustrMaps 历史记录。

## 展示与统计行为

地图直接显示在页尾，图片自动加载，不再要求访客先展开折叠项。图片载入即触发服务统计，没有额外注入第三方 JavaScript。点击地图打开本站的统计页面。

网络错误或 12 秒超时会显示提示与手动重试；不自动反复请求。这里显示的是 IP 推断的国家／地区，代理或 VPN 会影响地理位置。初始首条记录来自本次真实接入验证，不能把它当作自然访客数据。

真实接口和本地预览中的 Chrome 浏览器均已返回有效 PNG，并人工检查为世界地图而非错误图片。在同一页面切换 1440px／375px 和深浅色模式时，地图请求总数保持为 1。截图保存在 `output/site-review/visitor-map-<width>-<theme>.png`。其余自动化测试使用模拟响应，不提交额外测试浏览量。

## 免费服务的规则

根据 [Flag Counter FAQ](https://flagcounter.com/faq.html)，免费地图图片的统计展示约有 5 分钟延迟；连续超过 30 天未记录新访客的免费计数器会被清理。需要重建时，从 [官网](https://flagcounter.com/) 选择 Flag Map，跳过可选邮箱注册，将新图片和统计链接写回上述配置即可。不要复制其他网站的编号，否则会合并访问数据。

把 `visitorMap` 设为 `null` 可以关闭这个模块。服务故障只影响地图区域，不影响主页正文。
